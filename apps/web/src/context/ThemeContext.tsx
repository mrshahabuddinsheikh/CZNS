'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemePreset {
  id: string;
  name: string;
  hex: string;
  hover: string;
  rgb: string;
  description: string;
}

export interface FontOption {
  id: string;
  name: string;
  category: 'sans-serif' | 'display' | 'geometric';
  sample: string;
}

export interface FontPairPreset {
  id: string;
  name: string;
  primaryFont: string;
  secondaryFont: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'emerald',
    name: 'Emerald Mint (Default)',
    hex: '#10b981',
    hover: '#059669',
    rgb: '16, 185, 129',
    description: 'Fresh, verified e-commerce feel with Pakistan mobile trust',
  },
  {
    id: 'blue',
    name: 'Sapphire Flagship Blue',
    hex: '#2563eb',
    hover: '#1d4ed8',
    rgb: '37, 99, 235',
    description: 'High-tech Apple & Samsung flagship aesthetic',
  },
  {
    id: 'amber',
    name: 'Luxury Titanium Gold',
    hex: '#f59e0b',
    hover: '#d97706',
    rgb: '245, 158, 11',
    description: 'VIP champagne gold & warm titanium jewelry finish',
  },
  {
    id: 'cyan',
    name: 'Cyber Neon Cyan',
    hex: '#06b6d4',
    hover: '#0891b2',
    rgb: '6, 182, 212',
    description: 'Modern cyberpunk Ronin tech vibe with luminous glow',
  },
  {
    id: 'purple',
    name: 'Electric AI Violet',
    hex: '#8b5cf6',
    hover: '#7c3aed',
    rgb: '139, 92, 246',
    description: 'Cutting-edge AI and generative studio aesthetic',
  },
  {
    id: 'rose',
    name: 'Crimson Ruby Rose',
    hex: '#e11d48',
    hover: '#be123c',
    rgb: '225, 29, 72',
    description: 'High-energy special deal & limited edition styling',
  },
  {
    id: 'black',
    name: 'Stealth Titanium Onyx',
    hex: '#0f172a',
    hover: '#020617',
    rgb: '15, 23, 42',
    description: 'Minimalist monochrome Apple Pro aesthetic',
  },
];

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'Inter', name: 'Inter', category: 'sans-serif', sample: 'Neutral, clean, Apple-grade precision' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'geometric', sample: 'Modern, crisp tech typography' },
  { id: 'Outfit', name: 'Outfit', category: 'geometric', sample: 'Futuristic, high-contrast, Ronin-inspired' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'display', sample: 'Bold techno-display for flagships' },
  { id: 'Urbanist', name: 'Urbanist', category: 'geometric', sample: 'Sleek, architectural luxury look' },
  { id: 'Poppins', name: 'Poppins', category: 'geometric', sample: 'Friendly, rounded, high retail readability' },
  { id: 'Montserrat', name: 'Montserrat', category: 'geometric', sample: 'Sturdy, geometric commercial presence' },
  { id: 'DM Sans', name: 'DM Sans', category: 'sans-serif', sample: 'Minimalist Scandinavian tech design' },
  { id: 'Manrope', name: 'Manrope', category: 'sans-serif', sample: 'Semi-geometric, executive digital look' },
  { id: 'Lexend', name: 'Lexend', category: 'sans-serif', sample: 'Engineered for instant visual comprehension' },
  { id: 'Sora', name: 'Sora', category: 'geometric', sample: 'Japanese-inspired precision geometry' },
  { id: 'Syne', name: 'Syne', category: 'display', sample: 'Distinctive, avant-garde flagship title style' },
];

export const FONT_PAIR_PRESETS: FontPairPreset[] = [
  {
    id: 'modern-flagship',
    name: 'Modern Tech Flagship (Recommended)',
    primaryFont: 'Inter',
    secondaryFont: 'Plus Jakarta Sans',
    description: 'The premier balance of readability and sharp geometric headings',
  },
  {
    id: 'cyber-ronin',
    name: 'Cyber Ronin Tech',
    primaryFont: 'DM Sans',
    secondaryFont: 'Space Grotesk',
    description: 'Futuristic, distinctive tech feel inspired by Ronin and Nothing Phone',
  },
  {
    id: 'luxury-boutique',
    name: 'Luxury Titanium Boutique',
    primaryFont: 'Urbanist',
    secondaryFont: 'Syne',
    description: 'High-fashion, luxury titanium smartphone boutique elegance',
  },
  {
    id: 'monotype-outfit',
    name: 'Unified Geometric (Outfit)',
    primaryFont: 'Outfit',
    secondaryFont: 'Outfit',
    description: 'Ultra-clean cohesive monotype aesthetic across all UI elements',
  },
  {
    id: 'commercial-retail',
    name: 'High-Conversion Commercial',
    primaryFont: 'Lexend',
    secondaryFont: 'Poppins',
    description: 'Maximum legibility and warm commercial retail appeal',
  },
  {
    id: 'executive-corporate',
    name: 'Executive Architectural',
    primaryFont: 'Manrope',
    secondaryFont: 'Montserrat',
    description: 'Sturdy, established, certified-distributor authority',
  },
  {
    id: 'neo-precision',
    name: 'Neo-Tokyo Precision',
    primaryFont: 'Inter',
    secondaryFont: 'Sora',
    description: 'Refined precision electronics aesthetic with sharp geometry',
  },
];

interface ThemeContextType {
  primaryColor: string;
  accentPreset: string;
  primaryFont: string;
  secondaryFont: string;
  updateThemeColor: (hex: string, presetId?: string) => Promise<boolean>;
  updateFonts: (primary: string, secondary: string) => Promise<boolean>;
  presets: ThemePreset[];
  availableFonts: FontOption[];
  fontPairPresets: FontPairPreset[];
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#10b981',
  accentPreset: 'emerald',
  primaryFont: 'Inter',
  secondaryFont: 'Plus Jakarta Sans',
  updateThemeColor: async () => false,
  updateFonts: async () => false,
  presets: THEME_PRESETS,
  availableFonts: AVAILABLE_FONTS,
  fontPairPresets: FONT_PAIR_PRESETS,
});

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '16, 185, 129';
}

function applyThemeVariables(hex: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const rgb = hexToRgb(hex);

  root.style.setProperty('--primary-color', hex);
  root.style.setProperty('--primary-rgb', rgb);
  root.style.setProperty('--primary-light', `rgba(${rgb}, 0.12)`);
  root.style.setProperty('--primary-glow', `rgba(${rgb}, 0.3)`);
  root.style.setProperty('--primary-glow-lg', `0 16px 45px -8px rgba(${rgb}, 0.38)`);
}

function applyFontVariables(primary: string, secondary: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set CSS Variables
  root.style.setProperty('--font-primary', `'${primary}', sans-serif`);
  root.style.setProperty('--font-secondary', `'${secondary}', sans-serif`);

  // Dynamically inject Google Fonts Link if not already present
  const fonts = Array.from(new Set([primary, secondary]));
  const fontFamiliesParam = fonts
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800;900`)
    .join('&');

  const href = `https://fonts.googleapis.com/css2?${fontFamiliesParam}&display=swap`;

  let linkEl = document.getElementById('czns-dynamic-fonts') as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = 'czns-dynamic-fonts';
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  linkEl.href = href;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>('#10b981');
  const [accentPreset, setAccentPreset] = useState<string>('emerald');
  const [primaryFont, setPrimaryFont] = useState<string>('Inter');
  const [secondaryFont, setSecondaryFont] = useState<string>('Plus Jakarta Sans');

  // 1. Initial Load: LocalStorage for 0ms paint + Fetch from API
  useEffect(() => {
    const cachedColor = localStorage.getItem('czns_primary_color');
    const cachedPreset = localStorage.getItem('czns_accent_preset');
    const cachedPrimaryFont = localStorage.getItem('czns_primary_font');
    const cachedSecondaryFont = localStorage.getItem('czns_secondary_font');

    if (cachedColor) {
      setPrimaryColor(cachedColor);
      if (cachedPreset) setAccentPreset(cachedPreset);
      applyThemeVariables(cachedColor);
    }

    if (cachedPrimaryFont) {
      setPrimaryFont(cachedPrimaryFont);
    }
    if (cachedSecondaryFont) {
      setSecondaryFont(cachedSecondaryFont);
    }
    if (cachedPrimaryFont || cachedSecondaryFont) {
      applyFontVariables(cachedPrimaryFont || 'Inter', cachedSecondaryFont || 'Plus Jakarta Sans');
    } else {
      applyFontVariables('Inter', 'Plus Jakarta Sans');
    }

    // Fetch live settings from backend
    fetch('/api/v1/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          if (s.primary_color) {
            const color = s.primary_color;
            const preset = s.accent_preset || 'custom';
            setPrimaryColor(color);
            setAccentPreset(preset);
            localStorage.setItem('czns_primary_color', color);
            localStorage.setItem('czns_accent_preset', preset);
            applyThemeVariables(color);
          }

          const pf = s.primary_font || 'Inter';
          const sf = s.secondary_font || 'Plus Jakarta Sans';
          setPrimaryFont(pf);
          setSecondaryFont(sf);
          localStorage.setItem('czns_primary_font', pf);
          localStorage.setItem('czns_secondary_font', sf);
          applyFontVariables(pf, sf);
        }
      })
      .catch((err) => {
        console.warn('Could not load theme settings:', err);
      });
  }, []);

  // 2. Update Theme Color & persist to backend
  const updateThemeColor = async (hex: string, presetId?: string): Promise<boolean> => {
    try {
      const preset = presetId || THEME_PRESETS.find((p) => p.hex.toLowerCase() === hex.toLowerCase())?.id || 'custom';

      // Immediate visual update
      setPrimaryColor(hex);
      setAccentPreset(preset);
      localStorage.setItem('czns_primary_color', hex);
      localStorage.setItem('czns_accent_preset', preset);
      applyThemeVariables(hex);

      // Save to backend SQLite settings
      const res = await fetch('/api/v1/settings/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_color: hex,
          accent_preset: preset,
        }),
      });

      return res.ok;
    } catch (err) {
      console.error('Error saving theme color:', err);
      return false;
    }
  };

  // 3. Update Fonts & persist to backend
  const updateFonts = async (primary: string, secondary: string): Promise<boolean> => {
    try {
      setPrimaryFont(primary);
      setSecondaryFont(secondary);
      localStorage.setItem('czns_primary_font', primary);
      localStorage.setItem('czns_secondary_font', secondary);
      applyFontVariables(primary, secondary);

      const res = await fetch('/api/v1/settings/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_font: primary,
          secondary_font: secondary,
        }),
      });

      return res.ok;
    } catch (err) {
      console.error('Error saving fonts:', err);
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        accentPreset,
        primaryFont,
        secondaryFont,
        updateThemeColor,
        updateFonts,
        presets: THEME_PRESETS,
        availableFonts: AVAILABLE_FONTS,
        fontPairPresets: FONT_PAIR_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
