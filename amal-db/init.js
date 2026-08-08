/**
 * amal-db/init.js
 * ─────────────────────────────────────────────────────
 * Creates every table in amal_tiznit_db and seeds
 * realistic production-ready testing data.
 * ─────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path   = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const initDatabase = async () => {
    let connection;
    try {
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

        console.log('📋 Creating tables…');

        // Players Table
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

        // Matches Table
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

        // News Table
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

        // Products Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(255) NOT NULL,
                description TEXT,
                price       DECIMAL(10,2) NOT NULL,
                image_url   TEXT,
                category    VARCHAR(100),
                stock       INT DEFAULT 100,
                sizes       VARCHAR(255) DEFAULT 'S,M,L,XL',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ products');

        // Tickets Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id                 INT AUTO_INCREMENT PRIMARY KEY,
                match_id           INT NOT NULL,
                seat_category      ENUM('VIP','Standard','Economy') NOT NULL,
                price              DECIMAL(10,2) NOT NULL,
                quantity_available INT NOT NULL,
                created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ tickets');

        // Orders Table
        await connection.query(`
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
        console.log('  ✅ orders');

        // Order Items Table
        await connection.query(`
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
        console.log('  ✅ order_items');

        // Contacts Table
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

        // Admins Table
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

        // Ticket Settings Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_settings (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                setting_key   VARCHAR(50) NOT NULL UNIQUE,
                setting_value LONGTEXT NOT NULL,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ ticket_settings');

        // Ticket Bookings Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_bookings (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id      INT NOT NULL,
                customer_name  VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50) NOT NULL,
                quantity       INT NOT NULL,
                total_price    DECIMAL(10,2) NOT NULL,
                booking_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status         VARCHAR(50) DEFAULT 'paid',
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ ticket_bookings');

        console.log('\n🌱 Seeding realistic testing data…');

        // Refresh & Seed Players
        await connection.query('DELETE FROM players');
        await connection.query(`
            INSERT INTO players
                (name, position, number, image_url, nationality, matches_played, goals, assists, minutes_played, yellow_cards, red_cards)
            VALUES
                ('Karim Alaoui',       'Goalkeeper', 1,  '/Assets/bg.jpg',   'Moroccan', 22, 0,  1, 1980, 1, 0),
                ('Anas Zniti',         'Goalkeeper', 22, '/Assets/bg.jpg',   'Moroccan',  6, 0,  0,  540, 0, 0),
                ('Youssef El Amrani',  'Defender',   4,  '/Assets/bg2.jpg',  'Moroccan', 19, 2,  1, 1650, 3, 0),
                ('Hamza Mendyl',       'Defender',   12, '/Assets/bg2.jpg',  'Moroccan', 18, 1,  3, 1520, 4, 1),
                ('Badr Benoun',        'Defender',   5,  '/Assets/bg2.jpg',  'Moroccan', 21, 3,  1, 1890, 2, 0),
                ('Achraf Dari',        'Defender',   3,  '/Assets/bg2.jpg',  'Moroccan', 17, 1,  0, 1480, 5, 0),
                ('Mehdi Benkirane',    'Midfielder', 10, '/Assets/bg1.jpg',  'Moroccan', 20, 8,  6, 1720, 2, 0),
                ('Omar Ati-Allah',     'Midfielder', 8,  '/Assets/bg1.jpg',  'Moroccan', 19, 5,  7, 1600, 1, 0),
                ('Fayçal Fajr',        'Midfielder', 6,  '/Assets/bg1.jpg',  'Moroccan', 21, 4,  9, 1790, 3, 0),
                ('Sofiane Rahimi',     'Forward',    9,  '/Assets/bg2.jpg',  'Moroccan', 21, 14, 4, 1810, 1, 0),
                ('Zakaria Hadraf',     'Forward',    11, '/Assets/bg1.jpg',  'Moroccan', 16, 7,  3, 1250, 0, 0),
                ('Ayoub El Kaabi',     'Forward',    17, '/Assets/bg.jpg',   'Moroccan', 18, 11, 2, 1490, 2, 0)
        `);
        console.log('  ✅ 12 Squad Players seeded');

        // Refresh & Seed Matches
        await connection.query('DELETE FROM tickets');
        await connection.query('DELETE FROM matches');
        await connection.query(`
            INSERT INTO matches (opponent, match_date, stadium, is_home, status, home_score, away_score) VALUES
            ('Kawkab Marrakech',  '2026-03-20 16:00:00', 'Stade El Massira Tiznit',    TRUE,  'upcoming', NULL, NULL),
            ('Olympique Dcheira', '2026-03-28 18:00:00', 'Stade Ahmad Fana Dcheira',   FALSE, 'upcoming', NULL, NULL),
            ('COD Meknès',        '2026-04-05 16:00:00', 'Stade El Massira Tiznit',    TRUE,  'upcoming', NULL, NULL),
            ('Stade Marocain',    '2026-03-02 16:00:00', 'Stade El Massira Tiznit',    TRUE,  'finished', 2,    1   ),
            ('Difaâ El Jadida',   '2026-02-22 17:00:00', 'Stade El Abdi El Jadida',    FALSE, 'finished', 1,    2   ),
            ('Raja Beni Mellal',  '2026-02-14 15:30:00', 'Stade El Massira Tiznit',    TRUE,  'finished', 3,    0   )
        `);
        console.log('  ✅ 6 Matches & Fixtures seeded');

        // Refresh & Seed News
        await connection.query('DELETE FROM news');
        await connection.query(`
            INSERT INTO news (title, description, image_url, category, published_at) VALUES
            ('Victoire Déterminante de l''Amal Tiznit (2-1) Face au Stade Marocain',
             'Devant un public enflammé au Stade El Massira, les Rouges et Bleus se sont imposés grâce à un doublé de Sofiane Rahimi.',
             '/Assets/bg1.jpg', 'Match Report', '2026-03-03 18:30:00'),
            ('Signature Officielle de l''Attaquant International Ayoub El Kaabi',
             'L''US Amal Tiznit confirme le recrutement majeur d''Ayoub El Kaabi pour renforcer l''attaque en Botola Pro.',
             '/Assets/bg.jpg',  'Transfers',    '2026-03-01 10:00:00'),
            ('Stage de Préparation Intensif à Ifrane Avant le Choc Contre Kawkab',
             'L''équipe professionnelle a entamé un stage en altitude de 7 jours pour affiner sa préparation physique.',
             '/Assets/bg2.jpg', 'Club News',    '2026-02-26 14:00:00'),
            ('Lancement des Détections Annuelles de l''Académie de Football USAT',
             'Les jeunes talents de la région Souss-Massa sont invités aux journées de portes ouvertes pour intégrer le centre de formation.',
             '/Assets/bg1.jpg', 'Academy',      '2026-02-20 11:00:00'),
            ('Modernisation Éclairage & Pelouse Synthétique au Stade El Massira',
             'Le Conseil de la ville a validé les travaux de rénovation des projecteurs LED et de la tribune VIP.',
             '/Assets/bg.jpg',  'Infrastructure','2026-02-15 09:30:00'),
            ('Interview Exclusive avec le Capitaine Youssef El Amrani',
             '« Notre objectif reste la qualification et d''offrir du spectacle à nos supporters à Tiznit » affirme le capitaine.',
             '/Assets/bg2.jpg', 'Interviews',   '2026-02-10 16:00:00')
        `);
        console.log('  ✅ 6 News Articles seeded');

        // Refresh & Seed Products
        await connection.query('DELETE FROM products');
        await connection.query(`
            INSERT INTO products (name, description, price, image_url, category, stock, sizes) VALUES
            ('Maillot Domicile Officiel 2025/26 (Bleu & Rouge)',
             'Le maillot officiel domicile de l''US Amal Tiznit pour la saison 2025/26. Tissu respirant Dri-FIT, écusson brodé, coupe athlétique. Portez les couleurs bleu et rouge avec fierté au Stade El Massira.',
             450.00, 'https://images.unsplash.com/photo-1577212417292-b92c4cd7f55f?w=800&auto=format&fit=crop&q=60', 'Kits', 150, 'S,M,L,XL,XXL'),
            ('Maillot Extérieur Blanc 2025/26',
             'Maillot extérieur blanc immaculé avec détails bleu marine. Technologie anti-transpiration, tissu léger haute performance. Édition limitée saison 2025/26.',
             450.00, 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=800&auto=format&fit=crop&q=60', 'Kits', 120, 'S,M,L,XL,XXL'),
            ('Veste d''Entraînement Pro USAT',
             'Veste d''entraînement officielle portée par les joueurs professionnels. Coupe-vent, poches zippées, logo USAT brodé sur la poitrine. Idéale pour les sessions terrain.',
             380.00, 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&auto=format&fit=crop&q=60', 'Training', 80, 'S,M,L,XL,XXL'),
            ('Survêtement Officiel Joueurs USAT',
             'Survêtement complet (veste + pantalon) aux couleurs officielles du club. Tissu stretch confortable, bandes latérales, fermeture éclair intégrale.',
             550.00, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60', 'Training', 60, 'S,M,L,XL,XXL'),
            ('Écharpe Officielle Supporters USAT',
             'Écharpe tricotée double face aux couleurs bleu et rouge de l''Amal Tiznit. Frange décorative, 140cm de long. L''accessoire indispensable des supporters au stade.',
             120.00, 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&auto=format&fit=crop&q=60', 'Accessories', 300, 'Unique'),
            ('Ballon Officiel de Match US Amal Tiznit',
             'Ballon officiel de match taille 5 aux couleurs USAT. Construction thermocollée 32 panneaux, vessie en latex renforcée. Conforme aux normes FIFA Quality Pro.',
             250.00, 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&auto=format&fit=crop&q=60', 'Accessories', 100, 'Taille 5')
        `);
        console.log('  ✅ 6 Shop Products seeded');

        // Seed Tickets
        const [[firstMatch]] = await connection.query("SELECT id FROM matches WHERE status='upcoming' ORDER BY id ASC LIMIT 1");
        const [[secondMatch]] = await connection.query("SELECT id FROM matches WHERE status='upcoming' ORDER BY id ASC LIMIT 1 OFFSET 1");
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
            console.log('  ✅ Tickets seeded');
        }

        // Default Admin
        const [[{ count: adminCount }]] = await connection.query("SELECT COUNT(*) AS count FROM admins WHERE email = 'admin@amaltiznit.com'");
        if (adminCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            await connection.query(
                `INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Admin User', 'admin@amaltiznit.com', hash, 'superadmin']
            );
            console.log('  ✅ Default Admin Created -> admin@amaltiznit.com / admin123');
        } else {
            console.log('  ℹ️ Admin already exists — skipping admin creation');
        }

        // Ticket Settings
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
            console.log('  ✅ Ticket settings seeded');
        }

        console.log('\n✨ Real testing dataset seeded successfully!');
    } catch (error) {
        console.error('❌ Database initialisation failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

initDatabase();
