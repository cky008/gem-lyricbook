import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseTocLayout, paginateTocGroups, tocHeaderWeight } from '../src/print/toc-layout.js';

const songs = Array.from({ length: 34 }, (_, index) => ({
  id: `song-${index + 1}`,
  title: index === 32 ? 'G.E.M. (Get Everybody Moving)' : `测试歌曲 ${index + 1}`,
}));
const sectionSizes = [4, 6, 12, 7, 5];
let offset = 0;
const sections = sectionSizes.map((size, index) => {
  const section = { name: `Part ${index + 1}`, optional: false, kind: 'main', songs: songs.slice(offset, offset + size) };
  offset += size;
  return section;
});
const group = { title: '深圳站预测图主流程（非官方）', kicker: 'SETLIST CONTENTS', type: 'setlist', sections };

test('34 首五章节歌单在 A4 使用单栏单页', () => {
  const layout = chooseTocLayout(group, 'a4');
  const pages = paginateTocGroups([group], 'a4');
  assert.equal(layout.columns, 1);
  assert.equal(layout.density, 'roomy');
  assert.equal(pages.length, 1);
  assert.equal(pages[0].sections.flatMap((section) => section.songs).length, 34);
  assert.doesNotMatch(pages[0].title, /续/u);
});

test('34 首五章节歌单在 A5/对折逻辑页使用单栏单页', () => {
  const layout = chooseTocLayout(group, 'a5');
  const pages = paginateTocGroups([group], 'a5');
  assert.equal(layout.columns, 1);
  assert.equal(layout.density, 'roomy');
  assert.equal(pages.length, 1);
  assert.equal(pages[0].sections.flatMap((section) => section.songs).length, 34);
  assert.doesNotMatch(pages[0].title, /续/u);
});

test('超长目录才升级栏数或产生续页', () => {
  const largeSongs = Array.from({ length: 150 }, (_, index) => ({ id: `large-${index}`, title: `额外曲目 ${index + 1}` }));
  const large = { ...group, title: '超长目录', sections: [{ name: '全部曲目', songs: largeSongs }] };
  assert.ok(chooseTocLayout(large, 'a4').columns >= 2);
  assert.ok(paginateTocGroups([large], 'a4').length >= 2);
  assert.ok(paginateTocGroups([large], 'a5').length >= 2);
});


test('过长目录标题会计入容量，避免标题换行造成页脚裁切', () => {
  const longTitleGroup = { ...group, title: '当前演出歌单 · 深圳站预测图主流程（非官方）' };
  assert.ok(tocHeaderWeight(longTitleGroup, 'a4') > 0);
  assert.ok(chooseTocLayout(longTitleGroup, 'a4').columns >= 2);
});
