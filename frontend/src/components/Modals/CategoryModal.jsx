import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const COLOR_SWATCHES = [
  '#A855F7', '#EC4899', '#3B82F6', '#F97316', '#10B981',
  '#6366F1', '#EF4444', '#14B8A6', '#F59E0B', '#8B5CF6',
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  editCategory = null,
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#A855F7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setColor(editCategory.color || '#A855F7');
    } else {
      setName('');
      setColor('#A855F7');
    }
    setError('');
  }, [editCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        color: color,
        icon: 'Folder',
      };

      if (editCategory) {
        await api.put(`/categories/${editCategory.id}/`, payload);
      } else {
        await api.post('/categories/', payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.name) {
        setError(err.response.data.name[0]);
      } else {
        setError('Failed to save category.');
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
            {editCategory ? 'Edit Category' : 'Create Custom Category'}
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
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Investment, Freelance, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Badge Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {COLOR_SWATCHES.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setColor(hex)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: color === hex ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === hex ? '0 0 10px ' + hex : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : editCategory ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  );
}

