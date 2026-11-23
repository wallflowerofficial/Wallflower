import React, { useState } from 'react';
import { Home, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Poster, PosterSize } from '../types';
import { POSTER_SIZES_INFO } from '../data/posters';
import { getPosterPlaceholderSvg } from '../utils/posterArt';

interface ProductDetailProps {
  poster: Poster;
  onBackToCatalog: () => void;
  onAddToCart: (poster: Poster, size: PosterSize, quantity: number) => void;
  onBuyNow: (poster: Poster, size: PosterSize, quantity: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  poster,
  onBackToCatalog,
  onAddToCart,
  onBuyNow
}) => {
  // A4 default per specification
  const [selectedSize, setSelectedSize] = useState<PosterSize>('A4');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const currentPrice = poster.prices[selectedSize];

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(poster, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    onBuyNow(poster, selectedSize, quantity);
  };

  const sizes: PosterSize[] = ['A3', 'A4', 'A5'];

  return (
    <article className="wf-product-page" aria-label={`Product details for ${poster.name}`}>
      <div className="wf-container">
        {/* Breadcrumb Navigation & Back to Home */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <nav className="wf-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 0 }}>
            <button className="wf-breadcrumb-link" onClick={onBackToCatalog}>
              Catalog
            </button>
            <span className="wf-breadcrumb-separator">/</span>
            {poster.category && (
              <>
                <span className="wf-breadcrumb-link">{poster.category}</span>
                <span className="wf-breadcrumb-separator">/</span>
              </>
            )}
            <span className="wf-breadcrumb-current">{poster.name}</span>
          </nav>
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

        {/* TWO-COLUMN LAYOUT: LEFT = IMAGE, RIGHT = PURCHASING CONTROLS */}
        <div className="wf-product-layout">
          {/* LEFT COLUMN: LARGE POSTER DISPLAY */}
          <div className="wf-product-left-col">
            <div className="wf-poster-presentation">
              <div className="wf-poster-frame">
                <img
                  src={imgError ? getPosterPlaceholderSvg(poster.name) : poster.image}
                  alt={`Archival wall art print: ${poster.name}`}
                  decoding="async"
                  onError={() => setImgError(true)}
                />
              </div>
            </div>

            <div className="wf-poster-specs-strip">
              <span className="wf-poster-spec-item">
                <ShieldCheck size={14} /> Archival 230gsm Matte Paper
              </span>
              <span className="wf-poster-spec-item">
                <RefreshCw size={14} /> 12-Color Giclée Pigment
              </span>
              <span className="wf-poster-spec-item">
                <Truck size={14} /> Carbon-Neutral Shipping
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: PURCHASING & DETAILS (INDIAN RUPEE ₹) */}
          <div className="wf-product-right-col">
            <header className="wf-product-header">
              {poster.category && <span className="wf-product-badge">{poster.category} Series</span>}
              <h1 className="wf-product-title">{poster.name}</h1>
              {poster.subtitle && <p className="wf-product-subtitle">{poster.subtitle}</p>}
            </header>

            {/* Price in ₹ */}
            <div className="wf-product-price-row">
              <span className="wf-product-price">₹{currentPrice.toLocaleString('en-IN')}</span>
              <span className="wf-product-vat-info">Tax included • Free delivery over ₹999</span>
            </div>

            <div className="wf-product-description">
              <p>{poster.description}</p>
            </div>

            {/* Poster Size Selection */}
            <div className="wf-size-section">
              <div className="wf-section-label-row">
                <span className="wf-section-label">Select Size</span>
                <span className="wf-size-dimension-desc">
                  {POSTER_SIZES_INFO[selectedSize].dimensions}
                </span>
              </div>

              <div className="wf-size-selector-boxes" role="radiogroup" aria-label="Poster Size">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`wf-size-box ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <span className="wf-size-name">{size}</span>
                      <span className="wf-size-subtext">
                        ₹{poster.prices[size].toLocaleString('en-IN')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="wf-quantity-section">
              <div className="wf-section-label-row">
                <span className="wf-section-label">Quantity</span>
              </div>

              <div className="wf-quantity-selector">
                <button
                  type="button"
                  className={`wf-qty-btn ${quantity <= 1 ? 'disabled' : ''}`}
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1 }}>−</span>
                </button>

                <span className="wf-qty-number" aria-live="polite">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="wf-qty-btn"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1 }}>+</span>
                </button>
              </div>
            </div>

            {/* Purchase Action Buttons */}
            <div className="wf-purchase-actions">
              <button
                type="button"
                className={`wf-btn-add-to-cart ${isAdded ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdded}
              >
                {isAdded ? (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    <span>Added to Cart ✓</span>
                  </>
                ) : (
                  <span>Add to Cart — ₹{(currentPrice * quantity).toLocaleString('en-IN')}</span>
                )}
              </button>

              <button
                type="button"
                className="wf-btn-buy-now"
                onClick={handleBuyNow}
              >
                <span>Buy Now</span>
              </button>
            </div>

            <div className="wf-product-perks">
              <div className="wf-perk-row">
                <Truck size={15} />
                <span>Dispatched across India within 24–48 hours in reinforced rigid cardboard tubing.</span>
              </div>
              <div className="wf-perk-row">
                <ShieldCheck size={15} />
                <span>30-day effortless guarantee if not completely in love with the print.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
