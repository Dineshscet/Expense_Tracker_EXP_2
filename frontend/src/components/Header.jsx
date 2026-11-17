import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, Calendar, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  alerts = [],
}) {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const monthOptions = [
    { label: 'Nov 1 – Nov 30, 2025', month: 11, year: 2025 },
    { label: 'Nov 1 – Nov 30, 2026', month: 11, year: 2026 },
    { label: 'Oct 1 – Oct 31, 2025', month: 10, year: 2025 },
    { label: 'Dec 1 – Dec 31, 2025', month: 12, year: 2025 },
    { label: 'Current Month', month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  ];

  const currentLabel =
    monthOptions.find((m) => m.month === selectedMonth && m.year === selectedYear)?.label ||
    `Month ${selectedMonth}, ${selectedYear}`;

  return (
    <div>
      {/* Top Search & Actions Bar */}
      <div className="top-header">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder='Search transactions... (e.g. "food", "UPI")'
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
        </div>

        <div className="header-actions">
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={18} />
              {alerts.length > 0 && <span className="notification-badge"></span>}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '300px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  zIndex: 200,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>
                  Notifications & Alerts
                </div>
                {alerts.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>
                    All budgets are healthy and on track! 👍
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alerts.map((alt, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          color: 'var(--accent-red)',
                        }}
                      >
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{alt.category_name}</strong> budget at {alt.percentage}% limit!
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* Greeting & Date Picker Row */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>
            <span>{getGreeting()}, {user?.first_name || user?.username || 'Dinesh'}!</span>
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p>Here's your expense overview for this month.</p>
        </div>

        {/* Date Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="date-filter-pill"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={15} />
            <span>{currentLabel}</span>
            <ChevronDown size={14} />
          </button>

          {showDatePicker && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: '0',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                zIndex: 150,
                minWidth: '200px',
              }}
            >
              {monthOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMonth(opt.month);
                    setSelectedYear(opt.year);
                    setShowDatePicker(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: opt.month === selectedMonth && opt.year === selectedYear ? 'var(--accent-purple)' : 'var(--text-primary)',
                    fontWeight: opt.month === selectedMonth && opt.year === selectedYear ? 600 : 400,
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.target.style.background = 'none')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

