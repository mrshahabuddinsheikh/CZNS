'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';
import { Product } from '../lib/types';
import { formatPKR, getWhatsAppOrderUrl } from '../lib/api';
import { useCart } from '../context/CartContext';

function getDisplayCondition(grade?: string, isUsed?: boolean) {
  if (!isUsed) return 'Brand New';
  if (!grade) return '10/10 Mint';
  if (grade.includes('10/10')) return '10/10 Mint';
  if (grade.includes('9.5/10')) return '9.5/10 Flawless';
  if (grade.includes('9/10')) return '9/10 Good';
  return 'Pre-Owned';
}

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

    const storage = product.storages?.[0] || '128GB';
    const color = product.colors?.[0] || 'Standard';
    const colorHex = product.color_hexes?.[0] || '#333';

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
    const colorHex = product.color_hexes?.[0] || '#333';

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

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => router.push(`/phone/${product.slug}`)}
      className="group relative bg-white/78 backdrop-blur-2xl border border-slate-200/80 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_20px_45px_-12px_rgba(var(--primary-rgb,16,185,129),0.22)] flex flex-col justify-between cursor-pointer text-slate-900"
    >
      {/* Top Media & Non-overlapping Floating Badges */}
      <div className="relative aspect-[4/3] bg-slate-50/90 overflow-hidden flex items-center justify-center p-3">
        <Link href={`/phone/${product.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* NON-OVERLAPPING STRUCTURED TOP BAR */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
          {/* Left: Condition + PTA Stack */}
          <div className="flex flex-col items-start gap-1 max-w-[55%]">
            {isUsed ? (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md truncate max-w-full">
                <BatteryCharging className="w-3 h-3 shrink-0" />
                <span className="truncate">{getDisplayCondition(product.condition_grade, true)}</span>
              </span>
            ) : (
              <span
                style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                className="inline-flex items-center gap-1 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md truncate max-w-full"
              >
                <Sparkles className="w-3 h-3 text-white/80 shrink-0" />
                <span className="truncate">Brand New</span>
              </span>
            )}

            {/* PTA Status Badge */}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs border truncate max-w-full ${
                product.pta_status?.includes('Non-PTA')
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white/95 text-slate-800 border-slate-200'
              }`}
            >
              {product.pta_status || 'Official PTA'}
            </span>
          </div>

          {/* Right: Battery Health + Discount Stack */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isUsed && product.battery_health && (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>🔋 {product.battery_health}%</span>
              </div>
            )}

            {discountPercent > 0 && !isUsed && (
              <div
                style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                className="text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs shrink-0"
              >
                Save {discountPercent}%
              </div>
            )}
          </div>
        </div>

        {/* Brand Tag Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
          {product.brand_name}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Rating & Stock */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800">{product.rating || '4.9'}</span>
              <span className="text-slate-400 text-[11px]">
                ({product.review_count || 14})
              </span>
            </div>

            <div
              style={{
                color: 'var(--primary-color, #10b981)',
                backgroundColor: 'var(--primary-light, rgba(16,185,129,0.08))',
                borderColor: 'var(--primary-light, rgba(16,185,129,0.25))',
              }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            >
              <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--primary-color, #10b981)' }} />
              <span>In Stock</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/phone/${product.slug}`} className="block group-hover:text-emerald-600 transition-colors">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Warranty & Guarantee Line */}
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {isUsed
                ? '7 Days Replacement Guarantee'
                : '1-Year Official Brand Warranty'}
            </span>
          </p>

          {/* Storage & Colors preview */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1">
              {product.storages?.slice(0, 3).map((st) => (
                <span
                  key={st}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {st}
                </span>
              ))}
            </div>

            {product.color_hexes && product.color_hexes.length > 0 && (
              <div className="flex items-center -space-x-1">
                {product.color_hexes.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & CTA Action Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div
                style={{ color: 'var(--primary-color, #10b981)' }}
                className="text-lg sm:text-xl font-mono font-black"
              >
                {formatPKR(price)}
              </div>
              {regularPrice > price && (
                <div className="text-xs text-slate-400 line-through">
                  {formatPKR(regularPrice)}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 text-right">
              Karachi COD Available
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToBag}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleQuickBuy}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
