import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WatchlistInitializer from "@/components/WatchlistInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "popcornrec — Movie Recommendations",
  description: "Discover movies by genre, mood, era, and more. Powered by TMDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0f] text-white min-h-screen`}>
        <Header />
        <WatchlistInitializer />
        {children}
      </body>
    </html>
  );
}
