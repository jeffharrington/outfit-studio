import "server-only";

import convertHeic from "heic-convert";

import { analyzeClothingPhoto, createClothingItem, type ClothingItem } from "@/lib/actions/items";
import { generateIdealizedClothingImage } from "@/lib/image-generation/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/supabase/storage";

const UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type UploadMimeType = (typeof UPLOAD_MIME_TYPES)[number];

function isUploadMimeType(value: string): value is UploadMimeType {
  return (UPLOAD_MIME_TYPES as readonly string[]).includes(value);
}

const HEIC_MIME_TYPES = ["image/heic", "image/heif"];

/**
 * iPhones commonly send HEIC/HEIF photos with an unreliable or missing MIME
 * type (some browsers report "" or "application/octet-stream"), so fall back
 * to the file extension.
 */
function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export type UploadStage = "uploading" | "cleaning" | "analyzing" | "saving";

/**
 * Full upload pipeline for a single photo: stores the raw image, runs the
 * same Claude vision analysis and OpenAI idealization used by
 * scripts/seed-clothing-items.ts, and saves the resulting clothing item.
 * HEIC/HEIF photos (e.g. straight off an iPhone) are converted to JPEG
 * first, since neither Claude's vision API nor OpenAI's image editing
 * endpoint accepts HEIC. `onProgress` is called as each stage starts, so a
 * caller (e.g. a streaming route handler) can report real-time status.
 */
export async function runClothingUploadPipeline(
  file: File,
  onProgress: (stage: UploadStage) => void,
): Promise<ClothingItem> {
  onProgress("uploading");

  let buffer = Buffer.from(await file.arrayBuffer());
  let mimeType: UploadMimeType;

  if (isHeicFile(file)) {
    onProgress("cleaning");
    const converted = await convertHeic({ buffer, format: "JPEG", quality: 0.92 });
    buffer = Buffer.from(converted);
    mimeType = "image/jpeg";
  } else if (isUploadMimeType(file.type)) {
    mimeType = file.type;
  } else {
    throw new Error("Unsupported image type");
  }

  const admin = createAdminClient();

  const imagePath = `items/${crypto.randomUUID()}.${mimeType.split("/")[1]}`;
  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(imagePath, buffer, { contentType: mimeType });
  if (uploadError) throw uploadError;

  onProgress("analyzing");
  const draft = await analyzeClothingPhoto(buffer, mimeType);

  onProgress("saving");
  let displayImagePath: string | null = null;
  try {
    const idealized = await generateIdealizedClothingImage(buffer, mimeType);
    displayImagePath = `items-display/${crypto.randomUUID()}.png`;
    const { error: displayUploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(displayImagePath, idealized, { contentType: "image/png" });
    if (displayUploadError) throw displayUploadError;
  } catch (idealizeError) {
    // Non-fatal, mirrors the seed script: fall back to the raw photo.
    console.error("Failed to generate idealized image", idealizeError);
    displayImagePath = null;
  }

  return createClothingItem({
    name: draft.suggestedName,
    category: draft.category,
    primaryColor: draft.primaryColor,
    secondaryColor: draft.secondaryColor,
    pattern: draft.pattern,
    casualness: draft.casualness,
    trendiness: draft.trendiness,
    boldness: draft.boldness,
    warmth: draft.warmth,
    imagePath,
    displayImagePath,
    aiRawResponse: draft.rawResponse,
  });
}
