'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CheckCircle2, PhoneCall, Tag, ShieldCheck, MapPin, Sparkles, Upload } from 'lucide-react';
import { formatPKR } from '../lib/api';

interface SellPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellPhoneModal({ isOpen, onClose }: SellPhoneModalProps) {
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('128GB');
  const [condition, setCondition] = useState('10/10 Mint Pre-Owned');
  const [ptaStatus, setPtaStatus] = useState('Official PTA Approved');
  const [batteryHealth, setBatteryHealth] = useState('90% - 95%');
  const [city, setCity] = useState('Karachi (Star City Mall / Saddar)');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const message = `*NEW AD / PHONE SELL REQUEST (OLX - CZNS)*\n\n` +
      `📱 *Brand & Model:* ${brand} ${model || 'Flagship'}\n` +
      `💾 *Storage:* ${storage}\n` +
      `✨ *Condition:* ${condition}\n` +
      `🔋 *Battery Health:* ${batteryHealth}\n` +
      `🛡️ *PTA Status:* ${ptaStatus}\n` +
      `📍 *Location:* ${city}\n` +
      `💰 *Expected Demand:* Rs. ${expectedPrice || 'Best Offer'}\n` +
      `📞 *Seller Contact:* ${phone}\n\n` +
      `Please provide instant cash evaluation and inspection at Star City Mall desk.`;

    const whatsappUrl = `https://wa.me/923001234567?text=${encodeURIComponent(message)}`;
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setModel('');
    setExpectedPrice('');
    setPhone('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#002f34]/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 text-slate-800 my-auto"
          >
            {/* OLX-Themed Modal Header */}
            <div className="bg-[#002f34] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#ffce32] text-[#002f34] flex items-center justify-center font-black text-sm">
                  +
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    <span>POST YOUR AD / SELL PHONE</span>
                  </h3>
                  <p className="text-[11px] text-teal-200">
                    Get instant cash offer at Star City Mall, Karachi or free pickup
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#002f34]">Ad Submitted Successfully!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Aap ki request WhatsApp direct desk par forward ho rahi hai. Star City Mall desk team aap se jald rabta karegi.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl bg-[#002f34] text-white text-xs font-bold hover:bg-[#003d44] transition-all"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                {/* Brand & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Brand *
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    >
                      <option value="Apple">Apple (iPhone)</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Google Pixel">Google Pixel</option>
                      <option value="Xiaomi">Xiaomi / Redmi</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Vivo">Vivo</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Infinix">Infinix</option>
                      <option value="Tecno">Tecno</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Model Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 15 Pro, S24 Ultra"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    />
                  </div>
                </div>

                {/* Storage & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Storage Capacity
                    </label>
                    <select
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    >
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physical Condition *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    >
                      <option value="Brand New (Factory Pin Pack)">Brand New (Pin Pack Sealed)</option>
                      <option value="10/10 Mint Pre-Owned (Scratchless)">10/10 Mint (Scratchless)</option>
                      <option value="9.5/10 Like New">9.5/10 Like New</option>
                      <option value="9/10 Minor Signs of Usage">9/10 Minor Signs of Usage</option>
                      <option value="Repaired / Screen Changed">Repaired / Refurbished</option>
                    </select>
                  </div>
                </div>

                {/* PTA & Battery Health */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PTA Approval Status *
                    </label>
                    <select
                      value={ptaStatus}
                      onChange={(e) => setPtaStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    >
                      <option value="Official PTA Approved">Official PTA Approved</option>
                      <option value="Non-PTA / Factory Unlock">Non-PTA / Factory Unlock</option>
                      <option value="JV / Carrier Locked">JV / Carrier Locked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Battery Health
                    </label>
                    <select
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    >
                      <option value="100% Brand New">100% (Brand New)</option>
                      <option value="95% - 99%">95% - 99%</option>
                      <option value="90% - 94%">90% - 94%</option>
                      <option value="85% - 89%">85% - 89%</option>
                      <option value="80% - 84%">80% - 84%</option>
                      <option value="Below 80% / Replaced">Below 80%</option>
                    </select>
                  </div>
                </div>

                {/* Location & Demand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Star City Mall, Saddar, Karachi"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expected Demand (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 185000"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#002f34] outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Star City Mall inspection desk directly aap ke number par best cash offer message karega.
                  </p>
                </div>

                {/* Trust callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">CZNS / OLX Direct Desk Assurance:</span> Same-day physical verification at Karachi Star City Mall or doorstep pickup with instant payment (Raast, Cash, or Bank Transfer).
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#002f34] hover:bg-[#003d44] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#ffce32]" />
                    <span>Post Ad &amp; Get Cash Offer via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
