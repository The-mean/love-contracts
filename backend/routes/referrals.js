const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const dbConfig = require('../config/database');

// Referans kodu oluştur
router.post('/generate', authenticateToken, async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const userId = req.user.id;
        const referralCode = `REF-${uuidv4().substring(0, 8)}`;

        // Kullanıcının mevcut referans kodunu kontrol et
        const [existingCode] = await connection.query(
            'SELECT referral_code FROM referrals WHERE referrer_id = ? LIMIT 1',
            [userId]
        );

        if (existingCode.length > 0) {
            return res.json({
                referralCode: existingCode[0].referral_code,
                referralLink: `${process.env.FRONTEND_URL}/register?ref=${existingCode[0].referral_code}`
            });
        }

        // Yeni referans kodu oluştur
        await connection.query(
            'INSERT INTO referrals (referrer_id, referred_email, referral_code, status) VALUES (?, ?, ?, ?)',
            [userId, '', referralCode, 'pending']
        );

        res.json({
            referralCode,
            referralLink: `${process.env.FRONTEND_URL}/register?ref=${referralCode}`
        });
    } catch (error) {
        console.error('Referans kodu oluşturma hatası:', error);
        res.status(500).json({ error: 'Referans kodu oluşturulurken bir hata oluştu' });
    } finally {
        await connection.end();
    }
});

// Referans istatistiklerini getir
router.get('/stats/:userId', authenticateToken, async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const userId = req.params.userId;

        // Kullanıcının kendi ID'si veya admin değilse erişimi reddet
        if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Bu istatistiklere erişim yetkiniz yok' });
        }

        // İstatistikleri getir
        const [stats] = await connection.query(`
            SELECT 
                COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered_count,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                SUM(reward_amount) as total_rewards,
                referral_code
            FROM referrals 
            WHERE referrer_id = ?
            GROUP BY referrer_id
        `, [userId]);

        // Detaylı referans listesi
        const [referrals] = await connection.query(`
            SELECT referred_email, status, reward_amount, created_at, updated_at
            FROM referrals
            WHERE referrer_id = ? AND referred_email != ''
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            summary: stats[0] || {
                registered_count: 0,
                paid_count: 0,
                total_rewards: 0,
                referral_code: null
            },
            referrals
        });
    } catch (error) {
        console.error('Referans istatistikleri getirme hatası:', error);
        res.status(500).json({ error: 'İstatistikler alınırken bir hata oluştu' });
    } finally {
        await connection.end();
    }
});

// Referans ile kayıt
router.post('/register', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { referralCode, email } = req.body;

        // Referans kodunu kontrol et
        const [referral] = await connection.query(
            'SELECT id, referrer_id FROM referrals WHERE referral_code = ?',
            [referralCode]
        );

        if (referral.length === 0) {
            return res.status(404).json({ error: 'Geçersiz referans kodu' });
        }

        // Email'i güncelle ve durumu registered yap
        await connection.query(
            'UPDATE referrals SET referred_email = ?, status = ? WHERE referral_code = ?',
            [email, 'registered', referralCode]
        );

        res.json({ message: 'Referans kaydı başarıyla oluşturuldu' });
    } catch (error) {
        console.error('Referans kayıt hatası:', error);
        res.status(500).json({ error: 'Referans kaydı oluşturulurken bir hata oluştu' });
    } finally {
        await connection.end();
    }
});

// Ödeme yapıldığında referans durumunu güncelle
router.post('/payment-complete', authenticateToken, async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { referralCode } = req.body;
        const rewardAmount = 5.00; // Her başarılı referans için $5 ödül

        // Referansı güncelle
        await connection.query(
            'UPDATE referrals SET status = ?, reward_amount = ? WHERE referral_code = ?',
            ['paid', rewardAmount, referralCode]
        );

        res.json({ message: 'Referans durumu ve ödül başarıyla güncellendi' });
    } catch (error) {
        console.error('Referans ödeme güncelleme hatası:', error);
        res.status(500).json({ error: 'Referans durumu güncellenirken bir hata oluştu' });
    } finally {
        await connection.end();
    }
});

module.exports = router; 