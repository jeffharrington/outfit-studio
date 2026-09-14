-- Idealized, transparent-background version of image_path, generated via
-- src/lib/image-generation/openai.ts. Nullable and separate from image_path
-- (the original upload) so the source photo is always kept for reference
-- and possible reprocessing with a better prompt/model later. The app
-- displays display_image_path when present, falling back to image_path.
alter table clothing_items
  add column display_image_path text;
