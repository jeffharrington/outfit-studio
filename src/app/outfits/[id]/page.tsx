import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOutfit } from "@/lib/actions/outfits";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { capitalize, cn, formatSavedDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { DeleteOutfitButton } from "./delete-outfit-button";

const CATEGORY_ORDER = ["top", "bottom", "shoes"] as const;

export default async function OutfitPage(props: PageProps<"/outfits/[id]">) {
  const { id } = await props.params;
  const { back } = await props.searchParams;
  const outfit = await getOutfit(id);

  if (!outfit) notFound();

  const backHref = typeof back === "string" ? back : "/outfits";
  const items = [...outfit.items].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Saved Outfits
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col items-center gap-6 rounded-lg border p-6">
          <h1 className="font-heading text-3xl font-normal tracking-normal">
            Saved {formatSavedDate(outfit.created_at)}
          </h1>
          <div className="flex w-full max-w-xs flex-col items-center">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative aspect-square overflow-hidden",
                  item.category === "top" && "w-full",
                  item.category === "bottom" && "mt-4 w-[115%] -mx-[7.5%]",
                  item.category === "shoes" && "-mt-10 w-1/2",
                )}
              >
                <Image
                  src={getClothingImageUrl(item.display_image_path ?? item.image_path)}
                  alt={item.name ?? "Clothing item"}
                  fill
                  sizes="320px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-6">
          <h2 className="font-heading text-2xl font-normal tracking-normal">
            In this outfit
          </h2>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-2">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={getClothingImageUrl(item.display_image_path ?? item.image_path)}
                  alt={item.name ?? "Clothing item"}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {item.name ?? "Untitled item"}
                </span>
                <Badge variant="accent">{capitalize(item.category)}</Badge>
              </div>
            </div>
          ))}

          <div className="border-t pt-6">
            <DeleteOutfitButton id={outfit.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
