# GlobeCopy 前后端接口约定

需求依据：[PRD](./PRD.md)。本文记录工程阶段的调用约定，不代表模型功能已经实现。

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

国家与语言组合：`US/en-US`、`JP/ja-JP`、`DE/de-DE`。字段限制以 PRD 为准，后端业务校验将在后续步骤实现。

最终成功响应约定为 HTTP 200（尚未实现；以下为占位结构）：

```json
{
  "data": {
    "localizedCopy": "<目标语言营销文案>",
    "chineseTranslation": "<中文对照>",
    "culturalNotes": ["<适配说明 1>", "<适配说明 2>"]
  }
}
```

当前合法 JSON 请求返回 HTTP 501，错误代码为 `LOCALIZATION_NOT_IMPLEMENTED`。模型接入后移除此临时状态。

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

已实现基础错误代码见 [README](../README.md#当前接口与验证)，最终模型与业务错误代码见 PRD。

后端未启动或代理失败时，可能收到非 JSON 响应；网络失败也可能没有响应。后续前端调用封装应分别处理 HTTP 错误、无法解析的响应和网络异常，不直接向用户显示原始 HTML 或堆栈。

本阶段不实现前端请求封装、加载状态或错误界面，这些工作仍属于后续步骤。
