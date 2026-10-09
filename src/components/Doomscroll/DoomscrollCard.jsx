import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  CheckCircle,
  Zap
} from "lucide-react";

export default function DoomscrollCard({
  product,
  isLiked = false,
  isSaved = false,
  onToggleLike,
  onToggleSave,
  onShare,
  onAddToCart,
  onOpenComments,
  onDirectBuy,
  isMuted = true
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const media = [
    ...(product.productImages || []).map((url) => ({ type: "image", url })),
    ...(product.productVideo?.url ? [{ type: "video", url: product.productVideo.url }] : [])
  ];
  if (media.length === 0) {
    media.push({ type: "image", url: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80" });
  }
  const currentMedia = media[currentImageIndex] || media[0];
  const backgroundImage = product.productImages?.[0] || currentMedia.url;

  // Double-tap or double-click to like (Instagram gesture)
  const handleDoubleClick = () => {
    setShowHeartAnimation(true);
    if (!isLiked) {
      onToggleLike(product._id);
    }
    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 900);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="w-full h-full flex items-center justify-center snap-start-card relative p-2 md:p-6 select-none">
      {/* Blurred background aesthetic (Instagram desktop style) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Main Reels Card Container (9:16 mobile frame on desktop, full-width on mobile) */}
      <div
        className="relative w-full max-w-[430px] h-[85vh] md:h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between"
        onDoubleClick={handleDoubleClick}
      >
        {/* Media Carousel */}
        <div className="absolute inset-0 z-0">
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.url}
              poster={backgroundImage}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              controls
              className="w-full h-full object-contain transition-all duration-300"
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          )}

          {/* Vignette gradients for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50 pointer-events-none" />

          {/* Multiple images indicator & arrows */}
          {media.length > 1 && (
            <>
              {/* Image counter pill */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
                {currentImageIndex + 1}/{media.length}
              </div>

              {/* Prev / Next buttons */}
              {currentImageIndex > 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm z-10 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {currentImageIndex < media.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-14 md:right-16 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm z-10 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Dots indicator */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {media.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Double tap Instagram floating heart animation */}
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping duration-700">
              <Heart size={100} className="fill-red-500 text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]" />
            </div>
          )}
        </div>

        {/* Top Badges */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles size={12} />
              Hostel Pick
            </span>
            {product.condition && (
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                {product.condition}
              </span>
            )}
          </div>
        </div>

        {/* Right Floating Actions (Instagram Reels Style) */}
        <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(product._id);
              }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150 border border-white/10"
            >
              <Heart
                size={26}
                className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
              />
            </button>
            <span className="text-[11px] font-semibold mt-1 drop-shadow-md">
              {(product.likesCount || 0) + (isLiked ? 1 : 0)}
            </span>
          </div>

          {/* Comment / Ask Seller */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments(product);
              }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150 border border-white/10"
            >
              <MessageCircle size={26} />
            </button>
            <span className="text-[11px] font-semibold mt-1 drop-shadow-md">
              {product.commentsCount || product.sampleComments?.length || 0}
            </span>
          </div>

          {/* Save / Bookmark */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(product._id);
              }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150 border border-white/10"
            >
              <Bookmark
                size={24}
                className={isSaved ? "fill-yellow-400 text-yellow-400" : "text-white"}
              />
            </button>
            <span className="text-[11px] font-semibold mt-1 drop-shadow-md">
              {isSaved ? "Saved" : "Save"}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(product);
              }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150 border border-white/10"
            >
              <Share2 size={23} />
            </button>
            <span className="text-[11px] font-semibold mt-1 drop-shadow-md">Share</span>
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-12 h-12 rounded-full bg-[#e60023] hover:bg-[#b6001a] shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150 text-white"
            >
              <ShoppingBag size={23} />
            </button>
            <span className="text-[11px] font-semibold mt-1 drop-shadow-md">Cart</span>
          </div>
        </div>

        {/* Bottom Details Overlay Panel (Instagram Reels Style) */}
        <div className="relative z-10 p-5 pr-16 text-white space-y-2.5">
          {/* Seller row */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={product.createdBy?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
                alt={product.createdBy?.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide truncate">
                  {product.createdBy?.fullName || "Hostel Seller"}
                </span>
                <CheckCircle size={14} className="text-blue-400 fill-blue-400 shrink-0" />
              </div>
              <p className="text-[11px] text-gray-300 truncate">
                {product.createdBy?.department || "Campus Resident"} • ⭐ {product.createdBy?.rating || "4.9"}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments(product);
              }}
              className="border border-white/50 hover:bg-white hover:text-black text-white text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0"
            >
              Chat
            </button>
          </div>

          {/* Product Title & Price */}
          <div>
            <h2 className="text-base font-bold text-white leading-tight drop-shadow-md line-clamp-2">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-emerald-400 drop-shadow-md">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Hostel Location Badge */}
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full">
              <MapPin size={11} className="text-red-400" />
              <span>{product.location}</span>
            </span>
            <span className="text-xs text-emerald-300 font-medium">
              ● In Stock ({product.quantity || 1} available)
            </span>
          </div>

          {/* Description & Hashtags */}
          <div className="text-xs text-gray-200">
            <p className={isDescExpanded ? "text-gray-100" : "line-clamp-2 text-gray-300"}>
              {product.description}
            </p>
            {product.description && product.description.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
                className="text-gray-400 hover:text-white font-semibold text-[11px] mt-0.5 underline block"
              >
                {isDescExpanded ? "show less" : "more"}
              </button>
            )}

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-pink-300 font-medium">
                {product.tags.map((t, idx) => (
                  <span key={idx} className="hover:underline cursor-pointer">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Fast Buy Action CTA */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDirectBuy(product);
              }}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={14} fill="currentColor" />
              <span>Buy / Claim for ₹{product.price}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
