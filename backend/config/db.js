const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'love_contracts',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Veritabanı bağlantısını test et
pool.getConnection()
    .then(connection => {
        console.log('Veritabanı bağlantısı başarılı');
        connection.release();
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
    });

module.exports = pool;
