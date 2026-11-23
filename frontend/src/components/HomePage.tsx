import React from 'react';
import { ProductCard } from './ProductCard';
import { Poster } from '../types';
import { ArrowRight } from 'lucide-react';

interface HomePageProps {
  posters: Poster[];
  onSelectPoster: (posterId: string) => void;
  onExploreCatalog: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posters,
  onSelectPoster,
  onExploreCatalog
}) => {
  // Showcase 12 of the latest posters added by admin (4 on each row)
  const latestPosters = posters.slice(0, 12);

  return (
    <div className="wf-homepage" style={{ padding: '24px 0 80px' }}>
      <div className="wf-container">
        {/* ==============================================================
            1. HERO IMAGE (BLANK PLACEHOLDER FOR NOW AS REQUESTED)
            ============================================================== */}
        <div
          className="wf-hero-blank"
          style={{
            width: '100%',
            height: '420px',
            backgroundColor: '#F7F7F7',
            borderRadius: '16px',
            border: '1px solid #EAEAEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '48px',
            overflow: 'hidden',
            position: 'relative'
          }}
          aria-label="Hero Image Section"
        >
          {/* Kept blank as requested; placeholder container ready for hero image asset */}
        </div>

        {/* ==============================================================
            2. SHOWCASE 12 OF THE LATEST POSTERS (4 PER ROW)
            ============================================================== */}
        <section aria-label="Latest Posters Section">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '32px',
              borderBottom: '1px solid #EAEAEA',
              paddingBottom: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '6px' }}>
                Fresh Releases
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#171717', letterSpacing: '-0.03em', margin: 0 }}>
                Latest Posters
              </h2>
            </div>

            <button
              onClick={onExploreCatalog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#171717',
                background: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span>Explore All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Grid showcasing 12 latest posters (4 on each row) */}
          <div
            className="wf-catalog-grid wf-home-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
            }}
          >
            {latestPosters.map((poster) => (
              <ProductCard
                key={poster.id}
                poster={poster}
                onSelect={onSelectPoster}
              />
            ))}
          </div>

          {/* Explore Catalog Button */}
          <div style={{ marginTop: '56px', textAlign: 'center' }}>
            <button
              className="wf-btn-add-to-cart"
              style={{ maxWidth: '240px', margin: '0 auto' }}
              onClick={onExploreCatalog}
            >
              View Full Catalog
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
