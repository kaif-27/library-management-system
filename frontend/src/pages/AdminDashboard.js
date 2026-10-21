import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL, formatDate, getOverdueDays } from '../utils';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaBookOpen,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRupeeSign,
  FaSearch,
  FaUndoAlt,
  FaClock,
  FaPlusCircle,
  FaTimes,
  FaIdCard,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_titles: 0,
    total_copies: 0,
    available_copies: 0,
    active_issued: 0,
    total_returned: 0,
    overdue_count: 0,
    total_fines: 0,
    total_students: 0
  });

  const [issuedBooks, setIssuedBooks] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'issued', 'overdue', 'returned'
  const [message, setMessage] = useState({ text: '', type: '' });

  // Quick Issue Modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ user_id: '', book_id: '' });

  // Return confirmation modal
  const [returnConfirm, setReturnConfirm] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, issuedRes, booksRes] = await Promise.all([
        axios.get(`${API_URL}/issue/stats`),
        axios.get(`${API_URL}/issue/all`),
        axios.get(`${API_URL}/books`)
      ]);
      setStats(statsRes.data || {});
      setIssuedBooks(issuedRes.data || []);
      setBooksList(booksRes.data || []);
    } catch (err) {
      setMessage({ text: 'Failed to load dashboard data. Ensure backend is running.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_URL}/issue/return`, { issue_id: issueId });
      setMessage({
        text: `Book marked as returned! ${res.data.fine > 0 ? `Late fine assessed: ₹${res.data.fine}` : 'Returned on time (₹0 fine).' }`,
        type: 'success'
      });
      setReturnConfirm(null);
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error processing return', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.user_id || !issueForm.book_id) {
      setMessage({ text: 'Please fill in both Student User ID and select a Book!', type: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_URL}/issue/issue`, {
        user_id: issueForm.user_id,
        book_id: issueForm.book_id
      });
      setMessage({ text: res.data.message || 'Book issued successfully!', type: 'success' });
      setShowIssueModal(false);
      setIssueForm({ user_id: '', book_id: '' });
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error issuing book', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return issuedBooks.filter((item) => {
      // 1. Tab filter
      const isOverdue = item.status === 'issued' && getOverdueDays(item.due_date) > 0;
      if (filterTab === 'issued' && item.status !== 'issued') return false;
      if (filterTab === 'returned' && item.status !== 'returned') return false;
      if (filterTab === 'overdue' && !isOverdue) return false;

      // 2. Search filter
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      const studentName = item.student_name?.toLowerCase() || '';
      const collegeId = item.college_id?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      const bookTitle = item.book_title?.toLowerCase() || '';
      return studentName.includes(query) || collegeId.includes(query) || email.includes(query) || bookTitle.includes(query);
    });
  }, [issuedBooks, filterTab, search]);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Control Center</h1>
          <p style={styles.subtitle}>Circulation metrics, active book loans, and system monitoring</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.quickIssueBtn} onClick={() => setShowIssueModal(true)}>
            <FaPlusCircle /> Quick Issue Book
          </button>
          <Link to="/books" style={styles.manageBooksBtn}>
            <FaBookOpen /> Manage Catalog <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div style={message.type === 'error' ? styles.alertError : styles.alertSuccess}>
          <span>{message.type === 'error' ? '⚠️ ' : '✅ '}{message.text}</span>
          <button style={styles.alertClose} onClick={() => setMessage({ text: '', type: '' })}><FaTimes /></button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #7c3aed' }}>
          <div style={{ ...styles.statIconWrapper, background: '#f5f3ff', color: '#7c3aed' }}>
            <FaBook size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Total Books Catalog</span>
            <div style={styles.statValueRow}>
              <h2 style={styles.statValue}>{stats.total_titles || 0}</h2>
              <span style={styles.statSub}>({stats.total_copies || 0} copies)</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '5px solid #0284c7' }}>
          <div style={{ ...styles.statIconWrapper, background: '#f0f9ff', color: '#0284c7' }}>
            <FaBookOpen size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Currently Issued</span>
            <div style={styles.statValueRow}>
              <h2 style={{ ...styles.statValue, color: '#0284c7' }}>{stats.active_issued || 0}</h2>
              <span style={styles.statSub}>in circulation</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '5px solid #e11d48' }}>
          <div style={{ ...styles.statIconWrapper, background: '#fff1f2', color: '#e11d48' }}>
            <FaExclamationTriangle size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Overdue Returns</span>
            <div style={styles.statValueRow}>
              <h2 style={{ ...styles.statValue, color: '#e11d48' }}>{stats.overdue_count || 0}</h2>
              <span style={styles.statSub}>needs return</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '5px solid #059669' }}>
          <div style={{ ...styles.statIconWrapper, background: '#ecfdf5', color: '#059669' }}>
            <FaUsers size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Registered Students</span>
            <div style={styles.statValueRow}>
              <h2 style={{ ...styles.statValue, color: '#059669' }}>{stats.total_students || 0}</h2>
              <span style={styles.statSub}>active members</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '5px solid #d97706' }}>
          <div style={{ ...styles.statIconWrapper, background: '#fffbeb', color: '#d97706' }}>
            <FaRupeeSign size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Fines Collected</span>
            <div style={styles.statValueRow}>
              <h2 style={{ ...styles.statValue, color: '#d97706' }}>₹{stats.total_fines || 0}</h2>
              <span style={styles.statSub}>total assessed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={styles.tableCard}>
        {/* Table Controls */}
        <div style={styles.tableControls}>
          <div style={styles.filterTabs}>
            {[
              { id: 'all', label: 'All Records', count: issuedBooks.length },
              { id: 'issued', label: 'Currently Issued', count: stats.active_issued || 0 },
              { id: 'overdue', label: 'Overdue', count: stats.overdue_count || 0 },
              { id: 'returned', label: 'Returned', count: stats.total_returned || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                style={filterTab === tab.id ? styles.filterTabActive : styles.filterTab}
                onClick={() => setFilterTab(tab.id)}
              >
                {tab.label} <span style={styles.tabBadge}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search student, college ID, or book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button style={styles.clearSearch} onClick={() => setSearch('')}>
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table / Records View */}
        {loading ? (
          <div style={styles.loadingBox}>
            <p>Loading circulation records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={styles.emptyBox}>
            <FaBookOpen size={48} color="#c4b5fd" />
            <h3 style={styles.emptyTitle}>No records found</h3>
            <p style={styles.emptyDesc}>
              {search ? 'Try clearing your search filters.' : 'There are currently no book loans matching this category.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Info</th>
                  <th>Book Details</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const overdueDays = getOverdueDays(item.due_date);
                  const isOverdue = item.status === 'issued' && overdueDays > 0;

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '700', color: '#64748b' }}>#{item.id}</td>
                      <td>
                        <div style={styles.studentCell}>
                          <span style={styles.studentName}>{item.student_name}</span>
                          <span style={styles.studentEmail}>{item.email}</span>
                          {item.college_id && (
                            <span style={styles.collegeBadge}>
                              <FaIdCard size={11} /> {item.college_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={styles.bookTitle}>{item.book_title}</span>
                          <span style={styles.bookCategory}>{item.category} • by {item.author}</span>
                        </div>
                      </td>
                      <td>
                        <span style={styles.dateCell}><FaCalendarAlt size={12} color="#94a3b8" /> {formatDate(item.issue_date)}</span>
                      </td>
                      <td>
                        <div style={styles.dueCell}>
                          <span style={styles.dateCell}><FaClock size={12} color="#94a3b8" /> {formatDate(item.due_date)}</span>
                          {item.status === 'issued' && (
                            isOverdue ? (
                              <span style={styles.overdueDaysBadge}>{overdueDays}d overdue</span>
                            ) : (
                              <span style={styles.daysLeftBadge}>Active</span>
                            )
                          )}
                        </div>
                      </td>
                      <td>
                        {item.status === 'issued' ? (
                          isOverdue ? (
                            <span className="badge badge-overdue">⚠️ Overdue</span>
                          ) : (
                            <span className="badge badge-issued">📤 Issued</span>
                          )
                        ) : (
                          <span className="badge badge-returned">✅ Returned</span>
                        )}
                      </td>
                      <td>
                        <span style={item.fine > 0 ? styles.fineActive : styles.fineNone}>
                          ₹{item.fine || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'issued' ? (
                          <button
                            style={styles.returnBtn}
                            onClick={() => setReturnConfirm(item)}
                            disabled={actionLoading}
                          >
                            <FaUndoAlt size={12} /> Mark Return
                          </button>
                        ) : (
                          <span style={styles.completedTag}>
                            <FaCheckCircle size={13} color="#10b981" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Confirmation Modal */}
      {returnConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Confirm Book Return</h3>
              <button style={styles.closeModalBtn} onClick={() => setReturnConfirm(null)}><FaTimes /></button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalDesc}>
                Are you sure you want to process the return for:
              </p>
              <div style={styles.confirmBox}>
                <p><strong>Book:</strong> {returnConfirm.book_title}</p>
                <p><strong>Student:</strong> {returnConfirm.student_name} ({returnConfirm.college_id || returnConfirm.email})</p>
                <p><strong>Due Date:</strong> {formatDate(returnConfirm.due_date)}</p>
                {getOverdueDays(returnConfirm.due_date) > 0 ? (
                  <div style={styles.overdueNotice}>
                    ⚠️ This book is <strong>{getOverdueDays(returnConfirm.due_date)} days overdue</strong>.
                    An automated fine of <strong>₹{getOverdueDays(returnConfirm.due_date) * 2}</strong> will be logged.
                  </div>
                ) : (
                  <p style={{ color: '#16a34a', marginTop: '6px', fontWeight: '600' }}>
                    ✅ Returned within the due date (₹0 late fine).
                  </p>
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setReturnConfirm(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={() => handleReturnBook(returnConfirm.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Issue Modal */}
      {showIssueModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Quick Issue Book</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowIssueModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleQuickIssue}>
              <div style={styles.modalBody}>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Student User ID *</label>
                  <input
                    style={styles.inputField}
                    type="number"
                    placeholder="Enter Student user_id (e.g. 2, 3)"
                    value={issueForm.user_id}
                    onChange={(e) => setIssueForm({ ...issueForm, user_id: e.target.value })}
                    required
                  />
                  <span style={styles.helperText}>Find student ID from registration records.</span>
                </div>

                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Select Book *</label>
                  <select
                    style={styles.selectField}
                    value={issueForm.book_id}
                    onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}
                    required
                  >
                    <option value="">-- Choose an available book --</option>
                    {booksList.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                        {b.title} (Available: {b.available_copies}/{b.total_copies})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowIssueModal(false)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" style={styles.confirmBtn} disabled={actionLoading}>
                  {actionLoading ? 'Issuing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  quickIssueBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.2s',
  },
  manageBooksBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    padding: '10px 18px',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  alertSuccess: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '14px 20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontWeight: '600',
    fontSize: '14px',
  },
  alertError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '14px 20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontWeight: '600',
    fontSize: '14px',
  },
  alertClose: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #ede9fe',
    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginTop: '4px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1e1b4b',
    margin: 0,
    lineHeight: '1',
  },
  statSub: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '18px',
    border: '1px solid #ede9fe',
    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.06)',
    padding: '24px',
  },
  tableControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterTab: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  filterTabActive: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #7c3aed',
    backgroundColor: '#7c3aed',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
  },
  tabBadge: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '280px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 38px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  studentCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  studentName: {
    fontWeight: '700',
    color: '#1e1b4b',
  },
  studentEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  collegeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#7c3aed',
    backgroundColor: '#f5f3ff',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
    marginTop: '2px',
  },
  bookTitle: {
    fontWeight: '700',
    color: '#1e1b4b',
    display: 'block',
  },
  bookCategory: {
    fontSize: '12px',
    color: '#64748b',
  },
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#334155',
    fontWeight: '500',
  },
  dueCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  overdueDaysBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  daysLeftBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  fineActive: {
    fontWeight: '800',
    color: '#dc2626',
    fontSize: '14px',
  },
  fineNone: {
    fontWeight: '600',
    color: '#64748b',
    fontSize: '13px',
  },
  returnBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
    transition: 'all 0.2s',
  },
  completedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#10b981',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e1b4b',
    marginTop: '16px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '6px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e1b4b',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '18px',
  },
  modalBody: {
    marginBottom: '24px',
  },
  modalDesc: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '12px',
  },
  confirmBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#334155',
  },
  overdueNotice: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '13px',
  },
  modalField: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  inputField: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
  },
  selectField: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
  },
  helperText: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 18px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  },
};

export default AdminDashboard;