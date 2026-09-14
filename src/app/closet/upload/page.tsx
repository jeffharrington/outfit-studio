import { UploadForm } from "./upload-form";

export default function UploadPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-6 px-6 py-12">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-normal tracking-normal">Add item</h1>
        <p className="text-base text-muted-foreground">
          Upload a photo and we&apos;ll detect its category, color, and style
          automatically.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
