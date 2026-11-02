# GlobeCopy 前后端接口约定

需求依据：[PRD](./PRD.md)。后端已实现以下接口与通用模型适配层；真实模型调用与内容质量检查等待前端完成后联调。

## 访问方式

- 前端使用相对路径 `/api/...`，不写死后端地址，不携带模型密钥。
- 开发环境由 Vite 将 `/api` 原样转发到 `http://127.0.0.1:3001`。
- 后端端口变化时，在 `frontend/.env.local` 设置 `API_PROXY_TARGET`，重启 Vite；该配置仅供开发服务器读取。
- 构建版本后续由 Express 同源托管；当前尚未实现。`vite preview` 仅用于预览静态构建，不代理 API。

## 健康检查（已实现）

`GET /api/health` → HTTP 200：

```json
{ "data": { "status": "ok" } }
```

## 本地化接口

`POST /api/localize`，请求头 `Content-Type: application/json`。

```json
{
  "productName": "便携保温杯",
  "sourceCopy": "轻巧便携，适合日常通勤。",
  "targetCountry": "US",
  "targetLanguage": "en-US"
}
```

国家与语言组合：`US/en-US`、`JP/ja-JP`、`DE/de-DE`。后端在调用模型前验证组合。商品名称和原文去除首尾空白后，分别须为 1～100、1～2,000 个 Unicode 码点；必填字段必须是字符串。未知字段不会传入模型。

成功响应为 HTTP 200（以下文本为结构占位说明）：

```json
{
  "data": {
    "localizedCopy": "<目标语言营销文案>",
    "chineseTranslation": "<中文对照>",
    "culturalNotes": ["<适配说明 1>", "<适配说明 2>"]
  }
}
```

模型的两个文本字段必须非空，适配说明必须为 2～4 条非空字符串。后端只返回这三个业务字段，不返回供应商元数据。非法 JSON、空内容、截断结果或字段异常会被拒绝。

原临时 `501 LOCALIZATION_NOT_IMPLEMENTED` 状态已移除。无密钥时，有效请求返回 `503 SERVICE_NOT_CONFIGURED`；配置完整后才会请求上游。

## 错误响应与前端处理约定

业务错误统一使用非 2xx HTTP 状态与以下结构，前端必须检查 `response.ok`，不能只判断是否成功解析 JSON：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "<面向用户的错误说明>"
  }
}
```

| HTTP 状态 | 错误代码 | 含义 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | JSON 或输入字段无效 |
| 413 | `PAYLOAD_TOO_LARGE` | 请求体超过 32 KiB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | 内容类型或编码不受支持 |
| 404 | `NOT_FOUND` | 接口不存在 |
| 503 | `SERVICE_NOT_CONFIGURED` | 密钥缺失或模型服务配置无效 |
| 502 | `UPSTREAM_ERROR` | 上游 HTTP 失败或网络异常 |
| 502 | `INVALID_MODEL_RESPONSE` | 上游成功响应无法解析或业务字段不合法 |
| 504 | `UPSTREAM_TIMEOUT` | 请求或响应读取超过配置时限 |
| 500 | `INTERNAL_ERROR` | 未预期的内部异常 |

上游鉴权失败、限流等统一返回 `UPSTREAM_ERROR`，不透传供应商原始响应。客户端仅在用户操作后重试，不自动重复请求。

后端未启动或代理失败时，可能收到非 JSON 响应；网络失败也可能没有响应。后续前端调用封装应分别处理 HTTP 错误、无法解析的响应和网络异常，不直接向用户显示原始 HTML 或堆栈。

本阶段不实现前端请求封装、加载状态或错误界面，这些工作仍属于后续步骤。
