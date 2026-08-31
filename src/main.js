const dataUrl = new URL('./data/songs.json', import.meta.url);
const setlistsUrl = new URL('./data/setlists.json', import.meta.url);

const [dataResponse, setlistsResponse] = await Promise.all([
  fetch(dataUrl),
  fetch(setlistsUrl),
]);
if (!dataResponse.ok) throw new Error(`曲目数据加载失败：HTTP ${dataResponse.status}`);
if (!setlistsResponse.ok) throw new Error(`歌单数据加载失败：HTTP ${setlistsResponse.status}`);

window.GEM_LYRICBOOK_DATA = await dataResponse.json();
window.GEM_LYRICBOOK_SETLISTS = await setlistsResponse.json();
window.GEM_APP_VERSION = '5.1.1';

await import('./app.js');
