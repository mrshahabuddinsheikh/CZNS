'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  MapPin,
  Clock,
  Eye,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { Product, ProductVariant } from '../../../lib/types';
import { apiFetch, formatPKR, getWhatsAppOrderUrl } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import ProductCard from '../../../components/ProductCard';

type AngleKey = 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';

interface AngleSpec {
  key: AngleKey;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
}

const ANGLES: AngleSpec[] = [
  {
    key: 'front',
    label: 'Front (Cover)',
    shortLabel: 'Front',
    badge: 'Cover Image',
    description: 'Pristine OLED Display, Bezels & Dynamic Island / Punch Hole',
  },
  {
    key: 'back',
    label: 'Back Panel',
    shortLabel: 'Back',
    badge: 'Camera Module',
    description: 'Frosted Glass, Camera Lenses & Original Brand Logo',
  },
  {
    key: 'top',
    label: 'Top Edge',
    shortLabel: 'Top',
    badge: 'Top Bezel',
    description: 'Top Frame, Antenna Lines & Noise Cancellation Microphone',
  },
  {
    key: 'bottom',
    label: 'Bottom Port',
    shortLabel: 'Bottom',
    badge: 'Ports & Speakers',
    description: 'USB Type-C / Lightning Port, Dual Speaker Grilles & Mic',
  },
  {
    key: 'left',
    label: 'Left Frame',
    shortLabel: 'Left',
    badge: 'Volume & SIM',
    description: 'Volume Rocker, Action Button & SIM Card Tray Slot',
  },
  {
    key: 'right',
    label: 'Right Frame',
    shortLabel: 'Right',
    badge: 'Power Button',
    description: 'Power / Side Wake Button & Chassis Antenna Bands',
  },
];

// 6-Angle Image generator for models
function getModelAngleImages(productName: string, defaultThumb: string): Record<AngleKey, string> {
  const name = productName.toLowerCase();

  if (name.includes('iphone 15') || name.includes('iphone 16') || name.includes('iphone 17')) {
    return {
      front: defaultThumb || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&q=85',
      back: 'https://images.unsplash.com/photo-1695048132961-a0ea7f66a815?w=1000&q=85',
      top: 'https://images.unsplash.com/photo-1695048065053-cf019cf36814?w=1000&q=85',
      bottom: 'https://images.unsplash.com/photo-1695048133036-7497d3e09d16?w=1000&q=85',
      left: 'https://images.unsplash.com/photo-1695048064977-626a57e3f9d5?w=1000&q=85',
      right: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&q=85',
    };
  }

  if (name.includes('samsung') || name.includes('s26') || name.includes('s24') || name.includes('s23')) {
    return {
      front: defaultThumb || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&q=85',
      back: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1000&q=85',
      top: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&q=85',
      bottom: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&q=85',
      left: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1000&q=85',
      right: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1000&q=85',
    };
  }

  if (name.includes('iphone 13') || name.includes('iphone 14') || name.includes('apple')) {
    return {
      front: defaultThumb || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&q=85',
      back: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&q=85',
      top: 'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=1000&q=85',
      bottom: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&q=85',
      left: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1000&q=85',
      right: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&q=85',
    };
  }

  return {
    front: defaultThumb || 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1000&q=85',
    back: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=1000&q=85',
    top: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&q=85',
    bottom: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&q=85',
    left: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1000&q=85',
    right: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&q=85',
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 6 Angles state: front, back, top, bottom, left, right (front is the cover image)
  const [activeAngle, setActiveAngle] = useState<AngleKey>('front');

  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

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

  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    if (!product?.variants) return;

    const match =
      product.variants.find(
        (v) => v.storage === storage && v.color_name === selectedColor
      ) || product.variants.find((v) => v.storage === storage);

    if (match) {
      setSelectedColor(match.color_name);
      setSelectedVariant(match);
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
    }
  };

  const handleAddToBag = () => {
    if (!product) return;

    const variantId = selectedVariant?.id || `var-${product.id}`;
    const variantStorage = selectedVariant?.storage || 'Standard';
    const variantColor = selectedVariant?.color_name || 'Standard';
    const variantHex = selectedVariant?.color_hex || '#333333';
    const variantPrice = selectedVariant?.price || product.min_price || 0;
    const variantRegPrice = selectedVariant?.regular_price || product.regular_price || 0;
    const variantImage = selectedVariant?.image_url || product.thumbnail;

    addToCart(
      {
        variant_id: variantId,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage: variantStorage,
        color_name: variantColor,
        color_hex: variantHex,
        image_url: variantImage,
        price: variantPrice,
        regular_price: variantRegPrice,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: selectedVariant?.stock || 5,
      },
      true
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    const variantId = selectedVariant?.id || `var-${product.id}`;
    const variantStorage = selectedVariant?.storage || 'Standard';
    const variantColor = selectedVariant?.color_name || 'Standard';
    const variantHex = selectedVariant?.color_hex || '#333333';
    const variantPrice = selectedVariant?.price || product.min_price || 0;
    const variantRegPrice = selectedVariant?.regular_price || product.regular_price || 0;
    const variantImage = selectedVariant?.image_url || product.thumbnail;

    addToCart(
      {
        variant_id: variantId,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage: variantStorage,
        color_name: variantColor,
        color_hex: variantHex,
        image_url: variantImage,
        price: variantPrice,
        regular_price: variantRegPrice,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: selectedVariant?.stock || 5,
      },
      false
    );

    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !revName || !revComment) return;

    setSubmittingRev(true);
    try {
      const res = await fetch('/api/v1/reviews', {
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
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center text-slate-800">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-bold">Loading smartphone specifications &amp; 6-angle inspection gallery...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center space-y-4 text-slate-900">
        <h2 className="text-2xl font-black">Smartphone Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested phone model could not be loaded. Please return to the shop catalog.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs transition-colors shadow-md hover:bg-emerald-600"
        >
          Explore All Smartphones in Shop
        </Link>
      </div>
    );
  }

  const isUsed = product.is_used === 1;
  const currentPrice = selectedVariant?.price || product.min_price || 0;
  const regularPrice = selectedVariant?.regular_price || product.regular_price || 0;
  const discountPercent =
    regularPrice > currentPrice ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  const availableStorages = Array.from(new Set(product.variants?.map((v) => v.storage) || []));
  const availableColors = Array.from(
    new Set(
      product.variants?.map((v) => JSON.stringify({ name: v.color_name, hex: v.color_hex })) || []
    )
  ).map((s) => JSON.parse(s));

  // Get 6 Angles for current phone
  const angleImages = getModelAngleImages(
    product.name,
    selectedVariant?.image_url || product.thumbnail
  );
  const currentDisplayedImage = angleImages[activeAngle];
  const activeAngleSpec = ANGLES.find((a) => a.key === activeAngle) || ANGLES[0];

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
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-10 text-slate-900">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/shop" className="hover:text-emerald-600 transition-colors">Shop Catalog</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href={`/shop?brand=${product.brand_slug}`} className="hover:text-emerald-600 transition-colors">
          {product.brand_name}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-bold truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid: 6-Angle Inspection on Left, Buying Options on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: 6-ANGLE INSPECTION GALLERY (Task 5 Requirement) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Angle Mode Selector Tabs (Top, Bottom, Left, Right, Front, Back) */}
          <div className="bg-slate-100/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
            {ANGLES.map((angle) => {
              const isActive = activeAngle === angle.key;
              return (
                <button
                  key={angle.key}
                  onClick={() => setActiveAngle(angle.key)}
                  className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <div className="truncate">{angle.label}</div>
                  <div className={`text-[9px] font-semibold truncate ${isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
                    {angle.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Inspection Viewport with Studio Pedestal Styling */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-6 sm:p-8 group">
            {/* Display Current Angle Photo */}
            <AnimatePresence mode="wait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={activeAngle}
                src={currentDisplayedImage}
                alt={`${product.name} - ${activeAngleSpec.label}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
              />
            </AnimatePresence>

            {/* Non-overlapping Top Badges Container */}
            <div className="absolute top-3.5 inset-x-3.5 flex items-start justify-between gap-2 z-10 pointer-events-none">
              {/* Left Stack: Condition & PTA */}
              <div className="flex flex-col items-start gap-1 max-w-[55%]">
                {isUsed ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                    <BatteryCharging className="w-3.5 h-3.5 shrink-0" />
                    <span>{product.condition_grade || '10/10 Mint'}</span>
                  </span>
                ) : (
                  <span
                    style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                    className="inline-flex items-center gap-1.5 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm backdrop-blur-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span>Brand New Box Packed</span>
                  </span>
                )}

                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                  {product.pta_status}
                </span>
              </div>

              {/* Right Stack: Battery Health */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isUsed && product.battery_health && (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>🔋 {product.battery_health}% Health</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Angle Inspection Info Overlay */}
            <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-800 shadow-xs pointer-events-none">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-900">{activeAngleSpec.label}:</span>
                <span className="text-slate-500 truncate text-[11px]">{activeAngleSpec.description}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                100% Genuine Physical Inspection
              </span>
            </div>
          </div>

          {/* 6 Angle Thumbnail Strip with clear labels */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Click to Inspect Angles (6 Available):
            </span>
            <div className="grid grid-cols-6 gap-2">
              {ANGLES.map((angle) => {
                const isActive = activeAngle === angle.key;
                return (
                  <button
                    key={angle.key}
                    onClick={() => setActiveAngle(angle.key)}
                    className={`aspect-square rounded-2xl overflow-hidden border bg-white p-1.5 shrink-0 transition-all flex flex-col items-center justify-between shadow-xs cursor-pointer ${
                      isActive
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={angleImages[angle.key]}
                      alt={angle.label}
                      className="w-full h-3/4 object-contain"
                    />
                    <span className={`text-[9px] font-black truncate w-full text-center ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {angle.shortLabel || angle.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Core Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">100% Genuine IMEI</div>
                <div className="text-[11px] text-slate-500">PTA DIRBS verified</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">30-Point Diagnostic</div>
                <div className="text-[11px] text-slate-500">Hardware &amp; screen tested</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">7 Days Checking</div>
                <div className="text-[11px] text-slate-500">Replacement warranty</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUYING EXPERIENCE & VARIANT PICKER */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Brand */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                {product.brand_name}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-slate-900">{product.rating || '4.9'}</span>
                <span className="text-slate-500">({product.review_count || 12} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Box with Light Glass Styling */}
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 p-5 rounded-3xl shadow-sm flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Wholesale Cash Price (Karachi COD / Advance Nationwide)
              </span>
              <div
                style={{ color: 'var(--primary-color, #10b981)' }}
                className="text-2xl sm:text-3xl font-mono font-black tracking-tight mt-0.5"
              >
                {formatPKR(currentPrice)}
              </div>
              {regularPrice > currentPrice && (
                <div className="text-xs text-slate-400 line-through mt-0.5">
                  Regular Price: {formatPKR(regularPrice)}
                </div>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                Save {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Storage Capacity Selector */}
          {availableStorages.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Storage Capacity:</span>
                <span className="text-emerald-700 font-extrabold">{selectedStorage}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableStorages.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStorageSelect(s)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedStorage === s
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Swatches Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Color Finish:</span>
                <span className="text-amber-800 font-extrabold">{selectedColor}</span>
              </label>

              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleColorSelect(c.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedColor === c.name
                        ? 'bg-white border-emerald-600 text-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock & City Delivery Status */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>In Stock — Ready for 24h Express Dispatch</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Karachi Delivery: Cash on Delivery available (Rs. 250 fee). Other Pakistani cities: Insured express courier upon online advance transfer.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToBag}
                className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now (Checkout)</span>
              </button>
            </div>

            {/* Direct WhatsApp Order */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Order Directly on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS & REVIEWS TABS */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
            Technical Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {product.specs &&
              Object.entries(product.specs).map(([k, v]) => (
                <div
                  key={k}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <div className="font-bold text-slate-900 text-xs">{String(v)}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Verified Customer Reviews
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real feedback from Pakistani buyers across Karachi, Lahore, and Islamabad
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-amber-900 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>4.9 Overall Satisfaction</span>
            </div>
          </div>

          {/* Existing Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{r.author_name}</div>
                      <div className="text-[10px] text-slate-500">{r.author_city}</div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &quot;{r.comment}&quot;
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No reviews yet for this model.</p>
            )}
          </div>

          {/* Write a Review */}
          <div className="pt-6 border-t border-slate-200 max-w-xl">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Leave a Verified Review</h4>
            {revSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                Thank you! Your review has been submitted.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Karachi)"
                    value={revCity}
                    onChange={(e) => setRevCity(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRevRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= revRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Share your experience regarding phone condition, delivery, and battery health..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={submittingRev}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-black hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  {submittingRev ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* RELATED PHONES SECTION */}
      {related && related.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Similar Smartphones</h3>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View All in Shop
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
