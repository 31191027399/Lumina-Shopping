import path from 'node:path';

const DB_FILE = process.env.DB_FILE || path.join(process.cwd(), 'data', 'lumina.db');

export const config = {
  port: Number(process.env.PORT || 4000),
  dbFile: DB_FILE,
  tokenTtlHours: Number(process.env.TOKEN_TTL_HOURS || 24)
};
