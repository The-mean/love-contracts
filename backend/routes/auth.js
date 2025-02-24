const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

// Debug fonksiyonu
const debugLog = (message, data) => {
    console.log(`[DEBUG] ${message}:`, data);
};

// Kullanıcı Kaydı
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email ve şifre zorunludur" });
    }

    try {
        // Email formatını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Geçersiz email formatı" });
        }

        // Email benzersiz mi kontrol et
        const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Bu email adresi zaten kullanımda" });
        }

        // Şifre uzunluğunu kontrol et
        if (password.length < 6) {
            return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword]
        );

        debugLog("Yeni kullanıcı kaydedildi", { userId: result.insertId, email });

        res.status(201).json({
            message: "Kullanıcı başarıyla kaydedildi",
            userId: result.insertId
        });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({
            message: "Kullanıcı kaydedilirken bir hata oluştu",
            error: err.message
        });
    }
});

// Kullanıcı Girişi
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Email veya şifre hatalı" });
        }

        const user = users[0];
        debugLog("Kullanıcı bulundu", { userId: user.id, email: user.email });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Email veya şifre hatalı" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || "your_secure_jwt_secret_key_here",
            { expiresIn: "24h" }
        );

        debugLog("Token oluşturuldu", { userId: user.id, tokenPayload: jwt.decode(token) });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Giriş hatası:', err);
        res.status(500).json({
            message: "Giriş yapılırken bir hata oluştu",
            error: err.message
        });
    }
});

// Token Doğrulama (Test endpoint)
router.get("/verify", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token bulunamadı" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secure_jwt_secret_key_here");
        const [users] = await pool.execute("SELECT id, email FROM users WHERE id = ?", [decoded.userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        res.json({
            message: "Token geçerli",
            user: users[0]
        });
    } catch (err) {
        res.status(403).json({ message: "Geçersiz token", error: err.message });
    }
});

module.exports = router;
