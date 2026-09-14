"use server";

import { revalidatePath } from "next/cache";

import type { ClothingItem } from "@/lib/actions/items";
import {
  generateOutfits as runGenerator,
  type ClothingItemInput,
  type GenerationConstraints,
} from "@/lib/outfit-generator";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

export interface GenerateOutfitsInput {
  occasion?: string;
  constraints?: GenerationConstraints;
  limit?: number;
  excludeItemIds?: string[];
}

export interface GeneratedOutfitResult {
  items: ClothingItem[];
  score: number;
}

/** Pure generation — reads the closet, does not write anything. */
export async function generateOutfits(
  input: GenerateOutfitsInput = {},
): Promise<GeneratedOutfitResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("is_archived", false);

  if (error) throw error;
  const items = data as ClothingItem[];

  const generatorInput: ClothingItemInput[] = items.map((item) => ({
    id: item.id,
    category: item.category,
    casualness: item.casualness,
    trendiness: item.trendiness,
    boldness: item.boldness,
    warmth: item.warmth,
  }));

  const candidates = runGenerator(generatorInput, {
    occasion: input.occasion,
    constraints: input.constraints,
    limit: input.limit,
    excludeItemIds: input.excludeItemIds,
  });

  const byId = new Map(items.map((item) => [item.id, item]));

  return candidates.map((candidate) => ({
    score: candidate.score,
    items: candidate.items.map((item) => byId.get(item.id)!),
  }));
}

export interface Outfit {
  id: string;
  created_at: string;
  name: string | null;
  notes: string | null;
  generation_constraints: unknown;
  items: ClothingItem[];
}

function toOutfit(row: {
  id: string;
  created_at: string;
  name: string | null;
  notes: string | null;
  generation_constraints: unknown;
  outfit_items: { clothing_items: ClothingItem }[];
}): Outfit {
  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    notes: row.notes,
    generation_constraints: row.generation_constraints,
    items: row.outfit_items.map((oi) => oi.clothing_items),
  };
}

const OUTFIT_SELECT = "*, outfit_items(clothing_items(*))";

export async function listOutfits(): Promise<Outfit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outfits")
    .select(OUTFIT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toOutfit);
}

export async function getOutfit(id: string): Promise<Outfit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outfits")
    .select(OUTFIT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toOutfit(data) : null;
}

export interface SaveOutfitInput {
  name?: string | null;
  notes?: string | null;
  constraints?: GenerationConstraints;
  itemIds: string[];
}

export async function saveOutfit(input: SaveOutfitInput): Promise<Outfit> {
  const admin = createAdminClient();

  const { data: outfit, error: outfitError } = await admin
    .from("outfits")
    .insert({
      name: input.name ?? null,
      notes: input.notes ?? null,
      generation_constraints: input.constraints
        ? (JSON.parse(JSON.stringify(input.constraints)) as Json)
        : null,
    })
    .select("*")
    .single();

  if (outfitError) throw outfitError;

  const { error: itemsError } = await admin.from("outfit_items").insert(
    input.itemIds.map((clothingItemId) => ({
      outfit_id: outfit.id,
      clothing_item_id: clothingItemId,
    })),
  );

  if (itemsError) throw itemsError;

  revalidatePath("/outfits");
  const saved = await getOutfit(outfit.id);
  if (!saved) throw new Error("Failed to load outfit after saving");
  return saved;
}

export async function renameOutfit(id: string, name: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("outfits").update({ name }).eq("id", id);
  if (error) throw error;
  revalidatePath("/outfits");
  revalidatePath(`/outfits/${id}`);
}

export async function deleteOutfit(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("outfits").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/outfits");
}
