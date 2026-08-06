const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'amal_tiznit_db',
    });

    await conn.query("UPDATE players SET team_category = 'Senior'");

    await conn.query(`
        INSERT INTO players 
            (name, position, number, image_url, nationality, matches_played, goals, assists, minutes_played, yellow_cards, red_cards, team_category) 
        VALUES 
            ('Yassine Bouziane', 'Forward', 7, '/Assets/bg1.jpg', 'Moroccan', 14, 9, 4, 1120, 1, 0, 'U21'), 
            ('Reda Tazi', 'Midfielder', 8, '/Assets/bg2.jpg', 'Moroccan', 12, 4, 6, 980, 2, 0, 'U21'), 
            ('Fatima-Zahra El Idrissi', 'Forward', 10, '/Assets/bg.jpg', 'Moroccan', 15, 12, 5, 1350, 0, 0, 'Women'), 
            ('Noura Amrani', 'Goalkeeper', 1, '/Assets/bg1.jpg', 'Moroccan', 15, 0, 1, 1350, 1, 0, 'Women')
    `);

    console.log('✅ Successfully seeded U21 and Women players!');
    await conn.end();
})();
