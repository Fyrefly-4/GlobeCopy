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

`PORT` 默认为 `3001`。模型超时固定为 60 秒。后端无需配置模型密钥；在页面中选择供应商，填写模型 ID 和自己的 API Key 后生成。

## 轻量通用模型接口

业务层只调用 `localize(input)`。适配层使用 Node.js 内置 `fetch`，无额外模型 SDK 或供应商框架。

| 首批供应商 | 固定 API 基础地址 |
| --- | --- |
| DeepSeek | `https://api.deepseek.com` |
| 硅基流动（中国区） | `https://api.siliconflow.cn/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |

用户只选择供应商，不提交自定义 URL。服务端从固定表中解析地址，禁止重定向；模型 ID 由用户填写，必须选择支持 JSON 输出的文本模型。DeepSeek 默认填写 `deepseek-flash`，另两家不预选模型，避免误用没有权限或不支持所需能力的模型。

Key 只保存在 React 页面内存，不写入本地存储、URL、源码或构建配置。刷新页面或点击「清除 Key」后须重新填写，切换供应商也会清空 Key。生成时 Key 随 POST 请求体进入本应用后端，再通过 Bearer 鉴权发给所选服务；后端只在本次请求中使用，不写入文件、数据库或应用日志，不缓存响应。部署到公网必须使用 HTTPS，并检查托管层不采集请求体。浏览器密码管理器与平台日志策略不受应用内存策略控制。

兼容边界为 Bearer 鉴权、非流式 Chat Completions、`response_format: { "type": "json_object" }`、`max_tokens`、`choices[0].message.content` 与 `finish_reason`。输出预算为 8192 tokens，不发送供应商专属参数，不自动重试。并非三家所有模型均满足要求，账户权限、地区可达性和生成质量仍需实际验证。

2026 年 11 月 4 日核对的协议来源：[DeepSeek](https://api-docs.deepseek.com/)、[硅基流动](https://docs.siliconflow.cn/docs/api/chat-completions-post)、[OpenRouter](https://openrouter.ai/docs/api_reference/overview)。本次仅使用受控测试，没有使用真实用户 Key 请求外部模型。

迁移说明：旧的 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`、`LLM_TIMEOUT_MS` 不再被业务配置读取，也不会作为请求缺失时的回退。已有本机 `.env` 文件不会被自动删除，其中的旧模型配置可自行移除；`.env.example` 只保留端口示例。

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

启动后端后，访问 `http://127.0.0.1:5173/api/health` 可检查开发代理。默认转发至 `http://127.0.0.1:3001`；如后端端口不同，可复制 `frontend/.env.example` 为 `frontend/.env.local` 并修改 `API_PROXY_TARGET`，然后重启 Vite。模型 Key 仅在页面输入框填写，不写入任何前端配置文件。

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

模型错误包括：`400 MODEL_CONFIG_INVALID`、`502 UPSTREAM_ERROR`、`502 INVALID_MODEL_RESPONSE` 和 `504 UPSTREAM_TIMEOUT`。不向客户端透传原始上游错误或密钥。

运行接口测试：

```powershell
npm --prefix backend test
npm --prefix frontend test
```

测试全部使用受控响应或本机模拟模型服务，不读取真实模型密钥、不访问外部模型服务、不产生模型调用费用。测试覆盖协议、三个市场参数、输入输出校验、错误处理及真实 HTTP 请求取消；不验证生成内容的语言和文化质量。

BYOK 更新通过前端 12 项、后端 64 项测试与生产构建。此前同源构建检查通过。浏览器自动验收受环境限制未完成；BYOK 页面操作及三家服务的真实调用仍需验证，原有剪贴板、窄屏和三市场内容质量待验项见验收记录。
