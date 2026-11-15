import { cn } from "@/lib/utils";

/**
 * CYFIND brand glyph — an original node-graph mark (a central node linked to four
 * satellites) echoing the dual-graph / exploration model. Drawn with currentColor
 * so it themes cleanly (brand blue on light surfaces, white on the blue canvas).
 */
export function CyfindGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 12L5 6M12 12l7-6M12 12l-7 6M12 12l7 6"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
      <circle cx="5" cy="6" r="1.7" fill="currentColor" />
      <circle cx="19" cy="6" r="1.7" fill="currentColor" />
      <circle cx="5" cy="18" r="1.7" fill="currentColor" />
      <circle cx="19" cy="18" r="1.7" fill="currentColor" />
    </svg>
  );
}

/**
 * CYFIND mark in a filled brand badge — the standard sidebar / nav lockup.
 */
export function CyfindMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground", className)}
    >
      <CyfindGlyph className="size-[62%]" />
    </span>
  );
}
