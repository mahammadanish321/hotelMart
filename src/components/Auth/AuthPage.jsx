import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loginUser, registerBuyer, registerSeller } from "../../services/api";

export default function AuthPage({ onAuthSuccess, onBack, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'buyer-register' | 'seller-register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("Hostel 3 • Room 204");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (mode === "login") {
      if (!email.trim() || !password) {
        setErrorMsg("Please fill in email and password");
        setLoading(false);
        return;
      }
      const res = await loginUser({ email: email.trim(), password });
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || "Invalid credentials");
      }
    } else if (mode === "buyer-register") {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMsg("Please fill in all required fields");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const res = await registerBuyer({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        location: location.trim()
      });
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || "Registration failed");
      }
    } else if (mode === "seller-register") {
      if (!fullName.trim() || !shopName.trim() || !email.trim() || !password) {
        setErrorMsg("Please fill in shop name and all required fields");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const res = await registerSeller({
        fullName: fullName.trim(),
        shopName: shopName.trim(),
        email: email.trim(),
        password,
        location: location.trim()
      });
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || "Seller registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Bar with Back Button */}
      <header className="h-14 border-b border-neutral-200 px-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
            H
          </div>
          <span className="font-extrabold text-sm tracking-tight">HostelMart</span>
        </div>

        <div className="w-16" />
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-neutral-200 rounded-2xl p-7 bg-white shadow-xs">
          {/* Header Mode Tabs */}
          <div className="grid grid-cols-3 border-b border-neutral-200 mb-6 text-center">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                mode === "login"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("buyer-register");
                setErrorMsg("");
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                mode === "buyer-register"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Join as Buyer
            </button>
            <button
              onClick={() => {
                setMode("seller-register");
                setErrorMsg("");
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                mode === "seller-register"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Join as Seller
            </button>
          </div>

          {/* Subtitle description */}
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-black">
              {mode === "login"
                ? "Welcome back to HostelMart"
                : mode === "buyer-register"
                ? "Create Student Buyer Account"
                : "Open Campus Seller Store"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {mode === "login"
                ? "Sign in to access your inquiries and saved pins"
                : mode === "buyer-register"
                ? "Browse verified listings and buy directly from batchmates"
                : "List electronics, cycles, books, and dorm items"}
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name for both registers */}
            {mode !== "login" && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Verma"
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-xl px-3 py-2 text-xs outline-none transition-all"
                />
              </div>
            )}

            {/* Shop Name only for seller register */}
            {mode === "seller-register" && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Campus Shop / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Rohan's Tech Shed, Dorm 4 Books"
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-xl px-3 py-2 text-xs outline-none transition-all"
                />
              </div>
            )}

            {/* College Email */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                College Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.edu"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-xl px-3 py-2 text-xs outline-none transition-all"
              />
            </div>

            {/* Hostel Location for both registers */}
            {mode !== "login" && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  {mode === "seller-register" ? "Pickup Hostel & Room *" : "Hostel & Room *"}
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hostel 4 • Room 312"
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-xl px-3 py-2 text-xs outline-none transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-black border border-neutral-200 focus:border-black rounded-xl px-3 py-2 text-xs outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-2"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : mode === "buyer-register"
                ? "Create Buyer Account"
                : "Register Seller Store"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
