import { 
  Home, 
  Zap, 
  Plus, 
  ShoppingBag,
  LayoutDashboard
} from "lucide-react";

export default function Sidebar({ 
  activeTab = "home", 
  setActiveTab,
  onOpenCreate,
  onOpenQuick,
  onOpenSellerDashboard,
  currentUser,
  cartCount = 0
}) {
  const isSeller = currentUser?.role === "seller";

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-20 bg-white border-r border-neutral-200 flex flex-col items-center py-6 z-40 select-none">
      {/* Brand Logo - Solid Black Circle */}
      <div 
        onClick={() => setActiveTab("home")}
        className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white cursor-pointer hover:opacity-85 transition-opacity"
        title="HostelMart"
      >
        <span className="font-bold text-lg tracking-tight">H</span>
      </div>

      {/* Nav Actions - Clean Minimalist */}
      <nav className="flex-1 flex flex-col items-center gap-3 mt-8">
        {/* Home */}
        <button
          onClick={() => setActiveTab("home")}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === "home"
              ? "bg-black text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
          }`}
          title="Home"
        >
          <Home size={18} strokeWidth={activeTab === "home" ? 2.5 : 2} />
        </button>

        {/* Quick */}
        <button
          onClick={onOpenQuick}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === "quick"
              ? "bg-black text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
          }`}
          title="Quick Feed"
        >
          <Zap size={18} strokeWidth={activeTab === "quick" ? 2.5 : 2} />
        </button>

        {/* Seller Dashboard (Only for Seller Role) */}
        {isSeller && (
          <button
            onClick={onOpenSellerDashboard}
            className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === "seller-dashboard"
                ? "bg-black text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
            }`}
            title="Seller Dashboard"
          >
            <LayoutDashboard size={18} />
          </button>
        )}

        {/* List Item (+) */}
        <button
          onClick={onOpenCreate}
          className="group relative w-10 h-10 rounded-xl border border-neutral-300 text-black hover:bg-black hover:text-white flex items-center justify-center transition-all"
          title={isSeller ? "List Item" : "Become a Seller to List"}
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>
      </nav>

      {/* Bottom Cart Button - Solid Black & White */}
      <div className="mt-auto">
        <button
          onClick={() => setActiveTab("cart")}
          className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === "cart"
              ? "bg-black text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
          }`}
          title="Cart"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
