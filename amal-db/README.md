# amal-db

Isolated MySQL database layer for **Amal Tiznit Official Website**.

This folder lives **outside** `backend/` and `frontend/` so the database
configuration is fully independent of either application layer.

```
amal-tiznit-official-website/
├── amal-db/          ← you are here
│   ├── db.js         ← MySQL connection pool (shared by backend)
│   ├── init.js       ← CREATE tables + seed default data
│   ├── migrate.js    ← Schema migrations
│   └── README.md
├── backend/
└── frontend/
```

## Database

- **Engine**: MySQL 5.7 / 8.x (running via XAMPP)
- **Host**: `localhost:3306`
- **Database**: `amal_tiznit_db`
- **Credentials**: set in `backend/.env`

## Available Scripts

Run these from the **backend/** directory using `npm run`:

| Script | Command | Description |
|---|---|---|
| `db:init` | `node ../amal-db/init.js` | Create all tables and seed default data |
| `db:migrate` | `node ../amal-db/migrate.js` | Apply schema migrations |
| `db:seed` | `node ../amal-db/init.js` | Re-run seed (idempotent) |

Or run directly from the **amal-db/** directory:

```bash
node init.js      # initialise + seed
node migrate.js   # run migrations
```

## Tables

| Table | Purpose |
|---|---|
| `players` | Squad player profiles and stats |
| `matches` | Fixtures (upcoming & finished) |
| `news` | Club news articles |
| `products` | Shop merchandise |
| `tickets` | Match ticket categories |
| `orders` | Customer orders |
| `order_items` | Line items per order |
| `contacts` | Contact form submissions |
| `admins` | Admin panel users |
| `ticket_settings` | Configurable ticket page settings |
| `users` | Legacy user table (kept for compatibility) |

## Default Admin Credentials

Created automatically by `init.js` on first run:

| Field | Value |
|---|---|
| Email | `admin@amaltiznit.com` |
| Password | `admin123` |

> ⚠️ **Change the password** immediately after first login in production.
