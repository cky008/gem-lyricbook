import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/songs.json'), 'utf8'));
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const main = await fs.readFile(path.join(root, 'src/main.js'), 'utf8');
const app = await fs.readFile(path.join(root, 'src/app.js'), 'utf8');

const errors = [];
const ids = new Set();
const titles = new Set();
for (const song of data.songs || []) {
  if (!song.id || ids.has(song.id)) errors.push(`重复或缺失曲目 ID：${song.id}`);
  if (!song.title || titles.has(song.title)) errors.push(`重复或缺失曲名：${song.title}`);
  if (String(song.lyrics || '').trim()) errors.push(`公开曲目元数据意外包含歌词：${song.id} ${song.title}`);
  ids.add(song.id);
  titles.add(song.title);
}

for (const requiredId of ['songList', 'printRoot', 'printPagePolicy', 'printBuildButton', 'exportHtml', 'setlistModal']) {
  if (!html.includes(`id="${requiredId}"`)) errors.push(`index.html 缺少 #${requiredId}`);
}
for (const marker of ['buildConstrainedSongPlan', 'maxFittingFont', 'Copyright © 2026 iocky.com']) {
  if (!app.includes(marker) && !html.includes(marker)) errors.push(`缺少关键标记：${marker}`);
}

if (!main.includes(`window.GEM_APP_VERSION = '${pkg.version}'`)) {
  errors.push('src/main.js 中的应用版本与 package.json 不一致');
}
if (!app.includes(`const APP_VERSION = '${pkg.version}'`)) {
  errors.push('src/app.js 中的应用版本与 package.json 不一致');
}

for (const requiredFile of [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-pages.yml',
  'docs/DEPLOYMENT.md',
  'docs/PRINTING.md',
  'docs/DATA_FORMAT.md',
]) {
  try {
    await fs.access(path.join(root, requiredFile));
  } catch {
    errors.push(`缺少项目文件：${requiredFile}`);
  }
}

async function walk(directory, relative = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (['.git', 'node_modules', 'dist'].includes(entry.name)) continue;
    const rel = path.join(relative, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, rel));
    else files.push(rel);
  }
  return files;
}

const repositoryFiles = await walk(root);
const privateCandidates = repositoryFiles.filter((name) =>
  /(^|[/\\])private-data([/\\]|$)/u.test(name)
  || /GEM歌词本备份_.*\.json$/u.test(name)
  || /GEM歌词本_含歌词_.*\.html$/u.test(name));
if (privateCandidates.length) {
  errors.push(`仓库包含不应公开的歌词备份：${privateCandidates.join(', ')}`);
}

if (errors.length) {
  console.error(errors.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log(`Project verification passed: ${data.songs.length} metadata records, ${ids.size} unique IDs, no private lyric backup files.`);
