const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendExternalShareEmail } = require('../utils/emailService');

// Sözleşme görüntüleme
router.get('/view/:token', async (req, res) => {
    try {
        // Sözleşmeyi ve token'ı kontrol et
        const [contracts] = await pool.execute(`
            SELECT c.*, u.email as owner_email 
            FROM contracts c
            JOIN users u ON c.user_id = u.id
            WHERE c.approval_token = ?
        `, [req.params.token]);

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı veya link geçersiz' });
        }

        const contract = contracts[0];

        // Partner email kontrolü
        if (!contract.partner_email) {
            return res.status(400).json({ message: 'Bu sözleşme için partner tanımlanmamış' });
        }

        // Onay durumu kontrolü
        if (contract.partner_approval_status === 'approved') {
            return res.status(400).json({ message: 'Bu sözleşme zaten onaylanmış' });
        }

        res.json({
            id: contract.id,
            title: contract.title,
            content: contract.content,
            ownerEmail: contract.owner_email,
            partnerEmail: contract.partner_email,
            status: contract.status,
            partnerApprovalStatus: contract.partner_approval_status,
            createdAt: contract.created_at
        });
    } catch (err) {
        console.error('Sözleşme görüntüleme hatası:', err);
        res.status(500).json({
            message: 'Sözleşme görüntülenirken bir hata oluştu',
            error: err.message
        });
    }
});

// Sözleşme onaylama
router.post('/approve/:token', async (req, res) => {
    try {
        // Sözleşmeyi ve token'ı kontrol et
        const [contracts] = await pool.execute(`
            SELECT * FROM contracts 
            WHERE approval_token = ? AND partner_approval_status = 'pending'
        `, [req.params.token]);

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı, link geçersiz veya sözleşme zaten onaylanmış' });
        }

        const contract = contracts[0];

        // Sözleşmeyi onayla
        await pool.execute(`
            UPDATE contracts 
            SET partner_approval_status = 'approved',
                status = 'accepted',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [contract.id]);

        // Sözleşme sahibine bildirim e-postası gönder
        const [users] = await pool.execute('SELECT email FROM users WHERE id = ?', [contract.user_id]);
        if (users.length > 0) {
            await sendExternalShareEmail(
                users[0].email,
                contract.title,
                contract.partner_email,
                'approved'
            );
        }

        res.json({
            message: 'Sözleşme başarıyla onaylandı',
            contractId: contract.id
        });
    } catch (err) {
        console.error('Sözleşme onaylama hatası:', err);
        res.status(500).json({
            message: 'Sözleşme onaylanırken bir hata oluştu',
            error: err.message
        });
    }
});

// Sözleşme reddetme
router.post('/reject/:token', async (req, res) => {
    try {
        // Sözleşmeyi ve token'ı kontrol et
        const [contracts] = await pool.execute(`
            SELECT * FROM contracts 
            WHERE approval_token = ? AND partner_approval_status = 'pending'
        `, [req.params.token]);

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı, link geçersiz veya sözleşme zaten onaylanmış' });
        }

        const contract = contracts[0];

        // Sözleşmeyi reddet
        await pool.execute(`
            UPDATE contracts 
            SET status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [contract.id]);

        // Sözleşme sahibine bildirim e-postası gönder
        const [users] = await pool.execute('SELECT email FROM users WHERE id = ?', [contract.user_id]);
        if (users.length > 0) {
            await sendExternalShareEmail(
                users[0].email,
                contract.title,
                contract.partner_email,
                'rejected'
            );
        }

        res.json({
            message: 'Sözleşme reddedildi',
            contractId: contract.id
        });
    } catch (err) {
        console.error('Sözleşme reddetme hatası:', err);
        res.status(500).json({
            message: 'Sözleşme reddedilirken bir hata oluştu',
            error: err.message
        });
    }
});

module.exports = router; 