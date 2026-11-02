import express from 'express';
import { fileURLToPath } from 'node:url';
import { ApiError, errorHandler } from './errors.js';
import { createLocalizeRouter } from './routes/localize.js';

const defaultFrontendDist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));

export function createApp({ localize, frontendDist = defaultFrontendDist }) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/api/health', (req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  app.use('/api/localize', (req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) {
      return next(new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', '请使用 application/json 提交请求。'));
    }
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.use('/api/localize', createLocalizeRouter(localize));
  app.use('/api', (req, res, next) => {
    next(new ApiError(404, 'NOT_FOUND', '请求的接口不存在。'));
  });
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    next(new ApiError(404, 'NOT_FOUND', '请求的接口不存在。'));
  });
  app.use(errorHandler);

  return app;
}
