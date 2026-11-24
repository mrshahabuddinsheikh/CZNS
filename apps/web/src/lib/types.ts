export interface ProductVariant {
  id: string;
  product_id: string;
  storage: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  images?: string[];
  price: number;
  regular_price?: number;
  stock: number;
  imei_serial?: string;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  brand_name?: string;
  brand_slug?: string;
  brand_logo?: string;
  is_used: number; // 0 = New, 1 = Used
  condition_grade: string;
  pta_status: 'Official PTA' | 'Non-PTA' | 'JV / Sim-Lock' | '4-Month Sim Active' | string;
  battery_health?: number;
  warranty_type: string;
  description: string;
  specs_json?: string;
  specs?: Record<string, string>;
  thumbnail: string;
  featured: number;
  rating: number;
  review_count: number;
  min_price?: number;
  max_price?: number;
  regular_price?: number;
  storages?: string[];
  colors?: string[];
  color_hexes?: string[];
  total_stock?: number;
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  total_products?: number;
  new_products_count?: number;
  used_products_count?: number;
}

export interface Reel {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  product_id?: string;
  product_name?: string;
  product_slug?: string;
  is_used?: number;
  condition_grade?: string;
  battery_health?: number;
  pta_status?: string;
  price?: number;
  views: number;
  likes: number;
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  author_city?: string;
  rating: number;
  comment: string;
  is_verified_buyer: number;
  photos?: string[];
  created_at: string;
}

export interface CartItem {
  variant_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  storage: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  price: number;
  regular_price?: number;
  quantity: number;
  is_used: number;
  condition_grade: string;
  pta_status: string;
  battery_health?: number;
  max_stock: number;
}

export interface StoreSettings {
  karachi_only_cod: boolean;
  cod_karachi_fee: number;
  cod_nationwide_fee: number;
  online_advance_delivery_fee: number;
  jazzcash_title: string;
  jazzcash_number: string;
  easypaisa_title: string;
  easypaisa_number: string;
  bank_name: string;
  bank_account_title: string;
  bank_account_number: string;
  bank_iban: string;
  payoneer_email: string;
  safepay_public_key: string;
  whatsapp_support_number: string;
  social_proof_enabled: boolean;
  coins_reward_percent: number;
  meta_pixel_id?: string;
  tiktok_pixel_id?: string;
  google_ads_id?: string;
  founder_name?: string;
  founder_title?: string;
  founder_image_url?: string;
  founder_whatsapp?: string;
  founder_badge_text?: string;
}

export interface DealOfTheDay {
  id: string;
  product_id: string;
  title: string;
  deal_price: number;
  regular_price: number;
  start_time: string;
  end_time: string;
  stock_total: number;
  stock_claimed: number;
  is_sold_out: number;
  is_active: number;
  badge_text: string;
  product_name?: string;
  product_slug?: string;
  thumbnail?: string;
  is_used?: number;
  condition_grade?: string;
  pta_status?: string;
  battery_health?: number;
  brand_name?: string;
  storages?: string[];
  colors?: string[];
  default_variant_id?: string;
  seconds_remaining?: number;
  is_expired?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address: string;
  province: string;
  city: string;
  delivery_fee: number;
  subtotal: number;
  discount: number;
  coupon_code?: string;
  total: number;
  payment_method: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card' | 'safepay';
  payment_status: 'unverified_pending' | 'verified' | 'paid' | 'failed';
  order_status: 'pending_confirmation' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  sender_mobile?: string;
  tid?: string;
  courier_name?: string;
  tracking_number?: string;
  admin_notes?: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_name: string;
    storage: string;
    color: string;
    price: number;
    quantity: number;
    imei_serial?: string;
  }>;
}
