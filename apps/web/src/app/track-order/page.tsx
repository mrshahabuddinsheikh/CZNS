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
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(identifier.trim())}`);
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
        return { label: 'Pending Confirmation', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'confirmed':
        return { label: 'Order Confirmed', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'packed':
        return { label: 'Packed & Ready', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'shipped':
        return { label: 'Dispatched / In Transit', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-emerald-600 text-white font-bold' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto text-emerald-600">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Track Your Shipment</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
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
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Card */}
      {order && (
        <div className="bg-white/80 border border-slate-200/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Reference</span>
              <span className="text-base font-black text-slate-900">{order.order_number}</span>
              <div className="text-xs text-slate-500 mt-0.5">{order.customer_name} • {order.city}</div>
            </div>

            <div className="self-start sm:self-auto">
              {(() => {
                const b = getStatusBadge(order.order_status || (order as any).status);
                return (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${b.color}`}>
                    {b.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Courier Details */}
          {order.courier_name && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Courier</span>
                <span className="font-bold text-slate-900">{order.courier_name} Express</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Air-Waybill Tracking #</span>
                <span className="font-mono font-bold text-emerald-700">{order.tracking_number}</span>
              </div>
            </div>
          )}

          {/* Timeline Milestones */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Dispatch Progress</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className={`p-2.5 rounded-xl border ${['pending_confirmation', 'confirmed', 'packed', 'shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                Order Placed
              </div>
              <div className={`p-2.5 rounded-xl border ${['confirmed', 'packed', 'shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                Verified
              </div>
              <div className={`p-2.5 rounded-xl border ${['packed', 'shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                Packed
              </div>
              <div className={`p-2.5 rounded-xl border ${['shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                In Transit
              </div>
            </div>
          </div>

          {/* Items in shipment */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Items</span>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-800 font-semibold">{item.product_name} ({item.storage} / {item.color || item.color_name}) x{item.quantity}</span>
                <span className="font-black text-slate-900">{formatPKR((item.price || item.unit_price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Total Order Amount</span>
            <span className="font-black text-slate-900 text-sm">{formatPKR(order.total)}</span>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contact Dispatch Manager on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
