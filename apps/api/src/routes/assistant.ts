import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

export async function assistantRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ChatRequestBody }>(
    '/api/v1/assistant/chat',
    async (request: FastifyRequest<{ Body: ChatRequestBody }>, reply: FastifyReply) => {
      const { message = '' } = request.body || {};
      const query = message.trim().toLowerCase();

      if (!query) {
        return reply.status(400).send({
          reply: 'Assalam-o-Alaikum! Please enter a message or choose a budget/brand to find your phone.',
          products: [],
        });
      }

      // 1. General FAQs & Store Inquiries
      if (
        query.includes('cod') ||
        query.includes('cash on delivery') ||
        query.includes('karachi cod') ||
        query.includes('payment method')
      ) {
        return {
          reply:
            'Karachi mein **Cash on Delivery (COD)** 100% available hai! Rider phone deliver karega, aap parcel check kar ke payment cash de sakte hain. Karachi ke bahar TCS / Leopards ke zariye express delivery hoti hai with advance online payment (Bank Transfer / JazzCash / Easypaisa).',
          products: [],
          quick_replies: ['⚡ Buy Flagship Phone', '💰 Under 50k Phones', '🔄 10/10 Used Phones'],
          intent: 'faq_cod',
        };
      }

      if (
        query.includes('warranty') ||
        query.includes('guarantee') ||
        query.includes('check warranty') ||
        query.includes('pta')
      ) {
        return {
          reply:
            'CZNS par sabhi Brand New box-packed phones par **1-Year Official Brand Warranty** milti hai. Pre-Owned / Used phones par **7 Days Checking Warranty** aur **100% Genuine IMEI / PTA Guarantee** milti hai. Har phone 360-degree testing pass hota hai.',
          products: [],
          quick_replies: ['✨ Brand New Phones', '🔄 Certified Used Phones', '⚡ Buy in 2 Clicks'],
          intent: 'faq_warranty',
        };
      }

      // 2. Budget Extraction
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      // Extract patterns like "under 50k", "50000", "20k-40k", "under 1 lac", "under 200k"
      if (query.includes('under 30k') || query.includes('30000') || query.includes('30 k') || query.includes('sasta')) {
        maxPrice = 35000;
      } else if (query.includes('under 50k') || query.includes('50000') || query.includes('50 k')) {
        maxPrice = 55000;
      } else if (query.includes('under 70k') || query.includes('70000') || query.includes('70 k')) {
        maxPrice = 75000;
      } else if (query.includes('under 100k') || query.includes('1 lac') || query.includes('100000') || query.includes('100 k') || query.includes('1 lakh')) {
        maxPrice = 100000;
      } else if (query.includes('under 150k') || query.includes('1.5 lac') || query.includes('150000') || query.includes('150 k')) {
        maxPrice = 150000;
      } else if (query.includes('under 200k') || query.includes('2 lac') || query.includes('200000') || query.includes('200 k') || query.includes('2 lakh')) {
        maxPrice = 200000;
      } else if (query.includes('flagship') || query.includes('premium') || query.includes('ultra')) {
        minPrice = 200000;
      }

      // Check for numbers with k, hazar, thousand, or 5-6 digit values like 45000
      const numMatch = query.match(/(\d{2,3})\s*(k|thousand|hazar|lac|lakh)\b|(\d{5,6})\b/);
      if (numMatch && !maxPrice) {
        if (numMatch[1]) {
          const unit = (numMatch[2] || '').toLowerCase();
          const base = parseInt(numMatch[1], 10);
          if (unit.includes('lac') || unit.includes('lakh')) {
            maxPrice = base * 100000;
          } else {
            maxPrice = base * 1000 + 5000;
          }
        } else if (numMatch[3]) {
          maxPrice = parseInt(numMatch[3], 10) + 5000;
        }
      }

      // 3. Condition filter
      let isUsed: number | null = null;
      if (
        query.includes('used') ||
        query.includes('second hand') ||
        query.includes('pre owned') ||
        query.includes('pre-owned') ||
        query.includes('purana')
      ) {
        isUsed = 1;
      } else if (
        query.includes('new') ||
        query.includes('box pack') ||
        query.includes('pin pack') ||
        query.includes('sealed') ||
        query.includes('naya')
      ) {
        isUsed = 0;
      }

      // 4. Brand detection
      const knownBrands = [
        { key: 'apple', names: ['apple', 'iphone'] },
        { key: 'samsung', names: ['samsung', 'galaxy'] },
        { key: 'pixel', names: ['pixel', 'google'] },
        { key: 'motorola', names: ['motorola', 'moto'] },
        { key: 'nothing', names: ['nothing'] },
        { key: 'honor', names: ['honor'] },
        { key: 'xiaomi', names: ['xiaomi', 'redmi', 'poco', 'mi'] },
        { key: 'vivo', names: ['vivo'] },
        { key: 'oppo', names: ['oppo'] },
        { key: 'realme', names: ['realme'] },
        { key: 'infinix', names: ['infinix'] },
        { key: 'tecno', names: ['tecno', 'camon', 'spark'] },
        { key: 'zte', names: ['zte', 'nubia'] },
        { key: 'nokia', names: ['nokia', 'hmd', 'keypad', 'button'] },
        { key: 'villaon', names: ['villaon'] },
        { key: 'sego', names: ['sego'] },
        { key: 'vgotel', names: ['vgotel'] },
        { key: 'dcode', names: ['dcode'] },
        { key: 'itel', names: ['itel'] },
      ];

      let detectedBrandKey: string | null = null;
      for (const b of knownBrands) {
        if (b.names.some((n) => query.includes(n))) {
          detectedBrandKey = b.key;
          break;
        }
      }

      // 5. Build Database Query
      const conditions: string[] = [];
      const params: any[] = [];

      if (detectedBrandKey) {
        conditions.push('(LOWER(b.name) LIKE ? OR LOWER(b.slug) LIKE ? OR LOWER(p.name) LIKE ?)');
        const bTerm = `%${detectedBrandKey}%`;
        params.push(bTerm, bTerm, bTerm);
      }

      if (isUsed !== null) {
        conditions.push('p.is_used = ?');
        params.push(isUsed);
      }

      if (minPrice !== null) {
        conditions.push(`p.id IN (SELECT product_id FROM product_variants WHERE price >= ?)`);
        params.push(minPrice);
      }

      if (maxPrice !== null) {
        conditions.push(`p.id IN (SELECT product_id FROM product_variants WHERE price <= ?)`);
        params.push(maxPrice);
      }

      // Specific model keywords (e.g., "17", "pro", "s24", "ultra", "s26", "105", "v50s", "fold", "flip")
      const stopWords = new Set([
        'under', 'phone', 'mobile', 'smartphones', 'smartphone', 'chahiye', 'hai', 'price',
        'rate', 'show', 'karo', 'batao', 'buy', 'karna', 'best', 'used', 'new', 'purana', 'naya',
        'apple', 'samsung', 'xiaomi', 'vivo', 'oppo', 'realme', 'infinix', 'tecno', 'zte',
        'nokia', 'motorola', 'google', 'pixel', 'honor', 'dcode', 'vgotel', 'sego', 'villaon', 'itel'
      ]);

      const modelWords = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !stopWords.has(w));

      if (modelWords.length > 0) {
        for (const mw of modelWords) {
          conditions.push('(LOWER(p.name) LIKE ? OR LOWER(p.slug) LIKE ?)');
          const mTerm = `%${mw}%`;
          params.push(mTerm, mTerm);
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const querySql = `
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.is_used,
          p.condition_grade,
          p.pta_status,
          p.battery_health,
          p.warranty_type,
          p.thumbnail,
          b.name as brand_name,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
          (SELECT regular_price FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as regular_price,
          (SELECT id FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_variant_id,
          (SELECT storage FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_storage,
          (SELECT color_name FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_color,
          (SELECT color_hex FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_color_hex,
          (SELECT GROUP_CONCAT(DISTINCT storage) FROM product_variants WHERE product_id = p.id) as storages,
          (SELECT GROUP_CONCAT(DISTINCT color_name) FROM product_variants WHERE product_id = p.id) as colors
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        ${whereClause}
        ORDER BY p.featured DESC, min_price ASC
        LIMIT 4
      `;

      let products: any[] = db.prepare(querySql).all(...params);

      // Fallback: If no products found, fetch top featured products
      if (products.length === 0) {
        products = db.prepare(`
          SELECT 
            p.id,
            p.name,
            p.slug,
            p.is_used,
            p.condition_grade,
            p.pta_status,
            p.battery_health,
            p.warranty_type,
            p.thumbnail,
            b.name as brand_name,
            (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
            (SELECT regular_price FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as regular_price,
            (SELECT id FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_variant_id,
            (SELECT storage FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_storage,
            (SELECT color_name FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_color,
            (SELECT color_hex FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_color_hex,
            (SELECT GROUP_CONCAT(DISTINCT storage) FROM product_variants WHERE product_id = p.id) as storages,
            (SELECT GROUP_CONCAT(DISTINCT color_name) FROM product_variants WHERE product_id = p.id) as colors
          FROM products p
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.featured = 1
          LIMIT 4
        `).all();
      }

      // Format response message
      let replyMessage = '';
      if (detectedBrandKey && maxPrice) {
        replyMessage = `Yeh rahe aap ke budget (Under Rs. ${maxPrice.toLocaleString()}) ke mutabiq best **${detectedBrandKey.toUpperCase()}** mobiles! Aap kisi bhi phone par **"⚡ Buy in 2 Clicks"** tap kar ke foran order place kar sakte hain:`;
      } else if (detectedBrandKey) {
        replyMessage = `Yeh rahe CZNS par top **${detectedBrandKey.toUpperCase()}** smartphones certified rates ke sath! Aap direct yahan se 2 clicks mein order kar sakte hain:`;
      } else if (maxPrice) {
        replyMessage = `Aap ke budget (**Rs. ${maxPrice.toLocaleString()} tak**) ke mutabiq top value-for-money smartphones yeh hain:`;
      } else if (isUsed === 1) {
        replyMessage = `Yeh rahe hamare certified **Pre-Owned / Used (10/10 Mint)** smartphones 7-day checking warranty aur official PTA verification ke sath:`;
      } else {
        replyMessage = `Aap ke liye best matching smartphones yeh hain! Aap **"⚡ Buy in 2 Clicks"** par tap kar ke sirf apna Naam aur WhatsApp number enter karein, order foran book ho jayega:`;
      }

      return {
        reply: replyMessage,
        products: products.map((p) => ({
          ...p,
          storages: p.storages ? p.storages.split(',') : ['Standard'],
          colors: p.colors ? p.colors.split(',') : ['Standard'],
        })),
        quick_replies: [
          '⚡ Instant Checkout',
          '🔥 View Under 50k Phones',
          '🚚 Karachi COD Details',
          '💬 Order via WhatsApp',
        ],
        intent: 'product_recommendations',
      };
    }
  );
}
