const express = require('express');
const router = express.Router();
const { getAllBooks, searchBooks, addBook, updateBook, deleteBook, upload } = require('../controllers/bookController');

router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.post('/add', upload.single('cover_image'), addBook);
router.put('/update/:id', upload.single('cover_image'), updateBook);
router.delete('/delete/:id', deleteBook);

module.exports = router;