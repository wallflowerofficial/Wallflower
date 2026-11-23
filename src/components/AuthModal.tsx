import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';
import { getStoredUsers, saveUser, DEFAULT_TEST_USER } from '../data/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  // Tabs: 'login' (already has account) or 'signin' (new account / register)
  const [activeTab, setActiveTab] = useState<'login' | 'signin'>('login');

  // Log In Form state (email & password)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign In (New Account) Form state (all 5 mandatory details)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [signinError, setSigninError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Fill test credentials into Log In form
  const handleFillTestCredentials = () => {
    setLoginEmail(DEFAULT_TEST_USER.email);
    setLoginPassword(DEFAULT_TEST_USER.password || 'wallflower123');
    setLoginError('');
  };

  // Handle Log In (Email & Password only)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your email and password.');
      return;
    }

    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.password === loginPassword
    );

    if (found) {
      onAuthSuccess(found);
      onClose();
    } else {
      setLoginError('Invalid email or password. Please check your credentials or click "Fill Test Credentials" below.');
    }
  };

  // Validation rules for Sign In (All 5 fields strictly mandatory)
  const isFirstNameValid = firstName.trim().length > 0;
  const isLastNameValid = lastName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = phone.trim().length >= 7;
  const isPasswordValid = password.length >= 6;

  const isFormComplete =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid;

  // Handle Sign In (New Account)
  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError('');
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true
    });

    // Enforce mandatory details
    if (!firstName.trim()) {
      setSigninError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setSigninError('Last name is required.');
      return;
    }
    if (!email.trim() || !isEmailValid) {
      setSigninError('A valid email address is required.');
      return;
    }
    if (!phone.trim() || !isPhoneValid) {
      setSigninError('A valid phone number is required.');
      return;
    }
    if (!password || password.length < 6) {
      setSigninError('A password of at least 6 characters is required.');
      return;
    }

    // Check if email already registered
    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      setSigninError('An account with this email already exists. Please log in instead.');
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      addresses: [],
      password,
      createdAt: new Date().toISOString(),
      isTestAccount: false
    };

    saveUser(newUser);
    onAuthSuccess(newUser);
    onClose();
  };

  return (
    <div className="wf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="wf-checkout-modal" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div className="wf-modal-header" style={{ padding: '20px 24px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888' }}>
              wallflower.
            </span>
            <h3 className="wf-modal-title" style={{ marginTop: '2px' }}>
              {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h3>
          </div>
          <button className="wf-cart-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle: Log In (Existing) vs Sign In (New Account) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid #EAEAEA',
            background: '#FAFAFA'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            style={{
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'login' ? 700 : 500,
              color: activeTab === 'login' ? '#171717' : '#888888',
              borderBottom: activeTab === 'login' ? '2px solid #171717' : '2px solid transparent',
              background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Log In (Existing Account)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setSigninError('');
            }}
            style={{
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'signin' ? 700 : 500,
              color: activeTab === 'signin' ? '#171717' : '#888888',
              borderBottom: activeTab === 'signin' ? '2px solid #171717' : '2px solid transparent',
              background: activeTab === 'signin' ? '#FFFFFF' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In (New User)
          </button>
        </div>

        <div className="wf-modal-body" style={{ padding: '24px' }}>
          {/* ==============================================================
              TAB 1: LOG IN (FOR EXISTING ACCOUNTS)
              Takes: Email & Password
              ============================================================== */}
          {activeTab === 'login' ? (
            <div>
              <p style={{ fontSize: '0.86rem', color: '#888888', marginBottom: '20px' }}>
                Log in with your email address and password to access your Wallflower collection.
              </p>

              {loginError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={15} flex-shrink={0} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '6px',
                        border: '1px solid #E0E0E0',
                        fontSize: '0.9rem'
                      }}
                    />
                    <Mail size={16} color="#888888" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '6px',
                        border: '1px solid #E0E0E0',
                        fontSize: '0.9rem'
                      }}
                    />
                    <Lock size={16} color="#888888" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                </div>

                <button type="submit" className="wf-btn-add-to-cart" style={{ marginTop: '8px' }}>
                  Log In
                </button>
              </form>

              {/* Fake test credentials helper */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '14px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #EAEAEA',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#171717', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={13} color="#2677E8" /> Test Account Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestCredentials}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#2677E8',
                      textDecoration: 'underline'
                    }}
                  >
                    Autofill Credentials
                  </button>
                </div>
                <div style={{ color: '#666666', lineHeight: 1.4 }}>
                  <div><strong>Email:</strong> {DEFAULT_TEST_USER.email}</div>
                  <div><strong>Password:</strong> {DEFAULT_TEST_USER.password}</div>
                </div>
                <p style={{ color: '#888888', fontSize: '0.72rem', marginTop: '6px' }}>
                  This test account can be used for instant testing and deleted anytime.
                </p>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#888888' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  style={{ fontWeight: 600, color: '#171717', textDecoration: 'underline' }}
                >
                  Sign in here
                </button>
              </div>
            </div>
          ) : (
            /* ==============================================================
                TAB 2: SIGN IN (NEW ACCOUNT CREATION)
                Mandatory: First Name, Last Name, Email, Phone, Password
                ============================================================== */
            <div>
              <p style={{ fontSize: '0.86rem', color: '#888888', marginBottom: '18px' }}>
                Please provide your details below. All fields are mandatory to create an account.
              </p>

              {signinError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={15} flex-shrink={0} />
                  <span>{signinError}</span>
                </div>
              )}

              <form onSubmit={handleSigninSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1 & 2: First Name & Last Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: touched.firstName && !isFirstNameValid ? '1px solid #EF4444' : '1px solid #E0E0E0',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: touched.lastName && !isLastNameValid ? '1px solid #EF4444' : '1px solid #E0E0E0',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                {/* 3: Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: touched.email && !isEmailValid ? '1px solid #EF4444' : '1px solid #E0E0E0',
                      fontSize: '0.88rem'
                    }}
                  />
                  {touched.email && !isEmailValid && (
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '2px', display: 'block' }}>
                      Please enter a valid email address.
                    </span>
                  )}
                </div>

                {/* 4: Phone Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: touched.phone && !isPhoneValid ? '1px solid #EF4444' : '1px solid #E0E0E0',
                      fontSize: '0.88rem'
                    }}
                  />
                  {touched.phone && !isPhoneValid && (
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '2px', display: 'block' }}>
                      A valid phone number is required.
                    </span>
                  )}
                </div>

                {/* 5: Create Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                    Create Password * (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: touched.password && !isPasswordValid ? '1px solid #EF4444' : '1px solid #E0E0E0',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.74rem', color: '#888888', marginTop: '2px' }}>
                  * All 5 fields are strictly mandatory to complete registration.
                </div>

                <button
                  type="submit"
                  className="wf-btn-add-to-cart"
                  style={{
                    marginTop: '8px',
                    opacity: isFormComplete ? 1 : 0.8
                  }}
                >
                  Create Account &amp; Sign In
                </button>
              </form>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#888888' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{ fontWeight: 600, color: '#171717', textDecoration: 'underline' }}
                >
                  Log in here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
