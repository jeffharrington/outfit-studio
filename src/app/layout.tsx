import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

import { NavBar } from "@/components/nav-bar";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outfit Studio",
  description: "A visual database of your closet, and a tool to generate outfits from it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavBar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
