import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Cubed — Know the Word. Live the Word.",
  description: "Go deeper in 1 Timothy, 2 Timothy, and Titus. Play adaptive Scripture challenges, discover your strengths, and build a personal study practice.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
