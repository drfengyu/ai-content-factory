# AI Content Factory

面向内容创作者的 AI 内容生成工具，支持小红书、抖音、公众号三大平台。项目内置多渠道 Provider 适配层，可切换 DeepSeek、OpenRouter、OpenAI、New API、Claude、Gemini 等接口。

## 功能

| 平台 | 内容类型 | 说明 |
|------|---------|------|
| 小红书 | 爆款标题 | 生成 10 个高点击率标题 |
| 小红书 | 种草文案 | 完整种草笔记，含话题标签 |
| 小红书 | 话题标签 | 15-20 个热门标签组合 |
| 抖音 | 视频脚本 | 含画面描述、口播、字幕、BGM |
| 抖音 | 开头钩子 | 20 个 3 秒吸睛钩子 |
| 公众号 | 文章大纲 | 3-5 章节结构框架 |
| 公众号 | 完整文章 | 2000-5000 字深度文章 |

## 已实现能力

- 平台和内容类型选择
- 常用场景模板
- 多 Provider 前端切换、配置状态提示、模型选择
- SSE 流式生成展示
- 非流式 JSON/纯文本响应兼容
- 本地历史记录、搜索、筛选、批量删除
- 结果复制，导出 `.txt` / `.md` / `.html`

## 技术栈

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Motion
- Phosphor Icons

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

Provider 列表配置在 `config/providers.json`。`ACTIVE_PROVIDER` 对应其中的 `id`，每个 Provider 的 API Key 变量名由 `apiKeyEnv` 指定。

```env
# 可选：deepseek / openrouter / openai / nous-newapi / claude / gemini
ACTIVE_PROVIDER=deepseek

DEEPSEEK_API_KEY=your_deepseek_api_key_here
# OPENROUTER_API_KEY=your_openrouter_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
# NOUS_NEWAPI_KEY=your_newapi_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here

# 当前激活 Provider 使用的模型名。不填时使用 providers.json 里的 defaultModel
AI_MODEL=deepseek-v4-flash
```

## 项目结构

```text
src/
├── app/
│   ├── api/generate/route.ts   # AI 生成 API，多渠道适配
│   ├── api/providers/route.ts  # Provider 列表 API
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页/商业化工作台
├── components/
│   ├── GenerateForm.tsx        # 生成表单
│   ├── HistoryList.tsx         # 本地历史记录
│   ├── PlatformSelector.tsx    # 平台和内容类型选择器
│   ├── ProviderSwitch.tsx      # Provider 切换
│   ├── ResultDisplay.tsx       # 结果展示和导出
│   └── Templates.tsx           # 常用模板
├── data/
│   ├── prompts/index.ts        # 提示词模板和平台配置
│   └── templates.ts            # 场景模板
├── lib/
│   ├── providers.ts            # Provider 加载、请求构造
│   └── stream-parser.ts        # 多格式响应解析
└── types/
    ├── index.ts                # 业务类型
    └── providers.ts            # Provider 类型
```

## Provider 适配

`config/providers.json` 中的 `type` 决定请求路径、请求体和响应解析方式：

| type | 请求格式 | 默认路径 |
|------|----------|----------|
| `openai` | Chat Completions 兼容格式 | `{baseUrl}/v1/chat/completions` |
| `anthropic` | Claude Messages 格式 | `{baseUrl}/v1/messages` |
| `gemini` | Gemini generateContent 格式 | `{baseUrl}/v1beta/models/{model}:generateContent` |

OpenRouter 这类特殊路径可通过 `pathPrefix` 覆盖，例如 `/api/v1`。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
```

## License

MIT
