import { useRef, useEffect, useState, useCallback } from "react";
import DoomscrollCard from "./DoomscrollCard";
import CommentDrawer from "./CommentDrawer";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Grid,
  Volume2,
  VolumeX,
  Flame
} from "lucide-react";

export default function DoomscrollFeed({
  products = [],
  initialProductId,
  onBackToGrid,
  likedIds = new Set(),
  savedIds = new Set(),
  onToggleLike,
  onToggleSave,
  onShare,
  onAddToCart,
  onDirectBuy
}) {
  const containerRef = useRef(null);
  const [activeCommentProduct, setActiveCommentProduct] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialProductId && products.length > 0) {
      const idx = products.findIndex((p) => p._id === initialProductId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  // Scroll to initial product on mount
  useEffect(() => {
    if (initialProductId && containerRef.current && products.length > 0) {
      const targetIndex = products.findIndex((p) => p._id === initialProductId);
      if (targetIndex !== -1) {
        const cardElement = containerRef.current.children[targetIndex];
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "instant" });
        }
      }
    }
  }, [initialProductId, products]);

  const scrollDelta = useCallback((delta) => {
    const nextIdx = Math.min(Math.max(currentIndex + delta, 0), products.length - 1);
    setCurrentIndex(nextIdx);
    if (containerRef.current && containerRef.current.children[nextIdx]) {
      containerRef.current.children[nextIdx].scrollIntoView({ behavior: "smooth" });
    }
  }, [currentIndex, products.length]);

  // Keyboard navigation (Up/Down arrow & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeCommentProduct) return; // Don't navigate while writing a comment

      if (e.key === "Escape") {
        onBackToGrid();
      } else if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollDelta(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollDelta(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCommentProduct, onBackToGrid, scrollDelta]);



  // Track active index based on scroll position
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const itemHeight = containerRef.current.clientHeight;
    const newIdx = Math.round(scrollPos / itemHeight);
    if (newIdx !== currentIndex && newIdx >= 0 && newIdx < products.length) {
      setCurrentIndex(newIdx);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0c0c0e] overflow-hidden text-white">
      {/* Top Floating App Bar */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4 md:px-8 flex items-center justify-between pointer-events-none">
        {/* Back to Pinterest Grid button */}
        <button
          onClick={onBackToGrid}
          className="pointer-events-auto flex items-center gap-2 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 transition-all hover:scale-105 shadow-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
          <Grid size={15} className="text-[#e60023]" />
          <span>Pinterest Grid</span>
        </button>

        {/* Center Live Reel Badge */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold">
          <Flame size={15} className="text-[#e60023] animate-pulse" />
          <span>Doomscrolling Deals ({currentIndex + 1}/{products.length})</span>
        </div>

        {/* Right audio & cart toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
            title={isMuted ? "Unmute vibes" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* Vertical Snap Scroll Container */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar scroll-smooth"
      >
        {products.map((product) => (
          <section key={product._id} className="w-full h-[100dvh] flex items-center justify-center snap-start-card">
            <DoomscrollCard
              product={product}
              isLiked={likedIds.has(product._id)}
              isSaved={savedIds.has(product._id)}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              onShare={onShare}
              onAddToCart={onAddToCart}
              onOpenComments={(p) => setActiveCommentProduct(p)}
              onDirectBuy={onDirectBuy}
              isMuted={isMuted}
            />
          </section>
        ))}
      </main>

      {/* Floating Next / Prev arrows on Desktop */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => scrollDelta(-1)}
          disabled={currentIndex === 0}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/10 hover:scale-105 shadow-xl"
          title="Previous Item (Arrow Up)"
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={() => scrollDelta(1)}
          disabled={currentIndex === products.length - 1}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/10 hover:scale-105 shadow-xl"
          title="Next Item (Arrow Down)"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Bottom Floating Keyboard hint on Desktop */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[11px] px-3.5 py-1 rounded-full pointer-events-none items-center gap-2">
        <span>Use <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">↑</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">↓</kbd> or mousewheel to doomscroll</span>
        <span>•</span>
        <span><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">Esc</kbd> for grid</span>
      </div>

      {/* Inquiry Comments Drawer */}
      <CommentDrawer
        isOpen={Boolean(activeCommentProduct)}
        onClose={() => setActiveCommentProduct(null)}
        product={activeCommentProduct}
        onAddComment={() => { }}
      />
    </div>
  );
}
