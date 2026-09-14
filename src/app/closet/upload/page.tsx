export default function UploadPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Upload a piece</h1>
      <p className="text-muted-foreground">
        Photo upload, Claude-assisted attribute detection, and the confirm/edit
        step land in a follow-up feature pass. For now, closet data comes from
        the <code className="rounded bg-muted px-1 py-0.5">pnpm seed:photos</code>{" "}
        import script.
      </p>
    </main>
  );
}
