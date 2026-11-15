"use client";

import { usePathname } from "next/navigation";

import { useT } from "@/i18n";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

// Flatten the nav tree into leaf { title, url } pairs once, so the header can
// resolve the current route to a readable page name.
const LEAVES: { title: string; url: string }[] = (() => {
  const out: { title: string; url: string }[] = [];
  for (const group of sidebarItems) {
    for (const item of group.items) {
      if ("url" in item && item.url) out.push({ title: item.title, url: item.url });
      if ("subItems" in item && item.subItems) {
        for (const sub of item.subItems) out.push({ title: sub.title, url: sub.url });
      }
    }
  }
  return out;
})();

export function HeaderBreadcrumb() {
  const t = useT();
  const raw = usePathname();
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    /* use raw */
  }

  // Longest matching nav url wins (so /system/intercept/approvals beats /system/intercept).
  let best: { title: string; url: string } | null = null;
  for (const leaf of LEAVES) {
    if (path === leaf.url || path.startsWith(`${leaf.url}/`)) {
      if (!best || leaf.url.length > best.url.length) best = leaf;
    }
  }
  if (!best) return null;

  const isDetail = path !== best.url && path.startsWith(`${best.url}/`);

  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
      <span className={isDetail ? "text-muted-foreground" : "font-medium"}>{t(best.title)}</span>
      {isDetail ? (
        <>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium">{t("Details")}</span>
        </>
      ) : null}
    </nav>
  );
}
