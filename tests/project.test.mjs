import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles/app.css', import.meta.url), 'utf8');

test('打印界面默认提供页数上限策略与仅歌单范围', () => {
  assert.match(html, /id="printPagePolicy"/);
  assert.match(html, /单版本 1 页 \/ 多版本最多 2 页/);
  assert.match(html, /name="printScope" type="radio" value="setlist"/);
  assert.match(html, /id="printSetlistOptional"/);
  assert.match(app, /buildConstrainedSongPlan/);
  assert.match(app, /maxFittingFont/);
});

test('打印目录支持歌单分节与 PDF 内部链接', () => {
  assert.match(app, /tocGroupsForSongs/);
  assert.match(app, /paginateTocGroups/);
  assert.match(app, /href="#print-song-/);
  assert.match(css, /\.print-toc-flow/);
  assert.match(css, /column-count:\s*3/);
});

test('单版本隐藏默认版标题，多版本仍可显示版本名', () => {
  assert.match(app, /storedContentVersionCount\s*>\s*1/);
  assert.match(app, /showVersionHeadings/);
});

test('iOS 侧栏与 Bootstrap 模态框使用统一滚动锁清理', () => {
  assert.match(app, /launchModalFromSidebar/);
  assert.match(app, /releaseStaleBodyLock/);
  assert.match(app, /show\.bs\.modal/);
  assert.match(app, /hidden\.bs\.modal/);
  assert.match(app, /stopImmediatePropagation/);
});

test('最终打印前进行真实页面安全区复检', () => {
  assert.match(app, /stabilizeRenderedPrint/);
  assert.match(app, /inspectRenderedPrint/);
  assert.match(app, /print-page-content/);
  assert.match(css, /padding:\s*14mm 15mm 15mm/);
});

test('版权归属已写入界面与打印系统', () => {
  assert.match(html, /iocky\.com/);
  assert.match(app, /Copyright © 2026 iocky\.com/);
});
