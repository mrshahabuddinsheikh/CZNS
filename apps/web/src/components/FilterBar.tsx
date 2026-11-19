'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Sparkles, BatteryCharging, Shield, Check } from 'lucide-react';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMode = searchParams.get('mode') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentCondition = searchParams.get('condition') || 'all';
  const currentPta = searchParams.get('pta') || 'all';
  const currentBattery = searchParams.get('battery') || 'all';
  const currentStorage = searchParams.get('storage') || 'all';
  const currentSort = searchParams.get('sort') || 'popular';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/');
  };

  const hasActiveFilters =
    currentMode !== 'all' ||
    currentBrand !== 'all' ||
    currentCondition !== 'all' ||
    currentPta !== 'all' ||
    currentBattery !== 'all' ||
    currentStorage !== 'all';

  return (
    <div className="bg-czns-900/80 border border-czns-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-4">
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-emerald" />
          <span className="text-sm font-bold text-white tracking-wide">Smartphone Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-czns-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Phone Mode: New vs Used */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            Phone Condition
          </label>
          <select
            value={currentMode}
            onChange={(e) => updateParam('mode', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-emerald outline-none cursor-pointer"
          >
            <option value="all">All Phones</option>
            <option value="new">🟢 Brand New (Pin Pack)</option>
            <option value="used">🟡 Used (10/10 Mint)</option>
          </select>
        </div>

        {/* 2. PTA Status */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            PTA Status
          </label>
          <select
            value={currentPta}
            onChange={(e) => updateParam('pta', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-emerald outline-none cursor-pointer"
          >
            <option value="all">All PTA Statuses</option>
            <option value="Official PTA">Official PTA Approved</option>
            <option value="Non-PTA">Non-PTA / Factory Unlock</option>
            <option value="JV / Sim-Lock">JV / Sim-Lock</option>
            <option value="4-Month Sim Active">4-Month Active SIM</option>
          </select>
        </div>

        {/* 3. Battery Health Filter (Used Phones) */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            Battery Health
          </label>
          <select
            value={currentBattery}
            onChange={(e) => updateParam('battery', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-gold outline-none cursor-pointer"
          >
            <option value="all">Any Battery %</option>
            <option value="100">🔋 100% (Pin Pack / Pristine)</option>
            <option value="95">🔋 95% - 99%</option>
            <option value="90">🔋 90% - 94%</option>
            <option value="85">🔋 85% - 89%</option>
            <option value="80">🔋 80%+</option>
          </select>
        </div>

        {/* 4. Condition Grade */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            Cosmetic Grade
          </label>
          <select
            value={currentCondition}
            onChange={(e) => updateParam('condition', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-gold outline-none cursor-pointer"
          >
            <option value="all">Any Grade</option>
            <option value="Brand New">Brand New Sealed</option>
            <option value="10/10">10/10 Like New (Scratchless)</option>
            <option value="9.5/10">9.5/10 Flawless</option>
            <option value="9/10">9/10 Minor Scratches</option>
          </select>
        </div>

        {/* 5. Storage Capacity */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            Storage
          </label>
          <select
            value={currentStorage}
            onChange={(e) => updateParam('storage', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-emerald outline-none cursor-pointer"
          >
            <option value="all">All Storage Sizes</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>

        {/* 6. Sorting */}
        <div>
          <label className="text-[11px] font-semibold text-czns-400 block mb-1.5 uppercase tracking-wider">
            Sort By
          </label>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-emerald outline-none cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Latest Arrivals</option>
          </select>
        </div>
      </div>
    </div>
  );
}
