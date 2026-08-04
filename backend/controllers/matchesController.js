const { pool } = require('../config/db');

/**
 * Matches Controller
 * Handles all CRUD operations for matches
 */

// GET all matches
const getAllMatches = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM matches ORDER BY match_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

// GET single match by ID
const getMatchById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ error: 'Failed to fetch match' });
    }
};

// POST create new match
const createMatch = async (req, res) => {
    try {
        const { opponent, match_date, stadium, is_home, status, home_score, away_score } = req.body;

        const [result] = await pool.query(
            `INSERT INTO matches (opponent, match_date, stadium, is_home, status, home_score, away_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [opponent, match_date, stadium, is_home ?? true, status || 'upcoming', home_score, away_score]
        );

        res.status(201).json({ id: result.insertId, message: 'Match created successfully' });
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

// PUT update match
const updateMatch = async (req, res) => {
    try {
        const { opponent, match_date, stadium, is_home, status, home_score, away_score } = req.body;

        const [result] = await pool.query(
            `UPDATE matches SET 
            opponent = ?, match_date = ?, stadium = ?, is_home = ?, status = ?, home_score = ?, away_score = ?
            WHERE id = ?`,
            [opponent, match_date, stadium, is_home, status, home_score, away_score, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
};

// DELETE match
const deleteMatch = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Failed to delete match' });
    }
};

module.exports = {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch
};
