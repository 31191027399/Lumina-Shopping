import { Router } from 'express';
import { all, get, run } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function cartForCheckout(userId) {
  return all(
    `SELECT p.id, p.name, p.category, p.price, c.quantity
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?`,
    [userId]
  );
}

router.use(requireAuth);

router.post('/checkout', async (req, res, next) => {
  try {
    const { shippingAddress = null, paymentMethod = 'card' } = req.body || {};

    const items = await cartForCheckout(req.user.id);
    if (!items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 15;
    const total = subtotal + shipping;

    const orderInsert = await run(
      `INSERT INTO orders (user_id, subtotal, shipping, total, shipping_address, payment_method)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, subtotal, shipping, total, shippingAddress, paymentMethod]
    );

    for (const item of items) {
      const lineTotal = item.price * item.quantity;
      await run(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_category, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderInsert.id, item.id, item.name, item.category, item.price, item.quantity, lineTotal]
      );
    }

    await run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    const order = await get(
      `SELECT id, user_id, subtotal, shipping, total, shipping_address, payment_method, status, created_at
       FROM orders
       WHERE id = ?`,
      [orderInsert.id]
    );

    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const orders = await all(
      `SELECT id, subtotal, shipping, total, shipping_address, payment_method, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ items: orders, count: orders.length });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await get(
      `SELECT id, subtotal, shipping, total, shipping_address, payment_method, status, created_at
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await all(
      `SELECT product_id, product_name, product_category, unit_price, quantity, total_price
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [order.id]
    );

    return res.json({ ...order, items });
  } catch (error) {
    return next(error);
  }
});

export default router;
