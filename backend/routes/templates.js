const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Debug function
const debug = (message) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message);
    }
};

// Get all templates
router.get('/', async (req, res) => {
    try {
        const [templates] = await pool.query(
            'SELECT * FROM templates WHERE is_public = true ORDER BY created_at DESC'
        );
        res.json(templates);
    } catch (error) {
        debug('Get templates error:', error);
        res.status(500).json({ message: 'An error occurred while fetching templates' });
    }
});

// Get a specific template
router.get('/:id', async (req, res) => {
    try {
        const [templates] = await pool.query(
            'SELECT * FROM templates WHERE id = ? AND is_public = true',
            [req.params.id]
        );

        if (templates.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(templates[0]);
    } catch (error) {
        debug('Get template error:', error);
        res.status(500).json({ message: 'An error occurred while fetching the template' });
    }
});

// Create a new template (admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, content, category } = req.body;

        // Validate input
        if (!title || !description || !content || !category) {
            return res.status(400).json({ message: 'Title, description, content, and category are required' });
        }

        // Create template
        const [result] = await pool.query(
            'INSERT INTO templates (title, description, content, category, is_public) VALUES (?, ?, ?, ?, ?)',
            [title, description, content, category, true]
        );

        res.status(201).json({
            message: 'Template created successfully',
            id: result.insertId
        });
    } catch (error) {
        debug('Create template error:', error);
        res.status(500).json({ message: 'An error occurred while creating the template' });
    }
});

// Update a template (admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, content, category } = req.body;

        // Validate input
        if (!title || !description || !content || !category) {
            return res.status(400).json({ message: 'Title, description, content, and category are required' });
        }

        // Update template
        const [result] = await pool.query(
            'UPDATE templates SET title = ?, description = ?, content = ?, category = ? WHERE id = ?',
            [title, description, content, category, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ message: 'Template updated successfully' });
    } catch (error) {
        debug('Update template error:', error);
        res.status(500).json({ message: 'An error occurred while updating the template' });
    }
});

// Delete a template (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM templates WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        debug('Delete template error:', error);
        res.status(500).json({ message: 'An error occurred while deleting the template' });
    }
});

module.exports = router; 