import Image from "next/image";
import Link from "next/link";

import type { Outfit } from "@/lib/actions/outfits";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { formatSavedDate } from "@/lib/utils";

export function OutfitCard({
  outfit,
  backHref,
}: {
  outfit: Outfit;
  /** Current saved-outfits list URL (page), preserved so the detail page can link back to it. */
  backHref?: string;
}) {
  const top = outfit.items.find((item) => item.category === "top");
  const bottom = outfit.items.find((item) => item.category === "bottom");
  const shoes = outfit.items.find((item) => item.category === "shoes");

  const href = backHref
    ? `/outfits/${outfit.id}?back=${encodeURIComponent(backHref)}`
    : `/outfits/${outfit.id}`;

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:border-accent"
    >
      <div className="flex flex-col items-center">
        <div className="flex w-full justify-center">
          {top && (
            <div className="relative z-10 aspect-square w-3/5 -mr-10 overflow-hidden">
              <Image
                src={getClothingImageUrl(top.display_image_path ?? top.image_path)}
                alt={top.name ?? "Top"}
                fill
                sizes="(max-width: 640px) 45vw, 280px"
                className="object-contain"
              />
            </div>
          )}
          {bottom && (
            <div className="relative aspect-square w-3/5 overflow-hidden">
              <Image
                src={getClothingImageUrl(bottom.display_image_path ?? bottom.image_path)}
                alt={bottom.name ?? "Bottom"}
                fill
                sizes="(max-width: 640px) 45vw, 280px"
                className="object-contain"
              />
            </div>
          )}
        </div>
        {shoes && (
          <div className="relative -mt-6 aspect-square w-1/3 overflow-hidden">
            <Image
              src={getClothingImageUrl(shoes.display_image_path ?? shoes.image_path)}
              alt={shoes.name ?? "Shoes"}
              fill
              sizes="(max-width: 640px) 25vw, 140px"
              className="object-contain"
            />
          </div>
        )}
      </div>
      <span className="truncate text-sm font-medium">
        Saved {formatSavedDate(outfit.created_at)}
      </span>
    </Link>
  );
}
