const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Token authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secure_jwt_secret_key_here');
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Create contract
router.post('/', authenticateToken, async (req, res) => {
    const { title, content, partnerEmail } = req.body;
    const userId = req.userId;

    try {
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find partner (if specified)
        let partnerId = null;
        if (partnerEmail) {
            const [partners] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [partnerEmail]
            );
            if (partners.length > 0) {
                partnerId = partners[0].id;
            } else {
                return res.status(404).json({ message: 'Partner email not found' });
            }
        }

        // Create contract
        const [result] = await pool.execute(
            'INSERT INTO contracts (title, content, user_id, partner_id) VALUES (?, ?, ?, ?)',
            [title, content, userId, partnerId]
        );

        res.status(201).json({
            message: 'Contract created successfully',
            contractId: result.insertId
        });
    } catch (err) {
        console.error('Contract creation error:', err);
        res.status(500).json({
            message: 'An error occurred while creating the contract',
            error: err.message
        });
    }
});

// Get all contracts
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
        console.error('Contract list error:', err);
        res.status(500).json({
            message: 'An error occurred while fetching contracts',
            error: err.message
        });
    }
});

// Get single contract
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
            return res.status(404).json({ message: 'Contract not found' });
        }

        res.json(contracts[0]);
    } catch (err) {
        console.error('Contract detail error:', err);
        res.status(500).json({
            message: 'An error occurred while fetching the contract',
            error: err.message
        });
    }
});

// Update contract
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    try {
        const [contract] = await pool.execute(
            'SELECT * FROM contracts WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );

        if (contract.length === 0) {
            return res.status(404).json({ message: 'Contract not found or you do not have permission to edit' });
        }

        await pool.execute(
            'UPDATE contracts SET title = ?, content = ? WHERE id = ?',
            [title, content, req.params.id]
        );

        res.json({ message: 'Contract updated successfully' });
    } catch (err) {
        console.error('Contract update error:', err);
        res.status(500).json({
            message: 'An error occurred while updating the contract',
            error: err.message
        });
    }
});

// Delete contract
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM contracts WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contract not found or you do not have permission to delete' });
        }

        res.json({ message: 'Contract deleted successfully' });
    } catch (err) {
        console.error('Contract deletion error:', err);
        res.status(500).json({
            message: 'An error occurred while deleting the contract',
            error: err.message
        });
    }
});

module.exports = router; 