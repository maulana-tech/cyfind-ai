"use client";

import * as React from "react";

import { BotIcon, ListFilterIcon, PencilIcon, PlusIcon, ShieldAlertIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import type {
  InterceptAction,
  InterceptRule,
  JudgeConfig,
  JudgeDayUsage,
  JudgeUsage,
  LLMProfile,
  Tool,
} from "@/lib/types";

// fmtTokens compresses a token count into compact form (1.2k / 3.4M), for approval usage stats.
function fmtTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// JudgeStat is a single stat (label + value).
function JudgeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// JudgeSparkbars draws a mini bar chart of the last N days' daily consumption (input+output) with plain divs, avoiding a chart-library dependency.
function JudgeSparkbars({ daily }: { daily: JudgeDayUsage[] }) {
  const t = useT();
  const max = Math.max(1, ...daily.map((d) => d.input_tokens + d.output_tokens));
  return (
    <div className="flex h-16 items-end gap-0.5">
      {daily.map((d) => {
        const total = d.input_tokens + d.output_tokens;
        const h = Math.max(2, Math.round((total / max) * 100));
        return (
          <div
            key={d.date}
            title={t("{date} · {calls} 次 · {total} tokens", { date: d.date, calls: d.calls, total: fmtTokens(total) })}
            className="min-w-[2px] flex-1 rounded-sm bg-violet-500/60 hover:bg-violet-500"
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

// ---- tool scope ----

// SDK tools are intentionally not seeded into the DB (they apply to every agent
// and have no per-agent binding). We hardcode them here so they still appear in
// the scope dialog.
function sdkTool(key: string, description: string): Tool {
  return { key, system: true, description, schema: {}, agents: [], enabled: true, kind: "builtin" };
}

const SDK_EXEC: Tool[] = [
  sdkTool("Bash", "Execute a command in the shell"),
  sdkTool("WebFetch", "Make an HTTP/HTTPS request (with proxy support)"),
  sdkTool("web_search", "Web search"),
  sdkTool("shell_open", "Open a persistent PTY interactive session"),
  sdkTool("shell_send", "Send input to an interactive session"),
  sdkTool("shell_read", "Read output from an interactive session"),
  sdkTool("shell_close", "Close an interactive session"),
  sdkTool("shell_list", "List all interactive sessions"),
];

const SDK_WRITE: Tool[] = [
  sdkTool("Write", "Write a file"),
  sdkTool("Edit", "Edit a file (exact replacement)"),
  sdkTool("MultiEdit", "Batch-edit files"),
];

const SDK_KEYS = new Set([...SDK_EXEC, ...SDK_WRITE].map((t) => t.key));

function groupTools(dbTools: Tool[]) {
  const sys: Tool[] = [],
    custom: Tool[] = [];
  for (const t of dbTools) {
    if (SDK_KEYS.has(t.key)) continue; // already covered by hardcoded groups
    if (t.system) sys.push(t);
    else custom.push(t);
  }
  return [
    { label: "Execution", tools: SDK_EXEC },
    { label: "Write/Edit", tools: SDK_WRITE },
    { label: "System tools", tools: sys },
    { label: "Custom tools", tools: custom },
  ].filter((g) => g.tools.length > 0);
}

// ---- form state ----

type RuleForm = {
  name: string;
  enabled: boolean;
  priority: number;
  match_target: "tool_name" | "tool_input";
  match_type: "string" | "regex";
  pattern: string;
  action: InterceptAction;
  message: string;
  timeout_enabled: boolean;
  timeout_seconds: number;
  timeout_action: "deny" | "allow";
};

const defaultForm = (): RuleForm => ({
  name: "",
  enabled: true,
  priority: 0,
  match_target: "tool_name",
  match_type: "string",
  pattern: "",
  action: "deny",
  message: "",
  timeout_enabled: true,
  timeout_seconds: 60,
  timeout_action: "deny",
});

// ---- small components ----

function ActionBadge({ action }: { action: InterceptAction }) {
  const t = useT();
  if (action === "allow") return <Badge variant="secondary">{t("允许")}</Badge>;
  if (action === "deny") return <Badge variant="destructive">{t("禁止")}</Badge>;
  return (
    <Badge variant="outline" className="border-amber-400 text-amber-600">
      {t("申请")}
    </Badge>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

// ---- LLM fallback judge card ----

const FOLLOW_ACTIVE = "0"; // profile_id 0 = follow the active/default config

const defaultJudge = (): JudgeConfig => ({
  enabled: false,
  profile_id: 0,
  prompt: "",
  timeout_seconds: 15,
  fail_action: "allow",
  ask_timeout_seconds: 300,
  ask_timeout_action: "deny",
});

function JudgeCard() {
  const t = useT();
  const [cfg, setCfg] = React.useState<JudgeConfig>(defaultJudge());
  const [profiles, setProfiles] = React.useState<LLMProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [usage, setUsage] = React.useState<JudgeUsage | null>(null);

  // Approval usage stats: failures do not interrupt the config page; fetched only when enabled.
  const loadUsage = React.useCallback(async () => {
    try {
      setUsage(await api.interceptJudgeUsage(30));
    } catch {
      // Ignore: stats being unavailable should not affect config editing
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [j, ps] = await Promise.all([api.interceptGetJudgeConfig(), api.llmProfiles()]);
      setCfg(j);
      setProfiles(ps);
    } catch (e) {
      toast.error(`${t("加载模型兜底配置失败")}: ${t((e as Error).message)}`);
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    load();
  }, [load]);

  // When enabled (including when the initial load reads the toggle as true), fetch approval usage stats.
  React.useEffect(() => {
    if (cfg.enabled) loadUsage();
  }, [cfg.enabled, loadUsage]);

  function patch(p: Partial<JudgeConfig>) {
    setCfg((c) => ({ ...c, ...p }));
  }

  async function save() {
    setSaving(true);
    try {
      await api.interceptSetJudgeConfig(cfg);
      toast.success(t("模型兜底配置已保存"));
      await load(); // read back: if the prompt was cleared, backfill the built-in template
    } catch (e) {
      toast.error(`${t("保存失败")}: ${t((e as Error).message)}`);
    } finally {
      setSaving(false);
    }
  }

  async function restorePrompt() {
    // Clearing the prompt and saving → the server returns the full built-in template next time, backfilled into the input box.
    setSaving(true);
    try {
      await api.interceptSetJudgeConfig({ ...cfg, prompt: "" });
      const j = await api.interceptGetJudgeConfig();
      setCfg(j);
      toast.success(t("已恢复内置默认模板"));
    } catch (e) {
      toast.error(`${t("恢复失败")}: ${t((e as Error).message)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Enable toggle — standalone highlight bar */}
      <div
        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
          cfg.enabled ? "border-violet-400/50 bg-violet-50/40 dark:bg-violet-950/20" : "bg-muted/40"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <BotIcon className={`h-5 w-5 shrink-0 ${cfg.enabled ? "text-violet-600" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm font-semibold leading-tight">{t("模型兜底审批")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("在")}
              <span className="font-medium text-foreground">{t("拦截范围")}</span>
              {t("内、且")}
              <span className="font-medium text-foreground">{t("没有任何拦截规则命中")}</span>
              {t("的命令，才由模型做语义判断（放行 / 转人工 / 拦截）")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">{cfg.enabled ? t("已启用") : t("未启用")}</span>
          <Switch checked={cfg.enabled} disabled={loading} onCheckedChange={(v) => patch({ enabled: v })} />
        </div>
      </div>

      {/* Approval token usage stats (global cumulative, independent of per-model configs) */}
      {cfg.enabled && usage && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("审批 Token 消耗")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("模型兜底审批累计用量,单独计量(worker=judge),不与各模型配置的统计混在一起")}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadUsage}>
                {t("刷新")}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <JudgeStat label={t("审批调用")} value={usage.calls.toLocaleString()} />
              <JudgeStat label={t("输入 Token")} value={fmtTokens(usage.input_tokens)} />
              <JudgeStat label={t("输出 Token")} value={fmtTokens(usage.output_tokens)} />
              <JudgeStat label={t("缓存读")} value={fmtTokens(usage.cache_read_tokens)} />
              <JudgeStat label={t("缓存写")} value={fmtTokens(usage.cache_write_tokens)} />
            </div>
            {usage.daily.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("近 30 天每日消耗(输入 + 输出)")}
                </p>
                <JudgeSparkbars daily={usage.daily} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {cfg.enabled && (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Left: prompt editor (expanded directly, main area) */}
          <Card className="lg:col-span-3">
            <CardContent className="flex h-full flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("审批提示词")}</p>
                  <p className="text-xs text-muted-foreground">{t("模型据此判定 ALLOW / ASK / DENY，可直接编辑")}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={restorePrompt} disabled={saving}>
                  {t("恢复默认模板")}
                </Button>
              </div>
              <Textarea
                className="min-h-[22rem] flex-1 resize-none font-mono text-xs leading-relaxed"
                value={cfg.prompt}
                onChange={(e) => patch({ prompt: e.target.value })}
                placeholder={t("留空使用内置模板")}
                spellCheck={false}
              />
              <p className="text-right text-[11px] text-muted-foreground">{t("{n} 字", { n: cfg.prompt.length })}</p>
            </CardContent>
          </Card>

          {/* Right: judgment parameters (settings bar) */}
          <Card className="lg:col-span-2">
            <CardContent className="space-y-5 p-4">
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("判定模型与策略")}
                </p>
                <Field label={t("审批模型")}>
                  <Select value={String(cfg.profile_id || 0)} onValueChange={(v) => patch({ profile_id: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FOLLOW_ACTIVE}>{t("跟随激活配置")}</SelectItem>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {t("{name}（{model}）", { name: p.name, model: p.model })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("模型判定超时（秒）")}>
                  <Input
                    type="number"
                    min={1}
                    value={cfg.timeout_seconds}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (n > 0) patch({ timeout_seconds: n });
                    }}
                  />
                </Field>
                <Field label={t("模型失败时（出错 / 超时 / 无法解析）")}>
                  <Select
                    value={cfg.fail_action}
                    onValueChange={(v) => patch({ fail_action: v as JudgeConfig["fail_action"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">{t("放行")}</SelectItem>
                      <SelectItem value="ask">{t("转人工审批")}</SelectItem>
                      <SelectItem value="deny">{t("拦截")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("人工审批（模型判为「转人工」时）")}
                </p>
                <Field label={t("审批等待超时（秒）")}>
                  <Input
                    type="number"
                    min={5}
                    value={cfg.ask_timeout_seconds}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (n > 0) patch({ ask_timeout_seconds: n });
                    }}
                  />
                </Field>
                <Field label={t("超时后默认动作")}>
                  <Select
                    value={cfg.ask_timeout_action}
                    onValueChange={(v) => patch({ ask_timeout_action: v as JudgeConfig["ask_timeout_action"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deny">{t("拦截")}</SelectItem>
                      <SelectItem value="allow">{t("放行")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={saving || loading}>
          {saving ? t("保存中…") : t("保存配置")}
        </Button>
      </div>
    </div>
  );
}

// ---- page ----

export default function InterceptPage() {
  const tFn = useT();
  const [rules, setRules] = React.useState<InterceptRule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InterceptRule | null>(null);
  const [form, setForm] = React.useState<RuleForm>(defaultForm());
  const [saving, setSaving] = React.useState(false);
  const [regexErr, setRegexErr] = React.useState("");
  const [regexWarn, setRegexWarn] = React.useState(false); // true = JS cannot parse it but it may be valid Go syntax

  // ---- tool scope dialog ----
  const [scopeOpen, setScopeOpen] = React.useState(false);
  const [allTools, setAllTools] = React.useState<Tool[]>([]);
  const [enabledTools, setEnabledTools] = React.useState<Set<string>>(new Set());
  const [scopeLoading, setScopeLoading] = React.useState(false);
  const [scopeSaving, setScopeSaving] = React.useState(false);
  const [scopeTools, setScopeTools] = React.useState<string[]>([]); // page-header info bar: tools currently subject to interception

  // ---- data ----

  const loadScope = React.useCallback(async () => {
    try {
      const cfg = await api.interceptGetToolConfig();
      setScopeTools(cfg.enabled_tools);
    } catch {
      // the info bar is non-critical; fail silently
    }
  }, []);

  const load = React.useCallback(async () => {
    try {
      const r = await api.interceptRules();
      setRules(r);
    } catch {
      toast.error(tFn("加载拦截规则失败"));
    } finally {
      setLoading(false);
    }
  }, [tFn]);

  React.useEffect(() => {
    load();
    loadScope();
  }, [load, loadScope]);

  React.useEffect(() => {
    if (form.match_type !== "regex" || !form.pattern) {
      setRegexErr("");
      setRegexWarn(false);
      return;
    }
    try {
      new RegExp(form.pattern);
      setRegexErr("");
      setRegexWarn(false);
    } catch {
      // JS RegExp does not support Go RE2 extended syntax (e.g. the inline (?i) flag).
      // This is only a preview validation failure and does not mean it is invalid on the Go side; final validation is left to the server.
      setRegexErr("");
      setRegexWarn(true);
    }
  }, [form.pattern, form.match_type]);

  // ---- rule handlers ----

  function set(patch: Partial<RuleForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function openNew() {
    setEditing(null);
    setForm(defaultForm());
    setRegexErr("");
    setOpen(true);
  }

  function openEdit(rule: InterceptRule) {
    setEditing(rule);
    setForm({
      name: rule.name,
      enabled: rule.enabled,
      priority: rule.priority,
      match_target: rule.match_target,
      match_type: rule.match_type,
      pattern: rule.pattern,
      action: rule.action,
      message: rule.message,
      timeout_enabled: rule.timeout_enabled,
      timeout_seconds: rule.timeout_seconds,
      timeout_action: rule.timeout_action,
    });
    setRegexErr("");
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(tFn("名称不能为空"));
      return;
    }
    if (!form.pattern.trim()) {
      toast.error(tFn("模式不能为空"));
      return;
    }
    if (regexErr) {
      toast.error(tFn("正则表达式语法无效"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.updateInterceptRule(editing.id, form);
        toast.success(tFn("规则已更新"));
      } else {
        await api.createInterceptRule(form);
        toast.success(tFn("规则已创建"));
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(tFn((e as Error).message));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteInterceptRule(id);
      toast.success(tFn("规则已删除"));
      load();
    } catch (e) {
      toast.error(tFn((e as Error).message));
    }
  }

  async function handleToggle(rule: InterceptRule) {
    try {
      await api.toggleInterceptRule(rule.id, !rule.enabled);
      load();
    } catch (e) {
      toast.error(tFn((e as Error).message));
    }
  }

  // ---- scope handlers ----

  async function openScope() {
    setScopeOpen(true);
    setScopeLoading(true);
    try {
      const [tools, cfg] = await Promise.all([api.tools(), api.interceptGetToolConfig()]);
      setAllTools(tools);
      setEnabledTools(new Set(cfg.enabled_tools));
    } catch (e) {
      toast.error(`${tFn("加载失败")}: ${tFn((e as Error).message)}`);
    } finally {
      setScopeLoading(false);
    }
  }

  function toggleTool(key: string, val: boolean) {
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (val) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  async function saveScope() {
    setScopeSaving(true);
    try {
      await api.interceptSetToolConfig([...enabledTools]);
      toast.success(tFn("拦截范围已保存"));
      setScopeTools([...enabledTools]);
      setScopeOpen(false);
    } catch (e) {
      toast.error(`${tFn("保存失败")}: ${tFn((e as Error).message)}`);
    } finally {
      setScopeSaving(false);
    }
  }

  const toolGroups = React.useMemo(() => groupTools(allTools), [allTools]);

  // ---- render ----

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      {/* ---- header ---- */}
      <div className="flex items-center gap-2.5">
        <ShieldAlertIcon className="h-5 w-5 shrink-0" />
        <div>
          <h1 className="text-lg font-semibold leading-tight">{tFn("命令拦截")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tFn("工具执行前先按拦截规则匹配；未命中的命令可交由模型兜底判定")}
          </p>
        </div>
      </div>

      {/* ---- Interception-scope info bar (shared by rule matching and model fallback: tools out of scope are untouched by both) ---- */}
      <div
        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 ${
          scopeTools.length === 0 ? "border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20" : "bg-muted/40"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <ListFilterIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0 font-medium">{tFn("拦截范围")}</span>
          {scopeTools.length === 0 ? (
            <span className="text-amber-700 dark:text-amber-500">
              {tFn("未启用任何工具 — 拦截规则与模型兜底均不会生效")}
            </span>
          ) : (
            <>
              <Badge variant="secondary" className="shrink-0">
                {tFn("{n} 个工具", { n: scopeTools.length })}
              </Badge>
              <span className="truncate text-muted-foreground" title={scopeTools.join(tFn("、"))}>
                {scopeTools.join(tFn("、"))}
              </span>
            </>
          )}
        </div>
        <Button
          variant={scopeTools.length === 0 ? "default" : "outline"}
          size="sm"
          className="shrink-0"
          onClick={openScope}
        >
          <ListFilterIcon className="h-4 w-4" />
          {tFn("调整范围")}
        </Button>
      </div>

      <Tabs defaultValue="rules" className="flex-1">
        <TabsList>
          <TabsTrigger value="rules">{tFn("拦截规则")}</TabsTrigger>
          <TabsTrigger value="judge">{tFn("模型配置")}</TabsTrigger>
        </TabsList>

        {/* ---- tab: intercept rules ---- */}
        <TabsContent value="rules" className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {tFn("按优先级（数字越大越先）逐条匹配，首条命中的规则生效")}
            </p>
            <Button onClick={openNew} size="sm" className="shrink-0">
              <PlusIcon className="h-4 w-4" />
              {tFn("新建规则")}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">{tFn("加载中…")}</p>
              ) : rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <ShieldAlertIcon className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">{tFn("暂无规则")}</p>
                  <Button size="sm" variant="outline" onClick={openNew}>
                    <PlusIcon className="h-4 w-4" />
                    {tFn("新建第一条规则")}
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[72px]">{tFn("优先级")}</TableHead>
                      <TableHead>{tFn("名称")}</TableHead>
                      <TableHead className="w-[90px]">{tFn("目标")}</TableHead>
                      <TableHead className="w-[80px]">{tFn("类型")}</TableHead>
                      <TableHead>{tFn("模式")}</TableHead>
                      <TableHead className="w-[72px]">{tFn("策略")}</TableHead>
                      <TableHead className="w-[64px] text-center">{tFn("启用")}</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id} className={!rule.enabled ? "opacity-40" : ""}>
                        <TableCell>
                          <span className="font-mono text-xs tabular-nums">{rule.priority}</span>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{tFn(rule.name)}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {rule.match_target === "tool_name" ? tFn("工具名") : tFn("输入内容")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {rule.match_type === "regex" ? tFn("正则") : tFn("字符串")}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <code className="block truncate rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {rule.pattern}
                          </code>
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={rule.action} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-0.5">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(rule)}>
                              <PencilIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(rule.id)}
                            >
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- tab: model config ---- */}
        <TabsContent value="judge" className="mt-4">
          <JudgeCard />
        </TabsContent>
      </Tabs>

      {/* ---- editor sheet ---- */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>{editing ? tFn("编辑规则") : tFn("新建规则")}</SheetTitle>
            <SheetDescription className="text-xs">
              {tFn("优先级越大越先匹配；首条命中规则生效，后续跳过")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
            <Field label={tFn("名称")}>
              <Input
                placeholder={tFn("给规则起个名字")}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </Field>

            <Field label={tFn("优先级（数字越大越先匹配）")}>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => set({ priority: parseInt(e.target.value) || 0 })}
              />
            </Field>

            <Separator />

            <Field label={tFn("匹配目标")}>
              <Select
                value={form.match_target}
                onValueChange={(v) => set({ match_target: v as RuleForm["match_target"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tool_name">{tFn("工具名（tool_name）")}</SelectItem>
                  <SelectItem value="tool_input">{tFn("输入内容（tool_input JSON）")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={tFn("匹配类型")}>
              <Select value={form.match_type} onValueChange={(v) => set({ match_type: v as RuleForm["match_type"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">{tFn("字符串包含")}</SelectItem>
                  <SelectItem value="regex">{tFn("正则表达式")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={tFn("模式")}>
              <Input
                placeholder={form.match_type === "regex" ? "^Bash$" : "rm -rf"}
                value={form.pattern}
                onChange={(e) => set({ pattern: e.target.value })}
                className={regexErr ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {regexErr && <p className="text-xs text-destructive mt-1">{regexErr}</p>}
              {regexWarn && (
                <p className="text-xs text-amber-600 mt-1">
                  {tFn("包含 Go RE2 扩展语法（如 ")}
                  <code className="font-mono">(?i)</code>
                  {tFn("），浏览器无法预览，提交后由服务端验证")}
                </p>
              )}
            </Field>

            <Separator />

            <Field label={tFn("拦截策略")}>
              <Select value={form.action} onValueChange={(v) => set({ action: v as InterceptAction })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">{tFn("允许 — 直接放行，跳过后续规则")}</SelectItem>
                  <SelectItem value="deny">{tFn("禁止 — 阻断，返回拒绝消息给模型")}</SelectItem>
                  <SelectItem value="ask">{tFn("向用户申请 — 等待审批")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {form.action !== "allow" && (
              <Field label={form.action === "deny" ? tFn("拒绝消息（返回给模型）") : tFn("审批说明（可选）")}>
                <Textarea
                  placeholder={form.action === "deny" ? tFn("操作被安全策略阻止") : ""}
                  value={form.message}
                  onChange={(e) => set({ message: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </Field>
            )}

            {form.action === "ask" && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tFn("启用审批超时")}</p>
                    <p className="text-xs text-muted-foreground">{tFn("超时后自动处置，不再等待")}</p>
                  </div>
                  <Switch checked={form.timeout_enabled} onCheckedChange={(v) => set({ timeout_enabled: v })} />
                </div>
                {form.timeout_enabled && (
                  <div className="flex items-end gap-3">
                    <Field label={tFn("超时时间（秒）")}>
                      <Input
                        type="number"
                        min={5}
                        className="w-28"
                        value={form.timeout_seconds}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          if (n > 0) set({ timeout_seconds: n });
                        }}
                      />
                    </Field>
                    <Field label={tFn("超时动作")}>
                      <Select
                        value={form.timeout_action}
                        onValueChange={(v) => set({ timeout_action: v as "deny" | "allow" })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deny">{tFn("自动拒绝")}</SelectItem>
                          <SelectItem value="allow">{tFn("自动允许")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}
              </>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <Switch id="rule-enabled" checked={form.enabled} onCheckedChange={(v) => set({ enabled: v })} />
              <Label htmlFor="rule-enabled" className="cursor-pointer">
                {tFn("启用此规则")}
              </Label>
            </div>
          </div>

          <SheetFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tFn("取消")}
            </Button>
            <Button onClick={handleSave} disabled={saving || !!regexErr}>
              {saving ? tFn("保存中…") : tFn("保存")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ---- scope dialog ---- */}
      <Dialog open={scopeOpen} onOpenChange={setScopeOpen}>
        <DialogContent
          className="sm:max-w-lg flex flex-col overflow-hidden p-0 gap-0"
          style={{ maxHeight: "min(80vh, 560px)" }}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <ListFilterIcon className="h-4 w-4" />
              {tFn("拦截范围")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {tFn("只有启用拦截的工具才会进入规则匹配；其余工具直接放行")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-5">
            {scopeLoading ? (
              <p className="text-sm text-muted-foreground py-4">{tFn("加载中…")}</p>
            ) : (
              toolGroups.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <Separator className="mb-5" />}
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {tFn(group.label)}
                  </p>
                  <div className="space-y-0.5">
                    {group.tools.map((t) => (
                      <div key={t.key} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50">
                        <Switch
                          id={`scope-${t.key}`}
                          checked={enabledTools.has(t.key)}
                          onCheckedChange={(v) => toggleTool(t.key, v)}
                        />
                        <label htmlFor={`scope-${t.key}`} className="flex-1 min-w-0 cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm">{t.key}</span>
                            {t.kind && t.kind !== "builtin" && (
                              <Badge variant="outline" className="px-1 py-0 text-[10px]">
                                {t.kind}
                              </Badge>
                            )}
                          </div>
                          {t.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{tFn(t.description)}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t px-6 py-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setScopeOpen(false)}>
              {tFn("取消")}
            </Button>
            <Button size="sm" onClick={saveScope} disabled={scopeSaving || scopeLoading}>
              {scopeSaving ? tFn("保存中…") : tFn("保存")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
