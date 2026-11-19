'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Product } from '../lib/types';
import { formatPKR, getWhatsAppOrderUrl } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const isUsed = product.is_used === 1;
  const price = product.min_price || 0;
  const regularPrice = product.regular_price || 0;
  const discountPercent =
    regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first variant
    const storage = product.storages?.[0] || '128GB';
    const color = product.colors?.[0] || 'Standard';
    const colorHex = product.color_hexes?.[0] || '#222';

    addToCart(
      {
        variant_id: `quick-${product.id}`,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage,
        color_name: color,
        color_hex: colorHex,
        image_url: product.thumbnail,
        price,
        regular_price: regularPrice,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: product.total_stock || 5,
      },
      false
    );

    router.push('/checkout');
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const storage = product.storages?.[0] || '128GB';
    const color = product.colors?.[0] || 'Standard';
    const colorHex = product.color_hexes?.[0] || '#222';

    addToCart(
      {
        variant_id: `quick-${product.id}`,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        storage,
        color_name: color,
        color_hex: colorHex,
        image_url: product.thumbnail,
        price,
        regular_price: regularPrice,
        quantity: 1,
        is_used: product.is_used,
        condition_grade: product.condition_grade,
        pta_status: product.pta_status,
        battery_health: product.battery_health,
        max_stock: product.total_stock || 5,
      },
      true
    );
  };

  const waUrl = getWhatsAppOrderUrl({
    productName: product.name,
    storage: product.storages?.[0],
    price,
    ptaStatus: product.pta_status,
    batteryHealth: product.battery_health,
    conditionGrade: product.condition_grade,
    slug: product.slug,
  });

  return (
    <div className="group relative bg-czns-900 border border-czns-800 hover:border-czns-700/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col justify-between">
      {/* Top Floating Badges */}
      <div className="relative aspect-[4/3] bg-czns-950 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Grade Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isUsed ? (
            <span className="flex items-center gap-1 bg-amber-500/90 text-czns-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
              <BatteryCharging className="w-3 h-3" />
              {product.condition_grade || 'Pre-Owned 10/10'}
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-brand-emerald text-czns-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Pin Pack Sealed
            </span>
          )}

          {/* PTA Status Pill */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
              product.pta_status === 'Official PTA'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : 'bg-czns-900/90 text-amber-300 border border-amber-500/30'
            }`}
          >
            {product.pta_status}
          </span>
        </div>

        {/* Battery Health Badge (for Used) or Discount Badge */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end z-10">
          {isUsed && product.battery_health && (
            <span className="bg-czns-950/90 border border-amber-500/40 text-brand-gold text-[11px] font-black px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1">
              🔋 {product.battery_health}%
            </span>
          )}

          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Brand Tag */}
        <div className="absolute bottom-2 left-2.5 text-[10px] text-czns-400 font-semibold bg-czns-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
          {product.brand_name}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Review */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-white text-[11px]">{product.rating}</span>
              <span className="text-czns-400 text-[10px]">({product.review_count})</span>
            </div>
            <span className="text-[10px] text-brand-emerald font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Verified Genuine
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/phone/${product.slug}`} className="block group-hover:text-brand-emerald transition-colors">
            <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
          </Link>

          {/* Storage pills preview */}
          {product.storages && product.storages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.storages.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium bg-czns-800 text-czns-300 px-1.5 py-0.5 rounded border border-czns-700/50"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Warranty Notice */}
          <div className="text-[11px] text-czns-400 flex items-center gap-1 mt-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-czns-400 shrink-0" />
            <span className="truncate">{product.warranty_type}</span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-czns-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-base font-extrabold text-white tracking-tight">
                {formatPKR(price)}
              </div>
              {regularPrice > price && (
                <div className="text-xs text-czns-400 line-through">
                  {formatPKR(regularPrice)}
                </div>
              )}
            </div>

            {/* WhatsApp Quick Order Pill */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Order on WhatsApp"
              className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-brand-emerald hover:bg-brand-emerald hover:text-czns-950 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToBag}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-czns-800 hover:bg-czns-750 text-white text-xs font-semibold border border-czns-700 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-czns-300" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleQuickBuy}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 text-xs font-bold transition-colors shadow-md shadow-emerald-950/40"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
