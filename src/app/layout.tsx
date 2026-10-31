import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Providers from "@/components/layout/Providers";

const fontEn = Inter({
  subsets: ["latin"],
  variable: "--font-en",
});

const fontTh = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600"],
  variable: "--font-th",
});

export const metadata: Metadata = {
  title: "planIT",
  description: "IT Curriculum Planner & Course Review Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${fontEn.variable} ${fontTh.variable}`}>
      <body className="font-sans antialiased">
      <Providers>
        <Navbar />
        {children}
        </Providers>
      </body>
    </html>
  );
}
