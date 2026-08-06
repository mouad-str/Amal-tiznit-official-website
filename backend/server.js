const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

// Import Routes
const playersRoutes = require('./routes/players');
const matchesRoutes = require('./routes/matches');
const newsRoutes = require('./routes/news');
const shopRoutes = require('./routes/shop');
const ticketsRoutes = require('./routes/tickets');
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');
const ordersRoutes = require('./routes/orders');
const membershipsRoutes = require('./routes/memberships');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for frontend communication
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Parse JSON request bodies (increased limit for base64 image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/players', playersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/memberships', membershipsRoutes);
app.use('/api/auth', authRoutes);

// Root redirect → frontend
app.get('/', (req, res) => {
    res.redirect('http://localhost:3000');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Amal Tiznit API is running' });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
    // Test database connection
    await testConnection();

    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║     🏟️  AMAL TIZNIT BACKEND SERVER               ║
║                                                  ║
║     Running on: http://localhost:${PORT}          ║
║     Environment: ${process.env.NODE_ENV || 'development'}                   ║
║                                                  ║
╚══════════════════════════════════════════════════╝
        `);
    });
};

startServer();
