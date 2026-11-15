"use client";

import * as React from "react";

import {
  CpuIcon,
  DownloadIcon,
  FlaskConicalIcon,
  KeyboardIcon,
  RadioTowerIcon,
  SearchIcon,
  ShieldAlertIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { CHAT_SEND_MODE_OPTIONS, type ChatSendMode, setChatSendMode, useChatSendMode } from "@/lib/chat-send-mode";
import type { Settings } from "@/lib/types";

import { UpdateCard } from "./_components/update-card";

export default function SystemSettingsPage() {
  const t = useT();
  const [trafficCapture, setTrafficCapture] = React.useState(false);
  const [agentTrafficBinding, setAgentTrafficBinding] = React.useState(false);
  const [webSearch, setWebSearch] = React.useState(false);
  const [backend, setBackend] = React.useState("ddgs");
  const [braveKeySet, setBraveKeySet] = React.useState(false);
  const [braveKeyInput, setBraveKeyInput] = React.useState("");
  const [tavilyKeySet, setTavilyKeySet] = React.useState(false);
  const [tavilyKeyInput, setTavilyKeyInput] = React.useState("");
  const [savingTavilyKey, setSavingTavilyKey] = React.useState(false);
  const [proxyInput, setProxyInput] = React.useState("");
  const [savingProxy, setSavingProxy] = React.useState(false);
  const [globalProxyInput, setGlobalProxyInput] = React.useState("");
  const [savingGlobalProxy, setSavingGlobalProxy] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingKey, setSavingKey] = React.useState(false);
  const [pyInterp, setPyInterp] = React.useState("");
  const [workers, setWorkers] = React.useState("3");
  const [savingWorkers, setSavingWorkers] = React.useState(false);
  // Operation-constraint injection scope (all on by default).
  const [injectPlanner, setInjectPlanner] = React.useState(true);
  const [injectWorker, setInjectWorker] = React.useState(true);
  // Experimental feature: noa context compression (off by default).
  const [noaCompaction, setNoaCompaction] = React.useState(false);
  // Pure frontend preference: does not go through /api/settings, reads/writes localStorage directly.
  const sendMode = useChatSendMode();
  const [tab, setTab] = React.useState("version");

  const apply = React.useCallback((s: Settings) => {
    setTrafficCapture(!!s.traffic_capture);
    setAgentTrafficBinding(!!s.agent_traffic_binding);
    setWebSearch(!!s.web_search_enabled);
    setBackend(s.web_search_backend || "ddgs");
    setBraveKeySet(!!s.brave_key_set);
    setTavilyKeySet(!!s.tavily_key_set);
    setProxyInput(s.web_search_proxy ?? "");
    setGlobalProxyInput(s.global_proxy ?? "");
    setPyInterp(s.python_interpreter ?? "");
    setWorkers(String(s.workers ?? 3));
    setInjectPlanner(s.constraints_inject_planner !== false);
    setInjectWorker(s.constraints_inject_worker !== false);
    setNoaCompaction(!!s.noa_compaction);
  }, []);

  const saveWorkers = () => {
    const n = Number(workers);
    if (!Number.isInteger(n) || n <= 0) {
      toast.error(t("Concurrency must be an integer greater than 0"));
      return;
    }
    setSavingWorkers(true);
    api
      .setSettings({ workers: n })
      .then((s) => {
        apply(s);
        toast.success(t("Saved the worker agent count (applies to tasks started later)"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSavingWorkers(false));
  };

  const savePython = () => {
    setSaving(true);
    api
      .setSettings({ python_interpreter: pyInterp.trim() })
      .then((s) => {
        apply(s);
        toast.success(t("Python interpreter configuration saved"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSaving(false));
  };
  const detectPython = () => {
    setSaving(true);
    api
      .detectPython()
      .then((r) => setPyInterp(r.python_interpreter))
      .catch(() => undefined)
      .finally(() => setSaving(false));
  };

  React.useEffect(() => {
    api
      .settings()
      .then(apply)
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [apply]);

  const toggleTraffic = (v: boolean) => {
    setTrafficCapture(v); // optimistic
    setSaving(true);
    api
      .setSettings({ traffic_capture: v })
      .then(apply)
      .catch(() => setTrafficCapture(!v)) // revert on failure
      .finally(() => setSaving(false));
  };

  const toggleInjectPlanner = (v: boolean) => {
    setInjectPlanner(v); // optimistic
    api
      .setSettings({ constraints_inject_planner: v })
      .then(apply)
      .catch(() => setInjectPlanner(!v)); // revert on failure
  };

  const toggleAgentTrafficBinding = (v: boolean) => {
    setAgentTrafficBinding(v);
    setSaving(true);
    api
      .setSettings({ agent_traffic_binding: v })
      .then((s) => {
        apply(s);
        toast.success(v ? t("Enabled Agent auto traffic binding") : t("Disabled Agent auto traffic binding"));
      })
      .catch((e) => {
        setAgentTrafficBinding(!v);
        toast.error(t("Save failed: {message}", { message: (e as Error).message }));
      })
      .finally(() => setSaving(false));
  };

  const toggleInjectWorker = (v: boolean) => {
    setInjectWorker(v); // optimistic
    api
      .setSettings({ constraints_inject_worker: v })
      .then(apply)
      .catch(() => setInjectWorker(!v)); // revert on failure
  };

  const toggleNoaCompaction = (v: boolean) => {
    setNoaCompaction(v); // optimistic
    api
      .setSettings({ noa_compaction: v })
      .then((s) => {
        apply(s);
        toast.success(
          v ? t("Enabled noa context compaction (applies to runs started later)") : t("Disabled noa context compaction (built-in compaction restored)"),
        );
      })
      .catch((e) => {
        setNoaCompaction(!v); // revert on failure
        toast.error(t("Save failed: {message}", { message: (e as Error).message }));
      });
  };

  // Persist a web-search patch (enable and/or backend). Optimistic with refetch.
  const saveWebSearch = (patch: Partial<Settings>) => {
    setSaving(true);
    api
      .setSettings(patch)
      .then((s) => {
        apply(s);
        toast.success(t("Web search configuration saved"));
      })
      .catch((e) => {
        toast.error(t("Save failed: {message}", { message: (e as Error).message }));
        api
          .settings()
          .then(apply)
          .catch(() => undefined);
      })
      .finally(() => setSaving(false));
  };

  const saveBraveKey = () => {
    setSavingKey(true);
    api
      .setSettings({ brave_search_api_key: braveKeyInput })
      .then((s) => {
        apply(s);
        setBraveKeyInput("");
        toast.success(t("Brave API Key saved"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSavingKey(false));
  };

  const saveTavilyKey = () => {
    setSavingTavilyKey(true);
    api
      .setSettings({ tavily_search_api_key: tavilyKeyInput })
      .then((s) => {
        apply(s);
        setTavilyKeyInput("");
        toast.success(t("Tavily API Key saved"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSavingTavilyKey(false));
  };

  const saveProxy = () => {
    setSavingProxy(true);
    api
      .setSettings({ web_search_proxy: proxyInput.trim() })
      .then((s) => {
        apply(s);
        toast.success(proxyInput.trim() ? t("Egress proxy saved") : t("Egress proxy cleared (switched to a direct connection)"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSavingProxy(false));
  };

  const saveGlobalProxy = () => {
    setSavingGlobalProxy(true);
    api
      .setSettings({ global_proxy: globalProxyInput.trim() })
      .then((s) => {
        apply(s);
        toast.success(globalProxyInput.trim() ? t("Global proxy saved") : t("Global proxy cleared (switched to a direct connection)"));
      })
      .catch((e) => toast.error(t("Save failed: {message}", { message: (e as Error).message })))
      .finally(() => setSavingGlobalProxy(false));
  };

  // Run a real "test" search ("test") against the CURRENT form values (backend +
  // proxy + entered key), falling back to saved values server-side. Toasts result.
  const runTest = () => {
    setTesting(true);
    api
      .testWebSearch({
        web_search_backend: backend,
        web_search_proxy: proxyInput.trim(),
        brave_search_api_key: braveKeyInput,
        tavily_search_api_key: tavilyKeyInput,
      })
      .then((r) => {
        if (r.ok)
          toast.success(t("Search test succeeded · {backend} returned {count} results", { backend: r.backend, count: r.count }));
        else toast.error(t("Search test failed: {message}", { message: r.error || t("unknown error") }));
      })
      .catch((e) => toast.error(t("Search test failed: {message}", { message: (e as Error).message })))
      .finally(() => setTesting(false));
  };

  // brave-free selected but no key stored and none being entered → tool stays off.
  const braveNeedsKey = webSearch && backend === "brave-free" && !braveKeySet;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div>
        <h1 className="font-semibold text-xl tracking-tight">{t("System Settings")}</h1>
        <p className="text-muted-foreground text-sm">{t("Global runtime switches")}</p>
      </div>

      {/* Fixed (sticky) tab bar; each tab is a themed group rendered as its own top-aligned 2-col grid.
          We avoid CSS multi-column, which fragments tall cards and overlaps their content. */}
      <Tabs value={tab} onValueChange={setTab} className="gap-0">
        <div className="-mx-1 sticky top-14 z-20 bg-background/85 px-1 py-2 backdrop-blur md:top-16">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="gap-1.5">
                <s.Icon className="size-3.5" />
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="version" className="mt-6">
          <SectionHeading
            icon={<DownloadIcon className="size-4" />}
            title="Version & updates"
            desc="Current build and one-click GitHub updates."
          />
          <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
            <UpdateCard />
          </div>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <SectionHeading
            icon={<RadioTowerIcon className="size-4" />}
            title="Network & traffic"
            desc="Traffic capture, agent auto-binding and the global egress proxy."
          />
          <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadioTowerIcon className="size-4" />
                  {t("Traffic capture")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "When on, all Agents' HTTP traffic is fully persisted through the recording proxy, and the traffic_search / traffic_get tools plus proxy configuration are injected into Agents (the prompt includes proxy instructions).",
                  )}
                  <br />
                  {t("Off (the default): no traffic is recorded — Agents")}
                  <b>{t("won't")}</b>
                  {t(" receive proxy configuration or traffic tools, and prompts ")}
                  <b>{t("doesn't include")}</b>
                  {t(" proxy-related content. Toggling rebuilds Agents immediately to take effect.")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <Label htmlFor="traffic-capture" className="font-normal text-muted-foreground text-sm">
                  {trafficCapture ? t("On · Recording traffic and injecting the proxy") : t("Off · Not recording, no proxy injection")}
                </Label>
                <Switch
                  id="traffic-capture"
                  checked={trafficCapture}
                  disabled={!loaded || saving}
                  onCheckedChange={toggleTraffic}
                />
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadioTowerIcon className="size-4" />
                  {t("Agent auto traffic binding")}
                </CardTitle>
                <CardDescription id="agent-traffic-binding-description">
                  {t(
                    "Off by default. When on, the report Agent triggered by filing a finding cross-checks existing HTTP requests/responses, links the matching traffic, then writes the report.",
                  )}
                  <b>{t("Reviewing packets and extra tool calls increases Token consumption.")}</b>
                  <br />
                  {t(
                    "Reporting still works for TCP, uncaptured, or unmatched traffic. This switch doesn't affect traffic capture, manual binding, or viewing saved evidence. It applies to the next Agent round; turning it off immediately rejects new auto-bindings.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <Label htmlFor="agent-traffic-binding" className="font-normal text-muted-foreground text-sm">
                  {agentTrafficBinding ? t("On · Increases Token consumption") : t("Off · Manual binding still available")}
                </Label>
                <Switch
                  id="agent-traffic-binding"
                  aria-describedby="agent-traffic-binding-description"
                  checked={agentTrafficBinding}
                  disabled={!loaded || saving}
                  onCheckedChange={toggleAgentTrafficBinding}
                />
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadioTowerIcon className="size-4" />
                  {t("Global proxy")}
                </CardTitle>
                <CardDescription>
                  {t("All Agents' ")}
                  <b>{t("target traffic")}</b>
                  {t(" exits through this proxy (hiding the source IP / via a jump host). Supports ")}
                  <b>http / https / socks5</b>
                  {t(", and can use")} <code>user:pass</code>
                  {t(" authentication. Leave empty for a direct connection.")}
                  <br />
                  {t("When ")}
                  <b>{t("Traffic capture")}</b>
                  {t(" is on, it serves as the ")}
                  <b>{t("upstream of the recording proxy")}</b>
                  {t(
                    " (traffic is still fully persisted, then exits through this proxy); with capture off, it is injected directly into Agents' bash / WebFetch egress. Independent of the web search proxy and the LLM proxy.",
                  )}
                  <br />
                  <b>{t("Tip")}</b>
                  {t(": socks5, when ")}
                  <b>{t("capture is off")}</b>
                  {t(", depends on each command-line tool's ")}
                  <code>ALL_PROXY</code>
                  {t(
                    " support (curl works; some tools may ignore it). If you mainly use socks5, enable traffic capture — that path is dialed by the MITM itself, so tools are unaware of it and it works reliably.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Label htmlFor="global-proxy" className="font-normal text-muted-foreground text-sm">
                  {t("Proxy address")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="global-proxy"
                    autoComplete="off"
                    placeholder={t("socks5://user:pass@host:1080 or http://host:port (leave empty = direct)")}
                    value={globalProxyInput}
                    disabled={!loaded || savingGlobalProxy}
                    onChange={(e) => setGlobalProxyInput(e.target.value)}
                  />
                  <Button type="button" onClick={saveGlobalProxy} disabled={!loaded || savingGlobalProxy}>
                    {t("Save")}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  {globalProxyInput.trim() ? t("Configured · All target traffic exits through this proxy") : t("Not configured · Target traffic connects directly")}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agent" className="mt-6">
          <SectionHeading
            icon={<ShieldAlertIcon className="size-4" />}
            title="Agent behavior"
            desc="Constraints the agents receive and experimental mechanisms."
          />
          <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlertIcon className="size-4" />
                  {t("Operation constraints injection")}
                </CardTitle>
                <CardDescription>
                  {t("When on, each task's ")}
                  <b>{t("operation constraints")}</b>
                  {t(
                    " (the allow/deny entries maintained under “Operation constraints” in the task overview) are appended to the corresponding Agent's system prompt to frame exploration boundaries (e.g. “only test the current port”, “no brute forcing”).",
                  )}
                  <br />
                  {t("Injection can be controlled separately for the ")}
                  <b>{t("planner")}</b>
                  {t(" and the ")}
                  <b>{t("worker")}</b>
                  {t("; both are on by default. Toggling takes effect immediately (read on the next turn) — no Agent rebuild needed. When off, the Agent no longer sees the constraints.")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="inject-planner" className="font-normal text-muted-foreground text-sm">
                    {t("Inject into the planner")}
                    {injectPlanner ? t(" · On") : t(" · Off")}
                  </Label>
                  <Switch
                    id="inject-planner"
                    checked={injectPlanner}
                    disabled={!loaded}
                    onCheckedChange={toggleInjectPlanner}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="inject-worker" className="font-normal text-muted-foreground text-sm">
                    {t("Inject into the worker")}
                    {injectWorker ? t(" · On") : t(" · Off")}
                  </Label>
                  <Switch
                    id="inject-worker"
                    checked={injectWorker}
                    disabled={!loaded}
                    onCheckedChange={toggleInjectWorker}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConicalIcon className="size-4" />
                  {t("Experimental features")}
                </CardTitle>
                <CardDescription>
                  {t("Mechanisms still being validated, off by default. They may change Agent behavior or affect stability — enable them only after understanding the impact.")}
                  <br />
                  <b>{t("noa context compaction")}</b>
                  {t(": the model proactively compresses long conversation history (norma v0.4.0). When enabled, the four Agent types on the platform (")}
                  <b>{t("Planner / Worker / Main Agent / Chat")}</b>
                  {t(
                    ") switch to noa to take over context handling instead of built-in compaction; the original text is archived under the task's working directory for traceability. Toggling takes effect immediately (for runs started later) with no Agent rebuild; turning it off restores built-in compaction right away.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <Label htmlFor="noa-compaction" className="font-normal text-muted-foreground text-sm">
                  {t("noa context compaction")}
                  {noaCompaction ? t(" · On") : t(" · Off")}
                </Label>
                <Switch
                  id="noa-compaction"
                  checked={noaCompaction}
                  disabled={!loaded}
                  onCheckedChange={toggleNoaCompaction}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <SectionHeading
            icon={<WrenchIcon className="size-4" />}
            title="Tools & execution"
            desc="Web search, the Python interpreter and worker concurrency."
          />
          <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <SearchIcon className="size-4" />
                  {t("Web search")}
                </CardTitle>
                <CardDescription>
                  {t("This is the web search ")}
                  <b>{t("master switch + source configuration")}</b>
                  {t(". Only once it's on can you choose in ")}
                  <b>{t("each Agent's configuration")}</b>
                  {t(" whether to separately enable ")}
                  <b>web_search</b>
                  {t(" (returns only titles/links/snippets — it doesn't fetch page content; fetching is handled by WebFetch). Web search ")}
                  <b>{t("doesn't use")}</b>
                  {t(" the recording proxy; it's independent of traffic capture.")}
                  <br />
                  {t("Available sources: ")}
                  <b>DuckDuckGo（ddgs）</b>
                  {t(" (no Key required), ")}
                  <b>Brave (free)</b>
                  {t(" (requires a Brave API Key),")} <b>Tavily</b>
                  {t(" (requires a Tavily API Key) or ")}
                  <b>DeepSeek</b>
                  {t(" (reuses your current LLM configuration). When the master switch is off, per-Agent web search switches are unavailable.")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="web-search" className="font-normal text-muted-foreground text-sm">
                    {webSearch
                      ? t("Master switch on · Can be enabled per Agent")
                      : t("Off · Agents can't enable web search")}
                  </Label>
                  <Switch
                    id="web-search"
                    checked={webSearch}
                    disabled={!loaded || saving}
                    onCheckedChange={(v) => {
                      setWebSearch(v); // optimistic
                      saveWebSearch({ web_search_enabled: v });
                    }}
                  />
                </div>

                {webSearch && (
                  <div className="flex items-center justify-between gap-4">
                    <Label className="font-normal text-muted-foreground text-sm">{t("Search source")}</Label>
                    <Select
                      value={backend}
                      disabled={!loaded || saving}
                      onValueChange={(v) => {
                        setBackend(v); // optimistic
                        saveWebSearch({ web_search_backend: v });
                      }}
                    >
                      <SelectTrigger className="w-48 shrink-0">
                        <SelectValue placeholder={t("Select a source")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ddgs">{t("DuckDuckGo (ddgs · free, no Key)")}</SelectItem>
                        <SelectItem value="brave-free">{t("Brave (free · needs Key)")}</SelectItem>
                        <SelectItem value="tavily">{t("Tavily (needs Key)")}</SelectItem>
                        <SelectItem value="deepseek">{t("DeepSeek (official)")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {webSearch && backend === "deepseek" && (
                  <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/30 p-3">
                    <p className="font-medium text-sm">{t("DeepSeek official web search")}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t("This source directly reuses the ")}
                      <b>{t("currently active LLM configuration")}</b>
                      {t(". Therefore it ")}
                      <b>{t("only supports official DeepSeek models")}</b>
                      {t(", and that configuration ")}
                      <b>{t("must use the anthropic protocol")}</b>
                      {t("— DeepSeek's OpenAI-protocol endpoint doesn't support server-side search. This source may stop working after you switch LLM configurations.")}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t("Unlike other sources, searches are ")}
                      <b>{t("run on DeepSeek's servers")}</b>
                      {t(": each search consumes an extra model call (in Token cost), and search requests ")}
                      <b>{t("bypass the egress proxy above")}</b>
                      {t(", and are ")}
                      <b>{t("not recorded in traffic logs")}</b>
                      {t("; returned results ")}
                      <b>{t("contain only titles and links")}</b>
                      {t(" (no snippets) — WebFetch fetches the full text when needed.")}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t("You're responsible for confirming the conditions above — the system won't block you; use the “Test search” button below to actually run a query and verify.")}
                    </p>
                  </div>
                )}

                {webSearch && backend === "brave-free" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="brave-key" className="font-normal text-muted-foreground text-sm">
                      Brave Search API Key
                      {braveKeySet && <span className="ml-2 text-emerald-500 text-xs">{t("Configured")}</span>}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="brave-key"
                        type="password"
                        autoComplete="off"
                        placeholder={braveKeySet ? t("Configured (leave blank to keep)") : t("Enter the Brave API Key")}
                        value={braveKeyInput}
                        disabled={!loaded || savingKey}
                        onChange={(e) => setBraveKeyInput(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={saveBraveKey}
                        disabled={!loaded || savingKey || braveKeyInput.trim() === ""}
                      >
                        {t("Save")}
                      </Button>
                    </div>
                    {braveNeedsKey && (
                      <p className="text-amber-500 text-xs">
                        {t("Brave is selected but no Key is configured yet — the search tool stays off until you save a Key.")}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {t("The free tier allows about 2,000 searches/month. Get a Key at https://brave.com/search/api/.")}
                    </p>
                  </div>
                )}

                {webSearch && backend === "tavily" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tavily-key" className="font-normal text-muted-foreground text-sm">
                      Tavily Search API Key
                      {tavilyKeySet && <span className="ml-2 text-emerald-500 text-xs">{t("Configured")}</span>}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tavily-key"
                        type="password"
                        autoComplete="off"
                        placeholder={tavilyKeySet ? t("Configured (leave blank to keep)") : t("Enter the Tavily API Key (tvly-…)")}
                        value={tavilyKeyInput}
                        disabled={!loaded || savingTavilyKey}
                        onChange={(e) => setTavilyKeyInput(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={saveTavilyKey}
                        disabled={!loaded || savingTavilyKey || tavilyKeyInput.trim() === ""}
                      >
                        {t("Save")}
                      </Button>
                    </div>
                    {webSearch && backend === "tavily" && !tavilyKeySet && (
                      <p className="text-amber-500 text-xs">
                        {t("Tavily is selected but no Key is configured yet — the search tool stays off until you save a Key.")}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">{t("Sign up at https://tavily.com to get an API Key.")}</p>
                  </div>
                )}

                {webSearch && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ws-proxy" className="font-normal text-muted-foreground text-sm">
                      {t("Egress proxy (optional)")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="ws-proxy"
                        autoComplete="off"
                        placeholder={t("http://host:port or socks5://host:port (leave empty = direct)")}
                        value={proxyInput}
                        disabled={!loaded || savingProxy}
                        onChange={(e) => setProxyInput(e.target.value)}
                      />
                      <Button type="button" onClick={saveProxy} disabled={!loaded || savingProxy}>
                        {t("Save")}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        "A separate egress proxy used only to reach search endpoints (VPN/SOCKS, etc.). Unrelated to the traffic-recording MITM proxy; use it when the direct route can't connect.",
                      )}
                    </p>
                  </div>
                )}

                {webSearch && (
                  <div className="flex items-center justify-between gap-4 border-t pt-4">
                    <p className="text-muted-foreground text-xs">
                      {t("Runs a real search for “test” with the current settings (source + proxy + Key) to verify it works.")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={runTest}
                      disabled={!loaded || testing}
                      className="shrink-0"
                    >
                      {testing ? t("Testing…") : t("Test search")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadioTowerIcon className="size-4" />
                  {t("Custom scripts · Python interpreter")}
                </CardTitle>
                <CardDescription>
                  {t("Custom ")}
                  <b>script</b>
                  {t(
                    " script-type tools run Python with it. It's auto-detected at startup (python3 preferred); here you can enter an absolute path to a venv or specific version — leave empty to auto-detect at runtime.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    className="font-mono text-sm"
                    placeholder={t("/usr/bin/python3 (leave empty = auto-detect)")}
                    value={pyInterp}
                    disabled={!loaded || saving}
                    onChange={(e) => setPyInterp(e.target.value)}
                  />
                  <Button variant="outline" onClick={detectPython} disabled={!loaded || saving}>
                    {t("Detect again")}
                  </Button>
                  <Button onClick={savePython} disabled={!loaded || saving}>
                    {t("Save")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CpuIcon className="size-4" />
                  {t("Worker concurrency · work agent count")}
                </CardTitle>
                <CardDescription>
                  {t("How many work agents run concurrently per task (default 3). Higher values probe more in parallel but consume more. Changes apply ")}
                  <b>{t("to tasks started later")}</b>
                  {t(" — running tasks are unaffected.")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    className="w-32 font-mono text-sm"
                    placeholder="3"
                    value={workers}
                    disabled={!loaded || savingWorkers}
                    onChange={(e) => setWorkers(e.target.value)}
                  />
                  <Button onClick={saveWorkers} disabled={!loaded || savingWorkers}>
                    {t("Save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prefs" className="mt-6">
          <SectionHeading
            icon={<KeyboardIcon className="size-4" />}
            title="Preferences"
            desc="Browser-local console preferences (not synced to your account)."
          />
          <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyboardIcon className="size-4" />
                  {t("Chat input send key")}
                </CardTitle>
                <CardDescription>
                  {t("Shared by the chat page and the task-detail main Agent input; it takes effect immediately with no saving needed.")}
                  <br />
                  {t("This preference is ")}
                  <b>{t("stored only in this browser")}</b>
                  {t(", is not synced with your account, and must be re-set after switching browsers or clearing site data.")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <Label htmlFor="chat-send-mode" className="font-normal text-muted-foreground text-sm">
                  {t("Send mode")}
                </Label>
                <Select value={sendMode} onValueChange={(v) => setChatSendMode(v as ChatSendMode)}>
                  <SelectTrigger id="chat-send-mode" className="w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAT_SEND_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SECTIONS = [
  { id: "version", label: "Version", Icon: DownloadIcon },
  { id: "network", label: "Network & traffic", Icon: RadioTowerIcon },
  { id: "agent", label: "Agent behavior", Icon: ShieldAlertIcon },
  { id: "tools", label: "Tools & execution", Icon: WrenchIcon },
  { id: "prefs", label: "Preferences", Icon: KeyboardIcon },
];

// The active tab already names the group, so the heading is just a one-line description of the panel.
function SectionHeading({ desc }: { icon?: React.ReactNode; title?: string; desc: string }) {
  return <p className="mb-5 max-w-2xl text-muted-foreground text-sm">{desc}</p>;
}
