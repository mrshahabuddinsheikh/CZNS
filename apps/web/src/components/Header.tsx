'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Smartphone,
  Sparkles,
  ShieldCheck,
  Search,
  ShoppingBag,
  PhoneCall,
  Menu,
  X,
  ChevronRight,
  BatteryCharging,
  Coins,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';

const BRANDS = [
  { name: 'Apple (iPhone)', slug: 'apple', badge: 'iOS 18' },
  { name: 'Samsung', slug: 'samsung', badge: 'Galaxy AI' },
  { name: 'Google Pixel', slug: 'google-pixel', badge: 'Tensor G3' },
  { name: 'Xiaomi / Redmi', slug: 'xiaomi', badge: 'Leica' },
  { name: 'OnePlus', slug: 'oneplus', badge: '100W' },
  { name: 'Vivo', slug: 'vivo', badge: 'Zeiss' },
  { name: 'Oppo', slug: 'oppo', badge: 'Hasselblad' },
  { name: 'Infinix', slug: 'infinix', badge: 'MagCharge' },
  { name: 'Tecno', slug: 'tecno', badge: 'Camon' },
];

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalItems, setIsCartOpen, phoneMode, setPhoneMode, storeCoins } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync mode with query param if present
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'new' || mode === 'used') {
      setPhoneMode(mode);
    }
  }, [searchParams, setPhoneMode]);

  // Click outside to close search suggestions
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
        const res = await fetch(`http://localhost:5000/api/v1/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
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
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleModeChange = (mode: 'all' | 'new' | 'used') => {
    setPhoneMode(mode);
    if (mode === 'all') {
      router.push('/');
    } else {
      router.push(`/?mode=${mode}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-czns-950/95 backdrop-blur-md border-b border-czns-800/60 text-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-czns-900 via-czns-850 to-czns-900 border-b border-czns-800/40 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-czns-300">
            <span className="flex items-center gap-1 text-brand-emerald font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Genuine IMEI Verified Phones
            </span>
            <span className="hidden sm:inline text-czns-600">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-gold" />
              Karachi COD Available | Free Nationwide Shipping on Advance Pay
            </span>
            <span className="hidden md:inline text-czns-600">•</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              7-Day Checking Warranty on Used Phones
            </span>
          </div>

          <div className="flex items-center gap-4 text-czns-300">
            <Link
              href="/track-order"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-czns-400" />
              <span>Track Order</span>
            </Link>
            <span className="text-czns-700">|</span>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand-emerald hover:text-emerald-400 font-medium transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span className="hidden sm:inline">WhatsApp:</span> 0300-1234567
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-czns-300 hover:text-white hover:bg-czns-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-emerald via-emerald-400 to-brand-gold p-[2px] shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full bg-czns-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                CZNS
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-czns-400 font-semibold -mt-1">
                Pakistan Mobile Store
              </span>
            </div>
          </Link>
        </div>

        {/* 2 PRIMARY PHONE MODES TOGGLE (Phase 1 Core Requirement) */}
        <div className="hidden lg:flex items-center bg-czns-900/90 p-1 rounded-2xl border border-czns-800 shadow-inner">
          <button
            onClick={() => handleModeChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              phoneMode === 'all'
                ? 'bg-czns-800 text-white shadow-sm'
                : 'text-czns-400 hover:text-czns-200'
            }`}
          >
            All Phones
          </button>

          <button
            onClick={() => handleModeChange('new')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              phoneMode === 'new'
                ? 'bg-brand-emerald text-czns-950 shadow-md shadow-emerald-900/30'
                : 'text-brand-emerald/90 hover:text-brand-emerald hover:bg-czns-850'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Phones (Pin Pack)</span>
          </button>

          <button
            onClick={() => handleModeChange('used')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              phoneMode === 'used'
                ? 'bg-brand-gold text-czns-950 shadow-md shadow-amber-900/30'
                : 'text-brand-gold/90 hover:text-brand-gold hover:bg-czns-850'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Used Phones (10/10 Mint)</span>
          </button>
        </div>

        {/* Search Bar with Instant Autocomplete Overlay */}
        <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search iPhone 15 Pro, S24 Ultra, Pixel 8..."
              className="w-full bg-czns-900/90 border border-czns-700/70 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-czns-400 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-czns-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-czns-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-czns-900 border border-czns-700 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
              {suggestions.length > 0 ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-czns-400 font-bold px-2 mb-2">
                    Model Matches ({suggestions.length})
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/phone/${item.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-czns-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-9 h-9 object-cover rounded-lg bg-czns-950"
                          />
                          <div>
                            <div className="text-sm font-semibold text-white group-hover:text-brand-emerald transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-czns-400">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  item.is_used
                                    ? 'bg-amber-500/20 text-brand-gold'
                                    : 'bg-emerald-500/20 text-brand-emerald'
                                }`}
                              >
                                {item.is_used ? item.condition_grade || 'Pre-Owned' : 'Brand New'}
                              </span>
                              <span>•</span>
                              <span>{item.pta_status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">{formatPKR(item.price)}</div>
                          <ChevronRight className="w-4 h-4 text-czns-500 group-hover:text-white ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-czns-400 font-bold px-2 mb-2">
                    Popular Pakistani Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {[
                      'iPhone 15 Pro Max',
                      'Samsung S24 Ultra',
                      'iPhone 13 Non-PTA',
                      'Pixel 8 Pro 10/10',
                      'Infinix Note 40 Pro',
                    ].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => {
                          setSearchQuery(pill);
                          router.push(`/?search=${encodeURIComponent(pill)}`);
                          setIsSearchOpen(false);
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-czns-800 hover:bg-czns-700 text-czns-200 transition-colors"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Coins badge & Cart Drawer Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Store Coins Loyalty */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-gold">
            <Coins className="w-3.5 h-3.5" />
            <span>{storeCoins.toLocaleString()} Coins</span>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-czns-850 to-czns-800 hover:from-czns-800 hover:to-czns-750 border border-czns-700/80 px-3.5 py-2 rounded-xl text-white font-medium shadow-md transition-all group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-czns-200 group-hover:text-brand-emerald transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-emerald text-czns-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-xs hidden md:inline font-semibold">Bag</span>
          </button>
        </div>
      </div>

      {/* 3. Dedicated Brand Mega-Bar (Phase 1 Brand Navigation) */}
      <div className="border-t border-czns-850 bg-czns-950/80 px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 min-w-max">
          <Link
            href="/"
            className="text-xs font-medium px-3 py-1 rounded-lg bg-czns-900 text-czns-300 hover:text-white hover:bg-czns-800 transition-colors"
          >
            All Brands
          </Link>
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href={`/?brand=${b.slug}${phoneMode !== 'all' ? `&mode=${phoneMode}` : ''}`}
              className="text-xs font-medium px-3 py-1 rounded-lg text-czns-300 hover:text-white hover:bg-czns-900 transition-colors flex items-center gap-1.5 group"
            >
              <span>{b.name}</span>
              {b.badge && (
                <span className="text-[9px] px-1 py-0.2 bg-czns-800 group-hover:bg-brand-emerald/20 group-hover:text-brand-emerald text-czns-400 rounded transition-colors">
                  {b.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-czns-800 bg-czns-950 p-4 space-y-4 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone model..."
              className="w-full bg-czns-900 border border-czns-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white"
            />
            <Search className="w-4 h-4 text-czns-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleModeChange('new');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-brand-emerald/40 text-brand-emerald text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              New (Box Packed)
            </button>
            <button
              onClick={() => {
                handleModeChange('used');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-amber-950/40 border border-brand-gold/40 text-brand-gold text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              Used (10/10 Mint)
            </button>
          </div>

          {/* Brands list */}
          <div className="space-y-1 pt-2 border-t border-czns-850">
            <div className="text-[10px] uppercase font-bold text-czns-400 mb-1">Browse Brands</div>
            <div className="grid grid-cols-2 gap-1.5">
              {BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  href={`/?brand=${b.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs p-2 rounded-lg bg-czns-900 text-czns-300 hover:text-white"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-czns-850 flex justify-between items-center text-xs text-czns-400">
            <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}>
              Track Your Order
            </Link>
            <Link href="/admin/login" className="text-czns-500 hover:text-czns-300">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
