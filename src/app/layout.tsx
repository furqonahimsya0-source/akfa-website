import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKFA - Modern Menswear Collection",
  description: "Redefined men's fashion with minimalist design and uncompromising quality. Discover the latest collection from AKFA.",
  keywords: ["AKFA", "menswear", "pakaian pria", "streetwear", "fashion pria", "modern clothing"],
  authors: [{ name: "AKFA" }],
  icons: {
    icon: "/akfa-logo.png",
  },
  openGraph: {
    title: "AKFA - Modern Menswear Collection",
    description: "Redefined men's fashion with minimalist design and uncompromising quality.",
    siteName: "AKFA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
