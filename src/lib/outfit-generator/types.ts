export const CLOTHING_CATEGORIES = ["top", "bottom", "shoes"] as const;
export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

export const RATED_ATTRIBUTES = [
  "casualness",
  "trendiness",
  "boldness",
  "warmth",
] as const;
export type RatedAttribute = (typeof RATED_ATTRIBUTES)[number];

export interface ClothingItemInput {
  id: string;
  category: ClothingCategory;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
}

export interface AttributeRange {
  min: number;
  max: number;
}

export type GenerationConstraints = Partial<Record<RatedAttribute, AttributeRange>>;

export interface GeneratedOutfit {
  /** One item per required category, in `CLOTHING_CATEGORIES` order. */
  items: ClothingItemInput[];
  /** Lower is better — distance from the requested constraints. */
  score: number;
}
