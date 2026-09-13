// No `import "server-only"` guard here: this module is also imported
// directly by scripts/seed-clothing-items.ts, a plain Node/tsx script run
// outside the Next.js server runtime, where that guard's default export
// throws unconditionally. It's only ever called from server actions, route
// handlers, and that script — never from a "use client" module — and
// ANTHROPIC_API_KEY is never NEXT_PUBLIC_-prefixed, so it can't leak into a
// client bundle even by accident.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

export const CLOTHING_CATEGORIES = ["top", "bottom", "shoes"] as const;

export const ClothingAttributesSchema = z.object({
  category: z.enum(CLOTHING_CATEGORIES),
  suggested_name: z.string(),
  primary_color: z.string(),
  secondary_color: z.string().nullable(),
  pattern: z.string().nullable(),
  casualness: z.number().int().min(1).max(10),
  trendiness: z.number().int().min(1).max(10),
  boldness: z.number().int().min(1).max(10),
  warmth: z.number().int().min(1).max(10),
});

export type ClothingAttributes = z.infer<typeof ClothingAttributesSchema>;

const ANALYSIS_PROMPT = `You are cataloging a single piece of clothing from a photo for a wardrobe app.

Identify the item's category (top, bottom, or shoes), a short human-friendly name, its primary and (if any) secondary color, and its visual pattern (e.g. "solid", "striped", "plaid", "floral", "graphic"; null if not applicable).

Also rate it on four 1-10 integer scales:
- casualness: 1 = extremely formal, 10 = extremely casual
- trendiness: 1 = classic/timeless, 10 = very trend-driven
- boldness: 1 = plain/understated, 10 = bold/eye-catching
- warmth: 1 = suited only to hot weather, 10 = suited only to cold weather

Base every rating on the item alone, not on how it might be styled.`;

export interface AnalyzeClothingImageResult {
  attributes: ClothingAttributes;
  raw: unknown;
}

export async function analyzeClothingImage(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
): Promise<AnalyzeClothingImageResult> {
  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: {
      format: zodOutputFormat(ClothingAttributesSchema),
      effort: "low",
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imageBuffer.toString("base64"),
            },
          },
          { type: "text", text: ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("Claude vision analysis returned no parsed output");
  }

  return { attributes: response.parsed_output, raw: response };
}
