"use client";

// Shared pieces of the LLM retry config: the "count + interval" of each of the five retry layers.
//
// The five layers from inner to outer: connect (SDK) → empty response (SDK) → same-provider safe window → round-robin circuit breaker → intent re-run.
// The first three layers follow the endpoint, so each model config can override the global default; the last two are process-level, with only one global copy.
//
// All inputs follow the same "leave blank = not configured" semantics, consistent with the backend's db.RetryRule:
//   count     empty/0 = use the built-in default | -1 = disable this layer | >0 = use this count
//   interval  empty/0 = use this layer's own exponential backoff | >0 = use this fixed millisecond interval instead

import * as React from "react";

import { Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import type { LLMRetryOverride, LLMRetryPolicy, LLMRetryRule } from "@/lib/types";

export const ZERO_RULE: LLMRetryRule = { attempts: 0, interval_ms: 0 };
export const ZERO_OVERRIDE: LLMRetryOverride = {
  connect: ZERO_RULE,
  empty: ZERO_RULE,
  stream: ZERO_RULE,
};
const ZERO_POLICY: LLMRetryPolicy = {
  ...ZERO_OVERRIDE,
  breaker: ZERO_RULE,
  intent: ZERO_RULE,
};

type LayerMeta = {
  title: string;
  /** Where this retry layer happens and who executes it */
  where: string;
  /** What kind of errors reach this layer — down to the status code, no guessing */
  trigger: string;
  /** Errors that look similar but do NOT go through this layer, so configuring it without effect is not mistaken for a bug */
  skips?: string;
  desc: string;
  attemptsLabel: string;
  /** The default used when count is left blank, for the placeholder */
  defAttempts: number;
  /** The default strategy used when interval is left blank, for the placeholder */
  defInterval: string;
  /** The meaning of setting count to -1 */
  offHint: string;
};

export const RETRY_LAYERS = {
  connect: {
    title: "Connect retry",
    where: "SDK · before getting a 200",
    trigger:
      "Cannot connect or has not yet received a 200: connection reset / read-write timeout / DNS failure and other network-layer errors, plus HTTP 408, 429, 500, 502, 503, 504.",
    skips: "Other status codes (400 / 401 / 403 / 404 / 413 / 422, etc.) are deterministic rejections; resending fails the same way, so they are thrown straight up.",
    desc: "Resend the same request verbatim. Once the stream has started (a 200 was received), a mid-stream disconnect is no longer this layer's concern.",
    attemptsLabel: "Retry count",
    defAttempts: 3,
    defInterval: "0.5s→1s→2s exponential (capped at 8s)",
    offHint: "-1 = no retries at all, failures are thrown up immediately",
  },
  empty: {
    title: "Empty-response retry",
    where: "SDK · openai format only",
    trigger:
      "HTTP 200, finish_reason is a normal stop, but the whole response has not a single content block — a gateway empty frame, a dropped thinking-field frame, or a sampling hiccup all look like this.",
    skips: "Content missing due to max_tokens truncation does not count (that is solved by raising the output limit; resending would just hit it again).",
    desc: "Resends the entire prompt, so it is expensive on long contexts; do not set the count too high.",
    attemptsLabel: "Retry count",
    defAttempts: 2,
    defInterval: "0.5s→1s→2s exponential (capped at 8s)",
    offHint: "-1 = hand over the empty response verbatim",
  },
  stream: {
    title: "Same-provider safe-window retry",
    where: "This project · before any output is delivered",
    trigger:
      "Problems that arise only after the stream is established (a 200 was received): a mid-stream disconnect, provider overloaded, in-stream 429 / 5xx error events — and not a single token has been handed to the caller yet.",
    skips:
      "Quota exhausted (402 / insufficient_quota, left to round-robin to switch config), context too long (413 / context length, left to compression), and 400 / 401 / 403 / 404 / 422 deterministic rejections are all not retried.",
    desc: "Replays the same request on the same config. Because no output has been delivered, the replay does not duplicate model output or tool execution.",
    attemptsLabel: "Retry count",
    defAttempts: 2,
    defInterval: "0.5s→1s exponential (capped at 4s)",
    offHint: "-1 = hand a broken stream straight to the outer intent re-run",
  },
  breaker: {
    title: "Round-robin circuit breaker",
    where: "This project · process-level, one global copy",
    trigger:
      "Trips when transient failures (429, 5xx, network errors) accumulate consecutively to the threshold; deterministic failures like insufficient balance (402), invalid key (401 / 403), or model not found (404) ignore the threshold and trip on the first occurrence.",
    skips: "One success resets the count to zero, so an occasionally flaky config will not slowly accumulate to a trip.",
    desc: "After tripping it enters cooldown, during which round-robin skips this config outright. The state is persisted and survives a restart.",
    attemptsLabel: "Consecutive failures to trip",
    defAttempts: 3,
    defInterval: "1min→5min→30min gradient",
    offHint: "-1 = transient failures never trip (deterministic failures still trip)",
  },
  intent: {
    title: "Intent re-run",
    where: "This project · process-level, one global copy",
    trigger:
      "None of the earlier layers caught it: the worker ends in model_error — the inner retries were all exhausted, or the stream broke after it had started delivering output (replay is then unsafe, so the whole thing must re-run).",
    skips: "Quota exhaustion is already handled by round-robin switching config, so it is not re-run here; when the task is paused / terminated / entering wrap-up it yields immediately and does not consume backoff time.",
    desc: "Re-runs the whole intent from scratch. It is the outermost layer, so one re-run means the counts of the inner layers are multiplied again.",
    attemptsLabel: "Re-run count",
    defAttempts: 2,
    defInterval: "fixed 3s",
    offHint: "-1 = no re-run; the intent is marked blocked directly",
  },
} satisfies Record<string, LayerMeta>;

type LayerKey = keyof typeof RETRY_LAYERS;

/** Milliseconds in plain words, shown only next to the input box so nobody has to count zeros. */
function humanMs(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${Number((ms / 1000).toFixed(2))}s`;
  return `${Number((ms / 60_000).toFixed(2))}min`;
}

/** Controlled numeric input: empty string ↔ 0, intermediate states ("-", "1e") stay local verbatim without bothering the parent. */
function NumField({
  id,
  value,
  onChange,
  placeholder,
  min,
}: {
  id: string;
  value: number;
  onChange: (n: number) => void;
  placeholder: string;
  min: number;
}) {
  const [text, setText] = React.useState(value === 0 ? "" : String(value));
  // Follow along when the parent swaps in a whole new set of values (strategy loaded, config switched); typing never reaches here,
  // because by then value already equals the parsed result of the local text.
  React.useEffect(() => {
    const incoming = value === 0 ? "" : String(value);
    setText((cur) => (Number(cur || 0) === value ? cur : incoming));
  }, [value]);
  return (
    <Input
      id={id}
      type="number"
      min={min}
      className="w-28 shrink-0"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        onChange(e.target.value.trim() === "" || !Number.isFinite(n) ? 0 : Math.trunc(n));
      }}
    />
  );
}

/** The two knobs of one retry layer. idPrefix preserves the label's htmlFor when it appears multiple times on one page. */
export function RetryRuleFields({
  layer,
  idPrefix,
  value,
  onChange,
  compact,
}: {
  layer: LayerKey;
  idPrefix: string;
  value: LLMRetryRule;
  onChange: (r: LLMRetryRule) => void;
  /** true = the compact version in the config drawer: drop the expanded explanation, keeping only the "what errors reach this layer" line */
  compact?: boolean;
}) {
  const meta = RETRY_LAYERS[layer];
  const human = humanMs(value.interval_ms);
  const t = useT();
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3 rounded-lg border p-3"}>
      <div className="grid gap-0.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <Label className="text-sm">{t(meta.title)}</Label>
          <span className="text-muted-foreground text-xs">{t(meta.where)}</span>
        </div>
        {/* Which errors reach this layer, down to the status code — setting the knobs without any effect usually means the error does not land in this layer at all. */}
        <p className="text-muted-foreground text-xs">
          <span className="font-medium text-foreground">{t("触发")}</span>
          {t("：")}
          {t(meta.trigger)}
        </p>
        {!compact && meta.skips && (
          <p className="text-muted-foreground text-xs">
            <span className="font-medium text-foreground">{t("不走这层")}</span>
            {t("：")}
            {t(meta.skips)}
          </p>
        )}
        {!compact && <p className="text-muted-foreground text-xs">{t(meta.desc)}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${idPrefix}-${layer}-n`} className="text-muted-foreground text-xs">
            {t(meta.attemptsLabel)}
          </Label>
          <NumField
            id={`${idPrefix}-${layer}-n`}
            min={-1}
            value={value.attempts}
            placeholder={t("默认 {n}", { n: meta.defAttempts })}
            onChange={(n) => onChange({ ...value, attempts: n })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${idPrefix}-${layer}-ms`} className="text-muted-foreground text-xs">
            {t("间隔 ms")}
          </Label>
          <NumField
            id={`${idPrefix}-${layer}-ms`}
            min={0}
            value={value.interval_ms}
            placeholder={t("默认退避")}
            onChange={(n) => onChange({ ...value, interval_ms: n })}
          />
          <span className="text-muted-foreground text-xs">
            {human ? t("固定 {ms}", { ms: human }) : t(meta.defInterval)}
          </span>
        </div>
      </div>
      {!compact && (
        <p className="text-muted-foreground text-xs">{t("留空 = 用默认；{hint}。", { hint: t(meta.offHint) })}</p>
      )}
    </div>
  );
}

/** The three-layer override in the model config drawer (the three layers that follow the endpoint). */
export function ProfileRetryFields({
  value,
  onChange,
}: {
  value: LLMRetryOverride;
  onChange: (o: LLMRetryOverride) => void;
}) {
  const t = useT();
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="grid gap-0.5">
        <Label className="text-sm">{t("重试覆盖")}</Label>
        <p className="text-muted-foreground text-xs">
          {t(
            "只对这个配置生效，覆盖「重试与退避」里的全局默认。每格留空 = 跟随全局；次数填 -1 = 关掉这层重试； 间隔填了就用固定间隔取代指数退避。熔断与意图重跑是进程级的，只能在全局那页调。",
          )}
        </p>
      </div>
      {(["connect", "empty", "stream"] as const).map((k) => (
        <div key={k} className="border-t pt-3 first:border-t-0 first:pt-0">
          <RetryRuleFields
            compact
            layer={k}
            idPrefix="pf"
            value={value[k]}
            onChange={(r) => onChange({ ...value, [k]: r })}
          />
        </div>
      ))}
    </div>
  );
}

/** The "Retry and backoff" tab: global defaults for all five layers. */
export function RetryPolicyPanel() {
  const t = useT();
  const [policy, setPolicy] = React.useState<LLMRetryPolicy>(ZERO_POLICY);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.llmRetryPolicy();
      setPolicy({ ...ZERO_POLICY, ...p });
    } catch (e) {
      toast.error(t("读取重试策略失败：{message}", { message: (e as Error).message }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      // The backend clamps out-of-range values back into range and returns them; refresh with the returned values directly, so what you see is what is stored.
      const saved = await api.saveLLMRetryPolicy(policy);
      setPolicy({ ...ZERO_POLICY, ...saved });
      toast.success(t("已保存，即时生效（正在跑的这一轮调用仍用旧参数）"));
    } catch (e) {
      toast.error(t("保存失败：{message}", { message: (e as Error).message }));
    } finally {
      setSaving(false);
    }
  }

  const set = (k: LayerKey) => (r: LLMRetryRule) => setPolicy((p) => ({ ...p, [k]: r }));

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-10 text-muted-foreground text-sm">
        <Loader2Icon className="size-4 animate-spin" /> {t("读取重试策略…")}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-muted/30 p-3 text-muted-foreground text-xs leading-relaxed">
        {t("一次模型调用的失败会依次经过五层重试，由内到外：")}
        <span className="text-foreground">{t(" 建连 → 空响应 → 同 provider 安全窗口 → 轮询熔断 → 意图重跑")}</span>
        {t("。内层用尽才轮到外层，所以次数是")}
        <span className="text-foreground">{t("相乘")}</span>
        {t(
          "的——把每层都拉满，一次抖动能烧掉几十次请求。 全部留空即当前默认值，与没有这页时的行为完全一致。前三层可以在每个模型配置里单独覆盖。",
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(RETRY_LAYERS) as LayerKey[]).map((k) => (
          <RetryRuleFields key={k} layer={k} idPrefix="gl" value={policy[k]} onChange={set(k)} />
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {t("保存")}
        </Button>
        <Button variant="outline" onClick={() => setPolicy(ZERO_POLICY)} disabled={saving}>
          {t("全部恢复默认")}
        </Button>
      </div>
    </div>
  );
}
