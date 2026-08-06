const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/ordersController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/', createOrder); // Public (Checkout)
router.get('/', protect, getAllOrders); // Admin Only
router.put('/:id/status', protect, updateOrderStatus); // Admin Only

module.exports = router;
