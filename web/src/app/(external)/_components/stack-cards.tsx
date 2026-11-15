"use client";

import type { ReactNode } from "react";

import { GitBranch, Lock, Network, Terminal } from "lucide-react";

/**
 * Stacked cards — a short deck of "why" cards that pin and pile up as you scroll
 * (each card sticks a little lower than the last). Pure CSS position:sticky, no
 * scroll listeners. Degrades to a plain stack where sticky isn't supported.
 */

type Card = { n: string; icon: ReactNode; title: string; desc: string };

const CARDS: Card[] = [
  {
    n: "01",
    icon: <GitBranch className="size-5" />,
    title: "Dual-graph intelligence",
    desc: "An asset graph and an exploration graph, joined by anchors — per-asset coverage tracking no scanner has.",
  },
  {
    n: "02",
    icon: <Network className="size-5" />,
    title: "True multi-agent collaboration",
    desc: "Workers share execution traces live, so a finding from one worker immediately reaches the others.",
  },
  {
    n: "03",
    icon: <Lock className="size-5" />,
    title: "Safety by design",
    desc: "Every tool call passes an approval gate first. Built and licensed for isolated lab targets — never real systems.",
  },
  {
    n: "04",
    icon: <Terminal className="size-5" />,
    title: "Self-hosted & extensible",
    desc: "One Go binary, your keys and your infrastructure. Drop in skill packs for specialized testing surfaces.",
  },
];

export function StackCards() {
  return (
    <div className="relative mx-auto max-w-[860px]">
      {CARDS.map((c, i) => (
        <div key={c.n} className="sticky mb-5" style={{ top: `${112 + i * 20}px`, zIndex: i + 1 }}>
          <div className="cf-solid relative overflow-hidden rounded-[20px] border border-[var(--cf-border)] bg-[var(--cf-card)] p-8 shadow-[var(--cf-shadow-lg)] sm:p-10">
            <div
              className="pointer-events-none absolute top-5 right-7 font-light text-[88px] text-[var(--cf-accent)]/[0.08] leading-none tracking-tight"
              aria-hidden="true"
            >
              {c.n}
            </div>
            <span className="inline-flex size-11 items-center justify-center rounded-[12px] border border-[var(--cf-border)] bg-[var(--cf-accent-soft)] text-[var(--cf-accent)]">
              {c.icon}
            </span>
            <h3 className="mt-6 max-w-[520px] font-medium text-[28px] text-[var(--cf-text)] leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
              {c.title}
            </h3>
            <p className="mt-3 max-w-[560px] text-[16px] text-[var(--cf-muted)] leading-[1.6]">{c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
