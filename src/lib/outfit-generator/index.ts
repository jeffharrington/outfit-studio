export * from "./types";
export { OCCASION_PRESETS, resolveConstraints } from "./occasions";
export { generateCandidates } from "./rules";

import { resolveConstraints } from "./occasions";
import { generateCandidates } from "./rules";
import type {
  ClothingItemInput,
  GeneratedOutfit,
  GenerationConstraints,
} from "./types";

export interface GenerateOutfitsOptions {
  occasion?: string;
  constraints?: GenerationConstraints;
  limit?: number;
}

export function generateOutfits(
  items: ClothingItemInput[],
  options: GenerateOutfitsOptions = {},
): GeneratedOutfit[] {
  const constraints = resolveConstraints(options.occasion, options.constraints ?? {});
  return generateCandidates(items, constraints, options.limit ?? 5);
}
