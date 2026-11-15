"use client";

import * as React from "react";

import Link from "next/link";

import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Dual-Graph", href: "#dual-graph" },
  { label: "How it works", href: "#flow" },
  { label: "Safety", href: "#safety" },
];

export function LandingNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-[var(--cf-border)] border-b bg-[color-mix(in_oklch,var(--cf-bg),transparent_18%)] backdrop-blur-md"
          : "border-transparent border-b"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6">
        {/* brand */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-medium text-[16px] text-[var(--cf-text)] tracking-[-0.012em]">Cyfind AI</span>
        </Link>

        {/* centered floating pill */}
        <div className="-translate-x-1/2 absolute left-1/2 hidden md:block">
          <div className="flex items-center gap-0.5 rounded-full border border-[var(--cf-border)] bg-[color-mix(in_oklch,var(--cf-card),transparent_10%)] p-1 shadow-[var(--cf-shadow)] backdrop-blur-md">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] text-[var(--cf-muted)] transition-colors hover:bg-[var(--cf-surface)] hover:text-[var(--cf-text)]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://github.com/maulana-tech/cyfind-ai"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-[var(--cf-muted)] transition-colors hover:text-[var(--cf-text)]"
          >
            GitHub
          </a>
          <Link
            href="/function/tasks"
            className="rounded-full bg-[var(--cf-accent)] px-4 py-[7px] font-medium text-[13px] text-[var(--cf-on-accent)] shadow-[var(--cf-shadow-sm)] transition-colors hover:bg-[var(--cf-accent-hover)]"
          >
            Open app
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-[8px] text-[var(--cf-text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div className="mx-4 rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-card)] p-3 shadow-[var(--cf-shadow-lg)] md:hidden">
          <div className="flex flex-col gap-0.5">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-3 py-2.5 text-[14px] text-[var(--cf-muted)] hover:bg-[var(--cf-surface)] hover:text-[var(--cf-text)]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/function/tasks"
              className="mt-2 rounded-full bg-[var(--cf-accent)] px-4 py-2.5 text-center font-medium text-[13px] text-[var(--cf-on-accent)]"
            >
              Open app
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.6" fill="var(--cf-accent)" />
      <circle cx="5" cy="6" r="1.6" fill="var(--cf-accent)" />
      <circle cx="19" cy="6" r="1.6" fill="var(--cf-accent)" />
      <circle cx="5" cy="18" r="1.6" fill="var(--cf-accent)" />
      <circle cx="19" cy="18" r="1.6" fill="var(--cf-accent)" />
      <path
        d="M12 12L5 6M12 12l7-6M12 12l-7 6M12 12l7 6"
        stroke="var(--cf-accent)"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
