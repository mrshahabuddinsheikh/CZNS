import { db } from './index.js';
import { initSchema } from './schema.js';
import bcrypt from 'bcryptjs';

export async function runSeed() {
  console.log('Initializing schema...');
  initSchema();

  console.log('Seeding initial CZNS data...');

  // 1. Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const insertAdmin = db.prepare(`
    INSERT OR REPLACE INTO admins (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAdmin.run('admin-1', 'admin@czns.pk', adminPasswordHash, 'CZNS Store Manager', 'superadmin');

  // 2. Brands
  const brands = [
    { id: 'brand-apple', name: 'Apple', slug: 'apple', logo_url: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=128&q=80' },
    { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', logo_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=128&q=80' },
    { id: 'brand-pixel', name: 'Google Pixel', slug: 'google-pixel', logo_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=128&q=80' },
    { id: 'brand-xiaomi', name: 'Xiaomi / Redmi', slug: 'xiaomi', logo_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=128&q=80' },
    { id: 'brand-oneplus', name: 'OnePlus', slug: 'oneplus', logo_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=128&q=80' },
    { id: 'brand-vivo', name: 'Vivo', slug: 'vivo', logo_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=128&q=80' },
    { id: 'brand-oppo', name: 'Oppo', slug: 'oppo', logo_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=128&q=80' },
    { id: 'brand-infinix', name: 'Infinix', slug: 'infinix', logo_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=128&q=80' },
    { id: 'brand-tecno', name: 'Tecno', slug: 'tecno', logo_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=128&q=80' },
  ];

  const insertBrand = db.prepare(`
    INSERT OR REPLACE INTO brands (id, name, slug, logo_url)
    VALUES (?, ?, ?, ?)
  `);
  brands.forEach(b => insertBrand.run(b.id, b.name, b.slug, b.logo_url));

  // 3. Products & Variants
  const products = [
    {
      id: 'prod-iphone-15-pro-max-new',
      name: 'iPhone 15 Pro Max (Box Packed)',
      slug: 'iphone-15-pro-max-box-packed',
      brand_id: 'brand-apple',
      is_used: 0,
      condition_grade: 'Brand New (Factory Sealed)',
      pta_status: 'Official PTA',
      battery_health: 100,
      warranty_type: '1 Year Official Apple Mercantile / Corecell Warranty',
      description: 'The pinnacle of iPhone engineering. Aerospace-grade Titanium design with textured matte glass back, Action button, A17 Pro chip, and the longest optical zoom on iPhone ever (5x telephoto). Factory pin-packed with 1-Year official brand warranty in Pakistan.',
      specs_json: JSON.stringify({
        display: '6.7" Super Retina XDR OLED, 120Hz ProMotion, Always-On, 2000 nits',
        chipset: 'Apple A17 Pro (3 nm), 6-core CPU, 6-core GPU',
        camera: '48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto Optical Zoom',
        battery: '4422 mAh, 50% charge in 30 mins, MagSafe wireless charging',
        sim: 'Physical Nano SIM + eSIM (Official PTA Approved)',
        durability: 'Ceramic Shield front, Grade 5 Titanium frame, IP68 water resistant'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      featured: 1,
      rating: 4.9,
      review_count: 38,
      variants: [
        {
          id: 'var-15pm-new-256-nat',
          storage: '256GB',
          color_name: 'Natural Titanium',
          color_hex: '#9a9792',
          image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
            'https://images.unsplash.com/photo-1695048132961-a0ea7f66a815?w=800&q=80',
            'https://images.unsplash.com/photo-1695048065053-cf019cf36814?w=800&q=80'
          ]),
          price: 495000,
          regular_price: 520000,
          stock: 6,
          sku: 'APL-15PM-256-NAT-NEW'
        },
        {
          id: 'var-15pm-new-256-blk',
          storage: '256GB',
          color_name: 'Black Titanium',
          color_hex: '#2b2c2e',
          image_url: 'https://images.unsplash.com/photo-1695048133036-7497d3e09d16?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1695048133036-7497d3e09d16?w=800&q=80',
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'
          ]),
          price: 495000,
          regular_price: 520000,
          stock: 4,
          sku: 'APL-15PM-256-BLK-NEW'
        },
        {
          id: 'var-15pm-new-512-blue',
          storage: '512GB',
          color_name: 'Blue Titanium',
          color_hex: '#3b4454',
          image_url: 'https://images.unsplash.com/photo-1695048065053-cf019cf36814?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1695048065053-cf019cf36814?w=800&q=80'
          ]),
          price: 545000,
          regular_price: 575000,
          stock: 3,
          sku: 'APL-15PM-512-BLU-NEW'
        }
      ]
    },
    {
      id: 'prod-iphone-15-pro-used',
      name: 'iPhone 15 Pro (Pre-Owned / 10/10 Mint)',
      slug: 'iphone-15-pro-used-mint-10-10',
      brand_id: 'brand-apple',
      is_used: 1,
      condition_grade: '10/10 Like New (Scratchless)',
      pta_status: 'Official PTA',
      battery_health: 93,
      warranty_type: '7 Days Replacement / Checking Warranty + Lifetime Software',
      description: 'Certified Pre-Owned iPhone 15 Pro in pristine 10/10 cosmetic condition. Tested with 30-point professional diagnostic: 100% Genuine Apple Parts, True Tone active, Face ID ultra-fast, clean cameras, no scratches or dents. Comes with original box and cable.',
      specs_json: JSON.stringify({
        display: '6.1" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits peak',
        chipset: 'Apple A17 Pro (3 nm)',
        camera: '48MP Main + 12MP Ultra-wide + 12MP 3x Telephoto',
        battery: '🔋 93% Health Original Battery (Never replaced, never opened)',
        sim: 'Dual Physical SIM or Physical + eSIM (PTA Approved)',
        warranty: '7 Days Money-Back / Replacement Checking Warranty'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      featured: 1,
      rating: 5.0,
      review_count: 52,
      variants: [
        {
          id: 'var-15p-used-128-nat',
          storage: '128GB',
          color_name: 'Natural Titanium',
          color_hex: '#9a9792',
          image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
            'https://images.unsplash.com/photo-1695048132961-a0ea7f66a815?w=800&q=80'
          ]),
          price: 365000,
          regular_price: 385000,
          stock: 5,
          imei_serial: '358920192847591',
          sku: 'APL-15P-128-NAT-USED'
        },
        {
          id: 'var-15p-used-256-wht',
          storage: '256GB',
          color_name: 'White Titanium',
          color_hex: '#e2e4e1',
          image_url: 'https://images.unsplash.com/photo-1695048132961-a0ea7f66a815?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1695048132961-a0ea7f66a815?w=800&q=80'
          ]),
          price: 395000,
          regular_price: 415000,
          stock: 3,
          imei_serial: '358920192847592',
          sku: 'APL-15P-256-WHT-USED'
        }
      ]
    },
    {
      id: 'prod-iphone-13-used-non-pta',
      name: 'iPhone 13 (Pre-Owned / Non-PTA / JV)',
      slug: 'iphone-13-pre-owned-non-pta-jv',
      brand_id: 'brand-apple',
      is_used: 1,
      condition_grade: '9.5/10 Flawless',
      pta_status: 'Non-PTA',
      battery_health: 89,
      warranty_type: '7 Days Checking Warranty + 4-Month Sim Guarantee',
      description: 'Most popular budget flagship iPhone in Pakistan. Flawless 9.5/10 condition, original display, True Tone enabled, 89% battery health. Ideal for secondary phone, Wi-Fi use, or SCOM / temporary SIM usage.',
      specs_json: JSON.stringify({
        display: '6.1" Super Retina XDR OLED',
        chipset: 'Apple A15 Bionic (5 nm)',
        camera: '12MP Dual Rear Camera with Cinematic Mode (1080p@30fps)',
        battery: '🔋 89% Health Original Battery',
        sim: 'Non-PTA (4 Months Active / Factory Unlocked)',
        warranty: '7 Days Replacement Warranty'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
      featured: 0,
      rating: 4.8,
      review_count: 27,
      variants: [
        {
          id: 'var-13-used-128-midnight',
          storage: '128GB',
          color_name: 'Midnight Black',
          color_hex: '#1c222a',
          image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'
          ]),
          price: 115000,
          regular_price: 125000,
          stock: 7,
          imei_serial: '354920194857182',
          sku: 'APL-13-128-MID-NONPTA'
        },
        {
          id: 'var-13-used-128-starlight',
          storage: '128GB',
          color_name: 'Starlight',
          color_hex: '#f5f2eb',
          image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80'
          ]),
          price: 118000,
          regular_price: 128000,
          stock: 4,
          imei_serial: '354920194857183',
          sku: 'APL-13-128-STR-NONPTA'
        }
      ]
    },
    {
      id: 'prod-samsung-s24-ultra-new',
      name: 'Samsung Galaxy S24 Ultra (Box Packed)',
      slug: 'samsung-galaxy-s24-ultra-box-packed',
      brand_id: 'brand-samsung',
      is_used: 0,
      condition_grade: 'Brand New (Factory Sealed)',
      pta_status: 'Official PTA',
      battery_health: 100,
      warranty_type: '1 Year Official Samsung Pakistan / Airlink Warranty',
      description: 'The Ultimate Android powerhouse featuring Galaxy AI (Circle to Search, Live Call Translation, Generative Photo Edit). Built with Titanium frame, Corning Gorilla Armor anti-reflective glass, built-in S-Pen, and 200MP Quad Telephoto camera.',
      specs_json: JSON.stringify({
        display: '6.8" Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits, Gorilla Armor',
        chipset: 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4 nm)',
        camera: '200MP Wide + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-wide (100x Space Zoom)',
        battery: '5000 mAh, 45W Fast Charging, Wireless PowerShare',
        spen: 'Integrated S-Pen with Bluetooth latency reduction',
        sim: 'Dual Physical SIM + eSIM (Official PTA Approved)'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
      featured: 1,
      rating: 5.0,
      review_count: 44,
      variants: [
        {
          id: 'var-s24u-new-256-grey',
          storage: '256GB',
          color_name: 'Titanium Gray',
          color_hex: '#646669',
          image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80'
          ]),
          price: 435000,
          regular_price: 459999,
          stock: 5,
          sku: 'SAM-S24U-256-GRY-NEW'
        },
        {
          id: 'var-s24u-new-512-blk',
          storage: '512GB',
          color_name: 'Titanium Black',
          color_hex: '#1f2022',
          image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80'
          ]),
          price: 485000,
          regular_price: 510000,
          stock: 3,
          sku: 'SAM-S24U-512-BLK-NEW'
        }
      ]
    },
    {
      id: 'prod-samsung-s23-ultra-used',
      name: 'Samsung Galaxy S23 Ultra (Pre-Owned / 10/10)',
      slug: 'samsung-galaxy-s23-ultra-used-10-10',
      brand_id: 'brand-samsung',
      is_used: 1,
      condition_grade: '10/10 Like New (Mint Condition)',
      pta_status: 'Official PTA',
      battery_health: 96,
      warranty_type: '7 Days Store Checking Warranty',
      description: 'Superb condition Samsung S23 Ultra, 100% flawless body with zero scratches. Original Super AMOLED 120Hz display with no shade, burn-in, or dots. 200MP camera produces stunning crisp photos. Includes original stylus and fast charger.',
      specs_json: JSON.stringify({
        display: '6.8" Dynamic AMOLED 2X, 120Hz, 1750 nits',
        chipset: 'Snapdragon 8 Gen 2 for Galaxy',
        camera: '200MP Main + 10MP 10x Optical Periscope + 10MP 3x + 12MP Ultra-wide',
        battery: '🔋 96% Health (5000 mAh all-day battery life)',
        sim: 'Official PTA Approved (Dual SIM)',
        warranty: '7 Days Replacement Guarantee'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
      featured: 1,
      rating: 4.9,
      review_count: 29,
      variants: [
        {
          id: 'var-s23u-used-256-green',
          storage: '256GB',
          color_name: 'Botanic Green',
          color_hex: '#2e4237',
          image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80'
          ]),
          price: 275000,
          regular_price: 295000,
          stock: 4,
          imei_serial: '357910293847192',
          sku: 'SAM-S23U-256-GRN-USED'
        },
        {
          id: 'var-s23u-used-512-phantom',
          storage: '512GB',
          color_name: 'Phantom Black',
          color_hex: '#1b1b1b',
          image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80'
          ]),
          price: 295000,
          regular_price: 320000,
          stock: 2,
          imei_serial: '357910293847193',
          sku: 'SAM-S23U-512-BLK-USED'
        }
      ]
    },
    {
      id: 'prod-google-pixel-8-pro-used',
      name: 'Google Pixel 8 Pro (Certified Pre-Owned)',
      slug: 'google-pixel-8-pro-pre-owned',
      brand_id: 'brand-pixel',
      is_used: 1,
      condition_grade: '10/10 Like New',
      pta_status: 'Official PTA',
      battery_health: 98,
      warranty_type: '7 Days Checking Warranty + 1 Year Hardware Assistance',
      description: 'The photography benchmark. Google Tensor G3 chip with Best Take, Audio Magic Eraser, and Ultra HDR photos. Graded 10/10 without blemishes. Matte glass back with polished aluminum frame.',
      specs_json: JSON.stringify({
        display: '6.7" Super Actua OLED, 120Hz LTPO, 2400 nits peak',
        chipset: 'Google Tensor G3 (4 nm) + Titan M2 security coprocessor',
        camera: '50MP Main + 48MP Ultra-wide + 48MP 5x Telephoto with Pro Controls',
        battery: '🔋 98% Health (5050 mAh battery)',
        sim: 'Official PTA Approved (eSIM + Nano SIM)',
        special: 'Temperature sensor on back'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
      featured: 1,
      rating: 4.8,
      review_count: 19,
      variants: [
        {
          id: 'var-pix8p-used-128-bay',
          storage: '128GB',
          color_name: 'Bay Blue',
          color_hex: '#8aaec7',
          image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80'
          ]),
          price: 215000,
          regular_price: 235000,
          stock: 4,
          imei_serial: '351982736451928',
          sku: 'PIX-8P-128-BAY-USED'
        },
        {
          id: 'var-pix8p-used-256-obsidian',
          storage: '256GB',
          color_name: 'Obsidian Black',
          color_hex: '#1e1f21',
          image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80'
          ]),
          price: 235000,
          regular_price: 255000,
          stock: 3,
          imei_serial: '351982736451929',
          sku: 'PIX-8P-256-OBS-USED'
        }
      ]
    },
    {
      id: 'prod-oneplus-12-used',
      name: 'OnePlus 12 (5G / 16GB RAM / 10/10 Mint)',
      slug: 'oneplus-12-5g-pre-owned',
      brand_id: 'brand-oneplus',
      is_used: 1,
      condition_grade: '9.5/10 Flawless',
      pta_status: 'Official PTA',
      battery_health: 99,
      warranty_type: '7 Days Checking Warranty',
      description: 'Ultra-fast performance flagship with 4th Gen Hasselblad Camera, Snapdragon 8 Gen 3, and lightning 100W SUPERVOOC charging that charges 100% in 26 minutes.',
      specs_json: JSON.stringify({
        display: '6.82" 2K 120Hz ProXDR Display, 4500 nits peak brightness',
        chipset: 'Qualcomm Snapdragon 8 Gen 3, 16GB LPDDR5X RAM',
        camera: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-wide Hasselblad',
        battery: '🔋 99% Health (5400 mAh Dual-cell battery with 100W Charger)',
        sim: 'Official PTA Approved (Dual Nano SIM)'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
      featured: 0,
      rating: 4.9,
      review_count: 14,
      variants: [
        {
          id: 'var-op12-used-512-green',
          storage: '512GB',
          color_name: 'Flowy Emerald',
          color_hex: '#1f4339',
          image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80'
          ]),
          price: 245000,
          regular_price: 265000,
          stock: 3,
          imei_serial: '864720194827361',
          sku: 'OP-12-512-EME-USED'
        }
      ]
    },
    {
      id: 'prod-xiaomi-14-new',
      name: 'Xiaomi 14 (Box Packed / Leica Optics)',
      slug: 'xiaomi-14-box-packed-leica',
      brand_id: 'brand-xiaomi',
      is_used: 0,
      condition_grade: 'Brand New (Factory Sealed)',
      pta_status: 'Official PTA',
      battery_health: 100,
      warranty_type: '1 Year Official Xiaomi Pakistan Warranty',
      description: 'Compact 6.36-inch flagship with world-class Leica Summilux optical lens, Snapdragon 8 Gen 3 processor, and 90W HyperCharge in a comfortable one-hand grip form factor.',
      specs_json: JSON.stringify({
        display: '6.36" LTPO AMOLED, 120Hz, Dolby Vision, 3000 nits',
        chipset: 'Snapdragon 8 Gen 3 (4 nm)',
        camera: 'Triple 50MP Leica System (Main, 75mm Floating Telephoto, Ultra-wide)',
        battery: '4610 mAh, 90W wired + 50W wireless HyperCharge',
        sim: 'Dual SIM (PTA Approved)'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
      featured: 0,
      rating: 4.7,
      review_count: 11,
      variants: [
        {
          id: 'var-mi14-new-512-black',
          storage: '512GB',
          color_name: 'Classic Black',
          color_hex: '#181818',
          image_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80'
          ]),
          price: 285000,
          regular_price: 300000,
          stock: 4,
          sku: 'MI-14-512-BLK-NEW'
        }
      ]
    },
    {
      id: 'prod-infinix-note-40-pro-new',
      name: 'Infinix Note 40 Pro (Box Packed)',
      slug: 'infinix-note-40-pro-box-packed',
      brand_id: 'brand-infinix',
      is_used: 0,
      condition_grade: 'Brand New (Factory Sealed)',
      pta_status: 'Official PTA',
      battery_health: 100,
      warranty_type: '1 Year Official Carlcare Warranty',
      description: 'The best value phone in Pakistan under 75K. 3D Curved 120Hz AMOLED display, 108MP OIS camera, Active Halo AI lighting, 70W All-Round FastCharge 2.0 with 20W Wireless MagCharge included in the box!',
      specs_json: JSON.stringify({
        display: '6.78" 3D-Curved AMOLED, 120Hz, Corning Gorilla Glass',
        chipset: 'MediaTek Helio G99 Ultimate, 12GB + 12GB Extended RAM, 256GB ROM',
        camera: '108MP OIS Super-Zoom Camera + 2MP + 2MP, 32MP Selfie',
        battery: '5000 mAh, 70W Multi-speed FastCharge + 20W Wireless MagCharge',
        audio: 'Dual Speakers with Sound by JBL'
      }),
      thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      featured: 0,
      rating: 4.8,
      review_count: 22,
      variants: [
        {
          id: 'var-inf40-new-256-gold',
          storage: '256GB',
          color_name: 'Titan Gold',
          color_hex: '#e3c285',
          image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
          ]),
          price: 69999,
          regular_price: 74999,
          stock: 12,
          sku: 'INF-N40P-256-GLD-NEW'
        },
        {
          id: 'var-inf40-new-256-green',
          storage: '256GB',
          color_name: 'Vintage Green',
          color_hex: '#2b3f33',
          image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
          images_json: JSON.stringify([
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
          ]),
          price: 69999,
          regular_price: 74999,
          stock: 8,
          sku: 'INF-N40P-256-GRN-NEW'
        }
      ]
    }
  ];

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (
      id, name, slug, brand_id, is_used, condition_grade, pta_status, battery_health,
      warranty_type, description, specs_json, thumbnail, featured, rating, review_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertVariant = db.prepare(`
    INSERT OR REPLACE INTO product_variants (
      id, product_id, storage, color_name, color_hex, image_url, images_json,
      price, regular_price, stock, imei_serial, sku
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const p of products) {
    const { variants, ...prodData } = p;
    insertProduct.run(
      prodData.id,
      prodData.name,
      prodData.slug,
      prodData.brand_id,
      prodData.is_used,
      prodData.condition_grade,
      prodData.pta_status,
      prodData.battery_health,
      prodData.warranty_type,
      prodData.description,
      prodData.specs_json,
      prodData.thumbnail,
      prodData.featured,
      prodData.rating,
      prodData.review_count
    );
    for (const v of variants) {
      insertVariant.run(
        v.id,
        p.id,
        v.storage,
        v.color_name,
        v.color_hex,
        v.image_url,
        v.images_json,
        v.price,
        v.regular_price,
        v.stock,
        (v as any).imei_serial || null,
        (v as any).sku || null

      );
    }
  }

  // 4. Coupons
  const coupons = [
    { id: 'c-1', code: 'CZNS500', discount_type: 'fixed', discount_value: 500, min_spend: 25000, max_discount: 500, is_active: 1 },
    { id: 'c-2', code: 'WELCOME1000', discount_type: 'fixed', discount_value: 1000, min_spend: 50000, max_discount: 1000, is_active: 1 },
    { id: 'c-3', code: 'PROVIP5', discount_type: 'percentage', discount_value: 5, min_spend: 100000, max_discount: 5000, is_active: 1 },
  ];

  const insertCoupon = db.prepare(`
    INSERT OR REPLACE INTO coupons (id, code, discount_type, discount_value, min_spend, max_discount, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  coupons.forEach(c => insertCoupon.run(c.id, c.code, c.discount_type, c.discount_value, c.min_spend, c.max_discount, c.is_active));

  // 5. Shoppable Phone Review Reels
  const reels = [
    {
      id: 'reel-1',
      title: 'iPhone 15 Pro Max Natural Titanium Unboxing & Battery Test',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-with-a-green-screen-41136-large.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      product_id: 'prod-iphone-15-pro-max-new',
      views: 12480,
      likes: 842
    },
    {
      id: 'reel-2',
      title: 'Samsung S24 Ultra 100x Moon Shot & Titanium Frame Test Karachi',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-smartphone-touch-screen-42289-large.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
      product_id: 'prod-samsung-s24-ultra-new',
      views: 9840,
      likes: 673
    },
    {
      id: 'reel-3',
      title: 'How we verify 10/10 Mint Used iPhones in CZNS Lab',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-a-blank-green-screen-41137-large.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
      product_id: 'prod-iphone-15-pro-used',
      views: 18200,
      likes: 1290
    },
    {
      id: 'reel-4',
      title: 'Google Pixel 8 Pro Best Take & Night Sight in Saddar Karachi',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-man-using-a-mobile-phone-while-sitting-in-an-armchair-42468-large.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
      product_id: 'prod-google-pixel-8-pro-used',
      views: 7420,
      likes: 512
    }
  ];

  const insertReel = db.prepare(`
    INSERT OR REPLACE INTO reels (id, title, video_url, thumbnail_url, product_id, views, likes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  reels.forEach(r => insertReel.run(r.id, r.title, r.video_url, r.thumbnail_url, r.product_id, r.views, r.likes));

  // 6. Sample Verified Reviews
  const sampleReviews = [
    {
      id: 'rev-1',
      product_id: 'prod-iphone-15-pro-used',
      author_name: 'Usman Tariq',
      author_city: 'Karachi (Gulshan-e-Iqbal)',
      rating: 5,
      comment: 'Ordered iPhone 15 Pro 128GB Used 10/10. Received same day in Karachi via rider. Battery health was exactly 93% as described! Face ID and True Tone working 100%. Highly recommended store.',
      photos_json: JSON.stringify(['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80'])
    },
    {
      id: 'rev-2',
      product_id: 'prod-iphone-15-pro-max-new',
      author_name: 'Hamza Sheikh',
      author_city: 'Lahore (DHA Phase 5)',
      rating: 5,
      comment: 'Paid advance via Meezan Bank IBFT. Got TCS tracking within 3 hours. Received 100% genuine factory sealed pin pack iPhone with official Mercantile warranty slip. Excellent customer service on WhatsApp.',
      photos_json: null
    },
    {
      id: 'rev-3',
      product_id: 'prod-samsung-s24-ultra-new',
      author_name: 'Dr. Bilal Qureshi',
      author_city: 'Islamabad (F-7)',
      rating: 5,
      comment: 'Airlink warranty verified directly on Samsung Pakistan portal. Packing was bulletproof with bubble wrap. CZNS is the only authentic store I trust in Pakistan for flagships.',
      photos_json: null
    },
    {
      id: 'rev-4',
      product_id: 'prod-iphone-13-used-non-pta',
      author_name: 'Zeeshan Ali',
      author_city: 'Rawalpindi',
      rating: 5,
      comment: 'Condition is genuinely 9.5/10. Tested on Wi-Fi and SCOM SIM, worked without issues. Rs. 115,000 for this clean piece is a steal deal.',
      photos_json: null
    }
  ];

  const insertRev = db.prepare(`
    INSERT OR REPLACE INTO reviews (id, product_id, author_name, author_city, rating, comment, photos_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  sampleReviews.forEach(r => insertRev.run(r.id, r.product_id, r.author_name, r.author_city, r.rating, r.comment, r.photos_json));

  // 7. Sample Initial Orders (To populate the Admin Dashboard and Desks)
  const sampleOrders = [
    {
      id: 'ord-101',
      order_number: 'CZNS-2026-8812',
      customer_name: 'Farhan Siddiqui',
      customer_phone: '03018273645',
      customer_email: 'farhan@gmail.com',
      address: 'House #42, Street 8, Block 13-D, Gulshan-e-Iqbal',
      province: 'Sindh',
      city: 'Karachi',
      delivery_fee: 250,
      subtotal: 365000,
      discount: 500,
      coupon_code: 'CZNS500',
      total: 364750,
      payment_method: 'cod',
      payment_status: 'unverified_pending',
      order_status: 'pending_confirmation',
      sender_mobile: null,
      tid: null,
      courier_name: 'Self Delivery Karachi',
      tracking_number: null,
      admin_notes: 'Waiting for WhatsApp confirmation call before dispatch'
    },
    {
      id: 'ord-102',
      order_number: 'CZNS-2026-8813',
      customer_name: 'Saad Malik',
      customer_phone: '03219485721',
      customer_email: 'saad.malik@outlook.com',
      address: 'Plot 104, Sector Y, Phase 3, DHA',
      province: 'Punjab',
      city: 'Lahore',
      delivery_fee: 0,
      subtotal: 495000,
      discount: 1000,
      coupon_code: 'WELCOME1000',
      total: 494000,
      payment_method: 'jazzcash',
      payment_status: 'unverified_pending',
      order_status: 'pending_confirmation',
      sender_mobile: '03219485721',
      tid: 'JC8492049182',
      courier_name: 'TCS',
      tracking_number: null,
      admin_notes: 'Customer transferred via JazzCash. Check merchant statement for TID JC8492049182'
    },
    {
      id: 'ord-103',
      order_number: 'CZNS-2026-8814',
      customer_name: 'Adeel Khan',
      customer_phone: '03338472910',
      customer_email: 'adeel.k@yahoo.com',
      address: 'House 19, Street 4, Sector G-11/2',
      province: 'Islamabad Capital Territory',
      city: 'Islamabad',
      delivery_fee: 0,
      subtotal: 435000,
      discount: 0,
      coupon_code: null,
      total: 435000,
      payment_method: 'bank_transfer',
      payment_status: 'verified',
      order_status: 'packed',
      sender_mobile: '03338472910',
      tid: 'MEZN-IBFT-994821',
      courier_name: 'Leopards Courier',
      tracking_number: 'LEO-92837461',
      admin_notes: 'Meezan IBFT Rs. 435,000 verified. Ready for Leopards pickup.'
    }
  ];

  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, order_number, customer_name, customer_phone, customer_email, address, province,
      city, delivery_fee, subtotal, discount, coupon_code, total, payment_method,
      payment_status, order_status, sender_mobile, tid, courier_name, tracking_number, admin_notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertOrderItem = db.prepare(`
    INSERT OR REPLACE INTO order_items (
      id, order_id, product_id, variant_id, product_name, storage, color, price, quantity, imei_serial
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of sampleOrders) {
    insertOrder.run(
      o.id,
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.customer_email,
      o.address,
      o.province,
      o.city,
      o.delivery_fee,
      o.subtotal,
      o.discount,
      o.coupon_code,
      o.total,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.sender_mobile,
      o.tid,
      o.courier_name,
      o.tracking_number,
      o.admin_notes
    );
  }

  insertOrderItem.run('oi-1', 'ord-101', 'prod-iphone-15-pro-used', 'var-15p-used-128-nat', 'iPhone 15 Pro (Pre-Owned / 10/10 Mint)', '128GB', 'Natural Titanium', 365000, 1, '358920192847591');
  insertOrderItem.run('oi-2', 'ord-102', 'prod-iphone-15-pro-max-new', 'var-15pm-new-256-nat', 'iPhone 15 Pro Max (Box Packed)', '256GB', 'Natural Titanium', 495000, 1, null);
  insertOrderItem.run('oi-3', 'ord-103', 'prod-samsung-s24-ultra-new', 'var-s24u-new-256-grey', 'Samsung Galaxy S24 Ultra (Box Packed)', '256GB', 'Titanium Gray', 435000, 1, null);

  console.log('Seed completed successfully!');
}

// Execute seed directly
runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

