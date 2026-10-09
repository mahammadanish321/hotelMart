import { X, Store, ArrowRight } from "lucide-react";

export default function BecomeSellerPromptModal({ isOpen, onClose, onRegisterSeller }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-neutral-200 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
        >
          <X size={15} />
        </button>

        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
          <Store size={22} />
        </div>

        <h3 className="font-extrabold text-base text-black tracking-tight mb-1.5">
          Campus Seller Required
        </h3>

        <p className="text-xs text-neutral-600 leading-relaxed mb-6">
          Only registered sellers can publish pins to HostelMart. Register your campus dorm store to start selling unused gear directly to batchmates.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onRegisterSeller();
            }}
            className="w-full bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Register as Seller</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={onClose}
            className="w-full text-xs text-neutral-500 hover:text-black py-2 font-medium transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
