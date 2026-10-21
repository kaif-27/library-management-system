import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../utils';
import {
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaImage,
  FaTimes,
  FaLayerGroup
} from 'react-icons/fa';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    total_copies: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/books`);
      setBooks(res.data || []);
    } catch (err) {
      setMessage({ text: 'Failed to fetch book catalog.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({ title: '', author: '', category: '', total_copies: '' });
    setCoverImage(null);
    setPreview(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.category || !form.total_copies) {
      setMessage({ text: 'All book details are required!', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('author', form.author.trim());
      formData.append('category', form.category.trim());
      formData.append('total_copies', form.total_copies);
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      if (editId) {
        await axios.put(`${API_URL}/books/update/${editId}`, formData);
        setMessage({ text: 'Book updated successfully!', type: 'success' });
      } else {
        await axios.post(`${API_URL}/books/add`, formData);
        setMessage({ text: 'Book added to catalog!', type: 'success' });
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error saving book.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      total_copies: book.total_copies
    });
    if (book.cover_image) {
      setPreview(getImageUrl(book.cover_image));
    } else {
      setPreview(null);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/books/delete/${book.id}`);
      setMessage({ text: `"${book.title}" was deleted.`, type: 'success' });
      fetchBooks();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error deleting book. Check if it has loan records.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const list = books.map((b) => b.category).filter(Boolean);
    return ['All', ...new Set(list)];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [books, selectedCategory, search]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Book Catalog Management</h1>
          <p style={styles.subtitle}>Add new acquisitions, edit inventory copies, and organize categories</p>
        </div>
        <button
          style={showForm ? styles.closeFormBtn : styles.addBtn}
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? <><FaTimes /> Close Form</> : <><FaPlus /> Add New Book</>}
        </button>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div style={message.type === 'error' ? styles.alertError : styles.alertSuccess}>
          <span>{message.type === 'error' ? '⚠️ ' : '✅ '}{message.text}</span>
          <button style={styles.alertClose} onClick={() => setMessage({ text: '', type: '' })}><FaTimes /></button>
        </div>
      )}

      {/* Add / Edit Form Card */}
      {showForm && (
        <div style={styles.formCard} className="animate-fade-in">
          <div style={styles.formCardHeader}>
            <h3 style={styles.formTitle}>
              {editId ? <><FaEdit color="#7c3aed" /> Edit Book Details</> : <><FaPlus color="#7c3aed" /> Add New Acquisition</>}
            </h3>
            <span style={styles.formNote}>All fields marked * are required</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Book Title *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Clean Architecture, Introduction to Algorithms"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Author Name *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Robert C. Martin, Cormen"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Category / Genre *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Computer Science, Mathematics, Physics"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Total Copies in Stock *</label>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  placeholder="Number of physical copies"
                  value={form.total_copies}
                  onChange={(e) => setForm({ ...form, total_copies: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.uploadArea}>
              <div>
                <label style={styles.label}>📸 Book Cover Photo (Optional)</label>
                <div style={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="cover-upload"
                    style={styles.hiddenFile}
                  />
                  <label htmlFor="cover-upload" style={styles.fileButton}>
                    <FaImage /> Choose Cover Image
                  </label>
                  <span style={styles.fileName}>
                    {coverImage ? coverImage.name : 'JPEG, PNG, or WebP'}
                  </span>
                </div>
              </div>

              {preview && (
                <div style={styles.previewBox}>
                  <img src={preview} alt="Book cover preview" style={styles.previewImg} />
                  <button
                    type="button"
                    style={styles.removeImgBtn}
                    onClick={() => { setCoverImage(null); setPreview(null); }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={styles.formFooter}>
              <button type="button" style={styles.cancelBtn} onClick={resetForm} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editId ? 'Update Book' : 'Add to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Search & Filter Controls */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search catalog by title, author, or category..."
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

      {/* Books Grid */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p>Loading library catalog...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div style={styles.emptyBox}>
          <FaBook size={48} color="#c4b5fd" />
          <h3 style={styles.emptyTitle}>No books matched</h3>
          <p style={styles.emptyDesc}>
            {search ? 'Try adjusting your search terms or category.' : 'No books in this category yet. Click "Add New Book" to start!'}
          </p>
        </div>
      ) : (
        <div style={styles.booksGrid}>
          {filteredBooks.map((book) => {
            const hasCover = Boolean(book.cover_image);
            const isAvailable = book.available_copies > 0;

            return (
              <div key={book.id} style={styles.bookCard} className="glass-card">
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
                    <FaBook size={40} color="#8b5cf6" />
                    <span style={styles.fallbackTitle}>{book.title}</span>
                  </div>

                  <span style={isAvailable ? styles.stockBadgeAvail : styles.stockBadgeUnavail}>
                    {isAvailable ? `${book.available_copies} Available` : 'Out of Stock'}
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.genreTag}>{book.category}</div>
                  <h3 style={styles.bookTitle} title={book.title}>{book.title}</h3>
                  <p style={styles.bookAuthor}>✍️ {book.author}</p>

                  <div style={styles.copiesBar}>
                    <div style={styles.copiesMetric}>
                      <span style={styles.copiesLabel}>Total:</span>
                      <span style={styles.copiesVal}>{book.total_copies}</span>
                    </div>
                    <div style={styles.copiesMetric}>
                      <span style={styles.copiesLabel}>Issued:</span>
                      <span style={styles.copiesVal}>{book.total_copies - book.available_copies}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button style={styles.editBtn} onClick={() => handleEdit(book)}>
                      <FaEdit /> Edit
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(book)}>
                      <FaTrash /> Delete
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
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    padding: '11px 22px',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.2s',
  },
  closeFormBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 20px',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
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
  formCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid #ede9fe',
    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
    padding: '28px',
    marginBottom: '32px',
  },
  formCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1e1b4b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  formNote: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginBottom: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s',
  },
  uploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '18px',
    backgroundColor: '#faf5ff',
    borderRadius: '12px',
    border: '1.5px dashed #ddd6fe',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  fileInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '6px',
  },
  hiddenFile: {
    display: 'none',
  },
  fileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    backgroundColor: 'white',
    border: '1px solid #ddd6fe',
    borderRadius: '8px',
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
  },
  fileName: {
    fontSize: '12px',
    color: '#64748b',
  },
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  previewImg: {
    width: '60px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #ddd6fe',
  },
  removeImgBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '11px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '11px 24px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '28px',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '500px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    fontSize: '15px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 44px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  bookCard: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '18px',
    backgroundColor: 'white',
  },
  coverWrapper: {
    position: 'relative',
    height: '220px',
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
    background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
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
    color: '#5b21b6',
    marginTop: '10px',
    maxHeight: '40px',
    overflow: 'hidden',
  },
  stockBadgeAvail: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #bbf7d0',
    backdropFilter: 'blur(4px)',
  },
  stockBadgeUnavail: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    color: '#dc2626',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #fecaca',
    backdropFilter: 'blur(4px)',
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  genreTag: {
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
  bookAuthor: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '16px',
  },
  copiesBar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '18px',
    marginTop: 'auto',
  },
  copiesMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  copiesLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  copiesVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e1b4b',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  editBtn: {
    flex: 1,
    padding: '9px',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    flex: 1,
    padding: '9px',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #ffe4e6',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
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

export default Books;