import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import productsRoutes from './routes/products.routes.js';
import collectionsRoutes from './routes/collections.routes.js';
import customersRoutes from './routes/customers.routes.js';
import discountsRoutes from './routes/discounts.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/discounts', discountsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Wallflower API Backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Wallflower Backend] API Server listening on port ${PORT}`);
  console.log(`[Wallflower Backend] Health: http://localhost:${PORT}/api/health`);
});
