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

// Sözleşmeye ait tüm yorumları getir
router.get('/:contractId', authenticateToken, async (req, res) => {
    try {
        const [comments] = await pool.execute(`
            SELECT c.*, u.email as user_email 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.contract_id = ?
            ORDER BY c.created_at DESC
        `, [req.params.contractId]);

        res.json(comments);
    } catch (err) {
        console.error('Yorumları getirme hatası:', err);
        res.status(500).json({
            message: 'Yorumlar yüklenirken bir hata oluştu',
            error: err.message
        });
    }
});

// Yeni yorum ekle
router.post('/', authenticateToken, async (req, res) => {
    const { contractId, content } = req.body;

    if (!content || !contractId) {
        return res.status(400).json({ message: 'Yorum içeriği ve sözleşme ID gerekli' });
    }

    try {
        // Sözleşmenin varlığını kontrol et
        const [contracts] = await pool.execute(
            'SELECT id FROM contracts WHERE id = ?',
            [contractId]
        );

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı' });
        }

        // Yorumu ekle
        const [result] = await pool.execute(
            'INSERT INTO comments (content, user_id, contract_id) VALUES (?, ?, ?)',
            [content, req.userId, contractId]
        );

        // Yeni eklenen yorumu getir
        const [newComment] = await pool.execute(`
            SELECT c.*, u.email as user_email 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json({
            message: 'Yorum başarıyla eklendi',
            comment: newComment[0]
        });
    } catch (err) {
        console.error('Yorum ekleme hatası:', err);
        res.status(500).json({
            message: 'Yorum eklenirken bir hata oluştu',
            error: err.message
        });
    }
});

// Yorum sil
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Önce yorumun var olduğunu ve kullanıcıya ait olduğunu kontrol et
        const [comments] = await pool.execute(
            'SELECT * FROM comments WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Yorum bulunamadı veya silme yetkiniz yok' });
        }

        // Yorumu sil
        await pool.execute(
            'DELETE FROM comments WHERE id = ?',
            [req.params.id]
        );

        res.json({ message: 'Yorum başarıyla silindi' });
    } catch (err) {
        console.error('Yorum silme hatası:', err);
        res.status(500).json({
            message: 'Yorum silinirken bir hata oluştu',
            error: err.message
        });
    }
});

module.exports = router; 