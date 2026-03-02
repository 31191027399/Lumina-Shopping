import crypto from 'node:crypto';
import { config } from '../config.js';

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function calculateExpiry() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + config.tokenTtlHours);
  return expiresAt.toISOString();
}
