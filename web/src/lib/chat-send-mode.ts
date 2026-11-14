"use client";

import * as React from "react";

import { getLocalStorageValue, setLocalStorageValue } from "@/lib/local-storage.client";

// Send/newline keybinding for the chat input box. Pure frontend preference: stored only in localStorage, not persisted to the DB, not synced with the account,
// so switching browsers requires resetting it. See issue #39 — 0.3.2 changed Ctrl+Enter-to-send into Enter-to-send,
// and here we bring the old keybinding back as an option.
export type ChatSendMode = "enter" | "ctrl-enter";

export const CHAT_SEND_MODE_KEY = "cyfind_chat_send_mode";
export const DEFAULT_CHAT_SEND_MODE: ChatSendMode = "enter";

export const CHAT_SEND_MODE_OPTIONS: { value: ChatSendMode; label: string }[] = [
  { value: "enter", label: "Enter to send, Shift+Enter for newline" },
  { value: "ctrl-enter", label: "Ctrl+Enter to send, Enter for newline" },
];

function parseMode(raw: string | null): ChatSendMode {
  return raw === "ctrl-enter" || raw === "enter" ? raw : DEFAULT_CHAT_SEND_MODE;
}

// Set of subscribers within the same tab. localStorage's storage event only fires in "other" tabs,
// so after changing it in settings this page relies on emit to notify the input box on the same page, otherwise a refresh would be needed.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Returns a string literal; Object.is compares by value, so useSyncExternalStore will not loop.
function getSnapshot(): ChatSendMode {
  return parseMode(getLocalStorageValue(CHAT_SEND_MODE_KEY));
}

// The server has no localStorage, so render the default first and let getSnapshot correct it after hydration.
function getServerSnapshot(): ChatSendMode {
  return DEFAULT_CHAT_SEND_MODE;
}

export function useChatSendMode(): ChatSendMode {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setChatSendMode(mode: ChatSendMode) {
  setLocalStorageValue(CHAT_SEND_MODE_KEY, mode);
  for (const listener of listeners) listener();
}

// shouldSubmitOnKey decides whether a keypress should send.
// isComposing / keyCode 229 means an IME (e.g. Chinese) is composing; it must be allowed through, otherwise pressing Enter to pick a word would send by mistake.
// enter mode only excludes Shift, keeping byte-for-byte parity with 0.3.2 behavior — users who do not change the setting feel no difference.
// ctrl-enter mode accepts both Ctrl and Cmd (macOS).
export function shouldSubmitOnKey(e: React.KeyboardEvent, mode: ChatSendMode): boolean {
  if (e.key !== "Enter") return false;
  if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return false;
  if (mode === "ctrl-enter") return e.ctrlKey || e.metaKey;
  return !e.shiftKey;
}
