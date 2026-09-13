import Link from "next/link";

import { listClothingItems } from "@/lib/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ClosetPage() {
  const items = await listClothingItems();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Closet</h1>
          <p className="text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link href="/closet/upload">Upload a piece</Link>} />
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing here yet — upload a photo to get started.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/closet/${item.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <span>{item.name ?? "Untitled item"}</span>
                <Badge variant="secondary">{item.category}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
