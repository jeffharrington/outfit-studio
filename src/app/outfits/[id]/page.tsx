import { notFound } from "next/navigation";

import { getOutfit } from "@/lib/actions/outfits";
import { Badge } from "@/components/ui/badge";

export default async function OutfitPage(props: PageProps<"/outfits/[id]">) {
  const { id } = await props.params;
  const outfit = await getOutfit(id);

  if (!outfit) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        {outfit.name ?? "Untitled outfit"}
      </h1>
      <ul className="grid gap-3 sm:grid-cols-3">
        {outfit.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span>{item.name ?? "Untitled item"}</span>
            <Badge variant="accent">{item.category}</Badge>
          </li>
        ))}
      </ul>
    </main>
  );
}
