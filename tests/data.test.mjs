import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../src/data/songs.json', import.meta.url), 'utf8'));

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
