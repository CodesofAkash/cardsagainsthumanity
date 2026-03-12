import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Preload Inter with swap — prevents FOIT, improves FCP
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: "Cards Against Humanity",
  description: "A party game for horrible people.",
  openGraph: {
    title: "Cards Against Humanity",
    description: "A party game for horrible people.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), sans-serif", margin: 0, background: "#000" }}>
        {children}
      </body>
    </html>
  );
}