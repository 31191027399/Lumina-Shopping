import { Router } from 'express';
import { all, get, run } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const CUSTOMER_CANCELLABLE_STATUSES = new Set(['PLACED', 'PROCESSING']);

function normalizeOrder(row, items = []) {
  return {
    id: row.id,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    paymentMethod: row.payment_method || 'card',
    status: row.status,
    createdAt: row.created_at,
    shippingAddress: row.shipping_address,
    shippingDetails: {
      recipient: row.shipping_recipient || '',
      phone: row.shipping_phone || '',
      addressLine1: row.shipping_address_line1 || '',
      addressLine2: row.shipping_address_line2 || '',
      city: row.shipping_city || '',
      state: row.shipping_state || '',
      postalCode: row.shipping_postal_code || ''
    },
    items
  };
}

async function cartForCheckout(userId) {
  return all(
    `SELECT p.id, p.name, p.slug, p.category, p.image, p.price, c.quantity
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?`,
    [userId]
  );
}

async function fetchNormalizedOrderForUser(userId, orderId) {
  const order = await get(
    `SELECT id, subtotal, shipping, total, shipping_address, shipping_recipient, shipping_phone,
            shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
            payment_method, status, created_at
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [orderId, userId]
  );

  if (!order) return null;

  const items = await all(
    `SELECT product_id, product_name, product_category, unit_price, quantity, total_price
     FROM order_items
     WHERE order_id = ?
     ORDER BY id ASC`,
    [orderId]
  );

  return normalizeOrder(
    order,
    items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      productCategory: item.product_category,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      totalPrice: Number(item.total_price)
    }))
  );
}

router.use(requireAuth);

router.post('/checkout', async (req, res, next) => {
  try {
    const {
      shippingAddress = null,
      shippingRecipient = '',
      shippingPhone = '',
      shippingAddressLine1 = '',
      shippingAddressLine2 = '',
      shippingCity = '',
      shippingState = '',
      shippingPostalCode = '',
      paymentMethod = 'card'
    } = req.body || {};

    const items = await cartForCheckout(req.user.id);
    if (!items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 15;
    const total = subtotal + shipping;

    const orderInsert = await run(
      `INSERT INTO orders (
         user_id, subtotal, shipping, total, shipping_address, shipping_recipient, shipping_phone,
         shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, payment_method
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        subtotal,
        shipping,
        total,
        shippingAddress || shippingAddressLine1,
        shippingRecipient,
        shippingPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        paymentMethod
      ]
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
      `SELECT id, user_id, subtotal, shipping, total, shipping_address, shipping_recipient, shipping_phone,
              shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
              payment_method, status, created_at
       FROM orders
       WHERE id = ?`,
      [orderInsert.id]
    );

    const orderItems = items.map((item) => ({
      productId: item.id,
      productName: item.name,
      productCategory: item.category,
      unitPrice: Number(item.price),
      quantity: item.quantity,
      totalPrice: Number((item.price * item.quantity).toFixed(2))
    }));

    return res.status(201).json({ order: normalizeOrder(order, orderItems) });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const orders = await all(
      `SELECT id, subtotal, shipping, total, shipping_address, shipping_recipient, shipping_phone,
              shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
              payment_method, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ items: orders.map((item) => normalizeOrder(item)), count: orders.length });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await fetchNormalizedOrderForUser(req.user.id, req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const order = await get('SELECT id, status FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const action = String(req.body?.action || '').trim().toLowerCase();
    if (action !== 'cancel') {
      return res.status(400).json({ error: 'Unsupported order action' });
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.has(String(order.status || '').toUpperCase())) {
      return res.status(400).json({ error: 'Only placed or processing orders can be cancelled' });
    }

    await run('UPDATE orders SET status = ? WHERE id = ? AND user_id = ?', ['Cancelled', req.params.id, req.user.id]);
    const updatedOrder = await fetchNormalizedOrderForUser(req.user.id, req.params.id);
    return res.json({ order: updatedOrder });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/reorder', async (req, res, next) => {
  try {
    const order = await get('SELECT id FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await all(
      `SELECT product_id, quantity
       FROM order_items
       WHERE order_id = ?`,
      [req.params.id]
    );

    for (const item of items) {
      const existing = await get('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, item.product_id]);
      if (existing) {
        await run(
          `UPDATE cart_items
           SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND product_id = ?`,
          [item.quantity, req.user.id, item.product_id]
        );
      } else {
        await run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, item.product_id, item.quantity]);
      }
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
