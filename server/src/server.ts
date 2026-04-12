import { connectDB, env, parseCorsOrigin } from './config/env.config.js';
import { ensureCampusesSeeded } from './services/campus.service.js';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.routes.js';
import articleRoutes from './routes/article.routes.js';
import authRoutes from './routes/auth.routes.js';
import metaRoutes from './routes/meta.routes.js';
import { HttpStatus } from './types/auth.types.js';

const app = express();

app.use(
  cors({
    origin: parseCorsOrigin(env.corsOrigin),
  }),
);
app.use(express.json());

/** Uptime / Render health checks — no DB call */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: 'niat-insider-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
});

async function startServer(): Promise<void> {
  try {
    await connectDB();
    await ensureCampusesSeeded();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
