import { useState } from "react";
import { Search, X, LogOut, Store, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "../data/mockProducts";

export default function Header({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onLaunchQuick,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSellerDashboard,
  onOpenSellerRegister
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isSeller = currentUser?.role === "seller";

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 pt-4 pb-3 border-b border-neutral-200">
      {/* Top row: Clean Search and Quick button */}
      <div className="flex items-center gap-3 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Minimal Search Bar */}
        <div className="flex-1 relative flex items-center">
          <div className="absolute left-4 text-neutral-400 pointer-events-none">
            <Search size={16} />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-neutral-100 focus:bg-white text-neutral-900 placeholder-neutral-400 rounded-full pl-10 pr-10 py-2.5 text-sm outline-none border border-transparent focus:border-neutral-300 transition-all"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 text-neutral-400 hover:text-black transition-colors"
              title="Clear"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Quick Mode Button - Solid Black */}
        <button
          onClick={onLaunchQuick}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs"
        >
          <span>Quick</span>
        </button>

        {/* Auth / Profile Area */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-85 transition-opacity"
              title={currentUser.fullName}
            >
              {currentUser.fullName?.charAt(0).toUpperCase() || "U"}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-11 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 min-w-48 z-50 text-xs">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <p className="font-bold text-black truncate">{currentUser.fullName}</p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {isSeller ? `Seller: ${currentUser.shopName || "Store"}` : "Student Buyer"}
                  </p>
                </div>

                {isSeller ? (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSellerDashboard();
                    }}
                    className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2 mt-1"
                  >
                    <Store size={13} />
                    <span>Seller Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSellerRegister();
                    }}
                    className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2 mt-1"
                  >
                    <ShoppingBag size={13} />
                    <span>Become a Seller</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-xs font-semibold px-4 py-2.5 rounded-full border border-neutral-300 hover:border-black transition-colors whitespace-nowrap"
          >
            Log In
          </button>
        )}
      </div>

      {/* Category Filter Pills - Clean Text Only */}
      <div className="flex items-center gap-2 px-4 md:px-8 mt-3 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-black hover:text-black"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
