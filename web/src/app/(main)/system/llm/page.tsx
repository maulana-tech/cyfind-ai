"use client";

import * as React from "react";

import {
  Loader2Icon,
  PlugZapIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  StarIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t, useT } from "@/i18n";
import { api } from "@/lib/api";
import type { LLMPoolMember, LLMPoolStatus, LLMProfile, LLMRetryOverride } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ProfileRetryFields, RetryPolicyPanel, ZERO_OVERRIDE } from "./_components/retry";

// The thinking switch (thinking.type) and the thinking effort (reasoning_effort) are two MUTUALLY INDEPENDENT fields,
// each set separately — some endpoints have no thinking field and activate thinking with the effort parameter alone, so they must be decoupled.
// An empty string in the store = that field is NOT sent; Radix Select does not accept an empty value, so the UI uses "none"
// as a sentinel for not-sent, converted to/from "" on read/write (NONE / fromStore / toStore).
const NONE = "none";
const fromStore = (v?: string) => (v ? v : NONE);
const toStore = (v: string) => (v === NONE ? "" : v);
const THINKING_TYPES: { value: string; label: string }[] = [
  { value: NONE, label: "Don't send (default)" },
  { value: "disabled", label: "Off" },
  { value: "enabled", label: "When " },
];
// Which request field name the output limit uses (only meaningful for the openai format). NONE ↔ "" uses the same sentinel conversion.
const MAX_TOKENS_FIELDS: { value: string; label: string }[] = [
  { value: NONE, label: "max_tokens (default)" },
  { value: "max_completion_tokens", label: "max_completion_tokens" },
];
// The other two formats each hardcode the field name, so the option is meaningless for them; the explanation text spells this out.
const MAX_TOKENS_FIELD_HINTS: Record<string, string> = {
  openai:
    "Which key carries the limit. max_tokens is the default and nearly every compatible gateway only accepts it; OpenAI's official reasoning models (o-series / GPT-5) instead only accept max_completion_tokens and reject max_tokens with unsupported_parameter.",
  anthropic: "Only selectable for the openai format. Anthropic's field is always max_tokens.",
  "openai-responses": "Only selectable for the openai format. The Responses API field is always max_output_tokens.",
  bedrock: "Only selectable for the openai format. Bedrock uses the Converse API field maxTokens.",
};
const EFFORT_LEVELS: { value: string; label: string }[] = [
  { value: NONE, label: "Don't send (default)" },
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
  { value: "xhigh", label: "xhigh" },
  { value: "max", label: "max" },
];

function cooldownText(secs: number) {
  if (secs <= 0) return "";
  if (secs < 60) return `${secs}s`;
  return `${Math.ceil(secs / 60)}min`;
}

// The "health" shown on a config's card. A config with no Key cannot send a request at all, which is more important to surface than a trip;
// the other states come from round-robin trip records (no new records are produced while round-robin is off, in which case "healthy" = no known fault).
type Health = { label: string; cls: string; hint?: string };
function healthOf(p: LLMProfile, m?: LLMPoolMember): Health {
  if (!p.api_key_hint) {
    return {
      label: t("Key not configured"),
      cls: "border-muted-foreground/40 text-muted-foreground",
      hint: "No API key set — calls will fail",
    };
  }
  if (m?.state === "tripped") {
    return {
      label: m.cooldown_secs > 0 ? t("Tripped · {cooldown}", { cooldown: cooldownText(m.cooldown_secs) }) : t("Tripped"),
      cls: "border-destructive/50 text-destructive",
      hint: m.last_error,
    };
  }
  if (m?.state === "degraded") {
    return {
      label: t("Degraded · {fails} failures", { fails: m.fails }),
      cls: "border-amber-500/50 text-amber-600 dark:text-amber-400",
      hint: m.last_error,
    };
  }
  return { label: t("Healthy"), cls: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Round-robin config drawer
// ─────────────────────────────────────────────────────────────────────────────

function PoolSheet({
  open,
  onOpenChange,
  pool,
  onReload,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pool: LLMPoolStatus | null;
  onReload: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const tFn = useT();

  // The cooldown countdown is the remaining seconds computed by the backend — fetched on a timer only while the drawer is open and some config is unhealthy, to keep it ticking.
  React.useEffect(() => {
    if (!open || !pool?.enabled || !pool.chain.some((m) => m.state !== "ok")) return;
    const t = setInterval(() => void onReload(), 10_000);
    return () => clearInterval(t);
  }, [open, pool, onReload]);

  async function toggle(patch: { llm_pool_enabled?: boolean; llm_pool_bind_fallback?: boolean }) {
    if (busy) return;
    setBusy(true);
    try {
      await api.setSettings(patch);
      await onReload();
      if (patch.llm_pool_enabled !== undefined) {
        toast.success(patch.llm_pool_enabled ? tFn("LLM pool enabled") : tFn("LLM pool disabled"));
      } else {
        toast.success(tFn("Fallback setting updated"));
      }
    } catch (e) {
      toast.error(tFn("Failed to update settings: {message}", { message: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  }

  async function recover(id?: string) {
    try {
      await api.resetLLMPool(id);
      await onReload();
      toast.success(id ? tFn("Profile recovered") : tFn("All profiles recovered"));
    } catch (e) {
      toast.error(tFn("Restore failed: {message}", { message: (e as Error).message }));
    }
  }

  const enabled = pool?.enabled ?? false;
  const chain = pool?.chain ?? [];
  // Members participating in round-robin (excluding those marked "excluded from round-robin"); the order is the backend's actual attempt order.
  const inChain = chain.filter((m) => m.active || !m.excluded);
  const tripped = chain.filter((m) => m.state === "tripped");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="px-4">
          <SheetTitle className="flex items-center gap-2">
            <ZapIcon className="size-4" /> {tFn("LLM pool · failover")}
          </SheetTitle>
          <SheetDescription>
            {tFn("When enabled, ")}
            <b>{tFn("agents with no specified model")}</b>
            {tFn(" automatically switch to the next profile when the current one is unavailable (insufficient balance / invalid key / rate limited / service error).")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="grid gap-0.5">
              <Label className="text-sm">{tFn("Enable pool")}</Label>
              <p className="text-muted-foreground text-xs">{tFn("Off by default. When off, only the active profile is used and failures stand.")}</p>
            </div>
            <Switch
              checked={enabled}
              disabled={busy}
              onCheckedChange={(v) => void toggle({ llm_pool_enabled: v })}
              aria-label={tFn("LLM pool toggle")}
            />
          </div>

          {enabled && (
            <>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="grid gap-0.5">
                  <Label className="text-sm">{tFn("Fall back when a specified profile fails")}</Label>
                  <p className="text-muted-foreground text-xs">
                    {tFn(
                      "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.",
                    )}
                  </p>
                </div>
                <Switch
                  checked={pool?.bind_fallback ?? false}
                  disabled={busy}
                  onCheckedChange={(v) => void toggle({ llm_pool_bind_fallback: v })}
                  aria-label={tFn("Fall back on pinned-profile failure toggle")}
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{tFn("Pool order")}</Label>
                  {tripped.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => void recover()}>
                      <RotateCcwIcon /> {tFn("Reset all")}
                    </Button>
                  )}
                </div>
                {inChain.length < 2 && (
                  <p className="text-muted-foreground text-xs">
                    {tFn("Only {n} usable profile right now — the pool won't kick in; you need at least 2 profiles with an API key that participate in the pool.", {
                      n: inChain.length,
                    })}
                  </p>
                )}
                {chain.map((m) => {
                  const excluded = m.excluded && !m.active;
                  const order = excluded ? null : inChain.findIndex((x) => x.profile_id === m.profile_id) + 1;
                  return (
                    <div
                      key={m.profile_id}
                      className={cn(
                        "grid gap-1 rounded-lg border p-2.5 text-sm",
                        excluded && "opacity-55",
                        m.state === "tripped" && "border-destructive/40",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="w-5 shrink-0 text-center font-mono text-muted-foreground text-xs">
                          {order ?? "—"}
                        </span>
                        <span className="font-medium">{m.name}</span>
                        {m.active && (
                          <Badge variant="outline" className="border-amber-400/50 text-amber-500">
                            {tFn("Active")}
                          </Badge>
                        )}
                        {excluded && <Badge variant="outline">{tFn("Excluded from pool")}</Badge>}
                        <div className="ml-auto flex items-center gap-2">
                          {m.state === "tripped" && m.cooldown_secs > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {tFn("Cooldown {cooldown}", { cooldown: cooldownText(m.cooldown_secs) })}
                            </span>
                          )}
                          {m.state === "degraded" && (
                            <span className="text-muted-foreground text-xs">
                              {tFn("{n} consecutive failures", { n: m.fails })}
                            </span>
                          )}
                          {m.state !== "ok" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              aria-label={tFn("Reset now")}
                              title={tFn("Reset now: clears the trip so the next call retries this profile")}
                              onClick={() => void recover(m.profile_id)}
                            >
                              <RotateCcwIcon className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 pl-7 text-muted-foreground text-xs">
                        <code className="truncate font-mono">{m.model}</code>
                        {!m.active && <span>{tFn("Priority {n}", { n: m.priority })}</span>}
                      </div>
                      {m.last_error && (
                        <p className="truncate pl-7 font-mono text-muted-foreground text-xs" title={tFn(m.last_error)}>
                          {tFn(m.last_error)}
                        </p>
                      )}
                    </div>
                  );
                })}
                {chain.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-sm">
                    {tFn("No profiles yet")}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-dashed p-3 text-muted-foreground text-xs leading-relaxed">
                {tFn(
                  "The active profile is always first; the rest follow by priority (set per profile). A failed profile cools down (60s → 5min → 30min), is skipped during cooldown, and rejoins automatically once recovered. Profiles whose context window can't fit the current request are skipped too. Agents and tasks with a pinned model don't join the pool by default.",
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Model config drawer (create / edit share the same form)
// ─────────────────────────────────────────────────────────────────────────────

const bedrockKeyPlaceholder = (fmt: string) => (fmt === "bedrock" ? "ABSK… (Bedrock API Key)" : "sk-…");

function ProfileSheet({
  profile,
  open,
  onOpenChange,
  onSaved,
}: {
  profile: LLMProfile | null; // null = new
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: (id: string) => void;
}) {
  const t = useT();
  const isNew = !profile;
  const [name, setName] = React.useState("");
  const [format, setFormat] = React.useState<"anthropic" | "openai" | "openai-responses" | "bedrock">("anthropic");
  const [model, setModel] = React.useState("");
  const [baseUrl, setBaseUrl] = React.useState("");
  const [proxy, setProxy] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [keyHint, setKeyHint] = React.useState("");
  const [rps, setRps] = React.useState("0");
  const [rpm, setRpm] = React.useState("0");
  const [cw, setCw] = React.useState("0"); // context window (K tokens); 0 = default 200K
  const [thinkingType, setThinkingType] = React.useState(NONE);
  const [effort, setEffort] = React.useState(NONE);
  const [priority, setPriority] = React.useState("0"); // round-robin order; larger goes first
  const [poolExclude, setPoolExclude] = React.useState(false);
  const [streaming, setStreaming] = React.useState(true); // true = streaming (default); false = non-streaming
  const [maxTokens, setMaxTokens] = React.useState("0"); // output limit per reply; 0 = not sent
  const [maxTokensField, setMaxTokensField] = React.useState(NONE); // which field name the limit uses; NONE = max_tokens
  const [sessionHeaderKey, setSessionHeaderKey] = React.useState(""); // custom session header name; empty = not sent
  const [retry, setRetry] = React.useState<LLMRetryOverride>(ZERO_OVERRIDE); // this config's retry override; all 0 = follow global
  const [testing, setTesting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [models, setModels] = React.useState<string[]>([]);
  const [loadingModels, setLoadingModels] = React.useState(false);
  const [modelsOpen, setModelsOpen] = React.useState(false);

  // Each time it opens, fill the form from the passed-in profile (reset to defaults for a new one). Closing and reopening the drawer
  // is a clean start, leaving no residue of the previous config.
  React.useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? "");
    setFormat(
      profile?.format === "openai" || profile?.format === "openai-responses" || profile?.format === "bedrock"
        ? profile.format
        : "anthropic",
    );
    setModel(profile?.model ?? "");
    setBaseUrl(profile?.base_url ?? "");
    setProxy(profile?.proxy ?? "");
    setRps(String(profile?.rate_per_second ?? 0));
    setRpm(String(profile?.rate_per_minute ?? 0));
    setCw(String(profile?.context_window_k ?? 0));
    setThinkingType(fromStore(profile?.thinking_type));
    setEffort(fromStore(profile?.reasoning_effort));
    setPriority(String(profile?.priority ?? 0));
    setPoolExclude(profile?.pool_exclude ?? false);
    setStreaming(profile?.streaming ?? true);
    setMaxTokens(String(profile?.max_tokens ?? 0));
    setMaxTokensField(fromStore(profile?.max_tokens_field));
    setSessionHeaderKey(profile?.session_header_key ?? "");
    setRetry(profile?.retry ?? ZERO_OVERRIDE);
    setApiKey("");
    setKeyHint(profile?.api_key_hint ?? "");
    setModels([]);
    setModelsOpen(false);
  }, [open, profile]);

  const profileId = profile ? Number(profile.id) : undefined;

  async function loadModels() {
    if (loadingModels) return;
    setLoadingModels(true);
    setModels([]);
    try {
      const r = await api.fetchLLMModels(format, baseUrl, apiKey, proxy, profileId);
      if (r.ok && r.models && r.models.length > 0) {
        setModels(r.models);
        setModelsOpen(true);
        toast.success(t("Loaded {n} models", { n: r.models.length }));
      } else {
        toast.error(t("Failed to load models: {error}", { error: r.error ? t(r.error) : t("no models returned") }));
      }
    } catch (e) {
      toast.error(t("Error loading models: {message}", { message: (e as Error).message }));
    } finally {
      setLoadingModels(false);
    }
  }

  async function testConnection() {
    if (testing) return;
    setTesting(true);
    try {
      // Test with the thinking parameters the config will actually run, so a model that does not support that field fails here
      // rather than blowing up when running a task. Pass the profile id: use the stored Key when the Key input is left blank.
      const r = await api.testLLM(
        format,
        model,
        baseUrl,
        apiKey,
        proxy,
        toStore(thinkingType),
        toStore(effort),
        profileId,
        streaming,
        sessionHeaderKey.trim(),
      );
      // Show the reply content too: only by seeing the model actually speak is it the same as working in a real session.
      if (r.ok)
        toast.success(
          t("Connected · {latency}ms · {model}", { latency: r.latency_ms ?? "?", model: r.model ?? model }),
          {
            description: r.reply ? t("Reply: {reply}", { reply: t(r.reply) }) : undefined,
          },
        );
      else toast.error(t("Connection failed: {error}", { error: r.error ? t(r.error) : t("unknown") }));
    } catch (e) {
      toast.error(t("Test error: {message}", { message: (e as Error).message }));
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    if (!name.trim() || !model.trim()) {
      toast.error(t("Enter a name and a model"));
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const { id } = await api.saveLLMProfile({
        ...(profile ? { id: Number(profile.id) } : {}),
        name: name.trim(),
        format,
        model: model.trim(),
        base_url: baseUrl.trim(),
        proxy: proxy.trim(),
        api_key: apiKey,
        rate_per_second: Number(rps) || 0,
        rate_per_minute: Number(rpm) || 0,
        context_window_k: Number(cw) || 0,
        thinking_type: toStore(thinkingType),
        reasoning_effort: toStore(effort),
        priority: Number(priority) || 0,
        pool_exclude: poolExclude,
        streaming,
        max_tokens: Math.max(0, Number(maxTokens) || 0),
        // The field-name switch is only meaningful for openai (Chat Completions); other formats always fall back to the default;
        // the backend performs the same normalization again, so this just keeps the UI from sending a self-contradictory value.
        max_tokens_field: format === "openai" ? toStore(maxTokensField) : "",
        session_header_key: sessionHeaderKey.trim(),
        retry,
      });
      if (isNew) toast.success(t("Created: {name} (click \"Set active\" on the card to enable)", { name: name.trim() }));
      else toast.success(profile?.is_default ? t("Saved — the active profile takes effect immediately, no restart needed") : t("Saved"));
      onSaved(String(id));
      onOpenChange(false);
    } catch (e) {
      toast.error(t("Save failed: {message}", { message: (e as Error).message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:min-w-[420px] data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="px-4">
          <SheetTitle className="flex items-center gap-2">
            {isNew ? t("New model profile") : t("Edit: {name}", { name: profile?.name ?? "" })}
            {profile?.is_default && (
              <Badge variant="outline" className="border-amber-400/50 text-amber-500">
                {t("Active")}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isNew
              ? t("New profiles aren't activated automatically — click \"Set active\" on the card to enable it.")
              : t("Click save after editing; changes to the active profile take effect for all agents immediately.")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-name">{t("Name")}</Label>
              <Input
                id="p-name"
                placeholder={t("e.g. OpenAI production")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("Format")}</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as "anthropic" | "openai" | "openai-responses" | "bedrock")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select a format")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="openai">OpenAI (Chat Completions)</SelectItem>
                  <SelectItem value="openai-responses">OpenAI (Responses API)</SelectItem>
                  <SelectItem value="bedrock">AWS Bedrock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-model">{t("Model")}</Label>
            <div className="flex gap-2">
              <Input
                id="p-model"
                className="font-mono"
                placeholder={format === "bedrock" ? "qwen.qwen3-coder-next" : "claude-opus-4-8"}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              {/* modal: this Popover's content is portaled to <body>, outside the Sheet's scroll lock,
                  so without modal the list renders but cannot scroll. modal makes it hold the topmost scroll lock itself. */}
              <Popover open={modelsOpen} onOpenChange={setModelsOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={loadingModels}
                    onClick={loadModels}
                    title={t("Load available models from the API")}
                  >
                    {loadingModels ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
                  </Button>
                </PopoverTrigger>
                {models.length > 0 && (
                  <PopoverContent className="max-h-72 w-72 gap-0 overflow-y-auto overscroll-contain p-1" align="end">
                    {models.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className="w-full shrink-0 rounded-md px-2 py-1.5 text-left font-mono text-xs hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setModel(m);
                          setModelsOpen(false);
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-base-url">{format === "bedrock" ? t("AWS Region") : t("Base URL (optional)")}</Label>
            <Input
              id="p-base-url"
              className="font-mono"
              placeholder={format === "bedrock" ? "ap-southeast-2" : "https://api.openai.com/v1"}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-proxy">{t("Proxy (optional)")}</Label>
            <Input
              id="p-proxy"
              className="font-mono"
              placeholder="socks5://user:pass@127.0.0.1:1080 · http://127.0.0.1:8080"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {t(
                "Only outbound LLM requests use this proxy. Supports http/https/socks5 with optional credentials (e.g. socks5://user:pass@host:port; URL-encode special characters in the password). Leave empty to connect directly.",
              )}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-session-header">{t("Custom session header (optional)")}</Label>
            <Input
              id="p-session-header"
              className="font-mono"
              placeholder={t("e.g. x-session-id (leave empty to disable)")}
              value={sessionHeaderKey}
              onChange={(e) => setSessionHeaderKey(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {t("Once set, every request carries this HTTP header, auto-filled with the ")}
              <b>{t("current session id")}</b>
              {t(
                " (e.g. conv-12 for chats, exp3-worker-i87 for workers). For gateways doing prompt caching / sticky routing by the session-id header: stable across turns within a session, distinct across sessions. Leave empty to disable.",
              )}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-api-key">{format === "bedrock" ? "Bedrock API Key" : "API Key"}</Label>
            <Input
              id="p-api-key"
              type="password"
              placeholder={
                keyHint ? t("Set ({hint}), leave empty to keep", { hint: keyHint }) : bedrockKeyPlaceholder(format)
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {format === "bedrock" && (
              <p className="text-muted-foreground text-xs">
                The base64-encoded Bedrock API key (starts with ABSK). Leave empty to use the BEDROCK_API_KEY
                environment variable.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="p-rps">{t("Rate limit / second")}</Label>
              <Input id="p-rps" type="number" min={0} value={rps} onChange={(e) => setRps(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-rpm">{t("Rate limit / minute")}</Label>
              <Input id="p-rpm" type="number" min={0} value={rpm} onChange={(e) => setRpm(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-cw">{t("Context window (K)")}</Label>
              <Input
                id="p-cw"
                type="number"
                min={0}
                max={1000}
                value={cw}
                onChange={(e) => setCw(e.target.value)}
                placeholder="200"
              />
            </div>
          </div>
          <p className="-mt-2 text-muted-foreground text-xs">
            {t(
              "0 = unlimited, shared across all agents. Context window is in K (thousand tokens); 0 = the 200K default, max 1000 (1M); setting it too high prevents compression from triggering.",
            )}
          </p>

          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor="p-priority" className="text-sm">
                  {t("Pool priority")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "Higher numbers are tried first; the active profile is always first regardless of this value. Profiles with equal priority take turns leading, spreading usage naturally.",
                  )}
                </p>
              </div>
              <Input
                id="p-priority"
                type="number"
                className="w-24 shrink-0"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <div className="grid gap-0.5">
                <Label className="text-sm">{t("Excluded from pool")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "When on, this profile is never a failover target (agents/tasks can still pin it explicitly). Suited for expensive profiles reserved for one agent that you don't want burned by others' failures.",
                  )}
                </p>
              </div>
              <Switch checked={poolExclude} onCheckedChange={setPoolExclude} aria-label={t("Excluded from pool")} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <div className="grid gap-0.5">
                <Label className="text-sm">{t("Streaming output · streaming")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "On (default) streams via SSE with live progress and token counts while running. Off uses true non-streaming (stream:false, full response in one shot) — working around buggy gateway SSE implementations (empty frames / dropped thinking deltas), at the cost of losing live progress.",
                  )}
                </p>
              </div>
              <Switch checked={streaming} onCheckedChange={setStreaming} aria-label={t("Streaming output")} />
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor="p-max-tokens" className="text-sm">
                  {t("Output limit · max tokens")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "Max tokens generated per reply, sent with every request. 0 (default) = don't send the field, letting the server decide. This is separate from the context window above: that's the model's total capacity, used only locally for the compression threshold. Too small a value truncates reasoning models during thinking, before a single word of the answer.",
                  )}
                </p>
              </div>
              <Input
                id="p-max-tokens"
                type="number"
                min={0}
                className="w-28 shrink-0"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <div className="grid gap-0.5">
                <Label className="text-sm">{t("Limit field name")}</Label>
                <p className="text-muted-foreground text-xs">{t(MAX_TOKENS_FIELD_HINTS[format])}</p>
              </div>
              <Select
                value={format === "openai" ? maxTokensField : NONE}
                onValueChange={setMaxTokensField}
                disabled={format !== "openai"}
              >
                <SelectTrigger className="w-56 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_TOKENS_FIELDS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(o.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label className="text-sm">{t("Thinking toggle · thinking.type")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.",
                  )}
                </p>
              </div>
              <Select value={thinkingType} onValueChange={setThinkingType}>
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THINKING_TYPES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(o.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <div className="grid gap-0.5">
                <Label className="text-sm">{t("Reasoning effort · reasoning_effort")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "A standalone effort level (OpenAI reasoning_effort / Anthropic output_config.effort). Some APIs activate reasoning via the effort alone with no thinking field, so it can be set on its own without the toggle above.",
                  )}
                </p>
              </div>
              <Select value={effort} onValueChange={setEffort}>
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EFFORT_LEVELS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(o.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProfileRetryFields value={retry} onChange={setRetry} />
        </div>

        <div className="flex gap-2 border-t px-4 py-3">
          <Button variant="outline" onClick={testConnection} disabled={testing}>
            {testing ? <Loader2Icon className="animate-spin" /> : <PlugZapIcon />}
            {testing ? t("Testing…") : t("Test connection")}
          </Button>
          <Button onClick={save} disabled={saving} className="flex-1">
            {saving && <Loader2Icon className="animate-spin" />}
            {!saving && (isNew ? <PlusIcon /> : <SaveIcon />)}
            {isNew ? t("New") : t("Save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LLMPage() {
  const t = useT();
  const [profiles, setProfiles] = React.useState<LLMProfile[]>([]);
  const [pool, setPool] = React.useState<LLMPoolStatus | null>(null);
  const [poolOpen, setPoolOpen] = React.useState(false);
  // The drawer's open state and content are stored separately: editing stays unchanged on close, otherwise during the close animation the title would flash from
  // "Edit X" to "New". editing = null means new.
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LLMProfile | null>(null);
  const openEditor = React.useCallback((p: LLMProfile | null) => {
    setEditing(p);
    setEditOpen(true);
  }, []);

  const loadPool = React.useCallback(async () => {
    try {
      setPool(await api.llmPool());
    } catch {
      /* ignore */
    }
  }, []);

  const load = React.useCallback(async () => {
    try {
      setProfiles(await api.llmProfiles());
    } catch {
      /* ignore */
    }
    await loadPool();
  }, [loadPool]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // The health badge on the card takes the round-robin state by profile id.
  const health = React.useMemo(() => {
    const m = new Map<string, LLMPoolMember>();
    for (const c of pool?.chain ?? []) m.set(c.profile_id, c);
    return m;
  }, [pool]);

  async function activate(id: string, name: string) {
    try {
      await api.activateLLMProfile(id);
      toast.success(t("Activated: {name}", { name }));
      await load();
    } catch (e) {
      toast.error(t("Failed to activate: {message}", { message: (e as Error).message }));
    }
  }

  async function remove(p: LLMProfile) {
    if (p.is_default) {
      toast.error(t("Can't delete the currently active profile"));
      return;
    }
    try {
      await api.deleteLLMProfile(p.id);
      toast.success(t("Deleted: {name}", { name: p.name }));
      await load();
    } catch (e) {
      toast.error(t("Delete failed: {message}", { message: (e as Error).message }));
    }
  }

  const poolOn = pool?.enabled ?? false;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-semibold text-xl tracking-tight">LLM</h1>
          <p className="text-muted-foreground text-sm">
            {t("Format / model / rate-limit settings shared by all agents. Click a card to edit; the star marks the active profile.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPoolOpen(true)}>
            <ZapIcon /> {t("Pool settings")}
            {poolOn && (
              <Badge variant="outline" className="ml-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                {t("On")}
              </Badge>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={() => openEditor(null)}>
            <PlusIcon /> {t("New")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="flex-1">
        <TabsList>
          <TabsTrigger value="profiles">{t("Model profiles")}</TabsTrigger>
          <TabsTrigger value="retry">{t("Retry & backoff")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((p) => {
              const h = healthOf(p, health.get(p.id));
              return (
                <Card
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEditor(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEditor(p);
                    }
                  }}
                  className={cn(
                    "cursor-pointer gap-0 py-4 outline-none transition-colors hover:border-foreground/30",
                    p.is_default && "border-primary/40 bg-primary/5",
                  )}
                >
                  <CardContent className="grid gap-2 px-4">
                    <div className="flex items-start gap-2">
                      <StarIcon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          p.is_default ? "fill-primary text-primary" : "text-muted-foreground",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-sm">{p.name}</span>
                          <Badge variant="outline" className="uppercase">
                            {p.format}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("ml-auto", h.cls)}
                            title={h.hint ? t(h.hint) : undefined}
                          >
                            {h.label}
                          </Badge>
                        </div>
                        <code className="mt-1 block truncate font-mono text-muted-foreground text-xs">{p.model}</code>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-6 text-muted-foreground text-xs">
                      {p.api_key_hint && <span>{p.api_key_hint}</span>}
                      <span>
                        {p.rate_per_second}/s · {p.rate_per_minute}/min
                      </span>
                      {p.proxy && <span className="truncate">{t("Proxy {proxy}", { proxy: p.proxy })}</span>}
                      {p.reasoning_effort && (
                        <span>
                          {t("Thinking {effort}", { effort: p.reasoning_effort === "off" ? t("off") : p.reasoning_effort })}
                        </span>
                      )}
                      {/* The two round-robin-related fields are only meaningful while round-robin is on, taking no space when off */}
                      {poolOn &&
                        !p.is_default &&
                        (p.pool_exclude ? (
                          <span>{t("Excluded from pool")}</span>
                        ) : (
                          <span>{t("Priority {n}", { n: p.priority ?? 0 })}</span>
                        ))}
                    </div>

                    <div className="mt-1 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={p.is_default}
                        onClick={(e) => {
                          e.stopPropagation();
                          void activate(p.id, p.name);
                        }}
                      >
                        {p.is_default ? t("Active") : t("Set active")}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={t("Delete profile")}
                        onClick={(e) => {
                          e.stopPropagation();
                          void remove(p);
                        }}
                      >
                        <Trash2Icon className="text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {profiles.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
                {t("No model profiles yet — click \"New\" in the top-right to create the first one.")}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="retry" className="mt-4">
          <RetryPolicyPanel />
        </TabsContent>
      </Tabs>

      <ProfileSheet profile={editing} open={editOpen} onOpenChange={setEditOpen} onSaved={() => void load()} />
      <PoolSheet open={poolOpen} onOpenChange={setPoolOpen} pool={pool} onReload={loadPool} />
    </div>
  );
}
