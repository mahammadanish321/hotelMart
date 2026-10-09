import { useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";

export default function CommentDrawer({
  isOpen,
  onClose,
  product,
  onAddComment
}) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(product?.sampleComments || []);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      user: "You (Hostel Resident)",
      text: commentInput.trim(),
      time: "Just now"
    };

    setComments([newComment, ...comments]);
    setCommentInput("");
    if (onAddComment) onAddComment(product._id, newComment);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#e60023]" />
            <h3 className="font-bold text-gray-900 text-base">Hostel Inquiries & Comments</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product mini header */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <img
            src={product.productImages?.[0]}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs font-bold text-[#e60023]">₹{product.price}</p>
            <p className="text-[11px] text-gray-500">Seller: {product.createdBy?.fullName} ({product.location})</p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No inquiries yet. Be the first student to ask about this item!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {comment.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-xs">{comment.user}</span>
                    <span className="text-[11px] text-gray-400">{comment.time}</span>
                  </div>
                  <p className="text-gray-700 text-xs mt-1 leading-relaxed bg-gray-50 p-2.5 rounded-2xl rounded-tl-none border border-gray-100">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Ask seller about price, inspection, delivery..."
              className="flex-1 bg-gray-100 hover:bg-gray-150 focus:bg-white text-gray-900 placeholder-gray-400 rounded-full px-4 py-2.5 text-xs outline-none border border-transparent focus:border-gray-300 transition-all"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="w-9 h-9 rounded-full bg-[#e60023] hover:bg-[#b6001a] disabled:opacity-40 disabled:hover:bg-[#e60023] text-white flex items-center justify-center transition-colors shadow-md"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
