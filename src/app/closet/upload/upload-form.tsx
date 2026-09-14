"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const HEIC_MIME_TYPES = ["image/heic", "image/heif"];

const STAGE_LABELS: Record<string, string> = {
  uploading: "Uploading file…",
  cleaning: "Cleaning up image…",
  analyzing: "Analyzing clothing…",
  saving: "Saving…",
};

type UploadEvent =
  | { type: "progress"; stage: string }
  | { type: "done"; item: { id: string } }
  | { type: "error"; message: string };

/**
 * iPhones commonly send HEIC/HEIF photos with an unreliable or missing MIME
 * type, so fall back to the file extension — mirrors the server-side check
 * in src/lib/actions/items.ts.
 */
function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || isHeicFile(file);
}

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  function handleFile(selected: File | null | undefined) {
    if (!selected) return;
    if (!isAcceptedFile(selected)) {
      toast.error("Please choose a JPEG, PNG, WebP, or HEIC photo.");
      return;
    }
    setFile(selected);
    // Most browsers can't render HEIC/HEIF in an <img>, so skip the blob
    // preview for those and just show the filename instead.
    setPreviewUrl(isHeicFile(selected) ? null : URL.createObjectURL(selected));
  }

  function handleReset() {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleUpload() {
    if (!file) return;
    startUpload(async () => {
      setStageLabel(STAGE_LABELS.uploading);
      try {
        const formData = new FormData();
        formData.set("photo", file);
        const response = await fetch("/api/closet/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let itemId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const event = JSON.parse(line.slice(5).trim()) as UploadEvent;
            if (event.type === "progress") {
              setStageLabel(STAGE_LABELS[event.stage] ?? null);
            } else if (event.type === "done") {
              itemId = event.item.id;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        }

        if (!itemId) throw new Error("Upload did not complete");
        toast.success("Item added");
        router.push(`/closet/${itemId}`);
      } catch {
        toast.error("Something went wrong adding this item.");
      } finally {
        setStageLabel(null);
      }
    });
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg border p-6">
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-md bg-muted">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview, not an optimizable asset
              <img
                src={previewUrl}
                alt="Selected clothing item"
                className="size-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <Upload className="size-6 text-muted-foreground" />
                <p className="text-sm break-all">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Preview isn&apos;t available for HEIC photos — it&apos;ll convert
                  automatically when added.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={isUploading}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose a different photo
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
            isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent",
          )}
        >
          <Upload className="size-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drag and drop a photo, or click to choose a file
            </p>
            <p className="text-sm text-muted-foreground">JPEG, PNG, WebP, or HEIC</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      <p className="text-sm text-muted-foreground">
        Take a clear photo of a single item against a plain background. For shirts and
        pants, ideally on hangers.
      </p>

      <Button
        variant="accent"
        size="lg"
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        {isUploading ? (stageLabel ?? "Adding item…") : "Add item"}
      </Button>
    </div>
  );
}
