'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
        const res = await fetch('http://localhost:5000/api/v1/reels');
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
      await fetch(`http://localhost:5000/api/v1/reels/${reelId}/like`, { method: 'POST' });
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
        quantity: 1,
        is_used: reel.is_used || 0,
        condition_grade: reel.condition_grade || 'Certified',
        pta_status: reel.pta_status || 'Official PTA',
        max_stock: 5,
      },
      false
    );

    router.push('/checkout');
  };

  if (reels.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Shoppable Phone Reviews
                <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  REELS
                </span>
              </h2>
              <p className="text-xs text-czns-400">
                Watch real unboxings, camera zoom tests & diagnostic condition checks
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Reels Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-czns-900 border border-czns-800 hover:border-brand-emerald/60 transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between p-3"
            >
              {/* Background Thumbnail / Video Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reel.thumbnail_url}
                alt={reel.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-czns-950 via-czns-950/40 to-transparent" />

              {/* Top Bar: Play Icon & Live Views */}
              <div className="relative z-10 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold">
                  <Eye className="w-3 h-3 text-czns-300" />
                  {reel.views.toLocaleString()}
                </span>
                <button
                  onClick={(e) => handleLike(reel.id, e)}
                  className={`flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    hasLiked[reel.id] ? 'text-rose-400' : 'text-white hover:text-rose-400'
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 ${hasLiked[reel.id] ? 'fill-rose-400 text-rose-400' : ''}`}
                  />
                  {likesCount[reel.id] || reel.likes}
                </button>
              </div>

              {/* Center Play Button Pulse */}
              <div className="relative z-10 self-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-125 group-hover:bg-brand-emerald group-hover:text-czns-950 transition-all duration-300">
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              </div>

              {/* Bottom Card: Title & 1-Click Buy Now Pill */}
              <div className="relative z-10 space-y-2">
                <h3 className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">
                  {reel.title}
                </h3>

                {reel.product_name && (
                  <div className="bg-czns-900/90 backdrop-blur-md border border-czns-700/80 p-2 rounded-xl flex items-center justify-between gap-1">
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-bold text-white truncate">
                        {reel.product_name}
                      </div>
                      <div className="text-[10px] font-black text-brand-emerald">
                        {formatPKR(reel.price)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleQuickBuyReelProduct(reel, e)}
                      className="shrink-0 bg-brand-emerald hover:bg-emerald-400 text-czns-950 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Vertical Reel Player Modal */}
      {activeReel && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          {/* Modal Container */}
          <div className="relative w-full max-w-sm aspect-[9/16] bg-czns-950 rounded-3xl overflow-hidden border border-czns-800 shadow-2xl flex flex-col justify-between p-4">
            {/* Background Video */}
            <video
              src={activeReel.video_url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

            {/* Modal Top Actions */}
            <div className="relative z-20 flex items-center justify-between text-white">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/75 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setActiveReel(null)}
                className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/75 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Bottom: Product Info Card & Instant Checkout */}
            <div className="relative z-20 space-y-3">
              <h2 className="text-sm font-bold text-white drop-shadow-md">{activeReel.title}</h2>

              {activeReel.product_name && (
                <div className="bg-czns-900/95 backdrop-blur-md border border-czns-700 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xl">
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-brand-emerald">
                      Featured in Reel
                    </span>
                    <div className="text-xs font-bold text-white truncate">
                      {activeReel.product_name}
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {formatPKR(activeReel.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleQuickBuyReelProduct(activeReel, e)}
                      className="bg-brand-emerald hover:bg-emerald-400 text-czns-950 text-xs font-black py-2 px-3 rounded-xl flex items-center gap-1 shadow-md transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Buy Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
