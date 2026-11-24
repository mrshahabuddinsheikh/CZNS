'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  BatteryCharging,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Reel } from '../lib/types';
import { formatPKR } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function ShoppableReels() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await fetch('/api/v1/reels');
        if (res.ok) {
          const data = await res.json();
          setReels(data.reels || []);
          const initialLikes: Record<string, number> = {};
          (data.reels || []).forEach((r: Reel) => {
            initialLikes[r.id] = r.likes;
          });
          setLikesCount(initialLikes);
        }
      } catch (err) {
        console.error('Failed to load reels', err);
      }
    }
    loadReels();
  }, []);

  const handleLike = async (reelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked[reelId]) return;

    setHasLiked((prev) => ({ ...prev, [reelId]: true }));
    setLikesCount((prev) => ({ ...prev, [reelId]: (prev[reelId] || 0) + 1 }));

    try {
      await fetch(`/api/v1/reels/${reelId}/like`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickBuyReelProduct = (reel: Reel, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveReel(null);

    addToCart(
      {
        variant_id: `reel-${reel.product_id || reel.id}`,
        product_id: reel.product_id || 'prod-quick',
        product_name: reel.product_name || reel.title,
        product_slug: reel.product_slug || '',
        storage: '256GB',
        color_name: 'Standard Titanium',
        color_hex: '#888',
        image_url: reel.thumbnail_url,
        price: reel.price || 400000,
        regular_price: (reel.price || 400000) + 20000,
        quantity: 1,
        is_used: 0,
        condition_grade: 'Brand New',
        pta_status: 'Official PTA Approved',
        max_stock: 5,
      },
      false
    );

    router.push('/checkout');
  };

  if (!reels || reels.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[2px] shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Play className="w-4 h-4 text-pink-600 fill-pink-600 ml-0.5" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Shoppable Reels
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold uppercase border border-rose-200">
                Live Hands-On
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Watch unboxing, battery tests, and cosmetic grading before you buy
            </p>
          </div>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>View All Phones</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Reel Cards Horizontal Scroller */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {reels.map((reel) => (
          <motion.div
            key={reel.id}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => setActiveReel(reel)}
            className="group relative flex-shrink-0 w-44 sm:w-52 aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-slate-200/90 bg-slate-900"
          >
            {/* Background Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Play Button Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/40 transition-all shadow-lg">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Top Stats */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full font-medium">
                <Eye className="w-3 h-3" />
                {reel.views.toLocaleString()}
              </span>

              <button
                onClick={(e) => handleLike(reel.id, e)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md font-bold transition-colors ${
                  hasLiked[reel.id]
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 text-white hover:bg-rose-500/80'
                }`}
              >
                <Heart className={`w-3 h-3 ${hasLiked[reel.id] ? 'fill-white' : ''}`} />
                {likesCount[reel.id] || reel.likes}
              </button>
            </div>

            {/* Bottom Product Info Glass Pill */}
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
              <div className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-lg text-slate-900">
                <div className="text-xs font-black truncate">{reel.product_name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-extrabold text-emerald-600">
                    {formatPKR(reel.price)}
                  </span>
                  <button
                    onClick={(e) => handleQuickBuyReelProduct(reel, e)}
                    className="p-1 rounded-lg bg-slate-900 text-white hover:bg-emerald-600 transition-colors"
                    title="Quick Buy"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reel Modal Player */}
      <AnimatePresence>
        {activeReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm aspect-[9/16] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col justify-between"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveReel(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Video Player */}
              <video
                src={activeReel.video_url}
                poster={activeReel.thumbnail_url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

              {/* Reel Content Overlay */}
              <div className="relative z-10 p-5 mt-auto space-y-3">
                <div className="text-white space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                    CZNS Verified Review
                  </span>
                  <h3 className="text-base font-bold leading-snug">{activeReel.title}</h3>
                  <p className="text-xs text-slate-300">
                    Inspected by CZNS Karachi Lab: 30-Point Diagnostic Passed
                  </p>
                </div>

                {/* Product Action Card inside modal */}
                <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-between gap-3 text-slate-900">
                  <div>
                    <div className="text-xs font-black truncate">{activeReel.product_name}</div>
                    <div className="text-sm font-extrabold text-emerald-600">
                      {formatPKR(activeReel.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/phone/${activeReel.product_slug}`}
                      onClick={() => setActiveReel(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={(e) => handleQuickBuyReelProduct(activeReel, e)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
