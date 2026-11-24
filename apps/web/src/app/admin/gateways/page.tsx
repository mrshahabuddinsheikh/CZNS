'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Save,
  Check,
  ShieldCheck,
  Building,
  Smartphone,
  Globe,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';

export default function AdminGatewaysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings
  const [karachiOnlyCod, setKarachiOnlyCod] = useState(true);
  const [codKarachiFee, setCodKarachiFee] = useState(250);
  const [codNationwideFee, setCodNationwideFee] = useState(450);
  const [onlineAdvanceFee, setOnlineAdvanceFee] = useState(0);

  const [jazzcashTitle, setJazzcashTitle] = useState('');
  const [jazzcashNumber, setJazzcashNumber] = useState('');

  const [easypaisaTitle, setEasypaisaTitle] = useState('');
  const [easypaisaNumber, setEasypaisaNumber] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccountTitle, setBankAccountTitle] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIban, setBankIban] = useState('');

  const [payoneerEmail, setPayoneerEmail] = useState('');
  const [safepayKey, setSafepayKey] = useState('');
  const [whatsappSupport, setWhatsappSupport] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('czns_admin_token');
    fetch('/api/v1/admin/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || {};
        setKarachiOnlyCod(s.karachi_only_cod === '1');
        setCodKarachiFee(parseInt(s.cod_karachi_fee || '250', 10));
        setCodNationwideFee(parseInt(s.cod_nationwide_fee || '450', 10));
        setOnlineAdvanceFee(parseInt(s.online_advance_delivery_fee || '0', 10));

        setJazzcashTitle(s.jazzcash_title || '');
        setJazzcashNumber(s.jazzcash_number || '');

        setEasypaisaTitle(s.easypaisa_title || '');
        setEasypaisaNumber(s.easypaisa_number || '');

        setBankName(s.bank_name || '');
        setBankAccountTitle(s.bank_account_title || '');
        setBankAccountNumber(s.bank_account_number || '');
        setBankIban(s.bank_iban || '');

        setPayoneerEmail(s.payoneer_email || '');
        setSafepayKey(s.safepay_public_key || '');
        setWhatsappSupport(s.whatsapp_support_number || '');

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          karachi_only_cod: karachiOnlyCod ? '1' : '0',
          cod_karachi_fee: codKarachiFee.toString(),
          cod_nationwide_fee: codNationwideFee.toString(),
          online_advance_delivery_fee: onlineAdvanceFee.toString(),
          jazzcash_title: jazzcashTitle,
          jazzcash_number: jazzcashNumber,
          easypaisa_title: easypaisaTitle,
          easypaisa_number: easypaisaNumber,
          bank_name: bankName,
          bank_account_title: bankAccountTitle,
          bank_account_number: bankAccountNumber,
          bank_iban: bankIban,
          payoneer_email: payoneerEmail,
          safepay_public_key: safepayKey,
          whatsapp_support_number: whatsappSupport,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-czns-400">Loading gateway settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">COD & Payment Gateways Control</h1>
          <p className="text-xs text-czns-400 mt-0.5">
            Configure Karachi vs Nationwide COD policy, bank accounts, and merchant mobile wallets
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 border border-brand-emerald text-brand-emerald text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. COD CITY CONTROL SWITCH (Phase 4 Core Requirement) */}
        <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald block">
                Rule Control
              </span>
              <h2 className="text-sm font-bold text-white">
                Cash on Delivery (COD) City Control Switch
              </h2>
            </div>

            {/* Switch Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-czns-300">
                {karachiOnlyCod ? '🟢 Karachi Only COD' : '🌐 Nationwide COD'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={karachiOnlyCod}
                  onChange={(e) => setKarachiOnlyCod(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-czns-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-emerald" />
              </label>
            </div>
          </div>

          <p className="text-xs text-czns-300 leading-relaxed">
            When set to <strong className="text-white">&quot;Karachi Only COD&quot;</strong>, customers outside Karachi will see COD disabled with the mandatory policy notice:
            <span className="block mt-1 italic text-brand-gold">
              &quot;Cash on Delivery is available in Karachi only. Orders from other cities require online payment in advance.&quot;
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Karachi Delivery Fee (PKR)
              </label>
              <input
                type="number"
                value={codKarachiFee}
                onChange={(e) => setCodKarachiFee(parseInt(e.target.value, 10))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Nationwide COD Fee (PKR)
              </label>
              <input
                type="number"
                value={codNationwideFee}
                onChange={(e) => setCodNationwideFee(parseInt(e.target.value, 10))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Advance Payment Delivery Fee (PKR)
              </label>
              <input
                type="number"
                value={onlineAdvanceFee}
                onChange={(e) => setOnlineAdvanceFee(parseInt(e.target.value, 10))}
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
              <span className="text-[10px] text-brand-emerald">Set to 0 for Free Delivery promotion</span>
            </div>
          </div>
        </div>

        {/* 2. JAZZCASH & EASYPAISA MOBILE WALLETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* JazzCash */}
          <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              JazzCash Merchant Wallet
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Account Title
              </label>
              <input
                type="text"
                value={jazzcashTitle}
                onChange={(e) => setJazzcashTitle(e.target.value)}
                placeholder="CZNS MOBILES (PVT) LTD"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                JazzCash Account Number
              </label>
              <input
                type="text"
                value={jazzcashNumber}
                onChange={(e) => setJazzcashNumber(e.target.value)}
                placeholder="0300 1234567"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Easypaisa */}
          <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Easypaisa Merchant Wallet
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Account Title
              </label>
              <input
                type="text"
                value={easypaisaTitle}
                onChange={(e) => setEasypaisaTitle(e.target.value)}
                placeholder="CZNS MOBILES STORE"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Easypaisa Account Number
              </label>
              <input
                type="text"
                value={easypaisaNumber}
                onChange={(e) => setEasypaisaNumber(e.target.value)}
                placeholder="0333 7654321"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. DIRECT BANK TRANSFER (IBFT & RAAST) */}
        <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Direct Bank Transfer (IBFT / Raast)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Meezan Bank Limited"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Bank Account Title
              </label>
              <input
                type="text"
                value={bankAccountTitle}
                onChange={(e) => setBankAccountTitle(e.target.value)}
                placeholder="CZNS MOBILE STORE OFFICIAL"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="01010102938475"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                24-Character IBAN
              </label>
              <input
                type="text"
                value={bankIban}
                onChange={(e) => setBankIban(e.target.value)}
                placeholder="PK45MEZN0001010102938475"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. OVERSEAS & WHATSAPP SUPPORT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Overseas Gateways (Payoneer / Safepay)
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Payoneer Email
              </label>
              <input
                type="email"
                value={payoneerEmail}
                onChange={(e) => setPayoneerEmail(e.target.value)}
                placeholder="payments@czns.pk"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                Safepay Merchant Public Key
              </label>
              <input
                type="text"
                value={safepayKey}
                onChange={(e) => setSafepayKey(e.target.value)}
                placeholder="sec_test_czns_pk_9948"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-czns-900 border border-czns-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              WhatsApp Store Support Number
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                WhatsApp Phone (Country code without +)
              </label>
              <input
                type="text"
                value={whatsappSupport}
                onChange={(e) => setWhatsappSupport(e.target.value)}
                placeholder="923001234567"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-czns-400 mt-1 block">
                Used to generate 1-click confirmation & tracking links
              </span>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-xs transition-colors shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Gateways...' : 'Save All Gateway Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
