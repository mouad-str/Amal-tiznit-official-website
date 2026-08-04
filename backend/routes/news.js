const express = require('express');
const router = express.Router();
const {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');

// Routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
