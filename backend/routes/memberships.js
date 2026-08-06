const express = require('express');
const router = express.Router();
const { createMembership, getMembershipByCode, getAllMemberships } = require('../controllers/membershipsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createMembership);
router.get('/code/:code', getMembershipByCode);
router.get('/', protect, getAllMemberships);

module.exports = router;
