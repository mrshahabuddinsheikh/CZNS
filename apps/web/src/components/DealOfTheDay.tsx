'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Zap,
  Clock,
  PhoneCall,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
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

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isExpired = secondsLeft <= 0 || deal.is_expired;
  const isSoldOut = deal.is_sold_out === 1 || deal.stock_total <= deal.stock_claimed;

  const price = deal.deal_price;
  const regularPrice = deal.regular_price || price + 25000;
  const discountAmount = regularPrice - price;
  const discountPercent = Math.round((discountAmount / regularPrice) * 100);

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
    <section className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
      {/* SIMPLE, CLEAN, ELEGANT GLASS CONTAINER */}
      <div className="relative rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-white/80 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] overflow-hidden p-4 sm:p-7 text-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center">
          {/* Left Column: Deal Badge, Title, Price, Countdown & Buttons */}
          <div className="md:col-span-8 space-y-4">
            {/* Top Micro-Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>24-Hour Flash Deal</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                {deal.stock_total - deal.stock_claimed} Units Remaining
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-[#7e0119]">Karachi COD Available</span>
            </div>

            {/* Title */}
            <div>
              <Link href={`/phone/${deal.product_slug || 'deal'}`} className="hover:text-[#7e0119] transition-colors">
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {deal.product_name || deal.title}
                </h2>
              </Link>
            </div>

            {/* Pricing & Digital Countdown Timer */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {/* Price */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Flash Price</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#7e0119] font-mono tracking-tight">
                    {formatPKR(price)}
                  </span>
                  {regularPrice > price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPKR(regularPrice)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-black bg-rose-100 text-[#7e0119] px-2 py-0.5 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-slate-100/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-black text-slate-900">
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs">
                    {String(hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs">
                    {String(minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs text-rose-600">
                    {String(seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Clean Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleInstantBuy}
                disabled={isExpired || isSoldOut}
                className="px-6 py-3 rounded-xl bg-[#7e0119] hover:bg-[#610012] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Buy Flash Deal Now</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#7e0119]" />
                <span>WhatsApp Claim</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Product Image with Badge */}
          <div className="md:col-span-4 flex items-center justify-center relative">
            <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-slate-50/90 border border-slate-200 p-3 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deal.thumbnail}
                alt={deal.product_name || deal.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-2 bg-white/95 text-slate-800 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {deal.pta_status || 'Official PTA'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
