const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

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

// Sözleşme oluştur
router.post('/', authenticateToken, async (req, res) => {
    const { title, content, partnerEmail } = req.body;
    const userId = req.userId;

    try {
        // Kullanıcının varlığını kontrol et
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Partner'ı bul (eğer belirtildiyse)
        let partnerId = null;
        if (partnerEmail) {
            const [partners] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [partnerEmail]
            );
            if (partners.length > 0) {
                partnerId = partners[0].id;
            } else {
                return res.status(404).json({ message: 'Partner email adresi bulunamadı' });
            }
        }

        // Sözleşmeyi oluştur
        const [result] = await pool.execute(
            'INSERT INTO contracts (title, content, user_id, partner_id) VALUES (?, ?, ?, ?)',
            [title, content, userId, partnerId]
        );

        res.status(201).json({
            message: 'Sözleşme başarıyla oluşturuldu',
            contractId: result.insertId
        });
    } catch (err) {
        console.error('Sözleşme oluşturma hatası:', err);
        res.status(500).json({
            message: 'Sözleşme oluşturulurken bir hata oluştu',
            error: err.message
        });
    }
});

// Tüm sözleşmeleri getir
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [contracts] = await pool.execute(
            `SELECT c.*, 
                    u.email as partner_email 
             FROM contracts c 
             LEFT JOIN users u ON c.partner_id = u.id 
             WHERE c.user_id = ? OR c.partner_id = ?`,
            [req.userId, req.userId]
        );

        res.json(contracts);
    } catch (err) {
        console.error('Sözleşme listesi hatası:', err);
        res.status(500).json({
            message: 'Sözleşmeler getirilirken bir hata oluştu',
            error: err.message
        });
    }
});

// Tek bir sözleşmeyi getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [contracts] = await pool.execute(
            `SELECT c.*, 
                    u.email as partner_email 
             FROM contracts c 
             LEFT JOIN users u ON c.partner_id = u.id 
             WHERE c.id = ? AND (c.user_id = ? OR c.partner_id = ?)`,
            [req.params.id, req.userId, req.userId]
        );

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı' });
        }

        res.json(contracts[0]);
    } catch (err) {
        console.error('Sözleşme detay hatası:', err);
        res.status(500).json({
            message: 'Sözleşme getirilirken bir hata oluştu',
            error: err.message
        });
    }
});

// Sözleşme güncelle
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    try {
        const [contract] = await pool.execute(
            'SELECT * FROM contracts WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );

        if (contract.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı veya düzenleme yetkiniz yok' });
        }

        await pool.execute(
            'UPDATE contracts SET title = ?, content = ? WHERE id = ?',
            [title, content, req.params.id]
        );

        res.json({ message: 'Sözleşme başarıyla güncellendi' });
    } catch (err) {
        console.error('Sözleşme güncelleme hatası:', err);
        res.status(500).json({
            message: 'Sözleşme güncellenirken bir hata oluştu',
            error: err.message
        });
    }
});

// Sözleşme sil
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM contracts WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı veya silme yetkiniz yok' });
        }

        res.json({ message: 'Sözleşme başarıyla silindi' });
    } catch (err) {
        console.error('Sözleşme silme hatası:', err);
        res.status(500).json({
            message: 'Sözleşme silinirken bir hata oluştu',
            error: err.message
        });
    }
});

module.exports = router; 