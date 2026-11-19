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
        <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-czns-400">Loading order receipt...</p>
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
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-brand-emerald border border-brand-emerald/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">Order Confirmed!</h1>
        <p className="text-xs text-czns-300 max-w-md mx-auto">
          Thank you for choosing CZNS Mobile Store. Your smartphone order is logged in our dispatch queue.
        </p>

        {/* Order Number Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-czns-900 border border-czns-750 text-xs text-white">
          <span className="text-czns-400">Order Reference:</span>
          <span className="font-mono font-bold text-brand-emerald">{order?.order_number}</span>
          <button
            onClick={copyOrderNo}
            className="text-czns-400 hover:text-white p-1 rounded transition-colors"
            title="Copy Order Number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Manual Online Payment Verification Notice (Phase 4 Requirement) */}
      {isManualOnline && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-brand-gold/40 text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-brand-gold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Advance Payment Verification Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-100/90">
            Your manual payment TID <strong className="font-mono text-white">({order?.tid || 'Pending'})</strong> has been submitted. For fraud prevention, our accounts desk validates transactions directly with the banking portal before courier dispatch.
          </p>
        </div>
      )}

      {/* Order Details Card */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-czns-400 pb-2 border-b border-czns-800">
          Order Information
        </h2>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-czns-400 block text-[11px]">Customer Name:</span>
            <span className="font-bold text-white">{order?.customer_name}</span>
          </div>
          <div>
            <span className="text-czns-400 block text-[11px]">WhatsApp:</span>
            <span className="font-bold text-white">{order?.customer_phone}</span>
          </div>
          <div>
            <span className="text-czns-400 block text-[11px]">Shipping City:</span>
            <span className="font-bold text-white">{order?.city}, {order?.province}</span>
          </div>
          <div>
            <span className="text-czns-400 block text-[11px]">Payment Method:</span>
            <span className="font-bold text-brand-emerald uppercase">
              {order?.payment_method}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-czns-800">
          <span className="text-czns-400 block text-[11px] mb-1">Delivery Address:</span>
          <p className="text-xs text-czns-200">{order?.address}</p>
        </div>

        {/* Items List */}
        {order?.items && order.items.length > 0 && (
          <div className="pt-3 border-t border-czns-800 space-y-2">
            <span className="text-czns-400 block text-[11px]">Ordered Phones:</span>
            {order.items.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-czns-950 border border-czns-850"
              >
                <div>
                  <div className="font-bold text-white">{i.product_name}</div>
                  <div className="text-[10px] text-czns-400">
                    {i.storage} • {i.color} • Qty: {i.quantity}
                  </div>
                </div>
                <div className="font-black text-white">{formatPKR(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t border-czns-800 flex items-center justify-between text-sm">
          <span className="font-bold text-czns-300">Total Paid / Payable:</span>
          <span className="text-lg font-black text-brand-emerald">{formatPKR(order?.total)}</span>
        </div>
      </div>

      {/* 1-Click WhatsApp Confirmation Action */}
      <div className="space-y-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-sm transition-all shadow-xl shadow-emerald-950/40"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Confirm on WhatsApp for Fastest Dispatch</span>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/track-order"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-czns-900 hover:bg-czns-850 border border-czns-750 text-white font-semibold text-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-czns-400" />
            <span>Track Order</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-czns-900 hover:bg-czns-850 border border-czns-750 text-white font-semibold text-xs transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
