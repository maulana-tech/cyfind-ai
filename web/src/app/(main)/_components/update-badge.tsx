"use client";

import * as React from "react";

import Link from "next/link";

import { ArrowUpCircleIcon } from "lucide-react";

import { useT } from "@/i18n";
import { api } from "@/lib/api";

/**
 * The top bar's "new version available" hint: checked once on full page load, and if there is an update it lights up next to the version number,
 * clicking it jumps straight to the "Version and updates" card on the system settings page.
 *
 * The backend caches the GitHub query result for 30 minutes, so checking once on every mount here is safe
 * — the unauthenticated GitHub API allows only 60 requests/hour/IP, and without that cache layer, opening several tabs
 * would exhaust the quota, so that a real update check would then fail.
 *
 * Query failures are always silent: the top bar is not the place for errors; users will see the reason when they click "Check for updates" on the settings page.
 */
export function UpdateBadge() {
  const t = useT();
  const [latest, setLatest] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    api
      .checkUpdate()
      .then((r) => {
        // has_update already includes the "version is comparable" check, so dev builds will not light this hint.
        if (alive && r.has_update && r.latest) setLatest(r.latest.replace(/^v(?=\d)/, ""));
      })
      .catch(() => {
        // Silent: neither no network nor GitHub rate-limiting should pop an error in the top bar.
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!latest) return null;

  return (
    <Link
      href="/system/settings"
      title={t("发现新版本 {latest}，点击前往更新", { latest })}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-medium text-primary-foreground text-xs transition-opacity hover:opacity-90"
    >
      {/* Breathing dot: the top bar has many elements and plain text is easy to miss; the animation makes it visible at a glance. */}
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-primary-foreground" />
      </span>
      <ArrowUpCircleIcon className="size-3.5" />
      <span className="hidden sm:inline">
        {t("新版本")} {latest}
      </span>
      <span className="sm:hidden">{t("新版本")}</span>
    </Link>
  );
}
