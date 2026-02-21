const DB_NAME = "DemoDB";
const STORE_NAME = "scores";
const DB_VERSION = 1;

function log(msg) {
  const el = document.getElementById("log");
  el.textContent = (el.textContent ? el.textContent + "\n" : "") + msg;
}

function getDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

async function addRecord() {
  const name = document.getElementById("name").value.trim();
  const score = Number(document.getElementById("score").value) || 0;
  if (!name) {
    log("Enter a name.");
    return;
  }
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.add({ name, score });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    log(`Added: ${name} (${score})`);
    db.close();
  } catch (e) {
    log("Error: " + e.message);
  }
}

async function readAll() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    const rows = req.result;
    db.close();
    log(
      rows.length === 0
        ? "No records."
        : "Records: " + JSON.stringify(rows, null, 2)
    );
  } catch (e) {
    log("Error: " + e.message);
  }
}

async function clearStore() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    log("Store cleared.");
    db.close();
  } catch (e) {
    log("Error: " + e.message);
  }
}
