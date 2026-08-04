/**
 * backend/config/db.js
 * ─────────────────────────────────────────────────────
 * Re-exports the centralised MySQL pool from the
 * isolated amal-db package at the project root.
 *
 * All controllers import from here — no change needed
 * in any controller or route file.
 * ─────────────────────────────────────────────────────
 */

module.exports = require('../../amal-db/db');
