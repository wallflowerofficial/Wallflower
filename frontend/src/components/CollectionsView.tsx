import React from 'react';
import { Home } from 'lucide-react';

interface CollectionsViewProps {
  type: 'custom' | 'curated';
  onBackToCatalog: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  type,
  onBackToCatalog
}) => {
  const isCustom = type === 'custom';
  const title = isCustom ? 'Create Your Own Collection' : 'Collections by Wallflower';
  const description = isCustom
    ? 'Custom collection creation will be available here in a future update.'
    : 'Curated collections by Wallflower will be featured here in a future update.';

  return (
    <section className="wf-collections-page" aria-label="Collections Page" style={{ padding: '36px 0 80px' }}>
      <div className="wf-container">
        {/* Header row: Single Collection badge aligned with back to home button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="wf-hero-badge" style={{ margin: 0 }}>Collection</span>
          <button
            onClick={onBackToCatalog}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#171717',
              backgroundColor: '#FAFAFA',
              border: '1px solid #EAEAEA',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FAFAFA';
              e.currentTarget.style.borderColor = '#EAEAEA';
            }}
          >
            <Home size={16} strokeWidth={1.8} />
            <span>back to home</span>
          </button>
        </div>

        {/* Collection Content */}
        <div style={{ maxWidth: '640px', padding: '0 0 64px' }}>
          <h1 className="wf-collection-title" style={{ marginTop: 0 }}>
            {title}
          </h1>
          <p className="wf-collection-desc" style={{ marginBottom: '32px' }}>
            {description}
          </p>
          <button className="wf-btn-add-to-cart" style={{ maxWidth: '200px' }} onClick={onBackToCatalog}>
            Explore Prints
          </button>
        </div>
      </div>
    </section>
  );
};
