import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));

async function copyTree(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyTree(from, to);
    else await fs.copyFile(from, to);
  }
}

async function walk(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, relative));
    else files.push(relative);
  }
  return files;
}

function escapeInlineScript(source) {
  return source.replace(/<\/script/gi, '<\\/script');
}

async function makeStandalone(indexHtml) {
  const bootstrapCss = await fs.readFile(path.join(root, 'vendor/bootstrap/bootstrap.min.css'), 'utf8');
  const appCss = await fs.readFile(path.join(root, 'src/styles/app.css'), 'utf8');
  const bootstrapJs = escapeInlineScript(await fs.readFile(path.join(root, 'vendor/bootstrap/bootstrap.bundle.min.js'), 'utf8'));
  const tocLayoutSource = await fs.readFile(path.join(root, 'src/print/toc-layout.js'), 'utf8');
  const tocLayoutJs = escapeInlineScript(tocLayoutSource.replace(/^export\s+/gm, ''));
  const appJs = escapeInlineScript(await fs.readFile(path.join(root, 'src/app.js'), 'utf8'));
  const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/songs.json'), 'utf8'));
  const setlists = JSON.parse(await fs.readFile(path.join(root, 'src/data/setlists.json'), 'utf8'));
  const icon = await fs.readFile(path.join(root, 'public/icons/icon.svg'), 'utf8');
  const iconData = `data:image/svg+xml,${encodeURIComponent(icon)}`;

  let html = indexHtml;
  html = html.replace(/<link href="\.\/vendor\/bootstrap\/bootstrap\.min\.css" rel="stylesheet"\/>\s*/i, () => `<style id="bootstrap-inline">${bootstrapCss.replace(/<\/style/gi, '<\\/style')}</style>\n`);
  html = html.replace(/<link href="\.\/src\/styles\/app\.css" rel="stylesheet"\/>\s*/i, () => `<style id="app-inline">${appCss.replace(/<\/style/gi, '<\\/style')}</style>\n`);
  html = html.replace(/<script src="\.\/vendor\/bootstrap\/bootstrap\.bundle\.min\.js"><\/script>\s*/i, () => `<script id="bootstrap-script">${bootstrapJs}</script>\n`);
  html = html.replace(/<script src="\.\/src\/main\.js" type="module"><\/script>\s*/i, () =>
    `<script id="gem-data">window.GEM_LYRICBOOK_DATA=${JSON.stringify(data).replace(/</g, '\\u003c')};window.GEM_LYRICBOOK_SETLISTS=${JSON.stringify(setlists).replace(/</g, '\\u003c')};</script>
` +
    `<script>window.GEM_SINGLE_FILE=true;window.GEM_BUILD_VERSION=${JSON.stringify(pkg.version)};</script>
` +
    `<script id="gem-app" type="module">${tocLayoutJs}
window.GEM_TOC_LAYOUT={TOC_LAYOUT_PROFILES,tocTextUnits,tocSongWeight,tocSectionWeight,tocHeaderWeight,tocGroupWeight,chooseTocLayout,paginateTocGroups,paginateMeasuredTocGroups};
${appJs}</script>
`);
  html = html.replace(/<link\b[^>]*rel="manifest"[^>]*>\s*/gi, '');
  html = html.replace(/<link\b[^>]*rel="apple-touch-icon"[^>]*>\s*/gi, '');
  html = html.replace('href="./icons/icon.svg"', () => `href="${iconData}"`);
  html = html.replace('<html ', '<html data-single-file="true" ');
  return html;
}

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await copyTree(path.join(root, 'src'), path.join(dist, 'src'));
await copyTree(path.join(root, 'vendor'), path.join(dist, 'vendor'));
await copyTree(path.join(root, 'public'), dist);

const indexHtml = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
await fs.writeFile(path.join(dist, '404.html'), indexHtml, 'utf8');
await fs.writeFile(path.join(dist, '.nojekyll'), '', 'utf8');
await fs.writeFile(path.join(dist, 'version.json'), `${JSON.stringify({
  version: pkg.version,
  builtAt: new Date().toISOString(),
  architecture: 'Bootstrap 5 + Native ES Modules + zero-dependency Node build',
  copyright: 'Copyright © 2026 iocky.com',
}, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(dist, 'GEM歌词本_单文件.html'), await makeStandalone(indexHtml), 'utf8');

const precache = (await walk(dist))
  .filter((name) => name !== 'sw.js' && name !== 'GEM歌词本_单文件.html')
  .map((name) => `./${name}`)
  .sort();
const sw = `/* Generated file. Copyright © 2026 iocky.com */\n` +
  `const CACHE_NAME=${JSON.stringify(`gem-lyricbook-v${pkg.version}`)};\n` +
  `const PRECACHE=${JSON.stringify(precache)};\n` +
  `self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));\n` +
  `self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));\n` +
  `self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;const html=event.request.mode==='navigate'||event.request.headers.get('accept')?.includes('text/html');if(html){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}))) });\n`;
await fs.writeFile(path.join(dist, 'sw.js'), sw, 'utf8');

console.log(`Built ${dist} (v${pkg.version})`);
