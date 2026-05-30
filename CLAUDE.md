# AI Content Factory - 开发规范

## 北极星目标

这个项目当前的核心目标是：**帮助项目拥有者通过 AI-content-factory 赚到第一笔额外收入**。

不要把目标误解为“帮助终端用户赚第一笔收入”。终端用户只是潜在客户；真正要商业化的是项目本身：把 AI 内容生成能力包装成可售卖的轻量服务、作品展示页和交付工具。

## 当前产品定位

AI Content Factory 不是单纯的“文案生成器”，而是一个面向项目拥有者的 **AI 内容服务成交与交付工作台**：

1. 展示能力：让潜在客户看到可以生成小红书、抖音、公众号内容。
2. 设计服务包：围绕 99/199/299 元首单套餐，明确交付物、交付时间、修改规则。
3. 辅助获客：生成微信私信、朋友圈、小红书引流文案。
4. 辅助交付：收集客户素材，生成可交付内容，保留历史记录并导出。
5. 首单成交：优先支持微信沟通 + 手动转账，不要一开始做复杂支付、账号、订阅系统。

## 商业化优先级

优先做能帮项目拥有者更快拿第一单的功能：

- 服务变现入口：`service` 平台。
- 首单服务包：`service_package`，输出 99/199/299 套餐和落地页文案。
- 获客话术：`client_outreach`，输出微信、朋友圈、小红书成交文案。
- 交付工具包：`delivery_kit`，输出客户确认表、素材清单、SOP、验收和复购话术。
- 原有小红书/抖音/公众号生成能力保留，作为实际交付工具。

暂缓：
- 在线支付系统
- 多租户账号系统
- 复杂 CRM
- 积分/订阅/团队权限
- 大而全 SaaS 仪表盘

原因：第一笔额外收入阶段，手动成交最快，复杂系统会拖慢验证。

## UI 设计规范（商业化导向）

### 设计原则
- 参考头部商业网站的排版架构与布局逻辑（如 Linear 的暗色工作台、Vercel 的精密排版、Stripe 的转化结构、Superhuman 的登录质感）。
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

### 商业化页面结构（ upcoming ）
- 首页：价值主张 + 首单路径 + 生成工作台 + 服务包展示
- 登录/建档：轻量本地用户系统（localStorage），显式标注“首单验证”
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

正在把项目从通用内容生成器，重构为“帮助项目拥有者完成第一笔额外收入”的服务成交与交付工作台。

具体进行中：
- ✅ 升级全局视觉系统（globals.css 完成）
- ⏳ 更新 CLAUDE.md（本条）
- ⏳ 创建 docs/plans/ 与 plan.md
- ⏳ 首页布局重构：商业化 Hero + 工作台分栏
- ⏳ 新增服务包/转化 CTA 区
- ⏳ 设置与开发者模式入口优化
- ⏳ 构建验证与截图确认
