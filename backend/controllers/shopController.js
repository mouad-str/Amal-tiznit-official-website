const { pool } = require('../config/db');

/**
 * Shop Controller
 * Handles all CRUD operations for products
 */

// GET all products
const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// GET single product by ID
const getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// POST create new product
const createProduct = async (req, res) => {
    try {
        const { name, price, image_url, category, stock } = req.body;

        const [result] = await pool.query(
            `INSERT INTO products (name, price, image_url, category, stock)
            VALUES (?, ?, ?, ?, ?)`,
            [name, price, image_url, category, stock || 100]
        );

        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// PUT update product
const updateProduct = async (req, res) => {
    try {
        const { name, price, image_url, category, stock } = req.body;

        const [result] = await pool.query(
            `UPDATE products SET name = ?, price = ?, image_url = ?, category = ?, stock = ?
            WHERE id = ?`,
            [name, price, image_url, category, stock, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE product
const deleteProduct = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
