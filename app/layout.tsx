import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";

/**
 * Inter at 300 for display, 400/500 for everything else.
 *
 * The brand reference sets its headlines in a light neo-grotesque. Inter at
 * 300 is the closest free match, it was already reachable from the build, and
 * swapping it in costs nothing at runtime — IBM Plex Sans was a technical face
 * doing a job this design no longer asks for.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Respondo — AI sales agent for clothing resellers",
  description:
    "An AI agent that answers customer questions from real catalog data and builds a basket, with a human confirming every order.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
