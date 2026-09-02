# G.E.M. I AM GLORIA 多版本双语歌词本

> 当前版本：**v5.1.3**

<p align="center">
  <a href="https://gem.iocky.com/"><strong>🌐 在线使用歌词本</strong></a>
  ·
  <a href="https://github.com/cky008/gem-lyricbook">查看 GitHub 仓库</a>
</p>

<p align="center">
  <a href="https://github.com/cky008/gem-lyricbook/actions/workflows/ci.yml"><img src="https://github.com/cky008/gem-lyricbook/actions/workflows/ci.yml/badge.svg?branch=develop" alt="持续集成"></a>
  <a href="https://github.com/cky008/gem-lyricbook/actions/workflows/deploy-pages.yml"><img src="https://github.com/cky008/gem-lyricbook/actions/workflows/deploy-pages.yml/badge.svg?branch=main" alt="GitHub Pages 部署"></a>
</p>

一个面向手机、平板、桌面浏览器与实体打印的本地优先歌词本。项目支持多版本歌词、外语原文与中文翻译、演唱会歌单排序，以及 A4、A5、A4 对折小册打印。

> **隐私与版权提示**  
> 公开仓库只包含曲目元数据、排版程序和空白歌词结构，不包含使用者导入的完整歌词。歌词、录音、封面和演出影像的版权归各自权利人所有。网页程序、界面设计、排版逻辑与项目文档 Copyright © 2026 iocky.com。

<p align="center">
  <img src="docs/images/desktop-preview.png" alt="桌面端预览" width="78%">
  <img src="docs/images/mobile-preview.png" alt="移动端预览" width="20%">
</p>

## 功能概览

- **多端阅读**：适配 iPhone、iPad、安卓手机、安卓平板与桌面浏览器，支持明暗主题和沉浸阅读。
- **本地优先**：歌词保存在浏览器本地，不上传服务器；支持 JSON 备份与含歌词的离线 HTML 导出。
- **多版本管理**：同一首歌可保存国语、粤语、英文、现场版、改词版等多个版本，并可设置默认版本。
- **双语歌词**：每个版本都可保存原文和翻译，支持左右对照、上下分区和逐行对应。
- **真实歌单排序**：内置深圳 2026 综合预测、固定骨架与点歌候选池；也可创建正式歌单或现场记录，并按 Part、Encore 和额外歌曲排序。
- **仅歌单导出**：打印范围可直接选择“仅当前演出歌单”，不受网页搜索和标签筛选影响；可选章节可一键包含或排除。
- **自适应打印**：支持 A4、A5 和 A4 对折小册；短歌自动放大字体，长歌自动合并短行、双栏排版并测量实际页面高度。
- **打印安全复检**：完整文档生成后再次检查正文、页码安全区与横向溢出，必要时小幅回退字号。
- **实测可点击目录**：目录依次尝试完整的单栏、双栏和紧凑候选，最终由真实打印 DOM 决定是否单页；只有完整候选都不安全时才生成续页，电子 PDF 中的歌名可跳转到歌曲第一页。
- **移动端滚动锁修复**：修复 iOS 窄屏从侧栏打开排序模态框后主页面无法继续滚动的问题。
- **严格页数策略**：默认尽量让单版本歌曲在 1 页内完成，多版本歌曲最多使用 2 页；如果一页能够容纳全部版本，会优先合并在一页。
- **可读性兜底**：极端长文本或非常长的双语版本可切换为“可读性优先”，允许自动续页，避免字体过小。
- **离线使用**：构建版本包含 Service Worker；另有完全单文件 HTML，可不依赖服务器直接打开。

## 技术栈

项目采用适合静态站点和长期维护的轻量架构：

- **Bootstrap 5.3.6**：响应式布局、模态框和基础交互组件，已本地化随仓库提供，不依赖 CDN。
- **原生 ES Modules**：业务逻辑使用现代浏览器模块，不绑定大型前端框架运行时。
- **Node.js 22**：零第三方构建依赖的静态构建、开发服务器、数据校验和测试。
- **GitHub Actions**：`develop` 负责持续集成，Pull Request 自动执行“测试 → 构建”；合并到 `main` 后再次测试、构建并发布到 GitHub Pages。
- **PWA 基础能力**：Web App Manifest、图标、离线缓存与可安装站点支持。

这套方案的目标是：仓库结构清晰、启动成本低、无供应链安装负担、能够继续拆分功能模块，并可在 GitHub Pages 上稳定托管。

## 目录结构

```text
.
├── .github/
│   ├── workflows/              # CI 与 GitHub Pages 自动部署
│   └── ISSUE_TEMPLATE/         # Issue 模板
├── docs/                       # 中文开发、部署、打印与数据文档
├── examples/                   # 不含真实歌词的示例数据
├── legacy/                     # 历史版本归档，只用于追溯
├── public/                     # PWA 图标、manifest、robots 等静态资源
├── scripts/                    # 构建、开发服务器和项目校验脚本
├── src/
│   ├── data/songs.json         # 公开曲目元数据，不含用户歌词
│   ├── data/setlists.json      # 内置预测歌单与候选池
│   ├── print/toc-layout.js     # 目录候选筛选与实测分页边界
│   ├── styles/app.css          # 应用与打印样式
│   ├── main.js                 # 数据加载入口
│   └── app.js                  # 阅读、编辑、导入导出、歌单和打印核心
├── tests/                      # Node.js 原生测试
├── vendor/bootstrap/           # 本地化 Bootstrap 编译文件
├── index.html                  # 应用页面结构
└── package.json
```

## 本地开发

### 环境要求

- Node.js 22 或更高版本
- npm 10 或更高版本

仓库没有 npm 运行时依赖，但仍建议使用 `npm ci` 验证锁文件并保持 CI 行为一致。

```bash
npm ci
npm run dev
```

默认地址：

```text
http://localhost:4173
```

### 常用命令

```bash
npm run dev       # 启动开发服务器
npm run check     # 语法检查、测试、数据校验和生产构建
npm run build     # 构建到 dist/
npm run preview   # 预览 dist/
```

## 构建产物

执行：

```bash
npm run build
```

会生成：

```text
dist/index.html                 # GitHub Pages / 静态托管入口
dist/GEM歌词本_单文件.html       # 完全离线的单文件版本
dist/sw.js                      # 由版本号生成的 Service Worker
dist/version.json               # 构建版本与时间信息
```

`dist/` 是自动生成目录，不提交到仓库；GitHub Actions 会在部署时重新构建。

## 导入自己的歌词备份

1. 打开网页，点击“导入我的歌词”。
2. 选择旧版或新版导出的 JSON。
3. 点击“读取并匹配”。
4. 导入完成后继续编辑，或导出新的 JSON 与含歌词离线 HTML。

当前版本兼容旧版 `gem-lyricbook-backup-v2`、`v3` 和多版本 `v4` 数据。旧的单文本歌词会自动转换为每首歌的默认版本。

> **不要把真实歌词备份提交到公开仓库。** `.gitignore` 已忽略 `GEM歌词本备份_*.json`、`GEM歌词本_含歌词_*.html` 和 `private-data/`，但提交前仍应自行检查 `git status`。

## 演出歌单、筛选与打印范围

- **歌单**决定哪些歌曲属于演出以及 Part / Encore 顺序；
- **筛选**只改变网页左侧临时显示；
- **打印范围**决定本次 PDF 输出当前歌曲、当前歌单、筛选结果或全部曲库。

推荐先选择“深圳 2026 综合预测（推荐）”，再在打印面板选择“仅当前演出歌单”。只需要固定流程时，关闭“包含歌单中的可选章节”；保留全部可选章节时，72 首目录会在真实页面中选择可安全容纳的完整单页版式。预测依据与黄色点歌区的处理见 [深圳站 2026 预测歌单说明](docs/SETLIST_PREDICTION.md)。

## 打印规则

默认“单版本 1 页 / 多版本最多 2 页”策略会：

1. 清理仅用于复制排版的多余空行，但不修改原始保存内容；
2. 将连续短句以 ` / ` 合并；
3. 必要时尝试双栏；
4. 在可用空间内二分搜索最大可用字号；
5. 多版本优先同页排放，只有放不下时才拆到第 2 页；
6. 使用浏览器实际测量值验证页面不会溢出或裁切。

详细说明见 [打印与 PDF 指南](docs/PRINTING.md)。

## 分支策略

项目采用适合个人持续开发的双主干方式：

- **`main`**：生产分支，只保存可以部署的稳定版本；合并后自动发布网站。
- **`develop`**：日常集成分支；小改动可以直接提交到这里，不必每次新建分支。
- **`feature/*`、`fix/*`**：仅在功能较大、风险较高或需要独立评审时，从 `develop` 临时创建，完成后再合回 `develop`。

推荐发布路径：

```text
日常开发 → develop → Pull Request → main → GitHub Pages
```

`develop` 的 push 和面向 `develop` / `main` 的 Pull Request 会运行持续集成。`main` 不承担日常开发，只有发布工作流可以在测试和构建全部通过后部署。

## GitHub Pages 自动部署

仓库已经包含：

```text
.github/workflows/deploy-pages.yml
```

在仓库的 **Settings → Pages → Source** 中选择 **GitHub Actions**。之后：

- 推送到 `develop`：先运行语法检查、单元测试和数据验证，全部通过后才执行构建验证；
- 提交 Pull Request 到 `develop` 或 `main`：执行同样的“测试 → 构建”检查；
- 合并到 `main`：发布工作流再次执行“测试 → 构建 → 部署”，只有前置步骤全部通过才会更新 GitHub Pages。

完整的 GitHub Pages、Cloudflare DNS、HTTPS、自定义域名与故障排查步骤见 [部署指南](docs/DEPLOYMENT.md)。

## 文档

- [架构与开发说明](docs/ARCHITECTURE.md)
- [打印与 PDF 指南](docs/PRINTING.md)
- [自适应目录设计](docs/TOC_LAYOUT.md)
- [打印目录排版回归测试计划](docs/TOC_LAYOUT_TEST_PLAN.md)
- [数据格式与迁移说明](docs/DATA_FORMAT.md)
- [v5.1.3 目录实测分页与 PDF 回归测试报告](docs/TEST_REPORT.md)
- [深圳站 2026 预测歌单说明](docs/SETLIST_PREDICTION.md)
- [iOS 侧栏与模态框滚动锁修复](docs/IOS_SCROLL_FIX.md)
- [GitHub Pages 与 Cloudflare 部署](docs/DEPLOYMENT.md)
- [v5.1.3 升级、发布与回滚](docs/UPGRADING.md)
- [自动化代理与维护约束](AGENTS.md)
- [贡献指南](CONTRIBUTING.md)
- [更新日志](CHANGELOG.md)
- [安全策略](SECURITY.md)
- [历史版本说明](legacy/README.md)

## 数据与隐私

- 默认保存位置：当前浏览器的 `localStorage`。
- 数据不会自动上传。
- 清除浏览器网站数据、换浏览器或换设备可能导致本地内容消失。
- 建议每次完成一批歌词后同时导出：
  - `GEM歌词本备份_多版本双语_日期.json`
  - `GEM歌词本_含歌词_多版本双语_日期.html`
- 公开部署的站点不会读取仓库之外的个人备份。

## 浏览器支持

建议使用近期版本的：

- Safari / iOS Safari
- Chrome / Android Chrome
- Edge
- Firefox

打印效果以 Chromium、Safari 和系统 PDF 打印引擎为主。不同打印机的“双面翻转”命名可能不同，A4 对折小册应先用少量页面测试。v5.1.3 新增完整 72 首可选歌单的真实 DOM 单页回归；正式发布后仍建议用真实 iPhone / iPad Safari 和实体打印机各做一次冒烟测试。

## 版本发布流程

1. 日常修改直接提交到 `develop`；较大功能才使用临时 `feature/*` 或 `fix/*` 分支。
2. 发布前更新 `package.json` 版本号和 `CHANGELOG.md`。
3. 本地执行 `npm run check`，然后推送 `develop`。
4. 确认持续集成中的“测试与项目验证”和“构建验证”全部通过。
5. 创建 `develop → main` Pull Request；合并后由 GitHub Actions 再次测试、构建并自动部署。
6. 可选：为正式版本创建 `vX.Y.Z` 标签。
7. 如使用 Cloudflare 代理且仍显示旧资源，清理 Cloudflare 缓存并刷新 Service Worker。

## 版权与许可

Copyright © 2026 iocky.com. All rights reserved.

本项目采用专有许可，详见 [LICENSE](LICENSE)。Bootstrap 等第三方组件继续适用各自的开源许可证，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。歌曲名称仅用于曲目整理与检索；歌词和音乐作品版权归其各自权利人所有。
