import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/products
router.get('/', (req, res) => {
  const { category, search, inStock, featured, includeArchived } = req.query;
  let products = db.get('products');

  if (includeArchived !== 'true') {
    products = products.filter((p) => !p.archived);
  }

  if (category) {
    products = products.filter((p) => p.category?.toLowerCase() === String(category).toLowerCase());
  }

  if (inStock !== undefined) {
    products = products.filter((p) => p.inStock === (inStock === 'true'));
  }

  if (featured !== undefined) {
    products = products.filter((p) => p.featured === (featured === 'true'));
  }

  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, products });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.get('products').find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, product });
});

// POST /api/products
router.post('/', (req, res) => {
  const data = req.body;
  if (!data.name || !data.description || !data.prices) {
    return res.status(400).json({ error: 'Name, description, and prices are required' });
  }

  const id = data.id || `poster-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newProduct = {
    ...data,
    id,
    costPrices: data.costPrices || { A3: 60, A4: 50, A5: 40 },
    enabledSizes: data.enabledSizes || { A3: true, A4: true, A5: true },
    images: data.images || (data.image ? [data.image] : []),
    image: data.image || data.images?.[0] || '',
    collectionIds: data.collectionIds || [],
    inStock: data.inStock ?? true,
    featured: data.featured || false,
    isNewArrival: data.isNewArrival || false,
    archived: false,
    hasOrders: false,
    seoTitle: data.seoTitle || data.name,
    seoDescription: data.seoDescription || data.description,
    priceHistory: [],
    createdAt: now,
    updatedAt: now
  };

  db.insert('products', newProduct);

  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'product_created',
    targetId: id,
    targetType: 'product',
    description: `Product "${newProduct.name}" created.`
  });

  res.status(201).json({ success: true, product: newProduct });
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const product = db.get('products').find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Price history tracking
  const priceHistory = product.priceHistory || [];
  if (updates.prices && JSON.stringify(updates.prices) !== JSON.stringify(product.prices)) {
    priceHistory.unshift({
      prices: product.prices,
      changedAt: new Date().toISOString()
    });
    db.logAction({
      adminId: updates.adminId || 'admin',
      action: 'price_changed',
      targetId: id,
      targetType: 'product',
      description: `Price changed for "${product.name}".`
    });
  }

  const updated = db.update('products', id, {
    ...updates,
    priceHistory,
    image: updates.image || updates.images?.[0] || product.image
  });

  db.logAction({
    adminId: updates.adminId || 'admin',
    action: 'product_updated',
    targetId: id,
    targetType: 'product',
    description: `Product "${updated.name}" updated.`
  });

  res.json({ success: true, product: updated });
});

// PATCH /api/products/:id/archive
router.patch('/:id/archive', (req, res) => {
  const { id } = req.params;
  const product = db.get('products').find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const updated = db.update('products', id, { archived: true, inStock: false });
  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'product_archived',
    targetId: id,
    targetType: 'product',
    description: `Product "${product.name}" archived.`
  });

  res.json({ success: true, product: updated });
});

// POST /api/products/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const product = db.get('products').find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const newId = `poster-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const copy = {
    ...product,
    id: newId,
    name: `${product.name} (Copy)`,
    featured: false,
    isNewArrival: false,
    archived: false,
    hasOrders: false,
    priceHistory: [],
    createdAt: now,
    updatedAt: now
  };

  db.insert('products', copy);
  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'product_duplicated',
    targetId: newId,
    targetType: 'product',
    description: `Product "${product.name}" duplicated as "${copy.name}".`
  });

  res.status(201).json({ success: true, product: copy });
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const product = db.get('products').find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.hasOrders) {
    return res.status(400).json({ error: 'Cannot delete product with existing orders. Archive it instead.' });
  }

  db.delete('products', id);
  db.logAction({
    adminId: req.query.adminId || 'admin',
    action: 'product_deleted',
    targetId: id,
    targetType: 'product',
    description: `Product "${product.name}" permanently deleted.`
  });

  res.json({ success: true, message: 'Product deleted' });
});

export default router;
