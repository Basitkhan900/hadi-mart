"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { Star, ShoppingBag, Heart, Share2, ArrowLeft, ChevronRight, Check, Truck, RefreshCw, Shield, ChevronLeft } from "lucide-react";
import { useCart, useCatalog, useWishlist } from "@/lib/store";
import { categories } from "@/lib/db";
import { pkr, type Review } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface Props {
  params: { slug: string };
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "fill-amber-sale text-amber-sale" : "fill-ink/10 text-ink/10"}
        />
      ))}
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  const router = useRouter();
  const products = useCatalog((s) => s.products);
  const p = products.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Approved reviews from backend
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 3;

  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const liked = ids.includes(p.id);

  const category = categories.find((c) => c.id === p.categoryId);
  const related = products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4);

  // Fetch approved reviews for this product
  const loadProductReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/reviews?productId=${p.id}&status=approved`);
      if (res.ok) {
        const data = await res.json();
        setApprovedReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadProductReviews();
  }, [p.id]);

  const discount = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
  const unitPrice = p.salePrice ?? p.price;
  const totalPrice = unitPrice * qty;
  const totalOriginalPrice = p.price * qty;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) add(p.id);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleReviewSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reviewText.trim() || !reviewName.trim() || submittingReview) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          productName: p.name,
          author: reviewName.trim(),
          rating: reviewRating,
          body: reviewText.trim(),
        }),
      });

      if (res.ok) {
        setReviewText("");
        setReviewName("");
        setReviewRating(5);
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 5000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* Top Navigation & Back Button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 hover:text-[#2A4434] hover:border-[#2A4434] dark:border-stone-800 dark:bg-[#152019] dark:text-stone-300 dark:hover:text-white cursor-pointer active:scale-95"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm text-stone-500 overflow-x-auto whitespace-nowrap max-w-[60vw] sm:max-w-none">
          <Link href="/" className="hover:text-stone-900 dark:hover:text-white shrink-0">Home</Link>
          <ChevronRight size={12} className="text-stone-400 shrink-0" />
          <Link href="/shop" className="hover:text-stone-900 dark:hover:text-white shrink-0">Shop</Link>
          {category && (
            <>
              <ChevronRight size={12} className="text-stone-400 shrink-0" />
              <Link href={`/shop?cat=${category.slug}`} className="hover:text-stone-900 dark:hover:text-white shrink-0">{category.name}</Link>
            </>
          )}
          <ChevronRight size={12} className="text-stone-400 shrink-0" />
          <span className="truncate max-w-[100px] sm:max-w-xs font-medium text-stone-800 dark:text-stone-200">{p.name}</span>
        </nav>
      </div>

      {/* ── Product detail ── */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* ── Left: Images ── */}
        <div className="space-y-3">
          {/* Main image: fixed compact height on mobile, portrait aspect on md+ */}
          <div className="relative h-60 sm:h-auto sm:aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-ink/5">
            <img src={p.images[img]} alt={p.name} className="h-full w-full object-cover object-center" />
            {p.salePrice && (
              <span className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full bg-amber-sale px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-bold text-ink">
                -{discount}% OFF
              </span>
            )}
            {p.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded-full bg-white px-6 py-3 font-bold text-sm">Sold Out</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
            {p.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                className={`relative h-16 w-14 sm:h-20 sm:w-16 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl transition ${img === i ? "ring-2 ring-emerald ring-offset-2" : "opacity-60 hover:opacity-100"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Info ── */}
        <div className="space-y-5">
          {/* Brand & Name */}
          <div>
            <p className="text-sm font-semibold text-emerald">{p.brand}</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">{p.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <StarRating rating={p.rating} />
            <span className="text-sm font-semibold">{p.rating}</span>
            <span className="text-sm text-ink/50">({p.reviewCount + approvedReviews.length} reviews)</span>
            <span className="hidden sm:inline text-sm text-ink/30">·</span>
            <span className="text-sm text-ink/50">{p.sold} sold</span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-emerald">
                {pkr(totalPrice)}
              </span>
              {p.salePrice && (
                <span className="text-lg sm:text-xl text-ink/40 line-through">{pkr(totalOriginalPrice)}</span>
              )}
            </div>
            {qty > 1 && (
              <p className="text-xs text-stone-500 font-medium">
                {pkr(unitPrice)} each × {qty} items
              </p>
            )}
          </div>

          {/* Description */}
          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/80 dark:bg-stone-900/50 dark:border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A4434] dark:text-[#A4B896] mb-1.5">Overview</h4>
            <p className="leading-relaxed text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line">{p.description}</p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {p.stock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald" />
                <span className="text-emerald font-medium">In stock</span>
                {p.stock <= 10 && <span className="text-ink/50">— only {p.stock} left</span>}
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-500 font-medium">Out of stock</span>
              </>
            )}
          </div>

          {/* ── Qty + Add to Cart (full row) ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Qty control */}
            <div className="flex items-center rounded-full border shrink-0">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 sm:px-4 py-2.5 sm:py-3 text-lg leading-none hover:bg-ink/5">−</button>
              <span className="w-8 sm:w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="px-3 sm:px-4 py-2.5 sm:py-3 text-lg leading-none hover:bg-ink/5">+</button>
            </div>

            {/* Add to cart */}
            <button
              disabled={p.stock === 0}
              onClick={handleAddToCart}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition
                ${addedFeedback ? "bg-emerald" : "bg-ink hover:bg-ink/80 dark:bg-white dark:text-ink"}
                disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {addedFeedback ? (
                <><Check size={16} /><span className="truncate">Added {qty > 1 ? `(${qty})` : ""} to Bag!</span></>
              ) : (
                <><ShoppingBag size={16} /><span className="truncate">Add to Bag · {pkr(totalPrice)}</span></>
              )}
            </button>
          </div>

          {/* ── Wishlist + Share ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => toggle(p.id)}
              aria-label={liked ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold transition
                ${liked ? "border-red-300 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" : "hover:bg-ink/5 text-ink/70"}`}
            >
              <Heart size={18} className={liked ? "fill-red-500 text-red-500" : ""} />
              <span>{liked ? "Wishlisted" : "Wishlist"}</span>
            </button>

            {/* Share */}
            <button
              aria-label="Share"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold text-ink/70 transition hover:bg-ink/5"
              onClick={() => navigator.share?.({ title: p.name, url: window.location.href })}
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>

          {/* Perks */}
          <div className="space-y-2.5 rounded-2xl sm:rounded-3xl border p-4 sm:p-5">
            {[
              { icon: <Truck size={15} />, text: "Free delivery on orders over Rs. 3,000" },
              { icon: <RefreshCw size={15} />, text: "Easy 7-day returns" },
              { icon: <Shield size={15} />, text: "Secure payment — JazzCash, Easypaisa, Card, COD" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 text-xs sm:text-sm text-ink/60">
                <span className="text-emerald mt-0.5 shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Details & Specs Section ── */}
      <section className="mt-10 sm:mt-16 rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white p-4 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
        <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#1E3926] dark:text-[#E2EFE7] mb-4 sm:mb-6 flex items-center gap-2">
          <span>🌿</span> Product Details &amp; Specifications
        </h2>

        {/* Stack on mobile, side-by-side on large */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">

          {/* Description — takes 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-3 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">About this item</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line break-words">
              {p.description}
            </p>
          </div>

          {/* Quick Specs card */}
          <div className="w-full min-w-0 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 border border-stone-200/60 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-xs mb-3">Quick Specs</h4>
            <dl className="space-y-0 divide-y divide-stone-200/60 dark:divide-stone-800 text-xs sm:text-sm">
              {[
                { label: "Brand",    value: p.brand },
                { label: "Category", value: category?.name || "General" },
                { label: "Stock",    value: p.stock > 0 ? `${p.stock} In Stock` : "Out of Stock",
                  valueClass: "font-semibold text-emerald-700 dark:text-emerald-400" },
                { label: "SKU",      value: p.id, valueClass: "font-mono text-[11px] text-stone-600 dark:text-stone-400 break-all" },
              ].map(({ label, value, valueClass }) => (
                <div key={label} className="flex items-start justify-between gap-3 py-2">
                  <dt className="shrink-0 text-stone-500">{label}</dt>
                  <dd className={`text-right min-w-0 ${valueClass ?? "font-semibold text-stone-800 dark:text-stone-200"}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="mt-12 sm:mt-20">
        <div className="mb-5 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold">Customer Reviews ({approvedReviews.length})</h2>
          <span className="text-xs text-stone-500 font-medium">All reviews are verified before publishing</span>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {/* Review list */}
          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="rounded-3xl border p-6 text-sm text-ink/50">Loading verified reviews…</p>
            ) : approvedReviews.length === 0 ? (
              <div className="rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-6 text-center text-sm text-ink/50">
                <p className="font-semibold text-stone-700 dark:text-stone-300">No approved reviews yet.</p>
                <p className="text-xs text-stone-400 mt-1">Be the first to share your experience with this product!</p>
              </div>
            ) : (
              <>
                {approvedReviews
                  .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
                  .map((r) => (
                    <div key={r.id} className="rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 bg-white dark:bg-[#141E18]">
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{r.author}</p>
                          <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            Verified
                          </span>
                        </div>
                        <div className="shrink-0">
                          <StarRating rating={r.rating} size={13} />
                        </div>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">{r.body}</p>
                      <p className="mt-2 text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
                    </div>
                  ))}

                {/* Pagination Controls */}
                {Math.ceil(approvedReviews.length / REVIEWS_PER_PAGE) > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={reviewPage === 1}
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <span className="text-xs font-medium text-stone-500">
                      Page {reviewPage} of {Math.ceil(approvedReviews.length / REVIEWS_PER_PAGE)}
                    </span>
                    <button
                      type="button"
                      disabled={reviewPage >= Math.ceil(approvedReviews.length / REVIEWS_PER_PAGE)}
                      onClick={() => setReviewPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Write review */}
          <div className="rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 bg-white dark:bg-[#141E18]">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">Write a Review</h3>
            <p className="text-xs text-stone-500">
              Your review will be sent to the admin for approval before going live on the site.
            </p>
            <input
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Your name *"
              className="input"
            />
            {/* Star picker */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Your Rating:</label>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setReviewRating(i + 1)} className="hover:scale-110 transition">
                    <Star size={22} className={i < reviewRating ? "fill-amber-sale text-amber-sale" : "fill-ink/10 text-ink/10"} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product… *"
              rows={4}
              className="input resize-none"
            />
            {reviewSubmitted ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Check size={16} /> Review Submitted Successfully!
                </p>
                <p>
                  Aapka review Admin Dashboard bhej diya gaya hai. Admin ki taraf se Approve hoty hi ye yahan aur Home page par show hojaye ga.
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={submittingReview || !reviewName.trim() || !reviewText.trim()}
                onClick={handleReviewSubmit}
                className="btn-emerald w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? "Submitting for Approval…" : "Submit Review for Approval"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-20">
          <h2 className="mb-4 sm:mb-6 font-display text-xl sm:text-2xl font-extrabold">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10 sm:mt-12">
        <Link href="/shop" className="flex items-center gap-2 text-sm text-ink/50 hover:text-ink">
          <ArrowLeft size={15} /> Back to Shop
        </Link>
      </div>
    </div>
  );
}

