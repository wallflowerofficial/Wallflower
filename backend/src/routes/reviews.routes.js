import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/reviews
router.get('/', (req, res) => {
  const { status, posterId } = req.query;
  let reviews = db.get('reviews');

  if (status && status !== 'all') {
    reviews = reviews.filter((r) => r.status === status);
  }
  if (posterId) {
    reviews = reviews.filter((r) => r.posterId === posterId);
  }

  res.json({ success: true, reviews });
});

// POST /api/reviews
router.post('/', (req, res) => {
  const { posterId, posterName, userId, customerName, rating, comment, photos } = req.body;
  if (!posterId || !customerName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newReview = {
    id,
    posterId,
    posterName: posterName || 'Poster Print',
    userId: userId || 'anonymous',
    customerName,
    rating: Number(rating),
    comment,
    photos: photos || [],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.insert('reviews', newReview);
  res.status(201).json({ success: true, review: newReview });
});

// PATCH /api/reviews/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const review = db.get('reviews').find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const updated = db.update('reviews', req.params.id, { status });
  db.logAction({
    adminId: req.body.adminId || 'admin',
    action: `review_${status}`,
    targetId: req.params.id,
    targetType: 'review',
    description: `Review for "${review.posterName}" by ${review.customerName} set to ${status}.`
  });

  res.json({ success: true, review: updated });
});

export default router;
