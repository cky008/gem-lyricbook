# 数据格式与迁移说明

## 公开曲目数据

文件：

```text
src/data/songs.json
```

它只保存公开曲目元数据，不保存用户歌词。每条曲目大致包含：

```json
{
  "id": "song-001",
  "title": "示例歌名",
  "aliases": ["示例别名"],
  "sources": ["image1"],
  "tags": ["主歌单"],
  "note": "版本或现场说明",
  "links": {
    "apple_music_search": "...",
    "youtube_search": "..."
  }
}
```

### ID 稳定性

`id` 是歌词、版本、收藏和歌单之间的关联键。修改曲名时尽量不要修改已有 ID。新增曲目使用新的、未占用的 ID。

## 用户备份格式

新版导出格式：

```json
{
  "format": "gem-lyricbook-backup-v4",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "state": {
    "lyrics": {},
    "lyricLibrary": {},
    "favorites": [],
    "learned": [],
    "setlists": [],
    "activeSetlistId": "",
    "showAllVersions": false
  },
  "titles": {}
}
```

### `lyrics`

兼容旧版的默认歌词映射：

```json
{
  "song-001": "第一行\n第二行"
}
```

新版仍保留它用于向后兼容，但多版本功能应以 `lyricLibrary` 为准。

### `lyricLibrary`

```json
{
  "song-001": {
    "versions": [
      {
        "id": "version-example",
        "name": "默认版",
        "type": "default",
        "originalLabel": "歌词",
        "translationLabel": "中文翻译",
        "original": "第一行\n第二行",
        "translation": "译文第一行\n译文第二行",
        "note": "现场改词说明",
        "lineAligned": true
      }
    ],
    "defaultVersionId": "version-example",
    "selectedVersionId": "version-example"
  }
}
```

`type` 可使用：

- `default`
- `mandarin`
- `cantonese`
- `english`
- `live`
- `acoustic`
- `adapted`
- 自定义字符串

### `setlists`

```json
{
  "id": "setlist-example",
  "name": "某场正式歌单",
  "status": "verified",
  "builtin": false,
  "sections": [
    {
      "name": "Part 1",
      "items": [
        { "raw": "示例歌名", "songId": "song-001" }
      ]
    },
    {
      "name": "Encore",
      "items": [
        { "raw": "返场曲目", "songId": "song-002" }
      ]
    }
  ],
  "unmatched": []
}
```

## 兼容旧备份

导入器会识别：

- 只有 `lyrics` 的旧版 JSON；
- `gem-lyricbook-backup-v2`；
- 带智能分页设置的后续格式；
- `gem-lyricbook-backup-v4` 多版本格式；
- 使用 `## 歌名` 分块的 Markdown 或 TXT。

旧版单歌词在导入后会变成该歌曲的默认版本，不会丢失原始换行。

## 私有数据隔离

建议本地建立：

```text
private-data/
```

存放真实歌词 JSON 和含歌词 HTML。该目录已被 `.gitignore` 忽略。

提交前检查：

```bash
git status --short
git diff --cached --name-only
```

不得把真实歌词、个人备注或完整离线歌词本提交到公开仓库。

## 增加曲目

1. 在 `src/data/songs.json` 增加唯一 ID 的曲目。
2. 更新 `metadata.counts` 和来源核对数据。
3. 如有内置歌单需要引用，在 `src/app.js` 的内置歌单中使用曲名或 ID。
4. 运行：

```bash
npm run check
```

测试会检查 ID 和曲名是否重复、必要页面节点是否存在，并重新构建产物。
