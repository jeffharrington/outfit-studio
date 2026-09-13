import type { GenerationConstraints } from "./types";

/**
 * Named presets map to ranges over the four rated attributes rather than
 * being stored on clothing_items — "occasion" is a generator-side concept
 * that can change shape without touching the schema.
 */
export const OCCASION_PRESETS: Record<string, GenerationConstraints> = {
  business: { casualness: { min: 1, max: 3 }, boldness: { min: 1, max: 5 } },
  work_casual: { casualness: { min: 3, max: 6 } },
  weekend: { casualness: { min: 6, max: 9 } },
  night_out: { boldness: { min: 6, max: 10 }, trendiness: { min: 5, max: 10 } },
  workout: { casualness: { min: 7, max: 10 }, warmth: { min: 1, max: 5 } },
};

export function resolveConstraints(
  occasion: string | undefined,
  overrides: GenerationConstraints,
): GenerationConstraints {
  const base = occasion ? (OCCASION_PRESETS[occasion] ?? {}) : {};
  return { ...base, ...overrides };
}
