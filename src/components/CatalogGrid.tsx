import React, { useState, useMemo, useEffect } from 'react';
import { Poster } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogGridProps {
  posters: Poster[];
  onSelectPoster: (posterId: string) => void;
  initialCategory?: string;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  posters,
  onSelectPoster,
  initialCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  // Keep category in sync with prop updates
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Dynamically derive categories from actual posters rather than hardcoding demo categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posters.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return set.size > 0 ? ['All', ...Array.from(set)] : [];
  }, [posters]);

  const filteredPosters = useMemo(() => {
    if (selectedCategory === 'All') {
      return posters;
    }
    return posters.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [posters, selectedCategory]);

  return (
    <section className="wf-catalog-page" style={{ paddingTop: '32px' }} aria-label="Poster Catalogue">
      <div className="wf-container">
        {/* Categories Toolbar (only shown if categories exist) */}
        {categories.length > 1 && (
          <div className="wf-catalog-toolbar">
            <div className="wf-category-pills" role="tablist" aria-label="Filter by category">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`wf-category-pill ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  role="tab"
                  aria-selected={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            <span className="wf-catalog-count">
              {filteredPosters.length} {filteredPosters.length === 1 ? 'poster' : 'posters'}
            </span>
          </div>
        )}

        {/* Content Display */}
        {posters.length === 0 ? (
          /* Clean Empty Store State */
          <div
            style={{
              padding: '96px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '84px',
                border: '1px solid #EAEAEA',
                borderRadius: '4px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FAFAFA'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '56px',
                  border: '1px dashed #D4D4D4',
                  borderRadius: '2px'
                }}
              />
            </div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#171717',
                marginBottom: '8px',
                letterSpacing: '-0.02em'
              }}
            >
              No posters in catalog
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#888888',
                maxWidth: '380px',
                lineHeight: 1.5
              }}
            >
              The store catalog is currently empty. New poster designs will appear here once added.
            </p>
          </div>
        ) : (
          /* Product Cards Grid: 4 columns desktop, 2-3 columns tablet, 2 columns mobile */
          <div className="wf-catalog-grid">
            {filteredPosters.map((poster) => (
              <ProductCard
                key={poster.id}
                poster={poster}
                onSelect={onSelectPoster}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
