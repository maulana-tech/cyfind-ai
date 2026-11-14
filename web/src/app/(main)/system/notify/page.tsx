"use client";

import * as React from "react";

import { BellIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { t as tMod, useT } from "@/i18n";
import { api } from "@/lib/api";
import type { NotificationChannel, NotificationFilter, NotificationMeta } from "@/lib/types";

import {
  CHANNEL_FIELDS,
  type ChannelForm,
  emptyForm,
  KIND_LABEL,
  parseIDs,
  parseKeywords,
  parseKV,
  SEVERITY_OPTIONS,
} from "./_components/channel-fields";
import { ConfigField, FilterSummary } from "./_components/channel-form";
import { DeliveryList } from "./_components/delivery-list";
import { formatBacklog, StatTile } from "./_components/stat-tile";

// This page only orchestrates: load data, maintain form state, call the endpoints.
// Field definitions and parsing live in _components/channel-fields.ts, the controls and filter summary in
// _components/channel-form.tsx, and the delivery records in _components/delivery-list.tsx —
// they are split because each can be understood on its own, whereas crammed into one file this page approached 1100 lines.
export default function NotifyPage() {
  const t = useT();
  const [meta, setMeta] = React.useState<NotificationMeta | null>(null);
  const [channels, setChannels] = React.useState<NotificationChannel[]>([]);
  const [tab, setTab] = React.useState<"channels" | "deliveries">("channels");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NotificationChannel | null>(null);
  const [form, setForm] = React.useState<ChannelForm>(emptyForm("dingtalk"));
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const [globalSaving, setGlobalSaving] = React.useState(false);
  const [baseURL, setBaseURL] = React.useState("");
  const [digestMin, setDigestMin] = React.useState("");

  const load = React.useCallback(() => {
    api
      .notifyMeta()
      .then((m) => {
        setMeta(m);
        setBaseURL(m.public_base_url);
        setDigestMin(m.digest_interval_min);
      })
      .catch((e) => toast.error(tMod("读取推送配置失败：{message}", { message: (e as Error).message })));
    // A channel-list load failure must be surfaced: a silent failure would look like "no channels at all",
    // and the user would think their config was lost, which is more alarming than an explicit error.
    api
      .notifyChannels()
      .then(setChannels)
      .catch((e) => toast.error(tMod("读取渠道列表失败：{message}", { message: (e as Error).message })));
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);

  function setF(patch: Partial<ChannelForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }
  function setCfg(key: string, value: unknown) {
    setForm((f) => ({ ...f, config: { ...f.config, [key]: value } }));
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(meta?.kinds[0]?.kind ?? "dingtalk"));
    setOpen(true);
  }

  function openEdit(ch: NotificationChannel) {
    setEditing(ch);
    // filter is a Go struct on the backend and always serializes to an object (never null), so no fallback is needed.
    const f = ch.filter;
    setForm({
      name: ch.name,
      kind: ch.kind,
      mode: ch.mode,
      enabled: ch.enabled,
      ratePerMin: String(ch.rate_per_min),
      // In the config echoed by the backend, credentials are masked values; put them into the form as-is and send them back as-is on submit,
      // so the backend keeps the original stored value.
      config: { ...ch.config },
      minSeverity: f.min_severity ?? "",
      includeText: (f.vulnclass_include ?? []).join("\n"),
      excludeText: (f.vulnclass_exclude ?? []).join("\n"),
      taskIDsText: (f.task_ids ?? []).join(","),
      assetIDsText: (f.asset_ids ?? []).join(","),
      onStatusChange: f.on_status_change ?? false,
    });
    setOpen(true);
  }

  // buildConfig converts the form state into the channel config.
  //
  // The single rule, two kinds of values:
  //   - masked values ("__masked__...") are sent back as-is → the backend reads this as "this field was not changed, keep the stored value"
  //   - everything else is submitted as the user typed it, an empty string meaning "clear this field"
  //
  // We do not special-case credential fields (e.g. "skip if the credential is left blank") because that would make it IMPOSSIBLE for the user to clear
  // a mistyped key — no UI action could express "I want to delete it". Under the current rule,
  // clearing the input box equals clearing the field: the semantics are unique and user-controlled.
  // Masked values never appear in the input box (see ConfigField), so "there is text in the box" always equals
  // "the user typed it deliberately".
  function buildConfig(): Record<string, unknown> {
    const defs = CHANNEL_FIELDS[form.kind] ?? [];
    const out: Record<string, unknown> = {};
    for (const d of defs) {
      const raw = form.config[d.key];
      if (d.kind === "switch") {
        out[d.key] = raw === true;
        continue;
      }
      if (typeof raw === "string" && raw.startsWith("__masked__")) {
        out[d.key] = raw;
        continue;
      }
      if (d.kind === "number") {
        const n = Number(raw);
        out[d.key] = Number.isFinite(n) && n > 0 ? n : 0;
        continue;
      }
      if (d.kind === "kv") {
        out[d.key] = parseKV(String(raw ?? ""));
        continue;
      }
      if (d.kind === "list") {
        out[d.key] = String(raw ?? "")
          .split(/[\s,，]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        continue;
      }
      out[d.key] = String(raw ?? "").trim();
    }
    return out;
  }

  function buildFilter(): NotificationFilter {
    return {
      min_severity: form.minSeverity || undefined,
      vulnclass_include: parseKeywords(form.includeText),
      vulnclass_exclude: parseKeywords(form.excludeText),
      task_ids: parseIDs(form.taskIDsText),
      asset_ids: parseIDs(form.assetIDsText),
      on_status_change: form.onStatusChange,
    };
  }

  async function saveForm() {
    if (!form.name.trim()) {
      toast.error(t("请填写渠道名称"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        mode: form.mode,
        enabled: form.enabled,
        config: buildConfig(),
        filter: buildFilter(),
        rate_per_min: form.ratePerMin.trim() === "" ? undefined : Number(form.ratePerMin),
      };
      if (editing) {
        await api.notifyUpdateChannel(editing.id, payload);
        toast.success(t("已保存"));
        setOpen(false);
      } else {
        await api.notifyCreateChannel(payload);
        toast.success(t("已添加渠道"));
        setOpen(false);
      }
      load();
    } catch (e) {
      toast.error(t("保存失败：{message}", { message: (e as Error).message }));
    } finally {
      setSaving(false);
    }
  }

  async function testChannel() {
    if (!editing) return;
    setTesting(true);
    try {
      const r = await api.notifyTestChannel(editing.id);
      toast.success(t("已发出测试消息（{ms} ms），请到群里确认", { ms: r.latency_ms }));
    } catch (e) {
      // The backend faithfully returns the raw error from the channel; it is the only clue for troubleshooting the config, so show it as-is.
      toast.error(t("测试失败：{message}", { message: (e as Error).message }), { duration: 12000 });
    } finally {
      setTesting(false);
    }
  }

  async function removeChannel(ch: NotificationChannel) {
    try {
      await api.notifyDeleteChannel(ch.id);
      toast.success(t("已删除：{name}", { name: ch.name }));
      setOpen(false);
      load();
    } catch (e) {
      toast.error(t("删除失败：{message}", { message: (e as Error).message }));
    }
  }

  async function toggleEnabled(ch: NotificationChannel) {
    try {
      await api.notifyUpdateChannel(ch.id, { enabled: !ch.enabled });
      load();
    } catch (e) {
      toast.error(t("操作失败：{message}", { message: (e as Error).message }));
    }
  }

  async function toggleGlobal(on: boolean) {
    setGlobalSaving(true);
    try {
      await api.setSettings({ notify_enabled: on });
      setMeta((m) => (m ? { ...m, enabled: on } : m));
      toast.success(on ? t("推送已开启") : t("推送已暂停"));
    } catch (e) {
      toast.error(t("操作失败：{message}", { message: (e as Error).message }));
    } finally {
      setGlobalSaving(false);
    }
  }

  async function saveGlobal() {
    setGlobalSaving(true);
    try {
      const patch: Record<string, unknown> = { notify_public_base_url: baseURL.trim() };
      const n = Number(digestMin);
      if (Number.isFinite(n) && n > 0) patch.notify_digest_interval_min = n;
      await api.setSettings(patch);
      toast.success(t("已保存"));
      load();
    } catch (e) {
      toast.error(t("保存失败：{message}", { message: (e as Error).message }));
    } finally {
      setGlobalSaving(false);
    }
  }

  const fields = CHANNEL_FIELDS[form.kind] ?? [];
  const secretKeys = new Set(meta?.kinds.find((k) => k.kind === form.kind)?.secret_keys ?? []);
  const defaultRate = meta?.kinds.find((k) => k.kind === form.kind)?.default_rate_per_min ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("通知推送")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("发现漏洞时推送到钉钉 / 飞书 / 企业微信等渠道 · 每个渠道可独立设推送时机与过滤规则")}
          </p>
        </div>
        {meta && (
          // Use a div rather than a label: the Switch has its own aria-label, so wrapping another label outside
          // associates with no native control and makes clicking the text look like it should toggle.
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("总开关")}</span>
            <Switch
              checked={meta.enabled}
              disabled={globalSaving}
              onCheckedChange={toggleGlobal}
              aria-label={t("推送总开关")}
            />
          </div>
        )}
      </div>

      {meta && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label={t("渠道")}
            value={`${meta.stats.channels_on} / ${meta.stats.channels}`}
            hint={t("启用 / 总数")}
          />
          <StatTile label={t("今日送达")} value={String(meta.stats.sent_today)} />
          <StatTile label={t("待发送")} value={String(meta.stats.pending)} />
          <StatTile label={t("失败")} value={String(meta.stats.failed)} tone={meta.stats.failed > 0 ? "red" : undefined} />
          <StatTile
            label={t("最久积压")}
            value={formatBacklog(meta.stats.backlog_age_ms)}
            // The backlog age is far more useful than the backlog count: a backlog of 3 can be anywhere from 3 seconds to 3 hours.
            hint={meta.stats.backlog_age_ms > 5 * 60_000 ? t("推送可能卡住了") : undefined}
            tone={meta.stats.backlog_age_ms > 5 * 60_000 ? "red" : undefined}
          />
        </div>
      )}

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-base">{t("全局设置")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="n-base">{t("回链地址")}</Label>
            <Input
              id="n-base"
              placeholder="https://cyfind.example.com"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{t("消息里「查看详情」按钮指向的地址。留空则不带按钮。")}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-digest">{t("汇总周期（分钟）")}</Label>
            <Input
              id="n-digest"
              type="number"
              min={1}
              max={1440}
              placeholder="30"
              value={digestMin}
              onChange={(e) => setDigestMin(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{t("仅对「汇总」模式的渠道生效。")}</p>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={saveGlobal} disabled={globalSaving}>
              {t("保存全局设置")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "channels" | "deliveries")} className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="channels">{t("渠道")}</TabsTrigger>
          <TabsTrigger value="deliveries">{t("投递记录")}</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={openAdd}
              className="text-foreground/70 border-foreground/70 hover:bg-muted/60 hover:shadow-sm flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition"
            >
              <PlusIcon className="size-6" />
              <span className="text-sm">{t("添加渠道")}</span>
            </button>

            {channels.map((ch) => (
              <Card
                key={ch.id}
                onClick={() => openEdit(ch)}
                className="hover:border-primary/60 cursor-pointer gap-3 transition hover:shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BellIcon className="text-muted-foreground size-4 shrink-0" />
                    <CardTitle className="truncate text-base">{ch.name}</CardTitle>
                    {/* The whole card is clickable (to enter editing), so these two controls must each swallow bubbling,
                        otherwise the toggle/delete would also trigger editing. stopPropagation is attached to the controls
                        themselves rather than a wrapping div: a wrapping div would create a static element that "looks interactive but has no
                        role", triggering an a11y warning and making no semantic sense. */}
                    <div className="ml-auto flex items-center gap-2">
                      <Switch
                        checked={ch.enabled}
                        onCheckedChange={() => toggleEnabled(ch)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={t("启用")}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={t("删除")}
                        onClick={(e) => {
                          e.stopPropagation();
                          // void explicitly discards the Promise: removeChannel catches and toasts on its own,
                          // so no await is needed here (onClick is not async).
                          void removeChannel(ch);
                        }}
                      >
                        <Trash2Icon className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{t(KIND_LABEL[ch.kind] ?? ch.kind)}</Badge>
                    <Badge variant="outline">{ch.mode === "digest" ? t("汇总") : t("实时")}</Badge>
                    {!ch.enabled && <Badge variant="outline">{t("已停用")}</Badge>}
                  </div>
                  <FilterSummary filter={ch.filter} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliveries">
          <DeliveryList channels={channels} />
        </TabsContent>
      </Tabs>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? editing.name : t("添加通知渠道")}</SheetTitle>
            <SheetDescription>
              {t(KIND_LABEL[form.kind] ?? form.kind)}
              {` · ${defaultRate > 0 ? t("默认限流 {n} 条/分钟", { n: defaultRate }) : t("不限流")}`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("渠道类型")}</Label>
                <Select
                  value={form.kind}
                  onValueChange={(v) => {
                    // Switching type means a different set of credential fields, so the old config must not be merged in.
                    setF({ kind: v, config: {} });
                  }}
                  disabled={!!editing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(meta?.kinds ?? []).map((k) => (
                      <SelectItem key={k.kind} value={k.kind}>
                        {t(KIND_LABEL[k.kind] ?? k.kind)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editing && (
                  <p className="text-muted-foreground text-xs">
                    {t("渠道类型不可修改——改了类型等于换一套凭据，请新建渠道。")}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="n-name">{t("渠道名称")}</Label>
                <Input
                  id="n-name"
                  placeholder={t("应急响应群 / 日常播报群")}
                  value={form.name}
                  onChange={(e) => setF({ name: e.target.value })}
                />
              </div>

              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("该渠道的表单尚未定义（前端缺 CHANNEL_FIELDS 条目），请补全后再试。")}
                </p>
              ) : (
                fields.map((d) => (
                  <ConfigField
                    key={d.key}
                    def={d}
                    value={form.config[d.key]}
                    isSecret={secretKeys.has(d.key)}
                    onChange={(v) => setCfg(d.key, v)}
                  />
                ))
              )}

              <div className="grid gap-2">
                <Label>{t("推送时机")}</Label>
                <Select value={form.mode} onValueChange={(v) => setF({ mode: v as "realtime" | "digest" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">{t("实时 · 每条漏洞单独发一条")}</SelectItem>
                    <SelectItem value="digest">{t("汇总 · 按周期合并成一条")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {t("想做「高危实时、其余汇总」就建两个渠道：一个实时 + 门槛高危，一个汇总 + 不限级别。")}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="n-rate">{t("限流（条/分钟）")}</Label>
                <Input
                  id="n-rate"
                  type="number"
                  min={0}
                  placeholder={defaultRate > 0 ? String(defaultRate) : t("0 = 不限")}
                  value={form.ratePerMin}
                  onChange={(e) => setF({ ratePerMin: e.target.value })}
                />
                <p className="text-muted-foreground text-xs">
                  {t("留空用渠道默认值；0 表示不限流。超限不会丢消息，只会推迟发送。")}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium">{t("过滤规则（留空即不过滤）")}</p>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>{t("最低级别")}</Label>
                    <Select
                      value={form.minSeverity || "all"}
                      onValueChange={(v) => setF({ minSeverity: v === "all" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value || "all"} value={o.value || "all"}>
                            {t(o.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="n-inc">{t("只推这些漏洞类型")}</Label>
                    <Textarea
                      id="n-inc"
                      placeholder={t("SQL注入\n命令执行")}
                      value={form.includeText}
                      onChange={(e) => setF({ includeText: e.target.value })}
                    />
                    <p className="text-muted-foreground text-xs">
                      {t("每行一个关键词，大小写不敏感的子串匹配。留空=全部类型。")}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="n-exc">{t("排除这些漏洞类型")}</Label>
                    <Textarea
                      id="n-exc"
                      placeholder={t("信息泄露")}
                      value={form.excludeText}
                      onChange={(e) => setF({ excludeText: e.target.value })}
                    />
                    <p className="text-muted-foreground text-xs">{t("排除优先于包含：同时命中时会被排除。")}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="n-tasks">{t("限定任务 ID")}</Label>
                    <Input
                      id="n-tasks"
                      placeholder="1, 2, 3"
                      value={form.taskIDsText}
                      onChange={(e) => setF({ taskIDsText: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="n-assets">{t("限定资产 ID")}</Label>
                    <Input
                      id="n-assets"
                      placeholder="10, 11"
                      value={form.assetIDsText}
                      onChange={(e) => setF({ assetIDsText: e.target.value })}
                    />
                    <p className="text-muted-foreground text-xs">{t("任务/资产留空=不限；填写后要求与漏洞有交集。")}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.onStatusChange}
                      onCheckedChange={(v) => setF({ onStatusChange: v })}
                      aria-label={t("接收状态变更")}
                    />
                    {t("漏洞处置状态变更时也推送（仅实时模式）")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Switch checked={form.enabled} onCheckedChange={(v) => setF({ enabled: v })} aria-label={t("启用")} />
                {t("启用该渠道")}
              </div>
            </div>

            <div className="flex gap-2 pt-2 pb-6">
              <Button onClick={saveForm} disabled={saving}>
                {editing ? t("保存") : t("添加")}
              </Button>
              {editing && (
                <Button variant="outline" onClick={testChannel} disabled={testing}>
                  <SendIcon /> {t("发送测试消息")}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
