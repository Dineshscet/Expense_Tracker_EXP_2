import React, { useState, useEffect } from 'react';
import { User, Lock, Globe, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        currency: currency,
      });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPassMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password.';
      setPassMsg({ text: msg, type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Profile & Settings
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account information, default currency and security credentials
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} className="card-title-icon" />
              <span>Personal Details</span>
            </div>
          </div>

          {profileMsg.text && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: profileMsg.type === 'success' ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                color: profileMsg.type === 'success' ? 'var(--accent-green-light)' : 'var(--accent-red)',
                fontSize: '0.82rem',
              }}
            >
              {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
                <option value="GBP">British Pound (GBP - £)</option>
              </select>
            </div>

            <button type="submit" className="modal-submit-btn" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} className="card-title-icon" />
              <span>Change Password</span>
            </div>
          </div>

          {passMsg.text && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: passMsg.type === 'success' ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                color: passMsg.type === 'success' ? 'var(--accent-green-light)' : 'var(--accent-red)',
                fontSize: '0.82rem',
              }}
            >
              {passMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (min 8 characters)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="modal-submit-btn" disabled={passLoading}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

