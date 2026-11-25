import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SocialProofToast from '../components/SocialProofToast';
import ExitIntentLeadPopup from '../components/ExitIntentLeadPopup';
import ChatBot from '../components/ChatBot';
import MobileBottomBar from '../components/MobileBottomBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CZNS - Pakistan\'s Premier Smartphone Store | New & Certified Used Phones',
  description:
    'Buy brand new (Pin Packed with Official Warranty) and certified 10/10 pre-owned smartphones in Pakistan. iPhone 15 Pro Max, Samsung S24 Ultra, Pixel 8 with Karachi COD & Express Nationwide Shipping.',
  keywords: [
    'mobile store pakistan',
    'buy used iphone karachi',
    'samsung s24 ultra price in pakistan',
    'pta approved phones',
    'czns mobile store',
    'iphone 15 pro max used pakistan',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white relative`}
      >
        {/* Soft Ambient Radial Studio Lighting for Light Mode */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-20 w-[650px] h-[650px] rounded-full blur-[140px] opacity-70 transition-colors duration-700"
            style={{ backgroundColor: 'var(--primary-light, rgba(16, 185, 129, 0.15))' }}
          />
          <div className="absolute top-40 right-[-100px] w-[700px] h-[700px] bg-sky-100/40 rounded-full blur-[150px]" />
          <div className="absolute top-[45%] left-[20%] w-[550px] h-[550px] bg-amber-100/35 rounded-full blur-[140px]" />
          <div
            className="absolute bottom-20 right-[15%] w-[750px] h-[750px] rounded-full blur-[160px] opacity-60 transition-colors duration-700"
            style={{ backgroundColor: 'var(--primary-light, rgba(16, 185, 129, 0.15))' }}
          />
        </div>

        <ThemeProvider>
          <CartProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Suspense fallback={<div className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200" />}>
                <Header />
              </Suspense>

              <Suspense fallback={<div className="min-h-screen p-8 text-center text-xs text-slate-500">Loading...</div>}>
                <main className="flex-1">{children}</main>
              </Suspense>

              <Footer />
              <CartDrawer />
              <SocialProofToast />
              <ExitIntentLeadPopup />
              <ChatBot />
              <MobileBottomBar />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
