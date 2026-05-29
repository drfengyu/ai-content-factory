# ECC（Everything Claude Code）分析文档

> **仓库**: https://github.com/affaan-m/ECC
> **Star**: 198k · **Fork**: 30.4k · **Commits**: 1,997
> **安装方式**: `npx skills add affaan-m/everything-claude-code@<skill-name> -y`

---

## 一、ECC 是什么

ECC（Everything Claude Code）是一个**智能体能力增强框架**，为 Claude Code、Codex、OpenCode、Cursor、Gemini 等多种 AI 编程助手提供：技能（Skills）、命令（Commands）、钩子（Hooks）、子智能体（Agents）、规则（Rules）五大能力层。

### 核心设计理念

```
ECC 能力分层
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skills   → 可复用工作流 + 领域知识
Commands → CLI 斜杠命令兼容层
Hooks    → 自动触发安全闸门 + 副作用
Agents   → 专业分工的子智能体角色
Rules    → 语言/框架规则约束
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

ECC 的核心理念是 **"读文件再回答，不靠记忆"**——所有组件都在仓库中实时维护，文档快速迭代，因此使用时优先检查仓库文件系统，而非依赖过时的知识。

---

## 二、已安装的 ECC 技能

通过 `npx skills add` 安装了以下 3 个 ECC 相关技能：

### 1. ecc-guide

| 属性 | 值 |
|------|-----|
| 安装量 | 881 |
| 来源 | `affaan-m/everything-claude-code@ecc-guide` |
| 用途 | ECC 导航指南 |

**功能**：当用户需要了解 ECC 包含什么、如何选择技能/命令/智能体时，指导用户通过实时读取仓库文件来回答。

**典型场景**：
- "ECC 有哪些技能？"
- "帮我找一个适合项目的技能"
- "ECC 怎么安装？"
- "技能、命令、智能体有什么区别？"

**关键命令**：
```bash
# 列出所有技能
find skills -maxdepth 2 -name SKILL.md | sort

# 列出所有命令
find commands -maxdepth 1 -name '*.md' | sort

# 列出所有智能体
find agents -maxdepth 1 -name '*.md' | sort

# 生成安装计划
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --profile minimal --target claude --json
```

---

### 2. workspace-surface-audit

| 属性 | 值 |
|------|-----|
| 安装量 | 2.9K |
| 来源 | `affaan-m/everything-claude-code@workspace-surface-audit` |
| 用途 | 工作区表面审计 |

**功能**：审计当前仓库、MCP 服务器、插件、连接器、环境变量和工具链配置，然后推荐最高价值的 ECC 原生技能、钩子、智能体和工作流。

**审计流程**（只读，不修改文件）：

```
Phase 1: Inventory What Exists
  → package.json, lockfiles, framework config
  → .mcp.json, .claude/settings*.json
  → .env* 文件中的服务名
  → 已安装的 ECC 技能

Phase 2: Benchmark
  → 对比官方插件 vs ECC 原生覆盖
  → 找出"已有工具但缺少操作技能"的空白

Phase 3: Turn Gaps Into ECC Decisions
  → 重复操作工作流 → Skill
  → 自动强制/副作用 → Hook
  → 专门委派角色 → Agent
  → 外部工具桥接 → MCP server
```

**输出结构**：
1. **当前表面** — 现在已经可用的能力
2. **对等覆盖** — ECC 已匹配或超越基准的方面
3. **仅有原语的空缺** — 工具有但缺少操作技能
4. **缺失集成** — 能力尚不可用
5. **Top 3-5 下一步** — 具体 ECC 原生添加建议

**安全规则**：
- 绝不打印密钥值
- 偏 ECC 原生工作流 > "装另一个插件"
- 将外部插件视为基准和灵感，而非权威边界

---

### 3. ecc-tools-cost-audit

| 属性 | 值 |
|------|-----|
| 安装量 | 2.7K |
| 来源 | `affaan-m/everything-claude-code@ecc-tools-cost-audit` |
| 用途 | ECC Tools 成本审计 |

**功能**：针对 ECC Tools 仓库的成本审计工作流。用于调查：
- 失控的 PR 创建（递归创建 PR）
- 配额绕过（并发请求绕过限制）
- 高级模型泄漏（免费用户走高级模型）
- 重复任务（同一非临时错误重复分析）
- GitHub App 成本激增

**关键点**：这是针对 `ECC-Tools` 兄弟仓库的专用工作流，不是通用计费技能。

**审计顺序**（按燃烧度修复）：
1. ⛔ 停止自动 PR 倍增
2. ⛔ 停止配额绕过
3. ⛔ 停止高级模型泄漏
4. ⛔ 停止重复任务扇出和无意义重试
5. ✅ 关闭重跑/更新安全缺口

**高频故障模式**：
- 一个队列类型处理所有触发器 → 分析 = PR 垃圾
- 入队后扣费 → 并发请求全部过门
- 免费层走高级路径 → 真实费用泄漏
- App 生成的分支重新进入 Webhook → 递归分析自己输出

---

## 三、ECC 生态全景

### 技能目录（Skills）

ECC 仓库包含大量技能，按功能领域分类。通过以下命令实时查看最新列表：

```bash
find ~/.agents/skills/ -name SKILL.md | sort
# 或从 ECC 仓库
find skills -maxdepth 2 -name SKILL.md | sort
```

常见技能类别：
| 类别 | 说明 |
|------|------|
| 🔍 **审计** | workspace-surface-audit, security-review |
| 🔄 **工作流** | tdd-workflow, verification-loop, autonomous-loops |
| 💰 **成本** | ecc-tools-cost-audit, customer-billing-ops |
| 🛡️ **安全** | security-review, prompt-defense |
| 🧠 **开发** | agentic-engineering, search-first |

### 命令系统（Commands）

ECC 维护了一套向后兼容的斜杠命令（如 `/project-init`、`/harness-audit`、`/skill-health`、`/skill-create`、`/security-scan`）。

- 优先使用 **Skills** 作为主要工作流接口
- 命令仅在以下情况使用：用户明确想要斜杠命令行为，或作为已维护的兼容垫片

### 钩子系统（Hooks）

ECC 的钩子是在工具调用前后自动触发的安全闸门：

```
hooks/
├── README.md      — 钩子行为说明
├── hooks.json     — 钩子注册表
└── scripts/       — 钩子实现脚本
```

典型钩子能力：
- 敏感文件操作前确认
- API Key 泄露检测
- 危险性操作拦截

### 子智能体（Agents）

ECC 定义了多个专门化的子智能体角色，每个有独立的 prompt：

```bash
find agents -maxdepth 1 -name '*.md' | sort
```

常见角色：
- **Researcher** — 研究分析
- **Reviewer** — 代码审查
- **Debugger** — 系统调试
- **Implementer** — 功能实现

### 规则系统（Rules）

按编程语言/框架维护的约束规则：

```bash
find rules -name '*.md' | sort
```

包含 TypeScript、Python、Rust 等语言的编码规范规则。

### 安装配置文件（Install Profiles）

ECC 提供多种安装配置组合：

```bash
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --profile minimal --target claude --json
node scripts/install-apply.js --profile minimal --target claude --dry-run
```

可选 profiles 包括 `minimal`、`full`、`security-focused` 等。

---

## 四、安装与使用

### 安装 ECC（通过 npx skills）

```bash
# 安装单个技能
npx skills add affaan-m/everything-claude-code@workspace-surface-audit -y
npx skills add affaan-m/everything-claude-code@ecc-guide -y
npx skills add affaan-m/everything-claude-code@ecc-tools-cost-audit -y
```

### 使用 ECC 技能

ECC 技能默认安装在 `~/.agents/skills/<skill-name>/` 目录下，每个技能包含：
- `SKILL.md` — 技能描述、使用说明、示例命令
- `scripts/` — 辅助脚本（可选）
- `references/` — 参考文件（可选）

### 工作流示例

**1. 审计当前项目并推荐改进：**
```
加载 workspace-surface-audit 技能
→ 审计 ai-content-factory 项目
→ 输出当前表面 → 空缺分析 → Top 3 改进建议
```

**2. 查找适合当前任务的技能：**
```
加载 ecc-guide 技能
→ 从仓库实时扫描技能目录
→ 匹配项目技术栈
→ 推荐最高价值技能
```

**3. 解决 ECC Tools 成本问题：**
```
加载 ecc-tools-cost-audit 技能
→ 追踪 Webhook → 队列 → Worker 燃烧路径
→ 按燃烧度排序修复
→ 最小验证步骤确认修复
```

---

## 五、与 Hermes Agent 的配合

ECC 技能通过 `npx skills` CLI 安装到 `~/.agents/skills/` 目录。在 Hermes Agent 中使用时：

1. **读取知识**：直接读取 `~/.agents/skills/<skill>/SKILL.md` 获取工作流知识
2. **执行工作流**：按照 SKILL.md 中的步骤和命令操作
3. **跨环境适配**：ECC 原为 Claude Code 设计，Hermes 使用时可适配其命令和流程

> ⚠️ 注意：ECC 的 `scripts/install-plan.js` 和 `scripts/install-apply.js` 等脚本是针对 Claude Code 环境的，在 Hermes Agent 中可直接执行但结果需适配。

---

## 六、总结

| 方面 | 评价 |
|------|------|
| 📦 **生态规模** | 庞大（198k Star，2000+ commits） |
| 🎯 **实用度** | workspace-surface-audit 项目审计最实用 |
| 🔧 **集成难度** | 低：通过 npx skills 一键安装 |
| 📚 **文档质量** | 高：每个技能有完整 SKILL.md |
| ⚠️ **注意** | 部分技能针对特定仓库（如 ecc-tools-cost-audit 需 ECC-Tools 仓库） |
