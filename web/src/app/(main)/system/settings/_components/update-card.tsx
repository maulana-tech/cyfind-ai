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
            if (r.error) toast.error(t("检查更新失败：{message}", { message: r.error }));
            else if (r.has_update) toast.success(t("发现新版本 {version}", { version: r.latest }));
            else if (r.comparable) toast.success(t("当前已是最新版本"));
          }
        })
        .catch((e) => {
          if (!quiet) toast.error(t("检查更新失败：{message}", { message: (e as Error).message }));
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
              toast.success(t("已更新到 {version}，正在重新加载页面", { version: j.version }));
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
      toast.error(t("等待服务重启超时。请检查后端日志，或确认 cyfind 是通过 start.sh / start.bat 启动的。"));
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
          toast.error(t("更新失败：{message}", { message: p.error || p.message }));
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
      `${t("确定更新到 {version}？", { version: info.latest })}\n\n` +
        t("更新会重启程序，正在运行的任务会被中断。\n") +
        (info.mode === "docker"
          ? t("\n注意：容器内更新只替换程序本身，不会更新镜像里的 playwright / nmap 等工具链；") +
            t("若新版本依赖新工具，请改用 docker compose pull。")
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
      toast.error(t("启动更新失败：{message}", { message: (e as Error).message }));
    });
  };

  const doRollback = () => {
    if (!info) return;
    if (
      !window.confirm(
        t(
          "回滚到上一版本？\n\n程序会重启，正在运行的任务会被中断。\n注意：数据库结构不会回退，旧版本可能无法识别新版写入的数据。",
        ),
      )
    )
      return;
    const from = info.current;
    setBusy(true);
    api
      .rollbackUpdate()
      .then(() => {
        toast.success(t("已切换到上一版本，正在重启…"));
        void waitForNewVersion(from);
      })
      .catch((e) => {
        setBusy(false);
        toast.error(t("回滚失败：{message}", { message: (e as Error).message }));
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
          {t("版本与更新")}
        </CardTitle>
        <CardDescription>{t("从 GitHub 检查并安装新版本。更新会重启程序，正在运行的任务会被中断。")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("当前版本")}</span>
          <Badge variant="secondary" className="font-mono">
            {info?.current ?? "…"}
          </Badge>
          {info && (
            <>
              <Badge variant="outline" className="font-mono">
                {info.os}/{info.arch}
              </Badge>
              <Badge variant="outline">{info.mode === "docker" ? "Docker" : t("独立程序")}</Badge>
            </>
          )}
          {info?.latest && (
            <>
              <span className="text-muted-foreground">{t("最新版本")}</span>
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
              {t("更新日志")} <ExternalLinkIcon className="size-3" />
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
              {t("可在上方配置全局代理后重试。")}
            </span>
          </p>
        )}

        {info && !info.comparable && info.reason && <p className="text-muted-foreground text-xs">{t(info.reason)}</p>}

        {info?.has_update && info.asset_available === false && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive text-xs">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            {t("{latest} 没有提供 {os}/{arch} 的发布包（缺少 {asset}），无法自动更新。", {
              latest: info.latest,
              os: info.os,
              arch: info.arch,
              asset: info.asset,
            })}
          </p>
        )}

        {info?.has_update && info.asset_available !== false && (
          <p className="text-muted-foreground text-xs">
            {t("将下载 ")}
            <span className="font-mono">{info.asset}</span>
            {info.size ? t("（{size}）", { size: humanSize(info.size) }) : ""}
            {t("，校验 SHA256 并冒烟测试后才会替换，失败自动保留当前版本。")}
          </p>
        )}

        {info && !info.has_update && info.comparable && !info.error && (
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <CheckCircle2Icon className="size-3.5 text-emerald-600" />
            {t("当前已是最新版本。")}
          </p>
        )}

        {info?.mode === "docker" && info.has_update && (
          <p className="text-muted-foreground text-xs">
            {t("Docker 下的更新只替换程序本身，不更新镜像里的 playwright / nmap 等工具链，且")}
            <span className="font-mono"> docker compose up -d </span>
            {t("重建容器后会退回镜像自带的版本。需要连镜像一起升级请执行")}
            <span className="font-mono"> docker compose pull cyfind &amp;&amp; docker compose up -d cyfind</span>
            {t("。")}
          </p>
        )}

        {showProgress && (
          <div className="space-y-1.5">
            <Progress value={pct} className={downloading ? undefined : "animate-pulse"} />
            <p className="text-muted-foreground text-xs">
              {restarting ? t("正在重启并应用新版本，请稍候（页面会自动刷新）…") : t(progress?.message ?? "")}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => check(false)} disabled={checking || busy || restarting}>
            <RefreshCwIcon className={checking ? "size-4 animate-spin" : "size-4"} />
            {t("检查更新")}
          </Button>
          <Button
            size="sm"
            onClick={doUpdate}
            disabled={busy || restarting || !info?.has_update || info?.asset_available === false}
          >
            <DownloadIcon className="size-4" />
            {info?.has_update ? t("更新到 {version}", { version: info.latest }) : t("立即更新")}
          </Button>
          {info?.has_backup && (
            <Button variant="ghost" size="sm" onClick={doRollback} disabled={busy || restarting}>
              <RotateCcwIcon className="size-4" />
              {t("回滚到上一版本")}
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          {t("一键更新依赖守护脚本重启程序。请通过 ")}
          <span className="font-mono">start.sh</span>
          {t("（Windows 为")}
          <span className="font-mono"> start.bat</span>
          {t("）启动 CYFIND；直接运行 cyfind 本体时，程序退出后不会被自动拉起。")}
        </p>
      </CardContent>
    </Card>
  );
}
