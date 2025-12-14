import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./providers"; 

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: {
    default: "AI Tool Hunter | Find Top 1% of AI Tools",
    template: "%s | AI Tool Hunter"
  },
  description: "Don't just search. Hunt. Our AI Agent scans thousands of tools daily to find the ones that actually work.",
  keywords: ["AI Tools", "Deep Search", "Tech Hunter", "Generative AI", "Software Reviews"],
  authors: [{ name: "Your Name" }], // <--- PUT YOUR NAME HERE
  openGraph: {
    title: "AI Tool Hunter",
    description: "The intelligent search engine for AI software.",
    url: "https://ai-tool-hunter.vercel.app", // Update this after Vercel deploy
    siteName: "AI Tool Hunter",
    images: [
      {
        url: "/og-image.png", // We will add this image next
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
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
          {children}
        </body>
      </CSPostHogProvider>
    </html>
  );
}