import React, { useState } from 'react';
import { Poster } from '../types';
import { getPosterPlaceholderSvg } from '../utils/posterArt';

interface ProductCardProps {
  poster: Poster;
  onSelect: (posterId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ poster, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="wf-product-card"
      onClick={() => onSelect(poster.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(poster.id);
        }
      }}
      aria-label={`View details for ${poster.name}`}
    >
      {/* 1. Poster Image (Maintains 3:4 portrait aspect ratio) */}
      <div className="wf-card-image-wrapper">
        <img
          src={imgError ? getPosterPlaceholderSvg(poster.name) : poster.image}
          alt={`Art poster design: ${poster.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>

      {/* 2. Product Name & 3. Price Underneath (Indian Rupee ₹) */}
      <div className="wf-card-info">
        <h3 className="wf-card-title">{poster.name}</h3>
        <p className="wf-card-price">
          From ₹{poster.prices.A5.toLocaleString('en-IN')}
        </p>
      </div>
    </article>
  );
};
