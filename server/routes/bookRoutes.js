const express = require('express');
const router = express.Router();
const { addBook, getBooks, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addBook);
router.get('/', protect, getBooks);
router.delete('/:id', protect, deleteBook);

module.exports = router;
