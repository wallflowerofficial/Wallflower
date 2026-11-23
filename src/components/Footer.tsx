import React from 'react';
import { Mail, Instagram } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      className="wf-footer"
      role="contentinfo"
      style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        borderTop: '1px solid #1F1F1F',
        padding: '64px 0 36px',
        marginTop: 'auto'
      }}
    >
      <div className="wf-container">
        <div
          className="wf-footer-top"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* 1. Brand Info */}
          <div>
            <span className="wf-brand-logo" style={{ color: '#FFFFFF' }}>wallflower</span>
            <p className="wf-footer-brand-p" style={{ color: '#A3A3A3', marginTop: '12px' }}>
              Aesthetically designed posters in A3, A4, and A5.
            </p>
          </div>

          {/* 2. Navigation Links */}
          <div>
            <h4 className="wf-footer-col-title" style={{ color: '#FFFFFF', marginBottom: '16px' }}>
              Navigation
            </h4>
            <ul className="wf-footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  className="wf-footer-link"
                  style={{ color: '#A3A3A3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => onNavigate({ view: 'home' })}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  className="wf-footer-link"
                  style={{ color: '#A3A3A3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => onNavigate({ view: 'catalog' })}
                >
                  Catalog
                </button>
              </li>
              <li>
                <button
                  className="wf-footer-link"
                  style={{ color: '#A3A3A3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => onNavigate({ view: 'collection', type: 'custom' })}
                >
                  Create Your Own Collection
                </button>
              </li>
              <li>
                <button
                  className="wf-footer-link"
                  style={{ color: '#A3A3A3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => onNavigate({ view: 'collection', type: 'curated' })}
                >
                  Collections by Wallflower
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Available Sizes */}
          <div>
            <h4 className="wf-footer-col-title" style={{ color: '#FFFFFF', marginBottom: '16px' }}>
              Available Sizes
            </h4>
            <ul className="wf-footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li className="wf-footer-link" style={{ cursor: 'default', color: '#A3A3A3' }}>
                A3 — ₹117 (29.7 × 42.0 cm)
              </li>
              <li className="wf-footer-link" style={{ cursor: 'default', color: '#A3A3A3' }}>
                A4 — ₹105 (21.0 × 29.7 cm)
              </li>
              <li className="wf-footer-link" style={{ cursor: 'default', color: '#A3A3A3' }}>
                A5 — ₹99 (14.8 × 21.0 cm)
              </li>
            </ul>
          </div>

          {/* 4. @ Contact Us Section */}
          <div>
            <h4 className="wf-footer-col-title" style={{ color: '#FFFFFF', marginBottom: '16px' }}>
              @ Contact Us
            </h4>
            <ul className="wf-footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li>
                <a
                  href="mailto:wallflowercreators@gmail.com"
                  className="wf-footer-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#A3A3A3',
                    textDecoration: 'none',
                    fontSize: '0.86rem',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#A3A3A3'; }}
                >
                  <Mail size={16} style={{ flexShrink: 0 }} />
                  <span>- wallflowercreators@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/WALL_FLOWER.STORE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wf-footer-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#A3A3A3',
                    textDecoration: 'none',
                    fontSize: '0.86rem',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#A3A3A3'; }}
                >
                  <Instagram size={16} style={{ flexShrink: 0 }} />
                  <span>- @WALL_FLOWER.STORE</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div
          className="wf-footer-bottom"
          style={{
            borderTop: '1px solid #1F1F1F',
            color: '#737373',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <p>© {new Date().getFullYear()} wallflower. All rights reserved.</p>
          <a
            href="#admin"
            style={{
              color: '#525252',
              fontSize: '0.8rem',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
            title="Administrator Portal"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </footer>
  );
};
