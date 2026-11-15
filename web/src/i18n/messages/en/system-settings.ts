/**
 * System settings page (system/settings) translations
 * (keys are the original zh-CN strings).
 */

const messages = {
  "Concurrency must be an integer greater than 0": "Concurrency must be an integer greater than 0",
  "Saved the worker agent count (applies to tasks started later)":
    "Saved the worker agent count (applies to tasks started later)",
  "Save failed: {message}": "Save failed: {message}",
  "Python interpreter configuration saved": "Python interpreter configuration saved",
  "Enabled Agent auto traffic binding": "Enabled Agent auto traffic binding",
  "Disabled Agent auto traffic binding": "Disabled Agent auto traffic binding",
  "Enabled noa context compaction (applies to runs started later)":
    "Enabled noa context compaction (applies to runs started later)",
  "Disabled noa context compaction (built-in compaction restored)":
    "Disabled noa context compaction (built-in compaction restored)",
  "Web search configuration saved": "Web search configuration saved",
  "Brave API Key saved": "Brave API Key saved",
  "Tavily API Key saved": "Tavily API Key saved",
  "Egress proxy saved": "Egress proxy saved",
  "Egress proxy cleared (switched to a direct connection)": "Egress proxy cleared (switched to a direct connection)",
  "Global proxy saved": "Global proxy saved",
  "Global proxy cleared (switched to a direct connection)": "Global proxy cleared (switched to a direct connection)",
  "Search test succeeded · {backend} returned {count} results":
    "Search test succeeded · {backend} returned {count} results",
  "Search test failed: {message}": "Search test failed: {message}",
  "unknown error": "unknown error",
  "System Settings": "System Settings",
  "Global runtime switches": "Global runtime switches",
  "Traffic capture": "Traffic capture",
  "When on, all Agents' HTTP traffic is fully persisted through the recording proxy, and the traffic_search / traffic_get tools plus proxy configuration are injected into Agents (the prompt includes proxy instructions).":
    "When on, all Agents' HTTP traffic is fully persisted through the recording proxy, and the traffic_search / traffic_get tools plus proxy configuration are injected into Agents (the prompt includes proxy instructions).",
  "Off (the default): no traffic is recorded — Agents": "Off (the default): no traffic is recorded — Agents",
  "won't": "won't",
  " receive proxy configuration or traffic tools, and prompts ":
    " receive proxy configuration or traffic tools, and prompts ",
  "doesn't include": "doesn't include",
  " proxy-related content. Toggling rebuilds Agents immediately to take effect.":
    " proxy-related content. Toggling rebuilds Agents immediately to take effect.",
  "On · Recording traffic and injecting the proxy": "On · Recording traffic and injecting the proxy",
  "Off · Not recording, no proxy injection": "Off · Not recording, no proxy injection",
  "Agent auto traffic binding": "Agent auto traffic binding",
  "Off by default. When on, the report Agent triggered by filing a finding cross-checks existing HTTP requests/responses, links the matching traffic, then writes the report.":
    "Off by default. When on, the report Agent triggered by filing a finding cross-checks existing HTTP requests/responses, links the matching traffic, then writes the report.",
  "Reviewing packets and extra tool calls increases Token consumption.":
    "Reviewing packets and extra tool calls increases Token consumption.",
  "Reporting still works for TCP, uncaptured, or unmatched traffic. This switch doesn't affect traffic capture, manual binding, or viewing saved evidence. It applies to the next Agent round; turning it off immediately rejects new auto-bindings.":
    "Reporting still works for TCP, uncaptured, or unmatched traffic. This switch doesn't affect traffic capture, manual binding, or viewing saved evidence. It applies to the next Agent round; turning it off immediately rejects new auto-bindings.",
  "On · Increases Token consumption": "On · Increases Token consumption",
  "Off · Manual binding still available": "Off · Manual binding still available",
  "Global proxy": "Global proxy",
  "All Agents' ": "All Agents' ",
  "target traffic": "target traffic",
  " exits through this proxy (hiding the source IP / via a jump host). Supports ":
    " exits through this proxy (hiding the source IP / via a jump host). Supports ",
  ", and can use": ", and can use",
  " authentication. Leave empty for a direct connection.": " authentication. Leave empty for a direct connection.",
  "When ": "When ",
  " is on, it serves as the ": " is on, it serves as the ",
  "upstream of the recording proxy": "upstream of the recording proxy",
  " (traffic is still fully persisted, then exits through this proxy); with capture off, it is injected directly into Agents' bash / WebFetch egress. Independent of the web search proxy and the LLM proxy.":
    " (traffic is still fully persisted, then exits through this proxy); with capture off, it is injected directly into Agents' bash / WebFetch egress. Independent of the web search proxy and the LLM proxy.",
  Tip: "Tip",
  ": socks5, when ": ": socks5, when ",
  "capture is off": "capture is off",
  ", depends on each command-line tool's ": ", depends on each command-line tool's ",
  " support (curl works; some tools may ignore it). If you mainly use socks5, enable traffic capture — that path is dialed by the MITM itself, so tools are unaware of it and it works reliably.":
    " support (curl works; some tools may ignore it). If you mainly use socks5, enable traffic capture — that path is dialed by the MITM itself, so tools are unaware of it and it works reliably.",
  "Proxy address": "Proxy address",
  "socks5://user:pass@host:1080 or http://host:port (leave empty = direct)":
    "socks5://user:pass@host:1080 or http://host:port (leave empty = direct)",
  Save: "Save",
  "Configured · All target traffic exits through this proxy":
    "Configured · All target traffic exits through this proxy",
  "Not configured · Target traffic connects directly": "Not configured · Target traffic connects directly",
  "Operation constraints injection": "Operation constraints injection",
  "When on, each task's ": "When on, each task's ",
  "operation constraints": "operation constraints",
  " (the allow/deny entries maintained under “Operation constraints” in the task overview) are appended to the corresponding Agent's system prompt to frame exploration boundaries (e.g. “only test the current port”, “no brute forcing”).":
    " (the allow/deny entries maintained under “Operation constraints” in the task overview) are appended to the corresponding Agent's system prompt to frame exploration boundaries (e.g. “only test the current port”, “no brute forcing”).",
  "Injection can be controlled separately for the ": "Injection can be controlled separately for the ",
  planner: "planner",
  " and the ": " and the ",
  worker: "worker",
  "; both are on by default. Toggling takes effect immediately (read on the next turn) — no Agent rebuild needed. When off, the Agent no longer sees the constraints.":
    "; both are on by default. Toggling takes effect immediately (read on the next turn) — no Agent rebuild needed. When off, the Agent no longer sees the constraints.",
  "Inject into the planner": "Inject into the planner",
  " · On": " · On",
  " · Off": " · Off",
  "Inject into the worker": "Inject into the worker",
  "Experimental features": "Experimental features",
  "Mechanisms still being validated, off by default. They may change Agent behavior or affect stability — enable them only after understanding the impact.":
    "Mechanisms still being validated, off by default. They may change Agent behavior or affect stability — enable them only after understanding the impact.",
  "noa context compaction": "noa context compaction",
  ": the model proactively compresses long conversation history (norma v0.4.0). When enabled, the four Agent types on the platform (":
    ": the model proactively compresses long conversation history (norma v0.4.0). When enabled, the four Agent types on the platform (",
  "Planner / Worker / Main Agent / Chat": "Planner / Worker / Main Agent / Chat",
  ") switch to noa to take over context handling instead of built-in compaction; the original text is archived under the task's working directory for traceability. Toggling takes effect immediately (for runs started later) with no Agent rebuild; turning it off restores built-in compaction right away.":
    ") switch to noa to take over context handling instead of built-in compaction; the original text is archived under the task's working directory for traceability. Toggling takes effect immediately (for runs started later) with no Agent rebuild; turning it off restores built-in compaction right away.",
  "Master switch on · Can be enabled per Agent": "Master switch on · Can be enabled per Agent",
  "Off · Agents can't enable web search": "Off · Agents can't enable web search",
  "Web search": "Web search",
  "This is the web search ": "This is the web search ",
  "master switch + source configuration": "master switch + source configuration",
  ". Only once it's on can you choose in ": ". Only once it's on can you choose in ",
  "each Agent's configuration": "each Agent's configuration",
  " whether to separately enable ": " whether to separately enable ",
  " (returns only titles/links/snippets — it doesn't fetch page content; fetching is handled by WebFetch). Web search ":
    " (returns only titles/links/snippets — it doesn't fetch page content; fetching is handled by WebFetch). Web search ",
  "doesn't use": "doesn't use",
  " the recording proxy; it's independent of traffic capture.":
    " the recording proxy; it's independent of traffic capture.",
  "Available sources: ": "Available sources: ",
  "DuckDuckGo（ddgs）": "DuckDuckGo (ddgs)",
  " (no Key required), ": " (no Key required), ",
  "Brave (free)": "Brave (free)",
  " (requires a Brave API Key),": " (requires a Brave API Key),",
  " (requires a Tavily API Key) or ": " (requires a Tavily API Key) or ",
  " (reuses your current LLM configuration). When the master switch is off, per-Agent web search switches are unavailable.":
    " (reuses your current LLM configuration). When the master switch is off, per-Agent web search switches are unavailable.",
  "Search source": "Search source",
  "Select a source": "Select a source",
  "DuckDuckGo (ddgs · free, no Key)": "DuckDuckGo (ddgs · free, no Key)",
  "Brave (free · needs Key)": "Brave (free · needs Key)",
  "Tavily (needs Key)": "Tavily (needs Key)",
  "DeepSeek (official)": "DeepSeek (official)",
  "DeepSeek official web search": "DeepSeek official web search",
  "This source directly reuses the ": "This source directly reuses the ",
  "currently active LLM configuration": "currently active LLM configuration",
  ". Therefore it ": ". Therefore it ",
  "only supports official DeepSeek models": "only supports official DeepSeek models",
  ", and that configuration ": ", and that configuration ",
  "must use the anthropic protocol": "must use the anthropic protocol",
  "— DeepSeek's OpenAI-protocol endpoint doesn't support server-side search. This source may stop working after you switch LLM configurations.":
    "— DeepSeek's OpenAI-protocol endpoint doesn't support server-side search. This source may stop working after you switch LLM configurations.",
  "Unlike other sources, searches are ": "Unlike other sources, searches are ",
  "run on DeepSeek's servers": "run on DeepSeek's servers",
  ": each search consumes an extra model call (in Token cost), and search requests ":
    ": each search consumes an extra model call (in Token cost), and search requests ",
  "bypass the egress proxy above": "bypass the egress proxy above",
  ", and are ": ", and are ",
  "not recorded in traffic logs": "not recorded in traffic logs",
  "; returned results ": "; returned results ",
  "contain only titles and links": "contain only titles and links",
  " (no snippets) — WebFetch fetches the full text when needed.":
    " (no snippets) — WebFetch fetches the full text when needed.",
  "You're responsible for confirming the conditions above — the system won't block you; use the “Test search” button below to actually run a query and verify.":
    "You're responsible for confirming the conditions above — the system won't block you; use the “Test search” button below to actually run a query and verify.",
  Configured: "Configured",
  "Configured (leave blank to keep)": "Configured (leave blank to keep)",
  "Enter the Brave API Key": "Enter the Brave API Key",
  "Brave is selected but no Key is configured yet — the search tool stays off until you save a Key.":
    "Brave is selected but no Key is configured yet — the search tool stays off until you save a Key.",
  "The free tier allows about 2,000 searches/month. Get a Key at https://brave.com/search/api/.":
    "The free tier allows about 2,000 searches/month. Get a Key at https://brave.com/search/api/.",
  "Enter the Tavily API Key (tvly-…)": "Enter the Tavily API Key (tvly-…)",
  "Tavily is selected but no Key is configured yet — the search tool stays off until you save a Key.":
    "Tavily is selected but no Key is configured yet — the search tool stays off until you save a Key.",
  "Sign up at https://tavily.com to get an API Key.": "Sign up at https://tavily.com to get an API Key.",
  "Egress proxy (optional)": "Egress proxy (optional)",
  "http://host:port or socks5://host:port (leave empty = direct)":
    "http://host:port or socks5://host:port (leave empty = direct)",
  "A separate egress proxy used only to reach search endpoints (VPN/SOCKS, etc.). Unrelated to the traffic-recording MITM proxy; use it when the direct route can't connect.":
    "A separate egress proxy used only to reach search endpoints (VPN/SOCKS, etc.). Unrelated to the traffic-recording MITM proxy; use it when the direct route can't connect.",
  "Runs a real search for “test” with the current settings (source + proxy + Key) to verify it works.":
    "Runs a real search for “test” with the current settings (source + proxy + Key) to verify it works.",
  "Testing…": "Testing…",
  "Test search": "Test search",
  "Custom scripts · Python interpreter": "Custom scripts · Python interpreter",
  "Custom ": "Custom ",
  " script-type tools run Python with it. It's auto-detected at startup (python3 preferred); here you can enter an absolute path to a venv or specific version — leave empty to auto-detect at runtime.":
    " script-type tools run Python with it. It's auto-detected at startup (python3 preferred); here you can enter an absolute path to a venv or specific version — leave empty to auto-detect at runtime.",
  "/usr/bin/python3 (leave empty = auto-detect)": "/usr/bin/python3 (leave empty = auto-detect)",
  "Detect again": "Detect again",
  "Worker concurrency · work agent count": "Worker concurrency · work agent count",
  "How many work agents run concurrently per task (default 3). Higher values probe more in parallel but consume more. Changes apply ":
    "How many work agents run concurrently per task (default 3). Higher values probe more in parallel but consume more. Changes apply ",
  "to tasks started later": "to tasks started later",
  " — running tasks are unaffected.": " — running tasks are unaffected.",
  "Chat input send key": "Chat input send key",
  "Shared by the chat page and the task-detail main Agent input; it takes effect immediately with no saving needed.":
    "Shared by the chat page and the task-detail main Agent input; it takes effect immediately with no saving needed.",
  "This preference is ": "This preference is ",
  "stored only in this browser": "stored only in this browser",
  ", is not synced with your account, and must be re-set after switching browsers or clearing site data.":
    ", is not synced with your account, and must be re-set after switching browsers or clearing site data.",
  "Send mode": "Send mode",
  "Enter to send, Shift+Enter for newline": "Enter to send, Shift+Enter for newline",
  "Ctrl+Enter to send, Enter for newline": "Ctrl+Enter to send, Enter for newline",
} satisfies Record<string, string>;

export default messages;
