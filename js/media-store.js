/* ===== ローカル追加コンテンツの保存（IndexedDB） =====
 * 「＋ついか」ボタンでえらんだ曲や動画をブラウザの中に保存します。
 * 保存したファイルはこの端末（このブラウザ）でだけ再生できます。
 * サイト全体に公開したいときは assets/ にファイルを置いて
 * assets/media.json にひとこと追記するだけでOK。
 */
const MediaStore = (() => {
  const DB_NAME = "yuina-media";

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("media", { keyPath: "id", autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function add(kind, title, file) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("media", "readwrite");
      tx.objectStore("media").add({ kind, title, blob: file, added: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function list(kind) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const out = [];
      const tx = db.transaction("media", "readonly");
      tx.objectStore("media").openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.kind === kind) out.push(cursor.value);
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function remove(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("media", "readwrite");
      tx.objectStore("media").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 「＋ついか」ボタンのセットアップ（ファイル選択→保存→再描画）
  function setupAddButton(buttonEl, kind, accept, onAdded) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = true;
    input.style.display = "none";
    document.body.appendChild(input);

    buttonEl.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      for (const file of input.files) {
        const title = file.name.replace(/\.[^.]+$/, "");
        await add(kind, title, file);
      }
      input.value = "";
      onAdded();
    });
  }

  return { add, list, remove, setupAddButton };
})();
