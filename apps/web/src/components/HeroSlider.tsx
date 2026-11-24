'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  PhoneCall,
  ArrowRight,
  Cpu,
  Layers,
  Camera,
  CheckCircle2,
  BatteryCharging,
  Flame,
  Award,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  series: string;
  subtitle: string;
  price: string;
  regularPrice: string;
  saveText: string;
  link: string;
  image: string;
  accentColor: string;
  glowGradient: string;
  specs: { icon: React.ReactNode; label: string; sublabel: string }[];
}

const SLIDES: HeroSlide[] = [
  {
    id: 'apple-titanium',
    badge: 'AI-POWERED TITANIUM FLAGSHIP',
    title: 'iPhone 17 Pro',
    series: '& 16 Pro Max',
    subtitle: 'Grade 5 Aerospace Titanium chassis with A18 Pro 3nm silicon and 48MP Pro Fusion camera system. 100% genuine with official PTA DIRBS approval.',
    price: 'Rs. 447,000',
    regularPrice: 'Rs. 490,000',
    saveText: 'Save Rs. 43,000 • 1-Year Brand Warranty',
    link: '/shop?brand=apple',
    image: '/hero-iphone.jpg',
    accentColor: '#10b981',
    glowGradient: 'radial-gradient(circle at 65% 50%, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.05), transparent 70%)',
    specs: [
      {
        icon: <Cpu className="w-4 h-4 text-emerald-600" />,
        label: 'A18 Pro Silicon',
        sublabel: '3nm Hardware Ray Tracing',
      },
      {
        icon: <Layers className="w-4 h-4 text-emerald-600" />,
        label: '120Hz ProMotion',
        sublabel: 'Super Retina XDR OLED',
      },
      {
        icon: <Camera className="w-4 h-4 text-emerald-600" />,
        label: '48MP Pro Fusion',
        sublabel: '5x Optical Periscope Zoom',
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        label: 'Official PTA',
        sublabel: '1-Year Airlink / Mercantile',
      },
    ],
  },
  {
    id: 'samsung-gold-ultra',
    badge: '10TH GENERATION GALAXY AI ULTRA',
    title: 'Samsung S26 Ultra',
    series: '& S24 Ultra 5G',
    subtitle: 'Titanium Amber Gold Edition powered by Snapdragon 8 Elite and Galaxy AI. Built-in S-Pen with 200MP Quad-Telephoto Space Zoom and 5000mAh battery.',
    price: 'Rs. 383,000',
    regularPrice: 'Rs. 435,000',
    saveText: 'Save Rs. 52,000 • Karachi Same-Day COD',
    link: '/shop?brand=samsung',
    image: '/hero-samsung.jpg',
    accentColor: '#f59e0b',
    glowGradient: 'radial-gradient(circle at 65% 50%, rgba(245, 158, 11, 0.14), rgba(217, 119, 6, 0.06), transparent 70%)',
    specs: [
      {
        icon: <Cpu className="w-4 h-4 text-amber-600" />,
        label: 'Snapdragon 8 Elite',
        sublabel: 'Galaxy AI NPU Engine',
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        label: 'Dynamic AMOLED 2X',
        sublabel: '2600 nits Anti-Reflective',
      },
      {
        icon: <Camera className="w-4 h-4 text-amber-600" />,
        label: '200MP Quad Zoom',
        sublabel: 'Nightography 100x Space Zoom',
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
        label: 'Official PTA Approved',
        sublabel: 'Samsung Official Warranty',
      },
    ],
  },
  {
    id: 'used-certified-mint',
    badge: 'CERTIFIED 10/10 MINT PRE-OWNED',
    title: 'Flagship Pre-Owned',
    series: 'Save Up to 40% Off',
    subtitle: 'Diagnostic tested iPhones, Samsungs & Pixels with guaranteed 85%-100% original battery health, pristine body condition, and 7-Day checking replacement warranty.',
    price: 'From Rs. 14,300',
    regularPrice: 'Up to Rs. 350,000',
    saveText: '7-Day Replacement • Battery Guaranteed',
    link: '/shop?condition=used',
    image: '/hero-used.jpg',
    accentColor: '#10b981',
    glowGradient: 'radial-gradient(circle at 65% 50%, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.05), transparent 70%)',
    specs: [
      {
        icon: <BatteryCharging className="w-4 h-4 text-emerald-600" />,
        label: '85%–100% Health',
        sublabel: 'Original Unboosted Battery',
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        label: '32-Point Diagnostic',
        sublabel: 'TrueTone, OLED, Face ID Pass',
      },
      {
        icon: <Award className="w-4 h-4 text-emerald-600" />,
        label: '7-Day Replacement',
        sublabel: 'Complete Peace of Mind',
      },
      {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        label: 'PTA DIRBS Verified',
        sublabel: 'Physical IMEI Verification',
      },
    ],
  },
  {
    id: 'budget-kings',
    badge: 'VALUE PERFORMANCE KINGS',
    title: 'Budget Smartphones',
    series: 'Rs. 19,500 – 75,000',
    subtitle: 'Infinix, Redmi, Tecno & Vivo powerhouses with 120Hz displays, 108MP cameras, and 67W turbo charging. Sealed brand-new box packed stock with official warranties.',
    price: 'From Rs. 19,500',
    regularPrice: 'Rs. 75,000',
    saveText: '1-Year Official Warranty • Karachi COD',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=900&auto=format&fit=crop&q=85',
    accentColor: '#06b6d4',
    glowGradient: 'radial-gradient(circle at 65% 50%, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.05), transparent 70%)',
    specs: [
      {
        icon: <Zap className="w-4 h-4 text-blue-600" />,
        label: '67W Turbo Charge',
        sublabel: '0 to 100% in 35 Minutes',
      },
      {
        icon: <Layers className="w-4 h-4 text-blue-600" />,
        label: '120Hz AMOLED',
        sublabel: 'FHD+ Ultra Smooth Display',
      },
      {
        icon: <Camera className="w-4 h-4 text-blue-600" />,
        label: '108MP AI Camera',
        sublabel: 'Ultra HD Night Shooting',
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
        label: 'Official PTA Approved',
        sublabel: 'Box Pack with Charger',
      },
    ],
  },
];

export default function HeroSlider() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[currentIdx];

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 sm:pt-4"
    >
      {/* INSET CONTAINER WITH LIGHT LUXURY CURVED CORNERS */}
      <div className="relative rounded-[26px] sm:rounded-[36px] bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border border-slate-200/90 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] min-h-[500px] sm:min-h-[560px] flex items-center">
        {/* Dynamic Studio Lighting behind active phone */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: slide.glowGradient }}
        />

        {/* Ambient Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#00000006_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

        {/* Slide Content */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Typography & Spec Badges */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Sparkling Tag */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-slate-800">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Headline */}
                  <div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]">
                      {slide.title}
                    </h1>
                    <span className="text-xl sm:text-3xl font-extrabold text-slate-600 block mt-1 tracking-tight">
                      {slide.series}
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {/* Pricing & CTAs */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Wholesale Direct
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          style={{ color: 'var(--primary-color, #10b981)' }}
                          className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
                        >
                          {slide.price}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {slide.regularPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={slide.link}
                        className="px-6 py-3.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 group active:scale-95 cursor-pointer"
                      >
                        <span>Explore Collection</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <a
                        href={`https://wa.me/923001234567?text=Salam%20CZNS!%20I%20am%20interested%20in%20${encodeURIComponent(slide.title)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Minimal Spec Bottom Highlights */}
                  <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {slide.specs.map((sp, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-xl bg-white border border-slate-200 shrink-0 mt-0.5 shadow-xs">
                          {sp.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {sp.label}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            {sp.sublabel}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Large Crisp Studio Flagship Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="relative w-full max-w-md aspect-square flex items-center justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                    className="relative z-10 w-full h-full flex items-center justify-center p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="max-h-[350px] sm:max-h-[420px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-500 rounded-3xl"
                    />

                    {/* Floating Trust Tag */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-black uppercase text-slate-900">
                        {slide.saveText.split('•')[0]}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Circular Left and Right Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-md text-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-md text-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slide Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`transition-all rounded-full ${
                i === currentIdx ? 'w-6 h-2 bg-emerald-600' : 'w-2 h-2 bg-slate-300 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
