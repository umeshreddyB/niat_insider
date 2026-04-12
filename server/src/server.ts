import { connectDB, env, parseCorsOrigin } from './config/env.config.js';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import articleRoutes from './routes/article.routes.js';
import authRoutes from './routes/auth.routes.js';
import { HttpStatus } from './types/auth.types.js';

const app = express();

app.use(
  cors({
    origin: parseCorsOrigin(env.corsOrigin),
  }),
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
});

async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
