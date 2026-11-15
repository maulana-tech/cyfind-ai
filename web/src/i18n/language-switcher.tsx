"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LANGS, type Lang } from "./config";
import { useI18n, useT } from "./context";

/** Short badge label per language: EN / ID */
const LANG_BADGE: Record<Lang, string> = {
  en: "EN",
  id: "ID",
};

/**
 * Cycles the UI language: en → id → en.
 * Mirrors ThemeSwitcher's compact icon-button pattern in the navbar.
 * Always renders a button (English fallback) so it's never "not visible".
 */
export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const t = useT();

  const cycleLanguage = () => {
    const currentIndex = LANGS.indexOf(lang);
    setLang(LANGS[(currentIndex + 1) % LANGS.length]);
  };

  // Fallback: jika alasan apa pun useI18n/useT gagal, tetap tampilkan button EN
  const safeLang = lang ?? "en";
  const safeBadge = LANG_BADGE[safeLang] ?? "EN";

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={cycleLanguage}
      aria-label={t("Switch language")}
      title={t("Switch language")}
      className="gap-1.5 px-2"
    >
      <Languages className="size-4" />
      <span className="text-xs font-medium tabular-nums">{safeBadge}</span>
    </Button>
  );
}
