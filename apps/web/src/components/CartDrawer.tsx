'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Coins,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalItems } =
    useCart();

  const coinsEarned = Math.round(subtotal * 0.02);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsSummary = cart
      .map(
        (i) =>
          `• ${i.product_name} (${i.storage} / ${i.color_name}) x${i.quantity} = ${formatPKR(
            i.price * i.quantity
          )}`
      )
      .join('\n');

    const msg = [
      `*Salam CZNS!* 📱`,
      `I want to place an order for my cart items:`,
      itemsSummary,
      ``,
      `*Total Amount:* ${formatPKR(subtotal)}`,
      `Please confirm stock and dispatch details.`,
    ].join('\n');

    const url = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#090b10] border-l border-white/10 text-white flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-emerald-400 shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Shopping Bag</h2>
                    <p className="text-xs text-slate-400">
                      {totalItems} {totalItems === 1 ? 'phone' : 'phones'} selected
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-slate-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Your bag is empty</h3>
                    <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
                      Browse certified brand new and 10/10 pre-owned smartphones with 1-Year Official &amp; 7-Day checking warranties.
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-colors"
                    >
                      Explore Smartphones
                    </Link>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div
                        key={item.variant_id}
                        className="p-3.5 rounded-2xl bg-[#0e121a]/90 border border-white/10 shadow-sm flex gap-3 relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-contain rounded-xl bg-black/40 border border-white/10 shrink-0 p-1"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.product_name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.variant_id)}
                              className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-300">{item.storage}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black"
                                style={{ backgroundColor: item.color_hex }}
                              />
                              {item.color_name}
                            </span>
                          </div>

                          {/* Used status badge if applicable */}
                          {item.is_used === 1 && (
                            <div className="text-[10px] text-amber-400 font-bold mt-1">
                              🔋 {item.battery_health}% Health • {item.condition_grade || '10/10'}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <div className="text-xs font-mono font-black text-emerald-400">
                              {formatPKR(item.price * item.quantity)}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-white/15 rounded-lg overflow-hidden bg-white/5">
                              <button
                                onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                                className="p-1 hover:bg-white/10 text-slate-300 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                                className="p-1 hover:bg-white/10 text-slate-300 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer Calculations & Checkout */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0e121a]/95 space-y-3.5">
                  {/* Coins reward line */}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Coins className="w-4 h-4 text-amber-400" />
                      Coins to Earn
                    </span>
                    <span className="font-black text-amber-300">+{coinsEarned} Coins</span>
                  </div>

                  {/* Trust note */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Karachi COD Available (Rs. 250) | Free on advance</span>
                  </div>

                  {/* Subtotal */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-slate-200 font-mono font-semibold">{formatPKR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-1 border-t border-white/10">
                      <span>Total Amount</span>
                      <span className="text-rose-400 font-mono">{formatPKR(subtotal)}</span>
                    </div>
                  </div>

                  {/* Checkout buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#7e0119] hover:bg-[#9c0f2b] text-white text-xs sm:text-sm font-black shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <span>Proceed to Secure Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleWhatsAppCheckout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 text-rose-400" />
                      <span>Order Directly on WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
