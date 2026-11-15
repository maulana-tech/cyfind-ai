import type { ReactNode } from "react";

import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  GitBranch,
  Layers,
  Lock,
  Network,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import type { Metadata } from "next";

import { FeatureBento } from "./_components/feature-bento";
import { FlowStepper } from "./_components/flow-stepper";
import { HeroVisual } from "./_components/hero-visual";
import { CountUp } from "./_components/motion";
import { LandingNav } from "./_components/nav";
import { Reveal } from "./_components/reveal";
import { StackCards } from "./_components/stack-cards";

export const metadata: Metadata = {
  title: "Cyfind AI — Autonomous AI Penetration Testing",
  description:
    "A multi-agent AI system that explores, exploits and reports on an isolated lab target on its own — built on a dual-graph model of assets and reasoning.",
};

export default function LandingPage() {
  return (
    <div className="cf-root min-h-screen scroll-smooth bg-[var(--cf-bg)] text-[var(--cf-body)] antialiased [color-scheme:light] selection:bg-[var(--cf-accent)]/15">
      <LandingNav />
      <main>
        <Hero />
        <CapabilityStrip />
        <Platform />
        <DualGraph />
        <Diagrams />
        <Metrics />
        <Flow />
        <Safety />
        <WhyStack />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section className="px-5 pt-32 pb-20 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-[820px]">
          <Reveal>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--cf-border)] bg-[var(--cf-accent-soft)] px-3 py-1 text-[12px] text-[var(--cf-accent)] transition-colors hover:border-[var(--cf-border-strong)]"
            >
              <span className="size-1.5 rounded-full bg-[var(--cf-accent)]" />
              Multi-agent autonomous pentesting · isolated lab
            </a>
          </Reveal>

          <Reveal delay={50}>
            <h1 className="mt-6 text-balance font-light text-[44px] text-[var(--cf-text)] leading-[1.02] tracking-[-0.022em] sm:text-[64px]">
              Security testing that runs itself
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-6 max-w-[560px] text-pretty text-[17px] text-[var(--cf-muted)] leading-[1.6]">
              Cyfind AI is a team of LLM agents that recon, reason and exploit a target on their own. A planner emits
              intents, concurrent workers execute with real tooling, and every discovery flows into a live dual-graph of
              assets and findings.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/function/tasks"
                className="rounded-[10px] bg-[var(--cf-accent)] px-4 py-2.5 font-medium text-[14px] text-[var(--cf-on-accent)] tracking-[-0.011em] shadow-[var(--cf-shadow-sm)] transition-colors hover:bg-[var(--cf-accent-hover)]"
              >
                Launch a task
              </Link>
              <a
                href="https://github.com/maulana-tech/cyfind-ai"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-[10px] cf-card px-4 py-2.5 font-medium text-[14px] text-[var(--cf-text)] transition-colors hover:bg-[var(--cf-surface)]"
              >
                View on GitHub
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={200} variant="fade">
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-[var(--cf-faint)]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[var(--cf-accent)]" />
                Approval gate on every tool call
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Terminal className="size-4 text-[var(--cf-accent)]" />
                Single self-hosted Go binary
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-4 text-[var(--cf-accent)]" />
                MIT License
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} variant="fade" className="mt-16">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Capability strip */

const CHIPS = [
  "Subdomain discovery",
  "Port & service scan",
  "Web app testing",
  "SQLi / XSS / SSRF",
  "Traffic recording",
  "Out-of-band callbacks",
  "Multi-provider LLM",
  "Worker trace sharing",
  "Coverage mapping",
  "PoC evidence",
];

function CapabilityStrip() {
  const row = [...CHIPS.map((c) => ({ c, half: "a" })), ...CHIPS.map((c) => ({ c, half: "b" }))];
  return (
    <section className="border-[var(--cf-border)] border-y bg-[var(--cf-surface)] py-6">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="cf-marquee-track flex w-max gap-2.5">
          {row.map(({ c, half }) => (
            <span
              key={`${half}-${c}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full cf-card px-3 py-1 text-[13px] text-[var(--cf-muted)]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Platform */

function Platform() {
  return (
    <section id="platform" className="scroll-mt-20 px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="The platform"
          title="An autonomous testing engine, not a scanner"
          sub="Cyfind AI wires LLM agents to real tools and a shared knowledge graph, so exploration compounds instead of resetting with every scan."
        />

        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-[18px] cf-card p-6 shadow-[var(--cf-shadow-sm)] sm:p-8">
            <div className="flex items-center gap-3">
              <IconChip>
                <Workflow className="size-5" />
              </IconChip>
              <div>
                <h3 className="font-medium text-[17px] text-[var(--cf-text)] tracking-[-0.011em]">
                  Event-driven exploration loop
                </h3>
                <p className="text-[13px] text-[var(--cf-faint)]">graph change → planner → workers → write-back</p>
              </div>
            </div>
            <p className="mt-4 max-w-[640px] text-[15px] text-[var(--cf-muted)] leading-[1.6]">
              A graph change wakes the planner, which emits intents into a frontier. Workers each claim one, execute,
              and write results back — the write-back wakes the planner again. The loop runs until a goal is proven.
            </p>
            <div className="mt-6">
              <LoopDiagram />
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-4">
          <FeatureBento />
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Dual graph */

function DualGraph() {
  return (
    <section
      id="dual-graph"
      className="scroll-mt-20 border-[var(--cf-border)] border-y bg-[var(--cf-surface)] px-5 py-24 sm:px-6"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="The dual-graph model"
          title="Two graphs, joined by anchors"
          sub="The core idea behind Cyfind AI: separate what you found from how you reasoned about it, then tie them together for full coverage."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <GraphPanel
              icon={<Layers className="size-5" />}
              kicker="Asset graph"
              title="Global source of truth"
              desc="Every discovered asset lives here, deduped by the program and shared across tasks."
              rows={[
                ["root_domain", "acme-corp.com"],
                ["subdomain", "api.acme-corp.com"],
                ["ip / service", "10.0.3.14 : 8080"],
                ["endpoint", "POST /api/auth"],
              ]}
            />
          </Reveal>
          <Reveal delay={80}>
            <GraphPanel
              icon={<GitBranch className="size-5" />}
              kicker="Exploration graph"
              title="The reasoning trace"
              desc="Per-task lineage of goals, intents, facts and findings — connected by spawns, yields and proves edges."
              rows={[
                ["goal", "breach admin panel"],
                ["intent", "test auth for SQLi"],
                ["fact", "error-based SQLi likely"],
                ["finding", "confirmed · PoC attached"],
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-4 flex flex-col items-start gap-3 rounded-[18px] cf-card px-6 py-5 shadow-[var(--cf-shadow-sm)] sm:flex-row sm:items-center">
            <IconChip>
              <Network className="size-5" />
            </IconChip>
            <p className="text-[14.5px] text-[var(--cf-body)] leading-[1.6]">
              <span className="font-medium text-[var(--cf-text)]">Anchors</span> tie each intent, fact and finding to a
              concrete asset — powering per-asset test coverage and a full finding-to-asset audit trail.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Diagrams */

const DIAGRAMS = [
  {
    href: "/diagrams/architecture.html",
    img: "/diagrams/architecture-preview.png",
    title: "Detailed system architecture",
    desc: "Frontend, the Go binary, the agent runtime, the dual-graph store, the safety layer and every LLM provider — one explorable map.",
  },
  {
    href: "/diagrams/agent-flow.html",
    img: "/diagrams/agent-flow-preview.png",
    title: "Agent flow · exploration lifecycle",
    desc: "How a goal becomes intents, workers, facts and findings — the planner / worker loop traced step by step.",
  },
];

function Diagrams() {
  return (
    <section id="architecture" className="scroll-mt-20 px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Under the hood"
          title="Explore the architecture"
          sub="Interactive, zoomable diagrams generated from the real codebase — open them full-screen and pan around."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {DIAGRAMS.map((d, i) => (
            <Reveal key={d.href} delay={i * 80}>
              <a
                href={d.href}
                target="_blank"
                rel="noreferrer"
                className="cf-card cf-solid group block h-full overflow-hidden rounded-[18px] shadow-[var(--cf-shadow-sm)] transition hover:-translate-y-[2px] hover:shadow-[var(--cf-shadow-lg)]"
              >
                <div className="overflow-hidden border-[var(--cf-border)] border-b bg-white">
                  {/* biome-ignore lint/performance/noImgElement: static export, raw img is intended */}
                  <img
                    src={d.img}
                    alt={d.title}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-[18px] text-[var(--cf-text)] tracking-[-0.011em]">{d.title}</h3>
                  <p className="mt-2 text-[14px] text-[var(--cf-muted)] leading-[1.6]">{d.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-medium text-[13.5px] text-[var(--cf-accent)]">
                    Open interactive diagram
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Metrics */

const METRICS = [
  { to: 2.7, decimals: 1, suffix: "M", label: "avg tokens per task run" },
  { to: 143, decimals: 0, suffix: "", label: "assets mapped per run" },
  { to: 41, decimals: 0, suffix: "%", label: "prompt cache hit rate" },
  { to: 3, decimals: 0, suffix: "", label: "LLM providers, with failover" },
];

function Metrics() {
  return (
    <section className="border-[var(--cf-border)] border-y bg-[var(--cf-surface)] px-5 py-16 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <Reveal key={m.label}>
            <div>
              <div className="font-light text-[48px] text-[var(--cf-text)] tracking-[-0.03em] tabular-nums sm:text-[56px]">
                <CountUp to={m.to} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <div className="mt-1 text-[15px] text-[var(--cf-muted)]">{m.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Flow */

function Flow() {
  return (
    <section id="flow" className="scroll-mt-20 px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="How it works"
          title="Scope. Plan. Execute. Report."
          sub="One continuous loop. You set the target and watch the graph fill in — step through it."
        />

        <div className="mt-8">
          <FlowStepper />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Safety */

function Safety() {
  return (
    <section id="safety" className="scroll-mt-20 border-[var(--cf-border)] border-t px-5 py-24 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div>
            <Eyebrow>Safety by design</Eyebrow>
            <h2 className="mt-4 text-balance font-light text-[32px] text-[var(--cf-text)] leading-[1.1] tracking-[-0.022em] sm:text-[40px]">
              Autonomy with a hand on the brake
            </h2>
            <p className="mt-5 max-w-[500px] text-[16px] text-[var(--cf-muted)] leading-[1.6]">
              Agents move fast, but nothing executes unchecked. A guard reviews every tool call against user-configured
              rules, and anything that needs a human simply waits for one.
            </p>

            <div className="mt-8 space-y-5">
              <SafetyRow
                icon={<ShieldCheck className="size-5" />}
                title="Guard + intercept on every call"
                body="allow, deny or ask — priority-ordered rules evaluated before any command runs, with a full audit log."
              />
              <SafetyRow
                icon={<Lock className="size-5" />}
                title="Isolated lab only"
                body="Cyfind AI is built and licensed for lab targets you own — never real-world systems."
              />
              <SafetyRow
                icon={<Terminal className="size-5" />}
                title="Self-hosted, single binary"
                body="A Go monolith with an embedded frontend. Your keys, your infrastructure, your data."
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} variant="fade">
          <ApprovalCard />
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Why stack */

function WhyStack() {
  return (
    <section className="px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Why Cyfind AI"
          title="Built different, by design"
          sub="Four things that set an autonomous pentest apart from a scanner."
        />
        <div className="mt-10">
          <StackCards />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What can I point Cyfind AI at?",
    a: "Isolated lab targets you own and are authorized to test. Cyfind AI is built and licensed (MIT) for lab environments only — never real-world or third-party systems.",
  },
  {
    q: "How is this different from a scanner?",
    a: "A scanner matches signatures and stops. Cyfind AI reasons: a planner reads a live dual-graph, emits intents, and concurrent worker agents execute real tools, exploit, and write findings back — exploration compounds across rounds instead of resetting.",
  },
  {
    q: "Which LLM providers are supported?",
    a: "Anthropic, OpenAI and AWS Bedrock, behind one failover pool with health tracking and per-task profiles. You can also point it at any OpenAI-compatible endpoint.",
  },
  {
    q: "Is it safe to run autonomously?",
    a: "Every tool call passes a guard and user-configured intercept rules (allow / deny / ask) before it runs, with a full audit log. Anything that needs a human simply waits for one.",
  },
  {
    q: "How do I deploy it?",
    a: "A single self-hosted Go binary with the console embedded, or docker compose for the full stack. Your keys, your infrastructure, your data.",
  },
  {
    q: "Can I extend it?",
    a: "Yes — drop in runtime-loaded skill packs (API recon, Playwright, code audit, patch-diff and more) and connect MCP servers for new tools, without rebuilding.",
  },
  {
    q: "What does a run produce?",
    a: "Confirmed findings with reproducible PoCs and a per-asset coverage map — every result traceable through anchors back to the concrete asset it came from.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-[var(--cf-border)] border-t px-5 py-24 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-balance font-medium text-[32px] text-[var(--cf-text)] leading-[1.1] tracking-[-0.022em] sm:text-[40px]">
            Questions, answered
          </h2>
          <p className="mt-4 max-w-[320px] text-[15px] text-[var(--cf-muted)] leading-[1.6]">
            Can&apos;t find what you need? The source and issues are on GitHub.
          </p>
          <a
            href="https://github.com/maulana-tech/cyfind-ai/issues"
            target="_blank"
            rel="noreferrer"
            className="group mt-5 inline-flex items-center gap-1.5 text-[14px] text-[var(--cf-text)] transition-colors hover:text-[var(--cf-accent)]"
          >
            Open an issue
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div>
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group border-[var(--cf-border)] border-b [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5">
                <span className="font-medium text-[17px] text-[var(--cf-text)] tracking-[-0.011em]">{item.q}</span>
                <ChevronDown className="size-5 shrink-0 text-[var(--cf-muted)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="max-w-[680px] pb-5 text-[15px] text-[var(--cf-muted)] leading-[1.65]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- CTA */

function CTA() {
  return (
    <section className="px-5 pt-8 pb-28 text-center sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="mx-auto max-w-[760px] text-balance font-light text-[38px] text-[var(--cf-text)] leading-[1.02] tracking-[-0.035em] sm:text-[64px]">
            Put a pentest team
            <br />
            <span className="text-[var(--cf-muted)]">on autopilot.</span>
          </h2>
        </Reveal>
        <Reveal delay={60}>
          <p className="mx-auto mt-6 max-w-[520px] text-[16px] text-[var(--cf-muted)] leading-[1.6]">
            Spin up a task, pick your LLM provider, and let the agents work the graph. Open the app or grab the source.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/function/tasks"
              className="rounded-full bg-[var(--cf-accent)] px-5 py-2.5 font-medium text-[14px] text-[var(--cf-on-accent)] shadow-[var(--cf-shadow-sm)] transition-colors hover:bg-[var(--cf-accent-hover)]"
            >
              Open Cyfind AI
            </Link>
            <a
              href="https://github.com/maulana-tech/cyfind-ai"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--cf-border)] bg-[var(--cf-card)] px-5 py-2.5 font-medium text-[14px] text-[var(--cf-text)] shadow-[var(--cf-shadow-sm)] transition-colors hover:bg-[var(--cf-surface)]"
            >
              View repository
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Footer */

const FOOTER_COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Platform",
    links: [
      ["Overview", "#platform"],
      ["Dual-graph", "#dual-graph"],
      ["How it works", "#flow"],
      ["Safety", "#safety"],
    ],
  },
  {
    title: "Product",
    links: [
      ["Open app", "/function/tasks"],
      ["Launch a task", "/function/tasks"],
      ["Dashboard", "/dashboard"],
    ],
  },
  {
    title: "Project",
    links: [
      ["GitHub", "https://github.com/maulana-tech/cyfind-ai"],
      ["Issues", "https://github.com/maulana-tech/cyfind-ai/issues"],
      ["MIT License", "https://github.com/maulana-tech/cyfind-ai/blob/main/LICENSE"],
    ],
  },
];

function Footer() {
  return (
    <footer className="border-[var(--cf-border)] border-t">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-[7px] bg-[var(--cf-accent-soft)]">
              <Network className="size-3.5 text-[var(--cf-accent)]" />
            </span>
            <span className="font-medium text-[15px] text-[var(--cf-text)]">Cyfind AI</span>
          </div>
          <p className="mt-4 max-w-[280px] text-[13px] text-[var(--cf-muted)] leading-[1.6]">
            A multi-agent AI system for autonomous penetration testing — isolated lab only.
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="font-medium text-[12px] text-[var(--cf-faint)] uppercase tracking-wider">{col.title}</div>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-[var(--cf-muted)]">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-[var(--cf-text)]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 border-[var(--cf-border)] border-t px-5 py-6 text-[12px] text-[var(--cf-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} Cyfind AI · MIT License</span>
        <span>Built for authorized, isolated-lab testing only.</span>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------- shared pieces */

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="max-w-[640px]">
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={50}>
        <h2 className="mt-4 text-balance font-light text-[32px] text-[var(--cf-text)] leading-[1.1] tracking-[-0.022em] sm:text-[42px]">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={100}>
        <p className="mt-4 text-pretty text-[16px] text-[var(--cf-muted)] leading-[1.6]">{sub}</p>
      </Reveal>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="cf-eyebrow">
      <span className="size-1.5 rounded-full bg-[var(--cf-accent)]" />
      {children}
    </span>
  );
}

function IconChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-accent-soft)] text-[var(--cf-accent)]">
      {children}
    </span>
  );
}

function LoopDiagram() {
  const nodes = ["Graph change", "Planner", "Intents", "Workers", "Write-back"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {nodes.map((n, i) => (
        <div key={n} className="flex items-center gap-2">
          <span className="rounded-[8px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-1.5 text-[12.5px] text-[var(--cf-body)]">
            {n}
          </span>
          {i < nodes.length - 1 && <ArrowRight className="size-3.5 text-[var(--cf-border-strong)]" />}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <ArrowRight className="size-3.5 rotate-180 text-[var(--cf-border-strong)]" />
        <span className="rounded-[8px] border border-dashed border-[var(--cf-border-strong)] px-3 py-1.5 text-[11.5px] text-[var(--cf-faint)]">
          loops until goal proven
        </span>
      </div>
    </div>
  );
}

function GraphPanel({
  icon,
  kicker,
  title,
  desc,
  rows,
}: {
  icon: ReactNode;
  kicker: string;
  title: string;
  desc: string;
  rows: [string, string][];
}) {
  return (
    <div className="h-full rounded-[18px] cf-card p-6 shadow-[var(--cf-shadow-sm)]">
      <div className="flex items-center gap-3">
        <IconChip>{icon}</IconChip>
        <div>
          <div className="font-medium text-[11px] text-[var(--cf-faint)] uppercase tracking-wider">{kicker}</div>
          <div className="font-medium text-[17px] text-[var(--cf-text)] tracking-[-0.011em]">{title}</div>
        </div>
      </div>
      <p className="mt-4 text-[14px] text-[var(--cf-muted)] leading-[1.6]">{desc}</p>
      <div className="mt-5 space-y-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-2.5"
          >
            <span className="rounded-[6px] bg-[var(--cf-accent-soft)] px-2 py-0.5 text-[11px] text-[var(--cf-accent)]">
              {k}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[12.5px] text-[var(--cf-body)]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyRow({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <IconChip>{icon}</IconChip>
      <div>
        <h3 className="font-medium text-[15px] text-[var(--cf-text)] tracking-[-0.011em]">{title}</h3>
        <p className="mt-1 text-[13.5px] text-[var(--cf-muted)] leading-[1.6]">{body}</p>
      </div>
    </div>
  );
}

function ApprovalCard() {
  return (
    <div className="cf-card cf-solid mx-auto max-w-md rounded-[18px] p-5 shadow-[var(--cf-shadow-lg)]">
      <div className="flex items-center gap-2 border-[var(--cf-border)] border-b pb-3">
        <ShieldCheck className="size-4 text-[var(--cf-accent)]" />
        <span className="font-medium text-[13px] text-[var(--cf-text)]">Approval required</span>
        <span className="ml-auto rounded-[6px] bg-[#c67a12]/12 px-2 py-0.5 text-[10.5px] text-[#b06f10]">paused</span>
      </div>
      <div className="space-y-3 pt-4">
        <div className="text-[12px] text-[var(--cf-faint)]">worker#2 wants to run</div>
        <div className="rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-3 font-[family-name:var(--font-geist-mono)] text-[12.5px] text-[var(--cf-body)] leading-[1.5]">
          <span className="text-[var(--cf-faint)]">$ </span>sqlmap -u{" "}
          <span className="text-[var(--cf-accent)]">&quot;https://api.acme-corp.com/auth&quot;</span> --batch --risk=2
        </div>
        <div className="rounded-[10px] border border-[var(--cf-border)] bg-[var(--cf-accent-soft)] px-3 py-2 text-[11.5px] text-[var(--cf-muted)]">
          Matched rule: <span className="text-[var(--cf-accent)]">ask</span> · injection tooling on in-scope host
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-[10px] bg-[var(--cf-accent)] py-2 font-medium text-[12.5px] text-[var(--cf-on-accent)]"
          >
            Approve
          </button>
          <button
            type="button"
            className="flex-1 rounded-[10px] cf-card py-2 font-medium text-[12.5px] text-[var(--cf-text)]"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
