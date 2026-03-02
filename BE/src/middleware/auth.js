import { get } from '../db.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    const session = await get(
      `SELECT s.user_id, s.expires_at, u.id, u.name, u.email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
      [token]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (new Date(session.expires_at) <= new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = {
      id: session.id,
      name: session.name,
      email: session.email,
      token
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
