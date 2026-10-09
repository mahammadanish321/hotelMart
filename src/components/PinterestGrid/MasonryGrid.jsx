import PinCard from "./PinCard";

export default function MasonryGrid({
  products = [],
  savedIds = new Set(),
  onSelectProduct,
  onToggleSave,
  onShare,
  loading = false,
  onClearFilters
}) {
  if (loading) {
    return (
      <div className="pinterest-grid px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`pinterest-item rounded-xl bg-neutral-100 animate-pulse ${
              i % 2 === 0 ? "h-72" : i % 3 === 0 ? "h-96" : "h-64"
            }`}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold text-neutral-900 mb-1">No items found</h3>
        <p className="text-sm text-neutral-500 mb-6">
          No items match your active search or category filter.
        </p>
        <button
          onClick={onClearFilters}
          className="bg-black hover:bg-neutral-800 text-white font-medium text-xs px-5 py-2.5 rounded-full transition-all"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Clean Minimal Count Line */}
      <div className="flex items-center justify-between pb-3 mb-3 text-xs text-neutral-500 border-b border-neutral-200">
        <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px]">
          Listings
        </span>
        <span>
          {products.length} {products.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Masonry Layout */}
      <div className="pinterest-grid">
        {products.map((product) => (
          <PinCard
            key={product._id}
            product={product}
            onSelect={onSelectProduct}
            isSaved={savedIds.has(product._id)}
            onToggleSave={onToggleSave}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
}
