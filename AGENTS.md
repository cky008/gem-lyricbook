# AGENTS.md

本文件约束在本仓库中工作的自动化编码代理、AI 助手与维护者。它是仓库级执行规范；除非仓库所有者在当前任务中明确改变要求，否则所有修改、测试、提交、发布与交付都必须遵循本文件。

## 1. 指令优先级与工作原则

1. 当前任务中仓库所有者的明确要求优先于本文件。
2. 本文件优先于一般性的编码偏好；`README.md`、`CONTRIBUTING.md` 和 `docs/` 提供补充说明。
3. 开始修改前，先阅读与任务相关的现有源码、测试和文档，不得仅凭文件名或旧版本推断当前实现。
4. 修改范围应尽可能小，只处理任务所需内容，不顺手重构无关代码。
5. 不得声称测试、构建、PDF 检查或设备回归已经通过，除非实际执行并检查了结果。
6. 不得创建虚假的下载路径、构建产物、版本号、测试结果或发布状态。
7. 未经仓库所有者明确批准，不得执行破坏性 Git 操作，例如：
   - `git reset --hard`；
   - `git clean -fd`；
   - `git push --force` 或 `--force-with-lease`；
   - 删除远端分支或标签；
   - 重写 `main`、`develop` 的共享历史。
8. 若工作区存在不属于当前任务的修改，必须保留并避开，不得覆盖、还原或夹带提交。

## 2. 项目边界

- 项目是纯静态、本地优先的多版本双语歌词本。
- 正式网站为 `https://gem.iocky.com`；生产部署目标是 GitHub Pages，可由 Cloudflare 提供 DNS、HTTPS 与反向代理。
- 核心技术保持为：
  - Bootstrap 5，本地静态资源；
  - 原生 ES Modules；
  - Node.js 22；
  - Node.js 原生测试；
  - 零第三方构建依赖。
- 未经仓库所有者明确批准，不引入：
  - 后端服务；
  - 数据库；
  - 登录系统；
  - 遥测或行为追踪；
  - 远程歌词上传；
  - 外部 CDN 运行时依赖；
  - 会改变本地优先与离线能力的框架迁移。
- `dist/` 是构建产物，不是源码，不提交到仓库。
- `legacy/` 是只读历史归档；除非专门修复归档说明，不修改其中的旧版本程序。

## 3. 仓库结构与职责

主要文件职责如下：

- `index.html`：应用页面结构和可访问性语义。
- `src/main.js`：数据加载和应用启动入口。
- `src/app.js`：阅读、编辑、导入导出、歌单、覆盖层和打印核心交互。
- `src/styles/app.css`：应用界面、响应式布局和打印样式。
- `src/data/songs.json`：公开曲目元数据，不得包含用户完整歌词。
- `src/data/setlists.json`：公开演出歌单预设、预测结构与候选池。
- `src/print/toc-layout.js`：目录栏数、密度与分页模型；不得重新塞回 `src/app.js`。
- `scripts/build.mjs`：生产构建、单文件 HTML、Service Worker 和版本文件生成。
- `scripts/verify-project.mjs`：曲目、歌单、隐私和项目结构校验。
- `tests/`：Node.js 原生单元测试与回归约束。
- `.github/workflows/`：持续集成和 GitHub Pages 部署。
- `.github/ISSUE_TEMPLATE/`、`.github/pull_request_template.md`、`.github/dependabot.yml`：GitHub 协作配置，不得因复制部分 `.github` 内容而误删。

新增可独立测试的算法时，优先拆成纯函数模块并添加 Node 原生测试。不得将可复用的分页、排序或数据转换逻辑继续堆入大型事件处理函数。

## 4. 私人数据、歌词与版权

- `src/data/songs.json` 只能保存曲目名称、别名、标签、来源、版本提示和核实说明，不得写入完整歌词。
- 不得把以下内容提交到公开仓库：
  - 用户 JSON 备份；
  - 含歌词的离线 HTML；
  - 私人打印 PDF；
  - 浏览器 `localStorage` 导出；
  - `private-data/`；
  - 任何未经授权的完整歌词、封面、录音或演出影像。
- 私人备份只允许在仓库外或被 `.gitignore` 排除的临时目录中用于本地测试。
- 测试夹具优先使用合成文本、占位文本或公开元数据，不复制真实完整歌词。
- 使用私人数据生成测试证据时，必须放入醒目标记的私有目录，并明确注明不得上传 GitHub。
- `.gitignore` 只能降低误提交风险，不能替代提交前人工检查。
- 提交前必须检查是否出现以下模式：
  - `GEM歌词本备份_*.json`；
  - `GEM歌词本_含歌词_*.html`；
  - `*.private.json`；
  - 私人 PDF 或测试截图。
- 网页程序、界面、排版逻辑与项目文档的版权标识保持为：

```text
Copyright © 2026 iocky.com
```

## 5. 数据模型与向后兼容

- 保持兼容 `gem-lyricbook-backup-v2`、`v3` 和多版本 `v4`。
- 导入旧数据时不得丢失：
  - 歌词；
  - 多版本；
  - 翻译；
  - 默认版本与当前版本；
  - 收藏；
  - 熟悉标记；
  - 自定义歌单；
  - 用户排序和相关设置。
- 同一首歌的国语、粤语、英文、现场版、改词版等必须保存在同一个歌曲记录中。
- 外语原文和对应翻译属于同一个歌词版本，不应误拆为两首歌或两个独立曲目。
- 单版本歌曲打印时不显示冗余的“默认版”；歌曲实际保存多个版本时才显示必要的版本名称。
- 曲目 ID 一经公开使用应保持稳定；不得仅为排序或显示方便批量重编号。
- 修改备份格式时必须：
  1. 保留旧格式导入；
  2. 记录迁移规则；
  3. 增加测试；
  4. 更新 `docs/DATA_FORMAT.md` 和 `CHANGELOG.md`。

## 6. 演出歌单、筛选与排序

- “演出歌单”“目录筛选”“打印范围”是三个独立概念：
  - 演出歌单决定歌曲成员、Part / Encore 分节与演唱顺序；
  - 筛选只改变网页目录当前显示内容；
  - 打印范围决定输出当前歌曲、当前歌单、筛选结果或全部曲库。
- “仅当前演出歌单”不得受到搜索词或标签筛选的意外影响。
- 可选章节、点歌池和轮换候选必须保持显式标识，不得与高置信度固定流程混为一谈。
- 预测歌单必须标注“非官方”“预测”“候选”或相应置信度，不得伪装成正式现场记录。
- 正式现场记录应保存日期、来源状态和实际顺序；不得静默覆盖预测预设。

## 7. 打印系统不变量

修改打印系统后必须保持：

1. 正文不得进入页码或页脚安全区；
2. 不得通过 `overflow: hidden`、固定高度裁切或不可见溢出来掩盖问题；
3. A4、A5、A4 对折都必须进行真实 DOM 高度与宽度复检；
4. 单版本歌曲默认目标为 1 页；多版本歌曲默认最多 2 页；
5. 如果一页能够安全容纳全部内容，应优先使用一页，并尽量使用可读的最大字号；
6. 极端长文本必须通过“可读性优先”或明确续页兜底，不得无限缩小字号；
7. 短句合并、`/` 分隔、空行压缩和多栏仅作用于打印副本，不得改写用户保存的原始歌词；
8. 单版本歌曲不显示无意义版本标题，多版本歌曲保留版本辨识；
9. 目录链接必须继续指向歌曲第一页；
10. A4 对折必须先生成 A5 逻辑页，再按骑马钉页序拼成横向 A4 印刷面；
11. 对折逻辑页总数不足 4 的倍数时，只能通过明确空白页补齐；
12. 打印预览、系统打印和最终 PDF 的页面尺寸、方向与页序必须一致。

### 目录回归基准

- 34 首、5 个 Part 的深圳主流程目录：
  - A4 必须使用单栏、较大字号并在 1 个目录页内完成；
  - A5 必须在 1 个逻辑目录页内完成；
  - A4 对折必须在 1 个 A5 逻辑目录页内完成；
  - 三种版式均不得出现“（续）”。
- 更大的目录应按以下顺序尝试：
  1. 单栏宽松布局；
  2. 双栏标准布局；
  3. 三栏紧凑布局；
  4. 最紧凑布局仍放不下时才产生续页。
- 标题、副标题、Part 标题、歌曲行、章节间距和页脚安全区都必须计入目录容量测量。

## 8. 移动端、覆盖层与可访问性

- 侧栏、沉浸阅读和 Bootstrap Modal 不得各自无条件覆盖 `body.style.overflow`。
- 从移动侧栏打开排序或其他 Modal 时，必须先关闭侧栏并释放其滚动锁，再打开 Modal。
- 最后一个覆盖层关闭后必须清理残留的：
  - `modal-open`；
  - backdrop；
  - `body` / `html` 的 `overflow`；
  - 滚动条补偿；
  - 临时内联样式。
- 必须保留关闭覆盖层前的合理滚动位置，避免跳回页面顶部。
- 任何相关修改都要回归以下路径：

```text
侧栏 → 排序 → 关闭侧栏 → 关闭排序 → 主页面仍能滚动
```

- 新功能应同时兼顾：
  - 触屏；
  - 键盘；
  - 可见焦点；
  - 屏幕阅读器标签；
  - iPhone 安全区域；
  - 窄屏和横屏。
- 不得仅以桌面 Chromium 正常作为移动端无问题的证明；涉及移动覆盖层时，至少执行移动视口回归，并在发布前进行真实 iPhone / iPad Safari 冒烟测试。

## 9. 代码与样式规范

- 保持原生 ES Modules 架构，不为局部功能引入大型框架。
- Bootstrap 资源继续本地化，不依赖外部 CDN。
- 新增模块必须被普通构建与单文件构建同时包含。
- 纯函数优先，副作用集中管理；复杂条件应拆分为具名函数。
- 不复制相同业务逻辑到多个版式分支；优先共享数据模型和测量函数。
- 变量、函数和文件名使用清晰英文；用户可见文案优先使用中文。
- 注释用于解释设计原因、兼容约束和不直观算法，不重复代码表面含义。
- 保持现有格式风格；不为单个任务进行全仓库格式化。
- CSS 修改必须检查普通界面、暗色模式、移动端和打印媒体查询之间的影响。
- 不修改 `vendor/bootstrap/`，除非明确升级 Bootstrap，并同步更新第三方声明。

## 10. Git 分支模型

### 长期分支

- `main`：生产分支。
  - 始终对应可部署、可打印的稳定版本；
  - GitHub Pages 只从 `main` 自动部署；
  - 日常开发不得直接提交到 `main`；
  - 正常发布通过 `develop → main` Pull Request 完成。
- `develop`：日常开发与集成分支。
  - 文档、小型修复、普通样式和低风险维护可直接提交到 `develop`；
  - 每次 push 都必须触发持续集成；
  - `develop` 不得强制推送或重写共享历史。

### 临时分支

仅在需要隔离、独立评审或风险较高时创建：

- `feature/*`：较大新功能，从 `develop` 创建，完成后合回 `develop`；
- `fix/*`：较复杂普通 Bug，从 `develop` 创建，完成后合回 `develop`；
- `hotfix/*`：线上紧急修复，从 `main` 创建，完成后先合回 `main`，再同步回 `develop`；
- `release/*`：可选，仅用于需要冻结、集中验收或多人并行时；不得为每个小版本机械创建。

### 推荐合并策略

- `feature/*`、`fix/*` → `develop`：推荐 Squash merge，使一个主题对应一个提交；
- `develop` → `main`：推荐 Create a merge commit，保留发布边界和共同祖先；
- `hotfix/*` → `main` 后，必须将 `main` 合回 `develop`；
- 合并后删除已经完成的临时分支；长期保留 `main` 与 `develop`。

## 11. 开始开发前

默认从最新 `develop` 开始：

```bash
git switch develop
git pull --ff-only
git status --short
```

- `git status --short` 应为空。
- 如果有未提交内容，先明确其来源并提交、暂存或另行保存；不得直接覆盖。
- 如果 `git pull --ff-only` 失败，停止操作并检查分支关系，不要直接 reset 或 force push。
- 较大任务再创建临时分支：

```bash
git switch -c feature/short-description
# 或
git switch -c fix/short-description
```

## 12. 安全复制、差异检查与暂存

### 禁止整目录覆盖协作配置

- 不得使用 Finder 或 `cp -R` 用一个不完整的 `.github/` 替换仓库现有 `.github/`。
- 更新 Workflow 时只复制明确的文件，例如：

```bash
cp /path/to/ci.yml .github/workflows/ci.yml
cp /path/to/deploy-pages.yml .github/workflows/deploy-pages.yml
```

- 修改后必须确认以下文件没有被误删：
  - `.github/ISSUE_TEMPLATE/bug_report.yml`；
  - `.github/ISSUE_TEMPLATE/feature_request.yml`；
  - `.github/dependabot.yml`；
  - `.github/pull_request_template.md`。

### 提交前检查

修改完成后先执行：

```bash
git status --short
git diff --name-status
git diff
```

- 小范围修改不得直接使用 `git add .`。
- 应明确暂存当前任务涉及的文件：

```bash
git add path/to/file-a path/to/file-b
```

暂存后再次执行：

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached
```

- 任何未预期的 `D`、大规模重写、私人文件或构建产物都必须在提交前处理。
- `dist/`、`node_modules/`、测试产物和私人数据不得进入暂存区。

## 13. Commit 规范

提交信息采用 Conventional Commits 风格：

- `feat:` 新功能；
- `fix:` Bug 修复；
- `docs:` 文档；
- `ci:` CI/CD 与 GitHub Actions；
- `test:` 测试；
- `refactor:` 不改变外部行为的重构；
- `perf:` 性能改进；
- `build:` 构建系统；
- `chore:` 普通维护；
- `release:` 正式版本发布。

示例：

```text
feat: add setlist-only print range
fix: restore scrolling after closing mobile overlays
docs: define develop branch workflow
ci: run tests before build and deploy
test: cover one-page setlist contents
release: v5.1.3
```

要求：

- 一次提交只处理一个清晰主题；
- 标题简洁、明确，使用祈使或结果描述；
- 不使用“update files”“misc changes”等无法审查的描述；
- 不把功能、重构、格式化和无关文档混成一个提交；
- 文档或 CI 小改动通常不需要提升应用版本，除非仓库所有者明确要求发布版本。

## 14. 必跑检查

首次安装或锁文件变化后：

```bash
npm ci
```

每次提交前：

```bash
npm run check
```

当前 `npm run check` 必须依次完成：

```text
lint → test → verify → build
```

调试时可以单独运行：

```bash
npm run lint
npm run test
npm run verify
npm run build
npm run preview
```

### 涉及打印、目录或分页时

还必须：

- 用浏览器构建 A4、A5、A4 对折；
- 检查 `overflowPages` 为空；
- 生成 PDF 并渲染为 PNG；
- 目视检查目录、页码、正文底部、长歌、多版本和对折首张印刷面；
- 对目录链接和 PDF 页面尺寸进行程序化检查；
- 使用短歌、长歌、双语歌和多版本歌进行回归；
- 确认 34 首、5 Part 目录在三种版式中的单页基准。

### 涉及移动端覆盖层时

还必须：

- 运行窄屏触控视口回归；
- 检查 `body` 与 `html` 的滚动锁最终已清除；
- 检查 backdrop 与 `modal-open` 没有残留；
- 发布前使用真实 iPhone / iPad Safari 冒烟测试。

### 仅文档或 Workflow 修改

仍应运行 `npm run check`，确认文档变更没有误删项目文件，Workflow 修改没有破坏现有构建假设。

## 15. CI/CD 不变量

- `develop` 的 push，以及目标为 `develop` 或 `main` 的 Pull Request，应运行持续集成。
- CI 必须先执行测试与项目验证，成功后才执行构建。
- `main` push 的 Pages 工作流必须按以下依赖顺序执行：

```text
测试与验证 → 构建 Pages → 部署
```

- 测试失败时不得上传 Pages artifact；构建失败时不得部署。
- GitHub Pages 部署权限保持最小化；只有部署 Job 拥有 `pages: write` 和 `id-token: write`。
- 不得为了让 CI 变绿而删除测试、降低隐私校验、跳过构建或使用无条件 `continue-on-error`。
- Workflow 修改后至少检查：
  - YAML 可解析；
  - 分支触发符合 `develop` / `main` 策略；
  - Job `needs` 关系正确；
  - Node 版本来自 `.nvmrc`；
  - `npm ci` 使用锁文件。

## 16. Pull Request 规范

- `feature/*`、`fix/*` 默认向 `develop` 提交 PR。
- 正式发布使用 `develop → main` PR。
- PR 必须说明：
  - 修改目的；
  - 用户可见变化；
  - 数据兼容影响；
  - 测试结果；
  - 打印或移动端专项结果；
  - 是否需要更新 Service Worker、Cloudflare 缓存或版本号。
- PR 中不得包含未预期删除、私人数据、`dist/` 或 `node_modules/`。
- 合并前必须等待必需状态检查通过。

## 17. 版本与发布

- 使用语义化版本号 `MAJOR.MINOR.PATCH`。
- 正式版本发布时同步检查：
  - `package.json`；
  - `package-lock.json`；
  - `CHANGELOG.md`；
  - 页面可见版本；
  - Service Worker 缓存版本；
  - `version.json` 构建输出；
  - `README.md` 的当前版本与网站说明；
  - 必要的升级与回滚文档。
- 正常发布流程：

```text
develop → Pull Request → main → 测试 → 构建 → GitHub Pages 部署
```

- 合并发布后，将 `main` 同步回 `develop`，确保两条长期分支继续共享最新发布提交。
- 可为正式版本创建 `vX.Y.Z` 标签；标签应指向已部署的 `main` 提交。
- 若 Cloudflare 或 Service Worker 显示旧资源，应先按部署文档清缓存，不通过修改随机文件强制刷新。

## 18. 发布与交付文件

- 源码包不得包含 `.git`、`node_modules`、`dist` 或私人歌词。
- 构建包只包含由当前源码重新生成的公开 `dist/`。
- 单文件 HTML 必须由当前构建脚本生成，不手工维护另一套代码。
- 最终交付压缩包使用 ASCII 文件名，并在生成后执行 ZIP 完整性检查。
- 对外发布包按任务需要包含：
  - 源码；
  - 构建成品；
  - 单文件 HTML；
  - 版本补丁；
  - 文档；
  - 公开测试证据；
  - 清单；
  - SHA-256。
- 私人 PDF、私人 JSON 和含歌词 HTML必须与公开交付包分离，并明确标记不可上传。
- 下载链接只能指向已经真实存在并完成校验的文件。

## 19. 完成定义

任务只有同时满足以下条件才算完成：

- 修改与用户要求一致，没有擅自扩大范围；
- 相关源码、测试和文档已同步；
- 向后兼容和私人数据边界未被破坏；
- `npm run check` 实际通过；
- 专项回归按变更类型完成；
- `git diff --cached` 中没有意外删除或私人数据；
- Commit 信息符合规范；
- CI/CD 依赖顺序未被削弱；
- 交付文件真实存在、可打开并经过完整性检查；
- 对未能验证的内容明确说明，不作无依据保证。
