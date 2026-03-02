import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  return res.json({ status: 'ok', service: 'lumina-backend' });
});

export default router;
