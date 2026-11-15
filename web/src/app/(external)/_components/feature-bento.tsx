"use client";

import { Fragment } from "react";

import { useInView } from "./motion";

/**
 * Feature bento — a grid of cards, each carrying a small working illustration of
 * the product (exploration waterfall, worker steering, findings stack, token
 * cost, run command, keyboard, traffic redaction). Adapted to CYFIND's blue
 * brand; animations are CSS-only, triggered when the grid scrolls into view.
 */

const ACCENT = "#3b5ad9";
const ACCENT_SOFT = "rgba(59,90,217,0.12)";
const BAR = "rgba(23,32,64,0.14)";
const easeBar = "cubic-bezier(0.22,1,0.36,1)";

const card =
  "cf-solid group/card relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--cf-border)] bg-[var(--cf-card)] shadow-[var(--cf-shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-[var(--cf-border-strong)] hover:shadow-[var(--cf-shadow-lg)]";
const panel = "rounded-[14px] border border-[var(--cf-border)] bg-[var(--cf-surface)]";

/* ---------------------------------------------------------------- visuals */

type Span = { label: string; start: number; duration: number; slow?: boolean };

function Waterfall({ shown }: { shown: boolean }) {
  const total = 8;
  const spans: Span[] = [
    { label: "read_scope", start: 0, duration: 0.5 },
    { label: "subdomain_enum", start: 0.5, duration: 1.4 },
    { label: "port_scan", start: 1.9, duration: 1.1 },
    { label: "test_sqli", start: 3.0, duration: 3.8, slow: true },
    { label: "record_fact", start: 6.8, duration: 0.5 },
    { label: "prove_goal", start: 7.3, duration: 0.5 },
  ];
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className={`w-full max-w-[640px] self-stretch ${panel} p-4`}>
      <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-x-3">
        <span />
        <div className="relative mb-2 h-4 font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--cf-faint)]">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute top-0 -translate-x-1/2 tabular-nums first:translate-x-0 last:-translate-x-full"
              style={{ left: `${tick * 100}%` }}
            >
              {(tick * total).toFixed(0)}s
            </span>
          ))}
        </div>
        {spans.map((span, i) => (
          <Fragment key={span.label}>
            <span
              className="truncate py-[5px] font-[family-name:var(--font-geist-mono)] text-[10.5px] leading-4"
              style={{ color: span.slow ? "var(--cf-text)" : "var(--cf-muted)" }}
            >
              {span.label}
            </span>
            <div className="relative py-[5px]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "linear-gradient(to right, rgba(23,32,64,0.08) 1px, transparent 1px)",
                  backgroundSize: "25% 100%",
                }}
              />
              <div
                className="relative h-4"
                style={{
                  marginLeft: `${(span.start / total) * 100}%`,
                  width: `${(span.duration / total) * 100}%`,
                }}
              >
                <div
                  className="h-full origin-left rounded-[4px]"
                  style={{
                    background: span.slow ? ACCENT : BAR,
                    boxShadow: span.slow ? `0 0 0 3px ${ACCENT_SOFT}` : undefined,
                    transform: `scaleX(${shown ? 1 : 0})`,
                    transition: `transform 0.7s ${easeBar} ${0.1 + i * 0.08}s`,
                  }}
                />
                {span.slow ? (
                  <span
                    className="absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap rounded-full px-1.5 py-px font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums"
                    style={{ background: ACCENT_SOFT, color: ACCENT }}
                  >
                    {span.duration}s
                  </span>
                ) : null}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Alerts() {
  const alerts = [
    { title: "SQL injection confirmed · /api/auth", meta: "worker#2 · just now" },
    { title: "IDOR on /api/order/{id}", meta: "worker#1 · 2m ago" },
    { title: "Weak JWT secret recovered", meta: "worker#3 · 6m ago" },
  ];
  return (
    <div className="relative h-[104px] w-full max-w-[300px]">
      {alerts.map((a, depth) => (
        <div
          key={a.title}
          className="absolute inset-x-0 top-0 rounded-[14px] border border-[var(--cf-border)] bg-[var(--cf-card)] p-3 shadow-[var(--cf-shadow)] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [transform:translateY(calc(var(--d)*14px))_scale(calc(1-var(--d)*0.06))] group-hover/card:[transform:translateY(calc(var(--d)*40px))_scale(calc(1-var(--d)*0.03))]"
          style={{
            zIndex: alerts.length - depth,
            opacity: 1 - depth * 0.2,
            ["--d" as string]: depth,
          }}
        >
          <div
            className={`flex items-start gap-2.5 ${depth > 0 ? "opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" : ""}`}
          >
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{ background: depth === 0 ? "#f4567b" : "rgba(23,32,64,0.22)" }}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-[12.5px] text-[var(--cf-text)]">{a.title}</span>
              <span className="block truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-faint)]">
                {a.meta}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Cost({ shown }: { shown: boolean }) {
  const bars = [3, 5, 8, 12, 15, 13, 9, 6, 4, 3, 2, 5];
  const highlight = 4;
  const max = Math.max(...bars);
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-4">
      <div>
        <p className="font-light text-[40px] text-[var(--cf-text)] leading-none tracking-[-0.04em] tabular-nums">
          430K
        </p>
        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-faint)]">
          median tokens / planner round
        </p>
      </div>
      <div className="flex h-14 items-end gap-[3px]">
        {bars.map((bar, i) => (
          <span
            key={`${bar}-${i}`}
            className="flex-1 origin-bottom rounded-t-[3px]"
            style={{
              height: `${(bar / max) * 100}%`,
              background: i === highlight ? ACCENT : "rgba(23,32,64,0.12)",
              transform: `scaleY(${shown ? 1 : 0})`,
              transition: `transform 0.6s ${easeBar} ${0.1 + i * 0.03}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Code() {
  const lines = ["docker compose up -d", "", "# open http://localhost:3000"];
  return (
    <div className={`w-full max-w-[320px] overflow-hidden ${panel}`}>
      <div className="flex items-center justify-between border-[var(--cf-border)] border-b px-3 py-2">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-faint)]">terminal</span>
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-[var(--cf-border-strong)]" />
          <span className="size-1.5 rounded-full bg-[var(--cf-border-strong)]" />
        </span>
      </div>
      <pre className="overflow-hidden px-3 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-body)] leading-[1.7]">
        {lines.map((line, i) => (
          <div key={`${line}-${i}`} className="flex gap-3">
            <span className="w-3 select-none text-right text-[var(--cf-faint)] tabular-nums">{i + 1}</span>
            <span className="whitespace-pre" style={{ color: line.startsWith("#") ? "var(--cf-faint)" : undefined }}>
              {line.startsWith("docker") ? (
                <>
                  <span style={{ color: ACCENT }}>docker</span> compose up -d
                </>
              ) : (
                line
              )}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function Keys() {
  const shortcuts = [
    { keys: ["⌘", "K"], label: "Jump to a task" },
    { keys: ["J"], label: "Next intent" },
    { keys: ["K"], label: "Previous intent" },
    { keys: ["S"], label: "Steer a worker" },
  ];
  return (
    <div className="grid w-full max-w-[420px] grid-cols-1 gap-2 sm:grid-cols-2">
      {shortcuts.map((s, i) => (
        <div key={s.label} className={`flex items-center justify-between gap-3 px-3 py-2.5 ${panel}`}>
          <span className="truncate text-[12.5px] text-[var(--cf-muted)]">{s.label}</span>
          <span className="flex gap-1">
            {s.keys.map((key) => (
              <kbd
                key={key}
                className={`grid h-6 min-w-6 place-items-center rounded-[6px] border border-[var(--cf-border-strong)] border-b-2 bg-[var(--cf-card)] px-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--cf-text)] ${i === 0 ? "group-hover/card:translate-y-px group-hover/card:border-b" : ""}`}
              >
                {key}
              </kbd>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function Redact() {
  const segments: (string | { redacted: string })[] = [
    "POST /api/auth  Authorization: Bearer ",
    { redacted: "eyJhbGciOi…" },
    "  →  200, set-cookie session=",
    { redacted: "s%3Aad3f…" },
    "  from worker#2.",
  ];
  return (
    <div className={`w-full max-w-[440px] ${panel} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--cf-faint)] uppercase tracking-[0.12em]">
          recorded traffic
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px]"
          style={{ background: ACCENT_SOFT, color: ACCENT }}
        >
          2 secrets masked
        </span>
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] text-[var(--cf-body)] leading-[1.9]">
        {segments.map((seg, i) =>
          typeof seg === "string" ? (
            <span key={`${seg}-${i}`}>{seg}</span>
          ) : (
            <span key={`r-${i}`} className="relative mx-px inline-block rounded-[4px] align-middle leading-none">
              <span className="invisible px-1 text-[12px]">{seg.redacted}</span>
              <span
                className="absolute inset-0 rounded-[4px] opacity-85"
                style={{
                  background: "rgba(23,32,64,0.88)",
                  backgroundImage: "repeating-linear-gradient(135deg, transparent 0 4px, rgba(55,91,217,0.3) 4px 5px)",
                }}
              />
            </span>
          ),
        )}
      </p>
    </div>
  );
}

function Providers() {
  // row 0 is primary (active); on hover it "rate-limits" and fails over to row 1.
  const rows = [
    { name: "anthropic", model: "claude-opus", def: "active", hov: "limited" },
    { name: "openai", model: "gpt-4o", def: "standby", hov: "active" },
    { name: "bedrock", model: "qwen3-coder", def: "standby", hov: "standby" },
  ] as const;
  const pill = (state: string) => {
    const map: Record<string, { c: string; bg: string; t: string; dot: boolean }> = {
      active: { c: "#1f9d57", bg: "rgba(31,157,87,0.14)", t: "active", dot: true },
      standby: { c: "var(--cf-faint)", bg: "var(--cf-surface)", t: "standby", dot: false },
      limited: { c: "#b06f10", bg: "rgba(176,111,16,0.14)", t: "429", dot: false },
    };
    const m = map[state];
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px]"
        style={{ background: m.bg, color: m.c }}
      >
        {m.dot ? <span className="size-1.5 animate-pulse rounded-full" style={{ background: m.c }} /> : null}
        {m.t}
      </span>
    );
  };
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-2">
      {rows.map((p) => (
        <div key={p.name} className={`flex items-center justify-between gap-3 px-3 py-2.5 ${panel}`}>
          <span className="min-w-0">
            <span className="block truncate font-medium text-[12.5px] text-[var(--cf-text)]">{p.name}</span>
            <span className="block truncate font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--cf-faint)]">
              {p.model}
            </span>
          </span>
          <span className="relative grid shrink-0">
            <span className="transition-opacity duration-300 group-hover/card:opacity-0">{pill(p.def)}</span>
            <span className="absolute inset-0 flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
              {pill(p.hov)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- grid */

type Feat = { id: string; title: string; desc: string; size: string; visual: React.ReactNode };

export function FeatureBento() {
  const [ref, shown] = useInView<HTMLUListElement>();
  const FEATURES: Feat[] = [
    {
      id: "waterfall",
      size: "sm:col-span-2 lg:col-span-4",
      title: "Live exploration, span by span",
      desc: "Every probe, tool and write-back lands on one timeline while the task is still running.",
      visual: <Waterfall shown={shown} />,
    },
    {
      id: "alerts",
      size: "sm:col-span-2 lg:col-span-2",
      title: "Findings as they land",
      desc: "Confirmed vulns surface the moment a worker proves them.",
      visual: <Alerts />,
    },
    {
      id: "cost",
      size: "sm:col-span-1 lg:col-span-2",
      title: "Token cost, per round",
      desc: "Model spend priced on every planner round, not per month.",
      visual: <Cost shown={shown} />,
    },
    {
      id: "code",
      size: "sm:col-span-1 lg:col-span-2",
      title: "One command to run",
      desc: "A single self-hosted Go binary with an embedded console.",
      visual: <Code />,
    },
    {
      id: "keys",
      size: "sm:col-span-2 lg:col-span-2",
      title: "Built for the keyboard",
      desc: "Move between tasks, intents and workers without the mouse.",
      visual: <Keys />,
    },
    {
      id: "redact",
      size: "sm:col-span-2 lg:col-span-4",
      title: "Traffic recorded, secrets masked",
      desc: "The MITM proxy keeps every request for replay — tokens and cookies masked before they're stored.",
      visual: <Redact />,
    },
    {
      id: "providers",
      size: "sm:col-span-2 lg:col-span-2",
      title: "Multi-provider, with failover",
      desc: "Anthropic, OpenAI and Bedrock in one pool — a rate-limited provider fails over mid-run.",
      visual: <Providers />,
    },
  ];

  return (
    <ul ref={ref} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {FEATURES.map((f) => (
        <li key={f.id} className={f.size}>
          <article className={card}>
            <div className="relative flex min-h-[190px] flex-1 items-center justify-center overflow-hidden px-5 pt-5">
              {f.visual}
            </div>
            <div className="px-6 pt-5 pb-6">
              <h3 className="font-medium text-[16px] text-[var(--cf-text)] tracking-[-0.011em]">{f.title}</h3>
              <p className="mt-1.5 max-w-[48ch] text-[13.5px] text-[var(--cf-muted)] leading-6">{f.desc}</p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
