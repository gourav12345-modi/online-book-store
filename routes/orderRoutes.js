const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, orderController.placeOrder);
router.get('/', authMiddleware, orderController.getOrderHistory);

module.exports = router;
