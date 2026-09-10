import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Newsreader, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-verse", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "T-Cubed — Know the Word. Live the Word.",
  description: "Go deeper in 1 Timothy, 2 Timothy, and Titus. Play adaptive Scripture challenges, discover your strengths, and build a personal study practice.",
  manifest: "/t-cubed-ai/manifest.webmanifest",
  icons: {
    icon: [{ url: "/t-cubed-ai/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/t-cubed-ai/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "T-Cubed — Know the Word. Live the Word.",
    description: "An adaptive Scripture challenge game for 1 Timothy, 2 Timothy, and Titus.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
