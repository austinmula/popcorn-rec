import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍿</span>
          <span className="text-xl font-bold text-white">
            popcorn<span className="text-[#f5c518]">rec</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/top/trending" className="hover:text-white transition-colors">
            Trending
          </Link>
          <Link href="/top/all-time" className="hover:text-white transition-colors">
            All-Time
          </Link>
          <Link href="/top/hidden-gems" className="hover:text-white transition-colors">
            Hidden Gems
          </Link>
          <Link href="/watchlist" className="hover:text-white transition-colors">
            Watchlist
          </Link>
          <Link
            href="/recommendations"
            className="px-3 py-1.5 rounded-full bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20 transition-colors font-medium"
          >
            For You
          </Link>
        </nav>
      </div>
    </header>
  );
}
