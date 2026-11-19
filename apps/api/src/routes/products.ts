import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';

interface ProductQuery {
  mode?: 'all' | 'new' | 'used';
  brand?: string;
  condition?: string;
  pta?: string;
  battery?: string;
  storage?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
  min_price?: string;
  max_price?: string;
  limit?: string;
  offset?: string;
}

export async function productRoutes(fastify: FastifyInstance) {
  // 1. Get all products with filters
  fastify.get<{ Querystring: ProductQuery }>(
    '/api/v1/products',
    async (request) => {
      const {
        mode,
        brand,
        condition,
        pta,
        battery,
        storage,
        search,
        sort = 'popular',
        min_price,
        max_price,
        limit = '24',
        offset = '0',
      } = request.query;

      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      // Filter New vs Used
      if (mode === 'new') {
        conditions.push('p.is_used = 0');
      } else if (mode === 'used') {
        conditions.push('p.is_used = 1');
      }

      // Filter Brand
      if (brand && brand !== 'all') {
        conditions.push('(b.slug = ? OR b.id = ?)');
        params.push(brand, brand);
      }

      // Filter Condition Grade
      if (condition && condition !== 'all') {
        conditions.push('p.condition_grade LIKE ?');
        params.push(`%${condition}%`);
      }

      // Filter PTA Status
      if (pta && pta !== 'all') {
        conditions.push('p.pta_status = ?');
        params.push(pta);
      }

      // Filter Battery Health (e.g. 90+)
      if (battery && battery !== 'all') {
        const batVal = parseInt(battery, 10);
        if (!isNaN(batVal)) {
          conditions.push('p.battery_health >= ?');
          params.push(batVal);
        }
      }

      // Filter Storage
      if (storage && storage !== 'all') {
        conditions.push(`p.id IN (SELECT product_id FROM product_variants WHERE storage = ?)`);
        params.push(storage);
      }

      // Search Query
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push('(p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)');
        params.push(term, term, term);
      }

      // Price range filters
      if (min_price) {
        const minP = parseInt(min_price, 10);
        if (!isNaN(minP)) {
          conditions.push(`p.id IN (SELECT product_id FROM product_variants WHERE price >= ?)`);
          params.push(minP);
        }
      }
      if (max_price) {
        const maxP = parseInt(max_price, 10);
        if (!isNaN(maxP)) {
          conditions.push(`p.id IN (SELECT product_id FROM product_variants WHERE price <= ?)`);
          params.push(maxP);
        }
      }

      // Sorting
      let orderBy = 'p.featured DESC, p.created_at DESC';
      if (sort === 'price_asc') {
        orderBy = 'min_price ASC';
      } else if (sort === 'price_desc') {
        orderBy = 'min_price DESC';
      } else if (sort === 'newest') {
        orderBy = 'p.created_at DESC';
      } else if (sort === 'popular') {
        orderBy = 'p.review_count DESC, p.rating DESC';
      }

      const whereClause = conditions.join(' AND ');

      const countSql = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE ${whereClause}
      `;
      const totalResult: any = db.prepare(countSql).get(...params);
      const total = totalResult?.total || 0;

      const listSql = `
        SELECT 
          p.*,
          b.name as brand_name,
          b.slug as brand_slug,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
          (SELECT MAX(price) FROM product_variants WHERE product_id = p.id) as max_price,
          (SELECT regular_price FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as regular_price,
          (SELECT GROUP_CONCAT(DISTINCT storage) FROM product_variants WHERE product_id = p.id) as storages,
          (SELECT GROUP_CONCAT(DISTINCT color_name) FROM product_variants WHERE product_id = p.id) as colors,
          (SELECT GROUP_CONCAT(DISTINCT color_hex) FROM product_variants WHERE product_id = p.id) as color_hexes,
          (SELECT SUM(stock) FROM product_variants WHERE product_id = p.id) as total_stock
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const products: any[] = db.prepare(listSql).all(...params, parseInt(limit, 10), parseInt(offset, 10));

      const formatted = products.map((prod: any) => ({
        ...prod,
        specs: prod.specs_json ? JSON.parse(prod.specs_json) : null,
        storages: prod.storages ? prod.storages.split(',') : [],
        colors: prod.colors ? prod.colors.split(',') : [],
        color_hexes: prod.color_hexes ? prod.color_hexes.split(',') : [],
      }));

      return {
        total,
        products: formatted,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      };
    }
  );

  // 2. Get Single Product by Slug
  fastify.get<{ Params: { slug: string } }>(
    '/api/v1/products/:slug',
    async (request, reply) => {
      const { slug } = request.params;

      const productSql = `
        SELECT 
          p.*,
          b.name as brand_name,
          b.slug as brand_slug,
          b.logo_url as brand_logo
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = ? OR p.id = ?
      `;
      const product: any = db.prepare(productSql).get(slug, slug);

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      const variants: any[] = db.prepare(`
        SELECT * FROM product_variants
        WHERE product_id = ?
        ORDER BY price ASC
      `).all(product.id);

      const formattedVariants = variants.map((v: any) => ({
        ...v,
        images: v.images_json ? JSON.parse(v.images_json) : [v.image_url],
      }));

      const reviews: any[] = db.prepare(`
        SELECT * FROM reviews
        WHERE product_id = ?
        ORDER BY created_at DESC
      `).all(product.id);

      const formattedReviews = reviews.map((r: any) => ({
        ...r,
        photos: r.photos_json ? JSON.parse(r.photos_json) : [],
      }));

      const related: any[] = db.prepare(`
        SELECT 
          p.*,
          b.name as brand_name,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
          (SELECT MAX(price) FROM product_variants WHERE product_id = p.id) as max_price
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE (p.brand_id = ? OR p.is_used = ?) AND p.id != ?
        LIMIT 4
      `).all(product.brand_id, product.is_used, product.id);

      return {
        product: {
          ...product,
          specs: product.specs_json ? JSON.parse(product.specs_json) : {},
          variants: formattedVariants,
          reviews: formattedReviews,
        },
        related,
      };
    }
  );

  // 3. Get Brands with phone counts
  fastify.get('/api/v1/brands', async () => {
    const brands: any[] = db.prepare(`
      SELECT 
        b.*,
        COUNT(p.id) as total_products,
        SUM(CASE WHEN p.is_used = 0 THEN 1 ELSE 0 END) as new_products_count,
        SUM(CASE WHEN p.is_used = 1 THEN 1 ELSE 0 END) as used_products_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id
      GROUP BY b.id
      ORDER BY total_products DESC, b.name ASC
    `).all();

    return { brands };
  });

  // 4. Instant search suggestions & pills
  fastify.get<{ Querystring: { q?: string } }>(
    '/api/v1/search/suggestions',
    async (request) => {
      const { q } = request.query;
      if (!q || q.trim().length === 0) {
        return {
          popularQueries: ['iPhone 15 Pro Max', 'Samsung S24 Ultra', 'iPhone 13 Non-PTA', 'Pixel 8 Pro', 'Infinix Note 40'],
          suggestions: [],
        };
      }

      const term = `%${q.trim()}%`;
      const suggestions: any[] = db.prepare(`
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.is_used,
          p.condition_grade,
          p.pta_status,
          p.thumbnail,
          b.name as brand_name,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as price
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.name LIKE ? OR b.name LIKE ?
        LIMIT 6
      `).all(term, term);

      return { suggestions };
    }
  );
}
