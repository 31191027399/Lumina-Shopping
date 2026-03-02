import { Router } from 'express';
import { all, get } from '../db.js';

const router = Router();

function buildOrderBy(sort) {
  switch (sort) {
    case 'price-low':
      return 'ORDER BY price ASC';
    case 'price-high':
      return 'ORDER BY price DESC';
    case 'rating':
      return 'ORDER BY rating DESC, reviews DESC';
    default:
      return 'ORDER BY id ASC';
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { category, sort = 'featured', search } = req.query;
    const where = [];
    const params = [];

    if (category && category !== 'All') {
      where.push('category = ?');
      params.push(category);
    }

    if (search) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = buildOrderBy(sort);

    const products = await all(
      `SELECT id, name, price, category, image, rating, reviews, description
       FROM products
       ${whereSql}
       ${orderBy}`,
      params
    );

    return res.json({ items: products, count: products.length });
  } catch (error) {
    return next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const rows = await all('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categories = ['All', ...rows.map((row) => row.category)];
    return res.json({ items: categories });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await get(
      `SELECT id, name, price, category, image, rating, reviews, description
       FROM products WHERE id = ?`,
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

export default router;
