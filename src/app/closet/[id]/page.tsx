import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getClothingItem } from "@/lib/actions/items";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { capitalize } from "@/lib/utils";

import { DeleteItemButton } from "./delete-item-button";

export default async function ClothingItemPage(
  props: PageProps<"/closet/[id]">,
) {
  const { id } = await props.params;
  const { back } = await props.searchParams;
  const item = await getClothingItem(id);

  if (!item) notFound();

  const imageUrl = getClothingImageUrl(item.display_image_path ?? item.image_path);
  const backHref = typeof back === "string" ? back : "/closet";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Closet
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={imageUrl}
              alt={item.name ?? "Clothing item"}
              fill
              sizes="(max-width: 768px) 90vw, 576px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-lg border p-6">
          <h1 className="font-heading text-2xl font-normal tracking-normal">
            {item.name ?? "Untitled item"}
          </h1>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{capitalize(item.category)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pattern</dt>
              <dd>{item.pattern ? capitalize(item.pattern) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Primary color</dt>
              <dd>{capitalize(item.primary_color)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Secondary color</dt>
              <dd>{item.secondary_color ? capitalize(item.secondary_color) : "—"}</dd>
            </div>
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

          <div className="border-t pt-6">
            <DeleteItemButton id={item.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
