import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/discounts
router.get('/', (req, res) => {
  const discounts = db.get('discounts').sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, discounts });
});

// POST /api/discounts
router.post('/', (req, res) => {
  const { code, type, value, scope, minOrderValue, maxDiscountAmount, usageLimit, expiresAt } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'Code, type, and value are required' });
  }

  const existing = db.get('discounts').find((d) => d.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    return res.status(400).json({ error: 'A discount code with this name already exists' });
  }

  const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newDiscount = {
    id,
    code: code.toUpperCase().trim(),
    type,
    value: Number(value),
    scope: scope || 'global',
    minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    usedCount: 0,
    revenueGenerated: 0,
    isActive: true,
    expiresAt: expiresAt || null,
    createdAt: now,
    updatedAt: now
  };

  db.insert('discounts', newDiscount);

  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: 'discount_created',
    targetId: id,
    targetType: 'discount',
    description: `Discount code "${newDiscount.code}" created.`
  });

  res.status(201).json({ success: true, discount: newDiscount });
});

// PUT /api/discounts/:id
router.put('/:id', (req, res) => {
  const discount = db.get('discounts').find((d) => d.id === req.params.id);
  if (!discount) return res.status(404).json({ error: 'Discount not found' });

  const updated = db.update('discounts', req.params.id, req.body);
  res.json({ success: true, discount: updated });
});

// PATCH /api/discounts/:id/toggle
router.patch('/:id/toggle', (req, res) => {
  const discount = db.get('discounts').find((d) => d.id === req.params.id);
  if (!discount) return res.status(404).json({ error: 'Discount not found' });

  const updated = db.update('discounts', req.params.id, { isActive: !discount.isActive });
  res.json({ success: true, discount: updated });
});

// DELETE /api/discounts/:id
router.delete('/:id', (req, res) => {
  const discount = db.get('discounts').find((d) => d.id === req.params.id);
  if (!discount) return res.status(404).json({ error: 'Discount not found' });

  db.delete('discounts', req.params.id);
  res.json({ success: true, message: 'Discount deleted' });
});

export default router;
