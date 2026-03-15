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
  title: {
    default: "Home - Cards Against Humanity",
    template: "%s - Cards Against Humanity",
  },
  description: "A party game for horrible people.",
  icons: {
    icon: "https://www.cardsagainsthumanity.com/favicon/apple-touch-icon-114x114.png",
    apple: "https://www.cardsagainsthumanity.com/favicon/apple-touch-icon-114x114.png",
    shortcut: "https://www.cardsagainsthumanity.com/favicon/apple-touch-icon-114x114.png",
  },
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