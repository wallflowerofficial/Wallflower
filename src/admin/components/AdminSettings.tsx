import React, { useState } from 'react';
import { Shield, Key, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { changeAdminPassword, getActivityLogs } from '../data/adminAuth';
import type { AdminUser } from '../types/admin';

interface AdminSettingsProps {
  admin: AdminUser;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ admin }) => {
  const [tab, setTab] = useState<'profile' | 'security' | 'logs'>('profile');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { showToast('New passwords do not match.', false); return; }
    if (newPwd.length < 8) { showToast('Password must be at least 8 characters.', false); return; }
    const result = changeAdminPassword(admin.id, currentPwd, newPwd);
    if (result.success) {
      showToast('Password changed successfully.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } else {
      showToast(result.error || 'Error changing password.', false);
    }
  };

  const logs = getActivityLogs();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-section-title">Admin Settings</h1>
        <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
          Manage your admin profile, security, and audit logs.
        </p>
      </div>

      <div className="adm-tabs" style={{ maxWidth: 460 }}>
        {(['profile', 'security', 'logs'] as const).map((t) => (
          <button key={t} className={`adm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' && <Shield size={14} />}
            {t === 'security' && <Key size={14} />}
            {t === 'logs' && <FileText size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="adm-card" style={{ maxWidth: 500 }}>
          <div className="adm-card-header"><span className="adm-card-title">Admin Profile</span></div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Admin ID', value: admin.id },
              { label: 'Username', value: admin.username },
              { label: 'Email', value: admin.email },
              { label: 'Account Created', value: new Date(admin.createdAt).toLocaleDateString('en-IN') },
              { label: 'Last Login', value: admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('en-IN') : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: '#6B7280' }}>{label}</span>
                <span style={{ fontWeight: 600, fontFamily: label === 'Admin ID' ? 'monospace' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="adm-card" style={{ maxWidth: 500 }}>
          <div className="adm-card-header"><span className="adm-card-title">Change Password</span></div>
          <div className="adm-card-body">
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Current Password</label>
                <input className="adm-form-input" type="password" required value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)} />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">New Password</label>
                <input className="adm-form-input" type="password" required value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)} minLength={8} />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Confirm New Password</label>
                <input className="adm-form-input" type="password" required value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)} />
              </div>
              <div>
                <button type="submit" className="adm-btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                  <Key size={15} /> Change Password
                </button>
              </div>
            </form>

            <div className="adm-divider" />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Login History</div>
              {(admin.loginHistory || []).slice(0, 5).map((rec) => (
                <div key={rec.id} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem',
                  padding: '6px 0', borderBottom: '1px solid #F3F4F6'
                }}>
                  <span style={{ color: '#6B7280' }}>{new Date(rec.timestamp).toLocaleString('en-IN')}</span>
                  <span style={{ color: rec.success ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                    {rec.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              ))}
              {!admin.loginHistory?.length && (
                <div style={{ color: '#9CA3AF', fontSize: '0.84rem' }}>No login history yet.</div>
              )}
            </div>

            <div className="adm-alert adm-alert-info">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>Sessions automatically expire after 8 hours of inactivity.</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Activity Log</span>
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{logs.length} entries (last 500)</span>
          </div>
          {logs.length === 0 ? (
            <div className="adm-empty-state">
              <FileText size={36} />
              <div className="adm-empty-title">No activity recorded yet</div>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.72rem', background: '#F3F4F6',
                          padding: '2px 6px', borderRadius: 4, color: '#374151'
                        }}>{log.action}</span>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>{log.description}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#6B7280' }}>
                        {log.targetId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="adm-toast" style={{ background: toast.ok ? '#111318' : '#EF4444' }}>
          {toast.ok
            ? <CheckCircle2 size={16} color="#22C55E" />
            : <AlertCircle size={16} color="#fff" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
