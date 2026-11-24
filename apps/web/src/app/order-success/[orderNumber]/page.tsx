'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  PhoneCall,
  Clock,
  ShieldCheck,
  ArrowRight,
  Truck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Order } from '../../../lib/types';
import { apiFetch, formatPKR } from '../../../lib/api';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    async function fetchOrder() {
      if (!orderNumber) return;
      try {
        const res = await apiFetch(`/api/v1/orders/${orderNumber}`);
        if (res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  const copyOrderNo = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-semibold">Loading order receipt...</p>
      </div>
    );
  }

  const isManualOnline = ['jazzcash', 'easypaisa', 'bank_transfer'].includes(
    order?.payment_method || ''
  );

  const waStoreNum = '923001234567';
  const waMsg = encodeURIComponent(
    `Salam CZNS! I have placed order #${order?.order_number} for Rs. ${order?.total.toLocaleString()}.\nCustomer: ${order?.customer_name}\nCity: ${order?.city}\nPayment: ${order?.payment_method.toUpperCase()}${order?.tid ? `\nTID: ${order.tid}` : ''}\nPlease confirm my dispatch.`
  );
  const waUrl = `https://wa.me/${waStoreNum}?text=${waMsg}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 space-y-6">
      {/* Top Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Thank you for choosing CZNS Mobile Store. Your smartphone order is logged in our operations dispatch queue.
        </p>

        {/* Order Number Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 shadow-sm">
          <span className="text-slate-500 font-semibold">Order Reference:</span>
          <span className="font-mono font-black text-emerald-700">{order?.order_number}</span>
          <button
            onClick={copyOrderNo}
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
            title="Copy Order Number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Online Payment Verification Notice */}
      {isManualOnline && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Anti-Fraud Payment Verification Desk (Pending Verification)</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your TID <strong>{order?.tid}</strong> has been logged in our anti-fraud accounting queue. Our accounts team verifies transactions every 15-30 minutes before printing courier air-waybills.
          </p>
        </div>
      )}

      {/* Order Details Receipt Card */}
      <div className="bg-white/80 border border-slate-200/90 backdrop-blur-xl rounded-3xl p-6 space-y-5 shadow-sm text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deliver To</span>
            <span className="font-bold text-slate-900 text-sm">{order?.customer_name}</span>
            <div className="text-slate-500">{order?.address}, {order?.city}</div>
            <div className="text-slate-500">{order?.customer_phone}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
            <span className="font-bold text-slate-900 uppercase">{order?.payment_method.replace('_', ' ')}</span>
            <div className="text-[11px] text-emerald-700 font-semibold">{order?.payment_status.toUpperCase()}</div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Items Purchased</span>
          {order?.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300'}
                  alt={item.product_name}
                  className="w-10 h-10 object-cover rounded-xl bg-slate-50 border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900">{item.product_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.storage} • {item.color || item.color_name} x{item.quantity}
                  </div>
                </div>
              </div>
              <div className="font-black text-slate-900">
                {formatPKR((item.price || item.unit_price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatPKR(order?.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee</span>
            <span>{order?.delivery_fee === 0 ? 'Free Shipping' : formatPKR(order?.delivery_fee || 0)}</span>
          </div>
          {order?.discount ? (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Coupon Discount</span>
              <span>-{formatPKR(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Paid / Payable</span>
            <span className="text-emerald-700">{formatPKR(order?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Confirm Dispatch Instantly on WhatsApp</span>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/track-order"
            className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center border border-slate-200 transition-colors"
          >
            Track Order Status
          </Link>

          <Link
            href="/shop"
            className="py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
