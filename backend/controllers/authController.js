const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_prod';

/**
 * Auth Controller
 */

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

        // Generate Token
        const token = jwt.sign(
            { id: admin.id, role: admin.role, name: admin.name, email: admin.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Update Profile
const updateProfile = async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const adminId = req.user.id; // From middleware

        const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [adminId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const admin = rows[0];

        // Verify current password if changing sensitive info
        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Incorrect current password' });
            }
        }

        let updateQuery = 'UPDATE admins SET name = ?';
        let queryParams = [name];

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            updateQuery += ', password = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(adminId);

        await pool.query(updateQuery, queryParams);

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get Current User (Me)
const getMe = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, last_login FROM admins WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    login,
    updateProfile,
    getMe,
    JWT_SECRET
};
