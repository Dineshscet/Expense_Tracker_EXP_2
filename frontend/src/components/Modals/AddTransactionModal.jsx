import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../../services/api';

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'EXPENSE',
  editItem = null,
  categories = [],
}) {
  const [transactionType, setTransactionType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setTransactionType(editItem.transaction_type);
      setAmount(editItem.amount);
      setCategoryId(editItem.category);
      setDate(editItem.date);
      setPaymentMethod(editItem.payment_method);
      setDescription(editItem.description || '');
    } else {
      setTransactionType(initialType);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }
    setErrors({});
  }, [editItem, initialType, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client validation
    const errs = {};
    if (!amount || parseFloat(amount) <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }
    if (!categoryId) {
      errs.category = 'Please select a category.';
    }
    if (!date) {
      errs.date = 'Date is required.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        transaction_type: transactionType,
        amount: parseFloat(amount).toFixed(2),
        category: categoryId,
        date: date,
        payment_method: paymentMethod,
        description: description.trim(),
      };

      if (editItem) {
        await api.put(`/expenses/${editItem.id}/`, payload);
      } else {
        await api.post('/expenses/', payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Failed to save transaction. Please check server.' });
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
            {editItem ? 'Edit Transaction' : transactionType === 'INCOME' ? 'Add Income' : 'Add Expense'}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Type Selector Tabs */}
        {!editItem && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => setTransactionType('EXPENSE')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                background: transactionType === 'EXPENSE' ? 'var(--accent-red)' : 'var(--bg-input)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <ArrowUpRight size={16} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('INCOME')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                background: transactionType === 'INCOME' ? 'var(--accent-green)' : 'var(--bg-input)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <ArrowDownLeft size={16} />
              <span>Income</span>
            </button>
          </div>
        )}

        {errors.general && (
          <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', marginBottom: '12px' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="e.g. 450.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {errors.amount && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{errors.amount}</span>
            )}
          </div>

          <div className="form-row">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{errors.category}</span>
              )}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{errors.date}</span>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Note</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Zomato Dinner, Metro Grocery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : editItem ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

