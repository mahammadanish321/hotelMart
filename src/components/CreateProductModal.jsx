import { useState, useRef } from "react";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { CATEGORIES } from "../data/mockProducts";
import { createProduct } from "../services/api";

export default function CreateProductModal({ isOpen, onClose, onAddProduct, currentUser }) {
  const [listingType, setListingType] = useState("sell"); // 'sell' | 'rent'
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState("Brand New");
  const [location, setLocation] = useState(currentUser?.location || "Hostel 3 • Room 204");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");

  // Local File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [fallbackImageUrl, setFallbackImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  if (!isOpen) return null;

  const handleListingTypeChange = (type) => {
    setListingType(type);
    if (type === "rent") {
      setCategory("housing");
      setCondition("For Rent");
    } else {
      setCategory("electronics");
      setCondition("Brand New");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      setErrorMessage("Please select image files in the photo field.");
    }
    const combinedFiles = [...selectedFiles, ...validFiles].slice(0, 8);
    setSelectedFiles(combinedFiles);

    // Regenerate local photo previews
    filePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const previews = combinedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(previews);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(filePreviews[index]);
    const nextFiles = selectedFiles.filter((_, i) => i !== index);
    const nextPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(nextFiles);
    setFilePreviews(nextPreviews);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrorMessage("Please select a video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("Video file must be 100 MB or smaller.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const metadataUrl = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(metadataUrl);
      if (!Number.isFinite(videoElement.duration) || videoElement.duration > 120) {
        URL.revokeObjectURL(previewUrl);
        setErrorMessage("Product video must be 2 minutes or shorter.");
        return;
      }
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setSelectedVideo(file);
      setVideoPreview(previewUrl);
      setErrorMessage("");
    };
    videoElement.onerror = () => {
      URL.revokeObjectURL(metadataUrl);
      URL.revokeObjectURL(previewUrl);
      setErrorMessage("Could not read this video file. Please choose another video.");
    };
    videoElement.src = metadataUrl;
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter a title or name for the listing.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }
    if (selectedFiles.length === 0 && !selectedVideo && !fallbackImageUrl.trim()) {
      setErrorMessage("Please upload at least one product image or a short video.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      if (originalPrice) formData.append("originalPrice", originalPrice);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("listingType", listingType);
      formData.append("quantity", quantity || "1");
      formData.append("location", location.trim() || currentUser?.location || "Campus");
      formData.append("description", description.trim());

      // Append local image files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("productImages", file);
        });
      } else if (fallbackImageUrl.trim()) {
        // If user provided a web URL instead of files, fetch as blob or send
        try {
          const res = await fetch(fallbackImageUrl.trim());
          const blob = await res.blob();
          const file = new File([blob], "listing_image.jpg", { type: blob.type || "image/jpeg" });
          formData.append("productImages", file);
        } catch {
          setErrorMessage("Failed to load image from the provided URL. Please upload a local file directly.");
          setLoading(false);
          return;
        }
      }
      if (selectedVideo) formData.append("productVideo", selectedVideo);

      const res = await createProduct(formData);

      if (res.success && res.data) {
        onAddProduct(res.data);
        onClose();
        // Reset form
        setName("");
        setPrice("");
        setOriginalPrice("");
        setDescription("");
        setSelectedFiles([]);
        setSelectedVideo(null);
        setFilePreviews([]);
        filePreviews.forEach((preview) => URL.revokeObjectURL(preview));
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview("");
        setFallbackImageUrl("");
      } else {
        setErrorMessage(res.message || "Failed to publish listing. Please try again.");
      }
    } catch (err) {
      setErrorMessage(err?.message || "An unexpected error occurred while listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center">
              <Plus size={16} />
            </div>
            <h3 className="font-bold text-black text-sm uppercase tracking-wide">
              {listingType === "rent" ? "List Property / Rental" : "List Product / Item"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Listing Type Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-100">
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleListingTypeChange("sell")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${listingType === "sell"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-500 hover:text-black"
                }`}
            >
              Sell Product (New / Secondhand)
            </button>
            <button
              type="button"
              onClick={() => handleListingTypeChange("rent")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${listingType === "rent"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-500 hover:text-black"
                }`}
            >
              Rent (Room / Mess / Hotel)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Local File Uploader */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Product Photos (up to 8) and Optional Short Video
            </label>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />

            {/* Drag & Drop / Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-200 hover:border-black rounded-xl p-5 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100/50"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-2 text-neutral-700">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-black">
                Click to browse photos from your device
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                JPG, PNG, WEBP — up to 8 photos; optional video up to 2 minutes / 100 MB
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold hover:border-black"
              >
                {selectedVideo ? "Replace video" : "Add short video"}
              </button>
              <span className="text-[11px] text-neutral-400">Optional · max 2 minutes</span>
            </div>

            {videoPreview && (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-black">
                <video src={videoPreview} controls playsInline className="max-h-56 w-full" />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white"
                  aria-label="Remove video"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Thumbnail Previews */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {filePreviews.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Fallback Image URL */}
            {filePreviews.length === 0 && (
              <div className="mt-2.5">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                  Or enter image URL:
                </span>
                <input
                  type="url"
                  value={fallbackImageUrl}
                  onChange={(e) => setFallbackImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              {listingType === "rent" ? "Property / Accommodation Title *" : "Product Title *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                listingType === "rent"
                  ? "e.g. 2 BHK Flat near Campus, Single AC Hostel Room, Daily PG Bed"
                  : "e.g. Hero Sprint 21-Speed Cycle, Dell IPS Monitor, Brand New Kettle"
              }
              className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
            />
          </div>

          {/* Pricing & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                {listingType === "rent" ? "Rent (₹ / month) *" : "Price (₹) *"}
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={listingType === "rent" ? "4500" : "750"}
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                {listingType === "rent" ? "Deposit / Original (₹)" : "Original MRP (₹)"}
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="1500"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              >
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                {listingType === "rent" ? "Rent Type / Lease" : "Condition"}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              >
                {listingType === "rent" ? (
                  <>
                    <option value="For Rent">Monthly Rental</option>
                    <option value="For Rent">Semester / Academic Term</option>
                    <option value="For Rent">Daily / Temporary Stay</option>
                  </>
                ) : (
                  <>
                    <option value="Brand New">Brand New (Unopened / Tagged)</option>
                    <option value="Like New">Like New (Mint Condition)</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Good Condition">Good Condition</option>
                    <option value="Used">Used</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Location & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Location / Campus Block *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hostel 4 • Room 312, North Campus Gate"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                {listingType === "rent" ? "Available Units" : "Quantity"}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Description / Terms
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                listingType === "rent"
                  ? "Describe amenities: Wi-Fi, electricity bill included, attached washroom, meal timings, hostel rules..."
                  : "Detail item features, condition, reason for selling, included accessories..."
              }
              className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-xs outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
            >
              {loading ? "Uploading & Publishing Listing..." : listingType === "rent" ? "Publish Rental Listing" : "Publish Product Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

