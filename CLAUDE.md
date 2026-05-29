# AI Content Factory — 开发规范

## 项目概述
面向自媒体创作者的 AI 内容生成工具，支持小红书、抖音、公众号三大平台。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- AI: 多渠道 API 适配系统（支持 OpenAI / Anthropic / Gemini 格式）

## 目录结构
```
src/
├── app/
│   ├── api/generate/route.ts   # AI 生成 API（多渠道适配）
│   └── page.tsx                # 主页
├── components/
│   ├── GenerateForm.tsx        # 生成表单
│   ├── PlatformSelector.tsx    # 平台/内容类型选择器
│   └── ResultDisplay.tsx       # 结果展示
├── data/prompts/index.ts       # 提示词模板
├── lib/
│   ├── providers.ts            # 多渠道 Provider 加载/解析
│   └── stream-parser.ts        # 多格式流式响应解析
├── types/
│   ├── index.ts                # 业务类型
│   └── providers.ts            # Provider 类型定义
└── config/
    └── providers.json          # 多渠道配置文件
```

## 多渠道 API 适配系统

### 核心设计
参考 new-api 多格式适配模式，`baseUrl` 只填**域名部分**，运行时根据 `type` 自动补全完整请求路径。

### Provider 配置格式（`config/providers.json`）

```json
{
  "id": "deepseek",               // 唯一标识
  "name": "DeepSeek",             // 显示名称
  "type": "openai",               // 接口类型：openai / anthropic / gemini
  "baseUrl": "https://api.deepseek.com",  // 只填域名，不含路径
  "apiKeyEnv": "DEEPSEEK_API_KEY",        // API Key 所在的环境变量名
  "defaultModel": "deepseek-v4-flash",    // 默认模型
  "models": ["deepseek-v4-flash"],        // 可用模型列表
  "headers": { "X-Custom": "value" },    // 可选额外请求头
  "description": "备注"
}
```

### 类型 → 请求路径自动补全

| type | 自动补全的完整路径 | 说明 |
|------|-------------------|------|
| `openai` | `{baseUrl}/v1/chat/completions` | OpenAI Chat 格式（兼容 DeepSeek、OpenRouter、聚合网关等） |
| `anthropic` | `{baseUrl}/v1/messages` | Anthropic Claude 格式 |
| `gemini` | `{baseUrl}/v1beta/models/{model}:generateContent` | Google Gemini 格式 |

### 类型 → 请求体自动适配

| type | 请求体格式 |
|------|-----------|
| `openai` | `{ model, messages: [{role, content}], temperature, max_tokens, stream }` |
| `anthropic` | `{ model, messages: [{role, content}], system, max_tokens, temperature, stream }` |
| `gemini` | `{ contents: [{role, parts: [{text}]}], generationConfig: { temperature, maxOutputTokens } }` |

### 类型 → 响应解析自动适配

`src/lib/stream-parser.ts` 中的 `extractContentFromStream()` 按优先级尝试：

```
OpenAI Chat    → choices[0].delta.content
OpenAI Resp    → parsed.delta (type === "response.output_text.delta")
Anthropic      → parsed.delta.text (type === "content_block_delta")
Gemini         → candidates[0].content.parts[].text
Legacy         → choices[0].text
```

### 环境变量

```
# 激活哪个 provider（对应 providers.json 中的 id）
ACTIVE_PROVIDER=deepseek

# 各 Provider 的 API Key（由 providers.json 的 apiKeyEnv 指定变量名）
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
NOUS_NEWAPI_KEY=nk-...

# 当前激活 provider 使用的模型名
AI_MODEL=deepseek-v4-flash
```

### 切换默认 Provider

**运行时**：改 `.env` 的 `ACTIVE_PROVIDER` 为目标 id，重启 dev server。

**未来扩展**：可在前端加下拉选择器，通过 `fetch('/api/provider/switch', {body: JSON.stringify({provider: 'openrouter'})})` 切换。

## 开发规范

### 代码风格
- 组件用函数式 + hooks
- 中文注释，英文变量名
- 保持现有 Tailwind 样式风格（圆角、渐变、暗色模式）
- 新组件放 `src/components/`，工具函数放 `src/lib/`

### 提示词模板
- 位于 `src/data/prompts/index.ts`
- 每个模板包含 `system`（角色设定）和 `user`（参数化消息）
- 新增内容类型需同步更新 `types/index.ts` 的 `ContentType` 联合类型

### API 规范
- 所有 AI 调用走 `/api/generate` 路由
- 请求体遵循 `GenerateRequest` 接口
- 流式响应：SSE 格式 `data: {"content":"..."}\n\ndata: [DONE]\n\n`
- 非流式：`{ content, model, tokens, provider }`
- 错误返回 `{ error: string }` + HTTP 状态码

## 当前状态
MVP 已完成：平台选择 → 内容类型选择 → AI 生成（多渠道适配）→ 流式输出

## 待开发
- [ ] 历史记录（localStorage）
- [ ] 模板系统（预设常用场景）
- [ ] 用量统计
- [ ] 导出 Markdown/HTML
- [ ] 前端 Provider 切换 UI
