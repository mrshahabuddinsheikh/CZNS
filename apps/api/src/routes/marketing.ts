import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { nanoid } from 'nanoid';

export async function marketingRoutes(fastify: FastifyInstance) {
  // 1. Get Shoppable Reels
  fastify.get('/api/v1/reels', async () => {
    const reels: any[] = db.prepare(`
      SELECT 
        r.*,
        p.name as product_name,
        p.slug as product_slug,
        p.is_used,
        p.condition_grade,
        p.battery_health,
        p.pta_status,
        (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as price
      FROM reels r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.views DESC
    `).all();

    return { reels };
  });

  // 2. Increment Reel View / Like
  fastify.post<{ Params: { id: string } }>(
    '/api/v1/reels/:id/like',
    async (request) => {
      const { id } = request.params;
      db.prepare('UPDATE reels SET likes = likes + 1 WHERE id = ?').run(id);
      return { success: true };
    }
  );

  // 3. Social Proof Popups Feed
  fastify.get('/api/v1/social-proof', async () => {
    const row: any = db.prepare("SELECT value FROM settings WHERE key = 'social_proof_enabled'").get();
    if (row?.value === '0') {
      return { enabled: false, events: [] };
    }

    const recentOrders: any[] = db.prepare(`
      SELECT 
        o.customer_name,
        o.city,
        o.created_at,
        oi.product_name,
        oi.storage,
        p.is_used,
        p.condition_grade,
        p.thumbnail
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 8
    `).all();

    const mockFallbacks = [
      {
        customer_name: 'Ahmed',
        city: 'Lahore',
        product_name: 'iPhone 15 Pro 128GB',
        condition_grade: 'Used 10/10 Mint',
        is_used: 1,
        time_ago: '4 mins ago',
        thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80',
      },
      {
        customer_name: 'Tariq Mehmood',
        city: 'Karachi (DHA)',
        product_name: 'Samsung Galaxy S24 Ultra',
        condition_grade: 'Brand New Box Packed',
        is_used: 0,
        time_ago: '11 mins ago',
        thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&q=80',
      },
      {
        customer_name: 'Shahzaib',
        city: 'Islamabad',
        product_name: 'Google Pixel 8 Pro',
        condition_grade: 'Certified 10/10 Mint',
        is_used: 1,
        time_ago: '19 mins ago',
        thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80',
      },
      {
        customer_name: 'Danish Khan',
        city: 'Faisalabad',
        product_name: 'iPhone 13 128GB',
        condition_grade: '9.5/10 Flawless',
        is_used: 1,
        time_ago: '28 mins ago',
        thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=80',
      },
    ];

    const events = recentOrders.length > 0
      ? recentOrders.map(o => ({
          customer_name: o.customer_name ? o.customer_name.split(' ')[0] : 'Customer',
          city: o.city,
          product_name: `${o.product_name} ${o.storage || ''}`,
          condition_grade: o.condition_grade || (o.is_used ? 'Pre-Owned' : 'Brand New'),
          is_used: o.is_used,
          thumbnail: o.thumbnail,
          time_ago: 'Just now',
        }))
      : mockFallbacks;

    return {
      enabled: true,
      events,
    };
  });

  // 4. Capture Lead
  fastify.post<{ Body: { name?: string; whatsapp_number: string; city?: string; source?: string } }>(
    '/api/v1/leads',
    async (request, reply) => {
      const { name, whatsapp_number, city, source = 'exit_popup' } = request.body || {};

      if (!whatsapp_number || whatsapp_number.trim().length < 10) {
        return reply.status(400).send({ error: 'Valid WhatsApp number is required' });
      }

      const leadId = `lead-${nanoid(8)}`;
      db.prepare(`
        INSERT INTO leads (id, name, whatsapp_number, city, source, coupon_sent)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(leadId, name || 'Website Visitor', whatsapp_number.trim(), city || 'Pakistan', source);

      return {
        success: true,
        message: 'Rs. 500 Discount Coupon Code: CZNS500 activated for your WhatsApp number!',
        coupon_code: 'CZNS500',
      };
    }
  );

  // 5. Post Customer Review
  fastify.post<{ Body: { product_id: string; author_name: string; author_city?: string; rating: number; comment: string; photos?: string[] } }>(
    '/api/v1/reviews',
    async (request, reply) => {
      const { product_id, author_name, author_city, rating, comment, photos = [] } = request.body || {};

      if (!product_id || !author_name || !comment) {
        return reply.status(400).send({ error: 'Product, name, and comment are required' });
      }

      const reviewId = `rev-${nanoid(8)}`;
      db.prepare(`
        INSERT INTO reviews (id, product_id, author_name, author_city, rating, comment, is_verified_buyer, photos_json)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(reviewId, product_id, author_name, author_city || 'Karachi', rating || 5, comment, JSON.stringify(photos));

      const stats: any = db.prepare(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count
        FROM reviews WHERE product_id = ?
      `).get(product_id);

      if (stats) {
        db.prepare(`
          UPDATE products
          SET rating = ROUND(?, 1), review_count = ?
          WHERE id = ?
        `).run(stats.avg_rating || 5, stats.rev_count || 1, product_id);
      }

      return { success: true, reviewId };
    }
  );

  // 6. Get Active Deal of the Day (Public)
  fastify.get('/api/v1/deals/today', async () => {
    let deal: any = db.prepare(`
      SELECT 
        d.*,
        p.name as product_name,
        p.slug as product_slug,
        p.thumbnail,
        p.is_used,
        p.condition_grade,
        p.pta_status,
        p.battery_health,
        b.name as brand_name,
        (SELECT GROUP_CONCAT(DISTINCT storage) FROM product_variants WHERE product_id = p.id) as storages,
        (SELECT GROUP_CONCAT(DISTINCT color_name) FROM product_variants WHERE product_id = p.id) as colors,
        (SELECT id FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_variant_id
      FROM deal_of_the_day d
      LEFT JOIN products p ON d.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE d.is_active = 1
      ORDER BY d.created_at DESC
      LIMIT 1
    `).get();

    // Auto-create initial 24h deal if none exists
    if (!deal) {
      const topProd: any = db.prepare(`
        SELECT p.*, 
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
          (SELECT regular_price FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as regular_price
        FROM products p
        WHERE p.slug = 'apple-iphone-17-pro-256gb' OR p.slug LIKE '%iphone-15%' OR p.featured = 1
        LIMIT 1
      `).get();

      if (topProd) {
        const now = new Date();
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        const dealId = `deal-${nanoid(8)}`;
        const regP = topProd.regular_price || topProd.min_price || 447000;
        const dealP = Math.floor(topProd.min_price * 0.92); // 8% special flash deal

        db.prepare(`
          INSERT INTO deal_of_the_day (
            id, product_id, title, deal_price, regular_price, start_time, end_time,
            stock_total, stock_claimed, is_sold_out, is_active, badge_text
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `).run(
          dealId,
          topProd.id,
          `⚡ 24-HOUR FLASH DEAL: ${topProd.name}`,
          dealP,
          regP,
          now.toISOString(),
          endTime.toISOString(),
          5,
          2,
          0,
          'LIMITED 24H FLASH DEAL'
        );

        deal = db.prepare(`
          SELECT 
            d.*,
            p.name as product_name,
            p.slug as product_slug,
            p.thumbnail,
            p.is_used,
            p.condition_grade,
            p.pta_status,
            p.battery_health,
            b.name as brand_name,
            (SELECT GROUP_CONCAT(DISTINCT storage) FROM product_variants WHERE product_id = p.id) as storages,
            (SELECT GROUP_CONCAT(DISTINCT color_name) FROM product_variants WHERE product_id = p.id) as colors,
            (SELECT id FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as default_variant_id
          FROM deal_of_the_day d
          LEFT JOIN products p ON d.product_id = p.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE d.id = ?
        `).get(dealId);
      }
    }

    if (!deal) {
      return { deal: null };
    }

    const endMs = new Date(deal.end_time).getTime();
    const nowMs = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((endMs - nowMs) / 1000));
    const isExpired = secondsRemaining <= 0;

    return {
      deal: {
        ...deal,
        seconds_remaining: secondsRemaining,
        is_expired: isExpired,
        storages: deal.storages ? deal.storages.split(',') : ['128GB'],
        colors: deal.colors ? deal.colors.split(',') : ['Standard'],
      },
    };
  });

  // 7. Admin Manage Deal of the Day
  fastify.post<{
    Body: {
      product_id: string;
      title?: string;
      deal_price: number;
      regular_price?: number;
      duration_hours?: number;
      stock_total?: number;
      stock_claimed?: number;
      is_sold_out?: number;
      badge_text?: string;
    };
  }>('/api/v1/admin/deals/today', async (request, reply) => {
    const {
      product_id,
      title,
      deal_price,
      regular_price,
      duration_hours = 24,
      stock_total = 5,
      stock_claimed = 0,
      is_sold_out = 0,
      badge_text = 'LIMITED 24H FLASH DEAL',
    } = request.body || {};

    if (!product_id || !deal_price) {
      return reply.status(400).send({ error: 'Product and Deal Price are required' });
    }

    const prod: any = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!prod) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);
    const dealId = `deal-${nanoid(8)}`;
    const finalTitle = title || `⚡ 24-HOUR FLASH DEAL: ${prod.name}`;

    // Deactivate previous active deals
    db.prepare('UPDATE deal_of_the_day SET is_active = 0').run();

    db.prepare(`
      INSERT INTO deal_of_the_day (
        id, product_id, title, deal_price, regular_price, start_time, end_time,
        stock_total, stock_claimed, is_sold_out, is_active, badge_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      dealId,
      product_id,
      finalTitle,
      deal_price,
      regular_price || deal_price + 25000,
      now.toISOString(),
      endTime.toISOString(),
      stock_total,
      stock_claimed,
      is_sold_out,
      badge_text
    );

    return { success: true, dealId };
  });

  // 8. Admin Toggle Sold Out on Deal of the Day
  fastify.post<{ Body: { is_sold_out: number } }>(
    '/api/v1/admin/deals/today/toggle-sold-out',
    async (request) => {
      const { is_sold_out } = request.body || {};
      const activeDeal: any = db.prepare('SELECT id, is_sold_out FROM deal_of_the_day WHERE is_active = 1 LIMIT 1').get();

      if (activeDeal) {
        const newVal = typeof is_sold_out === 'number' ? is_sold_out : (activeDeal.is_sold_out === 1 ? 0 : 1);
        db.prepare('UPDATE deal_of_the_day SET is_sold_out = ? WHERE id = ?').run(newVal, activeDeal.id);
        return { success: true, is_sold_out: newVal };
      }

      return { success: false, error: 'No active deal found' };
    }
  );

  // 9. Admin Reset 24-Hour Timer
  fastify.post('/api/v1/admin/deals/today/reset-timer', async () => {
    const activeDeal: any = db.prepare('SELECT id FROM deal_of_the_day WHERE is_active = 1 LIMIT 1').get();

    if (activeDeal) {
      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      db.prepare(`
        UPDATE deal_of_the_day 
        SET start_time = ?, end_time = ?, is_sold_out = 0
        WHERE id = ?
      `).run(now.toISOString(), endTime.toISOString(), activeDeal.id);

      return { success: true, end_time: endTime.toISOString() };
    }

    return { success: false, error: 'No active deal found' };
  });
}
