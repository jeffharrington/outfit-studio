import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getClothingItem } from "@/lib/actions/items";
import { getClothingImageUrl } from "@/lib/supabase/storage";

import { ItemDetailsPanel } from "./item-details-panel";

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

        <ItemDetailsPanel item={item} />
      </div>
    </main>
  );
}
