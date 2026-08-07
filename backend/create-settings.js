/**
 * backend/create-settings.js
 * ─────────────────────────────────────────────────────
 * Isolated setup script for the "ticket_settings" database
 * table. Creates the table if it does not exist.
 * ─────────────────────────────────────────────────────
 */

const { pool } = require('./config/db');

const createSettingsTable = async () => {
    try {
        console.log('🔧 Creating "ticket_settings" table if it does not exist...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_settings (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                setting_key   VARCHAR(50) NOT NULL UNIQUE,
                setting_value LONGTEXT NOT NULL,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ "ticket_settings" table verified/created successfully.');
    } catch (error) {
        console.error('❌ Failed to create "ticket_settings" table:', error.message);
    } finally {
        await pool.end();
    }
};

createSettingsTable();
