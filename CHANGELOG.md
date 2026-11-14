# Changelog

Important changes to this project are recorded in this file, in a format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.3.15] - 2026-10-07

### Interception

#### Added

- **Added a built-in interception rule "delete-type interface paths"**: the previously built-in HTTP destructive rule only recognized the DELETE **method**, whereas most applications' delete interfaces can be triggered with GET/POST, so a call like `curl 'http://t/api/user/delete?id=1'` would really delete the target data. A `deny` rule has now been added covering `/delete /del /remove /unlink /erase /destroy` (the verb must be followed by a separator, so `/delivery`, `/details`, `/delta` are not falsely intercepted). Existing instances also get it after upgrading, and it can be disabled or deleted under "System → Command interception".
- **The token consumption of model-fallback approval can be viewed separately**: approval calls previously had no independent metering attribution, so how much they cost could only be guessed. Now it is metered separately, and a usage card has been added beneath the "Model-fallback approval" toggle in "System → Command interception" — the five cumulative statistics of call count, input, output, and cache read/write, plus a mini bar chart of daily consumption over the last 30 days.

### Vulnerability push

#### Added

- **Finding discovery supports pushing to IM**: a new "System → Notification push" page lets you push scan findings to six kinds of channels — **DingTalk, Feishu, WeCom, generic Webhook, Telegram, and email**. The same type can have any number of instances configured, each with independent enable/disable, rate limiting, and filter rules.
- **Push timing has two modes, real-time and digest**: real-time mode sends one by one as soon as a match is hit; digest mode merges into a single message on a global cycle (default 30 minutes), leading with the number added and the level distribution. To do "high-risk real-time, the rest digest", create two channels and configure them separately.
- **Filter rules support four dimensions**: minimum severity level, restricting the task / asset scope, inclusion and exclusion of vulnerability-type keywords (exclusion takes priority), and whether to receive disposition-status changes (off by default). Messages carry a "View detail" button, whose target address is set by the global "Back-link address"; leaving it empty omits the button.
- **Delivery history and manual resend**: lists each delivery's status, attempt count, failure reason, and owning channel, filterable by channel and status; failed items can be resent with one click (resend resets the retry count).
- **Masked echo of channel credentials**: the Webhook address, signing secret, Bot Token, SMTP password, etc. are echoed only as masked values with a suffix hint; submitting them unchanged means "do not modify", and clearing the input box deletes that field.

#### Fixed

> This section is the conclusion of a security audit round after the feature's first version was completed; each item was first reproduced, then fixed, then backed by a regression test.

- **Fixed a mask bypass via "change the target address, keep the credentials" (critical)**: config merging kept the existing DB value for any "key not mentioned", so by changing only the address and saying nothing about the credentials, you could make the server send the real credentials from the DB to an arbitrary address, completely silently. Now, once the target address changes, every credential field must make an explicit statement — give a new value, or explicitly leave it empty to say it is no longer needed.
- **Fixed zero-escaping of untrusted content in the markdown-family channels**: vulnerability titles and summaries come from model output and asset URLs come from scan results, so a crafted title would render as a clickable external link in DingTalk / WeCom / Feishu, and image syntax would be fetched by the client at render time and leak the reader's IP. Now there is uniform single-lining + markdown metacharacter escaping, and the escaping happens at each channel's render exit rather than in the shared title function.
- **Fixed the SSRF surface of the delivery address**: previously loopback, intranet, and cloud-metadata addresses could all be delivered to, and the first 200 bytes of a failed response body would enter `last_error` and be echoed in the delivery history, constituting a semi-blind read primitive. The defense is now set at the **dial stage**, covering DNS rebinding and rejecting cross-host redirects; loopback and link-local addresses require explicitly setting `CYFIND_NOTIFY_ALLOW_LOCAL=1`, while RFC1918 private networks are still allowed (a self-hosted intranet SMTP relay is very common).
- **Fixed push credentials leaking through error messages**: DingTalk's `access_token`, WeCom's `key`, and Telegram's bot token are all in the URL, and on delivery failure the full URL flowed into four places — `last_error`, the delivery history, the server log, and the frontend prompt. They are now uniformly redacted, keeping only `scheme://host` and the underlying reason.
- **Fixed silent loss caused by marking the whole batch as delivered after a digest message was truncated**: the truncated-off vulnerabilities were neither in the message nor in the failure list, yet the delivery history showed success. It now packs by **whole item**, marking only those that fit into this message, with the rest returned to the queue to continue in the next message without consuming a retry, and the message header states how many more will continue in the next one.
- **Fixed a typo in the minimum-level threshold silently disabling the filter**: when `min_severity` was a typo like `hgih`, the unknown level's ordinal was 0 and the check degenerated to always-true, so the user thought they were only receiving high-risk but in fact every vulnerability was flooded into the group. The value is now validated on the write path with the allowed values listed.
- **Fixed `rate_per_min = 0` (no rate limit) being unreachable**: the DB-write layer silently changed an explicit 0 to the default, so the operator thought they had removed the rate limit but was still throttled. The default is now applied at the interface layer when the field is absent.
- **Fixed digest channels completely bypassing the token bucket**: `rate_per_min` previously had no effect on digest mode. Now the number of items claimed is constrained by both the per-round quota and the in-memory upper bound.
- **Fixed failure disposition being judged by the whole batch's max attempt count, letting an old delivery implicate a new one**: an old delivery already retried twice would drag a brand-new delivery in the same batch into failed, so a new vulnerability was permanently lost without using even one retry. The decision is now made per item.
- **Fixed deliveries whose snapshot cannot be parsed in a digest batch being silently marked as successful**: such entries are skipped at the render stage yet counted as successful along with the whole batch. They are now explicitly judged as failed with a reason given.
- **Fixed a single channel's per-round delivery count possibly exceeding the lease duration**: in a multi-instance deployment, a row whose lease had expired would be re-claimed, re-sent, and double-increment the attempt count. The per-round cap is now derived backward from "lease / single-run timeout", with an assertion pinning down the relationship among these constants.
- **Fixed Telegram truncation possibly cutting off an HTML entity**: truncation only avoided a half tag, not an entity fragment like `&amp`, and the parser could therefore reject the **whole** message. Now both are avoided.
- **Fixed the email channel judging a transient SMTP failure as permanent**: 4xx codes like greylist `450` are a temporary rejection that should be retried later, but were previously all judged as dead, so a server with greylisting enabled would make every push fail after the first attempt. It is now distinguished by the first digit of the reply code: 4xx is retryable, 5xx is a permanent failure.
- **Fixed the mask literal actually being written to the DB when submitting a nested structure**: an object field like `webhook.headers` can only be masked as a whole or submitted as a whole, so stuffing the mask sentinel inside the object would store it as a real value and silently break authentication. Such a submission is now explicitly rejected.

#### Design notes

- **The transaction that writes a vulnerability does only one blind INSERT**: `notification_events` and the vulnerability are written in the same transaction, so a commit guarantees the two are atomically consistent. This INSERT deliberately does not read the channel table and does not run the user's filter rules, and it is wrapped by a `SAVEPOINT` — otherwise one misconfigured filter condition could abort the transaction and prevent a high-risk vulnerability from being stored.
- **Delivery uses lease-based claiming rather than a long transaction**: after claiming with `FOR UPDATE SKIP LOCKED`, the row is set to `sending` and `next_attempt_at` is pushed into the future as a lease, and no database lock is held during delivery; a row left by a crashed process is re-claimed after the lease expires, self-healing without infinite retries.
- **Rate limiting does not consume the retry budget**: the per-round quota is computed by the token bucket first, then that many are claimed. Reversing the order would have a rate-limited delivery wastefully count an attempt, and after the three-retry budget is exhausted by pure waiting it would fall into failed.

### Test infrastructure

#### Fixed

- **Fixed permanent asset residue caused by the cleanup order in the company-ICP-ownership test case**: `defer d.Close()` runs first on function return and `t.Cleanup` runs after it, so all cleanup statements landed on an already-closed connection and the errors were discarded, leaving the test assets and company permanently in the DB and also mysteriously failing other cases that assert on asset counts. It now closes the connection via `t.Cleanup` too, registered first, and makes a cleanup failure visible.

### Traffic

#### Added

- **The traffic list supports content search, path / status-code / length filtering, and column sorting**: the filter row supports filtering by **response content** (using a full-text index), **path**, **status code** (exact value or a bucket like `2xx`), and **response-length range**, the header can sort by time, status code, and response length, and the sort preference is remembered locally. Two indexes were added and take effect automatically after an existing instance upgrades; the Agent tool's query contract is unchanged.
- **The traffic list adds "Clear all"**: deletes all traffic records at once (ignoring the current filter) and cleans up historical host directories no longer recorded by the index; after clearing it also does a full compaction and reports how much space was actually freed. Traffic evidence already bound to a vulnerability lives in a separate evidence store and is unaffected.

#### Fixed

- **Fixed disk space not being freed after deleting traffic**: the index database did not enable `auto_vacuum` at creation, so the file never shrank; the full-text index was also `contentless_delete`, so `DELETE` only wrote a tombstone without reclaiming the original postings — deleting traffic actually made the index larger (measured: capturing 6MB of body → a 16MB index, still 16MB after deleting everything). Now a newly created index database enables `auto_vacuum=incremental`, and after each delete it performs full-text index merging and incremental reclamation in chunks in the background, gradually returning space to the system (the same scenario drops back to 104KB); reclamation releases the write lock between chunks and does not block traffic recording.

> Upgrade note: `auto_vacuum` can only be set at database creation, so an **existing instance's index database is still in the old mode**, where incremental reclamation is a no-op (a hint line is printed at startup). For such a database, the tombstone growth has stopped after upgrading, and the already-occupied size can be reclaimed once with "Clear all" — that step converts the database to incremental-reclamation mode, after which day-to-day deletions take effect on their own.

### LLM

#### Fixed

- **Fixed the custom session header not taking effect on the "one-shot LLM call" path**: goal decomposition (round 0) and cold-node compaction are both one-shot calls that do not attach a transcript store, so there is no session id on the context and the gateway cannot read the header — for an endpoint like opencode zen that returns a direct 400 on a missing header, this manifested as "round 0 fails while the subsequent planner rounds are completely fine". These two paths now explicitly attach an exploration-stable session id, and incidentally let the token usage be correctly attributed to the corresponding exploration (previously not recorded at all).

### Tools

#### Fixed

- **Fixed output truncation not taking effect for MCP and custom tools, with large results flooding the whole context**: an MCP tool's return was previously not truncated at all, while an HTTP-type custom tool, given an empty tool context, always used the hardcoded 6000 characters rather than the session-configured cap. Both paths now go through `actool.Capture`: truncated by the session's `MaxOutputChars` (default 30000), and when `ToolOutputDir` is configured, the full output overflows to disk and the message keeps only a leading snippet plus a file pointer.
- **Upgraded norma to v0.4.3**: the harness layer uniformly runs `CaptureOnce`, so no tool (including any added in the future) will flood the context by missing truncation.

### Deployment

#### Fixed

- **Fixed the activity stream being unreachable in a reverse-proxy deployment**: the SSE address was previously unconditionally built as `${hostname}:8787`, so in a deployment reverse-proxied to 443, the page loaded from `https://domain/` but SSE was pointed at port 8787 which is not exposed publicly, manifesting as the activity stream repeatedly reconnecting. It is now distinguished by `NODE_ENV`: production defaults to same-origin, and only `next dev` keeps `:8787` to bypass Next.js's buffering of SSE; the `NEXT_PUBLIC_SSE_BASE` override is kept. The README adds a reverse-proxy deployment note.

### Findings

#### Fixed

- **Fixed the "by asset" view's asset list having no scrollbar after overflow**: the outer card only gave a `max-height` without a definite height, so the scroll viewport's percentage height could not be resolved, and with many assets the list would either burst the card or be truncated and unscrollable. The height cap is now applied directly to the asset tree's native scroll container, adapting to the window height.

### Database

#### Fixed

- **Set an upper bound on the connection pool**: `database/sql` by default does not limit the number of connections the application itself can open, and when there is no idle connection in the pool it unconditionally creates a new one, all the way up to PostgreSQL's `max_connections` (default 100) before being rejected. It is now capped at 32, with over-quota queries waiting for an idle connection, so under the same load it manifests as slowness rather than an error; if `max_connections` is lowered, this should be lowered in sync.
- **Improved connection reuse**: `MaxIdleConns` defaults to 2, so with concurrency over 2 a connection is closed as soon as it is used, and the next request must redo the TCP and PostgreSQL authentication handshake. The idle cap is now raised to match the total cap, with a 30-minute connection lifetime and a 5-minute idle eviction added, so the pool can naturally replace long-lived bad connections.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.14] - 2026-09-24

### Task list

#### Added

- **The task list adds a "Vulnerabilities" column**: shows the counts of critical / high / medium / low by severity tier, with non-zero tiers colored by severity, so you can see each task's vulnerability scale and distribution at a glance.

#### Changed

- **The "Description / Goal" columns are narrower**: overly long content is shown truncated, with the full text on hover, to reduce long text taking over the list's horizontal space.

### Exploration graph and planning-situation overview

#### Changed

- **Streamlined the planning-situation overview (graph_overview) and set count caps on each list**: recent facts, finished intents, pending intents, cold-region summaries, and confirmed-vulnerability details are all changed to "latest window + count fallback", with the undisplayed ones queryable on demand; this significantly reduces the per-round LLM context size and avoids context bloat in long tasks (the cold region of an associated task's overview is rate-limited along with it).

#### Fixed

- **After folding cold nodes, eliminated the reverse duplicate edge between digest and finding in the exploration graph**.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.13] - 2026-09-19

### Asset interception

#### Added

- **Added global asset-interception rules (blacklist)**: supports entering exact and fuzzy-match domains / IPs / URLs as well as CIDR ranges, with create/read/update/delete and enable/disable of rules, and a management page at "System → Asset interception"; by default it includes fuzzy interception of government (`.gov` / `.gov.cn`) and education (`.edu` / `.edu.cn`) sites.
- **Asset interception is wired into the execution chain**: before an Agent dispatches an intent (`add_intent`) or inserts an asset (`insert_assets`), it first makes an interception decision on the target asset — an intercepted intent is not dispatched, an intercepted asset is not inserted, and the asset info and interception reason are returned to the Agent.
- **Added task-level interception / allow (whitelist) rules**: independent of the global rules and effective only for this task, with the decision order "intercept first, then allow" — a match on interception forbids it; if there is no interception match but this task has allow rules configured and none match, then "testing not allowed"; when no allow rules are configured, the whitelist is not enabled. These can be entered when creating a task, and also created/edited/enabled/disabled in the task detail's "Overview".
- **Task templates support preset categories and task-level interception/allow rules**: a template can save a task category and a set of task-level rules, which are carried into the new-task form when the template is applied.

### Operation review

#### Fixed

- **Tightened the model-judge output protocol to reduce false allows caused by truncation**: the decision comment cap was lowered from 500 to 120 Chinese characters and "output JSON only, with no preamble or code block" was enforced, to avoid a decision being unparseable after `MaxTokens` truncation and thus allowed by the model-failure policy (fail-open).

### Task archiving

#### Fixed

- **Archiving skips a symlink instead of failing the whole package**: the archive format end-to-end supports only regular files and directories, so previously any symlink in the working directory would fail the whole task archive; now the symlink is skipped and logged, and the rest of the files are archived normally (not following the link, not escaping the directory tree).

### Account and compliance

#### Added

- **Added a "Terms of use and disclaimer" dialog before login**: you must check agreement before you can log in.

### License and dependencies

#### Changed

- **The project adopts the AGPL-3.0 open-source license**, and the README's license and disclaimer notes are improved.
- **Upgraded norma to v0.4.1**.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.12] - 2026-09-17

### Exploration-lineage broadcast board

#### Added

- **The task detail page adds an "Exploration-lineage broadcast board"** (#144): presents the task's exploration nodes (start/goal/intent/fact/vulnerability/hint/compaction) in a timeline stream view, with filtering by type, keyword search, ascending/descending order, pagination, and auto-refresh; while on the "latest-first first page" it is the live slot, refreshing each round, and when you leave that slot it only accumulates an unread count without disturbing your current reading, with a one-click "N new broadcasts · back to latest" to return. Grouped by day, so even paging through a long task you can tell "which day this was".
- **Each broadcast-board row shows the node id** (#145), making it easy to cross-reference the exploration-lineage graph and locate a specific node.
- **A broadcast-board node's detail expansion shows upstream/downstream and anchored assets** (#147): expanding a broadcast shows that node's upstream (where it came from) / downstream (what it produced) relationships, and hovering a related entry pops up that node's card (type/status/source/time/summary/payload snippet); it also lists the assets that node anchors (type label + recognizable text). The related data is delivered along with the broadcast page, so expanding sends no extra request.
- **Broadcast-board search supports filtering by node id** (#150): the search box adds node-id matching beyond "content / source", so entering a plain number or the "#41" form shown in the UI precisely locates the corresponding node.

### Intent management

#### Added

- **Intent deletion supports two modes, "soft delete / hard delete"** (#149): pending, running, and paused intents can all be deleted, and a reason must be filled in on delete; the delete mode is chosen in the confirmation dialog.
  - **Soft delete (default)**: the intent is set to "deleted" with the reason recorded in a separate field, keeping the intent node and all its outputs and lineage.
  - **Hard delete**: physically removes this intent, as well as the exclusive descendant nodes "supported only by it" (cascading along the output / intent chain to the leaves), to avoid leaving orphaned data; the deleted intent's token metering is kept archived by original date; shared nodes (still referenced by other intents), goals, and task-root facts are all kept, and the hard-delete dialog shows the estimated number of cascade-affected nodes.

  Both modes notify the planner "this intent was deleted by the user + reason" and re-plan accordingly.

### Operation review

#### Added

- **Approval records support filtering by status and decision source** (#139): approval records can be filtered by approval status and decision source, to quickly locate target records.

#### Fixed

- **Pending approval requests are loaded independently of the history pagination** (#133): pending requests are no longer affected by the history list's pagination, so they remain fully visible while browsing history.

### Agent

#### Changed

- **The Worker role description is changed to a generic cybersecurity-platform wording** (#138).

#### Fixed

- **Fixed cold-node compaction never triggering**: the per-task planner is now wired to the Compactor; cold-node compaction (cold-digest) previously never ran because it was not wired in, and has now been restored.

### Chat

#### Added

- **Chat supports @-referencing records of multiple types, with scroll pagination** (#135): you can @-reference records of several types in chat, and the reference candidates support scroll-pagination loading.

#### Fixed

- **Long message bubbles are constrained within the conversation panel** (#137): overly long message bubbles no longer overflow the conversation area.
- **Fixed "missing upload file" when uploading a file before a new conversation is created**: the Composer's file selection snapshots the `FileList` into an array before clearing the input and then calls back; previously the draft state had to asynchronously create the conversation first, and on resuming execution the `FileList` live-bound to the input had already been cleared, so the upload lacked the file field and the backend returned 400.

### Traffic

#### Fixed

- **The traffic-recording proxy listens only on 127.0.0.1 by default** (#129, #130): avoids the default config exposing an open proxy on other network interfaces.

### Web

#### Fixed

- **Fixed the static-export build's task list page losing the global header**.
- **Completed the demo vulnerability-detail page's related-traffic mock, fixing a blank screen**.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@RuoJi6](https://github.com/RuoJi6)
- [@dingpotian](https://github.com/dingpotian)

## [0.3.11] - 2026-09-15

### Operation review

#### Added

- **Approval records support source location** (#125): clicking an approval record's "source" jumps back to the one tool execution that triggered that approval — opening the original full session, auto-paginating to the target position, expanding the command and result in place, and center-highlighting it in the scroll area, with the surrounding messages kept readable; auto-correction stops when the user scrolls manually. Across regular conversations, task Workers, the planner, and main-Agent segmented sessions, it locates precisely via the persisted `tool_use_id` and the task mapping (a new in-scope call-ID index), and on a missing, duplicate, or ambiguous association it explicitly notes this rather than jumping to another execution. When the session has been deleted or the task archived/record missing, it gives a clear notice.
- **Approval records support pagination** (#115).

#### Changed

- **Streamlined the model-review input** (#124, #125): the model-review (the LLM judge after rules miss) input is converged to a versioned JSON of "this one complete tool call + an explicitly selected brief background + the local working directory". The background takes only the real user message (the current user message of the chat / task main Agent), and the Worker no longer attaches an intent summary and also clears the background inherited from a parent Agent; the planner and auto-triggered sessions do not fabricate a user message. It no longer attaches the task description, goal, operation constraints, global exploration situation, call history, or the Worker's full intent — these are still used per original logic for Agent execution and independent session audit, just not entering the operation review. All decisions require outputting JSON with `decision`/`comment`, and the explanation must include "the actual operation, the consequence after success, the matched rule"; instructions in the arguments or background cannot change the review policy. A snapshot and fingerprint of the input actually sent to the model are saved, with old snapshots kept and version-labeled, and old input is not fabricated from current data.

#### Fixed

- **A model decision wrapped in a code block is no longer silently allowed** (#126): if the decision JSON returned by the model was wrapped in a ``` code block, previously the parse failure would be silently allowed via the model-failure policy; now the code fence is stripped before parsing, and only if parsing still fails is the configured failure policy applied.

### Agent

#### Added

- **Added experimental noa context compaction** (norma upgraded to v0.4.0): an experimental feature that can be enabled in system settings, off by default. When enabled, noa (model-driven context compaction) takes over context compaction for the four Agent kinds — main Agent, planner, Worker, chat — replacing the built-in compaction; the compaction originals are persistently archived, centralized under `<workDir>/noa/<session ID>/` (not scattered in each task directory), with a globally unique subdirectory per session ID. On a wiring failure it automatically falls back to the built-in compaction without interrupting a real task; the toggle is read once per run, so switching only affects runs started afterward.

#### Fixed

- **Exploration-graph tools refuse rather than crash on nil when there is no task context**: calling exploration-graph tools in a non-task context returns a clear error, instead of crashing on an empty-store dereference.

### MCP

#### Added

- **Support for legacy SSE MCP services** (#117): compatible with an MCP server that provides only the legacy SSE transport.

### Traffic

#### Fixed

- **Traffic search matches the recorded host port-aware** (#114): `traffic_search`'s host match now includes the port, avoiding cross-talk between same-host records on different ports.
- **A `traffic_search` description migration error no longer interrupts the subsequent reporter migration**: a single migration failure is isolated and does not affect subsequent migrations.

### Web

#### Changed

- **A divider is added between task re-test vulnerability options** (#122): a separator is added between re-test vulnerability selection items for better visual clarity.

#### Fixed

- **Fixed a full-page crash on the demo task-detail page**: in mock mode the task detail's "Sessions" tab fetches `GET /api/tasks/<id>/side-questions` (side-question history), but the mock handler had no such route, and the read fallback returned `[]` under "a path ending in s is a collection", making `data.items` `undefined`, so the side-question hook's `merge()` iterating over it threw `TypeError: t is not iterable`; this exception occurred inside `setItems`'s updater, deferred by React to the render phase and re-thrown, so the caller's `catch` could not catch it and the whole page was taken over by the error boundary showing "This page couldn't load". Now the mock handler explicitly returns empty side-question history, and `sideAPI.history` also normalizes the return value (any non-array `items` falls back to `[]`) as defense in depth.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@RuoJi6](https://github.com/RuoJi6)

## [0.3.10] - 2026-09-13

### Network

#### Added

- **Web search adds the DeepSeek official source**: it directly reuses the currently active LLM config. Its nature differs from the other three sources — DeepSeek has no directly callable search interface, search exists only inside its Anthropic-compatible interface (the `web_search_20250305` server-side tool) and is executed by the DeepSeek server. So it **only supports the DeepSeek official endpoint + the anthropic protocol** (an OpenAI-protocol endpoint rejects server-side tools outright), each search **additionally consumes one model call**, the request **does not go through the search-egress proxy**, and it is **not counted in traffic recording**, and the returned result has **only a title and link** (no summary, so when the body is needed it is fetched by WebFetch). The settings page states the above limitations but **does not do validation blocking** — whether they are met is for the user to confirm, and the "Test search" button can run one real verification.

### Agent

#### Added

- **The worker gains cross-work look-back ability**: added `search_all_worker_traces` (no need to know the intent_id first — globally search the hit steps by keyword across all works' execution processes in this task) and `get_worker_trace` (after locking onto a work, list its step stream, search in place by keyword, and fetch full content by step_id), for reusing observations that another work saw but did not write into a fact, avoiding duplicated effort.
- **`node_detail` is delegated to the worker**: together with the look-back tools above, once a worker has an intent_id / node id it can directly query that node's full detail.
- **A planning round triggered by `add_hint` is explicitly broadcast**: previously adding a hint only folded the hint into the situation overview and let the planner discover it; now one `add_hint` records a "the user added N strategic hints: …" trigger for the planner (a batch counts as one, not screen-flooding one by one), so the planner is explicitly told "this round was triggered by an added hint" and directly sees the hint content.

#### Changed

- **The global situation prompt is reworded to a "loosening" tone**: encourages divergent exploration and timely reporting of cross-intent leads, rather than converging too early.
- **Streamlined the worker-boundary wording**: an initial setback does not mean it has been fully explored; focus on "finishing the bypass techniques within this intent before concluding".
- `insert_assets` removes the per-asset `related` argument: its only effect was to decide whether to add this asset to the current task scope, and the value was not persisted (re-registering the same asset voids it, and the UI shows nothing about who was judged irrelevant), so in practice it only made the model do one extra judgment that could not be retained.
- **The test scope (`task_scope`) is no longer affected by the asset-coverage toggle**: `insert_assets`'s auto scope-admission (`source='auto'`) runs whether coverage is on or off, and `add_task_scope` is always provided to the planner / in-task main Agent / goal-decomposition Agent. The scope is the task's authorization boundary and the filter baseline for asset queries; the coverage toggle only decides whether to use it as the denominator for the metric, and should not decide whether to accumulate the scope itself. Previously turning off coverage disabled both the `auto`/`agent` write paths at once, leaving `task_scope` with only the rows manually added in the UI. `list_untested_assets` is still hidden when coverage is off (it is itself a pure coverage view).

#### Fixed

- **Fixed cross-talk of assets between tasks** (#59): `list_assets` previously hardcoded the task id to 0 and queried the entire shared asset store bare, and the model had no way to write a scope filter, so it treated other tasks' assets (especially IPs) as this task's target, skewing the testing direction. Now it only returns assets that fall within the test scope (`task_scope`) of [this task and directly associated tasks], matching by **ownership** rather than literal value: if the scope has a root domain, all subdomains/services/interfaces under it can be found; if it has a network segment, hosts and services within the segment can be found; fetching an out-of-scope asset by id likewise returns nothing. A non-task context (Auto/pentest) has no scope to rely on and still falls back to the whole store. It also fixes the ownership blind spot where an IP-direct host (e.g. `http://1.2.3.4/api`) could not be matched by a network-segment scope. The UI's "Test assets" view (filtered by task producer) is unaffected.
- **Fixed the worker's cross-work look-back tools being wrongly removed**: after `search_all_worker_traces` / `get_worker_trace` (and `node_detail`) were added to the worker's default tool set, an old "converge the worker tool surface" migration unbound them again at startup, so the worker could not actually get these tools. They have been moved out of that unbind list, and a one-time re-bind to the worker is applied to databases that already ran the old migration.
- **Fixed occasional store-failure of the `/btw` side question**: before the side_question checkpoint is persisted, the NUL (`\u0000`) escape that JSONB does not support is stripped, to avoid a write error for content containing that character.

### Triggers

#### Fixed

- **A merged trigger session dedups task descriptions/goals by task**: when triggering a merge of multiple tasks, the same task's description/goal is no longer concatenated into the message repeatedly, to avoid a long goal piling up and blowing out the context.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.9] - 2026-09-11

### Agent

#### Added

- The in-task main Agent supports **multiple sessions**: you can create, switch, and independently reset context, and each session is interactive.
- Support for a persistent `/btw` **side question**: ask follow-ups without interrupting the main line, with the Q&A persisted and still present after a restart.
- `spawn_task` adds `source_task_ids`, so a new task can **read-only inherit** a source task's assets and findings.

#### Changed

- Turned off the worker's cross-engagement memory and converged its default tool surface: reading context and cross-work review are planning responsibilities, and the worker only handles the execution and write-back of a single intent.
- Streamlined the worker's default prompt; `get_worker_output` removes the `terminated` and `worker_name` fields; streamlined the descriptions of `insert_assets` / `list_assets`.

#### Fixed

- Fixed works being interrupted early due to an **empty-turn round**: the model sometimes uses a whole round outputting only thinking, giving neither body nor a tool call, and at that point the harness sees a natural end (`end_turn` with no `tool_use`) and wraps up directly with `completed` + an empty summary — an intent not yet finished is cut off midway, manifesting as "the task ended normally but with no text summary at all". None of the five layers of LLM retry can reach it: it is not an error, the same-provider safe-window retry's entry point is "stream failure" and the circuit breaker judges `err == nil` as success outright, and intent re-run only recognizes `model_error`; the SDK's empty-response retry cannot reach it either, because that layer judges emptiness by "whether any event was yielded", and a thinking delta is itself an event. Now the work's Stop hook recognizes this kind of round and injects a continue-run instruction, letting the model continue the next step carrying the thinking it already produced — deliberately not choosing "resend as-is", because this kind of empty turn is usually determined by the prompt and context shape, a stable behavior rather than random flakiness, so resending would only make the model think again.
- The count reuses the **empty-response retry count** on the LLM page's "Retry and backoff" (both answer "the model finished but produced no substantive content", just with different criteria and means), default 2, where `-1` turns it off and reverts to the previous "empty turn = wrap up" behavior. It is a **total** cap for a single intent, not a consecutive count: the harness itself limits a consecutive empty turn to being pushed once, and the quota only refreshes when a real tool round has actually occurred, so this number guards against a loop like "tool → empty turn → push → tool → empty turn" exhausting the intent budget. On trigger the log records `[work <worker> · #<intent>] empty turn… injecting continue-run instruction (n/N)`. See `docs/LLM-retry-design.md` §1.1 for the design.
- Fixed the context budget and input layout of `/btw` under a long conversation; in a non-secure context (non-HTTPS access) it degrades the side-question request ID generation.

### Traffic

#### Added

- A vulnerability supports **associating multiple traffic-evidence entries**, which can be sorted, annotated, and distinguished by role (request/response/supporting).
- The report Agent **automatically associates** relevant traffic evidence before writing the report.
- Added an Agent **traffic-binding toggle**, and completed the handoff of evidence between Agents.

### Tasks

#### Added

- Support for **session-level vulnerability re-test**: a re-test runs in an independent Agent session, with the run status shown in the list and detail.

### Interception

#### Added

- Approval records add a **detail and execution audit**: you can view the tool-request context, the model/rule initial judgment, the execution output, and the argument fingerprint.

### Assets

#### Added

- Task test assets support **DSL search**.

### LLM

#### Fixed

- Fixed the test connection not re-sending the custom session header, causing opencode zen to return 400.

### Network

#### Added

- MCP's HTTP transport supports **skipping TLS certificate verification**, making it easier to connect to a service with a self-signed certificate.

### UI

#### Added

- The session list is grouped by Agent, with expand/collapse and independent pinning; conversations can be filtered by Agent.
- The attack-lineage graph renders compaction (digest) nodes and collapses their members.

#### Fixed

- Fixed a blank screen caused by login credentials being out of sync.
- The interception prompt text is changed to clearly indicate "platform governance", to avoid being misread as a defense on the target side.

### Deployment and updates

#### Added

- Support for **one-click update from the page**: the system-config page adds a "Version and update" card, and the top bar lights up a prompt when a new version is available. The flow is: download the release package → verify `SHA256SUMS` → smoke test → stage → exit, with the supervisor script relaunching to complete the swap, and the page auto-refreshing.
- Added the supervised start scripts `start.sh` / `start.bat` as the official launch entry point (included in both the release package and the Docker image, with `install.sh` unchanged); they decide whether to relaunch by exit code and forward SIGTERM to cyfind. The verification and swap logic is all in Go, keeping the scripts foolproof.
- Automatic failure fallback: if verification or the smoke test fails, discard and keep running the current version; if the new version fails to start 3 times in a row, roll back to the previous version. The settings page also has a manual rollback (note that the database schema is not rolled back).
- Updates only recognize GitHub domains and enforce HTTPS, and the release source is not configurable; development builds disable one-click update. GitHub query results are cached for 30 minutes to avoid the top-bar prompt exhausting the API quota.

#### Known limitations

- Under Docker, only the program is swapped, not the image: the toolchain is not upgraded along with it, and rebuilding the container reverts to the image-bundled version, so `docker compose pull cyfind` is still needed when required.
- The `skills/` in the release package are not synced, so a built-in skill newly added in a new version does not take effect automatically.
- An update means a restart, interrupting running tasks.

### Dependencies

#### Changed

- Upgraded norma to v0.3.7.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@RuoJi6](https://github.com/RuoJi6)

## [0.3.8] - 2026-09-09

### LLM

#### Added

- The LLM page adds a "Retry and backoff" tab: both the **count** and the **interval** of the five retry layers can be configured. A single model call's failure passes, from inner to outer, through connection-establishment retry (SDK, connection reset / timeout / 429 / 5xx before the stream begins), empty-response retry (SDK, a normal end with no content at all, openai format only), same-provider safe-window retry (stream-break replay before any output is delivered to the caller), poll circuit-breaking (cool down and skip after consecutive failures reach a threshold), and intent re-run (the whole intent re-runs after a worker ends with model_error) — five layers, where the outer is reached only after the inner is exhausted. Each layer has two knobs with uniform semantics: empty = use the original default count and exponential backoff; a count uses that count; an interval replaces the exponential backoff with a fixed interval; -1 turns off that retry layer. The first three layers follow the endpoint and can be overridden field by field in each model config over the global default (one that only pins the interval still inherits the global count); circuit-breaking and intent re-run are process-level semantics with only one global copy. Changes take effect hot after saving, with no restart needed. Leaving everything empty is the current behavior, and an old database is byte-for-byte unchanged after upgrading (the new columns default to 0, and an absent settings key means all defaults). The connection test deliberately omits these parameters — it has a 30s hard timeout, and layering the user-configured retries on top would only test a usable endpoint into a timeout failure. See `docs/LLM-retry-design.md` for the design.
- Each LLM config supports a custom **session header** (`session_header_key`): when non-empty, every LLM request carries that HTTP header, with the value being the current run's session id (a chat session is `conv-<id>`, a worker is `exp<x>-worker-i<intent>`, etc.), for gateways that do prompt caching / sticky routing by the session-id header. Implementation reads the session id from the request context and injects it, with no change to norma, so even the same shared provider can emit a different header value per session. An old database carries a migration, and the frontend LLM-config dialog adds an input field.

#### Fixed

- Fixed a `23502` error when saving an LLM config because the session-header field was empty: that column is `NOT NULL DEFAULT ''`, and previously a misapplied `NULLIF($n,'')` wrote an unfilled session header as NULL and triggered the not-null constraint; now it is passed with empty-string semantics.

### Agent

#### Added

- The wall-clock timeout is changed to **wrap up in place**: relying on norma v0.3.6, when `MaxDuration` is reached it interrupts the running tool and continues on the live ctx for the wrap-up rounds (writing back identified content + a summary, with a terminal state of timeout), no longer relying on the worker's/planner's own `maxDur+90s` external hard ctx to kill a stuck run outright into `aborted_tools`. Chat goes through the same harness and automatically gets the same behavior; mainagent has no `MaxDuration` and is unaffected.
- Stall fallback: when the planner wakes on a heartbeat / no-change wake-up and the whole graph has no open or running intent at all, its opening is changed to a stall alert, explicitly stating that no worker is running and no direction is queued, and that this round must produce one or more mutually non-duplicate new intents (it must not produce 0 intents).

#### Changed

- Worker prompt refactor: the intent / startup instruction / anchored-asset raw JSON are moved into the system prompt, re-assembled each round, never compacted away, and a continue-run also does not depend on the transcript's first message being retained; the startup user message is slimmed to just the global situation overview (which can be degraded and tolerate staleness). The cost is per-intent data mixed into system and losing cross-intent cache reuse, a deliberate trade-off for "do not lose the intent".
- Streamlined the planner / worker default body and corrected several real-world issues: the planner distinguishes `recent_done` by status (for blocked/exhausted, check the trace first before deciding, neither treating it as a dead end nor blindly re-running), treats a negative conclusion as "an observation / to be doubted, not a verdict" and looks at the evidence before accepting it, must produce when the goal is unmet and there is no open/running intent (a hard bottom line), and prefers depth over coverage; the worker writes a negative conclusion only as "observation + tentative reading", the verdict belongs to the planner, and cross-intent leads are written into a fact's summary for the planner rather than chased by itself. Reseed appends the new defaults as a new version and switches to it, keeping user customizations / old versions in history for rollback.
- Converged the work agent's default tool set and asset-write-back prompt: the worker is only responsible for the execution and write-back of a single intent, and reading context / cross-work review is a planning responsibility, so `list_facts` / `node_detail` / `list_companies` and the cross-work search (`search_all_worker_traces` / `list_worker_traces` / `get_worker_trace`) are removed from its default tools, leaving only `list_findings` (dedup before reporting a vulnerability) + `add_finding` / `record_fact` + `insert_assets` / `list_assets`; the prompt deletes stale field descriptions that conflicted with the `insert_assets` schema (`type=tech`/`on_url`/`props`). An old database carries a one-time migration to strip the corresponding bindings, and the same-named bindings of planner/main are left alone.

### Exploration graph

#### Added

- **Exploration-graph cold-node compaction (cold-digest)**: folds old, long-inactive intents / facts into digest nodes displayed in `graph_overview`, with the original nodes permanently kept and fully restorable by id (lossless storage, compacting only the presentation, foldable and reversible). Cold/hot judgment is by reverse reachability + "hot if any live branch", with R=6 rounds of debouncing and connected-component grouping; background compaction (minor folds uncovered cold blocks, major re-sources and re-compacts to merge fragments) carries an activeness recheck and cooldown mutex, never on the hot path and never overwriting a revived node. The overview side provides `cold_digests` and an asset-indexed `cold_index`, with `expand_digest` / `expand_index` doing the restoration. An associated / inherited task's overview likewise reuses its own folded view, and `expand_digest` supports cross-task read-only restoration. `expand_digest` / `expand_index` are given only to the planner and main agent, not the worker. All carry an old-database migration.
- `graph_overview` outputs `finding_list` in full: findings are the task's highest-value output and usually not many in a single task, so they are now carried out in full in the overview (unlike facts, which only give the recent window), letting the planner/worker see all confirmed vulnerabilities at a glance each round without calling `list_findings`. Each is streamlined to `{id, summary, evidence?, from_intent?, assets?}`, where the affected assets are given directly as readable content (url / domain / ip:port) rather than a bare id.

#### Changed

- `graph_overview` no longer flattens `hosts`: the coverage block removes the host list (in a large-scope task, carrying up to 500 host strings per round is of limited value to planning decisions), keeping only `host_count`, with specific hosts queried on demand via `list_assets`. Added a top-level `done_intents_total` (the total number of finished intents), parallel to the `recent_done_intents` truncated to ≤15, so the planner knows when deduping whether it was truncated.

### Tools

#### Changed

- `add_company_scope`'s default binding is changed from worker to planner: defining the enterprise asset scope is a responsibility of planning / main control / Auto, and the worker only performs exploration. A new database seeds the default binding to mainagent/planner/auto, and an old database carries a one-time migration.
- The planner binds `list_assets` by default: it now has both `list_assets` (DSL whole-store search) and `list_untested_assets` (untested within scope), with an old database back-filled one time, not overwriting a user's unbinding.

### Tasks

#### Added

- The task list adds a "Running Workers" column: counts the task's `state='running'` intent nodes, with the same criterion as the "Running Workers" in the task-detail overview, showing 0 when there is no running Worker.

### Network

#### Added

- Added a **global egress proxy** configuration: all target traffic can egress through a unified global proxy (http/https/socks5, with `user:pass` support). When traffic capture is on, it serves as the upstream of the MITM recording proxy (traffic is still recorded then egresses via the proxy, and both the intercept and passthrough paths go through the upstream without leaking the source IP); when capture is off, it is injected directly into the agent's bash environment and WebFetch (`proxyEnv` adds `ALL_PROXY` to support socks5). The config is stored in the settings KV table (no migration needed), the frontend system-config page adds a "Global proxy" card, independent of the web-search proxy and the LLM proxy.

### UI

#### Fixed

- Corrected the semantic errors of the intent-status labels: `exhausted` "exhausted" → "budget exhausted" (actually the step / time budget was cut off midway, writing back only partial results, not that the direction has been fully explored), `blocked` "blocked" → "execution error" (actually the model / API / network failed and retries were exhausted, with the intent essentially not actually explored, not that the target / WAF blocked it), and added the previously missing `stopped` "stopped" (a work the user manually stopped).

### Dependencies

#### Changed

- Upgraded norma to v0.3.4: MCP tool output adds truncation and disk spill (see `651b961`), and the subsequent v0.3.6 supports wall-clock wrap-up in place.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.7] - 2026-08-31

### LLM

#### Added

- The model config adds an "Output cap", and you can choose which request field name the cap uses: the cap limits how many tokens a single reply may generate at most, sent with every request, where 0 (default) = do not send the field and let the server default decide; it is distinct from the "context window" — the latter is the model's total capacity, used only locally to compute the compaction threshold and not appearing in the request. The field-name toggle is only meaningful for the `openai` (Chat Completions) format: empty (default) sends `max_tokens`, which the vast majority of compatible gateways recognize; OpenAI's official reasoning models (the o series / GPT-5) conversely recognize only `max_completion_tokens` and return `unsupported_parameter` on receiving `max_tokens`, so such endpoints need to be manually switched to the new field. The two formats each fix their field name (Anthropic is `max_tokens`, the Responses API is `max_output_tokens`), so for a non-openai format this toggle is grayed out and cleared on save. It also wires up a link that was never connected: the five places — planner / worker / chat / main Agent / goal decomposition — never set an output cap, so openai-family did not send it at all and Anthropic used the SDK's 8192 fallback, and merely adding the config item without wiring this line meant filling in a number had no effect; now the value is resolved per config each round like "streaming output", so it takes effect on the next round after a failover switch. An old database is completely unchanged after upgrading (the new column defaults to 0 and an empty field name).
- When clicking "Test" in the background, the status code and gateway raw response body of each HTTP attempt are logged to the server (the body truncated to 4K), to help diagnose 401, quota text, empty frames, an HTML page return, etc., rather than only seeing the UI-collapsed ok / err. This log does not depend on the "LLM recording" toggle.

#### Changed

- The task LLM config chain is changed to be editable in any state, no longer restricted to "running / paused / config chain exhausted": after a task ends (done / failed / timeout) the main Agent conversation still uses this chain, and when a model on the chain has a problem it previously could neither be changed nor continued. The terminal-state interception at both the backend HTTP and the DB transaction is removed together, and the frontend dialog opens editing and saving for terminal-state tasks too. When saving a terminal-state task, it no longer reopens the quota-blocked intents (those intents would be moved to open, with no worker to execute them and no longer meeting the "re-run intent" condition); to keep running, still use re-run intent / add a goal, which pull the task back to a running state.

### Agent

#### Changed

- "Sending a message to a running Worker to steer its direction" is changed to reuse the existing pause / resume + transcript resume mechanism, with behavior consistent with the main-Agent conversation: previously it went through a self-built intervention-persistence protocol that touched the scheduling barrier, the resume flow, and a dozen-odd activity-query filters. Now the message is injected via the next round's input, and the intent runs directly in a dedicated goroutine, free of the 3-slot worker-pool limit, running as soon as sent; the frontend keeps the message box and restores the "continue directly" button, with sending now carried over SSE. No DB schema change. Trade-offs: the message is kept in memory only with no crash recovery, and when sending a message the task may momentarily exceed concurrency by one worker (a low-frequency scenario, acceptable).

### Tasks

#### Fixed

- Fixed an out-of-memory (OOM) crash when archiving a large task: archiving is changed to stream the snapshot in, no longer reading the whole task into memory at once; it also completes three recovery gaps on the cold-archive path — a modern install's traffic is stored only in SQLite, and previously a crash between the PostgreSQL commit and the SQLite commit would strand an archived task's traffic in hot storage with no way to recover; now a staging log is written whether or not there is a history directory, and a missing `journal.json` is treated as discardable.
- Fixed system stutter when there are many tasks: there was a noticeable delay loading conversations and loading the UI. The queries for the task list, task context, and exploration records were optimized together, and the frontend's dashboard, conversation page, and task-detail page reduced duplicate requests in sync.

### Assets

#### Changed

- Removed the "at most 256 rules" limit on the enterprise asset scope: an enterprise entering its scope IP by IP / domain by domain easily hits this cap, after which it has to be split into multiple enterprises, while the scope itself is not slower just because there are more entries. The cap is removed in all three places — backend, frontend, and the demo mock — with a single rule still limited to 1024 characters, and the 2 MiB request-body cap kept as a fallback (about forty to fifty thousand rules).

### Skills

#### Fixed

- Fixed the "upload failed: zip: unsupported compression" error when uploading a skill archive: the Go standard library only has built-in Store / Deflate decompressors, so bzip2 and Zstandard archives written by compression software at a non-default level cannot be opened. These two decompressors are now added (pure Go, no new external dependency); methods that genuinely cannot be decompressed such as Deflate64 / LZMA / XZ / PPMd, as well as encrypted archives, now give a clear prompt before decompression, naming which file used which compression method and how to repackage, instead of throwing the underlying English error at the user.
- Fixed path validation in a skill judging a Chinese filename as illegal: path validation was previously an ASCII allowlist of `[A-Za-z0-9-_./]`, so if the archive had even one Chinese-named file (like `reference/notes.md`), the whole upload would fail with "the archive contains an illegal path". It is changed to a Unicode blocklist: it allows filenames and spaces in various languages, while still rejecting control characters, invalid UTF-8, zero-width and bidirectional control characters (an RLO filename disguise), `\ % # ? * : " < > |`, and `..` / absolute paths / empty path segments, with the directory-traversal defense unchanged. The skill name is likewise opened up — ASCII is still limited to lowercase letters, digits, and hyphens (the agentskills.io spec), and non-ASCII letters such as Chinese can be used directly as a skill name, but spaces, dots, and path separators are not accepted.
- Fixed garbled filenames or whole-archive rejection after decompressing a Chinese archive produced by Windows compression software: such a zip does not set the UTF-8 flag and writes filenames in GBK, so it is now decoded with a GBK fallback before path validation. Also, a quoted frontmatter like `name: "Chinese skill"` can now have the skill name read correctly.

### UI

#### Added

- The findings page adds an "All findings" flat view, set as the default, switchable from the original "Grouped by task" view via a header Tab: the grouped view requires expanding each task to see vulnerabilities, which is a detour when you just want to scan the list across tasks. The flat view is one big cross-task table (10/20/50/100 per page), with behavior identical to the grouped view — checkbox export, in-row expansion to see evidence and the detailed report, in-row editing of name/category/severity, changing the disposition status, deep-dive, and delete. The two views share the stat cards and the filter bar, switching does not lose the filter, and the current view and filter are remembered locally; polling hits only the current view, and an in-row change writes to both caches in sync, so switching over does not show stale data.
- The findings page adds a "By asset" view: an asset tree on the left (enterprise → root domain / IP → subdomain → service → interface, with the enterprise layer appearing only when an asset really has ownership), and on the right the findings under the whole subtree of the selected node, sharing the same table and the same filters as the other two views. The tree collects only assets that have findings, with the ancestor chain filled in on demand (even when a finding is only attached to the deepest interface, the layers above can still be assembled), and a node's count is the subtree aggregate deduped by finding; a finding whose asset has been deleted or that had no associated asset in the first place goes into an "Unassociated asset" bucket. Unlike the other two views, the asset view does not poll — it queries only when entering the view, changing a filter, adding/deleting/editing a finding in the page, or clicking the tree's refresh button, since the left tree is a navigation structure with no need to recompute every 5 seconds. Each layer of the tree shows only the increment relative to the layer above (a subdomain drops the root-domain suffix, a service shows `https :443`, an interface shows only the path), with the full value in the hover tooltip and breadcrumb; when there are too many nodes, a whole layer discards the interface/service level with a prompt, and the count still counts into the upper layer.

#### Fixed

- Fixed session records in the mobile session detail being squeezed and not fully visible: on a narrow screen the session list is collapsed, giving the width to the record itself.

### Dependencies

#### Changed

- Upgraded norma v0.3.2 → v0.3.3: added `Config.MaxTokensField`, letting OpenAI Chat Completions' output cap be sent as `max_completion_tokens` instead (reasoning models recognize only this key). The two keys are mutually exclusive, only one is sent, and the default is still `max_tokens`.
- Upgraded `golang.org/x/mod` v0.37.0 → v0.40.0, fixing two dependency security advisories.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@neouks](https://github.com/neouks)
- [@begininvoke](https://github.com/begininvoke)

## [0.3.6] - 2026-08-27

### LLM

#### Fixed

- Fixed the "non-streaming" toggle reverting to "streaming" after saving and reopening (#69): the config-list interface's DTO omitted the `streaming` field, so the response never returned it, and the frontend reading `undefined` always fell back to the default streaming; the actual write and DB storage were fine, it just could not be read back. The DTO restores the field (without `omitempty`, so `false` must also appear in the response).
- The test connection is changed to verify the model really replied, and to test by that config's real send/receive mode (#65): previously it only judged whether the HTTP succeeded, so a request that went through but the model replied with nothing (thinking burned the budget / the body was swallowed by a safety policy / the compat layer dropped `content`) also reported "connection successful", disconnected from the "no reply" behavior in a session; and the test always used streaming, so a non-streaming config was actually testing a different channel. Now an empty reply is judged as a failure outright, a success shows the model's reply in the prompt, and the current streaming toggle is carried into the test, keeping "test passed" consistent with "the session works".

### Agent

#### Changed

- `list_facts` is changed to pagination + keyword filtering, to avoid a single call flooding the context when there are many facts (#74): returns the latest 20 by default, supporting `limit` (max 100) / a `before` cursor / a `q` summary keyword, returning `{facts, total, has_more, next_before}`; an overly long single summary is truncated by character count (the full text still goes through `node_detail`). The worker / planner prompts are synced to the pagination semantics. An old database flushes the new parameter schema into the tool-catalog table via a one-time migration (`SeedTool` is first-insert-only, otherwise the tool-management page shows "no parameters").

### Tools

#### Added

- The "Tool execution" page adds a tool-call-count statistic (#72): the toolbar's "Statistics" button opens a dialog showing, per tool, the call count, proportion, and failure count (descending by count); it reuses the list's task / keyword filter and counts the whole result set rather than the current page, and fetches only when the dialog opens.

### Dependencies

#### Changed

- Upgraded norma v0.3.1 → v0.3.2: fixes reasoning/refusal being silently dropped in OpenAI-family responses (Responses adds `reasoning_text`), dedups the three names of the reasoning field, adds bounded retry for an empty response (zero content blocks), and fixes a gateway 400 caused by a compaction boundary cutting a tool pairing (also fixing the stock orphans already baked into the transcript).

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)

## [0.3.5] - 2026-08-25

### LLM

#### Added

- Each LLM config supports a streaming/non-streaming toggle (streaming by default): on uses streaming SSE; off uses true non-streaming (`stream:false`, returning the complete JSON at once), which can bypass some gateways' poor SSE implementations (empty frames, dropped thinking-field frames), at the cost of losing in-progress real-time progress and real-time token counting. The worker / planner / mainagent / chat / goals all take the value dynamically per the currently active config; all three Provider wrappers — `llmpool` / `llmrec` / the task runtime — are compatible with non-streaming; `llm_profiles` adds a `streaming` column and `ALTER`s to backfill an old database (default `true`, so old configs are unaffected).
- Support for the OpenAI Responses API format in an LLM config: each config adds a third format `openai-responses` (hitting `POST /v1/responses`), alongside Chat Completions / Anthropic; the `BaseURL` is normalized, with a default model of `gpt-5`; the `format` constraint of `llm_profiles` adds `openai-responses` with an idempotent migration to backfill an old database; the frontend format dropdown adds "OpenAI (Responses API)". Depends on the norma v0.3.1 upgrade (including the `reasoning_content` return fix).
- Record the raw HTTP of LLM requests/responses: capture the real wire body at the HTTP transport layer, preserving the tool schema, `tool_use` blocks, and raw SSE frames not visible in the normalized view; the multiple attempts of norma's internal retries are each preserved; `llm_records` adds two columns `raw_request` / `raw_response` and `ALTER`s to backfill an old database; the recording page's detail panel adds a "raw" view toggle and request/response copy buttons (with an `execCommand` fallback compatible with a non-secure context).

### Conversations

#### Changed

- The session list's multi-select is changed to a "multi-select" mode toggle: by default the list no longer permanently shows a checkbox on each row (a cleaner look), and the header is changed to a "N total + Multi-select" button; clicking "Multi-select" enters selection mode (checkboxes, select-all, bulk delete), "Done" exits and clears the selection, and a bulk delete auto-exits when all succeed (if any fail, it stays in selection mode for easy retry); a single rename / pin / delete still goes through the per-row ⋯ menu.

### UI

#### Changed

- Enhanced the task-management, session-operation, and traffic-viewing experience (#57): the task list's column-sort preference can be persistently remembered, in-row rename is now triggered directly by an icon (no longer via the menu), and the drawer (sheet) interaction and traffic-viewing details are refined.

#### Fixed

- Worker asset labels show only the domain and IP, and correctly handle the empty-label case.

### Agent

#### Added

- The planner adds a "quantified acceptance check" when judging a goal: when a goal contains quantifiable acceptance conditions (asset test coverage reaching X%, obtaining N flags, obtaining a certain privilege), before `prove_goal` it must check the measured values in `graph_overview` (`coverage.pct`, finding counts, etc.), and if the measured value is below target, `prove_goal` is forbidden and it instead dispatches intents to make up the gap, and must not mark met early on the grounds that "the main part is done / basically achieved". This fixes a goal requiring 100% coverage but measured at only 40% being judged complete.

#### Changed

- Rewrote the basis for "0 intents this round" in the planner prompt: the original text described 0 intents as "the most common, most important principle", which would make the planner stop too early when the goal is unmet and there is still an untested surface in scope. It is now changed so that 0 intents should be produced only in two specific cases — ① all directions thought of are already covered by open/running/recent_done intents; ② the next step depends on the output of a currently running work and that output has not yet appeared (it should wait for it to finish and plan at the next wake-up after the graph updates). It also adds a reverse constraint: when there really is a new, uncovered direction not dependent on a running work, or the goal is unmet and there is still an untested surface, do not stop just because "0 intents is common".
- Strengthened the "evidence threshold for a negative conclusion" in the worker prompt: for a negative conclusion like "not injectable / port closed / no login entry" that might make the planner abandon a whole direction, it requires exhausting the reasonable techniques within the intent (switching encoding/parameters/paths/methods) before concluding; if the techniques are not exhausted or the evidence is weak, it is marked `confidence=inferred`, to avoid welding a whole route shut with a hasty `observed` negative (a wrong negative early in the task especially skews the direction and is hard to self-heal).
- The above planner / worker default-prompt changes are appended as a new version via a one-time migration (`reseedPlannerPrompt` / `reseedWorkerPrompt`, each guarded by a settings flag) and switched to the current version; the old versions are kept in the version history, and a user who customized the prompt can restore in the version record.

### Operations

#### Added

- Added `reset-password.sh` to reset the admin (username fixed as `CYFIND`) password: supports both local / docker deployments, with connection info either explicitly specified or read automatically from `--dsn`/`$CYFIND_PG_DSN`/`config.json`; it generates a bcrypt hash compatible with the backend login via `pgcrypto` in the database and writes it back to `settings.auth.password_hash`, with no service restart needed after reset. The password is passed via an environment variable and does not enter the process argv, and is escaped against injection.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@neouks](https://github.com/neouks)

## [0.3.4] - 2026-08-24

### UI

#### Added

- After checking multiple tasks in the task list, you can bulk-change their category, with the target category supporting "Uncategorized" to move tasks out of the current category; the whole-batch write completes in one transaction, and the only failed items would be tasks already deleted after being checked.

#### Changed

- The new-task "Task category" is changed from a dropdown to a searchable input: typing filters the existing categories, a name not in the DB can be created and selected instantly by pressing Enter (or clicking "Create" in the dropdown), and the selected item is shown as a removable tag; still limited to a single category.

### Conversations

#### Fixed

- Fixed sending a message being blocked by "LLM not configured, cannot converse" when a session has a selected LLM config but there is no globally active config. The pre-send check originally only looked at the global active config, while the actual execution prefers the session's selected config, so the two resolution logics were inconsistent; they are now unified into one (session/Agent binding first, global fallback).
- The "cannot converse" prompt is subdivided by state: with no config at all it prompts "Add a config", with a config but none active it prompts "Activate one or specify one for this session", no longer always showing "not configured", for easier diagnosis.

### Agent

#### Added

- For a task whose goals are all achieved, an intent dispatched by the main Agent via `add_intent` can be claimed and executed by a Worker directly, running to completion: at this point the Planner no longer runs (a task with no open goal does not enter planning), avoiding it re-judging the goal as achieved and canceling the just-dispatched intent; after the frontier is drained the task returns to completed. Before dispatching an intent, the main Agent asks the user, based on the intent content, whether to register it as a formal goal, and registering it restores the task's regular autonomous planning.

#### Changed

- When the `step_ids` of `get_worker_trace` / `get_task_worker_trace` exceed the per-call cap (5), it no longer errors outright but returns the full content of the first 5 steps, telling you in the result via `returned_step_ids` / `omitted_step_ids` / `notice` which were fetched this time and which remain, and prompting "no need to fetch more if these are enough". Duplicate and illegal ids passed in are deduped and removed before counting.

#### Fixed

- The task list is changed to descending by task id (newest created first), replacing the previous sort by creation time. Multiple tasks created at the same moment have identical timestamps and an unstable sort, which, combined with the 10-second polling and the random traversal of the in-memory map, caused them to frequently swap positions in the list.

### Assets

#### Fixed

- Fixed enterprise-ownership recomputation being broken by a single row of dirty data: when `assets.ip` stored a hostname (written by an Agent or the asset API), `a.ip::inet` would throw `22P02`, causing adding/modifying an enterprise asset scope and deleting an enterprise to all fail and roll back. It is changed to use the safe conversion `try_inet()`, skipping an illegal value rather than aborting the whole statement.
- An unparseable `ip` is no longer silently skipped: after saving the enterprise scope, it clearly notes how many assets have an `ip` that is not a valid IP (with the specific id and value), reminding that these assets will not be owned by the IP/CIDR rules; the same info is written to the server log, covering the paths with no frontend response (deleting an enterprise, scopesentry sync, Agent writes).
- The IP/CIDR matching of a task's test scope is likewise changed to use `try_inet()`, replacing the previous regex guard that only checked the character set (a hostname of all-hex letters like `abc.def` previously still slipped through and triggered the same error).

#### Changed

- The `ip` field of `ip`, `service`, and `endpoint` assets no longer accepts a hostname: `insert_assets` and the asset API return a per-item error with an `index`, directly giving the correction method (use `type=subdomain` to fill `domain`, or resolve the A/AAAA record first), so the Agent can correct it itself and re-insert. Other assets in the same batch are unaffected and stored normally.

### Contributors

- [@neouks](https://github.com/neouks)

## [0.3.3] - 2026-08-23

### Worker

#### Added

- A running Worker supports per-item pause, resume, and cancel; pause keeps the intent, facts, and vulnerabilities, and cancel transactionally cleans up the current intent and its direct outputs after execution exits.
- Added a `paused` intent status, an execution barrier, and named termination reasons, to prevent a late blackboard write after a pause, cancel, or task deletion.
- Added an optional task concurrency cap; new tasks, resume, vulnerability deep-dive, and queue backfill all go through a unified persistent FIFO admission path.

#### Changed

- A Worker's single-run wall-clock default duration is adjusted from 600 seconds to 1200 seconds; a timed-out task, after being revived, is re-timed on the next real execution.
- The real execution state of the Worker, Planner, and main Agent uniformly drives the task-state badge, fixing the issue of still showing "idle" while a Worker is running.
- The Worker session keeps per-item control and the current session's token summary, with the model name moved to the right of the current session title.

#### Removed

- Removed the Worker multi-select, select-all, and bulk pause/resume UI, and removed the Worker bulk-control API and mock contract.
- Removed the token badge and tooltip in the Worker list rows, while the underlying full token ledger and the task-aggregate interface are kept.

### LLM

#### Added

- Tasks support an ordered LLM config chain; on clearly identifying a provider's insufficient quota it automatically switches to the next config, and persists the current config, the exhausted state, and an error summary.
- Running and paused tasks support editing the full config chain, reordering, and manually switching the current config, taking effect from the next LLM call.
- Automatic switching, manual switching, and whole-chain exhaustion are written as structured system activity, and pop a dedupable reminder via the task activity stream.
- Added a task-role model-resolution interface, uniformly resolving the config and model the Main Agent, Planner, and Worker use on the next call.
- Added an optional global LLM Pool, supporting a configured call order, a specified-model failure fallback, health status, cooldown recovery, and manual reset.
- Added an always-on LLM usage ledger, aggregating input, output, and cache tokens by task, session, model, and config.

#### Changed

- Goal decomposition, Planner, Worker, and main Agent share the task-level LLM runtime (the resolution priority is below).
- Failover only responds to an explicit quota, balance, or billing error; ordinary rate limits, auth, network, server, and context errors do not wrongly switch.
- The LLM config page is changed to a config-card list with a right-side drawer editor, and provides the Pool's round-robin order, priority, exclusions, health status, and recovery actions.
- The config-chain-exhausted info supports wrapping on a narrow screen; the current model is changed from a session-list icon to a text label beside the current session title with a full tooltip.
- The order in which each role resolves the LLM in a task is adjusted to "Agent binding → task config chain → global": a role with an explicitly bound model always runs on that model, an unbound role falls to the task chain, and an empty task chain falls to the global.
- Leaving the outbound proxy empty means a direct connection, no longer falling back to the `HTTP_PROXY`/`HTTPS_PROXY` environment variables (an explicit `CYFIND_LLM_PROXY` is unaffected); the proxy input supports `socks5://user:pass@host:port` with a username and password.

#### Fixed

- A transient streaming failure before submission (before any output is produced) is safely backoff-retried on the same provider, significantly reducing the "only ran one or two tools then interrupted, no summary, terminal state `model_error`" case; a quota exhaustion, an over-long context, and a deterministic 4xx error are not retried and are still handled by failover and compaction recovery respectively.

#### Removed

- Removed the LLM icon marker in the session list, to avoid confusion with the Worker status icon.

### UI

#### Added

- Tasks support global category creation, rename, delete, and filter; a new task can select a category directly.
- Added global task-template CRUD and a right-side management drawer; a new task can load a preset description and goals, and can save the current content as a template.
- A new task supports associating multiple source tasks and multiple enterprise asset scopes; the enterprise scope auto-recognizes domains, URLs, IPs, CIDRs, ICPs, and enterprise keywords from a single multi-line text box.
- Task test assets support real-time add and delete, recording sources such as manual, enterprise, inherited, or Agent-discovered; the Worker session title shows a summary of the current test assets and their source.
- The findings page is grouped by task with independent in-group pagination, and supports filling in a description for a vulnerability and creating a high-priority deep-dive intent.
- Conversations support rename, pin, unpin, and delete; the task list supports bulk pause and resume of the current page.
- Traffic detail and tool-execution detail are changed to a right-side drawer; the HTTP message adds `Host` and highlights the request line, status code, headers, JSON, and markup-language body.
- The task-list action column adds "Detail" and "Pause/Resume" buttons; the session send key can be configured in system settings (`Enter` / `Cmd+Enter`, etc.), and the web-search area adds a proxy input.
- The badge to the right of the session title is changed to show the LLM config name, with the model ID moved to a hover tooltip; a task can be given an optional name, and the task list adds a name column and search (falling back to the description when empty).
- The skills page adds usage count, last-used time, and missing-dependency statistics, making it easier to locate a skill that is not in effect or not installed.

#### Changed

- The task title is changed to a focusable detail link; task assets, enterprise assets, finding task-groups, and in-group vulnerabilities use real server-side pagination, a stable sort, and precise totals.
- Adding an enterprise is changed to a right-side drawer, with scope entry unified to multi-line text and providing real-time recognition, validation, and type preview.
- The main Agent input supports auto-grow, `Enter` to send, `Shift+Enter` for a newline, and avoids a false send during a Chinese-IME composition state.
- Agent preview, task reports, and related details uniformly use a shared Markdown renderer; delete confirmation, long errors, and the mobile drawer width are uniformly fixed.
- The task-template selector displays and searches by template name and submits by template ID; the system's original font size is restored, and the app version is uniformly displayed as `0.3.3`.
- The task total and the current session's tokens only highlight the input, cache-read, and output values; the send button uses a cleaner up-arrow icon.
- The task overview's test scope shows the enterprise name rather than the ID.

#### Fixed

- Plain text containing a dot is no longer falsely judged as an ICP filing number.
- Fixed a name collision in the variable catalog with a global runtime variable (such as `{{.Now}}`), which caused the Agent editor's variable list to render a duplicate key.

#### Removed

- Removed the independent "Enter" button on the task card, unifying it so clicking the task title enters the detail.
- Removed the dashboard "New task" button, the Logo URL input when adding an enterprise, and the vulnerability-count Badge at the top of the findings page and in the task groups.
- Reverted the global 10%-font-increase style, and removed the Worker selection box, the model icon, and the row-level token statistics in the session list.

### Agent

#### Added

- A new task can directly associate multiple existing tasks, read-only inheriting in real time the goals, facts, vulnerabilities, completed intents, asset scope, and blackboard context of its direct source tasks.
- The blackboard read tools support querying a source task's nodes, facts, vulnerabilities, and execution traces on demand; inherited nodes carry a source marker and all write tools refuse to modify them.
- The enterprise-scope tools support domains, URLs, IPs, CIDRs, ICPs, and enterprise keywords; a keyword is only an Agent scope hint and does not participate in automatic asset ownership.
- A vulnerability deep-dive operation creates, in the original task, a high-priority manual Worker intent with an asset anchor and a `derived_from` edge.
- The overview adds a "Goal management" card, supporting manual view, add, edit, and delete of goals; adding or editing notifies the Planner and revives the task, while deleting hard-deletes the goal node (cascading edges and anchors) but does not revive.
- The main Agent gets the `steer_work` tool by default, letting it inject a correction instruction into a running Worker in real time without interrupting or losing progress (still validating the intent belongs to this task).

#### Changed

- A source task's intents do not enter the new task's frontier, and the new task continues to use an independent exploration, execution queue, working directory, and conversation history.
- Deleting a running intent no longer destroys data: it instead stops to `stopped`, requires filling in a delete reason, attaches the reason as a fact to that intent and writes it into the payload, and the planner perceives it via a `cancelled` trigger (keeping the intent content and reason).
- The main Agent conversation is changed to be driven by the server activity stream, with input recoverable on a send failure; opening a session auto-sticks to the bottom and keeps the last reply visible after the detail lazy-loads.
- Pausing a task terminates the current Main Agent, Planner, and Worker calls, but does not prevent the user from proactively starting a new main-Agent orchestration session during the pause.
- Cancel, close, and stream interruption uniformly preserve the real termination reason, the content already generated, the number of run rounds, the elapsed time, tokens, and unreturned tool calls.

#### Removed

- Removed the main Agent's client optimistic message echo, to avoid duplicate messages and cross-session streaming under pause, failure, or concurrent activity.

### Constraints

#### Added

- The goal-decomposition stage first extracts operation constraints (allow/deny) before decomposing goals, and the main Agent can supplement them at runtime; constraints are injected into the Planner and Worker system prompts at the highest priority, and after debiasing, diversity and surface-expansion exploration explicitly obey the constraints.
- The overview adds a "Constraint management" card and CRUD interfaces; the constraint-injection scope can be toggled for Planner / Worker separately (both on by default, read each round, taking effect immediately). The new table `task_constraints` uses `CREATE TABLE IF NOT EXISTS`, and an old database auto-creates it.

### Interception

#### Added

- Command interception, beyond regex/string rules, adds a model-fallback approval: when no rule matches, the model makes an `ALLOW`/`ASK`/`DENY` semantic judgment, with a configurable fallback action on failure and an approval-timeout action; the interception page splits into two tabs "Interception rules / Model config", and a model decision is labeled with a `[model]` prefix and a reason.

#### Fixed

- Hardened the judge-output parsing, to avoid a correct `DENY` decision being wrongly treated as an allow.

### Traffic

#### Changed

- Traffic recording is changed to store the whole exchange in SQLite (a large body overflows to a hash-deduped blob bucket), with a trigram full-text index built on text bodies, supporting arbitrary substring and Chinese search; deletion degrades to a single SQL transaction, dropping from hours to milliseconds and no longer stalling recording during it. Added large-body streaming download and a `traffic_search` full-text parameter; the old file-tree data needs no migration and is still readable, searchable, and deletable.

### Tasks and assets

#### Added

- Creating a task adds an "Asset-coverage feature" toggle (on by default): when off, coverage is not computed or displayed, the situation graph shows only assets, `task_scope` is not auto-accumulated, and the related tools are removed from the Planner / main Agent; enterprise association is unaffected by this toggle.
- `insert_assets` adds a `related` marker per asset (default `true`): effective only when coverage is on, `false` only enters the shared asset store and is not counted in this task's coverage (such as an incidentally discovered side site or an unrelated asset).
- The enterprise scope and the task test assets uniformly support text recognition of domains, URLs, IPs, CIDRs, ICPs, and keywords; a domain/IP can create or reuse a global asset, while a CIDR/ICP/keyword is kept as task-scope context.

### Build

- `build.sh --release` supports building Linux amd64/arm64, macOS amd64/arm64, and Windows amd64 at once, and produces a zip release package with `skills/`, a config example, and the README.
- Uses the Go linker to strip debug info and produces a zip release package; UPX is changed to explicitly optional, to avoid its self-extracting ELF segfaulting at startup in some Linux environments.
- The Release Workflow runs a startup smoke test on the Linux amd64 binary and ships `SHA256SUMS` with the release package.

### Contributors

- [@neouks](https://github.com/neouks)

## [0.3.2] - 2026-08-20

### Added

- A new task supports associating multiple existing tasks, read-only inheriting in real time the facts, vulnerabilities, completed intents, asset scope, and blackboard context of its direct source tasks; the new task still uses an independent execution queue, working directory, and session history.
- Tasks support an ordered LLM config chain. On clearly identifying a provider's insufficient quota it automatically switches to the next config, and persists the current config, the exhausted state, and structured audit activity.
- Running and paused tasks support editing the LLM config chain, reordering, and manually switching the current config; automatic switching, manual switching, and whole-chain exhaustion are shown on the task-detail page.
- A running Worker supports pause, resume, and cancel. Pause keeps the blackboard data, and cancel transactionally cleans up the intent and its directly produced facts, vulnerabilities, and execution records after the Worker stops writing.
- Deleting a task can optionally also clean up the associated assets, traffic, vulnerabilities, and the task's landed files, and adds a delete barrier, concurrency protection, and auditable delete statistics.
- Added an optional task concurrency cap; a new task that hits the cap queues FIFO and starts automatically after a run slot is released.
- Added task-asset pagination, company-asset pagination, task-category statistics, and a paginated-intent mock contract.
- Added the `build.sh` single-binary build script, supporting a static frontend export, resource embedding, cross-platform targets, and build-version injection.

### Changed

- A task-level explicit LLM config chain coexists with the existing global LLM Pool; an explicit chain continues to use strict quota-failover semantics, and without an explicit chain it follows the Agent-binding and global-config rules.
- The main Agent input supports auto-growing multi-line input, `Enter` to send, `Shift+Enter` for a newline, and avoids a false send during a Chinese-IME composition state.
- The Planner, Worker, and main Agent share the task-level LLM runtime; the task chain uses the smallest context window among the candidate models as the safe compaction threshold.
- The task-detail page shows running, idle, and paused states by the real LLM-call status; a source task's facts, vulnerabilities, intents, asset references, and graph nodes are uniformly marked by source and kept read-only.
- Agent preview, task reports, and related detail views uniformly use a shared Markdown render component.
- The LLM model config uses a card and drawer interaction, with the model list independently scrollable inside the drawer.
- Pausing a task no longer blocks the main Agent conversation: the main Agent orchestration session is independent of the task pause, and new messages can still be sent during a pause (a pause only terminates the round currently in progress).
- A Worker's single-run wall-clock default duration is adjusted from 600 seconds to 1200 seconds.

### Fixed

- Removed the main Agent console's optimistic echo, changing to pure server-side data rendering, fixing message disorder and bleeding into other sessions' content under scenarios like pause or send failure.
- Opening a main Agent session defaults to scrolling to the bottom and fully showing the last reply: the last reply's full content auto-sticks to the bottom after lazy-expanding, no longer pushed off screen.
- Fixed the main Agent session still continuing to run after a task is paused, and the orchestration Agent not stopping the main Agent in sync when it pauses a task.
- Fixed the task-state badge and action-button state being out of sync when a task completes or the Planner, Worker, or main Agent is actually running.
- Fixed a possible late blackboard write or residual file between Worker cancel, task deletion, and concurrent writes.
- Fixed Markdown preview not working, the delete-confirmation long text overflowing, the mobile width, and some task-detail buttons not aligned.
- Added named termination reasons to all Agent cancel paths, so the activity detail can show the canceler, the terminal state, the number of run rounds, the elapsed time, token usage, and unreturned tool calls.
- Fixed a race where the parent context could preempt and overwrite the named `shutdown` reason at backend shutdown, and the garbling caused by a Chinese activity summary being truncated by byte.
- Fixed a cancel event with partial streaming output losing the real termination reason, while preserving the content generated before cancel.

### Contributors

- [@Autumn-27](https://github.com/Autumn-27)
- [@neouks](https://github.com/neouks)

[Unreleased]: https://github.com/Autumn-27/CYFIND/compare/v0.3.10...HEAD
[0.3.10]: https://github.com/Autumn-27/CYFIND/compare/v0.3.9...v0.3.10
[0.3.9]: https://github.com/Autumn-27/CYFIND/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/Autumn-27/CYFIND/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/Autumn-27/CYFIND/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/Autumn-27/CYFIND/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/Autumn-27/CYFIND/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/Autumn-27/CYFIND/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/Autumn-27/CYFIND/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/Autumn-27/CYFIND/compare/v0.3.1...v0.3.2
