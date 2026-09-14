import Link from "next/link";

import { generateOutfits } from "@/lib/actions/outfits";
import { OutfitGeneratorPanel } from "@/components/outfit-generator-panel";

const DEFAULT_VALUES = { casualness: 5, trendiness: 5, boldness: 5, warmth: 5 };

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default async function Home() {
  const results = await generateOutfits({
    constraints: {
      casualness: { min: DEFAULT_VALUES.casualness, max: DEFAULT_VALUES.casualness },
      trendiness: { min: DEFAULT_VALUES.trendiness, max: DEFAULT_VALUES.trendiness },
      boldness: { min: DEFAULT_VALUES.boldness, max: DEFAULT_VALUES.boldness },
      warmth: { min: DEFAULT_VALUES.warmth, max: DEFAULT_VALUES.warmth },
    },
    limit: 10,
  });

  if (results.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Generate an outfit</h1>
        <p className="text-muted-foreground">
          Add some tops, bottoms, and shoes to your closet to generate an outfit.
        </p>
        <Link href="/closet" className="text-sm font-medium text-accent hover:underline">
          Go to Closet
        </Link>
      </main>
    );
  }

  return (
    <OutfitGeneratorPanel
      initialOutfit={pickRandom(results).items}
      initialValues={DEFAULT_VALUES}
    />
  );
}
