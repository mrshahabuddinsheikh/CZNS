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
  BatteryCharging,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-czns-950 border-t border-czns-850 text-white mt-16">
      {/* 4 Feature Trust Blocks */}
      <div className="border-b border-czns-850/80 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Genuine Parts</div>
              <div className="text-[11px] text-czns-400">30-point diagnostic certified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">7 Days Checking Warranty</div>
              <div className="text-[11px] text-czns-400">Money-back or replacement</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Karachi COD Available</div>
              <div className="text-[11px] text-czns-400">Nationwide courier on advance</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Verified Pakistani Gateways</div>
              <div className="text-[11px] text-czns-400">JazzCash, Easypaisa, Raast, IBFT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-emerald to-brand-gold p-[2px]">
              <div className="w-full h-full bg-czns-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">CZNS</span>
          </div>
          <p className="text-xs text-czns-400 leading-relaxed">
            Pakistan&apos;s premier smartphone destination for Brand New (Factory Pin-Packed with Official Brand Warranty) and Certified Pre-Owned (Graded 10/10 with Battery Health guarantee) iPhones and Android flagships.
          </p>
          <div className="text-xs text-czns-300 space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Saddar Mobile Market / DHA Phase 6, Karachi</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-brand-emerald" />
              <a href="https://wa.me/923001234567" className="hover:text-white">
                +92 300 1234567 (WhatsApp Helpline)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand-emerald" />
              <span>orders@czns.pk</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
            Shop by Condition
          </h4>
          <ul className="space-y-2 text-xs text-czns-400">
            <li>
              <Link href="/?mode=new" className="hover:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                New Phones (Box Packed)
              </Link>
            </li>
            <li>
              <Link href="/?mode=used" className="hover:text-white flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-brand-gold" />
                Used Phones (10/10 Mint)
              </Link>
            </li>
            <li>
              <Link href="/?pta=Official+PTA" className="hover:text-white">
                Official PTA Approved
              </Link>
            </li>
            <li>
              <Link href="/?pta=Non-PTA" className="hover:text-white">
                Non-PTA / Factory Unlock
              </Link>
            </li>
            <li>
              <Link href="/?battery=90" className="hover:text-white">
                Battery Health 90%+
              </Link>
            </li>
          </ul>
        </div>

        {/* Brands */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
            Popular Brands
          </h4>
          <ul className="space-y-2 text-xs text-czns-400">
            <li>
              <Link href="/?brand=apple" className="hover:text-white">
                Apple iPhone (15 Pro, 14, 13)
              </Link>
            </li>
            <li>
              <Link href="/?brand=samsung" className="hover:text-white">
                Samsung Galaxy (S24 Ultra, S23)
              </Link>
            </li>
            <li>
              <Link href="/?brand=google-pixel" className="hover:text-white">
                Google Pixel (8 Pro, 7)
              </Link>
            </li>
            <li>
              <Link href="/?brand=oneplus" className="hover:text-white">
                OnePlus Flagships
              </Link>
            </li>
            <li>
              <Link href="/?brand=xiaomi" className="hover:text-white">
                Xiaomi & Redmi
              </Link>
            </li>
            <li>
              <Link href="/?brand=infinix" className="hover:text-white">
                Infinix & Tecno
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care & Admin */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-czns-400">
            <li>
              <Link href="/track-order" className="hover:text-white">
                Track Your Shipment
              </Link>
            </li>
            <li>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="hover:text-white">
                Contact on WhatsApp
              </a>
            </li>
            <li>
              <span className="text-czns-400">Replacement & Checking Policy</span>
            </li>
            <li>
              <span className="text-czns-400">Karachi COD Delivery Terms</span>
            </li>
            <li className="pt-2">
              <Link
                href="/admin/login"
                className="text-xs font-semibold text-brand-emerald hover:underline"
              >
                🔐 Store Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="border-t border-czns-900 bg-czns-950/90 py-5 px-4 text-xs text-czns-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">CZNS Mobile Store</strong>. All rights reserved. Registered NTN in Pakistan.
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-1 rounded bg-czns-900 border border-czns-800 text-czns-300">
              COD Karachi
            </span>
            <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-600/30 text-amber-300">
              JazzCash
            </span>
            <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-600/30 text-emerald-300">
              Easypaisa
            </span>
            <span className="px-2 py-1 rounded bg-blue-950/60 border border-blue-600/30 text-blue-300">
              Meezan IBFT
            </span>
            <span className="px-2 py-1 rounded bg-purple-950/60 border border-purple-600/30 text-purple-300">
              Raast ID
            </span>
            <span className="px-2 py-1 rounded bg-czns-900 border border-czns-800 text-czns-300">
              Visa / Master
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
