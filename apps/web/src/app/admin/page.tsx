'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { formatPKR } from '../../lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('czns_admin_token');
    fetch('http://localhost:5000/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-czns-400">Loading operations analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const lowStock = data?.lowStockVariants || [];
  const cityStats = data?.cityStats || [];
  const topSelling = data?.topSelling || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Operations Dashboard</h1>
          <p className="text-xs text-czns-400 mt-0.5">
            Real-time sales, payment verifications & courier dispatch queues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders?desk=confirm_cod"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-brand-gold/30 text-brand-gold text-xs font-bold hover:bg-amber-500/20 transition-colors"
          >
            <span>Confirm COD ({stats.pendingCodConfirmations || 0})</span>
          </Link>

          <Link
            href="/admin/orders?desk=verify_tid"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            <span>Verify TIDs ({stats.pendingTidVerifications || 0})</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-czns-900 border border-czns-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-czns-400">
            Total Revenue
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatPKR(stats.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-brand-emerald flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across all Pakistan</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-czns-900 border border-czns-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-czns-400">
            Total Orders Logged
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.totalOrders || 0}
          </div>
          <div className="text-[11px] text-czns-400">Karachi + Nationwide</div>
        </div>

        <div className="p-5 rounded-2xl bg-czns-900 border border-czns-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Pending COD Calls
          </span>
          <div className="text-xl sm:text-2xl font-black text-brand-gold">
            {stats.pendingCodConfirmations || 0}
          </div>
          <Link
            href="/admin/orders?desk=confirm_cod"
            className="text-[11px] text-brand-gold underline block"
          >
            Open WhatsApp Confirm Desk →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-czns-900 border border-czns-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Pending Payment TIDs
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-300">
            {stats.pendingTidVerifications || 0}
          </div>
          <Link
            href="/admin/orders?desk=verify_tid"
            className="text-[11px] text-blue-300 underline block"
          >
            Verify in Banking App →
          </Link>
        </div>
      </div>

      {/* Low Stock Level Warning Alert */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Low Stock Alerts ({lowStock.length} Phone Variants &lt;= 3 units)</span>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-brand-gold hover:underline font-semibold"
            >
              Manage Inventory
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStock.map((v: any) => (
              <div
                key={v.id}
                className="p-2.5 rounded-xl bg-czns-900/80 border border-czns-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white truncate max-w-[180px]">
                    {v.product_name}
                  </div>
                  <div className="text-[10px] text-czns-400">
                    {v.storage} • {v.color_name}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-black">
                  {v.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Row: Pakistan City Breakdown & Top Selling Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pakistan Geographic Cities Breakdown */}
        <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              Pakistan Geographic Demand
            </h2>
            <span className="text-[10px] text-czns-400 font-semibold">By Order Volume</span>
          </div>

          <div className="space-y-2.5">
            {cityStats.map((c: any) => (
              <div
                key={c.city}
                className="p-3 rounded-xl bg-czns-950 border border-czns-850 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.city}</span>
                  {c.city.toLowerCase() === 'karachi' && (
                    <span className="text-[9px] bg-emerald-500/20 text-brand-emerald px-1.5 py-0.2 rounded font-bold">
                      COD Hub
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-gold">{c.count} orders</span>
                  <span className="text-czns-400 text-[10px] block">{formatPKR(c.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Phone Models */}
        <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-gold" />
              Top Selling Smartphones
            </h2>
            <span className="text-[10px] text-czns-400 font-semibold">Volume Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {topSelling.map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-czns-950 border border-czns-850 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white truncate max-w-[220px]">
                    {p.product_name}
                  </div>
                  <div className="text-[10px] text-czns-400">{formatPKR(p.total_amount)}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-czns-900 border border-czns-750 font-bold text-white">
                  {p.sold_qty} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-czns-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Recent Store Orders
          </h2>
          <Link href="/admin/orders" className="text-xs text-brand-emerald hover:underline">
            View All Desks →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-czns-300">
            <thead className="bg-czns-950 text-czns-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-czns-850">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-czns-850/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {ord.customer_name}
                    <span className="block text-[10px] text-czns-400">{ord.customer_phone}</span>
                  </td>
                  <td className="py-3 px-3">{ord.city}</td>
                  <td className="py-3 px-3">
                    <span className="uppercase text-[11px] font-bold text-brand-emerald">
                      {ord.payment_method}
                    </span>
                    {ord.tid && (
                      <span className="block text-[10px] text-czns-400 font-mono">TID: {ord.tid}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{formatPKR(ord.total)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.order_status === 'confirmed' || ord.order_status === 'delivered'
                          ? 'bg-emerald-500/20 text-brand-emerald'
                          : ord.order_status === 'pending_confirmation'
                          ? 'bg-amber-500/20 text-brand-gold'
                          : 'bg-czns-800 text-czns-300'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
