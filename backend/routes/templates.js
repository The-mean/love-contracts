const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/authenticateToken');

// Tüm şablonları listele
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [templates] = await pool.query(
            'SELECT id, title, description, category, created_at FROM templates WHERE is_public = true ORDER BY title ASC'
        );
        res.json(templates);
    } catch (err) {
        console.error('Şablonları getirme hatası:', err);
        res.status(500).json({ message: 'Şablonlar yüklenirken bir hata oluştu' });
    }
});

// Kategori bazlı şablonları getir
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const [templates] = await pool.query(
            'SELECT id, title, description, category, created_at FROM templates WHERE category = ? AND is_public = true ORDER BY title ASC',
            [req.params.category]
        );
        res.json(templates);
    } catch (err) {
        console.error('Kategori şablonlarını getirme hatası:', err);
        res.status(500).json({ message: 'Şablonlar yüklenirken bir hata oluştu' });
    }
});

// Belirli bir şablonu getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [templates] = await pool.query(
            'SELECT * FROM templates WHERE id = ? AND is_public = true',
            [req.params.id]
        );

        if (templates.length === 0) {
            return res.status(404).json({ message: 'Şablon bulunamadı' });
        }

        res.json(templates[0]);
    } catch (err) {
        console.error('Şablon getirme hatası:', err);
        res.status(500).json({ message: 'Şablon yüklenirken bir hata oluştu' });
    }
});

// Şablondan yeni sözleşme oluştur
router.post('/:id/create-contract', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Şablonu getir
        const [templates] = await connection.query(
            'SELECT * FROM templates WHERE id = ? AND is_public = true',
            [req.params.id]
        );

        if (templates.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Şablon bulunamadı' });
        }

        const template = templates[0];

        // Yeni sözleşme oluştur
        const [result] = await connection.query(
            'INSERT INTO contracts (title, content, user_id) VALUES (?, ?, ?)',
            [template.title, template.content, req.userId]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Sözleşme başarıyla oluşturuldu',
            contractId: result.insertId
        });
    } catch (err) {
        await connection.rollback();
        console.error('Sözleşme oluşturma hatası:', err);
        res.status(500).json({ message: 'Sözleşme oluşturulurken bir hata oluştu' });
    } finally {
        connection.release();
    }
});

module.exports = router; 