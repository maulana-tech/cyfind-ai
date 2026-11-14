/**
 * Language configuration for the CYFIND UI.
 *
 * The frontend is a static export (no server runtime), so language is a
 * client-side preference stored in localStorage. English is the default.
 * Only English and Bahasa Indonesia are selectable — the source (zh-CN)
 * strings are used solely as translation keys and are never shown to users.
 */

export const LANGS = ["en", "id"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

const STORAGE_KEY = "cyfind.lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Read the stored language. Client-only; returns the default when absent/invalid. */
export function readStoredLang(): Lang {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isLang(raw) ? raw : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function storeLang(lang: Lang): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, lang);
  } catch {
    // storage unavailable (private mode) — language just won't persist
  }
}

/** Value for <html lang>: the bare language tag. */
export function htmlLangTag(lang: Lang): string {
  return lang;
}
