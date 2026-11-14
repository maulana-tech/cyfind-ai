---
name: api-recon
description: Invoke this skill when collecting a website's API interfaces.
---

# API Recon (frontend interface reconnaissance)

Under an **authorized** premise, discover as completely as possible: **backend APIs** (paths, methods, parameters, response bodies), **frontend routes**, and **UI feature triggers** (tabs, dialogs, table actions, etc.).

---

## Boundaries and prohibitions (Agent must-read — violation is out of scope)

This skill **does only API / parameter-surface reconnaissance**; it is not a vulnerability-hunting or penetration-exploitation phase.

### Task boundaries

| Scope | Allowed | Forbidden |
|---|---|---|
| **Goal** | enumerate paths, methods, parameters, routes, UI triggers | SQLi/XSS/privilege-escalation/brute-force/fuzz vulns, packet-tampering attacks, destructive operations |
| **Auth** | Hook + stub/mock to bypass the **client-side** login gate | asking the user for or guessing account/password; attempting a real login-form submission |
| **Runtime** | hook interfaces without credentials, using mock responses to get the SPA into the post-login shell | flows that require a real backend session to continue |

### Credential-less dynamic analysis (Phase 3 default)

1. Via `preload.js` / `runtime_harvest.js`, **intercept and stub** the login, permission, menu, and other bootstrap interfaces;
2. For business-query interfaces, return a mock body that is **structurally correct, with a successful business code, and whose data may be empty**;
3. Make the frontend still render post-login pages without a backend or in a 401 environment, thereby triggering more XHR/fetch/WebSocket;
4. **Empty data, blank tables, and placeholder UI are all expected** — do not turn to a real login or vulnerability testing for this.

**In one sentence**: use mocks to prop open the frontend routes and component mounting, and **only record outbound requests**; what the backend returns does not matter, what matters is **which interfaces the frontend still calls**.

### Hard flow prohibitions

| Forbidden | Alternative |
|---|---|
| grep/curl/Read the main entry `index-*.js` to extract API paths before Phase 1 completes | run `OUTDIR/harvest_static.py` |
| hand-writing scripts like `extract_apis.py` that replace harvest | edit `OUTDIR/harvest_static.py` and re-run |
| repeating the same grep/command after it fails ≥2 times | change strategy: read tool_logs, edit harvest, check the reference |
| skipping gates A/B and running the original `scripts/` directly | copy into OUTDIR and modify for the target |
| real username/password, OTP, OAuth, or other auth | stub/mock (see above) |
| skipping the stub to "get real data" and doing privilege-escalation/injection testing | only record outbound; that is the recon boundary |
| irreversible operations like delete, exporting sensitive data, bulk writes | the same applies to coverage clicks |
| claiming all pages and interfaces have been obtained without completing runtime + dynamic enumeration | see "Definition of done" or note the limitation |
| claiming all parameters are mastered without completing the parameter-trigger matrix + diff | Phase 3b matrix + Phase 5 diff |
| inferring required/optional from a single runtime sample | multi-sample diff, or validation rules / error back-inference |

---

## Two-layer model + run modes

| Layer | Output | Upper bound |
|---|---|---|
| **Static** (JS bundle) | full set of endpoint paths, route draft, request-assembly field candidates | no HTTP method; parameters need Phase 1b; misses runtime-concatenated URLs |
| **Runtime** (live session) | method + body + response + dynamic URL + WS/SSE; multi-sample diff to complete parameters | the page must actually render for a request to be sent; a single sample is insufficient to decide required/optional |

| Run mode | Engine | Suitable for |
|---|---|---|
| **depth** | `runtime_harvest.js` (Puppeteer) | API inventory, METHOD/params/response body, WS/SSE, reproducible batch runs |
| **coverage** | browser + `preload.js` | clicking Tabs/dialogs/tables, deeper feature-point coverage |
| **both** | depth first then coverage | most complete, longest-running |

**Parameter methodology** (no generic script): use harvest/regex for paths; for parameters use **anchor window-expansion + UI binding chain + multi-sample diff + error back-inference** (grep recipes in [reference.md](reference.md), section J).

---

## Definition of done

Recon may be claimed complete only when all of the following are satisfied:

- [ ] **Static**: Phase 1 harvest produced `api_static.txt`, `routes.txt`, `js/`
- [ ] **Runtime**: at least one of depth or coverage; coverage/both requires **Hook in effect + dynamic-enumeration loop**
- [ ] **In the shell**: visiting a business path is not `/login` (watch for hash routing)
- [ ] **Parameters**: coverage/both completed the parameter-trigger matrix + `param_samples.json`; Phase 5 merged `params_merged.json`
- [ ] **Depth** (if a module page is blank): Phase 4 permission-tree reconstruction and re-run, until **module-level APIs** appear (not just locale/bootstrap)
- [ ] **Delivery**: Phase 5 outputs complete (see the Phase 5 output table); `insert_assets` wrote the service and endpoint assets

---

## Scripts and gates

`scripts/` are reference templates only; running the original directly and treating it as the final result is **forbidden**.

**Rule**: read first → modify for the target → write into `OUTDIR` (e.g. `recon/`) → record `CHANGES.md`; if it does not match, rewrite per the methodology, borrowing only the structure.

| Gate | When | Reference script → OUTDIR copy | Common must-change items |
|---|---|---|---|
| **A (static)** | after Phase 0, before the **first** harvest/spider run | `harvest_static.py` / `spider_mpa.py` | **most sites run with the default regex as-is**; only when the manifest/dialect does not match, change the endpoint regex, webpack/Vite `publicPath`, MPA exclude/cookie |
| **B (runtime)** | after Phase 2, before the depth/coverage run | `runtime_harvest.js` / `preload.js` + `config.json` | Cookie/localStorage keys, neutralize success value, stubs, login regex, api prefix, hash/history |

**SPA mandatory order** (not interchangeable; the Phase numbering takes priority over "explore first then script"):

| Step | Must | Forbidden |
|---|---|---|
| after Phase 0 completes | next Bash = `python3 OUTDIR/harvest_static.py <URL> OUTDIR` | curl/grep/Read the main entry `index-*.js` (usually >500KB) |
| Gate A | copy script → small edits as needed → **run immediately** | manually extract APIs first, then decide whether to harvest |
| before Phase 1 completes | `wc -l` to verify output; on 404, edit harvest and retry | hand-write an extract script; repeatedly grep a URL that was not downloaded |
| from Phase 1b | grep only `OUTDIR/js/*.js` | use the main bundle instead of harvest |

- ✅ copy `harvest_static.py` → (optionally) change the regex → **run immediately**
- ❌ curl the main bundle → grep multiple times → write a temp extract → harvest only at the end
- **MPA**: after Phase 0, the next Bash = `python3 OUTDIR/spider_mpa.py ...`

---

## Tool and output constraints

| Constraint | Description |
|---|---|
| large files | `index-*.js` >100KB must **not** be Read/grepped into context; batch-process with OUTDIR scripts |
| grep output | must use `\| head -20` or `-m 5`; the conversation keeps only a path summary, do not paste bundle fragments |
| verification | use `wc -l`, `ls \| wc -l`; do not Read a whole directory |
| regex initial probe | optional, ≤1 time, only a ≤50KB small chunk or HTML; the formal static result follows harvest |
| reference | recipes/templates/troubleshooting are in [reference.md](reference.md); do not repeat the full text inline |

---

## Execution roadmap

```
Phase 0 classify + OUTDIR
  → Gate A → Phase 1 harvest (★ run immediately ★)
  → Phase 1b parameter reversing
  → Phase 2 three auth gates → config.json
  → Gate B → Phase 3 runtime + parameter matrix
  → Phase 4 permission tree (when necessary) → re-run Phase 3
  → Phase 5 merge report + insert_assets bulk-inserts all discovered service and endpoint API assets; in any case no discovered asset may be omitted on insert
```

Check off in order; **you must not enter the next Phase until the previous item is complete**.

1. [ ] **Phase 0**: initial SPA/MPA probe; create `OUTDIR` → [Phase 0](#phase-0--classification)
2. [ ] **Gate A + Phase 1**: copy script → harvest **immediately** → `wc -l` verify → [Phase 1](#phase-1--static)
3. [ ] **Phase 1b**: anchor window-expansion + binding layer → `param_candidates.json` → [Phase 1b](#phase-1b--parameter-reversing)
4. [ ] **Phase 2**: three auth gates → `config.json` → [Phase 2](#phase-2--three-auth-gates)
5. [ ] **Gate B**: adjust the runtime script → [Phase 3](#phase-3--runtime)
6. [ ] **Phase 3**: depth / coverage / both; confirm in the shell; parameter-trigger matrix → `param_samples.json`
7. [ ] **Phase 4** (if needed): permission tree → patch stubs → re-run Phase 3 → [Phase 4](#phase-4--permission-tree-reconstruction)
8. [ ] **Phase 5**: merge outputs + report + `insert_assets` → [Phase 5](#phase-5--merge-and-report)

---

## Phase 0 — Classification

Fetch the entry HTML and **create `OUTDIR`** (do not modify `scripts/` inside the skill):

- **SPA**: empty shell + `<div id=app>` + chunk → Phase 1–5
- **MPA**: SSR + `<form>`, no endpoint bundle → after Gate A:

```bash
python3 recon/spider_mpa.py <BASE_URL> <OUTDIR> [--cookie "session=..."] [--max 300] [--depth 5] [--exclude "logout|delete|destroy"]
```

Produces `forms.txt`, `links.txt`, `api_inline.txt`. For an SPA, if forms ≈ 0 → switch to Phase 1.

---

## Phase 1 — Static

Follow [Scripts and gates](#scripts-and-gates) · [Tool and output constraints](#tool-and-output-constraints).

```bash
python3 recon/harvest_static.py <BASE_URL> <OUTDIR>
```

harvest: parse HTML script → webpack/Vite manifest → download all lazy chunks → produce `js/`, `api_static.txt`, `routes.txt`, `chunkmap.txt`.

```bash
wc -l OUTDIR/api_static.txt OUTDIR/routes.txt
ls OUTDIR/js | wc -l
```

- chunk count vs manifest: on 404 you must edit harvest and retry, do not manually curl chunks one by one
- `api_static.txt` too small → relax the endpoint regex inside OUTDIR and re-run (see reference)

### Phase 1b — Parameter reversing

Paths come from Phase 1; parameter fields need separate recon. grep rules are in [Tool and output constraints](#tool-and-output-constraints).

**Completion criterion**: for important interfaces you can answer — field name, transport location, type inference, whether required, sample value, confidence.

#### 1b.0 — Transport form

| Form | Where the parameters are | Static priority to look at |
|---|---|---|
| REST JSON | body + query | `(params\|data\|body)\s*:\s*\{` next to the path anchor |
| GraphQL | `variables` | gql template, `$page: Int` |
| traditional form | urlencoded | `<form>`, `FormData` |
| file upload | multipart | `FormData.append` |
| path parameter | `/user/:id` | route table + `useParams` / `$route.params` |
| encrypted/signed | wrapped in `sign`/`data` | Hook the encryption function's arguments (reference section D) |

Output: annotate each interface with `transport: query|json|form|graphql|encrypted`.

#### 1b.1 — Anchor window-expansion

Anchor on a known path and expand the window to find the assembly object:

```bash
grep -n '"/api/user/list"' OUTDIR/js/*.js | head -20
grep -rhoaE '.{0,120}("/api[^"]+").{0,200}' OUTDIR/js/*.js | head -20
grep -rhoaE '(params|data|body|payload)\s*:\s*\{' OUTDIR/js/*.js | head -20
```

| Wrapper layer | Parameter clue |
|---|---|
| axios instance | `data` / `params` |
| unified request | interceptor injects global fields |
| OpenAPI client | generated method signature |
| React Query / SWR | hook second argument |
| Vue composable | composable arguments |

Type residue: `yup`/`zod`/rules, `Form.Item name=`, embedded Swagger.

→ `param_candidates.json`: `{ path, fields[], source: "static-callsite", confidence }`

#### 1b.2 — Binding layer

```
Form field → onFinish/handleSubmit → transform → API payload
```

| Binding source | Technique |
|---|---|
| form submit | follow submit → transform → API |
| table search | `getFieldsValue()` → `params` |
| route | `:id` / `?tab=` |
| interceptor | global `tenantId`, pagination, sign |
| enum select | `options` → API enum value |

From the DevTools call stack, trace upward from `fetch`/`XHR.send` to the assembly function.

#### 1b.3 — Three assembly questions (≠ the Phase 2 three auth gates)

| Question | What to answer |
|---|---|
| **Assembly** | where the payload is built, transform traces |
| **Validation** | required, pattern, enum |
| **Transport** | path / query / body / multipart / header |

The interceptor gate (Phase 2) incidentally reads the globally injected fields (Authorization, `X-Tenant-Id`, sign).

#### 1b.4 — Handoff to Phase 3

Candidate fields come from the static/binding layer; **required/optional/conditional dependencies** need the Phase 3 parameter matrix + diff + Phase 5 error back-inference.

---

## Phase 2 — Three auth gates

grep in `OUTDIR/js/` (with `head`), and write into `config.json` (recipes in the reference):

| Gate | Question | Keywords |
|---|---|---|
| **Render gate** | how is being-logged-in determined? | `isLogin`, `getToken`, Cookie/localStorage |
| **Interceptor gate** | what triggers a jump to `/login`? | `response_code`, `errno`, axios interceptor |
| **Content gate** | where do the menu/permissions come from? | `menu`, `permission`, `role`, `acl`, `routes` |

Do not treat a localStorage key name as a credential — it must be confirmed from the chunk/request chain.

**Exit = Gate B**: the conclusions land in `config.json`, and edit `OUTDIR/runtime_harvest.js` / `preload.js`.

### Phase 2b — API observation (optional)

Use `preload.js` inside OUTDIR to confirm the session key name, Authorization, and nested API URLs:

| Config | Output |
|---|---|
| `recordDetail: true` | `__API_RECON_DETAIL__` |
| `observe.xhrHeaders: true` | headers observation |
| `extractUrlsFromResponse: true` | sub-APIs inside responses |
| `observe.storageReads/cookieReads: true` | backfill config |
| `neutralizeVueRouter: true` | `__API_RECON_ROUTES__` |

coverage exports each round: `__API_RECON_LOG__`, `__API_RECON_DETAIL__`, `__API_RECON_ROUTES__`, `__API_RECON_OBSERVE__`.

---

## Phase 3 — Runtime

Must have passed Gate B; follow [Boundaries and prohibitions](#boundaries-and-prohibitions-agent-must-read--violation-is-out-of-scope) · the credential-less mock strategy.

In `config.json` set `"runtimeMode": "depth" | "coverage" | "both"` (template in the reference).

### Hook and stub (shared by depth + coverage)

| Layer | Scope | Purpose |
|---|---|---|
| L1 precise | auth/permission/bootstrap stub | pass first-screen auth |
| L2 negative correction | all JSON responses | not-logged-in code → success |
| L3 fallback | `/api` etc. not hit by L1 | empty success body, prop open the UI |

- **depth**: fake auth + `forward` to change the business code + `stubs`; traverse `routes` (hash/history); produce `runtime_api.json`
- **coverage**: inject `preload.js` at **document-start** (CDP `addScriptToEvaluateOnNewDocument` or a Userscript)

Verify: `window.__API_RECON_PRELOAD__` exists; a business path does not return `/login`.

```bash
cd recon && npm install
node runtime_harvest.js config.json
```

### 3b — coverage dynamic enumeration (mandatory)

1. Main navigation/sidebar — click each item, wait 1–3s for the network
2. Tabs — `role=tab`, `.ant-tabs-tab`
3. Table — view/edit/detail of the first row
4. Toolbar — export, filter, new (**avoid irreversible deletes**)
5. On entering each module — merge APIs/routes
6. SPA — controlled `pushState` for paths not covered in `routes.txt` (forbidden for MPA)

**Parameter-trigger matrix** (mandatory): record once per operation type per module, and **diff multiple samples**:

| Operation | Parameters usually added |
|---|---|
| list first screen | pagination + default filter |
| click search | keyword, filter |
| advanced filter | more optional |
| new/edit | complete entity |
| bulk/export/sort | `ids[]`, `exportType`, `sortField` |

**Under stub, the outbound body/headers are still real** — go by the request. Record → `scan_raw.json`, `param_samples.json`, `api_detail.json`.

- **Vue**: `neutralizeVueRouter: true` + document-start preload
- **React**: `routes.txt` + sidebar clicks + `pushState`
- **both**: 3a depth first, then 3b coverage

---

## Phase 4 — Permission-tree reconstruction

**Trigger**: a module page is blank / each route is only bootstrap (e.g. locale) → the content gate did not pass.

| Symptom | Meaning |
|---|---|
| in the shell successfully | render gate + interceptor gate passed |
| sidebar missing items / click is blank | stub shape or permission codes incomplete |
| the same, very few APIs per route | `v-if permission` not passed |
| `routes.txt` far fewer than the bundle | must be completed from the auth module |

```bash
grep -rhoaE '"/api[^"]*(permission|perm|role|menu|acl)[^"]*"' OUTDIR/js/*.js | sort -u | head -30
grep -rhoaE 'userRouteAuth|getResultTree|routeMap|routeLink|menuList|authList' OUTDIR/js/*.js | head -20
```

Typical chain: `role_permissions` (flat codes) + `permissions/all` (tree) → `getResultTree` → `userRouteAuth[CODE].url`.

```bash
python3 recon/extract_route_map.py recon/js recon/
python3 recon/build_perm_tree.py recon/js recon/ --config recon/config.json
```

Intermediate outputs: `route_map.json`, `userRouteAuth.json`, `permissions_tree.json`, `*_stub.json`, `perm_codes_all.txt`.

stub check: the outer `response_code` matches the interceptor gate; flat codes align with the tree; `routes` covers all links in `route_map`.

After updating `config.json`, **re-run Phase 3**. For a large SPA you can tune `waitUntil`, `routeTimeout`, `perRouteMs` (see reference sections A3/I).

---

## Phase 5 — Merge and report

### Output table

| File | Phase | Content |
|---|---|---|
| `js/`, `api_static.txt`, `routes.txt`, `chunkmap.txt` | 1 | static bundle and paths |
| `param_candidates.json` | 1b | static parameter-field candidates |
| `config.json` | 2 | three gates + runtime config |
| `runtime_api.json` | 3a | depth detailed recording (incl. WS/SSE) |
| `param_samples.json`, `scan_raw.json`, `api_detail.json` | 3b | multi-sample, click log, detail |
| `route_map.json` etc. | 4 | permission-tree intermediate files (if executed) |
| `params_merged.json` | 5 | merged parameter fields + confidence |
| `api_merged.txt` | 5 | `METHOD /path [params] [static\|runtime\|both]` |
| `site_map.json` | 5 | routes, APIs, params, feature points, limitations |
| **insert_assets** | 5 | write all service and endpoint assets into the asset store |

### 5b — Parameter merge

diff from `param_samples.json`, **no generic merge script**. Confidence rules are in reference J7 (high/medium/low/to-be-triggered).

### 5c — Error back-inference

Within the authorized scope, you may send an incomplete request to read a 400 (**this is parameter recon, not vulnerability testing**): `field 'x' is required`, enum errors, etc. Watch for the `data` wrapper, `variables`, and the pre-encryption `bizData`.

The report must note: runtimeMode, the static/runtime API counts, parameter confidence, uncovered modules, and a `CHANGES.md` summary relative to the reference scripts.

Suggested `site_map.json` structure:

```json
{
  "site": "https://example.com",
  "runtimeMode": "both",
  "appType": "vue-spa",
  "routeGuardStrategy": ["nav-neutralize", "L1-auth", "L2-patch", "forward"],
  "apisFromStatic": [],
  "apisFromRuntime": [],
  "apis": [],
  "params": [{ "method": "POST", "path": "/api/user/list", "transport": "json", "fields": [] }],
  "frontendRoutes": [],
  "routesVerifiedByClick": [],
  "featuresTriggered": [],
  "limitations": ""
}
```

More fields and grep recipes are in [reference.md](reference.md).

---

## General notes

- **Framework-agnostic**: the method is the same for webpack/Vite/Angular lazy load
- **Transport**: REST/JSON, GraphQL, WebSocket, SSE; gRPC-web is out of scope
- **SSR**: client-side fetch can be recorded; RSC/Server Actions are not fully enumerable
- **Blind spots**: JSVMP, WASM, strong HMAC/mTLS validation → static + note the limitation
- **Parameter blind spots**: conditional linkage, hidden params, WASM assembly → "to be triggered" / "unreachable"
- **Static is the safety net**: when runtime is blocked, static can still enumerate endpoints

---

## Additional resources

- Grep recipes, `config.json` template, troubleshooting, Hook, parameter-reversing section J, site_map template: **[reference.md](reference.md)**
- Reference-script paths are in the [Scripts and gates](#scripts-and-gates) table
