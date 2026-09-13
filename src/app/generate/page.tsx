export default function GeneratePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Generate an outfit</h1>
      <p className="text-muted-foreground">
        Constraint controls (casualness, trendiness, boldness, warmth, occasion)
        and generated candidates land in a follow-up feature pass. The
        rule-based generator itself already works —{" "}
        <code className="rounded bg-muted px-1 py-0.5">
          src/lib/outfit-generator
        </code>
        .
      </p>
    </main>
  );
}
