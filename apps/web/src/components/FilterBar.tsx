'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Sparkles, BatteryCharging, Shield, Check, Sliders, ChevronDown } from 'lucide-react';
import { formatPKR } from '../lib/api';

export default function FilterBar({ targetPath = '/shop' }: { targetPath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMode = searchParams.get('mode') || searchParams.get('condition') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentPta = searchParams.get('pta') || 'all';
  const currentBattery = searchParams.get('battery') || 'all';
  const currentStorage = searchParams.get('storage') || 'all';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentMaxPrice = searchParams.get('max_price') || '600000';

  const [sliderMax, setSliderMax] = useState<number>(parseInt(currentMaxPrice, 10) || 600000);

  useEffect(() => {
    if (searchParams.get('max_price')) {
      setSliderMax(parseInt(searchParams.get('max_price')!, 10));
    } else {
      setSliderMax(600000);
    }
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === '') {
      params.delete(key);
      if (key === 'mode') params.delete('condition');
    } else {
      params.set(key, value);
      if (key === 'mode') params.set('condition', value);
    }
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handleSliderChange = (newMax: number) => {
    setSliderMax(newMax);
    const params = new URLSearchParams(searchParams.toString());
    if (newMax >= 600000) {
      params.delete('max_price');
    } else {
      params.set('max_price', newMax.toString());
    }
    router.push(`${targetPath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(targetPath);
  };

  const hasActiveFilters =
    (currentMode !== 'all' && currentMode !== '') ||
    currentBrand !== 'all' ||
    currentPta !== 'all' ||
    currentBattery !== 'all' ||
    currentStorage !== 'all' ||
    searchParams.has('max_price');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 text-slate-900 shadow-xs">
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-teal-50 text-[#002f34] border border-teal-200">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-sm font-black text-[#002f34] tracking-wide">
            Filter Mobile Ads &amp; Budget Range
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-md border border-rose-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Grid of selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Phone Mode: New vs Used */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Condition
          </label>
          <div className="relative">
            <select
              value={currentMode}
              onChange={(e) => updateParam('mode', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-[#002f34] outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Phones</option>
              <option value="new">🟢 Brand New (Pin Pack)</option>
              <option value="used">🟡 Used (10/10 Mint)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Brand */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Brand
          </label>
          <div className="relative">
            <select
              value={currentBrand}
              onChange={(e) => updateParam('brand', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-[#002f34] outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Brands</option>
              <option value="apple">Apple (iPhone)</option>
              <option value="samsung">Samsung</option>
              <option value="google-pixel">Google Pixel</option>
              <option value="xiaomi">Xiaomi / Redmi</option>
              <option value="oneplus">OnePlus</option>
              <option value="vivo">Vivo</option>
              <option value="oppo">Oppo</option>
              <option value="motorola">Motorola</option>
              <option value="infinix">Infinix</option>
              <option value="tecno">Tecno</option>
              <option value="nokia">Nokia</option>
              <option value="nothing">Nothing Phone</option>
              <option value="honor">Honor</option>
              <option value="realme">Realme</option>
              <option value="zte">ZTE</option>
              <option value="itel">ITel</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. PTA Approval */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
            PTA Status
          </label>
          <div className="relative">
            <select
              value={currentPta}
              onChange={(e) => updateParam('pta', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-[#002f34] outline-none cursor-pointer appearance-none"
            >
              <option value="all">Any PTA Status</option>
              <option value="official">Official PTA Approved</option>
              <option value="non-pta">Non-PTA / Factory Unlock</option>
              <option value="jv">JV / SIM-Lock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Battery Health (Used Phones) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
            <span>Battery Health</span>
            <span className="text-[9px] text-amber-600 font-extrabold">Pre-Owned</span>
          </label>
          <div className="relative">
            <select
              value={currentBattery}
              onChange={(e) => updateParam('battery', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-[#002f34] outline-none cursor-pointer appearance-none"
            >
              <option value="all">Any Health %</option>
              <option value="95-100">95% – 100% (Mint)</option>
              <option value="90-94">90% – 94% (Great)</option>
              <option value="85-89">85% – 89% (Good)</option>
              <option value="80-84">80% – 84%</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 5. Storage */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Storage
          </label>
          <div className="relative">
            <select
              value={currentStorage}
              onChange={(e) => updateParam('storage', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-[#002f34] outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Capacities</option>
              <option value="64GB">64GB</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interactive Price Range Slider */}
      <div className="pt-2 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">Max Budget Slider:</span>
          </div>
          <div
            style={{ color: 'var(--primary-color, #10b981)' }}
            className="font-mono font-black text-sm"
          >
            {sliderMax >= 600000 ? 'All Budgets (Up to Rs. 600,000+)' : formatPKR(sliderMax)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-mono">Rs. 10k</span>
          <input
            type="range"
            min="10000"
            max="600000"
            step="10000"
            value={sliderMax}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002f34]"
          />
          <span className="text-[10px] text-slate-400 font-mono">Rs. 600k+</span>
        </div>
      </div>
    </div>
  );
}
