import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

test('打印界面默认提供页数上限策略', () => {
  assert.match(html, /id="printPagePolicy"/);
  assert.match(html, /单版本 1 页 \/ 多版本最多 2 页/);
  assert.match(app, /buildConstrainedSongPlan/);
  assert.match(app, /maxFittingFont/);
});

test('版权归属已写入界面与打印系统', () => {
  assert.match(html, /iocky\.com/);
  assert.match(app, /Copyright © 2026 iocky\.com/);
});
