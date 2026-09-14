import { Bookmark, DoorOpen, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Generate", icon: RefreshCw },
  { href: "/closet", label: "Closet", icon: DoorOpen },
  { href: "/outfits", label: "Saved Outfits", icon: Bookmark },
];

export function NavBar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-2xl font-normal tracking-normal"
        >
          <Image src="/clothes-hanger.png" alt="" width={28} height={28} className="size-7" />
          Outfit Studio
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
