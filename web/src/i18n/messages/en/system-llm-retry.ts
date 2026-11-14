/**
 * System → LLM page → "Retry & backoff" tab + per-profile retry override fields.
 * Keys are the zh-CN strings in _components/retry.tsx (literal t() keys and the
 * zh values of the RETRY_LAYERS module data, translated at the render site).
 */

const messages = {
  // ── RetryRuleFields ──
  触发: "Triggers",

  "：": ":",
  不走这层: "Not this layer",

  "默认 {n}": "default {n}",
  "间隔 ms": "Interval ms",
  默认退避: "default backoff",

  "固定 {ms}": "fixed {ms}",
  "留空 = 用默认；{hint}。": "Leave empty to use the default; {hint}.",

  // ── ProfileRetryFields ──
  重试覆盖: "Retry overrides",

  "只对这个配置生效，覆盖「重试与退避」里的全局默认。每格留空 = 跟随全局；次数填 -1 = 关掉这层重试； 间隔填了就用固定间隔取代指数退避。熔断与意图重跑是进程级的，只能在全局那页调。":
    'Applies only to this profile, overriding the global defaults in "Retry & backoff". Leave a field empty to follow the global value; attempts = -1 turns this layer off; an interval replaces exponential backoff with a fixed one. The breaker and intent rerun are process-wide and can only be changed on the global page.',

  // ── RetryPolicyPanel ──
  "读取重试策略失败：{message}": "Failed to load the retry policy: {message}",
  "已保存，即时生效（正在跑的这一轮调用仍用旧参数）":
    "Saved — takes effect immediately (the in-flight round of calls still uses the old settings)",
  "保存失败：{message}": "Save failed: {message}",
  "读取重试策略…": "Loading retry policy…",
  "一次模型调用的失败会依次经过五层重试，由内到外：":
    "A failed model call passes through five retry layers, inner to outer:",
  " 建连 → 空响应 → 同 provider 安全窗口 → 轮询熔断 → 意图重跑":
    " connection → empty response → same-provider safety window → pool breaker → intent rerun",
  "。内层用尽才轮到外层，所以次数是":
    ". An outer layer only runs once the inner ones are exhausted, so the attempt counts are ",
  相乘: "multiplicative",

  "的——把每层都拉满，一次抖动能烧掉几十次请求。 全部留空即当前默认值，与没有这页时的行为完全一致。前三层可以在每个模型配置里单独覆盖。":
    " — max out every layer and a single blip can burn dozens of requests. Leave everything empty to keep the current defaults, identical to the behavior without this page. The first three layers can be overridden per model profile.",
  保存: "Save",

  全部恢复默认: "Reset all to defaults",

  // ── RETRY_LAYERS (zh module data, translated here) ──
  建连重试: "Connection retry",

  "SDK · 拿到 200 之前": "SDK · before the 200 arrives",
  "连不上或还没拿到 200：连接重置 / 读写超时 / DNS 失败等网络层错误，以及 HTTP 408、429、500、502、503、504。":
    "Can't connect or no 200 yet: connection reset / read-write timeout / DNS failure and other network-level errors, plus HTTP 408, 429, 500, 502, 503, 504.",
  "其余状态码（400 / 401 / 403 / 404 / 413 / 422 等）都是确定性拒绝，重发也一样失败，直接上抛。":
    "Every other status code (400 / 401 / 403 / 404 / 413 / 422 …) is a deterministic rejection — resending fails the same way, so it's raised immediately.",
  "原样重发同一个请求。流一旦开始（已经拿到 200），中途断开就不归这层管了。":
    "Resends the same request as-is. Once the stream has started (the 200 already arrived), a mid-stream drop is no longer this layer's business.",
  重试次数: "Attempts",

  "0.5s→1s→2s 指数（封顶 8s）": "0.5s→1s→2s exponential (capped at 8s)",
  "-1 = 一次都不重试，失败立刻上抛": "-1 = never retry, the failure is raised immediately",

  空响应重试: "Empty-response retry",

  "SDK · 仅 openai 格式": "SDK · openai format only",
  "HTTP 200、finish_reason 是正常 stop，但整条响应一个内容块都没有——网关空帧、思考字段丢帧、采样打嗝都会长这样。":
    "HTTP 200 with a normal stop finish_reason, but the response has no content block at all — empty gateway frames, dropped thinking deltas and sampling hiccups all look like this.",
  "因 max_tokens 截断而没有内容的不算（那要靠调高输出上限解决，重发只会再撞一次）。":
    "No content because of max_tokens truncation doesn't count (that's fixed by raising the output limit; resending just hits it again).",
  "重发整个 prompt，所以在长上下文上比较贵，次数不宜给大。":
    "Resends the whole prompt, so it's expensive on long contexts — don't set the attempts too high.",
  "-1 = 空响应直接原样交出": "-1 = hand the empty response back as-is",

  "同 provider 安全窗口重试": "Same-provider safety-window retry",
  "本项目 · 未交付输出前": "This app · before any output is delivered",
  "流已经建立（拿到 200）之后才出问题：连接中途断开、供应商 overloaded、流内的 429 / 5xx 错误事件——且一个 token 都还没交给调用方。":
    "Something goes wrong after the stream is established (the 200 arrived): the connection drops mid-stream, the provider reports overloaded, or an in-stream 429 / 5xx error event — and not a single token has been delivered to the caller yet.",
  "额度耗尽（402 / insufficient_quota，交给轮询换配置）、上下文过长（413 / context length，交给压缩）、400 / 401 / 403 / 404 / 422 确定性拒绝，都不重试。":
    "Quota exhausted (402 / insufficient_quota, handed to the pool to switch profiles), context too long (413 / context length, handed to compression) and deterministic rejections (400 / 401 / 403 / 404 / 422) are never retried.",
  "在同一个配置上重放同一个请求。因为还没交付任何输出，重放不会重复模型输出或工具执行。":
    "Replays the same request on the same profile. Since no output has been delivered yet, the replay can't duplicate model output or tool executions.",
  "0.5s→1s 指数（封顶 4s）": "0.5s→1s exponential (capped at 4s)",
  "-1 = 断流直接交给外层的意图重跑": "-1 = a dropped stream goes straight to the outer intent-rerun layer",

  轮询熔断: "Pool circuit breaker",

  "本项目 · 进程级，全局一份": "This app · process-wide, one global copy",
  "瞬时失败（429、5xx、网络错误）连续累计到阈值时熔断；余额不足（402）、密钥失效（401 / 403）、模型不存在（404）这类确定性失败不看阈值，第一次就熔断。":
    "Trips when transient failures (429, 5xx, network errors) accumulate to the threshold; deterministic failures — insufficient balance (402), invalid key (401 / 403), missing model (404) — ignore the threshold and trip on the first one.",
  "成功一次即清零，所以偶尔抽风的配置不会被慢慢攒到熔断。":
    "One success resets the counter, so a flaky profile never accumulates its way into a trip.",
  "熔断后进入冷却，冷却期内轮询直接跳过这个配置。状态落库，重启不丢。":
    "Once tripped, the breaker enters cooldown and the pool skips this profile for its duration. State is persisted, so a restart doesn't lose it.",
  连续失败几次熔断: "Failures before tripping",

  "1min→5min→30min 梯度": "1min→5min→30min ladder",
  "-1 = 瞬时失败永不熔断（确定性失败仍然熔断）":
    "-1 = transient failures never trip the breaker (deterministic failures still do)",

  意图重跑: "Intent rerun",

  "前面几层都没兜住：worker 以 model_error 收场——内层重试全部用尽，或者流已经开始交付输出后才断掉（那时重放不安全，只能整条重来）。":
    "Nothing above caught it: the worker ends in model_error — every inner retry was exhausted — or the stream broke after it had started delivering output (replaying is unsafe then, so the whole thing starts over).",
  "额度耗尽已经由轮询换配置处理，不在这里重跑；任务被暂停 / 终止 / 进入收尾时立即让位，不占用退避时间。":
    "Quota exhaustion is already handled by the pool switching profiles, so no rerun here; the step yields immediately when the task is paused / stopped / wrapping up, without consuming backoff time.",
  "整条意图从头再跑一遍。它是最外层，一次重跑意味着里面几层的次数会再乘一遍。":
    "Runs the whole intent again from scratch. It's the outermost layer, so one rerun multiplies the attempt counts of every layer inside it.",
  重跑次数: "Rerun attempts",

  "固定 3s": "Fixed 3s",
  "-1 = 不重跑，该意图直接判为 blocked": "-1 = no rerun, the intent is judged blocked right away",
} satisfies Record<string, string>;

export default messages;
