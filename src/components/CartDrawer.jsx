import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveFromCart,
  onClearCart,
  onCheckoutSuccess
}) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.cartQty || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h3 className="font-bold text-black text-base">Cart</h3>
            <span className="text-xs bg-neutral-100 font-semibold px-2 py-0.5 rounded-full text-black">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-semibold text-black text-sm">Your cart is empty</p>
              <p className="text-xs text-neutral-400 mt-1">
                Explore items in the feed or Quick view.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200"
              >
                <img
                  src={item.productImages?.[0]}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-black truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {item.location}
                  </p>
                  <p className="font-bold text-xs text-black mt-1">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveFromCart(item._id)}
                  className="w-7 h-7 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-white space-y-4">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-black">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-black pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onCheckoutSuccess();
                onClearCart();
                onClose();
              }}
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Reserve Items</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
