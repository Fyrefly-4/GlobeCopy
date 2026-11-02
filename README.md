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
