import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex items-center gap-2">
      {isFirst ? (
        <Button variant="outline" size="icon-sm" disabled aria-label="First page">
          <ChevronsLeft />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="First page"
          render={<Link href={buildHref(1)} />}
        >
          <ChevronsLeft />
        </Button>
      )}
      {isFirst ? (
        <Button variant="outline" size="icon-sm" disabled aria-label="Previous page">
          <ChevronLeft />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          render={<Link href={buildHref(page - 1)} />}
        >
          <ChevronLeft />
        </Button>
      )}
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {isLast ? (
        <Button variant="outline" size="icon-sm" disabled aria-label="Next page">
          <ChevronRight />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          render={<Link href={buildHref(page + 1)} />}
        >
          <ChevronRight />
        </Button>
      )}
      {isLast ? (
        <Button variant="outline" size="icon-sm" disabled aria-label="Last page">
          <ChevronsRight />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Last page"
          render={<Link href={buildHref(totalPages)} />}
        >
          <ChevronsRight />
        </Button>
      )}
    </div>
  );
}
