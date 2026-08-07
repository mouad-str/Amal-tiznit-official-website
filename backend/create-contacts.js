/**
 * backend/create-contacts.js
 * ─────────────────────────────────────────────────────
 * Isolated setup script for the "contacts" database table.
 * Creates the table if it does not exist.
 * ─────────────────────────────────────────────────────
 */

const { pool } = require('./config/db');

const createContactsTable = async () => {
    try {
        console.log('🔧 Creating "contacts" table if it does not exist...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(255) NOT NULL,
                email      VARCHAR(255) NOT NULL,
                message    TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ "contacts" table verified/created successfully.');
    } catch (error) {
        console.error('❌ Failed to create "contacts" table:', error.message);
    } finally {
        await pool.end();
    }
};

createContactsTable();
