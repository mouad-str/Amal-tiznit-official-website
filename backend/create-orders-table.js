/**
 * backend/create-orders-table.js
 * ─────────────────────────────────────────────────────
 * Isolated setup script for the "orders" and "order_items"
 * database tables. Creates the tables if they do not exist.
 * ─────────────────────────────────────────────────────
 */

const { pool } = require('./config/db');

const createOrdersTable = async () => {
    try {
        console.log('🔧 Creating "orders" table if it does not exist...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                customer_name    VARCHAR(255) NOT NULL,
                customer_email   VARCHAR(255) NOT NULL,
                customer_phone   VARCHAR(50)  NOT NULL,
                customer_address TEXT         NOT NULL,
                total            DECIMAL(10,2) NOT NULL,
                status           ENUM('pending','paid','shipped','cancelled') DEFAULT 'pending',
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ "orders" table verified/created.');

        console.log('🔧 Creating "order_items" table if it does not exist...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                order_id   INT NOT NULL,
                product_id INT NOT NULL,
                quantity   INT NOT NULL,
                price      DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ "order_items" table verified/created.');
        console.log('✅ "orders" and "order_items" tables setup complete.');
    } catch (error) {
        console.error('❌ Failed to create orders tables:', error.message);
    } finally {
        await pool.end();
    }
};

createOrdersTable();
