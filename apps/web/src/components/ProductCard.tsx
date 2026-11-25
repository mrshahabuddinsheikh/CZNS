'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  PhoneCall,
  Zap,
  MapPin,
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Product } from '../lib/types';
import { formatPKR } from '../lib/api';
import { useCart } from '../context/CartContext';

function getDisplayCondition(grade?: string, isUsed?: boolean) {
  if (!isUsed) return 'Brand New';
  if (!grade) return '10/10 Mint';
  if (grade.includes('10/10')) return '10/10 Mint';
  if (grade.includes('9.5/10')) return '9.5/10 Like New';
  if (grade.includes('9/10')) return '9/10 Good';
  return 'Pre-Owned';
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);

  const isUsed = product.is_used === 1;
  const price = product.min_price || 0;
  const regularPrice = product.regular_price || 0;

  const storage = product.storages?.[0] || '128GB';
  const color = product.colors?.[0] || 'Standard';
  const colorHex = product.color_hexes?.[0] || '#333';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Salam CZN'S! Main aap ka ye phone dekh raha hoon: *${product.name}* (Price: ${formatPKR(price)}). Kya ye Star City Mall desk par available hai?`;
    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ==========================================
  // 1. LIST VIEW LAYOUT (HORIZONTAL ROW CARD)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <article
        onClick={() => router.push(`/phone/${product.slug}`)}
        className="group relative bg-white/90 backdrop-blur-xl border border-slate-200/90 hover:border-slate-400 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row text-slate-900 cursor-pointer p-2.5 sm:p-3 gap-3 sm:gap-5"
      >
        {/* Left Thumbnail Media */}
        <div className="relative w-full sm:w-44 aspect-[4/3] sm:aspect-square bg-slate-50/90 rounded-lg overflow-hidden flex items-center justify-center p-2 shrink-0 border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            <span className="bg-[#ffce32] text-[#002f34] text-[9px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
              FEATURED
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Add to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
          </button>
        </div>

        {/* Right Details */}
        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-black text-[#002f34] font-mono tracking-tight">
                {formatPKR(price)}
              </div>
              {regularPrice > price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPKR(regularPrice)}
                </span>
              )}
            </div>

            <Link href={`/phone/${product.slug}`} className="block mt-1">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#7e0119] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Spec tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {storage}
              </span>
              <span className="text-[#7e0119] font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {product.pta_status || 'Official PTA Approved'}
              </span>
              {isUsed && product.battery_health && (
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  🔋 {product.battery_health}% Battery
                </span>
              )}
              <span className="text-slate-500">
                {isUsed ? '7 Days Checking Warranty' : '1-Year Brand Warranty'}
              </span>
            </div>
          </div>

          {/* Bottom Bar: Location & CTA Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Star City Mall, Karachi • Verified Stock
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsAppChat}
                className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#7e0119] font-bold text-xs flex items-center gap-1 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#7e0119]" />
                <span>Chat</span>
              </button>

              <button
                onClick={handleQuickBuy}
                className="py-1.5 px-4 rounded-lg bg-[#7e0119] hover:bg-[#610012] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ==========================================
  // 2. GRID / CARD VIEW LAYOUT (DEFAULT)
  // ==========================================
  return (
    <article
      onClick={() => router.push(`/phone/${product.slug}`)}
      className="group relative bg-white/90 backdrop-blur-xl border border-slate-200/90 hover:border-slate-400 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between text-slate-900 cursor-pointer shadow-xs"
    >
      {/* 1. MEDIA CONTAINER */}
      <div className="relative aspect-[4/3] bg-slate-50/90 overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
        <Link href={`/phone/${product.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex flex-col gap-1 items-start">
          <span className="bg-[#ffce32] text-[#002f34] text-[10px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
            FEATURED
          </span>
          {isUsed ? (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs">
              {getDisplayCondition(product.condition_grade, true)}
            </span>
          ) : (
            <span className="bg-rose-100 text-[#7e0119] border border-rose-300 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs">
              Brand New
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
            }`}
          />
        </button>

        {/* Battery Health on Used Phones */}
        {isUsed && product.battery_health && (
          <div className="absolute bottom-2 left-2 bg-white/95 text-slate-900 border border-slate-200 text-[10px] font-black px-1.5 py-0.5 rounded-xs shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7e0119]" />
            <span>🔋 {product.battery_health}%</span>
          </div>
        )}

        {/* Brand Tag */}
        <div className="absolute bottom-2 right-2 bg-white/95 text-slate-700 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-xs shadow-xs">
          {product.brand_name}
        </div>
      </div>

      {/* 2. CARD CONTENT */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-[#002f34] tracking-tight font-mono">
              {formatPKR(price)}
            </div>
            {regularPrice > price && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPKR(regularPrice)}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/phone/${product.slug}`} className="block mt-1">
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-[#7e0119] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Spec Summary */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="font-medium text-slate-700">{storage}</span>
            <span>•</span>
            <span className="text-[#7e0119] font-bold">{product.pta_status || 'Official PTA'}</span>
            <span>•</span>
            <span>{isUsed ? '7-Day War' : '1-Yr War'}</span>
          </div>
        </div>

        {/* Footer: Location & Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              Star City Mall, Karachi
            </span>
            <span className="shrink-0 font-medium">Today</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleWhatsAppChat}
              className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#7e0119] font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 text-[#7e0119]" />
              <span>Chat</span>
            </button>

            <button
              onClick={handleQuickBuy}
              className="py-1.5 px-2 rounded-lg bg-[#7e0119] hover:bg-[#610012] text-white font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
