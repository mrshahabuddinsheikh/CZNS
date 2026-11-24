'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Zap,
  ShoppingBag,
  Eye,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Type,
  Layers,
  Heading,
  Check,
  AlignLeft,
} from 'lucide-react';
import {
  useTheme,
  THEME_PRESETS,
  AVAILABLE_FONTS,
  FONT_PAIR_PRESETS,
  ThemePreset,
  FontPairPreset,
} from '../../../context/ThemeContext';
import { formatPKR } from '../../../lib/api';

export default function AdminThemePage() {
  const {
    primaryColor,
    accentPreset,
    primaryFont,
    secondaryFont,
    updateThemeColor,
    updateFonts,
    presets,
    availableFonts,
    fontPairPresets,
  } = useTheme();

  // Active Tab: 'colors' or 'typography'
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');

  // Color state
  const [selectedHex, setSelectedHex] = useState(primaryColor);
  const [selectedPresetId, setSelectedPresetId] = useState(accentPreset);
  const [customHexInput, setCustomHexInput] = useState(primaryColor);

  // Font state
  const [selectedPrimaryFont, setSelectedPrimaryFont] = useState(primaryFont);
  const [selectedSecondaryFont, setSelectedSecondaryFont] = useState(secondaryFont);
  const [selectedFontPairId, setSelectedFontPairId] = useState('modern-flagship');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSelectedHex(primaryColor);
    setSelectedPresetId(accentPreset);
    setCustomHexInput(primaryColor);
  }, [primaryColor, accentPreset]);

  useEffect(() => {
    setSelectedPrimaryFont(primaryFont);
    setSelectedSecondaryFont(secondaryFont);

    // Check if current fonts match any preset pair
    const matched = fontPairPresets.find(
      (p) => p.primaryFont === primaryFont && p.secondaryFont === secondaryFont
    );
    if (matched) {
      setSelectedFontPairId(matched.id);
    } else {
      setSelectedFontPairId('custom');
    }
  }, [primaryFont, secondaryFont, fontPairPresets]);

  // Handle Color Preset Click
  const handleSelectPreset = async (preset: ThemePreset) => {
    setSelectedHex(preset.hex);
    setSelectedPresetId(preset.id);
    setCustomHexInput(preset.hex);

    setSaving(true);
    setStatusMessage(null);
    const ok = await updateThemeColor(preset.hex, preset.id);
    setSaving(false);

    if (ok) {
      setStatusMessage({
        type: 'success',
        text: `Theme successfully updated to "${preset.name}" (${preset.hex})! Store-wide look changed.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to persist theme to backend. Please check network connection.',
      });
    }
  };

  // Handle Custom Hex Save
  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    let hex = customHexInput.trim();
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setStatusMessage({
        type: 'error',
        text: 'Invalid HEX color format. Please enter a valid 6-digit hex code like #2563EB.',
      });
      return;
    }

    setSelectedHex(hex);
    setSelectedPresetId('custom');

    setSaving(true);
    setStatusMessage(null);
    const ok = await updateThemeColor(hex, 'custom');
    setSaving(false);

    if (ok) {
      setStatusMessage({
        type: 'success',
        text: `Custom accent color ${hex} applied successfully across the entire store!`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to save custom color. Please check server status.',
      });
    }
  };

  // Handle Font Pair Preset Click
  const handleSelectFontPair = async (pair: FontPairPreset) => {
    setSelectedPrimaryFont(pair.primaryFont);
    setSelectedSecondaryFont(pair.secondaryFont);
    setSelectedFontPairId(pair.id);

    setSaving(true);
    setStatusMessage(null);
    const ok = await updateFonts(pair.primaryFont, pair.secondaryFont);
    setSaving(false);

    if (ok) {
      setStatusMessage({
        type: 'success',
        text: `Typography updated to "${pair.name}"! Primary: ${pair.primaryFont} | Secondary: ${pair.secondaryFont}.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to persist typography settings.',
      });
    }
  };

  // Handle Custom Font Selection Save
  const handleSaveCustomFonts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const ok = await updateFonts(selectedPrimaryFont, selectedSecondaryFont);
    setSaving(false);

    if (ok) {
      setStatusMessage({
        type: 'success',
        text: `Store typography updated! Primary Font: ${selectedPrimaryFont} • Secondary Font: ${selectedSecondaryFont}.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to save font configuration.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors"
              style={{ backgroundColor: selectedHex }}
            >
              {activeTab === 'colors' ? <Palette className="w-6 h-6" /> : <Type className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Theme &amp; Typography Studio</h1>
              <p className="text-xs text-slate-500">
                Live admin control for store-wide colors, Primary body font &amp; Secondary heading font.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs Pill */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('colors');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'colors'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Brand Colors</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('typography');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'typography'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fonts (Primary &amp; Secondary)</span>
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-xs transition-all hover:bg-slate-50"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: BRAND COLORS & ACCENT SYSTEM                          */}
      {/* ============================================================ */}
      {activeTab === 'colors' && (
        <div className="space-y-8 animate-fade-in">
          {/* 1. Curated 1-Click Brand Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Curated Store Presets (1-Click Switch)</span>
              </h2>
              <span className="text-xs text-slate-500">Instant real-time propagation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {presets.map((preset) => {
                const isCurrent =
                  selectedPresetId === preset.id ||
                  selectedHex.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-white shadow-lg scale-102'
                        : 'bg-white/80 hover:bg-white hover:shadow-md border-slate-200'
                    }`}
                    style={{
                      borderColor: isCurrent ? preset.hex : undefined,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-white"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isCurrent && <CheckCircle2 className="w-4 h-4" />}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">{preset.name}</span>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {preset.hex}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hover }} />
                      </div>

                      <button
                        disabled={saving}
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${
                          isCurrent
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        style={{
                          backgroundColor: isCurrent ? preset.hex : undefined,
                        }}
                      >
                        {isCurrent ? 'Active Theme' : 'Apply Preset'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Hex Picker Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>Custom Color HEX Picker</span>
              </h2>
              <span className="text-xs text-slate-500">Pick any custom hex code</span>
            </div>

            <form onSubmit={handleSaveCustom} className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner shrink-0">
                  <input
                    type="color"
                    value={
                      customHexInput.startsWith('#') && customHexInput.length === 7
                        ? customHexInput
                        : '#10b981'
                    }
                    onChange={(e) => {
                      setCustomHexInput(e.target.value);
                      setSelectedHex(e.target.value);
                    }}
                    className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    title="Select color from palette"
                  />
                </div>

                <div className="flex-1 sm:w-48">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hex Code</label>
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    placeholder="#10B981"
                    className="w-full font-mono text-sm font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-auto"
                style={{ backgroundColor: selectedHex }}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Save &amp; Apply Custom Hex</span>
              </button>
            </form>
          </div>

          {/* 3. Real-Time Visual Component Sandbox Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>Live Store Preview Sandbox</span>
              </h2>
              <span className="text-xs text-slate-500">How key store components render with this color</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Component 1: Product Price & Buy Now */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">1. Product Card Price &amp; CTA</div>

                <div className="space-y-2">
                  <span
                    className="inline-flex items-center gap-1 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: selectedHex }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Brand New</span>
                  </span>

                  <h4 className="font-bold text-slate-900 text-sm">Apple iPhone 17 Pro</h4>

                  <div className="text-xl font-mono font-black" style={{ color: selectedHex }}>
                    {formatPKR(447000)}
                  </div>
                </div>

                <button
                  className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: selectedHex }}
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Buy in 2 Clicks</span>
                </button>
              </div>

              {/* Component 2: Chatbot Trigger Button */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">2. Floating Chatbot Launcher</div>
                  <p className="text-xs text-slate-500 mt-1">
                    The 3D robot button dynamically adopts this accent color and glowing halo.
                  </p>
                </div>

                <div className="flex items-center justify-center py-4">
                  <div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center p-1.5 shadow-lg"
                    style={{
                      backgroundColor: selectedHex,
                      boxShadow: `0 12px 30px -5px ${selectedHex}66`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/chatbot-avatar.png"
                      alt="3D Robot Preview"
                      className="w-12 h-12 object-contain"
                    />
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-white border-2 border-slate-900 rounded-full animate-pulse" />
                  </div>
                </div>

                <div
                  className="text-center text-xs font-bold py-1.5 px-3 rounded-full"
                  style={{
                    backgroundColor: `${selectedHex}1a`,
                    color: selectedHex,
                  }}
                >
                  ✨ 3D Robot Halo Live
                </div>
              </div>

              {/* Component 3: Hero Slider Spec Pill & Wholesale Badge */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">3. Hero Specs &amp; Wholesale Highlights</div>

                <div className="space-y-3">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${selectedHex}15`,
                      color: selectedHex,
                      border: `1px solid ${selectedHex}40`,
                    }}
                  >
                    ● Save Rs. 43,000 • Official PTA
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl text-white shrink-0"
                      style={{ backgroundColor: selectedHex }}
                    >
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">A18 Pro Silicon</div>
                      <div className="text-[10px] text-slate-500">3nm Hardware Ray Tracing</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: selectedHex }} />
                    <span>Karachi 24h Express COD Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PRIMARY & SECONDARY TYPOGRAPHY STUDIO                 */}
      {/* ============================================================ */}
      {activeTab === 'typography' && (
        <div className="space-y-8 animate-fade-in">
          {/* Active Font Status Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Currently Active Typography</span>
              </div>
              <h2 className="text-2xl font-black">
                Primary: <span style={{ fontFamily: selectedPrimaryFont }}>{selectedPrimaryFont}</span> &amp; Secondary: <span style={{ fontFamily: selectedSecondaryFont }}>{selectedSecondaryFont}</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Primary font controls body copy, product specs, badges, and button labels. Secondary font styles hero banners, flagship headlines, section titles, and logo typography.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Primary (Body)</div>
                <div className="text-sm font-bold text-emerald-400" style={{ fontFamily: selectedPrimaryFont }}>
                  {selectedPrimaryFont}
                </div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Secondary (Headings)</div>
                <div className="text-sm font-bold text-amber-400" style={{ fontFamily: selectedSecondaryFont }}>
                  {selectedSecondaryFont}
                </div>
              </div>
            </div>
          </div>

          {/* 1. Curated 1-Click Font Pair Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Curated Typography Pairs (1-Click Switch)</span>
              </h3>
              <span className="text-xs text-slate-500">Professional designer pairings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fontPairPresets.map((pair) => {
                const isSelected = selectedFontPairId === pair.id;
                return (
                  <div
                    key={pair.id}
                    onClick={() => handleSelectFontPair(pair)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white shadow-lg border-emerald-500 scale-102 ring-2 ring-emerald-500/20'
                        : 'bg-white/80 hover:bg-white hover:shadow-md border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{pair.name}</span>
                        {isSelected && (
                          <span className="p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Live typography preview of the pair */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                        <div
                          className="text-base font-black text-slate-900 leading-tight"
                          style={{ fontFamily: pair.secondaryFont }}
                        >
                          iPhone 17 Pro Max
                        </div>
                        <div
                          className="text-[11px] text-slate-600 leading-relaxed"
                          style={{ fontFamily: pair.primaryFont }}
                        >
                          Grade 5 Titanium with A18 Pro silicon &amp; 100% genuine PTA DIRBS warranty.
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">{pair.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-slate-500">
                        {pair.primaryFont} + {pair.secondaryFont}
                      </span>

                      <button
                        disabled={saving}
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Active Pair' : 'Apply Pair'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Independent Font Customizer (Pick Primary & Secondary Freely) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Custom Font Mixer (Choose Any Combination)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Freely mix any Primary body font with any Secondary heading font.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomFonts} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Font Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlignLeft className="w-4 h-4 text-emerald-600" />
                      <span>Primary Font (Body, Specs &amp; UI)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active: {selectedPrimaryFont}
                    </span>
                  </label>

                  <select
                    value={selectedPrimaryFont}
                    onChange={(e) => {
                      setSelectedPrimaryFont(e.target.value);
                      setSelectedFontPairId('custom');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer shadow-xs"
                  >
                    {availableFonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category}) — {f.sample}
                      </option>
                    ))}
                  </select>

                  <div
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed"
                    style={{ fontFamily: selectedPrimaryFont }}
                  >
                    <span className="font-bold">Live Preview:</span> The quick brown fox jumps over the lazy dog. 10/10 Mint Pre-Owned Phone with 7-Day checking warranty.
                  </div>
                </div>

                {/* Secondary Font Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Heading className="w-4 h-4 text-amber-600" />
                      <span>Secondary Font (Headings &amp; Titles)</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Active: {selectedSecondaryFont}
                    </span>
                  </label>

                  <select
                    value={selectedSecondaryFont}
                    onChange={(e) => {
                      setSelectedSecondaryFont(e.target.value);
                      setSelectedFontPairId('custom');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none cursor-pointer shadow-xs"
                  >
                    {availableFonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category}) — {f.sample}
                      </option>
                    ))}
                  </select>

                  <div
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-base font-black text-slate-900 leading-tight"
                    style={{ fontFamily: selectedSecondaryFont }}
                  >
                    Samsung Galaxy S26 Ultra 5G &amp; iPhone 17 Pro
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save &amp; Apply Custom Typography Store-Wide</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Live Interactive Typography Sandbox */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Full Store-Wide Typography Simulation</span>
              </h3>
              <span className="text-xs text-slate-500">Live rendering simulation</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-6">
              {/* Header simulation */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span
                  className="text-2xl font-black tracking-widest text-slate-950 uppercase"
                  style={{ fontFamily: selectedSecondaryFont }}
                >
                  CZNS STORE
                </span>
                <span
                  className="text-xs font-bold text-slate-600"
                  style={{ fontFamily: selectedPrimaryFont }}
                >
                  Pakistan Official Mobile Marketplace
                </span>
              </div>

              {/* Hero simulation */}
              <div className="space-y-3">
                <h1
                  className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight"
                  style={{ fontFamily: selectedSecondaryFont }}
                >
                  Upgrade Smarter. Pin-Packed or Certified 10/10 Used.
                </h1>

                <p
                  className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed"
                  style={{ fontFamily: selectedPrimaryFont }}
                >
                  Pakistan&apos;s verified smartphone destination. Choose between 100% factory-sealed phones with 1-Year Brand Warranty, or diagnostic-tested 10/10 Mint Pre-Owned devices with genuine Battery Health guarantee &amp; 7-Day checking warranty.
                </p>
              </div>

              {/* Product card simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: selectedHex, fontFamily: selectedPrimaryFont }}
                    >
                      Brand New
                    </span>
                    <span
                      className="text-xs font-mono font-bold text-slate-400"
                      style={{ fontFamily: selectedPrimaryFont }}
                    >
                      Official PTA
                    </span>
                  </div>

                  <h4
                    className="text-base font-bold text-slate-900"
                    style={{ fontFamily: selectedSecondaryFont }}
                  >
                    Apple iPhone 17 Pro (256GB)
                  </h4>

                  <div
                    className="text-xl font-mono font-black"
                    style={{ color: selectedHex, fontFamily: selectedPrimaryFont }}
                  >
                    Rs. 447,000
                  </div>

                  <button
                    className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-all"
                    style={{ backgroundColor: selectedHex, fontFamily: selectedPrimaryFont }}
                  >
                    Buy in 2 Clicks
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950"
                      style={{ fontFamily: selectedPrimaryFont }}
                    >
                      10/10 Mint Used
                    </span>
                    <span
                      className="text-xs font-mono font-bold text-emerald-600"
                      style={{ fontFamily: selectedPrimaryFont }}
                    >
                      🔋 96% Health
                    </span>
                  </div>

                  <h4
                    className="text-base font-bold text-slate-900"
                    style={{ fontFamily: selectedSecondaryFont }}
                  >
                    Samsung Galaxy S24 Ultra (512GB)
                  </h4>

                  <div
                    className="text-xl font-mono font-black"
                    style={{ color: selectedHex, fontFamily: selectedPrimaryFont }}
                  >
                    Rs. 319,000
                  </div>

                  <button
                    className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-all"
                    style={{ backgroundColor: selectedHex, fontFamily: selectedPrimaryFont }}
                  >
                    Buy in 2 Clicks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
