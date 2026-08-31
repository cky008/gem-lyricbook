# iOS 侧栏与模态框滚动锁修复

## 原问题

在窄屏 iOS 页面中按以下顺序操作：

1. 打开曲目侧栏；
2. 从侧栏打开“演出歌单／排序”；
3. 关闭侧栏与模态框；
4. 返回主界面。

某些情况下页面仍保留 `body.style.overflow = hidden`，导致主界面无法上下滚动。桌面端通常不会触发。

## 原因

移动侧栏和 Bootstrap Modal 都会锁定页面滚动。旧版在侧栏仍持有 `overflow: hidden` 时打开 Modal，Bootstrap 会把这个内联值记录为“打开前状态”，并在关闭 Modal 后恢复它，于是产生了过期滚动锁。

## v5.1.1 处理

- 从侧栏启动 Modal 时，在捕获阶段拦截点击；
- 先关闭侧栏并释放侧栏滚动锁；
- 下一帧再调用 Bootstrap Modal；
- `show.bs.modal` 再做一次防御性侧栏关闭；
- `hidden.bs.modal` 后经过双 `requestAnimationFrame` 清理残留的 `modal-open`、`overflow` 与 `padding-right`；
- 沉浸阅读与侧栏共用统一的滚动锁状态判断。

## 回归测试

使用 390 × 844、触控与 iPhone Safari User-Agent 的 Chromium 移动仿真，验证：

- 用户实际点击路径关闭后 `body.style.overflow` 为空；
- `modal-open` 已移除；
- 侧栏已关闭；
- 页面能够再次滚动；
- 即使绕过按钮直接调用 Bootstrap Modal，也能在关闭后恢复滚动；
- 控制台错误为 0。

这项测试验证的是与 iOS 触发条件相同的 DOM／Bootstrap 滚动锁流程。正式部署后仍建议在真实 Safari 上做一次手工冒烟测试。
