const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', bookController.getPaginatedBooks);
router.post('/', authMiddleware ,bookController.createBook);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);
router.put('/:id', authMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, bookController.deleteBook);
router.post('/:id/rate-review', authMiddleware, bookController.addRatingAndReview);
router.get('/:id/rate-review', bookController.getRatingsAndReviews);

module.exports = router;
