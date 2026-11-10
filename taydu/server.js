// =====================================================================
//  TÂY DU KÝ MOBILE – MÁY CHỦ NỘI BỘ
//  Chạy:  node server.js        (không cần npm install)
//  Mở trên iPhone (cùng Wi-Fi):  http://<IP-máy-tính>:3000
// =====================================================================
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const D = require('./game/data');
require('./game/data2'); // gộp vật phẩm / kỹ năng mới vào D
const Z = require('./game/data3'); // Thần sủng, hậu truyện, phúc lợi… (Đợt 2–6)
const F2 = require('./game/features2');
const F3 = require('./game/features3');
const L = require('./game/logic');
const DB = require('./game/db');
const { Battle } = require('./game/battle');
const { Server } = require('./game/realtime');
const F = require('./game/features');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, 'public');
DB.load();
const db = DB.get();
// ---- chuyển nhân vật từ cốt truyện cũ (21 bước) sang 81 nạn ----
for (const c of Object.values(db.chars)) {
  if (c.storyVer === 2) continue;
  if (c.quest >= 5) c.quest = D.QUESTS.findIndex((q) => q.map === 'ch2');
  c.quest = Math.min(c.quest, D.QUESTS.length);
  c.qprog = 0;
  c.nan = D.QUESTS.slice(0, c.quest).reduce((s, q) => s + q.nan, 0);
  const cur = D.QUESTS[c.quest] || D.QUESTS[D.QUESTS.length - 1];
  c.unlocked = D.MAPS[cur.map].chapter;
  if (!D.MAPS[c.map] || D.MAPS[c.map].chapter > c.unlocked) c.map = cur.map;
  const M = D.MAPS[c.map], ch = (M.tiles[c.y] || '')[c.x];
  if (!'.,P'.includes(ch || '#') || M.npcs.some((n) => n.x === c.x && n.y === c.y)) { c.x = M.spawn[0]; c.y = M.spawn[1]; }
  c.storyVer = 2;
}
// ---- tách 15 chương thành 29 bản đồ (bản đồ v3): tính lại chương đã mở, đổi mã bản đồ cũ ----
for (const c of Object.values(db.chars)) {
  if (c.mapVer === 3) continue;
  const qi = Math.min(c.quest || 0, D.QUESTS.length - 1), cur = D.QUESTS[qi];
  const done = (c.quest || 0) >= D.QUESTS.length;
  c.unlocked = done ? D.MAP_ORDER.length : Math.max(1, D.MAPS[cur.map].chapter);
  if (D.MAP_ALIAS[c.map]) c.map = D.MAP_ALIAS[c.map];
  if (!D.MAPS[c.map] || D.MAPS[c.map].chapter > c.unlocked) c.map = cur.map;
  const M = D.MAPS[c.map], ch = (M.tiles[c.y] || '')[c.x];
  if (!'.,P'.includes(ch || '#') || M.npcs.some((n) => n.x === c.x && n.y === c.y)) { c.x = M.spawn[0]; c.y = M.spawn[1]; }
  c.mapVer = 3;
}
// ---- thú cưỡi thần: ai đã qua nhiệm vụ boss đó thì nhận bù ----
for (const c of Object.values(db.chars)) {
  for (const [mid, m] of Object.entries(require('./game/data2').MOUNTS)) {
    if (!m.boss) continue; const qi = D.QUESTS.findIndex((q) => q.boss === m.boss);
    if (qi >= 0 && (c.quest || 0) > qi && !(c.mounts || []).includes(mid)) c.mounts = [...(c.mounts || []), mid];
  }
}
// ---- mỗi lần khởi động: ai đứng trên ô không đi được (bản đồ vừa vẽ lại lưới) thì về điểm xuất phát ----
for (const c of Object.values(db.chars)) {
  const M = D.MAPS[c.map]; if (!M) continue;
  const ch = (M.tiles[c.y] || '')[c.x];
  if (!'.,P'.includes(ch || '#') || M.npcs.some((n) => n.x === c.x && n.y === c.y)) { c.x = M.spawn[0]; c.y = M.spawn[1]; }
}
// ---- 3 phái Phật/Tiên/Yêu + đội 3 Tiên sủng ----
for (const c of Object.values(db.chars)) L.migrateChar(c);
DB.save();

// --------------------------------------------------------------------
//  HTTP tĩnh
// --------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400); return res.end(); }
  if (p.includes('\0')) { res.writeHead(400); return res.end(); }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Không tìm thấy'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' ws: wss:; font-src 'self' data:" });
    res.end(buf);
  });
});
const io = new Server(server, { path: '/ws' });

// --------------------------------------------------------------------
//  Trạng thái trong bộ nhớ
// --------------------------------------------------------------------
const online = new Map(); // charId -> socket
const battles = new Map(); // charId -> Battle
const chat = { khu: [], shop: [], he: [], phai: {} };
const pending = new Map(); // charId(target) -> [{type, fromId, fromName, t}]
const lastChat = new Map(), lastText = new Map();
const respondHooks = new Map();

const hashPass = (pass, salt) => crypto.scryptSync(pass, salt, 32).toString('hex');
const charOf = (s) => (s.data.charId ? db.chars[s.data.charId] : null);
const charByName = (n) => Object.values(db.chars).find((c) => c.name.toLowerCase() === String(n).trim().toLowerCase());
const hour = () => (process.env.TDK_HOUR ? Number(process.env.TDK_HOUR) : L.vnNow().getUTCHours()); // TDK_HOUR: giả lập giờ để thử nhiệm vụ ẩn
const fmt = (n) => Number(n).toLocaleString('vi-VN');

function pushState(c) { const s = online.get(c.id); if (s) s.emit('state', L.publicChar(c)); }
function toast(c, msg, type) { const s = online.get(c.id); if (s) s.emit('toast', { msg, type }); }

function addChat(ch, msg, guildId) {
  const m = { ...msg, ch, t: Date.now() };
  let list;
  if (ch === 'phai') { list = chat.phai[guildId] = chat.phai[guildId] || []; }
  else list = chat[ch];
  list.push(m);
  if (list.length > 40) list.shift();
  if (ch === 'phai') io.to('guild:' + guildId).emit('chat', m);
  else io.broadcast('chat', m);
}
const sys = (text) => addChat('he', { from: 'Hệ thống', text });

function mapPlayers(mapId) {
  const out = [];
  for (const [cid] of online) {
    const c = db.chars[cid];
    if (c && c.map === mapId) out.push(playerBrief(c));
  }
  return out;
}
const playerBrief = (c) => ({ id: c.id, name: c.name, race: c.race, gender: c.gender, lvl: c.lvl, x: c.x, y: c.y, gear: L.gearBrief(c), guild: c.guild ? db.guilds[c.guild]?.name : null, title: F3.titleOf(c), stall: c.stall ? c.stall.title : null });

function tileAt(mapId, x, y) { const t = D.MAPS[mapId].tiles[y]; return t ? t[x] || '#' : '#'; }
function walkable(mapId, x, y) {
  const ch = tileAt(mapId, x, y);
  if (ch === 'W') return hour() >= 17 && hour() < 19;
  if (!'.,P'.includes(ch)) return false;
  return !D.MAPS[mapId].npcs.some((n) => n.x === x && n.y === y);
}

// --------------------------------------------------------------------
//  Dữ liệu tĩnh gửi client (giấu toạ độ bí mật & bảng quái)
// --------------------------------------------------------------------
function metaBundle() {
  const maps = {};
  for (const [k, m] of Object.entries(D.MAPS)) {
    maps[k] = { name: m.name, chapter: m.chapter, theme: m.theme, bg: m.bg, lv: m.lv, spawn: m.spawn, tiles: m.tiles,
      sub: m.sub, post: m.post, asc: m.asc, nodes: m.nodes || [], npcs: m.npcs.map(({ id, name, icon, x, y, boss, role, look, art }) => ({ id, name, icon, x, y, boss: !!boss, role, look, art })) };
  }
  return {
    RACES: D.RACES, SKILLS: D.SKILLS, ELEMENTS: D.ELEMENTS, GRADES: D.GRADES, ITEMS: D.ITEMS, SLOTS: D.SLOTS,
    QUALITIES: D.QUALITIES, STAT_NAMES: D.STAT_NAMES, MAPS: maps, MAP_ORDER: D.MAP_ORDER, CONFIG: D.CONFIG,
    QUESTS: D.QUESTS.map((q) => ({ title: q.title, text: q.text, map: q.map, nan: q.nan, no: q.no, type: q.type, count: q.count })),
    SECRETS: Object.fromEntries(Object.entries(D.SECRETS).map(([k, v]) => [k, { name: v.name, reward: v.reward }])),
    SPECIES_COUNT: D.SPECIES_COUNT, FORMS: D.FORMS.map((f) => ({ id: f.id, name: f.name, icon: f.icon })),
    ENHANCE_RATE: D.ENHANCE_RATE, MOUNTS: require('./game/data2').MOUNTS, STORY_END: D.STORY_END, NMAIN: D.NMAIN,
    X3: { THAN: Z.THAN, THAN_COST: Z.THAN_COST, MENH: Z.MENH, MENH_LVL: Z.MENH_LVL, MENH_CHANGE_VANG: Z.MENH_CHANGE_VANG, TRAITS: Z.TRAITS, TITLES: Z.TITLES, GATHER: { ...Z.GATHER, needLv: undefined },
      WORLD_EVENTS: Z.WORLD_EVENTS, ASCEND: Z.ASCEND, NIGHTMARE: Z.NIGHTMARE, MOUNT_MAX_LV: Z.MOUNT_MAX_LV },
  };
}
const META = metaBundle();
// Tranh tuỳ chỉnh: public/assets/<thư mục>/<mã>.png|webp|jpg  (xem ART-SPEC.md)
function scanAssets() {
  const out = {};
  for (const k of ['monsters', 'bosses', 'npcs', 'heroes', 'maps', 'battle', 'mounts', 'fx', 'objects', 'ui', 'icons']) {
    out[k] = {};
    try { for (const f of fs.readdirSync(path.join(PUBLIC, 'assets', k))) { const m = /^(.+)\.(png|webp|jpe?g)$/i.exec(f); if (m) out[k][m[1]] = f; } } catch {}
  }
  return out;
}

// --------------------------------------------------------------------
//  Kết nối
// --------------------------------------------------------------------
// ---------- chống spam / dò mật khẩu ----------
const ipOf = (s) => { const x = s.req && s.req.headers['x-forwarded-for']; return String(x ? x.split(',').pop() : s.address || '').trim(); }; // lấy địa chỉ do proxy (Render) ghi cuối cùng
const conns = new Map(); // ip -> số kết nối
const loginFails = new Map(); // key -> {n, until}
const regs = new Map(); // ip -> [thời điểm]
// tài khoản: 8 lần sai / 10 phút → khoá 5 phút · một IP (có thể nhiều người dùng chung mạng): 40 lần
function failKey(k) { const max = k.startsWith('ip:') ? 40 : 8; const f = loginFails.get(k) || { n: 0, until: 0, first: Date.now() }; if (Date.now() - f.first > 10 * 60e3) { f.n = 0; f.first = Date.now(); } f.n++; if (f.n >= max) { f.until = Date.now() + 5 * 60e3; f.n = 0; } loginFails.set(k, f); }
const locked = (k) => (loginFails.get(k) || {}).until > Date.now();
setInterval(() => { const now = Date.now(); for (const [k, f] of loginFails) if (f.until < now && now - f.first > 15 * 60e3) loginFails.delete(k); for (const [k, l] of regs) { const r = l.filter((t) => now - t < 3600e3); if (r.length) regs.set(k, r); else regs.delete(k); } }, 60e3).unref();

io.on('connection', (socket) => {
  const ip = ipOf(socket);
  conns.set(ip, (conns.get(ip) || 0) + 1);
  if (conns.get(ip) > Number(process.env.TDK_CONN_LIMIT || 12)) { socket.close(); conns.set(ip, conns.get(ip) - 1); return; }
  // giới hạn tốc độ: 25 lệnh/giây, tích luỹ tối đa 50
  let tokens = 50, last = Date.now(), strikes = 0;
  const allow = () => { const now = Date.now(); tokens = Math.min(50, tokens + (now - last) / 40); last = now; if (tokens < 1) { if (++strikes > 200) socket.close(); return false; } tokens--; return true; };
  const on = (evt, needChar, fn) => {
    socket.on(evt, async (d, ack) => {
      if (typeof ack !== 'function') ack = () => {};
      if (!allow()) return ack({ ok: false, msg: 'Thao tác quá nhanh, chờ chút nhé.' });
      if (d != null && typeof d !== 'object') d = {};
      try {
        const c = charOf(socket);
        if (needChar && !c) return ack({ ok: false, msg: 'Chưa vào game.' });
        if (c) { L.resetDaily(c); F3.touch(c); }
        const r = (await fn(c, d || {})) || { ok: true };
        if (c && r.ok !== false && !r.noState) r.state = L.publicChar(c);
        delete r.noState;
        DB.save();
        ack(r);
      } catch (e) {
        console.error(`[LỖI] ${evt}:`, e && e.stack || e);
        ack({ ok: false, msg: 'Máy chủ gặp lỗi, thử lại sau.' });
      }
    });
  };
  const notInBattle = (c) => (battles.has(c.id) ? { ok: false, msg: 'Đang trong trận đấu!' } : null);

  on('meta', false, () => ({ ok: true, meta: { ...META, ASSETS: scanAssets() }, noState: true }));

  // ---------------- Tài khoản ----------------
  // mã khôi phục 8 ký tự (bỏ các ký tự dễ nhầm 0/O, 1/I/L) – chỉ lưu bản băm
  const RC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function newRecovery(acc) {
    const raw = [...crypto.randomBytes(8)].map((x) => RC[x % RC.length]).join('');
    acc.rcSalt = crypto.randomBytes(8).toString('hex'); acc.rc = hashPass(raw, acc.rcSalt);
    return raw.slice(0, 4) + '-' + raw.slice(4);
  }
  const normRC = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  function bindAccount(user) {
    socket.data.user = user;
    const acc = db.accounts[user];
    return { ok: true, token: acc.token, hasChar: !!acc.charId };
  }
  on('auth:register', false, (_, { user, pass }) => {
    const rl = (regs.get(ip) || []).filter((t) => Date.now() - t < 3600e3);
    if (rl.length >= Number(process.env.TDK_REG_LIMIT || 6)) return { ok: false, msg: 'Tạo quá nhiều tài khoản – thử lại sau 1 giờ.' };
    user = String(user || '').trim().toLowerCase();
    if (String(pass || '').length > 64) return { ok: false, msg: 'Mật khẩu tối đa 64 ký tự.' };
    if (!/^[a-z0-9_]{3,16}$/.test(user)) return { ok: false, msg: 'Tên đăng nhập 3–16 ký tự (a-z, 0-9, _).' };
    if (String(pass || '').length < 4) return { ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' };
    if (db.accounts[user]) return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
    const salt = crypto.randomBytes(8).toString('hex');
    db.accounts[user] = { salt, pass: hashPass(String(pass), salt), token: crypto.randomBytes(16).toString('hex'), charId: null, createdAt: Date.now() };
    rl.push(Date.now()); regs.set(ip, rl);
    const recovery = newRecovery(db.accounts[user]);
    return { ...bindAccount(user), recovery };
  });
  on('auth:login', false, (_, { user, pass }) => {
    user = String(user || '').trim().toLowerCase().slice(0, 32);
    if (locked('u:' + user) || locked('ip:' + ip)) return { ok: false, msg: 'Sai quá nhiều lần – thử lại sau 5 phút.' };
    const acc = db.accounts[user];
    if (!acc || acc.pass !== hashPass(String(pass || '').slice(0, 64), acc.salt)) { failKey('u:' + user); failKey('ip:' + ip); return { ok: false, msg: 'Sai tên đăng nhập hoặc mật khẩu.' }; }
    return bindAccount(user);
  });
  on('auth:token', false, (_, { token }) => {
    if (typeof token !== 'string' || token.length !== 32 || locked('ip:' + ip)) return { ok: false, msg: 'Phiên đăng nhập hết hạn.' };
    const user = Object.keys(db.accounts).find((u) => db.accounts[u].token === token);
    if (!user) { failKey('ip:' + ip); return { ok: false, msg: 'Phiên đăng nhập hết hạn.' }; }
    return bindAccount(user);
  });

  on('auth:changePass', false, (_, { old, pass }) => {
    const acc = db.accounts[socket.data.user];
    if (!acc) return { ok: false, msg: 'Chưa đăng nhập.' };
    if (locked('u:' + socket.data.user)) return { ok: false, msg: 'Sai quá nhiều lần – thử lại sau 5 phút.' };
    if (acc.pass !== hashPass(String(old || '').slice(0, 64), acc.salt)) { failKey('u:' + socket.data.user); return { ok: false, msg: 'Mật khẩu cũ không đúng.' }; }
    if (String(pass || '').length < 4 || String(pass).length > 64) return { ok: false, msg: 'Mật khẩu mới 4–64 ký tự.' };
    acc.salt = crypto.randomBytes(8).toString('hex');
    acc.pass = hashPass(String(pass), acc.salt);
    acc.token = crypto.randomBytes(16).toString('hex'); // các thiết bị khác phải đăng nhập lại
    return { ok: true, token: acc.token, msg: 'Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.', noState: true };
  });
  on('auth:recover', false, (_, { user, code, pass }) => {
    user = String(user || '').trim().toLowerCase().slice(0, 32);
    if (locked('u:' + user) || locked('ip:' + ip)) return { ok: false, msg: 'Sai quá nhiều lần – thử lại sau 5 phút.' };
    const acc = Object.prototype.hasOwnProperty.call(db.accounts, user) ? db.accounts[user] : null;
    const c = normRC(code);
    if (!acc || !acc.rc || c.length !== 8 || acc.rc !== hashPass(c, acc.rcSalt)) { failKey('u:' + user); failKey('ip:' + ip); return { ok: false, msg: 'Sai tên đăng nhập hoặc mã khôi phục.' }; }
    if (String(pass || '').length < 4 || String(pass).length > 64) return { ok: false, msg: 'Mật khẩu mới 4–64 ký tự.' };
    acc.salt = crypto.randomBytes(8).toString('hex'); acc.pass = hashPass(String(pass), acc.salt);
    acc.token = crypto.randomBytes(16).toString('hex');
    const recovery = newRecovery(acc); // mã cũ hết hiệu lực sau khi dùng
    return { ...bindAccount(user), recovery, msg: 'Đã đặt lại mật khẩu.' };
  });
  on('auth:recoveryNew', false, (_, { pass }) => {
    const acc = db.accounts[socket.data.user];
    if (!acc) return { ok: false, msg: 'Chưa đăng nhập.' };
    if (locked('u:' + socket.data.user)) return { ok: false, msg: 'Sai quá nhiều lần – thử lại sau 5 phút.' };
    if (acc.pass !== hashPass(String(pass || '').slice(0, 64), acc.salt)) { failKey('u:' + socket.data.user); return { ok: false, msg: 'Mật khẩu không đúng.' }; }
    return { ok: true, recovery: newRecovery(acc), noState: true };
  });
  on('auth:logoutAll', false, () => {
    const acc = db.accounts[socket.data.user];
    if (!acc) return { ok: false, msg: 'Chưa đăng nhập.' };
    acc.token = crypto.randomBytes(16).toString('hex');
    return { ok: true, token: acc.token, msg: 'Đã đăng xuất khỏi mọi thiết bị khác.', noState: true };
  });
  on('tut:set', true, (c, { step, done }) => {
    c.tut = Math.max(0, Math.min(99, Number(step) || 0));
    if (c.tut >= 99 && done && !c.tutReward) { c.tutReward = true; L.applyReward(c, { bac: 500, items: { bau_bac: 2 } }); return { ok: true }; }
    return { ok: true, noState: true };
  });

  on('char:create', false, (_, { name, race, gender, face }) => {
    const acc = db.accounts[socket.data.user];
    if (!acc) return { ok: false, msg: 'Chưa đăng nhập.' };
    if (acc.charId) return { ok: false, msg: 'Tài khoản đã có nhân vật.' };
    name = String(name || '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e<>&"'`]/g, '').trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 12) return { ok: false, msg: 'Tên nhân vật 2–12 ký tự.' };
    if (charByName(name)) return { ok: false, msg: 'Tên đã có người dùng.' };
    race = F2.own(D.RACE_ALIAS, race) ? D.RACE_ALIAS[race] : race;
    if (!F2.own(D.RACES, race)) return { ok: false, msg: 'Chọn phái.' };
    face = F2.int(face, -1, 5); if (face == null) face = -1;
    const id = 'c' + DB.nextId();
    db.chars[id] = L.createChar(id, socket.data.user, name, race, gender === 'f' ? 'f' : 'm', face >= 0 ? face : undefined);
    acc.charId = id;
    sys(`Chào mừng tân thủ [${name}] (phái ${D.RACES[race].name}) gia nhập Tam Giới!`);
    return { ok: true, noState: true };
  });

  // chọn lại gương mặt miễn phí 1 lần (nhân vật chuyển từ phái cũ)
  on('char:face', true, (c, { face }) => {
    if (!c.facePick) return { ok: false, msg: 'Bạn đã dùng lượt đổi gương mặt miễn phí.' };
    face = F2.int(face, 0, 5); if (face == null) return { ok: false, msg: 'Chọn gương mặt.' };
    c.face = face; c.gender = D.RACES[c.race].avatars[face].gender; c.facePick = false;
    return { ok: true, msg: `Đã đổi sang ${D.RACES[c.race].avatars[face].name}.` };
  });
  on('enter', false, () => {
    const acc = db.accounts[socket.data.user];
    if (!acc || !acc.charId) return { ok: false, msg: 'Chưa có nhân vật.' };
    const c = db.chars[acc.charId];
    const old = online.get(c.id);
    if (old && old !== socket) { old.emit('kicked', { msg: 'Tài khoản đăng nhập ở thiết bị khác.' }); old.data.charId = null; old.close(); }
    socket.data.charId = c.id;
    online.set(c.id, socket);
    socket.join('map:' + c.map);
    if (c.guild && db.guilds[c.guild]) socket.join('guild:' + c.guild);
    io.to('map:' + c.map).emit('map:join', playerBrief(c), socket);
    const b = battles.get(c.id);
    return {
      ok: true, state: L.publicChar(c), players: mapPlayers(c.map).filter((p) => p.id !== c.id), battle: b ? b.snapshot() : null,
      chat: [...chat.khu, ...chat.shop, ...chat.he, ...(c.guild ? chat.phai[c.guild] || [] : [])].sort((a, b2) => a.t - b2.t),
      pending: pending.get(c.id) || [], boss: bossInfo(),
      mail: (c.mail || []).filter((m) => !m.seen).length, event: (() => { const e = F2.activeEvent(); return e ? { id: e.id, name: e.name, icon: e.icon } : null; })(),
      welfare: F3.onEnter(c),
    };
  });

  socket.on('disconnect', () => {
    conns.set(ip, Math.max(0, (conns.get(ip) || 1) - 1));
    const c = charOf(socket);
    if (c && online.get(c.id) === socket) {
      F3.onLeave(c, io);
      online.delete(c.id);
      io.to('map:' + c.map).emit('map:leave', { id: c.id });
    }
    DB.save();
  });

  // ---------------- Chỉ số ----------------
  on('stat:alloc', true, (c, d) => {
    const add = {};
    let sum = 0;
    for (const k of ['the', 'luc', 'phap', 'nhanh']) { add[k] = Math.max(0, Math.floor(Number(d[k]) || 0)); sum += add[k]; }
    if (!sum) return { ok: false, msg: 'Chưa cộng điểm nào.' };
    if (sum > c.points) return { ok: false, msg: 'Không đủ điểm tiềm năng.' };
    for (const k in add) c.stats[k] += add[k];
    c.points -= sum;
    L.clampHpMp(c);
    return { ok: true, msg: `Đã cộng ${sum} điểm.` };
  });
  on('stat:reset', true, (c) => {
    if (c.vang < 20) return { ok: false, msg: 'Cần 20 vàng để tẩy điểm.' };
    c.vang -= 20;
    c.stats = { ...D.RACES[c.race].base };
    c.points = (c.lvl - 1) * D.CONFIG.pointsPerLevel;
    L.clampHpMp(c);
    return { ok: true, msg: 'Đã tẩy điểm tiềm năng.' };
  });
  on('char:peace', true, (c) => { c.peace = !c.peace; return { ok: true, msg: c.peace ? 'Đã BẬT tránh quái.' : 'Đã TẮT tránh quái.', peace: c.peace }; });

  // ---------------- Di chuyển ----------------
  on('move', true, (c, { x, y }) => {
    const nb = notInBattle(c); if (nb) return nb;
    x = Math.floor(x); y = Math.floor(y);
    const r0 = {};
    if (Math.abs(x - c.x) + Math.abs(y - c.y) !== 1) return { ok: false, msg: 'Bước không hợp lệ', pos: [c.x, c.y], noState: true };
    if (!walkable(c.map, x, y)) {
      const ch = tileAt(c.map, x, y);
      return { ok: false, msg: ch === 'W' ? 'Dòng thác chảy xiết, chưa thể vào...' : '', pos: [c.x, c.y], noState: true };
    }
    const stallMsg = F3.onMove(c, io);
    c.x = x; c.y = y;
    // hồi phục nhẹ khi đi bộ (1% khí huyết & nội lực mỗi bước; Mộc Mệnh 2%)
    const ds = L.calcStats(c), rg = c.menh === 'moc' ? 0.02 : 0.01;
    if (stallMsg) r0.msg = stallMsg;
    if (c.hp < ds.maxHp || c.mp < ds.maxMp) {
      c.hp = Math.min(ds.maxHp, c.hp + Math.ceil(ds.maxHp * rg));
      c.mp = Math.min(ds.maxMp, c.mp + Math.ceil(ds.maxMp * rg));
      r0.regen = [c.hp, c.mp];
    }
    io.to('map:' + c.map).emit('map:move', { id: c.id, x, y }, socket);
    const tile = tileAt(c.map, x, y);
    const r = Object.assign(r0, { ok: true, pos: [x, y], noState: true });

    // nhiệm vụ ẩn theo toạ độ + giờ
    const sec = checkSecretAt(c);
    if (sec) { r.secret = sec; r.noState = false; return r; }

    if (tile === 'P') {
      const idx = D.MAP_ORDER.indexOf(c.map);
      const next = D.MAP_ORDER[idx + 1];
      const gate = next && F3.mapGate(c, D.MAPS[next]);
      if (gate) { r.msg = gate; return r; }
      if (next && c.unlocked >= D.MAPS[next].chapter) { travel(c, next); r.travel = next; r.players = mapPlayers(next).filter((p) => p.id !== c.id); r.noState = false; }
      else r.msg = next ? 'Cổng phong ấn – hãy hoàn thành cốt truyện chương này.' : 'Phía trước là hư vô tận cùng…';
      return r;
    }
    if (tile === ',' && !c.peace && Math.random() < D.MAPS[c.map].encounter.rate * F3.encMul()) {
      const enemies = F3.decorateEnemies(c, L.rollEncounter(c.map, c.lvl));
      r.battle = startBattle(c, enemies, { kind: 'wild' });
    }
    return r;
  });

  on('map:travel', true, (c, { map }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const M = F2.own(D.MAPS, map);
    if (!M) return { ok: false, msg: 'Bản đồ không tồn tại.' };
    { const g = F3.mapGate(c, M); if (g) return { ok: false, msg: g }; }
    if (M.chapter > c.unlocked) return { ok: false, msg: 'Chưa mở khoá chương này.' };
    travel(c, map);
    return { ok: true, players: mapPlayers(map).filter((p) => p.id !== c.id) };
  });

  function travel(c, map) {
    io.to('map:' + c.map).emit('map:leave', { id: c.id }, socket);
    socket.leave('map:' + c.map);
    c.map = map; c.x = D.MAPS[map].spawn[0]; c.y = D.MAPS[map].spawn[1];
    c.secretState.thodia = 0;
    socket.join('map:' + map);
    io.to('map:' + map).emit('map:join', playerBrief(c), socket);
  }

  // ---------------- NPC ----------------
  function findNpc(c, id) {
    const n = D.MAPS[c.map].npcs.find((x) => x.id === id);
    if (!n) return null;
    if (Math.abs(n.x - c.x) + Math.abs(n.y - c.y) > 2) return null;
    return n;
  }
  function bossStepIdx(bossId) { return D.QUESTS.findIndex((q) => q.type === 'boss' && q.boss === bossId); }

  on('npc:talk', true, (c, { id }) => {
    const n = findNpc(c, id);
    if (!n) return { ok: false, msg: 'Hãy lại gần NPC.' };
    const q = D.QUESTS[c.quest];
    const opts = [];
    let text = n.talk || '...';
    if (n.id !== 'thodia') c.secretState.thodia = 0;
    c.secretState.rumors = c.secretState.rumors || {};
    if (n.rumor) c.secretState.rumors[n.rumor] = true;
    if (n.id === 'thodia') c.secretState.rumors.thodia = true;

    if (q && q.type === 'talk' && q.npc === n.id && q.map === c.map) opts.push({ id: 'quest', label: '📜 ' + q.title });
    if (n.boss) {
      const B = D.BOSSES[n.boss];
      const si = bossStepIdx(n.boss);
      if (q && q.type === 'boss' && q.boss === n.boss) { text = `${B.name} (Cấp ${B.lv}): Kẻ nào dám xông vào đây?!`; opts.push({ id: 'fight', label: '⚔️ Khiêu chiến' }); }
      else if (si >= 0 && c.quest > si) { text = `${B.name}: Lần trước chỉ là ta sơ suất. Đánh lại không?`; opts.push({ id: 'fight', label: '⚔️ Tái chiến (nhận vật phẩm)' }); }
      else text = `${B.name} đang bế quan. Hãy hoàn thành cốt truyện trước đã.`;
    }
    F3hook.talk(c, n, opts);
    if (n.role === 'heal') opts.push({ id: 'heal', label: `💚 Trị thương (${c.lvl <= 10 ? 'miễn phí' : fmt(c.lvl * 6) + ' bạc'})` });
    if (n.role === 'shop') opts.push({ id: 'shop', label: '🛒 Mua bán' });
    if (n.role === 'peach') opts.push({ id: 'peach', label: `🍑 Trộm Đào (${D.CONFIG.dailyPeach - c.daily.peach}/${D.CONFIG.dailyPeach} lượt)` });
    if (n.role === 'casino') opts.push({ id: 'dice', label: '🎲 Tài Xỉu' }, { id: 'rps', label: '✊ Oẳn Tù Tì' });

    // nhiệm vụ ẩn qua hội thoại
    if (n.id === 'laoong' && !c.secrets.tienhac) {
      const pet = c.pets.find((p) => p.uid === c.activePet);
      if (pet && D.getSpecies(pet.sid).form === 'tienhac') {
        text = 'Ô kìa… con hạc này! Đúng là ân nhân năm xưa rồi! Lão có món quà muốn tặng…';
        opts.push({ id: 'tienhac', label: '🕊️ Nhận quà báo ân' });
      }
    }
    if (n.id === 'thodia' && !c.secrets.thodia) {
      c.secretState.thodia = (c.secretState.thodia || 0) + 1;
      const k = c.secretState.thodia;
      text = k === 1 ? 'Ta là Thổ Địa vùng này, chẳng biết gì đâu…' : k === 2 ? 'Lại là ngươi? Đã bảo ta không biết gì mà…' : 'Thôi được… ngươi kiên nhẫn thật. Hãy niệm câu mật ngữ của Bồ Tát, ta sẽ trao bảo vật.';
      if (k >= 3) opts.push({ id: 'mantra', label: '🕉️ Niệm: “Án Ma Ni Bát Di Hồng”' });
    }
    return { ok: true, dialog: { npc: n.id, look: n.look, art: n.art, name: n.name, icon: n.icon, text, options: opts }, noState: true };
  });

  on('npc:act', true, (c, { id, opt }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const n = findNpc(c, id);
    if (!n) return { ok: false, msg: 'Hãy lại gần NPC.' };
    const q = D.QUESTS[c.quest];
    if (opt === 'quest' && q && q.type === 'talk' && q.npc === n.id) {
      const gate = F3.questGate(c, q); if (gate) return gate;
      const res = L.completeQuestStep(c);
      sysIfLevel(c, res.ups);
      return { ok: true, dialogText: q.dialog, scene: require('./game/scenes').open(q, c), quest: res };
    }
    if (opt === 'fight' && n.boss) {
      const si = bossStepIdx(n.boss);
      const isQuest = q && q.type === 'boss' && q.boss === n.boss;
      if (!isQuest && !(si >= 0 && c.quest > si)) return { ok: false, msg: 'Chưa thể khiêu chiến.' };
      if (c.hp < 1) return { ok: false, msg: 'Khí huyết cạn, hãy trị thương trước.' };
      return { ok: true, scene: isQuest ? require('./game/scenes').boss(q, c) : undefined, battle: startBattle(c, L.makeBoss(n.boss), { kind: 'boss', bossId: n.boss, quest: isQuest, assist: D.BOSSES[n.boss].post ? [] : require('./game/companions').assistFor(c) }) };
    }
    { const x = F3hook.act(c, n, opt); if (x) return x; }
    if (opt === 'heal' && n.role === 'heal') {
      const cost = c.lvl <= 10 ? 0 : c.lvl * 6;
      if (c.bac < cost) return { ok: false, msg: 'Không đủ bạc.' };
      c.bac -= cost;
      const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp;
      return { ok: true, msg: 'Khí huyết và nội lực đã hồi đầy!' };
    }
    if (opt === 'tienhac' && n.id === 'laoong' && !c.secrets.tienhac) {
      const pet = c.pets.find((p) => p.uid === c.activePet);
      if (!pet || D.getSpecies(pet.sid).form !== 'tienhac') return { ok: false, msg: 'Lão chẳng thấy hạc tiên nào…' };
      if (!L.addItem(c, 'trung_bd', 1)) return { ok: false, msg: 'Hành trang đầy.' };
      c.secrets.tienhac = Date.now();
      sys(`[Bí Ẩn] ${c.name} đã hoàn thành nhiệm vụ ẩn «${D.SECRETS.tienhac.name}»!`);
      return { ok: true, secret: { id: 'tienhac', ...D.SECRETS.tienhac } };
    }
    if (opt === 'mantra' && n.id === 'thodia' && !c.secrets.thodia && c.secretState.thodia >= 3) {
      if (!L.addEquip(c, L.makeUniqueStaff())) return { ok: false, msg: 'Hành trang đầy.' };
      c.secrets.thodia = Date.now();
      sys(`[Bí Ẩn] ${c.name} nhận được trang bị Độc Bản «Như Ý Kim Cô Bổng»!`);
      return { ok: true, secret: { id: 'thodia', ...D.SECRETS.thodia } };
    }
    return { ok: false, msg: 'Không thể thực hiện.' };
  });

  // ---------------- Chiến đấu ----------------
  function startBattle(c, enemies, opts) {
    if (!['arena', 'world', 'peach', 'trial'].includes(opts.kind || 'wild')) { const al = F2.partyAllies(db, c, online, battles); if (al.length) opts.allies = al; }
    const b = new Battle(c, enemies, opts);
    battles.set(c.id, b);
    return b.snapshot();
  }

  on('battle:act', true, (c, act) => {
    const b = battles.get(c.id);
    if (!b) return { ok: false, msg: 'Không ở trong trận.' };
    if (b.kind === 'world') {
      const wb = worldBoss();
      const bu = b.units.find((u) => u.boss);
      if (bu && !bu.dead) bu.hp = Math.min(bu.hp, wb.hp);
      if (wb.hp <= 0 && bu && !bu.dead) { b.over = true; b.result = { outcome: 'timeout' }; }
    }
    const before = b.damageDealt;
    const { events, snapshot } = b.over ? { events: [{ k: 'text', msg: 'Boss đã bị hạ!' }], snapshot: b.snapshot() } : b.doRound(act);
    if (b.kind === 'world') worldBossDamage(c, b, b.damageDealt - before);
    let result = null;
    if (b.over) { result = finishBattle(c, b); battles.delete(c.id); }
    return { ok: true, events, snapshot, result };
  });

  function finishBattle(c, b) {
    const out = b.result.outcome;
    const res = { outcome: out, kind: b.kind, exp: 0, bac: 0, items: [], equips: [], captured: [], ups: [], petUps: 0 };
    const enemies = b.units.filter((u) => u.side === 1);
    const s = L.calcStats(c);

    if (out === 'win' || (out === 'timeout' && b.kind === 'world')) {
      if (b.kind === 'world') {
        const dmg = b.damageDealtTotal || b.damageDealt;
        res.exp = Math.round(Math.min(dmg * 0.6, L.expNeed(c.lvl) * 0.5));
        res.bac = Math.round(Math.min(dmg * 0.08, 3000));
      } else if (b.kind === 'arena' || b.kind === 'tower') {
        // xử lý riêng bên dưới
      } else {
        for (const e of enemies) {
          const gm = e.grade != null ? D.GRADES[e.grade].mult : 1.2;
          res.exp += Math.round(Math.max(14 + e.lvl * 8, L.expNeed(e.lvl) / 18) * gm * (e.boss ? 4 : 1) * (e.mut ? 1.5 : 1));
          res.bac += Math.round(4 + e.lvl * 3 * (e.boss ? 5 : 1));
        }
        if (b.kind === 'boss' && !b.opts.quest) { res.exp = Math.round(res.exp * 0.4); res.bac = Math.round(res.bac * 0.4); }
        // vật phẩm rơi
        for (const dr of L.rollDrops(enemies.filter((e) => !e.caught), 0)) {
          if (dr.eq) { if (L.addEquip(c, dr.eq)) res.equips.push(dr.eq); }
          else if (L.addItem(c, dr.id, 1)) res.items.push(dr.id);
        }
      }
      // phu thê · bang hội · Thiên Địa Dị Tượng
      if (c.spouse) res.exp = Math.round(res.exp * 1.05);
      F3.battleMul(c, b, res);
      res.ups = L.addExp(c, res.exp);
      c.bac += res.bac;
      // tiên sủng nhận EXP
      L.teamPets(c).forEach((pet, i) => { if (res.exp) { const up = L.petAddExp(c, pet, res.exp * (i ? 0.45 : 0.6)); if (!i) res.petUps = up; } });
      // thu phục
      for (const cp of b.captured) {
        const p = L.makePet(cp.sid, cp.lvl, cp.mut);
        c.pets.push(p);
        const v = L.petView(p);
        res.captured.push(v);
        if (p.mut || v.grade >= 3) sys(`${c.name} vừa thu phục được ${p.mut ? 'Tiên sủng BIẾN DỊ ' : ''}[${D.GRADES[v.grade].name}] ${p.name}!`);
        L.teamAdd(c, p.uid);
      }
      // nhiệm vụ
      const q = D.QUESTS[c.quest];
      const kills = enemies.filter((e) => e.dead).length;
      c.kills += kills;
      if (b.kind === 'wild' && q && q.type === 'kill' && q.map === c.map) {
        c.qprog = Math.min(q.count, c.qprog + kills);
        if (c.qprog >= q.count) res.quest = L.completeQuestStep(c);
      }
      if (b.kind === 'boss' && b.opts.quest && q && q.type === 'boss' && q.boss === b.opts.bossId) {
        res.quest = L.completeQuestStep(c);
        sys(D.BOSSES[b.opts.bossId].post ? `${c.name} đã đánh bại ${D.BOSSES[b.opts.bossId].name}! (Hậu truyện)` : `${c.name} đã đánh bại ${D.BOSSES[b.opts.bossId].name}! Kiếp nạn đã vượt: ${c.nan}/81.`);
        if (res.quest.unlocked) sys(`${c.name} mở ra chương mới: ${res.quest.unlockedName}.`);
        if (c.quest === D.STORY_END) sys(`🎉 ${c.name} đã vượt qua đủ 81 kiếp nạn, đến Lôi Âm Tự thỉnh chân kinh!`);
        if (c.quest >= D.QUESTS.length) sys(`☯️ ${c.name} đánh tan Hỗn Độn Ma Tổ – vượt Kiếp Nạn Thứ 82, trở thành Hộ Kinh Sứ của Tam Giới!`);
        guildContrib(c, 5);
      }
      if (res.quest) sysIfLevel(c, res.quest.ups);
      if (b.kind === 'wild' && c.map === 'ch4') guildContrib(c, 1);
      if (b.kind === 'peach') { L.addItem(c, 'ban_dao', 1); res.items.push('ban_dao'); }
      if (b.kind === 'tower') { F.towerWin(c, b, res, sys); L.teamPets(c).forEach((p2, i) => { if (res.exp) { const up = L.petAddExp(c, p2, res.exp * (i ? 0.45 : 0.6)); if (!i) res.petUps = up; } }); }
    }
    if (b.kind === 'arena') {
      const opp = b.opts.opp;
      if (out === 'win') {
        const gain = opp.bot ? 12 : 20;
        c.arena += gain; c.vang += 2; res.vang = 2; res.arena = gain; guildContrib(c, 2);
        if (!opp.bot && db.chars[opp.id]) db.chars[opp.id].arena = Math.max(0, db.chars[opp.id].arena - 10);
        sys(`[Tam Giới Đấu] ${c.name} đánh bại ${opp.name}!`);
      } else { c.arena = Math.max(0, c.arena - 10); res.arena = -10; }
    }
    if (out === 'lose' && b.kind === 'boss' && b.opts.bossId) {
      // Ngộ Không nhắc cách khắc chế chiêu đặc trưng của boss vừa thua
      const BS = require('./game/bossskills'), B0 = D.BOSSES[b.opts.bossId] || {};
      const k = (B0.skills || []).find((x) => BS.TIPS[x]);
      res.tip = B0.feed ? BS.FEED_TIP : k ? BS.TIPS[k] : 'Boss mạnh dần theo từng ải. Lên thêm vài cấp, nâng đồ và mang đủ Tiên sủng rồi quay lại.';
    }
    if (out === 'lose') {
      if (!['arena', 'world', 'tower', 'nightmare', 'dungeon', 'trial'].includes(b.kind)) {
        const lost = Math.floor(c.bac * 0.05);
        c.bac -= lost; res.lostBac = lost;
        c.hp = Math.max(1, Math.round(s.maxHp * 0.3));
        if (b.kind !== 'peach') { travel(c, c.map); res.respawn = true; res.players = mapPlayers(c.map).filter((p) => p.id !== c.id); }
      } else c.hp = Math.max(1, Math.round(s.maxHp * 0.3));
    }
    if (c.hp <= 0) c.hp = 1;
    L.clampHpMp(c);
    sysIfLevel(c, res.ups);
    masterReward(c, res.ups);
    F2.battleExtras(c, b, res, { db, toast, pushState });
    F.onBattleEnd(c, b, res);
    F3.afterBattle(c, b, res, { sys, io, db });
    return res;
  }

  function sysIfLevel(c, ups) {
    for (const lv of ups || []) {
      toast(c, `🎉 Thăng cấp ${lv}! +${D.CONFIG.pointsPerLevel} điểm tiềm năng`, 'gold');
      if (lv % 10 === 0) sys(`${c.name} đã đạt cấp ${lv}!`);
      const newSkill = D.RACES[c.race].skills.find((k) => D.SKILLS[k].lv === lv);
      if (newSkill) toast(c, `✨ Lĩnh ngộ kỹ năng mới: ${D.SKILLS[newSkill].name}`, 'gold');
    }
  }

  function masterReward(c, ups) {
    if (!ups || !ups.length || !c.master) return;
    const m = db.chars[c.master.id];
    if (!m) return;
    const r = ups.reduce((s, lv) => s + lv * 30, 0);
    m.bac += r;
    toast(m, `Đệ tử ${c.name} thăng cấp – sư phụ nhận ${fmt(r)} bạc.`);
    pushState(m);
  }

  function guildContrib(c, n) {
    c.contrib += n;
    const g = c.guild && db.guilds[c.guild];
    if (g) { g.points = (g.points || 0) + n; g.members[c.id] = (g.members[c.id] || 0) + n; const up = F3.guildExp(db, c, n); if (up) { addChat('phai', { from: 'Môn Phái', text: `🎉 Môn phái lên cấp ${up.lv}!` }, g.id); sys(`Môn phái «${g.name}» đạt cấp ${up.lv}!`); } }
  }

  // ---------------- Hành trang / trang bị ----------------
  function findBag(c, uid) { return c.bag.findIndex((b) => b.t === 'eq' && b.uid === uid); }
  function findEquipAnywhere(c, uid) {
    const i = findBag(c, uid);
    if (i >= 0) return c.bag[i];
    return Object.values(c.equip).find((e) => e && e.uid === uid) || null;
  }

  on('item:use', true, (c, { id }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const it = F2.own(D.ITEMS, id);
    if (!it || L.countItem(c, id) < 1) return { ok: false, msg: 'Không có vật phẩm.' };
    const ex = F2.useItem(c, it, id, { sys, io }); if (ex) return ex;
    const s = L.calcStats(c);
    if (it.type === 'hp') { if (c.hp >= s.maxHp) return { ok: false, msg: 'Khí huyết đã đầy.' }; c.hp = Math.min(s.maxHp, c.hp + it.value); }
    else if (it.type === 'mp') { if (c.mp >= s.maxMp) return { ok: false, msg: 'Nội lực đã đầy.' }; c.mp = Math.min(s.maxMp, c.mp + it.value); }
    else if (it.type === 'peach') {
      c.hp = s.maxHp; c.mp = s.maxMp;
      const ups = L.addExp(c, 60 + c.lvl * 40);
      L.removeItem(c, id, 1); sysIfLevel(c, ups);
      return { ok: true, msg: `Ăn Bàn Đào: hồi đầy, +${fmt(60 + c.lvl * 40)} tu vi!` };
    } else if (it.type === 'egg') {
      if (c.pets.length >= D.CONFIG.petBag) return { ok: false, msg: 'Túi Tiên sủng đã đầy.' };
      const form = L.pick(D.FORMS.filter((f) => f.rare)).id;
      const p = L.makePet(D.speciesId(form, L.pick(D.ELEMENT_KEYS), L.rand(2, 3)), c.lvl, true);
      c.pets.push(p);
      L.teamAdd(c, p.uid);
      L.removeItem(c, id, 1);
      sys(`${c.name} ấp Trứng Biến Dị nở ra ${p.name}!`);
      return { ok: true, msg: `Trứng nở ra ${p.name}!`, pet: L.petView(p) };
    } else return { ok: false, msg: 'Vật phẩm này không dùng trực tiếp được.' };
    L.removeItem(c, id, 1);
    return { ok: true, msg: `Đã dùng ${it.name}.` };
  });

  on('item:equip', true, (c, { uid }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const i = findBag(c, uid);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy trang bị.' };
    const it = c.bag[i];
    if (c.lvl < it.lvl) return { ok: false, msg: `Cần cấp ${it.lvl}.` };
    c.bag.splice(i, 1);
    if (c.equip[it.slot]) c.bag.push(c.equip[it.slot]);
    c.equip[it.slot] = it;
    L.clampHpMp(c);
    return { ok: true, msg: `Đã trang bị ${it.name}.` };
  });
  on('item:unequip', true, (c, { slot }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (!c.equip[slot]) return { ok: false, msg: 'Ô trống.' };
    if (!L.addEquip(c, c.equip[slot])) return { ok: false, msg: 'Hành trang đầy.' };
    c.equip[slot] = null;
    L.clampHpMp(c);
    return { ok: true };
  });
  on('item:sell', true, (c, { uid, id, qty }) => {
    if (uid) {
      const i = findBag(c, uid);
      if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
      if (c.bag[i].unique) return { ok: false, msg: 'Trang bị Độc Bản không thể bán.' };
      const p = L.equipPrice(c.bag[i]);
      c.bag.splice(i, 1); c.bac += p;
      return { ok: true, msg: `Bán được ${fmt(p)} bạc.` };
    }
    const it = D.ITEMS[id];
    qty = F2.int(qty ?? 1, 1, 9999); if (qty == null) return { ok: false, msg: 'Số lượng không hợp lệ.' };
    if (!it || L.countItem(c, id) < qty) return { ok: false, msg: 'Không đủ vật phẩm.' };
    const p = (it.sell || Math.floor((it.price || 40) / 2)) * qty;
    L.removeItem(c, id, qty); c.bac += p;
    return { ok: true, msg: `Bán được ${fmt(p)} bạc.` };
  });
  on('item:enhance', true, (c, { uid }) => {
    const it = findEquipAnywhere(c, uid);
    if (!it) return { ok: false, msg: 'Không tìm thấy trang bị.' };
    if (it.plus >= 10) return { ok: false, msg: 'Đã cường hóa tối đa +10.' };
    const cost = (it.plus + 1) * (it.lvl * 8 + 30);
    if (L.countItem(c, 'da_ch') < 1) return { ok: false, msg: 'Cần 1 Đá Cường Hóa.' };
    if (c.bac < cost) return { ok: false, msg: `Cần ${fmt(cost)} bạc.` };
    F.ensure(c); c.daily.enhance++;
    L.removeItem(c, 'da_ch', 1); c.bac -= cost;
    const rate = D.ENHANCE_RATE[it.plus];
    if (Math.random() < rate) {
      it.plus++;
      if (it.plus >= 8) sys(`${c.name} cường hóa ${it.name} lên +${it.plus}!`);
      L.clampHpMp(c);
      return { ok: true, success: true, msg: `Thành công! ${it.name} +${it.plus}` };
    }
    let msg = 'Thất bại…';
    if (it.plus >= 5) { it.plus--; msg = `Thất bại! Trang bị tụt xuống +${it.plus}.`; }
    L.clampHpMp(c);
    return { ok: true, success: false, msg };
  });
  on('item:socket', true, (c, { uid, gem }) => {
    const it = findEquipAnywhere(c, uid);
    if (!it) return { ok: false, msg: 'Không tìm thấy trang bị.' };
    if (!D.GEM_IDS.includes(gem) || L.countItem(c, gem) < 1) return { ok: false, msg: 'Không có ngọc này.' };
    const max = D.QUALITIES[it.q].sockets;
    if (it.gems.length >= max) return { ok: false, msg: max ? 'Đã khảm đầy lỗ.' : 'Trang bị Phàm không có lỗ khảm.' };
    L.removeItem(c, gem, 1);
    it.gems.push(gem);
    L.clampHpMp(c);
    return { ok: true, msg: `Khảm ${D.ITEMS[gem].name} thành công!` };
  });

  // ---------------- Cửa hàng ----------------
  function shopList(c) {
    const M = D.MAPS[c.map];
    const items = ['hp_s', 'hp_m', 'mp_s', 'mp_m', 'bau_bac', 'da_ch'];
    if (c.unlocked >= 2) items.splice(2, 0, 'hp_l');
    const list = items.map((id) => ({ kind: 'item', id, price: D.ITEMS[id].price, cur: 'bac' }));
    list.push({ kind: 'item', id: 'bau_vang', price: D.ITEMS.bau_vang.priceVang, cur: 'vang' });
    for (const g of D.GEM_IDS) list.push({ kind: 'item', id: g, price: D.ITEMS[g].priceVang, cur: 'vang' });
    const lvl = M.lv[0];
    for (const slot of D.SLOT_KEYS) list.push({ kind: 'eq', slot, lvl, q: 1, price: Math.round((lvl * 30 + 60) * 1.2), cur: 'bac' });
    return list;
  }
  on('shop:list', true, (c) => ({ ok: true, shop: shopList(c), noState: true }));
  on('shop:buy', true, (c, { kind, id, slot, qty }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const list = shopList(c);
    const e = list.find((x) => x.kind === kind && (kind === 'item' ? x.id === id : x.slot === slot));
    if (!e) return { ok: false, msg: 'Hàng không có.' };
    qty = kind === 'item' ? F2.int(qty ?? 1, 1, 99) : 1; if (qty == null) return { ok: false, msg: 'Số lượng không hợp lệ.' };
    const total = e.price * qty;
    if (c[e.cur] < total) return { ok: false, msg: `Không đủ ${e.cur === 'vang' ? 'vàng' : 'bạc'}.` };
    if (kind === 'item') { if (!L.addItem(c, id, qty)) return { ok: false, msg: 'Hành trang đầy.' }; }
    else if (!L.addEquip(c, L.makeEquip(slot, e.lvl, e.q))) return { ok: false, msg: 'Hành trang đầy.' };
    c[e.cur] -= total;
    return { ok: true, msg: 'Mua thành công!' };
  });

  // ---------------- Tiên sủng ----------------
  on('pet:active', true, (c, { uid }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (uid && !c.pets.find((p) => p.uid === uid)) return { ok: false, msg: 'Không tìm thấy.' };
    if (!uid) { c.activePets = []; c.activePet = null; return { ok: true, msg: 'Đã cho cả đội nghỉ.' }; }
    L.teamAdd(c, uid, true);
    return { ok: true, msg: 'Đã đặt làm Tiên sủng dẫn đầu.' };
  });
  // thêm / bớt Tiên sủng trong đội xuất chiến (tối đa 3)
  on('pet:team', true, (c, { uid, on: join }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (!c.pets.find((p) => p.uid === uid)) return { ok: false, msg: 'Không tìm thấy.' };
    if (!join) { L.teamRemove(c, uid); return { ok: true, msg: 'Đã cho nghỉ.' }; }
    if (!L.teamAdd(c, uid)) return { ok: false, msg: 'Đội đã đủ 3 Tiên sủng – cho một con nghỉ trước.' };
    return { ok: true, msg: 'Đã cho xuất chiến.' };
  });
  on('pet:release', true, (c, { uid }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const i = c.pets.findIndex((p) => p.uid === uid);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    const p = c.pets.splice(i, 1)[0];
    L.teamRemove(c, uid);
    const bac = p.lvl * 10;
    c.bac += bac;
    const sp = D.getSpecies(p.sid);
    if (sp && sp.than) { const back = sp.chan ? 45 : 15; L.addItem(c, 'hon_' + sp.than, back); return { ok: true, msg: `${p.name} trở về thiên giới, để lại ${back} Hồn Phách (+${bac} bạc).` }; }
    return { ok: true, msg: `Đã phóng sinh ${p.name} (+${bac} bạc công đức).` };
  });
  on('pet:rename', true, (c, { uid, name }) => {
    const p = c.pets.find((x) => x.uid === uid);
    name = String(name || '').trim();
    if (!p || name.length < 1 || name.length > 14) return { ok: false, msg: 'Tên 1–14 ký tự.' };
    p.name = name;
    return { ok: true };
  });

  // ---------------- Hoạt động giải trí ----------------
  on('act:peach', true, (c, { tree }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (c.map !== 'ch1') return { ok: false, msg: 'Vườn Bàn Đào ở Thiên Cung.' };
    if (c.daily.peach >= D.CONFIG.dailyPeach) return { ok: false, msg: 'Hôm nay đã hết lượt trộm đào.' };
    c.daily.peach++;
    const r = L.weighted([15, 35, 30, 20]);
    if (r === 0) { L.addItem(c, 'ban_dao', 1); sys(`${c.name} hái trộm được một quả Bàn Đào ngàn năm!`); return { ok: true, tree, outcome: 'bandao', msg: '🍑 Hái được Bàn Đào ngàn năm!' }; }
    if (r === 1) {
      const s = L.calcStats(c);
      c.hp = Math.min(s.maxHp, c.hp + Math.round(s.maxHp * 0.3));
      const ups = L.addExp(c, 20 + c.lvl * 15); sysIfLevel(c, ups);
      return { ok: true, tree, outcome: 'dao', msg: `Ăn vội quả đào: +${20 + c.lvl * 15} tu vi, hồi 30% khí huyết.` };
    }
    if (r === 2) {
      const lv = Math.max(1, c.lvl);
      const enemies = [L.makeHuman('thienbinh', lv), L.makeHuman('thienbinh', lv)];
      return { ok: true, tree, outcome: 'guard', msg: 'Thiên binh phát hiện! Đánh bại chúng để giữ quả đào!', battle: startBattle(c, enemies, { kind: 'peach', canFlee: true }) };
    }
    return { ok: true, tree, outcome: 'empty', msg: 'Cây này đã bị hái sạch…' };
  });

  on('act:treasure', true, (c, { box }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (c.daily.treasure >= D.CONFIG.dailyTreasure) return { ok: false, msg: 'Hôm nay đã hết lượt Đoạt Bảo.' };
    if (c.bac < 200) return { ok: false, msg: 'Cần 200 bạc.' };
    if (L.bagUsed(c) >= D.CONFIG.bagSize) return { ok: false, msg: 'Hành trang đầy.' };
    c.bac -= 200; c.daily.treasure++;
    const r = L.weighted([25, 25, 8, 12, 15, 15]);
    let msg;
    if (r === 0) { const g = L.pick(D.GEM_IDS); L.addItem(c, g); msg = `Nhận ${D.ITEMS[g].name}!`; }
    else if (r === 1) { L.addItem(c, 'da_ch', 2); msg = 'Nhận 2 Đá Cường Hóa.'; }
    else if (r === 2) { L.addItem(c, 'bau_vang', 1); msg = 'Nhận Bầu Vàng!'; }
    else if (r === 3) { const v = L.rand(5, 15); c.vang += v; msg = `Nhận ${v} vàng!`; }
    else if (r === 4) { const eq = L.makeEquip(L.pick(D.SLOT_KEYS), Math.max(1, c.lvl), L.weighted([0, 0, 70, 25, 5])); L.addEquip(c, eq); msg = `Nhận trang bị ${D.QUALITIES[eq.q].name}: ${eq.name}!`; if (eq.q >= 4) sys(`${c.name} đoạt được bảo vật Truyền Thuyết: ${eq.name}!`); }
    else { const v = L.rand(100, 600); c.bac += v; msg = `Nhận ${v} bạc.`; }
    return { ok: true, box, msg };
  });

  const checkBet = (c, bet) => {
    bet = Math.floor(Number(bet) || 0);
    if (bet < 10 || bet > 5000) return [null, 'Cược từ 10 đến 5.000 bạc.'];
    if (c.bac < bet) return [null, 'Không đủ bạc.'];
    return [bet];
  };
  on('act:rps', true, (c, { choice, bet }) => {
    const [b, err] = checkBet(c, bet); if (err) return { ok: false, msg: err };
    const all = ['keo', 'bua', 'bao'];
    if (!all.includes(choice)) return { ok: false, msg: 'Chọn Kéo/Búa/Bao.' };
    const npc = L.pick(all);
    const win = { keo: 'bao', bua: 'keo', bao: 'bua' };
    let outcome = 'draw';
    if (win[choice] === npc) { outcome = 'win'; c.bac += b; }
    else if (win[npc] === choice) { outcome = 'lose'; c.bac -= b; }
    return { ok: true, npc, outcome, bet: b };
  });
  on('act:dice', true, (c, { pick, bet }) => {
    const [b, err] = checkBet(c, bet); if (err) return { ok: false, msg: err };
    if (!['tai', 'xiu'].includes(pick)) return { ok: false, msg: 'Chọn Tài hoặc Xỉu.' };
    const dice = [L.rand(1, 6), L.rand(1, 6), L.rand(1, 6)];
    const sum = dice[0] + dice[1] + dice[2];
    const triple = dice[0] === dice[1] && dice[1] === dice[2];
    const res = triple ? 'bao' : sum >= 11 ? 'tai' : 'xiu';
    const won = res === pick;
    c.bac += won ? b : -b;
    if (won && b >= 2000) sys(`${c.name} thắng ${fmt(b)} bạc ở Sòng Phú Quý!`);
    return { ok: true, dice, sum, res, won, bet: b };
  });

  // ---------------- Tam Giới Đấu ----------------
  function makeBot(lvl, i) {
    const race = Object.keys(D.RACES)[i % 3];
    const b = L.createChar('bot' + i, 'bot', ['Hư Ảnh', 'Tâm Ma', 'Kính Tượng'][i % 3] + ' ' + D.RACES[race].name.split(' ')[0], race, i % 2 ? 'f' : 'm', (i * 5) % 6);
    b.lvl = Math.max(1, lvl);
    const pts = (b.lvl - 1) * 5;
    const k = ['the', 'luc', 'phap', 'nhanh'];
    for (let j = 0; j < pts; j++) b.stats[k[(j + i) % 4]]++;
    for (const slot of D.SLOT_KEYS) b.equip[slot] = L.makeEquip(slot, b.lvl, 1);
    b.arena = 900 + i * 60; b.bot = true;
    if (b.lvl >= 5) { const p = L.makePet(D.speciesId(L.pick(D.FORMS).id, L.pick(D.ELEMENT_KEYS), 1), b.lvl, false); b.pets.push(p); b.activePet = p.uid; b.activePets = [p.uid]; }
    return b;
  }
  const botCache = new Map();
  function arenaList(c) {
    const real = Object.values(db.chars).filter((x) => x.id !== c.id).sort((a, b) => Math.abs(a.arena - c.arena) - Math.abs(b.arena - c.arena)).slice(0, 5)
      .map((x) => ({ id: x.id, name: x.name, lvl: x.lvl, race: x.race, gender: x.gender, gear: L.gearBrief(x), arena: x.arena, power: L.power(x) }));
    const bots = [];
    for (let i = 0; i < 3; i++) {
      const key = `${c.id}:${i}:${c.lvl}:${L.today()}`;
      if (!botCache.has(key)) botCache.set(key, makeBot(c.lvl + i - 1, i));
      const b = botCache.get(key);
      bots.push({ id: 'bot:' + key, name: b.name, lvl: b.lvl, race: b.race, gender: b.gender, gear: L.gearBrief(b), arena: b.arena, power: L.power(b), bot: true });
    }
    return [...real, ...bots];
  }
  function heroUnitsFrom(o) {
    const s = L.calcStats(o);
    const units = [{ kind: 'hero', name: o.name, lvl: o.lvl, hero: { race: o.race, gender: o.gender, face: o.face, gear: L.gearBrief(o) }, res: L.resistOf(o), ...s, hp: s.maxHp, mp: s.maxMp,
      skills: [...o.skills.filter((k) => (D.SKILLS[k].lv || 1) <= o.lvl), ...(o.secretSkills || [])], catchable: false }];
    for (const pet of L.teamPets(o)) { const v = L.petView(pet); units.push({ kind: 'beast', sid: pet.sid, name: pet.name, lvl: pet.lvl, icon: v.icon, element: v.element, grade: v.grade, mut: pet.mut, ...v.stats, skills: v.skills, catchable: false }); }
    return units;
  }
  on('arena:list', true, (c) => ({ ok: true, list: arenaList(c), left: D.CONFIG.dailyArena - c.daily.arena, noState: true }));
  on('arena:fight', true, (c, { id }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (c.daily.arena >= D.CONFIG.dailyArena) return { ok: false, msg: 'Hôm nay đã hết lượt Tam Giới Đấu.' };
    let opp;
    if (String(id).startsWith('bot:')) opp = botCache.get(id.slice(4));
    else opp = F2.own(db.chars, id);
    if (!opp || opp.id === c.id) return { ok: false, msg: 'Đối thủ không tồn tại.' };
    c.daily.arena++;
    const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp; // đấu trường hồi đầy
    return { ok: true, battle: startBattle(c, heroUnitsFrom(opp), { kind: 'arena', canFlee: false, canCatch: false, maxRounds: 25, opp: { id: opp.id, name: opp.name, bot: !!opp.bot } }) };
  });

  // ---------------- Boss thế giới ----------------
  on('boss:info', true, () => ({ ok: true, boss: bossInfo(), noState: true }));
  on('boss:join', true, (c) => {
    const nb = notInBattle(c); if (nb) return nb;
    const wb = worldBoss();
    if (wb.hp <= 0) return { ok: false, msg: 'Boss chưa hồi sinh.' };
    if (c.lvl < 10) return { ok: false, msg: 'Cần đạt cấp 10.' };
    const lv = Math.max(10, c.lvl + 3);
    const u = L.makeBoss('world')[0];
    const st = L.beastStats({ hp: 1, atk: 1, matk: 1, def: 1.1, spd: 1 }, 1.25, lv, false);
    Object.assign(u, st, { lvl: lv, maxHp: wb.maxHp, hp: wb.hp });
    return { ok: true, battle: startBattle(c, [u], { kind: 'world', canFlee: true, maxRounds: D.CONFIG.worldBossRounds }) };
  });

  // ---------------- Chat ----------------
  on('chat:send', true, (c, { ch, text }) => {
    text = String(text || '').trim().slice(0, 120);
    if (!text) return { ok: false, noState: true };
    text = text.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, '');
    if (!['khu', 'phai', 'shop', 'doi'].includes(ch)) return { ok: false, msg: 'Kênh không hợp lệ.', noState: true };
    if (text === lastText.get(c.id)) return { ok: false, msg: 'Đừng gửi lặp lại tin nhắn.', noState: true };
    lastText.set(c.id, text);
    if (ch === 'doi') {
      const pid = F2.partyOf.get(c.id); if (!pid) return { ok: false, msg: 'Bạn chưa có tổ đội.', noState: true };
      const msg = { ch: 'doi', from: c.name, fromId: c.id, race: c.race, lvl: c.lvl, text, t: Date.now() };
      for (const [id] of [...F2.partyOf].filter(([, p]) => p === pid)) online.get(id)?.emit('chat', msg);
      lastChat.set(c.id, Date.now());
      return { ok: true, noState: true };
    }
    const now = Date.now();
    if (now - (lastChat.get(c.id) || 0) < 1200) return { ok: false, msg: 'Nói chậm thôi…', noState: true };
    lastChat.set(c.id, now);
    if (ch === 'phai' && !c.guild) return { ok: false, msg: 'Bạn chưa vào Môn Phái.', noState: true };
    addChat(ch, { from: c.name, fromId: c.id, race: c.race, gender: c.gender, face: c.face, lvl: c.lvl, text }, c.guild);
    return { ok: true, noState: true };
  });

  // ---------------- Môn phái ----------------
  const guildView = (g) => ({ id: g.id, name: g.name, leader: db.chars[g.leader]?.name, count: Object.keys(g.members).length, points: g.points || 0,
    power: Object.keys(g.members).reduce((s, id) => s + (db.chars[id] ? L.power(db.chars[id]) : 0), 0), notice: g.notice || '' });
  on('guild:list', true, () => ({ ok: true, list: Object.values(db.guilds).map(guildView).sort((a, b) => b.points - a.points), noState: true }));
  on('guild:create', true, (c, { name }) => {
    name = String(name || '').trim();
    if (c.guild) return { ok: false, msg: 'Bạn đã ở trong một phái.' };
    if (c.lvl < 5) return { ok: false, msg: 'Cần cấp 5 để lập phái.' };
    if (c.bac < 1000) return { ok: false, msg: 'Cần 1.000 bạc.' };
    if (name.length < 2 || name.length > 12) return { ok: false, msg: 'Tên phái 2–12 ký tự.' };
    if (Object.values(db.guilds).some((g) => g.name.toLowerCase() === name.toLowerCase())) return { ok: false, msg: 'Tên phái đã tồn tại.' };
    const id = 'g' + DB.nextId();
    db.guilds[id] = { id, name, leader: c.id, members: { [c.id]: 0 }, points: 0, createdAt: Date.now(), notice: 'Đồng tâm hiệp lực, thỉnh kinh thành công!' };
    c.bac -= 1000; c.guild = id;
    socket.join('guild:' + id);
    sys(`${c.name} khai sơn lập phái «${name}»!`);
    return { ok: true };
  });
  on('guild:join', true, (c, { id }) => {
    const g = F2.own(db.guilds, id);
    if (c.guild) return { ok: false, msg: 'Bạn đã ở trong một phái.' };
    if (!g) return { ok: false, msg: 'Phái không tồn tại.' };
    if (Object.keys(g.members).length >= 30) return { ok: false, msg: 'Phái đã đủ 30 người.' };
    g.members[c.id] = 0; c.guild = id;
    socket.join('guild:' + id);
    addChat('phai', { from: 'Môn Phái', text: `${c.name} gia nhập môn phái!` }, id);
    return { ok: true };
  });
  on('guild:leave', true, (c) => {
    const g = db.guilds[c.guild];
    if (!g) { c.guild = null; return { ok: true }; }
    delete g.members[c.id];
    socket.leave('guild:' + g.id);
    c.guild = null;
    const left = Object.keys(g.members);
    if (!left.length) { delete db.guilds[g.id]; sys(`Môn phái «${g.name}» đã giải tán.`); }
    else if (g.leader === c.id) { g.leader = left.sort((a, b) => (g.members[b] || 0) - (g.members[a] || 0))[0]; addChat('phai', { from: 'Môn Phái', text: `${db.chars[g.leader].name} trở thành Chưởng Môn.` }, g.id); }
    return { ok: true };
  });
  on('guild:info', true, (c) => {
    const g = db.guilds[c.guild];
    if (!g) return { ok: false, msg: 'Bạn chưa vào phái.', noState: true };
    const members = Object.entries(g.members).map(([id, pts]) => { const m = db.chars[id]; return m && { id, name: m.name, lvl: m.lvl, race: m.race, contrib: pts, online: online.has(id), leader: id === g.leader }; })
      .filter(Boolean).sort((a, b) => b.contrib - a.contrib);
    return { ok: true, guild: { ...guildView(g), members, isLeader: g.leader === c.id, warDate: g.warDate }, noState: true };
  });
  on('guild:notice', true, (c, { text }) => {
    const g = db.guilds[c.guild];
    if (!g || g.leader !== c.id) return { ok: false, msg: 'Chỉ Chưởng Môn được sửa.' };
    g.notice = String(text || '').slice(0, 80);
    return { ok: true };
  });
  on('guild:war', true, (c, { id }) => {
    const g = db.guilds[c.guild], o = F2.own(db.guilds, id);
    if (!g || g.leader !== c.id) return { ok: false, msg: 'Chỉ Chưởng Môn được tuyên chiến.' };
    if (!o || o.id === g.id) return { ok: false, msg: 'Chọn phái đối thủ.' };
    if (g.warDate === L.today()) return { ok: false, msg: 'Hôm nay phái đã tham gia Giáo Phái Chiến.' };
    g.warDate = L.today();
    const pa = guildView(g).power * L.randf(0.8, 1.2), pb = guildView(o).power * L.randf(0.8, 1.2);
    const win = pa >= pb;
    g.points = (g.points || 0) + (win ? 30 : 8);
    o.points = (o.points || 0) + (win ? 5 : 20);
    sys(`[Giáo Phái Chiến] «${g.name}» ${win ? 'đại thắng' : 'thất thủ trước'} «${o.name}»!`);
    return { ok: true, win, msg: win ? 'Đại thắng! +30 chiến công phái.' : 'Thất bại… +8 chiến công phái.' };
  });

  // ---------------- Kết hôn / Sư đồ ----------------
  function request(target, type, c) {
    const list = pending.get(target.id) || [];
    if (list.some((r) => r.type === type && r.fromId === c.id)) return false;
    const r = { type, fromId: c.id, fromName: c.name, fromLvl: c.lvl, t: Date.now() };
    list.push(r); pending.set(target.id, list);
    const ts = online.get(target.id); if (ts) ts.emit('social:req', r);
    return true;
  }
  on('players:online', true, (c) => ({ ok: true, list: [...online.keys()].filter((id) => id !== c.id).map((id) => db.chars[id]).filter(Boolean)
    .map((x) => ({ ...playerBrief(x), map: D.MAPS[x.map].name, spouse: !!x.spouse, master: !!x.master })), noState: true }));

  on('social:marry', true, (c, { name }) => {
    const t = charByName(name);
    if (!t || t.id === c.id) return { ok: false, msg: 'Không tìm thấy người này.' };
    if (c.spouse || t.spouse) return { ok: false, msg: 'Một trong hai đã có phu thê.' };
    if (c.lvl < 10 || t.lvl < 10) return { ok: false, msg: 'Cả hai cần đạt cấp 10.' };
    if (c.bac < 520) return { ok: false, msg: 'Cần 520 bạc sính lễ.' };
    if (!request(t, 'marry', c)) return { ok: false, msg: 'Đã gửi lời cầu hôn rồi.' };
    return { ok: true, msg: `Đã gửi lời cầu hôn đến ${t.name}.` };
  });
  on('social:apprentice', true, (c, { name }) => {
    const t = charByName(name);
    if (!t || t.id === c.id) return { ok: false, msg: 'Không tìm thấy người này.' };
    if (c.master) return { ok: false, msg: 'Bạn đã có sư phụ.' };
    if (t.lvl < 20) return { ok: false, msg: 'Sư phụ cần đạt cấp 20.' };
    if (t.lvl - c.lvl < 10) return { ok: false, msg: 'Sư phụ phải cao hơn bạn ít nhất 10 cấp.' };
    if ((t.disciples || []).length >= 3) return { ok: false, msg: 'Người này đã có đủ 3 đệ tử.' };
    if (!request(t, 'master', c)) return { ok: false, msg: 'Đã gửi lời bái sư rồi.' };
    return { ok: true, msg: `Đã gửi lời bái sư đến ${t.name}.` };
  });
  on('social:respond', true, (c, { type, fromId, accept }) => {
    const list = pending.get(c.id) || [];
    const i = list.findIndex((r) => r.type === type && r.fromId === fromId);
    if (i < 0) return { ok: false, msg: 'Lời mời đã hết hạn.' };
    list.splice(i, 1);
    const f = F2.own(db.chars, fromId);
    if (!f) return { ok: false, msg: 'Người gửi không tồn tại.' };
    if (!accept) { toast(f, `${c.name} đã từ chối ${type === 'marry' ? 'lời cầu hôn' : type === 'party' ? 'lời mời tổ đội' : type === 'partyApply' ? 'đơn xin vào đội' : 'nhận bạn làm đệ tử'}.`); return { ok: true }; }
    if (respondHooks.has(type)) return respondHooks.get(type)(c, f);
    if (type === 'marry') {
      if (c.spouse || f.spouse) return { ok: false, msg: 'Đã có phu thê.' };
      if (f.bac < 520) return { ok: false, msg: `${f.name} không đủ sính lễ.` };
      f.bac -= 520;
      c.spouse = { id: f.id, name: f.name }; f.spouse = { id: c.id, name: c.name };
      sys(`💞 Chúc mừng ${f.name} và ${c.name} nên duyên phu thê! Trăm năm hảo hợp!`);
    } else {
      if (f.master) return { ok: false, msg: `${f.name} đã có sư phụ.` };
      f.master = { id: c.id, name: c.name };
      c.disciples = c.disciples || []; c.disciples.push({ id: f.id, name: f.name });
      sys(`📿 ${f.name} bái ${c.name} làm sư phụ!`);
    }
    pushState(f);
    return { ok: true };
  });
  on('social:divorce', true, (c) => {
    if (!c.spouse) return { ok: false, msg: 'Bạn chưa kết hôn.' };
    const o = db.chars[c.spouse.id];
    if (o) { o.spouse = null; toast(o, `${c.name} đã đơn phương ly hôn…`); pushState(o); }
    c.spouse = null;
    return { ok: true, msg: 'Đã ly hôn.' };
  });
  on('social:graduate', true, (c) => {
    if (!c.master) return { ok: false, msg: 'Bạn chưa có sư phụ.' };
    const m = db.chars[c.master.id];
    const grad = c.lvl >= 35;
    if (m) {
      m.disciples = (m.disciples || []).filter((d) => d.id !== c.id);
      if (grad) { m.vang += 30; toast(m, `Đệ tử ${c.name} xuất sư! Sư phụ nhận 30 vàng.`); }
      pushState(m);
    }
    if (grad) { c.vang += 20; sys(`🎓 ${c.name} đã xuất sư!`); }
    c.master = null;
    return { ok: true, msg: grad ? 'Xuất sư thành công! +20 vàng.' : 'Đã rời sư môn.' };
  });

  // ---------------- Xếp hạng ----------------
  on('rank:list', true, (c, { type }) => {
    const key = { lvl: (x) => x.lvl * 1e9 + x.exp, power: L.power, arena: (x) => x.arena, nan: (x) => x.nan * 1e6 + x.lvl, tower: (x) => ((x.tower && x.tower.best) || 0) * 1e3 + x.lvl }[type] || ((x) => x.lvl);
    const list = Object.values(db.chars).map((x) => ({ id: x.id, name: x.name, race: x.race, gear: L.gearBrief(x), lvl: x.lvl, v: key(x), power: L.power(x), arena: x.arena, nan: x.nan, tower: (x.tower && x.tower.best) || 0 }))
      .sort((a, b) => b.v - a.v).slice(0, 30);
    return { ok: true, list, noState: true };
  });

  F.register(on, { notInBattle, startBattle, sys, db });
  const F3hook = F3.register(on, { db, notInBattle, startBattle, sys, toast, pushState, online, battles, io, socket, travel, mapPlayers, heroUnitsFrom, addChat, levelUp: (c, ups) => sysIfLevel(c, ups) });
  // lệnh chỉ dùng khi chạy kiểm thử (TDK_TEST=1) – KHÔNG bật trên máy chủ thật
  if (process.env.TDK_TEST === '1') on('test:give', true, (c, d2) => {
    const { items, bac, vang, lvl, petLvl, points, quest, asc, energy, onl, gearQ, pets } = d2;
    if (Number.isInteger(gearQ)) for (const s of D.SLOT_KEYS) c.equip[s] = L.makeEquip(s, lvl || c.lvl, gearQ);
    if (Number.isInteger(pets)) { c.pets = []; c.activePets = []; for (let i = 0; i < pets; i++) { const p = L.makePet(D.speciesId(['hoyeu', 'kylan', 'phuong'][i % 3], D.ELEMENT_KEYS[i % 5], 2), lvl || c.lvl); c.pets.push(p); c.activePets.push(p.uid); } }
    if (points) c.points += points;
    if (Number.isInteger(quest)) { c.quest = Math.min(D.QUESTS.length, quest); c.qprog = 0; const q = D.QUESTS[c.quest]; c.unlocked = Math.max(c.unlocked, q ? D.MAPS[q.map].chapter : D.MAP_ORDER.length); if (c.quest >= D.STORY_END) c.nan = 81; }
    if (asc != null) c.asc = asc ? 1 : 0;
    if (energy != null) { F3.ensure(c); c.energy = { v: energy, t: Date.now() }; }
    if (onl != null) c.daily.onl = onl;
    if (Number.isInteger(d2.runStage) && c.run) c.run.stage = d2.runStage;
    if (d2 && d2.map && D.MAPS[d2.map]) { travel(c, d2.map); }
    if (d2 && Number.isInteger(d2.x) && Number.isInteger(d2.y)) { c.x = d2.x; c.y = d2.y; }
    for (const [id, n] of Object.entries(items || {})) L.addItem(c, id, n);
    c.bac += bac || 0; c.vang += vang || 0; if (lvl) { c.points += (lvl - c.lvl) * D.CONFIG.pointsPerLevel; c.lvl = lvl; const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp; }
    if (petLvl) c.pets.forEach((p) => (p.lvl = petLvl));
    return { ok: true };
  });
  F2.register(on, { db, notInBattle, sys, online, battles, io, pushState, toast, socket, request, addChat, onRespond: (type, fn) => respondHooks.set(type, fn) });
});

// --------------------------------------------------------------------
//  Nhiệm vụ ẩn theo toạ độ
// --------------------------------------------------------------------
function checkSecretAt(c) {
  const M = D.MAPS[c.map];
  if (!M.secret || M.secret.x !== c.x || M.secret.y !== c.y) return null;
  const id = M.secret.id;
  if (c.secrets[id]) return null;
  const h = hour();
  if (id === 'hangnga') {
    if (!(h >= 21 || h < 3)) return null;
    if (c.pets.length >= D.CONFIG.petBag) { toast(c, 'Có tiếng thỏ kêu… nhưng túi Tiên sủng của bạn đã đầy!'); return null; }
    const p = L.makePet(D.speciesId('thongoc', 'thuy', 3), Math.max(1, c.lvl), true);
    p.name = 'Nguyệt Thố (Biến Dị)';
    c.pets.push(p);
    L.teamAdd(c, p.uid);
  } else if (id === 'thuylien') {
    if (!(h >= 17 && h < 19)) return null;
    c.secretSkills = c.secretSkills || [];
    if (!c.secretSkills.includes('that_thap')) c.secretSkills.push('that_thap');
  } else return null;
  c.secrets[id] = Date.now();
  sys(`[Bí Ẩn] ${c.name} đã khám phá nhiệm vụ ẩn «${D.SECRETS[id].name}»!`);
  return { id, ...D.SECRETS[id] };
}

// --------------------------------------------------------------------
//  Boss thế giới (máu dùng chung cho mọi người chơi)
// --------------------------------------------------------------------
function worldBoss() {
  let wb = db.worldBoss;
  if (!wb) wb = db.worldBoss = { hp: D.CONFIG.worldBossHp, maxHp: D.CONFIG.worldBossHp, top: {}, respawnAt: 0, kills: 0 };
  if (wb.hp <= 0 && Date.now() >= wb.respawnAt) { wb.hp = wb.maxHp; wb.top = {}; sys(`🐲 ${D.BOSSES.world.name} đã hồi sinh! Mau tới thảo phạt (menu Hoạt Động)!`); io.broadcast('boss:update', bossInfo()); }
  return wb;
}
function bossInfo() {
  const wb = db.worldBoss || worldBoss();
  return { name: D.BOSSES.world.name, icon: D.BOSSES.world.icon, hp: wb.hp, maxHp: wb.maxHp, respawnAt: wb.respawnAt,
    top: Object.entries(wb.top).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, d]) => ({ name: db.chars[id]?.name || '?', dmg: d })) };
}
function worldBossDamage(c, b, dmg) {
  if (dmg <= 0) return;
  const wb = worldBoss();
  if (wb.hp <= 0) return;
  const real = Math.min(dmg, wb.hp);
  wb.hp -= real;
  wb.top[c.id] = (wb.top[c.id] || 0) + real;
  b.damageDealtTotal = (b.damageDealtTotal || 0) + real;
  if (c.guild && db.guilds[c.guild]) { const g = db.guilds[c.guild]; const pts = Math.floor(real / 2000); if (pts) { g.points = (g.points || 0) + pts; g.members[c.id] = (g.members[c.id] || 0) + pts; c.contrib += pts; } }
  if (wb.hp <= 0) {
    wb.kills++;
    wb.respawnAt = Date.now() + D.CONFIG.worldBossRespawnMin * 60000;
    const ranking = Object.entries(wb.top).sort((x, y) => y[1] - x[1]);
    ranking.slice(0, 3).forEach(([id], i) => { const m = db.chars[id]; if (m) { m.vang += [50, 30, 20][i]; L.addItem(m, 'bau_vang', 3 - i); pushState(m); } });
    c.vang += 20;
    sys(`🐲 ${D.BOSSES.world.name} đã bị tiêu diệt! Đòn kết liễu: ${c.name}. Hạng 1: ${db.chars[ranking[0][0]]?.name}.`);
    const bu = b.units.find((u) => u.boss); if (bu) { bu.hp = 0; bu.dead = true; }
    b.over = true; b.result = { outcome: 'win' };
  }
  io.broadcast('boss:update', bossInfo());
}
setInterval(() => { if (db.worldBoss && db.worldBoss.hp <= 0) worldBoss(); }, 15000).unref();

// --------------------------------------------------------------------
//  Khởi động
// --------------------------------------------------------------------
function lanIPs() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal) out.push(n.address);
  return out;
}
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`\n  ✖ Cổng ${PORT} đang được dùng. Tắt server cũ hoặc chạy:  PORT=3001 node server.js\n`);
  else console.error(e);
  process.exit(1);
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ☁️  TÂY DU KÝ MOBILE – máy chủ nội bộ đã chạy');
  console.log(`  • Trên máy tính:  http://localhost:${PORT}`);
  for (const ip of lanIPs()) console.log(`  • Trên iPhone:    http://${ip}:${PORT}`);
  console.log(`  • Dữ liệu:        data/db.json${DB.CLOUD ? ' + Supabase' : ''}   (${Object.keys(db.chars).length} nhân vật)`);
  console.log('  Nhấn Ctrl+C để tắt.\n');
});
let closing = false;
function shutdown() {
  if (closing) return; closing = true;
  setTimeout(() => process.exit(0), 8000).unref();
  DB.flush().catch(() => {}).finally(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
