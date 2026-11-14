/**
 * System settings page (system/settings) translations
 * (keys are the original zh-CN strings).
 */

const messages = {
  "并发数必须是大于 0 的整数": "Concurrency must be an integer greater than 0",
  "已保存并发工作 agent 数（对之后启动的任务生效）": "Saved the worker agent count (applies to tasks started later)",
  "保存失败：{message}": "Save failed: {message}",
  "已保存 Python 解释器配置": "Python interpreter configuration saved",
  "已开启 Agent 自动绑定流量": "Enabled Agent auto traffic binding",
  "已关闭 Agent 自动绑定流量": "Disabled Agent auto traffic binding",
  "已开启 noa 上下文压缩（对之后启动的运行生效）": "Enabled noa context compaction (applies to runs started later)",
  "已关闭 noa 上下文压缩（恢复内置压缩）": "Disabled noa context compaction (built-in compaction restored)",
  已保存网络搜索配置: "Web search configuration saved",

  "已保存 Brave API Key": "Brave API Key saved",
  "已保存 Tavily API Key": "Tavily API Key saved",
  已保存出口代理: "Egress proxy saved",

  "已清除出口代理（改为直连）": "Egress proxy cleared (switched to a direct connection)",
  已保存全局代理: "Global proxy saved",

  "已清除全局代理（改为直连）": "Global proxy cleared (switched to a direct connection)",
  "搜索测试成功 · {backend} 返回 {count} 条结果": "Search test succeeded · {backend} returned {count} results",
  "搜索测试失败：{message}": "Search test failed: {message}",
  未知错误: "unknown error",

  系统配置: "System Settings",

  全局运行时开关: "Global runtime switches",

  流量捕获: "Traffic capture",

  "开启后，所有 Agent 的 HTTP 流量经记录代理全量落库，并向 Agent 注入 traffic_search / traffic_get 工具与代理配置（提示词含代理说明）。":
    "When on, all Agents' HTTP traffic is fully persisted through the recording proxy, and the traffic_search / traffic_get tools plus proxy configuration are injected into Agents (the prompt includes proxy instructions).",
  "关闭（默认）时不记录任何流量：Agent": "Off (the default): no traffic is recorded — Agents",
  不会: "won't",

  "拿到代理配置与流量工具，提示词也": " receive proxy configuration or traffic tools, and prompts ",
  不含: "doesn't include",

  "代理相关内容。切换后会即时重建 Agent 生效。":
    " proxy-related content. Toggling rebuilds Agents immediately to take effect.",
  "已开启 · 正在记录流量并注入代理": "On · Recording traffic and injecting the proxy",
  "已关闭 · 不记录、不注入代理": "Off · Not recording, no proxy injection",
  "Agent 自动绑定流量": "Agent auto traffic binding",
  "默认关闭。开启后，漏洞入库时触发的报告 Agent 会核对已有 HTTP 请求/响应，关联对应流量后再编写报告。":
    "Off by default. When on, the report Agent triggered by filing a finding cross-checks existing HTTP requests/responses, links the matching traffic, then writes the report.",
  "查阅数据包及额外的工具调用会增加 Token 消耗。":
    "Reviewing packets and extra tool calls increases Token consumption.",
  "TCP、未抓包或没有匹配流量时仍可正常上报。此开关不影响流量捕获、人工绑定及已保存证据的查看。 对下一轮 Agent 生效；关闭后会立即拒绝新的自动绑定。":
    "Reporting still works for TCP, uncaptured, or unmatched traffic. This switch doesn't affect traffic capture, manual binding, or viewing saved evidence. It applies to the next Agent round; turning it off immediately rejects new auto-bindings.",
  "已开启 · 会增加 Token 消耗": "On · Increases Token consumption",
  "已关闭 · 可继续人工绑定": "Off · Manual binding still available",
  全局代理: "Global proxy",

  "所有 Agent 的": "All Agents' ",
  目标流量: "target traffic",

  "经此代理出网（隐藏源 IP / 走跳板）。支持 ":
    " exits through this proxy (hiding the source IP / via a jump host). Supports ",
  "，可带": ", and can use",
  " 认证。留空=直连。": " authentication. Leave empty for a direct connection.",
  开启: "When ",

  "时，它作为记录代理的": " is on, it serves as the ",
  上游: "upstream of the recording proxy",

  "（流量仍全量落库，再经此代理出网）；关闭捕获时，直接注入 Agent 的 bash / WebFetch 出网。与网络搜索代理、LLM 代理相互独立。":
    " (traffic is still fully persisted, then exits through this proxy); with capture off, it is injected directly into Agents' bash / WebFetch egress. Independent of the web search proxy and the LLM proxy.",
  提示: "Tip",

  "：socks5 在": ": socks5, when ",
  关闭捕获: "capture is off",

  "时依赖各命令行工具对 ": ", depends on each command-line tool's ",
  " 的支持（curl 可用，部分工具可能忽略）； 若主要用 socks5，建议开启流量捕获——此路径由 MITM 亲自拨号，工具无感知、稳定生效。":
    " support (curl works; some tools may ignore it). If you mainly use socks5, enable traffic capture — that path is dialed by the MITM itself, so tools are unaware of it and it works reliably.",
  代理地址: "Proxy address",

  "socks5://user:pass@host:1080 或 http://host:port（留空=直连）":
    "socks5://user:pass@host:1080 or http://host:port (leave empty = direct)",
  保存: "Save",

  "已配置 · 所有目标流量经此代理出网": "Configured · All target traffic exits through this proxy",
  "未配置 · 目标流量直连出网": "Not configured · Target traffic connects directly",
  操作约束注入: "Operation constraints injection",

  "开启后，把每个任务的": "When on, each task's ",
  操作约束: "operation constraints",

  "（在任务总览「操作约束」里维护的 allow/deny 条目）拼进对应 Agent 的系统提示，用来框定探索边界（如「仅测当前端口」「禁止爆破」）。":
    " (the allow/deny entries maintained under “Operation constraints” in the task overview) are appended to the corresponding Agent's system prompt to frame exploration boundaries (e.g. “only test the current port”, “no brute forcing”).",
  "可分别控制注入到 ": "Injection can be controlled separately for the ",
  "规划者（planner）": "planner",
  "与 ": " and the ",
  "执行者（worker）": "worker",
  "；默认都开。切换即时生效（下一轮读取），无需重建 Agent。关闭后该 Agent 不再看到约束。":
    "; both are on by default. Toggling takes effect immediately (read on the next turn) — no Agent rebuild needed. When off, the Agent no longer sees the constraints.",
  "注入规划者（planner）": "Inject into the planner",
  " · 已开启": " · On",
  " · 已关闭": " · Off",
  "注入执行者（worker）": "Inject into the worker",
  实验功能: "Experimental features",

  "尚在验证中的机制，默认关闭。可能改变 Agent 行为或影响稳定性，请在了解影响后启用。":
    "Mechanisms still being validated, off by default. They may change Agent behavior or affect stability — enable them only after understanding the impact.",
  "noa 上下文压缩": "noa context compaction",
  "：由模型主动压缩长对话历史（norma v0.4.0）。开启后平台接入的四类 Agent（":
    ": the model proactively compresses long conversation history (norma v0.4.0). When enabled, the four Agent types on the platform (",
  "规划者 / 执行者 / 主 Agent / 对话": "Planner / Worker / Main Agent / Chat",
  "）改用 noa 接管上下文，取代内置压缩，压缩原文会归档到任务工作目录下便于回溯。切换即时生效（对之后启动的运行生效），无需重建 Agent；关闭后立即恢复内置压缩。":
    ") switch to noa to take over context handling instead of built-in compaction; the original text is archived under the task's working directory for traceability. Toggling takes effect immediately (for runs started later) with no Agent rebuild; turning it off restores built-in compaction right away.",
  "总开关已开启 · 可在各 Agent 配置里单独启用": "Master switch on · Can be enabled per Agent",
  "已关闭 · 各 Agent 无法启用网络搜索": "Off · Agents can't enable web search",
  网络搜索: "Web search",

  这是网络搜索的: "This is the web search ",

  "总开关 + 来源配置": "master switch + source configuration",
  "。开启后，才能在": ". Only once it's on can you choose in ",
  "每个 Agent 的配置": "each Agent's configuration",
  里单独选择是否启用: " whether to separately enable ",

  "（仅返回标题/链接/摘要，不抓取正文；抓取由 WebFetch 负责）。网络搜索":
    " (returns only titles/links/snippets — it doesn't fetch page content; fetching is handled by WebFetch). Web search ",
  不走: "doesn't use",

  "记录代理，独立于流量捕获。": " the recording proxy; it's independent of traffic capture.",
  "来源可选 ": "Available sources: ",
  "DuckDuckGo（ddgs）": "DuckDuckGo (ddgs)",
  "（无需 Key）、": " (no Key required), ",
  "Brave（免费版）": "Brave (free)",
  "（需填写 Brave API Key）、": " (requires a Brave API Key),",
  "（需填写 Tavily API Key）或 ": " (requires a Tavily API Key) or ",
  "（复用当前 LLM 配置）。总开关关闭时，各 Agent 的网络搜索开关不可用。":
    " (reuses your current LLM configuration). When the master switch is off, per-Agent web search switches are unavailable.",
  搜索来源: "Search source",

  选择来源: "Select a source",

  "DuckDuckGo（ddgs · 免费无 Key）": "DuckDuckGo (ddgs · free, no Key)",
  "Brave（免费版 · 需 Key）": "Brave (free · needs Key)",
  "Tavily（需 Key）": "Tavily (needs Key)",
  "DeepSeek（官方）": "DeepSeek (official)",
  "DeepSeek 官方联网搜索": "DeepSeek official web search",
  该来源直接复用: "This source directly reuses the ",

  "当前激活的 LLM 配置": "currently active LLM configuration",
  "。因此它": ". Therefore it ",
  "仅支持 DeepSeek 官方模型": "only supports official DeepSeek models",
  "，且该配置": ", and that configuration ",
  "必须使用 anthropic 协议": "must use the anthropic protocol",
  "——DeepSeek 的 OpenAI 协议端点不支持服务端搜索。切换 LLM 配置后此来源可能失效。":
    "— DeepSeek's OpenAI-protocol endpoint doesn't support server-side search. This source may stop working after you switch LLM configurations.",
  "与其它来源不同，搜索由 ": "Unlike other sources, searches are ",
  "DeepSeek 服务端执行": "run on DeepSeek's servers",
  "：每次搜索会额外消耗一次模型调用（产生 Token 费用），搜索请求":
    ": each search consumes an extra model call (in Token cost), and search requests ",
  不经过上面的出口代理: "bypass the egress proxy above",

  "，也": ", and are ",
  不计入流量留痕: "not recorded in traffic logs",

  "；返回结果": "; returned results ",
  只有标题和链接: "contain only titles and links",

  "（无摘要），需要正文时由 WebFetch 抓取。": " (no snippets) — WebFetch fetches the full text when needed.",
  "是否满足上述条件由你自行确认，系统不做拦截；可用下方「测试搜索」按钮实际跑一次来验证。":
    "You're responsible for confirming the conditions above — the system won't block you; use the “Test search” button below to actually run a query and verify.",
  已配置: "Configured",

  "已配置（留空则不变）": "Configured (leave blank to keep)",
  "输入 Brave API Key": "Enter the Brave API Key",
  "已选择 Brave 但尚未配置 Key —— 在保存 Key 之前，搜索工具不会启用。":
    "Brave is selected but no Key is configured yet — the search tool stays off until you save a Key.",
  "免费版额度约 2,000 次/月。前往 https://brave.com/search/api/ 获取 Key。":
    "The free tier allows about 2,000 searches/month. Get a Key at https://brave.com/search/api/.",
  "输入 Tavily API Key（tvly-…）": "Enter the Tavily API Key (tvly-…)",
  "已选择 Tavily 但尚未配置 Key —— 在保存 Key 之前，搜索工具不会启用。":
    "Tavily is selected but no Key is configured yet — the search tool stays off until you save a Key.",
  "前往 https://tavily.com 注册并获取 API Key。": "Sign up at https://tavily.com to get an API Key.",
  "出口代理（可选）": "Egress proxy (optional)",
  "http://host:port 或 socks5://host:port（留空=直连）":
    "http://host:port or socks5://host:port (leave empty = direct)",
  "独立出口代理，仅用于访问搜索端点（VPN/SOCKS 等）。与记录流量的 MITM 代理无关；网络不通时经此代理访问。":
    "A separate egress proxy used only to reach search endpoints (VPN/SOCKS, etc.). Unrelated to the traffic-recording MITM proxy; use it when the direct route can't connect.",
  "用当前配置（来源 + 代理 + Key）实际搜索一次「test」，验证是否可用。":
    "Runs a real search for “test” with the current settings (source + proxy + Key) to verify it works.",
  "测试中…": "Testing…",
  测试搜索: "Test search",

  "自定义脚本 · Python 解释器": "Custom scripts · Python interpreter",
  "自定义 ": "Custom ",
  " 类型工具用它跑 Python。开机会自动检测（python3 优先）；此处可手填 venv / 特定版本的绝对路径，留空则运行时自动检测。":
    " script-type tools run Python with it. It's auto-detected at startup (python3 preferred); here you can enter an absolute path to a venv or specific version — leave empty to auto-detect at runtime.",
  "/usr/bin/python3（留空=自动检测）": "/usr/bin/python3 (leave empty = auto-detect)",
  重新检测: "Detect again",

  "工作并发 · Work Agent 数": "Worker concurrency · work agent count",
  "每个任务并发运行的工作 agent 数量（默认 3）。数值越大并发探测越多、消耗也越高。修改后":
    "How many work agents run concurrently per task (default 3). Higher values probe more in parallel but consume more. Changes apply ",
  对之后启动的任务生效: "to tasks started later",

  "，正在运行的任务不受影响。": " — running tasks are unaffected.",
  会话输入框发送键位: "Chat input send key",

  "对话页与任务详情的主 Agent 会话输入框共用此设置，选择后立即生效、无需保存。":
    "Shared by the chat page and the task-detail main Agent input; it takes effect immediately with no saving needed.",
  该偏好: "This preference is ",

  只存在本浏览器: "stored only in this browser",

  "，不随账号同步，换浏览器或清理站点数据后需重新设置。":
    ", is not synced with your account, and must be re-set after switching browsers or clearing site data.",
  发送方式: "Send mode",

  "Enter 发送，Shift+Enter 换行": "Enter to send, Shift+Enter for newline",
  "Ctrl+Enter 发送，Enter 换行": "Ctrl+Enter to send, Enter for newline",
} satisfies Record<string, string>;

export default messages;
