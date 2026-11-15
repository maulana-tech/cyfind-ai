"use client";

import * as React from "react";

/**
 * Interactive "how it works" — the step list scrolls on the left while a single
 * product window on the right stays pinned and swaps to the step currently in
 * view. On phones each step shows its own window inline. Pure IntersectionObserver.
 */

type Step = {
  n: string;
  label: string;
  desc: string;
  visual: React.ReactNode;
};

function WindowChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--cf-border)] bg-[var(--cf-card)] shadow-[var(--cf-shadow-lg)] backdrop-blur-sm">
      <div className="flex items-center gap-2 border-[var(--cf-border)] border-b bg-[var(--cf-surface)] px-4 py-3">
        <span className="size-[10px] rounded-full bg-[var(--cf-border-strong)]" />
        <span className="size-[10px] rounded-full bg-[var(--cf-border-strong)]" />
        <span className="size-[10px] rounded-full bg-[var(--cf-border-strong)]" />
        <span className="ml-3 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-muted)]">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2.5">
      <span className="rounded-[6px] bg-[var(--cf-border)] px-2 py-0.5 text-[11px] text-[var(--cf-body)]">{k}</span>
      <span
        className="font-[family-name:var(--font-geist-mono)] text-[12.5px]"
        style={{ color: tone ?? "var(--cf-body)" }}
      >
        {v}
      </span>
    </div>
  );
}

const STEPS: Step[] = [
  {
    n: "01",
    label: "Scope",
    desc: "Point CYFIND at an isolated lab target and set the goals. Scope and constraints become the agents' boundaries.",
    visual: (
      <WindowChrome title="task · new">
        <div className="space-y-2">
          <Row k="target" v="acme-corp.com" />
          <Row k="goal" v="breach admin panel" />
          <Row k="constraint" v="no brute-force" />
          <Row k="lab" v="isolated · authorized" tone="#1f9d57" />
        </div>
      </WindowChrome>
    ),
  },
  {
    n: "02",
    label: "Plan",
    desc: "The planner reads the live graph, judges progress against the goal, and emits prioritized intents into the frontier.",
    visual: (
      <WindowChrome title="planner · round 3">
        <div className="space-y-2">
          <Row k="intent" v="enumerate subdomains · p9" tone="#4f5bd5" />
          <Row k="intent" v="test /api/auth for SQLi · p8" tone="#4f5bd5" />
          <Row k="intent" v="probe login form · p6" tone="#4f5bd5" />
          <div className="pt-1 text-[12px] text-[var(--cf-faint)]">3 intents → frontier</div>
        </div>
      </WindowChrome>
    ),
  },
  {
    n: "03",
    label: "Execute",
    desc: "Workers claim intents and run real tools through the recording proxy, writing assets, facts and findings back as they go.",
    visual: (
      <WindowChrome title="workers · running">
        <div className="space-y-2.5">
          {[
            ["worker#1", "curl … /api/auth?id=1' OR '1'", "#4f5bd5"],
            ["worker#2", "nmap 10.0.3.0/24", "#7c5cf0"],
            ["worker#3", "ffuf -w wordlist …", "#0e8fb0"],
          ].map(([w, cmd, c]) => (
            <div
              key={w}
              className="flex items-start gap-2.5 rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2"
            >
              <span className="mt-1.5 size-1.5 shrink-0 animate-pulse rounded-full" style={{ background: c }} />
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--cf-faint)]">{w}</div>
                <div className="truncate font-[family-name:var(--font-geist-mono)] text-[12px] text-[var(--cf-body)]">
                  {cmd}
                </div>
              </div>
            </div>
          ))}
        </div>
      </WindowChrome>
    ),
  },
  {
    n: "04",
    label: "Report",
    desc: "Confirmed findings land with reproducible PoCs and a coverage map — every result traceable to its asset.",
    visual: (
      <WindowChrome title="findings · 1 confirmed">
        <div className="space-y-3">
          <div className="rounded-[10px] border border-[#f4a6b8]/30 bg-[#f4567b]/[0.12] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[13px] text-[var(--cf-text)]">SQL injection · /api/auth</span>
              <span className="rounded-[5px] bg-[#f4567b] px-2 py-0.5 text-[10px] text-white">critical</span>
            </div>
            <div className="mt-1 text-[11.5px] text-[var(--cf-muted)]">
              error-based · PoC attached · anchored to endpoint
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-[var(--cf-muted)]">Coverage</span>
              <span className="font-medium text-[var(--cf-text)]">82%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cf-border)]">
              <div className="h-full w-[82%] rounded-full bg-[var(--cf-accent)]" />
            </div>
          </div>
        </div>
      </WindowChrome>
    ),
  },
];

export function FlowStepper() {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr]">
      {/* steps */}
      <div>
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            data-idx={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="flex min-h-[56vh] flex-col justify-center py-6"
          >
            <div className="flex gap-5 transition-opacity duration-300" style={{ opacity: active === i ? 1 : 0.4 }}>
              <div className="flex flex-col items-center">
                <span
                  className="inline-flex size-10 items-center justify-center rounded-[10px] font-[family-name:var(--font-geist-mono)] text-[15px] transition-colors"
                  style={{
                    background: active === i ? "var(--cf-accent)" : "var(--cf-accent-soft)",
                    color: active === i ? "var(--cf-on-accent)" : "var(--cf-muted)",
                  }}
                >
                  {s.n}
                </span>
                {i < STEPS.length - 1 ? <span className="mt-2 w-px flex-1 bg-[var(--cf-border)]" /> : null}
              </div>
              <div className="pb-2">
                <h3 className="font-medium text-[26px] text-[var(--cf-text)] tracking-[-0.02em]">{s.label}</h3>
                <p className="mt-2 max-w-[460px] text-[15.5px] text-[var(--cf-muted)] leading-[1.6]">{s.desc}</p>
                {/* inline visual on mobile */}
                <div className="mt-6 lg:hidden">{s.visual}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* pinned window */}
      <div className="hidden lg:block">
        <div className="sticky top-28 flex h-[70vh] items-center">
          <div className="w-full">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="transition-all duration-500"
                style={{
                  display: active === i ? "block" : "none",
                }}
              >
                {s.visual}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
