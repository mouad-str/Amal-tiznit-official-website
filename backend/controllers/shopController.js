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
        const { 
            name, slug, description, price, compare_at_price, image_url, 
            category, collection, gender, stock, sizes, is_featured, is_new 
        } = req.body;

        const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const [result] = await pool.query(
            `INSERT INTO products (name, slug, description, price, compare_at_price, image_url, category, collection, gender, stock, sizes, is_featured, is_new)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, productSlug, description || null, price, compare_at_price || null, image_url, 
                category || 'Kits', collection || 'Main', gender || 'Unisex', stock || 100, 
                sizes || 'S,M,L,XL', is_featured ? 1 : 0, is_new ? 1 : 0
            ]
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
        const { 
            name, slug, description, price, compare_at_price, image_url, 
            category, collection, gender, stock, sizes, is_featured, is_new 
        } = req.body;

        const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const [result] = await pool.query(
            `UPDATE products SET 
                name = ?, slug = ?, description = ?, price = ?, compare_at_price = ?, 
                image_url = ?, category = ?, collection = ?, gender = ?, stock = ?, 
                sizes = ?, is_featured = ?, is_new = ?
            WHERE id = ?`,
            [
                name, productSlug, description || null, price, compare_at_price || null, 
                image_url, category, collection || 'Main', gender || 'Unisex', stock, 
                sizes || 'S,M,L,XL', is_featured ? 1 : 0, is_new ? 1 : 0, req.params.id
            ]
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

// GET coupons
const getCoupons = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM coupons ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

// POST create coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discount_percent } = req.body;
        if (!code || !discount_percent) {
            return res.status(400).json({ error: 'Code and discount percentage required' });
        }
        const [result] = await pool.query(
            'INSERT INTO coupons (code, discount_percent, active) VALUES (?, ?, TRUE)',
            [code.trim().toUpperCase(), discount_percent]
        );
        res.status(201).json({ id: result.insertId, message: 'Coupon created' });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCoupons,
    createCoupon
};
