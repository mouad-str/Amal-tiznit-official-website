const { pool } = require('../config/db');

/**
 * Votes Controller
 * Handles Player of the Month and MOTM Supporter Voting
 */

// POST Cast Vote
const castVote = async (req, res) => {
    try {
        const { playerId, monthYear = 'MARCH-2026' } = req.body;
        const voterIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        if (!playerId) {
            return res.status(400).json({ error: 'Player ID is required' });
        }

        // Verify player exists
        const [playerRows] = await pool.query('SELECT id, name FROM players WHERE id = ?', [playerId]);
        if (playerRows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Record vote
        await pool.query(
            'INSERT INTO player_votes (player_id, month_year, voter_ip) VALUES (?, ?, ?)',
            [playerId, monthYear, voterIp]
        );

        res.json({ success: true, message: `Vote enregistré pour ${playerRows[0].name}!` });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Échec de l\'enregistrement du vote' });
    }
};

// GET Vote Results
const getVoteResults = async (req, res) => {
    try {
        const monthYear = req.query.monthYear || 'MARCH-2026';

        const [results] = await pool.query(`
            SELECT 
                p.id, 
                p.name, 
                p.position, 
                p.number, 
                p.image_url, 
                COUNT(v.id) AS vote_count
            FROM players p
            LEFT JOIN player_votes v ON p.id = v.player_id AND v.month_year = ?
            WHERE p.team_category = 'Senior'
            GROUP BY p.id
            ORDER BY vote_count DESC
        `, [monthYear]);

        const totalVotes = results.reduce((sum, r) => sum + Number(r.vote_count), 0);

        const resultsWithPercent = results.map(r => ({
            ...r,
            vote_count: Number(r.vote_count),
            percent: totalVotes > 0 ? Math.round((Number(r.vote_count) / totalVotes) * 100) : 0
        }));

        res.json({
            monthYear,
            totalVotes,
            results: resultsWithPercent
        });
    } catch (error) {
        console.error('Error fetching vote results:', error);
        res.status(500).json({ error: 'Failed to fetch vote results' });
    }
};

module.exports = {
    castVote,
    getVoteResults
};
