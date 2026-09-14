import type { Metadata } from "next";
import { Archivo, DM_Serif_Display } from "next/font/google";
import "./globals.css";

import { NavBar } from "@/components/nav-bar";
import { Toaster } from "@/components/ui/sonner";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outfit Studio",
  description: "A visual database of your closet, and a tool to generate outfits from it.",
  icons: {
    icon: { url: "/clothes-hanger.png", type: "image/png" },
    shortcut: { url: "/clothes-hanger.png", type: "image/png" },
    apple: "/clothes-hanger.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
