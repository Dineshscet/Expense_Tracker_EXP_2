import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Utensils,
  ShoppingBag,
  Bus,
  Briefcase,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import AddTransactionModal from '../components/Modals/AddTransactionModal';

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        sort_by: sortBy,
        order: sortOrder,
      });

      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (paymentMethod) params.append('payment_method', paymentMethod);
      if (transactionType) params.append('transaction_type', transactionType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (minAmount) params.append('min_amount', minAmount);
      if (maxAmount) params.append('max_amount', maxAmount);

      const res = await api.get(`/expenses/?${params.toString()}`);
      setTransactions(res.data.results || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalCount(res.data.count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    selectedCategory,
    paymentMethod,
    transactionType,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (paymentMethod) params.append('payment_method', paymentMethod);
      if (transactionType) params.append('transaction_type', transactionType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await api.get(`/expenses/export/?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ExpenseTrack_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export CSV.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);
      setDeleteConfirmId(null);
      fetchTransactions();
    } catch (e) {
      alert('Failed to delete transaction.');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="main-content">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Transactions
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage and filter all your recorded expenses and income ({totalCount} total)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
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
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
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
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Search by note or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={transactionType}
            onChange={(e) => {
              setTransactionType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Income Only</option>
          </select>

          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
          />
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
          />

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setPaymentMethod('');
              setTransactionType('');
              setStartDate('');
              setEndDate('');
              setMinAmount('');
              setMaxAmount('');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Reset Filters
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Date <ArrowUpDown size={13} />
                </span>
              </th>
              <th>Type</th>
              <th onClick={() => toggleSort('category')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Category <ArrowUpDown size={13} />
                </span>
              </th>
              <th>Description</th>
              <th>Method</th>
              <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  Amount <ArrowUpDown size={13} />
                </span>
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {tx.date}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: tx.transaction_type === 'INCOME' ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                        color: tx.transaction_type === 'INCOME' ? 'var(--accent-green-light)' : 'var(--accent-red)',
                      }}
                    >
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: tx.category_color || '#A855F7',
                        }}
                      ></span>
                      <span>{tx.category_name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {tx.description || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {tx.payment_method}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: tx.transaction_type === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}
                  >
                    {tx.transaction_type === 'INCOME' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        title="Edit"
                        onClick={() => {
                          setEditingItem(tx);
                          setModalOpen(true);
                        }}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteConfirmId(tx.id)}
                        style={{ color: 'var(--accent-red)', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div>
            Showing Page {currentPage} of {totalPages} ({totalCount} transactions)
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span>{currentPage}</span>
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Prompt (FR-EXP-04 / NFR-USE-03) */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-red)', marginBottom: '12px' }}>
              <AlertCircle size={22} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Confirm Deletion</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to delete this transaction record? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="page-btn"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={fetchTransactions}
        editItem={editingItem}
        categories={categories}
      />
    </div>
  );
}

