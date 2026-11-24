'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Clock,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  BatteryCharging,
  Sparkles,
  PhoneCall,
  ArrowRight,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { DealOfTheDay } from '../lib/types';
import { formatPKR, getWhatsAppOrderUrl } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function DealOfTheDaySection() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [deal, setDeal] = useState<DealOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Fetch Deal of the Day
  useEffect(() => {
    async function loadDeal() {
      try {
        const res = await fetch('/api/v1/deals/today');
        if (res.ok) {
          const data = await res.json();
          if (data.deal) {
            setDeal(data.deal);
            setSecondsLeft(data.deal.seconds_remaining || 0);
          }
        }
      } catch (err) {
        console.error('Error loading Deal of the Day', err);
      } finally {
        setLoading(false);
      }
    }

    loadDeal();
  }, []);

  // Countdown timer tick every 1 second
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  if (loading || !deal) {
    return null;
  }

  // Calculate Hours, Minutes, Seconds
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isExpired = secondsLeft <= 0 || deal.is_expired;
  const isSoldOut = deal.is_sold_out === 1 || deal.stock_total <= deal.stock_claimed;

  const price = deal.deal_price;
  const regularPrice = deal.regular_price || price + 25000;
  const discountAmount = regularPrice - price;
  const discountPercent = Math.round((discountAmount / regularPrice) * 100);

  const claimedPercent = Math.min(
    100,
    Math.round((deal.stock_claimed / Math.max(1, deal.stock_total)) * 100)
  );

  // Instant Buy Deal
  const handleInstantBuy = () => {
    if (isExpired || isSoldOut) return;

    const storage = deal.storages?.[0] || '128GB';
    const color = deal.colors?.[0] || 'Standard';

    addToCart(
      {
        variant_id: deal.default_variant_id || `deal-var-${deal.id}`,
        product_id: deal.product_id,
        product_name: deal.product_name || deal.title,
        product_slug: deal.product_slug || 'deal-today',
        storage,
        color_name: color,
        color_hex: '#333333',
        image_url: deal.thumbnail || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
        price: deal.deal_price,
        regular_price: deal.regular_price,
        quantity: 1,
        is_used: deal.is_used || 0,
        condition_grade: deal.condition_grade || 'Brand New',
        pta_status: deal.pta_status || 'Official PTA',
        battery_health: deal.battery_health || 100,
        max_stock: deal.stock_total - deal.stock_claimed,
      },
      false
    );

    router.push('/checkout');
  };

  const handleAddToBag = () => {
    if (isExpired || isSoldOut) return;

    const storage = deal.storages?.[0] || '128GB';
    const color = deal.colors?.[0] || 'Standard';

    addToCart(
      {
        variant_id: deal.default_variant_id || `deal-var-${deal.id}`,
        product_id: deal.product_id,
        product_name: deal.product_name || deal.title,
        product_slug: deal.product_slug || 'deal-today',
        storage,
        color_name: color,
        color_hex: '#333333',
        image_url: deal.thumbnail || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
        price: deal.deal_price,
        regular_price: deal.regular_price,
        quantity: 1,
        is_used: deal.is_used || 0,
        condition_grade: deal.condition_grade || 'Brand New',
        pta_status: deal.pta_status || 'Official PTA',
        battery_health: deal.battery_health || 100,
        max_stock: deal.stock_total - deal.stock_claimed,
      },
      true
    );
  };

  const waUrl = getWhatsAppOrderUrl({
    productName: `${deal.product_name || deal.title} (Deal of the Day)`,
    storage: deal.storages?.[0],
    price,
    ptaStatus: deal.pta_status,
    batteryHealth: deal.battery_health,
    conditionGrade: deal.condition_grade,
    slug: deal.product_slug,
  });

  return (
    <section className="relative py-8 sm:py-12 px-2 sm:px-4 overflow-hidden">
      {/* Container with dynamic Grayscale filter if EXPIRED */}
      <div
        className={`max-w-[1440px] mx-auto transition-all duration-700 ${
          isExpired ? 'grayscale contrast-125 opacity-75 select-none' : ''
        }`}
      >
        {/* Main Inset Card with Light Luxury Curved Styling */}
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-white border-2 border-amber-300 shadow-[0_20px_50px_rgba(245,158,11,0.12)] overflow-hidden text-slate-900">
          {/* Top Banner Ribbon */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-6 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 font-extrabold text-xs shadow-md">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-black/20">
                <Flame className="w-4 h-4 fill-amber-200 text-amber-200 animate-pulse" />
              </span>
              <span className="tracking-widest uppercase text-xs sm:text-sm font-black">
                {deal.badge_text || '⚡ DEAL OF THE DAY'}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-black/20 text-[10px] font-bold">
                Karachi Wholesale Direct
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white">
              <Truck className="w-3.5 h-3.5" />
              <span>Karachi 24h Express COD • Daily Midnight Reset</span>
            </div>
          </div>

          {/* EXPIRED BANNER OVERLAY IF EXPIRED */}
          {isExpired && (
            <div className="bg-rose-50 text-rose-800 py-3 px-4 text-center font-black text-sm tracking-wide flex items-center justify-center gap-2 border-b border-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-600 animate-bounce" />
              <span>⚠️ 24-HOUR DEAL EXPIRED! THIS OFFER HAS ENDED. STAY TUNED FOR TOMORROW&apos;S DEAL.</span>
            </div>
          )}

          {/* Body Content Grid */}
          <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT: BIG PROMINENT 24-HOUR COUNTDOWN TIMER */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-3 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>24-Hour Deal Window</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {deal.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Exclusive daily wholesale discount. Once the 24-hour timer reaches zero or allocated stock finishes, this price expires permanently!
                </p>
              </div>

              {/* HUGE DIGITAL COUNTDOWN DISPLAY ("bht bara sa timer chaley") */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Deal Ends In:
                  </span>
                  <span className="text-slate-400 font-mono">{isExpired ? 'EXPIRED' : '24h Flash Cycle'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  {/* Hours */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
                      {String(hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase mt-1">
                      Hours
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-amber-300">
                      {String(minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase mt-1">
                      Minutes
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-emerald-400 animate-pulse">
                      {String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase mt-1">
                      Seconds
                    </div>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Deal Stock Allocation:</span>
                    <span className="text-amber-400 font-bold">
                      {isSoldOut
                        ? '0 Units Left (Sold Out)'
                        : `${deal.stock_total - deal.stock_claimed} of ${deal.stock_total} Units Left`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isSoldOut ? 'bg-rose-500 w-full' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      }`}
                      style={{ width: `${claimedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: PRODUCT SHOWCASE WITH SOLD OUT STAMP */}
            <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-6 bg-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative">
              {/* SLANTED BOLD "SOLD OUT" STAMP OVERLAY */}
              {isSoldOut && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden bg-white/70 rounded-3xl backdrop-blur-xs">
                  <div className="rotate-[-16deg] border-8 border-dashed border-rose-600 text-rose-600 bg-white px-8 py-3 rounded-2xl shadow-[0_15px_40px_rgba(225,29,72,0.3)] backdrop-blur-md">
                    <div className="text-4xl sm:text-6xl font-black tracking-widest uppercase font-mono drop-shadow-sm">
                      SOLD OUT
                    </div>
                    <div className="text-center text-xs font-black uppercase tracking-wider text-rose-700 -mt-1">
                      All Daily Deal Stock Claimed
                    </div>
                  </div>
                </div>
              )}

              {/* Product Photo */}
              <div className="relative w-full md:w-56 aspect-square rounded-2xl bg-white shadow-md overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center p-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deal.thumbnail}
                  alt={deal.product_name || deal.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
                />

                {/* Condition Pill */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                    {deal.is_used ? deal.condition_grade || '10/10 Mint' : 'Brand New'}
                  </span>
                </div>

                {/* PTA Badge */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                    {deal.pta_status || 'Official PTA'}
                  </span>
                </div>
              </div>

              {/* Deal Pricing & CTA */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    {deal.brand_name}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {deal.product_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{deal.storages?.join(' / ')}</span>
                    <span>•</span>
                    <span>{deal.colors?.join(', ')}</span>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 tracking-tight">
                      {formatPKR(price)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-sm font-bold text-slate-400 line-through">
                        {formatPKR(regularPrice)}
                      </span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-xs font-black text-rose-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>Save {formatPKR(discountAmount)} ({discountPercent}% OFF)</span>
                    </div>
                  )}
                </div>

                {/* Trust mini-points */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    100% Genuine IMEI
                  </span>
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    7 Days Warranty
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleInstantBuy}
                      disabled={isExpired || isSoldOut}
                      className={`py-3 px-4 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                        isExpired || isSoldOut
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                          : 'bg-slate-900 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{isSoldOut ? 'Sold Out' : isExpired ? 'Deal Expired' : 'Instant 1-Click Buy'}</span>
                    </button>

                    <button
                      onClick={handleAddToBag}
                      disabled={isExpired || isSoldOut}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-700" />
                      <span>Add to Bag</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Claim Deal on WhatsApp</span>
                    </a>

                    {deal.product_slug && (
                      <Link
                        href={`/phone/${deal.product_slug}`}
                        className="text-slate-600 font-bold hover:text-emerald-600 flex items-center gap-1"
                      >
                        <span>View 6 Angles & Specs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
