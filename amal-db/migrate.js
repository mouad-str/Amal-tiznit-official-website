/**
 * amal-db/migrate.js
 * ─────────────────────────────────────────────────────
 * Applies schema migrations on top of the base tables
 * created by init.js.
 *
 * Usage:
 *   node ../amal-db/migrate.js
 * Or via npm script in backend:
 *   npm run db:migrate
 * ─────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');
const path  = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host    : process.env.DB_HOST     || 'localhost',
        port    : process.env.DB_PORT     || 3306,
        user    : process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'amal_tiznit_db',
    });

    console.log('🔄 Running migrations…');

    try {
        // M001 — image_url columns → LONGTEXT for base64 support
        await connection.execute('ALTER TABLE players MODIFY COLUMN image_url LONGTEXT');
        console.log('  ✅ [M001] players.image_url → LONGTEXT');

        await connection.execute('ALTER TABLE news MODIFY COLUMN image_url LONGTEXT');
        console.log('  ✅ [M001] news.image_url → LONGTEXT');

        console.log('\n🎉 All migrations completed successfully!');
    } catch (error) {
        // If the column is already the correct type MySQL throws a benign error —
        // log it as a warning rather than crashing.
        if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
            console.warn('  ⚠️  Migration already applied — skipping');
        } else {
            console.error('❌ Migration failed:', error.message);
        }
    } finally {
        await connection.end();
    }
}

migrate();
