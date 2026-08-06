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

        // M004 — E-Commerce Shop Enhancements for products
        await runSafe('[M004] products.slug',
            'ALTER TABLE products ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER name');
        await runSafe('[M004] products.collection',
            "ALTER TABLE products ADD COLUMN collection VARCHAR(100) DEFAULT 'Main' AFTER category");
        await runSafe('[M004] products.gender',
            "ALTER TABLE products ADD COLUMN gender VARCHAR(50) DEFAULT 'Unisex' AFTER collection");
        await runSafe('[M004] products.compare_at_price',
            'ALTER TABLE products ADD COLUMN compare_at_price DECIMAL(10,2) DEFAULT NULL AFTER price');
        await runSafe('[M004] products.is_featured',
            'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER compare_at_price');
        await runSafe('[M004] products.is_new',
            'ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT FALSE AFTER is_featured');

        // M005 — E-Commerce Order Items Enhancements
        await runSafe('[M005] order_items.size',
            "ALTER TABLE order_items ADD COLUMN size VARCHAR(50) DEFAULT 'M' AFTER quantity");
        await runSafe('[M005] order_items.flocage',
            'ALTER TABLE order_items ADD COLUMN flocage VARCHAR(255) DEFAULT NULL AFTER size');
        await runSafe('[M005] order_items.has_patch',
            'ALTER TABLE order_items ADD COLUMN has_patch BOOLEAN DEFAULT FALSE AFTER flocage');

        // M006 — Create Coupons Table
        await runSafe('[M006] coupons table', `
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_percent INT NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('\n🎉 All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
    }
}

migrate();
