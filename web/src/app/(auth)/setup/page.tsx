"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { CyfindGlyph } from "@/components/cyfind-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function SetupPage() {
  const router = useRouter();
  const t = useT();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  // When the init status cannot be determined, we must not default to "not initialized" — that would show the init form to an
  // instance that has in fact already set a password, and filling it in would overwrite the original password. In that case, close the entry.
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    api
      .authStatus()
      .then(({ initialized }) => {
        if (initialized) router.replace("/login");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to connect to the backend service");
        setUnavailable(true);
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { token } = await api.initPassword(password);
      auth.setToken(token);
      router.replace("/function/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Initialization failed");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex h-dvh">
      {/* Left panel */}
      <div className="hidden flex-col items-center justify-center bg-primary p-12 text-center lg:flex lg:w-1/3">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-80 rounded-full border border-primary-foreground/10" />
          <div className="absolute size-60 rounded-full border border-primary-foreground/15" />
          <div className="absolute size-40 rounded-full border border-primary-foreground/20" />
          <CyfindGlyph className="relative size-40 text-primary-foreground" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <h2 className="font-medium text-2xl tracking-tight">
              {unavailable ? t("Unable to confirm the initialization status") : t("Initialize password")}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {unavailable
                ? t("The backend or database is temporarily unavailable. To avoid overwriting the existing password on this instance, the setup entry has been temporarily disabled — please restore the service and try again.")
                : t("First time using CYFIND? Set a sign-in password for your account (at least 8 characters).")}
            </p>
          </div>
          {unavailable ? (
            <div className="flex flex-col gap-4">
              {error && <p className="text-center text-destructive text-sm">{t(error)}</p>}
              <Button type="button" className="w-full" onClick={() => window.location.reload()}>
                {t("Retry")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("New password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("At least 8 characters")}
                  autoFocus
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">{t("Confirm password")}</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("Re-enter your password")}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-destructive text-sm">{t(error)}</p>}
              <Button type="submit" className="w-full" disabled={loading || !password || !confirm}>
                {loading ? t("Saving…") : t("Set password and sign in")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
