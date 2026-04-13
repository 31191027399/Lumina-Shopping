import { Router } from 'express';
import { all, get, run } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function validateQuantity(quantity) {
  const parsed = Number(quantity);
  if (!Number.isInteger(parsed) || parsed < 1) {
    const error = new Error('Quantity must be an integer greater than 0');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

async function fetchCartByUser(userId) {
  const items = await all(
    `SELECT
      c.product_id AS id,
      p.name,
      p.slug,
      p.price,
      p.category,
      p.image,
      p.short_description,
      p.inventory_count,
      p.is_featured,
      p.gallery,
      p.rating,
      p.reviews,
      p.description,
      c.quantity,
      (p.price * c.quantity) AS lineTotal
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId]
  );

  const normalizedItems = items.map((item) => ({
    ...item,
    shortDescription: item.short_description || item.description,
    inventoryCount: Number(item.inventory_count ?? 0),
    isFeatured: Boolean(item.is_featured),
    gallery: (() => {
      try {
        const parsed = JSON.parse(item.gallery || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })()
  }));

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;

  return {
    items: normalizedItems,
    summary: {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  };
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const cart = await fetchCartByUser(req.user.id);
    return res.json(cart);
  } catch (error) {
    return next(error);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body || {};
    const qty = validateQuantity(quantity);

    const product = await get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await get('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [
      req.user.id,
      productId
    ]);

    if (existing) {
      await run(
        `UPDATE cart_items
         SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND product_id = ?`,
        [qty, req.user.id, productId]
      );
    } else {
      await run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [
        req.user.id,
        productId,
        qty
      ]);
    }

    const cart = await fetchCartByUser(req.user.id);
    return res.status(201).json(cart);
  } catch (error) {
    return next(error);
  }
});

router.patch('/items/:productId', async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const qty = validateQuantity(req.body?.quantity);

    const result = await run(
      `UPDATE cart_items
       SET quantity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND product_id = ?`,
      [qty, req.user.id, productId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cart = await fetchCartByUser(req.user.id);
    return res.json(cart);
  } catch (error) {
    return next(error);
  }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const result = await run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [
      req.user.id,
      productId
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cart = await fetchCartByUser(req.user.id);
    return res.json(cart);
  } catch (error) {
    return next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
