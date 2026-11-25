'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Plus,
  ChevronDown,
  PhoneCall,
  User,
  CheckCircle2,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';
import SellPhoneModal from './SellPhoneModal';

const CATEGORIES_RIBBON = [
  { name: 'Mobile Phones', path: '/shop' },
  { name: 'Brand New (Box Pack)', path: '/shop?condition=new' },
  { name: 'Used Phones (10/10)', path: '/shop?condition=used' },
  { name: 'Apple (iPhone)', path: '/shop?brand=apple' },
  { name: 'Samsung Galaxy', path: '/shop?brand=samsung' },
  { name: 'Google Pixel', path: '/shop?brand=google-pixel' },
  { name: 'Xiaomi / Redmi', path: '/shop?brand=xiaomi' },
  { name: 'OnePlus', path: '/shop?brand=oneplus' },
  { name: 'PTA Approved', path: '/shop?pta=official' },
];

const LOCATIONS = [
  'All Pakistan',
  'Karachi (Star City Mall / Saddar)',
  'Lahore (Hafeez Centre)',
  'Islamabad / Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
];

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalItems, setIsCartOpen, setPhoneMode } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('Karachi (Star City Mall / Saddar)');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);

  // Founder Verified Desk state
  const [founderOpen, setFounderOpen] = useState(false);
  const [founderInfo, setFounderInfo] = useState({
    name: 'Sherry',
    title: 'Founder & CEO, CZNS',
    imageUrl: '/founder.jpg',
    whatsapp: '923001234567',
    badgeText: 'Founder Verified',
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
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

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (founderRef.current && !founderRef.current.contains(event.target as Node)) {
        setFounderOpen(false);
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-xs select-none">
        {/* 1. TOP UTILITY ANNOUNCEMENT BAR (OLX STYLE) */}
        <div className="bg-[#002f34] text-white text-[11px] font-medium py-1.5 px-3 sm:px-6">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold tracking-wider text-[#ffce32] uppercase">
                CZNS • OLX Mobile Hub
              </span>
              <span className="hidden sm:inline text-teal-300">•</span>
              <span className="hidden sm:inline text-slate-200">Free Classifieds &amp; Certified Store in Pakistan</span>
              <span className="hidden md:inline text-teal-300">•</span>
              <span className="hidden md:inline text-teal-200 font-semibold">Star City Mall Saddar Desk</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-[#ffce32] font-bold">Karachi Same-Day COD</span>
              <span>•</span>
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Order
              </Link>
              <span>•</span>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 text-emerald-300 font-bold flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Help</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. MAIN OLX NAVBAR */}
        <div className="bg-[#f7f8f8] border-b border-slate-200 py-2.5 sm:py-3.5 px-3 sm:px-6">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 sm:gap-5">
            {/* Left: OLX-Style Heavy Geometric CZNS Logo */}
            <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
              <div className="flex items-center">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#002f34] uppercase font-sans">
                  CZNS
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a49f] ml-0.5 mt-1" />
              </div>
            </Link>

            {/* Middle: Location Dropdown + Wide Search Bar (The Signature OLX Search Bar Layout) */}
            <div className="flex-1 flex items-center gap-2 max-w-4xl">
              {/* Location Selector (Desktop/Tablet) */}
              <div ref={locationRef} className="hidden md:block relative w-64 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="w-full bg-white border-2 border-[#002f34] rounded-md py-2.5 px-3 flex items-center justify-between text-left text-xs font-bold text-[#002f34] cursor-pointer hover:border-teal-600 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-[#002f34] shrink-0" />
                    <span className="truncate">{selectedLocation}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                </button>

                {/* Location Dropdown */}
                <AnimatePresence>
                  {isLocationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-12 w-full bg-white border border-slate-200 rounded-md shadow-xl py-1.5 z-50 text-xs font-semibold text-slate-700"
                    >
                      <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Popular Locations
                      </div>
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer ${
                            selectedLocation === loc ? 'text-[#002f34] font-black bg-slate-50' : ''
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{loc}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Search Input with Right Button */}
              <div ref={searchRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Find Mobile Phones, Used iPhones, Box Packed..."
                    className="w-full bg-white border-2 border-[#002f34] rounded-md py-2.5 pl-3.5 pr-14 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 transition-colors shadow-xs"
                  />

                  {/* Dark Teal OLX Search Button */}
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-4 bg-[#002f34] hover:bg-[#003d44] text-white rounded-r-md flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </form>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {isSearchOpen && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-12 bg-white border border-slate-200 rounded-md shadow-2xl p-3 z-50 text-slate-800 space-y-1 max-h-80 overflow-y-auto no-scrollbar"
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 mb-1">
                        Matching Phones in Stock ({suggestions.length})
                      </div>
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          href={`/phone/${item.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-8 h-8 object-contain rounded-md bg-slate-50 border border-slate-200"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {item.is_used ? 'Certified 10/10' : 'Brand New'} • {item.pta_status}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-[#002f34]">
                            {formatPKR(item.price)}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side: Chat, Founder Desk, Bag, and THE FAMOUS OLX "+ SELL" BUTTON */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* WhatsApp Chats */}
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#002f34] hover:text-teal-700 transition-colors p-2"
                title="Direct WhatsApp Chat"
              >
                <MessageSquare className="w-5 h-5 text-[#002f34]" />
                <span>Chats</span>
              </a>

              {/* Founder Verified Profile Desk */}
              <div ref={founderRef} className="relative">
                <button
                  onClick={() => setFounderOpen(!founderOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Founder Desk"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#002f34]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={founderInfo.imageUrl}
                      alt={founderInfo.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-[#002f34]" />
                </button>

                {/* Founder Popover */}
                <AnimatePresence>
                  {founderOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-11 z-50 w-72 bg-white border-2 border-[#002f34] rounded-xl p-4 shadow-2xl space-y-3 text-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ffce32] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={founderInfo.imageUrl}
                            alt={founderInfo.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#002f34] flex items-center gap-1">
                            <span>{founderInfo.name}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="text-xs font-bold text-slate-600">{founderInfo.title}</div>
                          <div className="text-[10px] text-slate-400">Star City Mall Desk</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[11px] text-slate-600">
                        Main personally har phone ka PTA approval, battery health aur physical condition verify karta hoon.
                      </div>

                      <a
                        href={`https://wa.me/${founderInfo.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-[#002f34] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#ffce32]" />
                        <span>Chat with Sherry</span>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-slate-200/60 transition-colors text-[#002f34] cursor-pointer"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#002f34]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#ffce32] text-[#002f34] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* THE ICONIC OLX "+ SELL" BUTTON (DESKTOP) */}
              <button
                onClick={() => setSellModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border-[3.5px] border-t-[#23e5db] border-r-[#3a77ff] border-b-[#ffce32] border-l-[#23e5db] shadow-[0_3px_12px_rgba(0,47,52,0.15)] text-[#002f34] text-xs sm:text-sm font-black tracking-wide uppercase hover:scale-103 active:scale-95 transition-all cursor-pointer"
                title="Sell Your Phone / Post Ad"
              >
                <Plus className="w-4 h-4 stroke-[3] text-[#002f34]" />
                <span>SELL</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SUB-HEADER CATEGORY RIBBON (AUTHENTIC OLX PK STYLE) */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-[1440px] mx-auto flex items-center gap-4 text-xs font-semibold text-slate-700 min-w-max">
            {/* "ALL CATEGORIES" DROPDOWN TRIGGER */}
            <Link
              href="/shop"
              className="flex items-center gap-1 font-black text-[#002f34] hover:text-teal-700 transition-colors uppercase tracking-wider pr-3 border-r border-slate-200"
            >
              <span>ALL CATEGORIES</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>

            {/* Quick Category Links */}
            {CATEGORIES_RIBBON.map((cat) => (
              <Link
                key={cat.name}
                href={cat.path}
                className="hover:text-[#002f34] hover:underline underline-offset-4 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Post Ad / Sell Phone Modal */}
      <SellPhoneModal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} />
    </>
  );
}
