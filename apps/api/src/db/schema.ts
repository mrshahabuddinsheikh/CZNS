import { db } from './index.js';

export function initSchema() {
  db.exec(`
    -- Brands Table
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products Table (New & Used Smartphones)
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      brand_id TEXT NOT NULL,
      is_used INTEGER NOT NULL DEFAULT 0, -- 0 = Brand New (Box Packed), 1 = Used (Pre-Owned)
      condition_grade TEXT, -- e.g. "Brand New", "10/10 Like New", "9.5/10 Flawless", "9/10 Minor Scratches"
      pta_status TEXT NOT NULL, -- "Official PTA", "Non-PTA", "JV / Sim-Lock", "4-Month Sim Active"
      battery_health INTEGER, -- e.g. 100, 94, 88
      warranty_type TEXT NOT NULL, -- e.g. "1 Year Official Brand Warranty", "7 Days Store Checking Warranty"
      description TEXT,
      specs_json TEXT, -- JSON string with Display, Camera, Chipset, Battery, OS, etc.
      thumbnail TEXT,
      featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    -- Product Variants (Storage, Colors, Stock, IMEI tracking)
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      storage TEXT NOT NULL, -- "64GB", "128GB", "256GB", "512GB", "1TB"
      color_name TEXT NOT NULL, -- e.g. "Natural Titanium", "Deep Purple"
      color_hex TEXT NOT NULL, -- e.g. "#9a9792"
      image_url TEXT NOT NULL,
      images_json TEXT, -- Multiple gallery angles for this variant (front, back, frame, camera)
      price INTEGER NOT NULL, -- Price in PKR
      regular_price INTEGER, -- Cut/Original price in PKR for discount display
      stock INTEGER NOT NULL DEFAULT 1,
      imei_serial TEXT, -- Optional IMEI / Serial tracking field for admin verification
      sku TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL, -- WhatsApp number
      customer_email TEXT,
      address TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      coupon_code TEXT,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL, -- "cod", "jazzcash", "easypaisa", "bank_transfer", "card", "safepay"
      payment_status TEXT NOT NULL DEFAULT 'unverified_pending', -- "unverified_pending", "verified", "paid", "failed"
      order_status TEXT NOT NULL DEFAULT 'pending_confirmation', -- "pending_confirmation", "confirmed", "packed", "shipped", "delivered", "cancelled"
      sender_mobile TEXT, -- For JazzCash / Easypaisa
      tid TEXT, -- Transaction ID entered by customer
      courier_name TEXT, -- "TCS", "Leopards", "Trax", "PostEx", "M&P", "Self Delivery Karachi"
      tracking_number TEXT,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      storage TEXT NOT NULL,
      color TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      imei_serial TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Shoppable Phone Review Reels Table
    CREATE TABLE IF NOT EXISTS reels (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      product_id TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    -- Coupons & Loyalty Table
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL, -- "fixed", "percentage"
      discount_value INTEGER NOT NULL,
      min_spend INTEGER DEFAULT 0,
      max_discount INTEGER,
      expiry_date DATETIME,
      is_active INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- WhatsApp Leads Table (Exit-intent popups, inquiries)
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT,
      whatsapp_number TEXT NOT NULL,
      city TEXT,
      source TEXT DEFAULT 'exit_popup',
      coupon_sent INTEGER DEFAULT 0,
      notes TEXT,
      status TEXT DEFAULT 'new', -- "new", "contacted", "converted", "closed"
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customer Reviews Table (with photo support)
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_city TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      is_verified_buyer INTEGER DEFAULT 1,
      photos_json TEXT, -- Array of photo URLs
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Store Settings Table (Key-Value)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Admin Users Table
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for blazing-fast mobile lookups
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_products_used ON products(is_used);
    CREATE INDEX IF NOT EXISTS idx_products_pta ON products(pta_status);
    CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition_grade);
    CREATE INDEX IF NOT EXISTS idx_products_battery ON products(battery_health);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
  `);

  // Default store settings
  const defaultSettings: Record<string, string> = {
    karachi_only_cod: '1', // 1 = Karachi Only COD, 0 = Nationwide COD
    cod_karachi_fee: '250',
    cod_nationwide_fee: '450',
    online_advance_delivery_fee: '0', // Free delivery on advance payment incentive
    jazzcash_title: 'CZNS MOBILES (PVT) LTD',
    jazzcash_number: '03001234567',
    easypaisa_title: 'CZNS MOBILES STORE',
    easypaisa_number: '03337654321',
    bank_name: 'Meezan Bank Limited',
    bank_account_title: 'CZNS MOBILE STORE OFFICIAL',
    bank_account_number: '01010102938475',
    bank_iban: 'PK45MEZN0001010102938475',
    payoneer_email: 'payments@czns.pk',
    safepay_public_key: 'sec_test_czns_pk_9948',
    whatsapp_support_number: '923001234567',
    meta_pixel_id: '',
    tiktok_pixel_id: '',
    google_ads_id: '',
    webhook_url: '',
    social_proof_enabled: '1',
    coins_reward_percent: '2', // 2% of order value earned as coins
  };

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const [key, val] of Object.entries(defaultSettings)) {
    insertSetting.run(key, val);
  }
}
