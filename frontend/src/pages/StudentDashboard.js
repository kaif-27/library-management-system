import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL, getUser, getImageUrl } from '../utils';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaBookOpen,
  FaArrowRight,
  FaLayerGroup
} from 'react-icons/fa';

const StudentDashboard = () => {
  const [books, setBooks] = useState([]);
  const [myBooksCount, setMyBooksCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const user = getUser() || {};

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [booksRes, myBooksRes] = await Promise.all([
        axios.get(`${API_URL}/books`),
        user.id ? axios.get(`${API_URL}/issue/mybooks/${user.id}`) : Promise.resolve({ data: [] })
      ]);
      setBooks(booksRes.data || []);
      const active = (myBooksRes.data || []).filter((b) => b.status === 'issued').length;
      setMyBooksCount(active);
    } catch (err) {
      setMessage({ text: 'Failed to load library catalog.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = books.map((b) => b.category).filter(Boolean);
    return ['All', ...new Set(cats)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [books, selectedCategory, search]);

  const requestBook = async (book) => {
    if (!user.id) {
      setMessage({ text: 'Please log in to borrow books.', type: 'error' });
      return;
    }
    setBorrowingId(book.id);
    try {
      const res = await axios.post(`${API_URL}/issue/issue`, {
        user_id: user.id,
        book_id: book.id
      });
      setMessage({ text: res.data.message || `Successfully borrowed "${book.title}"!`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Unable to borrow book.',
        type: 'error'
      });
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Welcome Card */}
      <div style={styles.heroCard}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.welcomeTag}>STUDENT PORTAL</span>
            {user.college_id && <span style={styles.collegeIdTag}>ID: {user.college_id}</span>}
          </div>
          <h1 style={styles.heroTitle}>Welcome back, {user.name || 'Student'}! 👋</h1>
          <p style={styles.heroSubtitle}>
            Browse thousands of textbook titles, explore research papers, and manage your current loans effortlessly.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatItem}>
            <div style={{ ...styles.heroStatIcon, background: '#ede9fe', color: '#7c3aed' }}>
              <FaBook size={20} />
            </div>
            <div>
              <p style={styles.heroStatVal}>{books.length}</p>
              <p style={styles.heroStatLabel}>Catalog Titles</p>
            </div>
          </div>

          <Link to="/mybooks" style={styles.heroStatLink}>
            <div style={{ ...styles.heroStatIcon, background: '#e0f2fe', color: '#0284c7' }}>
              <FaBookOpen size={20} />
            </div>
            <div>
              <p style={{ ...styles.heroStatVal, color: '#0284c7' }}>{myBooksCount}</p>
              <p style={styles.heroStatLabel}>Active Loans <FaArrowRight size={10} /></p>
            </div>
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

      {/* Search and Category Filter Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by title, author, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch('')}>
              <FaTimes size={12} />
            </button>
          )}
        </div>

        <div style={styles.catChips}>
          {categories.map((cat) => (
            <button
              key={cat}
              style={selectedCategory === cat ? styles.catChipActive : styles.catChip}
              onClick={() => setSelectedCategory(cat)}
            >
              <FaLayerGroup size={11} /> {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p>Loading library collection...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div style={styles.emptyBox}>
          <FaBookOpen size={48} color="#c4b5fd" />
          <h3 style={styles.emptyTitle}>No matching books found</h3>
          <p style={styles.emptyDesc}>Try clearing your search or picking another category.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredBooks.map((book) => {
            const hasCover = Boolean(book.cover_image);
            const isAvailable = book.available_copies > 0;
            const isBorrowing = borrowingId === book.id;

            return (
              <div key={book.id} style={styles.card} className="glass-card">
                <div style={styles.coverWrapper}>
                  {hasCover ? (
                    <img
                      src={getImageUrl(book.cover_image)}
                      alt={book.title}
                      style={styles.coverImg}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ ...styles.fallbackCover, display: hasCover ? 'none' : 'flex' }}>
                    <FaBook size={40} color="#7c3aed" />
                    <span style={styles.fallbackTitle}>{book.title}</span>
                  </div>

                  <span style={isAvailable ? styles.stockBadgeAvail : styles.stockBadgeUnavail}>
                    {isAvailable ? (
                      <><FaCheckCircle size={10} /> {book.available_copies} In Stock</>
                    ) : (
                      <><FaTimesCircle size={10} /> Out of Stock</>
                    )}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.categoryBadge}>{book.category}</div>
                  <h3 style={styles.bookTitle} title={book.title}>{book.title}</h3>
                  <p style={styles.author}>✍️ {book.author}</p>

                  <div style={styles.cardBottom}>
                    <button
                      style={isAvailable ? styles.borrowBtn : styles.disabledBtn}
                      onClick={() => requestBook(book)}
                      disabled={!isAvailable || isBorrowing}
                    >
                      {isBorrowing ? 'Processing Loan...' : isAvailable ? 'Borrow Book (14 Days)' : 'Currently Unavailable'}
                    </button>
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
  heroCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #fbfbfe 60%, #f5f3ff 100%)',
    borderRadius: '20px',
    border: '1px solid #ede9fe',
    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.07)',
    padding: '32px',
    marginBottom: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  welcomeTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  collegeIdTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '560px',
    lineHeight: '1.6',
  },
  heroStats: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heroStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #ede9fe',
    padding: '14px 20px',
    borderRadius: '14px',
    boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
  },
  heroStatLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #bae6fd',
    padding: '14px 20px',
    borderRadius: '14px',
    textDecoration: 'none',
    boxShadow: '0 2px 10px rgba(2, 132, 199, 0.08)',
    transition: 'transform 0.2s',
  },
  heroStatIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e1b4b',
    margin: 0,
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '28px',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '560px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    fontSize: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '13px 40px 13px 46px',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
  },
  clearBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  catChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  catChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  catChipActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '18px',
    backgroundColor: '#ffffff',
  },
  coverWrapper: {
    position: 'relative',
    height: '210px',
    backgroundColor: '#f5f3ff',
    overflow: 'hidden',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fallbackCover: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
  },
  fallbackTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6d28d9',
    marginTop: '10px',
    maxHeight: '40px',
    overflow: 'hidden',
  },
  stockBadgeAvail: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #bbf7d0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backdropFilter: 'blur(4px)',
  },
  stockBadgeUnavail: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    color: '#b91c1c',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backdropFilter: 'blur(4px)',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#7c3aed',
    marginBottom: '6px',
  },
  bookTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: '4px',
    lineHeight: '1.3',
  },
  author: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '18px',
  },
  cardBottom: {
    marginTop: 'auto',
  },
  borrowBtn: {
    width: '100%',
    padding: '11px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'not-allowed',
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
};

export default StudentDashboard;