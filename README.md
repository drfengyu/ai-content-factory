# AI Content Factory 🏭

面向自媒体创作者的 AI 内容生成工具，支持小红书、抖音、公众号三大平台。

## ✨ 功能

| 平台 | 内容类型 | 说明 |
|------|---------|------|
| 📕 小红书 | 爆款标题 | 生成 10 个高点击率标题 |
| 📕 小红书 | 种草文案 | 完整种草笔记，含话题标签 |
| 📕 小红书 | 话题标签 | 15-20 个热门标签组合 |
| 🎵 抖音 | 视频脚本 | 含画面描述、口播、字幕、BGM |
| 🎵 抖音 | 开头钩子 | 20 个 3 秒吸睛钩子 |
| 📰 公众号 | 文章大纲 | 3-5 章节结构框架 |
| 📰 公众号 | 完整文章 | 2000-5000 字深度文章 |

## 🛠 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS 4
- **语言**: TypeScript
- **AI**: DeepSeek Chat（通过 OpenRouter 或直连）

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

## ⚙️ 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `AI_API_KEY` | AI API Key（OpenRouter / DeepSeek） | ✅ |
| `NEXT_PUBLIC_AI_API_BASE` | API Base URL（默认 OpenRouter） | ❌ |

### 使用 DeepSeek 直连

```env
AI_API_KEY=your_deepseek_api_key
NEXT_PUBLIC_AI_API_BASE=https://api.deepseek.com/v1
```

### 使用 OpenRouter

```env
AI_API_KEY=your_openrouter_api_key
# NEXT_PUBLIC_AI_API_BASE 默认就是 OpenRouter
```

## 📁 项目结构

```
src/
├── app/
│   ├── api/generate/route.ts   # API 路由
│   ├── layout.tsx              # 布局
│   └── page.tsx                # 主页
├── components/
│   ├── GenerateForm.tsx        # 生成表单
│   ├── PlatformSelector.tsx    # 平台选择器
│   └── ResultDisplay.tsx       # 结果展示
├── data/prompts/index.ts       # 提示词模板
├── lib/ai.ts                   # AI API 封装
└── types/index.ts              # 类型定义
```

## 📝 License

MIT
