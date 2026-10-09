import { useState } from "react";
import { Share2 } from "lucide-react";

export default function PinCard({ 
  product, 
  onSelect, 
  isSaved = false, 
  onToggleSave,
  onShare 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const mainImage = product.productImages?.[0] || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80";

  return (
    <div 
      className="pinterest-item group flex flex-col cursor-pointer transition-all duration-200 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(product)}
    >
      {/* Media Container - Natural Aspect Ratio (Google Photos Comfortable Mode) */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-150 transition-all duration-300 group-hover:shadow-md">
        {/* Placeholder skeleton before load */}
        {!imgLoaded && (
          <div className="w-full h-48 bg-neutral-200 animate-pulse" />
        )}

        {/* Natural Unforced Image */}
        <img
          src={mainImage}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
            imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          loading="lazy"
        />

        {/* Clean floating price pill */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10 tracking-tight">
          ₹{product.price?.toLocaleString()}{product.listingType === "rent" ? "/mo" : ""}
        </div>

        {/* Premium hover overlay */}
        <div 
          className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 flex flex-col justify-between p-3.5 z-20 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Top row: Save action */}
          <div className="flex justify-end items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(product._id);
              }}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm ${
                isSaved
                  ? "bg-white text-black hover:bg-neutral-100"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Bottom row: Quick action + Share */}
          <div className="flex items-center justify-between">
            <div className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Quick View
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(product);
              }}
              className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-100 flex items-center justify-center transition-colors shadow-sm"
              title="Share"
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Micro-typography below image */}
      <div className="pt-2 px-1 pb-1">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 tracking-tight group-hover:text-neutral-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1 text-xs text-neutral-500 font-normal">
          <span className="truncate max-w-[65%]">
            {product.location}
          </span>
          <span className="text-neutral-400 text-[11px] font-medium shrink-0">
            {product.condition}
          </span>
        </div>
      </div>
    </div>
  );
}
