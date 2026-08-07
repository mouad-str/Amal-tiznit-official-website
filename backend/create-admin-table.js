/**
 * backend/create-admin-table.js
 * ─────────────────────────────────────────────────────
 * Isolated setup script for the "admins" database table.
 * Creates the table if it does not exist without dropping
 * other data.
 * ─────────────────────────────────────────────────────
 */

const { pool } = require('./config/db');

const createAdminTable = async () => {
    try {
        console.log('🔧 Creating "admins" table if it does not exist...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(255) NOT NULL,
                email      VARCHAR(255) NOT NULL UNIQUE,
                password   VARCHAR(255) NOT NULL,
                role       ENUM('superadmin','editor') DEFAULT 'superadmin',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ "admins" table verified/created successfully.');
    } catch (error) {
        console.error('❌ Failed to create "admins" table:', error.message);
    } finally {
        await pool.end();
    }
};

createAdminTable();
