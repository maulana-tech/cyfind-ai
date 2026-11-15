"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AsciiLiquidLogin } from "@/components/ui/ascii-liquid-login";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [fatal, setFatal] = useState("");

  useEffect(() => {
    // Already logged in: go straight to the main UI (static export has no middleware for this).
    const token = auth.getToken();
    if (token) {
      auth.setToken(token);
      window.location.replace("/function/tasks");
      return;
    }
    api
      .authStatus()
      .then(({ initialized }) => {
        if (!initialized) router.replace("/setup");
      })
      .catch(() => setFatal("Unable to connect to the backend service"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (fatal) {
    return (
      <div role="alert" className="flex min-h-dvh items-center justify-center px-6 text-center text-destructive">
        {fatal}
      </div>
    );
  }

  return (
    <AsciiLiquidLogin
      passwordOnly
      title={"Autonomous\nSecurity, Alive"}
      subtitle="Sign in to Cyfind AI"
      enterLabel="Sign in"
      successTitle="You’re in."
      showImageUpload={false}
      onSubmit={async ({ password }) => {
        try {
          const { token } = await api.login("CYFIND", password);
          auth.setToken(token);
        } catch {
          throw new Error("Incorrect password");
        }
      }}
      onDissolveEnd={() => window.location.replace("/function/tasks")}
    />
  );
}
