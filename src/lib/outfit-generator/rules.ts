import {
  CLOTHING_CATEGORIES,
  RATED_ATTRIBUTES,
  type ClothingItemInput,
  type GeneratedOutfit,
  type GenerationConstraints,
} from "./types";

function inRange(
  value: number,
  range: { min: number; max: number } | undefined,
): boolean {
  if (!range) return true;
  return value >= range.min && value <= range.max;
}

function matchesConstraints(
  item: ClothingItemInput,
  constraints: GenerationConstraints,
): boolean {
  return RATED_ATTRIBUTES.every((attr) => inRange(item[attr], constraints[attr]));
}

function distanceFromRange(
  value: number,
  range: { min: number; max: number } | undefined,
): number {
  if (!range) return 0;
  const mid = (range.min + range.max) / 2;
  return Math.abs(value - mid);
}

function outfitScore(
  items: ClothingItemInput[],
  constraints: GenerationConstraints,
): number {
  let total = 0;
  for (const item of items) {
    for (const attr of RATED_ATTRIBUTES) {
      total += distanceFromRange(item[attr], constraints[attr]);
    }
  }

  // Coherence penalty: outfits whose pieces disagree wildly on casualness
  // (e.g. a suit jacket with gym shorts) read as mismatched even if each
  // piece individually satisfies the constraints.
  const casualnessValues = items.map((item) => item.casualness);
  const spread = Math.max(...casualnessValues) - Math.min(...casualnessValues);

  return total + spread;
}

/**
 * Filters items per category by the given constraints (falling back to all
 * items in a category if none satisfy the constraints, so generation
 * degrades gracefully instead of returning nothing), then combinatorially
 * assembles one item per category and returns the best-scoring candidates.
 */
export function generateCandidates(
  items: ClothingItemInput[],
  constraints: GenerationConstraints,
  limit = 5,
): GeneratedOutfit[] {
  const byCategory = CLOTHING_CATEGORIES.map((category) => {
    const inCategory = items.filter((item) => item.category === category);
    const matching = inCategory.filter((item) =>
      matchesConstraints(item, constraints),
    );
    return matching.length > 0 ? matching : inCategory;
  });

  if (byCategory.some((group) => group.length === 0)) {
    return [];
  }

  const [tops, bottoms, shoes] = byCategory;
  const candidates: GeneratedOutfit[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const combo = [top, bottom, shoe];
        candidates.push({ items: combo, score: outfitScore(combo, constraints) });
      }
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates.slice(0, limit);
}
