import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    currency: 'INR',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation (FR-VAL-01 / FR-AUTH-02)
    const errs = {};
    if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
      }}
    >
      <div className="modal-card" style={{ maxWidth: '480px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="brand-logo-icon"
            style={{ margin: '0 auto 14px auto', width: '48px', height: '48px' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M4 19V11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10 19V6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 19V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M22 19V4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>Create an Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Join ExpenseTrack to take full control of your finances
          </p>
        </div>

        {errors.general && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--accent-red-bg)',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
              marginBottom: '18px',
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                placeholder="Dinesh"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                placeholder="Kumar"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="e.g. dineshkumar"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>
                {Array.isArray(errors.username) ? errors.username[0] : errors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="dinesh@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>
                {Array.isArray(errors.email) ? errors.email[0] : errors.email}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
              {errors.confirm_password && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>
                  {Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started Free'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

