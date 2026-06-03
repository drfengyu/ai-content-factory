# AI Content Factory - 开发规范

## 北极星目标

这个项目当前的核心目标是：**把 AI 内容生成能力整理成一个清晰、好用、可持续迭代的内容工作台**。

不要把目标误解为只做“单个平台的爆款文案生成器”。项目真正的重点是：围绕小红书、抖音、公众号这些真实内容场景，提供平台选择、模板套用、结果管理和导出能力。

## 当前产品定位

AI Content Factory 不是单纯的“文案生成器”，而是一个面向内容生产的 **AI 内容工作台**：

1. 平台选择：让用户在小红书、抖音、公众号之间快速切换。
2. 模板驱动：通过快捷模板减少空白页和重复输入。
3. 结果生成：根据主题、关键词、语气和复杂度生成内容。
4. 历史管理：保留本地历史记录，方便回看和复用。
5. 导出整理：支持复制与导出，便于后续编辑或发布。

## UI 设计规范（商业化导向）

### 设计原则
- 参考头部商业网站的排版架构与布局逻辑（Vercel 的精密排版、Stripe 的转化结构、Superhuman 的登录质感）。
- 使用成熟第三方组件体系（Geist 字体、Phosphor 图标、Motion 动效、Tailwind CSS 4）。
- 保持高级感与可读性：off-black 背景，单一 Electric Blue (#38bdf8) accent，无多余装饰色。
- 中文界面，面向中国用户与微信成交场景。

### 技术栈
- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4
- Motion (framer-motion)
- Phosphor Icons
- AI: 多渠道 API 适配系统，支持 OpenAI / Anthropic / Gemini 格式

### 视觉系统（已实施）
- 背景：`#09090b`（近黑色）
- 前景：`#f7f8f8`（近白色）
- 强调色：`#38bdf8`（Electric Blue）
- 表面：`#121216` / `#1c1c22`
- 边框：`rgba(255,255,255,0.08)` / `rgba(255,255,255,0.16)`
- 字体：Geist Sans（英文）+ 系统中文（Microsoft YaHei / Noto Sans SC）
- 网格背景与微妙渐变，营造专业深色工作台氛围

### 组件风格
- 按钮：圆角 6px，点击反馈 `active:scale-[0.98]`
- 卡片：`border` 用半透明白，`box-shadow` 叠加
- 表单：标签在输入框上方，不使用 placeholder 代替标签
- 图标统一使用 Phosphor Icons
- 骨架屏使用 shimmer 动效，形状匹配最终布局
- 导航保持简洁，主功能直接呈现

### 页面结构（当前）
- 首页：价值主张 + 核心功能模块 + 模板入口 + 结果管理
- 登录/建档：轻量本地用户系统（localStorage）
- 设置/开发者：显眼的入口，包含 API 配置、模型选择、连接测试
- 结果页：清晰的操作按钮（复制、下载 txt/md/html）、tokens 统计

## 目录结构

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

## 开发规范

### 代码风格
- 组件用函数式 + hooks。
- 中文注释，英文变量名。
- 新组件放 `src/components/`，工具函数放 `src/lib/`。
- 类型变化要同步更新：`src/types/index.ts`、`src/data/prompts/index.ts`、`src/components/PlatformSelector.tsx`。

### 提示词模板
- 位于 `src/data/prompts/index.ts`。
- 每个模板包含 `system` 和 `user`。
- 商业化类提示词必须明确：是帮助项目拥有者出售 AI 内容服务，不是帮助终端用户赚钱。
- 新增内容类型需同步更新 `ContentType` 联合类型和 `CONTENT_TYPES`。

### API 规范
- 所有 AI 调用走 `/api/generate`。
- 请求体遵循 `GenerateRequest`。
- 流式响应：SSE `data: {"content":"..."}`。
- 非流式响应：`{ content, model, tokens, provider }`。
- 错误返回 `{ error: string }` + HTTP 状态码。

## Provider 配置

Provider 配置在 `config/providers.json`。`baseUrl` 只填域名部分，运行时根据 `type` 自动补全完整请求路径。

| type | 自动补全路径 |
|------|--------------|
| openai | `{baseUrl}/v1/chat/completions` |
| anthropic | `{baseUrl}/v1/messages` |
| gemini | `{baseUrl}/v1beta/models/{model}:generateContent` |

环境变量示例：

```env
ACTIVE_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key_here
AI_MODEL=deepseek-v4-flash
```

不要把真实 API key 写进文档或提交到仓库。

## 验证要求

完成任何重构后至少运行：

```bash
npm run build
```

如果改了 UI，启动 dev server 并用浏览器检查：
- 页面能正常打开
- 三个商业化内容类型可见
- 选择模板后表单能被填充
- 控制台没有明显 JS 错误

## 当前阶段任务

v0.1.0（已完成）：项目从通用内容生成器，整理为一个明确的 AI 内容工作台。

- ✅ 升级全局视觉系统（globals.css 完成）
- ✅ 更新 CLAUDE.md（本条）
- ✅ 创建 docs/plans/ 与 plan.md
- ✅ 首页布局重构：产品 Hero + 工作台分栏
- ✅ 新增核心功能卡片与模块说明
- ✅ 设置与开发者模式入口优化
- ✅ 构建验证与截图确认

v0.2.0（进行中）：工作台打磨与扩展。详见 `docs/plans/2026-06-03-v0.2.0-workbench-polish.md`。

核心方向：
- **M1 地基修复**：类型统一、模板/图标对齐、移动端主题、HTML 导出安全
- **M2 设置面板完整化**：让 Header 上的"设置"按钮真正可用，接入自定义 Provider
- **M3 状态稳定**：表单草稿持久化、错误边界、流式完成状态
- **M4 模板体系升级**：18+ 内置模板、分类筛选、用户自定义模板
- **M5（可选）**：键盘快捷键与可访问性

明确不在 v0.2.0 范围：新平台、批量生成、统计仪表盘、云同步、团队协作。

## 文档同步约定

每次代码提交后，必须同步检查并更新相关 Markdown 文档：

- 功能、命令、目录结构变化：更新 `README.md`。
- 产品定位、开发规范、阶段状态变化：更新 `CLAUDE.md`。
- 计划执行进度、验证结果、后续任务变化：更新 `docs/plans/*.md`。
- Provider、API 格式或协议变化：更新 `docs/new-api-*.md`。
