'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle2, X } from 'lucide-react';

interface SocialEvent {
  customer_name: string;
  city: string;
  product_name: string;
  condition_grade: string;
  is_used: number;
  thumbnail: string;
  time_ago: string;
}

export default function SocialProofToast() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SocialEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/v1/social-proof');
        if (res.ok) {
          const data = await res.json();
          if (data.enabled && data.events?.length > 0) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.error('Social proof error', err);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0 || isDismissed) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      setCurrentEvent(events[currentIndex]);
      setVisible(true);

      // Hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      currentIndex = (currentIndex + 1) % events.length;
      return () => clearTimeout(timer);
    }, 14000);

    return () => clearInterval(interval);
  }, [events, isDismissed]);

  if (!currentEvent || isDismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 max-w-sm"
        >
          <div className="bg-white/90 border border-slate-200/90 p-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 text-slate-800">
            {/* Product Image */}
            <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentEvent.thumbnail}
                alt={currentEvent.product_name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-bold text-slate-800">{currentEvent.customer_name}</span>
                <span>in</span>
                <span className="font-semibold text-amber-700">{currentEvent.city}</span>
                <span>•</span>
                <span className="text-[10px]">{currentEvent.time_ago}</span>
              </div>

              <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                Purchased {currentEvent.product_name}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{currentEvent.condition_grade}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setVisible(false);
                setIsDismissed(true);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
