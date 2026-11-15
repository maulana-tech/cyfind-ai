"use client";

import * as React from "react";

/**
 * Reveal wraps content and plays a one-shot entrance animation the first time
 * it scrolls into view. Pure IntersectionObserver — no animation library.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "fade";
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = variant === "fade" ? "cf-reveal cf-reveal-fade" : "cf-reveal";
  const cls = [base, shown ? "cf-in" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag ref={ref} className={cls} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
