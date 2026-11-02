import express from 'express';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.get('/api/health', (req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  return app;
}
