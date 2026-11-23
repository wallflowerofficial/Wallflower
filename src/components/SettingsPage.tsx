import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Camera,
  X,
  Home,
  Building,
  CheckCircle2,
  Lock,
  KeyRound,
  Shield,
  ShieldCheck,
  Bell,
  Download,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  AlertTriangle,
  FileText,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  User,
  UserAddress,
  SettingsTab,
  UserNotificationPreferences,
  UserSession
} from '../types';
import {
  DEFAULT_ACTIVE_SESSIONS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getStoredOrders
} from '../data/auth';

interface SettingsPageProps {
  user: User | null;
  initialTab?: SettingsTab;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteAccount: (userId: string) => void;
  onBackToCatalog: () => void;
  onShowToast: (message: string) => void;
  onLogout?: () => void;
}

// Toggle Switch Subcomponent for Notification & Privacy settings
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
}> = ({ checked, onChange, id, disabled = false }) => (
  <button
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    style={{
      width: '44px',
      height: '24px',
      backgroundColor: checked ? '#171717' : '#E5E7EB',
      borderRadius: '12px',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      padding: 0,
      transition: 'background-color 0.2s ease',
      flexShrink: 0,
      opacity: disabled ? 0.6 : 1
    }}
  >
    <div
      style={{
        width: '18px',
        height: '18px',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%',
        position: 'absolute',
        top: '3px',
        left: checked ? '23px' : '3px',
        transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)'
      }}
    />
  </button>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  initialTab = 'profile',
  onUpdateUser,
  onDeleteAccount,
  onBackToCatalog,
  onShowToast,
  onLogout
}) => {
  if (!user) {
    return (
      <div className="wf-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#888888" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
          Please Sign In
        </h2>
        <p style={{ color: '#888888', marginBottom: '24px', fontSize: '0.9rem' }}>
          You must be signed in to manage your profile settings, addresses, and security.
        </p>
        <button
          className="wf-btn-add-to-cart"
          style={{ maxWidth: '200px', margin: '0 auto' }}
          onClick={onBackToCatalog}
        >
          Explore Prints
        </button>
      </div>
    );
  }

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Profile fields state
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState<string>(user.avatar || '');
  const [profileError, setProfileError] = useState('');
  const [profileEmptyFields, setProfileEmptyFields] = useState<Set<string>>(new Set());
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address state
  const addresses: UserAddress[] = user.addresses || [];

  // "Add new address" pop-up modal state
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressEmptyFields, setAddressEmptyFields] = useState<Set<string>>(new Set());

  // ==============================================================
  // TAB 3: LOGIN & SECURITY STATE
  // ==============================================================
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  // Reset password states
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResetSimulating, setIsResetSimulating] = useState(false);

  // Active sessions state
  const [sessions, setSessions] = useState<UserSession[]>(() => {
    return user.activeSessions && user.activeSessions.length > 0
      ? user.activeSessions
      : DEFAULT_ACTIVE_SESSIONS;
  });

  // ==============================================================
  // TAB 4: NOTIFICATIONS STATE
  // ==============================================================
  const [notifications, setNotifications] = useState<UserNotificationPreferences>(() => ({
    orderUpdates: user.notifications?.orderUpdates ?? true,
    shippingNotifications: user.notifications?.shippingNotifications ?? true,
    promotionalEmails: user.notifications?.promotionalEmails ?? false,
    offers: user.notifications?.offers ?? true,
    smsTracking: user.notifications?.smsTracking ?? true,
    qualityAlerts: user.notifications?.qualityAlerts ?? true
  }));
  const [isNotifSaved, setIsNotifSaved] = useState(false);

  // ==============================================================
  // TAB 5: PRIVACY & ACCOUNT STATE + DELETION MODAL
  // ==============================================================
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('No longer needed');
  const [deleteError, setDeleteError] = useState('');
  const [expandedPrivacyPolicy, setExpandedPrivacyPolicy] = useState(false);

  // Profile Picture Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      setProfileError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Personal Details & Profiles
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    const missing: string[] = [];
    const missingKeys = new Set<string>();

    if (!firstName.trim()) {
      missing.push('First Name');
      missingKeys.add('firstName');
    }
    if (!lastName.trim()) {
      missing.push('Last Name');
      missingKeys.add('lastName');
    }
    if (!email.trim()) {
      missing.push('Email Address');
      missingKeys.add('email');
    }
    if (!phone.trim()) {
      missing.push('Phone Number');
      missingKeys.add('phone');
    }

    setProfileEmptyFields(missingKeys);

    if (missing.length > 0) {
      setProfileError(`The following fields are empty: ${missing.join(', ')}. All fields marked with * are mandatory.`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setProfileError('Please provide a valid email address (e.g. name@example.com).');
      setProfileEmptyFields(new Set(['email']));
      return;
    }

    const updated: User = {
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      avatar
    };

    onUpdateUser(updated);
    setIsProfileSaved(true);
    onShowToast('Personal details and profile saved successfully.');
    setTimeout(() => {
      setIsProfileSaved(false);
    }, 2000);
  };

  // Open Add Address Pop Up
  const handleOpenAddAddress = () => {
    setAddrName('');
    setAddrLine1('');
    setAddrLine2('');
    setAddrPincode('');
    setAddrCity('');
    setAddrState('');
    setAddrIsDefault(addresses.length === 0);
    setAddressError('');
    setAddressEmptyFields(new Set());
    setIsAddAddressModalOpen(true);
  };

  // Close Add Address Pop Up (Cancel option)
  const handleCloseAddAddress = () => {
    setIsAddAddressModalOpen(false);
    setAddressError('');
    setAddressEmptyFields(new Set());
  };

  // Save New Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    const missing: string[] = [];
    const missingKeys = new Set<string>();

    if (!addrName.trim()) {
      missing.push('Name of the address');
      missingKeys.add('name');
    }
    if (!addrLine1.trim()) {
      missing.push('Shipping address line 1');
      missingKeys.add('addressLine1');
    }
    if (!addrPincode.trim()) {
      missing.push('Pin/Zipcode');
      missingKeys.add('pincode');
    }
    if (!addrCity.trim()) {
      missing.push('City Name');
      missingKeys.add('cityName');
    }
    if (!addrState.trim()) {
      missing.push('State');
      missingKeys.add('state');
    }

    setAddressEmptyFields(missingKeys);

    if (missing.length > 0) {
      setAddressError(`Please fill in all mandatory fields: ${missing.join(', ')}.`);
      return;
    }

    const newAddress: UserAddress = {
      id: 'addr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: addrName.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim() ? addrLine2.trim() : undefined,
      pincode: addrPincode.trim(),
      cityName: addrCity.trim(),
      state: addrState.trim(),
      isDefault: addrIsDefault || addresses.length === 0,
      createdAt: new Date().toISOString()
    };

    let updatedAddresses = [...addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    const updatedUser: User = {
      ...user,
      addresses: updatedAddresses,
      address: `${newAddress.addressLine1}${newAddress.addressLine2 ? ', ' + newAddress.addressLine2 : ''}, ${newAddress.cityName}, ${newAddress.state} ${newAddress.pincode}`
    };

    onUpdateUser(updatedUser);
    setIsAddAddressModalOpen(false);
    onShowToast(`Address "${newAddress.name}" saved to Address.`);
  };

  // Delete an existing address
  const handleDeleteAddress = (addressId: string, addressName: string) => {
    if (!window.confirm(`Are you sure you want to delete address "${addressName}"?`)) {
      return;
    }

    const remaining = addresses.filter((a) => a.id !== addressId);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }

    const defaultAddr = remaining.find((a) => a.isDefault) || remaining[0];
    const defaultAddressStr = defaultAddr
      ? `${defaultAddr.addressLine1}${defaultAddr.addressLine2 ? ', ' + defaultAddr.addressLine2 : ''}, ${defaultAddr.cityName}, ${defaultAddr.state} ${defaultAddr.pincode}`
      : '';

    const updatedUser: User = {
      ...user,
      addresses: remaining,
      address: defaultAddressStr
    };

    onUpdateUser(updatedUser);
    onShowToast(`Address "${addressName}" removed.`);
  };

  // Set an address as default
  const handleSetDefaultAddress = (addressId: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId
    }));

    const defaultAddr = updated.find((a) => a.id === addressId);
    const defaultAddressStr = defaultAddr
      ? `${defaultAddr.addressLine1}${defaultAddr.addressLine2 ? ', ' + defaultAddr.addressLine2 : ''}, ${defaultAddr.cityName}, ${defaultAddr.state} ${defaultAddr.pincode}`
      : user.address;

    const updatedUser: User = {
      ...user,
      addresses: updated,
      address: defaultAddressStr
    };

    onUpdateUser(updatedUser);
    onShowToast(`Default shipping address updated.`);
  };

  // ==============================================================
  // TAB 3 HANDLERS: CHANGE & RESET PASSWORD, SESSIONS, LOGOUT
  // ==============================================================
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'Empty', color: '#E5E7EB' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: '#EF4444' };
    if (score <= 3) return { score: 2, text: 'Medium', color: '#F59E0B' };
    return { score: 3, text: 'Strong', color: '#10B981' };
  };

  const pwdStrength = calculatePasswordStrength(newPassword);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation password do not match.');
      return;
    }
    // Check current password (demo password default is 'wallflower123')
    if (user.password && currentPassword !== user.password) {
      setPasswordError('Current password is incorrect. (Default demo password: wallflower123)');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password cannot be identical to your current password.');
      return;
    }

    const updatedUser: User = {
      ...user,
      password: newPassword
    };

    onUpdateUser(updatedUser);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordSaved(true);
    setPasswordSuccess('Password has been changed successfully!');
    onShowToast('Password updated successfully.');
    setTimeout(() => {
      setIsPasswordSaved(false);
    }, 2500);
  };

  const handleSendResetEmail = () => {
    setIsResetSimulating(true);
    setTimeout(() => {
      setIsResetSimulating(false);
      setResetEmailSent(true);
      onShowToast(`Password reset link sent to ${user.email}`);
    }, 400);
  };

  const handleRevokeSession = (sessionId: string, sessionDevice: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    onUpdateUser({
      ...user,
      activeSessions: updated
    });
    onShowToast(`Session on "${sessionDevice}" revoked.`);
  };

  const handleLogoutOtherDevices = () => {
    if (!window.confirm('Are you sure you want to log out of all other devices?')) {
      return;
    }
    const currentOnly = sessions.filter((s) => s.isCurrent);
    setSessions(currentOnly);
    onUpdateUser({
      ...user,
      activeSessions: currentOnly
    });
    onShowToast('Logged out of all other devices.');
  };

  const handleLogoutEverywhere = () => {
    if (!window.confirm('This will immediately terminate all active sessions including this one and sign you out. Continue?')) {
      return;
    }
    if (onLogout) {
      onLogout();
    } else {
      onShowToast('Signed out of all devices.');
      onBackToCatalog();
    }
  };

  // ==============================================================
  // TAB 4 HANDLERS: NOTIFICATIONS
  // ==============================================================
  const handleToggleNotification = (key: keyof UserNotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
  };

  const handleSaveNotifications = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedUser: User = {
      ...user,
      notifications
    };
    onUpdateUser(updatedUser);
    setIsNotifSaved(true);
    onShowToast('Notification preferences updated.');
    setTimeout(() => setIsNotifSaved(false), 2000);
  };

  // ==============================================================
  // TAB 5 HANDLERS: PRIVACY, DATA DOWNLOAD, ACCOUNT DELETION
  // ==============================================================
  const handleDownloadPersonalData = () => {
    const userOrders = getStoredOrders(user.id);
    const exportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        service: 'Wallflower Art Prints & Posters Studio',
        version: '1.2.0',
        environment: 'Production Archive'
      },
      userProfile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        isTestAccount: user.isTestAccount ?? false
      },
      savedAddresses: addresses,
      historicalOrders: userOrders,
      notificationPreferences: notifications,
      activeSessions: sessions
    };

    const dataString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `wallflower-data-${(user.firstName || 'user').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    onShowToast('Personal data exported successfully (JSON).');
  };

  const handleOpenDeleteModal = () => {
    setDeleteConfirmText('');
    setDeleteReason('No longer needed');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmAccountDeletion = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm account removal.');
      return;
    }
    setIsDeleteModalOpen(false);
    onDeleteAccount(user.id);
    onBackToCatalog();
  };

  return (
    <div className="wf-settings-page" style={{ padding: '36px 0 80px', minHeight: '80vh' }}>
      <div className="wf-container">
        {/* Page Title & Subtitle */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid #EAEAEA', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888' }}>
              Account Settings
            </span>
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
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#171717', letterSpacing: '-0.03em' }}>
            Settings
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#666666', marginTop: '6px' }}>
            Manage your personal profile, addresses, security, notifications, and privacy preferences.
          </p>
        </div>

        {/* Full-Screen Two-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '40px',
            alignItems: 'flex-start'
          }}
          className="wf-settings-grid"
        >
          {/* ==============================================================
              LEFT SIDE OF THE SCREEN: NAVIGATION MENU
              1. "Personal detail & profiles"
              2. "Address"
              3. "login & security"
              4. "Notifications"
              5. "Privacy & Account"
              ============================================================== */}
          <aside
            style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #EAEAEA',
              borderRadius: '12px',
              padding: '16px',
              position: 'sticky',
              top: '96px'
            }}
          >
            <div style={{ marginBottom: '16px', padding: '8px 12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888' }}>
                Navigation
              </span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Option 1: Personal detail & profiles */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  color: activeTab === 'profile' ? '#171717' : '#555555',
                  backgroundColor: activeTab === 'profile' ? '#FFFFFF' : 'transparent',
                  border: activeTab === 'profile' ? '1px solid #E0E0E0' : '1px solid transparent',
                  boxShadow: activeTab === 'profile' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <UserIcon size={18} color={activeTab === 'profile' ? '#171717' : '#888888'} />
                <span>Personal detail &amp; profiles</span>
              </button>

              {/* Option 2: Address */}
              <button
                type="button"
                onClick={() => setActiveTab('address')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'address' ? 700 : 500,
                  color: activeTab === 'address' ? '#171717' : '#555555',
                  backgroundColor: activeTab === 'address' ? '#FFFFFF' : 'transparent',
                  border: activeTab === 'address' ? '1px solid #E0E0E0' : '1px solid transparent',
                  boxShadow: activeTab === 'address' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} color={activeTab === 'address' ? '#171717' : '#888888'} />
                  <span>Address</span>
                </div>
                {addresses.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === 'address' ? '#171717' : '#EAEAEA',
                      color: activeTab === 'address' ? '#FFFFFF' : '#666666',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {addresses.length}
                  </span>
                )}
              </button>

              {/* Option 3: login & security */}
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'security' ? 700 : 500,
                  color: activeTab === 'security' ? '#171717' : '#555555',
                  backgroundColor: activeTab === 'security' ? '#FFFFFF' : 'transparent',
                  border: activeTab === 'security' ? '1px solid #E0E0E0' : '1px solid transparent',
                  boxShadow: activeTab === 'security' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Lock size={18} color={activeTab === 'security' ? '#171717' : '#888888'} />
                <span>login &amp; security</span>
              </button>

              {/* Option 4: Notifications */}
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'notifications' ? 700 : 500,
                  color: activeTab === 'notifications' ? '#171717' : '#555555',
                  backgroundColor: activeTab === 'notifications' ? '#FFFFFF' : 'transparent',
                  border: activeTab === 'notifications' ? '1px solid #E0E0E0' : '1px solid transparent',
                  boxShadow: activeTab === 'notifications' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bell size={18} color={activeTab === 'notifications' ? '#171717' : '#888888'} />
                <span>Notifications</span>
              </button>

              {/* Option 5: Privacy & Account */}
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'privacy' ? 700 : 500,
                  color: activeTab === 'privacy' ? '#171717' : '#555555',
                  backgroundColor: activeTab === 'privacy' ? '#FFFFFF' : 'transparent',
                  border: activeTab === 'privacy' ? '1px solid #E0E0E0' : '1px solid transparent',
                  boxShadow: activeTab === 'privacy' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={18} color={activeTab === 'privacy' ? '#171717' : '#888888'} />
                <span>Privacy &amp; Account</span>
              </button>
            </nav>

            {/* User Profile Mini Badge at bottom of sidebar */}
            <div
              style={{
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid #EAEAEA',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingLeft: '6px'
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#171717',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  `${firstName.charAt(0)}${lastName.charAt(0)}`
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#171717',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {firstName} {lastName}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    color: '#888888',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {email}
                </span>
              </div>
            </div>
          </aside>

          {/* ==============================================================
              RIGHT SIDE OF THE SCREEN: CONTENT SECTION
              ============================================================== */}
          <main style={{ minWidth: 0, width: '100%' }}>
            {/* ------------------------------------------------------------
                TAB 1: PERSONAL DETAIL & PROFILES
                ------------------------------------------------------------ */}
            {activeTab === 'profile' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAEAEA',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '28px', borderBottom: '1px solid #F0F0F0', paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Personal detail &amp; profiles
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#777777' }}>
                    Update your display name, contact information, and avatar photo.
                  </p>
                </div>

                {profileError && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      color: '#B91C1C',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      lineHeight: 1.4
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Avatar Upload */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px',
                      padding: '20px',
                      backgroundColor: '#FAFAFA',
                      borderRadius: '10px',
                      border: '1px solid #EAEAEA'
                    }}
                  >
                    <div
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#EBEBEB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        flexShrink: 0
                      }}
                    >
                      {avatar ? (
                        <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#171717' }}>
                          {firstName.charAt(0)}{lastName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717' }}>
                        Profile Photo
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            backgroundColor: '#171717',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Camera size={14} />
                          <span>Upload Photo</span>
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 500,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #EAEAEA',
                              color: '#666666',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#888888' }}>
                        Square JPG or PNG, maximum 5MB.
                      </span>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                        First Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (e.target.value.trim()) {
                            setProfileEmptyFields((prev) => {
                              const next = new Set(prev);
                              next.delete('firstName');
                              return next;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: profileEmptyFields.has('firstName') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                          backgroundColor: profileEmptyFields.has('firstName') ? '#FFF5F5' : '#FFFFFF',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                        Last Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (e.target.value.trim()) {
                            setProfileEmptyFields((prev) => {
                              const next = new Set(prev);
                              next.delete('lastName');
                              return next;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: profileEmptyFields.has('lastName') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                          backgroundColor: profileEmptyFields.has('lastName') ? '#FFF5F5' : '#FFFFFF',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                      Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value.trim()) {
                          setProfileEmptyFields((prev) => {
                            const next = new Set(prev);
                            next.delete('email');
                            return next;
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: profileEmptyFields.has('email') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                        backgroundColor: profileEmptyFields.has('email') ? '#FFF5F5' : '#FFFFFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                      Phone Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (e.target.value.trim()) {
                          setProfileEmptyFields((prev) => {
                            const next = new Set(prev);
                            next.delete('phone');
                            return next;
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: profileEmptyFields.has('phone') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                        backgroundColor: profileEmptyFields.has('phone') ? '#FFF5F5' : '#FFFFFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#888888', marginTop: '-4px' }}>
                    <span style={{ color: '#EF4444' }}>*</span> All fields marked with * are mandatory.
                  </div>

                  {/* Save Profile Button */}
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="submit"
                      className="wf-btn-add-to-cart"
                      style={{
                        maxWidth: '240px',
                        backgroundColor: isProfileSaved ? '#10B981' : '#171717'
                      }}
                    >
                      {isProfileSaved ? (
                        <>
                          <Check size={16} />
                          <span>Changes Saved!</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Account Deletion Prompt in Profile Tab */}
                <div
                  style={{
                    marginTop: '40px',
                    paddingTop: '24px',
                    borderTop: '1px solid #EAEAEA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                      Delete Account
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#888888' }}>
                      Permanently remove your account, saved addresses, and profile data in Privacy &amp; Account.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenDeleteModal}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#DC2626',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 2: ADDRESS
                ------------------------------------------------------------ */}
            {activeTab === 'address' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAEAEA',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header with "Add new address" button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '28px',
                    borderBottom: '1px solid #F0F0F0',
                    paddingBottom: '20px'
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                      Address
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: '#777777' }}>
                      Manage your delivery locations. Add as many addresses as you need.
                    </p>
                  </div>

                  {/* "Add new address" button */}
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      backgroundColor: '#171717',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <Plus size={16} strokeWidth={2.2} />
                    <span>Add new address</span>
                  </button>
                </div>

                {/* Stored Addresses List */}
                {addresses.length === 0 ? (
                  <div
                    style={{
                      padding: '56px 20px',
                      textAlign: 'center',
                      backgroundColor: '#FAFAFA',
                      borderRadius: '10px',
                      border: '1px dashed #D1D5DB'
                    }}
                  >
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: '#888888'
                      }}
                    >
                      <MapPin size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                      No saved addresses
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#777777', maxWidth: '340px', margin: '0 auto 20px' }}>
                      You haven't added any delivery addresses yet. Add your address for faster checkout.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        backgroundColor: '#171717',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={15} />
                      <span>Add new address</span>
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '20px'
                    }}
                  >
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          border: addr.isDefault ? '2px solid #171717' : '1px solid #EAEAEA',
                          borderRadius: '10px',
                          padding: '20px',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          {/* Card Top: Name of address & Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: addr.isDefault ? '#171717' : '#F0F0F0',
                                  color: addr.isDefault ? '#FFFFFF' : '#666666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {addr.name.toLowerCase().includes('office') || addr.name.toLowerCase().includes('work') ? (
                                  <Building size={14} />
                                ) : (
                                  <Home size={14} />
                                )}
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#171717' }}>
                                {addr.name}
                              </span>
                            </div>

                            {addr.isDefault && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  backgroundColor: '#F0F0F0',
                                  color: '#171717',
                                  padding: '3px 8px',
                                  borderRadius: '12px'
                                }}
                              >
                                Default
                              </span>
                            )}
                          </div>

                          {/* Address lines */}
                          <div style={{ fontSize: '0.86rem', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontWeight: 500, color: '#171717' }}>
                              {addr.addressLine1}
                            </p>
                            {addr.addressLine2 && (
                              <p style={{ margin: 0 }}>
                                {addr.addressLine2}
                              </p>
                            )}
                            <p style={{ margin: 0, marginTop: '4px' }}>
                              {addr.cityName}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Card bottom actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '12px',
                            borderTop: '1px solid #F0F0F0'
                          }}
                        >
                          <div>
                            {!addr.isDefault ? (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  color: '#2677E8',
                                  background: 'none',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                Set as default
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <CheckCircle2 size={13} />
                                <span>Default Address</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id, addr.name)}
                            title="Delete address"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#888888',
                              background: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#DC2626';
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#888888';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 3: LOGIN & SECURITY
                Allows the user to:
                1. Change password
                2. Reset password
                3. View active sessions
                4. Log out of all devices
                ------------------------------------------------------------ */}
            {activeTab === 'security' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAEAEA',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '36px'
                }}
              >
                {/* Header */}
                <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '18px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    login &amp; security
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#777777' }}>
                    Change password, reset password, view active sessions and log out of all devices.
                  </p>
                </div>

                {/* 1. CHANGE PASSWORD SECTION */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <KeyRound size={20} color="#171717" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      Change Password
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Use a strong password of at least 6 characters with a combination of letters and numbers.
                  </p>

                  {passwordError && (
                    <div
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        color: '#B91C1C',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div
                      style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #DCFCE7',
                        color: '#15803D',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Current Password */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#171717' }}>
                          Current Password <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#888888' }}>
                          Default demo: <code>wallflower123</code>
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter your existing password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            fontSize: '0.9rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#888888',
                            cursor: 'pointer',
                            padding: 0
                          }}
                          aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password & Confirmation */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                          New Password <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#888888',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Password strength visualizer */}
                        {newPassword && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#666666' }}>Strength:</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pwdStrength.color }}>
                                {pwdStrength.text}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                              <div style={{ flex: 1, borderRadius: '2px', backgroundColor: pwdStrength.score >= 1 ? pwdStrength.color : '#E5E7EB' }} />
                              <div style={{ flex: 1, borderRadius: '2px', backgroundColor: pwdStrength.score >= 2 ? pwdStrength.color : '#E5E7EB' }} />
                              <div style={{ flex: 1, borderRadius: '2px', backgroundColor: pwdStrength.score >= 3 ? pwdStrength.color : '#E5E7EB' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                          Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#888888',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="submit"
                        style={{
                          padding: '10px 22px',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          backgroundColor: isPasswordSaved ? '#10B981' : '#171717',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {isPasswordSaved ? (
                          <>
                            <Check size={16} />
                            <span>Password Changed!</span>
                          </>
                        ) : (
                          <span>Change password</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. RESET PASSWORD SECTION */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Mail size={20} color="#171717" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      Reset Password
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '16px' }}>
                    Forgotten your credentials or locked out? Trigger an email reset link to your verified address.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '16px 18px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAEAEA',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888', fontWeight: 700, display: 'block' }}>
                        Target Email Address
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#171717' }}>
                        {user.email}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isResetSimulating}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        color: '#171717',
                        border: '1px solid #171717',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#171717';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#171717';
                      }}
                    >
                      <RefreshCw size={14} className={isResetSimulating ? 'wf-spin' : ''} />
                      <span>{resetEmailSent ? 'Resend reset link' : 'reset password'}</span>
                    </button>
                  </div>

                  {resetEmailSent && (
                    <div
                      style={{
                        marginTop: '16px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        color: '#1E40AF',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        A secure password reset link has been dispatched to <strong>{user.email}</strong>. The link will remain active for 60 minutes.
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. ACTIVE SESSIONS SECTION */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Laptop size={20} color="#171717" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                        Active Sessions
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                      {sessions.length} authorized device{sessions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '18px' }}>
                    View active sessions currently logged in to your Wallflower account. Terminate any unfamiliar sessions immediately.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: sess.isCurrent ? '1.5px solid #171717' : '1px solid #EAEAEA',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: sess.isCurrent ? '#171717' : '#F5F5F5',
                              color: sess.isCurrent ? '#FFFFFF' : '#666666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {sess.device.toLowerCase().includes('iphone') || sess.device.toLowerCase().includes('phone') ? (
                              <Smartphone size={20} />
                            ) : (
                              <Laptop size={20} />
                            )}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#171717' }}>
                                {sess.device}
                              </span>
                              {sess.isCurrent && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    backgroundColor: '#DCFCE7',
                                    color: '#166534',
                                    padding: '2px 7px',
                                    borderRadius: '10px'
                                  }}
                                >
                                  Current Device
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '2px' }}>
                              <span>{sess.browser}</span> · <span>{sess.location}</span> · <span>IP {sess.ip}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: '2px' }}>
                              Last activity: <strong>{sess.lastActive}</strong>
                            </div>
                          </div>
                        </div>

                        {!sess.isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id, sess.device)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#DC2626',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <LogOut size={13} />
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>
                            ● Active now
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. LOG OUT OF ALL DEVICES SECTION */}
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <LogOut size={20} color="#DC2626" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                      Log out of all devices
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginBottom: '18px' }}>
                    Lost a mobile phone, tablet, or logged into a shared studio computer? You can immediately disconnect all sessions across desktop and mobile devices.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleLogoutOtherDevices}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <LogOut size={14} />
                      <span>Log out of other devices</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogoutEverywhere}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#B91C1C';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#DC2626';
                      }}
                    >
                      <LogOut size={14} />
                      <span>Log out of all devices (everywhere)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 4: NOTIFICATIONS
                Manage:
                1. Order updates
                2. Shipping notifications
                3. Promotional emails and offers
                ------------------------------------------------------------ */}
            {activeTab === 'notifications' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAEAEA',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px'
                }}
              >
                {/* Header */}
                <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '18px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Notifications
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#777777' }}>
                    Manage order updates, shipping notifications, promotional emails and offers.
                  </p>
                </div>

                {/* 1. ORDER UPDATES */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Order updates
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Essential transactional messages about payments, giclée printing proofs, and digital tax invoices.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Toggle: Order confirmation and invoices */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Order Confirmation &amp; Digital Invoices
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Receive digital receipts, payment confirmation, and tax invoices immediately upon purchase.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.orderUpdates}
                        onChange={(val) => handleToggleNotification('orderUpdates', val)}
                        id="toggle-order-updates"
                      />
                    </div>

                    {/* Toggle: Quality & Printing alerts */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Printing &amp; Framing Inspection Updates
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Alerts when your 250gsm archival poster begins pigment printing and framing quality checks.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.qualityAlerts ?? true}
                        onChange={(val) => handleToggleNotification('qualityAlerts', val)}
                        id="toggle-quality-alerts"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SHIPPING NOTIFICATIONS */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Shipping notifications
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Courier dispatch milestones, carbon-neutral tracking links, and delivery agent alerts.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Toggle: Dispatch & Live tracking */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Dispatch &amp; Live Tracking Details
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Notification when your reinforced poster tube is handed over to BlueDart with tracking code.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.shippingNotifications}
                        onChange={(val) => handleToggleNotification('shippingNotifications', val)}
                        id="toggle-shipping-notifications"
                      />
                    </div>

                    {/* Toggle: SMS Alerts */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Out-for-Delivery SMS Alerts
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Receive SMS messages to {user.phone || 'your phone number'} with courier agent details and delivery OTP.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.smsTracking ?? true}
                        onChange={(val) => handleToggleNotification('smsTracking', val)}
                        id="toggle-sms-tracking"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PROMOTIONAL EMAILS AND OFFERS */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Promotional emails and offers
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Special collector privileges, seasonal gallery sales, and editorial stories on contemporary prints.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Toggle: Promotional emails */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Promotional Emails &amp; Editorial Drops
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Bi-weekly releases highlighting limited-edition artist collaborations and visual print galleries.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.promotionalEmails}
                        onChange={(val) => handleToggleNotification('promotionalEmails', val)}
                        id="toggle-promotional-emails"
                      />
                    </div>

                    {/* Toggle: Offers & Discounts */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171717', display: 'block' }}>
                          Special Offers &amp; Collector Discounts
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                          Exclusive coupon vouchers, anniversary collector promotions, and free framing codes.
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={notifications.offers}
                        onChange={(val) => handleToggleNotification('offers', val)}
                        id="toggle-offers"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Notification Preferences Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleSaveNotifications()}
                    style={{
                      padding: '11px 26px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      backgroundColor: isNotifSaved ? '#10B981' : '#171717',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {isNotifSaved ? (
                      <>
                        <Check size={16} />
                        <span>Preferences Saved!</span>
                      </>
                    ) : (
                      <span>Save notification preferences</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 5: PRIVACY & ACCOUNT
                Shows:
                1. Privacy information
                2. Download personal data
                3. Request account deletion
                ------------------------------------------------------------ */}
            {activeTab === 'privacy' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAEAEA',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px'
                }}
              >
                {/* Header */}
                <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '18px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717', marginBottom: '4px' }}>
                    Privacy &amp; Account
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#777777' }}>
                    Privacy information, download personal data and request account deletion.
                  </p>
                </div>

                {/* 1. PRIVACY INFORMATION */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <ShieldCheck size={20} color="#171717" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      Privacy information
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Transparency is central to our values. Here is how your personal information is processed, stored, and defended.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Info Card 1 */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '6px' }}>
                        1. Data We Collect
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                        We collect your name, contact phone number, shipping address, and email strictly for order fulfillment, courier delivery, and authentication.
                      </p>
                    </div>

                    {/* Info Card 2 */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '6px' }}>
                        2. Zero Third-Party Advertising
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                        Wallflower never sells, rents, or monetizes personal data with advertisers or brokers. Only verified logistics carriers receive shipping details.
                      </p>
                    </div>

                    {/* Info Card 3 */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '6px' }}>
                        3. Encrypted Transactions
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                        All network communication is secured over TLS 1.3 encryption. Payment card data is processed directly via PCI-DSS compliant gateways.
                      </p>
                    </div>

                    {/* Info Card 4 */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '6px' }}>
                        4. Your Privacy Rights
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                        Under GDPR and India's DPDP Act, you have absolute rights to access, portable download, rectify, or request complete account erasure.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedPrivacyPolicy(!expandedPrivacyPolicy)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#2677E8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{expandedPrivacyPolicy ? 'Hide detailed legal privacy notice' : 'Read full Wallflower privacy policy & terms'}</span>
                      <ExternalLink size={13} />
                    </button>

                    {expandedPrivacyPolicy && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '14px 16px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          color: '#555555',
                          lineHeight: 1.6
                        }}
                      >
                        <p style={{ margin: '0 0 8px 0' }}>
                          <strong>Archival Print Data Retention:</strong> Order records and delivery invoices are preserved for financial auditing and tax compliance as legally mandated for Indian e-commerce platforms. Personal address book information and unfulfilled cart data remain within your full user discretion and can be cleared at any moment.
                        </p>
                        <p style={{ margin: 0 }}>
                          For specialized data inquiries or formal regulatory requests, contact our designated Data Protection Officer at <code>privacy@wallflower.art</code>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. DOWNLOAD PERSONAL DATA */}
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAEA',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Download size={20} color="#171717" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      download personal data
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '20px' }}>
                    Obtain a complete machine-readable copy of your personal data archive, including your user profile, saved delivery addresses, historical orders, and active sessions.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '18px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAEAEA',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#171717', display: 'block' }}>
                        Wallflower Account Archive (.JSON)
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                        Includes profile credentials, address book, purchases, and notification flags.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadPersonalData}
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        backgroundColor: '#171717',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#333333';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#171717';
                      }}
                    >
                      <Download size={16} />
                      <span>Download personal data</span>
                    </button>
                  </div>
                </div>

                {/* 3. REQUEST ACCOUNT DELETION */}
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    borderRadius: '10px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Trash2 size={20} color="#DC2626" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                      request account deletion
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginBottom: '18px' }}>
                    Permanently delete your profile, saved addresses, order archives, and active credentials. Once executed, this action cannot be recovered or restored.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '16px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FECACA',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#991B1B', display: 'block' }}>
                        Irreversible Account Termination
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#666666' }}>
                        All personal records and logins will be purged immediately from local storage.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenDeleteModal}
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#B91C1C';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#DC2626';
                      }}
                    >
                      <Trash2 size={15} />
                      <span>request account deletion</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ==============================================================
          ADD NEW ADDRESS POP UP (MODAL)
          ============================================================== */}
      {isAddAddressModalOpen && (
        <div className="wf-modal-backdrop" role="dialog" aria-modal="true">
          <div
            className="wf-checkout-modal"
            style={{
              maxWidth: '560px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Pop up Header */}
            <div className="wf-modal-header" style={{ padding: '20px 24px', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888' }}>
                  Address Book
                </span>
                <h3 className="wf-modal-title" style={{ marginTop: '2px' }}>
                  Add new address
                </h3>
              </div>
              <button
                className="wf-cart-close-btn"
                onClick={handleCloseAddAddress}
                aria-label="Cancel and close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Pop up Body */}
            <div className="wf-modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {addressError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#B91C1C',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    lineHeight: 1.4
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{addressError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Name of the address(*) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    Name of the address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Home, Studio, Work, Parent's Place"
                    value={addrName}
                    onChange={(e) => {
                      setAddrName(e.target.value);
                      if (e.target.value.trim()) {
                        setAddressEmptyFields((prev) => {
                          const next = new Set(prev);
                          next.delete('name');
                          return next;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: addressEmptyFields.has('name') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                      backgroundColor: addressEmptyFields.has('name') ? '#FFF5F5' : '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#888888', marginTop: '3px', display: 'block' }}>
                    Give this address a memorable label (e.g. Home or Office)
                  </span>
                </div>

                {/* 2. Shipping address line 1(*) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    Shipping address line 1 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Flat / House no, Building name, Street address"
                    value={addrLine1}
                    onChange={(e) => {
                      setAddrLine1(e.target.value);
                      if (e.target.value.trim()) {
                        setAddressEmptyFields((prev) => {
                          const next = new Set(prev);
                          next.delete('addressLine1');
                          return next;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: addressEmptyFields.has('addressLine1') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                      backgroundColor: addressEmptyFields.has('addressLine1') ? '#FFF5F5' : '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* 3. Shipping address line 2 (optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    Shipping address line 2 <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#888888' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, landmark, nearby area"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Row: Pin/Zipcode(*) & City Name(*) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* 4. Pin/Zipcode(*) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                      Pin/Zipcode <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 560038"
                      value={addrPincode}
                      onChange={(e) => {
                        setAddrPincode(e.target.value);
                        if (e.target.value.trim()) {
                          setAddressEmptyFields((prev) => {
                            const next = new Set(prev);
                            next.delete('pincode');
                            return next;
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: addressEmptyFields.has('pincode') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                        backgroundColor: addressEmptyFields.has('pincode') ? '#FFF5F5' : '#FFFFFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* 5. City Name(*) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                      City Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={addrCity}
                      onChange={(e) => {
                        setAddrCity(e.target.value);
                        if (e.target.value.trim()) {
                          setAddressEmptyFields((prev) => {
                            const next = new Set(prev);
                            next.delete('cityName');
                            return next;
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: addressEmptyFields.has('cityName') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                        backgroundColor: addressEmptyFields.has('cityName') ? '#FFF5F5' : '#FFFFFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* 6. State(*) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                    State <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={addrState}
                    onChange={(e) => {
                      setAddrState(e.target.value);
                      if (e.target.value.trim()) {
                        setAddressEmptyFields((prev) => {
                          const next = new Set(prev);
                          next.delete('state');
                          return next;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: addressEmptyFields.has('state') ? '1px solid #EF4444' : '1px solid #D1D5DB',
                      backgroundColor: addressEmptyFields.has('state') ? '#FFF5F5' : '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Set as default checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="set-default-address"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#171717', cursor: 'pointer' }}
                  />
                  <label htmlFor="set-default-address" style={{ fontSize: '0.84rem', color: '#333333', cursor: 'pointer' }}>
                    Make this my default shipping address
                  </label>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#888888' }}>
                  <span style={{ color: '#EF4444' }}>*</span> Fields with (*) are mandatory to save the address.
                </div>

                {/* Pop up Action Buttons: "Save" and "Cancel" */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #F0F0F0'
                  }}
                >
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={handleCloseAddAddress}
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#555555',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.color = '#171717';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#555555';
                    }}
                  >
                    Cancel
                  </button>

                  {/* Save Button */}
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: '#171717',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#171717';
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          REQUEST ACCOUNT DELETION CONFIRMATION MODAL
          ============================================================== */}
      {isDeleteModalOpen && (
        <div className="wf-modal-backdrop" role="dialog" aria-modal="true">
          <div
            className="wf-checkout-modal"
            style={{
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="wf-modal-header" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="wf-modal-title" style={{ margin: 0, color: '#991B1B' }}>
                    request account deletion
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                    Permanent, irreversible action
                  </span>
                </div>
              </div>
              <button
                className="wf-cart-close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Cancel deletion"
              >
                <X size={20} />
              </button>
            </div>

            <div className="wf-modal-body" style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.5, marginTop: 0, marginBottom: '16px' }}>
                Are you sure you want to permanently delete your Wallflower account? All your personal profile records, saved delivery addresses, and preferences will be permanently wiped.
              </p>

              {deleteError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    marginBottom: '16px'
                  }}
                >
                  {deleteError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                  Reason for leaving (optional):
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.86rem',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="No longer needed">I no longer need this account</option>
                  <option value="Privacy concerns">Privacy or data concerns</option>
                  <option value="Created duplicate">Created a duplicate account</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                  Please type <span style={{ color: '#DC2626', fontWeight: 700 }}>DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    if (deleteError) setDeleteError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#555555',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAccountDeletion}
                  style={{
                    padding: '9px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#DC2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
