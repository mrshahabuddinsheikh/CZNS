'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, ShoppingBag, User, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SellPhoneModal from './SellPhoneModal';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [sellModalOpen, setSellModalOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Mobile Navigation Bar"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 py-1 flex items-center justify-around text-slate-700 select-none"
      >
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
            pathname === '/' ? 'text-[#002f34] font-extrabold' : 'text-slate-500 hover:text-slate-800'
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
          className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-[#002f34] transition-colors"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] tracking-tight uppercase">Chats</span>
        </a>

        {/* 3. The Iconic OLX + SELL Button (Elevated in Center) */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            onClick={() => setSellModalOpen(true)}
            className="w-13 h-13 rounded-full bg-white border-[3.5px] border-t-[#23e5db] border-r-[#3a77ff] border-b-[#ffce32] border-l-[#23e5db] shadow-[0_8px_20px_rgba(0,47,52,0.25)] flex flex-col items-center justify-center text-[#002f34] active:scale-90 transition-transform cursor-pointer"
            aria-label="Sell Phone / Post Ad"
          >
            <Plus className="w-5 h-5 stroke-[3] text-[#002f34]" />
            <span className="text-[9px] font-black tracking-tighter text-[#002f34] -mt-1">
              SELL
            </span>
          </button>
        </div>

        {/* 4. My Bag */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-[#002f34] transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#ffce32] text-[#002f34] font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight uppercase">My Bag</span>
        </button>

        {/* 5. Account / Staff */}
        <Link
          href="/admin/login"
          className="flex flex-col items-center justify-center flex-1 py-1 text-center text-slate-500 hover:text-[#002f34] transition-colors"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight uppercase">Account</span>
        </Link>
      </nav>

      {/* Post Ad / Sell Phone Modal */}
      <SellPhoneModal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} />
    </>
  );
}
