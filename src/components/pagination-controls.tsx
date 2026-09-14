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
  return (
    <div className="flex items-center gap-2">
      {page > 1 ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildHref(page - 1)}>Previous</Link>}
        />
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildHref(page + 1)}>Next</Link>}
        />
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}
