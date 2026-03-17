"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

const NAV_LINKS = [
  { href: "/top/trending", label: "Trending" },
  { href: "/top/all-time", label: "All-Time" },
  { href: "/top/hidden-gems", label: "Hidden Gems" },
  { href: "/watchlist", label: "Watchlist" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍿</span>
            <span className="text-xl font-bold text-white">
              popcorn<span className="text-[#f5c518]">rec</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-white transition-colors ${pathname === href ? "text-white" : ""}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/recommendations"
              className="px-3 py-1.5 rounded-full bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20 transition-colors font-medium"
            >
              For You
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <SearchBar />
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="sm:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px] rounded-lg hover:bg-white/5 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <nav className="absolute top-16 left-0 right-0 bg-[#0f0f18] border-b border-white/10 px-4 py-3 flex flex-col gap-1 shadow-2xl">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  pathname === href
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/recommendations"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/recommendations"
                  ? "bg-[#f5c518]/20 text-[#f5c518]"
                  : "text-[#f5c518] bg-[#f5c518]/10 hover:bg-[#f5c518]/20"
              }`}
            >
              ✨ For You
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
