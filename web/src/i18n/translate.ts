/**
 * Translation core.
 *
 * Keys are the original zh-CN UI strings (see messages/<lang>/*.ts), used only
 * as lookup keys and never shown to users. Lookup:
 *   en   → dictionary, else the key itself
 *   id   → id dictionary, else en dictionary, else the key itself
 *
 * `{name}` placeholders are replaced from params:
 *   t("共 {n} 个任务", { n: 3 }) → "3 tasks"
 */

import type { Lang } from "./config";
import { messages } from "./messages";

export type TParams = Record<string, string | number | undefined>;

export function translate(lang: Lang, key: string, params?: TParams): string {
  // Homograph disambiguation: a key may carry a "::<ctx>" suffix (e.g.
  // "关闭::state" = the toggle state vs plain "关闭" = a dialog Close button).
  // en/id try the suffixed entry first, then the base entry. Only "::<ascii
  // word>" counts — plain "@" (emails) or ":" (times) in text are left alone.
  const ctx = key.indexOf("::");
  const base = ctx >= 0 ? key.slice(0, ctx) : key;
  const dict = messages[lang];
  let out: string = dict[key] ?? messages.en[key] ?? dict[base] ?? messages.en[base] ?? base;
  if (params) {
    out = out.replace(/\{(\w+)\}/g, (match, name: string) =>
      Object.hasOwn(params, name) ? String(params[name]) : match,
    );
  }
  return out;
}

/**
 * Module-level current language so non-React helpers (formatters, sort
 * labels, …) can translate without a hook. Kept in sync by LanguageProvider.
 * Components that need to re-render on language change must use useT()/useI18n().
 */
let currentLang: Lang = "en";

export function setModuleLang(lang: Lang): void {
  currentLang = lang;
}

export function getModuleLang(): Lang {
  return currentLang;
}

export function t(key: string, params?: TParams): string {
  return translate(currentLang, key, params);
}
