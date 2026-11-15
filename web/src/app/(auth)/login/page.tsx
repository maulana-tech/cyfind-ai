"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AsciiLiquidLogin } from "@/components/ui/ascii-liquid-login";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
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
      .catch(() => setFatal(t("无法连接到后端服务")))
      .finally(() => setChecking(false));
  }, [router, t]);

  if (checking) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-muted-foreground">
        {t("正在检查登录状态…")}
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
      subtitle={t("登录到 CYFIND")}
      enterLabel={t("登录")}
      successTitle={t("已登录")}
      showImageUpload={false}
      onSubmit={async ({ password }) => {
        try {
          const { token } = await api.login("CYFIND", password);
          auth.setToken(token);
        } catch {
          throw new Error(t("用户名或密码错误"));
        }
      }}
      onDissolveEnd={() => window.location.replace("/function/tasks")}
    />
  );
}
