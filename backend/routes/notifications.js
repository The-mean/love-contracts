const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendInvitationEmail, sendUpdateNotification } = require('../utils/emailService');

// Token doğrulama middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secure_jwt_secret_key_here');
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Geçersiz token' });
    }
};

// Email gönder
router.post('/send-email', authenticateToken, async (req, res) => {
    const { to, type, contractId } = req.body;

    if (!to || !type || !contractId) {
        return res.status(400).json({ message: 'Email adresi, bildirim tipi ve sözleşme ID gerekli' });
    }

    try {
        // Sözleşme bilgilerini al
        const [contracts] = await pool.execute(`
            SELECT c.*, u.email as owner_email 
            FROM contracts c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [contractId]);

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı' });
        }

        const contract = contracts[0];

        // Kullanıcının email adresini al
        const [users] = await pool.execute(
            'SELECT email FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const senderEmail = users[0].email;

        let result;
        switch (type) {
            case 'invitation':
                result = await sendInvitationEmail(to, contract.title, senderEmail);
                break;
            case 'update':
                result = await sendUpdateNotification(to, contract.title, senderEmail);
                break;
            default:
                return res.status(400).json({ message: 'Geçersiz bildirim tipi' });
        }

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({ message: 'Email başarıyla gönderildi', messageId: result.messageId });
    } catch (err) {
        console.error('Email gönderme hatası:', err);
        res.status(500).json({
            message: 'Email gönderilirken bir hata oluştu',
            error: err.message
        });
    }
});

module.exports = router; 