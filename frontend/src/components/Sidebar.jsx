import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeftRight,
  BarChart3,
  Target,
  Star,
  Settings,
  Crown,
  ChevronDown,
  LogOut,
  Sparkles,
  User,
  ChevronsUpDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Goals', path: '/goals', icon: Star },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div>
        {/* Brand Header */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 19V11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10 19V6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 19V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M22 19V4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="brand-title">ExpenseTrack</div>
            <div className="brand-subtitle">Track • Analyze • Save</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div>
        {/* Upgrade to Pro Card */}
        <div className="upgrade-card">
          <Crown className="upgrade-crown" size={24} />
          <div className="upgrade-title">Upgrade to Pro</div>
          <p className="upgrade-desc">
            Unlock advanced insights, export reports & more!
          </p>
          <button
            className="upgrade-btn"
            onClick={() => alert("ExpenseTrack Pro features: Unlimited exports, AI categorisation, receipt OCR coming soon in v2.0!")}
          >
            <span>Go Pro</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-bar"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div className="user-avatar-wrap">
              <div className="avatar-circle">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="18" fill="url(#avatar-grad)" />
                  <defs>
                    <linearGradient id="avatar-grad" x1="0" y1="0" x2="36" y2="36">
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <circle cx="18" cy="14" r="6" fill="#FDE68A" />
                  <path d="M12 12C12 9 14.5 7 18 7C21.5 7 24 9 24 12C24 12.5 23 11 21 11C19 11 18 12.5 18 12.5C18 12.5 17 11 15 11C13 11 12 12.5 12 12Z" fill="#1E1B4B" />
                  <path d="M12 12L14 15L15 13L17 15L18 13.5L19 15L21 13L22 15L24 12" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="16" cy="14" r="1" fill="#1E1B4B" />
                  <circle cx="20" cy="14" r="1" fill="#1E1B4B" />
                  <path d="M10 28C10 23 13.5 21 18 21C22.5 21 26 23 26 28V36H10V28Z" fill="#1E1B4B" />
                  <path d="M15 21L18 25L21 21" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="user-info-name">{user?.first_name || user?.username || 'Dinesh'}</div>
                <div className="user-info-plan">Free Plan &#x25BE;</div>
              </div>
            </div>
            <ChevronsUpDown size={16} color="var(--text-muted)" />
          </div>

          {/* Profile Dropdown Popup */}
          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '55px',
                left: '0',
                right: '0',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 150,
              }}
            >
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate('/settings');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: 'var(--accent-red)',
                  fontSize: '0.82rem',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'rgba(244,63,94,0.1)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

