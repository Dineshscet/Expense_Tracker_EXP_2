import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('dinesh');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
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
      <div className="modal-card" style={{ maxWidth: '440px', padding: '36px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Sign in to manage and analyze your personal expenses
          </p>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

