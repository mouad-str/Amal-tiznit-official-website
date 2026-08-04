/**
 * amal-db/init.js
 * ─────────────────────────────────────────────────────
 * Creates every table in amal_tiznit_db and seeds
 * default data if the tables are empty.
 *
 * Usage (from project root or backend/):
 *   node ../amal-db/init.js
 * Or via npm script in backend:
 *   npm run db:init
 * ─────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path   = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const initDatabase = async () => {
    let connection;
    try {
        // Connect without selecting a database first so we can CREATE it if missing
        connection = await mysql.createConnection({
            host    : process.env.DB_HOST     || 'localhost',
            port    : process.env.DB_PORT     || 3306,
            user    : process.env.DB_USER     || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        const dbName = process.env.DB_NAME || 'amal_tiznit_db';

        console.log(`🔧 Creating database "${dbName}" if it does not exist…`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        // ── TABLES ──────────────────────────────────────────────────────────

        console.log('📋 Creating tables…');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS players (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                name            VARCHAR(255) NOT NULL,
                position        ENUM('Goalkeeper','Defender','Midfielder','Forward') NOT NULL,
                number          INT NOT NULL,
                image_url       LONGTEXT,
                nationality     VARCHAR(100) DEFAULT 'Moroccan',
                matches_played  INT DEFAULT 0,
                goals           INT DEFAULT 0,
                assists         INT DEFAULT 0,
                minutes_played  INT DEFAULT 0,
                yellow_cards    INT DEFAULT 0,
                red_cards       INT DEFAULT 0,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ players');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS matches (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                opponent    VARCHAR(255) NOT NULL,
                match_date  DATETIME NOT NULL,
                stadium     VARCHAR(255) NOT NULL,
                is_home     BOOLEAN DEFAULT TRUE,
                status      ENUM('upcoming','finished') DEFAULT 'upcoming',
                home_score  INT,
                away_score  INT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ matches');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS news (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                title        VARCHAR(255) NOT NULL,
                description  TEXT,
                image_url    LONGTEXT,
                category     VARCHAR(100),
                published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ news');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(255) NOT NULL,
                price      DECIMAL(10,2) NOT NULL,
                image_url  TEXT,
                category   VARCHAR(100),
                stock      INT DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ products');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id                 INT AUTO_INCREMENT PRIMARY KEY,
                match_id           INT NOT NULL,
                seat_category      ENUM('VIP','Standard','Economy') NOT NULL,
                price              DECIMAL(10,2) NOT NULL,
                quantity_available INT DEFAULT 500,
                created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ tickets');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                customer_name    VARCHAR(255) NOT NULL,
                customer_email   VARCHAR(255) NOT NULL,
                customer_phone   VARCHAR(50)  NOT NULL,
                customer_address TEXT NOT NULL,
                total_amount     DECIMAL(10,2) NOT NULL,
                status           ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ orders');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                order_id       INT NOT NULL,
                product_id     INT NOT NULL,
                quantity       INT NOT NULL,
                price_at_time  DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ order_items');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(255) NOT NULL,
                email      VARCHAR(255) NOT NULL,
                message    TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ contacts');

        await connection.query(`
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
        console.log('  ✅ admins');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_settings (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                setting_key   VARCHAR(50) NOT NULL UNIQUE,
                setting_value LONGTEXT NOT NULL,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ ticket_settings');

        // users table (legacy — kept for backward compatibility)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                username      VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role          ENUM('admin','editor') DEFAULT 'editor',
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ users (legacy)');

        // ── SEED DATA ────────────────────────────────────────────────────────

        console.log('\n🌱 Seeding initial data…');

        // Players
        const [[{ count: playerCount }]] = await connection.query('SELECT COUNT(*) AS count FROM players');
        if (playerCount === 0) {
            await connection.query(`
                INSERT INTO players
                    (name, position, number, image_url, nationality, matches_played, goals, assists, minutes_played, yellow_cards, red_cards)
                VALUES
                    ('Karim Alaoui',       'Goalkeeper', 1,  'https://shorturl.at/npQeJ',        'Moroccan', 18, 0,  1, 1620, 1, 0),
                    ('Youssef El Amrani',  'Defender',   4,  'https://shorturl.at/7SxIi',        'Moroccan', 15, 1,  2, 1300, 3, 0),
                    ('Mehdi Benkirane',    'Midfielder', 8,  'https://shorturl.at/YUsht',        'Moroccan', 17, 4,  6, 1450, 2, 0),
                    ('Sofiane Rahimi',     'Forward',    7,  'https://h7.cl/1hBq6',              'Moroccan', 16, 12, 4, 1380, 1, 0),
                    ('Hamza Mendyl',       'Defender',   12, 'https://shorturl.at/Fev0k',        'Moroccan', 14, 0,  3, 1200, 4, 1),
                    ('Omar Ati-Allah',     'Midfielder', 10, 'https://tinyurl.com/2yp58vuz',     'Moroccan', 18, 6,  8, 1550, 2, 0),
                    ('Zakaria Hadraf',     'Forward',    11, 'https://shorturl.at/51kVc',        'Moroccan', 10, 3,  1,  600, 0, 0),
                    ('Anas Zniti',         'Goalkeeper', 22, 'https://tinyurl.com/9j5rzt9t',     'Moroccan',  5, 0,  0,  450, 0, 0)
            `);
            console.log('  ✅ players seeded');
        } else {
            console.log('  ℹ️  players already seeded — skipping');
        }

        // Matches
        const [[{ count: matchCount }]] = await connection.query('SELECT COUNT(*) AS count FROM matches');
        if (matchCount === 0) {
            await connection.query(`
                INSERT INTO matches (opponent, match_date, stadium, is_home, status, home_score, away_score) VALUES
                ('Hassania Agadir', '2026-03-15 16:00:00', 'Stade de Tiznit',          TRUE,  'upcoming', NULL, NULL),
                ('Raja Casablanca', '2026-03-22 18:00:00', 'Mohamed V',                FALSE, 'upcoming', NULL, NULL),
                ('Wydad AC',        '2026-03-02 15:30:00', 'Stade de Tiznit',          TRUE,  'finished', 1,    0   ),
                ('AS FAR',          '2026-02-24 19:00:00', 'Prince Moulay Abdellah',   FALSE, 'finished', 2,    2   )
            `);
            console.log('  ✅ matches seeded');
        } else {
            console.log('  ℹ️  matches already seeded — skipping');
        }

        // News
        const [[{ count: newsCount }]] = await connection.query('SELECT COUNT(*) AS count FROM news');
        if (newsCount === 0) {
            await connection.query(`
                INSERT INTO news (title, description, image_url, category, published_at) VALUES
                ('Historic Training Camp Underway in Ifrane',
                 'The club has arrived in Ifrane for a 10-day high-altitude training program.',
                 'https://picsum.photos/seed/n1/1200/800', 'Training',      '2026-03-12'),
                ('New Striker Signs Three-Year Deal',
                 'Amal Tiznit is delighted to announce the signing of a Moroccan international striker.',
                 'https://picsum.photos/seed/n2/800/600',  'Transfer',      '2026-03-08'),
                ('Tiznit Youth Academy Trials Announced',
                 'Young talents from across the region are invited to showcase their skills.',
                 'https://picsum.photos/seed/n3/800/600',  'Youth',         '2026-03-05'),
                ('Stadium Infrastructure Upgrades Approved',
                 'The city council has approved plans for a new lighting system.',
                 'https://picsum.photos/seed/n4/800/600',  'Infrastructure','2026-03-01')
            `);
            console.log('  ✅ news seeded');
        } else {
            console.log('  ℹ️  news already seeded — skipping');
        }

        // Products
        const [[{ count: productCount }]] = await connection.query('SELECT COUNT(*) AS count FROM products');
        if (productCount === 0) {
            await connection.query(`
                INSERT INTO products (name, price, image_url, category, stock) VALUES
                ('Home Kit 2025/26',  450.00, 'https://images.unsplash.com/photo-1577212417292-b92c4cd7f55f?w=800&auto=format&fit=crop&q=60', 'Kits',        200),
                ('Away Kit 2025/26',  450.00, 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=800&auto=format&fit=crop&q=60', 'Kits',        150),
                ('Training Top',      300.00, 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&auto=format&fit=crop&q=60', 'Training',    300),
                ('Supporter Scarf',   150.00, 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&auto=format&fit=crop&q=60', 'Accessories', 500)
            `);
            console.log('  ✅ products seeded');
        } else {
            console.log('  ℹ️  products already seeded — skipping');
        }

        // Tickets (depends on matches being seeded first)
        const [[{ count: ticketCount }]] = await connection.query('SELECT COUNT(*) AS count FROM tickets');
        if (ticketCount === 0) {
            const [[firstMatch]] = await connection.query("SELECT id FROM matches WHERE status='upcoming' LIMIT 1");
            const [[secondMatch]] = await connection.query("SELECT id FROM matches WHERE status='upcoming' LIMIT 1 OFFSET 1");
            if (firstMatch && secondMatch) {
                await connection.query(`
                    INSERT INTO tickets (match_id, seat_category, price, quantity_available) VALUES
                    (?, 'VIP',      200.00, 100),
                    (?, 'Standard', 100.00, 500),
                    (?, 'Economy',   50.00, 1000),
                    (?, 'VIP',      250.00,  80),
                    (?, 'Standard', 120.00, 400),
                    (?, 'Economy',   60.00, 800)
                `, [firstMatch.id, firstMatch.id, firstMatch.id,
                    secondMatch.id, secondMatch.id, secondMatch.id]);
                console.log('  ✅ tickets seeded');
            }
        } else {
            console.log('  ℹ️  tickets already seeded — skipping');
        }

        // Default admin
        const [[{ count: adminCount }]] = await connection.query("SELECT COUNT(*) AS count FROM admins WHERE email = 'admin@amaltiznit.com'");
        if (adminCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            await connection.query(
                `INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Admin User', 'admin@amaltiznit.com', hash, 'superadmin']
            );
            console.log('  ✅ default admin created  →  admin@amaltiznit.com / admin123');
        } else {
            console.log('  ℹ️  admin already exists — skipping');
        }

        // Ticket settings
        const [[{ count: settingsCount }]] = await connection.query('SELECT COUNT(*) AS count FROM ticket_settings');
        if (settingsCount === 0) {
            const defaults = [
                { key: 'title',           value: 'الاتحاد الرياضي أمل تيزنيت' },
                { key: 'subTitlePrefix',  value: 'USAT +' },
                { key: 'branding_logo',   value: '/Assets/logo.png' },
                { key: 'branding_teamName', value: 'USAT' },
                { key: 'sponsors', value: JSON.stringify([
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Nike_Logo.svg/2560px-Nike_Logo.svg.png',
                    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
                ]) },
            ];
            for (const item of defaults) {
                await connection.execute(
                    'INSERT IGNORE INTO ticket_settings (setting_key, setting_value) VALUES (?, ?)',
                    [item.key, item.value]
                );
            }
            console.log('  ✅ ticket_settings seeded');
        } else {
            console.log('  ℹ️  ticket_settings already seeded — skipping');
        }

        console.log('\n✨ Database initialisation complete!');
    } catch (error) {
        console.error('❌ Database initialisation failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

initDatabase();
