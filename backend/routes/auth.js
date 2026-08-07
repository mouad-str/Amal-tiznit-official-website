const express = require('express');
const router = express.Router();
const { login, register, googleLogin, updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);

module.exports = router;
