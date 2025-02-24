const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendExternalShareEmail } = require('../utils/emailService');

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

// Sözleşme paylaşımı için özel token oluştur
const generateShareToken = (contractId, email) => {
    return jwt.sign(
        { contractId, email, type: 'external_share' },
        process.env.JWT_SECRET || 'your_secure_jwt_secret_key_here',
        { expiresIn: '7d' } // 7 gün geçerli
    );
};

// Sözleşme paylaşımı
router.post('/send', authenticateToken, async (req, res) => {
    const { contractId, partnerEmail } = req.body;
    const userId = req.userId;

    if (!contractId || !partnerEmail) {
        return res.status(400).json({ message: 'Sözleşme ID ve partner email adresi gerekli' });
    }

    try {
        // Sözleşmenin var olduğunu ve kullanıcının sahibi olduğunu kontrol et
        const [contracts] = await pool.execute(`
            SELECT c.*, u.email as owner_email 
            FROM contracts c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ? AND c.user_id = ?
        `, [contractId, userId]);

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'Sözleşme bulunamadı veya paylaşım yetkiniz yok' });
        }

        const contract = contracts[0];

        // Partner zaten kayıtlı mı kontrol et
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [partnerEmail]);

        if (users.length > 0) {
            // Partner zaten kayıtlı, normal davet gönder
            await pool.execute(`
                INSERT INTO collaborations (contract_id, user_id, invited_user_id)
                VALUES (?, ?, ?)
            `, [contractId, userId, users[0].id]);
        }

        // Paylaşım token'ı oluştur
        const shareToken = generateShareToken(contractId, partnerEmail);

        // Paylaşım kaydını oluştur
        await pool.execute(`
            INSERT INTO external_shares (contract_id, user_id, partner_email, share_token, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [contractId, userId, partnerEmail, shareToken]);

        // E-posta gönder
        const emailResult = await sendExternalShareEmail(
            partnerEmail,
            contract.title,
            contract.owner_email,
            shareToken
        );

        if (!emailResult.success) {
            throw new Error('E-posta gönderilemedi');
        }

        res.json({
            message: 'Sözleşme başarıyla paylaşıldı',
            shareToken
        });
    } catch (err) {
        console.error('Sözleşme paylaşım hatası:', err);
        res.status(500).json({
            message: 'Sözleşme paylaşılırken bir hata oluştu',
            error: err.message
        });
    }
});

// Paylaşılan sözleşmeyi görüntüle
router.get('/view/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(
            req.params.token,
            process.env.JWT_SECRET || 'your_secure_jwt_secret_key_here'
        );

        if (decoded.type !== 'external_share') {
            throw new Error('Geçersiz paylaşım token\'ı');
        }

        // Paylaşımın geçerli olduğunu kontrol et
        const [shares] = await pool.execute(`
            SELECT es.*, c.title, c.content, u.email as owner_email
            FROM external_shares es
            JOIN contracts c ON es.contract_id = c.id
            JOIN users u ON es.user_id = u.id
            WHERE es.share_token = ? AND es.partner_email = ?
        `, [req.params.token, decoded.email]);

        if (shares.length === 0) {
            return res.status(404).json({ message: 'Paylaşım bulunamadı veya süresi dolmuş' });
        }

        const share = shares[0];

        res.json({
            contractId: share.contract_id,
            title: share.title,
            content: share.content,
            ownerEmail: share.owner_email,
            status: share.status,
            createdAt: share.created_at
        });
    } catch (err) {
        console.error('Sözleşme görüntüleme hatası:', err);
        res.status(403).json({
            message: 'Geçersiz veya süresi dolmuş paylaşım linki',
            error: err.message
        });
    }
});

// Paylaşılan sözleşmeyi onayla/reddet
router.post('/respond/:token', async (req, res) => {
    const { status } = req.body; // 'accepted' veya 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Geçersiz yanıt durumu' });
    }

    try {
        const decoded = jwt.verify(
            req.params.token,
            process.env.JWT_SECRET || 'your_secure_jwt_secret_key_here'
        );

        if (decoded.type !== 'external_share') {
            throw new Error('Geçersiz paylaşım token\'ı');
        }

        // Paylaşımı güncelle
        const [result] = await pool.execute(`
            UPDATE external_shares 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE share_token = ? AND partner_email = ? AND status = 'pending'
        `, [status, req.params.token, decoded.email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paylaşım bulunamadı veya zaten yanıtlanmış' });
        }

        // Sözleşme durumunu güncelle
        await pool.execute(`
            UPDATE contracts 
            SET status = ?
            WHERE id = ?
        `, [status, decoded.contractId]);

        res.json({ message: 'Yanıtınız başarıyla kaydedildi' });
    } catch (err) {
        console.error('Sözleşme yanıtlama hatası:', err);
        res.status(403).json({
            message: 'Geçersiz veya süresi dolmuş paylaşım linki',
            error: err.message
        });
    }
});

module.exports = router; 