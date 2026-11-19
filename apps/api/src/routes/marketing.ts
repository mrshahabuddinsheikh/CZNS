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
}
