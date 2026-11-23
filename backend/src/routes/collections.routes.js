import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/collections
router.get('/', (req, res) => {
  const collections = db.get('collections').sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json({ success: true, collections });
});

// GET /api/collections/:id
router.get('/:id', (req, res) => {
  const col = db.get('collections').find((c) => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  // Attach populated product objects
  const allProducts = db.get('products');
  const products = allProducts.filter((p) => col.posterIds?.includes(p.id));

  res.json({ success: true, collection: { ...col, products } });
});

// POST /api/collections
router.post('/', (req, res) => {
  const { name, description, coverImage, posterIds, enabled, featured } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const collections = db.get('collections');
  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newCol = {
    id,
    name,
    description: description || '',
    coverImage: coverImage || '',
    posterIds: posterIds || [],
    enabled: enabled ?? true,
    featured: featured || false,
    displayOrder: collections.length,
    createdAt: now,
    updatedAt: now
  };

  db.insert('collections', newCol);

  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'collection_created',
    targetId: id,
    targetType: 'collection',
    description: `Collection "${newCol.name}" created.`
  });

  res.status(201).json({ success: true, collection: newCol });
});

// PUT /api/collections/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const col = db.get('collections').find((c) => c.id === id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  const updated = db.update('collections', id, req.body);
  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'collection_updated',
    targetId: id,
    targetType: 'collection',
    description: `Collection "${updated.name}" updated.`
  });

  res.json({ success: true, collection: updated });
});

// PATCH /api/collections/reorder
router.patch('/reorder', (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds array required' });

  const collections = db.get('collections').map((c) => ({
    ...c,
    displayOrder: orderedIds.indexOf(c.id)
  }));

  db.set('collections', collections);
  res.json({ success: true, collections });
});

// DELETE /api/collections/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const col = db.get('collections').find((c) => c.id === id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  db.delete('collections', id);
  db.logAction({
    adminId: req.query.adminId || 'admin',
    action: 'collection_deleted',
    targetId: id,
    targetType: 'collection',
    description: `Collection "${col.name}" deleted.`
  });

  res.json({ success: true, message: 'Collection deleted' });
});

export default router;
