# 📱 CZNS - Pakistani Mobile Store E-Commerce Platform

A production-ready, ultra-fast E-Commerce website and Admin Management System designed specifically for buying and selling Smartphones in Pakistan with dual core modes:
1. 🟢 **New Phones (Box Packed / Pin Pack / Official Brand Warranty / PTA Approved)**
2. 🟡 **Used Phones (Pre-Owned / Graded 10/10 / Battery Health % / PTA & Non-PTA / 7-Day Checking Warranty)**

---

## 🛠 TECH STACK & ARCHITECTURE

- **Monorepo Structure:** `apps/web` (Frontend) + `apps/api` (Backend Fastify API) + root deployment scripts.
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Canvas Confetti.
- **Backend:** Fastify Node.js high-performance REST API with CORS, JWT, rate limiting, and SQLite with automated schema migrations and indexing.
- **Deployment Ready:** Configured for cPanel / LiteSpeed Passenger (`app.js`) and VPS / PM2 (`ecosystem.config.cjs`).

---

## 🚀 QUICK START GUIDE

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Database
Seeds initial flagships (iPhone 15 Pro Max, 15 Pro Used, 13 Non-PTA, Samsung S24 Ultra, S23 Ultra, Pixel 8 Pro, etc.), coupons, reels, and admin account:
```bash
npm run seed --workspace=apps/api
```

### 3. Run in Development Mode
Starts both the Fastify API (port 5000) and Next.js Web Frontend (port 3000):
```bash
# Start API:
npm run dev:api

# Start Web:
npm run dev:web
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 DEFAULT ADMIN CREDENTIALS

- **Admin Login URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@czns.pk`
- **Password:** `admin123`

---

## 🎯 KEY HIGHLIGHTS & FEATURES IMPLEMENTED

### 1. Dual Phone Modes (Phase 1)
- Header, Hero, and Catalog feature primary mode selector:
  - 🟢 **New Phones:** 100% Brand New, Pin Packed, 1-Year Official Brand Warranty (Mercantile, Airlink, Corecell), Official PTA Approved.
  - 🟡 **Used Phones:** Graded 10/10 Mint Like New, 9.5/10, Battery Health % (100%, 95%, 90%, 85%+), PTA Status (Official PTA, Non-PTA / Factory Unlock, JV / Sim-Lock, 4-Month Active), 7-Day Checking Warranty.
- Dedicated brand navigation: Apple (iPhone), Samsung, Google Pixel, Xiaomi / Redmi, OnePlus, Vivo, Oppo, Infinix, Tecno.
- Interactive search bar with instant autocomplete suggestions.

### 2. Product Detail Page (PDP) Experience (Phase 3)
- Multi-angle zoomable gallery (front, back, frame, camera lens).
- Interactive 1-click Storage Selector (128GB, 256GB, 512GB, 1TB) & Color Swatches with live image updates.
- Visual Battery Health badge (🔋 93% Original Battery) & Condition Grade badges.
- Trust Badges: "100% Original Genuine Parts Tested", "Face ID / TrueTone 100% Functional", "7 Days Easy Replacement Warranty".
- Action Buttons: "Buy Now" (Instant Checkout), "Add to Bag", and "Order via WhatsApp" with pre-filled phone specs and price.

### 3. Pakistani Payment System & COD City Control Rule (Phase 4)
- **COD City Control (Karachi vs Other Cities Rule):**
  - Managed by Admin Switch ("Karachi Only COD" vs "Nationwide COD").
  - If **Karachi**: Cash on Delivery is enabled with rider dispatch.
  - If **other city (Lahore, Islamabad, Rawalpindi, Faisalabad, etc.)**: COD is strictly disabled with the notice:
    *"Cash on Delivery is available in Karachi only. Orders from other cities require online payment in advance."*
- **Supported Payment Gateways:**
  - **Debit / Credit Card** (Visa / Mastercard with 256-bit SSL encryption badge)
  - **JazzCash Mobile Wallet** (Merchant Title & Number with 1-click Copy, sender mobile & TID)
  - **Easypaisa Mobile Wallet** (Merchant Title & Number with 1-click Copy, sender mobile & TID)
  - **Direct Bank Transfer (IBFT / Raast)** (Meezan Bank, Account Title, Account Number, 24-character IBAN with 1-click Copy)
  - **Payoneer / Safepay Gateway** for Overseas Pakistanis
- **Anti-Fraud & Fake TID Protection:** Orders placed with manual TID are stored as **"Unverified / Pending Payment"** and verified in banking app before dispatch.

### 4. Sales Conversion Engines (Phase 5)
- **Shoppable Phone Review Reels:** Vertical video reels carousel with unboxings & camera zoom tests, featuring a 1-click "Buy Now" pill attached to the featured phone.
- **Social Proof Popups:** Floating notifications (*"Ahmed in Lahore just bought iPhone 15 Pro 128GB (Used 10/10) · 4 mins ago"*).
- **Exit-Intent Lead Capture Popup:** Triggers on exit to offer Rs. 500 voucher (`CZNS500`) in exchange for WhatsApp number. Leads sync directly to the Admin WhatsApp CRM.
- **Discount Coupons & Coins Loyalty Engine:** Promo codes (`CZNS500`, `WELCOME1000`) and 2% coins cashback.
- **Customer Reviews Wall:** Real Pakistani buyer reviews with 5-star ratings & verified buyer badges.

### 5. Admin Control Panel (`/admin`) (Phase 6)
- **Executive Dashboard:** Real-time revenue, orders by status, Pakistan geographic city map, and low stock warnings (&lt;=3 units).
- **Order Management Desks:**
  - *"Confirm COD Orders"* desk with 1-click WhatsApp customer confirmation link.
  - *"Verify Payment"* desk for approving/rejecting manual JazzCash, Easypaisa, and IBFT TIDs.
  - *"Pack & Ship"* desk with courier dispatch tracking (TCS, Leopards, Trax, PostEx, M&P) and 1-click tracking sent to customer WhatsApp.
- **Inventory & Phones:** Add/edit phones, New vs Used toggle, condition grades, battery health %, storage variants, colors, prices, and optional IMEI tracking.
- **COD & Gateways Control:** Toggle Karachi-only COD, adjust delivery charges, update JazzCash/Easypaisa numbers and bank IBAN.
- **Marketing Hub & WhatsApp CRM:** Manage reels, coupons, review captured WhatsApp leads with 1-click chat links, ad pixels, and **1-Click SQLite DB Backup**.

### 6. Speed & Cold-Start Resilience (Phase 7)
- Exponential backoff retry implemented in `apps/web/src/lib/api.ts`.
- Backend `/api/v1/health` endpoint returning database health, uptime, memory, and service status.

---

## 🌐 PRODUCTION DEPLOYMENT

### cPanel / LiteSpeed Passenger
1. Upload project files to your cPanel root / subdomain directory.
2. In cPanel **Setup Node.js App**, choose Application startup file: `app.js`.
3. Set environment variables (`PORT`, `NEXT_PUBLIC_API_URL`).
4. Click **Run NPM Install** and **Restart**.

### VPS (Ubuntu / Debian / AlmaLinux) with PM2
```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```
