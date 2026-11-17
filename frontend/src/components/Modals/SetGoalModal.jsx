import React, { useState, useEffect } from 'react';
import { X, Star, Trophy } from 'lucide-react';
import api from '../../services/api';

export default function SetGoalModal({
  isOpen,
  onClose,
  onSuccess,
  editGoal = null,
}) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setTargetAmount(editGoal.target_amount);
      setCurrentAmount(editGoal.current_amount);
      setTargetDate(editGoal.target_date || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
    }
    setError('');
  }, [editGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a goal name.');
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        target_amount: parseFloat(targetAmount).toFixed(2),
        current_amount: parseFloat(currentAmount || 0).toFixed(2),
        target_date: targetDate || null,
        icon: 'Trophy',
        color: '#F59E0B',
      };

      if (editGoal) {
        await api.put(`/goals/${editGoal.id}/`, payload);
      } else {
        await api.post('/goals/', payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {editGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
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
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Trip to Japan ✈️, New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Amount (₹)</label>
              <input
                type="number"
                step="1"
                min="1"
                className="form-input"
                placeholder="50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Saved (₹)</label>
              <input
                type="number"
                step="1"
                min="0"
                className="form-input"
                placeholder="25000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}

