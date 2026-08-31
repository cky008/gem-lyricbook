import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/songs.json'), 'utf8'));
const setlists = JSON.parse(await fs.readFile(path.join(root, 'src/data/setlists.json'), 'utf8'));
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const main = await fs.readFile(path.join(root, 'src/main.js'), 'utf8');
const app = await fs.readFile(path.join(root, 'src/app.js'), 'utf8');
const tocLayout = await fs.readFile(path.join(root, 'src/print/toc-layout.js'), 'utf8');

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

const presetIds = new Set();
for (const preset of setlists.presets || []) {
  if (!preset.id || presetIds.has(preset.id)) errors.push(`重复或缺失歌单 ID：${preset.id}`);
  presetIds.add(preset.id);
  if (!preset.name || !Array.isArray(preset.sections) || !preset.sections.length) {
    errors.push(`歌单结构不完整：${preset.id || preset.name || '未命名'}`);
    continue;
  }
  for (const section of preset.sections) {
    if (!section.name || !Array.isArray(section.items)) errors.push(`歌单章节结构不完整：${preset.id} / ${section.name || '未命名'}`);
    for (const item of section.items || []) {
      if (!item.songId || !ids.has(item.songId)) errors.push(`歌单引用未知曲目：${preset.id} / ${section.name} / ${item.songId}`);
    }
  }
}
if (![...(setlists.presets || [])].some((preset) => preset.recommended)) errors.push('内置歌单缺少 recommended 预设');

for (const requiredId of [
  'songList',
  'printRoot',
  'printPagePolicy',
  'printBuildButton',
  'printSetlistOptional',
  'bookletPreview',
  'exportHtml',
  'setlistModal',
]) {
  if (!html.includes(`id="${requiredId}"`)) errors.push(`index.html 缺少 #${requiredId}`);
}
for (const marker of [
  'buildConstrainedSongPlan',
  'maxFittingFont',
  'launchModalFromSidebar',
  'releaseStaleBodyLock',
  'stabilizeRenderedPrint',
  'tocGroupsForSongs',
  'Copyright © 2026 iocky.com',
]) {
  if (!app.includes(marker) && !html.includes(marker)) errors.push(`缺少关键标记：${marker}`);
}
if (!html.includes('value="setlist"')) errors.push('打印范围缺少“仅当前演出歌单”');
if (!app.includes('href="#print-song-')) errors.push('打印目录缺少内部跳转链接');
if (!tocLayout.includes('chooseTocLayout') || !tocLayout.includes('paginateTocGroups')) {
  errors.push('目录布局模块缺少自适应栏数或分页入口');
}
if (!tocLayout.includes("columns: 1, capacity: 50") || !tocLayout.includes("columns: 1, capacity: 48")) {
  errors.push('目录布局模块缺少 A4/A5 单栏单页基准');
}

if (!main.includes(`window.GEM_APP_VERSION = '${pkg.version}'`)) {
  errors.push('src/main.js 中的应用版本与 package.json 不一致');
}
if (!app.includes(`const APP_VERSION = '${pkg.version}'`)) {
  errors.push('src/app.js 中的应用版本与 package.json 不一致');
}
if (!main.includes('GEM_LYRICBOOK_SETLISTS')) errors.push('src/main.js 未加载内置歌单数据');

for (const requiredFile of [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-pages.yml',
  'docs/DEPLOYMENT.md',
  'docs/PRINTING.md',
  'docs/TOC_LAYOUT.md',
  'docs/DATA_FORMAT.md',
  'docs/SETLIST_PREDICTION.md',
  'docs/IOS_SCROLL_FIX.md',
  'src/data/setlists.json',
  'src/print/toc-layout.js',
  'examples/setlists/深圳站2026_预测歌单合集.json',
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
console.log(`Project verification passed: ${data.songs.length} metadata records, ${presetIds.size} setlist presets, no private lyric backup files.`);
