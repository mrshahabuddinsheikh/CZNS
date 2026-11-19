'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/api';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalItems } =
    useCart();

  if (!isCartOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-czns-950 border-l border-czns-800 text-white flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-czns-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-czns-900 border border-czns-800">
                <ShoppingBag className="w-5 h-5 text-brand-emerald" />
              </div>
              <div>
                <h2 className="text-base font-bold">Shopping Bag</h2>
                <p className="text-xs text-czns-400">
                  {totalItems} {totalItems === 1 ? 'phone' : 'phones'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-czns-400 hover:text-white hover:bg-czns-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-czns-400">
                <div className="w-16 h-16 rounded-full bg-czns-900 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-czns-600" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Your bag is empty</h3>
                <p className="text-xs text-czns-500 mb-6 max-w-xs">
                  Browse our certified new & pre-owned smartphones with 1-Year Official & 7-Day checking warranties.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-emerald text-czns-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                >
                  Explore Smartphones
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variant_id}
                  className="flex gap-3 bg-czns-900 border border-czns-800/80 p-3 rounded-2xl relative group"
                >
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-18 h-20 object-cover rounded-xl bg-czns-950 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/phone/${item.product_slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-bold text-white hover:text-brand-emerald transition-colors line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variant_id)}
                          className="text-czns-500 hover:text-rose-400 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant details */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-czns-400">
                        <span className="px-1.5 py-0.2 rounded bg-czns-800 text-czns-200 font-medium">
                          {item.storage}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-czns-800 text-czns-200">
                          <span
                            className="w-2 h-2 rounded-full inline-block border border-white/20"
                            style={{ backgroundColor: item.color_hex }}
                          />
                          {item.color_name}
                        </span>
                        {item.is_used ? (
                          <span className="text-brand-gold font-semibold text-[10px]">
                            {item.condition_grade}
                          </span>
                        ) : (
                          <span className="text-brand-emerald font-semibold text-[10px]">
                            Brand New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-czns-800/60">
                      <div className="text-xs font-black text-white">
                        {formatPKR(item.price * item.quantity)}
                      </div>

                      <div className="flex items-center bg-czns-950 border border-czns-750 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="px-2 py-1 text-czns-400 hover:text-white hover:bg-czns-850 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="px-2 py-1 text-czns-400 hover:text-white hover:bg-czns-850 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-czns-850 bg-czns-900/60 space-y-3">
              {/* Coins Earned Alert */}
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs text-brand-gold">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coins className="w-4 h-4" />
                  Store Coins Earned:
                </span>
                <span className="font-bold">+{coinsEarned} Coins (Rs. {coinsEarned})</span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-czns-400">Subtotal:</span>
                <span className="text-lg font-black text-white">{formatPKR(subtotal)}</span>
              </div>

              <div className="text-[11px] text-czns-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                <span>Karachi COD available. Advance payment includes Free Shipping.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-sm transition-all shadow-lg shadow-emerald-950/50"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-brand-emerald font-bold text-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Quick Order via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
