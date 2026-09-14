// No `import "server-only"` guard here, for the same reason as
// src/lib/anthropic.ts: this module is also called directly from
// scripts/seed-clothing-items.ts, a plain Node/tsx script outside the
// Next.js server runtime, where that guard's default export throws
// unconditionally. OPENAI_API_KEY is never NEXT_PUBLIC_-prefixed, so it
// can't leak into a client bundle even by accident.
import OpenAI, { toFile } from "openai";

import { IDEALIZATION_PROMPT } from "@/lib/image-generation/prompt";

const client = new OpenAI();

/**
 * Turns a clothing photo into an idealized, transparent-background PNG
 * using the shared style spec in ./prompt.ts. Returns the PNG bytes.
 */
export async function generateIdealizedClothingImage(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
): Promise<Buffer> {
  const response = await client.images.edit({
    image: await toFile(imageBuffer, `source.${mimeType.split("/")[1]}`, {
      type: mimeType,
    }),
    prompt: IDEALIZATION_PROMPT,
    model: "gpt-image-2.5-sunburst",
    background: "transparent",
    output_format: "png",
    quality: "medium",
    size: "1024x1024",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image edit returned no image data");
  }

  return Buffer.from(b64, "base64");
}
