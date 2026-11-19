'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        const res = await fetch('http://localhost:5000/api/v1/social-proof');
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
      setTimeout(() => {
        setVisible(false);
      }, 5000);

      currentIndex = (currentIndex + 1) % events.length;
    }, 14000);

    return () => clearInterval(interval);
  }, [events, isDismissed]);

  if (!currentEvent || !visible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm animate-fade-in transition-all duration-300">
      <div className="bg-czns-900/95 border border-czns-750 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-white">
        {/* Product Image */}
        <div className="relative w-12 h-12 rounded-xl bg-czns-950 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentEvent.thumbnail}
            alt={currentEvent.product_name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald rounded-full border border-czns-950" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-[11px] text-czns-400">
            <span className="font-semibold text-white">{currentEvent.customer_name}</span>
            <span>in</span>
            <span className="font-semibold text-brand-gold">{currentEvent.city}</span>
            <span>•</span>
            <span className="text-[10px]">{currentEvent.time_ago}</span>
          </div>

          <div className="text-xs font-bold text-white truncate mt-0.5">
            Purchased {currentEvent.product_name}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-brand-emerald font-semibold mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>{currentEvent.condition_grade}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            setIsDismissed(true);
          }}
          className="text-czns-500 hover:text-white p-1 rounded-lg transition-colors self-start"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
