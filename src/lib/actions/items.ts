"use server";

import { revalidatePath } from "next/cache";

import { analyzeClothingImage } from "@/lib/anthropic";
import type { ClothingCategory } from "@/lib/outfit-generator/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json, TablesUpdate } from "@/types/supabase";

/** Round-trips a value through JSON so it satisfies Supabase's `Json` column type. */
function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export interface ClothingItem {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  category: ClothingCategory;
  subcategory: string | null;
  primary_color: string;
  secondary_color: string | null;
  pattern: string | null;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
  image_path: string;
  display_image_path: string | null;
  source: string;
  is_archived: boolean;
}

export interface ClothingItemFilters {
  category?: ClothingCategory;
  includeArchived?: boolean;
  /** 1-based page number. Defaults to 1. */
  page?: number;
  /** Defaults to 10. */
  pageSize?: number;
}

export interface ListClothingItemsResult {
  items: ClothingItem[];
  total: number;
}

export async function listClothingItems(
  filters: ClothingItemFilters = {},
): Promise<ListClothingItemsResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let query = supabase
    .from("clothing_items")
    .select("*", { count: "exact" })
    .order("category", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (!filters.includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data as ClothingItem[], total: count ?? 0 };
}

export async function getClothingItem(
  id: string,
): Promise<ClothingItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as ClothingItem | null;
}

export interface AnalyzedDraft {
  category: ClothingCategory;
  suggestedName: string;
  primaryColor: string;
  secondaryColor: string | null;
  pattern: string | null;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
  rawResponse: unknown;
}

/** Runs Claude vision analysis only — does not write to the database. */
export async function analyzeClothingPhoto(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
): Promise<AnalyzedDraft> {
  const { attributes, raw } = await analyzeClothingImage(imageBuffer, mimeType);
  return {
    category: attributes.category,
    suggestedName: attributes.suggested_name,
    primaryColor: attributes.primary_color,
    secondaryColor: attributes.secondary_color,
    pattern: attributes.pattern,
    casualness: attributes.casualness,
    trendiness: attributes.trendiness,
    boldness: attributes.boldness,
    warmth: attributes.warmth,
    rawResponse: raw,
  };
}

export interface CreateClothingItemInput {
  name: string | null;
  category: ClothingCategory;
  subcategory?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  pattern?: string | null;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
  /** Storage object path, already uploaded to the clothing-photos bucket. */
  imagePath: string;
  /** Idealized, transparent-background version, already uploaded. */
  displayImagePath?: string | null;
  source?: string;
  aiRawResponse?: unknown;
}

export async function createClothingItem(
  input: CreateClothingItemInput,
): Promise<ClothingItem> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("clothing_items")
    .insert({
      name: input.name,
      category: input.category,
      subcategory: input.subcategory ?? null,
      primary_color: input.primaryColor,
      secondary_color: input.secondaryColor ?? null,
      pattern: input.pattern ?? null,
      casualness: input.casualness,
      trendiness: input.trendiness,
      boldness: input.boldness,
      warmth: input.warmth,
      image_path: input.imagePath,
      display_image_path: input.displayImagePath ?? null,
      source: input.source ?? "upload",
      ai_raw_response:
        input.aiRawResponse != null ? toJson(input.aiRawResponse) : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  revalidatePath("/closet");
  return data as ClothingItem;
}

export type UpdateClothingItemInput = Partial<
  Omit<CreateClothingItemInput, "imagePath" | "aiRawResponse" | "source">
>;

export async function updateClothingItem(
  id: string,
  input: UpdateClothingItemInput,
): Promise<ClothingItem> {
  const admin = createAdminClient();
  const update: TablesUpdate<"clothing_items"> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.category !== undefined) update.category = input.category;
  if (input.subcategory !== undefined) update.subcategory = input.subcategory;
  if (input.primaryColor !== undefined) update.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined)
    update.secondary_color = input.secondaryColor;
  if (input.pattern !== undefined) update.pattern = input.pattern;
  if (input.casualness !== undefined) update.casualness = input.casualness;
  if (input.trendiness !== undefined) update.trendiness = input.trendiness;
  if (input.boldness !== undefined) update.boldness = input.boldness;
  if (input.warmth !== undefined) update.warmth = input.warmth;

  const { data, error } = await admin
    .from("clothing_items")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  revalidatePath("/closet");
  revalidatePath(`/closet/${id}`);
  return data as ClothingItem;
}

/** Soft-delete: hides the item from browsing without breaking outfits that reference it. */
export async function deleteClothingItem(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("clothing_items")
    .update({ is_archived: true })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/closet");
}
