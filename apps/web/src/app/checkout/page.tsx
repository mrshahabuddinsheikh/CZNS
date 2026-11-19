'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  if (useCoins) {
    discountAmount += Math.min(storeCoins, 1000); // Max 1000 coins per order
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Handle Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('http://localhost:5000/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cart_total: subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discount: data.calculated_discount,
          message: data.message,
        });
      }
    } catch (e: any) {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your bag is empty.');
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

      const res = await fetch('http://localhost:5000/api/v1/orders', {
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
        <h2 className="text-2xl font-bold">Your Bag is Empty</h2>
        <p className="text-xs text-czns-400">
          Add a smartphone to your cart before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-brand-emerald text-czns-950 font-bold text-xs"
        >
          Explore Phones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Checkout Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Secure Pakistani Checkout
        </h1>
        <p className="text-xs text-czns-400 mt-1">
          Fast Karachi dispatch & nationwide insured courier delivery
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLS: SHIPPING DETAILS & PAYMENT GATEWAYS */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Shipping Details */}
            <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-emerald" />
                1. Delivery & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Farhan Siddiqui"
                    className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    WhatsApp Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Email Address (For PDF Invoice & Tracking)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Complete Delivery Address (House #, Street, Block / Sector, Landmark) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 8, Block 13-D, Near Disco Bakery, Gulshan-e-Iqbal"
                  className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Province <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
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
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Enter City Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter your city name"
                    className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>
              )}
            </div>

            {/* 2. ADVANCED PAKISTANI PAYMENT GATEWAYS (Phase 4 Requirement) */}
            <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-emerald" />
                  2. Select Payment Method
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-brand-emerald font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* PAYMENT OPTION 1: CASH ON DELIVERY (With Karachi Control Rule) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'cod' && isCodAllowed
                    ? 'bg-emerald-950/40 border-brand-emerald ring-1 ring-brand-emerald'
                    : isCodAllowed
                    ? 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                    : 'bg-czns-950/30 border-czns-850 opacity-60 cursor-not-allowed'
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
                    className="mt-1 accent-brand-emerald cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        Cash on Delivery (Karachi Delivery Fee: Rs. 250)
                        {isKarachi && (
                          <span className="text-[10px] bg-brand-emerald/20 text-brand-emerald px-2 py-0.2 rounded-full font-bold">
                            Rider Fast Dispatch
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-czns-400 mt-1">
                      Pay cash upon inspecting the phone seal or package at your doorstep in Karachi.
                    </p>

                    {/* PHASE 4 RULE: Alert notice if customer selects other city */}
                    {!isKarachi && karachiOnlyCod && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-brand-gold shrink-0" />
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
                    ? 'bg-amber-950/40 border-brand-gold ring-1 ring-brand-gold'
                    : 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="jazzcash"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="mt-1 accent-brand-gold cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        JazzCash Mobile Wallet (Free Shipping on Advance Pay)
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                        JazzCash
                      </span>
                    </div>

                    {paymentMethod === 'jazzcash' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-czns-900 border border-czns-800 space-y-3 animate-fade-in">
                        <div className="text-[11px] text-czns-300">
                          Transfer total <strong className="text-brand-gold">{formatPKR(finalTotal)}</strong> to our official JazzCash merchant account:
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800">
                            <span className="text-[10px] text-czns-400 block">Account Title</span>
                            <span className="font-bold text-white">{settings?.jazzcash_title}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-czns-400 block">JazzCash Number</span>
                              <span className="font-bold text-brand-gold tracking-wider">
                                {settings?.jazzcash_number}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(settings?.jazzcash_number || '', 'jc')}
                              className="p-1 rounded bg-czns-800 hover:bg-czns-700 text-czns-300 hover:text-white"
                            >
                              {copiedKey === 'jc' ? (
                                <Check className="w-3.5 h-3.5 text-brand-emerald" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Customer TID Input (Anti-fraud verification) */}
                        <div className="pt-1">
                          <label className="text-[11px] font-semibold text-czns-300 block mb-1">
                            Enter JazzCash Transaction ID (TID) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'jazzcash'}
                            value={tid}
                            onChange={(e) => setTid(e.target.value)}
                            placeholder="e.g. 104829104812"
                            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-gold font-mono"
                          />
                          <p className="text-[10px] text-czns-400 mt-1">
                            Orders are saved as Unverified / Pending until confirmed in banking portal.
                          </p>
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
                    ? 'bg-emerald-950/40 border-brand-emerald ring-1 ring-brand-emerald'
                    : 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="easypaisa"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="mt-1 accent-brand-emerald cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Easypaisa Mobile Wallet (Free Shipping)
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        Easypaisa
                      </span>
                    </div>

                    {paymentMethod === 'easypaisa' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-czns-900 border border-czns-800 space-y-3 animate-fade-in">
                        <div className="text-[11px] text-czns-300">
                          Transfer total <strong className="text-brand-emerald">{formatPKR(finalTotal)}</strong> to our verified Easypaisa account:
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800">
                            <span className="text-[10px] text-czns-400 block">Account Title</span>
                            <span className="font-bold text-white">{settings?.easypaisa_title}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-czns-400 block">Easypaisa Number</span>
                              <span className="font-bold text-brand-emerald tracking-wider">
                                {settings?.easypaisa_number}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(settings?.easypaisa_number || '', 'ep')}
                              className="p-1 rounded bg-czns-800 hover:bg-czns-700 text-czns-300 hover:text-white"
                            >
                              {copiedKey === 'ep' ? (
                                <Check className="w-3.5 h-3.5 text-brand-emerald" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="text-[11px] font-semibold text-czns-300 block mb-1">
                            Enter Easypaisa TID <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'easypaisa'}
                            value={tid}
                            onChange={(e) => setTid(e.target.value)}
                            placeholder="e.g. EP9849204821"
                            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 4: DIRECT BANK TRANSFER (IBFT / RAAST) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-1 accent-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Direct Bank Transfer (IBFT / Raast ID)
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                        Meezan Bank
                      </span>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-czns-900 border border-czns-800 space-y-3 animate-fade-in">
                        <div className="text-[11px] text-czns-300">
                          Transfer <strong className="text-blue-300">{formatPKR(finalTotal)}</strong> via mobile banking app (IBFT or Raast):
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-czns-400 block">Bank Name</span>
                              <span className="font-bold text-white">{settings?.bank_name}</span>
                            </div>
                            <span className="text-xs font-semibold text-czns-400">
                              {settings?.bank_account_title}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-czns-400 block">Account Number</span>
                              <span className="font-bold text-white font-mono">
                                {settings?.bank_account_number}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(settings?.bank_account_number || '', 'acc')}
                              className="p-1 rounded bg-czns-800 hover:bg-czns-700 text-czns-300"
                            >
                              {copiedKey === 'acc' ? (
                                <Check className="w-3.5 h-3.5 text-brand-emerald" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-czns-950 border border-czns-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-czns-400 block">24-Character IBAN</span>
                              <span className="font-bold text-white font-mono text-[11px]">
                                {settings?.bank_iban}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(settings?.bank_iban || '', 'iban')}
                              className="p-1 rounded bg-czns-800 hover:bg-czns-700 text-czns-300"
                            >
                              {copiedKey === 'iban' ? (
                                <Check className="w-3.5 h-3.5 text-brand-emerald" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="text-[11px] font-semibold text-czns-300 block mb-1">
                            Bank Reference / IBFT Transaction ID <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'bank_transfer'}
                            value={tid}
                            onChange={(e) => setTid(e.target.value)}
                            placeholder="e.g. MEZN-994812"
                            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white placeholder-czns-500 outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 5: DEBIT / CREDIT CARD */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                    : 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 accent-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Debit / Credit Card (Visa, Mastercard, PayPak)
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                        Instant Approval
                      </span>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-czns-900 border border-czns-800 space-y-3 animate-fade-in">
                        <div>
                          <label className="text-[10px] font-semibold text-czns-400 block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on card"
                            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-czns-400 block mb-1">
                            16-Digit Card Number
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-czns-400 block mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="12/28"
                              className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-czns-400 block mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* PAYMENT OPTION 6: PAYONEER / OVERSEAS */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  paymentMethod === 'safepay'
                    ? 'bg-blue-950/40 border-blue-400 ring-1 ring-blue-400'
                    : 'bg-czns-950/60 border-czns-800 hover:border-czns-700'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="safepay"
                    checked={paymentMethod === 'safepay'}
                    onChange={() => setPaymentMethod('safepay')}
                    className="mt-1 accent-blue-400 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        Overseas Pakistanis (Payoneer / Safepay Gateway)
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                        International
                      </span>
                    </div>
                    <p className="text-[11px] text-czns-400 mt-1">
                      Paying from Dubai, UK, USA, or Saudi Arabia for your family in Pakistan.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: ORDER SUMMARY, COUPONS, LOYALTY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-5 shadow-2xl sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-czns-800">
                Order Summary ({cart.length} items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-10 h-10 object-cover rounded-lg bg-czns-950 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-white truncate">
                          {item.product_name}
                        </div>
                        <div className="text-[10px] text-czns-400">
                          {item.storage} • {item.color_name} x{item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-white shrink-0">
                      {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-3 border-t border-czns-800/80 space-y-2">
                <label className="text-[11px] font-semibold text-czns-400 block">
                  Have a Promo Code? (e.g. CZNS500)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon"
                    className="flex-1 bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider font-mono outline-none focus:border-brand-emerald"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-czns-800 hover:bg-czns-750 text-xs font-bold text-white border border-czns-700 transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="text-xs text-brand-emerald font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>{appliedCoupon.message}</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-xs text-rose-400 font-semibold">{couponError}</div>
                )}
              </div>

              {/* Coins Loyalty Engine */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-brand-gold">
                  <Coins className="w-4 h-4" />
                  <div>
                    <span className="font-bold">Redeem Store Coins</span>
                    <span className="block text-[10px] text-czns-400">
                      You have {storeCoins.toLocaleString()} coins available
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={(e) => setUseCoins(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-czns-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold" />
                </label>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-czns-800">
                <div className="flex justify-between text-czns-400">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-white">{formatPKR(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-brand-emerald font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span>-{formatPKR(appliedCoupon.discount)}</span>
                  </div>
                )}

                {useCoins && (
                  <div className="flex justify-between text-brand-gold font-semibold">
                    <span>Store Coins Applied:</span>
                    <span>-{formatPKR(Math.min(storeCoins, 1000))}</span>
                  </div>
                )}

                <div className="flex justify-between text-czns-400">
                  <span>Delivery Charges ({effectiveCity}):</span>
                  <span>{deliveryFee === 0 ? 'FREE (Advance Pay)' : formatPKR(deliveryFee)}</span>
                </div>

                <div className="pt-2 border-t border-czns-800 flex justify-between items-baseline text-base font-black text-white">
                  <span>Total Amount:</span>
                  <span className="text-xl sm:text-2xl text-brand-emerald">
                    {formatPKR(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-sm transition-all shadow-xl shadow-emerald-950/50"
              >
                <span>
                  {submitting
                    ? 'Processing Order...'
                    : `Confirm Order (${formatPKR(finalTotal)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-czns-400 text-center leading-relaxed">
                By confirming, you agree to our 7-Day Replacement Policy and verified phone dispatch terms.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
