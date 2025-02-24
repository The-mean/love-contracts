const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const contractRoutes = require('./routes/contracts');
const commentRoutes = require('./routes/comments');
const templateRoutes = require('./routes/templates');
require('dotenv').config();

const app = express();

// CORS yapılandırması
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API durumunu kontrol et
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/templates', templateRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint bulunamadı',
        path: req.path
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Hata:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
const server = app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
    console.log('API URL:', `http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
    server.close(() => {
        console.log('Sunucu kapatıldı');
        process.exit(0);
    });
}); 