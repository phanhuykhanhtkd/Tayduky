// Cơ sở dữ liệu JSON: data/db.json
// Có thể mở file này để chỉnh tay (nhớ TẮT server trước khi sửa).
//
// Chạy trên mạng (Render…): ổ đĩa của máy chủ miễn phí bị xoá mỗi lần khởi động lại,
// nên nếu có biến môi trường SUPABASE_URL + SUPABASE_KEY, dữ liệu còn được
// sao lưu lên bảng `game_state` của Supabase và tự tải về khi máy chủ bật lên.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DIR, 'db.json');

const empty = () => ({ accounts: {}, chars: {}, guilds: {}, worldBoss: null, meta: { nextId: 1 } });

let db = empty();
let timer = null;

// ---------- lưu trên mây (tuỳ chọn) ----------
const CLOUD_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const CLOUD_KEY = process.env.SUPABASE_KEY || '';
const CLOUD = !!(CLOUD_URL && CLOUD_KEY);
const TABLE = process.env.SUPABASE_TABLE || 'game_state';
let dirty = false, pushing = null, pushTimer = null;

function headers(extra = {}) {
  const h = { apikey: CLOUD_KEY, 'Content-Type': 'application/json', ...extra };
  if (CLOUD_KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + CLOUD_KEY; // khoá kiểu cũ (JWT)
  return h;
}

// tải dữ liệu từ mây về data/db.json (gọi trước khi server chạy)
async function pull() {
  if (!CLOUD) return false;
  const r = await fetch(`${CLOUD_URL}/rest/v1/${TABLE}?id=eq.1&select=data`, { headers: headers() });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const rows = await r.json();
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  if (rows[0] && rows[0].data) { fs.writeFileSync(FILE, JSON.stringify(rows[0].data)); return true; }
  return false;
}

async function push() {
  if (!CLOUD) return;
  if (pushing) { await pushing; if (!dirty) return; }
  dirty = false;
  const body = JSON.stringify({ id: 1, data: db, updated_at: new Date().toISOString() });
  pushing = fetch(`${CLOUD_URL}/rest/v1/${TABLE}?on_conflict=id`, { method: 'POST', headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body })
    .then(async (r) => { if (!r.ok) { dirty = true; console.error('[DB] Lỗi lưu lên Supabase', r.status, await r.text()); } })
    .catch((e) => { dirty = true; console.error('[DB] Không kết nối được Supabase:', e.message); })
    .finally(() => { pushing = null; });
  return pushing;
}
function schedulePush() { dirty = true; if (!pushTimer) pushTimer = setTimeout(() => { pushTimer = null; push(); }, 4000); }
if (CLOUD) setInterval(() => { if (dirty) push(); }, 60000).unref();

// ---------- tệp cục bộ ----------
function load() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  if (fs.existsSync(FILE)) {
    try {
      db = Object.assign(empty(), JSON.parse(fs.readFileSync(FILE, 'utf8')));
    } catch (e) {
      const bak = FILE + '.broken-' + Date.now();
      fs.copyFileSync(FILE, bak);
      console.error('[DB] db.json lỗi, đã sao lưu sang', bak, '- tạo DB mới.');
      db = empty();
    }
  }
  return db;
}

function saveNow() {
  clearTimeout(timer);
  timer = null;
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
  fs.renameSync(tmp, FILE);
  if (CLOUD) schedulePush();
}

// Gom nhiều thay đổi rồi ghi 1 lần
function save() {
  if (!timer) timer = setTimeout(saveNow, 800);
}

// ghi hết trước khi tắt máy chủ
async function flush() {
  if (timer) saveNow();
  clearTimeout(pushTimer); pushTimer = null;
  if (CLOUD && (dirty || pushing)) { dirty = true; await push(); }
}

function nextId() { return db.meta.nextId++; }

module.exports = { load, save, saveNow, flush, pull, nextId, get: () => db, CLOUD };
