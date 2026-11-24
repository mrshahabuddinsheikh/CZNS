'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  ShoppingBag,
  Award,
  Lock,
  Compass,
} from 'lucide-react';
import { Product } from '../lib/types';
import { apiFetch, formatPKR } from '../lib/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import ShoppableReels from '../components/ShoppableReels';
import DealOfTheDaySection from '../components/DealOfTheDay';
import HeroSlider from '../components/HeroSlider';
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
    <div className="space-y-10 pb-20 text-slate-900">
      {/* 1. COMMERCIAL HERO SLIDER BANNER */}
      <HeroSlider />

      {/* 2. DEAL OF THE DAY (24-Hour Flash Deal with Expiry & Sold Out Stamp) */}
      <DealOfTheDaySection />

      {/* 3. SHOPPABLE REELS CAROUSEL */}
      <ShoppableReels />

      {/* 4. FEATURED CATALOG PREVIEW WITH FILTER BAR */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 space-y-6">
        {/* Dynamic Mode Heading & Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mode === 'new'
                  ? '🟢 Brand New Smartphones (Box Packed)'
                  : mode === 'used'
                  ? '🟡 Certified Used Smartphones (10/10 Mint)'
                  : 'Featured Smartphone Catalog'}
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                {totalCount} Models
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'used'
                ? 'Every pre-owned phone passes our 30-point diagnostic test with guaranteed battery health.'
                : '100% factory sealed original box-packed stock with official brand warranty & PTA clearance.'}
            </p>
          </div>

          {/* Quick Active Mode Switch Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setPhoneMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPhoneMode('new')}
                style={{
                  backgroundColor: mode === 'new' ? 'var(--primary-color, #10b981)' : undefined,
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'new' ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Only
              </button>
              <button
                onClick={() => setPhoneMode('used')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'used' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Used Only
              </button>
            </div>

            <Link
              href="/shop"
              className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Go to</span> Full Shop
            </Link>
          </div>
        </div>

        {/* Detailed Smartphone Filter Bar */}
        <FilterBar targetPath="/" />

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Phones Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No smartphones match your current filter combination. Try resetting your filters to explore all models.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow-md transition-all"
            >
              Open Full Shop Catalog
            </Link>
          </div>
        )}

        {/* Big Banner to Full Shop */}
        <div className="pt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-slate-900 text-sm font-black shadow-md hover:shadow-xl transition-all group active:scale-95"
          >
            <span>Explore All 150+ Pakistani Smartphones in Full Shop</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 5. TRUST BADGES & CZNS PROMISE SECTION */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-slate-50 border border-emerald-200/80 rounded-[28px] sm:rounded-[36px] p-6 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
              CZNS Quality Assurance Protocol
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              30-Point Diagnostic Testing Before Any Phone Leaves Our Facility
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every certified used phone is tested for original OLED display, TrueTone, Face ID / In-Display Fingerprint, camera sensors, 5G antennas, and genuine battery health. Plus, get an unconditional 7-Day Checking Warranty for complete peace of mind.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white/90 px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Physical IMEI Verification on PTA DIRBS
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white/90 px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Karachi 24h Express COD with Safe Packaging
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
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading CZNS Mobile Store...</div>}>
      <HomeContent />
    </Suspense>
  );
}
