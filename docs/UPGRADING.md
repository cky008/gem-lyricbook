# v5.1.3 升级、发布与回滚指南

本指南适用于已经发布 v5.1.2 的 `cky008/gem-lyricbook` 仓库。v5.1.3 只修改目录候选的最终测量与分页决策，不改变浏览器存储键、备份格式、曲目 ID 或私人歌词。

## 一、升级前备份

### 1. 备份网页中的私人数据

在当前网站中依次导出：

```text
批量导入／导出
→ 导出 JSON 备份
→ 导出含歌词的离线 HTML
```

源码升级不会主动删除浏览器数据，但 JSON 是跨设备、清缓存和回滚时最可靠的恢复文件。备份应保存在仓库外，不要把私人 JSON、含歌词 HTML 或私人 PDF 加入 Git。

### 2. 刷新本地分支

```bash
git fetch --all --prune --tags
git switch develop
git pull --ff-only origin develop
git status --short
```

开始发布准备前，工作区应为空。若 `develop` 与远端分叉，应先检查提交关系，不要 reset 或强制推送。

## 二、发布准备

v5.1.3 的正常发布路径是 `develop → main` Pull Request。所有源码、测试和版本准备都先提交到 `develop`，不得直接向 `main` 推送。

安装并执行完整检查：

```bash
npm ci
npm run check
```

打印目录修改还必须生成 A4、A5 和 A4 对折 PDF，并确认：

- 完整 72 首可选歌单分别使用 A4 双栏 `standard`、A5／对折双栏 `compact` 的单目录页；
- A4 与 A5 均为 74 页，对折为 38 个横向 A4 印刷面；
- 每种 PDF 都有 72 个目录链接、0 个断链；
- `overflowPages=[]`；
- PNG 目视检查没有裁切、稀疏续页或页脚碰撞。

提交前检查：

```bash
git status --short
git diff --name-status
git diff
git diff --cached --name-status
git diff --cached --check
```

只暂存本次发布涉及的明确文件。`dist/`、`artifacts/`、私人备份和 PDF／PNG 测试证据不得提交。

## 三、创建发布 Pull Request

将已验证的 `develop` 推送到远端后，在 GitHub 创建：

```text
base: main
compare: develop
title: release: G.E.M. LyricBook v5.1.3
```

PR 正文应记录用户可见变化、数据兼容、`npm run check` 结果、三种 PDF 的页数／尺寸／链接／溢出结果和关键 PNG。等待所有必需状态检查通过后再合并。

合并到 `main` 后，GitHub Pages 工作流会重新执行测试、构建并部署。不要在本地直接合并或直推 `main` 来绕过检查。

## 四、部署后验证

在 GitHub Actions 中确认“部署到 GitHub Pages”成功，然后检查：

1. 网站页眉显示 `v5.1.3`；
2. `/version.json` 返回 `5.1.3`；
3. `/sw.js` 的缓存名为 `gem-lyricbook-v5.1.3`；
4. 打印完整 72 首可选歌单时不出现“（续）”；
5. 目录歌名仍可跳转到对应歌曲第一页。

若 Pages 已成功但仍显示旧资源：

1. Cloudflare → Caching → Purge Cache；
2. 关闭并重新打开浏览器标签页；
3. 必要时注销旧 Service Worker 或清除该域名的网站数据；
4. 再次检查 `version.json` 与 `sw.js`。

不要长期对 HTML、`sw.js` 或 `version.json` 使用强制 Cache Everything。

## 五、功能核对

### 完整可选歌单目录

选择“深圳 2026 综合预测（推荐）”，打印范围选择“仅当前演出歌单”，并开启“包含歌单中的可选章节”：

- A4：2 栏 / `standard`，1 个目录页；
- A5：2 栏 / `compact`，1 个目录页；
- A4 对折：2 栏 / `compact`，1 个 A5 逻辑目录页；
- 三种版式都不出现“（续）”。

关闭可选章节后，固定流程和既有 34 首／5 Part 合成基准仍应保持单目录页。

### 私人歌词

导入升级前的 JSON 后检查：

- 已有歌词数量；
- 国语／粤语等多版本；
- 中文翻译；
- 默认版本；
- 收藏和已熟悉标记；
- 自定义歌单。

## 六、PDF 打印设置

### A4

```text
纸张：A4
方向：纵向
缩放：100%／实际尺寸
每张页数：1
```

### A5

```text
纸张：A5
方向：纵向
缩放：100%／实际尺寸
每张页数：1
```

### A4 对折小册

网页已经完成小册拼版，系统打印设置为：

```text
纸张：A4
方向：横向
双面打印：开启
翻转：短边翻转
缩放：100%／实际尺寸
每张页数：1
```

不要再次选择“每张 2 页”或打印机自带的 Booklet。打印后保持纸张顺序，整叠沿中线对折，再沿折线使用长臂订书机做骑马钉。

## 七、正常回滚

若 v5.1.3 上线后需要回滚，使用新的 hotfix 分支和 `git revert` 保留审计历史：

```bash
git fetch origin
git switch -c hotfix/revert-v5.1.3 origin/main
git revert -m 1 <v5.1.3-develop-to-main-merge-sha>
npm ci
npm run check
git push -u origin hotfix/revert-v5.1.3
```

随后创建 `hotfix/revert-v5.1.3 → main` Pull Request，等待检查通过后合并，再把更新后的 `main` 同步回 `develop`。

如果 v5.1.3 不是通过合并提交进入 `main`，对对应发布提交逐个执行普通 `git revert <sha>`，不要使用 `-m`。

不要使用 `git reset --hard`、force-push 或直接向 `main` 推送来回滚共享历史。网页私人数据通常仍保留在浏览器中；如已清除，重新导入升级前导出的 JSON。
