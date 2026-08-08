const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Register User / Admin
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
        }

        // Check if email exists
        const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Un compte avec cet email existe déjà.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin user
        const [result] = await pool.query(
            'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'editor']
        );

        // Generate Token
        const token = jwt.sign(
            { id: result.insertId, role: 'editor', name, email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role: 'editor'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Échec de la création de compte sur le serveur.' });
    }
};

// Google Authentication / Login
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Token Google manquant' });
        }

        let email, name, googleId;

        if (process.env.GOOGLE_CLIENT_ID) {
            // Real Google Verification
            try {
                const ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                email = payload.email;
                name = payload.name;
                googleId = payload.sub;
            } catch (verifyErr) {
                console.error('Google token verification failed:', verifyErr);
                return res.status(401).json({ error: 'Token Google invalide ou expiré' });
            }
        } else {
            // Mock/Demo Verification (for local development without credentials)
            console.warn('⚠️ GOOGLE_CLIENT_ID is not configured in .env. Falling back to development mock login.');
            if (credential.startsWith('{')) {
                try {
                    const parsed = JSON.parse(credential);
                    email = parsed.email;
                    name = parsed.name;
                    googleId = parsed.googleId;
                } catch {
                    email = 'user.google@amaltiznit.ma';
                    name = 'Utilisateur Google';
                    googleId = 'google_mock_id';
                }
            } else {
                email = 'user.google@amaltiznit.ma';
                name = 'Utilisateur Google';
                googleId = 'google_mock_id';
            }
        }

        if (!email) {
            return res.status(400).json({ error: 'Adresse email Google non disponible' });
        }

        // Check if user exists
        let [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
        let user;

        if (rows.length === 0) {
            // Auto register Google user
            const dummyPassword = await bcrypt.hash(googleId || 'google_auth_secret_' + Date.now(), 10);
            const [result] = await pool.query(
                'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name || 'Utilisateur Google', email, dummyPassword, 'editor']
            );
            user = { id: result.insertId, name: name || 'Utilisateur Google', email, role: 'editor' };
        } else {
            user = rows[0];
        }

        // Update last login
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Erreur interne lors de la connexion Google' });
    }
};

module.exports = {
    login,
    register,
    googleLogin,
    updateProfile,
    getMe,
    JWT_SECRET
};
