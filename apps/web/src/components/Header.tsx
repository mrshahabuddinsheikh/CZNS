'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Compass,
  ArrowRight,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';

// Ronin-Style Minimalist Brand & Category Icons
const BRAND_ICONS = [
  {
    name: 'Apple',
    slug: 'apple',
    badge: 'iOS 18',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.73-.93 2.76 1.04.08 2.07-.53 2.67-1.26z" />
      </svg>
    ),
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    badge: 'Galaxy AI',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    ),
  },
  {
    name: 'Pixel',
    slug: 'google-pixel',
    badge: 'Tensor',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    name: 'Xiaomi',
    slug: 'xiaomi',
    badge: 'Leica',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M8 8v8m8-8v8m-4-8v5a3 3 0 0 1-3 3" />
      </svg>
    ),
  },
  {
    name: 'OnePlus',
    slug: 'oneplus',
    badge: '100W',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12h6m-3-3v6M8 8h1" />
      </svg>
    ),
  },
  {
    name: 'Vivo',
    slug: 'vivo',
    badge: 'Zeiss',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 9 4 7 4-7" />
      </svg>
    ),
  },
  {
    name: 'Oppo',
    slug: 'oppo',
    badge: 'ColorOS',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="8" cy="12" r="4.5" />
        <circle cx="16" cy="12" r="4.5" />
      </svg>
    ),
  },
  {
    name: 'Motorola',
    slug: 'motorola',
    badge: 'Edge',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M7 15c1-3 2.5-5 5-2 2.5-3 4-1 5 2" />
      </svg>
    ),
  },
  {
    name: 'Infinix',
    slug: 'infinix',
    badge: 'Hot/Note',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    name: 'Tecno',
    slug: 'tecno',
    badge: 'Camon',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M12 9v6" />
      </svg>
    ),
  },
  {
    name: 'Nokia',
    slug: 'nokia',
    badge: 'Pure',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <circle cx="12" cy="18" r="1" />
        <path d="M9 6h6" />
      </svg>
    ),
  },
  {
    name: 'Box Pack',
    slug: 'mode-new',
    isMode: 'new',
    badge: '1-Year War',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    ),
  },
  {
    name: '10/10 Mint',
    slug: 'mode-used',
    isMode: 'used',
    badge: '7-Day War',
    icon: (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
        <line x1="22" y1="11" x2="22" y2="13" />
        <path d="M7 12h2m2 0h2" />
      </svg>
    ),
  },
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

  // Founder Verified Desk state
  const [founderOpen, setFounderOpen] = useState(false);
  const [founderInfo, setFounderInfo] = useState({
    name: 'Sherry',
    title: 'Founder & CEO, CZNS',
    imageUrl: '/founder.jpg',
    whatsapp: '923001234567',
    badgeText: 'Founder Verified',
  });
  const founderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setFounderInfo({
              name: data.settings.founder_name || 'Sherry',
              title: data.settings.founder_title || 'Founder & CEO, CZNS',
              imageUrl: data.settings.founder_image_url || '/founder.jpg',
              whatsapp: data.settings.founder_whatsapp || '923001234567',
              badgeText: data.settings.founder_badge_text || 'Founder Verified',
            });
          }
        }
      } catch (err) {
        // Fallback default
      }
    }
    loadSettings();
  }, []);

  // Click outside to close founder popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (founderRef.current && !founderRef.current.contains(event.target as Node)) {
        setFounderOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleIconClick = (brandItem: typeof BRAND_ICONS[0]) => {
    if (brandItem.isMode) {
      setPhoneMode(brandItem.isMode as 'new' | 'used');
      router.push(`/shop?condition=${brandItem.isMode}`);
    } else {
      router.push(`/shop?brand=${brandItem.slug}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR (Desktop & Tablet only - Hidden on Mobile) */}
      <div className="hidden sm:block bg-slate-900 text-slate-300 text-[11px] font-semibold py-1.5 px-4 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Genuine Mobile Store
            </span>
            <span className="text-slate-600">•</span>
            <span>Official PTA Approved &amp; DIRBS Verified</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300 font-bold">Karachi 24h Express COD</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400" />
              Star City Mall Direct Desk
            </span>
            <span className="text-slate-600">•</span>
            <Link href="/track-order" className="hover:text-white transition-colors">
              Track Orders
            </Link>
            <span className="text-slate-600">•</span>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-emerald-400"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              WhatsApp Help
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN LIGHT LUXURY FROSTED GLASS NAVIGATION BAR */}
      <div className="glass-header text-slate-800">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Minimal Bold CZNS Logo & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl sm:text-3xl font-black tracking-[0.22em] text-slate-950 flex items-center gap-1 uppercase drop-shadow-xs transition-colors">
                CZNS
                <span
                  style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                  className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5"
                />
              </span>
            </Link>
          </div>

          {/* Center: Ronin-Inspired Minimalist Category/Brand Icon Bar in Light Glass */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl px-2">
            <div className="flex items-center justify-between w-full px-2 py-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl backdrop-blur-md shadow-inner">
              {BRAND_ICONS.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => handleIconClick(b)}
                  className="group relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-white transition-all flex flex-col items-center justify-center cursor-pointer shadow-none hover:shadow-xs"
                  title={`${b.name} (${b.badge})`}
                >
                  <div className="group-hover:scale-115 transition-transform duration-200">
                    {b.icon}
                  </div>
                  {/* Floating Hover Label */}
                  <span className="absolute -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 shadow-xl whitespace-nowrap pointer-events-none z-50">
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Shop All Pill, Search, Founder Verified Desk & Cart Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* "Shop All" Pill Button */}
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs group cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-45 transition-transform" />
              <span>Shop All</span>
            </Link>

            {/* Expandable Live Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
                title="Search phones"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Autocomplete Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-4 z-50 text-slate-800 space-y-3"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search iPhone 17 Pro, S26 Ultra, Pixel..."
                        className="w-full bg-slate-100/90 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </form>

                    {/* Suggestions results */}
                    {suggestions.length > 0 ? (
                      <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 mb-1">
                          Matching Smartphones ({suggestions.length})
                        </div>
                        {suggestions.map((item) => (
                          <Link
                            key={item.id}
                            href={`/phone/${item.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-9 h-9 object-contain rounded-lg bg-slate-50 border border-slate-200"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {item.is_used ? 'Certified 10/10' : 'Brand New'} • {item.pta_status}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-mono font-bold text-emerald-600">
                                {formatPKR(item.price)}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Popular Searches
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['iPhone 17 Pro', 'S26 Ultra', 'Pixel 8 Pro', 'Xiaomi 15', 'Hot 70'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSearchQuery(tag);
                                router.push(`/shop?search=${encodeURIComponent(tag)}`);
                                setIsSearchOpen(false);
                              }}
                              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Founder Sherry Verified Desk */}
            <div ref={founderRef} className="relative">
              <button
                onClick={() => setFounderOpen(!founderOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-amber-50/90 hover:bg-amber-100 border border-amber-300 shadow-xs transition-all group cursor-pointer"
                title="Verified Store Owner Desk"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-amber-400 overflow-hidden shrink-0 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={founderInfo.imageUrl}
                    alt={founderInfo.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-pulse" />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[11px] font-black text-slate-900 leading-tight flex items-center gap-1">
                    {founderInfo.name}
                    <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
                    {founderInfo.badgeText}
                  </span>
                </div>
              </button>

              {/* Founder Popover */}
              <AnimatePresence>
                {founderOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 z-50 w-72 sm:w-80 bg-white/95 backdrop-blur-2xl border-2 border-amber-300 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-3 text-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl ring-2 ring-amber-400 overflow-hidden shrink-0 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={founderInfo.imageUrl}
                          alt={founderInfo.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                          <span>{founderInfo.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-xs font-bold text-amber-800">
                          {founderInfo.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Karachi Saddar / Star City Direct Stock
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-2xl text-[11px] text-slate-700 space-y-1">
                      <div className="font-extrabold text-amber-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Founder&apos;s Direct Guarantee:</span>
                      </div>
                      <p className="text-slate-600 leading-snug text-[11px]">
                        Har phone physically check kiya jata hai. Official PTA approval, genuine IMEI aur original battery health ki 100% zimmaydari hamari hai.
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${founderInfo.whatsapp}?text=Salam%20${encodeURIComponent(founderInfo.name)}%20Bhai!%20I%20am%20looking%20to%20purchase%20a%20smartphone%20from%20CZNS.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setFounderOpen(false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Chat Directly on WhatsApp</span>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-all group cursor-pointer shadow-md"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-slate-200 group-hover:text-emerald-400 transition-colors" />
              {totalItems > 0 && (
                <span
                  style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                  className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md"
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. MOBILE CATEGORY ICON STRIP */}
        <div className="lg:hidden border-t border-slate-200 px-3 py-2 overflow-x-auto no-scrollbar bg-white/70">
          <div className="flex items-center gap-2 min-w-max">
            {BRAND_ICONS.map((b) => (
              <button
                key={b.slug}
                onClick={() => handleIconClick(b)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-semibold"
              >
                <span className="w-4 h-4 text-emerald-600">{b.icon}</span>
                <span>{b.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-2xl p-4 space-y-4 text-slate-800 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Shop All Phones</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Track Orders</span>
              </Link>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={founderInfo.imageUrl}
                  alt={founderInfo.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1 text-slate-900">
                    {founderInfo.name} <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="text-[10px] text-amber-800">{founderInfo.title}</div>
                </div>
              </div>
              <a
                href={`https://wa.me/${founderInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Direct WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
