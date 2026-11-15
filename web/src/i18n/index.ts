/**
 * Cyfind AI UI i18n module (client-side).
 *
 * Usage in components:
 *   const t = useT();        // re-renders on language change
 *   <span>{t(key)}</span>    // keys are the original source (zh-CN) strings
 *   t(key, { n })            // {param} interpolation
 *
 * Non-React helpers can import { t } from "@/i18n" directly (module-level
 * language, synced by LanguageProvider).
 */

export { DEFAULT_LANG, isLang, LANGS, type Lang } from "./config";
export { LanguageProvider, type TFunction, useI18n, useT } from "./context";
export { LanguageSwitcher } from "./language-switcher";
export { getModuleLang, setModuleLang, type TParams, t, translate } from "./translate";
