# 贡献指南

感谢参与 G.E.M. I AM GLORIA 歌词本的维护。

## 开发原则

- 不把完整歌词、个人备份或含歌词离线 HTML 提交到仓库；
- 保持曲目 ID 稳定；
- 修改打印逻辑时必须同时测试 A4、A5 和 A4 对折；
- 多版本、翻译和歌单数据必须向后兼容；
- 所有可见文本优先使用中文，必要的技术名词可保留英文；
- 新功能应兼顾触屏、键盘和屏幕阅读器操作。

## 开发流程

```bash
npm ci
npm run dev
```

创建分支：

```bash
git checkout -b feat/功能名称
```

提交前运行：

```bash
npm run check
```

## Commit 建议

使用清晰的前缀：

```text
feat: 新功能
fix: 修复问题
refactor: 重构但不改变行为
test: 增加测试
docs: 修改文档
chore: 构建或维护工作
release: 发布版本
```

## Pull Request

PR 应说明：

- 修改目的；
- 用户可见变化；
- 是否改变备份格式；
- A4/A5/小册测试结果；
- 是否需要清理 Service Worker 或 Cloudflare 缓存。

## 版权

提交代码即表示你有权提交该内容，并同意项目维护者按照仓库 LICENSE 管理该贡献。不得提交未经授权的歌词全文、封面或演出影像。
