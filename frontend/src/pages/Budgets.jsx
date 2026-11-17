import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle,
  FolderPlus,
  Trash2,
  Edit,
  Folder,
  Sliders,
} from 'lucide-react';
import api from '../services/api';
import SetBudgetModal from '../components/Modals/SetBudgetModal';
import CategoryModal from '../components/Modals/CategoryModal';

export default function Budgets() {
  const [activeTab, setActiveTab] = useState('budgets'); // 'budgets' or 'categories'
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month & Year state
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2025);

  // Modals
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        api.get(`/budgets/?month=${month}&year=${year}`),
        api.get('/categories/'),
      ]);
      setBudgets(bRes.data.results || bRes.data || []);
      setCategories(cRes.data.results || cRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Delete this budget limit?')) {
      try {
        await api.delete(`/budgets/${id}/`);
        fetchData();
      } catch (e) {
        alert('Failed to delete budget.');
      }
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (cat.expense_count > 0) {
      const otherCats = categories.filter((c) => c.id !== cat.id);
      if (otherCats.length === 0) {
        alert(`Category '${cat.name}' has ${cat.expense_count} expenses and cannot be deleted.`);
        return;
      }
      const targetId = prompt(
        `Category '${cat.name}' has ${cat.expense_count} linked transactions. To delete it, enter the ID of the category to reassign expenses to:\n` +
          otherCats.map((c) => `ID: ${c.id} - ${c.name}`).join('\n')
      );
      if (!targetId) return;
      try {
        await api.delete(`/categories/${cat.id}/?reassign_to=${targetId}`);
        fetchData();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to delete category.');
      }
    } else {
      if (window.confirm(`Delete category '${cat.name}'?`)) {
        try {
          await api.delete(`/categories/${cat.id}/`);
          fetchData();
        } catch (e) {
          alert('Failed to delete category.');
        }
      }
    }
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Budgets & Categories
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Set spending limits to control expenditure and manage custom categories
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'budgets' ? (
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Set Budget</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <FolderPlus size={16} />
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('budgets')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'budgets' ? 'var(--accent-purple)' : 'transparent',
            color: activeTab === 'budgets' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Target size={17} />
          <span>Monthly Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'categories' ? 'var(--accent-purple)' : 'transparent',
            color: activeTab === 'categories' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Folder size={17} />
          <span>Category Directory ({categories.length})</span>
        </button>
      </div>

      {activeTab === 'budgets' ? (
        <div>
          {/* Month selector toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Viewing Budgets for:</span>
            <select
              className="form-select"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ width: '150px' }}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="form-input"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>

          {/* Budget Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {budgets.map((b) => {
              const spent = Number(b.spent || 0);
              const limit = Number(b.amount || 1);
              const pct = Number(b.percentage || 0);
              const isWarning = b.status === 'WARNING';
              const isExceeded = b.status === 'EXCEEDED';

              const barColor = isExceeded
                ? 'var(--accent-red)'
                : isWarning
                ? 'var(--accent-orange)'
                : 'var(--accent-green)';

              return (
                <div key={b.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: b.category_color || '#A855F7',
                        }}
                      ></span>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{b.category_name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: isExceeded
                            ? 'var(--accent-red-bg)'
                            : isWarning
                            ? 'var(--accent-orange-bg)'
                            : 'var(--accent-green-bg)',
                          color: isExceeded
                            ? 'var(--accent-red)'
                            : isWarning
                            ? 'var(--accent-orange)'
                            : 'var(--accent-green-light)',
                        }}
                      >
                        {isExceeded ? 'Exceeded' : isWarning ? 'Warning (80%+)' : 'On Track'}
                      </span>
                      <button
                        title="Edit"
                        onClick={() => {
                          setEditingBudget(b);
                          setBudgetModalOpen(true);
                        }}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDeleteBudget(b.id)}
                        style={{ color: 'var(--accent-red)', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: 600 }}>Limit: ₹{limit.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-bar-wrap" style={{ height: '8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: barColor,
                      }}
                    ></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span>{pct}% utilized</span>
                    <span>Remaining: ₹{Number(b.remaining || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Categories Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c.color || '#A855F7',
                  }}
                ></span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.expense_count} transactions
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  title="Edit category"
                  onClick={() => {
                    setEditingCategory(c);
                    setCategoryModalOpen(true);
                  }}
                  style={{ color: 'var(--text-muted)', padding: '4px' }}
                >
                  <Edit size={14} />
                </button>
                <button
                  title="Delete category"
                  onClick={() => handleDeleteCategory(c)}
                  style={{ color: 'var(--accent-red)', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <SetBudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchData}
        editBudget={editingBudget}
        categories={categories}
        currentMonth={month}
        currentYear={year}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchData}
        editCategory={editingCategory}
      />
    </div>
  );
}

