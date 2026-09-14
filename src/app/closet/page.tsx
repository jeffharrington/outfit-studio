import { Upload } from "lucide-react";
import Link from "next/link";

import { listClothingItems } from "@/lib/actions/items";
import { CLOTHING_CATEGORIES, type ClothingCategory } from "@/lib/outfit-generator/types";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/item-card";
import { PaginationControls } from "@/components/pagination-controls";

const PAGE_SIZE = 12;

const FILTERS: { label: string; category: ClothingCategory | undefined }[] = [
  { label: "All", category: undefined },
  { label: "Tops", category: "top" },
  { label: "Bottoms", category: "bottom" },
  { label: "Shoes", category: "shoes" },
];

function isClothingCategory(value: string): value is ClothingCategory {
  return (CLOTHING_CATEGORIES as readonly string[]).includes(value);
}

function buildHref(category: ClothingCategory | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/closet?${query}` : "/closet";
}

export default async function ClosetPage(props: PageProps<"/closet">) {
  const searchParams = await props.searchParams;

  const categoryParam = searchParams.category;
  const category =
    typeof categoryParam === "string" && isClothingCategory(categoryParam)
      ? categoryParam
      : undefined;

  const pageParam = searchParams.page;
  const requestedPage =
    typeof pageParam === "string" && Number.isFinite(Number(pageParam))
      ? Math.max(1, Math.floor(Number(pageParam)))
      : 1;

  const { items, total } = await listClothingItems({
    category,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-normal tracking-normal">Closet</h1>
          <p className="text-base text-muted-foreground">
            {total} item{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="accent"
          size="lg"
          render={
            <Link href="/closet/upload">
              <Upload />
              Add item
            </Link>
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter.label}
              variant={filter.category === category ? "default" : "outline"}
              size="sm"
              render={<Link href={buildHref(filter.category, 1)}>{filter.label}</Link>}
            />
          ))}
        </div>
        {items.length > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(category, p)}
          />
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          {category
            ? `No ${category} items yet.`
            : "Nothing here yet — upload a photo to get started."}
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} backHref={buildHref(category, page)} />
              </li>
            ))}
          </ul>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(category, p)}
          />
        </>
      )}
    </main>
  );
}
