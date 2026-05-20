import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineProvider } from "@/components/offline-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  icons: {
    icon: '/favicon.png',
  },
}

export const metadata: Metadata = {
  title: "LiftLoop",
  description: "A premium Push Pull Legs Arms workout tracker.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <OfflineProvider />
        {children}
      </body>
    </html>
  );
}
