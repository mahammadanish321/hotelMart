import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { getSellerProducts } from "../../services/api";

export default function SellerDashboard({
  currentUser,
  products = [],
  onBackToMarketplace,
  onOpenCreate,
  onDeleteProduct
}) {
  const [liveSellerProducts, setLiveSellerProducts] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getSellerProducts();
      if (Array.isArray(data) && data.length > 0) {
        setLiveSellerProducts(data);
      }
    }
    loadData();
  }, [products]);

  // Combined seller items
  const matchedFromGrid = products.filter(
    (p) =>
      (currentUser?._id && (p.createdBy?._id === currentUser._id || p.createdBy === currentUser._id)) ||
      (currentUser?.email && p.createdBy?.email === currentUser.email) ||
      (currentUser?.shopName && p.createdBy?.shopName === currentUser.shopName)
  );

  const sellerProducts = liveSellerProducts.length > 0 ? liveSellerProducts : matchedFromGrid;

  const totalValue = sellerProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
  const totalInquiries = sellerProducts.reduce(
    (sum, p) => sum + (p.commentsCount || p.sampleComments?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-neutral-200 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Marketplace</span>
          </button>

          <div className="h-4 w-px bg-neutral-200" />

          <div>
            <h1 className="font-extrabold text-base tracking-tight text-black">
              Seller Dashboard
            </h1>
            <p className="text-[11px] text-neutral-400">
              {currentUser?.shopName || "Campus Dorm Store"} • {currentUser?.location}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={15} />
          <span>New Listing</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 space-y-10">
        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Active Listings
            </span>
            <span className="text-3xl font-extrabold text-black">
              {sellerProducts.length}
            </span>
            <span className="text-xs text-neutral-500 block mt-1">
              Available to hostel buyers
            </span>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Inventory Value
            </span>
            <span className="text-3xl font-extrabold text-black">
              ₹{totalValue.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 block mt-1">
              Total listing worth
            </span>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Buyer Inquiries
            </span>
            <span className="text-3xl font-extrabold text-black">
              {totalInquiries}
            </span>
            <span className="text-xs text-neutral-500 block mt-1">
              Questions from students
            </span>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h2 className="text-lg font-bold text-black tracking-tight">
              Your Listings ({sellerProducts.length})
            </h2>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="border border-dashed border-neutral-300 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <Package size={22} />
              </div>
              <h3 className="font-bold text-sm text-black mb-1">No listings published yet</h3>
              <p className="text-xs text-neutral-500 mb-5">
                List unused hostel electronics, books, furniture, or cycles to sell directly to campus peers.
              </p>
              <button
                onClick={onOpenCreate}
                className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all"
              >
                Publish Your First Pin
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="border border-neutral-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-black transition-colors bg-white"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={prod.productImages?.[0]}
                      alt={prod.name}
                      className="w-14 h-14 rounded-lg object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-black truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span className="capitalize">{prod.category}</span>
                        <span>•</span>
                        <span>{prod.location}</span>
                        <span>•</span>
                        <span>{prod.condition}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-black">
                        ₹{prod.price?.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {prod.quantity || 1}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteProduct(prod._id)}
                      className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
