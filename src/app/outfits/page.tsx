import Link from "next/link";

import { listOutfits } from "@/lib/actions/outfits";

export default async function OutfitsPage() {
  const outfits = await listOutfits();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Outfits</h1>
        <p className="text-muted-foreground">
          {outfits.length} outfit{outfits.length === 1 ? "" : "s"}
        </p>
      </div>

      {outfits.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing saved yet — generate an outfit and save the ones you like.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {outfits.map((outfit) => (
            <li key={outfit.id}>
              <Link
                href={`/outfits/${outfit.id}`}
                className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-accent"
              >
                <span className="font-medium">
                  {outfit.name ?? "Untitled outfit"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {outfit.items.length} piece{outfit.items.length === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
