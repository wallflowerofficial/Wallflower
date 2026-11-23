import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { adminLogin } from './data/adminAuth';
import type { AdminUser } from './types/admin';
import flowerLogo from '../assets/flower-logo.png';

interface AdminLoginProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = adminLogin(username.trim(), password);
      setLoading(false);
      if (result.success && result.admin) {
        onLoginSuccess(result.admin);
      } else {
        setError(result.error || 'Login failed.');
      }
    }, 400);
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <img src={flowerLogo} alt="Wallflower" />
          <span className="adm-login-logo-text">Wallflower</span>
          <span className="adm-login-logo-badge">Admin</span>
        </div>

        <h1 className="adm-login-title">Welcome back</h1>
        <p className="adm-login-subtitle">Sign in to the admin panel to manage your store.</p>

        {error && (
          <div className="adm-alert adm-alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-form-label">Username or Email</label>
            <input
              className={`adm-form-input ${error ? 'error' : ''}`}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </div>

          <div className="adm-form-group" style={{ position: 'relative' }}>
            <label className="adm-form-label">Password</label>
            <input
              className={`adm-form-input ${error ? 'error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute', right: '12px', bottom: '11px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9CA3AF', display: 'flex', alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="adm-btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite', display: 'inline-block'
                }} />
                Signing in…
              </span>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center' }}>
          Restricted access — authorised administrators only.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
