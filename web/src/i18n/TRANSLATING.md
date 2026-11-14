# UI translation conventions (EN + ID)

You are translating the CYFIND Next.js frontend from its source language
(zh-CN) into **English (`en`)** and **Bahasa Indonesia (`id`)**.

## How the module works (read `src/i18n/` if unsure)

- Keys **are the original zh-CN strings**. `t("仪表盘")` looks up the key in
  `messages/en` then `messages/id`. `zh` needs no dictionary (key = source).
- Missing key → falls back: `id → en → key` (raw Chinese). Every key you use
  in code MUST exist in BOTH your `en/<ns>.ts` and `id/<ns>.ts` files.
- `{param}` interpolation: key `"共 {n} 个任务"` + `t("共 {n} 个任务", { n })`
  → en `"{n} tasks"`. Placeholders must appear in the dictionary value.

## What to translate (user-visible only)

- JSX text, `aria-label`, `title`, `placeholder`, `tooltip`, `label` props
- Toasts / `Error()` messages shown to the user (frontend-origin)
- Dialog, table, button, heading, badge, tab, empty-state, chart, select text
- **API-origin strings displayed in UI**: wrap the render site with `t()`
  (fallback is the original text — safe even if the backend sends something
  not in the dictionary). Known backend messages you see rendered → add dict
  entries too.

## What to NEVER translate or change

1. **Code comments** — Chinese comments are house style; leave them byte-for-byte.
2. **API payload values / wire enums / object keys / identifiers** — anything
   sent to the backend, used to look up backend data, localStorage/cookie
   keys, class names, URLs, route paths, imports. If unsure whether a string
   crosses the wire → **skip it and list it as "skipped: API-bound?"** in
   your report.
3. **Data maps keyed by backend enums** (`lib/status.ts`, similar): keep the
   zh keys AND zh values in the data file. Translate at the render site:
   `{t(row.label)}` / `{t(meta.label)}`. Never mutate the data shape.
   (`lib/types.ts` is comments-only — leave the whole file alone.)
4. **Existing English text** — already English stays untouched.
5. Code behavior, names, structure, formatting — wrap strings, nothing else.

## Component pattern

```tsx
import { useT } from "@/i18n";

function MyComponent() {
  const t = useT(); // top of every component that uses t, before any return
  return <span>{t("仪表盘")}</span>;
}
```

- Non-component helpers (utilities, module functions): `import { t } from "@/i18n";`
  BUT never call `t()` at module top-level for a value rendered later — the
  module language may be stale; translate during render instead.
- Name collision with an existing `t` (e.g. `setInterval`): rename the hook
  (`const tFn = useT();`).
- Pure module data (like `navigation/sidebar/sidebar-items.ts`) keeps zh
  strings as data; the components that render them translate.

## Dictionary files

- `src/i18n/messages/en/<ns>.ts` and `src/i18n/messages/id/<ns>.ts`
- Shape (copy `src/i18n/messages/en/nav.ts`):

```ts
/** Short header comment. */
const messages = {
  "中文key": "Translation",
} satisfies Record<string, string>;

export default messages;
```

- `<ns>` for a file: path slug — lowercase, drop `src/app/`, `src/`, `(main)`,
  `(auth)`, extension; slashes → `-`. Examples:
  - `web/src/app/(main)/function/tasks/page.tsx` → `function-tasks`
  - `web/src/app/(main)/function/tasks/detail/_tabs/sessions-tab.tsx`
    → `function-tasks-detail-sessions-tab`
  - `web/src/components/agent-editor.tsx` → `components-agent-editor`
  - `web/src/lib/api.ts` → `lib-api`
  If two files would collide, append a disambiguator.
- **Do NOT edit `src/i18n/messages/index.ts`** — the registry is updated
  centrally after your work is reviewed. Just report your ns names.
- Key must match the source string EXACTLY (copy-paste: punctuation, …, spaces).

## Translation quality

- **EN**: natural, concise, professional English for a security tool.
- **ID**: natural Bahasa Indonesia an Indonesian security practitioner would
  use; common tech loanwords are fine (Dashboard, Chat, Tools, Endpoint,
  Queue). Keep as-is: LLM, MCP, Skill, Agent, API, SQL, CVE, Token, Proxy.
- No machine-literal phrasing; match the UI's tone (short labels, sentence
  case for sentences).

## Verification (node/npm are NOT on the host — use Docker from repo root)

```bash
docker run --rm -v "$PWD/web:/app" -w /app node:22-bookworm bash -c \
  'npx biome check --write "src/path/file.tsx" "src/i18n/messages/en/<ns>.ts" "src/i18n/messages/id/<ns>.ts"; npx tsc --noEmit'
```

- `tsc --noEmit` must be error-free.
- Biome: your files clean (1 pre-existing nursery error in
  `sidebar/nav-main.tsx` about `poll()` is known — not yours, don't fix it).
- Final sweep for your files: `grep -n '[一-鿿]' <file>` — every remaining hit
  must be a comment, an API-bound value you reported, or zh data kept as keys.

## Report format

- ns names created (en+id), files touched
- skipped strings + reason (API-bound / comment-only file / …)
- verification output (tsc + biome status)
