import http from 'node:http';
import handler from './handler.ts';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method && !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
      req.body = await readBody(req);
    }
    await handler(req, res);
  } catch (error) {
    console.error('Local API error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
    }
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(port, host, () => {
  console.log(`Local BE listening on http://${host}:${port}`);
});
