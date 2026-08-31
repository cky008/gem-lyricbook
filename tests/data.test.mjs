import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../src/data/songs.json', import.meta.url), 'utf8'));
const setlists = JSON.parse(await readFile(new URL('../src/data/setlists.json', import.meta.url), 'utf8'));

test('曲目数据结构完整且 ID 唯一', () => {
  assert.ok(Array.isArray(data.songs));
  assert.equal(data.songs.length, 90);
  assert.equal(new Set(data.songs.map((song) => song.id)).size, data.songs.length);
  assert.equal(new Set(data.songs.map((song) => song.title)).size, data.songs.length);
});

test('保留待官宣占位项与四图核对信息', () => {
  assert.ok(data.songs.some((song) => song.id === 'song-090' && song.title.includes('新歌彩蛋')));
  assert.ok(data.coverage && Object.keys(data.coverage).length >= 4);
});

test('内置预测歌单只引用公开曲目库中的有效 ID', () => {
  const songIds = new Set(data.songs.map((song) => song.id));
  assert.ok(Array.isArray(setlists.presets));
  assert.ok(setlists.presets.length >= 3);
  assert.ok(setlists.presets.some((preset) => preset.recommended));
  for (const preset of setlists.presets) {
    assert.ok(preset.id && preset.name);
    assert.ok(Array.isArray(preset.sections) && preset.sections.length > 0);
    for (const section of preset.sections) {
      assert.ok(section.name);
      for (const item of section.items || []) assert.ok(songIds.has(item.songId), `${preset.id} 引用了未知曲目 ${item.songId}`);
    }
  }
});
