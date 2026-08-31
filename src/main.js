const dataUrl = new URL('./data/songs.json', import.meta.url);
const response = await fetch(dataUrl);
if (!response.ok) throw new Error(`曲目数据加载失败：HTTP ${response.status}`);

window.GEM_LYRICBOOK_DATA = await response.json();
window.GEM_APP_VERSION = '5.0.0';

await import('./app.js');
