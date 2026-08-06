const express = require('express');
const router = express.Router();
const {
    getTicketsByMatch,
    getAllTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    bookTicket
} = require('../controllers/ticketsController');

// Routes
router.get('/', getAllTickets);
router.get('/match/:matchId', getTicketsByMatch);
router.post('/book', bookTicket);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
