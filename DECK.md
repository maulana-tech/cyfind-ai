# CYFIND — Pitch Deck

> Global AI Hackathon 2026 | Track: Build an Agent That Pentests a Target on Its Own

---

## Slide 1: Cover

**CYFIND** — Autonomous AI Penetration Testing Agent

- Global AI Hackathon 2026
- Track: AI Agents & Intelligent Systems
- github.com/maulana-tech/cyfind-ai

---

## Slide 2: Problem

- Manual penetration testing is slow, expensive, and requires scarce expertise
- Security assessments are point-in-time — gaps between tests leave vulnerabilities undiscovered
- Human testers cannot scale across growing attack surfaces
- Organizations need continuous, autonomous security validation

---

## Slide 3: Solution

**CYFIND**: an autonomous AI agent that performs complete penetration tests inside isolated lab environments.

- Give it a target scope, it explores, discovers assets, finds vulnerabilities, generates reports
- No human intervention needed — the agent decides what to do next
- Strictly respects defined scope, recovers from failures, enforces safety gates
- Full security reports with findings, evidence, severity, and remediation

---

## Slide 4: How It Works — The Dual-Graph Model

Two interconnected knowledge graphs power every pentest task:

- **Asset Graph** (global, cross-task): discovered assets — root domains, subdomains, IPs, services, apps, endpoints
- **Exploration Graph** (per task): the agent's reasoning trace — goals, intents, facts, findings, hints
- **Anchors** join both graphs: every finding is tied to a concrete asset, enabling per-asset test coverage

```
Asset Graph          Anchors          Exploration Graph
+-----------+                         +-------------+
| domain    |-------- anchor -------->| intent      |
| subdomain |-------- anchor -------->| fact        |
| ip        |-------- anchor -------->| finding     |
| service   |                         | goal        |
| endpoint  |                         | hint        |
+-----------+                         +-------------+
```

---

## Slide 5: The Exploration Loop

Event-driven autonomous cycle:

1. **Graph change** triggers the planner
2. **Planner** (LLM) analyzes current state, emits intents into a frontier
3. **Workers** (LLM) each claim one intent, execute with real security tools
4. **Write-back**: new assets, facts, and findings feed into both graphs
5. Cycle repeats until the goal is proven

Key mechanisms:
- **Worker-to-worker trace sharing**: observations flow between workers in real-time
- **Planner todolist**: serial exploitation chains dispatched step-by-step across rounds
- **Concurrent workers**: configurable parallelism (default 3 workers per task)

---

## Slide 6: AI Usage

- **LLM-powered Planner**: strategic decision-making, attack path selection
- **LLM-powered Workers**: tool interpretation, adaptive strategy on failure
- **Multi-provider support**: Claude, OpenAI, custom LLM endpoints
- **Token-efficient design**: structured prompts, compaction, shared context via dual graph
- **Safety-first**: intercept rules and approval gates before risky operations
- **Skills system**: runtime-loaded agent capabilities (API recon, Playwright CLI, etc.)

---

## Slide 7: Key Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time overview of tasks, findings, assets, LLM usage stats |
| **Task Execution** | Live view of the agent working with exploration graph visualization |
| **Findings** | Structured security reports with evidence, severity, remediation |
| **Asset Discovery** | Automatic asset graph with parent/child relationships and dedup |
| **Chat** | Direct interaction with agents during execution |
| **Intercept Rules** | Configurable approval gates for dangerous operations |

---

## Slide 8: Safety and Scope Enforcement

- **Strict scope boundaries**: agent cannot operate outside defined targets
- **Intercept rules**: configurable approval gates before dangerous tool executions
- **Isolated lab restriction**: enforced at license level (AGPL-3.0)
- **Full audit trail**: all actions, tool calls, and decisions logged
- **Graceful recovery**: agent adapts when attempts fail, no destructive fallback
- **Traffic recording**: built-in MITM proxy captures evidence for every finding

---

## Slide 9: Technical Architecture

```
+------------------+     +-------------------+     +----------------+
|   Next.js UI     |---->|   Go Backend      |---->|  PostgreSQL    |
|  (static export) |     |  (net/http + pgx) |     |  (asset graph, |
|  embedded via    |     |                   |     |   exploration  |
|  go:embed        |     |  Engine + Manager |     |   graph, etc.) |
+------------------+     |  Planner + Workers|     +----------------+
                         |                   |
                         |  norma SDK        |---->  LLM Providers
                         |  (agentcore,      |       (Claude, OpenAI,
                         |   tools,          |        custom)
                         |   permissions,    |
                         |   memory)         |
                         +-------------------+
                                |
                         +------+-------+
                         |  MITM Proxy  |
                         |  (traffic    |
                         |   recorder)  |
                         +--------------+
```

- **Single binary**: `cyfind` — one command to run everything
- **Schema**: idempotent DDL — restart is the migration
- **Skills**: runtime-loaded agent capabilities

---

## Slide 10: Demo Results

A completed pentest task produces:

- **Discovered assets**: full asset graph with domains, IPs, services, endpoints
- **Exploration trace**: how the agent reasoned through the target
- **Findings**: each with evidence, severity rating (Critical/High/Medium/Low/Info), and remediation recommendations
- **Coverage map**: which assets were tested and how thoroughly
- **Report**: exportable security assessment report

---

## Slide 11: Scalability and Future

- Concurrent workers per task (configurable parallelism)
- Multi-task parallel execution across targets
- Extensible skill system for new attack techniques
- Web3 and smart contract auditing capabilities (in development)
- MCP integration for external tool ecosystems
- Self-update mechanism for continuous improvement

---

## Slide 12: Closing

> One agent. Full pentest. Zero manual steps.

- **GitHub**: github.com/maulana-tech/cyfind-ai
- **License**: AGPL-3.0 (isolated lab use only)
- **Built with**: Go, Next.js, PostgreSQL, norma SDK, LLM agents
