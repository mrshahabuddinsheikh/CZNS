import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from '../utils/id.js';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'czns-super-secret-key-pakistan-mobile-2026';

export async function adminRoutes(fastify: FastifyInstance) {
  // Admin Auth Middleware Helper
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Unauthorized admin access. Token missing.' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      (request as any).admin = decoded;
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized admin access. Invalid or expired token.' });
    }
  };

  // 1. Admin Login
  fastify.post<{ Body: { email: string; password: string } }>(
    '/api/v1/admin/login',
    async (request, reply) => {
      const { email, password } = request.body || {};

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
      }

      const admin: any = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.trim().toLowerCase());
      if (!admin) {
        return reply.status(401).send({ error: 'Invalid admin credentials' });
      }

      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid admin credentials' });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      };
    }
  );

  // Verify current admin token
  fastify.get(
    '/api/v1/admin/me',
    { preHandler: [requireAdmin] },
    async (request: any) => {
      return { admin: request.admin };
    }
  );

  // 2. Admin Dashboard Stats
  fastify.get(
    '/api/v1/admin/dashboard',
    { preHandler: [requireAdmin] },
    async () => {
      const revenueRow: any = db.prepare(`
        SELECT SUM(total) as total_revenue, COUNT(*) as total_orders
        FROM orders
        WHERE order_status != 'cancelled'
      `).get();

      const pendingCod: any = db.prepare(`
        SELECT COUNT(*) as count FROM orders
        WHERE payment_method = 'cod' AND order_status = 'pending_confirmation'
      `).get();

      const pendingTid: any = db.prepare(`
        SELECT COUNT(*) as count FROM orders
        WHERE payment_status = 'unverified_pending' AND payment_method != 'cod'
      `).get();

      const lowStockVariants: any[] = db.prepare(`
        SELECT v.*, p.name as product_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        WHERE v.stock <= 3
        ORDER BY v.stock ASC
        LIMIT 10
      `).all();

      const cityStats: any[] = db.prepare(`
        SELECT city, COUNT(*) as count, SUM(total) as revenue
        FROM orders
        GROUP BY city
        ORDER BY count DESC
        LIMIT 6
      `).all();

      const topSelling: any[] = db.prepare(`
        SELECT 
          oi.product_name,
          SUM(oi.quantity) as sold_qty,
          SUM(oi.price * oi.quantity) as total_amount
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.order_status != 'cancelled'
        GROUP BY oi.product_name
        ORDER BY sold_qty DESC
        LIMIT 5
      `).all();

      const recentOrders: any[] = db.prepare(`
        SELECT * FROM orders
        ORDER BY created_at DESC
        LIMIT 6
      `).all();

      return {
        stats: {
          totalRevenue: revenueRow?.total_revenue || 0,
          totalOrders: revenueRow?.total_orders || 0,
          pendingCodConfirmations: pendingCod?.count || 0,
          pendingTidVerifications: pendingTid?.count || 0,
          lowStockCount: lowStockVariants.length,
        },
        lowStockVariants,
        cityStats,
        topSelling,
        recentOrders,
      };
    }
  );

  // 3. Admin Orders List with Desks
  fastify.get<{
    Querystring: { status?: string; desk?: string; search?: string; limit?: string; offset?: string };
  }>(
    '/api/v1/admin/orders',
    { preHandler: [requireAdmin] },
    async (request) => {
      const { status, desk, search, limit = '50', offset = '0' } = request.query;

      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      if (desk === 'confirm_cod') {
        conditions.push("payment_method = 'cod' AND order_status = 'pending_confirmation'");
      } else if (desk === 'verify_tid') {
        conditions.push("payment_status = 'unverified_pending' AND payment_method != 'cod'");
      } else if (desk === 'pack_ship') {
        conditions.push("order_status IN ('confirmed', 'packed')");
      }

      if (status && status !== 'all') {
        conditions.push('order_status = ?');
        params.push(status);
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR tid LIKE ? OR city LIKE ?)');
        params.push(term, term, term, term, term);
      }

      const where = conditions.join(' AND ');

      const orders: any[] = db.prepare(`
        SELECT * FROM orders
        WHERE ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, parseInt(limit, 10), parseInt(offset, 10));

      const formattedOrders = orders.map(ord => {
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
        return { ...ord, items };
      });

      return { orders: formattedOrders };
    }
  );

  // 4. Update Order Status
  fastify.put<{
    Params: { id: string };
    Body: { status: string; notes?: string };
  }>(
    '/api/v1/admin/orders/:id/status',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const { status, notes } = request.body || {};

      const allowed = ['pending_confirmation', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) {
        return reply.status(400).send({ error: 'Invalid order status' });
      }

      db.prepare(`
        UPDATE orders
        SET order_status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, notes || null, id);

      return { success: true };
    }
  );

  // 5. Verify / Reject Manual Payment TID
  fastify.put<{
    Params: { id: string };
    Body: { action: 'approve' | 'reject'; notes?: string };
  }>(
    '/api/v1/admin/orders/:id/verify-payment',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const { action, notes } = request.body || {};

      if (action === 'approve') {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'verified', order_status = 'confirmed',
              admin_notes = COALESCE(?, 'Payment TID verified in banking app.')
          WHERE id = ?
        `).run(notes || null, id);
      } else {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'failed', order_status = 'cancelled',
              admin_notes = COALESCE(?, 'Fake or unverified TID rejected by accounts desk.')
          WHERE id = ?
        `).run(notes || null, id);
      }

      return { success: true, action };
    }
  );

  // 6. Courier Dispatch & Tracking Update
  fastify.put<{
    Params: { id: string };
    Body: { courier_name: string; tracking_number: string };
  }>(
    '/api/v1/admin/orders/:id/dispatch',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const { courier_name, tracking_number } = request.body || {};

      if (!courier_name || !tracking_number) {
        return reply.status(400).send({ error: 'Courier name and tracking number are required' });
      }

      db.prepare(`
        UPDATE orders
        SET courier_name = ?, tracking_number = ?, order_status = 'shipped', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(courier_name, tracking_number.trim(), id);

      const order: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

      const waMsg = encodeURIComponent(
        `Salam ${order.customer_name}! Your CZNS order #${order.order_number} has been dispatched via ${courier_name}.\nTracking Number: ${tracking_number}\nTrack online to monitor your phone delivery.`
      );
      const trackingWaUrl = `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;

      return {
        success: true,
        courier_name,
        tracking_number,
        whatsapp_tracking_url: trackingWaUrl,
      };
    }
  );

  // 7. Admin Products Management
  fastify.get(
    '/api/v1/admin/products',
    { preHandler: [requireAdmin] },
    async () => {
      const products: any[] = db.prepare(`
        SELECT 
          p.*,
          b.name as brand_name,
          (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
          (SELECT SUM(stock) FROM product_variants WHERE product_id = p.id) as total_stock,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        ORDER BY p.created_at DESC
      `).all();

      const formatted = products.map(p => {
        const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id);
        return {
          ...p,
          specs: p.specs_json ? JSON.parse(p.specs_json) : {},
          variants,
        };
      });

      return { products: formatted };
    }
  );

  // 8. Add Product
  fastify.post<{
    Body: {
      name: string;
      slug: string;
      brand_id: string;
      is_used: number;
      condition_grade: string;
      pta_status: string;
      battery_health: number;
      warranty_type: string;
      description: string;
      specs: Record<string, string>;
      thumbnail: string;
      featured?: number;
      variants: Array<{
        storage: string;
        color_name: string;
        color_hex: string;
        image_url: string;
        images?: string[];
        price: number;
        regular_price?: number;
        stock: number;
        imei_serial?: string;
      }>;
    };
  }>(
    '/api/v1/admin/products',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const b = request.body;
      if (!b.name || !b.slug || !b.brand_id || !b.variants || b.variants.length === 0) {
        return reply.status(400).send({ error: 'Name, slug, brand, and at least 1 variant are required' });
      }

      const prodId = `prod-${nanoid(8)}`;

      db.prepare(`
        INSERT INTO products (
          id, name, slug, brand_id, is_used, condition_grade, pta_status, battery_health,
          warranty_type, description, specs_json, thumbnail, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        prodId,
        b.name,
        b.slug,
        b.brand_id,
        b.is_used,
        b.condition_grade,
        b.pta_status,
        b.battery_health,
        b.warranty_type,
        b.description,
        JSON.stringify(b.specs || {}),
        b.thumbnail,
        b.featured || 0
      );

      for (const v of b.variants) {
        db.prepare(`
          INSERT INTO product_variants (
            id, product_id, storage, color_name, color_hex, image_url, images_json,
            price, regular_price, stock, imei_serial
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `var-${nanoid(8)}`,
          prodId,
          v.storage,
          v.color_name,
          v.color_hex,
          v.image_url,
          JSON.stringify(v.images || [v.image_url]),
          v.price,
          v.regular_price || null,
          v.stock,
          v.imei_serial || null
        );
      }

      return { success: true, productId: prodId };
    }
  );

  // 9. Update Product
  fastify.put<{
    Params: { id: string };
    Body: any;
  }>(
    '/api/v1/admin/products/:id',
    { preHandler: [requireAdmin] },
    async (request) => {
      const { id } = request.params;
      const b = request.body as any;


      db.prepare(`
        UPDATE products
        SET name = ?, brand_id = ?, is_used = ?, condition_grade = ?, pta_status = ?,
            battery_health = ?, warranty_type = ?, description = ?, thumbnail = ?, featured = ?,
            specs_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        b.name,
        b.brand_id,
        b.is_used,
        b.condition_grade,
        b.pta_status,
        b.battery_health,
        b.warranty_type,
        b.description,
        b.thumbnail,
        b.featured || 0,
        JSON.stringify(b.specs || {}),
        id
      );

      if (b.variants && Array.isArray(b.variants)) {
        db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
        for (const v of b.variants) {
          db.prepare(`
            INSERT INTO product_variants (
              id, product_id, storage, color_name, color_hex, image_url, images_json,
              price, regular_price, stock, imei_serial
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            v.id || `var-${nanoid(8)}`,
            id,
            v.storage,
            v.color_name,
            v.color_hex,
            v.image_url,
            JSON.stringify(v.images || [v.image_url]),
            v.price,
            v.regular_price || null,
            v.stock,
            v.imei_serial || null
          );
        }
      }

      return { success: true };
    }
  );

  // 10. Delete Product
  fastify.delete<{ Params: { id: string } }>(
    '/api/v1/admin/products/:id',
    { preHandler: [requireAdmin] },
    async (request) => {
      const { id } = request.params;
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return { success: true };
    }
  );

  // 11. Admin Settings: Get & Update
  fastify.get(
    '/api/v1/admin/settings',
    { preHandler: [requireAdmin] },
    async () => {
      const rows: any[] = db.prepare('SELECT key, value FROM settings').all();
      const settings: Record<string, string> = {};
      for (const r of rows) {
        settings[r.key] = r.value;
      }
      return { settings };
    }
  );

  fastify.put<{ Body: Record<string, any> }>(
    '/api/v1/admin/settings',
    { preHandler: [requireAdmin] },
    async (request) => {
      const body = request.body || {};
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

      for (const [key, val] of Object.entries(body)) {
        stmt.run(key, String(val));
      }

      return { success: true, message: 'Settings updated successfully' };
    }
  );

  // 12. Admin Marketing Hub
  fastify.get(
    '/api/v1/admin/marketing',
    { preHandler: [requireAdmin] },
    async () => {
      const reels = db.prepare('SELECT * FROM reels ORDER BY created_at DESC').all();
      const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
      const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();

      return { reels, coupons, leads };
    }
  );

  // Create Reel
  fastify.post<{
    Body: { title: string; video_url: string; thumbnail_url: string; product_id?: string };
  }>(
    '/api/v1/admin/reels',
    { preHandler: [requireAdmin] },
    async (request) => {
      const { title, video_url, thumbnail_url, product_id } = request.body;
      const id = `reel-${nanoid(8)}`;
      db.prepare(`
        INSERT INTO reels (id, title, video_url, thumbnail_url, product_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, title, video_url, thumbnail_url, product_id || null);
      return { success: true, id };
    }
  );

  // Create Coupon
  fastify.post<{
    Body: { code: string; discount_type: string; discount_value: number; min_spend?: number; max_discount?: number };
  }>(
    '/api/v1/admin/coupons',
    { preHandler: [requireAdmin] },
    async (request) => {
      const { code, discount_type, discount_value, min_spend = 0, max_discount } = request.body;
      const id = `c-${nanoid(8)}`;
      db.prepare(`
        INSERT INTO coupons (id, code, discount_type, discount_value, min_spend, max_discount, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(id, code.toUpperCase().trim(), discount_type, discount_value, min_spend, max_discount || null);
      return { success: true, id };
    }
  );

  // 13. Database 1-Click Backup Export
  fastify.get(
    '/api/v1/admin/backup',
    { preHandler: [requireAdmin] },
    async (_req, reply) => {
      const dataDir = path.resolve(process.cwd(), 'data');
      const dbPath = path.join(dataDir, 'czns.sqlite');

      if (!fs.existsSync(dbPath)) {
        return reply.status(404).send({ error: 'Database file not found' });
      }

      const backupBuffer = fs.readFileSync(dbPath);
      reply.header('Content-Disposition', `attachment; filename="czns-backup-${new Date().toISOString().slice(0, 10)}.sqlite"`);
      reply.header('Content-Type', 'application/octet-stream');
      return reply.send(backupBuffer);
    }
  );
}
