# GitHub Pages 与 Cloudflare 部署指南

本文以推荐域名 `lyrics.iocky.com` 为例。也可以替换为 `gem.iocky.com` 或其他子域名。

## 一、准备 GitHub 仓库

### 1. 创建空仓库

建议仓库名：

```text
gem-lyricbook
```

不要勾选自动生成 README、`.gitignore` 或许可证，以免第一次推送冲突。

### 2. 在项目目录初始化并推送

```bash
git init
git branch -M main
git add .
git commit -m "feat: 初始化 G.E.M. 歌词本 v5.0.0"
git remote add origin https://github.com/<你的用户名>/gem-lyricbook.git
git push -u origin main
```

提交前确认没有真实歌词备份：

```bash
git status --short
```

## 二、启用 GitHub Pages

1. 打开仓库。
2. 进入 **Settings → Pages**。
3. 在 **Build and deployment** 中，把 **Source** 设置为 **GitHub Actions**。
4. 打开仓库的 **Actions** 标签。
5. 等待“部署到 GitHub Pages”工作流完成。

工作流会自动执行：

```text
npm ci
npm run check
npm run build
上传 dist/
部署到 github-pages 环境
```

首次部署后，默认地址通常是：

```text
https://<你的用户名>.github.io/gem-lyricbook/
```

## 三、先验证 iocky.com 域名所有权

这是安全步骤，建议在设置仓库自定义域名前完成。

1. 打开 GitHub 个人头像 → **Settings**。
2. 进入个人设置中的 **Pages**，不是仓库 Pages。
3. 点击 **Add a domain**。
4. 输入：

```text
iocky.com
```

5. GitHub 会显示需要添加的 TXT 记录，例如：

```text
类型：TXT
名称：_github-pages-challenge-你的用户名
内容：GitHub 给出的验证码
```

6. 在 Cloudflare DNS 中添加该 TXT 记录。
7. 等待解析后回到 GitHub 点击 **Verify**。
8. 验证成功后不要删除 TXT 记录。

## 四、在仓库设置自定义域名

1. 打开仓库 **Settings → Pages**。
2. 在 **Custom domain** 输入：

```text
lyrics.iocky.com
```

3. 点击 **Save**。

本项目使用自定义 GitHub Actions 工作流，因此不需要在仓库中提交真正的 `CNAME` 文件。`public/CNAME.example` 只是配置示例。

## 五、Cloudflare DNS 推荐配置

### 子域名方案：推荐

在 Cloudflare → iocky.com → DNS 中添加：

```text
类型：CNAME
名称：lyrics
目标：<你的用户名>.github.io
代理状态：DNS only（灰色云，初次配置）
TTL：Auto
```

注意：目标只写 `<你的用户名>.github.io`，不要在后面加仓库名。

先保持 **DNS only**，这样 GitHub 更容易完成域名校验和证书签发。

### 等待 GitHub HTTPS 可用

回到仓库 **Settings → Pages**：

1. 等待 DNS Check 成功；
2. 等待 **Enforce HTTPS** 可选；
3. 勾选 **Enforce HTTPS**；
4. 用浏览器访问 `https://lyrics.iocky.com`，确认 GitHub 证书和页面都正常。

DNS 和证书可能不是即时完成。不要在证书仍未签发时反复删除、重建所有记录。

## 六、可选：开启 Cloudflare 橙云代理

GitHub HTTPS 已经正常后，可以把 `lyrics` 的 CNAME 从灰云切换成 **Proxied（橙色云）**。

然后在 Cloudflare：

```text
SSL/TLS → Overview → Full (strict)
```

不要使用 Flexible。Full (strict) 会同时加密访客到 Cloudflare、Cloudflare 到 GitHub Pages 的连接，并校验源站证书。

初次上线不建议立即创建“Cache Everything”规则。GitHub Pages 本身是静态站，浏览器还会使用 Service Worker；过度缓存会增加新版发布后仍显示旧内容的概率。

## 七、根域名方案：可选

若需要直接使用：

```text
iocky.com
```

在 GitHub 仓库 Pages 中把 Custom domain 改为 `iocky.com`，然后在 Cloudflare 添加四条 A 记录：

```text
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
```

同时建议添加：

```text
CNAME  www  <你的用户名>.github.io
```

初次证书签发阶段同样先使用 DNS only。根域名会占用整个 iocky.com，若主域名还要托管其他网站，更适合继续使用 `lyrics.iocky.com`。

## 八、CAA 记录

只有你已经设置 CAA 时才需要处理。Cloudflare DNS 中若存在 CAA 限制，至少允许：

```text
letsencrypt.org
```

否则 GitHub Pages 可能无法签发 HTTPS 证书。

## 九、验证命令

macOS / Linux：

```bash
dig lyrics.iocky.com +short
dig _github-pages-challenge-<你的用户名>.iocky.com TXT +short
```

Windows PowerShell：

```powershell
Resolve-DnsName lyrics.iocky.com
Resolve-DnsName _github-pages-challenge-<你的用户名>.iocky.com -Type TXT
```

## 十、后续每次发布

```bash
npm run check
git add .
git commit -m "feat: 描述本次修改"
git push
```

推送到 `main` 后，Pages 工作流会自动部署。

建议的版本发布流程：

```bash
npm version patch --no-git-tag-version
# 更新 CHANGELOG.md
npm run check
git add .
git commit -m "release: v5.0.1"
git tag v5.0.1
git push origin main --tags
```

## 十一、常见问题

### Actions 成功，但 Pages 是 404

- 确认 Settings → Pages → Source 为 GitHub Actions；
- 确认部署工作流上传的是 `dist/`；
- 确认访问默认地址时保留仓库子路径；
- 确认没有手动提交旧 `dist/` 覆盖部署。

### 自定义域名显示 404

- 先在仓库 Pages 保存自定义域名，再设置 DNS；
- CNAME 目标必须是 `<用户名>.github.io`，不能带仓库名；
- 不要使用通配符 `*.iocky.com` 指向 GitHub Pages；
- 检查域名是否被另一个仓库占用。

### Enforce HTTPS 一直不可选

- 暂时关闭 Cloudflare 代理，保持 DNS only；
- 检查 DNS 是否正确；
- 检查 CAA 是否允许 `letsencrypt.org`；
- 等待解析与证书签发；
- 必要时在 GitHub Pages 中移除并重新添加自定义域名以重新触发检查。

### 开启橙云后出现 526

- GitHub Pages 源站证书尚未生效，先切回 DNS only；
- 确认 `https://lyrics.iocky.com` 在灰云状态下可正常访问；
- 再开启橙云并使用 Full (strict)。

### 发布后仍看到旧页面

1. Cloudflare → Caching → Purge Cache；
2. 浏览器强制刷新；
3. 浏览器开发者工具中注销旧 Service Worker；
4. 确认 `package.json` 版本已更新，构建会生成新的缓存名。
