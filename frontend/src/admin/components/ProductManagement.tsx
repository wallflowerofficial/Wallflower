import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Archive, Eye, EyeOff, Copy,
  Search, CheckCircle2, X
} from 'lucide-react';
import {
  getAllAdminProducts, createProduct, updateProduct,
  archiveProduct, deleteProduct, duplicateProduct
} from '../data/adminProducts';
import type { AdminPoster } from '../types/admin';
import { getPosterPlaceholderSvg } from '../../utils/posterArt';

// ─── Product Form ─────────────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: AdminPoster | null;
  onSave: (data: Omit<AdminPoster, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  subtitle: string;
  description: string;
  editorialNote: string;
  images: string[];
  image: string;
  prices: { A3: number; A4: number; A5: number };
  costPrices: { A3: number; A4: number; A5: number };
  enabledSizes: { A3: boolean; A4: boolean; A5: boolean };
  category: string;
  inStock: boolean;
  featured: boolean;
  isNewArrival: boolean;
  collectionIds: string[];
  archived: boolean;
  hasOrders: boolean;
  seoTitle: string;
  seoDescription: string;
  priceHistory: Array<{ prices: { A3: number; A4: number; A5: number }; changedAt: string }>;
  palette: string[];
}

const DEFAULT_FORM: FormState = {
  name: '', subtitle: '', description: '', editorialNote: '',
  images: [''], image: '',
  prices: { A3: 117, A4: 105, A5: 99 },
  costPrices: { A3: 60, A4: 50, A5: 40 },
  enabledSizes: { A3: true, A4: true, A5: true },
  category: '', inStock: true, featured: false, isNewArrival: false,
  collectionIds: [] as string[],
  archived: false, hasOrders: false,
  seoTitle: '', seoDescription: '',
  priceHistory: [] as Array<{ prices: { A3: number; A4: number; A5: number }; changedAt: string }>,
  palette: [] as string[],
};

const ProductForm: React.FC<ProductFormProps> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULT_FORM,
    ...(initial ? {
      name: initial.name, subtitle: initial.subtitle || '',
      description: initial.description, editorialNote: initial.editorialNote || '',
      images: initial.images?.length ? initial.images : [initial.image],
      image: initial.image,
      prices: { ...initial.prices },
      costPrices: { ...initial.costPrices },
      enabledSizes: { ...initial.enabledSizes },
      category: initial.category || '', inStock: initial.inStock,
      featured: initial.featured || false, isNewArrival: initial.isNewArrival || false,
      collectionIds: initial.collectionIds || [],
      archived: initial.archived || false, hasOrders: initial.hasOrders || false,
      seoTitle: initial.seoTitle || initial.name,
      seoDescription: initial.seoDescription || initial.description,
      priceHistory: initial.priceHistory || [],
      palette: initial.palette || [],
    } : {}),
  }));

  const setField = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));
  const setPriceField = (key: 'prices' | 'costPrices', size: string, val: number) =>
    setForm((f) => ({ ...f, [key]: { ...f[key], [size]: val } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImage = form.images[0] || '';
    onSave({ ...form, image: primaryImage });
  };

  return (
    <div className="adm-modal-backdrop" onClick={onCancel}>
      <div
        className="adm-modal"
        style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="adm-modal-title" style={{ marginBottom: 0 }}>
            {initial ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button className="adm-btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="adm-form-group" style={{ marginBottom: 0 }}>
              <label className="adm-form-label">Poster Name *</label>
              <input className="adm-form-input" required value={form.name}
                onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Porsche 911 Turbo S" />
            </div>
            <div className="adm-form-group" style={{ marginBottom: 0 }}>
              <label className="adm-form-label">Subtitle</label>
              <input className="adm-form-input" value={form.subtitle}
                onChange={(e) => setField('subtitle', e.target.value)} placeholder="e.g. German Engineering" />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Description *</label>
            <textarea className="adm-form-textarea" required value={form.description}
              onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Category</label>
            <input className="adm-form-input" value={form.category}
              onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Sports, Classic" />
          </div>

          {/* Images */}
          <div className="adm-form-group">
            <label className="adm-form-label">Product Images (first = primary)</label>
            {form.images.map((img, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input className="adm-form-input" value={img}
                  onChange={(e) => {
                    const imgs = [...form.images];
                    imgs[idx] = e.target.value;
                    setField('images', imgs);
                  }}
                  placeholder={`Image URL ${idx + 1}`}
                />
                {idx === 0 ? (
                  <span style={{ fontSize: '0.7rem', color: '#22C55E', alignSelf: 'center', whiteSpace: 'nowrap', fontWeight: 600 }}>PRIMARY</span>
                ) : (
                  <button type="button" className="adm-btn-icon"
                    onClick={() => setField('images', form.images.filter((_, i) => i !== idx))}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="adm-btn-secondary" style={{ marginTop: 4 }}
              onClick={() => setField('images', [...form.images, ''])}>
              <Plus size={14} /> Add Image
            </button>
          </div>

          {/* Selling Prices */}
          <div style={{ marginBottom: 12 }}>
            <label className="adm-form-label">Selling Prices (₹)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {(['A3', 'A4', 'A5'] as const).map((size) => (
                <div key={size}>
                  <label className="adm-form-label" style={{ color: '#6B7280' }}>
                    {size} {!form.enabledSizes[size] && '(disabled)'}
                  </label>
                  <input className="adm-form-input" type="number" min={0}
                    value={form.prices[size]}
                    onChange={(e) => setPriceField('prices', size, Number(e.target.value))}
                    disabled={!form.enabledSizes[size]}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cost Prices */}
          <div style={{ marginBottom: 12 }}>
            <label className="adm-form-label">Cost Prices (₹) — for profit calculation</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {(['A3', 'A4', 'A5'] as const).map((size) => (
                <div key={size}>
                  <label className="adm-form-label" style={{ color: '#6B7280' }}>{size}</label>
                  <input className="adm-form-input" type="number" min={0}
                    value={form.costPrices[size]}
                    onChange={(e) => setPriceField('costPrices', size, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Size Enable/Disable */}
          <div className="adm-form-group">
            <label className="adm-form-label">Enabled Sizes</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['A3', 'A4', 'A5'] as const).map((size) => (
                <label key={size} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={form.enabledSizes[size]}
                    onChange={(e) => setField('enabledSizes', { ...form.enabledSizes, [size]: e.target.checked })} />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            {[
              { key: 'inStock', label: 'In Stock' },
              { key: 'featured', label: 'Featured' },
              { key: 'isNewArrival', label: 'New Arrival' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={(e) => setField(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {/* SEO */}
          <div className="adm-form-group">
            <label className="adm-form-label">SEO Title</label>
            <input className="adm-form-input" value={form.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">SEO Description</label>
            <textarea className="adm-form-textarea" value={form.seoDescription} style={{ minHeight: 60 }}
              onChange={(e) => setField('seoDescription', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="adm-btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="adm-btn-primary">
              {initial ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Product Management (Main) ────────────────────────────────────────────────

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<AdminPoster[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPoster | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => setProducts(getAllAdminProducts());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Omit<AdminPoster, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editTarget) {
      updateProduct(editTarget.id, data);
      showToast(`"${data.name}" updated.`);
    } else {
      createProduct(data);
      showToast(`"${data.name}" added.`);
    }
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = (p: AdminPoster) => {
    if (p.hasOrders) {
      showToast('Cannot delete — this product has orders. Archive it instead.');
      return;
    }
    if (!confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) return;
    deleteProduct(p.id);
    showToast(`"${p.name}" deleted.`);
    load();
  };

  const handleArchive = (p: AdminPoster) => {
    if (!confirm(`Archive "${p.name}"? It will be hidden from the catalog.`)) return;
    archiveProduct(p.id);
    showToast(`"${p.name}" archived.`);
    load();
  };

  const handleDuplicate = (p: AdminPoster) => {
    duplicateProduct(p.id);
    showToast(`"${p.name}" duplicated.`);
    load();
  };

  const handleToggleStock = (p: AdminPoster) => {
    updateProduct(p.id, { inStock: !p.inStock });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="adm-section-title">Products</h1>
          <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
            Manage your poster catalog — {products.filter((p) => !p.archived).length} active products.
          </p>
        </div>
        <button className="adm-btn-primary" style={{ width: 'auto' }}
          onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="adm-filter-bar">
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input className="adm-search-input" type="text" placeholder="Search products…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="adm-products-grid">
        {filtered.map((p) => (
          <div key={p.id} className="adm-product-card" style={{ opacity: p.archived ? 0.5 : 1 }}>
            <div style={{ position: 'relative' }}>
              <img className="adm-product-img" src={p.image} alt={p.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = getPosterPlaceholderSvg(p.name); }} />
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {p.featured && <span className="adm-badge adm-badge-new" style={{ fontSize: '0.6rem' }}>Featured</span>}
                {p.isNewArrival && <span className="adm-badge adm-badge-active" style={{ fontSize: '0.6rem' }}>New</span>}
                {p.archived && <span className="adm-badge adm-badge-cancelled" style={{ fontSize: '0.6rem' }}>Archived</span>}
              </div>
            </div>
            <div className="adm-product-info">
              <div className="adm-product-name">{p.name}</div>
              <div className="adm-product-id">{p.id}</div>
              <div className="adm-product-price-row">
                {(['A3', 'A4', 'A5'] as const).map((size) => (
                  p.enabledSizes[size] && (
                    <span key={size} className="adm-product-price-chip">
                      {size}: ₹{p.prices[size]}
                    </span>
                  )
                ))}
              </div>
              <div className="adm-product-actions">
                <button className="adm-btn-icon" title="Edit"
                  onClick={() => { setEditTarget(p); setShowForm(true); }}>
                  <Edit2 size={13} />
                </button>
                <button className="adm-btn-icon" title="Duplicate" onClick={() => handleDuplicate(p)}>
                  <Copy size={13} />
                </button>
                <button className="adm-btn-icon" title={p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                  onClick={() => handleToggleStock(p)}>
                  {p.inStock ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button className="adm-btn-icon" title="Archive" onClick={() => handleArchive(p)}>
                  <Archive size={13} />
                </button>
                {!p.hasOrders && (
                  <button className="adm-btn-icon" title="Delete" onClick={() => handleDelete(p)}
                    style={{ color: '#EF4444' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="adm-empty-state">
          <div className="adm-empty-title">No products found</div>
        </div>
      )}

      {(showForm || editTarget) && (
        <ProductForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {toast && (
        <div className="adm-toast">
          <CheckCircle2 size={16} color="#22C55E" />
          {toast}
        </div>
      )}
    </div>
  );
};
