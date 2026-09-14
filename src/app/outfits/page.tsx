import { listOutfits } from "@/lib/actions/outfits";
import { OutfitCard } from "@/components/outfit-card";
import { PaginationControls } from "@/components/pagination-controls";

const PAGE_SIZE = 8;

function buildHref(page: number): string {
  return page > 1 ? `/outfits?page=${page}` : "/outfits";
}

export default async function OutfitsPage(props: PageProps<"/outfits">) {
  const searchParams = await props.searchParams;

  const pageParam = searchParams.page;
  const requestedPage =
    typeof pageParam === "string" && Number.isFinite(Number(pageParam))
      ? Math.max(1, Math.floor(Number(pageParam)))
      : 1;

  const { outfits, total } = await listOutfits({
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="font-heading text-2xl font-normal tracking-normal">
          Saved Outfits
        </h1>
        <p className="text-base text-muted-foreground">
          {total} outfit{total === 1 ? "" : "s"}
        </p>
      </div>

      {outfits.length > 0 && (
        <div className="flex justify-end">
          <PaginationControls page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      )}

      {outfits.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing saved yet — generate an outfit and save the ones you like.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4">
            {outfits.map((outfit) => (
              <li key={outfit.id}>
                <OutfitCard outfit={outfit} backHref={buildHref(page)} />
              </li>
            ))}
          </ul>

          <PaginationControls page={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </main>
  );
}
