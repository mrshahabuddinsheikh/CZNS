'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Product } from '../lib/types';
import { apiFetch, formatPKR } from '../lib/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import ShoppableReels from '../components/ShoppableReels';
import { useCart } from '../context/CartContext';

function HomeContent() {
  const searchParams = useSearchParams();
  const { phoneMode, setPhoneMode } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const mode = searchParams.get('mode') || phoneMode;
  const brand = searchParams.get('brand');
  const condition = searchParams.get('condition');
  const pta = searchParams.get('pta');
  const battery = searchParams.get('battery');
  const storage = searchParams.get('storage');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (mode && mode !== 'all') query.set('mode', mode);
        if (brand && brand !== 'all') query.set('brand', brand);
        if (condition && condition !== 'all') query.set('condition', condition);
        if (pta && pta !== 'all') query.set('pta', pta);
        if (battery && battery !== 'all') query.set('battery', battery);
        if (storage && storage !== 'all') query.set('storage', storage);
        if (search) query.set('search', search);
        if (sort) query.set('sort', sort);

        const res = await apiFetch(`/api/v1/products?${query.toString()}`);
        setProducts(res.products || []);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [mode, brand, condition, pta, battery, storage, search, sort]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO SECTION WITH 2 PRIMARY PHONE MODES */}
      <section className="relative overflow-hidden bg-gradient-to-b from-czns-950 via-czns-900 to-czns-950 pt-8 pb-12 px-4 border-b border-czns-850">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-emerald/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-czns-850/90 border border-czns-700/80 text-xs font-semibold text-czns-200 shadow-md">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <span>Pakistan&apos;s #1 Smartphone Marketplace (Karachi COD Available)</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              The Smarter Way to Buy <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-emerald via-emerald-300 to-brand-gold bg-clip-text text-transparent">
                New & Certified Used Phones
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-czns-300 max-w-2xl mx-auto leading-relaxed">
              Choose between 100% factory-sealed phones with 1-Year Brand Warranty, or hand-inspected 10/10 Mint Pre-Owned devices with 🔋 Battery Health guarantee and 7 Days Checking Warranty.
            </p>

            {/* DUAL MODE HERO SELECTOR (Phase 1 Core Requirement) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
              {/* Option 1: New Phones */}
              <button
                onClick={() => setPhoneMode('new')}
                className={`w-full sm:w-1/2 p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
                  phoneMode === 'new'
                    ? 'bg-gradient-to-br from-emerald-950/60 to-czns-900 border-brand-emerald shadow-xl shadow-emerald-950/40 ring-1 ring-brand-emerald'
                    : 'bg-czns-900/60 border-czns-800 hover:border-brand-emerald/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase text-brand-emerald">
                    <Sparkles className="w-4 h-4" />
                    Option 1: New Phones
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
                </div>
                <div className="text-sm font-extrabold text-white">Box Packed / Pin Pack</div>
                <p className="text-[11px] text-czns-400 mt-1">
                  1-Year Official Warranty (Mercantile, Airlink) • Official PTA Approved
                </p>
              </button>

              {/* Option 2: Used Phones */}
              <button
                onClick={() => setPhoneMode('used')}
                className={`w-full sm:w-1/2 p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
                  phoneMode === 'used'
                    ? 'bg-gradient-to-br from-amber-950/60 to-czns-900 border-brand-gold shadow-xl shadow-amber-950/40 ring-1 ring-brand-gold'
                    : 'bg-czns-900/60 border-czns-800 hover:border-brand-gold/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase text-brand-gold">
                    <BatteryCharging className="w-4 h-4" />
                    Option 2: Used Phones
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                </div>
                <div className="text-sm font-extrabold text-white">10/10 Mint Certified</div>
                <p className="text-[11px] text-czns-400 mt-1">
                  Battery Health % • 7 Days Replacement Warranty • PTA & Non-PTA
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOPPABLE REELS CAROUSEL (Phase 5 Feature 1) */}
      <ShoppableReels />

      {/* 3. MAIN PRODUCT CATALOG & FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Dynamic Mode Heading & Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-czns-850">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {mode === 'new'
                  ? '🟢 Brand New Phones (Pin Packed / Official Warranty)'
                  : mode === 'used'
                  ? '🟡 Certified Used Phones (10/10 Mint & Battery Health)'
                  : 'All Available Smartphones'}
              </h2>
              <span className="text-xs bg-czns-800 text-czns-300 px-2 py-0.5 rounded-full font-bold">
                {totalCount} Models
              </span>
            </div>
            <p className="text-xs text-czns-400 mt-1">
              {mode === 'used'
                ? 'Every used smartphone passes our 30-point hardware testing before dispatch.'
                : '100% factory sealed original stock with verified PTA status.'}
            </p>
          </div>

          {/* Quick Active Mode Switch Buttons */}
          <div className="flex items-center bg-czns-900 p-1 rounded-xl border border-czns-800">
            <button
              onClick={() => setPhoneMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                mode === 'all' ? 'bg-czns-800 text-white' : 'text-czns-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPhoneMode('new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                mode === 'new' ? 'bg-brand-emerald text-czns-950 font-bold' : 'text-czns-400'
              }`}
            >
              New Only
            </button>
            <button
              onClick={() => setPhoneMode('used')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                mode === 'used' ? 'bg-brand-gold text-czns-950 font-bold' : 'text-czns-400'
              }`}
            >
              Used Only
            </button>
          </div>
        </div>

        {/* Detailed Smartphone Filter Bar (Phase 1 & 2) */}
        <FilterBar />

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] bg-czns-900/60 rounded-2xl animate-pulse border border-czns-800"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-czns-900/50 border border-czns-800 rounded-3xl p-12 text-center text-czns-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-czns-850 flex items-center justify-center mx-auto text-czns-500">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Phones Found</h3>
              <p className="text-xs text-czns-400 mt-1 max-w-md mx-auto">
                No smartphones match your current filter combination. Try clearing filters or searching for another model.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-brand-emerald text-czns-950 text-xs font-bold hover:bg-emerald-400"
            >
              Reset All Filters
            </Link>
          </div>
        )}
      </section>

      {/* 4. TRUST BADGES & CZNS PROMISE SECTION (Phase 3 & 5) */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-czns-900 via-czns-850 to-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-brand-emerald text-xs font-bold uppercase tracking-wider">
              Quality Assurance Laboratory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Pakistan Trusts CZNS For Flagship Smartphones
            </h2>
            <p className="text-xs sm:text-sm text-czns-300 leading-relaxed">
              Every pre-owned phone sold at CZNS undergoes our mandatory 30-Point Hardware Inspection: True Tone display check, Face ID / In-Display fingerprint sensitivity, 🔋 Battery health verification, camera sensors clarity, and PTA clean status.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2 text-xs text-white">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>100% Original Non-Repaired Parts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>7 Days Replacement Checking Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Lifetime IMEI / PTA Non-Block Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Rider Cash on Delivery in Karachi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED CUSTOMER REVIEWS WALL (Phase 5 Feature 5) */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="text-white ml-1">4.9 / 5.0 (450+ Verified Orders)</span>
          </div>
          <h2 className="text-2xl font-black text-white">Real Pakistani Buyers, Real Experiences</h2>
          <p className="text-xs text-czns-400">
            Reviews from verified customers across Karachi, Lahore, Islamabad, and nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-czns-900 border border-czns-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded-full font-bold">
                Verified Buyer
              </span>
            </div>
            <p className="text-xs text-czns-200 leading-relaxed italic">
              &quot;Ordered iPhone 15 Pro 128GB Used 10/10. Received same day in Karachi via rider. Battery health was exactly 93% as described! Face ID and True Tone working 100%. Highly recommended store.&quot;
            </p>
            <div className="pt-2 border-t border-czns-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Usman Tariq</span>
              <span className="text-czns-400 text-[11px]">Karachi (Gulshan-e-Iqbal)</span>
            </div>
          </div>

          <div className="bg-czns-900 border border-czns-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded-full font-bold">
                Verified Buyer
              </span>
            </div>
            <p className="text-xs text-czns-200 leading-relaxed italic">
              &quot;Paid advance via Meezan Bank IBFT. Got TCS tracking within 3 hours. Received 100% genuine factory sealed pin pack iPhone with official Mercantile warranty slip. Excellent customer service on WhatsApp.&quot;
            </p>
            <div className="pt-2 border-t border-czns-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Hamza Sheikh</span>
              <span className="text-czns-400 text-[11px]">Lahore (DHA Phase 5)</span>
            </div>
          </div>

          <div className="bg-czns-900 border border-czns-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded-full font-bold">
                Verified Buyer
              </span>
            </div>
            <p className="text-xs text-czns-200 leading-relaxed italic">
              &quot;Airlink warranty verified directly on Samsung Pakistan portal. Packing was bulletproof with bubble wrap. CZNS is the only authentic store I trust in Pakistan for flagships.&quot;
            </p>
            <div className="pt-2 border-t border-czns-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Dr. Bilal Qureshi</span>
              <span className="text-czns-400 text-[11px]">Islamabad (F-7)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-xs text-czns-400">Loading CZNS Mobile Store...</div>}>
      <HomeContent />
    </Suspense>
  );
}
