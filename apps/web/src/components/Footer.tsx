'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  ShieldCheck,
  Truck,
  RotateCcw,
  PhoneCall,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#ebeeef] border-t border-slate-300 text-slate-700 mt-12 relative select-none">
      {/* 4 Feature Trust Blocks */}
      <div className="border-b border-slate-300 py-6 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-[#002f34] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#002f34]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#002f34]">100% Genuine IMEI</div>
              <div className="text-[11px] text-slate-500">PTA DIRBS verified &amp; checked</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#002f34]">7 Days Checking Warranty</div>
              <div className="text-[11px] text-slate-500">Money-back or replacement</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#002f34]">Karachi Same-Day COD</div>
              <div className="text-[11px] text-slate-500">Free courier nationwide</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#002f34]">Verified Cash Outlets</div>
              <div className="text-[11px] text-slate-500">Star City Mall Saddar Desk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Column OLX Classifieds Links */}
      <div className="max-w-[1440px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
        {/* Column 1: Popular Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#002f34]">
            POPULAR CATEGORIES
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>
              <Link href="/shop?brand=apple" className="hover:text-[#002f34] hover:underline">
                Apple iPhones
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=samsung" className="hover:text-[#002f34] hover:underline">
                Samsung Galaxy
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=google-pixel" className="hover:text-[#002f34] hover:underline">
                Google Pixel Phones
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=xiaomi" className="hover:text-[#002f34] hover:underline">
                Xiaomi / Redmi
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=oneplus" className="hover:text-[#002f34] hover:underline">
                OnePlus
              </Link>
            </li>
            <li>
              <Link href="/shop?condition=used" className="hover:text-[#002f34] hover:underline">
                10/10 Mint Pre-Owned
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Trending Searches */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#002f34]">
            TRENDING SEARCHES
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>
              <Link href="/shop?search=15+pro" className="hover:text-[#002f34] hover:underline">
                iPhone 15 Pro Max
              </Link>
            </li>
            <li>
              <Link href="/shop?search=s24" className="hover:text-[#002f34] hover:underline">
                Samsung S24 Ultra 5G
              </Link>
            </li>
            <li>
              <Link href="/shop?search=pixel+8" className="hover:text-[#002f34] hover:underline">
                Pixel 8 Pro Tensor G3
              </Link>
            </li>
            <li>
              <Link href="/shop?condition=new" className="hover:text-[#002f34] hover:underline">
                Box Packed Smartphones
              </Link>
            </li>
            <li>
              <Link href="/shop?pta=official" className="hover:text-[#002f34] hover:underline">
                Official PTA Approved
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: About Us */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#002f34]">
            ABOUT US
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>
              <span className="font-semibold text-slate-800">CZNS Mobile Hub</span>
            </li>
            <li>
              <span>Star City Mall Saddar, Karachi</span>
            </li>
            <li>
              <Link href="/shop" className="hover:text-[#002f34] hover:underline">
                Explore Full Inventory
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-[#002f34] hover:underline">
                Track Live Order
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-[#002f34] hover:underline">
                Admin / Staff Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: OLX / CZNS Help */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#002f34]">
            CZNS / OLX HELP
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#002f34] hover:underline flex items-center gap-1 font-bold text-emerald-700"
              >
                <PhoneCall className="w-3 h-3" />
                <span>WhatsApp Helpline</span>
              </a>
            </li>
            <li>
              <span>7 Days Checking Warranty</span>
            </li>
            <li>
              <span>PTA DIRBS Compliance</span>
            </li>
            <li>
              <span>Terms of Use &amp; Privacy</span>
            </li>
          </ul>
        </div>

        {/* Column 5: Follow Us & Download App */}
        <div className="space-y-3 col-span-2 md:col-span-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#002f34]">
            FOLLOW US
          </h4>
          <p className="text-[11px] text-slate-600">
            Pakistan&apos;s verified smartphone destination. Buy and sell with 100% peace of mind.
          </p>
          <div className="pt-2 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase">
              Free Classifieds in Pakistan
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700">
                Karachi
              </span>
              <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700">
                Lahore
              </span>
              <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700">
                Islamabad
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OLX Bottom Dark Teal Copyright Bar */}
      <div className="bg-[#002f34] text-white py-4 px-4">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="font-medium text-slate-300">
            Free Classifieds in Pakistan • © 2026 CZNS Mobile Store. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-teal-200 text-[11px]">
            <span>Star City Mall Direct Desk</span>
            <span>•</span>
            <span>PTA DIRBS Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
