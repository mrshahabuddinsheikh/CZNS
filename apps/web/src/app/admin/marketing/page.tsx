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

  const fetchMarketingData = async () => {
    setLoading(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/marketing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(d);

      // Also get settings for pixels
      const sRes = await fetch('http://localhost:5000/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sData = await sRes.json();
      const s = sData.settings || {};
      setMetaPixel(s.meta_pixel_id || '');
      setTiktokPixel(s.tiktok_pixel_id || '');
      setGoogleAds(s.google_ads_id || '');
      setWebhookUrl(s.webhook_url || '');
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
      const res = await fetch('http://localhost:5000/api/v1/admin/coupons', {
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
      const res = await fetch('http://localhost:5000/api/v1/admin/reels', {
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
    await fetch('http://localhost:5000/api/v1/admin/settings', {
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

  const handleBackupDownload = () => {
    const token = localStorage.getItem('czns_admin_token');
    fetch('http://localhost:5000/api/v1/admin/backup', {
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
            Manage Shoppable Reels, Discount Coupons, WhatsApp Leads, and Ad Pixels
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
