const db = require('../config/db');

exports.issueBook = (req, res) => {
  const { user_id, book_id } = req.body;
  if (!user_id || !book_id) {
    return res.status(400).json({ message: 'User ID and Book ID are required!' });
  }

  // 1. Check if user already has an active issue for this book
  const checkActiveSql = 'SELECT id FROM issued_books WHERE user_id = ? AND book_id = ? AND status = "issued"';
  db.query(checkActiveSql, [user_id, book_id], (err, activeResults) => {
    if (err) return res.status(500).json({ message: 'Database error checking existing issues' });
    if (activeResults && activeResults.length > 0) {
      return res.status(400).json({ message: 'You have already borrowed this book and have not returned it yet!' });
    }

    // 2. Check book availability
    const checkSql = 'SELECT id, title, available_copies FROM books WHERE id = ?';
    db.query(checkSql, [book_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'Book not found!' });
      }
      if (results[0].available_copies <= 0) {
        return res.status(400).json({ message: 'No copies available right now!' });
      }

      const due_date = new Date();
      due_date.setDate(due_date.getDate() + 14);
      const dueDateStr = due_date.toISOString().split('T')[0];

      // 3. Insert issue record
      const issueSql = 'INSERT INTO issued_books (user_id, book_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, "issued")';
      db.query(issueSql, [user_id, book_id, dueDateStr], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to issue book' });

        // 4. Update available copies
        const updateSql = 'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?';
        db.query(updateSql, [book_id], (err) => {
          if (err) return res.status(500).json({ message: 'Failed to update book count' });
          res.status(201).json({
            message: `Book issued successfully! Due date: ${dueDateStr}`,
            dueDate: dueDateStr
          });
        });
      });
    });
  });
};

exports.returnBook = (req, res) => {
  const { issue_id } = req.body;
  if (!issue_id) {
    return res.status(400).json({ message: 'Issue ID is required!' });
  }

  const getSql = 'SELECT * FROM issued_books WHERE id = ?';
  db.query(getSql, [issue_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Issue record not found!' });
    }
    const issue = results[0];

    if (issue.status === 'returned') {
      return res.status(400).json({ message: 'This book has already been returned!' });
    }

    const today = new Date();
    const dueDate = new Date(issue.due_date);
    let fine = 0;
    if (today > dueDate) {
      const diffDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      fine = diffDays * 2; // Rs 2 per day late
    }

    const returnSql = 'UPDATE issued_books SET return_date=CURDATE(), fine=?, status="returned" WHERE id=?';
    db.query(returnSql, [fine, issue_id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to mark book as returned' });

      const updateSql = 'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?';
      db.query(updateSql, [issue.book_id], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update book copies' });
        res.json({ message: 'Book returned successfully!', fine: fine });
      });
    });
  });
};

exports.getIssuedBooks = (req, res) => {
  const sql = `SELECT ib.id, ib.user_id, ib.book_id,
               u.name as student_name, u.email, u.college_id,
               b.title as book_title, b.author, b.category, b.cover_image,
               ib.issue_date, ib.due_date, ib.return_date, 
               ib.fine, ib.status 
               FROM issued_books ib 
               JOIN users u ON ib.user_id = u.id 
               JOIN books b ON ib.book_id = b.id
               ORDER BY ib.id DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error fetching issued books' });
    res.json(results || []);
  });
};

exports.getMyBooks = (req, res) => {
  const { user_id } = req.params;
  const sql = `SELECT ib.id, b.id as book_id, b.title, b.author, b.category, b.cover_image,
               ib.issue_date, ib.due_date, ib.return_date, ib.fine, ib.status 
               FROM issued_books ib 
               JOIN books b ON ib.book_id = b.id 
               WHERE ib.user_id = ?
               ORDER BY ib.id DESC`;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error fetching user books' });
    res.json(results || []);
  });
};

exports.getStats = (req, res) => {
  const statsQueries = `
    SELECT 
      (SELECT COUNT(*) FROM books) AS total_titles,
      (SELECT COALESCE(SUM(total_copies), 0) FROM books) AS total_copies,
      (SELECT COALESCE(SUM(available_copies), 0) FROM books) AS available_copies,
      (SELECT COUNT(*) FROM issued_books WHERE status = 'issued') AS active_issued,
      (SELECT COUNT(*) FROM issued_books WHERE status = 'returned') AS total_returned,
      (SELECT COUNT(*) FROM issued_books WHERE status = 'issued' AND due_date < CURDATE()) AS overdue_count,
      (SELECT COALESCE(SUM(fine), 0) FROM issued_books) AS total_fines,
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students;
  `;
  db.query(statsQueries, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error fetching statistics' });
    res.json(results[0] || {});
  });
};