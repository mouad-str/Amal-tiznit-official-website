const { pool } = require('../config/db');

/**
 * Orders Controller
 * Handles order creation, fetching, updating status, and tracking
 */

// POST Create Order (Public Checkout)
const createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { customer_name, customer_email, customer_phone, customer_address, items } = req.body;

        if (!customer_name || !customer_email || !customer_phone || !customer_address || !items || !items.length) {
            await connection.rollback();
            return res.status(400).json({ error: 'Missing required order fields' });
        }

        // 1. Calculate item totals server-side and verify stock
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of items) {
            const [productRows] = await connection.query(
                'SELECT id, price, stock FROM products WHERE id = ? FOR UPDATE',
                [item.product_id]
            );

            if (productRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: `Produit ID ${item.product_id} non trouvé` });
            }

            const product = productRows[0];
            if (product.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ error: `Stock insuffisant pour l'article ID ${item.product_id}` });
            }

            // Base price + optional flocage (+40 DH) + patch (+25 DH)
            let itemPrice = Number(product.price);
            if (item.flocage) itemPrice += 40;
            if (item.has_patch) itemPrice += 25;

            calculatedTotal += itemPrice * item.quantity;

            processedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: itemPrice,
                size: item.size || 'M',
                flocage: item.flocage || null,
                has_patch: item.has_patch ? 1 : 0
            });

            // Decrement product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // 2. Insert main order row
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total, status) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_name, customer_email, customer_phone, customer_address, calculatedTotal, 'pending']
        );

        const orderId = orderResult.insertId;

        // 3. Insert order items
        for (const item of processedItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price, size, flocage, has_patch) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.size, item.flocage, item.has_patch]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, orderId, total: calculatedTotal });

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

        const [items] = await pool.query(`
            SELECT oi.*, p.name as product_name 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
        `);

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
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { status } = req.body;
        const orderId = req.params.id;
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            await connection.rollback();
            return res.status(400).json({ error: 'Statut de commande invalide' });
        }

        // 1. Fetch current order details and status
        const [orders] = await connection.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Commande introuvable' });
        }

        const oldStatus = orders[0].status;

        // If status hasn't changed, just return success
        if (oldStatus === status) {
            await connection.commit();
            return res.json({ message: 'Statut de la commande inchangé' });
        }

        // 2. Load order items
        const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

        // 3. Handle stock reconciliation
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            // Restore product stock
            for (const item of items) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        } else if (oldStatus === 'cancelled' && status !== 'cancelled') {
            // Deduct stock again, verifying availability
            for (const item of items) {
                const [productRows] = await connection.query(
                    'SELECT stock, name FROM products WHERE id = ? FOR UPDATE',
                    [item.product_id]
                );
                if (productRows.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({ error: 'Un article de la commande n\'existe plus' });
                }
                const product = productRows[0];
                if (product.stock < item.quantity) {
                    await connection.rollback();
                    return res.status(400).json({ error: `Stock insuffisant pour réactiver la commande (${product.name})` });
                }

                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        // 4. Update status
        await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        await connection.commit();
        res.json({ message: 'Statut de la commande mis à jour avec succès' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Échec de la mise à jour du statut de la commande' });
    } finally {
        connection.release();
    }
};

// GET track single order (Customer Public)
const trackOrder = async (req, res) => {
    try {
        const { orderId, phone } = req.query;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const cleanOrderId = String(orderId).replace(/\D/g, '');
        if (!cleanOrderId) {
            return res.status(400).json({ error: 'Invalid Order ID' });
        }

        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [cleanOrderId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        const order = rows[0];

        if (phone && !order.customer_phone.includes(phone.slice(-6))) {
            return res.status(401).json({ error: 'Le numéro de téléphone ne correspond pas à cette commande' });
        }

        const [items] = await pool.query(`
            SELECT oi.*, p.name as product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order.id]);

        res.json({
            ...order,
            items
        });

    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ error: 'Failed to track order' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus,
    trackOrder
};
