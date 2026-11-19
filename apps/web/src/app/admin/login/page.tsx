'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, Smartphone } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@czns.pk');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials');
      } else {
        localStorage.setItem('czns_admin_token', data.token);
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to CZNS API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-czns-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-czns-900 border border-czns-800 rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-emerald flex items-center justify-center mx-auto text-czns-950 shadow-xl shadow-emerald-950/50">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CZNS Store Control</h1>
          <p className="text-xs text-czns-400">
            Protected management portal for orders, stock & gateways
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-czns-400 block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@czns.pk"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
              />
              <Mail className="w-4 h-4 text-czns-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-czns-400 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-czns-950 border border-czns-750 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
              />
              <Lock className="w-4 h-4 text-czns-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="p-2.5 rounded-xl bg-czns-950 border border-czns-800 text-[11px] text-czns-400 flex items-center justify-between">
            <span>Demo: <strong className="text-white">admin@czns.pk</strong></span>
            <span>Pass: <strong className="text-white">admin123</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-xs transition-colors shadow-lg shadow-emerald-950/40"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
