/**
 * CYFIND UI i18n module (client-side).
 *
 * Usage in components:
 *   const t = useT();            // re-renders on language change
 *   <span>{t("仪表盘")}</span>   // keys are the original zh-CN strings
 *   t("共 {n} 个任务", { n })    // {param} interpolation
 *
 * Non-React helpers can import { t } from "@/i18n" directly (module-level
 * language, synced by LanguageProvider).
 */

export { DEFAULT_LANG, isLang, LANGS, type Lang } from "./config";
export { LanguageProvider, type TFunction, useI18n, useT } from "./context";
export { LanguageSwitcher } from "./language-switcher";
export { getModuleLang, setModuleLang, type TParams, t, translate } from "./translate";
