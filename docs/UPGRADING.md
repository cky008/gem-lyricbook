# v5.1.2 升级、发布与回滚指南

本指南适用于已经发布 v5.1.1 的 `cky008/gem-lyricbook` 仓库。

## 一、升级前备份

### 1. 备份网页中的私人数据

在当前网站中依次导出：

```text
批量导入／导出
→ 导出 JSON 备份
→ 导出含歌词的离线 HTML
```

源码升级不会主动删除浏览器数据，但 JSON 是跨设备、清缓存和回滚时最可靠的恢复文件。

### 2. 备份 Git 分支

```bash
git switch main
git pull --ff-only
git branch backup/v5.1.1
```

## 二、推荐升级方式：应用 Patch

把 `gem-lyricbook-v5.1.1-to-v5.1.2.patch` 放到仓库上一级目录：

```bash
cd gem-lyricbook
git switch -c release/v5.1.2

git apply --check ../gem-lyricbook-v5.1.1-to-v5.1.2.patch
git apply ../gem-lyricbook-v5.1.1-to-v5.1.2.patch

npm ci
npm run check
```

检查变更：

```bash
git status
git diff --stat
```

提交并推送：

```bash
git add -A
git commit -m "fix: release v5.1.2 adaptive print contents"
git push -u origin release/v5.1.2
```

在 GitHub 创建 Pull Request，检查 Actions 通过后合并到 `main`。

## 三、备选升级方式：覆盖源码 ZIP

1. 解压 `gem-lyricbook-v5.1.2-source.zip`；
2. 将解压后的项目文件覆盖到本地仓库根目录；
3. 不要删除本地仓库的 `.git/`；
4. 不要把私人 JSON、含歌词 HTML 或私人 PDF 放进仓库；
5. 执行：

```bash
npm ci
npm run check
git status
git add -A
git commit -m "fix: release v5.1.2 adaptive print contents"
git push origin main
```

## 四、GitHub Pages

仓库的 Actions 会执行：

```text
npm ci
npm run check
npm run build
上传 dist/
部署 GitHub Pages
```

在 GitHub 中确认：

```text
Settings → Pages → Source → GitHub Actions
```

合并到 `main` 后，到 **Actions** 查看“部署到 GitHub Pages”是否成功。

## 五、Cloudflare 与旧缓存

若 Actions 已成功但网站仍显示 v5.1.1：

1. Cloudflare → Caching → Purge Cache；
2. iPhone Safari 关闭网站标签页后重新打开；
3. 必要时清除该域名的网站数据；
4. 打开网站的 `version.json`，确认返回 `5.1.2`；
5. 确认 `sw.js` 中缓存名为 `gem-lyricbook-v5.1.2`。

不要长期对 HTML、`sw.js` 或 `version.json` 使用强制 Cache Everything。

## 六、升级后功能核对

### 目录

使用“深圳站预测图主流程（非官方）”，打印范围选择“仅当前演出歌单”，并关闭可选章节：

- A4：目录应为单栏、1 页；
- A5：目录应为单栏、1 个逻辑页；
- A4 对折：目录应只占 1 个 A5 半页；
- 不应出现“（续）”。

### iOS 滚动

在 iPhone 上测试：

```text
打开侧栏 → 演出歌单／排序 → 关闭排序界面
```

回到主界面后应能立即上下滚动。

### 私人歌词

导入原 JSON 后检查：

- 已有歌词数量；
- 国语／粤语等多版本；
- 中文翻译；
- 默认版本；
- 收藏和已熟悉标记；
- 自定义歌单。

## 七、生成 PDF

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

## 八、回滚

若需要回到 v5.1.1：

```bash
git switch main
git reset --hard backup/v5.1.1
git push --force-with-lease origin main
```

仅在确认没有其他人的新提交时才使用强制推送。更稳妥的方式是对 v5.1.2 提交执行 `git revert <commit>`，然后正常推送。

网页私人数据通常仍在浏览器中；如已清除，重新导入升级前导出的 JSON。
