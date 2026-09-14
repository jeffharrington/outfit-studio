export const STORAGE_BUCKET = "clothing-photos";

/** Builds a public URL for an object in the clothing-photos bucket. */
export function getClothingImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
