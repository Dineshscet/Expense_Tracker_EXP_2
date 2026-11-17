import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Hash,
  Award,
  Zap,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import DonutChart from '../components/DonutChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [monthsCount, setMonthsCount] = useState(6);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trendRes, catRes, statsRes] = await Promise.all([
        api.get(`/reports/monthly-trend/?months=${monthsCount}`),
        api.get('/reports/by-category/'),
        api.get('/reports/stats/'),
      ]);
      setTrendData(trendRes.data.trend || []);
      setCategoryData(catRes.data.categories || []);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthsCount]);

  const barChartData = {
    labels: trendData.map((t) => t.label),
    datasets: [
      {
        label: 'Expenses (₹)',
        data: trendData.map((t) => t.expenses),
        backgroundColor: '#A855F7',
        borderRadius: 6,
      },
      {
        label: 'Income (₹)',
        data: trendData.map((t) => t.income),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1e1435',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#a855f7',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          callback: (val) => `₹${val / 1000}k`,
        },
      },
    },
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await api.get('/expenses/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to download report.');
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analytics & Reports
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            In-depth spending trends, category distributions and key performance indicators
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            value={monthsCount}
            onChange={(e) => setMonthsCount(parseInt(e.target.value))}
            style={{ width: '160px' }}
          >
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (FR-REP-03) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-purple-glow)' }}>
                <DollarSign size={20} color="var(--accent-purple-light)" />
              </div>
              <div>
                <div className="stat-title">Total Spending</div>
                <div className="stat-value">₹{Number(stats?.total_amount || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-green-bg)' }}>
                <TrendingUp size={20} color="var(--accent-green-light)" />
              </div>
              <div>
                <div className="stat-title">Daily Average</div>
                <div className="stat-value">₹{Number(stats?.daily_average || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-blue-bg)' }}>
                <Hash size={20} color="var(--accent-blue)" />
              </div>
              <div>
                <div className="stat-title">Transactions</div>
                <div className="stat-value">{stats?.transaction_count || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: 'var(--accent-red-bg)' }}>
                <Award size={20} color="var(--accent-red)" />
              </div>
              <div>
                <div className="stat-title">Highest Single Expense</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                  {stats?.highest_expense ? `₹${Number(stats.highest_expense.amount).toLocaleString('en-IN')}` : '—'}
                </div>
                {stats?.highest_expense && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {stats.highest_expense.description || stats.highest_expense.category_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Monthly Trend Bar Chart (FR-REP-01) */}
        <div className="dashboard-card" style={{ minHeight: '360px' }}>
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} className="card-title-icon" />
              <span>Income vs. Expenses Trend</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '280px' }}>
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        {/* Category Breakdown Donut (FR-REP-02) */}
        <div className="dashboard-card" style={{ minHeight: '360px' }}>
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} className="card-title-icon" />
              <span>Category Share</span>
            </div>
          </div>
          <DonutChart
            categories={categoryData}
            totalSpent={stats?.total_amount || 8550}
          />
        </div>
      </div>
    </div>
  );
}

