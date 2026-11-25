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
        className={`${inter.variable} font-sans bg-[#f7f8f9] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white relative`}
      >
        {/* Modern Dot Matrix Grid Pattern & Floating Ambient Lighting Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle Cyber / Grid Dot Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#002f3412_1px,transparent_1px)] [background-size:22px_22px] opacity-75" />

          {/* Floating Glow Lights */}
          <div
            className="absolute -top-32 -left-20 w-[650px] h-[650px] rounded-full blur-[140px] opacity-40 animate-pulse transition-colors duration-1000 bg-emerald-400/25"
          />
          <div className="absolute top-40 right-[-100px] w-[700px] h-[700px] bg-teal-300/20 rounded-full blur-[150px] animate-float-slow" />
          <div className="absolute top-[45%] left-[15%] w-[550px] h-[550px] bg-amber-200/20 rounded-full blur-[140px] animate-float-reverse" />
          <div
            className="absolute bottom-20 right-[15%] w-[750px] h-[750px] rounded-full blur-[160px] opacity-40 bg-emerald-300/20 animate-pulse"
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
