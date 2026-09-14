/**
 * Imports real clothing photos from seed-images/ into the closet database.
 *
 * Runs the same convert -> analyze -> upload -> insert pipeline a real
 * upload will use, so it doubles as an end-to-end test of the Claude vision
 * integration. Safe to re-run: already-imported files are skipped via a
 * manifest, and Claude's analysis is cached per file before the upload/insert
 * step runs, so a later failure (or a second run against a different
 * Supabase target) never costs a repeat API call.
 *
 * Usage: pnpm seed:photos
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { analyzeClothingImage } from "@/lib/anthropic";
import { generateIdealizedClothingImage } from "@/lib/image-generation/openai";
import { createAdminClient } from "@/lib/supabase/admin";

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIR = path.join(REPO_ROOT, "seed-images");
const CACHE_DIR = path.join(REPO_ROOT, "scripts", ".seed-cache");
const ANALYSIS_CACHE_DIR = path.join(CACHE_DIR, "analysis");
const IDEALIZED_CACHE_DIR = path.join(CACHE_DIR, "idealized");
const MANIFEST_PATH = path.join(CACHE_DIR, "manifest.json");
const STORAGE_BUCKET = "clothing-photos";

interface ManifestEntry {
  clothingItemId: string;
  imagePath: string;
  displayImagePath: string | null;
}
type Manifest = Record<string, ManifestEntry>;

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

interface CachedAnalysis {
  category: "top" | "bottom" | "shoes";
  suggestedName: string;
  primaryColor: string;
  secondaryColor: string | null;
  pattern: string | null;
  casualness: number;
  trendiness: number;
  boldness: number;
  warmth: number;
  rawResponse: unknown;
}

async function getOrAnalyze(
  baseName: string,
  jpegPath: string,
): Promise<CachedAnalysis> {
  const cachePath = path.join(ANALYSIS_CACHE_DIR, `${baseName}.json`);
  try {
    return JSON.parse(await readFile(cachePath, "utf8")) as CachedAnalysis;
  } catch {
    // Not cached yet — fall through to a real Claude vision call.
  }

  const imageBuffer = await readFile(jpegPath);
  const { attributes, raw } = await analyzeClothingImage(
    imageBuffer,
    "image/jpeg",
  );
  const analysis: CachedAnalysis = {
    category: attributes.category,
    suggestedName: attributes.suggested_name,
    primaryColor: attributes.primary_color,
    secondaryColor: attributes.secondary_color,
    pattern: attributes.pattern,
    casualness: attributes.casualness,
    trendiness: attributes.trendiness,
    boldness: attributes.boldness,
    warmth: attributes.warmth,
    rawResponse: raw,
  };

  await mkdir(ANALYSIS_CACHE_DIR, { recursive: true });
  await writeFile(cachePath, JSON.stringify(analysis, null, 2));
  return analysis;
}

async function getOrIdealize(baseName: string, jpegBuffer: Buffer): Promise<Buffer> {
  const cachePath = path.join(IDEALIZED_CACHE_DIR, `${baseName}.png`);
  try {
    return await readFile(cachePath);
  } catch {
    // Not cached yet — fall through to a real OpenAI image-edit call.
  }

  const idealized = await generateIdealizedClothingImage(jpegBuffer, "image/jpeg");

  await mkdir(IDEALIZED_CACHE_DIR, { recursive: true });
  await writeFile(cachePath, idealized);
  return idealized;
}

async function convertToJpeg(sourcePath: string, baseName: string): Promise<string> {
  const outputPath = path.join(await mkdtempJpegDir(), `${baseName}.jpg`);
  // -Z caps the max dimension (keeps Storage/API payloads reasonable);
  // sips auto-applies EXIF orientation on conversion.
  await execFileAsync("sips", [
    "-s",
    "format",
    "jpeg",
    "-Z",
    "1600",
    sourcePath,
    "--out",
    outputPath,
  ]);
  return outputPath;
}

let jpegDirPromise: Promise<string> | null = null;
function mkdtempJpegDir(): Promise<string> {
  if (!jpegDirPromise) {
    const dir = path.join(tmpdir(), `outfit-studio-seed-${Date.now()}`);
    jpegDirPromise = mkdir(dir, { recursive: true }).then(() => dir);
  }
  return jpegDirPromise;
}

function isHeic(filename: string): boolean {
  return /\.(heic|heif)$/i.test(filename);
}

async function main() {
  const admin = createAdminClient();
  const manifest = await readManifest();

  let files: string[];
  try {
    files = (await readdir(SOURCE_DIR)).filter(isHeic).sort();
  } catch {
    console.error(
      `No seed-images/ directory found at ${SOURCE_DIR}. Create it and add your HEIC photos before running this script.`,
    );
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.log("No HEIC/HEIF files found in seed-images/ — nothing to do.");
    return;
  }

  const failures: { file: string; error: string }[] = [];
  const missingIdealized: string[] = [];
  let succeeded = 0;

  for (const [index, file] of files.entries()) {
    const label = `[${index + 1}/${files.length}] ${file}`;
    const baseName = path.basename(file, path.extname(file));

    if (manifest[file]) {
      console.log(`${label} -> already imported, skipping`);
      succeeded++;
      continue;
    }

    try {
      const sourcePath = path.join(SOURCE_DIR, file);
      const jpegPath = await convertToJpeg(sourcePath, baseName);
      const analysis = await getOrAnalyze(baseName, jpegPath);

      const jpegBuffer = await readFile(jpegPath);
      const storagePath = `items/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, jpegBuffer, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      let displayStoragePath: string | null = null;
      try {
        const idealized = await getOrIdealize(baseName, jpegBuffer);
        displayStoragePath = `items-display/${crypto.randomUUID()}.png`;
        const { error: displayUploadError } = await admin.storage
          .from(STORAGE_BUCKET)
          .upload(displayStoragePath, idealized, { contentType: "image/png" });
        if (displayUploadError) throw displayUploadError;
      } catch (idealizeError) {
        // Non-fatal: fall back to the original photo rather than failing
        // the whole item over an idealization failure.
        const message =
          idealizeError instanceof Error ? idealizeError.message : String(idealizeError);
        console.error(`${label} -> idealized image failed, using original: ${message}`);
        displayStoragePath = null;
        missingIdealized.push(file);
      }

      const { data: item, error: insertError } = await admin
        .from("clothing_items")
        .insert({
          name: analysis.suggestedName,
          category: analysis.category,
          primary_color: analysis.primaryColor,
          secondary_color: analysis.secondaryColor,
          pattern: analysis.pattern,
          casualness: analysis.casualness,
          trendiness: analysis.trendiness,
          boldness: analysis.boldness,
          warmth: analysis.warmth,
          image_path: storagePath,
          display_image_path: displayStoragePath,
          source: "seed",
          ai_raw_response: JSON.parse(
            JSON.stringify(analysis.rawResponse),
          ),
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      manifest[file] = {
        clothingItemId: item.id,
        imagePath: storagePath,
        displayImagePath: displayStoragePath,
      };
      await writeManifest(manifest);

      console.log(
        `${label} -> ${analysis.category}, casualness ${analysis.casualness}, warmth ${analysis.warmth}${displayStoragePath ? "" : " (no idealized image)"}`,
      );
      succeeded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${label} -> FAILED: ${message}`);
      failures.push({ file, error: message });
    }
  }

  console.log(
    `\n${succeeded}/${files.length} succeeded${failures.length > 0 ? `, ${failures.length} failed` : ""}.`,
  );
  if (failures.length > 0) {
    console.log("Failed files (safe to re-run — already-imported files are skipped):");
    for (const failure of failures) {
      console.log(`  - ${failure.file}: ${failure.error}`);
    }
    process.exitCode = 1;
  }
  if (missingIdealized.length > 0) {
    console.log(
      `${missingIdealized.length} item(s) imported with the original photo only (idealized image generation failed): ${missingIdealized.join(", ")}`,
    );
    console.log(
      "These are already in the manifest, so re-running this script won't retry them — delete their manifest entry in scripts/.seed-cache/manifest.json to retry idealization.",
    );
  }
}

main();
