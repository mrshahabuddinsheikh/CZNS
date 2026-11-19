import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SocialProofToast from '../components/SocialProofToast';
import ExitIntentLeadPopup from '../components/ExitIntentLeadPopup';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CZNS - Pakistan Mobile Store | New & Used Smartphones',
  description:
    'Buy and sell brand new and certified 10/10 pre-owned smartphones in Pakistan. iPhone 15 Pro Max, Samsung S24 Ultra, Pixel 8 with Official Warranty & Karachi COD.',
  keywords: [
    'mobile store pakistan',
    'buy used iphone karachi',
    'samsung s24 ultra price in pakistan',
    'pta approved phones',
    'czns mobile store',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans bg-czns-950 text-white min-h-screen flex flex-col antialiased selection:bg-brand-emerald selection:text-czns-950`}>
        <CartProvider>
          <Suspense fallback={<div className="h-20 bg-czns-950" />}>
            <Header />
          </Suspense>
          <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-czns-400">Loading...</div>}>
            <main className="flex-1">{children}</main>
          </Suspense>
          <Footer />
          <CartDrawer />
          <SocialProofToast />
          <ExitIntentLeadPopup />
        </CartProvider>
      </body>
    </html>
  );
}
