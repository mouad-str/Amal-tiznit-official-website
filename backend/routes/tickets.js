const express = require('express');
const router = express.Router();
const {
    getTicketsByMatch,
    getAllTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    bookTickets
} = require('../controllers/ticketsController');

// Routes
router.get('/', getAllTickets);
router.get('/match/:matchId', getTicketsByMatch);
router.post('/', createTicket);
router.post('/book', bookTickets);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
