import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import { initDb } from './db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import healthRoutes from './routes/health.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await initDb();
  app.listen(config.port, () => {
    console.log(`Lumina BE running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend:', error);
  process.exit(1);
});
