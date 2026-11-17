import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: '#fff',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', margin: '10px 0' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        Back to Dashboard
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Pages */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/expenses" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Analytics />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
