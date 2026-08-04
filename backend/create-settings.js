/**
 * backend/create-settings.js  →  delegates to amal-db/init.js
 *
 * The ticket_settings table is now created by the unified init script.
 * Kept for backward compatibility.
 */
require('../amal-db/init');
