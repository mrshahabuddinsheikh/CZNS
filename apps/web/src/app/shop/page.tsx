'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  Search,
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Check,
  Smartphone,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { Product } from '../../lib/types';
import { apiFetch, formatPKR } from '../../lib/api';
import ProductCard from '../../components/ProductCard';

const BRANDS = [
  { name: 'Apple (iPhone)', slug: 'apple' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Google Pixel', slug: 'google-pixel' },
  { name: 'Xiaomi / Redmi', slug: 'xiaomi' },
  { name: 'OnePlus', slug: 'oneplus' },
  { name: 'Vivo', slug: 'vivo' },
  { name: 'Oppo', slug: 'oppo' },
  { name: 'Motorola', slug: 'motorola' },
  { name: 'Infinix', slug: 'infinix' },
  { name: 'Tecno', slug: 'tecno' },
  { name: 'Nokia', slug: 'nokia' },
  { name: 'Nothing Phone', slug: 'nothing' },
  { name: 'Honor', slug: 'honor' },
  { name: 'Realme', slug: 'realme' },
  { name: 'ZTE', slug: 'zte' },
  { name: 'ITel', slug: 'itel' },
];

const PTA_OPTIONS = [
  { label: 'All PTA Types', value: 'all' },
  { label: 'Official PTA Approved', value: 'Official PTA' },
  { label: 'Non-PTA / Factory Unlock', value: 'Non-PTA' },
  { label: 'JV / Sim-Lock', value: 'JV / Sim-Lock' },
];

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];

const BATTERY_OPTIONS = [
  { label: 'Any Health', value: 'all' },
  { label: '95% - 100% (Mint)', value: '95' },
  { label: '90% - 94% (High)', value: '90' },
  { label: '85% - 89% (Good)', value: '85' },
];

const PRICE_TIERS = [
  { label: 'Under 100k', max: 100000 },
  { label: '100k - 200k', max: 200000 },
  { label: '200k - 350k', max: 350000 },
  { label: '350k - 500k', max: 500000 },
  { label: 'All Budgets', max: 600000 },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active query parameters
  const condition = searchParams.get('condition') || searchParams.get('mode') || 'all';
  const brand = searchParams.get('brand') || 'all';
  const pta = searchParams.get('pta') || 'all';
  const battery = searchParams.get('battery') || 'all';
  const storage = searchParams.get('storage') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';
  const maxPrice = searchParams.get('max_price') || '600000';

  // Slider state
  const [sliderPrice, setSliderPrice] = useState<number>(parseInt(maxPrice, 10) || 600000);

  useEffect(() => {
    if (searchParams.get('max_price')) {
      setSliderPrice(parseInt(searchParams.get('max_price')!, 10));
    } else {
      setSliderPrice(600000);
    }
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === '') {
      params.delete(key);
      if (key === 'condition') params.delete('mode');
    } else {
      params.set(key, value);
      if (key === 'condition') params.set('mode', value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const updatePriceSlider = (val: number) => {
    setSliderPrice(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val >= 600000) {
      params.delete('max_price');
    } else {
      params.set('max_price', val.toString());
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters =
    (condition !== 'all' && condition !== '') ||
    brand !== 'all' ||
    pta !== 'all' ||
    battery !== 'all' ||
    storage !== 'all' ||
    search !== '' ||
    searchParams.has('max_price');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (condition && condition !== 'all') query.set('mode', condition);
        if (brand && brand !== 'all') query.set('brand', brand);
        if (pta && pta !== 'all') query.set('pta', pta);
        if (battery && battery !== 'all') query.set('battery', battery);
        if (storage && storage !== 'all') query.set('storage', storage);
        if (search) query.set('search', search);
        if (sort) query.set('sort', sort);
        if (maxPrice && parseInt(maxPrice, 10) < 600000) query.set('max_price', maxPrice);

        const res = await apiFetch(`/api/v1/products?${query.toString()}`);
        setProducts(res.products || []);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.error('Failed to load shop products', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [condition, brand, pta, battery, storage, search, sort, maxPrice]);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 text-slate-900">
      {/* 1. SHOP HEADER & BREADCRUMBS */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-800">Shop All Smartphones</span>
        </div>

        {/* Page Title & Condition Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Smartphone Catalog
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 shadow-xs">
                {totalCount} Available
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore 100% Genuine Box-Packed with Official Brand Warranty and 10/10 Pre-Owned with 7-Day Guarantee.
            </p>
          </div>

          {/* Condition Switch Tabs */}
          <div className="flex items-center bg-slate-100/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto shadow-xs">
            <button
              onClick={() => updateParam('condition', 'all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                condition === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Phones
            </button>
            <button
              onClick={() => updateParam('condition', 'new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                condition === 'new'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-emerald-700 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New (Pin Pack)</span>
            </button>
            <button
              onClick={() => updateParam('condition', 'used')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                condition === 'used'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-amber-800 hover:bg-white'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>Used (10/10 Mint)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE FILTERS & SORT BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-2xl p-3.5 rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-slate-800">
        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
        </button>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Active:</span>

          {condition !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              {condition === 'new' ? 'Brand New' : '10/10 Mint Used'}
              <button onClick={() => updateParam('condition', 'all')}>
                <X className="w-3 h-3 hover:text-emerald-900" />
              </button>
            </span>
          )}

          {brand !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-xs">
              Brand: {brand}
              <button onClick={() => updateParam('brand', 'all')}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {searchParams.has('max_price') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Max: {formatPKR(sliderPrice)}
              <button onClick={() => updatePriceSlider(600000)}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {pta !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              PTA: {pta}
              <button onClick={() => updateParam('pta', 'all')}>
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </span>
          )}

          {battery !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              Battery: {battery}%+
              <button onClick={() => updateParam('battery', 'all')}>
                <X className="w-3 h-3 hover:text-amber-950" />
              </button>
            </span>
          )}

          {storage !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
              {storage}
              <button onClick={() => updateParam('storage', 'all')}>
                <X className="w-3 h-3 hover:text-purple-900" />
              </button>
            </span>
          )}

          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
              &quot;{search}&quot;
              <button onClick={() => updateParam('search', '')}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline ml-2 cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 hidden sm:inline">Sort by:</label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:border-emerald-500 outline-none cursor-pointer pr-7 appearance-none shadow-xs"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. MAIN SHOP LAYOUT: SIDEBAR + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP ADVANCED FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 bg-white/80 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Filters
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter 1: Brand */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Brand / Manufacturer
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
              <button
                onClick={() => updateParam('brand', 'all')}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  brand === 'all'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>All Brands</span>
                {brand === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              {BRANDS.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => updateParam('brand', b.slug)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    brand === b.slug
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{b.name}</span>
                  {brand === b.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Price Range Slider */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Price Range (PKR)
              </h3>
              <span className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {sliderPrice >= 600000 ? 'Any Price' : `Up to ${formatPKR(sliderPrice)}`}
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="10000"
                max="600000"
                step="10000"
                value={sliderPrice}
                onChange={(e) => setSliderPrice(parseInt(e.target.value, 10))}
                onMouseUp={(e) => updatePriceSlider(parseInt((e.target as HTMLInputElement).value, 10))}
                onTouchEnd={(e) => updatePriceSlider(parseInt((e.target as HTMLInputElement).value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rs. 10k</span>
                <span>Rs. 300k</span>
                <span>Rs. 600k+</span>
              </div>
            </div>

            {/* Quick price chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  onClick={() => updatePriceSlider(tier.max)}
                  className={`p-2 rounded-xl text-[10px] font-bold transition-all text-center border cursor-pointer ${
                    sliderPrice === tier.max
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: PTA Status */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              PTA Approval Status
            </h3>
            <div className="space-y-1">
              {PTA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam('pta', opt.value)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    pta === opt.value
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                  {pta === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 4: Storage */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Storage Capacity
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => updateParam('storage', 'all')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  storage === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {STORAGE_OPTIONS.map((st) => (
                <button
                  key={st}
                  onClick={() => updateParam('storage', st)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    storage === st
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 5: Battery Health (for Used phones) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Battery Health %
              </h3>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Pre-Owned
              </span>
            </div>
            <div className="space-y-1">
              {BATTERY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam('battery', opt.value)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    battery === opt.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                  {battery === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID AREA */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="bg-white/80 border border-slate-200 backdrop-blur-2xl rounded-3xl p-12 text-center text-slate-500 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No Smartphones Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  We couldn&apos;t find any phones matching your chosen filter criteria. Try adjusting your price slider or resetting your filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="w-screen max-w-sm bg-white border-l border-slate-200 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-900"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-base font-black text-slate-900">Filter Smartphones</h3>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Condition</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['all', 'new', 'used'].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateParam('condition', c)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border cursor-pointer ${
                            condition === c
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {c === 'all' ? 'All' : c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Slider Mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Price Range</span>
                      <span className="text-emerald-700 font-mono font-black">{formatPKR(sliderPrice)}</span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="600000"
                      step="10000"
                      value={sliderPrice}
                      onChange={(e) => updatePriceSlider(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Brand</label>
                    <select
                      value={brand}
                      onChange={(e) => updateParam('brand', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="all">All Brands</option>
                      {BRANDS.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PTA Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">PTA Status</label>
                    <select
                      value={pta}
                      onChange={(e) => updateParam('pta', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                    >
                      {PTA_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Storage */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Storage</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STORAGE_OPTIONS.map((st) => (
                        <button
                          key={st}
                          onClick={() => updateParam('storage', st)}
                          className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            storage === st
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Apply Filters ({totalCount} Phones)
                  </button>
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-slate-500">Loading Shop Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
