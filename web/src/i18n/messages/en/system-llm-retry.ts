/**
 * System → LLM page → "Retry & backoff" tab + per-profile retry override fields.
 * Keys are the zh-CN strings in _components/retry.tsx (literal t() keys and the
 * zh values of the RETRY_LAYERS module data, translated at the render site).
 */

const messages = {
  Triggers: "Triggers",
  "：": ":",
  "Not this layer": "Not this layer",
  "default {n}": "default {n}",
  "Interval ms": "Interval ms",
  "default backoff": "default backoff",
  "fixed {ms}": "fixed {ms}",
  "Leave empty to use the default; {hint}.": "Leave empty to use the default; {hint}.",
  "Retry overrides": "Retry overrides",
  'Applies only to this profile, overriding the global defaults in "Retry & backoff". Leave a field empty to follow the global value; attempts = -1 turns this layer off; an interval replaces exponential backoff with a fixed one. The breaker and intent rerun are process-wide and can only be changed on the global page.':
    'Applies only to this profile, overriding the global defaults in "Retry & backoff". Leave a field empty to follow the global value; attempts = -1 turns this layer off; an interval replaces exponential backoff with a fixed one. The breaker and intent rerun are process-wide and can only be changed on the global page.',
  "Failed to load the retry policy: {message}": "Failed to load the retry policy: {message}",
  "Saved — takes effect immediately (the in-flight round of calls still uses the old settings)":
    "Saved — takes effect immediately (the in-flight round of calls still uses the old settings)",
  "Save failed: {message}": "Save failed: {message}",
  "Loading retry policy…": "Loading retry policy…",
  "A failed model call passes through five retry layers, inner to outer:":
    "A failed model call passes through five retry layers, inner to outer:",
  " connection → empty response → same-provider safety window → pool breaker → intent rerun":
    " connection → empty response → same-provider safety window → pool breaker → intent rerun",
  ". An outer layer only runs once the inner ones are exhausted, so the attempt counts are ":
    ". An outer layer only runs once the inner ones are exhausted, so the attempt counts are ",
  multiplicative: "multiplicative",
  " — max out every layer and a single blip can burn dozens of requests. Leave everything empty to keep the current defaults, identical to the behavior without this page. The first three layers can be overridden per model profile.":
    " — max out every layer and a single blip can burn dozens of requests. Leave everything empty to keep the current defaults, identical to the behavior without this page. The first three layers can be overridden per model profile.",
  Save: "Save",
  "Reset all to defaults": "Reset all to defaults",
  "Connection retry": "Connection retry",
  "SDK · before the 200 arrives": "SDK · before the 200 arrives",
  "Can't connect or no 200 yet: connection reset / read-write timeout / DNS failure and other network-level errors, plus HTTP 408, 429, 500, 502, 503, 504.":
    "Can't connect or no 200 yet: connection reset / read-write timeout / DNS failure and other network-level errors, plus HTTP 408, 429, 500, 502, 503, 504.",
  "Every other status code (400 / 401 / 403 / 404 / 413 / 422 …) is a deterministic rejection — resending fails the same way, so it's raised immediately.":
    "Every other status code (400 / 401 / 403 / 404 / 413 / 422 …) is a deterministic rejection — resending fails the same way, so it's raised immediately.",
  "Resends the same request as-is. Once the stream has started (the 200 already arrived), a mid-stream drop is no longer this layer's business.":
    "Resends the same request as-is. Once the stream has started (the 200 already arrived), a mid-stream drop is no longer this layer's business.",
  Attempts: "Attempts",
  "0.5s→1s→2s exponential (capped at 8s)": "0.5s→1s→2s exponential (capped at 8s)",
  "-1 = never retry, the failure is raised immediately": "-1 = never retry, the failure is raised immediately",
  "Empty-response retry": "Empty-response retry",
  "SDK · openai format only": "SDK · openai format only",
  "HTTP 200 with a normal stop finish_reason, but the response has no content block at all — empty gateway frames, dropped thinking deltas and sampling hiccups all look like this.":
    "HTTP 200 with a normal stop finish_reason, but the response has no content block at all — empty gateway frames, dropped thinking deltas and sampling hiccups all look like this.",
  "No content because of max_tokens truncation doesn't count (that's fixed by raising the output limit; resending just hits it again).":
    "No content because of max_tokens truncation doesn't count (that's fixed by raising the output limit; resending just hits it again).",
  "Resends the whole prompt, so it's expensive on long contexts — don't set the attempts too high.":
    "Resends the whole prompt, so it's expensive on long contexts — don't set the attempts too high.",
  "-1 = hand the empty response back as-is": "-1 = hand the empty response back as-is",
  "Same-provider safety-window retry": "Same-provider safety-window retry",
  "This app · before any output is delivered": "This app · before any output is delivered",
  "Something goes wrong after the stream is established (the 200 arrived): the connection drops mid-stream, the provider reports overloaded, or an in-stream 429 / 5xx error event — and not a single token has been delivered to the caller yet.":
    "Something goes wrong after the stream is established (the 200 arrived): the connection drops mid-stream, the provider reports overloaded, or an in-stream 429 / 5xx error event — and not a single token has been delivered to the caller yet.",
  "Quota exhausted (402 / insufficient_quota, handed to the pool to switch profiles), context too long (413 / context length, handed to compression) and deterministic rejections (400 / 401 / 403 / 404 / 422) are never retried.":
    "Quota exhausted (402 / insufficient_quota, handed to the pool to switch profiles), context too long (413 / context length, handed to compression) and deterministic rejections (400 / 401 / 403 / 404 / 422) are never retried.",
  "Replays the same request on the same profile. Since no output has been delivered yet, the replay can't duplicate model output or tool executions.":
    "Replays the same request on the same profile. Since no output has been delivered yet, the replay can't duplicate model output or tool executions.",
  "0.5s→1s exponential (capped at 4s)": "0.5s→1s exponential (capped at 4s)",
  "-1 = a dropped stream goes straight to the outer intent-rerun layer":
    "-1 = a dropped stream goes straight to the outer intent-rerun layer",
  "Pool circuit breaker": "Pool circuit breaker",
  "This app · process-wide, one global copy": "This app · process-wide, one global copy",
  "Trips when transient failures (429, 5xx, network errors) accumulate to the threshold; deterministic failures — insufficient balance (402), invalid key (401 / 403), missing model (404) — ignore the threshold and trip on the first one.":
    "Trips when transient failures (429, 5xx, network errors) accumulate to the threshold; deterministic failures — insufficient balance (402), invalid key (401 / 403), missing model (404) — ignore the threshold and trip on the first one.",
  "One success resets the counter, so a flaky profile never accumulates its way into a trip.":
    "One success resets the counter, so a flaky profile never accumulates its way into a trip.",
  "Once tripped, the breaker enters cooldown and the pool skips this profile for its duration. State is persisted, so a restart doesn't lose it.":
    "Once tripped, the breaker enters cooldown and the pool skips this profile for its duration. State is persisted, so a restart doesn't lose it.",
  "Failures before tripping": "Failures before tripping",
  "1min→5min→30min ladder": "1min→5min→30min ladder",
  "-1 = transient failures never trip the breaker (deterministic failures still do)":
    "-1 = transient failures never trip the breaker (deterministic failures still do)",
  "Intent rerun": "Intent rerun",
  "Nothing above caught it: the worker ends in model_error — every inner retry was exhausted — or the stream broke after it had started delivering output (replaying is unsafe then, so the whole thing starts over).":
    "Nothing above caught it: the worker ends in model_error — every inner retry was exhausted — or the stream broke after it had started delivering output (replaying is unsafe then, so the whole thing starts over).",
  "Quota exhaustion is already handled by the pool switching profiles, so no rerun here; the step yields immediately when the task is paused / stopped / wrapping up, without consuming backoff time.":
    "Quota exhaustion is already handled by the pool switching profiles, so no rerun here; the step yields immediately when the task is paused / stopped / wrapping up, without consuming backoff time.",
  "Runs the whole intent again from scratch. It's the outermost layer, so one rerun multiplies the attempt counts of every layer inside it.":
    "Runs the whole intent again from scratch. It's the outermost layer, so one rerun multiplies the attempt counts of every layer inside it.",
  "Rerun attempts": "Rerun attempts",
  "Fixed 3s": "Fixed 3s",
  "-1 = no rerun, the intent is judged blocked right away": "-1 = no rerun, the intent is judged blocked right away",
} satisfies Record<string, string>;

export default messages;
