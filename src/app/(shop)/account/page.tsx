"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  ShoppingBag,
  Heart,
  LogOut,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { useAuth, useOrders, useWishlist } from "@/lib/store";
import { motion } from "framer-motion";

export default function AccountProfilePage() {
  const router = useRouter();
  const { name, email, avatar, phone, address, city, role, isLoggedIn, updateProfile, logout } = useAuth();
  const { orders } = useOrders();
  const { ids: wishlistIds } = useWishlist();

  // Local Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate on load
  useEffect(() => {
    setFormData({
      name: name || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
    });
    setCurrentAvatar(avatar || "");
  }, [name, email, avatar, phone, address, city]);

  // Handle Photo Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setCurrentAvatar(localUrl);
    setUploadingAvatar(true);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          setCurrentAvatar(json.url);
          updateProfile({ avatar: json.url });

          // Also persist to /api/users
          if (email) {
            await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name || name,
                email,
                avatar: json.url,
              }),
            });
          }
        }
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        avatar: currentAvatar,
      });

      // Sync with real backend
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          avatar: currentAvatar,
          role: "customer",
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // If not logged in, show prompt
  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#2A4434]/10 dark:bg-[#A4B896]/20 text-[#2A4434] dark:text-[#A4B896] mb-4">
            <User size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
            Please sign in or create an account to view and update your profile, track orders, and manage your wishlist.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="rounded-full bg-[#2A4434] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17]"
            >
              Sign In / Register
            </Link>
            <Link
              href="/"
              className="rounded-full border border-stone-300 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-5xl px-4 py-10 md:px-6 space-y-8"
    >
      {/* ─── Profile Header Banner ─── */}
      <div className="rounded-3xl border border-[#D5E1CD] bg-gradient-to-r from-[#243528] via-[#2F4634] to-[#1E3022] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-[#EAD098] bg-[#1E3022] shadow-md">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl sm:text-3xl font-extrabold uppercase text-[#EAD098]">
                    {name ? name.charAt(0) : "U"}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <RefreshCw size={20} className="animate-spin text-[#EAD098]" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Picture"
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[#EAD098] text-[#1E3022] shadow-md transition hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#EAD098]">
                  {name || "Customer"}
                </h1>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                  role === "admin"
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                    : "bg-[#EAD098]/20 text-[#EAD098] border-[#EAD098]/30"
                }`}>
                  {role === "admin" ? "Store Admin" : "Customer"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-0.5 flex items-center gap-1.5">
                <Mail size={13} className="text-[#EAD098]" /> {email}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-[11px] font-semibold text-[#EAD098] hover:underline"
              >
                Change Profile Photo
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-stone-950 shadow-md hover:bg-amber-300 transition"
              >
                <Shield size={13} /> Open Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-[#EAD098]/10 blur-2xl" />
      </div>

      {/* ─── Navigation Shortcut Pills ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          href="/account/orders"
          className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#141E18] hover:border-[#2A4434] transition shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2A4434]/10 dark:bg-[#A4B896]/20 text-[#2A4434] dark:text-[#A4B896]">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">My Orders</p>
              <p className="text-[11px] text-stone-500">{orders.length} placed</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/wishlist"
          className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#141E18] hover:border-[#2A4434] transition shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Heart size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">My Wishlist</p>
              <p className="text-[11px] text-stone-500">{wishlistIds.length} items</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition" />
        </Link>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-between p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-950 dark:bg-[#132219]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Account Verified</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Hadi Mart Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Form ─── */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
        <div className="border-b border-stone-200 pb-4 mb-6 dark:border-stone-800">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Personal Information &amp; Preferences
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Update your name, contact phone, and default delivery shipping address.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Phone Number (For Delivery Confirmation)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0300 1234567"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                City / Region
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Street Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Default Shipping Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House/Apartment #, Street, Area name..."
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3.5 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white resize-none"
            />
          </div>

          {/* Feedback */}
          {savedSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Check size={16} /> Profile changes saved successfully!
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#2A4434] px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={14} /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

