const express = require('express');
const router = express.Router();
const { issueBook, returnBook, getIssuedBooks, getMyBooks, getStats } = require('../controllers/issueController');

router.post('/issue', issueBook);
router.post('/return', returnBook);
router.get('/all', getIssuedBooks);
router.get('/stats', getStats);
router.get('/mybooks/:user_id', getMyBooks);

module.exports = router;