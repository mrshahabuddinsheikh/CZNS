'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, ShoppingBag, Film, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();

  const handleOpenReels = () => {
    if (pathname === '/') {
      const reelsEl = document.getElementById('shoppable-reels');
      if (reelsEl) {
        reelsEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push('/#shoppable-reels');
  };

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-2xl bg-white/92 border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around text-slate-700 select-none"
    >
      {/* 1. Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
          pathname === '/' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight uppercase">Home</span>
      </Link>

      {/* 2. Chats / WhatsApp Desk */}
      <a
        href="https://wa.me/923001234567"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[10px] tracking-tight uppercase">Chats</span>
      </a>

      {/* 3. The Elevated Center "BUY" Button (Replaces SELL, opens /shop) */}
      <div className="flex flex-col items-center justify-center flex-1 -mt-5">
        <button
          onClick={() => router.push('/shop')}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_8px_22px_rgba(16,185,129,0.45)] border-3 border-white flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Buy Smartphones / Open Shop"
        >
          <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
          <span className="text-[9px] font-black tracking-wider text-white -mt-0.5 uppercase">
            BUY
          </span>
        </button>
      </div>

      {/* 4. My Bag */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight uppercase">My Bag</span>
      </button>

      {/* 5. Shoppable Reels (Replaces Account as requested) */}
      <button
        onClick={handleOpenReels}
        className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-pink-600 transition-colors cursor-pointer"
        aria-label="Watch Shoppable Reels"
      >
        <Film className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight uppercase font-medium">Reels</span>
      </button>
    </nav>
  );
}
