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

    const runSafe = async (label, sql) => {
        try {
            await connection.execute(sql);
            console.log(`  ✅ ${label}`);
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
                console.log(`  ⏭️  ${label} — already applied`);
            } else {
                console.warn(`  ⚠️  ${label} — ${error.message}`);
            }
        }
    };

    try {
        // M001 — image_url columns → LONGTEXT for base64 support
        await runSafe('[M001] players.image_url → LONGTEXT',
            'ALTER TABLE players MODIFY COLUMN image_url LONGTEXT');
        await runSafe('[M001] news.image_url → LONGTEXT',
            'ALTER TABLE news MODIFY COLUMN image_url LONGTEXT');

        // M002 — Add description column to products
        await runSafe('[M002] products.description',
            'ALTER TABLE products ADD COLUMN description TEXT AFTER name');

        // M003 — Add sizes column to products
        await runSafe('[M003] products.sizes',
            "ALTER TABLE products ADD COLUMN sizes VARCHAR(255) DEFAULT 'S,M,L,XL' AFTER stock");

        console.log('\n🎉 All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
    }
}

migrate();
