<div align="center">
  <br />
  <img src="frontend/Assets/logo.png" alt="USAT Amal Tiznit Official Crest" width="130" />
  <br />
  <br />
  <h1>ITTIHAD AL-RIYADI AMAL TIZNIT (USAT)</h1>
  <p><strong>Official Digital Platform & Design System Architecture</strong></p>
  <p><em>Tiznit, Souss-Massa, Morocco 🇲🇦</em></p>

  <p>
    <a href="https://github.com/mouad-str/Amal-tiznit-official-website">
      <img src="https://img.shields.io/badge/Repository-Main-002D62?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
    </a>
    <a href="#-design-system-architecture">
      <img src="https://img.shields.io/badge/Design_System-v1.0-D4AF37?style=for-the-badge&logo=figma&logoColor=black" alt="Design System" />
    </a>
    <a href="#-getting-started">
      <img src="https://img.shields.io/badge/Status-Active_Development-10B981?style=for-the-badge" alt="Status" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </p>

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#-design-system-architecture">Design System</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-admin-dashboard">Admin Dashboard</a>
  </p>
  <br />
</div>

---

> [!NOTE]
> **USAT Official Platform**: Inspired by the visual authority and editorial sophistication of top European football club digital products, integrated seamlessly with the identity of **Tiznit** and Moroccan football heritage.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🏟️ **Match Center & Fixtures** | Real-time score displays, fixture schedules, and direct ticketing integration. |
| ⚽ **Squad Spotlight** | Interactive first-team player cards with 3:4 portrait ratios, squad numbers, and season statistics. |
| 📰 **Official News Feed** | Editorial article feed with category filtering and detailed reading view (`/news/:id`). |
| 🔄 **Partners Marquee** | Continuous, infinite-scrolling brand marquee for official club sponsors with pause-on-hover. |
| 🛒 **Official Shop** | Merchandise catalog featuring 2026 official home/away kits, training gear, and checkout flows. |
| 🎟️ **Ticketing Portal** | Match category ticket reservations (VIP, Standard, Economy) with live availability counters. |
| 🎨 **Design System Showcase** | Centralized interactive token & component playground accessible at `/design-system`. |
| 🔐 **Admin Dashboard** | Protected management portal for club administrators to manage news, players, matches, tickets, and shop orders. |

---

## 🎨 Design System Architecture

The UI is built on a **60-25-10-5 visual hierarchy rule** engineered for athletic confidence, editorial clarity, and high contrast:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 60% NEUTRAL BACKGROUND  (#040914 Deep Athletic Dark Obsidian)          │
├──────────────────────────────────────┬─────────────────────────────────┤
│ 25% DARK SURFACES                    │ 10% PRIMARY CLUB COLOR          │
│ (#0E182A Slate / #16243D Card)       │ (#002D62 Royal Club Blue)       │
├──────────────────────────────────────┴─────────────────────────────────┤
│ 5% ACCENT TOKENS (#D4AF37 Tiznit Amber Gold & #9E1B1B Atlas Crimson)   │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Tokens

| Token | Hex Code | Semantic Role |
|---|---|---|
| `--color-primary` | `#002D62` | Primary Club Royal Blue (10%) |
| `--color-secondary` | `#D4AF37` | Tiznit Amber Gold Accent (5%) |
| `--color-accent-crimson` | `#9E1B1B` | Moroccan Atlas Crimson Accent |
| `--color-background` | `#040914` | Neutral Main Background (60%) |
| `--color-surface` | `#0E182A` | Slate Card Surface (25%) |
| `--color-text-primary` | `#F8FAFC` | High-contrast Heading & Body Text |

### Typography System
- **Display / Editorial Font**: `Oswald`, `Noto Sans Arabic`, `Tajawal` (French accents verified: `À Â Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü Ÿ`)
- **Functional Body Font**: `Inter`

---

## 🛠️ Tech Stack

### Frontend Application
- **Framework**: React 19 + TypeScript 5
- **Build Tool**: Vite 6
- **Router**: React Router v7 (`BrowserRouter` for clean URLs without `#`)
- **Styling**: Tailwind CSS + Custom CSS Design Tokens (`index.css`)
- **Icons**: Lucide Icons

### Backend Server & Database
- **Runtime**: Node.js + Express.js
- **Database**: MySQL 5.7 / 8.x (via `mysql2/promise`)
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs` password hashing

---

## 📂 Project Architecture

```
amal-tiznit-official-website/
├── 📁 amal-db/                  # Isolated MySQL database layer
│   ├── db.js                 # Shared MySQL connection pool
│   ├── init.js               # Database creation, schema & seeding
│   ├── migrate.js            # Schema migration runner
│   └── README.md             # DB layer documentation
├── 📁 backend/                  # REST API Server
│   ├── config/               # DB configuration
│   ├── controllers/          # Business logic controllers
│   ├── routes/               # API route definitions
│   ├── server.js             # Express entry point
│   └── .env.example          # Environment variable template
└── 📁 frontend/                 # Client Single Page Application
    ├── 📁 Assets/               # Club logos, sponsor graphics & media
    ├── 📁 components/           # Reusable components
    │   └── 📁 ui/               # USAT Design System components
    │       ├── Badge.tsx
    │       ├── Button.tsx
    │       ├── MatchCard.tsx
    │       ├── NewsCard.tsx
    │       ├── PartnersMarquee.tsx
    │       ├── PlayerCard.tsx
    │       ├── ProductCard.tsx
    │       ├── SectionHeader.tsx
    │       ├── StatCard.tsx
    │       └── VideoCard.tsx
    ├── 📁 pages/                # Public pages & Admin screens
    │   ├── DesignSystemShowcase.tsx
    │   ├── Home.tsx
    │   ├── Matches.tsx
    │   ├── News.tsx
    │   ├── Players.tsx
    │   ├── Shop.tsx
    │   └── Tickets.tsx
    ├── App.tsx               # Route declarations
    └── index.css             # Design Tokens & keyframe animations
```

---

## 🚀 Getting Started

> [!IMPORTANT]
> Make sure **Node.js (v18+)** and **MySQL (v5.7 / 8.x)** are installed and running locally.

### 1. Database Initialization

Ensure your local MySQL service is active on `localhost:3306`:

```bash
cd amal-db
npm install
node init.js
```

*Output:*
```
🔧 Creating database "amal_tiznit_db" if it does not exist…
📋 Creating tables…
  ✅ players | matches | news | products | tickets | orders | contacts | admins
🌱 Seeding initial data…
  ✅ default admin created → admin@amaltiznit.com / admin123
✨ Database initialisation complete!
```

---

### 2. Backend API Setup

```bash
cd ../backend
npm install
cp .env.example .env
npm run dev
```

*Server running at: `http://localhost:5000`*

---

### 3. Frontend App Setup

```bash
cd ../frontend
npm install
npm run dev
```

*Frontend running at: `http://localhost:5173`*

---

## 📡 API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/players` | Fetch first-team squad | Public |
| `GET` | `/api/matches` | Fetch upcoming & finished matches | Public |
| `GET` | `/api/news` | Fetch published news articles | Public |
| `GET` | `/api/shop` | Fetch official merchandise products | Public |
| `GET` | `/api/tickets` | Fetch match ticket categories | Public |
| `POST` | `/api/orders` | Submit customer shop orders | Public |
| `POST` | `/api/contact` | Submit fan contact message | Public |
| `POST` | `/api/auth/login` | Admin authentication login | Admin |

---

## 🔑 Default Admin Credentials

> [!TIP]
> Use these credentials to log in to the administration portal at `/admin/login`:

- **Login URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@amaltiznit.com`
- **Password**: `admin123`

---

## 🌐 Public Routes Map

- `/` – Official Homepage
- `/players` – First Team Squad Spotlight
- `/matches` – Match Center & Fixtures
- `/news` – Club News Feed
- `/tickets` – Match Ticketing
- `/shop` – Official Store
- `/design-system` – Interactive Design System Showcase
- `/admin` – Protected Admin Portal

---

## 📜 License

© 2026 **Ittihad al-Riyadi Amal Tiznit (USAT)**. All rights reserved.
