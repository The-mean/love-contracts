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

// Sözleşme sahibi veya ortak olduğunu kontrol et
const checkContractAccess = async (req, res, next) => {
    const contractId = req.params.contractId || req.body.contractId;
    const userId = req.userId;

    try {
        // Sözleşmenin sahibi mi kontrol et
        const [contracts] = await pool.execute(
            'SELECT user_id FROM contracts WHERE id = ?',
            [contractId]
        );

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı' });
        }

        // Eğer sözleşmenin sahibiyse veya kabul edilmiş bir ortak ise devam et
        const [collaborations] = await pool.execute(`
            SELECT id FROM collaborations 
            WHERE contract_id = ? AND invited_user_id = ? AND status = 'accepted'
        `, [contractId, userId]);

        if (contracts[0].user_id !== userId && collaborations.length === 0) {
            return res.status(403).json({ message: 'Bu sözleşme için yetkiniz yok' });
        }

        next();
    } catch (err) {
        console.error('Yetki kontrolü hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Davet gönder
router.post('/invite', authenticateToken, async (req, res) => {
    const { contractId, invitedEmail } = req.body;
    const userId = req.userId;

    if (!contractId || !invitedEmail) {
        return res.status(400).json({ message: 'Sözleşme ID ve davet edilecek kullanıcının email adresi gerekli' });
    }

    try {
        // Sözleşmenin var olduğunu ve kullanıcının sözleşmenin sahibi olduğunu kontrol et
        const [contracts] = await pool.execute(
            'SELECT id FROM contracts WHERE id = ? AND user_id = ?',
            [contractId, userId]
        );

        if (contracts.length === 0) {
            return res.status(403).json({ message: 'Sözleşme bulunamadı veya davet gönderme yetkiniz yok' });
        }

        // Davet edilecek kullanıcıyı bul
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [invitedEmail]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Davet edilecek kullanıcı bulunamadı' });
        }

        const invitedUserId = users[0].id;

        // Aynı kullanıcıya daha önce davet gönderilmiş mi kontrol et
        const [existingInvites] = await pool.execute(`
            SELECT id FROM collaborations 
            WHERE contract_id = ? AND invited_user_id = ?
        `, [contractId, invitedUserId]);

        if (existingInvites.length > 0) {
            return res.status(400).json({ message: 'Bu kullanıcıya zaten davet gönderilmiş' });
        }

        // Daveti oluştur
        await pool.execute(`
            INSERT INTO collaborations (contract_id, user_id, invited_user_id) 
            VALUES (?, ?, ?)
        `, [contractId, userId, invitedUserId]);

        res.status(201).json({ message: 'Davet başarıyla gönderildi' });
    } catch (err) {
        console.error('Davet gönderme hatası:', err);
        res.status(500).json({
            message: 'Davet gönderilirken bir hata oluştu',
            error: err.message
        });
    }
});

// Sözleşmenin ortaklarını listele
router.get('/list/:contractId', authenticateToken, checkContractAccess, async (req, res) => {
    try {
        const [collaborators] = await pool.execute(`
            SELECT 
                c.id,
                c.status,
                c.created_at,
                u.email as invited_user_email,
                owner.email as owner_email
            FROM collaborations c
            JOIN users u ON c.invited_user_id = u.id
            JOIN contracts cont ON c.contract_id = cont.id
            JOIN users owner ON cont.user_id = owner.id
            WHERE c.contract_id = ?
        `, [req.params.contractId]);

        res.json(collaborators);
    } catch (err) {
        console.error('Ortakları listeleme hatası:', err);
        res.status(500).json({
            message: 'Ortaklar listelenirken bir hata oluştu',
            error: err.message
        });
    }
});

// Daveti kabul et
router.post('/accept/:inviteId', authenticateToken, async (req, res) => {
    try {
        // Davetin var olduğunu ve kullanıcıya ait olduğunu kontrol et
        const [invites] = await pool.execute(`
            SELECT * FROM collaborations 
            WHERE id = ? AND invited_user_id = ? AND status = 'pending'
        `, [req.params.inviteId, req.userId]);

        if (invites.length === 0) {
            return res.status(404).json({ message: 'Davet bulunamadı veya zaten kabul edilmiş' });
        }

        // Daveti kabul et
        await pool.execute(`
            UPDATE collaborations 
            SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [req.params.inviteId]);

        res.json({ message: 'Davet başarıyla kabul edildi' });
    } catch (err) {
        console.error('Davet kabul etme hatası:', err);
        res.status(500).json({
            message: 'Davet kabul edilirken bir hata oluştu',
            error: err.message
        });
    }
});

// Kullanıcının davetlerini listele
router.get('/invites', authenticateToken, async (req, res) => {
    try {
        const [invites] = await pool.execute(`
            SELECT 
                c.id as invite_id,
                c.status,
                c.created_at,
                cont.id as contract_id,
                cont.title as contract_title,
                u.email as inviter_email
            FROM collaborations c
            JOIN contracts cont ON c.contract_id = cont.id
            JOIN users u ON c.user_id = u.id
            WHERE c.invited_user_id = ? AND c.status = 'pending'
            ORDER BY c.created_at DESC
        `, [req.userId]);

        res.json(invites);
    } catch (err) {
        console.error('Davetleri listeleme hatası:', err);
        res.status(500).json({
            message: 'Davetler listelenirken bir hata oluştu',
            error: err.message
        });
    }
});

module.exports = router; 