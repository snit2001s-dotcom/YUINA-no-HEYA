/* ===== Yuina Site — BGM（フェードイン対応） =====
 * ブラウザの自動再生制限のため、最初のクリック/タップ/キー操作を合図に再生を開始し、
 * 音量 0 から FADE_SECONDS 秒かけてゆっくりフェードインします（急に鳴り出さない）。
 *
 * 音源: assets/audio/bgm.mp3 を置くとそれを再生します。
 * ファイルが無い場合は Web Audio でやさしいアンビエント・パッドを自動生成して流します。
 * 右下のボタンでいつでも ON / OFF できます（設定は保存されます）。
 */
(() => {
  const BGM_SRC = "assets/audio/bgm.mp3";
  const FADE_SECONDS = 4;      // フェードインにかける秒数
  const TARGET_VOLUME = 0.35;  // フェードイン後の音量
  const STORAGE_KEY = "yuina-bgm-enabled";

  let ctx = null;
  let masterGain = null;
  let started = false;
  let synthTimer = null;
  let enabled = localStorage.getItem(STORAGE_KEY) !== "off";

  // --- 右下のトグルボタンを生成 ---
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "bgm-toggle";
  btn.setAttribute("aria-label", "BGMのオン・オフ");
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(btn));
  if (document.readyState !== "loading") document.body.appendChild(btn);

  function updateButton() {
    const playing = enabled && started;
    btn.textContent = enabled ? "♪" : "🔇";
    btn.title = enabled ? "BGMをオフにする" : "BGMをオンにする";
    btn.classList.toggle("is-playing", playing);
  }
  updateButton();

  function ensureContext() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
  }

  function fadeTo(value, seconds) {
    const g = masterGain.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(value, ctx.currentTime + seconds);
  }

  // media.json に bgm の指定があればそちらを優先（曲の差し替えがJSON1行で済む）
  async function resolveSrc() {
    try {
      const res = await fetch("assets/media.json?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const m = await res.json();
        if (m.bgm) return m.bgm;
      }
    } catch {}
    return BGM_SRC;
  }

  // --- BGMファイルがあればループ再生、無ければ生成アンビエントにフォールバック ---
  async function startSource() {
    try {
      const res = await fetch(await resolveSrc());
      if (!res.ok) throw new Error("bgm file not found");
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(masterGain);
      src.start();
    } catch {
      startGenerativePad();
    }
  }

  // やさしいコード進行（Cmaj7 → Am7 → Fmaj7 → G6）をゆっくり鳴らすアンビエント
  function startGenerativePad() {
    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 329.63],
    ];
    const CHORD_SECONDS = 6;
    let step = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.connect(masterGain);

    function playChord() {
      const freqs = chords[step % chords.length];
      step++;
      const now = ctx.currentTime;
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.16 / (i + 1), now + 2);
        env.gain.linearRampToValueAtTime(0, now + CHORD_SECONDS + 1.5);
        osc.connect(env).connect(filter);
        osc.start(now);
        osc.stop(now + CHORD_SECONDS + 2);
      });
    }
    playChord();
    synthTimer = setInterval(playChord, CHORD_SECONDS * 1000);
  }

  async function start() {
    if (started || !enabled) return;
    started = true;
    ensureContext();
    if (ctx.state === "suspended") await ctx.resume();
    await startSource();
    fadeTo(TARGET_VOLUME, FADE_SECONDS); // ← ここで徐々にフェードイン
    updateButton();
  }

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    if (enabled) {
      if (started) {
        if (ctx.state === "suspended") await ctx.resume();
        fadeTo(TARGET_VOLUME, FADE_SECONDS);
      } else {
        await start();
      }
    } else if (ctx) {
      fadeTo(0, 1.2);
    }
    updateButton();
  });

  // 最初のユーザー操作でスタート（自動再生ブロック対策）
  const kick = () => { start(); };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
    window.addEventListener(ev, kick, { once: true, passive: true })
  );
})();
