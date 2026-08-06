const { pool } = require('../config/db');

/**
 * Tickets Controller
 * Handles all CRUD operations for tickets
 */

// GET all tickets for a specific match
const getTicketsByMatch = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tickets WHERE match_id = ? ORDER BY seat_category',
            [req.params.matchId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// GET all tickets
const getAllTickets = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, m.opponent, m.match_date, m.stadium 
            FROM tickets t 
            JOIN matches m ON t.match_id = m.id 
            ORDER BY m.match_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// POST create new ticket category for a match
const createTicket = async (req, res) => {
    try {
        const { match_id, seat_category, price, quantity_available } = req.body;

        const [result] = await pool.query(
            `INSERT INTO tickets (match_id, seat_category, price, quantity_available)
            VALUES (?, ?, ?, ?)`,
            [match_id, seat_category, price, quantity_available || 500]
        );

        res.status(201).json({ id: result.insertId, message: 'Ticket category created successfully' });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

// PUT update ticket availability
const updateTicket = async (req, res) => {
    try {
        const { price, quantity_available } = req.body;

        const [result] = await pool.query(
            `UPDATE tickets SET price = ?, quantity_available = ? WHERE id = ?`,
            [price, quantity_available, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};

// DELETE ticket
const deleteTicket = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
};

module.exports = {
    getTicketsByMatch,
    getAllTickets,
    createTicket,
    updateTicket,
    deleteTicket
};
