const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

// Debug function
const debugLog = (message, data) => {
    console.log(`[DEBUG] ${message}:`, data);
};

// User Registration
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if email is unique
        const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword]
        );

        debugLog("New user registered", { userId: result.insertId, email });

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            message: "An error occurred during registration",
            error: err.message
        });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];
        debugLog("User found", { userId: user.id, email: user.email });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || "your_secure_jwt_secret_key_here",
            { expiresIn: "24h" }
        );

        debugLog("Token created", { userId: user.id, tokenPayload: jwt.decode(token) });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            message: "An error occurred during login",
            error: err.message
        });
    }
});

// Token Verification (Test endpoint)
router.get("/verify", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secure_jwt_secret_key_here");
        const [users] = await pool.execute("SELECT id, email FROM users WHERE id = ?", [decoded.userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Token is valid",
            user: users[0]
        });
    } catch (err) {
        res.status(403).json({ message: "Invalid token", error: err.message });
    }
});

module.exports = router;
