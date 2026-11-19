'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  ShoppingBag,
  ArrowRight,
  Star,
  Truck,
  RotateCcw,
  Cpu,
  Camera,
  Layers,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Product, ProductVariant } from '../../../lib/types';
import { apiFetch, formatPKR, getWhatsAppOrderUrl } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Review submission state
  const [revName, setRevName] = useState('');
  const [revCity, setRevCity] = useState('Karachi');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);
  const [submittingRev, setSubmittingRev] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/api/v1/products/${slug}`);
        if (res.product) {
          setProduct(res.product);
          setRelated(res.related || []);

          // Set default selected variant
          const variants: ProductVariant[] = res.product.variants || [];
          if (variants.length > 0) {
            const first = variants[0];
            setSelectedStorage(first.storage);
            setSelectedColor(first.color_name);
            setSelectedVariant(first);
            setActiveImage(first.image_url);
          } else {
            setActiveImage(res.product.thumbnail);
          }
        }
      } catch (err) {
        console.error('Error fetching product PDP', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Handle storage or color change
  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    if (!product?.variants) return;

    // Find variant with this storage and current color, or first available
    const match =
      product.variants.find(
        (v) => v.storage === storage && v.color_name === selectedColor
      ) || product.variants.find((v) => v.storage === storage);

    if (match) {
      setSelectedColor(match.color_name);
      setSelectedVariant(match);
      setActiveImage(match.image_url);
    }
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    if (!product?.variants) return;

    const match =
      product.variants.find(
        (v) => v.color_name === colorName && v.storage === selectedStorage
      ) || product.variants.find((v) => v.color_name === colorName);

    if (match) {
      setSelectedStorage(match.storage);
      setSelectedVariant(match);
      setActiveImage(match.image_url);
    }
  };

  // Add to Bag
  const handleAddToBag = () => {
    if (!product || !selectedVariant) return;

    addToCart(
      {
        variant_id: selectedVariant.id,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage: selectedVariant.storage,
        color_name: selectedVariant.color_name,
        color_hex: selectedVariant.color_hex,
        image_url: selectedVariant.image_url,
        price: selectedVariant.price,
        regular_price: selectedVariant.regular_price,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: selectedVariant.stock,
      },
      true
    );
  };

  // Instant Buy Now
  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;

    addToCart(
      {
        variant_id: selectedVariant.id,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage: selectedVariant.storage,
        color_name: selectedVariant.color_name,
        color_hex: selectedVariant.color_hex,
        image_url: selectedVariant.image_url,
        price: selectedVariant.price,
        regular_price: selectedVariant.regular_price,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: selectedVariant.stock,
      },
      false
    );

    router.push('/checkout');
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !revName || !revComment) return;

    setSubmittingRev(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          author_name: revName,
          author_city: revCity,
          rating: revRating,
          comment: revComment,
        }),
      });

      if (res.ok) {
        setRevSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRev(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-czns-400">Loading smartphone specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Smartphone Not Found</h2>
        <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-brand-emerald text-czns-950 font-bold text-xs">
          Return to Store
        </Link>
      </div>
    );
  }

  const isUsed = product.is_used === 1;
  const currentPrice = selectedVariant?.price || product.min_price || 0;
  const regularPrice = selectedVariant?.regular_price || product.regular_price || 0;
  const discountPercent =
    regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  // Unique storages and colors available
  const availableStorages = Array.from(new Set(product.variants?.map((v) => v.storage) || []));
  const availableColors = Array.from(
    new Set(
      product.variants?.map((v) => JSON.stringify({ name: v.color_name, hex: v.color_hex })) || []
    )
  ).map((s) => JSON.parse(s));

  // Gallery images (variant images or product thumbnail)
  const galleryImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : [product.thumbnail];

  // WhatsApp Order URL
  const waUrl = getWhatsAppOrderUrl({
    productName: product.name,
    storage: selectedVariant?.storage,
    color: selectedVariant?.color_name,
    price: currentPrice,
    ptaStatus: product.pta_status,
    batteryHealth: product.battery_health,
    conditionGrade: product.condition_grade,
    slug: product.slug,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-czns-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/?brand=${product.brand_slug}`}
          className="hover:text-white"
        >
          {product.brand_name}
        </Link>
        <span>/</span>
        <span className="text-white truncate font-medium">{product.name}</span>
      </nav>

      {/* Main PDP Grid: Gallery on Left, Specs & Buy on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: HIGH-RES GALLERY (Phase 3 Requirement) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Zoomable Angle Viewer */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-czns-900 border border-czns-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-4 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage || product.thumbnail}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
            />

            {/* Condition Grade Watermark Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isUsed ? (
                <span className="flex items-center gap-1.5 bg-amber-500/90 text-czns-950 text-xs font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                  <BatteryCharging className="w-4 h-4" />
                  {product.condition_grade || '10/10 Mint Certified'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-brand-emerald text-czns-950 text-xs font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                  100% Brand New Box Packed
                </span>
              )}

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-czns-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-md">
                {product.pta_status}
              </span>
            </div>

            {/* Battery Health Badge (Used Phones) */}
            {isUsed && product.battery_health && (
              <div className="absolute top-4 right-4 bg-czns-950/90 border border-amber-500/50 text-brand-gold text-xs font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
                <span>🔋 {product.battery_health}% Original Battery</span>
              </div>
            )}
          </div>

          {/* Angle Thumbnails Carousel */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-czns-900 p-1.5 shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-brand-emerald ring-2 ring-brand-emerald/30'
                      : 'border-czns-800 hover:border-czns-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* 3 Core Trust Badges (Phase 3 Requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-czns-900/60 border border-czns-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-brand-emerald flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">100% Original Genuine</div>
                <div className="text-[10px] text-czns-400">Never opened or altered</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-czns-900/60 border border-czns-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-brand-gold flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Face ID / True Tone</div>
                <div className="text-[10px] text-czns-400">100% Functional tested</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-czns-900/60 border border-czns-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">7 Days Replacement</div>
                <div className="text-[10px] text-czns-400">Store checking warranty</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUYING EXPERIENCE & VARIANT PICKER */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Brand */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-czns-400">
                {product.brand_name}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
                <span className="text-czns-400">({product.review_count} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs text-czns-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-czns-900/80 border border-czns-800 p-4 rounded-2xl flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-semibold text-czns-400 uppercase tracking-wider block">
                Total Cash Price
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatPKR(currentPrice)}
              </div>
              {regularPrice > currentPrice && (
                <div className="text-xs text-czns-400 line-through">
                  Regular Price: {formatPKR(regularPrice)}
                </div>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black px-2.5 py-1 rounded-full">
                Save {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Storage Capacity Selector (Phase 3 Requirement) */}
          {availableStorages.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-czns-300 flex items-center justify-between">
                <span>Select Storage Capacity:</span>
                <span className="text-brand-emerald">{selectedStorage}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableStorages.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStorageSelect(s)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedStorage === s
                        ? 'bg-brand-emerald text-czns-950 border-brand-emerald shadow-md'
                        : 'bg-czns-900 text-czns-300 border-czns-800 hover:border-czns-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Swatches Selector (Phase 3 Requirement) */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-czns-300 flex items-center justify-between">
                <span>Select Color:</span>
                <span className="text-brand-gold">{selectedColor}</span>
              </label>

              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleColorSelect(c.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedColor === c.name
                        ? 'bg-czns-850 text-white border-brand-gold ring-1 ring-brand-gold/40'
                        : 'bg-czns-900 text-czns-400 border-czns-800 hover:border-czns-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Warranty & Delivery Notice */}
          <div className="p-3.5 rounded-2xl bg-czns-900/60 border border-czns-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-czns-300">
              <span className="text-czns-400">Official Warranty:</span>
              <span className="font-semibold text-white">{product.warranty_type}</span>
            </div>
            <div className="flex items-center justify-between text-czns-300">
              <span className="text-czns-400">Karachi COD:</span>
              <span className="font-semibold text-brand-emerald">Available (Same Day Rider)</span>
            </div>
            <div className="flex items-center justify-between text-czns-300">
              <span className="text-czns-400">Other Cities:</span>
              <span className="font-semibold text-blue-300">Insured TCS Advance Payment</span>
            </div>
          </div>

          {/* ACTION BUTTONS (Phase 3 Requirement) */}
          <div className="space-y-2.5 pt-2">
            {/* 1. Buy Now */}
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-sm transition-all shadow-xl shadow-emerald-950/50"
            >
              <span>Buy Now (Instant Checkout)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* 2. Add to Bag */}
              <button
                onClick={handleAddToBag}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-czns-900 hover:bg-czns-850 border border-czns-750 text-white font-bold text-xs transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-czns-300" />
                <span>Add to Bag</span>
              </button>

              {/* 3. Order via WhatsApp (pre-filled model, storage, color, price) */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-brand-emerald font-bold text-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Breakdown Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Cpu className="w-5 h-5 text-brand-emerald" />
            <h2 className="text-lg font-black tracking-tight">Technical Specifications</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {Object.entries(product.specs).map(([key, val]) => (
              <div
                key={key}
                className="p-3.5 rounded-xl bg-czns-950/60 border border-czns-800/80 space-y-1"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-czns-400">
                  {key}
                </span>
                <div className="text-xs font-semibold text-white">{val}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-czns-800">
          <div>
            <h2 className="text-lg font-black text-white">Customer Reviews</h2>
            <p className="text-xs text-czns-400">Verified purchases for {product.name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-white flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-xs text-czns-400">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-czns-950/60 border border-czns-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rev.author_name}</span>
                    {rev.author_city && (
                      <span className="text-[11px] text-czns-400">• {rev.author_city}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-czns-300 leading-relaxed italic">&quot;{rev.comment}&quot;</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-czns-400">No customer reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* Add Review Form */}
        <div className="pt-4 border-t border-czns-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-czns-300 mb-3">
            Leave a Verified Review
          </h3>

          {revSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-brand-emerald text-brand-emerald text-xs font-bold">
              Thank you! Your verified review has been published.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-xl">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  className="bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                />
                <input
                  type="text"
                  placeholder="City (e.g. Lahore, Karachi)"
                  value={revCity}
                  onChange={(e) => setRevCity(e.target.value)}
                  className="bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[10px] text-czns-400 block mb-1">Rating</label>
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(parseInt(e.target.value, 10))}
                  className="bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                </select>
              </div>

              <textarea
                required
                rows={3}
                placeholder="Write your honest review on condition, battery health, and delivery speed..."
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
              />

              <button
                type="submit"
                disabled={submittingRev}
                className="px-5 py-2 rounded-xl bg-brand-emerald text-czns-950 text-xs font-bold hover:bg-emerald-400"
              >
                {submittingRev ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Similar Flagships You May Like</h2>
            <Link href="/" className="text-xs text-brand-emerald hover:underline">
              View All Phones
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
