import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { initSchema } from './db/schema.js';
import { healthRoutes } from './routes/health.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { settingsRoutes } from './routes/settings.js';
import { marketingRoutes } from './routes/marketing.js';
import { adminRoutes } from './routes/admin.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Initialize DB schema on launch
initSchema();

// Register CORS
await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register Rate Limiting
await fastify.register(rateLimit, {
  max: 500,
  timeWindow: '1 minute',
});

// Register All Route Modules
await fastify.register(healthRoutes);
await fastify.register(productRoutes);
await fastify.register(orderRoutes);
await fastify.register(settingsRoutes);
await fastify.register(marketingRoutes);
await fastify.register(adminRoutes);

// Server Listen
const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port, host });
  console.log(`🚀 CZNS Mobile Store API running at http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

export default fastify;
