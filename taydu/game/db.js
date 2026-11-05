// Cơ sở dữ liệu JSON cục bộ: data/db.json
// Có thể mở file này để chỉnh tay (nhớ TẮT server trước khi sửa).
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DIR, 'db.json');

const empty = () => ({ accounts: {}, chars: {}, guilds: {}, worldBoss: null, meta: { nextId: 1 } });

let db = empty();
let timer = null;

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
}

// Gom nhiều thay đổi rồi ghi 1 lần
function save() {
  if (!timer) timer = setTimeout(saveNow, 800);
}

function nextId() { return db.meta.nextId++; }

module.exports = { load, save, saveNow, nextId, get: () => db };
