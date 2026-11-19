'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, Package, Truck, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { Order } from '../../lib/types';
import { formatPKR } from '../../lib/api';

export default function TrackOrderPage() {
  const [identifier, setIdentifier] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${encodeURIComponent(identifier.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Order not found. Please check your order number or phone number.');
      } else {
        setOrder(data.order);
      }
    } catch (err: any) {
      setErrorMsg('Failed to fetch tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return { label: 'Pending Confirmation', color: 'bg-amber-500/20 text-brand-gold border-amber-500/30' };
      case 'confirmed':
        return { label: 'Order Confirmed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'packed':
        return { label: 'Packed & Ready', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'shipped':
        return { label: 'Dispatched / In Transit', color: 'bg-emerald-500/20 text-brand-emerald border-brand-emerald/30' };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-emerald-500 text-czns-950 font-bold' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { label: status, color: 'bg-czns-800 text-czns-300' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-czns-900 border border-czns-800 flex items-center justify-center mx-auto text-brand-emerald">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Track Your Shipment</h1>
        <p className="text-xs text-czns-400 max-w-md mx-auto">
          Enter your CZNS order number (e.g. CZNS-2026-8812) or WhatsApp mobile number to view live status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Order Number (e.g. CZNS-2026-8812) or Phone"
            className="w-full bg-czns-900 border border-czns-750 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
          />
          <Search className="w-4 h-4 text-czns-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-xs sm:text-sm transition-colors shadow-lg"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Card */}
      {order && (
        <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-czns-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-czns-400">
                Order Tracking
              </span>
              <h2 className="text-base font-black text-white font-mono">{order.order_number}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full border font-bold ${
                  getStatusBadge(order.order_status).color
                }`}
              >
                {getStatusBadge(order.order_status).label}
              </span>
            </div>
          </div>

          {/* Courier & Dispatch Info */}
          <div className="p-4 rounded-2xl bg-czns-950 border border-czns-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-czns-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-emerald" />
                Assigned Courier:
              </span>
              <span className="font-bold text-white">{order.courier_name || 'Dispatch Pending'}</span>
            </div>

            {order.tracking_number && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-czns-850">
                <span className="text-czns-400">Tracking Number:</span>
                <span className="font-mono font-bold text-brand-emerald tracking-wider">
                  {order.tracking_number}
                </span>
              </div>
            )}
          </div>

          {/* Customer & Destination */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-czns-400 block text-[11px]">Customer:</span>
              <span className="font-bold text-white">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-czns-400 block text-[11px]">Destination:</span>
              <span className="font-bold text-white">{order.city}, {order.province}</span>
            </div>
            <div>
              <span className="text-czns-400 block text-[11px]">Payment:</span>
              <span className="font-bold text-brand-emerald uppercase">{order.payment_method}</span>
            </div>
            <div>
              <span className="text-czns-400 block text-[11px]">Total:</span>
              <span className="font-bold text-white">{formatPKR(order.total)}</span>
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="pt-3 border-t border-czns-800 space-y-2">
              <span className="text-czns-400 block text-[11px] font-semibold">Items in Package:</span>
              {order.items.map((i) => (
                <div
                  key={i.id}
                  className="p-3 rounded-xl bg-czns-950 border border-czns-850 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{i.product_name}</div>
                    <div className="text-[10px] text-czns-400">
                      {i.storage} • {i.color}
                    </div>
                  </div>
                  <div className="font-bold text-white">{formatPKR(i.price)}</div>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp Support Link */}
          <div className="pt-2">
            <a
              href={`https://wa.me/923001234567?text=${encodeURIComponent(
                `Salam CZNS! Inquiring regarding order ${order.order_number}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-brand-emerald font-bold text-xs hover:bg-brand-emerald hover:text-czns-950 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Dispatch Team on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
