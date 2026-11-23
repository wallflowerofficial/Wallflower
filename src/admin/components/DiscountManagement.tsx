import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  getAllDiscounts, createDiscount, updateDiscount, toggleDiscount, deleteDiscount
} from '../data/adminDiscounts';
import type { Discount, DiscountType, DiscountScope } from '../types/admin';

// ─── Discount Form ────────────────────────────────────────────────────────────

interface DiscountFormProps {
  initial?: Discount | null;
  onSave: (data: Omit<Discount, 'id' | 'usedCount' | 'revenueGenerated' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState({
    code: initial?.code || '',
    type: (initial?.type || 'percentage') as DiscountType,
    value: initial?.value || 10,
    scope: (initial?.scope || 'global') as DiscountScope,
    minOrderValue: initial?.minOrderValue || 0,
    maxDiscountAmount: initial?.maxDiscountAmount || 0,
    usageLimit: initial?.usageLimit || 0,
    usageLimitPerUser: initial?.usageLimitPerUser || 1,
    isOneTimeUse: initial?.isOneTimeUse || false,
    isActive: initial?.isActive ?? true,
    canCombine: initial?.canCombine || false,
    expiresAt: initial?.expiresAt ? initial.expiresAt.substring(0, 16) : '',
    targetIds: initial?.targetIds || [],
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      minOrderValue: form.minOrderValue || undefined,
      maxDiscountAmount: form.maxDiscountAmount || undefined,
      usageLimit: form.usageLimit || undefined,
    });
  };

  return (
    <div className="adm-modal-backdrop" onClick={onCancel}>
      <div className="adm-modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="adm-modal-title" style={{ marginBottom: 0 }}>
            {initial ? 'Edit Discount' : 'Create Discount Code'}
          </h3>
          <button className="adm-btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Coupon Code *</label>
              <input className="adm-form-input" required value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20" disabled={!!initial} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Discount Type *</label>
              <select className="adm-form-select" value={form.type}
                onChange={(e) => set('type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">
                {form.type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
              </label>
              <input className="adm-form-input" type="number" required min={0}
                max={form.type === 'percentage' ? 100 : undefined}
                value={form.value} onChange={(e) => set('value', Number(e.target.value))} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Scope</label>
              <select className="adm-form-select" value={form.scope}
                onChange={(e) => set('scope', e.target.value)}>
                <option value="global">Global (all orders)</option>
                <option value="first_order">First Order Only</option>
                <option value="collection">Collection-Specific</option>
                <option value="product">Product-Specific</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Min Order Value (₹)</label>
              <input className="adm-form-input" type="number" min={0} value={form.minOrderValue}
                onChange={(e) => set('minOrderValue', Number(e.target.value))} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Max Discount Amount (₹)</label>
              <input className="adm-form-input" type="number" min={0} value={form.maxDiscountAmount}
                onChange={(e) => set('maxDiscountAmount', Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Total Usage Limit</label>
              <input className="adm-form-input" type="number" min={0} value={form.usageLimit}
                onChange={(e) => set('usageLimit', Number(e.target.value))}
                placeholder="0 = unlimited" />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Expires At</label>
              <input className="adm-form-input" type="datetime-local" value={form.expiresAt}
                onChange={(e) => set('expiresAt', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { key: 'isActive', label: 'Active' },
              { key: 'isOneTimeUse', label: 'One-time use per customer' },
              { key: 'canCombine', label: 'Can combine with other discounts' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="adm-btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="adm-btn-primary">
              {initial ? 'Save Changes' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Discount Management (Main) ───────────────────────────────────────────────

export const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => setDiscounts(getAllDiscounts());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = (data: Omit<Discount, 'id' | 'usedCount' | 'revenueGenerated' | 'createdAt' | 'updatedAt'>) => {
    if (editTarget) {
      updateDiscount(editTarget.id, data);
      showToast('Discount updated.');
    } else {
      const result = createDiscount(data);
      if (!result.success) { showToast(result.error || 'Error'); return; }
      showToast(`Discount code "${data.code}" created.`);
    }
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const handleToggle = (d: Discount) => {
    toggleDiscount(d.id);
    load();
  };

  const handleDelete = (d: Discount) => {
    if (!confirm(`Delete discount code "${d.code}"?`)) return;
    deleteDiscount(d.id);
    showToast('Discount deleted.');
    load();
  };

  const isExpired = (d: Discount) => d.expiresAt ? new Date(d.expiresAt) < new Date() : false;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="adm-section-title">Discounts &amp; Promotions</h1>
          <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
            Manage coupon codes and promotions — {discounts.filter((d) => d.isActive).length} active.
          </p>
        </div>
        <button className="adm-btn-primary" style={{ width: 'auto' }}
          onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={16} /> Create Discount
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="adm-empty-state">
          <div className="adm-empty-title">No discount codes yet</div>
          <div className="adm-empty-desc">Create your first discount to attract customers.</div>
        </div>
      ) : (
        <div className="adm-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Scope</th>
                  <th>Used / Revenue</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: '#111318' }}>
                        {d.code}
                      </span>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: '0.84rem' }}>{d.type}</td>
                    <td style={{ fontWeight: 700 }}>
                      {d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#6B7280' }}>{d.scope}</td>
                    <td style={{ fontSize: '0.84rem' }}>
                      {d.usedCount} uses • ₹{d.revenueGenerated.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: isExpired(d) ? '#EF4444' : '#6B7280' }}>
                      {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('en-IN') : '—'}
                      {isExpired(d) && ' (Expired)'}
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${d.isActive && !isExpired(d) ? 'active' : 'inactive'}`}>
                        {d.isActive && !isExpired(d) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="adm-btn-icon" title={d.isActive ? 'Disable' : 'Enable'}
                          onClick={() => handleToggle(d)}>
                          {d.isActive ? <ToggleRight size={15} color="#22C55E" /> : <ToggleLeft size={15} color="#9CA3AF" />}
                        </button>
                        <button className="adm-btn-icon" title="Edit"
                          onClick={() => { setEditTarget(d); setShowForm(true); }}>
                          <Edit2 size={13} />
                        </button>
                        <button className="adm-btn-icon" title="Delete" onClick={() => handleDelete(d)}
                          style={{ color: '#EF4444' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showForm || editTarget) && (
        <DiscountForm initial={editTarget} onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }} />
      )}

      {toast && (
        <div className="adm-toast"><CheckCircle2 size={16} color="#22C55E" />{toast}</div>
      )}
    </div>
  );
};
