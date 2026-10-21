import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL, getUser, formatDate, getOverdueDays } from '../utils';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaRupeeSign,
  FaArrowLeft
} from 'react-icons/fa';

const MyBooks = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'overdue', 'returned'
  const user = getUser() || {};

  useEffect(() => {
    if (user.id) {
      fetchMyBooks();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/issue/mybooks/${user.id}`);
      setMyBooks(res.data || []);
    } catch (err) {
      console.error('Error fetching my books:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBooks = useMemo(() => myBooks.filter((b) => b.status === 'issued'), [myBooks]);
  const returnedBooks = useMemo(() => myBooks.filter((b) => b.status === 'returned'), [myBooks]);
  const overdueBooks = useMemo(() => {
    return myBooks.filter((b) => b.status === 'issued' && getOverdueDays(b.due_date) > 0);
  }, [myBooks]);

  const totalFines = useMemo(() => {
    return myBooks.reduce((acc, curr) => acc + (parseFloat(curr.fine) || 0), 0);
  }, [myBooks]);

  const filteredList = useMemo(() => {
    if (filterTab === 'active') return activeBooks;
    if (filterTab === 'overdue') return overdueBooks;
    if (filterTab === 'returned') return returnedBooks;
    return myBooks;
  }, [filterTab, activeBooks, overdueBooks, returnedBooks, myBooks]);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.topBackRow}>
            <Link to="/student" style={styles.backLink}>
              <FaArrowLeft size={12} /> Back to Library
            </Link>
          </div>
          <h1 style={styles.title}>My Borrowed Books</h1>
          <p style={styles.subtitle}>
            Track active loan durations, due dates, and view your return history
          </p>
        </div>
        <div style={styles.studentBadge}>
          🎓 {user.college_id ? `ID: ${user.college_id}` : user.email}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #7c3aed' }}>
          <div style={{ ...styles.statIconWrapper, background: '#f5f3ff', color: '#7c3aed' }}>
            <FaBook size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Borrowed</p>
            <p style={styles.statVal}>{myBooks.length}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #0284c7' }}>
          <div style={{ ...styles.statIconWrapper, background: '#f0f9ff', color: '#0284c7' }}>
            <FaClock size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Currently Issued</p>
            <p style={{ ...styles.statVal, color: '#0284c7' }}>{activeBooks.length}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #e11d48' }}>
          <div style={{ ...styles.statIconWrapper, background: '#fff1f2', color: '#e11d48' }}>
            <FaExclamationTriangle size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Overdue Loans</p>
            <p style={{ ...styles.statVal, color: '#e11d48' }}>{overdueBooks.length}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #059669' }}>
          <div style={{ ...styles.statIconWrapper, background: '#ecfdf5', color: '#059669' }}>
            <FaCheckCircle size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Returned Books</p>
            <p style={{ ...styles.statVal, color: '#059669' }}>{returnedBooks.length}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #d97706' }}>
          <div style={{ ...styles.statIconWrapper, background: '#fffbeb', color: '#d97706' }}>
            <FaRupeeSign size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Fines</p>
            <p style={{ ...styles.statVal, color: '#d97706' }}>₹{totalFines}</p>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {overdueBooks.length > 0 && (
        <div style={styles.overdueAlert} className="animate-fade-in">
          <FaExclamationTriangle size={22} color="#dc2626" />
          <div>
            <p style={styles.alertTitle}>
              You have {overdueBooks.length} overdue book(s)!
            </p>
            <p style={styles.alertDesc}>
              Please return them to the librarian desk as soon as possible to avoid increasing late fines (₹2/day).
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {[
          { id: 'all', label: 'All Records', count: myBooks.length },
          { id: 'active', label: 'Currently Issued', count: activeBooks.length },
          { id: 'overdue', label: 'Overdue', count: overdueBooks.length },
          { id: 'returned', label: 'Returned History', count: returnedBooks.length }
        ].map((tab) => (
          <button
            key={tab.id}
            style={filterTab === tab.id ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setFilterTab(tab.id)}
          >
            {tab.label} <span style={styles.tabBadge}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Book Cards Grid */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p>Loading your borrowing records...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={styles.emptyCard} className="glass-card">
          <FaBookOpen size={48} color="#c4b5fd" />
          <h3 style={styles.emptyTitle}>No records in this category</h3>
          <p style={styles.emptySubtitle}>
            Looking for something to read? Explore available books in the library!
          </p>
          <Link to="/student" style={styles.browseBtn}>
            Browse Catalog →
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredList.map((book) => {
            const overdueDays = getOverdueDays(book.due_date);
            const isOverdue = book.status === 'issued' && overdueDays > 0;

            return (
              <div
                key={book.id}
                style={isOverdue ? styles.overdueCard : styles.bookCard}
                className="glass-card"
              >
                <div style={styles.cardHeader}>
                  <div style={styles.bookIconBadge}>
                    <FaBook size={20} color="#7c3aed" />
                  </div>
                  <div>
                    <h3 style={styles.bookTitle}>{book.title}</h3>
                    <p style={styles.bookAuthor}>✍️ {book.author}</p>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.datesGrid}>
                    <div style={styles.dateBlock}>
                      <span style={styles.dateLabel}><FaCalendarAlt size={10} /> Borrowed On</span>
                      <span style={styles.dateVal}>{formatDate(book.issue_date)}</span>
                    </div>

                    <div style={styles.dateBlock}>
                      <span style={styles.dateLabel}><FaClock size={10} /> Due Date</span>
                      <span style={styles.dateVal}>{formatDate(book.due_date)}</span>
                    </div>
                  </div>

                  {book.status === 'issued' ? (
                    isOverdue ? (
                      <div style={styles.overduePill}>
                        <FaExclamationTriangle size={13} />
                        <span>{overdueDays} days overdue! (Fine: ₹{overdueDays * 2})</span>
                      </div>
                    ) : (
                      <div style={styles.activePill}>
                        <FaClock size={13} />
                        <span>Active loan (Return before due date)</span>
                      </div>
                    )
                  ) : (
                    <div style={styles.returnedPill}>
                      <FaCheckCircle size={13} />
                      <span>Returned on {formatDate(book.return_date || book.due_date)}</span>
                    </div>
                  )}

                  <div style={styles.cardFooter}>
                    <span style={styles.fineLabel}>
                      Late Fine: <strong style={book.fine > 0 ? styles.fineActive : styles.fineZero}>₹{book.fine || 0}</strong>
                    </span>
                    <span style={book.status === 'issued' ? styles.statusIssued : styles.statusReturned}>
                      {book.status === 'issued' ? '📤 Active Loan' : '✅ Completed'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  topBackRow: {
    marginBottom: '8px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
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
  studentBadge: {
    backgroundColor: '#ede9fe',
    color: '#7c3aed',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid #ede9fe',
    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statIconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    margin: 0,
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e1b4b',
    margin: '2px 0 0',
  },
  overdueAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '16px 20px',
    borderRadius: '14px',
    marginBottom: '24px',
  },
  alertTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#b91c1c',
    margin: 0,
  },
  alertDesc: {
    fontSize: '13px',
    color: '#dc2626',
    margin: '4px 0 0',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tabBtnActive: {
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
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  bookCard: {
    backgroundColor: 'white',
    borderRadius: '18px',
    border: '1px solid #ede9fe',
    overflow: 'hidden',
  },
  overdueCard: {
    backgroundColor: 'white',
    borderRadius: '18px',
    border: '1.5px solid #fca5a5',
    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px 20px',
    backgroundColor: '#faf5ff',
    borderBottom: '1px solid #ede9fe',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bookIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)',
    flexShrink: 0,
  },
  bookTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1e1b4b',
    margin: 0,
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: '12px',
    color: '#64748b',
    margin: '3px 0 0',
  },
  cardBody: {
    padding: '20px',
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  dateLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dateVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e1b4b',
  },
  activePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0f9ff',
    color: '#0284c7',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  overduePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  returnedPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  fineLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  fineActive: {
    color: '#dc2626',
    fontWeight: '800',
  },
  fineZero: {
    color: '#16a34a',
    fontWeight: '700',
  },
  statusIssued: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  statusReturned: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '18px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e1b4b',
    marginTop: '16px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '6px',
    marginBottom: '20px',
  },
  browseBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
  },
};

export default MyBooks;