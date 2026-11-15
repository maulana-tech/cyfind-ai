import type { ReactNode } from "react";

import { CyfindGlyph } from "@/components/cyfind-logo";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/**
 * Branded empty state: the CYFIND glyph in a soft brand-blue tile, over the
 * shadcn Empty primitive. Use instead of plain muted "no data" text so empty
 * screens carry the product identity.
 */
export function BrandEmpty({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn("border border-dashed", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12 rounded-xl bg-primary/10 text-primary">
          <CyfindGlyph className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description == null ? null : <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action == null ? null : <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
