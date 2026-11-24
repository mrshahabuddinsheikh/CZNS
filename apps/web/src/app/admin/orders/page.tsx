'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../../../lib/types';
import { formatPKR } from '../../../lib/api';

const COURIERS = [
  'TCS Express',
  'Leopards Courier',
  'Trax Logistics',
  'PostEx',
  'M&P Express',
  'Self Delivery Karachi (Rider)',
];

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const deskParam = searchParams.get('desk') || 'all';
  const [activeDesk, setActiveDesk] = useState<string>(deskParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState(COURIERS[0]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatching, setDispatching] = useState(false);

  // Verification notes
  const [actionNotes, setActionNotes] = useState('');

  const fetchOrders = async (desk = activeDesk, query = search) => {
    setLoading(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const q = new URLSearchParams();
      if (desk !== 'all') q.set('desk', desk);
      if (query.trim()) q.set('search', query.trim());

      const res = await fetch(`/api/v1/admin/orders?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(deskParam, search);
    setActiveDesk(deskParam);
  }, [deskParam]);

  const handleDeskChange = (desk: string) => {
    setActiveDesk(desk);
    router.push(`/admin/orders?desk=${desk}`);
  };

  // 1-Click WhatsApp Customer Confirmation for COD
  const getCodWhatsAppConfirmUrl = (ord: Order) => {
    const phone = ord.customer_phone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? `92${phone.slice(1)}` : phone;

    const firstItem = ord.items?.[0]?.product_name || 'Smartphone';
    const msg = encodeURIComponent(
      `Salam ${ord.customer_name}! 👋\nThis is CZNS Mobile Store Karachi regarding your Cash on Delivery order #${ord.order_number}.\n\nModel: ${firstItem}\nTotal Amount: ${formatPKR(ord.total)}\nDelivery Address: ${ord.address}, ${ord.city}\n\nPlease reply with *CONFIRM* so our rider can dispatch your sealed phone package today. Thank you!`
    );

    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  // Update order status
  const updateStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('czns_admin_token');
    await fetch(`/api/v1/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  // Verify or Reject Manual Payment TID (Anti-Fraud Desk)
  const handleVerifyPayment = async (orderId: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('czns_admin_token');
    await fetch(`/api/v1/admin/orders/${orderId}/verify-payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        notes: action === 'approve' ? 'TID verified in merchant portal.' : 'Fake or unverified TID rejected.',
      }),
    });
    fetchOrders();
  };

  // Dispatch Courier
  const handleDispatchCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder || !trackingNumber.trim()) return;

    setDispatching(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch(`/api/v1/admin/orders/${dispatchOrder.id}/dispatch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courier_name: courierName,
          tracking_number: trackingNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.whatsapp_tracking_url) {
        window.open(data.whatsapp_tracking_url, '_blank');
      }

      setDispatchOrder(null);
      setTrackingNumber('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Order Management Desks</h1>
        <p className="text-xs text-czns-400 mt-0.5">
          Dedicated queues for WhatsApp COD confirmation, fraud TID verification & courier packing
        </p>
      </div>

      {/* 4 Operations Desks Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-czns-850 pb-3">
        <button
          onClick={() => handleDeskChange('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeDesk === 'all'
              ? 'bg-czns-800 text-white'
              : 'bg-czns-900 text-czns-400 hover:text-white'
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => handleDeskChange('confirm_cod')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeDesk === 'confirm_cod'
              ? 'bg-brand-emerald text-czns-950 shadow-md'
              : 'bg-czns-900 text-brand-emerald hover:bg-emerald-950/40'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Confirm COD Desk</span>
        </button>

        <button
          onClick={() => handleDeskChange('verify_tid')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeDesk === 'verify_tid'
              ? 'bg-brand-gold text-czns-950 shadow-md'
              : 'bg-czns-900 text-brand-gold hover:bg-amber-950/40'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Verify Payment TID (Anti-Fraud)</span>
        </button>

        <button
          onClick={() => handleDeskChange('pack_ship')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeDesk === 'pack_ship'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-czns-900 text-blue-300 hover:bg-blue-950/40'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Pack & Ship Desk</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders(activeDesk, search)}
            placeholder="Search by Order #, Customer Name, Phone, City, or TID..."
            className="w-full bg-czns-900 border border-czns-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
          />
          <Search className="w-4 h-4 text-czns-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          onClick={() => fetchOrders(activeDesk, search)}
          className="px-4 py-2.5 rounded-xl bg-czns-800 text-white text-xs font-bold hover:bg-czns-750"
        >
          Filter
        </button>
      </div>

      {/* Orders List / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-czns-400">Loading order records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-czns-900 border border-czns-800 text-czns-400 space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto text-czns-600" />
          <h3 className="text-sm font-bold text-white">No Orders Found in this Desk</h3>
          <p className="text-xs">All queues are clear or no orders match your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isCod = ord.payment_method === 'cod';
            const isManualTid = ['jazzcash', 'easypaisa', 'bank_transfer'].includes(
              ord.payment_method
            );

            return (
              <div
                key={ord.id}
                className="p-5 rounded-3xl bg-czns-900 border border-czns-800 space-y-4 shadow-xl"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-czns-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-white">
                      {ord.order_number}
                    </span>
                    <span className="text-xs text-czns-400">
                      {new Date(ord.created_at).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ord.payment_status === 'verified' || ord.payment_status === 'paid'
                          ? 'bg-emerald-500/20 text-brand-emerald border-emerald-500/30'
                          : ord.payment_status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-brand-gold border-amber-500/30'
                      }`}
                    >
                      Payment: {ord.payment_status.replace('_', ' ')}
                    </span>

                    {/* Order Status Badge */}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-czns-800 text-white">
                      {ord.order_status}
                    </span>
                  </div>
                </div>

                {/* Customer, Shipping, Financial Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-czns-400 block mb-0.5">
                      Customer
                    </span>
                    <div className="font-bold text-white">{ord.customer_name}</div>
                    <div className="text-brand-emerald font-semibold">{ord.customer_phone}</div>
                    {ord.customer_email && (
                      <div className="text-czns-400 text-[11px]">{ord.customer_email}</div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-czns-400 block mb-0.5">
                      Shipping Destination
                    </span>
                    <div className="font-bold text-white">
                      {ord.city}, {ord.province}
                    </div>
                    <div className="text-czns-300 text-[11px] line-clamp-2">{ord.address}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-czns-400 block mb-0.5">
                      Payment & Courier
                    </span>
                    <div className="font-bold text-white uppercase text-brand-emerald">
                      {ord.payment_method}
                    </div>
                    <div className="text-sm font-black text-white">{formatPKR(ord.total)}</div>
                    {ord.tid && (
                      <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                        TID: {ord.tid} ({ord.sender_mobile || 'No mobile'})
                      </div>
                    )}
                    {ord.tracking_number && (
                      <div className="text-[11px] text-blue-300 font-mono mt-0.5">
                        Courier: {ord.courier_name} ({ord.tracking_number})
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items */}
                {ord.items && ord.items.length > 0 && (
                  <div className="p-3 rounded-2xl bg-czns-950/60 border border-czns-850 space-y-1.5 text-xs">
                    {ord.items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between text-czns-300">
                        <div>
                          <strong className="text-white">{i.product_name}</strong>
                          <span className="text-[11px] text-czns-400 ml-2">
                            ({i.storage} / {i.color}) x{i.quantity}
                          </span>
                          {i.imei_serial && (
                            <span className="ml-2 font-mono text-[10px] text-brand-emerald bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              IMEI: {i.imei_serial}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-white">
                          {formatPKR(i.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTION BUTTONS (Confirm COD, Verify TID, Dispatch) */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-czns-800">
                  {/* Left: Quick WhatsApp Confirmation for COD */}
                  {isCod && ord.order_status === 'pending_confirmation' && (
                    <a
                      href={getCodWhatsAppConfirmUrl(ord)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-brand-emerald/60 text-brand-emerald text-xs font-bold hover:bg-brand-emerald hover:text-czns-950 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>1-Click WhatsApp Customer Confirmation</span>
                    </a>
                  )}

                  {/* Middle: Manual TID Anti-Fraud Verification */}
                  {isManualTid && ord.payment_status === 'unverified_pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyPayment(ord.id, 'approve')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-emerald text-czns-950 text-xs font-bold hover:bg-emerald-400 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Payment TID</span>
                      </button>

                      <button
                        onClick={() => handleVerifyPayment(ord.id, 'reject')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Fake TID</span>
                      </button>
                    </div>
                  )}

                  {/* Right: Dispatch Courier Action */}
                  <div className="flex items-center gap-2 ml-auto">
                    {['pending_confirmation', 'confirmed', 'packed'].includes(
                      ord.order_status
                    ) && (
                      <button
                        onClick={() => {
                          setDispatchOrder(ord);
                          setTrackingNumber(ord.tracking_number || '');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Pack & Dispatch Courier</span>
                      </button>
                    )}

                    {/* Status dropdown */}
                    <select
                      value={ord.order_status}
                      onChange={(e) => updateStatus(ord.id, e.target.value)}
                      className="bg-czns-950 border border-czns-750 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-brand-emerald cursor-pointer"
                    >
                      <option value="pending_confirmation">Pending Confirmation</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH COURIER MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-czns-950 border border-czns-750 rounded-3xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-2 border-b border-czns-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                Dispatch Order #{dispatchOrder.order_number}
              </h3>
              <button
                onClick={() => setDispatchOrder(null)}
                className="text-czns-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchCourier} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Select Courier Partner
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Courier Tracking Number (CN / AWB) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-984920491 or LEO-204928"
                  className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-czns-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-czns-900 text-xs text-czns-300">
                Customer: <strong>{dispatchOrder.customer_name}</strong> ({dispatchOrder.city})
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 rounded-xl bg-czns-850 text-czns-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{dispatching ? 'Dispatching...' : 'Dispatch & WhatsApp Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-czns-400">Loading Order Desks...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
