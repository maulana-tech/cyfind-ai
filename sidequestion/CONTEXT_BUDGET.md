# Side-question long conversations and context budget

Fixed 2026-09-11. The original implementation treated the character count of the request JSON directly as tokens, and inherited the main task's 32K output reservation, so when there was a lot of HTML, JS, and tool results it would reject a normal side-question prematurely.

## Open-source implementation cross-check

- [Grok CLI side-question context](https://github.com/superagent-ai/grok-cli/blob/fb97af83f06dca873281d60168430f06c8de6324/src/agent/agent.ts#L739): extracts fragments from the most recent user and assistant text, with a character budget of about 2000 and at most 400 characters per entry. It does not maintain a continuous side-question Q&A history on this path.
- [Grok CLI independent request](https://github.com/superagent-ai/grok-cli/blob/fb97af83f06dca873281d60168430f06c8de6324/src/utils/side-question.ts): an independent cancellation signal; an output cap of 2048 tokens when the model supports it; provides no tools.
- [Grok CLI main-session compaction](https://github.com/superagent-ai/grok-cli/blob/fb97af83f06dca873281d60168430f06c8de6324/src/agent/compaction.ts): estimates tokens, keeps recent content, updates new content into the old summary, and handles cross-turn truncation.
- [OpenCode session compaction](https://github.com/anomalyco/opencode/blob/b3f1a96c6dd7adeb28b36dd11add1998fc84d67b/packages/core/src/session/compaction.ts): full-request estimation, output/buffer reservation, recent content plus a rolling summary, a tool-free summary request; that implementation defaults to a recent budget of 8000 and a summary output cap of 4096 tokens.
- [OpenCode overflow recovery](https://github.com/anomalyco/opencode/blob/b3f1a96c6dd7adeb28b36dd11add1998fc84d67b/packages/core/src/session/runner/llm.ts): overflow recovery is only attempted before assistant output has begun, and a call after recovery does not re-enter the same overflow-recovery path.

CYFIND borrows the practices of an independent output budget, recent content plus a rolling summary, and limited recovery. It keeps norma v0.3.6's structured messages and tool pairing, and does not copy Grok's text extraction; it does not write OpenCode's main-session compaction events into CYFIND's main transcript.

## Request budget and execution

- Messages follow norma's per-content-block UTF-8 byte estimation and 4/3 margin; the system prompt, tool schema, and message-wrapper overhead are additionally counted. The estimate is not the model's exact token count.
- Side-question output defaults to at most 8192 tokens and also does not exceed the output cap already set in the main config. The service environment variable `CYFIND_BTW_MAX_OUTPUT_TOKENS` can set a cap of 256–32768; it does not modify the product's default model or the main task's parameters.
- The input budget is the context window minus the output cap and a safety margin; an unknown window uses the platform default of 200K. The safety margin is 5% of the window, with a minimum of 128 and a maximum of 8192 tokens.
- Successful Q&A are loaded at most 20 groups per batch by incrementing ordinal. At most 20 groups are kept verbatim, with their token budget being at most 1/4 of the input budget and not exceeding 16K.
- Excess Q&A are updated into the rolling summary. The summary carries the historical source and context time; a historical assistant answer is not equivalent to new tool evidence, and on conflict the latest main snapshot takes priority.
- When the main context is still too long, only the older messages in the copy are summarized, keeping at most 8K tokens of recent content; the cut point does not split a tool call from its result. An oversized single group enters the summary as a whole.
- The summary input is UTF-8-safely chunked according to the actual remaining window, with an output cap of 2048 tokens; an empty summary, truncation, a tool call, or exceeding the summary budget all skip writing the cache. A single side-question makes at most 12 summary calls and is subject to the same 120-second timeout; reaching the cap fails explicitly rather than looping forever.
- If the model first returns context-overflow and no text or tool call has been output yet, it is reduced further and retried at most once; if the estimated size does not decrease, recovery stops immediately. Other model errors and partial streaming output do not trigger this recovery.
- All usage obtained — including summary, failed attempts, and usage at cancellation — is accumulated into the same side-question request. When the Provider returns no usage, only zero can still be recorded; an estimate cannot be passed off as actual usage.

## Persistence and UI

`side_question_sessions.memory` stores the summary of older Q&A, the covered ordinal, and the main-context summary cached by snapshot identity. `side_question_requests.context_info` stores the preparation phase, the actual number of replayed groups, summary usage, and the budget estimate.

A summary is saved only while the original request is still running and the clear version matches; a clear also clears the cache, and a late write does not restore cleared data. A new snapshot does not reuse an old snapshot's summary. Summary fields are saved with v3 task archives; when restoring an old v3 missing a field, an empty object is filled in, and v1/v2 remain compatible.

POST accepts and returns the request first, with preparation and compaction executed in the background, holding no admission lock or database transaction. SSE/history show preparation, organizing Q&A, compacting the copy, and the answer phase; a compaction failure is saved as the failure terminal state of that side-question request. The frontend keeps the error and restores the draft of the failed question, without covering the input box with a floating notification; history polling no longer clears a submission error.

## Validation record

- 19/20/21/50-group replay, retention of older conclusions across 20 groups, summary-cache reuse across restart: automation passed.
- Very long Chinese answers and code context, chunked request budget, tool pairing, snapshot invariance, cache invalidation on a new snapshot: automation passed.
- Summary failure/cancel/truncation/oversize/tool return, clear race, call cap, only-once overflow recovery, and no retry on a partial stream: automation passed.
- Paging, restart, v1/v2/v3 archives, summary-cache and budget-metadata archive recovery, an old v3 missing new fields, and 20 parent sessions sharing four concurrency slots, all on an independent PostgreSQL: passed.
- The Go candidate-service build, the frontend TypeScript check, the Biome check on modified components, and a Next.js production build in an independent directory: passed.
- The built-in browser used an independent UI fixture to verify, at 1280×720 and 390×844, the organizing phase, the summary-scope hint, draft recovery after failure, no floating error notification, no horizontal overflow, and no console errors. The temporary fixture has been removed.
- A read-only replay of this machine's existing Worker snapshots passed the new budget check; for example, Worker #3's 293085-character snapshot is no longer wrongly rejected by a local character count. This item involves no external model call.
- The live-conversation test that would send a private Worker snapshot to Grok was rejected by the automatic approval review and not executed, and is not counted as a passing item.
- At 2026-09-11 00:37, per the user's request, this machine's backend was restarted, reusing the original database, data directory, and login config. The running file and the candidate binary have matching SHA-256; both the backend and the frontend proxy's `/api/health` returned normal.

Validation commands (using only an independent test database):

```sh
go test -race ./sidequestion ./db ./server -run 'TestSide|TestCheckpoint|TestSnapshot|TestBuildRequest|TestService|TestMainSide|TestTaskArchive' -count=1
go build ./cmd/cyfind
npx tsc --noEmit
npm run build -- --webpack
```

The frontend production build uses an independent copy to avoid overwriting the `.next` currently being previewed. The candidate service is at `/private/tmp/cyfind-btw-budget-candidate`, copied to `/private/tmp/cyfind-btw-preview/cyfind` and started; the original binary is backed up as `cyfind.before-context-budget` in the same directory.
