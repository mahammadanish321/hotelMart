import { useEffect } from "react";
import { X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl border border-neutral-700 animate-in slide-in-from-bottom duration-200">
      <p className="text-xs font-medium tracking-wide">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-white transition-colors ml-1"
      >
        <X size={13} />
      </button>
    </div>
  );
}
