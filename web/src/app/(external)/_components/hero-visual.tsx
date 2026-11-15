"use client";

import { Activity, ShieldCheck, Target } from "lucide-react";

/**
 * Stylized product surface shown in the hero: a mock CYFIND task window with an
 * exploration graph, a live worker feed and a coverage meter. Intentionally a
 * crisp WHITE app window (the app's light content area) floating on the blue
 * brand canvas — so its palette is hardcoded light, not the page's blue tokens.
 * Original artwork — SVG + markup, not a screenshot.
 */
export function HeroVisual() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--cf-border)] bg-white shadow-[var(--cf-shadow-lg)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-[#e6e8ef] border-b bg-[#f7f8fb] px-4 py-3">
        <span className="size-[11px] rounded-full bg-[#d7dbe6]" />
        <span className="size-[11px] rounded-full bg-[#d7dbe6]" />
        <span className="size-[11px] rounded-full bg-[#d7dbe6]" />
        <div className="ml-3 flex items-center gap-2 rounded-[8px] border border-[#e6e8ef] bg-white px-2.5 py-1 text-[11px] text-[#5b6478]">
          <Target className="size-3 text-[#2f49c0]" />
          <span className="font-[family-name:var(--font-geist-mono)]">task/acme-corp · perimeter</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-[6px] bg-[#1f9d57]/12 px-2 py-1 text-[10.5px] text-[#1f9d57]">
          <span className="size-1.5 rounded-full bg-[#1f9d57]" />
          running
        </span>
      </div>

      <div className="grid gap-px bg-[#e6e8ef] sm:grid-cols-[1.55fr_1fr]">
        {/* graph canvas */}
        <div className="relative min-h-[300px] bg-[#f7f8fb] p-4">
          <GraphCanvas />
        </div>

        {/* side feed */}
        <div className="flex flex-col gap-3 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[11px] text-[#8a92a6] uppercase tracking-wider">Worker feed</span>
            <Activity className="size-3.5 text-[#5b6478]" />
          </div>
          <FeedItem dot="#4f5bd5" worker="worker#1" text="subdomain brute → 14 hosts" />
          <FeedItem dot="#7c5cf0" worker="worker#2" text="port scan 10.0.3.0/24" />
          <FeedItem dot="#0e8fb0" worker="worker#3" text="probing login form…" />
          <FeedItem dot="#1f9d57" worker="planner" text="intent: test SQLi on /api/auth" />

          <div className="mt-1 rounded-[10px] border border-[#e6e8ef] bg-[#f7f8fb] p-3">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-[#5b6478]">Coverage</span>
              <span className="font-medium text-[#1b2440]">68%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e6e8ef]">
              <div className="h-full w-[68%] rounded-full bg-[#2f49c0]" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="Assets" value="143" />
              <Stat label="Findings" value="7" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] border border-[#e6e8ef] bg-white px-3 py-2.5">
            <ShieldCheck className="size-4 shrink-0 text-[#2f49c0]" />
            <span className="text-[11.5px] text-[#5b6478] leading-tight">Tool call held for approval</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphCanvas() {
  return (
    <svg viewBox="0 0 440 300" className="relative h-full w-full" aria-hidden="true">
      {/* edges — soft hairline */}
      {[
        "M90,150 L200,70",
        "M90,150 L200,150",
        "M90,150 L200,230",
        "M200,70 L330,50",
        "M200,150 L330,120",
        "M200,150 L330,190",
        "M200,230 L330,250",
      ].map((d) => (
        <path key={d} d={d} stroke="#c9cedd" strokeWidth="1.2" fill="none" />
      ))}
      <GraphNode x={90} y={150} label="goal" fill="#2f49c0" r={11} />
      <GraphNode x={200} y={70} label="intent" fill="#4f5bd5" r={9} />
      <GraphNode x={200} y={150} label="fact" fill="#7c5cf0" r={9} />
      <GraphNode x={200} y={230} label="intent" fill="#4f5bd5" r={9} />
      <GraphNode x={330} y={50} label="asset" fill="#aab2c6" r={6} />
      <GraphNode x={330} y={120} label="finding" fill="#d6456b" r={9} />
      <GraphNode x={330} y={190} label="asset" fill="#aab2c6" r={6} />
      <GraphNode x={330} y={250} label="asset" fill="#aab2c6" r={6} />
    </svg>
  );
}

function GraphNode({ x, y, label, fill, r }: { x: number; y: number; label: string; fill: string; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke="#ffffff" strokeWidth="2.5" />
      <text x={x} y={y - r - 6} textAnchor="middle" fontSize="9" fill="#8a92a6" fontWeight="500">
        {label}
      </text>
    </g>
  );
}

function FeedItem({ dot, worker, text }: { dot: string; worker: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[8px] border border-[#e6e8ef] bg-[#f7f8fb] px-2.5 py-2">
      <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      <div className="min-w-0 leading-tight">
        <div className="font-medium text-[10px] text-[#8a92a6]">{worker}</div>
        <div className="truncate text-[11.5px] text-[#3a4458]">{text}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-[#e6e8ef] bg-white px-2.5 py-2">
      <div className="font-medium text-[16px] text-[#1b2440]">{value}</div>
      <div className="text-[10px] text-[#8a92a6]">{label}</div>
    </div>
  );
}
