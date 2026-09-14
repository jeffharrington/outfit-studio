import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/closet",
    title: "Closet",
    description: "Browse and manage everything you've uploaded.",
  },
  {
    href: "/generate",
    title: "Generate",
    description: "Get an outfit suggestion built from your real clothes.",
  },
  {
    href: "/outfits",
    title: "Saved Outfits",
    description: "Revisit outfits you've saved for later.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outfit Studio</h1>
        <p className="mt-1 text-muted-foreground">
          A visual database of your closet, and a tool to generate outfits from it.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:ring-accent">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
