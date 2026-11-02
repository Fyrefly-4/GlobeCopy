# GlobeCopy

AI 跨文化营销本地化助手，本机演示版 MVP 的核心流程已实现。真实调用已获用户确认，首轮验收结果见 [验收记录](docs/ACCEPTANCE.md)。

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

`PORT` 默认为 `3001`，`LLM_TIMEOUT_MS` 默认为 `60000`。不配置密钥也可启动服务和访问健康检查；有效的本地化请求会返回配置缺失错误。

## 轻量通用模型接口

业务层只调用 `localize(input)`。适配层使用 Node.js 内置 `fetch`，无额外模型 SDK 或供应商框架。

| 后端环境变量 | 用途与默认值 |
| --- | --- |
| `LLM_API_KEY` | 必填，模型服务密钥，仅在后端保存 |
| `LLM_BASE_URL` | 默认 `https://api.deepseek.com`，支持兼容服务的版本或路径前缀，例如 `https://example.com/v1` |
| `LLM_MODEL` | 默认 `deepseek-flash`，切换服务时填写该服务的模型标识 |
| `LLM_TIMEOUT_MS` | 默认 `60000`，覆盖请求及响应体读取的总时限 |

基础地址不要包含 `/chat/completions`、查询参数、片段或内嵌账号密码。适配层保留基础地址的路径前缀，并追加 `/chat/completions`；修改配置后重启后端。

切换兼容服务通常只需修改前三个变量。兼容边界为：Bearer 鉴权、非流式 Chat Completions、`response_format: { "type": "json_object" }`、`max_tokens` 参数，以及 `choices[0].message.content` 和 `finish_reason` 响应结构。当前输出预算为 8192 tokens，不发送 DeepSeek 专属参数，不自动重试。不支持这些能力或需要其他协议的服务，需要后续调整适配器。

DeepSeek 默认配置及 JSON 输出方式参考 [官方接入文档](https://api-docs.deepseek.com/) 与 [JSON Output 文档](https://api-docs.deepseek.com/guides/json_mode/)，于 2026 年 11 月 2 日核对。文档核对不代表真实账号和生成质量已验证。

## 项目文档

- [产品需求](docs/PRD.md)
- [开发步骤](docs/DEVELOPMENT_PLAN.md)
- [前后端接口约定](docs/API_CONTRACT.md)
- [首轮验收记录](docs/ACCEPTANCE.md)

## 前端启动与构建

在另一个终端从项目根目录运行：

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

访问 `http://127.0.0.1:5173`。Dashboard 已包含输入、国家语言联动、三部分结果、复制、加载及错误重试。可点击「填入测试样例」后生成；「预览排版样例」展示的是明确标注的美国英语静态样例，不会调用模型。

启动后端后，访问 `http://127.0.0.1:5173/api/health` 可检查开发代理。默认转发至 `http://127.0.0.1:3001`；如后端端口不同，可复制 `frontend/.env.example` 为 `frontend/.env.local` 并修改 `API_PROXY_TARGET`，然后重启 Vite。不要将模型密钥放入任何前端配置。

```powershell
npm --prefix frontend run build
npm --prefix frontend run preview
```

构建输出到 `frontend/dist`；静态预览地址为 `http://127.0.0.1:4173`，不代理 API。前端端口被占用时会明确退出，不会自动换到其他端口。

## 本机演示：构建版同源运行

完成依赖安装及 `backend/.env` 配置后，在项目根目录执行：

```powershell
npm --prefix frontend run build
npm --prefix backend start
```

打开 `http://127.0.0.1:3001`，或后端 `PORT` 指定的端口。Express 同时提供构建页面、静态资源和 `/api`，此方式无需启动 Vite。修改前端后须重新构建；若端口被开发模式占用，应先停止该开发服务。

本项目仅有一个主页面，不提供其他前端路由；未知 API 或资源仍返回 404。未构建时后端健康检查可用，但根页面不可用，应先执行构建命令。

## 当前接口与验证

`POST /api/localize` 已连接通用模型适配层，原临时 501 状态已移除。配置有效时，该接口会调用配置的模型服务。用户已确认真实调用测试成功；本轮验收没有再次请求外部模型，三个市场的实际内容质量仍需逐一检查。

请求使用 `Content-Type: application/json`，输入、成功和错误结构见 [接口约定](docs/API_CONTRACT.md)。后端已校验商品名、原文长度及市场语言组合；模型结果必须为完整 JSON、非空文案与中文对照、2～4 条非空适配说明。空内容、代码块包裹、截断输出和非法结构均返回明确错误，不静默使用不完整内容。

所有错误采用 `{ "error": { "code": "...", "message": "..." } }` 结构。基础 HTTP 错误包括：非法输入的 `400 VALIDATION_ERROR`、超过 32 KiB 请求体限制的 `413 PAYLOAD_TOO_LARGE`、不支持的内容类型或编码的 `415 UNSUPPORTED_MEDIA_TYPE`、未知接口的 `404 NOT_FOUND`，以及隐藏内部详情的 `500 INTERNAL_ERROR`。请求体字节限制与文案字符数校验分别执行。

模型错误包括：`503 SERVICE_NOT_CONFIGURED`、`502 UPSTREAM_ERROR`、`502 INVALID_MODEL_RESPONSE` 和 `504 UPSTREAM_TIMEOUT`。不向客户端透传原始上游错误或密钥。

运行接口测试：

```powershell
npm --prefix backend test
npm --prefix frontend test
```

测试全部使用受控响应或本机模拟模型服务，不读取真实模型密钥、不访问外部模型服务、不产生模型调用费用。测试覆盖协议、三个市场参数、输入输出校验、错误处理及真实 HTTP 请求取消；不验证生成内容的语言和文化质量。

本轮通过前端 9 项、后端 60 项测试、生产构建与真实构建产物的同源 HTTP 检查。浏览器自动验收受环境限制未完成；剪贴板、窄屏、键盘操作和三市场内容质量详见验收记录中的待确认项。
