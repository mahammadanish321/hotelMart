import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  ShoppingBag,
  Send,
  Check
} from "lucide-react";

const getProductMedia = (product) => [
  ...(product?.productImages || []).map((url) => ({ type: "image", url })),
  ...(product?.productVideo?.url ? [{ type: "video", url: product.productVideo.url }] : [])
];

export default function QuickView({
  products = [],
  initialProductId,
  onBackToGrid,
  savedIds = new Set(),
  onToggleSave,
  onShare,
  onAddToCart,
  onDirectBuy,
  onOpenCart,
  cartCount = 0
}) {
  const leftScrollRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialProductId && products.length > 0) {
      const idx = products.findIndex((p) => p._id === initialProductId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  const [imageIndexMap, setImageIndexMap] = useState({});
  const [inquiryText, setInquiryText] = useState("");
  const [localComments, setLocalComments] = useState({});
  const [copied, setCopied] = useState(false);

  const activeProduct = products[currentIndex] || products[0];

  // Scroll left container to initial product on mount
  useEffect(() => {
    if (initialProductId && leftScrollRef.current && products.length > 0) {
      const targetIndex = products.findIndex((p) => p._id === initialProductId);
      if (targetIndex !== -1) {
        const itemEl = leftScrollRef.current.children[targetIndex];
        if (itemEl) {
          itemEl.scrollIntoView({ behavior: "instant" });
        }
      }
    }
  }, [initialProductId, products]);

  // Navigate left feed up or down
  const scrollDelta = useCallback((delta) => {
    const nextIdx = Math.min(Math.max(currentIndex + delta, 0), products.length - 1);
    setCurrentIndex(nextIdx);
    if (leftScrollRef.current && leftScrollRef.current.children[nextIdx]) {
      leftScrollRef.current.children[nextIdx].scrollIntoView({ behavior: "smooth" });
    }
  }, [currentIndex, products.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

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
  }, [onBackToGrid, scrollDelta]);

  // Track active scroll on left column
  const handleLeftScroll = () => {
    if (!leftScrollRef.current) return;
    const scrollPos = leftScrollRef.current.scrollTop;
    const itemHeight = leftScrollRef.current.clientHeight;
    const newIdx = Math.round(scrollPos / itemHeight);
    if (newIdx !== currentIndex && newIdx >= 0 && newIdx < products.length) {
      setCurrentIndex(newIdx);
    }
  };

  const currentImageIdx = (activeProduct && imageIndexMap[activeProduct._id]) || 0;
  const media = getProductMedia(activeProduct);

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (media.length <= 1) return;
    setImageIndexMap((prev) => ({
      ...prev,
      [activeProduct._id]: (currentImageIdx + 1) % media.length
    }));
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (media.length <= 1) return;
    setImageIndexMap((prev) => ({
      ...prev,
      [activeProduct._id]: (currentImageIdx - 1 + media.length) % media.length
    }));
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!inquiryText.trim() || !activeProduct) return;

    const newInquiry = {
      id: `inq_${Date.now()}`,
      user: "You",
      text: inquiryText.trim(),
      time: "Just now"
    };

    setLocalComments((prev) => ({
      ...prev,
      [activeProduct._id]: [newInquiry, ...(prev[activeProduct._id] || activeProduct.sampleComments || [])]
    }));

    setInquiryText("");
  };

  const currentInquiries = localComments[activeProduct?._id] || activeProduct?.sampleComments || [];
  const isSaved = activeProduct ? savedIds.has(activeProduct._id) : false;

  const handleCopyLink = () => {
    if (activeProduct) {
      onShare(activeProduct);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeProduct) {
    return (
      <div className="w-full h-screen flex flex-col bg-white text-black font-sans">
        <header className="h-14 border-b border-neutral-200 px-6 md:px-8 flex items-center justify-between shrink-0 bg-white">
          <button
            onClick={onBackToGrid}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Marketplace</span>
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <h2 className="text-base font-bold text-black mb-1">No listings available</h2>
          <p className="text-xs text-neutral-400 mb-5">Be the first to list an item or room in the campus marketplace.</p>
          <button
            onClick={onBackToGrid}
            className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white text-black overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Top Header - Ultra-refined Monochrome */}
      <header className="h-14 border-b border-neutral-150 px-6 md:px-8 flex items-center justify-between shrink-0 bg-white z-30">
        <div className="flex items-center gap-5">
          <button
            onClick={onBackToGrid}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Marketplace</span>
          </button>

          <div className="h-4 w-px bg-neutral-200" />

          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="font-bold text-black tracking-tight">Quick Feed</span>
            <span>•</span>
            <span>Item {currentIndex + 1} of {products.length}</span>
          </div>
        </div>

        {/* Right side cart trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-neutral-250 hover:border-black transition-colors"
          >
            <ShoppingBag size={14} />
            <span>Cart ({cartCount})</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left 40% (Full-Bleed Media) | Right 60% (Editorial Details) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT SECTION (40%): Full-Bleed Edge-to-Edge Scroll Feed   */}
        {/* ======================================================== */}
        <div className="w-full md:w-[42%] h-[50vh] md:h-full bg-neutral-950 relative overflow-hidden flex flex-col">
          {/* Scroll container taking 100% full bleed space */}
          <div
            ref={leftScrollRef}
            onScroll={handleLeftScroll}
            className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
          >
            {products.map((prod, idx) => {
              const prodMedia = getProductMedia(prod);
              const activeMediaIdx = (prod._id === activeProduct?._id) ? currentImageIdx : 0;
              const currentMedia = prodMedia[activeMediaIdx] || prodMedia[0];
              const currentImg = prod.productImages?.[0];

              return (
                <div
                  key={prod._id}
                  className="w-full h-full snap-start-card relative flex items-center justify-center bg-black overflow-hidden select-none"
                >
                  {/* Background atmosphere subtle blur */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-25 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${currentImg})` }}
                  />

                  {/* Full-bleed photo or short product video */}
                  {currentMedia?.type === "video" ? (
                    <video
                      src={currentMedia.url}
                      poster={currentImg}
                      autoPlay={prod._id === activeProduct?._id}
                      loop
                      muted
                      playsInline
                      controls
                      preload={prod._id === activeProduct?._id ? "auto" : "none"}
                      className="relative w-full h-full object-contain z-10"
                    />
                  ) : currentMedia?.url ? (
                    <img
                      src={currentMedia.url}
                      alt={prod.name}
                      className="relative w-full h-full object-cover object-center z-10"
                    />
                  ) : null}

                  {/* Top-right Minimalist Image Counter */}
                  {prodMedia.length > 1 && (
                    <div className="absolute top-5 right-5 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                      {activeMediaIdx + 1} / {prodMedia.length}
                    </div>
                  )}

                  {/* Carousel navigation arrows */}
                  {prod._id === activeProduct?._id && prodMedia.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                      <button
                        onClick={handlePrevImage}
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                        title="Previous photo"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                        title="Next photo"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {/* Bottom item index badge */}
                  <div className="absolute bottom-5 left-5 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/10">
                    Listing #{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Vertical Next/Prev Nav Arrows on Left Column */}
          <div className="hidden md:flex flex-col gap-2 absolute right-5 bottom-5 z-30">
            <button
              onClick={() => scrollDelta(-1)}
              disabled={currentIndex === 0}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black disabled:opacity-20 flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
              title="Previous item"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => scrollDelta(1)}
              disabled={currentIndex === products.length - 1}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black disabled:opacity-20 flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
              title="Next item"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SECTION (60%): High-End Editorial Details Panel     */}
        {/* ======================================================== */}
        <div className="w-full md:w-[58%] h-[50vh] md:h-full bg-white overflow-y-auto border-t md:border-t-0 md:border-l border-neutral-150 px-6 md:px-14 py-8 md:py-12 flex flex-col justify-between">
          <div className="max-w-xl mx-auto w-full space-y-8">
            {/* Category Breadcrumb & Stock Status */}
            <div className="flex items-center justify-between text-xs tracking-wider uppercase pb-3 border-b border-neutral-100">
              <span className="font-semibold text-black tracking-widest text-[11px]">
                {activeProduct?.category || "Listing"}
              </span>
              <span className="text-neutral-500 font-medium normal-case tracking-normal text-xs">
                {activeProduct?.inStock ? `Available (${activeProduct.quantity || 1} in stock)` : "Sold out"}
              </span>
            </div>

            {/* Title & Price Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-black leading-tight">
                {activeProduct?.name}
              </h1>

              {/* Price Block */}
              <div className="flex items-baseline gap-3.5 mt-4">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
                  ₹{activeProduct?.price?.toLocaleString()}
                </span>
                {activeProduct?.listingType === "rent" && (
                  <span className="text-sm font-semibold text-neutral-500">
                    / month
                  </span>
                )}
                {activeProduct?.originalPrice && (
                  <span className="text-base text-neutral-400 line-through">
                    ₹{activeProduct?.originalPrice?.toLocaleString()}
                  </span>
                )}
                {activeProduct?.originalPrice && (
                  <span className="text-xs font-semibold px-2 py-0.5 border border-black rounded-full">
                    {Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)}% off
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => onDirectBuy(activeProduct)}
                className="w-full bg-black hover:bg-neutral-800 text-white font-semibold text-sm py-4 px-6 rounded-full transition-all shadow-xs"
              >
                {activeProduct?.listingType === "rent"
                  ? `Reserve Rental — ₹${activeProduct?.price?.toLocaleString()}/mo`
                  : `Instant Buy — ₹${activeProduct?.price?.toLocaleString()}`}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onAddToCart(activeProduct)}
                  className="flex-1 bg-white hover:bg-neutral-50 text-black border border-black font-semibold text-xs py-3.5 px-5 rounded-full transition-all"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => onToggleSave(activeProduct._id)}
                  className={`py-3.5 px-5 rounded-full border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${isSaved
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-neutral-300 hover:border-black"
                    }`}
                  title={isSaved ? "Saved" : "Save"}
                >
                  <Bookmark size={15} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3.5 px-4 rounded-full border border-neutral-300 hover:border-black text-black transition-all flex items-center justify-center"
                  title="Share link"
                >
                  {copied ? <Check size={15} /> : <Share2 size={15} />}
                </button>
              </div>
            </div>

            {/* Architectural Specifications Sheet */}
            <div className="border-t border-neutral-150 pt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Campus Pickup Location</span>
                <span className="font-semibold text-black">{activeProduct?.location}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Condition</span>
                <span className="font-semibold text-black">{activeProduct?.condition || "Good Condition"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Seller Store</span>
                <span className="font-semibold text-black">
                  {activeProduct?.createdBy?.shopName || activeProduct?.createdBy?.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Department & Batch</span>
                <span className="font-semibold text-black">
                  {activeProduct?.createdBy?.department || "Campus Resident"}
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Item Overview
              </h3>
              <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
                {activeProduct?.description}
              </p>
            </div>

            {/* Inquiries & Q&A Feed */}
            <div className="border-t border-neutral-150 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Student Questions ({currentInquiries.length})
                </h3>
              </div>

              {/* Inquiry Input Form */}
              <form onSubmit={handleSendInquiry} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Ask seller about physical inspection, battery health..."
                  className="flex-1 bg-neutral-100 focus:bg-white text-black placeholder-neutral-400 text-xs px-4 py-3 rounded-full border border-transparent focus:border-black outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inquiryText.trim()}
                  className="bg-black hover:bg-neutral-800 disabled:opacity-30 text-white px-5 py-3 rounded-full text-xs font-semibold flex items-center justify-center transition-all"
                >
                  <Send size={13} />
                </button>
              </form>

              {/* List of Inquiries */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {currentInquiries.length === 0 ? (
                  <p className="text-xs text-neutral-400">No questions posted yet for this listing.</p>
                ) : (
                  currentInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-150 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                        <span className="font-semibold text-black">{inq.user}</span>
                        <span>{inq.time}</span>
                      </div>
                      <p className="text-neutral-700 leading-relaxed">{inq.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
