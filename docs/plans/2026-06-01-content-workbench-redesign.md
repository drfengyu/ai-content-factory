# AI Content Factory - 内容工作台重构计划

> **目标：** 将 AI Content Factory 调整为一个更明确的 AI 内容工作台，围绕小红书、抖音、公众号三类真实内容场景组织功能。
>
> **方向：** 弱化所有“服务变现”相关叙事，首页聚焦实际模块能力、模板驱动生成、历史记录和导出。
>
> **技术栈：** Next.js 16, React 19, Tailwind CSS 4, Motion, Phosphor Icons, Geist 字体

---

## 重构目标

1. 取消首页中的服务变现模块和相关营销文案。
2. 让首页第一屏直接说明项目能做什么，而不是强调定价或成交。
3. 突出平台选择、模板生成、历史记录、结果展示和导出这几项真实能力。
4. 同步更新代码、README 和内部说明文档，保持叙事一致。

---

## 任务清单

### Task 1: 清理平台与模板中的服务变现入口

**Objective:** 移除 `service` 平台、`service_package`、`client_outreach`、`delivery_kit` 以及相关模板引用。

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/prompts/index.ts`
- Modify: `src/data/templates.ts`
- Modify: `src/components/PlatformSelector.tsx`

**Expected:**
- 平台只保留 `xiaohongshu`、`douyin`、`gongzhonghao`
- 内容类型只保留三类真实内容场景
- 所有旧的服务变现入口不再出现在 UI 中

---

### Task 2: 重写首页为产品功能导向

**Objective:** 首页聚焦真实模块功能，而不是服务变现、首单或定价。

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/LandingPage.tsx`

**Expected:**
- Hero 改为“内容生成工作台”定位
- 功能卡片展示平台选择、模板系统、结果管理
- 未登录页也统一为内容工作台叙事

---

### Task 3: 同步文档定位

**Objective:** 让 `CLAUDE.md`、`README.md` 和本计划保持一致。

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Create: `docs/plans/2026-06-01-content-workbench-redesign.md`

**Expected:**
- 不再提“首单”“成交”“服务包”“99/199/299”
- 文档描述与实际 UI 保持一致

---

### Task 4: 验证与收尾

**Objective:** 确认重构后可正常编译、页面可打开、功能入口未损坏。

**Steps:**
1. `npm run lint`
2. `npm run build`
3. 浏览器检查首页、登录流、平台选择、模板选择、历史记录和导出入口

---

## 当前状态

- 已开始移除服务变现相关入口
- 已完成首页功能导向改造
- 已开始同步内部说明文档
- 待完成：README 和最终构建验证
