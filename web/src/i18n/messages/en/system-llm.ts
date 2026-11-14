/**
 * System → LLM page: model profiles, pool/failover sheet, profile editor drawer.
 */

const messages = {
  "全 Agent 共享的格式 / 模型 / 限速配置。点击卡片编辑，星标为当前激活配置。":
    "Format / model / rate-limit settings shared by all agents. Click a card to edit; the star marks the active profile.",
  模型配置: "Model profiles",

  重试与退避: "Retry & backoff",

  轮询配置: "Pool settings",

  已开启: "On",

  新建: "New",

  保存: "Save",

  暂无配置: "No profiles yet",

  "还没有模型配置，点击右上角「新建」创建第一个。":
    'No model profiles yet — click "New" in the top-right to create the first one.',
  已激活: "Active",

  设为激活: "Set active",

  激活中: "Active",

  删除配置: "Delete profile",

  优先级: "Priority",

  "优先级 {n}": "Priority {n}",
  "代理 {proxy}": "Proxy {proxy}",
  思考: "Thinking",

  "思考 {effort}": "Thinking {effort}",
  关: "off",

  不参与轮询: "Excluded from pool",

  正常: "Healthy",

  已熔断: "Tripped",

  "已熔断 · {cooldown}": "Tripped · {cooldown}",
  "异常 · 失败 {fails} 次": "Degraded · {fails} failures",
  "未配置 Key": "Key not configured",
  "未填 API Key，无法调用": "No API key set — calls will fail",

  // ── Pool sheet ──
  "LLM 轮询 · 故障转移": "LLM pool · failover",
  "开启后，": "When enabled, ",
  未指定模型: "agents with no specified model",

  "的 Agent 在当前配置不可用（余额不足 / Key 失效 / 限流 / 服务异常）时自动切到下一个配置。":
    " automatically switch to the next profile when the current one is unavailable (insufficient balance / invalid key / rate limited / service error).",
  启用轮询: "Enable pool",

  "默认关闭。关闭时始终只用激活配置，失败即失败。":
    "Off by default. When off, only the active profile is used and failures stand.",
  "LLM 轮询开关": "LLM pool toggle",
  指定模型失败时也兜底: "Fall back when a specified profile fails",

  "默认关闭：Agent 或任务指定了某个配置就只用它，失败即失败（不会悄悄换成别的模型）。 开启后，指定的配置失败时也会回落到下面的轮询链。":
    "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.",
  绑定配置失败兜底开关: "Fall back on pinned-profile failure toggle",

  轮询顺序: "Pool order",

  全部恢复: "Reset all",

  "当前只有 {n} 个可用配置，轮询不会生效——至少需要 2 个已填 API Key 且参与轮询的配置。":
    "Only {n} usable profile right now — the pool won't kick in; you need at least 2 profiles with an API key that participate in the pool.",
  激活: "Active",

  "冷却 {cooldown}": "Cooldown {cooldown}",
  "连续失败 {n} 次": "{n} consecutive failures",
  立即恢复: "Reset now",

  "立即恢复：清除熔断，下次调用重试该配置": "Reset now: clears the trip so the next call retries this profile",
  "激活配置恒为第 1 顺位，其余按优先级从高到低（在各配置里设置）。某个配置失败后进入冷却 （60s → 5min → 30min），冷却期内被跳过，恢复后自动切回。上下文窗口装不下当前请求的配置会被跳过。 指定了模型的 Agent 与任务默认不参与轮询。":
    "The active profile is always first; the rest follow by priority (set per profile). A failed profile cools down (60s → 5min → 30min), is skipped during cooldown, and rejoins automatically once recovered. Profiles whose context window can't fit the current request are skipped too. Agents and tasks with a pinned model don't join the pool by default.",
  "已开启 LLM 轮询": "LLM pool enabled",
  "已关闭 LLM 轮询": "LLM pool disabled",
  已更新兜底设置: "Fallback setting updated",

  "设置失败：{message}": "Failed to update settings: {message}",
  已恢复该配置: "Profile recovered",

  已恢复全部配置: "All profiles recovered",

  "恢复失败：{message}": "Recovery failed: {message}",

  // ── Profile editor ──
  新建模型配置: "New model profile",

  "编辑：{name}": "Edit: {name}",
  "新建后不会自动激活，请在卡片上「设为激活」以启用。":
    'New profiles aren\'t activated automatically — click "Set active" on the card to enable it.',
  "修改后点击保存；激活配置保存后对全部 Agent 立即生效。":
    "Click save after editing; changes to the active profile take effect for all agents immediately.",
  名称: "Name",

  "例如：OpenAI 生产": "e.g. OpenAI production",
  格式: "Format",

  选择格式: "Select a format",

  模型: "Model",

  "从 API 加载可用模型": "Load available models from the API",
  "Base URL（可选）": "Base URL (optional)",
  "代理（可选）": "Proxy (optional)",
  "仅 LLM 出站请求走此代理，支持 http/https/socks5，可带账号密码（如 socks5://user:pass@host:port，密码含特殊字符需 URL 编码）；留空表示不使用代理（直连）。":
    "Only outbound LLM requests use this proxy. Supports http/https/socks5 with optional credentials (e.g. socks5://user:pass@host:port; URL-encode special characters in the password). Leave empty to connect directly.",
  "自定义会话头（可选）": "Custom session header (optional)",
  "如 x-session-id（留空=不发送）": "e.g. x-session-id (leave empty to disable)",
  "填写头名后，每次请求都会带上这个 HTTP 头，头值自动填为 ":
    "Once set, every request carries this HTTP header, auto-filled with the ",
  "当前会话的 session id": "current session id",
  "（chat 会话如 conv-12、worker 如 exp3-worker-i87）。用于按 session-id 头做提示缓存 / 粘性路由的网关；同一会话多轮稳定、不同会话互不相同。留空则不发送。":
    " (e.g. conv-12 for chats, exp3-worker-i87 for workers). For gateways doing prompt caching / sticky routing by the session-id header: stable across turns within a session, distinct across sessions. Leave empty to disable.",
  "已设置（{hint}），留空保持不变": "Set ({hint}), leave empty to keep",
  每秒限速: "Rate limit / second",

  每分钟限速: "Rate limit / minute",

  "上下文窗口(K)": "Context window (K)",
  "限速 0 = 不限，全 Agent 共享。上下文窗口单位 K（千 token），0 = 默认 200K，上限 1000（即 1M）；设太高会导致压缩不触发。":
    "0 = unlimited, shared across all agents. Context window is in K (thousand tokens); 0 = the 200K default, max 1000 (1M); setting it too high prevents compression from triggering.",
  轮询优先级: "Pool priority",

  "数字越大越先被选中；激活配置恒为第 1 顺位，与本值无关。相同优先级的配置会轮流打头，天然分摊额度。":
    "Higher numbers are tried first; the active profile is always first regardless of this value. Profiles with equal priority take turns leading, spreading usage naturally.",
  "开启后不会被当作故障转移目标（仍可被 Agent / 任务显式指定使用）。 适合「只给某个 Agent 专用、不希望别人失败时烧掉」的昂贵配置。":
    "When on, this profile is never a failover target (agents/tasks can still pin it explicitly). Suited for expensive profiles reserved for one agent that you don't want burned by others' failures.",
  "流式输出 · streaming": "Streaming output · streaming",
  "开启（默认）走流式 SSE，有运行中实时进度与实时 token 计数。 关闭则走真·非流式（stream:false， 一次性返回完整响应）——可绕开部分网关糟糕的 SSE 实现（空帧 / 思考字段丢帧）， 代价是失去运行中的实时进度。":
    "On (default) streams via SSE with live progress and token counts while running. Off uses true non-streaming (stream:false, full response in one shot) — working around buggy gateway SSE implementations (empty frames / dropped thinking deltas), at the cost of losing live progress.",
  流式输出: "Streaming output",

  "输出上限 · max tokens": "Output limit · max tokens",
  "单次回复最多生成多少 token，随每次请求发出。0（默认）= 不发送该字段，由服务端默认值决定。 这与上面的「上下文窗口」是两回事：那是模型总容量，只在本地用来算压缩阈值。 设太小会让推理模型在思考阶段就被截断，一个字答案都出不来。":
    "Max tokens generated per reply, sent with every request. 0 (default) = don't send the field, letting the server decide. This is separate from the context window above: that's the model's total capacity, used only locally for the compression threshold. Too small a value truncates reasoning models during thinking, before a single word of the answer.",
  上限字段名: "Limit field name",

  "上限发哪个键。max_tokens 是默认，绝大多数兼容网关只认它；OpenAI 官方推理模型（o 系列 / GPT-5）反过来只认 max_completion_tokens，收到 max_tokens 会直接报 unsupported_parameter。":
    "Which key carries the limit. max_tokens is the default and nearly every compatible gateway only accepts it; OpenAI's official reasoning models (o-series / GPT-5) instead only accept max_completion_tokens and reject max_tokens with unsupported_parameter.",
  "仅 openai 格式可选。Anthropic 的字段名固定为 max_tokens。":
    "Only selectable for the openai format. Anthropic's field is always max_tokens.",
  "仅 openai 格式可选。Responses API 的字段名固定为 max_output_tokens。":
    "Only selectable for the openai format. The Responses API field is always max_output_tokens.",
  "思考开关 · thinking.type": "Thinking toggle · thinking.type",
  "控制是否发送 thinking 字段。不发送=不带该字段（兼容 MiniMax 等不支持 的模型）；关闭=发 disabled；开启=发 enabled。与下面的强度互相独立。":
    "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.",
  "思考强度 · reasoning_effort": "Reasoning effort · reasoning_effort",
  "独立的强度档位（OpenAI reasoning_effort / Anthropic output_config.effort）。 有些接口没有 thinking 字段、只靠强度即可激活思考，故可单独设置、不发送思考开关。":
    "A standalone effort level (OpenAI reasoning_effort / Anthropic output_config.effort). Some APIs activate reasoning via the effort alone with no thinking field, so it can be set on its own without the toggle above.",
  "不发送（默认）": "Don't send (default)",
  "关闭::state": "Off",
  开启: "On",

  "max_tokens（默认）": "max_tokens (default)",
  测试连接: "Test connection",

  "测试中…": "Testing…",
  请填写名称与模型: "Enter a name and a model",

  "已新建：{name}（在卡片上「设为激活」以启用）": 'Created: {name} (click "Set active" on the card to enable)',
  "已保存，激活配置即时生效，无需重启": "Saved — the active profile takes effect immediately, no restart needed",
  已保存: "Saved",

  "保存失败：{message}": "Save failed: {message}",
  "已加载 {n} 个模型": "Loaded {n} models",
  "加载模型失败：{error}": "Failed to load models: {error}",
  未获取到模型: "no models returned",

  "加载模型出错：{message}": "Error loading models: {message}",
  "连接成功 · {latency}ms · {model}": "Connected · {latency}ms · {model}",
  "回复：{reply}": "Reply: {reply}",
  "连接失败：{error}": "Connection failed: {error}",
  未知: "unknown",

  "测试出错：{message}": "Test error: {message}",
  "已激活：{name}": "Activated: {name}",
  "激活失败：{message}": "Failed to activate: {message}",
  无法删除当前激活的配置: "Can't delete the currently active profile",

  "已删除：{name}": "Deleted: {name}",
  "删除失败：{message}": "Delete failed: {message}",
} satisfies Record<string, string>;

export default messages;
