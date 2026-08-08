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

// POST book tickets (with SQL transaction)
const bookTickets = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { ticket_id, customer_name, customer_email, customer_phone, quantity } = req.body;

        if (!ticket_id || !customer_name || !customer_email || !customer_phone || !quantity) {
            await connection.rollback();
            return res.status(400).json({ error: 'Tous les champs de réservation sont obligatoires' });
        }

        if (parseInt(quantity) <= 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Quantité invalide' });
        }

        // 1. Fetch ticket and lock row
        const [tickets] = await connection.query(
            'SELECT * FROM tickets WHERE id = ? FOR UPDATE',
            [ticket_id]
        );

        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Catégorie de billet introuvable' });
        }

        const ticket = tickets[0];

        // 2. Check stock availability
        if (ticket.quantity_available < quantity) {
            await connection.rollback();
            return res.status(400).json({ error: 'Nombre de billets disponibles insuffisant' });
        }

        // 3. Decrement quantity_available
        const newQuantity = ticket.quantity_available - quantity;
        await connection.query(
            'UPDATE tickets SET quantity_available = ? WHERE id = ?',
            [newQuantity, ticket_id]
        );

        // 4. Record ticket reservation
        const totalPrice = ticket.price * quantity;
        const [result] = await connection.query(
            `INSERT INTO ticket_bookings (ticket_id, customer_name, customer_email, customer_phone, quantity, total_price, status)
             VALUES (?, ?, ?, ?, ?, ?, 'paid')`,
            [ticket_id, customer_name, customer_email, customer_phone, quantity, totalPrice]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Réservation complétée avec succès !',
            bookingId: result.insertId,
            totalPrice,
            ticketCategory: ticket.seat_category
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error during ticket booking transaction:', error);
        res.status(500).json({ error: 'Échec de la réservation sur le serveur' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getTicketsByMatch,
    getAllTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    bookTickets
};
