# AI Content Factory - 商业化 UI/功能改造计划

> **For Hermes:** 使用 `subagent-driven-development` skill 按任务执行此计划，每个任务完成后进行 twofold review（规范符合性 + 代码质量）。
>
> **目标：** 将 AI Content Factory 的 UI/UX 升级为头部商业网站水准（参考 Linear/Vercel/Stripe/Superhuman），并确保商业化转化路径清晰可见。
>
> **架构：** 延续 Next.js 16 + Tailwind v4 + Motion 技术栈。在现有组件结构上做渐进式替换，不重写业务逻辑。
>
> **Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Motion, Phosphor Icons, Geist 字体

---

## 任务清单

### Task 1: 创建 docs/plans 目录并保存本计划

**Objective:** 为项目添加 plans 文件夹，便于后续追踪。

**Files:**
- Create: `docs/plans/`

**Step 1:** 创建目录  
Run: `mkdir -p docs/plans`  
Expected: 目录创建成功

**Step 2:** 保存本计划文件  
Write: `docs/plans/2025-12-20-commercial-ui-redesign.md`（即本文件内容）

**Step 3:** 提交  
```bash
git add docs/plans
git commit -m "docs: add commercial UI redesign plan"
```

---

### Task 2: 升级首页头部为商业网站式 Hero（已完成）

**Objective:** 把现有 header 改为 Vercel + Linear 风格的暗色 Hero 区：单列居中排版，big typography，清晰的价值主张与转化引导。

**Files:**
- Modify: `src/app/page.tsx:168-211`（现有 header 区域）
- Modify: `src/app/globals.css`（补充排版 token 如果需要）

**Step 1:** 替换 header JSX  
使用以下结构（保留 ProviderSwitch 和 UserPanel 在右上角）：
```tsx
<header className="relative border-b border-border-subtle bg-gradient-to-b from-accent/[0.06] to-transparent overflow-hidden">
  <div className="max-w-6xl mx-auto px-6 pt-16 pb-14">
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
      {/* Left: Value prop */}
      <div className="text-left">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5">
          <Sparkle size={24} className="text-accent" weight="fill" />
        </div>
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">AI Content Factory</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            把 AI 内容能力包装成<br className="hidden sm:block" />你的第一单服务收入
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            参考头部网站的转化架构：先展示能力，再引导生成服务包、获客话术与交付工具。不做复杂支付，首单通过微信完成。
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CurrencyCny size={14} className="text-accent" /> 首单 99-299 元</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><UsersThree size={14} className="text-accent" /> 熟人/本地商家获客</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CheckCircle size={14} className="text-accent" /> 当天可交付</span>
        </div>
      </div>

      {/* Right: Quick path card */}
      <div className="rounded-xl border border-accent/20 bg-surface/80 p-5 shadow-2xl shadow-accent/5">
        <div className="text-sm font-semibold">首单路径</div>
        <div className="mt-4 space-y-3 text-sm text-zinc-400">
          <div className="flex gap-3"><span className="text-accent font-semibold">01</span><span>生成可卖服务包和报价</span></div>
          <div className="flex gap-3"><span className="text-accent font-semibold">02</span><span>复制微信/朋友圈获客话术</span></div>
          <div className="flex gap-3"><span className="text-accent font-semibold">03</span><span>用内容工厂完成客户交付</span></div>
        </div>
      </div>

      {/* Provider + User (absolute right top) */}
      <div className="absolute right-6 top-6 flex items-center gap-2">
        {/* ProviderSwitch and UserPanel remain unchanged */}
      </div>
    </div>
  </div>
</header>
```

**Step 2:** 确保 ProviderSwitch 与 UserPanel 保留，位置在右上角（absolute right-6 top-6）。

**Step 3:** 视觉一致性检查  
- 使用现有 accent (`#38bdf8`) 与 surface 变量
- 文字颜色使用 `text-zinc-400` 作为次要文案，主标题用 `text-foreground`
- 卡片使用 `rounded-xl` + `border-border-subtle` + 微妙阴影

**Step 4:** 构建验证  
Run: `npm run build` 无错误  
Run: `npm run dev` 并在浏览器中打开，确认：
- Hero 在宽屏下呈两栏，移动端单列
- 右上角 Provider 和 User 可见且可用
- 无 404 或控制台错误

**Step 5:** 提交  
```bash
git add src/app/page.tsx
git commit -m "feat: update hero to commercial layout with value proposition and path card"
```

---

### Task 3: 实现“商品化服务包”独立入口卡片（已完成）

**Objective:** 在首页首屏下方（或 tabs 上方）增加一个商业转化入口卡片，突出展示“服务包设计”与“定价”，参考 Stripe CTA 区块。

**Files:**
- Modify: `src/app/page.tsx:214-242`（tabs 上方插入）

**Step 1:** 在现有 tabs 之前插入以下区块：
```tsx
<section className="max-w-6xl mx-auto px-6 py-10">
  <div className="grid md:grid-cols-3 gap-4">
    {/* Card 1: 服务包设计 */}
    <div className="commercial-card rounded-xl p-5">
      <div className="text-accent text-sm font-semibold mb-2">首单变现</div>
      <h3 className="text-lg font-semibold mb-2">设计 99/199/299 套餐</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        产出落地页文案、服务详情、交付规则与卖点提炼，直接复制发朋友圈。
      </p>
    </div>

    {/* Card 2: 获客话术 */}
    <div className="commercial-card rounded-xl p-5">
      <div className="text-accent text-sm font-semibold mb-2">微信成交</div>
      <h3 className="text-lg font-semibold mb-2">生成获客与跟进话术</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        微信私信、朋友圈预热、低压力跟进、转介绍文案；全套即用。
      </p>
    </div>

    {/* Card 3: 交付工具 */}
    <div className="commercial-card rounded-xl p-5">
      <div className="text-accent text-sm font-semibold mb-2">交付保障</div>
      <h3 className="text-lg font-semibold mb-2">标准交付工具包</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        客户信息收集表、SOP、验收话术与复购建议，确保首单不翻车。
      </p>
    </div>
  </div>
</section>
```

**Step 2:** 使用 `.commercial-card` 类（已在 globals.css 定义）保证阴影与边框风格统一。

**Step 3:** 构建与预览验证  
- 卡片在桌面三列，移动堆叠
- 阴影与 Hero 区块视觉协调

**Step 4:** 提交  
```bash
git add src/app/page.tsx
git commit -m "feat: add three commercial conversion cards on homepage"
```

---

### Task 4: 新增设置/开发者模式入口（已完成）

**Objective:** 为用户提供一个显眼的“开发者模式”入口，展示 API Key 配置、Provider 状态与测试功能。不新建复杂路由，复用已有 `ProviderSwitch` 扩展，或添加一个「设置」模态框。

**Files:**
- Create: `src/components/SettingsPanel.tsx`
- Modify: `src/app/page.tsx`（在右上角添加 Settings 按钮，与 ProviderSwitch/UserPanel 并排）
- Optional: 修改 `ProviderSwitch` 以复用其面板设计

**Step 1:** 创建 `SettingsPanel.tsx`（简化版）
```tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gear, CheckCircle, WarningCircle } from '@phosphor-icons/react';

export function SettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-surface-elevated text-zinc-400 hover:text-accent hover:bg-accent/10 border border-border-subtle hover:border-accent/30 transition-all"
      >
        <Gear size={11} weight="bold" />
        设置
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-border-subtle bg-surface shadow-2xl z-50 overflow-hidden p-4 space-y-4"
          >
            <div className="text-xs font-medium text-zinc-400">开发者模式</div>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              当前使用提供商的 API。自定义 Provider 配置可在后续版本添加。
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-300">环境正常</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2:** 在 `src/app/page.tsx` 的 header 绝对定位区域添加 `<SettingsPanel />`，放在 ProviderSwitch 和 UserPanel 之后。

**Step 3:** 构建验证：点击设置按钮出现面板，面板淡入淡出正常。

**Step 4:** 提交  
```bash
git add src/components/SettingsPanel.tsx src/app/page.tsx
git commit -m "feat: add Settings panel with developer mode placeholder"
```

---

### Task 5: 全局构建验证与截图确认

**Objective:** 确保所有修改整合后无类型/样式错误，并能正常运行。

**Files:**
- All modified above

**Step 1:** 类型检查  
Run: `npx tsc --noEmit`  
Expected: No errors

**Step 2:** 生产构建  
Run: `npm run build`  
Expected: Build successful, no errors

**Step 3:** 本地预览  
Run: `npm run dev &`（后台运行）  
用浏览器打开 `http://localhost:3000` 检查：
- Hero 区块布局正确
- 三个转化卡片显示
- Tabs（生成/历史）正常工作
- Provider 切换、用户建档、设置入口均可用
- 无控制台错误或警告

**Step 4:** 截图（可选，但推荐）  
若需给用户确认，截图保存至 `docs/screenshots/`。

**Step 5:** 提交  
```bash
git add .
git commit -m "chore: verify build and preview; commercial redesign integrated"
```

### 2026-06-01 进度更新

- 已修复主页商业化工作台的类型导入、移动菜单图标、获客标签图标引用问题。
- 已恢复 `README.md` 为可读中文，并同步当前功能、技术栈、Provider 与项目结构说明。
- 已在 `CLAUDE.md` 增加“每次提交后同步 Markdown 文档”的项目约定。
- 已修复用户档案的 `useSyncExternalStore` 快照缓存问题，避免创建档案后出现无限循环告警。
- 已统一 `UserPanel` 到同一套用户 store，移除旧的挂载同步逻辑。
- 已重新运行 `npm run build`，构建成功。
- 已在本地浏览器完成 UI 预览确认：首页可正常打开，商业化首屏、登录入口和控制台状态正常。

---

## 后续迭代建议（非本计划范围，供参考）

- 增加登录/注册独立页面或全屏模态，借鉴 Superhuman 的渐变 Hero + 表单分栏。
- 将“首单路径”卡片做成交互式步骤指示器，点击高亮当前步骤。
- 为服务包、话术、工具包三个类型添加模板预览（右侧画廊或左侧目录）。
- 在结果导出区增加「生成落地页代码片段」「复制到剪贴板一键排版」等便捷操作。
- 添加 Motion 的 scroll-trigger 入场效果，让内容区块随滚动逐次淡入。

---

**计划完成标准：** 所有 Tasks 执行并通过构建验证，UI 风格符合商业网站参考系，商业化转化路径清晰可见。
