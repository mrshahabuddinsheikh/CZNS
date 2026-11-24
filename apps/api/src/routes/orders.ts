import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { nanoid } from '../utils/id.js';

interface CreateOrderBody {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address: string;
  province: string;
  city: string;
  payment_method: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card' | 'safepay';
  sender_mobile?: string;
  tid?: string;
  coupon_code?: string;
  items: Array<{
    variant_id: string;
    quantity: number;
  }>;
  notes?: string;
}

export async function orderRoutes(fastify: FastifyInstance) {
  // 1. Validate Coupon
  fastify.post<{ Body: { code: string; cart_total: number } }>(
    '/api/v1/coupons/validate',
    async (request, reply) => {
      const { code, cart_total } = request.body || {};
      if (!code) {
        return reply.status(400).send({ error: 'Promo code is required' });
      }

      const coupon: any = db.prepare(`
        SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
      `).get(code.trim());

      if (!coupon) {
        return reply.status(404).send({ error: 'Invalid or expired coupon code' });
      }

      if (coupon.min_spend && cart_total < coupon.min_spend) {
        return reply.status(400).send({
          error: `Minimum order amount of Rs. ${coupon.min_spend.toLocaleString()} required for this coupon`,
        });
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = Math.floor((cart_total * coupon.discount_value) / 100);
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = coupon.discount_value;
      }

      return {
        valid: true,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        calculated_discount: discount,
        message: `Coupon applied: Rs. ${discount.toLocaleString()} OFF!`,
      };
    }
  );

  // 2. Create Order
  fastify.post<{ Body: CreateOrderBody }>(
    '/api/v1/orders',
    async (request, reply) => {
      const body = request.body;

      if (!body.customer_name || !body.customer_phone || !body.address || !body.city || !body.province) {
        return reply.status(400).send({ error: 'All shipping details (Name, WhatsApp, Address, City, Province) are required' });
      }

      if (!body.items || body.items.length === 0) {
        return reply.status(400).send({ error: 'Your cart is empty' });
      }

      const settingRow: any = db.prepare("SELECT value FROM settings WHERE key = 'karachi_only_cod'").get();
      const karachiOnlyCod = settingRow?.value === '1';

      const normalizedCity = body.city.trim().toLowerCase();
      const isKarachi = normalizedCity === 'karachi';

      if (karachiOnlyCod && body.payment_method === 'cod' && !isKarachi) {
        return reply.status(400).send({
          error: 'Cash on Delivery (COD) is available in Karachi only. Orders from other cities require online payment in advance.',
        });
      }

      let deliveryFee = 0;
      if (body.payment_method === 'cod') {
        if (isKarachi) {
          const feeRow: any = db.prepare("SELECT value FROM settings WHERE key = 'cod_karachi_fee'").get();
          deliveryFee = parseInt(feeRow?.value || '250', 10);
        } else {
          const feeRow: any = db.prepare("SELECT value FROM settings WHERE key = 'cod_nationwide_fee'").get();
          deliveryFee = parseInt(feeRow?.value || '450', 10);
        }
      } else {
        const feeRow: any = db.prepare("SELECT value FROM settings WHERE key = 'online_advance_delivery_fee'").get();
        deliveryFee = parseInt(feeRow?.value || '0', 10);
      }

      let subtotal = 0;
      const itemsToInsert: any[] = [];

      for (const item of body.items) {
        const variant: any = db.prepare(`
          SELECT v.*, p.name as product_name
          FROM product_variants v
          JOIN products p ON v.product_id = p.id
          WHERE v.id = ?
        `).get(item.variant_id);

        if (!variant) {
          return reply.status(400).send({ error: `Variant ${item.variant_id} not found` });
        }

        if (variant.stock < item.quantity) {
          return reply.status(400).send({
            error: `Insufficient stock for ${variant.product_name} (${variant.storage} - ${variant.color_name}). Available: ${variant.stock}`,
          });
        }

        const itemTotal = variant.price * item.quantity;
        subtotal += itemTotal;

        itemsToInsert.push({
          variant_id: variant.id,
          product_id: variant.product_id,
          product_name: variant.product_name,
          storage: variant.storage,
          color: variant.color_name,
          price: variant.price,
          quantity: item.quantity,
          imei_serial: variant.imei_serial,
        });
      }

      let discount = 0;
      let validCouponCode: string | null = null;
      if (body.coupon_code) {
        const coupon: any = db.prepare(`
          SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
        `).get(body.coupon_code.trim());

        if (coupon && (!coupon.min_spend || subtotal >= coupon.min_spend)) {
          validCouponCode = coupon.code;
          if (coupon.discount_type === 'percentage') {
            discount = Math.floor((subtotal * coupon.discount_value) / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
              discount = coupon.max_discount;
            }
          } else {
            discount = coupon.discount_value;
          }

          db.prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?').run(coupon.id);
        }
      }

      const total = Math.max(0, subtotal - discount + deliveryFee);

      let paymentStatus = 'unverified_pending';
      let orderStatus = 'pending_confirmation';

      if (body.payment_method === 'card' || body.payment_method === 'safepay') {
        paymentStatus = 'verified';
        orderStatus = 'confirmed';
      }

      const orderId = `ord-${nanoid(8)}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `CZNS-2026-${randomNum}`;

      const defaultCourier = isKarachi ? 'Self Delivery Karachi' : 'TCS';

      db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_name, customer_phone, customer_email, address,
          province, city, delivery_fee, subtotal, discount, coupon_code, total,
          payment_method, payment_status, order_status, sender_mobile, tid,
          courier_name, admin_notes
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `).run(
        orderId,
        orderNumber,
        body.customer_name,
        body.customer_phone,
        body.customer_email || null,
        body.address,
        body.province,
        body.city,
        deliveryFee,
        subtotal,
        discount,
        validCouponCode,
        total,
        body.payment_method,
        paymentStatus,
        orderStatus,
        body.sender_mobile || null,
        body.tid || null,
        defaultCourier,
        body.notes || (body.tid ? `Manual TID provided: ${body.tid}. Requires banking app verification before dispatch.` : null)
      );

      for (const item of itemsToInsert) {
        db.prepare(`
          INSERT INTO order_items (
            id, order_id, product_id, variant_id, product_name, storage, color, price, quantity, imei_serial
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `oi-${nanoid(8)}`,
          orderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.storage,
          item.color,
          item.price,
          item.quantity,
          item.imei_serial || null
        );

        db.prepare(`
          UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?
        `).run(item.quantity, item.variant_id);
      }

      const waStoreNum: any = db.prepare("SELECT value FROM settings WHERE key = 'whatsapp_support_number'").get();
      const phoneNo = waStoreNum?.value || '923001234567';
      const waText = encodeURIComponent(
        `Salam CZNS! I have placed order #${orderNumber} for Rs. ${total.toLocaleString()}.\nCustomer: ${body.customer_name}\nCity: ${body.city}\nPayment: ${body.payment_method.toUpperCase()}${body.tid ? `\nTID: ${body.tid}` : ''}\nPlease confirm my dispatch.`
      );
      const whatsappUrl = `https://wa.me/${phoneNo}?text=${waText}`;

      return {
        success: true,
        order: {
          id: orderId,
          order_number: orderNumber,
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          total,
          payment_method: body.payment_method,
          payment_status: paymentStatus,
          order_status: orderStatus,
          tid: body.tid,
          whatsapp_confirmation_url: whatsappUrl,
        },
      };
    }
  );

  // 3. Track Order
  fastify.get<{ Params: { identifier: string } }>(
    '/api/v1/orders/:identifier',
    async (request, reply) => {
      const { identifier } = request.params;

      const order: any = db.prepare(`
        SELECT * FROM orders
        WHERE order_number = ? OR id = ? OR customer_phone = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(identifier, identifier, identifier);

      if (!order) {
        return reply.status(404).send({ error: 'Order not found' });
      }

      const items = db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(order.id);

      return {
        order: {
          ...order,
          items,
        },
      };
    }
  );
}
