# ゆいなのへや — 引き継ぎ書（AIアシスタント向け）

このファイルは、本プロジェクトを別セッション・別モデル（Opus 4.8等）で修正するための引き継ぎ書です。
作業前に必ず全体を読んでください。

## 1. プロジェクト概要

- **サイト名**: ゆいなのへや（11歳の女の子「ゆいな」の家族向けポータルサイト）
- **リポジトリ**: `snit2001s-dotcom/YUINA-no-HEYA`（旧名 `codex-practice`。git操作は旧名でもリダイレクトされる）
- **公開URL**: https://snit2001s-dotcom.github.io/YUINA-no-HEYA/
- **ホスティング**: GitHub Pages。**配信ブランチは `claude/yuina-website-redesign-e6k69d`**（mainではない！mainは旧サイトのまま）
- **公開方針**: 家族限定。URL秘匿方式（noindex/robots.txt済み、リポジトリ名は今後ランダム化する可能性あり）
- **技術**: 素のHTML/CSS/JS のみ。ビルド工程なし。フレームワーク・npm依存なし
- **デザイン**: パステルピンク×ラベンダーのかわいいPOP調。丸文字（Zen Maru Gothic をGoogle Fontsから読込）、
  ステッカー風白ふちカード、絵文字デコ。対象読者が小学生のため、サイト内の文言はやさしい ひらがな多め

## 2. ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | LP。COMIC/GAME/MOVIE/MUSIC の4カード選択ハブ |
| `comic.html` | コミックビューア（キャラ紹介＋ページめくり＋話一覧） |
| `game.html` | ゲーム選択（大乱闘スマブバ‼／スターキャッチ）＋スターキャッチ本体（inline実装） |
| `movie.html` | 動画リストプレイヤー |
| `music.html` | 楽曲リストプレイヤー |
| `upload.html` | **こうしんページ**（ドラッグ&ドロップでGitHubに直接コミットする管理画面） |
| `games/luke/` | 大乱闘スマブバ‼（Gemini製・ユーザーの子の作品。スプライト/背景/ゲームBGM同梱） |
| `assets/media.json` | **全コンテンツの台帳（最重要）**。BGM・曲・動画・コミック話・キャラ紹介画像を一元管理 |
| `assets/audio/` `assets/video/` `assets/comic/` | メディア実体 |
| `css/style.css` | 共通スタイル（テーマ変数・ヘッダー・カード・BGMボタン・スマホ対応） |
| `js/bgm.js` | BGM再生（フェードイン付き） |
| `js/media-store.js` | 「＋ついか」ボタン用のIndexedDBローカル保存 |
| `js/reveal.js` | スクロール表示アニメ |
| `robots.txt` | 全クローラー拒否（家族限定運用のため） |

## 3. アーキテクチャの要点（壊さないこと）

### media.json が単一の真実
- 各ページは `assets/media.json` を **`?t=タイムスタンプ` + `cache: "no-store"` 付きで** fetch する
  （GitHub Pagesの10分キャッシュ対策。この付与を外すとアップロード反映が遅れるクレームが再発する）
- fetch失敗時は各ページ内の FALLBACK_* 配列で表示継続
- コンテンツ追加＝ファイル設置＋media.json追記。**HTMLの編集は不要**という設計を維持すること
- キー: `bgm`(str) / `characterImage`(str) / `backgrounds`(配列, BG画像パス) /
  `tracks`(配列, {file,title,emoji,thumb?}) / `videos`(配列) / `comics`(配列)

### 背景画像（js/background.js・全ページ読込）
- `backgrounds` 配列からページを開くたびランダムに1枚選び、bodyに `.bg-image` を prepend
- 薄く半透明（opacity 0.14）で画面全体に cover 表示。空配列なら従来のパステル背景のまま
- こうしんページで **ファイル名が `BG_` で始まる画像**は種類「背景画像」に自動振り分けされ `assets/img/` へ保存

### 曲サムネ / 動画サムネ
- MUSIC: track に `thumb`(画像パス) があれば `.art` に画像表示、無ければ絵文字。
  こうしんページで画像を「曲のサムネにする」で選ぶと対象曲を選択して `thumb` に紐付く（SUNOのジャケ画像用）
- MOVIE: 各動画の**冒頭フレームを非表示のprobe videoでcanvasに描画し poster に自動設定**（movie.html内 makeThumbnail）。
  ※headless chromiumはH.264非対応でテスト時posterは生成されないが実ブラウザでは生成される

### BGM（js/bgm.js）
- 自動再生規制のため初回クリック/タップで開始し、**音量0→0.35へ約4秒フェードイン**（急に鳴らさない＝当初の重要要件）
- 曲は media.json の `bgm` パスを優先。ファイルが無ければWeb Audioで生成アンビエントにフォールバック
- 右下♪ボタンでON/OFF（localStorage `yuina-bgm-enabled`）。動画/曲の再生時は自動フェードアウト（各ページ側で実装）

### こうしんページ（upload.html）
- ブラウザから GitHub Contents API へ直接PUTしてコミット→Pagesが自動再デプロイ、という**サーバーレス更新機構**
- owner/repo は **PagesのURLから自動判定**（リポジトリ名を変えても動く）。localhost時は既定値にフォールバック
- トークンは localStorage `yuina-gh-token`（Fine-grained PAT / Contents: Read and write）。ブランチは `yuina-gh-branch`
- 種類: 曲 / サイトBGM差替 / 動画(mp4・mov) / コミックの話 / キャラ紹介画像 / 背景画像 / 曲サムネ。
  アップ後に media.json も自動更新する
- ファイル名は `safeName()` でタイムスタンプ+サニタイズされる。画像の種類は `BG_` 始まりで背景に自動判定

### ローカル追加（js/media-store.js）
- MUSIC/MOVIEの「＋ついか」はIndexedDBに保存する**その端末限定**機能（「この端末のみ」バッジ＋削除ボタン）。
  公開用のこうしんページとは別物なので混同しない

### スマホ対応
- `css/style.css` 末尾の `@media (max-width: 640px)` ブロックに集約
- 大乱闘スマブバ‼は `games/luke/index.html` 内のJSで **clientWidth基準のscale縮小**＋
  タッチ操作ボタン（KeyboardEventをdispatchしてキー操作に変換）。
  ※CSSの `scale(calc(...px))` は無効なのでJS方式を変えないこと

## 4. 運用ワークフロー

- **コンテンツ追加（ユーザー自身が行う）**: サイトフッター「🔧 こうしんページ」→ドラッグ→種類とタイトル確認→🚀
  反映は1〜2分（Pages再デプロイ）
- **Pagesデプロイ確認**: Actions の「pages build and deployment」。まれにGitHub側の503でdeployが失敗する
  → **空コミットをpushして再トリガー**すれば直る（実績あり）
- **コード修正時**: ローカルで `python3 -m http.server` + Playwright（chromiumは `/opt/pw-browsers/`）で
  全ページのconsoleエラー無しを確認してからpush。コミッターは `Claude <noreply@anthropic.com>`

## 5. コンテンツの由来（著作物の扱い）

- コミック9話・キャラ紹介図: ユーザー提供のAI生成画像（原本はGoogle Drive「YUINA SITE DATA/COMIC」。
  PNG原本→web用JPEG q86に圧縮済み）
- 大乱闘スマブバ‼: Gemini製HTML（原本は Drive「LUKE GAME/GAME 大乱闘スマブバ」の LUKE GAME-4.html）。
  ゲームロジックは原本尊重で、追加したのは戻るリンク・スマホ縮小・タッチ操作のみ
- 楽曲: SUNO AI製（ユーザー提供）。動画: ユーザー提供のAI生成動画
- **注意**: Drive「ゆいなAI動画」内の IMG_*.JPEG は実在の子どもの写真の可能性があるため、
  指示なく公開サイトに載せないこと（本人=ユーザーの明示指示があった場合のみ）

## 6. 既知の注意点・未了事項

- `assets/comic/概要図.png`（Drive上のみ）は未組み込み（ユーザー要望なし）
- リポジトリ名が推測可能（YUINA-no-HEYA）。より秘匿するならランダム文字列入りへの再リネームを提案済み
  （リネームしてもupload.htmlは自動追従。サイトURLが変わるので家族への再共有が必要）
- より厳密なアクセス制限（あいことば方式・Cloudflare Access）は提案済み・未実装
- Google Drive連携（MCP）はセッション認証が切れやすい。切れたらユーザーにclaude.aiでの再接続を依頼するか、
  こうしんページ経由でユーザー自身にアップロードしてもらうのが早い
- mainブランチは旧サイトのまま。Pages配信ブランチを変えない限り実害なし。整理する場合は
  claudeブランチ→mainへのPR/マージ後、Pages設定のブランチをmainへ変更すること

## 7. これまでの主な作業履歴（要約）

1. 旧1ページサイトを全面リニューアル（4コンテンツのハブ型LP、ダーク→パステルPOPへ）
2. BGMフェードイン機構（当初要件「いきなり鳴らない」）
3. Google Driveから実コンテンツ移行（コミック9話、LUKE GAME一式、楽曲、動画）
4. スマホ対応（レイアウト＋ゲーム縮小＋タッチ操作）
5. media.json台帳化＋「＋ついか」ローカル追加＋こうしんページ（D&D→GitHub API直コミット）
6. サイト名「ゆいなのへや」に変更、家族限定化（noindex/robots.txt、リポジトリ名変更）
7. Pagesキャッシュ対策（media.jsonのcache-bust）、Pages 503障害時の再デプロイ対応
