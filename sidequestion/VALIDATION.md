# `/btw` validation record

Date: 2026-09-10. Branch: `codex/btw-side-question`. Baseline: `8dae851b9b622f2ff2631f332fde9719d0b16fba`.

An independent PostgreSQL test database and data directory were used; real model credentials were injected only into the independent test environment, were not written into the code or this record, and the product's default model was not modified. Go 1.26.3, norma v0.3.6, Next.js 16.2.9.

The actual model conversations, returned objects, engineering assertions, and the raw Qwen review text are saved in [validation-2026-09-10.json](validation-2026-09-10.json), which contains no API credentials.

## Engineering checks

| Scope | Result | Evidence |
| --- | --- | --- |
| Deep copy of structured messages and tool arguments | pass | `TestCheckpointDeepCopyAndBoundaries` |
| Summary / compaction requests do not overwrite, complete reply and terminal state publish, half reply excluded | pass | `TestCheckpointDeepCopyAndBoundaries`, `TestSnapshotExcludesPartialStreamAndSelectsPoolMember` |
| Actual model-pool member identity | pass | `TestSnapshotExcludesPartialStreamAndSelectsPoolMember` |
| Tool pairing, 20-group replay, budget trimming and overflow error | pass | `TestBuildRequestCompactionToolPairingAndBudget` |
| Main/side parallelism, bidirectional cancellation isolation | pass | blocking Provider, `TestMainSideConcurrencyAndIndependentCancellation` |
| No tool execution, streaming / non-streaming, existing usage on failure | pass | `TestServiceNoToolsAndUsageOnFailure` |
| Real norma ChatAgent + local Read tool, main-transcript / activity isolation | pass | `TestSideActualChatCheckpointToolResultAndTranscriptIsolation`, streaming and non-streaming sub-cases |
| Persistence, paging, idempotency, partial-answer retention across restart | pass | `TestSideHistoryIdempotencyPagingAndRecovery` |
| Clear vs. late-write race, parent-resource deletion, version comparison | pass | `TestSideClearLateWritersAndDeletedParent` |
| MainAgent / Worker archive and recovery, v1/v2/v3 | pass | `TestSideTaskArchiveVersions` |
| Three parent interfaces, authentication, resource ownership, Worker logical delete | pass | `TestSideHTTPGlobalLimitTaskWorkerAndDeletion`, `TestSideCheckpointPersistsBeforeAdmissionAndRestart` |
| Side-question while main session busy, independent SSE reconnect / disconnect, cancel, clear | pass | `TestSideHTTPBusyIsolationClearAndReconnect` |
| 1 per parent session / 4 global concurrency | pass | two `TestSideHTTP…` cases |
| Snapshot persisted before submission, continue after restart, old session cannot forge a snapshot | pass | `TestSideCheckpointPersistsBeforeAdmissionAndRestart` |
| Refuse to continue after a cached config is deleted or the model changes | pass | `TestSideRejectsDeletedOrChangedCachedProfile` |
| Cancel before archive and wait for the final answer and usage to persist | pass | `TestSideTaskDrainPersistsBeforeArchive` |
| Usage recorded once and attributed to the side-question when the streaming consumer cancels early | pass | `TestSideUsageRecordedOnceOnConsumerCancellation` |
| An auto-recovered Worker / deadline run context after restart continues to publish a new snapshot | pass | `TestSideRestoredWorkerRuntimePublishesNewCheckpoint` |
| Race check on the related packages | pass | the commands below |
| TypeScript and production build | pass | `npx tsc --noEmit`, `npm run build` |
| Biome on the new frontend modules | pass | `biome check`, 3 new modules |

After setting `CYFIND_PG_DSN` in a separate disposable database, the automated checks can be reproduced (do not point it at a production database):

```sh
go test -race ./agent ./db ./server ./sidequestion ./llmrec ./llmpool \
  -run 'Test(Side|Checkpoint|Snapshot|BuildRequest|Service|MainSide|CaptureRun|TaskArchive|CompleteForwards|StopIntent|CancelIntent)' -count=1
cd web
npx tsc --noEmit
npx biome check src/lib/side-questions.ts src/hooks/use-side-questions.ts src/components/side-question-workspace.tsx
npm run build
```

The full Go regression is not all green: the `server` package has two existing tests that fail during temp-directory cleanup, both reporting `TempDir RemoveAll … directory not empty`:

- `TestInheritedActivityDetailAndRelationDeletion`
- `TestTaskMetadataPatchReturnsRenameAndPin`

After exporting the source from the above unmodified baseline and re-running the `server` package in the same isolated environment, these two cleanup failures also reproduce. The baseline run additionally showed a target-node-count assertion failure in `TestCoreTaskLifecyclePG`; the final modified `server` regression did not have that assertion failure. The other packages passed, and this round's side-question-related cases and the race check passed. The baseline issues were not marked as this round's acceptance passes, and no existing assertion was modified to hide an issue.

The Next.js build output has the existing multi-lockfile / workspace-root inference warnings; the build completed and all pages generated successfully.

## Browser checks

Using the Codex In-app Browser, connected to an independent local Go service and the Next.js dev server. The following manual-automation operations were completed on desktop and a 390 × 844 narrow screen, checking screenshots and browser logs:

- Typing `/btw` during a regular chat run, with the main content and the side-question shown at the same time; the desktop side panel works.
- Consecutive follow-ups; the generated portion is kept after the side-question stops; the main flow continues.
- The request continues when the panel is closed, and the completed answer is restored on reopening; after a page refresh, an empty `/btw` restores history.
- The narrow-screen Drawer's input, buttons, history, and close operations work, with no horizontal overflow.
- Clear uses a confirmation dialog; after clearing, the history disappears while the main transcript and snapshot are kept.
- Asking from the task MainAgent and two Workers separately and switching between them, with the Agent labels and history not crossing over.
- A blocking local-model fixture keeps the Worker running; submitting `/btw` from the Worker's main input box, after stopping the side-question the Worker still shows live running and its own pause button, and the side-question saved a partial answer.
- The browser error / warning log is empty.

The controllable fixture is used to precisely verify concurrency timing, without depending on the output speed of a real model. During debugging, two Worker-runtime checks did not form a valid concurrency window (the task had ended / the answer ended early); after fixing the fixture it was redone and passed; these initial operations are not counted as a valid pass.

## Real model conversations

`grok-4.6` was probed first, via the OpenAI-compatible endpoint `http://127.0.0.1:12580/tingly/openai`. The probe returned HTTP 200, the model name `grok-4.6`, and `READY`, taking 2.82 seconds. The preferred one was available, so the Tingly `glm` or Zhipu `glm-5.3` fallback chain was not enabled; these two fallback services were not validated this round.

| Scenario | Actual result |
| --- | --- |
| Asking about assets, goals, and markers during a main-session run | returned `redhaze.top`, the homepage read and summarized goal, and `BTW-REAL-0910`; the side-question completed, 16.97 seconds |
| Asking the tool basis after the main session finished reading the homepage | correctly cited WebFetch 200, curl redirects 301 → 302 → 200, and the page title; 7.24 seconds |
| A side-question asking Bash to create a test file | refused to execute, the target file was not created; 7.74 seconds |
| A post-completion side-question does not change the main context | the main transcript SHA-256 matches the main activity record; the side-question's tool-execution count is 0 |
| A follow-up after a real stop / restart of the Go service | kept the previous 3 side-question history entries, answered assets, markers, and title directly from the persisted snapshot, without re-running the main Agent |
| A new session using the Grok non-streaming config | correctly answered assets and `ATOMIC-0910`; returned and saved usage: input 11734, output 138, cache_read 11520 |

The asset case's main session used WebFetch and Bash/curl to read the public homepage; the landing page is `https://id.redhaze.top/home`, titled "RedHaze Group · Global Conglomerate Portal". Bash staged the response in a local test file; nothing was written to the remote. This fact is verified separately from "the side-question executed no tool".

Main transcript checksum: `e7e61f135a4a120954b539f357e8c4205d7d5cd7460dcaf3dc0fd066463e1d00`.

**Usage limitation:** Tingly's Grok streaming responses returned no usage. A separate direct send of `stream_options.include_usage=true` to verify returned HTTP 200, 12 data frames, and 0 usage frames. So the 0 in the streaming test means the endpoint provided no usage, and must not be interpreted as no billing. Non-streaming usage, as well as the fixture's failure / cancel usage, are saved correctly.

## Qwen review

The review model `qwen-flash`, via the OpenAI-compatible endpoint `https://dashscope.aliyuncs.com/compatible-mode/v1`, HTTP 200. The first three real side-question conversations, the main session's tool basis, and the engineering assertions were provided; it returned `verdict: accept`, `concerns: []`, judging the answers consistent with the asset, marker, and page-read evidence, and the side-question tool refusal consistent with the constraints. Review usage: prompt 6625, completion 312, total 6937.

This Qwen review's scope did not include the service-restart and non-streaming tests added later. Qwen's summary of "no writes" was overly broad: the main session's curl did create a local response temp file, as explicitly recorded above. Concurrency, zero tool execution, and transcript isolation are judged by engineering assertions; the model review only assists in assessing answer quality.
