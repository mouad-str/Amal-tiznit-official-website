const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

exports.getTicketSettings = async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT * FROM ticket_settings');

        // Convert rows to object
        const settings = {};
        rows.forEach(row => {
            if (row.setting_key === 'sponsors') {
                try {
                    settings[row.setting_key] = JSON.parse(row.setting_value);
                } catch (e) {
                    settings[row.setting_key] = [];
                }
            } else {
                settings[row.setting_key] = row.setting_value;
            }
        });

        // Reconstruct the nested structure expected by frontend
        const response = {
            title: settings.title,
            subTitlePrefix: settings.subTitlePrefix,
            branding: {
                logo: settings.branding_logo,
                teamName: settings.branding_teamName
            },
            sponsors: settings.sponsors || []
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching ticket settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    } finally {
        await connection.end();
    }
};

exports.updateTicketSettings = async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { title, subTitlePrefix, branding, sponsors } = req.body;

        const updates = [
            { key: 'title', value: title },
            { key: 'subTitlePrefix', value: subTitlePrefix },
            { key: 'branding_logo', value: branding.logo },
            { key: 'branding_teamName', value: branding.teamName },
            { key: 'sponsors', value: JSON.stringify(sponsors) }
        ];

        for (const item of updates) {
            await connection.execute(
                'INSERT INTO ticket_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [item.key, item.value, item.value]
            );
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating ticket settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    } finally {
        await connection.end();
    }
};
