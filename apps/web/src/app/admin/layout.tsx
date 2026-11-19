'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Smartphone,
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Megaphone,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    const token = localStorage.getItem('czns_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Verify token with backend
    fetch('http://localhost:5000/api/v1/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem('czns_admin_token');
          router.push('/admin/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.admin) setAdminUser(data.admin);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('czns_admin_token');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Order Desks', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Phones & Stock', href: '/admin/inventory', icon: Package },
    { label: 'COD & Gateways', href: '/admin/gateways', icon: CreditCard },
    { label: 'Marketing & CRM', href: '/admin/marketing', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-czns-950 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-czns-900 border-b border-czns-800">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-white">CZNS Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-czns-800 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-czns-900 border-r border-czns-800 flex flex-col justify-between shrink-0 p-4 md:sticky md:top-0 md:h-screen`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="hidden md:flex items-center justify-between px-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-czns-950 font-black text-sm">
                C
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block -mb-1">
                  CZNS Control
                </span>
                <span className="text-[10px] text-brand-emerald font-semibold uppercase tracking-wider">
                  Store Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-emerald text-czns-950 shadow-md'
                      : 'text-czns-300 hover:text-white hover:bg-czns-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-czns-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-czns-400 hover:text-white hover:bg-czns-850 transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">{children}</main>
    </div>
  );
}
