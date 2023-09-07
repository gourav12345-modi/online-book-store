const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, cartController.addToCart);
router.delete('/remove/:bookId', authMiddleware, cartController.removeFromCart);
router.get('/', authMiddleware, cartController.viewCart);

module.exports = router;
