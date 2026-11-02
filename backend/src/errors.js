export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = '服务发生异常，请重试。';

  if (error instanceof ApiError) {
    ({ status, code } = error);
    message = error.message;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = '请求体必须为有效的 JSON 对象。';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = '请求内容过大，请缩短文案后重试。';
  } else if (error.status === 415) {
    status = 415;
    code = 'UNSUPPORTED_MEDIA_TYPE';
    message = '请求内容类型或编码不受支持，请使用 UTF-8 JSON。';
  }

  res.status(status).json({ error: { code, message } });
}
