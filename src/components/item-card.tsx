import Image from "next/image";
import Link from "next/link";

import type { ClothingItem } from "@/lib/actions/items";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { Badge } from "@/components/ui/badge";

export function ItemCard({ item }: { item: ClothingItem }) {
  const imageUrl = getClothingImageUrl(item.display_image_path ?? item.image_path);

  return (
    <Link
      href={`/closet/${item.id}`}
      className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
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
        <Badge variant="secondary">{item.category}</Badge>
      </div>
    </Link>
  );
}
