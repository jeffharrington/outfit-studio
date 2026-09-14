import Image from "next/image";
import { notFound } from "next/navigation";

import { getClothingItem } from "@/lib/actions/items";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { Badge } from "@/components/ui/badge";

export default async function ClothingItemPage(
  props: PageProps<"/closet/[id]">,
) {
  const { id } = await props.params;
  const item = await getClothingItem(id);

  if (!item) notFound();

  const imageUrl = getClothingImageUrl(item.display_image_path ?? item.image_path);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="relative aspect-square w-full max-w-md self-center overflow-hidden rounded-lg bg-muted">
        <Image
          src={imageUrl}
          alt={item.name ?? "Clothing item"}
          fill
          sizes="(max-width: 640px) 90vw, 448px"
          className="object-contain"
          priority
        />
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {item.name ?? "Untitled item"}
        </h1>
        <Badge variant="secondary">{item.category}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Primary color</dt>
          <dd>{item.primary_color}</dd>
        </div>
        {item.secondary_color && (
          <div>
            <dt className="text-muted-foreground">Secondary color</dt>
            <dd>{item.secondary_color}</dd>
          </div>
        )}
        {item.pattern && (
          <div>
            <dt className="text-muted-foreground">Pattern</dt>
            <dd>{item.pattern}</dd>
          </div>
        )}
        {item.subcategory && (
          <div>
            <dt className="text-muted-foreground">Subcategory</dt>
            <dd>{item.subcategory}</dd>
          </div>
        )}
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
