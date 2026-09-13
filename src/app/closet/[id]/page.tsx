import { notFound } from "next/navigation";

import { getClothingItem } from "@/lib/actions/items";
import { Badge } from "@/components/ui/badge";

export default async function ClothingItemPage(
  props: PageProps<"/closet/[id]">,
) {
  const { id } = await props.params;
  const item = await getClothingItem(id);

  if (!item) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {item.name ?? "Untitled item"}
        </h1>
        <Badge variant="secondary">{item.category}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Casualness</dt>
          <dd>{item.casualness}/10</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Trendiness</dt>
          <dd>{item.trendiness}/10</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Boldness</dt>
          <dd>{item.boldness}/10</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Warmth</dt>
          <dd>{item.warmth}/10</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        Editing attributes is coming in a follow-up feature pass.
      </p>
    </main>
  );
}
