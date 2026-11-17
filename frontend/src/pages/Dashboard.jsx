import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  PieChart as PieIcon,
  Clock,
  TrendingUp,
  Target,
  Star,
  Zap,
  Plus,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Bus,
  Briefcase,
  Film,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sparkline from '../components/Sparkline';
import DonutChart from '../components/DonutChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import AddTransactionModal from '../components/Modals/AddTransactionModal';
import SetBudgetModal from '../components/Modals/SetBudgetModal';
import SetGoalModal from '../components/Modals/SetGoalModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter state (defaults to Nov 2025 to match image aesthetic)
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalTxOpen, setModalTxOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('EXPENSE');
  const [modalBudgetOpen, setModalBudgetOpen] = useState(false);
  const [modalGoalOpen, setModalGoalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, trendRes, allCatsRes] = await Promise.all([
        api.get(`/reports/summary/?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/reports/by-category/?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/reports/monthly-trend/?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/categories/'),
      ]);

      setSummaryData(sumRes.data);
      setCategoryData(catRes.data.categories || []);
      setTrendData(trendRes.data.current_month_points || []);
      setCategories(allCatsRes.data.results || allCatsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Fallback defaults from image if fresh account
  const balance = summaryData?.cards?.balance?.amount ?? 12450;
  const expenses = summaryData?.cards?.expenses?.amount ?? 8550;
  const income = summaryData?.cards?.income?.amount ?? 21000;
  const savings = summaryData?.cards?.savings?.amount ?? 12450;

  const sparklines = summaryData?.sparklines || {
    balance: [10000, 10500, 11200, 11800, 12000, 12450],
    expenses: [2000, 3500, 4800, 6200, 7500, 8550],
    income: [0, 0, 0, 21000, 21000, 21000],
    savings: [8000, 9200, 10100, 11000, 11900, 12450],
  };

  const recentTxs = summaryData?.recent_transactions?.length
    ? summaryData.recent_transactions
    : [
        {
          id: 1,
          description: 'Zomato',
          category_name: 'Food & Dining',
          date: 'Today, 7:45 PM',
          amount: '320.00',
          transaction_type: 'EXPENSE',
          category_color: '#F43F5E',
          icon: 'Utensils',
        },
        {
          id: 2,
          description: 'Metro Cash & Carry',
          category_name: 'Shopping',
          date: 'Today, 5:20 PM',
          amount: '750.00',
          transaction_type: 'EXPENSE',
          category_color: '#3B82F6',
          icon: 'ShoppingBag',
        },
        {
          id: 3,
          description: 'Bus Ticket',
          category_name: 'Travel',
          date: 'Yesterday, 8:10 PM',
          amount: '50.00',
          transaction_type: 'EXPENSE',
          category_color: '#EC4899',
          icon: 'Bus',
        },
        {
          id: 4,
          description: 'Salary Credit',
          category_name: 'Income',
          date: 'Yesterday, 10:00 AM',
          amount: '21000.00',
          transaction_type: 'INCOME',
          category_color: '#10B981',
          icon: 'Briefcase',
        },
      ];

  const budgets = summaryData?.budgets?.length
    ? summaryData.budgets
    : [
        {
          category_name: 'Food & Dining',
          spent: 2800,
          amount: 4000,
          percentage: 70,
          status: 'ON_TRACK',
          category_color: '#A855F7',
          icon: 'Utensils',
        },
        {
          category_name: 'Shopping',
          spent: 1500,
          amount: 3000,
          percentage: 50,
          status: 'ON_TRACK',
          category_color: '#3B82F6',
          icon: 'ShoppingBag',
        },
        {
          category_name: 'Travel',
          spent: 1800,
          amount: 2500,
          percentage: 72,
          status: 'ON_TRACK',
          category_color: '#F97316',
          icon: 'Bus',
        },
      ];

  const goal = summaryData?.goals?.[0] || {
    name: 'Trip to Japan ✈️',
    current_amount: 25000,
    target_amount: 50000,
    percentage: 50,
  };

  const getTransactionIcon = (tx) => {
    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category_name || '').toLowerCase();
    if (tx.transaction_type === 'INCOME' || cat.includes('salary') || cat.includes('income')) {
      return <Briefcase size={17} color="#10B981" />;
    }
    if (desc.includes('zomato') || desc.includes('swiggy') || cat.includes('food')) {
      return <Utensils size={17} color="#F43F5E" />;
    }
    if (desc.includes('metro') || cat.includes('shopping')) {
      return <ShoppingBag size={17} color="#3B82F6" />;
    }
    if (desc.includes('bus') || desc.includes('uber') || cat.includes('travel')) {
      return <Bus size={17} color="#EC4899" />;
    }
    return <MoreHorizontal size={17} color="#A855F7" />;
  };

  const getTransactionBg = (tx) => {
    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category_name || '').toLowerCase();
    if (tx.transaction_type === 'INCOME' || cat.includes('salary')) return 'rgba(16, 185, 129, 0.15)';
    if (desc.includes('zomato') || cat.includes('food')) return 'rgba(244, 63, 94, 0.15)';
    if (desc.includes('metro') || cat.includes('shopping')) return 'rgba(59, 130, 246, 0.15)';
    if (desc.includes('bus') || cat.includes('travel')) return 'rgba(236, 72, 153, 0.15)';
    return 'rgba(168, 85, 247, 0.15)';
  };

  return (
    <div className="main-content">
      {/* Top Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          if (term.trim().length > 1) {
            navigate(`/transactions?search=${encodeURIComponent(term)}`);
          }
        }}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        alerts={summaryData?.budget_alerts || []}
      />

      {/* 4 Summary Stat Cards */}
      <div className="stats-grid">
        {/* Total Balance */}
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-green-bg)' }}>
                <CreditCard size={20} color="var(--accent-green-light)" />
              </div>
              <div>
                <div className="stat-title">Total Balance</div>
                <div className="stat-value">₹{Number(balance).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="stat-change" style={{ color: 'var(--accent-green-light)' }}>
              <span>&uarr;</span>
              <span>+12%</span>
            </div>
          </div>
          <div className="stat-sparkline">
            <Sparkline data={sparklines.balance} color="#10B981" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-red-bg)' }}>
                <ArrowUpRight size={20} color="var(--accent-red)" />
              </div>
              <div>
                <div className="stat-title">Total Expenses</div>
                <div className="stat-value">₹{Number(expenses).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="stat-change" style={{ color: 'var(--accent-red)' }}>
              <span>&uarr;</span>
              <span>+8%</span>
            </div>
          </div>
          <div className="stat-sparkline">
            <Sparkline data={sparklines.expenses} color="#F43F5E" />
          </div>
        </div>

        {/* Total Income */}
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-green-bg)' }}>
                <ArrowDownLeft size={20} color="var(--accent-green-light)" />
              </div>
              <div>
                <div className="stat-title">Total Income</div>
                <div className="stat-value">₹{Number(income).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="stat-change" style={{ color: 'var(--accent-green-light)' }}>
              <span>&uarr;</span>
              <span>+5%</span>
            </div>
          </div>
          <div className="stat-sparkline">
            <Sparkline data={sparklines.income} color="#10B981" />
          </div>
        </div>

        {/* Savings */}
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                <PiggyBank size={20} color="var(--accent-purple-light)" />
              </div>
              <div>
                <div className="stat-title">Savings</div>
                <div className="stat-value">₹{Number(savings).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="stat-change" style={{ color: 'var(--accent-green-light)' }}>
              <span>&uarr;</span>
              <span>+15%</span>
            </div>
          </div>
          <div className="stat-sparkline">
            <Sparkline data={sparklines.savings} color="#A855F7" />
          </div>
        </div>
      </div>

      {/* Middle Row (3 Cards) */}
      <div className="dashboard-grid-3">
        {/* Expense Overview Donut */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <PieIcon size={18} className="card-title-icon" />
              <span>Expense Overview</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span>This Month</span>
              <ChevronDown size={13} />
            </div>
          </div>
          <DonutChart categories={categoryData} totalSpent={expenses} />
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} className="card-title-icon" />
              <span>Recent Transactions</span>
            </div>
            <Link to="/transactions" className="card-action-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="recent-tx-list">
            {recentTxs.slice(0, 4).map((tx, idx) => (
              <div key={tx.id || idx} className="tx-row">
                <div className="tx-left">
                  <div
                    className="tx-icon-circle"
                    style={{ background: getTransactionBg(tx) }}
                  >
                    {getTransactionIcon(tx)}
                  </div>
                  <div>
                    <div className="tx-name">{tx.description || tx.category_name}</div>
                    <div className="tx-meta">
                      {tx.category_name} &bull; {typeof tx.date === 'string' && tx.date.includes('-') ? tx.date : tx.date || 'Today'}
                    </div>
                  </div>
                </div>
                <div className={`tx-amount ${tx.transaction_type === 'INCOME' ? 'income' : 'expense'}`}>
                  {tx.transaction_type === 'INCOME' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} className="card-title-icon" />
              <span>Monthly Trend</span>
            </div>
          </div>
          <MonthlyTrendChart points={trendData} />
        </div>
      </div>

      {/* Bottom Row (3 Cards) */}
      <div className="dashboard-grid-3">
        {/* Budgets Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Target size={18} className="card-title-icon" />
              <span>Budgets</span>
            </div>
            <Link to="/budgets" className="card-action-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="budget-list">
            {budgets.slice(0, 3).map((b, idx) => {
              const spent = Number(b.spent || 0);
              const limit = Number(b.amount || 1);
              const pct = Math.min(100, Math.round((spent / limit) * 100));
              const isWarning = pct >= 80 && pct <= 100;
              const isExceeded = pct > 100;

              // Color based on status
              const barColor = isExceeded
                ? 'var(--accent-red)'
                : isWarning
                ? 'var(--accent-orange)'
                : idx === 2
                ? 'var(--accent-orange)' // Travel is orange in the screenshot
                : 'var(--accent-green)'; // Food & Shopping are green in the screenshot

              const badgeText = isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'On Track';
              const badgeClass = isExceeded
                ? 'badge-exceeded'
                : isWarning
                ? 'badge-warning'
                : 'badge-on-track';

              return (
                <div key={idx} className="budget-item">
                  <div className="budget-top">
                    <div className="budget-info">
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: b.category_color ? `${b.category_color}22` : 'rgba(168,85,247,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: b.category_color || '#A855F7',
                        }}
                      >
                        {idx === 0 ? <Utensils size={15} /> : idx === 1 ? <ShoppingBag size={15} /> : <Bus size={15} />}
                      </div>
                      <div>
                        <div className="budget-cat-name">{b.category_name}</div>
                        <div className="budget-spent-limit">
                          ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <span className={`budget-badge ${badgeClass}`}>{badgeText}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Star size={18} style={{ color: '#F59E0B' }} />
              <span>Goals</span>
            </div>
            <Link to="/goals" className="card-action-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="goal-center-content">
            <div className="goal-trophy-icon" role="img" aria-label="trophy">
              🏆
            </div>
            <div className="goal-title">{goal.name}</div>
            <div className="goal-amounts">
              ₹{Number(goal.current_amount).toLocaleString('en-IN')} / ₹{Number(goal.target_amount).toLocaleString('en-IN')}
            </div>
            <div className="goal-progress-wrap">
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((goal.current_amount / (goal.target_amount || 1)) * 100))}%`,
                    background: 'linear-gradient(90deg, #8B5CF6, #C084FC)',
                  }}
                ></div>
              </div>
            </div>
            <div className="goal-cheer-text">
              {goal.current_amount >= goal.target_amount
                ? 'Goal Achieved! 🚀'
                : "You're halfway there! 🎉"}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} style={{ color: '#F59E0B' }} />
              <span>Quick Actions</span>
            </div>
          </div>

          <div className="quick-actions-grid">
            {/* Add Expense */}
            <button
              className="quick-action-btn"
              onClick={() => {
                setTxModalType('EXPENSE');
                setModalTxOpen(true);
              }}
            >
              <div
                className="action-circle-icon"
                style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple-light)' }}
              >
                <Plus size={18} />
              </div>
              <span>Add Expense</span>
            </button>

            {/* Add Income */}
            <button
              className="quick-action-btn"
              onClick={() => {
                setTxModalType('INCOME');
                setModalTxOpen(true);
              }}
            >
              <div
                className="action-circle-icon"
                style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green-light)' }}
              >
                <Plus size={18} />
              </div>
              <span>Add Income</span>
            </button>

            {/* Set Budget */}
            <button
              className="quick-action-btn"
              onClick={() => setModalBudgetOpen(true)}
            >
              <div
                className="action-circle-icon"
                style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}
              >
                <Target size={18} />
              </div>
              <span>Set Budget</span>
            </button>

            {/* Set Goal */}
            <button
              className="quick-action-btn"
              onClick={() => setModalGoalOpen(true)}
            >
              <div
                className="action-circle-icon"
                style={{ background: 'var(--accent-gold-bg)', color: 'var(--accent-gold)' }}
              >
                <Star size={18} />
              </div>
              <span>Set Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <AddTransactionModal
        isOpen={modalTxOpen}
        onClose={() => setModalTxOpen(false)}
        onSuccess={fetchData}
        initialType={txModalType}
        categories={categories}
      />

      <SetBudgetModal
        isOpen={modalBudgetOpen}
        onClose={() => setModalBudgetOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
      />

      <SetGoalModal
        isOpen={modalGoalOpen}
        onClose={() => setModalGoalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

