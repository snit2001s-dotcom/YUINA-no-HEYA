/* ===== ページ背景画像（ランダム・薄く全画面） =====
 * assets/media.json の backgrounds 配列（BG_ で始まる画像パス）から
 * ページを開くたびに1枚をランダムに選び、画面いっぱいに薄く半透明で表示します。
 * 背景画像が1枚も無いときは、従来のパステルグラデーション背景のままになります。
 */
(async () => {
  let backgrounds = [];
  try {
    const res = await fetch("assets/media.json?t=" + Date.now(), { cache: "no-store" });
    if (res.ok) backgrounds = (await res.json()).backgrounds || [];
  } catch {}
  if (!backgrounds.length) return;

  const pick = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const layer = document.createElement("div");
  layer.className = "bg-image";
  layer.style.backgroundImage = `url("${pick}")`;

  const place = () => document.body.prepend(layer);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", place);
  } else {
    place();
  }
})();
