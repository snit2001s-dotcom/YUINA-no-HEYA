# YUINA Official Site

ゆいなの公式サイト。Comic / Game / Movie / Music の4つのコンテンツを楽しめるポータルサイトです。

## ページ構成

| ページ | 内容 |
| --- | --- |
| `index.html` | LP（トップページ）。4つのコンテンツから選択できるハブ |
| `comic.html` | コミックビューア（ページめくり対応） |
| `game.html` | ミニゲーム「スターキャッチ」（ブラウザでプレイ可能） |
| `movie.html` | ムービープレイヤー |
| `music.html` | SUNO AI楽曲のプレイヤーリスト |

## BGMについて

- ブラウザの自動再生制限のため、**最初のクリック／タップを合図に再生開始**します
- 音量0から**約4秒かけてゆっくりフェードイン**するので、いきなり大きな音は鳴りません
- 右下の「♪」ボタンでいつでもON/OFFできます（設定は記憶されます）
- 動画や楽曲を再生するとBGMは自動でフェードアウトします

## コンテンツファイルの置き場所

作成済みのファイルを以下の場所に置くだけで、各ページに自動で反映されます。

| コンテンツ | 置き場所 |
| --- | --- |
| BGM音源 | `assets/audio/bgm.mp3`（無い場合は自動生成アンビエントが流れます） |
| SUNO AI楽曲 | `assets/audio/track1.mp3`, `track2.mp3`, `track3.mp3`（曲名は `music.html` 内の `TRACKS` を編集） |
| ムービー | `assets/video/movie.mp4` |
| コミック画像 | `assets/comic/page1.png`, `page2.png`, `page3.png` |
| Gemini製ゲームHTML | `games/` フォルダに置いて `game.html` からリンク |

## ローカルでの確認方法

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```
