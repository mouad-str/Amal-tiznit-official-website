const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/ticket', settingsController.getTicketSettings);
router.put('/ticket', settingsController.updateTicketSettings);

module.exports = router;
