import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import api from '../../services/api';

export default function SetBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  editBudget = null,
  categories = [],
  currentMonth = 11,
  currentYear = 2025,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editBudget) {
      setCategoryId(editBudget.category || '');
      setAmount(editBudget.amount);
      setMonth(editBudget.month);
      setYear(editBudget.year);
    } else {
      setCategoryId(categories[0]?.id || '');
      setAmount('');
      setMonth(currentMonth);
      setYear(currentYear);
    }
    setError('');
  }, [editBudget, isOpen, categories, currentMonth, currentYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a budget amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category: categoryId ? parseInt(categoryId) : null,
        amount: parseFloat(amount).toFixed(2),
        month: parseInt(month),
        year: parseInt(year),
      };

      if (editBudget) {
        await api.put(`/budgets/${editBudget.id}/`, payload);
      } else {
        await api.post('/budgets/', payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const d = err.response.data;
        setError(typeof d === 'string' ? d : Object.values(d).flat().join(' '));
      } else {
        setError('Failed to save budget.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {editBudget ? 'Edit Budget' : 'Set Monthly Budget'}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Overall Budget (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (₹)</label>
            <input
              type="number"
              step="1"
              min="1"
              className="form-input"
              placeholder="e.g. 4000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : editBudget ? 'Update Budget' : 'Save Budget'}
          </button>
        </form>
      </div>
    </div>
  );
}

