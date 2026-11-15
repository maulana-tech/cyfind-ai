# UI translation conventions (EN + ID)

The Cyfind AI Next.js frontend is authored in **English**. English is both the
source language and the default UI language; **Bahasa Indonesia (`id`)** is an
optional translation layer on top.

## How the module works (read `src/i18n/` if unsure)

- Keys **are the English source strings**. `t("Dashboard")` looks up the key in
  `messages/id` when the UI language is `id`; `en` needs no dictionary (key =
  source).
- Missing key → falls back to the key itself (the English source). Every `id`
  dictionary value is optional; a missing one simply renders in English.
- `{param}` interpolation: key `"{n} tasks"` + `t("{n} tasks", { n })`.
  Placeholders must appear verbatim in the dictionary value.

## What to translate (user-visible only)

- JSX text, `aria-label`, `title`, `placeholder`, `tooltip`, `label` props
- Toasts / `Error()` messages shown to the user (frontend-origin)
- Dialog, table, button, heading, badge, tab, empty-state, chart, select text
- **API-origin strings displayed in UI**: wrap the render site with `t()`
  (fallback is the original text — safe even if the backend sends something
  not in the dictionary).

## What to NEVER translate or change

1. **API payload values / wire enums / object keys / identifiers** — anything
   sent to the backend, used to look up backend data, localStorage/cookie
   keys, class names, URLs, route paths, imports. If unsure whether a string
   crosses the wire → **skip it and list it as "skipped: API-bound?"** in
   your report.
2. **Data maps keyed by backend enums** (`lib/status.ts`, similar): keep the
   source keys AND values in the data file. Translate at the render site:
   `{t(row.label)}` / `{t(meta.label)}`. Never mutate the data shape.
3. **Code behavior, names, structure, formatting** — wrap strings, nothing else.

## Component pattern

```tsx
import { useT } from "@/i18n";

function MyComponent() {
  const t = useT(); // top of every component that uses t, before any return
  return <span>{t("Dashboard")}</span>;
}
```

- Non-component helpers (utilities, module functions): `import { t } from "@/i18n";`
  BUT never call `t()` at module top-level for a value rendered later — the
  module language may be stale; translate during render instead.
- Name collision with an existing `t` (e.g. `setInterval`): rename the hook
  (`const tFn = useT();`).
- Pure module data (like `navigation/sidebar/sidebar-items.ts`) keeps the
  source strings as data; the components that render them translate.

## Dictionary files

- `src/i18n/messages/id/<ns>.ts` (and the matching `en/<ns>.ts`, where key =
  value by convention).
- Shape (copy `src/i18n/messages/id/nav.ts`):

```ts
/** Short header comment. */
const messages = {
  "English key": "Terjemahan",
} satisfies Record<string, string>;

export default messages;
```

- `<ns>` for a file: path slug — lowercase, drop `src/app/`, `src/`, `(main)`,
  `(auth)`, extension; slashes → `-`. Examples:
  - `web/src/app/(main)/function/tasks/page.tsx` → `function-tasks`
  - `web/src/components/agent-editor.tsx` → `components-agent-editor`
  - `web/src/lib/api.ts` → `lib-api`
  If two files would collide, append a disambiguator.
- Key must match the English source string EXACTLY (copy-paste: punctuation,
  …, spaces).

## Translation quality

- **ID**: natural Bahasa Indonesia an Indonesian security practitioner would
  use; common tech loanwords are fine (Dashboard, Chat, Tools, Endpoint,
  Queue). Keep as-is: LLM, MCP, Skill, Agent, API, SQL, CVE, Token, Proxy.
- No machine-literal phrasing; match the UI's tone (short labels, sentence
  case for sentences).

## Verification

```bash
cd web && npx biome check --write "src/i18n/messages/id/<ns>.ts" && npx tsc --noEmit
```

- `tsc --noEmit` must be error-free.

## Report format

- ns names touched (id), files touched
- skipped strings + reason (API-bound / comment-only file / …)
- verification output (tsc + biome status)
