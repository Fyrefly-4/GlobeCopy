# GlobeCopy 前后端接口约定

需求依据：[PRD](./PRD.md)。后端已实现以下接口与通用模型适配层；用户已确认真实调用成功，三个市场的内容质量仍待逐一验收。

## 访问方式

- 前端使用相对路径 `/api/...`，不写死后端地址。BYOK Key 仅在本地化 POST 请求体中传给本应用后端，不放入 URL；公网必须使用 HTTPS。
- 开发环境由 Vite 将 `/api` 原样转发到 `http://127.0.0.1:3001`。
- 后端端口变化时，在 `frontend/.env.local` 设置 `API_PROXY_TARGET`，重启 Vite；该配置仅供开发服务器读取。
- 构建版本由 Express 同源托管，先构建前端再启动后端，访问后端地址即可。`vite preview` 仅用于预览静态构建，不代理 API。

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
  "targetLanguage": "en-US",
  "modelConfig": {
    "provider": "deepseek",
    "model": "deepseek-flash",
    "apiKey": "<用户填写的 Key>"
  }
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

`modelConfig` 每次请求必填，仅含供应商 ID、模型 ID 和用户 Key。供应商 ID 为 `deepseek`、`siliconflow`、`openrouter`。基础地址由后端固定映射；提交 `baseUrl`、`url` 或未知供应商会被拒绝。模型 ID 最长 200 字符，Key 最长 4096 字符，去除首尾空白后不得含空格、控制字符或非 ASCII 字符。模型 ID 允许字母、数字及 `._:/@+-`。

原临时 501 状态已移除。BYOK 配置缺失或无效返回 `400 MODEL_CONFIG_INVALID`，不回退到服务端密钥。响应包含 `Cache-Control: no-store`。应用不持久保存请求中的 Key，不记录请求体；上游只收到 Bearer Key 和文案消息，Key 不进入提示词。

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
| 400 | `MODEL_CONFIG_INVALID` | BYOK 配置缺失、无效或包含不允许的地址 |
| 502 | `UPSTREAM_ERROR` | 上游 HTTP 失败或网络异常 |
| 502 | `INVALID_MODEL_RESPONSE` | 上游成功响应无法解析或业务字段不合法 |
| 504 | `UPSTREAM_TIMEOUT` | 请求或响应读取超过配置时限 |
| 500 | `INTERNAL_ERROR` | 未预期的内部异常 |

上游鉴权失败、限流等统一返回 `UPSTREAM_ERROR`，不透传供应商原始响应。客户端仅在用户操作后重试，不自动重复请求。

后端未启动或代理失败时，可能收到非 JSON 响应；网络失败也可能没有响应。后续前端调用封装应分别处理 HTTP 错误、无法解析的响应和网络异常，不直接向用户显示原始 HTML 或堆栈。

前端已实现请求封装、响应结构检查、加载状态及错误重试界面。浏览器交互与生成内容的最终验收状态见 [验收记录](./ACCEPTANCE.md)。
