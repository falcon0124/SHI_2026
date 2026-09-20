import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GovBanner } from "@/components/chrome/GovBanner";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "FareSankhya · APIx Airfare Price Index",
  description: "India's airfares, measured every hour. Experimental statistic of MoSPI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <GovBanner />
          <Header />
          <main id="main" className="flex-1 bg-white">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
