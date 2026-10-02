// server.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './server/config/index.js';
import { db } from './server/db/index.js';
import { apiRouter } from './server/routes/api.js';
import { errorHandler } from './server/middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic security and request parsing
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // CORS headers for API security
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Request logging with execution timing
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.url.startsWith('/api') || req.url === '/health') {
        console.log(`[HTTP] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // Production Health Check endpoint (GET /health)
  app.get('/health', (req, res) => {
    const models = db.getModelVersions();
    res.json({
      status: 'UP',
      application: 'AgriWise AI-Powered Decision Support System',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: 'CONNECTED',
      activeModelsCount: models.length,
      environment: config.nodeEnv,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  // Initialize Relational Database
  await db.init();
  console.log('[AgriWise DB] Relational store initialized and seeded.');

  // When running inside Vercel, we don't start the listener or Vite
  if (!process.env.VERCEL) {
    if (config.isProduction) {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // In dev: mount Vite dev middleware
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`[AgriWise Engine] Running at http://localhost:${config.port}`);
      console.log(`[AgriWise Engine] Environment: ${config.nodeEnv}`);
    });
  }

  return app;
}

// Global instance for Serverless execution
let appPromise: Promise<express.Express> | null = null;

// Export for Vercel Serverless Functions
export default async function (req: any, res: any) {
  if (!appPromise) {
    appPromise = startServer();
  }
  const app = await appPromise;
  return app(req, res);
}

// Start locally if not in Vercel
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('[AgriWise] Failed to start server:', err);
    process.exit(1);
  });
}
