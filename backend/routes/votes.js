const express = require('express');
const router = express.Router();
const { castVote, getVoteResults } = require('../controllers/votesController');

router.post('/', castVote);
router.get('/results', getVoteResults);

module.exports = router;
