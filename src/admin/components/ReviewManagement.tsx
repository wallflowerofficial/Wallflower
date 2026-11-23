import React, { useState, useEffect } from 'react';
import { CheckCircle2, EyeOff, Star } from 'lucide-react';

// Reviews are stored in localStorage
const REVIEWS_KEY = 'wf_admin_reviews';

interface Review {
  id: string;
  posterId: string;
  posterName: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  photos?: string[];
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
}

function getReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReviews(reviews: Review[]): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function updateReviewStatus(id: string, status: Review['status']): void {
  const reviews = getReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx !== -1) {
    reviews[idx] = { ...reviews[idx], status };
    saveReviews(reviews);
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14}
          fill={s <= rating ? '#F59E0B' : 'none'}
          color={s <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

export const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const load = () => setReviews(getReviews());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleApprove = (id: string) => {
    updateReviewStatus(id, 'approved');
    showToast('Review approved.');
    load();
  };

  const handleHide = (id: string) => {
    updateReviewStatus(id, 'hidden');
    showToast('Review hidden.');
    load();
  };

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    hidden: reviews.filter((r) => r.status === 'hidden').length,
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-section-title">Reviews &amp; Feedback</h1>
        <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
          Manage customer reviews and product ratings.
        </p>
      </div>

      <div className="adm-tabs">
        {(['all', 'pending', 'approved', 'hidden'] as const).map((f) => (
          <button key={f} className={`adm-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ color: '#9CA3AF', fontSize: '0.78rem', marginLeft: 2 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty-state">
          <Star size={40} />
          <div className="adm-empty-title">No reviews {filter !== 'all' ? `with status "${filter}"` : 'yet'}</div>
          <div className="adm-empty-desc">Customer reviews will appear here once they are submitted.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r) => (
            <div key={r.id} className="adm-card">
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.customerName}</span>
                      <StarRating rating={r.rating} />
                      <span className={`adm-badge adm-badge-${r.status === 'approved' ? 'approved' : r.status === 'hidden' ? 'hidden' : 'pending'}`}>
                        {r.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      For: <strong>{r.posterName}</strong> • {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.status !== 'approved' && (
                      <button className="adm-btn-green" onClick={() => handleApprove(r.id)}>
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    )}
                    {r.status !== 'hidden' && (
                      <button className="adm-btn-secondary" onClick={() => handleHide(r.id)}>
                        <EyeOff size={13} /> Hide
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
                {r.photos && r.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {r.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`Review photo ${i + 1}`}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #E5E7EB' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="adm-toast"><CheckCircle2 size={16} color="#22C55E" />{toast}</div>
      )}
    </div>
  );
};
