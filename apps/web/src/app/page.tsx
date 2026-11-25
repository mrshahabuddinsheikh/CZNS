'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  LayoutGrid,
  List,
  Compass,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../lib/types';
import { apiFetch, formatPKR } from '../lib/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import DealOfTheDaySection from '../components/DealOfTheDay';
import ShoppableReels from '../components/ShoppableReels';
import { useCart } from '../context/CartContext';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phoneMode, setPhoneMode } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleSelectMode = (newMode: 'all' | 'new' | 'used') => {
    setPhoneMode(newMode);
    if (newMode === 'all') {
      router.push('/');
    } else {
      router.push(`/?mode=${newMode}`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 text-slate-900 min-h-screen">
      {/* 1. DIRECT DEAL OF THE DAY IN SIMPLE CLEAN GLASS UI (HERO REMOVED) */}
      <DealOfTheDaySection />

      {/* 2. THE 2 EXCLUSIVE CATEGORY OPTIONS (REPLACES PREVIOUS 8 CIRCLES AS SHOWN IN USER'S 2ND IMAGE) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {/* OPTION 1: BRAND NEW SMARTPHONES */}
          <div
            onClick={() => handleSelectMode('new')}
            className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 backdrop-blur-2xl border transition-all duration-300 cursor-pointer shadow-xs ${
              mode === 'new'
                ? 'bg-gradient-to-br from-emerald-500/10 via-white/90 to-teal-500/10 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Option 1: Factory Sealed
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Brand New Phones
                </h3>
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                  100% factory sealed pin-pack phones with 1-Year official brand warranty (Mercantile, Airlink) &amp; official PTA approval.
                </p>
              </div>

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Sparkles className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View Brand New Stock</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* OPTION 2: CERTIFIED USED SMARTPHONES */}
          <div
            onClick={() => handleSelectMode('used')}
            className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 backdrop-blur-2xl border transition-all duration-300 cursor-pointer shadow-xs ${
              mode === 'used'
                ? 'bg-gradient-to-br from-amber-500/10 via-white/90 to-yellow-500/10 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Option 2: 10/10 Mint Pre-Owned
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-amber-800 transition-colors">
                  Certified Used Phones
                </h3>
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                  30-point diagnostic tested devices with guaranteed genuine battery health &amp; 7-day checking replacement warranty.
                </p>
              </div>

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <BatteryCharging className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>View Certified Used Stock</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIRECT MOBILE PHONES CATALOG ("FRESH RECOMMENDATIONS" WITH LIST VIEW / CARD VIEW TOGGLE) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 space-y-4 sm:space-y-5">
        {/* Section Header with List View / Card View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#002f34] tracking-tight">
                {mode === 'new'
                  ? 'Brand New Phones (Box Packed)'
                  : mode === 'used'
                  ? 'Certified Used Phones (10/10 Mint)'
                  : 'Fresh recommendations'}
              </h2>
              <span className="text-xs bg-slate-200/80 text-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                {totalCount} Models
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified smartphones at Star City Mall Saddar, Karachi &amp; nationwide express delivery
            </p>
          </div>

          {/* Controls: Mode filter + View Mode Switcher (List vs Card) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Mode switch pills */}
            <div className="flex items-center bg-white/90 p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => handleSelectMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'all' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleSelectMode('new')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'new' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New
              </button>
              <button
                onClick={() => handleSelectMode('used')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'used' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Used
              </button>
            </div>

            {/* LIST VIEW OR CARD VIEW TOGGLE (USER DEMAND) */}
            <div className="flex items-center bg-white/90 p-1 rounded-xl border border-slate-200 shadow-xs" title="Toggle List / Card View">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-[#002f34] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Card</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-[#002f34] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
            </div>

            <Link
              href="/shop"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#002f34] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Full Shop</span>
            </Link>
          </div>
        </div>

        {/* Detailed Smartphone Filter Bar */}
        <FilterBar targetPath="/" />

        {/* Products Grid or List Container */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className={viewMode === 'grid' ? 'aspect-[3/4] bg-white/60 rounded-xl animate-pulse border border-slate-200' : 'h-32 bg-white/60 rounded-xl animate-pulse border border-slate-200'}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3 sm:gap-4'}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-10 text-center text-slate-500 space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Mobile Models Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No smartphones match your current filter combination. Try resetting your filters.
              </p>
            </div>
            <button
              onClick={() => handleSelectMode('all')}
              className="inline-block px-4 py-2 rounded-xl bg-[#002f34] text-white text-xs font-bold hover:bg-[#003d44] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Big Explore Banner */}
        <div className="pt-4 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-white/90 backdrop-blur-xl border-2 border-[#002f34] hover:bg-[#002f34] hover:text-white text-[#002f34] text-xs sm:text-sm font-black transition-all group shadow-xs cursor-pointer"
          >
            <span>Explore All 170+ Phones in Full Shop Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 4. SHOPPABLE REELS CAROUSEL (PLACED AFTER PRODUCTS AS REQUESTED: "reel last me aae") */}
      <ShoppableReels />

      {/* 5. TRUST SIGNALS & PROTOCOL (COMPACT & SAFE ON MOBILE SO NO OVERLAP WITH CHATBOT) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-2 pb-24 sm:pb-8">
        <div className="backdrop-blur-2xl bg-white/75 border border-white/80 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                CZN&apos;S Assurance
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                30-Point Diagnostic Check Before Any Phone Leaves Star City Mall Desk
              </h4>
              <p className="text-[11px] text-slate-600 max-w-xl">
                Every phone has verified PTA DIRBS status, genuine battery health, and unconditioned 7-day replacement warranty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PTA Approved
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <Truck className="w-3 h-3 text-emerald-600" />
                Karachi COD
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading CZN&apos;S Mobile Store...</div>}>
      <HomeContent />
    </Suspense>
  );
}
