'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  PhoneCall,
  Coins,
  Tag,
  Lock,
  Globe,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { apiFetch, formatPKR } from '../../lib/api';
import { StoreSettings } from '../../lib/types';

const PROVINCES = [
  'Sindh',
  'Punjab',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu and Kashmir',
  'Gilgit-Baltistan',
];

const MAJOR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Hyderabad',
  'Gujranwala',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Abbottabad',
  'Other City',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, storeCoins } = useCart();

  // Settings loaded from backend
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('Sindh');
  const [city, setCity] = useState('Karachi');
  const [customCity, setCustomCity] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<
    'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card' | 'safepay'
  >('cod');

  // Manual TID fields (Anti-fraud protection)
  const [senderMobile, setSenderMobile] = useState('');
  const [tid, setTid] = useState('');

  // Card fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Coins redemption
  const [useCoins, setUseCoins] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Load Settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await apiFetch('/api/v1/settings');
        if (res.settings) {
          setSettings(res.settings);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    loadSettings();
  }, []);

  const effectiveCity = city === 'Other City' ? customCity : city;
  const isKarachi = effectiveCity.trim().toLowerCase() === 'karachi';
  const karachiOnlyCod = settings?.karachi_only_cod ?? true;
  const isCodAllowed = !karachiOnlyCod || isKarachi;

  // Auto-switch payment method away from COD if user selects a non-Karachi city while Karachi-only COD is active
  useEffect(() => {
    if (!isCodAllowed && paymentMethod === 'cod') {
      setPaymentMethod('jazzcash');
    }
  }, [isCodAllowed, paymentMethod]);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (paymentMethod === 'cod') {
    deliveryFee = isKarachi
      ? settings?.cod_karachi_fee || 250
      : settings?.cod_nationwide_fee || 450;
  } else {
    deliveryFee = settings?.online_advance_delivery_fee || 0; // Free delivery incentive on advance payment
  }

  // Discount calculation
  let discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  let coinsDiscount = 0;
  if (useCoins && storeCoins > 0) {
    // 100 coins = Rs. 100
    coinsDiscount = Math.min(storeCoins, subtotal * 0.1); // Max 10% discount from coins
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount - coinsDiscount);

  // Coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cart_total: subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount_amount,
          message: data.message,
        });
      } else {
        setCouponError(data.error || 'Invalid or expired coupon code');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error validating coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    if (!name || !phone || !address || !effectiveCity) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    // Strict Enforcement of COD City Control
    if (karachiOnlyCod && paymentMethod === 'cod' && !isKarachi) {
      setErrorMsg(
        'Cash on Delivery is available in Karachi only. Orders from other cities require online payment in advance.'
      );
      return;
    }

    // Anti-Fraud TID Validation check
    if (['jazzcash', 'easypaisa', 'bank_transfer'].includes(paymentMethod)) {
      if (!tid.trim()) {
        setErrorMsg(`Please enter your transaction TID for ${paymentMethod.toUpperCase()} payment verification.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        address,
        province,
        city: effectiveCity,
        payment_method: paymentMethod,
        sender_mobile: senderMobile || phone,
        tid: tid.trim(),
        coupon_code: appliedCoupon?.code,
        items: cart.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        notes: `Customer Order for ${effectiveCity}`,
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to place order');
        setSubmitting(false);
        return;
      }

      // Order Success!
      clearCart();
      router.push(`/order-success/${data.order.order_number}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while placing order');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Bag is Empty</h2>
        <p className="text-xs text-slate-500">
          Add a smartphone to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
        >
          Explore Smartphones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Checkout Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Pakistani Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Fast Karachi dispatch & nationwide insured courier delivery
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLS: SHIPPING DETAILS & PAYMENT GATEWAYS */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Shipping Details */}
            <div className="bg-white/80 border border-slate-200/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                1. Delivery & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Farhan Siddiqui"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Email Address (For PDF Invoice & Tracking)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Complete Delivery Address (House #, Street, Block / Sector, Landmark) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 8, Block 13-D, Near Disco Bakery, Gulshan-e-Iqbal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Province <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-semibold"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-semibold"
                  >
                    {MAJOR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {city === 'Other City' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Enter City Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter your city name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* 2. ADVANCED PAKISTANI PAYMENT GATEWAYS */}
            <div className="bg-white/80 border border-slate-200/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  2. Select Payment Method
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* PAYMENT OPTION 1: CASH ON DELIVERY (With Karachi Control Rule) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'cod' && isCodAllowed
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                    : isCodAllowed
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    disabled={!isCodAllowed}
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        Cash on Delivery (Karachi Delivery Fee: Rs. 250)
                        {isKarachi && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                            Rider Fast Dispatch
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Pay cash upon inspecting the phone seal or package at your doorstep in Karachi.
                    </p>

                    {/* Alert notice if customer selects other city */}
                    {!isKarachi && karachiOnlyCod && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Cash on Delivery is available in Karachi only. Orders from other cities require online payment in advance.
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 2: JAZZCASH */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="jazzcash"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="mt-1 accent-rose-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        JazzCash Mobile Account / Till
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-bold">
                          Free Express Shipping
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Transfer to our verified JazzCash merchant account and enter your Transaction ID (TID).
                    </p>

                    {paymentMethod === 'jazzcash' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white border border-rose-200 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Account Title</span>
                            <span className="font-bold text-slate-900">{settings?.jazzcash_title || 'CZNS Mobile Store'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Account Number</span>
                            <span className="font-black text-rose-700 tracking-wider">
                              {settings?.jazzcash_number || '0300 1234567'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings?.jazzcash_number || '03001234567', 'jazz')}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                          >
                            {copiedKey === 'jazz' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              Sender JazzCash Mobile #
                            </label>
                            <input
                              type="tel"
                              value={senderMobile}
                              onChange={(e) => setSenderMobile(e.target.value)}
                              placeholder="030X XXXXXXX"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-500 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              Transaction ID (TID) *
                            </label>
                            <input
                              type="text"
                              required
                              value={tid}
                              onChange={(e) => setTid(e.target.value)}
                              placeholder="e.g. 02938472910"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 3: EASYPAISA */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'easypaisa'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="easypaisa"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="mt-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        Easypaisa Mobile Wallet
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                          Free Express Shipping
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct Easypaisa transfer to verified CZNS merchant account.
                    </p>

                    {paymentMethod === 'easypaisa' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Account Title</span>
                            <span className="font-bold text-slate-900">{settings?.easypaisa_title || 'CZNS Mobile Store'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Account Number</span>
                            <span className="font-black text-emerald-700 tracking-wider">
                              {settings?.easypaisa_number || '0345 1234567'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings?.easypaisa_number || '03451234567', 'ep')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              Sender Easypaisa Mobile #
                            </label>
                            <input
                              type="tel"
                              value={senderMobile}
                              onChange={(e) => setSenderMobile(e.target.value)}
                              placeholder="034X XXXXXXX"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              Transaction ID (TID) *
                            </label>
                            <input
                              type="text"
                              required
                              value={tid}
                              onChange={(e) => setTid(e.target.value)}
                              placeholder="e.g. 1192837465"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 4: MEEZAN BANK IBFT / RAAST */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-1 accent-blue-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        Bank Transfer (IBFT) / Raast Instant
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full font-bold">
                          Free Express Shipping
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct online transfer via any Pakistani banking app using IBAN or Raast ID.
                    </p>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white border border-blue-200 space-y-3">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Bank Name:</span>
                            <span className="font-bold text-slate-900">{settings?.bank_name || 'Meezan Bank Limited'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Account Title:</span>
                            <span className="font-bold text-slate-900">{settings?.bank_account_title || 'CZNS SMARTPHONE STORE'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">IBAN / Acc #:</span>
                            <span className="font-mono font-bold text-blue-700">
                              {settings?.bank_iban || 'PK00MEZN0001020304050607'}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(settings?.bank_iban || 'PK00MEZN0001020304050607', 'iban')}
                              className="p-1 rounded bg-blue-50 text-blue-700"
                            >
                              {copiedKey === 'iban' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            Bank Reference / Transaction ID (TID) *
                          </label>
                          <input
                            type="text"
                            required
                            value={tid}
                            onChange={(e) => setTid(e.target.value)}
                            placeholder="Enter 12-digit IBFT Reference or Stanley confirmation ID"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: ORDER SUMMARY, COUPONS & COINS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 border border-slate-200/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.variant_id} className="flex items-center gap-3 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.product_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.storage} • {item.color_name} x{item.quantity}
                      </div>
                      {item.is_used === 1 && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          🔋 {item.battery_health}% • {item.condition_grade}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-slate-900">
                      {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Engine */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                  Discount Coupon
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter CZNS500 or WELCOME1000"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-bold outline-none focus:bg-white focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
                    <span>Coupon {appliedCoupon.code} applied!</span>
                    <span>-{formatPKR(appliedCoupon.discount)}</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-xs text-rose-600 font-medium">{couponError}</div>
                )}
              </div>

              {/* Loyalty Store Coins */}
              {storeCoins > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center justify-between text-xs cursor-pointer p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useCoins}
                        onChange={(e) => setUseCoins(e.target.checked)}
                        className="accent-amber-600 w-4 h-4 rounded"
                      />
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        Redeem Store Coins ({storeCoins} available)
                      </span>
                    </div>
                    {useCoins && (
                      <span className="font-black text-amber-900">-{formatPKR(coinsDiscount)}</span>
                    )}
                  </label>
                </div>
              )}

              {/* Calculations Box */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-semibold">{formatPKR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-800 font-semibold'}>
                    {deliveryFee === 0 ? 'Free Shipping (Advance Payment)' : formatPKR(deliveryFee)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                {useCoins && coinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Coins Redeemed</span>
                    <span>-{formatPKR(coinsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-emerald-700">{formatPKR(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Your Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>7-Day Replacement Checking Warranty Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
