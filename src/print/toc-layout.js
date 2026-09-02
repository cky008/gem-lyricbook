/**
 * 打印目录布局模型。
 *
 * 目录分页不按“固定每页 N 首”硬切，而是先根据版式、标题长度和章节
 * 标题估算占用，再选择最少栏数、字号最大的单页方案。只有最紧凑方案
 * 仍放不下时才产生续页。
 */
export const TOC_LAYOUT_PROFILES = Object.freeze({
  a4: Object.freeze([
    Object.freeze({ columns: 1, capacity: 50, density: 'roomy' }),
    Object.freeze({ columns: 2, capacity: 94, density: 'standard' }),
    Object.freeze({ columns: 3, capacity: 132, density: 'compact' }),
  ]),
  a5: Object.freeze([
    Object.freeze({ columns: 1, capacity: 48, density: 'roomy' }),
    Object.freeze({ columns: 2, capacity: 82, density: 'compact' }),
  ]),
});

export function tocTextUnits(value) {
  return Array.from(String(value || '')).reduce((sum, char) => {
    if (/\s/u.test(char)) return sum + 0.35;
    return sum + (char.codePointAt(0) > 0xff ? 1.82 : 1);
  }, 0);
}

function titleLineCapacity(targetSize, columns) {
  if (targetSize === 'a4') return columns === 1 ? 88 : columns === 2 ? 40 : 25;
  return columns === 1 ? 52 : 24;
}

export function tocSongWeight(song, targetSize, columns) {
  const lines = Math.max(1, Math.ceil(tocTextUnits(song?.title) / titleLineCapacity(targetSize, columns)));
  return 1 + Math.max(0, lines - 1) * 0.82;
}

export function tocSectionWeight(section, targetSize, columns) {
  const headingBase = targetSize === 'a4' ? 2.35 : 2.05;
  const headingWrap = Math.max(0, Math.ceil(tocTextUnits(section?.name) / titleLineCapacity(targetSize, columns)) - 1) * 0.8;
  return headingBase + headingWrap + (section?.songs || []).reduce((sum, song) => sum + tocSongWeight(song, targetSize, columns), 0);
}

export function tocHeaderWeight(group, targetSize) {
  // 页眉、说明和首行标题的基础高度已经计入各版式 capacity；这里只对
  // 标题换行产生的额外高度计权，避免长标题在视觉上被页脚裁切。
  const lineCapacity = targetSize === 'a4' ? 38 : 33;
  const titleLines = Math.max(1, Math.ceil(tocTextUnits(group?.title) / lineCapacity));
  return Math.max(0, titleLines - 1) * (targetSize === 'a4' ? 5.5 : 4.5);
}

export function tocGroupWeight(group, targetSize, columns) {
  return tocHeaderWeight(group, targetSize)
    + (group?.sections || []).reduce((sum, section) => sum + tocSectionWeight(section, targetSize, columns), 0);
}

export function chooseTocLayout(group, targetSize) {
  const profiles = TOC_LAYOUT_PROFILES[targetSize] || TOC_LAYOUT_PROFILES.a5;
  for (const profile of profiles) {
    const weight = tocGroupWeight(group, targetSize, profile.columns);
    if (weight <= profile.capacity) return { ...profile, weight };
  }
  const fallback = profiles[profiles.length - 1];
  return { ...fallback, weight: tocGroupWeight(group, targetSize, fallback.columns) };
}

function makeBatch(group, pageIndex, layout) {
  return {
    title: pageIndex ? `${group.title}（续）` : group.title,
    kicker: group.kicker,
    type: group.type,
    sections: [],
    weight: 0,
    columns: layout.columns,
    density: layout.density,
    capacity: layout.capacity,
  };
}

/**
 * @param {Array<{title:string,kicker:string,type:string,sections:Array}>} groups
 * @param {'a4'|'a5'} targetSize
 */
export function paginateTocGroups(groups, targetSize) {
  const batches = [];

  (groups || []).forEach((group) => {
    const layout = chooseTocLayout(group, targetSize);

    // 能放在同一页时，章节保持完整，不产生“（续）”。
    if (layout.weight <= layout.capacity) {
      batches.push({
        ...makeBatch(group, 0, layout),
        sections: group.sections.map((section) => ({ ...section, songs: [...section.songs] })),
        weight: layout.weight,
      });
      return;
    }

    let pageIndex = 0;
    let current = makeBatch(group, pageIndex, layout);
    const flush = () => {
      if (!current.sections.length) return;
      batches.push(current);
      pageIndex += 1;
      current = makeBatch(group, pageIndex, layout);
    };

    group.sections.forEach((section) => {
      let offset = 0;
      while (offset < section.songs.length) {
        const sectionName = offset ? `${section.name}（续）` : section.name;
        const headingOnly = tocSectionWeight({ ...section, name: sectionName, songs: [] }, targetSize, layout.columns);
        if (current.weight + headingOnly >= layout.capacity && current.sections.length) flush();

        const chunk = [];
        let chunkWeight = headingOnly;
        while (offset < section.songs.length) {
          const song = section.songs[offset];
          const songWeight = tocSongWeight(song, targetSize, layout.columns);
          if (chunk.length && current.weight + chunkWeight + songWeight > layout.capacity) break;
          if (!chunk.length && current.sections.length && current.weight + chunkWeight + songWeight > layout.capacity) {
            flush();
            continue;
          }
          chunk.push(song);
          chunkWeight += songWeight;
          offset += 1;
        }

        current.sections.push({
          ...section,
          name: sectionName,
          songs: chunk,
        });
        current.weight += chunkWeight;
        if (offset < section.songs.length) flush();
      }
    });
    flush();
  });

  return batches;
}

function cloneSections(sections) {
  return (sections || []).map((section) => ({
    ...section,
    songs: [...(section.songs || [])],
  }));
}

function measuredBatch(group, pageIndex, layout, sections, targetSize) {
  const batch = {
    ...makeBatch(group, pageIndex, layout),
    sections: cloneSections(sections),
  };
  batch.weight = tocGroupWeight(
    { ...group, title: batch.title, sections: batch.sections },
    targetSize,
    layout.columns,
  );
  return batch;
}

function groupSongCount(group) {
  return (group.sections || []).reduce((sum, section) => sum + (section.songs || []).length, 0);
}

function sectionPrefix(group, start, end) {
  const sections = [];
  let cursor = 0;
  (group.sections || []).forEach((section) => {
    const songs = section.songs || [];
    const sectionStart = cursor;
    const sectionEnd = cursor + songs.length;
    cursor = sectionEnd;
    const sliceStart = Math.max(start, sectionStart);
    const sliceEnd = Math.min(end, sectionEnd);
    if (sliceStart >= sliceEnd) return;
    const continued = sliceStart > sectionStart;
    sections.push({
      ...section,
      name: continued ? `${section.name}（续）` : section.name,
      songs: songs.slice(sliceStart - sectionStart, sliceEnd - sectionStart),
    });
  });
  return sections;
}

/**
 * 使用真实页面测量决定目录是否单页以及分页边界。
 *
 * 权重模型继续用于即时页数估算；最终打印会把完整目录按可读性顺序
 * 逐一交给 fitsPage。只有所有完整页候选都失败后，才在最紧凑版式中
 * 二分寻找每页能安全容纳的最大歌曲前缀。
 *
 * @param {Array<{title:string,kicker:string,type:string,sections:Array}>} groups
 * @param {'a4'|'a5'} targetSize
 * @param {(candidate:object) => boolean} fitsPage
 */
export function paginateMeasuredTocGroups(groups, targetSize, fitsPage) {
  if (typeof fitsPage !== 'function') throw new TypeError('目录实测需要 fitsPage 回调');
  const profiles = TOC_LAYOUT_PROFILES[targetSize] || TOC_LAYOUT_PROFILES.a5;
  const batches = [];

  (groups || []).forEach((group) => {
    const songCount = groupSongCount(group);
    if (!songCount) return;

    for (const profile of profiles) {
      const candidate = measuredBatch(group, 0, profile, group.sections, targetSize);
      if (fitsPage(candidate)) {
        batches.push(candidate);
        return;
      }
    }

    const compact = profiles[profiles.length - 1];
    let start = 0;
    let pageIndex = 0;
    while (start < songCount) {
      let low = start + 1;
      let high = songCount;
      let best = null;
      let bestEnd = start;

      while (low <= high) {
        const end = Math.floor((low + high) / 2);
        const candidate = measuredBatch(
          group,
          pageIndex,
          compact,
          sectionPrefix(group, start, end),
          targetSize,
        );
        if (fitsPage(candidate)) {
          best = candidate;
          bestEnd = end;
          low = end + 1;
        } else {
          high = end - 1;
        }
      }

      if (!best || bestEnd <= start) {
        throw new Error(`目录“${group.title}”中的单条内容无法安全容纳`);
      }
      batches.push(best);
      start = bestEnd;
      pageIndex += 1;
    }
  });

  return batches;
}
