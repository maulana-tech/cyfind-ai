/**
 * System → LLM page: model profiles, pool/failover sheet, profile editor drawer.
 */

const messages = {
  "Format / model / rate-limit settings shared by all agents. Click a card to edit; the star marks the active profile.":
    "Format / model / rate-limit settings shared by all agents. Click a card to edit; the star marks the active profile.",
  "Model profiles": "Model profiles",
  "Retry & backoff": "Retry & backoff",
  "Pool settings": "Pool settings",
  On: "On",
  New: "New",
  Save: "Save",
  "No profiles yet": "No profiles yet",
  'No model profiles yet — click "New" in the top-right to create the first one.':
    'No model profiles yet — click "New" in the top-right to create the first one.',
  Active: "Active",
  "Set active": "Set active",
  "Delete profile": "Delete profile",
  Priority: "Priority",
  "Priority {n}": "Priority {n}",
  "Proxy {proxy}": "Proxy {proxy}",
  Thinking: "Thinking",
  "Thinking {effort}": "Thinking {effort}",
  off: "off",
  "Excluded from pool": "Excluded from pool",
  Healthy: "Healthy",
  Tripped: "Tripped",
  "Tripped · {cooldown}": "Tripped · {cooldown}",
  "Degraded · {fails} failures": "Degraded · {fails} failures",
  "Key not configured": "Key not configured",
  "No API key set — calls will fail": "No API key set — calls will fail",
  "LLM pool · failover": "LLM pool · failover",
  "When enabled, ": "When enabled, ",
  "agents with no specified model": "agents with no specified model",
  " automatically switch to the next profile when the current one is unavailable (insufficient balance / invalid key / rate limited / service error).":
    " automatically switch to the next profile when the current one is unavailable (insufficient balance / invalid key / rate limited / service error).",
  "Enable pool": "Enable pool",
  "Off by default. When off, only the active profile is used and failures stand.":
    "Off by default. When off, only the active profile is used and failures stand.",
  "LLM pool toggle": "LLM pool toggle",
  "Fall back when a specified profile fails": "Fall back when a specified profile fails",
  "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.":
    "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.",
  "Fall back on pinned-profile failure toggle": "Fall back on pinned-profile failure toggle",
  "Pool order": "Pool order",
  "Reset all": "Reset all",
  "Only {n} usable profile right now — the pool won't kick in; you need at least 2 profiles with an API key that participate in the pool.":
    "Only {n} usable profile right now — the pool won't kick in; you need at least 2 profiles with an API key that participate in the pool.",
  "Cooldown {cooldown}": "Cooldown {cooldown}",
  "{n} consecutive failures": "{n} consecutive failures",
  "Reset now": "Reset now",
  "Reset now: clears the trip so the next call retries this profile":
    "Reset now: clears the trip so the next call retries this profile",
  "The active profile is always first; the rest follow by priority (set per profile). A failed profile cools down (60s → 5min → 30min), is skipped during cooldown, and rejoins automatically once recovered. Profiles whose context window can't fit the current request are skipped too. Agents and tasks with a pinned model don't join the pool by default.":
    "The active profile is always first; the rest follow by priority (set per profile). A failed profile cools down (60s → 5min → 30min), is skipped during cooldown, and rejoins automatically once recovered. Profiles whose context window can't fit the current request are skipped too. Agents and tasks with a pinned model don't join the pool by default.",
  "LLM pool enabled": "LLM pool enabled",
  "LLM pool disabled": "LLM pool disabled",
  "Fallback setting updated": "Fallback setting updated",
  "Failed to update settings: {message}": "Failed to update settings: {message}",
  "Profile recovered": "Profile recovered",
  "All profiles recovered": "All profiles recovered",
  "Restore failed: {message}": "Restore failed: {message}",
  "New model profile": "New model profile",
  "Edit: {name}": "Edit: {name}",
  'New profiles aren\'t activated automatically — click "Set active" on the card to enable it.':
    'New profiles aren\'t activated automatically — click "Set active" on the card to enable it.',
  "Click save after editing; changes to the active profile take effect for all agents immediately.":
    "Click save after editing; changes to the active profile take effect for all agents immediately.",
  Name: "Name",
  "e.g. OpenAI production": "e.g. OpenAI production",
  Format: "Format",
  "Select a format": "Select a format",
  Model: "Model",
  "Load available models from the API": "Load available models from the API",
  "Base URL (optional)": "Base URL (optional)",
  "Proxy (optional)": "Proxy (optional)",
  "Only outbound LLM requests use this proxy. Supports http/https/socks5 with optional credentials (e.g. socks5://user:pass@host:port; URL-encode special characters in the password). Leave empty to connect directly.":
    "Only outbound LLM requests use this proxy. Supports http/https/socks5 with optional credentials (e.g. socks5://user:pass@host:port; URL-encode special characters in the password). Leave empty to connect directly.",
  "Custom session header (optional)": "Custom session header (optional)",
  "e.g. x-session-id (leave empty to disable)": "e.g. x-session-id (leave empty to disable)",
  "Once set, every request carries this HTTP header, auto-filled with the ":
    "Once set, every request carries this HTTP header, auto-filled with the ",
  "current session id": "current session id",
  " (e.g. conv-12 for chats, exp3-worker-i87 for workers). For gateways doing prompt caching / sticky routing by the session-id header: stable across turns within a session, distinct across sessions. Leave empty to disable.":
    " (e.g. conv-12 for chats, exp3-worker-i87 for workers). For gateways doing prompt caching / sticky routing by the session-id header: stable across turns within a session, distinct across sessions. Leave empty to disable.",
  "Set ({hint}), leave empty to keep": "Set ({hint}), leave empty to keep",
  "Rate limit / second": "Rate limit / second",
  "Rate limit / minute": "Rate limit / minute",
  "Context window (K)": "Context window (K)",
  "0 = unlimited, shared across all agents. Context window is in K (thousand tokens); 0 = the 200K default, max 1000 (1M); setting it too high prevents compression from triggering.":
    "0 = unlimited, shared across all agents. Context window is in K (thousand tokens); 0 = the 200K default, max 1000 (1M); setting it too high prevents compression from triggering.",
  "Pool priority": "Pool priority",
  "Higher numbers are tried first; the active profile is always first regardless of this value. Profiles with equal priority take turns leading, spreading usage naturally.":
    "Higher numbers are tried first; the active profile is always first regardless of this value. Profiles with equal priority take turns leading, spreading usage naturally.",
  "When on, this profile is never a failover target (agents/tasks can still pin it explicitly). Suited for expensive profiles reserved for one agent that you don't want burned by others' failures.":
    "When on, this profile is never a failover target (agents/tasks can still pin it explicitly). Suited for expensive profiles reserved for one agent that you don't want burned by others' failures.",
  "Streaming output · streaming": "Streaming output · streaming",
  "On (default) streams via SSE with live progress and token counts while running. Off uses true non-streaming (stream:false, full response in one shot) — working around buggy gateway SSE implementations (empty frames / dropped thinking deltas), at the cost of losing live progress.":
    "On (default) streams via SSE with live progress and token counts while running. Off uses true non-streaming (stream:false, full response in one shot) — working around buggy gateway SSE implementations (empty frames / dropped thinking deltas), at the cost of losing live progress.",
  "Streaming output": "Streaming output",
  "Output limit · max tokens": "Output limit · max tokens",
  "Max tokens generated per reply, sent with every request. 0 (default) = don't send the field, letting the server decide. This is separate from the context window above: that's the model's total capacity, used only locally for the compression threshold. Too small a value truncates reasoning models during thinking, before a single word of the answer.":
    "Max tokens generated per reply, sent with every request. 0 (default) = don't send the field, letting the server decide. This is separate from the context window above: that's the model's total capacity, used only locally for the compression threshold. Too small a value truncates reasoning models during thinking, before a single word of the answer.",
  "Limit field name": "Limit field name",
  "Which key carries the limit. max_tokens is the default and nearly every compatible gateway only accepts it; OpenAI's official reasoning models (o-series / GPT-5) instead only accept max_completion_tokens and reject max_tokens with unsupported_parameter.":
    "Which key carries the limit. max_tokens is the default and nearly every compatible gateway only accepts it; OpenAI's official reasoning models (o-series / GPT-5) instead only accept max_completion_tokens and reject max_tokens with unsupported_parameter.",
  "Only selectable for the openai format. Anthropic's field is always max_tokens.":
    "Only selectable for the openai format. Anthropic's field is always max_tokens.",
  "Only selectable for the openai format. The Responses API field is always max_output_tokens.":
    "Only selectable for the openai format. The Responses API field is always max_output_tokens.",
  "Thinking toggle · thinking.type": "Thinking toggle · thinking.type",
  "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.":
    "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.",
  "Reasoning effort · reasoning_effort": "Reasoning effort · reasoning_effort",
  "A standalone effort level (OpenAI reasoning_effort / Anthropic output_config.effort). Some APIs activate reasoning via the effort alone with no thinking field, so it can be set on its own without the toggle above.":
    "A standalone effort level (OpenAI reasoning_effort / Anthropic output_config.effort). Some APIs activate reasoning via the effort alone with no thinking field, so it can be set on its own without the toggle above.",
  "Don't send (default)": "Don't send (default)",
  Off: "Off",
  "When ": "When ",
  "max_tokens (default)": "max_tokens (default)",
  "Test connection": "Test connection",
  "Testing…": "Testing…",
  "Enter a name and a model": "Enter a name and a model",
  'Created: {name} (click "Set active" on the card to enable)':
    'Created: {name} (click "Set active" on the card to enable)',
  "Saved — the active profile takes effect immediately, no restart needed":
    "Saved — the active profile takes effect immediately, no restart needed",
  Saved: "Saved",
  "Save failed: {message}": "Save failed: {message}",
  "Loaded {n} models": "Loaded {n} models",
  "Failed to load models: {error}": "Failed to load models: {error}",
  "no models returned": "no models returned",
  "Error loading models: {message}": "Error loading models: {message}",
  "Connected · {latency}ms · {model}": "Connected · {latency}ms · {model}",
  "Reply: {reply}": "Reply: {reply}",
  "Connection failed: {error}": "Connection failed: {error}",
  unknown: "unknown",
  "Test error: {message}": "Test error: {message}",
  "Activated: {name}": "Activated: {name}",
  "Failed to activate: {message}": "Failed to activate: {message}",
  "Can't delete the currently active profile": "Can't delete the currently active profile",
  "Deleted: {name}": "Deleted: {name}",
  "Delete failed: {message}": "Delete failed: {message}",
} satisfies Record<string, string>;

export default messages;
