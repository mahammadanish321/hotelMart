import { useState, useEffect } from "react";
import AuthPage from "./components/Auth/AuthPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MasonryGrid from "./components/PinterestGrid/MasonryGrid";
import QuickView from "./components/Quick/QuickView";
import CreateProductModal from "./components/CreateProductModal";
import BecomeSellerPromptModal from "./components/Seller/BecomeSellerPromptModal";
import SellerDashboard from "./components/Seller/SellerDashboard";
import CartDrawer from "./components/CartDrawer";
import Toast from "./components/Toast";
import {
  getProducts,
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  placeOrder,
  deleteProduct as apiDeleteProduct,
  logoutUser
} from "./services/api";

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "quick" || params.get("product")) return "quick";
    } catch {
      // ignore
    }
    return "pinterest";
  }); // 'pinterest' | 'quick' | 'auth' | 'seller-dashboard'
  const [authInitialMode, setAuthInitialMode] = useState("login"); // 'login' | 'buyer-register' | 'seller-register'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("product") || null;
    } catch {
      return null;
    }
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("hostelmart_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User engagement state (Live connected)
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBecomeSellerPromptOpen, setIsBecomeSellerPromptOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch live products from backend
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      const data = await getProducts({
        category: selectedCategory,
        search: searchTerm
      });
      if (!isCancelled) {
        setProducts(data);
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchTerm]);

  // Load User's Cart & Wishlist from Backend when authenticated
  useEffect(() => {
    if (!currentUser) return;

    let isSubscribed = true;
    async function loadUserData() {
      try {
        const [serverCart, serverWishlist] = await Promise.all([
          getCart(),
          getWishlist()
        ]);

        if (!isSubscribed) return;

        if (Array.isArray(serverCart) && serverCart.length > 0) {
          setCartItems(
            serverCart
              .filter((item) => item?.product)
              .map((item) => ({
                ...item.product,
                cartQty: item.quantity
              }))
          );
        }

        if (Array.isArray(serverWishlist) && serverWishlist.length > 0) {
          setSavedIds(new Set(serverWishlist.map((p) => p._id || p)));
        }
      } catch {
        // ignore errors
      }
    }

    loadUserData();
    return () => {
      isSubscribed = false;
    };
  }, [currentUser]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("hostelmart_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    if (user.role === "seller") {
      setViewMode("seller-dashboard");
      showToast(`Welcome ${user.shopName || user.fullName}! Store dashboard ready.`);
    } else {
      setViewMode("pinterest");
      showToast(`Welcome back, ${user.fullName}`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCartItems([]);
    setSavedIds(new Set());
    setViewMode("pinterest");
    showToast("Logged out successfully");
  };

  // Open Auth with specific tab
  const handleOpenAuth = (mode = "login") => {
    setAuthInitialMode(mode);
    setViewMode("auth");
  };

  // Listing creation trigger with role check
  const handleRequestCreateListing = () => {
    if (!currentUser) {
      handleOpenAuth("seller-register");
      return;
    }
    if (currentUser.role === "seller") {
      setIsCreateOpen(true);
    } else {
      setIsBecomeSellerPromptOpen(true);
    }
  };

  // Handle Save (Wishlist) with live backend sync
  const handleToggleSave = async (productId) => {
    const isCurrentlySaved = savedIds.has(productId);

    // Optimistic UI update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(productId);
      else next.add(productId);
      return next;
    });

    showToast(isCurrentlySaved ? "Removed from saved items" : "Saved to your board");

    if (currentUser) {
      try {
        if (isCurrentlySaved) {
          await removeFromWishlist(productId);
        } else {
          await addToWishlist(productId);
        }
      } catch {
        // ignore
      }
    }
  };

  // Handle Share
  const handleShare = (product) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}?product=${product._id}`);
      showToast("Link copied to clipboard");
    } else {
      showToast("Link ready to share");
    }
  };

  // Handle Add to Cart with live backend sync
  const handleAddToCart = async (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, cartQty: (item.cartQty || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
    showToast(`Added "${product.name?.slice(0, 20)}..." to cart`);

    if (currentUser) {
      try {
        await apiAddToCart(product._id, 1);
      } catch {
        // ignore
      }
    }
  };

  // Handle Direct Buy
  const handleDirectBuy = (product) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  // Remove from Cart with live backend sync
  const handleRemoveFromCart = async (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    showToast("Item removed from cart");

    if (currentUser) {
      try {
        await apiRemoveFromCart(productId);
      } catch {
        // ignore
      }
    }
  };

  // Handle Checkout / Place Order with live backend sync
  const handleCheckoutSuccess = async () => {
    if (currentUser) {
      try {
        const res = await placeOrder();
        if (res.success) {
          showToast("Order placed & stock reserved successfully");
          setCartItems([]);
          return;
        }
      } catch {
        // fallback
      }
    }
    setCartItems([]);
    showToast("Reservation request sent to campus seller");
  };

  // Show Toast Helper
  const showToast = (message) => {
    setToast({ id: Date.now(), message });
  };

  // Transition to Quick details mode for a specific product
  const handleSelectProduct = (product) => {
    setSelectedProductId(product._id);
    setViewMode("quick");
  };

  // Open Quick mode
  const handleLaunchQuick = () => {
    if (products.length > 0) {
      setSelectedProductId(products[0]._id);
      setViewMode("quick");
    } else {
      showToast("No listings currently available in the feed");
    }
  };

  // Add newly created product
  const handleAddNewProduct = (newProd) => {
    setProducts((prev) => [newProd, ...prev]);
    showToast("Listing published successfully to campus feed!");
  };

  // Delete product (seller action)
  const handleDeleteProduct = async (productId) => {
    try {
      await apiDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showToast("Listing removed successfully");
    } catch {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showToast("Listing removed");
    }
  };

  // 1. AUTHENTICATION (LOGIN / BUYER REGISTER / SELLER REGISTER) VIEW
  if (viewMode === "auth") {
    return (
      <>
        <AuthPage
          initialMode={authInitialMode}
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setViewMode("pinterest")}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // 2. SELLER DASHBOARD VIEW
  if (viewMode === "seller-dashboard") {
    return (
      <>
        <SellerDashboard
          currentUser={currentUser}
          products={products}
          onBackToMarketplace={() => setViewMode("pinterest")}
          onOpenCreate={handleRequestCreateListing}
          onDeleteProduct={handleDeleteProduct}
        />

        <CreateProductModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onAddProduct={handleAddNewProduct}
          currentUser={currentUser}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // 3. QUICK VIEW (40% Left Scroll / 60% Right Details)
  if (viewMode === "quick") {
    return (
      <div className="w-full h-full bg-white">
        <QuickView
          products={products}
          initialProductId={selectedProductId}
          onBackToGrid={() => setViewMode("pinterest")}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
          onAddToCart={handleAddToCart}
          onDirectBuy={handleDirectBuy}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.length}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={() => setCartItems([])}
          onCheckoutSuccess={handleCheckoutSuccess}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // 4. MARKETPLACE (PINTEREST MASONRY GRID) DEFAULT PUBLIC VIEW
  return (
    <div className="min-h-screen bg-white flex text-black font-sans">
      {/* Left Sidebar Rail */}
      <Sidebar
        activeTab="home"
        setActiveTab={(tab) => {
          if (tab === "cart") setIsCartOpen(true);
          if (tab === "home") setViewMode("pinterest");
        }}
        onOpenQuick={handleLaunchQuick}
        onOpenSellerDashboard={() => setViewMode("seller-dashboard")}
        onOpenCreate={handleRequestCreateListing}
        currentUser={currentUser}
        cartCount={cartItems.length}
      />

      {/* Main Pinterest Feed Content */}
      <div className="flex-1 ml-16 md:ml-20 flex flex-col min-h-screen min-w-0">
        {/* Top Header & Search Bar */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onLaunchQuick={handleLaunchQuick}
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuth("login")}
          onLogout={handleLogout}
          onOpenSellerDashboard={() => setViewMode("seller-dashboard")}
          onOpenSellerRegister={() => handleOpenAuth("seller-register")}
        />

        {/* Masonry Grid - Public View */}
        <main className="flex-1">
          <MasonryGrid
            products={products}
            savedIds={savedIds}
            onSelectProduct={handleSelectProduct}
            onToggleSave={handleToggleSave}
            onShare={handleShare}
            loading={loading}
            onClearFilters={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          />
        </main>
      </div>

      {/* Modal: List an Item (Seller Only) */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAddProduct={handleAddNewProduct}
        currentUser={currentUser}
      />

      {/* Modal: Buyer prompt to become a seller */}
      <BecomeSellerPromptModal
        isOpen={isBecomeSellerPromptOpen}
        onClose={() => setIsBecomeSellerPromptOpen(false)}
        onRegisterSeller={() => handleOpenAuth("seller-register")}
      />

      {/* Drawer: Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
        onCheckoutSuccess={() => showToast("Reservation request sent")}
      />

      {/* Action Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
