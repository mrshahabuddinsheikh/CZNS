'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Play,
  Tag,
  PhoneCall,
  Download,
  Share2,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Code2,
  Flame,
  Clock,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Reel } from '../../../lib/types';

export default function AdminMarketingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState(500);
  const [minSpend, setMinSpend] = useState(25000);

  // New Reel Form
  const [reelTitle, setReelTitle] = useState('');
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelThumbUrl, setReelThumbUrl] = useState('');

  // Pixel Settings
  const [metaPixel, setMetaPixel] = useState('');
  const [tiktokPixel, setTiktokPixel] = useState('');
  const [googleAds, setGoogleAds] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [pixelSaved, setPixelSaved] = useState(false);

  // Deal of the Day State
  const [deal, setDeal] = useState<any>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [dealProductId, setDealProductId] = useState('');
  const [dealPrice, setDealPrice] = useState(0);
  const [dealRegPrice, setDealRegPrice] = useState(0);
  const [dealTitle, setDealTitle] = useState('');
  const [dealBadge, setDealBadge] = useState('LIMITED 24H FLASH DEAL');
  const [dealStock, setDealStock] = useState(5);
  const [dealDuration, setDealDuration] = useState(24);
  const [dealSaved, setDealSaved] = useState(false);

  // Founder Profile Settings
  const [founderName, setFounderName] = useState('Sherry');
  const [founderTitle, setFounderTitle] = useState('Founder & CEO, CZNS');
  const [founderImageUrl, setFounderImageUrl] = useState('/founder.jpg');
  const [founderWhatsapp, setFounderWhatsapp] = useState('923001234567');
  const [founderBadge, setFounderBadge] = useState('Founder Verified');
  const [founderSaved, setFounderSaved] = useState(false);

  const fetchMarketingData = async () => {
    setLoading(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/marketing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(d);

      // Load Deal of the Day
      const dealRes = await fetch('/api/v1/deals/today');
      if (dealRes.ok) {
        const dealData = await dealRes.json();
        setDeal(dealData.deal);
        if (dealData.deal) {
          setDealProductId(dealData.deal.product_id);
          setDealPrice(dealData.deal.deal_price);
          setDealRegPrice(dealData.deal.regular_price);
          setDealTitle(dealData.deal.title);
          setDealStock(dealData.deal.stock_total);
        }
      }

      // Load Products for Dropdown
      const prodRes = await fetch('/api/v1/products?limit=100');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductsList(prodData.products || []);
      }

      // Also get settings for pixels & founder
      const sRes = await fetch('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sData = await sRes.json();
      const s = sData.settings || {};
      setMetaPixel(s.meta_pixel_id || '');
      setTiktokPixel(s.tiktok_pixel_id || '');
      setGoogleAds(s.google_ads_id || '');
      setWebhookUrl(s.webhook_url || '');

      setFounderName(s.founder_name || 'Sherry');
      setFounderTitle(s.founder_title || 'Founder & CEO, CZNS');
      setFounderImageUrl(s.founder_image_url || '/founder.jpg');
      setFounderWhatsapp(s.founder_whatsapp || '923001234567');
      setFounderBadge(s.founder_badge_text || 'Founder Verified');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          discount_type: discountType,
          discount_value: discountValue,
          min_spend: minSpend,
        }),
      });

      if (res.ok) {
        setCouponCode('');
        fetchMarketingData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelTitle || !reelVideoUrl) return;

    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: reelTitle,
          video_url: reelVideoUrl,
          thumbnail_url: reelThumbUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
        }),
      });

      if (res.ok) {
        setReelTitle('');
        setReelVideoUrl('');
        setReelThumbUrl('');
        fetchMarketingData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePixels = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('czns_admin_token');
    await fetch('/api/v1/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meta_pixel_id: metaPixel,
        tiktok_pixel_id: tiktokPixel,
        google_ads_id: googleAds,
        webhook_url: webhookUrl,
      }),
    });
    setPixelSaved(true);
    setTimeout(() => setPixelSaved(false), 2500);
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealProductId || !dealPrice) return;

    try {
      const res = await fetch('/api/v1/admin/deals/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: dealProductId,
          title: dealTitle,
          deal_price: Number(dealPrice),
          regular_price: Number(dealRegPrice),
          duration_hours: Number(dealDuration),
          stock_total: Number(dealStock),
          badge_text: dealBadge,
        }),
      });

      if (res.ok) {
        setDealSaved(true);
        setTimeout(() => setDealSaved(false), 2500);
        fetchMarketingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSoldOut = async () => {
    try {
      const res = await fetch('/api/v1/admin/deals/today/toggle-sold-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_sold_out: deal?.is_sold_out === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        fetchMarketingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset24hTimer = async () => {
    try {
      const res = await fetch('/api/v1/admin/deals/today/reset-timer', {
        method: 'POST',
      });
      if (res.ok) {
        fetchMarketingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('czns_admin_token');
    await fetch('/api/v1/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        founder_name: founderName,
        founder_title: founderTitle,
        founder_image_url: founderImageUrl,
        founder_whatsapp: founderWhatsapp,
        founder_badge_text: founderBadge,
      }),
    });
    setFounderSaved(true);
    setTimeout(() => setFounderSaved(false), 2500);
  };

  const handleBackupDownload = () => {
    const token = localStorage.getItem('czns_admin_token');
    fetch('/api/v1/admin/backup', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `czns-db-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-czns-400">Loading marketing engine...</p>
      </div>
    );
  }

  const reels = data?.reels || [];
  const coupons = data?.coupons || [];
  const leads = data?.leads || [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header & 1-Click Backup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Marketing Hub & WhatsApp CRM</h1>
          <p className="text-xs text-czns-400 mt-0.5">
            Manage Deal of the Day, Founder Verified Desk, Shoppable Reels, Discount Coupons, and Pixels
          </p>
        </div>

        {/* 1-Click Database Backup */}
        <button
          onClick={handleBackupDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-czns-850 hover:bg-czns-800 border border-czns-750 text-white font-bold text-xs transition-colors shadow-md"
        >
          <Download className="w-4 h-4 text-brand-emerald" />
          <span>1-Click SQLite DB Backup</span>
        </button>
      </div>

      {/* A. DEAL OF THE DAY MANAGER (24H FLASH SALE & SOLD OUT STAMP) */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-czns-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Deal of the Day Manager
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  24-Hour Timer & Sold Out Stamp
                </span>
              </h2>
              <p className="text-xs text-czns-400 mt-0.5">
                Displays right after Hero section. Expires after 24 hours (turns black & white).
              </p>
            </div>
          </div>

          {dealSaved && (
            <span className="text-xs text-brand-emerald font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Deal Updated!
            </span>
          )}
        </div>

        {/* Current Live Deal Quick Status Card */}
        {deal && (
          <div className="bg-czns-950/90 border border-czns-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              {deal.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={deal.thumbnail}
                  alt={deal.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-czns-750 bg-czns-900 shrink-0"
                />
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-sm sm:text-base">{deal.title}</span>
                  {deal.is_sold_out === 1 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                      Sold Out Stamp Active
                    </span>
                  ) : deal.is_expired ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-czns-750 text-czns-300 border border-czns-600">
                      24h Expired (B&W Active)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Live & Ticking
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-brand-emerald">
                    Rs. {Number(deal.deal_price).toLocaleString()}
                  </span>
                  {deal.regular_price > deal.deal_price && (
                    <span className="text-czns-400 line-through">
                      Rs. {Number(deal.regular_price).toLocaleString()}
                    </span>
                  )}
                  <span className="text-czns-400">
                    Stock: {deal.stock_claimed || 0}/{deal.stock_total || 5} units
                  </span>
                </div>

                <p className="text-[11px] text-czns-400">
                  Ends: {new Date(deal.end_time).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Deal Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Toggle Sold Out Stamp */}
              <button
                type="button"
                onClick={handleToggleSoldOut}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  deal.is_sold_out === 1
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-950/40'
                    : 'bg-czns-850 hover:bg-rose-950/40 text-czns-300 hover:text-rose-300 border-czns-750 hover:border-rose-800'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  {deal.is_sold_out === 1 ? 'Remove Sold Out Stamp' : 'Mark as Sold Out Stamp'}
                </span>
              </button>

              {/* Reset 24-Hour Timer */}
              <button
                type="button"
                onClick={handleReset24hTimer}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-czns-850 hover:bg-czns-800 text-czns-200 border border-czns-750 transition-colors"
                title="Resets the 24-hour expiration countdown from right now"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset 24h Timer</span>
              </button>
            </div>
          </div>
        )}

        {/* Form to Set / Update Deal of the Day */}
        <form onSubmit={handleSaveDeal} className="pt-2 border-t border-czns-800/80 space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-czns-300 block">
            Set Today&apos;s Deal Product
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Select Existing Product */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Choose Product from Inventory
              </label>
              <select
                value={dealProductId}
                onChange={(e) => {
                  const selId = e.target.value;
                  setDealProductId(selId);
                  const selectedProd = productsList.find((p) => p.id === selId);
                  if (selectedProd) {
                    setDealTitle(selectedProd.name);
                    const originalP = selectedProd.min_price || selectedProd.regular_price || 100000;
                    setDealRegPrice(originalP);
                    setDealPrice(Math.round(originalP * 0.88)); // default 12% off
                  }
                }}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white truncate"
              >
                <option value="">Select a product...</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.is_used ? '(Used)' : '(New)'} - Rs. {Number(p.min_price || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Deal Title */}
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">Deal Title</label>
              <input
                type="text"
                required
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="iPhone 15 Pro Max (Titanium Blue)"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">Badge Text</label>
              <input
                type="text"
                value={dealBadge}
                onChange={(e) => setDealBadge(e.target.value)}
                placeholder="LIMITED 24H FLASH DEAL"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold text-amber-400"
              />
            </div>

            {/* Deal Price */}
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Flash Deal Price (PKR)
              </label>
              <input
                type="number"
                required
                value={dealPrice}
                onChange={(e) => setDealPrice(Number(e.target.value))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-brand-emerald font-bold"
              />
            </div>

            {/* Regular Price */}
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Regular Price (PKR)
              </label>
              <input
                type="number"
                value={dealRegPrice}
                onChange={(e) => setDealRegPrice(Number(e.target.value))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Stock Limit */}
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Flash Stock Units (Auto-sold out when reached)
              </label>
              <input
                type="number"
                min="1"
                value={dealStock}
                onChange={(e) => setDealStock(Number(e.target.value))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-czns-400">
              Deal will automatically reset to 24 hours duration from launch time.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
            >
              Launch Deal of the Day
            </button>
          </div>
        </form>
      </div>

      {/* B. STORE FOUNDER & CEO PROFILE (HEADER DESK) */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-czns-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Store Founder & Verified Owner Desk
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30">
                  Header Pill & Customer Trust
                </span>
              </h2>
              <p className="text-xs text-czns-400 mt-0.5">
                Displays in website top header so buyers can verify the owner directly and connect on WhatsApp.
              </p>
            </div>
          </div>

          {founderSaved && (
            <span className="text-xs text-brand-emerald font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Founder Profile Saved!
            </span>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="bg-czns-950/80 border border-czns-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-gold/60 shadow-lg shadow-amber-500/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={founderImageUrl || '/founder.jpg'}
              alt={founderName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="space-y-0.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-black text-white text-sm">{founderName}</span>
              <span className="text-[10px] bg-brand-gold/20 text-brand-gold border border-brand-gold/40 px-2 py-0.2 rounded-full font-bold">
                {founderBadge}
              </span>
            </div>
            <p className="text-xs text-czns-400">{founderTitle}</p>
            <p className="text-[11px] font-mono text-brand-emerald">WhatsApp: +{founderWhatsapp}</p>
          </div>
        </div>

        {/* Edit Founder Form */}
        <form onSubmit={handleSaveFounder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Founder / Owner Name
              </label>
              <input
                type="text"
                required
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Sherry"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Official Title / Designation
              </label>
              <input
                type="text"
                required
                value={founderTitle}
                onChange={(e) => setFounderTitle(e.target.value)}
                placeholder="Founder & CEO, CZNS"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Founder Image URL (or Local Path)
              </label>
              <input
                type="text"
                required
                value={founderImageUrl}
                onChange={(e) => setFounderImageUrl(e.target.value)}
                placeholder="/founder.jpg"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Direct WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={founderWhatsapp}
                onChange={(e) => setFounderWhatsapp(e.target.value)}
                placeholder="923001234567"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Header Badge Label
              </label>
              <input
                type="text"
                value={founderBadge}
                onChange={(e) => setFounderBadge(e.target.value)}
                placeholder="Founder Verified"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-bold text-xs"
          >
            Save Founder Profile
          </button>
        </form>
      </div>

      {/* 1. WHATSAPP LEADS CRM (Phase 5 Feature 3) */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-2">
            <PhoneCall className="w-4 h-4" />
            Captured WhatsApp Leads CRM ({leads.length})
          </h2>
          <span className="text-[10px] text-czns-400">Exit-intent popup synchronizations</span>
        </div>

        {leads.length === 0 ? (
          <p className="text-xs text-czns-400 py-4">No leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-czns-300">
              <thead className="bg-czns-950 text-czns-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">WhatsApp Number</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Captured Date</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-czns-850">
                {leads.map((lead: any) => {
                  const cleanPhone = lead.whatsapp_number
                    .replace(/[^0-9]/g, '')
                    .replace(/^0/, '92');
                  const chatMsg = encodeURIComponent(
                    `Salam ${lead.name || ''}! This is CZNS Mobile Store. We noticed you claimed our Rs. 500 discount coupon (CZNS500). Are you looking for a specific phone model today?`
                  );
                  const chatUrl = `https://wa.me/${cleanPhone}?text=${chatMsg}`;

                  return (
                    <tr key={lead.id} className="hover:bg-czns-850/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {lead.name || 'Visitor'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-emerald">
                        {lead.whatsapp_number}
                      </td>
                      <td className="py-2.5 px-3">{lead.city || 'Pakistan'}</td>
                      <td className="py-2.5 px-3 text-czns-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={chatUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-brand-emerald/40 text-brand-emerald text-[11px] font-bold hover:bg-brand-emerald hover:text-czns-950 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. COUPONS & DISCOUNTS ENGINE */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Discount Coupons & Promo Codes
        </h2>

        {/* Existing Coupons List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {coupons.map((c: any) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-czns-950 border border-czns-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-brand-gold text-sm tracking-wider">
                  {c.code}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-brand-gold px-1.5 py-0.2 rounded font-bold">
                  Active
                </span>
              </div>
              <div className="text-white font-semibold">
                {c.discount_type === 'percentage'
                  ? `${c.discount_value}% OFF`
                  : `Rs. ${c.discount_value.toLocaleString()} OFF`}
              </div>
              <div className="text-[10px] text-czns-400">
                Min Spend: Rs. {(c.min_spend || 0).toLocaleString()} • Used {c.usage_count || 0} times
              </div>
            </div>
          ))}
        </div>

        {/* Add Coupon Form */}
        <form onSubmit={handleCreateCoupon} className="pt-2 border-t border-czns-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-czns-400 block">
            Create New Promo Coupon
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="EID1500"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="fixed">Fixed PKR Amount</option>
                <option value="percentage">Percentage %</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(parseInt(e.target.value, 10))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Min Spend (PKR)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(parseInt(e.target.value, 10))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-brand-gold text-czns-950 font-bold text-xs hover:bg-amber-400"
          >
            Create Coupon
          </button>
        </form>
      </div>

      {/* 3. SHOPPABLE REELS MANAGER */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Play className="w-4 h-4" />
          Shoppable Phone Review Reels ({reels.length})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {reels.map((r: any) => (
            <div
              key={r.id}
              className="p-3 rounded-2xl bg-czns-950 border border-czns-800 space-y-2 text-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.thumbnail_url}
                alt={r.title}
                className="w-full aspect-[9/12] object-cover rounded-xl bg-czns-900"
              />
              <div className="font-bold text-white line-clamp-2">{r.title}</div>
              <div className="text-[10px] text-czns-400">
                {r.views.toLocaleString()} views • {r.likes} likes
              </div>
            </div>
          ))}
        </div>

        {/* Add Reel Form */}
        <form onSubmit={handleCreateReel} className="pt-2 border-t border-czns-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-czns-400 block">
            Add New Reel
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Reel Title</label>
              <input
                type="text"
                required
                value={reelTitle}
                onChange={(e) => setReelTitle(e.target.value)}
                placeholder="Samsung S24 Ultra 100x Zoom Test"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Direct MP4 Video URL</label>
              <input
                type="url"
                required
                value={reelVideoUrl}
                onChange={(e) => setReelVideoUrl(e.target.value)}
                placeholder="https://assets.mixkit.co/..."
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-czns-400 block mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={reelThumbUrl}
                onChange={(e) => setReelThumbUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
          >
            Publish Reel
          </button>
        </form>
      </div>

      {/* 4. SOCIAL AD PIXELS & WEBHOOKS */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            Social Ad Pixels & CRM Webhooks
          </h2>
          {pixelSaved && (
            <span className="text-xs text-brand-emerald font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Pixels Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSavePixels} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Meta Pixel ID (Facebook / Instagram Ads)
              </label>
              <input
                type="text"
                value={metaPixel}
                onChange={(e) => setMetaPixel(e.target.value)}
                placeholder="e.g. 9849201948271"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={tiktokPixel}
                onChange={(e) => setTiktokPixel(e.target.value)}
                placeholder="e.g. C84920491823"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Google Ads Conversion ID
              </label>
              <input
                type="text"
                value={googleAds}
                onChange={(e) => setGoogleAds(e.target.value)}
                placeholder="e.g. AW-984920194"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Lead Webhook URL (Make / Zapier / WhatsApp Bot)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.eu1.make.com/..."
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Save Tracking Pixels
          </button>
        </form>
      </div>
    </div>
  );
}
