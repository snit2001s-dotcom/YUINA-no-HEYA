# ゆいなのへや — Official Site

ゆいなの公式サイト。Comic / Game / Movie / Music の4つのコンテンツを楽しめるポータルサイトです。
スマートフォン・PCどちらでも見られます。

## ページ構成

| ページ | 内容 |
| --- | --- |
| `index.html` | トップページ（LP）。4つのコンテンツから選択できるハブ |
| `comic.html` | ゆいなコミック全9話（キャラクター紹介＋ページめくりビューア） |
| `game.html` | ゲームランド（大乱闘スマブバ‼／スターキャッチ） |
| `movie.html` | ゆいなシアター（動画リスト） |
| `music.html` | ゆいなミュージック（SUNO AI楽曲プレイヤー） |

## BGMについて

- 最初のクリック／タップを合図に、音量0から**約4秒かけてフェードイン**します
- 右下の「♪」ボタンでいつでもON/OFF（設定は記憶されます）
- 曲や動画を再生するとBGMは自動で止まります
- BGM曲は `assets/media.json` の `bgm` を書き換えるだけで差し替えできます

## コンテンツの追加方法

### 🚀 こうしんページ（おすすめ・ドラッグだけで公開）
サイトの `upload.html`（フッターの「🔧 こうしんページ」）を開き、ファイルをドラッグ＆ドロップするだけで
GitHubに自動コミットされ、1〜2分後にWeb公開されます。

- 対応: 曲(mp3)／サイトBGM差し替え／動画(mp4)／コミックの話(jpg・png)／キャラ紹介画像
- 初回のみ [GitHubトークン](https://github.com/settings/personal-access-tokens/new)
  （codex-practice の Contents: Read and write 権限）を設定します。トークンはブラウザ内にのみ保存されます

### かんたん追加（この端末だけ）
MUSIC・MOVIEページの「**＋ついか**」ボタンでスマホ/PC内のファイルを選ぶと、すぐ再生できます。
ブラウザ（IndexedDB）に保存されるため、その端末だけで見られます。

### 手動での追加
1. ファイルをアップロード（曲: `assets/audio/`、動画: `assets/video/`、コミック: `assets/comic/`）
2. `assets/media.json` の該当リストに1行追加
   ```json
   { "file": "assets/audio/newsong.mp3", "title": "あたらしい曲", "emoji": "🎵" }
   ```
   コミックは `comics`、キャラ紹介画像は `characterImage` を編集します。

### その他の差し替えポイント

| コンテンツ | 場所 |
| --- | --- |
| キャラクター紹介図 | `assets/comic/characters.jpg`（置くとCOMICページに自動表示） |
| ゲーム追加 | `games/` にHTML一式を置き、`game.html` にカードを追加 |

## ローカルでの確認方法

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```
