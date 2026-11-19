'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X, PhoneCall, Copy, Check, ArrowRight } from 'lucide-react';

export default function ExitIntentLeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Karachi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const dismissed = localStorage.getItem('czns_lead_dismissed');
    if (dismissed) return;

    // Desktop exit-intent (cursor moving to top of window)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    // Mobile fallback timer (show after 30 seconds)
    const timer = setTimeout(() => {
      if (!hasTriggered && !localStorage.getItem('czns_lead_dismissed')) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [hasTriggered]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('czns_lead_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Pakistani Shopper',
          whatsapp_number: phone,
          city,
          source: 'exit_intent_popup',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCouponCode(data.coupon_code || 'CZNS500');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Lead submit error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-czns-950 border border-czns-750 rounded-3xl p-6 sm:p-7 shadow-2xl text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-brand-emerald/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-brand-gold/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-czns-400 hover:text-white rounded-full hover:bg-czns-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!couponCode ? (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Special Welcome Voucher</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
              Wait! Get <span className="text-brand-emerald">Rs. 500 OFF</span> Your Phone Order
            </h3>
            <p className="text-xs text-czns-300 mb-5 leading-relaxed">
              Enter your WhatsApp number to instantly unlock coupon code{' '}
              <strong className="text-white">CZNS500</strong>. Valid on all Brand New & Pre-Owned 10/10 phones.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full bg-czns-900 border border-czns-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  WhatsApp Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full bg-czns-900 border border-czns-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
                  />
                  <PhoneCall className="w-4 h-4 text-czns-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Your City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-czns-900 border border-czns-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                >
                  <option value="Karachi">Karachi (Same Day Dispatch)</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Other">Other Pakistani City</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
              >
                <span>{isSubmitting ? 'Unlocking Voucher...' : 'Claim Rs. 500 Discount'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-brand-emerald border border-brand-emerald/40 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Voucher Activated!</h3>
              <p className="text-xs text-czns-300 mt-1">
                Use this promo code at checkout to save Rs. 500 instantly on your order:
              </p>
            </div>

            {/* Promo Code Box */}
            <div className="bg-czns-900 border-2 border-dashed border-brand-emerald/60 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <span className="text-lg font-black tracking-widest text-brand-emerald">
                {couponCode}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-czns-800 hover:bg-czns-750 text-xs font-bold text-white transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-emerald text-czns-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
            >
              Start Shopping Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
