import React, { useState, useEffect } from 'react';
import { Star, Trophy, Plus, Trash2, Edit, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import SetGoalModal from '../components/Modals/SetGoalModal';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals/');
      setGoals(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        await api.delete(`/goals/${id}/`);
        fetchGoals();
      } catch (e) {
        alert('Failed to delete goal.');
      }
    }
  };

  const handleAddSavings = async (goal) => {
    const addAmt = prompt(`Add savings to '${goal.name}' (₹):`);
    if (!addAmt || isNaN(addAmt) || parseFloat(addAmt) <= 0) return;

    try {
      const newCurr = (parseFloat(goal.current_amount) + parseFloat(addAmt)).toFixed(2);
      await api.put(`/goals/${goal.id}/`, {
        ...goal,
        current_amount: newCurr,
      });
      fetchGoals();
    } catch (e) {
      alert('Failed to update savings.');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Savings Goals
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Set aspirational financial targets and watch your progress grow
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setModalOpen(true);
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
          <span>New Goal</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {goals.map((g) => {
          const target = Number(g.target_amount);
          const current = Number(g.current_amount);
          const pct = Math.min(100, Math.round((current / (target || 1)) * 100));
          const isDone = current >= target;

          return (
            <div
              key={g.id}
              className="stat-card"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '16px',
                border: isDone ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                    }}
                  >
                    🏆
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {g.name}
                    </div>
                    {g.target_date && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Target: {g.target_date}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    title="Edit"
                    onClick={() => {
                      setEditingGoal(g);
                      setModalOpen(true);
                    }}
                    style={{ color: 'var(--text-muted)', padding: '4px' }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDelete(g.id)}
                    style={{ color: 'var(--accent-red)', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Saved: <strong style={{ color: '#fff' }}>₹{current.toLocaleString('en-IN')}</strong>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Goal: <strong>₹{target.toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <div className="progress-bar-wrap" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: isDone
                        ? 'var(--accent-green)'
                        : 'linear-gradient(90deg, #8B5CF6, #C084FC)',
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
                  {isDone ? '🎉 Goal Completed!' : `${pct}% completed`}
                </span>

                <button
                  onClick={() => handleAddSavings(g)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  + Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SetGoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={fetchGoals}
        editGoal={editingGoal}
      />
    </div>
  );
}

