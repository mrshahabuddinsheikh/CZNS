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
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100/95 border-t border-slate-200/90 text-slate-600 mt-20 relative overflow-hidden">
      {/* 4 Feature Trust Blocks */}
      <div className="border-b border-slate-200/80 py-8 px-4 bg-white/70 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">100% Genuine IMEI</div>
              <div className="text-[11px] text-slate-500">PTA DIRBS verified &amp; checked</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">7 Days Checking Warranty</div>
              <div className="text-[11px] text-slate-500">Money-back or replacement</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Karachi COD Available</div>
              <div className="text-[11px] text-slate-500">Rs. 250 fee | Free on advance</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Verified Pakistani Gateways</div>
              <div className="text-[11px] text-slate-500">JazzCash, Easypaisa, Raast, IBFT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-[0.2em] text-slate-900">CZNS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pakistan&apos;s premier smartphone destination for Brand New (Factory Pin-Packed with Official Brand Warranty) and Certified Pre-Owned (Graded 10/10 with Battery Health guarantee) iPhones and Android flagships.
          </p>
          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Saddar Star City Mall Direct Desk, Karachi</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-emerald-700 transition-colors">
                +92 300 1234567 (WhatsApp Helpline)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>orders@czns.pk</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Explore Phones
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>
              <Link href="/shop" className="hover:text-emerald-600 flex items-center gap-1.5 font-semibold text-slate-800 transition-colors">
                <span>Shop All Smartphones</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
              </Link>
            </li>
            <li>
              <Link href="/shop?condition=new" className="hover:text-emerald-600 flex items-center gap-1.5 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Pin-Packed Phones</span>
              </Link>
            </li>
            <li>
              <Link href="/shop?condition=used" className="hover:text-emerald-600 flex items-center gap-1.5 transition-colors">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                <span>Certified Used Phones (10/10)</span>
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=apple" className="hover:text-emerald-600 transition-colors">
                Apple iPhones (13, 14, 15, 16, 17 Pro)
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=samsung" className="hover:text-emerald-600 transition-colors">
                Samsung Galaxy S &amp; Z Series
              </Link>
            </li>
            <li>
              <Link href="/shop?brand=google-pixel" className="hover:text-emerald-600 transition-colors">
                Google Pixel Phones (Tensor)
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Brands */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Top Brands
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <Link href="/shop?brand=xiaomi" className="hover:text-emerald-600 transition-colors">
              Xiaomi / Redmi
            </Link>
            <Link href="/shop?brand=oneplus" className="hover:text-emerald-600 transition-colors">
              OnePlus
            </Link>
            <Link href="/shop?brand=vivo" className="hover:text-emerald-600 transition-colors">
              Vivo
            </Link>
            <Link href="/shop?brand=oppo" className="hover:text-emerald-600 transition-colors">
              Oppo
            </Link>
            <Link href="/shop?brand=motorola" className="hover:text-emerald-600 transition-colors">
              Motorola
            </Link>
            <Link href="/shop?brand=infinix" className="hover:text-emerald-600 transition-colors">
              Infinix
            </Link>
            <Link href="/shop?brand=tecno" className="hover:text-emerald-600 transition-colors">
              Tecno
            </Link>
            <Link href="/shop?brand=nokia" className="hover:text-emerald-600 transition-colors">
              Nokia
            </Link>
            <Link href="/shop?brand=nothing" className="hover:text-emerald-600 transition-colors">
              Nothing Phone
            </Link>
            <Link href="/shop?brand=realme" className="hover:text-emerald-600 transition-colors">
              Realme
            </Link>
          </div>
        </div>

        {/* Customer Care & Admin */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>
              <Link href="/track-order" className="hover:text-emerald-600 transition-colors">
                Track Order Status
              </Link>
            </li>
            <li>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-emerald-700 font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Karachi WhatsApp Desk</span>
              </a>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-slate-900 transition-colors text-slate-400">
                Staff / Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 py-6 px-4 bg-slate-200/50">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CZNS Pakistan Mobile Store. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Karachi Star City Mall Saddar Desk</span>
            <span>•</span>
            <span>Official PTA DIRBS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
