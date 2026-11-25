'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Sparkles,
  BatteryCharging,
  PhoneCall,
  MapPin,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';
import CznsLogo from './CznsLogo';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalItems, setIsCartOpen, phoneMode, setPhoneMode } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentMode = searchParams.get('mode') || searchParams.get('condition') || phoneMode;

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search suggestion debouncer
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error('Search suggestion error', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectMode = (mode: 'new' | 'used') => {
    setPhoneMode(mode);
    router.push(`/shop?condition=${mode}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full select-none">
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <div className="bg-[#002f34] text-white text-[11px] font-medium py-1.5 px-3 sm:px-6 border-b border-teal-900/40">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold tracking-wider text-[#ffce32] uppercase">
              CZN&apos;S Certified Mobile Store
            </span>
            <span className="hidden sm:inline text-teal-400">•</span>
            <span className="hidden sm:inline text-slate-200">Official PTA DIRBS Approved &amp; 100% Genuine</span>
            <span className="hidden md:inline text-teal-400">•</span>
            <span className="hidden md:inline text-teal-200">Star City Mall Saddar Desk, Karachi</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="text-[#ffce32] font-bold">Same-Day COD</span>
            <span>•</span>
            <Link href="/track-order" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span>•</span>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-300 text-emerald-400 font-bold flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>WhatsApp Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER WITH FROSTED GLASS EFFECT */}
      <div className="backdrop-blur-2xl bg-white/85 border-b border-white/60 shadow-[0_4px_30px_rgba(0,47,52,0.04)] py-3 px-3 sm:px-6 transition-all">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Custom CZN'S Logo */}
          <CznsLogo size="sm" className="sm:scale-105" />

          {/* Center: THE 2 EXCLUSIVE OPTIONS (USED PHONE OR NEW PHONE JUST) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Option 1: New Phone Button */}
            <button
              onClick={() => handleSelectMode('new')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                currentMode === 'new'
                  ? 'bg-emerald-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] scale-102 ring-2 ring-emerald-400/40'
                  : 'bg-white/80 hover:bg-emerald-50 text-slate-800 border border-slate-200/90 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${currentMode === 'new' ? 'text-white' : 'text-emerald-600'}`} />
              <span className="whitespace-nowrap">New</span>
              <span className="hidden xs:inline whitespace-nowrap">Phone</span>
              <span className={`hidden md:inline text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                currentMode === 'new' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Box Pack
              </span>
            </button>

            {/* Option 2: Used Phone Button */}
            <button
              onClick={() => handleSelectMode('used')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                currentMode === 'used'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)] scale-102 ring-2 ring-amber-300/60'
                  : 'bg-white/80 hover:bg-amber-50 text-slate-800 border border-slate-200/90 hover:border-amber-300 shadow-xs'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <BatteryCharging className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${currentMode === 'used' ? 'text-slate-950' : 'text-amber-600'}`} />
              <span className="whitespace-nowrap">Used</span>
              <span className="hidden xs:inline whitespace-nowrap">Phone</span>
              <span className={`hidden md:inline text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                currentMode === 'used' ? 'bg-black/15 text-slate-950' : 'bg-amber-100 text-amber-800'
              }`}>
                10/10 Mint
              </span>
            </button>
          </div>

          {/* Right: Search Bar & Cart Bag */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Search Input with Dropdown */}
            <div ref={searchRef} className="relative">
              {/* Desktop Full Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search phones..."
                  className="w-48 md:w-64 bg-slate-100/90 border border-slate-200 rounded-full py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#002f34] focus:ring-2 focus:ring-[#002f34]/10 transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>

              {/* Mobile Search Icon Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="sm:hidden p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Autocomplete Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-11 w-72 sm:w-80 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 text-slate-800 space-y-1 max-h-72 overflow-y-auto no-scrollbar"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 mb-1">
                      Phones in Stock ({suggestions.length})
                    </div>
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/phone/${item.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-8 h-8 object-contain rounded-lg bg-slate-50 border border-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.is_used ? '10/10 Mint' : 'Brand New'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-700">
                          {formatPKR(item.price)}
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-900 hover:bg-[#002f34] text-white transition-all shadow-md cursor-pointer active:scale-95"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
