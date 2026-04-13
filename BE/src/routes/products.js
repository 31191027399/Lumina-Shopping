import { Router } from 'express';
import { all, get } from '../db.js';

const router = Router();

function normalizeGallery(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    shortDescription: row.short_description || row.description,
    inventoryCount: Number(row.inventory_count ?? 0),
    isFeatured: Boolean(row.is_featured),
    gallery: normalizeGallery(row.gallery),
    rating: Number(row.rating),
    reviews: row.reviews,
    description: row.description
  };
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'price-low':
      return 'ORDER BY price ASC';
    case 'price-high':
      return 'ORDER BY price DESC';
    case 'rating':
      return 'ORDER BY rating DESC, reviews DESC';
    case 'featured':
      return 'ORDER BY is_featured DESC, id ASC';
    default:
      return 'ORDER BY id ASC';
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { category, sort = 'featured', search, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const where = [];
    const params = [];
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 48);

    if (category && category !== 'All') {
      where.push('category = ?');
      params.push(category);
    }

    if (search) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice !== undefined && minPrice !== '') {
      where.push('price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      where.push('price <= ?');
      params.push(Number(maxPrice));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = buildOrderBy(sort);
    const countRow = await get(`SELECT COUNT(*) AS total FROM products ${whereSql}`, params);
    const totalItems = Number(countRow?.total || 0);
    const offset = (pageNumber - 1) * limitNumber;

    const products = await all(
      `SELECT id, name, slug, price, category, image, short_description, inventory_count, is_featured, gallery, rating, reviews, description
       FROM products
       ${whereSql}
       ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limitNumber, offset]
    );

    return res.json({
      items: products.map(mapProduct),
      count: products.length,
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limitNumber), 1)
    });
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
      `SELECT id, name, slug, price, category, image, short_description, inventory_count, is_featured, gallery, rating, reviews, description
       FROM products WHERE id = ?`,
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(mapProduct(product));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/related', async (req, res, next) => {
  try {
    const current = await get('SELECT id, category FROM products WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const items = await all(
      `SELECT id, name, slug, price, category, image, short_description, inventory_count, is_featured, gallery, rating, reviews, description
       FROM products
       WHERE category = ? AND id != ?
       ORDER BY rating DESC, reviews DESC, id ASC
       LIMIT 4`,
      [current.category, current.id]
    );

    return res.json({ items: items.map(mapProduct), count: items.length });
  } catch (error) {
    return next(error);
  }
});

export default router;
