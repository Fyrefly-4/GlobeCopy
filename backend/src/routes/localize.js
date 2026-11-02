import { Router } from 'express';

export function createLocalizeRouter(localize) {
  const router = Router();
  router.post('/', async (req, res) => {
    const result = await localize(req.body);
    res.json({ data: result });
  });
  return router;
}
