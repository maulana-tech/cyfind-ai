"use client";

import * as React from "react";

import {
  CheckCircle2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  InfoIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/i18n";
import { api, sseUrl } from "@/lib/api";
import type { UpdateCheck, UpdateProgress } from "@/lib/types";

/** The maximum time to wait for the new version to come online. One upgrade goes through three process starts (stage → swap → new version),
 *  each on the order of seconds; three minutes is enough to cover slow disks and Docker container rebuilds. */
const RESTART_TIMEOUT_MS = 180_000;

function humanSize(n?: number): string {
  if (!n || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function UpdateCard() {
  const t = useT();
  const [info, setInfo] = React.useState<UpdateCheck | null>(null);
  const [checking, setChecking] = React.useState(true);
  const [progress, setProgress] = React.useState<UpdateProgress | null>(null);
  // Kept separate from progress: once staging is done the process is gone and SSE breaks, so switch to polling /api/health.
  const [restarting, setRestarting] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // quiet also decides whether to bypass the backend cache: the automatic check on page entry uses the cache (the top bar just checked),
  // while a manual "Check for updates" forces a refresh, otherwise a just-released version would only appear after the cache expires.
  const check = React.useCallback(
    (quiet = false) => {
      setChecking(true);
      api
        .checkUpdate(!quiet)
        .then((r) => {
          setInfo(r);
          if (!quiet) {
            if (r.error) toast.error(t("Failed to check for updates: {message}", { message: r.error }));
            else if (r.has_update) toast.success(t("New version {version} found", { version: r.latest }));
            else if (r.comparable) toast.success(t("Already the latest version"));
          }
        })
        .catch((e) => {
          if (!quiet) toast.error(t("Failed to check for updates: {message}", { message: (e as Error).message }));
        })
        .finally(() => setChecking(false));
    },
    [t],
  );

  React.useEffect(() => {
    check(true);
  }, [check]);

  // Poll /api/health until the version number changes.
  //
  // The criterion must be "the version changed" rather than "it is reachable": during the swap the old version briefly comes back up once
  // (that run only puts cyfind.new in place and then exits immediately), so looking only at connectivity would falsely report success.
  const waitForNewVersion = React.useCallback(
    async (fromVersion: string) => {
      setRestarting(true);
      const deadline = Date.now() + RESTART_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await sleep(2000);
        try {
          const r = await fetch("/api/health", { cache: "no-store" });
          if (r.ok) {
            const j = (await r.json()) as { version?: string };
            if (j.version && j.version !== fromVersion) {
              toast.success(t("Updated to {version}, reloading the page", { version: j.version }));
              await sleep(800);
              window.location.reload();
              return;
            }
          }
        } catch {
          // Being unreachable within the restart window is expected; keep polling.
        }
      }
      setRestarting(false);
      toast.error(t("Timed out waiting for the service to restart. Check the backend log, or confirm cyfind was started via start.sh / start.bat."));
    },
    [t],
  );

  // Subscribe to update progress. SSE does not go through Next's /api rewrite (that layer buffers and events cannot be pushed out).
  const openStream = React.useCallback(
    (fromVersion: string) => {
      const es = new EventSource(sseUrl("/api/update/stream"));
      es.onmessage = (ev) => {
        let p: UpdateProgress;
        try {
          p = JSON.parse(ev.data) as UpdateProgress;
        } catch {
          return;
        }
        setProgress(p);
        if (p.phase === "failed") {
          es.close();
          setBusy(false);
          toast.error(t("Update failed: {message}", { message: p.error || p.message }));
          return;
        }
        if (p.phase === "staged") {
          es.close();
          void waitForNewVersion(fromVersion);
        }
      };
      es.onerror = () => {
        // When the process exits, SSE inevitably disconnects. If we have already entered waiting-for-restart, this is normal,
        // so leave it to the /api/health poll to keep judging.
        es.close();
      };
      return es;
    },
    [waitForNewVersion, t],
  );

  const doUpdate = () => {
    if (!info) return;
    const from = info.current;
    const ok = window.confirm(
      `${t("Update to {version}?", { version: info.latest })}\n\n` +
        t("Updating restarts the program; running tasks will be interrupted.\n") +
        (info.mode === "docker"
          ? t("\nNote: an in-container update only replaces the program itself, not the playwright / nmap toolchain in the image; ") +
            t("if the new version needs new tools, use docker compose pull instead.")
          : ""),
    );
    if (!ok) return;

    setBusy(true);
    setProgress({ phase: "downloading", percent: 0, message: "Preparing…" });
    const es = openStream(from);
    api.applyUpdate().catch((e) => {
      es.close();
      setBusy(false);
      setProgress(null);
      toast.error(t("Failed to start the update: {message}", { message: (e as Error).message }));
    });
  };

  const doRollback = () => {
    if (!info) return;
    if (
      !window.confirm(
        t(
          "Roll back to the previous version?\n\nThe program will restart and running tasks will be interrupted.\nNote: the database schema is not rolled back, and the old version may not recognize data written by the new one.",
        ),
      )
    )
      return;
    const from = info.current;
    setBusy(true);
    api
      .rollbackUpdate()
      .then(() => {
        toast.success(t("Switched to the previous version, restarting…"));
        void waitForNewVersion(from);
      })
      .catch((e) => {
        setBusy(false);
        toast.error(t("Rollback failed: {message}", { message: (e as Error).message }));
      });
  };

  const phase = progress?.phase;
  const showProgress = busy || restarting;
  // Only the download phase has a real percentage (computed from Content-Length). Verify/extract/wait-for-restart are all
  // phases of unknown duration, so the progress bar fills and adds a pulse animation to mean "busy but unsure how much longer".
  const downloading = !restarting && phase === "downloading";
  const pct = downloading ? Math.max(progress?.percent ?? 0, 0) : 100;

  return (
    // The settings page is a multi-column masonry layout; cards handle their own row spacing and forbid breaking across columns (see the comment in page.tsx).
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DownloadIcon className="size-4" />
          {t("Version & updates")}
        </CardTitle>
        <CardDescription>{t("Check for and install a new version from GitHub. Updating restarts the program; running tasks will be interrupted.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("Current version")}</span>
          <Badge variant="secondary" className="font-mono">
            {info?.current ?? "…"}
          </Badge>
          {info && (
            <>
              <Badge variant="outline" className="font-mono">
                {info.os}/{info.arch}
              </Badge>
              <Badge variant="outline">{info.mode === "docker" ? "Docker" : t("Standalone")}</Badge>
            </>
          )}
          {info?.latest && (
            <>
              <span className="text-muted-foreground">{t("Latest version")}</span>
              <Badge variant={info.has_update ? "default" : "secondary"} className="font-mono">
                {info.latest}
              </Badge>
            </>
          )}
          {info?.html_url && (
            <a
              href={info.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground text-xs underline-offset-4 hover:underline"
            >
              {t("Release notes")} <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </div>

        {info?.boot_notice && (
          <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-amber-700 text-xs dark:text-amber-400">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            {t(info.boot_notice)}
          </p>
        )}

        {info?.error && (
          <p className="text-muted-foreground flex items-start gap-2 rounded-md border p-2 text-xs">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {info.error}
              {"　"}
              {t("Configure the global proxy above and try again.")}
            </span>
          </p>
        )}

        {info && !info.comparable && info.reason && <p className="text-muted-foreground text-xs">{t(info.reason)}</p>}

        {info?.has_update && info.asset_available === false && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive text-xs">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            {t("{latest} does not provide a release package for {os}/{arch} (missing {asset}), so automatic update is not possible.", {
              latest: info.latest,
              os: info.os,
              arch: info.arch,
              asset: info.asset,
            })}
          </p>
        )}

        {info?.has_update && info.asset_available !== false && (
          <p className="text-muted-foreground text-xs">
            {t("Will download ")}
            <span className="font-mono">{info.asset}</span>
            {info.size ? t("（{size}）", { size: humanSize(info.size) }) : ""}
            {t(", and it is replaced only after SHA256 verification and a smoke test; on failure the current version is kept automatically.")}
          </p>
        )}

        {info && !info.has_update && info.comparable && !info.error && (
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <CheckCircle2Icon className="size-3.5 text-emerald-600" />
            {t("Already on the latest version.")}
          </p>
        )}

        {info?.mode === "docker" && info.has_update && (
          <p className="text-muted-foreground text-xs">
            {t("An update under Docker only replaces the program itself, not the playwright / nmap toolchain in the image, and")}
            <span className="font-mono"> docker compose up -d </span>
            {t("after rebuilding the container it reverts to the image-bundled version. To upgrade the image too, run")}
            <span className="font-mono"> docker compose pull cyfind &amp;&amp; docker compose up -d cyfind</span>
            {t("。")}
          </p>
        )}

        {showProgress && (
          <div className="space-y-1.5">
            <Progress value={pct} className={downloading ? undefined : "animate-pulse"} />
            <p className="text-muted-foreground text-xs">
              {restarting ? t("Restarting and applying the new version, please wait (the page will refresh automatically)…") : t(progress?.message ?? "")}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => check(false)} disabled={checking || busy || restarting}>
            <RefreshCwIcon className={checking ? "size-4 animate-spin" : "size-4"} />
            {t("Check for updates")}
          </Button>
          <Button
            size="sm"
            onClick={doUpdate}
            disabled={busy || restarting || !info?.has_update || info?.asset_available === false}
          >
            <DownloadIcon className="size-4" />
            {info?.has_update ? t("Update to {version}", { version: info.latest }) : t("Update now")}
          </Button>
          {info?.has_backup && (
            <Button variant="ghost" size="sm" onClick={doRollback} disabled={busy || restarting}>
              <RotateCcwIcon className="size-4" />
              {t("Roll back to the previous version")}
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          {t("One-click update relies on the watchdog script to restart the program. Please use ")}
          <span className="font-mono">start.sh</span>
          {t(" (on Windows: ")}
          <span className="font-mono"> start.bat</span>
          {t(") to start CYFIND; when running the cyfind binary directly, it is not relaunched automatically after it exits.")}
        </p>
      </CardContent>
    </Card>
  );
}
