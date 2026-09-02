import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  chooseTocLayout,
  paginateMeasuredTocGroups,
  paginateTocGroups,
  tocHeaderWeight,
} from '../src/print/toc-layout.js';

const songData = JSON.parse(readFileSync(new URL('../src/data/songs.json', import.meta.url), 'utf8'));
const setlistData = JSON.parse(readFileSync(new URL('../src/data/setlists.json', import.meta.url), 'utf8'));
const publicSongs = Array.isArray(songData) ? songData : songData.songs;
const songById = new Map(publicSongs.map((song) => [song.id, song]));

function publicSetlistGroup(id) {
  const preset = setlistData.presets.find((candidate) => candidate.id === id);
  assert.ok(preset, `missing public setlist ${id}`);
  return {
    title: preset.name,
    kicker: 'SETLIST CONTENTS',
    type: 'setlist',
    sections: preset.sections.map((section) => ({
      name: section.name,
      optional: Boolean(section.optional),
      kind: section.kind,
      songs: section.items.map((item) => songById.get(item.songId)).filter(Boolean),
    })),
  };
}

function batchSongIds(batch) {
  return batch.sections.flatMap((section) => section.songs.map((song) => song.id));
}

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

test('完整 72 首可选歌单在 A4、A5 与对折逻辑页先实测单页候选，不再切成 62 + 10', () => {
  const complete = publicSetlistGroup('builtin-shenzhen-composite-prediction-2026');
  for (const scenario of [
    { name: 'A4', targetSize: 'a4', expectedColumns: 2, expectedDensity: 'standard' },
    { name: 'A5', targetSize: 'a5', expectedColumns: 2, expectedDensity: 'compact' },
    { name: 'A4 对折逻辑页', targetSize: 'a5', expectedColumns: 2, expectedDensity: 'compact' },
  ]) {
    const attempts = [];
    const pages = paginateMeasuredTocGroups([complete], scenario.targetSize, (candidate) => {
      attempts.push({
        columns: candidate.columns,
        density: candidate.density,
        songs: batchSongIds(candidate).length,
      });
      return candidate.columns === scenario.expectedColumns && candidate.density === scenario.expectedDensity;
    });

    assert.ok(attempts.every((attempt) => attempt.songs === 72), `${scenario.name} 不应在完整候选实测前拆分`);
    assert.equal(pages.length, 1, `${scenario.name} 应保持单页`);
    assert.equal(batchSongIds(pages[0]).length, 72);
    assert.equal(new Set(batchSongIds(pages[0])).size, 72);
    assert.equal(pages[0].columns, scenario.expectedColumns);
    assert.equal(pages[0].density, scenario.expectedDensity);
    assert.doesNotMatch(pages[0].title, /续/u);
  }
});

test('所有完整页候选都失败后，二分选择每页最大安全歌曲前缀', () => {
  const largeSongs = Array.from({ length: 150 }, (_, index) => ({
    id: `measured-${String(index + 1).padStart(3, '0')}`,
    title: `合成目录歌曲 ${index + 1}`,
  }));
  const large = {
    ...group,
    title: '实测超大目录',
    sections: [{ name: '合成章节', optional: false, kind: 'main', songs: largeSongs }],
  };
  const pages = paginateMeasuredTocGroups(
    [large],
    'a4',
    (candidate) => batchSongIds(candidate).length <= 64,
  );

  assert.deepEqual(pages.map((page) => batchSongIds(page).length), [64, 64, 22]);
  assert.deepEqual(pages.flatMap(batchSongIds), largeSongs.map((song) => song.id));
  assert.equal(new Set(pages.flatMap(batchSongIds)).size, 150);
  assert.doesNotMatch(pages[0].title, /续/u);
  assert.match(pages[1].title, /续/u);
  assert.match(pages[1].sections[0].name, /续/u);
});

test('单条目录仍无法安全容纳时明确失败而不隐藏内容', () => {
  assert.throws(
    () => paginateMeasuredTocGroups([group], 'a5', () => false),
    /无法安全容纳/u,
  );
});
