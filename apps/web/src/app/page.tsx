'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Tag,
  Headphones,
  Watch,
  Tablet,
  Plus,
  Compass,
} from 'lucide-react';
import { Product } from '../lib/types';
import { apiFetch, formatPKR } from '../lib/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import DealOfTheDaySection from '../components/DealOfTheDay';
import HeroSlider from '../components/HeroSlider';
import ShoppableReels from '../components/ShoppableReels';
import { useCart } from '../context/CartContext';
import SellPhoneModal from '../components/SellPhoneModal';

// OLX Pakistan Signature Circular Category Circles
const OLX_CATEGORIES = [
  {
    name: 'Mobiles',
    sub: '172 Models',
    mode: 'all',
    path: '/shop',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-[#002f34] shadow-xs group-hover:scale-110 group-hover:bg-[#002f34] group-hover:text-white transition-all">
        <Smartphone className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Brand New',
    sub: 'Box Pack',
    mode: 'new',
    path: '/shop?condition=new',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Used Phones',
    sub: '10/10 Mint',
    mode: 'used',
    path: '/shop?condition=used',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-700 shadow-xs group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
        <BatteryCharging className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Smart Watches',
    sub: 'Wearables',
    path: '/shop?search=watch',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        <Watch className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Accessories',
    sub: 'Earbuds & Cables',
    path: '/shop?search=buds',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-700 shadow-xs group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
        <Headphones className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Tablets & iPads',
    sub: 'Large Screens',
    path: '/shop?search=ipad',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-sky-700 shadow-xs group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
        <Tablet className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'PTA Approved',
    sub: 'DIRBS Verified',
    path: '/shop?pta=official',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-50 border-2 border-teal-300 flex items-center justify-center text-teal-800 shadow-xs group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all">
        <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    ),
  },
  {
    name: 'Sell Your Phone',
    sub: 'Instant Cash',
    isSell: true,
    path: '#sell',
    icon: (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 border-2 border-[#ffce32] flex items-center justify-center text-[#002f34] shadow-xs group-hover:scale-110 group-hover:bg-[#ffce32] transition-all">
        <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
      </div>
    ),
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phoneMode, setPhoneMode } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sellModalOpen, setSellModalOpen] = useState(false);

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
    <div className="space-y-8 pb-16 text-slate-900 bg-[#f7f8f8] min-h-screen">
      {/* 1. TOP PROMOTIONAL HERO CAROUSEL */}
      <HeroSlider />

      {/* 2. OLX SIGNATURE CIRCULAR CATEGORIES SECTION */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 px-1">
            Browse Popular Categories
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 text-center">
            {OLX_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (cat.isSell) {
                    setSellModalOpen(true);
                  } else if (cat.mode) {
                    setPhoneMode(cat.mode as any);
                    router.push(cat.path);
                  } else {
                    router.push(cat.path);
                  }
                }}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {cat.icon}
                <span className="font-bold text-xs text-slate-900 mt-2 group-hover:text-[#002f34] transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{cat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 24-HOUR DEAL OF THE DAY */}
      <DealOfTheDaySection />

      {/* 4. SHOPPABLE REELS */}
      <ShoppableReels />

      {/* 5. MAIN SECTION: "Fresh recommendations" (SIGNATURE OLX PAKISTAN FEED) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 space-y-5">
        {/* Section Heading & Quick Mode Switch */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#002f34] tracking-tight">
                Fresh recommendations
              </h2>
              <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                {totalCount} Ads
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified smartphones in Karachi, Star City Mall &amp; across Pakistan
            </p>
          </div>

          {/* Quick Active Mode Switch Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white p-1 rounded-md border border-slate-300 shadow-xs">
              <button
                onClick={() => setPhoneMode('all')}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  mode === 'all' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Ads
              </button>
              <button
                onClick={() => setPhoneMode('new')}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  mode === 'new' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brand New
              </button>
              <button
                onClick={() => setPhoneMode('used')}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  mode === 'used' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10/10 Used
              </button>
            </div>

            <Link
              href="/shop"
              className="px-3.5 py-2 rounded-md bg-[#002f34] hover:bg-[#003d44] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Full Shop</span>
            </Link>
          </div>
        </div>

        {/* Detailed Smartphone Filter Bar */}
        <FilterBar targetPath="/" />

        {/* OLX Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] bg-white rounded-lg animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Mobile Ads Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No smartphones match your current filter combination. Try resetting your filters to explore all models.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 rounded-md bg-[#002f34] text-white text-xs font-bold hover:bg-[#003d44] transition-all"
            >
              Reset Filters / Open Full Catalog
            </Link>
          </div>
        )}

        {/* Big OLX Load More / Explore Banner */}
        <div className="pt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-white border-2 border-[#002f34] hover:bg-[#002f34] hover:text-white text-[#002f34] text-sm font-black transition-all group cursor-pointer shadow-xs"
          >
            <span>Explore All 170+ Pakistani Smartphones in Full Shop</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 6. OLX APP PROMOTION BANNER (AUTHENTIC OLX PK STYLE) */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4">
        <div className="bg-[#ebeeef] border border-slate-300 rounded-xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="space-y-3 max-w-xl text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-1 rounded-sm">
              Free Classifieds in Pakistan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#002f34] tracking-tight">
              TRY THE CZNS MOBILE APP
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Buy, sell and find verified smartphones, box packed flagships, and certified 10/10 pre-owned phones anywhere in Pakistan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="px-3.5 py-2 rounded-md bg-[#002f34] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer">
                <span>Google Play Store</span>
              </div>
              <div className="px-3.5 py-2 rounded-md bg-[#002f34] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer">
                <span>Apple App Store</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden sm:block p-3 bg-white rounded-lg border border-slate-300 text-center shadow-xs">
              <div className="w-24 h-24 bg-slate-100 rounded-md flex items-center justify-center font-mono text-[10px] text-slate-400">
                [QR CODE]
              </div>
              <span className="text-[10px] font-bold text-slate-600 block mt-1">Scan to Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Post Ad / Sell Phone Modal */}
      <SellPhoneModal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading CZNS Mobile Hub...</div>}>
      <HomeContent />
    </Suspense>
  );
}
