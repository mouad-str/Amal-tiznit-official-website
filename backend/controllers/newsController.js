const { pool } = require('../config/db');

/**
 * News Controller
 * Handles all CRUD operations for news articles
 */

// GET all news articles
const getAllNews = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news ORDER BY published_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};

// GET single news article by ID
const getNewsById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
};

// POST create new news article
const createNews = async (req, res) => {
    try {
        const { title, description, image_url, category, published_at } = req.body;

        const [result] = await pool.query(
            `INSERT INTO news (title, description, image_url, category, published_at)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, image_url, category, published_at || new Date()]
        );

        res.status(201).json({ id: result.insertId, message: 'Article created successfully' });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
};

// PUT update news article
const updateNews = async (req, res) => {
    try {
        const { title, description, image_url, category, published_at } = req.body;

        const [result] = await pool.query(
            `UPDATE news SET title = ?, description = ?, image_url = ?, category = ?, published_at = ?
            WHERE id = ?`,
            [title, description, image_url, category, published_at, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Failed to update article' });
    }
};

// DELETE news article
const deleteNews = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
