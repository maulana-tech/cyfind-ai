"use client";

import * as React from "react";

import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Small "engine live" indicator in the sidebar: polls the task list and shows
 * whether the autonomous engine is currently exploring (any running task) with
 * a pulsing status dot. Collapses to just the dot on the icon rail.
 */
export function EngineIndicator() {
  const t = useT();
  const [running, setRunning] = React.useState<number | null>(null);

  React.useEffect(() => {
    let live = true;
    const poll = async () => {
      try {
        const r = await api.tasks();
        if (live) setRunning(r.tasks.filter((x) => x.status === "running").length);
      } catch {
        /* keep last known state */
      }
    };
    void poll();
    const id = setInterval(() => void poll(), 8000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  if (running === null) return null;
  const active = running > 0;

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs group-data-[collapsible=icon]:justify-center">
      <span className="relative flex size-2 shrink-0 items-center justify-center">
        {active ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            active ? "bg-emerald-400" : "bg-sidebar-foreground/30",
          )}
        />
      </span>
      <span className="truncate text-sidebar-foreground/80 tabular-nums group-data-[collapsible=icon]:hidden">
        {active ? `${t("Engine running")} · ${running}` : t("Engine idle")}
      </span>
    </div>
  );
}
