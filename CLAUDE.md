# AI Content Factory — 开发规范

## 项目概述
面向自媒体创作者的 AI 内容生成工具，支持小红书、抖音、公众号三大平台。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- AI: DeepSeek Chat（OpenRouter 或直连）

## 目录结构
```
src/
├── app/
│   ├── api/generate/route.ts   # AI 生成 API
│   ├── layout.tsx              # 全局布局
│   └── page.tsx                # 主页（单页应用）
├── components/
│   ├── GenerateForm.tsx        # 生成表单
│   ├── PlatformSelector.tsx    # 平台/内容类型选择器
│   └── ResultDisplay.tsx       # 结果展示 + 复制/下载
├── data/prompts/index.ts       # 提示词模板 + 平台配置
├── lib/ai.ts                   # AI API 封装
└── types/index.ts              # 类型定义
```

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
- 响应体遵循 `GenerateResponse` 接口
- 错误返回 `{ error: string }` + 对应 HTTP 状态码

### 环境变量
- `AI_API_KEY` — AI API Key（必填）
- `NEXT_PUBLIC_AI_API_BASE` — API Base URL（可选，默认 OpenRouter）

## 当前状态
MVP 已完成：平台选择 → 内容类型选择 → 表单填写 → AI 生成 → 结果展示

## 待开发
- [ ] 流式输出（Streaming）
- [ ] 历史记录（localStorage）
- [ ] 模板系统（预设常用场景）
- [ ] 用量统计
- [ ] 导出 Markdown/HTML
