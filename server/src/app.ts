import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import connectDB from './config/env.config.js';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/article.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer(): Promise<void> {
  try {
    await connectDB();

    const port = process.env.PORT || '5000';
    app.listen(Number(port), () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
