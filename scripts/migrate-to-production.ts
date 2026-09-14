/**
 * One-time migration: copies clothing_items/outfits/outfit_items rows and
 * clothing-photos storage objects from local Supabase into a production
 * project, preserving primary keys so outfit_items' foreign keys stay valid.
 *
 * Reads the local connection details from the standard local dev env vars
 * (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and the production
 * ones from PROD_SUPABASE_URL / PROD_SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   tsx --env-file=.env.local --env-file=/path/to/prod.env scripts/migrate-to-production.ts
 */
import { createClient } from "@supabase/supabase-js";

const STORAGE_BUCKET = "clothing-photos";
const STORAGE_PREFIXES = ["items", "items-display"];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const local = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
);
const prod = createClient(
  requireEnv("PROD_SUPABASE_URL"),
  requireEnv("PROD_SUPABASE_SERVICE_ROLE_KEY"),
);

async function migrateTable(table: "clothing_items" | "outfits" | "outfit_items") {
  const { data, error } = await local.from(table).select("*");
  if (error) throw error;
  if (!data || data.length === 0) {
    console.log(`${table}: nothing to migrate`);
    return;
  }
  const { error: insertError } = await prod.from(table).upsert(data);
  if (insertError) throw insertError;
  console.log(`${table}: migrated ${data.length} rows`);
}

async function migrateStorage() {
  let total = 0;
  for (const prefix of STORAGE_PREFIXES) {
    const { data: files, error } = await local.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { limit: 1000 });
    if (error) throw error;

    for (const file of files ?? []) {
      const objectPath = `${prefix}/${file.name}`;
      const { data: blob, error: downloadError } = await local.storage
        .from(STORAGE_BUCKET)
        .download(objectPath);
      if (downloadError) throw downloadError;

      const buffer = Buffer.from(await blob.arrayBuffer());
      const { error: uploadError } = await prod.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, buffer, {
          contentType: blob.type || "application/octet-stream",
          upsert: true,
        });
      if (uploadError) throw uploadError;
      total++;
    }
    console.log(`storage/${prefix}: migrated ${files?.length ?? 0} objects`);
  }
  console.log(`storage: migrated ${total} objects total`);
}

async function main() {
  await migrateTable("clothing_items");
  await migrateTable("outfits");
  await migrateTable("outfit_items");
  await migrateStorage();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
