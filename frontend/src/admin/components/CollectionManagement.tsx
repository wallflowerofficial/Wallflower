import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, CheckCircle2, X } from 'lucide-react';
import {
  getAllCollections, createCollection, updateCollection, deleteCollection
} from '../data/adminCollections';
import { getAllAdminProducts } from '../data/adminProducts';
import type { WallflowerCollection } from '../types/admin';
import type { AdminPoster } from '../types/admin';

// ─── Collection Form ──────────────────────────────────────────────────────────

interface CollectionFormProps {
  initial?: WallflowerCollection | null;
  products: AdminPoster[];
  onSave: (data: Omit<WallflowerCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ initial, products, onSave, onCancel }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage || '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial?.posterIds || []);
  const [search, setSearch] = useState('');

  const toggleProduct = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, description, coverImage, enabled, featured,
      posterIds: selectedIds,
      displayOrder: initial?.displayOrder ?? 0,
    });
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-modal-backdrop" onClick={onCancel}>
      <div className="adm-modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="adm-modal-title" style={{ marginBottom: 0 }}>
            {initial ? 'Edit Collection' : 'New Collection'}
          </h3>
          <button className="adm-btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-form-label">Collection Name *</label>
            <input className="adm-form-input" required value={name}
              onChange={(e) => setName(e.target.value)} placeholder="e.g. German Legends" />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Description</label>
            <textarea className="adm-form-textarea" value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Cover Image URL</label>
            <input className="adm-form-input" value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" />
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              Enabled (visible on site)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured on Homepage
            </label>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Select Products ({selectedIds.length} selected)</label>
            <input className="adm-form-input" value={search}
              onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
              style={{ marginBottom: 8 }} />
            <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 8 }}>
              {filteredProducts.map((p) => (
                <label key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderBottom: '1px solid #F3F4F6', cursor: 'pointer',
                  background: selectedIds.includes(p.id) ? '#EFF6FF' : 'transparent'
                }}>
                  <input type="checkbox" checked={selectedIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)} />
                  <img src={p.image} alt={p.name}
                    style={{ width: 32, height: 42, objectFit: 'cover', borderRadius: 4, background: '#F3F4F6' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" className="adm-btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="adm-btn-primary">
              {initial ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Collection Management (Main) ─────────────────────────────────────────────

export const CollectionManagement: React.FC = () => {
  const [collections, setCollections] = useState<WallflowerCollection[]>([]);
  const [products, setProducts] = useState<AdminPoster[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<WallflowerCollection | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => {
    setCollections(getAllCollections());
    setProducts(getAllAdminProducts().filter((p) => !p.archived));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (data: Omit<WallflowerCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editTarget) {
      updateCollection(editTarget.id, data);
      showToast(`Collection "${data.name}" updated.`);
    } else {
      createCollection({ ...data, displayOrder: collections.length });
      showToast(`Collection "${data.name}" created.`);
    }
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = (c: WallflowerCollection) => {
    if (!confirm(`Delete collection "${c.name}"?`)) return;
    deleteCollection(c.id);
    showToast(`"${c.name}" deleted.`);
    load();
  };

  const toggleEnabled = (c: WallflowerCollection) => {
    updateCollection(c.id, { enabled: !c.enabled });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="adm-section-title">Collections</h1>
          <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
            Manage Wallflower Collections — these appear under "Collections by Wallflower".
          </p>
        </div>
        <button className="adm-btn-primary" style={{ width: 'auto' }}
          onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={16} /> New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="adm-empty-state">
          <div className="adm-empty-title">No collections yet</div>
          <div className="adm-empty-desc">Create your first poster collection to group products together.</div>
          <button className="adm-btn-primary" style={{ width: 'auto', marginTop: 16 }}
            onClick={() => setShowForm(true)}>
            <Plus size={14} /> Create Collection
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {collections.map((c) => (
            <div key={c.id} className="adm-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <GripVertical size={18} color="#D1D5DB" style={{ cursor: 'grab', flexShrink: 0 }} />
                {c.coverImage && (
                  <img src={c.coverImage} alt={c.name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</span>
                    {c.featured && <span className="adm-badge adm-badge-new" style={{ fontSize: '0.6rem' }}>Featured</span>}
                    <span className={`adm-badge adm-badge-${c.enabled ? 'active' : 'inactive'}`} style={{ fontSize: '0.6rem' }}>
                      {c.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {c.posterIds.length} products
                    {c.description && ` • ${c.description.substring(0, 60)}…`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="adm-btn-icon" onClick={() => toggleEnabled(c)}
                    title={c.enabled ? 'Disable' : 'Enable'}>
                    {c.enabled ? <span style={{ fontSize: '0.65rem', color: '#22C55E', fontWeight: 700 }}>ON</span>
                      : <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 700 }}>OFF</span>}
                  </button>
                  <button className="adm-btn-icon" title="Edit"
                    onClick={() => { setEditTarget(c); setShowForm(true); }}>
                    <Edit2 size={13} />
                  </button>
                  <button className="adm-btn-icon" title="Delete" onClick={() => handleDelete(c)}
                    style={{ color: '#EF4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editTarget) && (
        <CollectionForm
          initial={editTarget}
          products={products}
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
