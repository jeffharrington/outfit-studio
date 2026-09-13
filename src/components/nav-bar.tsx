import Link from "next/link";

const NAV_LINKS = [
  { href: "/closet", label: "Closet" },
  { href: "/generate", label: "Generate" },
  { href: "/outfits", label: "Saved Outfits" },
];

export function NavBar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Outfit Studio
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
