const { pool } = require('../config/db');

/**
 * Orders Controller
 * Handles order placement and management
 */

// POST create new order
const createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { customer_name, customer_email, customer_phone, customer_address, items } = req.body;

        if (!items || items.length === 0) {
            throw new Error('No items in order');
        }

        // 1. Calculate Total & Verify Stock
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const [rows] = await connection.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
            if (rows.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }
            const product = rows[0];

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }

            totalAmount += product.price * item.quantity;
            processedItems.push({ ...item, price: product.price });
        }

        // 2. Create Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [customer_name, customer_email, customer_phone, customer_address, totalAmount]
        );
        const orderId = orderResult.insertId;

        // 3. Create Order Items & Update Stock
        for (const item of processedItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            orderId: orderId,
            total: totalAmount
        });

    } catch (error) {
        await connection.rollback();
        console.error('Order creation failed:', error);
        res.status(400).json({ error: error.message || 'Failed to populate order' });
    } finally {
        connection.release();
    }
};

// GET all orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

        // Fetch items for each order
        // Note: For large datasets this N+1 approach isn't ideal, but fine for now
        const [items] = await pool.query(`
            SELECT oi.*, p.name as product_name 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
        `);

        // Attach items to orders
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: items.filter(item => item.order_id === order.id)
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// PUT update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus
};
