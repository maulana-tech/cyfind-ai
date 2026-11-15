"use client";

import { Activity, Bug, Compass, FlaskConical, ShieldCheck, Target } from "lucide-react";

/**
 * Stylized product surface shown in the hero: a mock Cyfind task window whose
 * left pane is an exploration graph rendered to match the real app's graph
 * (white rounded node cards with a colored type chip + icon, bezier edges, a
 * dot grid), and a live worker feed on the right. Original artwork — markup +
 * SVG, not a screenshot. The window is a crisp WHITE app surface floating on
 * the blue brand canvas, so its palette is hardcoded light, not the page tokens.
 */

type NodeType = "goal" | "intent" | "fact" | "finding";

const NODE_META: Record<NodeType, { label: string; Icon: typeof Target; bg: string }> = {
  goal: { label: "goal", Icon: Target, bg: "#10b981" },
  intent: { label: "intent", Icon: Compass, bg: "#3b82f6" },
  fact: { label: "fact", Icon: FlaskConical, bg: "#f59e0b" },
  finding: { label: "finding", Icon: Bug, bg: "#f43f5e" },
};

type GNode = { id: string; type: NodeType; title: string; x: number; y: number; live?: boolean };

// anchors are the CARD CENTERS in % of the canvas; cards are translate(-50%,-50%)
const NODES: GNode[] = [
  { id: "goal", type: "goal", title: "Breach admin panel", x: 13, y: 50 },
  { id: "i1", type: "intent", title: "Enumerate subdomains", x: 42, y: 20, live: true },
  { id: "i2", type: "intent", title: "Probe login form", x: 42, y: 80 },
  { id: "f1", type: "fact", title: "14 live hosts", x: 74, y: 20 },
  { id: "find", type: "finding", title: "SQL injection · /api/auth", x: 74, y: 80 },
];

const EDGES: [string, string, boolean?][] = [
  ["goal", "i1", true],
  ["goal", "i2"],
  ["i1", "f1"],
  ["i2", "find"],
  ["f1", "find"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

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

      <div className="grid gap-px bg-[#e6e8ef] sm:grid-cols-[1.6fr_1fr]">
        {/* exploration graph */}
        <div className="relative min-h-[360px] overflow-hidden bg-[#f7f8fb] p-4">
          <GraphCanvas />
        </div>

        {/* side feed */}
        <div className="flex flex-col gap-3 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[11px] text-[#8a92a6] uppercase tracking-wider">Worker feed</span>
            <Activity className="size-3.5 text-[#5b6478]" />
          </div>
          <FeedItem dot="#3b82f6" worker="worker#1" text="subdomain brute → 14 hosts" />
          <FeedItem dot="#8b5cf6" worker="worker#2" text="port scan 10.0.3.0/24" />
          <FeedItem dot="#0e8fb0" worker="worker#3" text="probing login form…" />
          <FeedItem dot="#10b981" worker="planner" text="intent: test SQLi on /api/auth" />

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
    <div
      className="relative h-full min-h-[328px] w-full"
      style={{
        backgroundImage: "radial-gradient(circle, #d4d9e6 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* edges */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {EDGES.map(([a, b, live]) => {
          const s = byId[a];
          const t = byId[b];
          const mx = (s.x + t.x) / 2;
          const d = `M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${t.x} ${t.y}`;
          return (
            <path
              key={`${a}-${b}`}
              d={d}
              fill="none"
              stroke={live ? "#9bb0ec" : "#cdd3e2"}
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={live ? "4 4" : undefined}
            >
              {live ? (
                <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
              ) : null}
            </path>
          );
        })}
      </svg>

      {/* nodes */}
      {NODES.map((n) => (
        <NodeCard key={n.id} node={n} />
      ))}
    </div>
  );
}

function NodeCard({ node }: { node: GNode }) {
  const meta = NODE_META[node.type];
  const { Icon } = meta;
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute w-[150px]"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <div
        className="flex items-center gap-2 rounded-[13px] border bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(23,32,64,0.08)]"
        style={{ borderColor: node.type === "finding" ? "rgba(244,63,94,0.35)" : "rgba(10,15,35,0.08)" }}
      >
        <span
          className="relative flex size-6 shrink-0 items-center justify-center rounded-lg shadow-sm"
          style={{ background: meta.bg }}
        >
          <Icon className="size-3.5 text-white" strokeWidth={2.2} />
          {node.live ? (
            <>
              <span className="-right-0.5 -top-0.5 absolute inline-flex size-2 animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="-right-0.5 -top-0.5 absolute inline-flex size-2 rounded-full bg-blue-500" />
            </>
          ) : null}
        </span>
        <div className="min-w-0">
          <div className="font-semibold text-[8.5px] text-[#8a92a6] uppercase tracking-wider">{meta.label}</div>
          <div className="truncate font-medium text-[11px] text-[#1b2440] leading-tight">{node.title}</div>
        </div>
      </div>
    </div>
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
