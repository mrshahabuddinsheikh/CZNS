/**
 * CZNS Mobile Store - cPanel / LiteSpeed Passenger / VPS Entry Point
 * Starts the Fastify API and serves the production Next.js application
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 5000;

console.log('Starting CZNS Pakistani Mobile Store Platform...');
console.log(`Port configured: ${PORT}, API Port: ${API_PORT}`);

// 1. Launch Fastify API
const apiProcess = spawn('node', ['apps/api/dist/server.js'], {
  env: { ...process.env, PORT: API_PORT.toString() },
  stdio: 'inherit',
});

// 2. Launch Next.js Web Frontend
const webProcess = spawn('npx', ['next', 'start', 'apps/web', '-p', PORT.toString()], {
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: `http://localhost:${API_PORT}`,
  },
  stdio: 'inherit',
});

process.on('SIGTERM', () => {
  apiProcess.kill();
  webProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  apiProcess.kill();
  webProcess.kill();
  process.exit(0);
});
