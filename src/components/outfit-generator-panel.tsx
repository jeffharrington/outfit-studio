"use client";

import { Bookmark, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { ClothingItem } from "@/lib/actions/items";
import { generateOutfits, saveOutfit } from "@/lib/actions/outfits";
import type { GenerationConstraints } from "@/lib/outfit-generator";
import { getClothingImageUrl } from "@/lib/supabase/storage";
import { capitalize, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const ATTRIBUTES = [
  { key: "casualness", label: "Casualness" },
  { key: "trendiness", label: "Trendiness" },
  { key: "boldness", label: "Boldness" },
  { key: "warmth", label: "Warmth" },
] as const;

type AttributeKey = (typeof ATTRIBUTES)[number]["key"];
type AttributeValues = Record<AttributeKey, number>;

const RESET_VALUES: AttributeValues = {
  casualness: 5,
  trendiness: 5,
  boldness: 5,
  warmth: 5,
};

const CATEGORY_ORDER = ["top", "bottom", "shoes"] as const;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function sortByCategory(items: ClothingItem[]): ClothingItem[] {
  return [...items].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
}

function toConstraints(values: AttributeValues): GenerationConstraints {
  return {
    casualness: { min: values.casualness, max: values.casualness },
    trendiness: { min: values.trendiness, max: values.trendiness },
    boldness: { min: values.boldness, max: values.boldness },
    warmth: { min: values.warmth, max: values.warmth },
  };
}

export function OutfitGeneratorPanel({
  initialOutfit,
  initialValues,
}: {
  initialOutfit: ClothingItem[];
  initialValues: AttributeValues;
}) {
  const [values, setValues] = useState(initialValues);
  const [outfit, setOutfit] = useState(() => sortByCategory(initialOutfit));
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);
  const [isGenerating, startGenerate] = useTransition();
  const [isSaving, startSave] = useTransition();

  const busy = isGenerating || isSaving;

  function handleGenerate() {
    startGenerate(async () => {
      try {
        const results = await generateOutfits({
          constraints: toConstraints(values),
          limit: 10,
          excludeItemIds: outfit.map((item) => item.id),
        });
        if (results.length === 0) {
          toast.error("No outfit could be generated with these settings.");
          return;
        }
        setOutfit(sortByCategory(pickRandom(results).items));
        setSavedOutfitId(null);
      } catch {
        toast.error("Something went wrong generating an outfit.");
      }
    });
  }

  function handleResetSliders() {
    setValues(RESET_VALUES);
  }

  function handleSave() {
    startSave(async () => {
      try {
        const saved = await saveOutfit({
          constraints: toConstraints(values),
          itemIds: outfit.map((item) => item.id),
        });
        setSavedOutfitId(saved.id);
        toast.success("Outfit saved");
      } catch {
        toast.error("Something went wrong saving this outfit.");
      }
    });
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-6 py-12 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div>
          <h2 className="font-heading text-2xl font-normal tracking-normal">
            Tune the fit
          </h2>
          <p className="text-base text-muted-foreground">
            Adjust these to steer what gets generated.
          </p>
        </div>
        {ATTRIBUTES.map((attribute) => (
          <div key={attribute.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <label>{attribute.label}</label>
              <span className="text-muted-foreground">{values[attribute.key]}</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[values[attribute.key]]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                setValues((prev) => ({ ...prev, [attribute.key]: value }));
              }}
            />
          </div>
        ))}
        <Button
          variant="accent"
          onClick={handleGenerate}
          disabled={busy}
          className="mt-4 h-auto py-3"
        >
          <RefreshCw />
          {isGenerating ? "Generating…" : "Generate new outfit"}
        </Button>
        <button
          type="button"
          onClick={handleResetSliders}
          disabled={busy}
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset sliders
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-lg border p-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-normal tracking-normal">
            Your outfit
          </h1>
          <p className="text-base text-muted-foreground">Generated from your closet.</p>
        </div>
        <div className="flex w-full max-w-xs flex-col items-center">
          {outfit.map((item) => (
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
        <Button variant="outline" onClick={handleSave} disabled={busy || savedOutfitId !== null}>
          <Bookmark />
          {savedOutfitId ? "Saved" : isSaving ? "Saving…" : "Save outfit"}
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-6">
        <h2 className="font-heading text-2xl font-normal tracking-normal">
          In this outfit
        </h2>
        {outfit.map((item) => (
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
      </div>
    </main>
  );
}
