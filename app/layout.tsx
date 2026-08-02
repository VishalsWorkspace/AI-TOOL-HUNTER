import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./providers";
import Navbar from "@/components/Navbar";
import { SavedToolsProvider } from "@/components/SavedToolsProvider";
import { CompareProvider } from "@/components/CompareProvider";
import CompareBar from "@/components/CompareBar";

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-tool-hunter-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Tool Hunter | Find Top 1% of AI Tools",
    template: "%s | AI Tool Hunter"
  },
  description: "Don't just search. Hunt. Our AI Agent scans thousands of tools daily to find the ones that actually work.",
  keywords: ["AI Tools", "Deep Search", "Tech Hunter", "Generative AI", "Software Reviews"],
  authors: [{ name: "Vishal Singh" }],
  openGraph: {
    title: "AI Tool Hunter",
    description: "The intelligent search engine for AI software.",
    url: SITE_URL,
    siteName: "AI Tool Hunter",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tool Hunter — Find Top 1% of AI Tools",
    description:
      "AI-powered search engine for discovering the best AI software. Live search agent + curated daily-refreshed database.",
    images: [`${SITE_URL}/og-image.png`],
  },
  verification: {
    google: 'cOIdnK78fvKIY7rwwunFwzz71EG4yuVGK3Em_m3TPio',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <CSPostHogProvider>
        <body className={`${jetbrains.className} antialiased bg-black min-h-screen`}>
          <SavedToolsProvider>
            <CompareProvider>
              <Navbar />
              {children}
              <CompareBar />
            </CompareProvider>
          </SavedToolsProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}