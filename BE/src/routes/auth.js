import { Router } from 'express';
import { all, get, run } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { calculateExpiry, generateToken } from '../utils/token.js';

const router = Router();

function validateCredentials({ name, email, password }, isRegister = false) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  if (isRegister && !name?.trim()) {
    const error = new Error('Name is required for registration');
    error.statusCode = 400;
    throw error;
  }
}

async function createSession(userId) {
  const token = generateToken();
  const expiresAt = calculateExpiry();

  await run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt]);

  return { token, expiresAt };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    validateCredentials({ name, email, password }, true);

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = hashPassword(password);
    const created = await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashed]
    );

    const user = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [created.id]);
    const session = await createSession(user.id);

    return res.status(201).json({ user, session });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    validateCredentials({ email, password });

    const user = await get('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?', [
      email.trim().toLowerCase()
    ]);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const session = await createSession(user.id);
    const { password_hash: _ignored, ...safeUser } = user;

    return res.json({ user: safeUser, session });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await run('DELETE FROM sessions WHERE token = ?', [req.user.token]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const orderStats = await get(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS total_spent
       FROM orders WHERE user_id = ?`,
      [req.user.id]
    );

    return res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        orderCount: orderStats.order_count,
        totalSpent: Number(orderStats.total_spent || 0)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/sessions', requireAuth, async (req, res, next) => {
  try {
    const sessions = await all(
      `SELECT id, expires_at, created_at
       FROM sessions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ items: sessions });
  } catch (error) {
    return next(error);
  }
});

export default router;
