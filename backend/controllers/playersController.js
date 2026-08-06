const { pool } = require('../config/db');

/**
 * Players Controller
 * Handles all CRUD operations for players
 */

// GET all players
const getAllPlayers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM players ORDER BY number ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
};

// GET single player by ID
const getPlayerById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
};

// POST create new player
const createPlayer = async (req, res) => {
    try {
        const {
            name, position, number, image_url, nationality, team_category,
            birth_date, age, height, weight, foot,
            matches_played, goals, assists, minutes_played, yellow_cards, red_cards
        } = req.body;

        const playerNum = Number(number) || 1;

        const [result] = await pool.query(
            `INSERT INTO players 
            (name, position, number, image_url, nationality, team_category, birth_date, age, height, weight, foot, matches_played, goals, assists, minutes_played, yellow_cards, red_cards)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, position, playerNum, image_url || '', nationality || 'Moroccan', team_category || 'Senior',
                birth_date || null, age ? Number(age) : null, height ? Number(height) : null, weight ? Number(weight) : null, foot || 'Droit',
                Number(matches_played) || 0, Number(goals) || 0, Number(assists) || 0, Number(minutes_played) || 0, Number(yellow_cards) || 0, Number(red_cards) || 0
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Player created successfully' });
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ error: 'Failed to create player: ' + error.message });
    }
};

// PUT update player
const updatePlayer = async (req, res) => {
    try {
        const {
            name, position, number, image_url, nationality, team_category,
            birth_date, age, height, weight, foot,
            matches_played, goals, assists, minutes_played, yellow_cards, red_cards
        } = req.body;

        const playerNum = Number(number) || 1;

        const [result] = await pool.query(
            `UPDATE players SET 
            name = ?, position = ?, number = ?, image_url = ?, nationality = ?, team_category = ?,
            birth_date = ?, age = ?, height = ?, weight = ?, foot = ?,
            matches_played = ?, goals = ?, assists = ?, minutes_played = ?, yellow_cards = ?, red_cards = ?
            WHERE id = ?`,
            [
                name, position, playerNum, image_url || '', nationality || 'Moroccan', team_category || 'Senior',
                birth_date || null, age ? Number(age) : null, height ? Number(height) : null, weight ? Number(weight) : null, foot || 'Droit',
                Number(matches_played) || 0, Number(goals) || 0, Number(assists) || 0, Number(minutes_played) || 0, Number(yellow_cards) || 0, Number(red_cards) || 0,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player: ' + error.message });
    }
};

// DELETE player
const deletePlayer = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM players WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
};

module.exports = {
    getAllPlayers,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer
};
