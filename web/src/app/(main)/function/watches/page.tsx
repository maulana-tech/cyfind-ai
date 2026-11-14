"use client";

import * as React from "react";

import { AlertTriangleIcon, Loader2Icon, PauseIcon, PlayIcon, PlusIcon, RadarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Watch, WatchDetection, WatchResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

function fmtTime(ts: string) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const countArr = (x: unknown): number => (Array.isArray(x) ? x.length : 0);

function responseTier(x: unknown): string {
  if (x && typeof x === "object" && "tier" in x) {
    const t = (x as { tier?: unknown }).tier;
    if (typeof t === "string" && t) return t;
  }
  return "observe";
}

function shortAddr(a: string): string {
  return a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a;
}

const pretty = (x: unknown): string => {
  try {
    return JSON.stringify(x ?? null, null, 2);
  } catch {
    return String(x);
  }
};

// A watch's response tier colours its badge: observe is neutral, recommend warns,
// act is highlighted (but act is fail-safe on the backend — it never signs a tx
// unless an approval gate + signing executor are wired).
function tierVariant(tier: string): "secondary" | "outline" | "destructive" {
  if (tier === "act") return "destructive";
  if (tier === "recommend") return "outline";
  return "secondary";
}

const DEFAULT_FORM = {
  chain: "ethereum",
  address: "",
  rpc_url: "",
  interval_ms: "12000",
  preexec: false,
  conditions: "[]",
  rules: "[]",
  response: '{ "tier": "observe" }',
};

export default function WatchesPage() {
  const [watches, setWatches] = React.useState<Watch[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Watch | null>(null);
  const [deleting, setDeleting] = React.useState<Watch | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .watches()
      .then((r) => setWatches(r.watches))
      .catch((e) => toast.error(`Load failed: ${(e as Error).message}`))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => load(), [load]);

  async function toggleState(w: Watch) {
    const next = w.state === "active" ? "paused" : "active";
    setBusyId(w.id);
    try {
      await api.setWatchState(w.id, next);
      setWatches((prev) => prev.map((x) => (x.id === w.id ? { ...x, state: next } : x)));
      toast.success(`Watch #${w.id} ${next}`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function doDelete(w: Watch) {
    setBusyId(w.id);
    try {
      await api.deleteWatch(w.id);
      setWatches((prev) => prev.filter((x) => x.id !== w.id));
      if (selected?.id === w.id) setSelected(null);
      toast.success(`Watch #${w.id} deleted`);
    } catch (e) {
      toast.error(`Delete failed: ${(e as Error).message}`);
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <RadarIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold tracking-tight">Watches</h1>
          <Badge variant="secondary">{watches.length}</Badge>
        </div>
        <Button size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          New watch
        </Button>
      </div>

      <p className="max-w-3xl text-sm text-muted-foreground">
        Continuous on-chain monitoring (EVM). Each watch polls a contract per block for invariant breaks, event
        thresholds and price deltas. Detections are observe-only; the <span className="font-mono">act</span> response
        tier is fail-safe and never signs a transaction unless an approval gate and signing executor are wired.
      </p>

      {/* Table */}
      <div className="flex h-[calc(100vh-15rem)] min-h-0 flex-col">
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden py-0">
          <div className="min-h-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-[80px]">State</TableHead>
                  <TableHead className="w-[100px]">Chain</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[90px]">Interval</TableHead>
                  <TableHead className="w-[80px]">Checks</TableHead>
                  <TableHead className="w-[90px]">Pre-exec</TableHead>
                  <TableHead className="w-[100px]">Tier</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && watches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : watches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No watches yet — create one to start monitoring a contract.
                    </TableCell>
                  </TableRow>
                ) : (
                  watches.map((w) => {
                    const tier = responseTier(w.response);
                    return (
                      <TableRow
                        key={w.id}
                        className={cn("cursor-pointer", selected?.id === w.id && "bg-accent hover:bg-accent")}
                        onClick={() => setSelected(w)}
                      >
                        <TableCell>
                          <Badge
                            variant={w.state === "active" ? "secondary" : "outline"}
                            className={cn("text-xs", w.state === "active" && "text-emerald-600")}
                          >
                            {w.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{w.chain || "-"}</TableCell>
                        <TableCell className="max-w-0">
                          <code className="block truncate font-mono text-xs">{shortAddr(w.address)}</code>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums text-muted-foreground">{w.interval_ms}ms</TableCell>
                        <TableCell className="text-xs tabular-nums text-muted-foreground">
                          {countArr(w.conditions)}c / {countArr(w.rules)}r
                        </TableCell>
                        <TableCell>
                          {w.preexec ? (
                            <Badge variant="outline" className="text-xs">
                              on
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">off</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tierVariant(tier)} className="text-xs font-mono">
                            {tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              disabled={busyId === w.id}
                              title={w.state === "active" ? "Pause" : "Resume"}
                              onClick={() => toggleState(w)}
                            >
                              {w.state === "active" ? (
                                <PauseIcon className="size-4" />
                              ) : (
                                <PlayIcon className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-red-600 hover:text-red-700"
                              disabled={busyId === w.id}
                              title="Delete"
                              onClick={() => setDeleting(w)}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <CreateWatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />

      <WatchDetailSheet watch={selected} onClose={() => setSelected(null)} />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete watch #{deleting?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This stops the monitor and removes the watch. Its recorded detections and responses are deleted too. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleting && doDelete(deleting)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Create dialog ----

function CreateWatchDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset to defaults whenever the dialog opens.
  React.useEffect(() => {
    if (open) setForm(DEFAULT_FORM);
  }, [open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  // parseField validates one JSON blob and surfaces a per-field error via toast.
  function parseField(label: string, raw: string): { ok: true; value: unknown } | { ok: false } {
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (e) {
      toast.error(`${label}: invalid JSON — ${(e as Error).message}`);
      return { ok: false };
    }
  }

  async function submit() {
    if (!form.address.trim() || !form.rpc_url.trim()) {
      toast.error("Address and RPC URL are required");
      return;
    }
    const conditions = parseField("Conditions", form.conditions);
    if (!conditions.ok) return;
    const rules = parseField("Rules", form.rules);
    if (!rules.ok) return;
    const response = parseField("Response", form.response);
    if (!response.ok) return;
    const interval = Number(form.interval_ms);
    if (!Number.isFinite(interval) || interval <= 0) {
      toast.error("Interval must be a positive number of milliseconds");
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await api.createWatch({
        chain: form.chain.trim() || "ethereum",
        address: form.address.trim(),
        rpc_url: form.rpc_url.trim(),
        interval_ms: interval,
        preexec: form.preexec,
        conditions: conditions.value,
        rules: rules.value,
        response: response.value,
      });
      toast.success(`Watch #${id} created`);
      onCreated();
    } catch (e) {
      toast.error(`Create failed: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>New watch</DialogTitle>
          <DialogDescription>
            Monitor a contract you are authorized to watch. Conditions, rules and the response plan are JSON — see
            <span className="font-mono"> deploy/web3/examples/watches.sample.json</span> for working examples.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="w-chain">Chain</Label>
              <Input id="w-chain" value={form.chain} onChange={(e) => set("chain", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-interval">Interval (ms)</Label>
              <Input
                id="w-interval"
                inputMode="numeric"
                value={form.interval_ms}
                onChange={(e) => set("interval_ms", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="w-address">Contract address</Label>
            <Input
              id="w-address"
              placeholder="0x…"
              className="font-mono"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="w-rpc">RPC URL</Label>
            <Input
              id="w-rpc"
              placeholder="https://…"
              value={form.rpc_url}
              onChange={(e) => set("rpc_url", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="space-y-0.5">
              <Label htmlFor="w-preexec">Pre-exec simulation</Label>
              <p className="text-xs text-muted-foreground">
                Also simulate pending mempool txs against the invariants (EVM, approximate).
              </p>
            </div>
            <Switch id="w-preexec" checked={form.preexec} onCheckedChange={(v) => set("preexec", v)} />
          </div>

          <JsonField
            label="Conditions"
            hint="Invariant conditions (array), e.g. totalAssets() >= totalSupply()."
            value={form.conditions}
            onChange={(v) => set("conditions", v)}
          />
          <JsonField
            label="Rules"
            hint="Detector rule specs (array): event thresholds and price deltas."
            value={form.rules}
            onChange={(v) => set("rules", v)}
          />
          <JsonField
            label="Response"
            hint='Response plan (object): { "tier": "observe" | "recommend" | "act", "actions": [...] }.'
            value={form.response}
            onChange={(v) => set("response", v)}
          />
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2Icon className="size-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JsonField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea
        className="min-h-20 font-mono text-xs"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

// ---- Detail sheet ----

function WatchDetailSheet({ watch, onClose }: { watch: Watch | null; onClose: () => void }) {
  const [detections, setDetections] = React.useState<WatchDetection[]>([]);
  const [responses, setResponses] = React.useState<WatchResponse[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!watch) return;
    let alive = true;
    setLoading(true);
    Promise.all([api.watchDetections(watch.id), api.watchResponses(watch.id)])
      .then(([d, r]) => {
        if (!alive) return;
        setDetections(d.detections);
        setResponses(r.responses);
      })
      .catch((e) => alive && toast.error(`Load failed: ${(e as Error).message}`))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [watch]);

  const tier = watch ? responseTier(watch.response) : "observe";

  return (
    <Sheet open={watch !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full! max-w-none! gap-0 p-0 sm:w-[48rem]! sm:max-w-[48rem]!">
        {watch && (
          <>
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="pr-8">Watch #{watch.id}</SheetTitle>
              <SheetDescription className="font-mono break-all">
                {watch.chain} · {watch.address}
              </SheetDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge
                  variant={watch.state === "active" ? "secondary" : "outline"}
                  className={cn("text-xs", watch.state === "active" && "text-emerald-600")}
                >
                  {watch.state}
                </Badge>
                <Badge variant="outline" className="text-xs tabular-nums">
                  {watch.interval_ms}ms
                </Badge>
                {watch.preexec && (
                  <Badge variant="outline" className="text-xs">
                    pre-exec
                  </Badge>
                )}
                <Badge variant={tierVariant(tier)} className="text-xs font-mono">
                  {tier}
                </Badge>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-auto">
              <Tabs defaultValue="detections" className="flex min-h-0 flex-1 flex-col">
                <TabsList className="mx-5 mt-4">
                  <TabsTrigger value="detections">Detections ({detections.length})</TabsTrigger>
                  <TabsTrigger value="responses">Responses ({responses.length})</TabsTrigger>
                  <TabsTrigger value="definition">Definition</TabsTrigger>
                </TabsList>

                {tier === "act" && (
                  <div className="mx-5 mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>
                      This watch declares an <span className="font-mono">act</span> response. Act is fail-safe: with no
                      approval gate wired, matching detections are recorded as{" "}
                      <span className="font-mono">blocked</span> and no transaction is ever signed.
                    </span>
                  </div>
                )}

                <TabsContent value="detections" className="mt-3 px-5 pb-5">
                  {loading ? (
                    <div className="py-10 text-center">
                      <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : detections.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">No detections recorded.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[130px]">Time</TableHead>
                          <TableHead className="w-[90px]">Kind</TableHead>
                          <TableHead className="w-[90px]">Block</TableHead>
                          <TableHead>Observed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detections.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">
                              {fmtTime(d.detected_at)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs font-mono">
                                {d.kind}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs tabular-nums">{d.block || "-"}</TableCell>
                            <TableCell className="max-w-0">
                              <div className="truncate text-xs" title={d.observed}>
                                {d.invariant || d.condition_id ? (
                                  <span className="font-mono text-muted-foreground">
                                    {d.invariant || d.condition_id}:{" "}
                                  </span>
                                ) : null}
                                {d.observed || "-"}
                              </div>
                              {d.tx_hash && (
                                <code className="block truncate font-mono text-[11px] text-muted-foreground">
                                  {d.tx_hash}
                                </code>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="responses" className="mt-3 px-5 pb-5">
                  {loading ? (
                    <div className="py-10 text-center">
                      <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : responses.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">No responses recorded.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[130px]">Time</TableHead>
                          <TableHead className="w-[90px]">Tier</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead>Action / note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responses.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">
                              {fmtTime(r.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={tierVariant(r.tier)} className="text-xs font-mono">
                                {r.tier}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={r.status === "blocked" ? "outline" : "secondary"}
                                className="text-xs font-mono"
                              >
                                {r.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-0">
                              <div className="truncate text-xs" title={r.note}>
                                {r.action_id && (
                                  <span className="font-mono text-muted-foreground">{r.action_id}: </span>
                                )}
                                {r.note || "-"}
                              </div>
                              {r.action_tx_hash && (
                                <code className="block truncate font-mono text-[11px] text-muted-foreground">
                                  {r.action_tx_hash}
                                </code>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="definition" className="mt-3 space-y-4 px-5 pb-5">
                  <DefinitionBlock title="Conditions" value={watch.conditions} />
                  <DefinitionBlock title="Rules" value={watch.rules} />
                  <DefinitionBlock title="Response" value={watch.response} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DefinitionBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="pb-1 text-xs font-medium text-muted-foreground">{title}</div>
      <pre className="overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
        {pretty(value)}
      </pre>
    </div>
  );
}
