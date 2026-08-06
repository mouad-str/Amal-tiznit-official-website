const pool = require('../config/db');

// POST create membership card
const createMembership = async (req, res) => {
    try {
        const { full_name, email, phone, tier } = req.body;
        if (!full_name || !email || !phone) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const tierName = tier || 'Bronze';
        const discountMap = { Bronze: 10, Gold: 15, Platinum: 20 };
        const discount_percent = discountMap[tierName] || 10;

        // Generate unique member code: USAT-2026-XXXX
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const member_id_code = `USAT-2026-${randomCode}`;

        // Expiration 1 year from now
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
        const expires_at = expiresDate.toISOString().split('T')[0];

        const [result] = await pool.query(`
            INSERT INTO memberships (member_id_code, full_name, email, phone, tier, discount_percent, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [member_id_code, full_name, email, phone, tierName, discount_percent, expires_at]);

        res.status(201).json({
            id: result.insertId,
            member_id_code,
            full_name,
            email,
            phone,
            tier: tierName,
            discount_percent,
            expires_at
        });

    } catch (error) {
        console.error('Error creating membership:', error);
        res.status(500).json({ error: 'Failed to create membership card' });
    }
};

// GET single membership by code
const getMembershipByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const [rows] = await pool.query('SELECT * FROM memberships WHERE member_id_code = ?', [code.trim()]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Carte de membre non trouvée' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching membership:', error);
        res.status(500).json({ error: 'Failed to fetch membership' });
    }
};

// GET all memberships (Admin)
const getAllMemberships = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM memberships ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all memberships:', error);
        res.status(500).json({ error: 'Failed to fetch memberships' });
    }
};

module.exports = {
    createMembership,
    getMembershipByCode,
    getAllMemberships
};
