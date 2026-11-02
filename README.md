# GlobeCopy

AI 跨文化营销本地化助手，当前正在实现本机演示版 MVP。

## 后端启动

运行环境：Node.js 24 或更高版本、npm。以下命令在项目根目录执行：

```powershell
Copy-Item backend/.env.example backend/.env
npm --prefix backend ci
npm --prefix backend run dev
```

若已有 `backend/.env`，保留现有文件，不要重复复制覆盖。环境变量优先于 `.env`；配置文件始终从 `backend/.env` 读取。

默认仅监听 `http://127.0.0.1:3001`。访问 `GET /api/health`，应返回：

```json
{ "data": { "status": "ok" } }
```

普通启动使用 `npm --prefix backend start`，开发模式会在代码变化后自动重启。

`PORT` 默认为 `3001`，`LLM_TIMEOUT_MS` 默认为 `60000`。模型密钥、基础地址和模型标识通过 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` 配置；实际模型调用将在开发步骤 2 接入。

## 项目文档

- [产品需求](docs/PRD.md)
- [开发步骤](docs/DEVELOPMENT_PLAN.md)

## 当前接口与验证

后端步骤 1 已完成，尚未接入模型，不会产生模型调用费用。

`POST /api/localize` 使用 `Content-Type: application/json`，后续请求和成功结构以 PRD 为准。当前合法 JSON 请求固定返回 HTTP 501：

```json
{
  "error": {
    "code": "LOCALIZATION_NOT_IMPLEMENTED",
    "message": "本地化模型尚未接入，请在完成模型接入后重试。"
  }
}
```

这是当前开发阶段的临时状态，将在步骤 2 接入真实模型后移除，不作为 MVP 最终业务错误码。商品字段与市场组合校验将在后续步骤实现。

所有错误采用 `{ "error": { "code": "...", "message": "..." } }` 结构。基础 HTTP 错误包括：非法 JSON 的 `400 VALIDATION_ERROR`、超过 32 KiB 请求体限制的 `413 PAYLOAD_TOO_LARGE`、不支持的内容类型或编码的 `415 UNSUPPORTED_MEDIA_TYPE`、未知接口的 `404 NOT_FOUND`，以及隐藏内部详情的 `500 INTERNAL_ERROR`。请求体字节限制不代替后续的文案字符数校验。

运行接口测试：

```powershell
npm --prefix backend test
```

前端尚未初始化，因此 Vite 代理、页面联调和构建托管仍待后续步骤完成。
