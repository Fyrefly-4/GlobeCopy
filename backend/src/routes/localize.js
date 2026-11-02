import { Router } from 'express';
import { ApiError } from '../errors.js';

export const localizeRouter = Router();

localizeRouter.post('/', (req, res, next) => {
  // Step 2 will replace this explicit placeholder with the model adapter.
  next(new ApiError(501, 'LOCALIZATION_NOT_IMPLEMENTED', '本地化模型尚未接入，请在完成模型接入后重试。'));
});
