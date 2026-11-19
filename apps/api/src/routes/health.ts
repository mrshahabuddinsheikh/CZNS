import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/health', async () => {
    let dbStatus = 'ok';
    try {
      db.prepare('SELECT 1').get();
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    return {
      status: 'healthy',
      service: 'CZNS Mobile Store API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      memoryUsage: process.memoryUsage(),
    };
  });
}
