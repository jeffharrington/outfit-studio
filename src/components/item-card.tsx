import Image from "next/image";
import Link from "next/link";

import type { ClothingItem } from "@/lib/actions/items";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { capitalize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ItemCard({
  item,
  backHref,
}: {
  item: ClothingItem;
  /** Current closet list URL (filter/page), preserved so the detail page can link back to it. */
  backHref?: string;
}) {
  const imageUrl = getClothingImageUrl(item.display_image_path ?? item.image_path);
  const href = backHref
    ? `/closet/${item.id}?back=${encodeURIComponent(backHref)}`
    : `/closet/${item.id}`;

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:border-accent"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={imageUrl}
          alt={item.name ?? "Clothing item"}
          fill
          sizes="(max-width: 640px) 45vw, 280px"
          className="object-contain"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">
          {item.name ?? "Untitled item"}
        </span>
        <Badge variant="accent">{capitalize(item.category)}</Badge>
      </div>
    </Link>
  );
}
