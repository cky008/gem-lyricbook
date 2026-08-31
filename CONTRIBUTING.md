# 贡献指南

感谢参与 G.E.M. I AM GLORIA 多版本双语歌词本的维护。

- 在线网站：<https://gem.iocky.com>
- GitHub 仓库：<https://github.com/cky008/gem-lyricbook>

本项目是纯静态、本地优先的歌词管理与打印工具。公开仓库只保存曲目元数据和程序代码，不保存用户导入的完整歌词。

## 1. 开发原则

- 不提交完整歌词、个人备份、含歌词离线 HTML 或私人 PDF；
- 保持曲目 ID、备份格式和多版本结构向后兼容；
- 修改打印逻辑时同时测试 A4、A5 和 A4 对折；
- 新功能兼顾触屏、键盘、屏幕阅读器与移动端安全区域；
- 先测试、后构建；只有 `main` 可以自动部署正式网站；
- 不用部分目录覆盖完整 `.github/`、`src/` 或其他仓库目录；
- 提交前检查差异，不夹带无关文件和意外删除。

完整自动化代理约束见 [`AGENTS.md`](AGENTS.md)。

## 2. 环境准备

要求：

- Node.js 22 或更高版本；
- npm 10 或更高版本。

首次安装：

```bash
npm ci
```

启动开发服务器：

```bash
npm run dev
```

默认地址：

```text
http://localhost:4173
```

常用命令：

```bash
npm run lint      # JavaScript 语法检查
npm run test      # Node.js 原生单元测试
npm run verify    # 曲目、歌单、隐私与项目结构校验
npm run build     # 构建到 dist/
npm run preview   # 预览 dist/
npm run check     # lint → test → verify → build
```

## 3. 分支模型

项目使用两条长期分支：

- `main`：生产分支，只保存可以公开部署的稳定版本；
- `develop`：日常开发和集成分支。

### 小型和低风险修改

文档、小型 Bug、普通样式和低风险维护可以直接提交到 `develop`：

```bash
git switch develop
git pull --ff-only
git status --short
```

工作区应保持干净，再开始修改。

### 较大或高风险修改

从 `develop` 创建临时分支：

```bash
git switch develop
git pull --ff-only
git switch -c feature/short-description
```

普通复杂 Bug 使用：

```bash
git switch -c fix/short-description
```

完成后向 `develop` 创建 Pull Request。

### 正式发布

正式发布使用：

```text
develop → main
```

Pull Request。合并到 `main` 后，GitHub Actions 会重新执行测试、构建并部署 GitHub Pages。

### 线上紧急修复

从 `main` 创建：

```bash
git switch main
git pull --ff-only
git switch -c hotfix/short-description
```

修复先合回 `main`，再将 `main` 同步到 `develop`，防止修复在后续版本中丢失。

### 关于 `release/*`

`release/*` 是可选分支，只在需要冻结版本、集中验收或多人并行时使用。个人项目的普通发布通常直接使用 `develop → main`，不必每个小版本都建立 release 分支。

## 4. 安全地复制和替换文件

不要把一个不完整目录拖入仓库后选择“替换”。特别是 `.github/` 中除了 Workflow，还有 Issue 模板、Dependabot 和 PR 模板。

更新 Workflow 时应只复制明确文件：

```bash
cp /path/to/ci.yml .github/workflows/ci.yml
cp /path/to/deploy-pages.yml .github/workflows/deploy-pages.yml
```

不要执行：

```bash
cp -R /path/to/partial/.github .
```

修改后立即检查：

```bash
git status --short
git diff --name-status
```

任何未预期的 `D` 都应在提交前调查和恢复。

## 5. 修改与暂存

完成修改后先查看全部差异：

```bash
git status --short
git diff --name-status
git diff
```

小范围修改请明确暂存文件，不要直接使用 `git add .`：

```bash
git add AGENTS.md CONTRIBUTING.md
git add .github/pull_request_template.md
```

暂存后再次检查：

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached
```

确认没有：

- 意外删除；
- 私人歌词或备份；
- `dist/`；
- `node_modules/`；
- 临时 PDF、截图或测试输出；
- 与当前任务无关的大规模格式变化。

## 6. Commit 规范

采用 Conventional Commits 风格：

```text
feat: 新功能
fix: Bug 修复
docs: 文档
ci: CI/CD 与 GitHub Actions
test: 测试
refactor: 不改变行为的重构
perf: 性能改进
build: 构建系统
chore: 普通维护
release: 正式版本发布
```

示例：

```text
fix: restore scrolling after closing mobile overlays
ci: run tests before build and deploy
docs: define development and contribution workflow
release: v5.1.3
```

一次提交只包含一个清晰主题。避免使用 `update files`、`misc changes` 等无法审查的描述。

## 7. 提交前验证

所有提交至少运行：

```bash
npm ci
npm run check
```

正常结果应包含：

```text
lint → test → verify → build
```

全部通过。

### 打印、目录或分页修改

还需要：

- 生成 A4、A5、A4 对折；
- 检查没有 `overflowPages`；
- 生成 PDF 并渲染关键页为图片；
- 检查正文没有进入页码安全区；
- 检查长歌、短歌、双语和多版本歌曲；
- 检查目录内部链接；
- 检查 34 首、5 Part 主流程在三种版式中只占一个目录逻辑页；
- 检查对折首张纸正反面页序。

### 移动端与覆盖层修改

还需要：

- 测试窄屏触控视口；
- 测试侧栏和 Bootstrap Modal 交接；
- 确认关闭最后一个覆盖层后主页面能够滚动；
- 确认没有残留 backdrop、`modal-open` 或 `overflow: hidden`；
- 发布前使用真实 iPhone / iPad Safari 冒烟测试。

### 数据格式修改

还需要：

- 测试 v2、v3、v4 备份导入；
- 检查歌词、多版本、翻译、默认版本、收藏、熟悉标记和自定义歌单均保留；
- 更新 `docs/DATA_FORMAT.md`、测试和 `CHANGELOG.md`。

## 8. Pull Request

PR 应说明：

- 修改目的；
- 用户可见变化；
- 目标分支是否正确；
- 是否改变备份格式或曲目 ID；
- 执行过哪些测试；
- A4 / A5 / 对折或移动端专项结果；
- 是否需要更新版本、Service Worker 或 Cloudflare 缓存；
- 涉及界面或打印时附截图或 PDF 抽样。

分支目标：

- `feature/*`、`fix/*` → `develop`；
- `develop` → `main`；
- `hotfix/*` → `main`，随后同步回 `develop`。

推荐合并方式：

- 功能 / 修复 PR 到 `develop`：Squash merge；
- 发布 PR `develop → main`：Create a merge commit；
- 合并后删除已经完成的临时分支。

## 9. CI/CD

持续集成必须先完成：

```text
语法检查 → 单元测试 → 项目验证
```

然后才执行构建。

GitHub Pages 仅在 `main` 更新时部署，顺序必须为：

```text
发布前测试与验证 → 构建 Pages → 部署
```

不得通过删除测试、降低隐私检查、`continue-on-error` 或跳过构建来规避失败。

## 10. 版本发布

正式版本使用语义化版本号。发布前同步检查：

- `package.json`；
- `package-lock.json`；
- `CHANGELOG.md`；
- 页面可见版本；
- Service Worker 缓存版本；
- 构建后的 `version.json`；
- README 当前版本；
- 升级与回滚说明。

推荐流程：

```bash
git switch develop
git pull --ff-only
npm ci
npm run check
```

然后创建 `develop → main` PR。合并并成功部署后，可以创建版本标签：

```bash
git switch main
git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

## 11. 私人数据与版权

不得提交：

- `GEM歌词本备份_*.json`；
- `GEM歌词本_含歌词_*.html`；
- 私人歌词 PDF；
- 用户 `localStorage` 数据；
- 未经授权的完整歌词、封面、录音或演出影像。

提交代码即表示你有权提交该内容，并同意项目维护者按照仓库 `LICENSE` 管理该贡献。

Copyright © 2026 iocky.com
