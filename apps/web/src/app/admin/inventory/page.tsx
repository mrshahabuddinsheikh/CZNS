'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  BatteryCharging,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
} from 'lucide-react';
import { Product } from '../../../lib/types';
import { formatPKR } from '../../../lib/api';

const BRANDS = [
  { id: 'brand-apple', name: 'Apple' },
  { id: 'brand-samsung', name: 'Samsung' },
  { id: 'brand-pixel', name: 'Google Pixel' },
  { id: 'brand-xiaomi', name: 'Xiaomi / Redmi' },
  { id: 'brand-oneplus', name: 'OnePlus' },
  { id: 'brand-vivo', name: 'Vivo' },
  { id: 'brand-oppo', name: 'Oppo' },
  { id: 'brand-infinix', name: 'Infinix' },
  { id: 'brand-tecno', name: 'Tecno' },
];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'new' | 'used'>('all');

  // Add Product Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandId, setBrandId] = useState('brand-apple');
  const [isUsed, setIsUsed] = useState<number>(0);
  const [conditionGrade, setConditionGrade] = useState('Brand New (Factory Sealed)');
  const [ptaStatus, setPtaStatus] = useState('Official PTA');
  const [batteryHealth, setBatteryHealth] = useState(100);
  const [warrantyType, setWarrantyType] = useState('1 Year Official Brand Warranty');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  // Variants list in form
  const [variants, setVariants] = useState<
    Array<{
      storage: string;
      color_name: string;
      color_hex: string;
      image_url: string;
      price: number;
      regular_price: number;
      stock: number;
      imei_serial: string;
    }>
  >([
    {
      storage: '128GB',
      color_name: 'Natural Titanium',
      color_hex: '#9a9792',
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      price: 365000,
      regular_price: 385000,
      stock: 5,
      imei_serial: '',
    },
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to delete ${prodName}?`)) return;
    const token = localStorage.getItem('czns_admin_token');
    await fetch(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  // Add Variant helper
  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        storage: '256GB',
        color_name: 'Black Titanium',
        color_hex: '#2b2c2e',
        image_url: thumbnail || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
        price: variants[0]?.price || 400000,
        regular_price: variants[0]?.regular_price || 420000,
        stock: 3,
        imei_serial: '',
      },
    ]);
  };

  const updateVariantRow = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !brandId || variants.length === 0) return;

    setSubmitting(true);
    const token = localStorage.getItem('czns_admin_token');
    try {
      const res = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          slug,
          brand_id: brandId,
          is_used: isUsed,
          condition_grade: conditionGrade,
          pta_status: ptaStatus,
          battery_health: batteryHealth,
          warranty_type: warrantyType,
          description,
          thumbnail: thumbnail || variants[0]?.image_url,
          specs: {
            condition: conditionGrade,
            battery: `${batteryHealth}% Original`,
            pta: ptaStatus,
            warranty: warrantyType,
          },
          variants,
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        // Reset form
        setName('');
        setSlug('');
        setDescription('');
        setThumbnail('');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterMode === 'new' && p.is_used !== 0) return false;
    if (filterMode === 'used' && p.is_used !== 1) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.pta_status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Smartphone Inventory</h1>
          <p className="text-xs text-czns-400 mt-0.5">
            Manage New vs Used phones, condition grades, battery health %, and storage variants
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-czns-950 font-black text-xs transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Smartphone</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones by model, brand, or PTA status..."
            className="w-full bg-czns-900 border border-czns-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-czns-500 outline-none focus:border-brand-emerald"
          />
          <Search className="w-4 h-4 text-czns-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 bg-czns-900 p-1 rounded-xl border border-czns-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filterMode === 'all' ? 'bg-czns-800 text-white' : 'text-czns-400'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filterMode === 'new' ? 'bg-brand-emerald text-czns-950' : 'text-czns-400'
            }`}
          >
            New Only
          </button>
          <button
            onClick={() => setFilterMode('used')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filterMode === 'used' ? 'bg-brand-gold text-czns-950' : 'text-czns-400'
            }`}
          >
            Used Only
          </button>
        </div>
      </div>

      {/* Table of Phones */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-czns-400">Loading inventory catalog...</p>
        </div>
      ) : (
        <div className="bg-czns-900 border border-czns-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-czns-300">
              <thead className="bg-czns-950 text-czns-400 uppercase text-[10px] tracking-wider border-b border-czns-850">
                <tr>
                  <th className="py-3 px-4">Smartphone</th>
                  <th className="py-3 px-3">Condition & Grade</th>
                  <th className="py-3 px-3">PTA Status</th>
                  <th className="py-3 px-3">Battery %</th>
                  <th className="py-3 px-3">Price (PKR)</th>
                  <th className="py-3 px-3">Stock Units</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-czns-850">
                {filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-czns-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.thumbnail}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-xl bg-czns-950 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-czns-400 font-semibold">
                            {p.brand_name} • {p.variant_count || 1} variants
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {p.is_used === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-brand-gold text-[10px] font-bold border border-amber-500/30">
                          {p.condition_grade || 'Pre-Owned 10/10'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-brand-emerald text-[10px] font-bold border border-emerald-500/30">
                          Brand New Pin Pack
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-white">{p.pta_status}</td>

                    <td className="py-3.5 px-3">
                      {p.battery_health ? (
                        <span className="font-bold text-brand-gold">🔋 {p.battery_health}%</span>
                      ) : (
                        <span className="text-czns-500">100%</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {formatPKR(p.min_price)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (p.total_stock || 0) <= 3
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-czns-800 text-czns-200'
                        }`}
                      >
                        {p.total_stock || 0} in stock
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg text-czns-500 hover:text-rose-400 hover:bg-czns-800 transition-colors"
                        title="Delete Phone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SMARTPHONE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-czns-950 border border-czns-750 rounded-3xl p-6 sm:p-8 space-y-5 text-white max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-czns-800">
              <h2 className="text-base font-black flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-emerald" />
                Add New Smartphone to Store
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-czns-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Phone Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro (10/10 Mint)"
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Brand <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  >
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode & Condition & Battery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Condition Mode
                  </label>
                  <select
                    value={isUsed}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setIsUsed(val);
                      if (val === 0) {
                        setConditionGrade('Brand New (Factory Sealed)');
                        setBatteryHealth(100);
                        setWarrantyType('1 Year Official Brand Warranty');
                      } else {
                        setConditionGrade('10/10 Like New (Scratchless)');
                        setBatteryHealth(92);
                        setWarrantyType('7 Days Store Checking Warranty');
                      }
                    }}
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  >
                    <option value={0}>🟢 Brand New (Pin Packed)</option>
                    <option value={1}>🟡 Used (Pre-Owned Graded)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Condition Grade
                  </label>
                  <input
                    type="text"
                    value={conditionGrade}
                    onChange={(e) => setConditionGrade(e.target.value)}
                    placeholder="10/10 Like New"
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Battery Health %
                  </label>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(parseInt(e.target.value, 10))}
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              {/* PTA Status & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    PTA Status
                  </label>
                  <select
                    value={ptaStatus}
                    onChange={(e) => setPtaStatus(e.target.value)}
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  >
                    <option value="Official PTA">Official PTA Approved</option>
                    <option value="Non-PTA">Non-PTA / Factory Unlock</option>
                    <option value="JV / Sim-Lock">JV / Sim-Lock</option>
                    <option value="4-Month Sim Active">4-Month Active SIM</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                    Warranty Term
                  </label>
                  <input
                    type="text"
                    value={warrantyType}
                    onChange={(e) => setWarrantyType(e.target.value)}
                    placeholder="1 Year Brand or 7 Days Checking"
                    className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Main Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-czns-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe phone condition, camera, battery, and original accessories included..."
                  className="w-full bg-czns-900 border border-czns-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-emerald"
                />
              </div>

              {/* VARIANTS BUILDER (Phase 2 Requirement) */}
              <div className="pt-2 border-t border-czns-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-czns-300">
                    Storage Variants & Prices
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-xs text-brand-emerald font-bold hover:underline"
                  >
                    + Add Another Variant
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-czns-900 border border-czns-800 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-czns-400 block">Storage</label>
                          <select
                            value={v.storage}
                            onChange={(e) => updateVariantRow(idx, 'storage', e.target.value)}
                            className="w-full bg-czns-950 border border-czns-750 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="64GB">64GB</option>
                            <option value="128GB">128GB</option>
                            <option value="256GB">256GB</option>
                            <option value="512GB">512GB</option>
                            <option value="1TB">1TB</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-czns-400 block">Color Name</label>
                          <input
                            type="text"
                            value={v.color_name}
                            onChange={(e) => updateVariantRow(idx, 'color_name', e.target.value)}
                            className="w-full bg-czns-950 border border-czns-750 rounded-lg px-2 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-czns-400 block">Price (PKR)</label>
                          <input
                            type="number"
                            required
                            value={v.price}
                            onChange={(e) =>
                              updateVariantRow(idx, 'price', parseInt(e.target.value, 10))
                            }
                            className="w-full bg-czns-950 border border-czns-750 rounded-lg px-2 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-czns-400 block">Stock Qty</label>
                          <input
                            type="number"
                            min={0}
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantRow(idx, 'stock', parseInt(e.target.value, 10))
                            }
                            className="w-full bg-czns-950 border border-czns-750 rounded-lg px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-czns-400 block">
                            Optional IMEI / Serial Tracking Number
                          </label>
                          <input
                            type="text"
                            value={v.imei_serial}
                            onChange={(e) => updateVariantRow(idx, 'imei_serial', e.target.value)}
                            placeholder="e.g. 358920194829104"
                            className="w-full bg-czns-950 border border-czns-750 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        {variants.length > 1 && (
                          <div className="flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() => removeVariantRow(idx)}
                              className="text-xs text-rose-400 hover:underline"
                            >
                              Remove Variant
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-czns-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-czns-900 text-czns-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-emerald text-czns-950 font-black text-xs hover:bg-emerald-400"
                >
                  {submitting ? 'Saving...' : 'Publish Smartphone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
