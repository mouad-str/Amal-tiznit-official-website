/**
 * backend/migrate.js  →  delegates to amal-db/migrate.js
 *
 * Kept for backward compatibility.
 * Usage: node migrate.js  OR  npm run db:migrate
 */
require('../amal-db/migrate');
