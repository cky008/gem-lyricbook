(() => {
  'use strict';

  const DATA = window.GEM_LYRICBOOK_DATA;
  if (!DATA || !Array.isArray(DATA.songs)) {
    document.body.innerHTML = '<main style="padding:2rem;font-family:sans-serif">曲目数据加载失败。</main>';
    return;
  }

  const APP_VERSION = '5.1.3';
  const COPYRIGHT_NOTICE = 'Copyright © 2026 iocky.com';
  const BASE_STORAGE_KEY = 'gem-iam-gloria-lyricbook-v2';
  const LEGACY_STORAGE_KEY = 'gem-iam-gloria-lyricbook-v1';
  const STORAGE_KEY = window.GEM_EMBEDDED_ID ? `${BASE_STORAGE_KEY}:${window.GEM_EMBEDDED_ID}` : BASE_STORAGE_KEY;
  const fontScales = [0.84, 0.92, 1, 1.12, 1.26];
  const SETLIST_DATA = window.GEM_LYRICBOOK_SETLISTS || {};
  const TOC_LAYOUT = window.GEM_TOC_LAYOUT;
  if (!TOC_LAYOUT?.paginateTocGroups || !TOC_LAYOUT?.paginateMeasuredTocGroups) {
    document.body.innerHTML = '<main style="padding:2rem;font-family:sans-serif">目录排版模块加载失败。</main>';
    return;
  }
  const { paginateMeasuredTocGroups, paginateTocGroups } = TOC_LAYOUT;
  const sourceShort = {
    image1: '44 首目录截图（43 首可见）',
    image2: '深圳演出报备曲库（85 项）',
    image3: '37 首巡演目录截图',
    image4: '深圳站返场预测图',
    web2026: '2026 现场核实补充',
  };
  const songs = DATA.songs.filter((song) => song.title !== '其他');
  const permitOther = DATA.songs.find((song) => song.title === '其他');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const elements = {
    html: document.documentElement,
    search: $('#searchInput'),
    filter: $('#filterSelect'),
    sort: $('#sortSelect'),
    fontRange: $('#fontRange'),
    songList: $('#songList'),
    resultCount: $('#resultCount'),
    sidebar: $('#songSidebar'),
    sidebarToggle: $('#sidebarToggle'),
    sidebarClose: $('#sidebarClose'),
    sidebarBackdrop: $('#sidebarBackdrop'),
    songNumber: $('#songNumber'),
    songTotal: $('#songTotal'),
    songKicker: $('#songKicker'),
    songTitle: $('#songTitle'),
    songAliases: $('#songAliases'),
    songTags: $('#songTags'),
    songNote: $('#songNote'),
    versionDeck: $('#versionDeck'),
    versionSummary: $('#versionSummary'),
    versionTabs: $('#versionTabs'),
    showAllVersionsButton: $('#showAllVersionsButton'),
    addVersionButton: $('#addVersionButton'),
    previewTab: $('#previewTab'),
    editTab: $('#editTab'),
    previewPanel: $('#previewPanel'),
    editPanel: $('#editPanel'),
    emptyState: $('#emptyState'),
    lyricPreview: $('#lyricPreview'),
    lyricEditor: $('#lyricEditor'),
    translationEditor: $('#translationEditor'),
    versionName: $('#versionName'),
    versionType: $('#versionType'),
    originalLabel: $('#originalLabel'),
    translationLabel: $('#translationLabel'),
    versionNote: $('#versionNote'),
    lineAligned: $('#lineAligned'),
    setDefaultVersion: $('#setDefaultVersion'),
    duplicateVersion: $('#duplicateVersion'),
    deleteVersion: $('#deleteVersion'),
    charCount: $('#charCount'),
    saveStatus: $('#saveStatus'),
    favoriteButton: $('#favoriteButton'),
    learnedButton: $('#learnedButton'),
    previousSong: $('#previousSong'),
    nextSong: $('#nextSong'),
    startEditing: $('#startEditing'),
    clearLyrics: $('#clearLyrics'),
    sourcePills: $('#sourcePills'),
    appleLink: $('#appleLink'),
    youtubeLink: $('#youtubeLink'),
    officialLink: $('#officialLink'),
    statSongs: $('#statSongs'),
    statCoverage: $('#statCoverage'),
    statFilled: $('#statFilled'),
    statVerified: $('#statVerified'),
    themeButton: $('#themeButton'),
    focusButton: $('#focusButton'),
    focusOverlay: $('#focusOverlay'),
    exitFocus: $('#exitFocus'),
    focusKicker: $('#focusKicker'),
    focusTitle: $('#focusTitle'),
    focusLyrics: $('#focusLyrics'),
    importFile: $('#importFile'),
    importButton: $('#importButton'),
    pasteImportButton: $('#pasteImportButton'),
    bulkPaste: $('#bulkPaste'),
    importResult: $('#importResult'),
    exportHtml: $('#exportHtml'),
    exportJson: $('#exportJson'),
    exportMarkdown: $('#exportMarkdown'),
    downloadTemplate: $('#downloadTemplate'),
    printBuildButton: $('#printBuildButton'),
    printRoot: $('#printRoot'),
    dynamicPrintStyle: $('#dynamicPrintStyle'),
    printCover: $('#printCover'),
    printToc: $('#printToc'),
    printEmpty: $('#printEmpty'),
    printNotes: $('#printNotes'),
    printCompact: $('#printCompact'),
    printPagePolicy: $('#printPagePolicy'),
    printVersions: $('#printVersions'),
    printLineFlow: $('#printLineFlow'),
    printColumns: $('#printColumns'),
    printBilingual: $('#printBilingual'),
    printSetlistOptional: $('#printSetlistOptional'),
    printEstimate: $('#printEstimate'),
    bookletPreview: $('#bookletPreview'),
    setlistSelect: $('#setlistSelect'),
    setlistName: $('#setlistName'),
    setlistStatus: $('#setlistStatus'),
    setlistEditor: $('#setlistEditor'),
    setlistStats: $('#setlistStats'),
    setlistResult: $('#setlistResult'),
    newSetlistButton: $('#newSetlistButton'),
    deleteSetlistButton: $('#deleteSetlistButton'),
    saveSetlistButton: $('#saveSetlistButton'),
    useSetlistSortButton: $('#useSetlistSortButton'),
    toastRegion: $('#toastRegion'),
  };

  function uid(prefix = 'id') {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function exactSongId(title) {
    return songs.find((song) => song.title === title)?.id || '';
  }

  function builtinSetlists() {
    const presets = Array.isArray(SETLIST_DATA.presets) ? SETLIST_DATA.presets : [];
    if (presets.length) return presets.map((setlist, index) => normalizeSetlist({ ...setlist, builtin: true }, index));

    const sections = [
      ['Part 1', ['摩天动物园', '灰狼', '来自天堂的魔鬼', '光年之外']],
      ['Part 2', ['差不多姑娘', '透明', '孤独', '冰河时代', '于是', '再见']],
      ['Part 3', ['你不是第一个离开的人', '睡公主', 'A.I.N.Y.', 'Where Did U Go', 'WHAT HAVE U DONE', '想讲你知', '你把我灌醉', '你不是真正的快乐', '龙卷风', '红蔷薇白玫瑰', '唯一', '句号']],
      ['Part 4', ['GLORIA', 'You Raise Me Up', '让世界暂停一分钟', '老人与海', '多远都要在一起', 'FIND YOU', '喜欢你']],
      ['Part 5', ['Kingdom Come', '夜的尽头', '倒数', '新的心跳', 'G.E.M. (Get Everybody Moving)', 'Walk On Water']],
      ['Encore', ['泡沫', '天空没有极限']],
    ].map(([name, titles]) => ({
      name,
      kind: name === 'Encore' ? 'encore-fixed' : 'main',
      optional: false,
      confidence: 'high',
      items: titles.map((title) => ({ raw: title, songId: exactSongId(title) })).filter((item) => item.songId),
    }));
    return [normalizeSetlist({
      id: 'builtin-shenzhen-preview-2026',
      name: '深圳站预测主流程（非官方）',
      status: 'predicted',
      builtin: true,
      recommended: true,
      sections,
      unmatched: [],
    })];
  }

  function createVersion(text = '', options = {}) {
    return {
      id: options.id || uid('version'),
      name: options.name || '默认版',
      type: options.type || 'default',
      originalLabel: options.originalLabel || '歌词',
      translationLabel: options.translationLabel || '中文翻译',
      original: String(text || '').replace(/\r\n?/g, '\n'),
      translation: String(options.translation || '').replace(/\r\n?/g, '\n'),
      note: options.note || '',
      lineAligned: Boolean(options.lineAligned),
    };
  }

  function normalizeVersion(version, fallbackName = '默认版') {
    if (typeof version === 'string') return createVersion(version, { name: fallbackName });
    const source = version && typeof version === 'object' ? version : {};
    return createVersion(source.original ?? source.text ?? source.lyrics ?? '', {
      id: source.id || uid('version'),
      name: source.name || fallbackName,
      type: source.type || 'default',
      originalLabel: source.originalLabel || source.primaryLabel || source.sourceLabel || '歌词',
      translationLabel: source.translationLabel || '中文翻译',
      translation: source.translation || '',
      note: source.note || '',
      lineAligned: source.lineAligned,
    });
  }

  function normalizeLibraryEntry(entry, legacyText = '') {
    const source = entry && typeof entry === 'object' ? entry : {};
    let rawVersions = Array.isArray(source.versions) ? source.versions : (Array.isArray(entry) ? entry : []);
    let versions = rawVersions.map((version, index) => normalizeVersion(version, index ? `版本 ${index + 1}` : '默认版'));
    if (!versions.length && String(legacyText || '').trim()) {
      versions = [createVersion(legacyText, { id: 'legacy-default', name: '默认版' })];
    }
    if (!versions.length) versions = [createVersion('', { name: '默认版' })];
    let defaultVersionId = source.defaultVersionId || versions.find((version) => version.isDefault)?.id;
    if (!versions.some((version) => version.id === defaultVersionId)) defaultVersionId = versions[0].id;
    let selectedVersionId = source.selectedVersionId || source.activeVersionId;
    if (!versions.some((version) => version.id === selectedVersionId)) selectedVersionId = defaultVersionId;
    return { versions, defaultVersionId, selectedVersionId };
  }

  function normalizeSetlist(setlist, index = 0) {
    const source = setlist && typeof setlist === 'object' ? setlist : {};
    const sections = Array.isArray(source.sections) ? source.sections.map((section, sectionIndex) => ({
      name: String(section?.name || `Part ${sectionIndex + 1}`),
      kind: String(section?.kind || 'main'),
      optional: Boolean(section?.optional),
      confidence: ['high', 'medium', 'low'].includes(section?.confidence) ? section.confidence : '',
      description: String(section?.description || ''),
      items: Array.isArray(section?.items) ? section.items.map((item) => ({
        raw: String(item?.raw || item?.title || ''),
        songId: String(item?.songId || ''),
      })).filter((item) => item.raw || item.songId) : [],
    })) : [];
    return {
      id: source.id || uid('setlist'),
      name: source.name || `自定义歌单 ${index + 1}`,
      status: ['official', 'observed', 'predicted', 'draft'].includes(source.status) ? source.status : 'draft',
      builtin: Boolean(source.builtin),
      recommended: Boolean(source.recommended),
      description: String(source.description || ''),
      predictionBasis: Array.isArray(source.predictionBasis) ? source.predictionBasis.map(String) : [],
      sections,
      unmatched: Array.isArray(source.unmatched) ? source.unmatched.map(String) : [],
    };
  }

  function convertLegacyVersions(parsed) {
    const library = {};
    if (parsed?.lyricLibrary && typeof parsed.lyricLibrary === 'object') {
      Object.entries(parsed.lyricLibrary).forEach(([songId, entry]) => { library[songId] = normalizeLibraryEntry(entry, parsed.lyrics?.[songId] || ''); });
    }
    if (parsed?.versions && typeof parsed.versions === 'object') {
      Object.entries(parsed.versions).forEach(([songId, versions]) => {
        if (library[songId]) return;
        const selectedVersionId = parsed.activeVersions?.[songId] || '';
        const defaultVersionId = Array.isArray(versions) ? (versions.find((version) => version?.isDefault)?.id || versions[0]?.id) : '';
        library[songId] = normalizeLibraryEntry({ versions, selectedVersionId, defaultVersionId }, parsed.lyrics?.[songId] || '');
      });
    }
    Object.entries(parsed?.lyrics || {}).forEach(([songId, text]) => {
      if (!library[songId]) library[songId] = normalizeLibraryEntry(null, text);
    });
    return library;
  }

  function defaultState() {
    const setlists = builtinSetlists();
    return {
      selectedId: songs[0]?.id || '',
      lyrics: {},
      lyricLibrary: {},
      favorites: [],
      learned: [],
      setlists,
      activeSetlistId: setlists[0]?.id || '',
      showAllVersions: false,
      theme: 'light',
      fontLevel: 2,
      viewMode: 'preview',
      search: '',
      filter: 'all',
      sort: 'setlist',
    };
  }

  function normalizeState(parsed, fallback) {
    if (!parsed || typeof parsed !== 'object') return fallback;
    const legacyLyrics = parsed.lyrics && typeof parsed.lyrics === 'object' ? parsed.lyrics : {};
    const lyricLibrary = convertLegacyVersions(parsed);
    const builtins = builtinSetlists();
    const custom = Array.isArray(parsed.setlists) ? parsed.setlists.map(normalizeSetlist) : [];
    const setlists = [...builtins];
    custom.forEach((setlist) => {
      const existing = setlists.findIndex((item) => item.id === setlist.id);
      if (existing >= 0) setlists[existing] = { ...setlists[existing], ...setlist };
      else setlists.push(setlist);
    });
    const activeSetlistId = setlists.some((item) => item.id === parsed.activeSetlistId)
      ? parsed.activeSetlistId
      : (setlists[0]?.id || '');
    return {
      ...fallback,
      ...parsed,
      lyrics: legacyLyrics,
      lyricLibrary,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((id) => songs.some((song) => song.id === id)) : [],
      learned: Array.isArray(parsed.learned) ? parsed.learned.filter((id) => songs.some((song) => song.id === id)) : [],
      setlists,
      activeSetlistId,
      showAllVersions: Boolean(parsed.showAllVersions),
    };
  }

  function readStoredState(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn(`Cannot read lyricbook state: ${key}`, error);
      return null;
    }
  }

  function loadState() {
    const fallback = defaultState();
    const stored = readStoredState(STORAGE_KEY);
    if (stored) return normalizeState(stored, fallback);

    // A downloaded “含歌词离线 HTML” carries an embedded snapshot. It becomes
    // the initial state only until this particular copy is edited and saved.
    if (window.GEM_EMBEDDED_STATE && typeof window.GEM_EMBEDDED_STATE === 'object') {
      return normalizeState(window.GEM_EMBEDDED_STATE, fallback);
    }

    // Seamlessly carry over lyrics entered in the first edition.
    if (!window.GEM_EMBEDDED_ID) {
      const legacy = readStoredState(LEGACY_STORAGE_KEY);
      if (legacy) return normalizeState(legacy, fallback);
    }
    return fallback;
  }

  let state = loadState();
  let filteredSongs = [];
  let saveTimer = null;

  function libraryFor(song, create = true) {
    if (!song) return null;
    const existing = state.lyricLibrary?.[song.id];
    if (existing) {
      // Keep the same object reference during an editing action. Rebuilding a
      // fresh object on every accessor call made operations such as “设为默认”
      // update a stale copy instead of the state that would later be exported.
      const valid = Array.isArray(existing.versions)
        && existing.versions.length > 0
        && existing.versions.every((version) => version && typeof version === 'object' && version.id);
      if (valid) {
        if (!existing.versions.some((version) => version.id === existing.defaultVersionId)) existing.defaultVersionId = existing.versions[0].id;
        if (!existing.versions.some((version) => version.id === existing.selectedVersionId)) existing.selectedVersionId = existing.defaultVersionId;
        return existing;
      }
      const normalized = normalizeLibraryEntry(existing, state.lyrics?.[song.id] || '');
      state.lyricLibrary[song.id] = normalized;
      return normalized;
    }
    const legacy = state.lyrics?.[song.id] || '';
    if (!create && !String(legacy).trim()) return null;
    const entry = normalizeLibraryEntry(null, legacy);
    state.lyricLibrary[song.id] = entry;
    return entry;
  }

  function versionsFor(song, create = true) {
    return libraryFor(song, create)?.versions || [];
  }

  function selectedVersion(song, create = true) {
    const library = libraryFor(song, create);
    if (!library) return null;
    return library.versions.find((version) => version.id === library.selectedVersionId)
      || library.versions.find((version) => version.id === library.defaultVersionId)
      || library.versions[0];
  }

  function defaultLyricVersion(song, create = true) {
    const library = libraryFor(song, create);
    if (!library) return null;
    return library.versions.find((version) => version.id === library.defaultVersionId) || library.versions[0];
  }

  function versionHasContent(version) {
    return Boolean(String(version?.original || '').trim() || String(version?.translation || '').trim());
  }

  function syncLegacyLyrics() {
    const legacy = {};
    Object.entries(state.lyricLibrary || {}).forEach(([songId, entry]) => {
      const normalized = normalizeLibraryEntry(entry, '');
      state.lyricLibrary[songId] = normalized;
      const version = normalized.versions.find((item) => item.id === normalized.defaultVersionId) || normalized.versions[0];
      if (String(version?.original || '').trim()) legacy[songId] = version.original;
    });
    state.lyrics = legacy;
  }

  function saveState(message = '已保存到本机') {
    try {
      syncLegacyLyrics();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (message) {
        elements.saveStatus.textContent = message;
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
          elements.saveStatus.textContent = '仅保存在本机';
        }, 1400);
      }
    } catch (error) {
      console.warn('Cannot save lyricbook state', error);
      elements.saveStatus.textContent = '本机存储不可用';
    }
  }

  function currentSong() {
    return songs.find((song) => song.id === state.selectedId) || songs[0];
  }

  function lyricFor(song) {
    return String(defaultLyricVersion(song, false)?.original || '').trim();
  }

  function hasLyrics(song) {
    return versionsFor(song, false).some(versionHasContent);
  }

  function isFavorite(song) {
    return state.favorites.includes(song.id);
  }

  function isLearned(song) {
    return state.learned.includes(song.id);
  }

  function versionTypeLabel(type) {
    return ({ default: '默认 / 录音室', mandarin: '国语版', cantonese: '粤语版', english: '英语版', live: '现场版', acoustic: '不插电 / 弹唱', translation: '翻译对照版', other: '其他' })[type] || '其他';
  }

  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .replace(/[\s._·•'’“”"()（）\-—–/:：]/g, '');
  }

  function searchHaystack(song) {
    const versionNames = versionsFor(song, false).flatMap((version) => [version.name, version.originalLabel, version.translationLabel, version.note]);
    return normalizeSearch([song.title, ...(song.aliases || []), ...(song.tags || []), ...versionNames].join(' '));
  }

  function songMatchesFilter(song, filter) {
    switch (filter) {
      case 'setlist-core': return setlistSongIds(activeSetlist(), false).includes(song.id);
      case 'setlist-all': return setlistSongIds(activeSetlist(), true).includes(song.id);
      case 'setlist-request': return songInSetlistKinds(song, ['request', 'medley', 'surprise']);
      case 'setlist-rotation': return songInSetlistKinds(song, ['encore-rotation']);
      case '2026-main': return song.tags.includes('2026主歌单');
      case '2026-encore': return song.tags.includes('2026返场');
      case '2026-medley': return song.tags.includes('2026特别串烧');
      case 'live-extra': return song.tags.some((tag) => tag.includes('2026台北点歌') || tag.includes('2026台北特别片段'));
      case 'pending': return song.tags.some((tag) => tag.includes('待核实') || tag.includes('报批新增') || tag.includes('待官宣') || tag.includes('非正式曲名'));
      case 'filled': return hasLyrics(song);
      case 'empty': return !hasLyrics(song);
      case 'favorite': return isFavorite(song);
      case 'learned': return isLearned(song);
      case 'image1':
      case 'image2':
      case 'image3':
      case 'image4': return song.sources.includes(filter);
      default: return true;
    }
  }

  function statusRank(song) {
    if (song.tags.includes('2026主歌单')) return 0;
    if (song.tags.includes('2026特别串烧')) return 1;
    if (song.tags.some((tag) => tag.includes('2026台北点歌') || tag.includes('2026台北特别片段'))) return 2;
    if (song.tags.includes('2026返场')) return 3;
    if (song.tags.some((tag) => tag.includes('报批新增') || tag.includes('待官宣') || tag.includes('非正式曲名'))) return 4;
    return 5;
  }

  function activeSetlist() {
    return state.setlists.find((setlist) => setlist.id === state.activeSetlistId) || state.setlists[0] || null;
  }

  function setlistSections(setlist = activeSetlist(), includeOptional = true) {
    if (!setlist || !Array.isArray(setlist.sections)) return [];
    return setlist.sections.filter((section) => includeOptional || !section.optional);
  }

  function setlistSongIds(setlist = activeSetlist(), includeOptional = true) {
    const seen = new Set();
    const ids = [];
    setlistSections(setlist, includeOptional).forEach((section) => {
      section.items.forEach((item) => {
        if (!item.songId || seen.has(item.songId)) return;
        seen.add(item.songId);
        ids.push(item.songId);
      });
    });
    return ids;
  }

  function songInSetlistKinds(song, kinds) {
    const wanted = new Set(kinds);
    return setlistSections(activeSetlist(), true).some((section) =>
      wanted.has(section.kind) && section.items.some((item) => item.songId === song.id));
  }

  function setlistInfo(song) {
    const setlist = activeSetlist();
    if (!setlist) return null;
    for (let sectionIndex = 0; sectionIndex < setlist.sections.length; sectionIndex += 1) {
      const section = setlist.sections[sectionIndex];
      const itemIndex = section.items.findIndex((item) => item.songId === song.id);
      if (itemIndex >= 0) return { setlist, section, sectionIndex, itemIndex };
    }
    return null;
  }

  function setlistStatusLabel(status) {
    return ({ official: '正式 / 已核实', observed: '现场记录', predicted: '预测 / 待核实', draft: '自定义草稿' })[status] || '自定义草稿';
  }

  function setlistSortKey(song) {
    const info = setlistInfo(song);
    if (info) return [0, info.sectionIndex, info.itemIndex, 0];
    if (song.tags.includes('2026返场')) return [1, statusRank(song), 0, Number(song.id.replace(/\D/g, ''))];
    return [2, statusRank(song), 0, Number(song.id.replace(/\D/g, ''))];
  }

  function compareKeys(left, right) {
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      const a = left[index] ?? 0;
      const b = right[index] ?? 0;
      if (a < b) return -1;
      if (a > b) return 1;
    }
    return 0;
  }

  function getFilteredSongs() {
    const query = normalizeSearch(state.search);
    const result = songs.filter((song) => {
      if (!songMatchesFilter(song, state.filter)) return false;
      if (query && !searchHaystack(song).includes(query)) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (state.sort === 'title') return a.title.localeCompare(b.title, 'zh-Hans-CN', { numeric: true, sensitivity: 'base' });
      if (state.sort === 'status') return statusRank(a) - statusRank(b) || a.title.localeCompare(b.title, 'zh-Hans-CN');
      if (state.sort === 'progress') return Number(hasLyrics(b)) - Number(hasLyrics(a)) || versionsFor(b, false).filter(versionHasContent).length - versionsFor(a, false).filter(versionHasContent).length || a.title.localeCompare(b.title, 'zh-Hans-CN');
      if (state.sort === 'setlist') return compareKeys(setlistSortKey(a), setlistSortKey(b));
      return Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, ''));
    });
  }

  function descriptiveStatus(song) {
    if (song.tags.includes('2026主歌单')) return '2026 主歌单';
    if (song.tags.includes('2026特别串烧')) return '2026 特别串烧';
    if (song.tags.some((tag) => tag.includes('2026台北点歌'))) return '2026 台北点歌补充';
    if (song.tags.some((tag) => tag.includes('2026台北特别片段'))) return '2026 台北现场片段';
    if (song.tags.includes('2026返场')) return '2026 返场';
    if (song.tags.some((tag) => tag.includes('待官宣') || tag.includes('非正式曲名'))) return '待官宣占位';
    if (song.tags.some((tag) => tag.includes('报批新增'))) return '2026 报批新增';
    return song.sources.map((source) => sourceShort[source] || source).join(' · ');
  }

  function renderList() {
    filteredSongs = getFilteredSongs();
    elements.resultCount.textContent = `${filteredSongs.length} 首`;
    elements.songList.replaceChildren();

    if (!filteredSongs.length) {
      const empty = document.createElement('div');
      empty.className = 'sidebar-empty';
      empty.innerHTML = '<b>没有匹配曲目</b><br><small>换一个关键词或筛选条件试试。</small>';
      elements.songList.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    filteredSongs.forEach((song, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `song-list-item${song.id === state.selectedId ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', song.id === state.selectedId ? 'true' : 'false');
      button.dataset.songId = song.id;

      const number = document.createElement('span');
      number.className = 'song-list-number';
      number.textContent = String(index + 1).padStart(2, '0');

      const copy = document.createElement('span');
      copy.className = 'song-list-copy';
      const title = document.createElement('b');
      title.textContent = song.title;
      const meta = document.createElement('small');
      const info = setlistInfo(song);
      const versionCount = versionsFor(song, false).filter(versionHasContent).length;
      meta.textContent = `${info ? `${info.section.name} · ` : ''}${descriptiveStatus(song)}${versionCount > 1 ? ` · ${versionCount} 个版本` : ''}`;
      copy.append(title, meta);

      const status = document.createElement('span');
      status.className = 'song-list-status';
      if (isFavorite(song)) {
        const star = document.createElement('span');
        star.className = 'mini-star';
        star.textContent = '★';
        star.title = '已收藏';
        status.appendChild(star);
      }
      const dot = document.createElement('span');
      dot.className = `mini-dot${hasLyrics(song) ? ' filled' : ''}`;
      dot.title = hasLyrics(song) ? '已导入歌词' : '尚未导入歌词';
      status.appendChild(dot);

      button.append(number, copy, status);
      button.addEventListener('click', () => selectSong(song.id));
      fragment.appendChild(button);
    });
    elements.songList.appendChild(fragment);
  }

  function appendStanzas(container, text) {
    const stanzas = String(text || '').trim().split(/\n\s*\n/).filter(Boolean);
    stanzas.forEach((stanza) => {
      const div = document.createElement('div');
      div.className = 'stanza';
      div.textContent = stanza.trim();
      container.appendChild(div);
    });
  }

  function renderVersionSection(version, showHeading = true) {
    const section = document.createElement('section');
    section.className = 'version-preview-section';
    if (showHeading) {
      const heading = document.createElement('div');
      heading.className = 'version-preview-heading';
      const title = document.createElement('h3');
      title.textContent = version.name || '默认版';
      const meta = document.createElement('small');
      meta.textContent = versionTypeLabel(version.type);
      heading.append(title, meta);
      section.appendChild(heading);
    }
    if (version.note) {
      const note = document.createElement('div');
      note.className = 'version-preview-note';
      note.textContent = version.note;
      section.appendChild(note);
    }

    const original = String(version.original || '').trim();
    const translation = String(version.translation || '').trim();
    if (translation) {
      const grid = document.createElement('div');
      grid.className = 'lyric-bilingual-grid';
      const originalPanel = document.createElement('section');
      const originalLabel = document.createElement('div');
      originalLabel.className = 'lyric-language-label';
      originalLabel.textContent = version.originalLabel || '歌词';
      const originalCopy = document.createElement('div');
      originalCopy.className = 'lyric-copy';
      appendStanzas(originalCopy, original);
      originalPanel.append(originalLabel, originalCopy);

      const translationPanel = document.createElement('section');
      const translationLabel = document.createElement('div');
      translationLabel.className = 'lyric-language-label';
      translationLabel.textContent = version.translationLabel || '中文翻译';
      const translationCopy = document.createElement('div');
      translationCopy.className = 'lyric-copy';
      appendStanzas(translationCopy, translation);
      translationPanel.append(translationLabel, translationCopy);
      grid.append(originalPanel, translationPanel);
      section.appendChild(grid);
    } else {
      const copy = document.createElement('div');
      copy.className = 'lyric-copy';
      appendStanzas(copy, original);
      section.appendChild(copy);
    }
    return section;
  }

  function renderPreview(song) {
    elements.lyricPreview.replaceChildren();
    const versions = versionsFor(song).filter(versionHasContent);
    const active = selectedVersion(song);
    const shown = state.showAllVersions ? versions : (active && versionHasContent(active) ? [active] : []);
    elements.lyricPreview.classList.toggle('version-preview-stack', shown.length > 1);
    shown.forEach((version) => elements.lyricPreview.appendChild(renderVersionSection(version, state.showAllVersions || versions.length > 1 || version.name !== '默认版')));
  }

  function renderVersionTabs(song) {
    const library = libraryFor(song);
    const active = selectedVersion(song);
    elements.versionTabs.replaceChildren();
    library.versions.forEach((version) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `version-tab${version.id === active.id ? ' active' : ''}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(version.id === active.id));
      button.dataset.versionId = version.id;
      const text = document.createElement('span');
      text.textContent = version.name || '未命名版本';
      button.appendChild(text);
      if (version.id === library.defaultVersionId) {
        const badge = document.createElement('span');
        badge.className = 'default-badge';
        badge.textContent = '默认';
        button.appendChild(badge);
      }
      if (String(version.translation || '').trim()) {
        const dot = document.createElement('span');
        dot.className = 'translation-dot';
        dot.title = '含翻译';
        button.appendChild(dot);
      }
      button.addEventListener('click', () => selectVersion(version.id));
      elements.versionTabs.appendChild(button);
    });
    const defaultVersion = defaultLyricVersion(song);
    elements.versionSummary.textContent = `${library.versions.length} 个版本 · 默认：${defaultVersion?.name || '默认版'}`;
    elements.showAllVersionsButton.setAttribute('aria-pressed', String(state.showAllVersions));
    elements.showAllVersionsButton.textContent = state.showAllVersions ? '仅阅读当前版本' : '阅读全部版本';
  }

  function fillVersionEditor(version, library) {
    elements.versionName.value = version.name || '默认版';
    elements.versionType.value = version.type || 'default';
    elements.originalLabel.value = version.originalLabel || '歌词';
    elements.translationLabel.value = version.translationLabel || '中文翻译';
    elements.versionNote.value = version.note || '';
    elements.lineAligned.checked = Boolean(version.lineAligned);
    elements.lyricEditor.value = String(version.original || '');
    elements.translationEditor.value = String(version.translation || '');
    elements.charCount.textContent = `原文 ${String(version.original || '').trim().length.toLocaleString('zh-CN')} 字 · 翻译 ${String(version.translation || '').trim().length.toLocaleString('zh-CN')} 字`;
    elements.setDefaultVersion.disabled = version.id === library.defaultVersionId;
    elements.deleteVersion.disabled = library.versions.length <= 1;
  }

  function renderDetail() {
    const song = currentSong();
    if (!song) return;
    const globalIndex = songs.findIndex((item) => item.id === song.id);
    const library = libraryFor(song);
    const version = selectedVersion(song);

    elements.songNumber.textContent = String(globalIndex + 1).padStart(2, '0');
    elements.songTotal.textContent = String(songs.length);
    elements.songKicker.textContent = descriptiveStatus(song);
    elements.songTitle.textContent = song.title;
    elements.songAliases.textContent = song.aliases?.length ? `原图别名 / 版本：${song.aliases.join(' · ')}` : '';

    elements.songTags.replaceChildren();
    (song.tags || []).forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'tag-pill';
      span.textContent = tag;
      elements.songTags.appendChild(span);
    });
    const info = setlistInfo(song);
    if (info) {
      const span = document.createElement('span');
      span.className = 'tag-pill';
      span.textContent = `${info.section.name} · 第 ${info.itemIndex + 1} 首`;
      elements.songTags.appendChild(span);
    }

    if (song.note) {
      elements.songNote.hidden = false;
      elements.songNote.textContent = song.note;
    } else {
      elements.songNote.hidden = true;
      elements.songNote.textContent = '';
    }

    renderVersionTabs(song);
    fillVersionEditor(version, library);
    const filled = library.versions.some(versionHasContent);
    elements.emptyState.hidden = filled;
    elements.lyricPreview.hidden = !filled;
    if (filled) renderPreview(song);

    elements.favoriteButton.setAttribute('aria-pressed', isFavorite(song) ? 'true' : 'false');
    elements.learnedButton.setAttribute('aria-pressed', isLearned(song) ? 'true' : 'false');
    elements.learnedButton.textContent = isLearned(song) ? '✓ 已熟悉' : '标记为已熟悉';

    elements.sourcePills.replaceChildren();
    song.sources.forEach((source) => {
      const span = document.createElement('span');
      span.className = 'source-pill';
      span.textContent = sourceShort[source] || source;
      elements.sourcePills.appendChild(span);
    });

    elements.appleLink.href = song.links.apple_music_search;
    elements.youtubeLink.href = song.links.youtube_search;
    elements.officialLink.href = song.links.official_video_search;

    applyViewMode(state.viewMode);
    updateFocusContent();
    updateStats();
  }

  function updateStats() {
    const filled = songs.filter(hasLyrics).length;
    elements.statSongs.textContent = DATA.metadata.counts.unique_songs_excluding_other ?? songs.length;
    elements.statCoverage.textContent = DATA.metadata.counts.total_visible_entries ?? (DATA.metadata.counts.image1_entries + DATA.metadata.counts.image2_entries_including_other + DATA.metadata.counts.image3_entries + (DATA.metadata.counts.image4_entries || 0));
    elements.statFilled.textContent = filled;
    elements.statVerified.textContent = DATA.metadata.counts.new_entries_added_in_this_revision ?? DATA.metadata.counts.verified_2026_missing_from_original_three_images ?? 0;
  }

  function selectSong(id, options = {}) {
    if (!songs.some((song) => song.id === id)) return;
    state.selectedId = id;
    saveState('已切换');
    renderList();
    renderDetail();
    if (!options.keepSidebar) closeSidebar();
    if (options.scroll !== false && window.innerWidth < 992) {
      $('#readerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function navigate(delta) {
    const pool = filteredSongs.length ? filteredSongs : songs;
    let index = pool.findIndex((song) => song.id === state.selectedId);
    if (index < 0) index = 0;
    const next = pool[(index + delta + pool.length) % pool.length];
    selectSong(next.id, { scroll: false });
  }

  function applyViewMode(mode) {
    state.viewMode = mode === 'edit' ? 'edit' : 'preview';
    const editing = state.viewMode === 'edit';
    elements.previewTab.classList.toggle('active', !editing);
    elements.editTab.classList.toggle('active', editing);
    elements.previewTab.setAttribute('aria-selected', String(!editing));
    elements.editTab.setAttribute('aria-selected', String(editing));
    elements.previewPanel.hidden = editing;
    elements.editPanel.hidden = !editing;
    if (editing) requestAnimationFrame(() => elements.lyricEditor.focus({ preventScroll: true }));
    saveState('');
  }

  function refreshAfterVersionEdit(message = '已自动保存') {
    const song = currentSong();
    const version = selectedVersion(song);
    elements.charCount.textContent = `原文 ${String(version.original || '').trim().length.toLocaleString('zh-CN')} 字 · 翻译 ${String(version.translation || '').trim().length.toLocaleString('zh-CN')} 字`;
    saveState(message);
    const filled = versionsFor(song).some(versionHasContent);
    elements.emptyState.hidden = filled;
    elements.lyricPreview.hidden = !filled;
    if (filled) renderPreview(song);
    renderVersionTabs(song);
    renderList();
    updateStats();
    updateFocusContent();
    updatePrintEstimate();
  }

  function updateLyrics(value) {
    const version = selectedVersion(currentSong());
    if (!version) return;
    version.original = String(value || '').replace(/\r\n?/g, '\n');
    refreshAfterVersionEdit();
  }

  function updateTranslation(value) {
    const version = selectedVersion(currentSong());
    if (!version) return;
    version.translation = String(value || '').replace(/\r\n?/g, '\n');
    refreshAfterVersionEdit();
  }

  function updateVersionMetadata() {
    const version = selectedVersion(currentSong());
    if (!version) return;
    version.name = String(elements.versionName.value || '').trim() || '未命名版本';
    version.type = elements.versionType.value || 'other';
    version.originalLabel = String(elements.originalLabel.value || '').trim() || '歌词';
    version.translationLabel = String(elements.translationLabel.value || '').trim() || '中文翻译';
    version.note = String(elements.versionNote.value || '').trim();
    version.lineAligned = elements.lineAligned.checked;
    saveState('版本设置已保存');
    renderDetail();
    renderList();
    updatePrintEstimate();
  }

  function selectVersion(versionId) {
    const song = currentSong();
    const library = libraryFor(song);
    if (!library.versions.some((version) => version.id === versionId)) return;
    library.selectedVersionId = versionId;
    state.showAllVersions = false;
    saveState('已切换版本');
    renderDetail();
  }

  function addVersion() {
    const song = currentSong();
    const library = libraryFor(song);
    const version = createVersion('', { name: `版本 ${library.versions.length + 1}`, type: 'other' });
    library.versions.push(version);
    library.selectedVersionId = version.id;
    state.showAllVersions = false;
    saveState('新版本已建立');
    renderDetail();
    renderList();
    applyViewMode('edit');
  }

  function duplicateVersion() {
    const song = currentSong();
    const library = libraryFor(song);
    const source = selectedVersion(song);
    const copy = createVersion(source.original, {
      name: `${source.name} 副本`, type: source.type, originalLabel: source.originalLabel,
      translationLabel: source.translationLabel, translation: source.translation,
      note: source.note, lineAligned: source.lineAligned,
    });
    library.versions.push(copy);
    library.selectedVersionId = copy.id;
    saveState('版本已复制');
    renderDetail();
    applyViewMode('edit');
  }

  function setDefaultVersion() {
    const song = currentSong();
    const library = libraryFor(song);
    const version = selectedVersion(song);
    library.defaultVersionId = version.id;
    saveState('默认版本已更新');
    renderDetail();
    renderList();
  }

  function deleteVersion() {
    const song = currentSong();
    const library = libraryFor(song);
    const version = selectedVersion(song);
    if (library.versions.length <= 1) return;
    if (!window.confirm(`确定删除《${song.title}》的“${version.name}”吗？`)) return;
    const index = library.versions.findIndex((item) => item.id === version.id);
    library.versions.splice(index, 1);
    if (library.defaultVersionId === version.id) library.defaultVersionId = library.versions[0].id;
    library.selectedVersionId = (library.versions[Math.max(0, index - 1)] || library.versions[0]).id;
    saveState('版本已删除');
    renderDetail();
    renderList();
  }

  function clearCurrentVersion() {
    const song = currentSong();
    const version = selectedVersion(song);
    if (!versionHasContent(version)) return;
    if (!window.confirm(`确定清空《${song.title}》“${version.name}”的原文和翻译吗？`)) return;
    version.original = '';
    version.translation = '';
    elements.lyricEditor.value = '';
    elements.translationEditor.value = '';
    refreshAfterVersionEdit('当前版本已清空');
  }

  function toggleShowAllVersions() {
    state.showAllVersions = !state.showAllVersions;
    saveState('');
    renderDetail();
  }

  function toggleInArray(key, id) {
    const list = state[key];
    const index = list.indexOf(id);
    if (index >= 0) list.splice(index, 1);
    else list.push(id);
    saveState();
    renderList();
    renderDetail();
  }

  function isModalVisible() {
    return Boolean(document.querySelector('.modal.show'));
  }

  function appOwnsBodyLock() {
    return elements.sidebar.classList.contains('open') || !elements.focusOverlay.hidden;
  }

  function releaseStaleBodyLock() {
    if (appOwnsBodyLock() || isModalVisible()) return;
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.documentElement.style.removeProperty('overflow');
  }

  function syncBodyScrollLock() {
    if (appOwnsBodyLock()) {
      document.body.style.overflow = 'hidden';
      return;
    }
    if (!isModalVisible()) releaseStaleBodyLock();
  }

  function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.sidebarBackdrop.classList.add('open');
    elements.sidebarToggle.setAttribute('aria-expanded', 'true');
    syncBodyScrollLock();
  }

  function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.remove('open');
    elements.sidebarToggle.setAttribute('aria-expanded', 'false');
    syncBodyScrollLock();
  }

  function launchModalFromSidebar(button, event) {
    if (!elements.sidebar.classList.contains('open')) return false;
    const selector = button.getAttribute('data-bs-target');
    const modalElement = selector ? document.querySelector(selector) : null;
    if (!modalElement || !window.bootstrap?.Modal) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    closeSidebar();
    window.requestAnimationFrame(() => {
      window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    });
    return true;
  }

  function applyTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    elements.html.setAttribute('data-bs-theme', state.theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#17121d' : '#6d28d9');
    saveState('');
  }

  function applyFontLevel(level) {
    const parsed = Math.max(0, Math.min(4, Number(level) || 0));
    state.fontLevel = parsed;
    elements.fontRange.value = String(parsed);
    document.documentElement.style.setProperty('--reading-scale', String(fontScales[parsed]));
    saveState('');
  }

  function updateFocusContent() {
    const song = currentSong();
    if (!song) return;
    const versions = state.showAllVersions ? versionsFor(song).filter(versionHasContent) : [selectedVersion(song)].filter(versionHasContent);
    elements.focusKicker.textContent = `${descriptiveStatus(song)} · ${state.showAllVersions ? '全部版本' : (versions[0]?.name || '默认版')}`;
    elements.focusTitle.textContent = song.title;
    const blocks = versions.map((version) => {
      const pieces = [`【${version.name}】`];
      if (String(version.original || '').trim()) pieces.push(`${version.originalLabel || '歌词'}\n${version.original.trim()}`);
      if (String(version.translation || '').trim()) pieces.push(`${version.translationLabel || '中文翻译'}\n${version.translation.trim()}`);
      return pieces.join('\n\n');
    });
    elements.focusLyrics.textContent = blocks.join('\n\n────────\n\n') || '尚未导入歌词。';
  }

  function openFocus() {
    closeSidebar();
    updateFocusContent();
    elements.focusOverlay.hidden = false;
    syncBodyScrollLock();
    elements.exitFocus.focus();
  }

  function closeFocus() {
    elements.focusOverlay.hidden = true;
    syncBodyScrollLock();
    elements.focusButton.focus();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.textContent = message;
    elements.toastRegion.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      window.setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  function safeFilename(value) {
    return value.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
  }

  function downloadBlob(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportBackup() {
    syncLegacyLyrics();
    const payload = {
      format: 'gem-lyricbook-backup-v4',
      exportedAt: new Date().toISOString(),
      state: {
        lyrics: state.lyrics,
        lyricLibrary: state.lyricLibrary,
        favorites: state.favorites,
        learned: state.learned,
        setlists: state.setlists,
        activeSetlistId: state.activeSetlistId,
        showAllVersions: state.showAllVersions,
      },
      titles: Object.fromEntries(songs.map((song) => [song.id, song.title])),
    };
    downloadBlob(JSON.stringify(payload, null, 2), 'application/json;charset=utf-8', `GEM歌词本备份_多版本双语_${new Date().toISOString().slice(0, 10)}.json`);
    showToast('多版本双语 JSON 备份已导出');
  }

  function exportMarkdown() {
    const blocks = ['# G.E.M. I AM GLORIA 私人歌词本', '', '> 多版本双语导出格式。每首歌以 `##` 开头，每个版本以 `### 版本：` 开头。', ''];
    songs.forEach((song) => {
      const library = libraryFor(song, false);
      const versions = library?.versions.filter(versionHasContent) || [];
      if (!versions.length) return;
      blocks.push(`## ${song.title}`, '');
      versions.forEach((version) => {
        const isDefault = version.id === library.defaultVersionId;
        blocks.push(`### 版本：${version.name}${isDefault ? ' [默认]' : ''}`);
        blocks.push(`> 类型：${version.type || 'other'}`);
        blocks.push(`> 原文标题：${version.originalLabel || '歌词'}`);
        blocks.push(`> 翻译标题：${version.translationLabel || '中文翻译'}`);
        blocks.push(`> 逐行对应：${version.lineAligned ? '是' : '否'}`);
        if (version.note) blocks.push(`> 说明：${version.note}`);
        blocks.push('', '#### 原文', '', version.original || '', '');
        if (String(version.translation || '').trim()) blocks.push('#### 翻译', '', version.translation, '');
      });
    });
    if (blocks.length === 4) blocks.push('尚未导入任何歌词。');
    downloadBlob(blocks.join('\n'), 'text/markdown;charset=utf-8', `GEM歌词本_多版本双语_${new Date().toISOString().slice(0, 10)}.md`);
    showToast('多版本双语 Markdown 已导出');
  }

  function scriptSafeJson(value) {
    return JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  function newEmbeddedId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async function exportStandaloneHtml() {
    try {
      syncLegacyLyrics();
      const embeddedId = newEmbeddedId();
      const embeddedPayload = { ...state, exportedAt: new Date().toISOString() };
      const stateScript = `<script id="gem-embedded-state">window.GEM_EMBEDDED_ID=${scriptSafeJson(embeddedId)};window.GEM_EMBEDDED_STATE=${scriptSafeJson(embeddedPayload)};</script>`;
      let html = '';

      if (window.GEM_SINGLE_FILE) {
        const clone = document.documentElement.cloneNode(true);
        const body = clone.querySelector('body');
        body?.classList.remove('modal-open');
        if (body) {
          body.style.removeProperty('overflow');
          body.style.removeProperty('padding-right');
        }
        clone.querySelectorAll('.modal-backdrop, .app-toast').forEach((node) => node.remove());
        clone.querySelectorAll('.modal.show').forEach((modal) => {
          modal.classList.remove('show');
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
          modal.removeAttribute('aria-modal');
          modal.removeAttribute('role');
        });
        clone.querySelector('#songSidebar')?.classList.remove('open');
        clone.querySelector('#sidebarBackdrop')?.classList.remove('open');
        clone.querySelector('#focusOverlay')?.setAttribute('hidden', '');
        const printRoot = clone.querySelector('#printRoot');
        if (printRoot) {
          printRoot.innerHTML = '';
          printRoot.setAttribute('aria-hidden', 'true');
        }
        const dynamicPrintStyle = clone.querySelector('#dynamicPrintStyle');
        if (dynamicPrintStyle) dynamicPrintStyle.textContent = '';
        clone.querySelector('#gem-embedded-state')?.remove();
        const appScript = clone.querySelector('#gem-app');
        if (!appScript?.parentNode) throw new Error('未找到内嵌程序入口');
        const embeddedState = document.createElement('script');
        embeddedState.id = 'gem-embedded-state';
        embeddedState.textContent = `window.GEM_EMBEDDED_ID=${scriptSafeJson(embeddedId)};window.GEM_EMBEDDED_STATE=${scriptSafeJson(embeddedPayload)};`;
        appScript.parentNode.insertBefore(embeddedState, appScript);
        html = `<!doctype html>\n${clone.outerHTML}`;
      } else {
        const templateUrl = new URL('./GEM歌词本_单文件.html', window.location.href);
        const response = await fetch(templateUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`无法读取离线模板（HTTP ${response.status}）`);
        const template = await response.text();
        const marker = '<script id="gem-app"';
        if (!template.includes(marker)) throw new Error('离线模板缺少程序入口');
        html = template.replace(marker, `${stateScript}\n${marker}`);
      }

      const filledCount = songs.filter(hasLyrics).length;
      const versionCount = songs.reduce((sum, song) => sum + versionsFor(song, false).filter(versionHasContent).length, 0);
      downloadBlob(html, 'text/html;charset=utf-8', `GEM歌词本_含歌词_多版本双语_${new Date().toISOString().slice(0, 10)}.html`);
      showToast(`已导出离线 HTML（${filledCount} 首，${versionCount} 个版本）`);
    } catch (error) {
      console.error('Cannot export standalone HTML', error);
      showToast(`离线 HTML 导出失败：${error.message}`);
    }
  }

  function exportTemplate() {
    const blocks = ['# G.E.M. 歌词批量导入模板', '', '> 每首歌可建立多个版本。没有翻译时，“#### 翻译”部分可留空。', ''];
    songs.forEach((song) => blocks.push(
      `## ${song.title}`, '',
      '### 版本：默认版 [默认]',
      '> 类型：default',
      '> 原文标题：歌词',
      '> 翻译标题：中文翻译',
      '> 逐行对应：否', '',
      '#### 原文', '', '[在此粘贴歌词]', '',
      '#### 翻译', '', '[可留空]', ''
    ));
    downloadBlob(blocks.join('\n'), 'text/markdown;charset=utf-8', 'GEM歌词批量导入模板_多版本双语.md');
    showToast('多版本双语空白模板已生成');
  }

  function buildAliasMap() {
    const map = new Map();
    const add = (key, song) => {
      const normalized = normalizeSearch(key);
      if (normalized) map.set(normalized, song);
    };
    songs.forEach((song) => {
      add(song.title, song);
      (song.aliases || []).forEach((alias) => add(alias, song));
    });
    const manual = {
      allaboutyou: 'All About U', allaboutu: 'All About U', findyou: 'FIND YOU',
      walkonwater: 'Walk On Water', whathaveyoudone: 'WHAT HAVE U DONE',
      whathaveudone: 'WHAT HAVE U DONE', hell坠落天堂: 'HELL', 'ainy爱你': 'A.I.N.Y.',
      geteverybodymoving: 'G.E.M. (Get Everybody Moving)', gem: 'G.E.M. (Get Everybody Moving)',
    };
    Object.entries(manual).forEach(([alias, title]) => {
      const song = songs.find((item) => item.title === title);
      if (song) add(alias, song);
    });
    return map;
  }

  const aliasMap = buildAliasMap();

  function matchTitle(title) {
    const normalized = normalizeSearch(title);
    if (aliasMap.has(normalized)) return aliasMap.get(normalized);
    const candidates = songs.filter((song) => {
      const canonical = normalizeSearch(song.title);
      return normalized.length >= 3 && (canonical.includes(normalized) || normalized.includes(canonical));
    });
    return candidates.length === 1 ? candidates[0] : null;
  }

  function parseVersionMetadata(body) {
    const read = (label) => body.match(new RegExp(`^>\\s*${label}\\s*[:：]\\s*(.+?)\\s*$`, 'm'))?.[1]?.trim() || '';
    return {
      type: read('类型') || 'other',
      originalLabel: read('原文标题') || '歌词',
      translationLabel: read('翻译标题') || '中文翻译',
      lineAligned: /^(?:是|yes|true|1)$/i.test(read('逐行对应')),
      note: read('说明'),
    };
  }

  function parseVersionMarkdown(body) {
    const versionRegex = /^###(?!#)\s+(?:版本\s*[:：]\s*)?(.+?)\s*$/gm;
    const matches = Array.from(body.matchAll(versionRegex));
    if (!matches.length) {
      const lyrics = body.trim().replace(/^\[在此粘贴歌词\]$/m, '').trim();
      return lyrics ? [{ ...createVersion(lyrics, { name: '默认版' }), isDefault: true }] : [];
    }
    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
      let name = match[1].trim();
      const isDefault = /\[默认\]|（默认）|\(默认\)/.test(name);
      name = name.replace(/\s*(?:\[默认\]|（默认）|\(默认\))\s*/g, '').trim() || `版本 ${index + 1}`;
      const versionBody = body.slice(start, end).trim();
      const metadata = parseVersionMetadata(versionBody);
      const subRegex = /^####\s+(.+?)\s*$/gm;
      const subMatches = Array.from(versionBody.matchAll(subRegex));
      let original = '';
      let translation = '';
      if (!subMatches.length) {
        original = versionBody.replace(/^>.*$/gm, '').trim();
      } else {
        subMatches.forEach((sub, subIndex) => {
          const subStart = sub.index + sub[0].length;
          const subEnd = subIndex + 1 < subMatches.length ? subMatches[subIndex + 1].index : versionBody.length;
          const label = sub[1].trim();
          const content = versionBody.slice(subStart, subEnd).trim().replace(/^\[(?:在此粘贴歌词|可留空)\]$/m, '').trim();
          if (/翻译|译文|中文/.test(label)) translation = content;
          else original = content;
        });
      }
      return { ...createVersion(original, { name, ...metadata, translation }), isDefault };
    }).filter(versionHasContent);
  }

  function parseMarkdown(text) {
    const normalized = String(text || '').replace(/\r\n?/g, '\n');
    const headingRegex = /^##(?!#)\s+(.+?)\s*$/gm;
    const matches = Array.from(normalized.matchAll(headingRegex));
    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
      return { title: match[1].trim(), versions: parseVersionMarkdown(normalized.slice(start, end)) };
    });
  }

  function importEntries(entries, resultElement = elements.importResult) {
    let matched = 0;
    let skippedEmpty = 0;
    const unmatched = [];
    entries.forEach((entry) => {
      const song = matchTitle(entry.title);
      if (!song) {
        unmatched.push(entry.title);
        return;
      }
      const incoming = Array.isArray(entry.versions) ? entry.versions.filter(versionHasContent) : [];
      if (!incoming.length) {
        const text = String(entry.lyrics || '').trim();
        if (!text) {
          skippedEmpty += 1;
          return;
        }
        const library = libraryFor(song);
        const version = defaultLyricVersion(song);
        version.original = text.replace(/\r\n?/g, '\n');
        library.selectedVersionId = version.id;
        matched += 1;
        return;
      }
      const versions = incoming.map((version, index) => normalizeVersion(version, index ? `版本 ${index + 1}` : '默认版'));
      const defaultIncoming = incoming.find((version) => version.isDefault);
      const defaultVersionId = defaultIncoming ? versions[incoming.indexOf(defaultIncoming)].id : versions[0].id;
      state.lyricLibrary[song.id] = { versions, defaultVersionId, selectedVersionId: defaultVersionId };
      matched += 1;
    });
    saveState('导入完成');
    renderList();
    renderDetail();
    updatePrintEstimate();
    const summary = [`成功导入 ${matched} 首。`];
    if (skippedEmpty) summary.push(`跳过 ${skippedEmpty} 个空白标题块。`);
    if (unmatched.length) summary.push(`未匹配 ${unmatched.length} 项：${unmatched.slice(0, 12).join('、')}${unmatched.length > 12 ? '…' : ''}`);
    resultElement.textContent = summary.join('\n');
    showToast(`已导入 ${matched} 首歌词`);
  }

  function applyJsonImport(parsed) {
    const incoming = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
    const incomingLibrary = convertLegacyVersions(incoming || {});
    let matched = 0;
    Object.entries(incomingLibrary).forEach(([sourceId, entry]) => {
      const title = parsed?.titles?.[sourceId] || songs.find((song) => song.id === sourceId)?.title;
      const song = songs.find((item) => item.id === sourceId) || (title ? matchTitle(title) : null);
      if (!song) return;
      state.lyricLibrary[song.id] = normalizeLibraryEntry(entry, incoming?.lyrics?.[sourceId] || '');
      matched += 1;
    });
    if (!matched && incoming?.lyrics && typeof incoming.lyrics === 'object') {
      const entries = Object.entries(incoming.lyrics).map(([title, lyrics]) => ({ title, lyrics }));
      importEntries(entries);
      return;
    }
    if (Array.isArray(incoming?.favorites)) state.favorites = incoming.favorites.filter((id) => songs.some((song) => song.id === id));
    if (Array.isArray(incoming?.learned)) state.learned = incoming.learned.filter((id) => songs.some((song) => song.id === id));
    if (Array.isArray(incoming?.setlists)) {
      const builtins = builtinSetlists();
      const imported = incoming.setlists.map(normalizeSetlist);
      state.setlists = [...builtins];
      imported.forEach((setlist) => {
        const index = state.setlists.findIndex((item) => item.id === setlist.id);
        if (index >= 0) state.setlists[index] = { ...state.setlists[index], ...setlist };
        else state.setlists.push(setlist);
      });
      state.activeSetlistId = state.setlists.some((setlist) => setlist.id === incoming.activeSetlistId)
        ? incoming.activeSetlistId : state.setlists[0]?.id || '';
    }
    saveState('JSON 已恢复');
    renderList();
    renderDetail();
    renderSetlistEditor();
    updatePrintEstimate();
    elements.importResult.textContent = `成功恢复 ${matched} 首歌曲的歌词版本。`;
    showToast(`已恢复 ${matched} 首歌曲`);
  }

  async function importFile() {
    const file = elements.importFile.files?.[0];
    if (!file) {
      elements.importResult.textContent = '请先选择 JSON、Markdown 或 TXT 文件。';
      return;
    }
    try {
      const text = await file.text();
      if (file.name.toLocaleLowerCase().endsWith('.json')) {
        applyJsonImport(JSON.parse(text));
        return;
      }
      const entries = parseMarkdown(text);
      if (!entries.length) throw new Error('没有识别到 “## 歌名” 标题块');
      importEntries(entries);
    } catch (error) {
      elements.importResult.textContent = `导入失败：${error.message}`;
    }
  }

  function formatSetlistText(setlist) {
    if (!setlist) return '';
    return setlist.sections.map((section) => {
      const lines = section.items.map((item) => songs.find((song) => song.id === item.songId)?.title || item.raw).filter(Boolean);
      const optional = section.optional ? ' [可选]' : '';
      return [`## ${section.name}${optional}`, ...lines].join('\n');
    }).join('\n\n');
  }

  function parseSetlistText(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const sections = [];
    const unmatched = [];
    const duplicates = [];
    const seen = new Set();
    let current = null;
    const inferKind = (name) => {
      const value = String(name || '');
      if (/点歌|黄色区/.test(value)) return 'request';
      if (/轮换/.test(value)) return 'encore-rotation';
      if (/串烧/.test(value)) return 'medley';
      if (/惊喜|未官宣/.test(value)) return 'surprise';
      if (/收尾|finale/i.test(value)) return 'closing';
      if (/encore|返场/i.test(value)) return 'encore-fixed';
      return 'main';
    };
    const ensure = () => {
      if (!current) {
        current = { name: 'Main Set', kind: 'main', optional: false, items: [] };
        sections.push(current);
      }
      return current;
    };
    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('>')) return;
      const heading = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\[(.+)\]$/);
      if (heading) {
        const headingText = heading[1].trim();
        const optional = /\s*\[可选\]\s*$/u.test(headingText);
        const name = headingText.replace(/\s*\[可选\]\s*$/u, '').trim();
        current = { name, kind: inferKind(name), optional, items: [] };
        sections.push(current);
        return;
      }
      const cleaned = line.replace(/^\d+[.)、]\s*/, '').replace(/^[-*•]\s*/, '').trim();
      const song = matchTitle(cleaned);
      if (!song) {
        unmatched.push(cleaned);
        ensure().items.push({ raw: cleaned, songId: '' });
        return;
      }
      if (seen.has(song.id)) {
        duplicates.push(song.title);
        return;
      }
      seen.add(song.id);
      ensure().items.push({ raw: cleaned, songId: song.id });
    });
    return { sections: sections.filter((section) => section.items.length), unmatched, duplicates };
  }

  function renderSetlistEditor() {
    const current = activeSetlist();
    elements.setlistSelect.replaceChildren();
    state.setlists.forEach((setlist) => {
      const option = document.createElement('option');
      option.value = setlist.id;
      option.textContent = `${setlist.name} · ${setlistStatusLabel(setlist.status)}`;
      elements.setlistSelect.appendChild(option);
    });
    if (current) elements.setlistSelect.value = current.id;
    elements.setlistName.value = current?.name || '';
    elements.setlistStatus.value = current?.status || 'draft';
    elements.setlistEditor.value = formatSetlistText(current);
    const matched = current?.sections.reduce((sum, section) => sum + section.items.filter((item) => item.songId).length, 0) || 0;
    const unmatched = current?.sections.reduce((sum, section) => sum + section.items.filter((item) => !item.songId).length, 0) || 0;
    const optionalSections = current?.sections.filter((section) => section.optional).length || 0;
    const coreSongs = setlistSongIds(current, false).length;
    const allSongs = setlistSongIds(current, true).length;
    elements.setlistStats.textContent = current
      ? `${current.sections.length} 个章节 · 固定 ${coreSongs} 首 · 含可选 ${allSongs} 首${optionalSections ? ` · ${optionalSections} 个可选章节` : ''}${unmatched ? ` · ${unmatched} 行待匹配` : ''}${current.builtin ? ' · 内置参考歌单' : ''}${current.description ? `\n${current.description}` : ''}`
      : '尚未建立歌单。';
    elements.deleteSetlistButton.disabled = !current || current.builtin;
  }

  function saveSetlistFromEditor() {
    let current = activeSetlist();
    const parsed = parseSetlistText(elements.setlistEditor.value);
    if (!parsed.sections.length) {
      elements.setlistResult.textContent = '没有识别到曲目。请用 “## Part 1” 分段，并每行填写一首歌。';
      return;
    }
    if (!current || current.builtin) {
      current = normalizeSetlist({
        id: uid('setlist'),
        name: String(elements.setlistName.value || '').trim() || `${activeSetlist()?.name || '演出歌单'}（自定义）`,
        status: elements.setlistStatus.value || 'draft',
        sections: parsed.sections,
        unmatched: parsed.unmatched,
      });
      state.setlists.push(current);
      state.activeSetlistId = current.id;
    } else {
      current.name = String(elements.setlistName.value || '').trim() || current.name;
      current.status = elements.setlistStatus.value || 'draft';
      current.sections = parsed.sections;
      current.unmatched = parsed.unmatched;
    }
    saveState('歌单顺序已保存');
    state.sort = 'setlist';
    elements.sort.value = 'setlist';
    renderSetlistEditor();
    renderList();
    updatePrintEstimate();
    elements.setlistResult.textContent = `已保存 ${parsed.sections.length} 个章节。${parsed.unmatched.length ? `未匹配：${parsed.unmatched.slice(0, 10).join('、')}${parsed.unmatched.length > 10 ? '…' : ''}。` : '所有歌名均已匹配。'}${parsed.duplicates.length ? ` 已忽略重复项：${parsed.duplicates.join('、')}。` : ''}`;
  }

  function createNewSetlist() {
    const setlist = normalizeSetlist({ id: uid('setlist'), name: `自定义歌单 ${state.setlists.filter((item) => !item.builtin).length + 1}`, status: 'draft', sections: [] });
    state.setlists.push(setlist);
    state.activeSetlistId = setlist.id;
    saveState('新歌单已建立');
    renderSetlistEditor();
    elements.setlistEditor.focus();
  }

  function deleteCurrentSetlist() {
    const current = activeSetlist();
    if (!current || current.builtin) return;
    if (!window.confirm(`确定删除歌单“${current.name}”吗？歌词不会受影响。`)) return;
    state.setlists = state.setlists.filter((setlist) => setlist.id !== current.id);
    state.activeSetlistId = state.setlists[0]?.id || '';
    saveState('歌单已删除');
    renderSetlistEditor();
    renderList();
  }

  function useCurrentSetlistSort() {
    state.sort = 'setlist';
    elements.sort.value = 'setlist';
    saveState('已按演出歌单排序');
    renderList();
    updatePrintEstimate();
    showToast('目录与打印顺序已切换为演出歌单');
  }

  function renderCoverage() {
    ['image1', 'image2', 'image3', 'image4'].forEach((source, idx) => {
      const target = $(`#coverageImage${idx + 1}`);
      target.replaceChildren();
      const fragment = document.createDocumentFragment();
      DATA.coverage[source].forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'coverage-item';
        const number = document.createElement('span');
        number.className = 'number';
        number.textContent = entry.position;
        const copy = document.createElement('div');
        const raw = document.createElement('div');
        raw.className = 'raw';
        raw.textContent = entry.raw;
        const canonical = document.createElement('div');
        canonical.className = 'canonical';
        canonical.textContent = entry.raw === entry.canonical ? '已收录' : `归一为：${entry.canonical}`;
        copy.append(raw, canonical);
        item.append(number, copy);
        fragment.appendChild(item);
      });
      target.appendChild(fragment);
    });
  }

  function renderSources() {
    const target = $('#sourceList');
    target.replaceChildren();
    DATA.metadata.sources.forEach((source) => {
      const entry = document.createElement('div');
      entry.className = 'source-entry';
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.label;
      const url = document.createElement('small');
      url.textContent = source.url;
      entry.append(link, url);
      target.appendChild(entry);
    });
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizePrintLyrics(text, compactWhitespace = true) {
    const sourceLines = String(text || '')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[\t ]+$/g, ''));

    while (sourceLines.length && !sourceLines[0].trim()) sourceLines.shift();
    while (sourceLines.length && !sourceLines[sourceLines.length - 1].trim()) sourceLines.pop();
    if (!sourceLines.length) return '';

    const collapsed = [];
    let previousBlank = false;
    sourceLines.forEach((line) => {
      const blank = !line.trim();
      if (blank && previousBlank) return;
      collapsed.push(blank ? '' : line);
      previousBlank = blank;
    });

    const normalized = collapsed.join('\n');
    if (!compactWhitespace) return normalized;
    const blocks = normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
    if (!blocks.length) return '';
    const singletonCount = blocks.filter((block) => !block.includes('\n')).length;
    const mostlySingleton = blocks.length >= 8 && singletonCount / blocks.length >= 0.72;
    return mostlySingleton ? blocks.join('\n') : blocks.join('\n\n');
  }

  function lineUnits(value) {
    let units = 0;
    Array.from(String(value || '')).forEach((character) => {
      if (/\s/.test(character)) units += 0.24;
      else units += /[\u0000-\u00ff]/.test(character) ? 0.58 : 1;
    });
    return units;
  }

  function isStructuralLyricLine(line) {
    const value = String(line || '').trim();
    if (!value) return false;
    return /^([\[【（(].{0,24}[\]】）)]|#{1,4}\s|(?:verse|chorus|bridge|pre[- ]?chorus|intro|outro|hook|rap|主歌|副歌|桥段|前奏|间奏|尾奏|合唱|独白|念白|重复|repeat)\b)/i.test(value)
      || /^[A-Z\d][A-Z\d .&'’-]{1,22}:$/.test(value);
  }

  function collapseBlankLines(lines) {
    const output = [];
    let blank = false;
    lines.forEach((line) => {
      const isBlank = !String(line || '').trim();
      if (isBlank && blank) return;
      output.push(isBlank ? '' : String(line));
      blank = isBlank;
    });
    while (output.length && !output[0].trim()) output.shift();
    while (output.length && !output[output.length - 1].trim()) output.pop();
    return output;
  }

  function mergeShortLyricLines(text, targetSize = 'a4') {
    const source = normalizePrintLyrics(text, true);
    if (!source) return '';
    const shortLimit = targetSize === 'a4' ? 13.5 : 10.5;
    const targetLimit = targetSize === 'a4' ? 37 : 25;
    const maxParts = targetSize === 'a4' ? 3 : 2;
    const output = [];
    let buffer = [];

    const flush = () => {
      if (!buffer.length) return;
      output.push(buffer.join(' / '));
      buffer = [];
    };

    source.split('\n').forEach((rawLine) => {
      const line = rawLine.trimEnd();
      if (!line.trim()) {
        flush();
        output.push('');
        return;
      }
      const units = lineUnits(line);
      if (isStructuralLyricLine(line) || units > shortLimit * 1.45) {
        flush();
        output.push(line);
        return;
      }
      if (!buffer.length) {
        buffer.push(line);
        return;
      }
      const candidate = [...buffer, line].join(' / ');
      if (buffer.length < maxParts && units <= shortLimit && lineUnits(candidate) <= targetLimit) {
        buffer.push(line);
      } else {
        flush();
        buffer.push(line);
      }
    });
    flush();
    return collapseBlankLines(output).join('\n');
  }

  function softWrapLine(line, maxUnits) {
    const value = String(line || '');
    if (!value.trim() || lineUnits(value) <= maxUnits) return [value];
    const characters = Array.from(value);
    const pieces = [];
    let start = 0;
    while (start < characters.length) {
      let units = 0;
      let end = start;
      let lastBreak = -1;
      while (end < characters.length) {
        const character = characters[end];
        const nextUnits = units + (/[\u0000-\u00ff]/.test(character) ? 0.58 : 1);
        if (nextUnits > maxUnits && end > start) break;
        units = nextUnits;
        if (/\s|[，。！？；：,.!?;:、/]/.test(character)) lastBreak = end + 1;
        end += 1;
      }
      if (end < characters.length && lastBreak > start + 3) end = lastBreak;
      pieces.push(characters.slice(start, Math.max(start + 1, end)).join('').trim());
      start = Math.max(start + 1, end);
    }
    return pieces.filter(Boolean);
  }

  function textToLines(text, targetSize, columns = 1) {
    const maxUnits = columns === 2
      ? (targetSize === 'a4' ? 58 : 38)
      : (targetSize === 'a4' ? 104 : 72);
    const lines = [];
    String(text || '').split('\n').forEach((line) => {
      if (!line.trim()) {
        lines.push('');
        return;
      }
      lines.push(...softWrapLine(line, maxUnits));
    });
    return collapseBlankLines(lines);
  }

  function trimChunkLines(lines) {
    return collapseBlankLines(lines).join('\n');
  }

  function printSongComparator(a, b) {
    if (state.sort === 'title') return a.title.localeCompare(b.title, 'zh-Hans-CN', { numeric: true, sensitivity: 'base' });
    if (state.sort === 'status') return statusRank(a) - statusRank(b) || a.title.localeCompare(b.title, 'zh-Hans-CN');
    if (state.sort === 'progress') return Number(hasLyrics(b)) - Number(hasLyrics(a)) || versionsFor(b, false).filter(versionHasContent).length - versionsFor(a, false).filter(versionHasContent).length || a.title.localeCompare(b.title, 'zh-Hans-CN');
    if (state.sort === 'setlist') return compareKeys(setlistSortKey(a), setlistSortKey(b));
    return Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, ''));
  }

  function printSelection(settings = printSettings()) {
    const scope = settings.scope || 'filtered';
    if (scope === 'current') return [currentSong()].filter(Boolean);
    if (scope === 'setlist') {
      return setlistSongIds(activeSetlist(), settings.includeOptionalSetlistSections)
        .map((id) => songs.find((song) => song.id === id))
        .filter(Boolean);
    }
    if (scope === 'all') return [...songs].sort(printSongComparator);
    return filteredSongs.length ? [...filteredSongs] : [...songs].sort(printSongComparator);
  }

  function printSettings() {
    return {
      size: $('input[name="printSize"]:checked')?.value || 'a4',
      scope: $('input[name="printScope"]:checked')?.value || 'filtered',
      pagePolicy: elements.printPagePolicy?.value || 'limit',
      versionMode: elements.printVersions?.value || 'default',
      lineFlow: elements.printLineFlow?.value || 'auto',
      columns: elements.printColumns?.value || 'auto',
      bilingual: elements.printBilingual?.value || 'auto',
      cover: elements.printCover.checked,
      toc: elements.printToc.checked,
      includeEmpty: elements.printEmpty.checked,
      notes: elements.printNotes.checked,
      compactWhitespace: elements.printCompact?.checked !== false,
      includeOptionalSetlistSections: elements.printSetlistOptional?.checked !== false,
    };
  }

  function versionsForPrint(song, settings) {
    const library = libraryFor(song, false);
    if (!library) return settings.includeEmpty ? [createVersion('', { name: '默认版' })] : [];
    let selected = [];
    if (settings.versionMode === 'all') {
      selected = library.versions.filter(versionHasContent);
    } else if (settings.versionMode === 'current' && song.id === state.selectedId) {
      const current = selectedVersion(song, false);
      if (current) selected = [current];
    } else {
      const fallback = defaultLyricVersion(song, false);
      if (fallback) selected = [fallback];
    }
    selected = selected.filter((version) => settings.includeEmpty || versionHasContent(version));
    if (!selected.length && settings.includeEmpty) {
      const fallback = defaultLyricVersion(song, false) || library.versions[0] || createVersion('', { name: '默认版' });
      selected = [fallback];
    }
    return selected.map((version) => ({
      ...version,
      isDefault: version.id === library.defaultVersionId,
    }));
  }

  function roughWrappedLines(text, targetSize, columns = 1) {
    const maxUnits = targetSize === 'a4' ? (columns === 2 ? 24 : 48) : (columns === 2 ? 17 : 35);
    return String(text || '').split('\n').reduce((sum, line) => {
      if (!line.trim()) return sum + 0.52;
      return sum + Math.max(1, Math.ceil(lineUnits(line) / maxUnits));
    }, 0);
  }

  function tocGroupsForSongs(songList, settings) {
    const selectedIds = new Set(songList.map((song) => song.id));
    const used = new Set();
    const groups = [];
    const setlist = activeSetlist();

    if (setlist && settings.scope !== 'current') {
      const includeOptional = settings.scope === 'setlist'
        ? settings.includeOptionalSetlistSections
        : true;
      const sections = setlistSections(setlist, includeOptional).map((section) => {
        const sectionSongs = [];
        section.items.forEach((item) => {
          if (!item.songId || used.has(item.songId) || !selectedIds.has(item.songId)) return;
          const song = songList.find((entry) => entry.id === item.songId);
          if (!song) return;
          used.add(item.songId);
          sectionSongs.push(song);
        });
        return sectionSongs.length ? {
          name: section.name,
          kind: section.kind,
          optional: Boolean(section.optional),
          songs: sectionSongs,
        } : null;
      }).filter(Boolean);

      if (sections.length) {
        groups.push({
          title: setlist.name, // Kicker 已区分“仅歌单”与“全部曲库”，避免长前缀挤占目录高度。
          kicker: settings.scope === 'setlist' ? 'SETLIST CONTENTS' : 'SETLIST FIRST',
          type: 'setlist',
          sections,
        });
      }
    }

    if (settings.scope !== 'setlist') {
      const remaining = songList.filter((song) => !used.has(song.id));
      if (remaining.length) {
        groups.push({
          title: groups.length ? '候选与其他曲目' : '曲目目录',
          kicker: groups.length ? 'ADDITIONAL SONGS' : 'CONTENTS',
          type: groups.length ? 'extra' : 'all',
          sections: [{ name: groups.length ? '未列入当前演出歌单' : '全部曲目', optional: false, kind: 'extra', songs: remaining }],
        });
      }
    }

    if (!groups.length && songList.length) {
      groups.push({
        title: '曲目目录',
        kicker: 'CONTENTS',
        type: 'all',
        sections: [{ name: '全部曲目', optional: false, kind: 'all', songs: songList }],
      });
    }
    return groups;
  }


  function estimateTocPageCount(songList, settings, targetSize) {
    if (!settings.toc || !songList.length) return 0;
    return paginateTocGroups(tocGroupsForSongs(songList, settings), targetSize).length;
  }

  function estimateLogicalPages(selection, settings) {
    const targetSize = settings.size === 'a4' ? 'a4' : 'a5';
    const printable = selection.filter((song) => settings.includeEmpty || hasLyrics(song));
    let count = settings.cover ? 1 : 0;
    if (settings.toc && printable.length) count += estimateTocPageCount(printable, settings, targetSize);

    printable.forEach((song) => {
      const versions = versionsForPrint(song, settings);
      if (settings.pagePolicy === 'limit') {
        if (versions.length <= 1) {
          count += 1;
          return;
        }
        const weightedLines = versions.reduce((sum, version) => {
          const original = normalizePrintLyrics(version.original, settings.compactWhitespace);
          const translation = normalizePrintLyrics(version.translation, settings.compactWhitespace);
          return sum + Math.max(roughWrappedLines(original, targetSize), roughWrappedLines(translation, targetSize));
        }, 0);
        const onePageHint = targetSize === 'a4' ? 64 : 48;
        count += weightedLines <= onePageHint ? 1 : 2;
        return;
      }

      if (!versions.length || !versions.some(versionHasContent)) {
        count += 1;
        return;
      }
      let songPages = 0;
      versions.forEach((version) => {
        const original = normalizePrintLyrics(version.original, settings.compactWhitespace);
        const translation = normalizePrintLyrics(version.translation, settings.compactWhitespace);
        if (translation) {
          const lines = Math.max(roughWrappedLines(original, targetSize), roughWrappedLines(translation, targetSize));
          songPages += Math.max(1, Math.ceil(lines / (targetSize === 'a4' ? 38 : 31)));
        } else {
          const slashText = settings.lineFlow === 'preserve' ? original : mergeShortLyricLines(original, targetSize);
          const likelyTwo = settings.columns === 'two' || (settings.columns === 'auto' && roughWrappedLines(slashText, targetSize) > (targetSize === 'a4' ? 43 : 35));
          const lines = roughWrappedLines(slashText, targetSize, likelyTwo ? 2 : 1);
          const capacity = targetSize === 'a4' ? 43 : 35;
          songPages += Math.max(1, Math.ceil(lines / (capacity * (likelyTwo ? 1.75 : 1))));
        }
      });
      count += Math.max(1, songPages);
    });
    count += 1;
    return { count, printable };
  }

  function updateBookletPreview(logicalCount, settings) {
    if (!elements.bookletPreview) return;
    const visible = settings.size === 'booklet' && logicalCount > 0;
    elements.bookletPreview.hidden = !visible;
    if (!visible) {
      elements.bookletPreview.replaceChildren();
      return;
    }
    const padded = Math.max(4, Math.ceil(logicalCount / 4) * 4);
    const blankCount = padded - logicalCount;
    elements.bookletPreview.innerHTML = `
      <div class="booklet-preview-copy"><b>第 1 张 A4 纸的拼版预览</b><small>${padded} 个逻辑页 · ${padded / 4} 张双面 A4${blankCount ? ` · 自动补 ${blankCount} 个空白页` : ''}</small></div>
      <div class="booklet-preview-sides">
        <div class="booklet-preview-side"><span>正面</span><div><b>${padded}</b><i>左</i></div><div><b>1</b><i>右</i></div></div>
        <div class="booklet-preview-side"><span>背面</span><div><b>2</b><i>左</i></div><div><b>${padded - 1}</b><i>右</i></div></div>
      </div>
      <p>系统打印时选 A4 横向、双面、短边翻转、每张 1 页、100% 实际尺寸；不要再次选择“小册子”或“每张 2 页”。</p>`;
  }

  function updatePrintEstimate() {
    const settings = printSettings();
    const selection = printSelection(settings);
    const { count, printable } = estimateLogicalPages(selection, settings);
    const optionalSwitch = elements.printSetlistOptional?.closest('.form-check');
    if (optionalSwitch) optionalSwitch.hidden = settings.scope !== 'setlist';
    updateBookletPreview(count, settings);
    if (!printable.length) {
      elements.printEstimate.textContent = '当前设置没有可输出歌曲；请勾选“包含尚未导入歌词的曲目”或先导入歌词。';
      return;
    }
    const versionLabel = settings.versionMode === 'all' ? '全部歌词版本' : settings.versionMode === 'current' ? '当前歌曲当前版本，其余默认版' : '默认版本';
    const policyLabel = settings.pagePolicy === 'limit' ? '单版本 1 页 / 多版本最多 2 页，并自动寻找最大字号' : '可读性优先，必要时续页';
    const scopeLabel = settings.scope === 'setlist'
      ? `仅当前歌单${settings.includeOptionalSetlistSections ? '（含可选章节）' : '（仅固定章节）'}`
      : settings.scope === 'all' ? '全部曲库' : settings.scope === 'current' ? '当前歌曲' : '当前筛选结果';
    if (settings.size === 'booklet') {
      const padded = Math.ceil(count / 4) * 4;
      elements.printEstimate.textContent = `预计 ${printable.length} 首、约 ${padded} 个 A5 逻辑页，拼成约 ${padded / 4} 张双面 A4 纸；范围：${scopeLabel}；输出：${versionLabel}；策略：${policyLabel}。最终页数以实测排版为准。`;
    } else {
      elements.printEstimate.textContent = `预计 ${printable.length} 首、约 ${count} 页 ${settings.size.toUpperCase()}；范围：${scopeLabel}；输出：${versionLabel}；策略：${policyLabel}。生成时会逐页实测。`;
    }
  }

  function pageShell(content, classes = '', pageNumber = '', anchorId = '') {
    const idAttribute = anchorId ? ` id="${escapeHTML(anchorId)}"` : '';
    return `<section class="print-page ${classes}"${idAttribute}><div class="print-page-inner"><div class="print-page-content">${content}</div></div>${pageNumber ? `<div class="print-page-number">${escapeHTML(pageNumber)}</div>` : ''}</section>`;
  }

  function coverPage(settings) {
    const setlist = activeSetlist();
    const subtitle = settings.size === 'booklet' ? 'A4 对折小册打印版' : `${settings.size.toUpperCase()} 打印版`;
    const order = state.sort === 'setlist' && setlist ? ` · ${setlist.name}` : '';
    return `<section class="print-page print-cover"><div class="print-cover-content"><div class="print-cover-mark">G</div><h1>I AM GLORIA<br>私人歌词本</h1><p>多版本 · 原文翻译 · 自适应最大字号 · 智能单页</p><div class="print-cover-meta">${escapeHTML(subtitle + order)}</div><div class="print-cover-copyright">${escapeHTML(COPYRIGHT_NOTICE)}</div></div></section>`;
  }

  function colophonPage(pageNumber) {
    return pageShell(`<div class="print-colophon"><h2>关于这本歌词本</h2><p>歌词来自使用者自行导入且有权使用的文本。打印副本可以在不改动原始数据的前提下，将连续超短行合并为“上一句 / 下一句”，并在必要时改为双栏。</p><p>默认分页策略会让单版本歌曲保持 1 页，多版本歌曲最多 2 页，并逐页实测可容纳的最大字号；也可切换到可读性优先模式。</p><p>A4 对折版请使用双面打印、短边翻转、实际尺寸 100%，正式印刷前先测试一张纸。</p><p class="print-copyright">${escapeHTML(COPYRIGHT_NOTICE)} · App v${escapeHTML(APP_VERSION)}</p></div>`, 'print-colophon', pageNumber);
  }

  function printSongStatus(song) {
    const info = setlistInfo(song);
    if (state.sort === 'setlist' && info) return `${info.section.name} · 第 ${info.itemIndex + 1} 首`;
    if (state.sort === 'setlist' && song.tags.includes('2026返场')) return 'Encore / 返场候选';
    if (state.sort === 'setlist') return '额外曲目';
    return descriptiveStatus(song);
  }

  function fitStyle(fit) {
    if (!fit) return '';
    const safe = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    return [
      `--fit-font-size:${safe(fit.fontSize, 3.2)}mm`,
      `--fit-line-height:${safe(fit.lineHeight, 1.4)}`,
      `--fit-version-heading-size:${safe(fit.headingSize, 3.8)}mm`,
      `--fit-label-size:${safe(fit.labelSize, 1.9)}mm`,
      `--fit-note-size:${safe(fit.noteSize, 2.2)}mm`,
      `--fit-section-gap:${safe(fit.sectionGap, 3)}mm`,
    ].join(';');
  }

  function songPage(song, bodyHtml, pageIndex, pageTotal, pageNumber, settings, density = 'standard', extraClasses = '', fit = null) {
    const isContinuation = pageIndex > 0;
    const aliases = !isContinuation && song.aliases?.length ? `版本 / 别名：${song.aliases.join(' · ')}` : '';
    const tags = !isContinuation ? (song.tags || []).map((tag) => `<span class="print-tag">${escapeHTML(tag)}</span>`).join('') : '';
    const continuation = pageTotal > 1 ? ` · ${pageIndex + 1}/${pageTotal}` : '';
    const note = !isContinuation && settings.notes && song.note ? `<div class="print-note">${escapeHTML(song.note)}</div>` : '';
    const classes = [
      'print-song-page',
      `print-density-${fit ? 'fit' : density}`,
      isContinuation ? 'print-continuation' : '',
      fit?.metaCompact ? 'print-meta-compact' : '',
      fit?.metaMinimal ? 'print-meta-minimal' : '',
      extraClasses,
    ].filter(Boolean).join(' ');
    const fitWrapper = fit
      ? `<div class="print-fit-scope" style="${fitStyle(fit)}">${bodyHtml}</div>`
      : `<div class="print-fit-scope">${bodyHtml}</div>`;
    return pageShell(`
      <div class="print-running-head"><span>G.E.M. · I AM GLORIA</span><span>${escapeHTML(printSongStatus(song))}</span></div>
      <h2 class="print-song-title">${escapeHTML(song.title)}${continuation}</h2>
      ${aliases ? `<div class="print-song-subtitle">${escapeHTML(aliases)}</div>` : ''}
      ${tags ? `<div class="print-tags">${tags}</div>` : ''}
      ${note}
      ${fitWrapper}
    `, classes, pageNumber, pageIndex === 0 ? `print-song-${song.id}` : '');
  }

  function beginMeasurement(targetSize) {
    elements.printRoot.innerHTML = '';
    elements.printRoot.className = `print-root print-measuring print-size-${targetSize}`;
    elements.printRoot.setAttribute('aria-hidden', 'true');
  }

  function endMeasurement() {
    elements.printRoot.innerHTML = '';
    elements.printRoot.className = 'print-root';
    elements.printRoot.setAttribute('aria-hidden', 'true');
  }

  function bodyFits(song, bodyHtml, pageIndex, settings, density = 'standard', extraClasses = '', fit = null) {
    elements.printRoot.innerHTML = songPage(song, bodyHtml, pageIndex, 99, 888, settings, density, extraClasses, fit);
    const page = elements.printRoot.firstElementChild;
    const inner = page?.querySelector('.print-page-inner');
    const content = page?.querySelector('.print-page-content');
    const number = page?.querySelector('.print-page-number');
    if (!page || !inner || !content) return false;
    const tolerance = 0.45;
    const heightFits = page.scrollHeight <= page.clientHeight + tolerance
      && inner.scrollHeight <= inner.clientHeight + tolerance
      && content.scrollHeight <= content.clientHeight + tolerance;
    if (!heightFits) return false;
    if (!number) return true;
    const contentRect = content.getBoundingClientRect();
    const numberRect = number.getBoundingClientRect();
    return contentRect.bottom <= numberRect.top - 1.5;
  }

  function renderTextLines(lines, wrapperClass = 'print-version-body') {
    const content = collapseBlankLines(lines).map((line) => line.trim()
      ? `<div class="print-text-line">${escapeHTML(line)}</div>`
      : '<div class="print-text-line print-blank-line" aria-hidden="true">&nbsp;</div>').join('');
    return `<div class="${wrapperClass}">${content}</div>`;
  }

  function splitLinesForColumns(lines, targetSize) {
    const clean = collapseBlankLines(lines);
    if (clean.length < 2) return [clean, []];
    const wrapUnits = targetSize === 'a4' ? 24 : 17;
    const weights = clean.map((line) => line.trim() ? Math.max(1, Math.ceil(lineUnits(line) / wrapUnits)) : 0.55);
    const total = weights.reduce((sum, value) => sum + value, 0);
    let running = 0;
    let best = 1;
    let difference = Number.POSITIVE_INFINITY;
    for (let index = 1; index < clean.length; index += 1) {
      running += weights[index - 1];
      let penalty = Math.abs(total / 2 - running);
      if (!clean[index - 1].trim() || !clean[index].trim()) penalty -= 0.45;
      if (penalty < difference) {
        difference = penalty;
        best = index;
      }
    }
    const left = collapseBlankLines(clean.slice(0, best));
    const right = collapseBlankLines(clean.slice(best));
    return [left, right];
  }

  function renderVersionHeading(version, continuation = false, show = true) {
    if (!show) return '';
    const flags = [versionTypeLabel(version.type)];
    if (version.isDefault) flags.push('默认版本');
    if (continuation) flags.push('续');
    return `<div class="print-version-heading"><b>${escapeHTML(version.name || '默认版')}</b><small>${escapeHTML(flags.join(' · '))}</small></div>${version.note ? `<div class="print-version-note">${escapeHTML(version.note)}</div>` : ''}`;
  }

  function renderMonolingualVersionBody(version, lines, options = {}) {
    const heading = renderVersionHeading(version, options.continuation, options.showHeading);
    const label = options.showLabel ? `<div class="print-lyric-label">${escapeHTML(options.label || version.originalLabel || '歌词')}</div>` : '';
    let lyrics = '';
    if (options.columns === 2) {
      const [left, right] = splitLinesForColumns(lines, options.targetSize);
      lyrics = `<div class="print-lyrics-columns"><div class="print-column">${renderTextLines(left)}</div><div class="print-column">${renderTextLines(right)}</div></div>`;
    } else {
      lyrics = renderTextLines(lines);
    }
    return `<section class="print-version-section">${heading}${label}${lyrics}</section>`;
  }

  function pairedRows(original, translation, targetSize) {
    const maxUnits = targetSize === 'a4' ? 65 : 43;
    const leftLines = collapseBlankLines(String(original || '').split('\n'));
    const rightLines = collapseBlankLines(String(translation || '').split('\n'));
    const rows = [];
    const length = Math.max(leftLines.length, rightLines.length);
    for (let index = 0; index < length; index += 1) {
      const leftParts = softWrapLine(leftLines[index] || '', maxUnits);
      const rightParts = softWrapLine(rightLines[index] || '', maxUnits);
      const parts = Math.max(leftParts.length, rightParts.length);
      for (let part = 0; part < parts; part += 1) rows.push({ left: leftParts[part] || '', right: rightParts[part] || '' });
    }
    return rows;
  }

  function renderParallelVersionBody(version, rows, options = {}) {
    const heading = renderVersionHeading(version, options.continuation, options.showHeading);
    const labels = `<div class="print-paired-labels"><div class="print-lyric-label">${escapeHTML(version.originalLabel || '原文')}</div><div class="print-lyric-label">${escapeHTML(version.translationLabel || '中文翻译')}</div></div>`;
    const grid = rows.map((row) => `<div class="pair-cell${row.left ? '' : ' print-blank-line'}">${row.left ? escapeHTML(row.left) : '&nbsp;'}</div><div class="pair-cell${row.right ? '' : ' print-blank-line'}">${row.right ? escapeHTML(row.right) : '&nbsp;'}</div>`).join('');
    return `<section class="print-version-section">${heading}${labels}<div class="print-paired-grid">${grid}</div></section>`;
  }

  function renderStackedFullVersionBody(version, originalLines, translationLines, options = {}) {
    const heading = renderVersionHeading(version, options.continuation, options.showHeading);
    const original = `<div class="print-stacked-language"><div class="print-lyric-label">${escapeHTML(version.originalLabel || '原文')}</div>${renderTextLines(originalLines)}</div>`;
    const translation = `<div class="print-stacked-language"><div class="print-lyric-label">${escapeHTML(version.translationLabel || '中文翻译')}</div>${renderTextLines(translationLines)}</div>`;
    return `<section class="print-version-section">${heading}<div class="print-lyrics-stacked">${original}${translation}</div></section>`;
  }


  function renderIndependentParallelVersionBody(version, originalLines, translationLines, options = {}) {
    const heading = renderVersionHeading(version, options.continuation, options.showHeading);
    const original = `<div class="print-parallel-pane"><div class="print-lyric-label">${escapeHTML(version.originalLabel || '原文')}</div>${renderTextLines(originalLines)}</div>`;
    const translation = `<div class="print-parallel-pane"><div class="print-lyric-label">${escapeHTML(version.translationLabel || '中文翻译')}</div>${renderTextLines(translationLines)}</div>`;
    return `<section class="print-version-section">${heading}<div class="print-lyrics-parallel">${original}${translation}</div></section>`;
  }

  function constrainedFitLimits(targetSize) {
    return targetSize === 'a4'
      ? { min: 1.5, emergencyMin: 0.72, max: 6.8, preferred: 2.65 }
      : { min: 1.12, emergencyMin: 0.62, max: 4.65, preferred: 1.9 };
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function fitProfile(fontSize, targetSize, metaLevel = 0) {
    const limits = constrainedFitLimits(targetSize);
    const ratio = clampNumber((fontSize - limits.min) / Math.max(0.01, limits.max - limits.min), 0, 1);
    const lineHeight = (targetSize === 'a4' ? 1.17 : 1.14) + ratio * (targetSize === 'a4' ? 0.29 : 0.27);
    const headingSize = clampNumber(fontSize * 0.76, targetSize === 'a4' ? 2.25 : 1.65, targetSize === 'a4' ? 4.45 : 3.15);
    const labelSize = clampNumber(fontSize * 0.5, targetSize === 'a4' ? 1.45 : 1.1, targetSize === 'a4' ? 2.25 : 1.65);
    const noteSize = clampNumber(fontSize * 0.58, targetSize === 'a4' ? 1.55 : 1.15, targetSize === 'a4' ? 2.55 : 1.8);
    return {
      fontSize: Number(fontSize.toFixed(3)),
      lineHeight: Number(lineHeight.toFixed(3)),
      headingSize: Number(headingSize.toFixed(3)),
      labelSize: Number(labelSize.toFixed(3)),
      noteSize: Number(noteSize.toFixed(3)),
      sectionGap: metaLevel >= 2 ? (targetSize === 'a4' ? 1.4 : 0.9) : metaLevel === 1 ? (targetSize === 'a4' ? 2.2 : 1.4) : (targetSize === 'a4' ? 3.2 : 2.1),
      metaCompact: metaLevel >= 1,
      metaMinimal: metaLevel >= 2,
      metaLevel,
    };
  }

  function maxFittingFont(song, bodyHtml, pageIndex, settings, targetSize, extraClasses, metaLevel, minOverride = null, maxOverride = null) {
    const limits = constrainedFitLimits(targetSize);
    const min = minOverride ?? limits.min;
    const max = maxOverride ?? limits.max;
    const fits = (fontSize) => {
      const profile = fitProfile(fontSize, targetSize, metaLevel);
      return bodyFits(song, bodyHtml, pageIndex, settings, 'fit', extraClasses, profile);
    };

    const safety = targetSize === 'a4' ? 0.055 : 0.038;
    if (fits(max)) return fitProfile(Math.max(min, max - safety), targetSize, metaLevel);
    if (!fits(min)) return null;
    let low = min;
    let high = max;
    for (let index = 0; index < 12; index += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    return fitProfile(Math.max(min, low - safety), targetSize, metaLevel);
  }

  function constrainedCandidatePenalty(candidate) {
    let penalty = 0;
    if (candidate.lineFlow === 'slash') penalty += 0.035;
    if (candidate.columns === 2) penalty += 0.025;
    if (candidate.layout === 'stacked') penalty += 0.018;
    if (candidate.layout === 'parallel-independent') penalty += 0.006;
    return penalty;
  }

  function scoreConstrainedFit(candidate, fit) {
    const metadataPenalty = fit.metaLevel === 0 ? 0 : fit.metaLevel === 1 ? 0.055 : 0.13;
    return fit.fontSize - metadataPenalty - constrainedCandidatePenalty(candidate);
  }

  function constrainedVersionCandidates(version, settings, targetSize, showHeading) {
    const original = normalizePrintLyrics(version.original, settings.compactWhitespace);
    const translation = normalizePrintLyrics(version.translation, settings.compactWhitespace);
    if (!original && !translation) {
      const body = `<section class="print-version-section">${renderVersionHeading(version, false, showHeading)}<div class="print-placeholder"><div><b>歌词尚未导入</b><br>请在电子版中粘贴你有权使用的歌词后重新生成 PDF。</div></div></section>`;
      return [{ body, lineFlow: 'preserve', columns: 1, layout: 'empty' }];
    }

    if (!original || !translation) {
      const mono = original || translation;
      const versions = lineFlowVariants(mono, settings, targetSize);
      const columnChoices = settings.columns === 'one' ? [1] : settings.columns === 'two' ? [2] : [1, 2];
      return versions.flatMap((variant) => columnChoices.map((columns) => {
        const lines = textToLines(variant.text, targetSize, columns);
        const body = renderMonolingualVersionBody({ ...version, original: mono, translation: '' }, lines, {
          continuation: false,
          showHeading,
          showLabel: Boolean(translation && !original),
          label: translation && !original ? version.translationLabel : version.originalLabel,
          columns,
          targetSize,
        });
        return { body, lineFlow: variant.mode, columns, layout: 'mono' };
      }));
    }

    const layoutChoices = settings.bilingual === 'parallel'
      ? ['parallel']
      : settings.bilingual === 'stacked'
        ? ['stacked']
        : ['parallel', 'stacked'];
    const candidates = [];
    bilingualFlowVariants({ ...version, original, translation }, settings, targetSize).forEach((variant) => {
      layoutChoices.forEach((layout) => {
        if (layout === 'parallel') {
          if (version.lineAligned) {
            const rows = pairedRows(variant.original, variant.translation, targetSize);
            candidates.push({
              body: renderParallelVersionBody(version, rows, { continuation: false, showHeading }),
              lineFlow: variant.mode,
              columns: 2,
              layout: 'parallel-aligned',
            });
          } else {
            candidates.push({
              body: renderIndependentParallelVersionBody(
                version,
                textToLines(variant.original, targetSize, 2),
                textToLines(variant.translation, targetSize, 2),
                { continuation: false, showHeading },
              ),
              lineFlow: variant.mode,
              columns: 2,
              layout: 'parallel-independent',
            });
          }
        } else {
          candidates.push({
            body: renderStackedFullVersionBody(
              version,
              textToLines(variant.original, targetSize, 1),
              textToLines(variant.translation, targetSize, 1),
              { continuation: false, showHeading },
            ),
            lineFlow: variant.mode,
            columns: 1,
            layout: 'stacked',
          });
        }
      });
    });
    return candidates;
  }

  function candidateCombinations(candidateLists, limit = 96) {
    let combinations = [[]];
    candidateLists.forEach((list) => {
      const next = [];
      combinations.forEach((combination) => {
        list.forEach((candidate) => {
          if (next.length < limit) next.push([...combination, candidate]);
        });
      });
      combinations = next;
    });
    return combinations;
  }

  function fitVersionGroup(song, versions, settings, targetSize, showHeading, pageIndex = 0) {
    const candidateLists = versions.map((version) => constrainedVersionCandidates(version, settings, targetSize, showHeading));
    const combinations = candidateCombinations(candidateLists);
    const extraClasses = versions.length > 1 ? 'print-combined-versions-page' : '';
    const limits = constrainedFitLimits(targetSize);
    let best = null;

    combinations.forEach((combination) => {
      const body = `<div class="print-combined-versions">${combination.map((candidate) => candidate.body).join('')}</div>`;
      const representative = {
        lineFlow: combination.some((candidate) => candidate.lineFlow === 'slash') ? 'slash' : 'preserve',
        columns: Math.max(...combination.map((candidate) => candidate.columns || 1)),
        layout: combination.map((candidate) => candidate.layout).join('+'),
      };
      const tryLevels = [0, 1];
      let localBest = null;
      tryLevels.forEach((metaLevel) => {
        const fit = maxFittingFont(song, body, pageIndex, settings, targetSize, extraClasses, metaLevel);
        if (!fit) return;
        const score = scoreConstrainedFit(representative, fit);
        if (!localBest || score > localBest.score) localBest = { body, fit, score, representative };
      });
      if ((!localBest || localBest.fit.fontSize < limits.min + 0.18)) {
        const fit = maxFittingFont(song, body, pageIndex, settings, targetSize, extraClasses, 2);
        if (fit) {
          const score = scoreConstrainedFit(representative, fit);
          if (!localBest || score > localBest.score) localBest = { body, fit, score, representative };
        }
      }
      if (localBest && (!best || localBest.score > best.score)) best = localBest;
    });

    if (!best && combinations.length) {
      const combination = combinations[combinations.length - 1];
      const body = `<div class="print-combined-versions">${combination.map((candidate) => candidate.body).join('')}</div>`;
      const fit = maxFittingFont(song, body, pageIndex, settings, targetSize, extraClasses, 2, limits.emergencyMin, limits.min);
      if (fit) best = { body, fit, score: fit.fontSize - 0.5 };
    }

    if (!best) {
      const fallbackBody = `<div class="print-combined-versions">${candidateLists.map((list) => list.at(-1)?.body || '').join('')}</div>`;
      const fit = fitProfile(constrainedFitLimits(targetSize).emergencyMin, targetSize, 2);
      best = { body: fallbackBody, fit, score: -999 };
    }

    return {
      body: best.body,
      density: 'fit',
      fit: best.fit,
      extraClasses,
    };
  }

  function constrainedPlanScore(pages) {
    if (!pages.length) return -Infinity;
    const fonts = pages.map((page) => page.fit?.fontSize || 0);
    const minimum = Math.min(...fonts);
    const average = fonts.reduce((sum, value) => sum + value, 0) / fonts.length;
    return minimum * 10 + average - (pages.length - 1) * 0.08;
  }

  function buildConstrainedSongPlan(song, settings, targetSize) {
    const versions = versionsForPrint(song, settings);
    if (!versions.length) return [];
    const storedContentVersionCount = versionsFor(song, false).filter(versionHasContent).length;
    const showVersionHeadings = storedContentVersionCount > 1;
    const singlePage = fitVersionGroup(song, versions, settings, targetSize, showVersionHeadings, 0);
    if (versions.length <= 1) return [singlePage];

    const limits = constrainedFitLimits(targetSize);
    let bestTwoPagePlan = null;
    for (let split = 1; split < versions.length; split += 1) {
      const first = fitVersionGroup(song, versions.slice(0, split), settings, targetSize, showVersionHeadings, 0);
      const second = fitVersionGroup(song, versions.slice(split), settings, targetSize, showVersionHeadings, 1);
      const plan = [first, second];
      if (!bestTwoPagePlan || constrainedPlanScore(plan) > constrainedPlanScore(bestTwoPagePlan)) bestTwoPagePlan = plan;
    }

    if (!bestTwoPagePlan) return [singlePage];
    const oneFont = singlePage.fit?.fontSize || 0;
    const twoMin = Math.min(...bestTwoPagePlan.map((page) => page.fit?.fontSize || 0));
    const preferOnePage = oneFont >= limits.preferred || oneFont >= twoMin * 0.82;
    return preferOnePage ? [singlePage] : bestTwoPagePlan;
  }

  function paginateUnits(song, units, renderChunk, settings, density) {
    const remaining = [...units];
    const pages = [];
    let guard = 0;
    while (remaining.length && guard < 2000) {
      guard += 1;
      while (remaining.length && remaining[0]?.__trimBlank) remaining.shift();
      if (!remaining.length) break;
      const pageIndex = pages.length;
      let low = 1;
      let high = remaining.length;
      let best = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const body = renderChunk(remaining.slice(0, middle), pageIndex);
        if (bodyFits(song, body, pageIndex, settings, density)) {
          best = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      if (!best) best = 1;
      const slice = remaining.splice(0, best);
      pages.push(renderChunk(slice, pageIndex));
    }
    return pages.length ? pages : [renderChunk([], 0)];
  }

  function lineFlowVariants(text, settings, targetSize) {
    const normalized = normalizePrintLyrics(text, settings.compactWhitespace);
    if (!normalized) return [{ mode: 'preserve', text: '' }];
    if (settings.lineFlow === 'preserve') return [{ mode: 'preserve', text: normalized }];
    const merged = mergeShortLyricLines(normalized, targetSize);
    if (settings.lineFlow === 'slash') return [{ mode: 'slash', text: merged }];
    const variants = [{ mode: 'preserve', text: normalized }];
    if (merged && merged !== normalized) variants.push({ mode: 'slash', text: merged });
    return variants;
  }

  function candidateScore(candidate) {
    const flowPenalty = candidate.lineFlow === 'preserve' ? 0 : 2;
    const columnPenalty = candidate.columns === 1 ? 0 : 1;
    const densityPenalty = candidate.density === 'standard' ? 0 : 0.5;
    const layoutPenalty = candidate.layout === 'parallel' ? 0 : 0.2;
    return candidate.pages.length * 100 + flowPenalty + columnPenalty + densityPenalty + layoutPenalty;
  }

  function bestCandidate(candidates) {
    return [...candidates].sort((a, b) => candidateScore(a) - candidateScore(b))[0];
  }

  function paginateMonolingualVersion(song, version, settings, targetSize, showHeading) {
    const variants = lineFlowVariants(version.original || version.translation, settings, targetSize);
    const columns = settings.columns === 'one' ? [1] : settings.columns === 'two' ? [2] : [1, 2];
    const densities = ['standard', 'compact'];
    const candidates = [];

    variants.forEach((variant) => {
      columns.forEach((columnCount) => {
        const lines = textToLines(variant.text, targetSize, columnCount);
        densities.forEach((density) => {
          const renderChunk = (slice, pageIndex) => renderMonolingualVersionBody(version, slice, {
            continuation: pageIndex > 0,
            showHeading,
            showLabel: Boolean(version.translation && !version.original),
            label: version.translation && !version.original ? version.translationLabel : version.originalLabel,
            columns: columnCount,
            targetSize,
          });
          const pages = paginateUnits(song, lines, renderChunk, settings, density);
          const fullBodyHtml = renderChunk(lines, 0);
          candidates.push({ pages, fullBodyHtml, density, lineFlow: variant.mode, columns: columnCount, layout: 'mono' });
        });
      });
    });
    return bestCandidate(candidates);
  }

  function bilingualFlowVariants(version, settings, targetSize) {
    const original = normalizePrintLyrics(version.original, settings.compactWhitespace);
    const translation = normalizePrintLyrics(version.translation, settings.compactWhitespace);
    if (settings.lineFlow === 'preserve' || version.lineAligned) return [{ mode: 'preserve', original, translation }];
    const mergedOriginal = mergeShortLyricLines(original, targetSize);
    const mergedTranslation = mergeShortLyricLines(translation, targetSize);
    if (settings.lineFlow === 'slash') return [{ mode: 'slash', original: mergedOriginal, translation: mergedTranslation }];
    const variants = [{ mode: 'preserve', original, translation }];
    if (mergedOriginal !== original || mergedTranslation !== translation) variants.push({ mode: 'slash', original: mergedOriginal, translation: mergedTranslation });
    return variants;
  }

  function paginateParallelVersion(song, version, settings, targetSize, showHeading) {
    const candidates = [];
    bilingualFlowVariants(version, settings, targetSize).forEach((variant) => {
      const rows = pairedRows(variant.original, variant.translation, targetSize);
      ['standard', 'compact'].forEach((density) => {
        const renderChunk = (slice, pageIndex) => renderParallelVersionBody(version, slice, {
          continuation: pageIndex > 0,
          showHeading,
        });
        const pages = paginateUnits(song, rows, renderChunk, settings, density);
        candidates.push({ pages, fullBodyHtml: renderChunk(rows, 0), density, lineFlow: variant.mode, columns: 2, layout: 'parallel' });
      });
    });
    return bestCandidate(candidates);
  }

  function paginateStackedLanguage(song, version, text, label, settings, targetSize, density, continuationOffset, showHeading) {
    const lines = textToLines(text, targetSize, 1);
    const renderChunk = (slice, localIndex) => renderMonolingualVersionBody(version, slice, {
      continuation: continuationOffset + localIndex > 0,
      showHeading,
      showLabel: true,
      label,
      columns: 1,
      targetSize,
    });
    return paginateUnits(song, lines, (slice, localIndex) => renderChunk(slice, localIndex), settings, density);
  }

  function paginateStackedVersion(song, version, settings, targetSize, showHeading) {
    const candidates = [];
    bilingualFlowVariants(version, settings, targetSize).forEach((variant) => {
      const originalLines = textToLines(variant.original, targetSize, 1);
      const translationLines = textToLines(variant.translation, targetSize, 1);
      ['standard', 'compact'].forEach((density) => {
        const fullBodyHtml = renderStackedFullVersionBody(version, originalLines, translationLines, { showHeading });
        if (bodyFits(song, fullBodyHtml, 0, settings, density)) {
          candidates.push({ pages: [fullBodyHtml], fullBodyHtml, density, lineFlow: variant.mode, columns: 1, layout: 'stacked' });
          return;
        }
        const originalPages = paginateStackedLanguage(song, version, variant.original, version.originalLabel || '原文', settings, targetSize, density, 0, showHeading);
        const translationPages = paginateStackedLanguage(song, version, variant.translation, version.translationLabel || '中文翻译', settings, targetSize, density, originalPages.length, showHeading);
        candidates.push({ pages: [...originalPages, ...translationPages], fullBodyHtml, density, lineFlow: variant.mode, columns: 1, layout: 'stacked' });
      });
    });
    return bestCandidate(candidates);
  }

  function paginateVersion(song, version, settings, targetSize, showHeading) {
    const original = normalizePrintLyrics(version.original, settings.compactWhitespace);
    const translation = normalizePrintLyrics(version.translation, settings.compactWhitespace);
    if (!original && !translation) {
      const body = `<section class="print-version-section">${renderVersionHeading(version, false, showHeading)}<div class="print-placeholder"><div><b>歌词尚未导入</b><br>请在电子版中粘贴你有权使用的歌词后重新生成 PDF。</div></div></section>`;
      return { pages: [body], fullBodyHtml: body, density: 'standard', lineFlow: 'preserve', columns: 1, layout: 'empty' };
    }
    if (!original || !translation) return paginateMonolingualVersion(song, { ...version, original: original || translation, translation: '' }, settings, targetSize, showHeading);
    const layout = settings.bilingual === 'auto' ? (targetSize === 'a4' ? 'parallel' : 'stacked') : settings.bilingual;
    return layout === 'parallel'
      ? paginateParallelVersion(song, { ...version, original, translation }, settings, targetSize, showHeading)
      : paginateStackedVersion(song, { ...version, original, translation }, settings, targetSize, showHeading);
  }

  function buildSongPlan(song, settings, targetSize) {
    const versions = versionsForPrint(song, settings);
    if (!versions.length) return [];
    const storedContentVersionCount = versionsFor(song, false).filter(versionHasContent).length;
    const showVersionHeadings = storedContentVersionCount > 1;
    const versionPlans = versions.map((version) => paginateVersion(song, version, settings, targetSize, showVersionHeadings));

    if (versionPlans.length > 1) {
      const combined = `<div class="print-combined-versions">${versionPlans.map((plan) => plan.fullBodyHtml).join('')}</div>`;
      if (bodyFits(song, combined, 0, settings, 'standard', 'print-combined-versions-page')) {
        return [{ body: combined, density: 'standard', extraClasses: 'print-combined-versions-page' }];
      }
      if (bodyFits(song, combined, 0, settings, 'compact', 'print-combined-versions-page')) {
        return [{ body: combined, density: 'compact', extraClasses: 'print-combined-versions-page' }];
      }
    }

    const packed = [];
    let pendingBodies = [];
    let pendingDensity = 'standard';
    const flushPending = () => {
      if (!pendingBodies.length) return;
      packed.push({ body: `<div class="print-combined-versions">${pendingBodies.join('')}</div>`, density: pendingDensity, extraClasses: pendingBodies.length > 1 ? 'print-combined-versions-page' : '' });
      pendingBodies = [];
      pendingDensity = 'standard';
    };

    versionPlans.forEach((plan) => {
      if (plan.pages.length !== 1) {
        flushPending();
        plan.pages.forEach((body) => packed.push({ body, density: plan.density, extraClasses: '' }));
        return;
      }
      const candidateBodies = [...pendingBodies, plan.pages[0]];
      const density = pendingDensity === 'compact' || plan.density === 'compact' ? 'compact' : 'standard';
      const candidate = `<div class="print-combined-versions">${candidateBodies.join('')}</div>`;
      if (bodyFits(song, candidate, packed.length, settings, density, 'print-combined-versions-page')) {
        pendingBodies = candidateBodies;
        pendingDensity = density;
      } else {
        flushPending();
        pendingBodies = [plan.pages[0]];
        pendingDensity = plan.density;
      }
    });
    flushPending();
    return packed;
  }

  function tocBatchPage(batch, pageNo, numberBySongId, pageBySongId) {
    const sections = batch.sections.map((section) => {
      const entries = section.songs.map((song) => {
        const number = numberBySongId.get(song.id) || 0;
        const page = pageBySongId.get(song.id) || '';
        return `<div class="print-toc-entry" data-toc-song-id="${escapeHTML(song.id)}"><span class="toc-num">${String(number).padStart(2, '0')}</span><a href="#print-song-${escapeHTML(song.id)}">${escapeHTML(song.title)}</a><span class="toc-page">${page}</span></div>`;
      }).join('');
      const optional = section.optional ? '<span class="toc-optional">可选</span>' : '';
      return `<section class="print-toc-section"><h3>${escapeHTML(section.name)}${optional}</h3><div class="print-toc-list">${entries}</div></section>`;
    }).join('');
    const tocClasses = [
      'print-toc-page',
      `print-toc-columns-${batch.columns || 1}`,
      `print-toc-density-${batch.density || 'compact'}`,
    ].join(' ');
    return pageShell(`
      <div class="print-running-head"><span>G.E.M. · I AM GLORIA</span><span>${escapeHTML(batch.kicker)}</span></div>
      <h2 class="print-toc-title">${escapeHTML(batch.title)}</h2>
      <p class="print-toc-note">点击电子 PDF 中的歌名，可跳转到对应歌词页。</p>
      <div class="print-toc-flow print-toc-${escapeHTML(batch.type)}" data-toc-columns="${batch.columns || 1}" data-toc-density="${escapeHTML(batch.density || 'compact')}">${sections}</div>
    `, tocClasses, pageNo);
  }

  function tocBatchFits(batch, numberBySongId, pageBySongId) {
    elements.printRoot.innerHTML = tocBatchPage(batch, 888, numberBySongId, pageBySongId);
    const page = elements.printRoot.firstElementChild;
    if (!page || renderedPageIssue(page, 0)) return false;
    const content = page.querySelector('.print-page-content');
    const footer = page.querySelector('.print-page-number');
    const flow = page.querySelector('.print-toc-flow');
    if (!content || !footer || !flow) return false;

    const expectedSongIds = batch.sections.flatMap((section) => section.songs.map((song) => song.id));
    const entries = [...page.querySelectorAll('.print-toc-entry')];
    if (
      entries.length !== expectedSongIds.length
      || entries.some((entry, index) => entry.dataset.tocSongId !== expectedSongIds[index])
    ) return false;

    const tolerance = 0.8;
    if (
      flow.scrollHeight > flow.clientHeight + tolerance
      || flow.scrollWidth > flow.clientWidth + tolerance
    ) return false;

    const contentRect = content.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const footerClearance = 2 * (96 / 25.4);
    const safeBottom = Math.min(contentRect.bottom, footerRect.top - footerClearance);
    const measuredNodes = page.querySelectorAll(
      '.print-running-head, .print-toc-title, .print-toc-note, .print-toc-flow, .print-toc-section h3, .toc-optional, .print-toc-entry',
    );
    return [...measuredNodes].every((node) => {
      const rects = [...node.getClientRects()];
      return rects.length > 0 && rects.every((rect) => (
        rect.left >= contentRect.left - tolerance
        && rect.right <= contentRect.right + tolerance
        && rect.top >= contentRect.top - tolerance
        && rect.bottom <= safeBottom + tolerance
      ));
    });
  }

  function buildLogicalPages(selection, settings) {
    const targetSize = settings.size === 'a4' ? 'a4' : 'a5';
    const printable = selection.filter((song) => settings.includeEmpty || hasLyrics(song));
    const songPlans = [];

    beginMeasurement(targetSize);
    try {
      printable.forEach((song) => {
        const pages = settings.pagePolicy === 'limit'
          ? buildConstrainedSongPlan(song, settings, targetSize)
          : buildSongPlan(song, settings, targetSize);
        if (pages.length) songPlans.push({ song, pages });
      });
    } finally {
      endMeasurement();
    }

    const tocGroups = settings.toc ? tocGroupsForSongs(songPlans.map((entry) => entry.song), settings) : [];
    const numberBySongId = new Map(
      songPlans.map(({ song }, index) => [song.id, index + 1]),
    );
    const coverCount = settings.cover ? 1 : 0;
    const pageMapForTocCount = (tocCount) => {
      let nextSongPage = coverCount + tocCount + 1;
      const pageMap = new Map();
      songPlans.forEach(({ song, pages }) => {
        pageMap.set(song.id, nextSongPage);
        nextSongPage += pages.length;
      });
      return pageMap;
    };
    let tocBatches = [];
    let pageBySongId = pageMapForTocCount(0);
    if (settings.toc) {
      beginMeasurement(targetSize);
      try {
        pageBySongId = new Map(songPlans.map(({ song }) => [song.id, 888]));
        let settled = false;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const measuredBatches = paginateMeasuredTocGroups(
            tocGroups,
            targetSize,
            (candidate) => tocBatchFits(candidate, numberBySongId, pageBySongId),
          );
          const measuredPageBySongId = pageMapForTocCount(measuredBatches.length);
          tocBatches = measuredBatches;
          pageBySongId = measuredPageBySongId;
          if (tocBatches.every((batch) => tocBatchFits(batch, numberBySongId, pageBySongId))) {
            settled = true;
            break;
          }
        }
        if (!settled) throw new Error('目录页数与最终歌曲页码无法稳定到安全布局');
      } finally {
        endMeasurement();
      }
    }

    const expectedSongIds = songPlans.map(({ song }) => song.id);
    const plannedTocSongIds = tocBatches.flatMap((batch) => (
      batch.sections.flatMap((section) => section.songs.map((song) => song.id))
    ));
    if (settings.toc && plannedTocSongIds.some((id, index) => id !== expectedSongIds[index])) {
      throw new Error('目录分页改变了歌曲顺序或遗漏了歌曲');
    }
    if (settings.toc && plannedTocSongIds.length !== expectedSongIds.length) {
      throw new Error('目录分页的歌曲数量与打印歌曲数量不一致');
    }

    const pages = [];
    if (settings.cover) pages.push(coverPage(settings));
    tocBatches.forEach((batch) => {
      const pageNo = pages.length + 1;
      pages.push(tocBatchPage(batch, pageNo, numberBySongId, pageBySongId));
    });

    songPlans.forEach(({ song, pages: songPages }) => {
      songPages.forEach((plan, index) => {
        const pageNo = pages.length + 1;
        pages.push(songPage(song, plan.body, index, songPages.length, pageNo, settings, plan.density, plan.extraClasses, plan.fit || null));
      });
    });
    pages.push(colophonPage(pages.length + 1));
    return { pages, printable: songPlans.map((entry) => entry.song), songPlans, tocBatches };
  }

  function imposeBooklet(logicalPages) {
    const pages = [...logicalPages];
    while (pages.length % 4 !== 0) pages.push('<section class="print-page blank-logical-page"><div class="print-page-inner"></div></section>');
    const total = pages.length;
    const sheets = [];
    for (let sheet = 0; sheet < total / 4; sheet += 1) {
      const frontLeft = total - 1 - 2 * sheet;
      const frontRight = 2 * sheet;
      const backLeft = 1 + 2 * sheet;
      const backRight = total - 2 - 2 * sheet;
      sheets.push(`<section class="booklet-sheet booklet-front"><div class="booklet-half">${pages[frontLeft]}</div><div class="booklet-half">${pages[frontRight]}</div></section>`);
      sheets.push(`<section class="booklet-sheet booklet-back"><div class="booklet-half">${pages[backLeft]}</div><div class="booklet-half">${pages[backRight]}</div></section>`);
    }
    return sheets.join('');
  }

  function renderedLogicalPages(settings) {
    if (settings.size === 'booklet') return $$('.booklet-half .print-page', elements.printRoot);
    return Array.from(elements.printRoot.children).filter((node) => node.classList?.contains('print-page'));
  }

  function renderedPageIssue(page, index) {
    const inner = page.querySelector('.print-page-inner');
    const content = page.querySelector('.print-page-content');
    const number = page.querySelector('.print-page-number');
    if (!inner || !content) return null;
    const tolerance = 0.8;
    const overflow = page.scrollHeight > page.clientHeight + tolerance
      || page.scrollWidth > page.clientWidth + tolerance
      || inner.scrollHeight > inner.clientHeight + tolerance
      || inner.scrollWidth > inner.clientWidth + tolerance
      || content.scrollHeight > content.clientHeight + tolerance
      || content.scrollWidth > content.clientWidth + tolerance;
    let footerCollision = false;
    if (number) {
      const contentRect = content.getBoundingClientRect();
      const numberRect = number.getBoundingClientRect();
      footerCollision = contentRect.bottom > numberRect.top - 1.2;
    }
    if (!overflow && !footerCollision) return null;
    return {
      index: index + 1,
      page,
      overflow,
      footerCollision,
      title: page.querySelector('.print-song-title')?.textContent?.trim()
        || page.querySelector('.print-toc-title')?.textContent?.trim()
        || '非歌曲页',
    };
  }

  function inspectRenderedPrint(settings) {
    return renderedLogicalPages(settings)
      .map((page, index) => renderedPageIssue(page, index))
      .filter(Boolean);
  }

  function renderedTocIssue(expectedSongIds) {
    const entries = $$('.print-toc-entry', elements.printRoot);
    if (entries.length !== expectedSongIds.length) {
      return `目录条目数 ${entries.length} 与打印歌曲数 ${expectedSongIds.length} 不一致`;
    }
    const targets = new Map();
    $$('[id^="print-song-"]', elements.printRoot).forEach((target) => {
      const songId = target.id.slice('print-song-'.length);
      targets.set(songId, (targets.get(songId) || 0) + 1);
    });
    const seen = new Set();
    for (let index = 0; index < entries.length; index += 1) {
      const songId = entries[index].dataset.tocSongId || '';
      const link = entries[index].querySelector('a');
      if (songId !== expectedSongIds[index]) return `第 ${index + 1} 条目录顺序不正确`;
      if (seen.has(songId)) return `目录歌曲 ${songId} 重复`;
      if (link?.getAttribute('href') !== `#print-song-${songId}`) return `目录歌曲 ${songId} 的链接不正确`;
      if (targets.get(songId) !== 1) return `目录歌曲 ${songId} 没有唯一的歌词首页目标`;
      seen.add(songId);
    }
    return null;
  }

  function shrinkFittingPage(page, factor = 0.974) {
    const scope = page.querySelector('.print-fit-scope');
    if (!scope) return false;
    const variables = [
      ['--fit-font-size', 0.72],
      ['--fit-version-heading-size', 1.1],
      ['--fit-label-size', 0.85],
      ['--fit-note-size', 0.9],
      ['--fit-section-gap', 0.65],
    ];
    let changed = false;
    variables.forEach(([name, floor]) => {
      const raw = scope.style.getPropertyValue(name);
      const value = Number.parseFloat(raw);
      if (!Number.isFinite(value)) return;
      const next = Math.max(floor, value * factor);
      if (next < value - 0.001) {
        scope.style.setProperty(name, `${next.toFixed(3)}mm`);
        changed = true;
      }
    });
    const lineHeight = Number.parseFloat(scope.style.getPropertyValue('--fit-line-height'));
    if (Number.isFinite(lineHeight)) {
      const next = Math.max(1.08, lineHeight - 0.012);
      if (next < lineHeight) {
        scope.style.setProperty('--fit-line-height', next.toFixed(3));
        changed = true;
      }
    }
    if (changed) page.dataset.printStabilized = 'true';
    return changed;
  }

  async function stabilizeRenderedPrint(settings, maxPasses = 5) {
    let issues = [];
    for (let pass = 0; pass < maxPasses; pass += 1) {
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      issues = inspectRenderedPrint(settings);
      if (!issues.length) return [];
      const changed = issues.reduce((count, issue) => count + Number(shrinkFittingPage(issue.page)), 0);
      if (!changed) break;
    }
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    return inspectRenderedPrint(settings);
  }

  async function preparePrint() {
    const settings = printSettings();
    const selection = printSelection(settings);
    const originalLabel = elements.printBuildButton.textContent;
    elements.printBuildButton.disabled = true;
    elements.printBuildButton.textContent = '正在智能排版…';

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      const { pages, printable } = buildLogicalPages(selection, settings);
      if (!printable.length) {
        showToast('没有可输出曲目：请导入歌词或勾选空白曲目');
        return;
      }
      elements.printRoot.className = `print-root print-measuring print-size-${settings.size}`;
      elements.printRoot.innerHTML = settings.size === 'booklet' ? imposeBooklet(pages) : pages.join('');
      elements.printRoot.setAttribute('aria-hidden', 'false');
      elements.dynamicPrintStyle.textContent = settings.size === 'booklet'
        ? '@page { size: A4 landscape; margin: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
        : `@page { size: ${settings.size.toUpperCase()} portrait; margin: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`;

      const remainingIssues = await stabilizeRenderedPrint(settings);
      if (remainingIssues.length) {
        const sample = remainingIssues.slice(0, 4).map((issue) => `${issue.index}（${issue.title}）`).join('、');
        throw new Error(`最终打印安全检查仍发现 ${remainingIssues.length} 页溢出：${sample}`);
      }
      const tocIssue = renderedTocIssue(settings.toc ? printable.map((song) => song.id) : []);
      if (tocIssue) throw new Error(`目录完整性检查失败：${tocIssue}`);
      elements.printRoot.className = `print-root print-size-${settings.size}`;

      const modalElement = $('#printModal');
      const modal = window.bootstrap?.Modal.getInstance(modalElement);
      if (modal) modal.hide();
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      window.setTimeout(() => window.print(), 120);
    } catch (error) {
      console.error('Print pagination failed', error);
      showToast(`排版失败：${error.message}`);
      cleanupPrint();
    } finally {
      elements.printBuildButton.disabled = false;
      elements.printBuildButton.textContent = originalLabel;
    }
  }

  function cleanupPrint() {
    elements.printRoot.innerHTML = '';
    elements.printRoot.className = 'print-root';
    elements.printRoot.setAttribute('aria-hidden', 'true');
    elements.dynamicPrintStyle.textContent = '';
  }

  function bindEvents() {
    elements.search.addEventListener('input', (event) => {
      state.search = event.target.value;
      saveState('');
      renderList();
      updatePrintEstimate();
    });
    elements.filter.addEventListener('change', (event) => {
      state.filter = event.target.value;
      saveState('');
      renderList();
      updatePrintEstimate();
    });
    elements.sort.addEventListener('change', (event) => {
      state.sort = event.target.value;
      saveState('');
      renderList();
      updatePrintEstimate();
    });
    elements.fontRange.addEventListener('input', (event) => applyFontLevel(event.target.value));
    elements.previewTab.addEventListener('click', () => applyViewMode('preview'));
    elements.editTab.addEventListener('click', () => applyViewMode('edit'));
    elements.startEditing.addEventListener('click', () => applyViewMode('edit'));
    elements.lyricEditor.addEventListener('input', (event) => updateLyrics(event.target.value));
    elements.translationEditor.addEventListener('input', (event) => updateTranslation(event.target.value));
    [elements.versionName, elements.versionType, elements.originalLabel, elements.translationLabel, elements.versionNote, elements.lineAligned].forEach((input) => input.addEventListener('change', updateVersionMetadata));
    elements.showAllVersionsButton.addEventListener('click', toggleShowAllVersions);
    elements.addVersionButton.addEventListener('click', addVersion);
    elements.setDefaultVersion.addEventListener('click', setDefaultVersion);
    elements.duplicateVersion.addEventListener('click', duplicateVersion);
    elements.deleteVersion.addEventListener('click', deleteVersion);
    elements.clearLyrics.addEventListener('click', clearCurrentVersion);
    elements.favoriteButton.addEventListener('click', () => toggleInArray('favorites', currentSong().id));
    elements.learnedButton.addEventListener('click', () => toggleInArray('learned', currentSong().id));
    elements.previousSong.addEventListener('click', () => navigate(-1));
    elements.nextSong.addEventListener('click', () => navigate(1));
    elements.sidebarToggle.addEventListener('click', openSidebar);
    elements.sidebarClose.addEventListener('click', closeSidebar);
    elements.sidebarBackdrop.addEventListener('click', closeSidebar);
    $$('[data-bs-toggle="modal"]', elements.sidebar).forEach((button) => {
      button.addEventListener('click', (event) => launchModalFromSidebar(button, event), true);
    });
    document.addEventListener('show.bs.modal', () => {
      // Bootstrap records the current inline overflow before applying its own
      // scroll lock. Close the mobile drawer first so Safari cannot restore a
      // stale `overflow: hidden` after the modal closes.
      if (elements.sidebar.classList.contains('open')) closeSidebar();
    });
    document.addEventListener('hidden.bs.modal', () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(releaseStaleBodyLock);
      });
    });
    elements.themeButton.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));
    elements.focusButton.addEventListener('click', openFocus);
    elements.exitFocus.addEventListener('click', closeFocus);
    elements.focusOverlay.addEventListener('click', (event) => {
      if (event.target === elements.focusOverlay) closeFocus();
    });
    elements.importButton.addEventListener('click', importFile);
    elements.pasteImportButton.addEventListener('click', () => {
      const entries = parseMarkdown(elements.bulkPaste.value);
      if (!entries.length) {
        elements.importResult.textContent = '没有识别到 “## 歌名” 标题块。';
        return;
      }
      importEntries(entries);
    });
    elements.exportHtml?.addEventListener('click', exportStandaloneHtml);
    elements.exportJson.addEventListener('click', exportBackup);
    elements.exportMarkdown.addEventListener('click', exportMarkdown);
    elements.downloadTemplate.addEventListener('click', exportTemplate);
    elements.printBuildButton.addEventListener('click', preparePrint);
    $$('input[name="printSize"], input[name="printScope"], #printCover, #printToc, #printEmpty, #printNotes, #printCompact, #printPagePolicy, #printVersions, #printLineFlow, #printColumns, #printBilingual, #printSetlistOptional').forEach((input) => input.addEventListener('change', updatePrintEstimate));
    $('#printModal').addEventListener('show.bs.modal', updatePrintEstimate);

    elements.setlistSelect.addEventListener('change', (event) => {
      state.activeSetlistId = event.target.value;
      saveState('已切换演出歌单');
      renderSetlistEditor();
      renderList();
      renderDetail();
      updatePrintEstimate();
    });
    elements.newSetlistButton.addEventListener('click', createNewSetlist);
    elements.deleteSetlistButton.addEventListener('click', deleteCurrentSetlist);
    elements.saveSetlistButton.addEventListener('click', saveSetlistFromEditor);
    elements.useSetlistSortButton.addEventListener('click', useCurrentSetlistSort);
    $('#setlistModal').addEventListener('show.bs.modal', renderSetlistEditor);

    window.addEventListener('afterprint', cleanupPrint);
    window.addEventListener('resize', () => { if (window.innerWidth >= 992) closeSidebar(); });
    document.addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName;
      const editingText = tag === 'TEXTAREA' || tag === 'INPUT' || document.activeElement?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        elements.search.focus();
        elements.search.select();
        return;
      }
      if (event.key === 'Escape') {
        if (!elements.focusOverlay.hidden) closeFocus();
        else closeSidebar();
        return;
      }
      if (!editingText && event.key === 'ArrowLeft') navigate(-1);
      if (!editingText && event.key === 'ArrowRight') navigate(1);
    });
  }

  window.__GEM_LYRICBOOK_DEBUG__ = {
    version: APP_VERSION,
    importBackup(payload) {
      applyJsonImport(payload);
      return {
        songsWithLyrics: songs.filter(hasLyrics).length,
        versionsWithContent: songs.reduce((sum, song) => sum + versionsFor(song, false).filter(versionHasContent).length, 0),
      };
    },
    async buildPrint({ size = 'a4', scope = 'all', pagePolicy = 'limit', versionMode = 'default', songIds = [], includeEmpty = false, includeOptionalSetlistSections = true, lineFlow = 'auto', columns = 'auto', bilingual = 'auto', cover = false, toc = true, keepRendered = false } = {}) {
      // Mirror the production print path: wait for font metrics and a layout frame
      // before measuring. This avoids transient false overflow reports in headless
      // tests and in devices that finish loading system fonts after app startup.
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      const settings = {
        size,
        scope,
        pagePolicy,
        versionMode,
        lineFlow,
        columns,
        bilingual,
        cover,
        toc,
        includeEmpty,
        notes: true,
        compactWhitespace: true,
        includeOptionalSetlistSections,
      };
      const selection = songIds.length
        ? songIds.map((id) => songs.find((song) => song.id === id)).filter(Boolean)
        : printSelection(settings);
      const result = buildLogicalPages(selection, settings);
      elements.printRoot.className = `print-root print-measuring print-size-${size}`;
      elements.printRoot.innerHTML = size === 'booklet' ? imposeBooklet(result.pages) : result.pages.join('');
      elements.printRoot.setAttribute('aria-hidden', 'false');
      const remainingIssues = await stabilizeRenderedPrint(settings);
      const tocIssue = renderedTocIssue(settings.toc ? result.printable.map((song) => song.id) : []);
      if (tocIssue) {
        cleanupPrint();
        throw new Error(`目录完整性检查失败：${tocIssue}`);
      }
      const pageNodes = renderedLogicalPages(settings);
      const overflowPages = remainingIssues.map((issue) => issue.index);
      const tocLinks = $$('a[href^="#print-song-"]', elements.printRoot).length;
      const singleVersionHeadings = result.songPlans.flatMap(({ song }) => {
        const count = versionsFor(song, false).filter(versionHasContent).length;
        if (count !== 1) return [];
        const page = elements.printRoot.querySelector(`#print-song-${song.id}`);
        return page?.querySelector('.print-version-heading') ? [song.id] : [];
      });
      const songsSummary = result.songPlans.map(({ song, pages }) => ({
        id: song.id,
        title: song.title,
        pages: pages.length,
        fontSizes: pages.map((page) => page.fit?.fontSize || null),
        metaLevels: pages.map((page) => page.fit?.metaLevel ?? null),
      }));
      const response = {
        totalPages: pageNodes.length,
        physicalPages: size === 'booklet' ? $$('.booklet-sheet', elements.printRoot).length : pageNodes.length,
        overflowPages,
        tocPages: result.tocBatches.length,
        tocLayouts: result.tocBatches.map((batch) => ({
          title: batch.title,
          columns: batch.columns || 1,
          density: batch.density || 'compact',
          songs: batch.sections.reduce((sum, section) => sum + section.songs.length, 0),
          weight: Number((batch.weight || 0).toFixed(2)),
          capacity: batch.capacity || null,
          songIds: batch.sections.flatMap((section) => section.songs.map((song) => song.id)),
        })),
        tocLinks,
        tocIntegrity: 'safe',
        singleVersionHeadings,
        songs: songsSummary,
      };
      if (keepRendered) {
        elements.dynamicPrintStyle.textContent = size === 'booklet'
          ? '@page { size: A4 landscape; margin: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
          : `@page { size: ${size.toUpperCase()} portrait; margin: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`;
        elements.printRoot.className = `print-root print-size-${size}`;
      } else {
        cleanupPrint();
      }
      return response;
    },
    openSidebar,
    closeSidebar,
    releaseStaleBodyLock,
    cleanupPrint,
    setActiveSetlist(id) {
      if (!state.setlists.some((setlist) => setlist.id === id)) return false;
      state.activeSetlistId = id;
      saveState('');
      renderSetlistEditor();
      renderList();
      updatePrintEstimate();
      return true;
    },

    snapshot() {
      return JSON.parse(JSON.stringify(state));
    },
  };

  function initialize() {
    if (!songs.some((song) => song.id === state.selectedId)) state.selectedId = songs[0]?.id || '';
    if (!Array.isArray(state.setlists) || !state.setlists.length) {
      state.setlists = builtinSetlists();
      state.activeSetlistId = state.setlists[0]?.id || '';
    }
    if (!state.setlists.some((setlist) => setlist.id === state.activeSetlistId)) state.activeSetlistId = state.setlists[0]?.id || '';
    elements.search.value = state.search || '';
    elements.filter.value = state.filter || 'all';
    elements.sort.value = state.sort || 'setlist';
    if (elements.filter.selectedIndex < 0) elements.filter.value = state.filter = 'all';
    if (elements.sort.selectedIndex < 0) elements.sort.value = state.sort = 'setlist';
    releaseStaleBodyLock();
    applyTheme(state.theme);
    applyFontLevel(state.fontLevel);
    renderCoverage();
    renderSources();
    renderSetlistEditor();
    renderList();
    renderDetail();
    bindEvents();
    updatePrintEstimate();

    if (elements.exportHtml && !window.GEM_SINGLE_FILE) {
      elements.exportHtml.title = '从已部署站点生成内含当前歌词数据的离线 HTML';
    }
    if (!window.GEM_SINGLE_FILE && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker registration failed', error));
    }
  }

  initialize();
})();
