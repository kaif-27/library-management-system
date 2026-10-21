const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
exports.upload = upload;

exports.getAllBooks = (req, res) => {
  const sql = 'SELECT * FROM books ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results || []);
  });
};

exports.searchBooks = (req, res) => {
  const { query } = req.query;
  const term = `%${query || ''}%`;
  const sql = 'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR category LIKE ? ORDER BY id DESC';
  db.query(sql, [term, term, term], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results || []);
  });
};

exports.addBook = (req, res) => {
  const { title, author, category, total_copies } = req.body;
  if (!title || !author || !category || !total_copies) {
    return res.status(400).json({ message: 'All book details are required!' });
  }

  const copies = parseInt(total_copies, 10) || 1;
  const cover_image = req.file ? req.file.filename : null;
  const sql = 'INSERT INTO books (title, author, category, total_copies, available_copies, cover_image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [title, author, category, copies, copies, cover_image], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to add book' });
    res.status(201).json({ message: 'Book added successfully!' });
  });
};

exports.updateBook = (req, res) => {
  const { id } = req.params;
  const { title, author, category, total_copies } = req.body;
  const newTotal = parseInt(total_copies, 10);
  const cover_image = req.file ? req.file.filename : null;

  // Retrieve current book state to adjust available_copies correctly
  db.query('SELECT total_copies, available_copies FROM books WHERE id = ?', [id], (err, rows) => {
    if (err || !rows || rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const currentTotal = rows[0].total_copies;
    const currentAvailable = rows[0].available_copies;
    const issuedCount = Math.max(0, currentTotal - currentAvailable);
    const newAvailable = Math.max(0, newTotal - issuedCount);

    let sql;
    let params;

    if (cover_image) {
      sql = 'UPDATE books SET title=?, author=?, category=?, total_copies=?, available_copies=?, cover_image=? WHERE id=?';
      params = [title, author, category, newTotal, newAvailable, cover_image, id];
    } else {
      sql = 'UPDATE books SET title=?, author=?, category=?, total_copies=?, available_copies=? WHERE id=?';
      params = [title, author, category, newTotal, newAvailable, id];
    }

    db.query(sql, params, (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Failed to update book' });
      res.json({ message: 'Book updated successfully!' });
    });
  });
};

exports.deleteBook = (req, res) => {
  const { id } = req.params;

  // Check if copies are currently issued
  db.query('SELECT COUNT(*) as activeCount FROM issued_books WHERE book_id = ? AND status = "issued"', [id], (err, activeRows) => {
    if (err) return res.status(500).json({ message: 'Database check failed' });
    if (activeRows && activeRows[0].activeCount > 0) {
      return res.status(400).json({ message: 'Cannot delete book: copies are currently borrowed by students!' });
    }

    const sql = 'DELETE FROM books WHERE id=?';
    db.query(sql, [id], (delErr, result) => {
      if (delErr) {
        if (delErr.code === 'ER_ROW_IS_REFERENCED_2' || delErr.errno === 1451) {
          return res.status(400).json({
            message: 'Cannot delete book: it has historical return records in the system.'
          });
        }
        return res.status(500).json({ message: 'Failed to delete book' });
      }
      res.json({ message: 'Book deleted successfully!' });
    });
  });
};