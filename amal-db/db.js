/**
 * amal-db/db.js
 * ─────────────────────────────────────────────────────
 * Centralised MySQL connection pool for Amal Tiznit.
 * Imported by backend/config/db.js and all migration /
 * seeding scripts.
 *
 * Configuration is read from backend/.env via the
 * dotenv call in the consuming script, so no duplicate
 * env loading is needed here.
 * ─────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');
const path  = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const pool = mysql.createPool({
    host              : process.env.DB_HOST     || 'localhost',
    port              : process.env.DB_PORT     || 3306,
    user              : process.env.DB_USER     || 'root',
    password          : process.env.DB_PASSWORD || '',
    database          : process.env.DB_NAME     || 'amal_tiznit_db',
    waitForConnections: true,
    connectionLimit   : 10,
    queueLimit        : 0,
});

/**
 * Quick connectivity check — called on server startup.
 * Returns true on success, false on failure.
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
