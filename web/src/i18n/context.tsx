"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { DEFAULT_LANG, htmlLangTag, type Lang, readStoredLang, storeLang } from "./config";
import { setModuleLang, type TParams, translate } from "./translate";

export type TFunction = (key: string, params?: TParams) => string;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

/**
 * Default context: English, so components rendered outside the provider
 * (unlikely, but possible in isolation/storybook-style setups) still resolve.
 */
const I18nContext = createContext<I18nValue>({
  lang: DEFAULT_LANG,
  setLang: () => undefined,
  t: (key, params) => translate(DEFAULT_LANG, key, params),
});

/**
 * Client-side language provider.
 *
 * Hydration note: the static export prerenders English, so the initial client
 * render MUST also be English. The stored preference is applied in a mount
 * effect — a brief English flash on reload for non-English users is expected
 * and avoids React hydration mismatches.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Apply stored language after hydration.
  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== DEFAULT_LANG) setLangState(stored);
  }, []);

  // Keep <html lang> and the module-level t() in sync.
  useEffect(() => {
    document.documentElement.lang = htmlLangTag(lang);
    setModuleLang(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    storeLang(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key, params) => translate(lang, key, params) }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** Hook form of the translate function; re-renders the component on language change. */
export function useT(): TFunction {
  return useContext(I18nContext).t;
}
