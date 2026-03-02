export function notFound(_req, res) {
  return res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  const message = err.message || 'Internal server error';
  const status = err.statusCode || 500;

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}
