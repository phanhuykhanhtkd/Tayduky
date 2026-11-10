// =====================================================================
//  TÍNH NĂNG ĐỢT 2–6 (máy chủ)
//   Thần sủng · Ác Mộng · Phi Thăng · Mệnh · Tính cách · Khai thác ·
//   Sạp hàng · Cấp thú cưỡi · Phúc lợi · Thành tựu/Danh hiệu ·
//   Tu Hành Lệnh · Phó bản · Đồ giám · Cấp Bang hội · Thiên Địa Dị Tượng
// =====================================================================
const D = require('./data');
const X = require('./data2');
const Z = require('./data3');
const L = require('./logic');

const own = (o, k) => (typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined);
const int = (v, min, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : null; };
const fmt = (n) => Number(n).toLocaleString('vi-VN');
const MIN = 60e3;

// ---------- ngày / tuần / mùa theo giờ Việt Nam ----------
const vn = () => L.vnNow();
const seasonId = () => { const d = vn(); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
const weekId = () => { const d = vn(); const day = Math.floor(d.getTime() / 86400e3); return 'w' + Math.floor((day + 3) / 7); }; // tuần bắt đầu thứ Hai
function seasonEnds() { const d = vn(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - 7 * 3600e3; }

// =====================================================================
//  KHỞI TẠO DỮ LIỆU NHÂN VẬT (lười – gọi ở mọi nơi cần)
// =====================================================================
function ensure(c) {
  // nhân vật đã xong cốt truyện trước khi có Hậu truyện: luôn mở khoá chương chứa nhiệm vụ hiện tại
  if (Number.isInteger(c.quest)) { const q = D.QUESTS[c.quest]; if (q && D.MAPS[q.map] && (c.unlocked || 1) < D.MAPS[q.map].chapter) c.unlocked = D.MAPS[q.map].chapter; }
  if (c._x3) return c;
  Object.defineProperty(c, '_x3', { value: true, enumerable: false, writable: true });
  if (c.menh === undefined) c.menh = null;
  if (!c.asc) c.asc = 0;
  if (!Array.isArray(c.titles)) c.titles = [];
  if (c.title && !own(Z.TITLES, c.title)) c.title = null;
  if (!c.ach || typeof c.ach !== 'object') c.ach = { p: {}, done: [] };
  c.ach.p = c.ach.p || {}; c.ach.done = c.ach.done || [];
  if (!c.energy) c.energy = { v: Z.GATHER.maxEnergy, t: Date.now() };
  if (!c.gskill) c.gskill = { lv: 1, exp: 0 };
  if (!c.gcd) c.gcd = {};
  if (!c.codex) c.codex = { f: {}, t: [], claimed: [] };
  if (!c.mountLv) c.mountLv = {};
  if (!c.nb) c.nb = { n: 0, last: null };
  for (const p of c.pets || []) { if (!p.tc || !own(Z.TRAITS, p.tc)) p.tc = traitFromUid(p.uid); codexAdd(c, p.sid); }
  passEnsure(c);
  return c;
}
function traitFromUid(u) { let h = 0; for (const ch of String(u)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const ids = Z.TRAIT_IDS.filter((k) => !Z.TRAITS[k].rare); return ids[h % ids.length]; }
function rollTrait(not) {
  const ids = Z.TRAIT_IDS.filter((k) => k !== not);
  return ids[L.weighted(ids.map((k) => Z.TRAITS[k].w))];
}

// =====================================================================
//  CHỈ SỐ: Mệnh · Danh hiệu · Phi Thăng · Đồ giám · Bang hội
// =====================================================================
let DBREF = null; // để tra bang hội khi tính chỉ số
function statPct(c) {
  ensure(c);
  const pct = {};
  const add = (o, mul = 1) => { for (const [k, v] of Object.entries(o || {})) pct[k] = (pct[k] || 0) + v * mul; };
  if (c.menh && Z.MENH[c.menh]) add(Z.MENH[c.menh].bonus);
  if (c.title && Z.TITLES[c.title]) add(Z.TITLES[c.title].bonus);
  if (c.asc) add({ maxHp: Z.ASCEND.statPct, maxMp: Z.ASCEND.statPct, atk: Z.ASCEND.statPct, matk: Z.ASCEND.statPct, def: Z.ASCEND.statPct, mdef: Z.ASCEND.statPct, spd: Z.ASCEND.statPct / 2 });
  const cf = Math.min(28, Object.keys(c.codex.f).length) * Z.CODEX_PCT_PER_FORM;
  if (cf) add({ maxHp: cf, atk: cf, matk: cf, def: cf, mdef: cf });
  const g = c.guild && DBREF && DBREF.guilds[c.guild];
  if (g) { const st = Z.GUILD.perk(guildLv(g)).stat; add({ maxHp: st, atk: st, matk: st }); }
  return pct;
}
function statBonus(c, o) {
  const pct = statPct(c);
  for (const [k, v] of Object.entries(pct)) {
    if (o[k] == null) continue;
    if (k === 'crit' || k === 'dodge') o[k] += v; else o[k] *= 1 + v / 100;
  }
  return o;
}
function petBonus(p, st) {
  const T = p && Z.TRAITS[p.tc];
  if (!T) return st;
  for (const [k, v] of Object.entries(T.mod)) if (st[k] != null) st[k] = Math.round(st[k] * (1 + v / 100));
  return st;
}

// =====================================================================
//  ĐỒ GIÁM
// =====================================================================
function codexAdd(c, sid) {
  const sp = D.getSpecies(sid); if (!sp) return false;
  if (sp.than) { if (!c.codex.t.includes(sp.than)) { c.codex.t.push(sp.than); return true; } return false; }
  const cur = c.codex.f[sp.form];
  if (cur == null || sp.grade > cur) { c.codex.f[sp.form] = sp.grade; return cur == null; }
  return false;
}

// =====================================================================
//  TINH LỰC & KHAI THÁC
// =====================================================================
function energy(c) {
  ensure(c);
  const G = Z.GATHER, e = c.energy, step = G.regenMin * MIN;
  if (e.v >= G.maxEnergy) { e.t = Date.now(); return e.v; }
  const n = Math.floor((Date.now() - e.t) / step);
  if (n > 0) { e.v = Math.min(G.maxEnergy, e.v + n); e.t += n * step; if (e.v >= G.maxEnergy) e.t = Date.now(); }
  return e.v;
}

// =====================================================================
//  THIÊN ĐỊA DỊ TƯỢNG
// =====================================================================
function worldEvent(now = Date.now()) {
  if (process.env.TDK_WEV) { const ev = Z.WORLD_EVENTS.find((e) => e.id === process.env.TDK_WEV); if (ev) return { ...ev, active: true, ends: now + 30 * MIN, next: now + 2 * 3600e3 }; }
  const slot = Math.floor(now / Z.WEV.period), start = slot * Z.WEV.period;
  const ev = Z.WORLD_EVENTS[slot % Z.WORLD_EVENTS.length];
  const active = now - start < Z.WEV.dur;
  const nextEv = Z.WORLD_EVENTS[(slot + 1) % Z.WORLD_EVENTS.length];
  return active ? { ...ev, active: true, ends: start + Z.WEV.dur, next: start + Z.WEV.period, nextName: nextEv.name }
    : { ...nextEv, active: false, starts: start + Z.WEV.period, next: start + Z.WEV.period };
}
const wevIs = (id) => { const e = worldEvent(); return e.active && e.id === id; };
function encMul() { return wevIs('yeuvuong') ? 1.6 : 1; }
// Tinh Anh khi Yêu Vương Xâm Nhập
function decorateEnemies(c, enemies) {
  if (!wevIs('yeuvuong') || !enemies.length || !L.chance(0.35)) return enemies;
  const e = L.pick(enemies.filter((x) => !x.boss));
  if (!e) return enemies;
  e.elite = true; e.catchable = false; e.name = 'Tinh Anh ' + e.name;
  for (const k of ['maxHp', 'atk', 'matk', 'def', 'mdef']) e[k] = Math.round(e[k] * (k === 'maxHp' ? 2.2 : 1.3));
  e.hp = e.maxHp;
  return enemies;
}

// =====================================================================
//  THÀNH TỰU · TU HÀNH LỆNH (đếm tiến độ)
// =====================================================================
function passEnsure(c) {
  const s = seasonId();
  if (!c.pass || c.pass.season !== s) c.pass = { season: s, xp: 0, prem: false, cf: [], cp: [], d: null, w: null };
  const t = L.today(), w = weekId();
  if (!c.pass.d || c.pass.d.date !== t) c.pass.d = { date: t, p: {}, done: [], xp: 0 };
  if (!c.pass.w || c.pass.w.week !== w) c.pass.w = { week: w, p: {}, done: [] };
  return c.pass;
}
const passLv = (c) => Math.min(Z.PASS.levels, Math.floor(c.pass.xp / Z.PASS.xpPerLv));
function track(c, k, n = 1) {
  if (!n) return;
  ensure(c); passEnsure(c);
  c.ach.p[k] = (c.ach.p[k] || 0) + n;
  for (const [box, list] of [[c.pass.d, Z.PASS.daily], [c.pass.w, Z.PASS.weekly]]) {
    for (const t of list) if (t.k === k) box.p[t.id] = Math.min(t.need, (box.p[t.id] || 0) + n);
  }
}
function achValue(c, k) {
  switch (k) {
    case 'lvl': return c.lvl;
    case 'nan': return c.nan;
    case 'post': return c.quest >= D.QUESTS.length ? 1 : 0;
    case 'asc': return c.asc ? 1 : 0;
    case 'kills': return c.kills || 0;
    case 'tower': return (c.tower && c.tower.best) || 0;
    case 'codex': return Object.keys(c.codex.f).length;
    case 'than': return c.codex.t.length;
    case 'pass': return passLv(c);
    case 'arena': return c.ach.p.arenaWin || 0;
    default: return c.ach.p[k] || 0;
  }
}
function achList(c) {
  ensure(c);
  return Z.ACH.map((a) => { const v = achValue(c, a.k); return { id: a.id, name: a.name, desc: a.desc, need: a.need, v: Math.min(v, a.need), done: v >= a.need, claimed: c.ach.done.includes(a.id), title: a.title ? { id: a.title, ...Z.TITLES[a.title] } : null, r: a.r }; });
}

// =====================================================================
//  PHẦN THƯỞNG CHUNG
// =====================================================================
function grant(c, r, ctx) {
  const got = [];
  if (!r) return got;
  if (r.exp) { const ups = L.addExp(c, r.exp); got.push(`${fmt(r.exp)} tu vi`); if (ups.length && ctx && ctx.levelUp) ctx.levelUp(c, ups); }
  if (r.bac) { c.bac += r.bac; got.push(`${fmt(r.bac)} bạc`); }
  if (r.vang) { c.vang += r.vang; got.push(`${r.vang} vàng`); }
  for (const [id, n] of Object.entries(r.items || {})) { if (!n) continue; if (L.addItem(c, id, n)) got.push(`${n} ${D.ITEMS[id].name}`); else mailFull(c, id, n); }
  if (r.gems) for (let i = 0; i < r.gems; i++) { const g = L.pick(D.GEM_IDS); L.addItem(c, g, 1); got.push(D.ITEMS[g].name); }
  if (r.book) for (let i = 0; i < r.book; i++) { const b = L.pick(X.BOOKS); L.addItem(c, b, 1); got.push(D.ITEMS[b].name); }
  if (r.mount && !(c.mounts || []).includes(r.mount)) { c.mounts = [...(c.mounts || []), r.mount]; if (!c.mount) c.mount = r.mount; got.push('thú cưỡi ' + X.MOUNTS[r.mount].name); }
  if (r.title && !c.titles.includes(r.title)) { c.titles.push(r.title); if (!c.title) c.title = r.title; got.push('danh hiệu «' + Z.TITLES[r.title].name + '»'); }
  return got;
}
function mailFull(c, id, n) { c.mail = (c.mail || []).slice(-19); c.mail.push({ t: Date.now(), text: `Hành trang đầy – mất ${n} ${D.ITEMS[id].name}. Hãy dọn túi đồ!`, seen: false }); }
const rewardText = (r) => {
  const p = [];
  if (r.exp) p.push(`${fmt(r.exp)} tu vi`); if (r.bac) p.push(`${fmt(r.bac)} bạc`); if (r.vang) p.push(`${r.vang} vàng`);
  for (const [id, n] of Object.entries(r.items || {})) if (n) p.push(`${n} ${D.ITEMS[id].name}`);
  if (r.gems) p.push(`${r.gems} Ngọc`); if (r.book) p.push(`${r.book} Sách kỹ năng`); if (r.mount) p.push(`Thú cưỡi ${X.MOUNTS[r.mount].name}`); if (r.title) p.push(`Danh hiệu «${Z.TITLES[r.title].name}»`);
  return p.join(' · ');
};

// =====================================================================
//  CẤP BANG HỘI
// =====================================================================
function guildLv(g) {
  let lv = 1, e = g.gexp || 0;
  while (lv < Z.GUILD.maxLv && e >= Z.GUILD.need(lv)) { e -= Z.GUILD.need(lv); lv++; }
  return lv;
}
function guildProg(g) {
  let lv = 1, e = g.gexp || 0;
  while (lv < Z.GUILD.maxLv && e >= Z.GUILD.need(lv)) { e -= Z.GUILD.need(lv); lv++; }
  return { lv, exp: e, need: lv >= Z.GUILD.maxLv ? 0 : Z.GUILD.need(lv) };
}
function guildExp(db, c, n) {
  const g = c.guild && db.guilds[c.guild];
  if (!g) return null;
  const before = guildLv(g);
  g.gexp = (g.gexp || 0) + n;
  const after = guildLv(g);
  return after > before ? { g, lv: after } : null;
}

// =====================================================================
//  QUÁI / BOSS ĐẶC BIỆT
// =====================================================================
function makeNightmare(bid) {
  const B = D.BOSSES[bid];
  const lvl = Z.nightmareLvl(B);
  const st = L.beastStats({ hp: 1, atk: 1, matk: 1, def: 1.2, spd: 1.08 }, 1.3, lvl, false);
  st.maxHp = Math.round(st.maxHp * Math.max(7, Math.min(14, B.hpMul * 1.45)));
  st.atk = Math.round(st.atk * 1.5); st.matk = Math.round(st.matk * 1.5); st.crit = 12;
  const skills = [...new Set([...B.skills, 'pet_aoe'])];
  const units = [{ kind: 'boss', bossId: bid, name: 'Ác Mộng · ' + B.name, icon: B.icon, element: B.element, lvl, ...st, skills, catchable: false, boss: true, nm: true, phases: 3,
    res: { seal: 45, chaos: 60, stun: 70 } }];
  const mins = B.minions.length ? B.minions : [['mabinh', 0]];
  for (let i = 0; i < 2; i++) { const [hid] = mins[i % mins.length]; const m = L.makeHuman(hid, lvl - 3); for (const k of ['maxHp', 'atk', 'matk']) m[k] = Math.round(m[k] * 1.25); units.push(m); }
  return units;
}
function bossLike(bid, name, lvl, hpMul, element, skills, extra = {}) {
  const B = D.BOSSES[bid] || {};
  const st = L.beastStats({ hp: 1, atk: 1, matk: 1, def: 1.15, spd: 1.05 }, 1.25, lvl, false);
  st.maxHp = Math.round(st.maxHp * hpMul);
  return { kind: 'boss', bossId: bid, name, icon: B.icon || '👹', element: element || B.element, lvl, ...st, skills: skills || B.skills, catchable: false, boss: true, phases: 2, ...extra };
}
function dungeonLvl(dg, c) { return Math.max(dg.lvl, Math.min(c.lvl, dg.lvl + 30)); }
function dungeonWave(dg, c, wave) {
  const lvl = dungeonLvl(dg, c) + wave * 2, out = [];
  const n = 3 + (wave >= 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    let m;
    if (dg.humans.length && i === 0) m = L.makeHuman(L.pick(dg.humans), lvl);
    else m = L.makeMonster(D.speciesId(L.pick(dg.forms), L.pick(D.ELEMENT_KEYS), Math.min(4, 1 + wave + (lvl > 100 ? 1 : 0))), lvl, false);
    for (const k of ['maxHp', 'atk', 'matk', 'def']) m[k] = Math.round(m[k] * (1.15 + wave * 0.1));
    m.hp = m.maxHp; m.catchable = false;
    out.push(m);
  }
  return out;
}
function dungeonBoss(dg, c) {
  const lvl = dungeonLvl(dg, c) + 6;
  const u = [bossLike(dg.boss, dg.bossName, lvl, 8, null, null, { phases: 2 })];
  for (let i = 0; i < 2; i++) { const m = L.makeHuman(L.pick(dg.humans), lvl - 3); m.maxHp = Math.round(m.maxHp * 1.3); u.push(m); }
  return u;
}
function trialEnemies(stage, c, heroUnitsFrom) {
  const T = Z.TRIAL[stage];
  if (T.boss === 'mirror') {
    const units = heroUnitsFrom(c).slice(0, 4);
    units.forEach((u, i) => {
      u.shadow = true; u.catchable = false;
      if (!i) { u.name = 'Tâm Ma · ' + c.name; u.boss = true; u.phases = 2; u.maxHp = Math.round(u.maxHp * 1.05); u.hp = u.maxHp; u.atk = Math.round(u.atk * 0.85); u.matk = Math.round(u.matk * 0.85); u.res = { seal: 40, chaos: 40, stun: 50 }; }
      else { u.name = 'Ảnh · ' + u.name; for (const k of ['maxHp', 'atk', 'matk', 'def']) u[k] = Math.round(u[k] * 0.6); u.hp = u.maxHp; }
    });
    return units;
  }
  const u = bossLike(T.boss, T.bossName, T.lv, T.hpMul, T.element, T.skills, { phases: 3, res: { seal: 50, chaos: 60, stun: 60 } });
  u.atk = Math.round(u.atk * 1.35); u.matk = Math.round(u.matk * 1.35);
  return [u];
}

// =====================================================================
//  GỬI CLIENT (gộp vào state)
// =====================================================================
function pub(c) {
  ensure(c);
  const t = c.title && Z.TITLES[c.title];
  const al = achList(c);
  return {
    menh: c.menh, asc: c.asc || 0, cap: L.levelCap(c), title: t ? { id: c.title, name: t.name, color: t.color } : null, titles: c.titles,
    energy: energy(c), energyMax: Z.GATHER.maxEnergy, gskill: c.gskill, mountLv: c.mountLv,
    wev: worldEvent(), run: c.run ? { kind: c.run.kind, id: c.run.id, stage: c.run.stage, total: c.run.total } : null,
    codexN: Object.keys(c.codex.f).length, thanN: c.codex.t.length, stall: c.stall ? { title: c.stall.title, n: c.stall.items.length } : null,
    badges3: {
      welfare: welfareBadge(c), ach: al.some((a) => a.done && !a.claimed), pass: passBadge(c), codex: codexBadge(c),
      than: Z.THAN_IDS.some((id) => L.countItem(c, 'hon_' + id) >= Z.THAN_COST.summon && !c.pets.some((p) => p.sid.startsWith('than.' + id + '.'))),
    },
  };
}
function welfareBadge(c) {
  if (c.nb.n < 7 && c.nb.last !== L.today()) return true;
  if (c.offline && c.offline.min >= Z.OFFLINE.minMin) return true;
  const mins = (c.daily.onl || 0) / 60, cl = c.daily.onlClaim || [];
  return Z.ONLINE_GIFTS.some((m, i) => mins >= m && !cl.includes(i));
}
function passBadge(c) {
  passEnsure(c);
  const lv = passLv(c);
  for (let i = 1; i <= lv; i++) { if (!c.pass.cf.includes(i)) return true; if (c.pass.prem && !c.pass.cp.includes(i)) return true; }
  for (const [box, list] of [[c.pass.d, Z.PASS.daily], [c.pass.w, Z.PASS.weekly]]) for (const t of list) if (passTaskVal(c, box, t) >= t.need && !box.done.includes(t.id)) return true;
  return false;
}
const passTaskVal = (c, box, t) => (t.k === 'online' ? Math.floor((c.daily.onl || 0) / 60) : box.p[t.id] || 0);
function codexBadge(c) { const n = Object.keys(c.codex.f).length; return Z.CODEX_MILESTONES.some((m) => n >= m.n && !c.codex.claimed.includes(m.n)); }

// =====================================================================
//  ĐĂNG KÝ SỰ KIỆN
// =====================================================================
const lastTouch = new Map(); // charId -> thời điểm (đếm thời gian online)
const stalls = new Map(); // charId -> true (sạp đang mở – để dọn khi rời mạng)

function register(on, ctx) {
  const { db, notInBattle, startBattle, sys, toast, pushState, io, socket, travel, mapPlayers, heroUnitsFrom } = ctx;
  DBREF = db;
  const levelUp = ctx.levelUp;
  const G = { levelUp };
  const bossStepIdx = (bid) => D.QUESTS.findIndex((q) => q.type === 'boss' && q.boss === bid);
  const beaten = (c, bid) => { const i = bossStepIdx(bid); return i >= 0 && c.quest > i; };
  const findPet = (c, uid) => c.pets.find((p) => p.uid === uid);

  // ---------------- THẦN SỦNG ----------------
  on('than:list', true, (c) => {
    ensure(c);
    const list = Z.THAN_IDS.map((id) => {
      const T = Z.THAN[id], pet = c.pets.find((p) => String(p.sid).startsWith('than.' + id + '.'));
      const sp = D.getSpecies('than.' + id + '.0'), sp2 = D.getSpecies('than.' + id + '.1');
      return { id, name: T.name, icon: T.icon, look: T.look, element: T.element, role: T.role, lore: T.lore, frags: L.countItem(c, 'hon_' + id),
        sig: { name: D.SKILLS[T.sig].name, desc: skillDesc(D.SKILLS[T.sig]) }, sig2: { name: D.SKILLS[T.sig2].name, desc: skillDesc(D.SKILLS[T.sig2]) },
        owned: pet ? { uid: pet.uid, lvl: pet.lvl, chan: sp2 && pet.sid === sp2.sid, name: pet.name } : null,
        preview: L.petStats({ sid: sp.sid, lvl: Math.max(1, c.lvl), mut: false }), source: thanSource(id), f: T.f };
    });
    return { ok: true, list, cost: Z.THAN_COST, vanHon: L.countItem(c, 'van_hon'), chanLinh: L.countItem(c, 'chan_linh'), noState: true };
  });
  on('than:summon', true, (c, { id }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const T = own(Z.THAN, id); if (!T) return { ok: false, msg: 'Thần sủng không tồn tại.' };
    if (c.pets.some((p) => String(p.sid).startsWith('than.' + id + '.'))) return { ok: false, msg: `Bạn đã có ${T.name}.` };
    if (c.pets.length >= D.CONFIG.petBag) return { ok: false, msg: `Túi Tiên sủng đầy (tối đa ${D.CONFIG.petBag}).` };
    const C = Z.THAN_COST;
    if (L.countItem(c, 'hon_' + id) < C.summon) return { ok: false, msg: `Cần ${C.summon} Hồn Phách ${T.name}.` };
    if (c.bac < C.summonBac) return { ok: false, msg: `Cần ${fmt(C.summonBac)} bạc.` };
    L.removeItem(c, 'hon_' + id, C.summon); c.bac -= C.summonBac;
    const p = L.makePet('than.' + id + '.0', Math.max(1, c.lvl - 5), false);
    c.pets.push(p); codexAdd(c, p.sid); L.teamAdd(c, p.uid);
    sys(`✨ ${c.name} triệu hồi thành công Thần sủng [${T.name}]!`);
    return { ok: true, msg: `Triệu hồi ${T.name} thành công!`, pet: L.petView(p), fx: 'summon' };
  });
  on('than:chan', true, (c, { uid }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const p = findPet(c, uid); const sp = p && D.getSpecies(p.sid);
    if (!sp || !sp.than) return { ok: false, msg: 'Chỉ Thần sủng mới Chân Hoá được.' };
    if (sp.chan) return { ok: false, msg: 'Thần sủng đã Chân Hoá.' };
    const C = Z.THAN_COST, T = Z.THAN[sp.than];
    if (p.lvl < C.chanLvl) return { ok: false, msg: `Cần Thần sủng đạt cấp ${C.chanLvl}.` };
    if (L.countItem(c, 'hon_' + sp.than) < C.chan) return { ok: false, msg: `Cần ${C.chan} Hồn Phách ${T.name}.` };
    if (L.countItem(c, 'chan_linh') < C.chanLinh) return { ok: false, msg: `Cần ${C.chanLinh} Chân Linh Thạch.` };
    if (c.bac < C.chanBac) return { ok: false, msg: `Cần ${fmt(C.chanBac)} bạc.` };
    L.removeItem(c, 'hon_' + sp.than, C.chan); L.removeItem(c, 'chan_linh', C.chanLinh); c.bac -= C.chanBac;
    const old = sp.name;
    p.sid = 'than.' + sp.than + '.1';
    if (p.name === old) p.name = 'Chân ' + T.name;
    track(c, 'chan', 1);
    sys(`🌟 ${c.name} Chân Hoá Thần sủng thành [Chân ${T.name}] – thần uy chấn động Tam Giới!`);
    return { ok: true, msg: `Chân Hoá thành công: Chân ${T.name}!`, pet: L.petView(p), fx: 'chan' };
  });
  on('than:convert', true, (c, { id, n }) => {
    const T = own(Z.THAN, id); n = int(n, 1, 999);
    if (!T || !n) return { ok: false, msg: 'Không hợp lệ.' };
    if (L.countItem(c, 'van_hon') < n) return { ok: false, msg: 'Không đủ Vạn Hồn Phách.' };
    L.removeItem(c, 'van_hon', n); L.addItem(c, 'hon_' + id, n);
    return { ok: true, msg: `Đã chuyển ${n} Vạn Hồn Phách → Hồn Phách ${T.name}.` };
  });

  // ---------------- TÍNH CÁCH TIÊN SỦNG ----------------
  on('pet:trait', true, (c, { uid }) => {
    const p = findPet(c, uid); if (!p) return { ok: false, msg: 'Không tìm thấy Tiên sủng.' };
    if (L.countItem(c, 'tay_tam') < 1) return { ok: false, msg: 'Cần 1 Tẩy Tâm Đan (luyện ở Lò Bát Quái).' };
    L.removeItem(c, 'tay_tam', 1);
    const old = p.tc; p.tc = rollTrait(old);
    const T = Z.TRAITS[p.tc];
    if (T.rare) sys(`${c.name} tẩy tâm cho ${p.name} ra tính cách hiếm [${T.name}]!`);
    return { ok: true, msg: `${p.name}: ${Z.TRAITS[old] ? Z.TRAITS[old].name : '?'} → ${T.name} (${T.desc})`, trait: p.tc };
  });

  // ---------------- MỆNH ----------------
  on('menh:set', true, (c, { el }) => {
    ensure(c);
    if (!own(Z.MENH, el)) return { ok: false, msg: 'Chọn một Mệnh.' };
    if (c.lvl < Z.MENH_LVL) return { ok: false, msg: `Đạt cấp ${Z.MENH_LVL} để định Mệnh.` };
    if (c.menh === el) return { ok: false, msg: 'Bạn đang mang Mệnh này.' };
    if (c.menh) {
      if (L.countItem(c, 'menh_phu') > 0) L.removeItem(c, 'menh_phu', 1);
      else if (c.vang >= Z.MENH_CHANGE_VANG) c.vang -= Z.MENH_CHANGE_VANG;
      else return { ok: false, msg: `Đổi Mệnh cần 1 Mệnh Phù hoặc ${Z.MENH_CHANGE_VANG} vàng.` };
    }
    c.menh = el; L.clampHpMp(c);
    return { ok: true, msg: `Đã định ${Z.MENH[el].name}: ${Z.MENH[el].desc}.` };
  });

  // ---------------- DANH HIỆU & THÀNH TỰU ----------------
  on('ach:list', true, (c) => ({ ok: true, list: achList(c), titles: c.titles.map((id) => ({ id, ...Z.TITLES[id] })), title: c.title, allTitles: Z.TITLES, noState: true }));
  on('ach:claim', true, (c, { id }) => {
    const a = achList(c).find((x) => x.id === id);
    if (!a) return { ok: false, msg: 'Không có thành tựu này.' };
    if (!a.done) return { ok: false, msg: 'Chưa đạt.' };
    if (a.claimed) return { ok: false, msg: 'Đã nhận rồi.' };
    c.ach.done.push(id);
    const A = Z.ACH.find((x) => x.id === id);
    const got = grant(c, { ...A.r, title: A.title }, G);
    if (A.title) sys(`🏅 ${c.name} đạt danh hiệu «${Z.TITLES[A.title].name}»!`);
    return { ok: true, msg: `Thành tựu «${A.name}»: ${got.join(' · ')}` };
  });
  on('title:set', true, (c, { id }) => {
    ensure(c);
    if (id && !c.titles.includes(id)) return { ok: false, msg: 'Chưa có danh hiệu này.' };
    c.title = id || null; L.clampHpMp(c);
    io.to('map:' + c.map).emit('map:title', { id: c.id, title: titleOf(c) });
    return { ok: true, msg: id ? `Đeo danh hiệu «${Z.TITLES[id].name}».` : 'Đã tháo danh hiệu.' };
  });

  // ---------------- PHÚC LỢI ----------------
  on('welfare:info', true, (c) => {
    ensure(c);
    const mins = Math.floor((c.daily.onl || 0) / 60), cl = c.daily.onlClaim || [];
    return { ok: true, noState: true,
      newbie: { n: c.nb.n, today: c.nb.last === L.today(), list: Z.NEWBIE },
      online: { mins, list: Z.ONLINE_GIFTS.map((m, i) => ({ m, i, done: mins >= m, claimed: cl.includes(i), label: rewardText(Z.onlineGift(i, c.lvl)) })) },
      offline: c.offline && c.offline.min >= Z.OFFLINE.minMin ? { ...c.offline, vang2: Math.max(2, Math.ceil(c.offline.min / 60) * Z.OFFLINE.vangPerHour) } : null };
  });
  on('newbie:claim', true, (c) => {
    ensure(c);
    if (c.nb.n >= 7) return { ok: false, msg: 'Đã nhận đủ 7 ngày quà tân thủ.' };
    if (c.nb.last === L.today()) return { ok: false, msg: 'Hôm nay đã nhận – quay lại ngày mai nhé!' };
    const it = Z.NEWBIE[c.nb.n];
    c.nb.n++; c.nb.last = L.today();
    const got = grant(c, it.r, G);
    if (it.big) sys(`🎉 ${c.name} hoàn thành 7 ngày tân thủ, nhận Hồn Phách Tiểu Bạch Long!`);
    return { ok: true, msg: `Quà tân thủ ngày ${it.day}: ${got.join(' · ')}` };
  });
  on('online:claim', true, (c, { i }) => {
    i = int(i, 0, Z.ONLINE_GIFTS.length - 1); if (i == null) return { ok: false, msg: 'Không hợp lệ.' };
    const mins = (c.daily.onl || 0) / 60; c.daily.onlClaim = c.daily.onlClaim || [];
    if (mins < Z.ONLINE_GIFTS[i]) return { ok: false, msg: `Cần online đủ ${Z.ONLINE_GIFTS[i]} phút hôm nay.` };
    if (c.daily.onlClaim.includes(i)) return { ok: false, msg: 'Đã nhận rồi.' };
    c.daily.onlClaim.push(i);
    return { ok: true, msg: `Quà online ${Z.ONLINE_GIFTS[i]} phút: ${grant(c, Z.onlineGift(i, c.lvl), G).join(' · ')}` };
  });
  on('offline:claim', true, (c, { double }) => {
    const o = c.offline;
    if (!o || o.min < Z.OFFLINE.minMin) return { ok: false, msg: 'Không có phần thưởng bế quan.' };
    const v2 = Math.max(2, Math.ceil(o.min / 60) * Z.OFFLINE.vangPerHour);
    if (double && c.vang < v2) return { ok: false, msg: `Nhân đôi cần ${v2} vàng.` };
    if (double) c.vang -= v2;
    const k = double ? 2 : 1;
    c.offline = null;
    const got = grant(c, { exp: o.exp * k, bac: o.bac * k }, G);
    return { ok: true, msg: `Bế quan ${Math.floor(o.min / 60)} giờ ${o.min % 60} phút${double ? ' (×2)' : ''}: ${got.join(' · ')}` };
  });
  on('ol:tick', true, () => ({ ok: true, noState: true }));

  // ---------------- TU HÀNH LỆNH ----------------
  on('pass:info', true, (c) => {
    ensure(c); passEnsure(c);
    const tasks = (box, list) => list.map((t) => ({ ...t, v: Math.min(t.need, passTaskVal(c, box, t)), claimed: box.done.includes(t.id) }));
    return { ok: true, noState: true, season: c.pass.season, ends: seasonEnds(), xp: c.pass.xp, lv: passLv(c), xpPerLv: Z.PASS.xpPerLv, levels: Z.PASS.levels, prem: c.pass.prem, price: Z.PASS.premiumVang,
      cf: c.pass.cf, cp: c.pass.cp, rewards: Z.PASS.rewards.map((r) => ({ lv: r.lv, free: rewardText(r.free), prem: rewardText(r.prem) })),
      daily: tasks(c.pass.d, Z.PASS.daily), weekly: tasks(c.pass.w, Z.PASS.weekly), dailyXp: c.pass.d.xp, dailyCap: Z.PASS.dailyCap };
  });
  on('pass:task', true, (c, { id, weekly }) => {
    passEnsure(c);
    const box = weekly ? c.pass.w : c.pass.d, list = weekly ? Z.PASS.weekly : Z.PASS.daily;
    const t = list.find((x) => x.id === id);
    if (!t) return { ok: false, msg: 'Không có nhiệm vụ này.' };
    if (box.done.includes(id)) return { ok: false, msg: 'Đã nhận.' };
    if (passTaskVal(c, box, t) < t.need) return { ok: false, msg: 'Chưa hoàn thành.' };
    let xp = t.xp;
    if (!weekly) { xp = Math.max(0, Math.min(xp, Z.PASS.dailyCap - c.pass.d.xp)); c.pass.d.xp += xp; }
    box.done.push(id);
    const before = passLv(c); c.pass.xp = Math.min(Z.PASS.levels * Z.PASS.xpPerLv, c.pass.xp + xp); const after = passLv(c);
    return { ok: true, msg: `+${xp} điểm Tu Hành${after > before ? ` · Lên cấp Lệnh ${after}!` : ''}` };
  });
  on('pass:claim', true, (c, { lv, prem }) => {
    passEnsure(c);
    lv = int(lv, 1, Z.PASS.levels); if (!lv) return { ok: false, msg: 'Không hợp lệ.' };
    if (passLv(c) < lv) return { ok: false, msg: 'Chưa đạt cấp này.' };
    const arr = prem ? c.pass.cp : c.pass.cf;
    if (prem && !c.pass.prem) return { ok: false, msg: 'Cần mở Lệnh Chí Tôn.' };
    if (arr.includes(lv)) return { ok: false, msg: 'Đã nhận.' };
    arr.push(lv);
    const R = Z.PASS.rewards[lv - 1];
    return { ok: true, msg: `Tu Hành Lệnh cấp ${lv}${prem ? ' (Chí Tôn)' : ''}: ${grant(c, prem ? R.prem : R.free, G).join(' · ')}` };
  });
  on('pass:claimAll', true, (c) => {
    passEnsure(c);
    const lv = passLv(c), got = [];
    for (let i = 1; i <= lv; i++) {
      const R = Z.PASS.rewards[i - 1];
      if (!c.pass.cf.includes(i)) { c.pass.cf.push(i); got.push(...grant(c, R.free, G)); }
      if (c.pass.prem && !c.pass.cp.includes(i)) { c.pass.cp.push(i); got.push(...grant(c, R.prem, G)); }
    }
    if (!got.length) return { ok: false, msg: 'Không còn phần thưởng nào để nhận.' };
    return { ok: true, msg: `Đã nhận ${got.length} phần thưởng Tu Hành Lệnh.` };
  });
  on('pass:buy', true, (c) => {
    passEnsure(c);
    if (c.pass.prem) return { ok: false, msg: 'Đã mở Lệnh Chí Tôn mùa này.' };
    if (c.vang < Z.PASS.premiumVang) return { ok: false, msg: `Cần ${Z.PASS.premiumVang} vàng.` };
    c.vang -= Z.PASS.premiumVang; c.pass.prem = true;
    sys(`👑 ${c.name} mở Tu Hành Lệnh Chí Tôn!`);
    return { ok: true, msg: 'Đã mở Lệnh Chí Tôn – nhận thêm phần thưởng ở mọi cấp!' };
  });

  // ---------------- KHAI THÁC ----------------
  on('gather:do', true, (c, { node }) => {
    const nb = notInBattle(c); if (nb) return nb;
    ensure(c);
    const M = D.MAPS[c.map], n = (M.nodes || []).find((x) => x.id === node);
    if (!n) return { ok: false, msg: 'Không có điểm khai thác ở đây.' };
    if (Math.abs(n.x - c.x) + Math.abs(n.y - c.y) > 1) return { ok: false, msg: 'Hãy lại gần hơn.' };
    const T = Z.GATHER.types[n.type], now = Date.now();
    const cd = (c.gcd[n.id] || 0) + Z.GATHER.cooldownMin * MIN - now;
    if (cd > 0) return { ok: false, msg: `${T.name} đang hồi linh khí (${Math.ceil(cd / MIN)} phút).`, noState: true };
    const boom = wevIs('linhmach');
    const cost = boom ? Math.ceil(Z.GATHER.cost / 2) : Z.GATHER.cost;
    if (energy(c) < cost) return { ok: false, msg: `Tinh Lực không đủ (cần ${cost}). Tinh Lực hồi 1 điểm mỗi ${Z.GATHER.regenMin} phút.` };
    c.energy.v -= cost; c.gcd[n.id] = now;
    const lv = c.gskill.lv, mult = boom ? 2 : 1;
    const got = {};
    got[T.common] = (L.rand(1, 2) + (lv >= 5 ? 1 : 0) + (lv >= 9 ? 1 : 0)) * mult;
    if (L.chance(0.08 + lv * 0.012 + (M.post ? 0.05 : 0))) got[T.rare] = mult;
    if (L.chance(0.04)) got.thu_luong = 1;
    const out = [];
    for (const [id, q] of Object.entries(got)) if (L.addItem(c, id, q)) out.push({ id, q });
    c.gskill.exp += 10 + (M.post ? 6 : 0);
    let up = false;
    while (c.gskill.lv < 10 && c.gskill.exp >= Z.GATHER.needLv(c.gskill.lv)) { c.gskill.exp -= Z.GATHER.needLv(c.gskill.lv); c.gskill.lv++; up = true; }
    track(c, 'gather', 1);
    const txt = out.map((o) => `${o.q} ${D.ITEMS[o.id].name}`).join(', ');
    return { ok: true, msg: `${T.icon} ${T.verb} được ${txt}${up ? ` · Khai thác lên cấp ${c.gskill.lv}!` : ''}`, got: out, node: n.id, rare: !!got[T.rare] };
  });
  on('gather:cd', true, (c) => {
    ensure(c);
    const M = D.MAPS[c.map], now = Date.now();
    return { ok: true, noState: true, cd: Object.fromEntries((M.nodes || []).map((n) => [n.id, Math.max(0, (c.gcd[n.id] || 0) + Z.GATHER.cooldownMin * MIN - now)])) };
  });

  // ---------------- SẠP HÀNG CÁ NHÂN ----------------
  on('stall:open', true, (c, { title, items }) => {
    const nb = notInBattle(c); if (nb) return nb;
    if (c.stall) return { ok: false, msg: 'Sạp đang mở.' };
    if (c.lvl < 15) return { ok: false, msg: 'Cần cấp 15 để bày sạp.' };
    const tile = D.MAPS[c.map].tiles[c.y][c.x];
    if (tile === 'P') return { ok: false, msg: 'Không bày sạp ở cổng dịch chuyển.' };
    title = String(title || '').normalize('NFC').replace(/[\u0000-\u001f<>&"'`]/g, '').trim().slice(0, 16) || `Sạp của ${c.name}`;
    if (!Array.isArray(items) || !items.length || items.length > 6) return { ok: false, msg: 'Chọn 1–6 món để bày bán.' };
    // kiểm tra trước, rồi mới trừ
    const plan = [];
    const usedItem = {};
    for (const x of items) {
      const price = int(x && x.price, 1, 50000000);
      if (!price || price !== Math.floor(Number(x.price))) return { ok: false, msg: 'Giá phải từ 1 đến 50.000.000 bạc.' };
      if (x.kind === 'item') {
        const it = own(D.ITEMS, x.id), q = int(x.qty, 1, 999);
        if (!it || !q) return { ok: false, msg: 'Vật phẩm không hợp lệ.' };
        usedItem[x.id] = (usedItem[x.id] || 0) + q;
        if (L.countItem(c, x.id) < usedItem[x.id]) return { ok: false, msg: `Không đủ ${it.name}.` };
        plan.push({ kind: 'item', data: { id: x.id }, qty: q, price, title: `${it.name}${q > 1 ? ' ×' + q : ''}` });
      } else if (x.kind === 'eq') {
        const eq = c.bag.find((b) => b.t === 'eq' && b.uid === x.uid);
        if (!eq || eq.unique) return { ok: false, msg: 'Trang bị không hợp lệ (tháo ra trước, bảo vật độc bản không bán được).' };
        if (plan.some((p) => p.kind === 'eq' && p.data.uid === eq.uid)) return { ok: false, msg: 'Trùng món.' };
        plan.push({ kind: 'eq', data: eq, qty: 1, price, title: `${D.QUALITIES[eq.q].name} ${eq.name}${eq.plus ? ' +' + eq.plus : ''}` });
      } else if (x.kind === 'pet') {
        const p = findPet(c, x.uid);
        if (!p || String(p.sid).startsWith('than.')) return { ok: false, msg: 'Tiên sủng không hợp lệ (Thần sủng không giao dịch được).' };
        if ((c.activePets || []).includes(p.uid)) return { ok: false, msg: 'Cho Tiên sủng nghỉ trước khi bán.' };
        if (plan.some((q) => q.kind === 'pet' && q.data.uid === p.uid)) return { ok: false, msg: 'Trùng món.' };
        plan.push({ kind: 'pet', data: p, qty: 1, price, title: p.name });
      } else return { ok: false, msg: 'Loại hàng không hợp lệ.' };
    }
    for (const p of plan) {
      if (p.kind === 'item') L.removeItem(c, p.data.id, p.qty);
      else if (p.kind === 'eq') c.bag.splice(c.bag.findIndex((b) => b.uid === p.data.uid), 1);
      else c.pets = c.pets.filter((x) => x.uid !== p.data.uid);
    }
    c.stall = { title, items: plan.map((p, i) => ({ ...p, i })), at: Date.now(), x: c.x, y: c.y, map: c.map, sold: 0 };
    stalls.set(c.id, true);
    io.to('map:' + c.map).emit('map:stall', { id: c.id, stall: title });
    return { ok: true, msg: `Đã bày sạp «${title}». Di chuyển sẽ tự dọn sạp.` };
  });
  on('stall:close', true, (c) => { if (!c.stall) return { ok: false, msg: 'Chưa mở sạp.' }; closeStall(c, io); return { ok: true, msg: 'Đã dọn sạp, hàng chưa bán đã về túi.' }; });
  on('stall:view', true, (c, { id }) => {
    const s = id === c.id ? c : db.chars[id];
    if (!s || !s.stall || (s.id !== c.id && (s.map !== c.map || !ctx.online.has(s.id)))) return { ok: false, msg: 'Sạp đã dọn.' };
    return { ok: true, noState: true, owner: { id: s.id, name: s.name, lvl: s.lvl }, title: s.stall.title, mine: s.id === c.id,
      items: s.stall.items.map((x) => ({ i: x.i, kind: x.kind, title: x.title, price: x.price, qty: x.qty, itemId: x.kind === 'item' ? x.data.id : null,
        q: x.kind === 'eq' ? x.data.q : x.kind === 'pet' ? D.getSpecies(x.data.sid).grade : null,
        sub: x.kind === 'eq' ? `${D.SLOTS[x.data.slot].name} · Cấp ${x.data.lvl}` : x.kind === 'pet' ? `Cấp ${x.data.lvl} · ${D.GRADES[D.getSpecies(x.data.sid).grade].name}${x.data.mut ? ' · Biến dị' : ''}` : D.ITEMS[x.data.id].desc,
        pet: x.kind === 'pet' ? L.petView(x.data) : null, eq: x.kind === 'eq' ? { ...x.data, total: L.equipStats(x.data) } : null })) };
  });
  on('stall:buy', true, (c, { id, i }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const s = db.chars[id];
    if (!s || s.id === c.id || !s.stall || s.map !== c.map || !ctx.online.has(s.id)) return { ok: false, msg: 'Sạp đã dọn.' };
    const x = s.stall.items.find((y) => y.i === i);
    if (!x) return { ok: false, msg: 'Món này vừa có người mua.' };
    if (c.bac < x.price) return { ok: false, msg: 'Không đủ bạc.' };
    if (x.kind === 'pet' && c.pets.length >= D.CONFIG.petBag) return { ok: false, msg: 'Túi Tiên sủng đầy.' };
    if (x.kind !== 'pet' && L.bagUsed(c) >= D.CONFIG.bagSize && !(x.kind === 'item' && L.countItem(c, x.data.id))) return { ok: false, msg: 'Hành trang đầy.' };
    c.bac -= x.price;
    if (x.kind === 'item') L.addItem(c, x.data.id, x.qty); else if (x.kind === 'eq') L.addEquip(c, x.data); else c.pets.push(x.data);
    const tax = Math.floor(x.price * 0.03), gain = x.price - tax;
    s.bac += gain; s.stall.items = s.stall.items.filter((y) => y !== x); s.stall.sold += gain;
    toast(s, `🏮 ${c.name} mua «${x.title}» ở sạp của bạn: +${fmt(gain)} bạc`, 'gold'); pushState(s);
    if (!s.stall.items.length) { closeStall(s, io); toast(s, '🏮 Sạp đã bán hết hàng!', 'gold'); }
    return { ok: true, msg: `Đã mua «${x.title}» giá ${fmt(x.price)} bạc.` };
  });

  // ---------------- CẤP THÚ CƯỠI ----------------
  on('mount:up', true, (c, { id }) => {
    ensure(c);
    if (!own(X.MOUNTS, id) || !(c.mounts || []).includes(id)) return { ok: false, msg: 'Chưa có thú cưỡi này.' };
    const lv = c.mountLv[id] || 1;
    if (lv >= Z.MOUNT_MAX_LV) return { ok: false, msg: 'Thú cưỡi đã đạt cấp tối đa.' };
    const k = Z.mountUpCost(lv);
    if (L.countItem(c, 'thu_luong') < k.food) return { ok: false, msg: `Cần ${k.food} Thú Lương (khai thác hoặc luyện ở Lò Bát Quái).` };
    if (c.bac < k.bac) return { ok: false, msg: `Cần ${fmt(k.bac)} bạc.` };
    L.removeItem(c, 'thu_luong', k.food); c.bac -= k.bac;
    c.mountLv[id] = lv + 1;
    if (lv + 1 === Z.MOUNT_MAX_LV) sys(`${c.name} nuôi ${X.MOUNTS[id].name} đạt cấp tối đa!`);
    return { ok: true, msg: `${X.MOUNTS[id].name} lên cấp ${lv + 1} (+${12 * lv}% hiệu quả).` };
  });
  on('mount3:list', true, (c) => {
    ensure(c);
    return { ok: true, noState: true, list: Object.entries(X.MOUNTS).map(([id, m]) => ({ id, ...m, bossName: m.boss ? D.BOSSES[m.boss].name : undefined, owned: (c.mounts || []).includes(id), riding: c.mount === id, lv: c.mountLv[id] || 1, up: Z.mountUpCost(c.mountLv[id] || 1), maxLv: Z.MOUNT_MAX_LV, recipe: X.RECIPES[id] ? true : false })), food: L.countItem(c, 'thu_luong') };
  });

  // ---------------- ÁC MỘNG ----------------
  on('nm:list', true, (c) => {
    const used = c.daily.nm || 0;
    const list = Object.entries(D.BOSSES).filter(([k]) => k !== 'world' && bossStepIdx(k) >= 0).map(([k, B]) => ({ id: k, name: B.name, icon: B.icon, element: B.element, lv: Z.nightmareLvl(B), map: B.map || D.QUESTS[bossStepIdx(k)].map,
      beaten: beaten(c, k), than: own(Z.THAN, k) ? Z.THAN[k].name : null, post: !!B.post }));
    return { ok: true, noState: true, list, left: Math.max(0, Z.NIGHTMARE.perDay - used), perDay: Z.NIGHTMARE.perDay, minLvl: Z.NIGHTMARE.minLvl };
  });
  function nightmareStart(c, bid) {
    const nb = notInBattle(c); if (nb) return nb;
    if (!own(D.BOSSES, bid) || bid === 'world') return { ok: false, msg: 'Boss không tồn tại.' };
    if (c.lvl < Z.NIGHTMARE.minLvl) return { ok: false, msg: `Cần cấp ${Z.NIGHTMARE.minLvl} để vào Ác Mộng.` };
    if (!beaten(c, bid)) return { ok: false, msg: 'Hãy đánh bại boss này trong cốt truyện trước.' };
    if ((c.daily.nm || 0) >= Z.NIGHTMARE.perDay) return { ok: false, msg: `Hết lượt Ác Mộng hôm nay (${Z.NIGHTMARE.perDay}/ngày).` };
    if (c.hp < 1) return { ok: false, msg: 'Khí huyết cạn, hãy trị thương trước.' };
    c.daily.nm = (c.daily.nm || 0) + 1;
    return { ok: true, battle: startBattle(c, makeNightmare(bid), { kind: 'nightmare', bossId: bid, canFlee: false, theme: (D.MAPS[D.BOSSES[bid].map] || {}).theme, summonOnPhase: (u) => [L.makeHuman('mabinh', u.lvl - 4), L.makeHuman('mabinh', u.lvl - 4)] }) };
  }
  on('nm:fight', true, (c, { boss }) => nightmareStart(c, boss));

  // ---------------- PHI THĂNG ----------------
  on('asc:info', true, (c) => ({ ok: true, noState: true, asc: c.asc || 0, lvl: Z.ASCEND.lvl, story: c.quest >= D.STORY_END, left: Math.max(0, Z.ASCEND.perDay - (c.daily.trial || 0)), perDay: Z.ASCEND.perDay, trial: Z.TRIAL.map((t) => ({ id: t.id, name: t.name, desc: t.desc, boss: t.boss, bossName: t.bossName })), bonus: Z.ASCEND, run: c.run && c.run.kind === 'trial' ? c.run : null }));
  function trialStart(c) {
    const nb = notInBattle(c); if (nb) return nb;
    if (c.asc) return { ok: false, msg: 'Bạn đã Phi Thăng.' };
    if (c.lvl < Z.ASCEND.lvl) return { ok: false, msg: `Cần đạt cấp ${Z.ASCEND.lvl}.` };
    if (c.quest < D.STORY_END) return { ok: false, msg: 'Cần hoàn thành 81 kiếp nạn trước.' };
    if ((c.daily.trial || 0) >= Z.ASCEND.perDay) return { ok: false, msg: `Hết lượt độ kiếp hôm nay (${Z.ASCEND.perDay}/ngày).` };
    c.daily.trial = (c.daily.trial || 0) + 1;
    const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp;
    c.run = { kind: 'trial', id: 'asc', stage: 0, total: Z.TRIAL.length, at: Date.now() };
    sys(`⚡ ${c.name} bắt đầu độ Tam Cửu Thiên Kiếp!`);
    return { ok: true, battle: startBattle(c, trialEnemies(0, c, heroUnitsFrom), { kind: 'trial', stage: 0, canFlee: false, maxRounds: 30, theme: 'heaven' }) };
  }
  on('asc:start', true, (c) => trialStart(c));

  // ---------------- PHÓ BẢN ----------------
  on('dg:list', true, (c) => ({ ok: true, noState: true, perDay: Z.DUNGEON.perDay, list: Z.DUNGEONS.map((d) => ({ ...d, left: Math.max(0, Z.DUNGEON.perDay - ((c.daily.dg || {})[d.id] || 0)), elvl: dungeonLvl(d, c), fragName: Z.THAN[d.frag] ? Z.THAN[d.frag].name : null, dropText: Object.entries(d.drop).map(([k, n]) => (k === 'sach' ? `${n} Sách` : `${n} ${D.ITEMS[k].name}`)).join(' · ') })), run: c.run && c.run.kind === 'dungeon' ? c.run : null }));
  on('dg:enter', true, (c, { id }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const dg = Z.DUNGEONS.find((d) => d.id === id);
    if (!dg) return { ok: false, msg: 'Phó bản không tồn tại.' };
    if (c.lvl < dg.lvl) return { ok: false, msg: `Cần cấp ${dg.lvl}.` };
    if (dg.asc && !c.asc) return { ok: false, msg: 'Cần Phi Thăng.' };
    c.daily.dg = c.daily.dg || {};
    if ((c.daily.dg[id] || 0) >= Z.DUNGEON.perDay) return { ok: false, msg: `Hết lượt hôm nay (${Z.DUNGEON.perDay}/ngày).` };
    if (c.hp < 1) return { ok: false, msg: 'Khí huyết cạn, hãy trị thương trước.' };
    c.daily.dg[id] = (c.daily.dg[id] || 0) + 1;
    c.run = { kind: 'dungeon', id, stage: 0, total: Z.DUNGEON.waves + 1, at: Date.now() };
    return { ok: true, battle: startBattle(c, dungeonWave(dg, c, 0), { kind: 'dungeon', dungeon: id, stage: 0, canFlee: true, theme: dg.theme }) };
  });
  on('run:next', true, (c) => {
    const nb = notInBattle(c); if (nb) return nb;
    const r = c.run;
    if (!r || Date.now() - r.at > 40 * MIN) { c.run = null; return { ok: false, msg: 'Lượt khiêu chiến đã kết thúc.' }; }
    if (c.hp < 1) { const s = L.calcStats(c); c.hp = Math.round(s.maxHp * 0.3); }
    if (r.kind === 'trial') return { ok: true, battle: startBattle(c, trialEnemies(r.stage, c, heroUnitsFrom), { kind: 'trial', stage: r.stage, canFlee: false, maxRounds: 30, theme: r.stage === 2 ? 'void' : 'heaven' }) };
    const dg = Z.DUNGEONS.find((d) => d.id === r.id);
    const last = r.stage >= Z.DUNGEON.waves;
    return { ok: true, battle: startBattle(c, last ? dungeonBoss(dg, c) : dungeonWave(dg, c, r.stage), { kind: 'dungeon', dungeon: r.id, stage: r.stage, canFlee: true, theme: dg.theme, summonOnPhase: last ? (u) => [L.makeHuman(L.pick(dg.humans), u.lvl - 4)] : undefined }) };
  });
  on('run:quit', true, (c) => { c.run = null; return { ok: true, msg: 'Đã rời khỏi.' }; });

  // ---------------- ĐỒ GIÁM ----------------
  on('codex:info', true, (c) => {
    ensure(c);
    return { ok: true, noState: true, f: c.codex.f, t: c.codex.t, claimed: c.codex.claimed, milestones: Z.CODEX_MILESTONES.map((m) => ({ n: m.n, label: rewardText(m.r) })), pct: Z.CODEX_PCT_PER_FORM,
      forms: D.FORMS.map((f) => ({ id: f.id, name: f.name, icon: f.icon, rare: !!f.rare })), than: Z.THAN_IDS.map((id) => ({ id, name: Z.THAN[id].name, look: Z.THAN[id].look, element: Z.THAN[id].element })) };
  });
  on('codex:claim', true, (c, { n }) => {
    ensure(c);
    const m = Z.CODEX_MILESTONES.find((x) => x.n === n);
    if (!m) return { ok: false, msg: 'Không hợp lệ.' };
    if (Object.keys(c.codex.f).length < m.n) return { ok: false, msg: `Cần ${m.n} hình thái trong Đồ giám.` };
    if (c.codex.claimed.includes(n)) return { ok: false, msg: 'Đã nhận.' };
    c.codex.claimed.push(n);
    return { ok: true, msg: `Mốc Đồ giám ${n}: ${grant(c, m.r, G).join(' · ')}` };
  });

  // ---------------- BANG HỘI: CẤP, QUYÊN GÓP, QUÀ ----------------
  on('guild3:info', true, (c) => {
    const g = c.guild && db.guilds[c.guild];
    if (!g) return { ok: false, msg: 'Chưa vào môn phái.', noState: true };
    const pg = guildProg(g), perk = Z.GUILD.perk(pg.lv);
    return { ok: true, noState: true, ...pg, maxLv: Z.GUILD.maxLv, perk, next: Z.GUILD.perk(Math.min(Z.GUILD.maxLv, pg.lv + 1)), gift: rewardText(Z.GUILD.gift(pg.lv)), giftDone: !!c.daily.ggift,
      donate: Z.GUILD.donate, donated: c.daily.gdon || 0 };
  });
  on('guild:donate', true, (c) => {
    const g = c.guild && db.guilds[c.guild];
    if (!g) return { ok: false, msg: 'Chưa vào môn phái.' };
    const d = Z.GUILD.donate;
    if ((c.daily.gdon || 0) >= d.perDay) return { ok: false, msg: `Mỗi ngày quyên góp tối đa ${d.perDay} lần.` };
    if (c.bac < d.bac) return { ok: false, msg: `Cần ${fmt(d.bac)} bạc.` };
    c.bac -= d.bac; c.daily.gdon = (c.daily.gdon || 0) + 1;
    c.contrib += d.contrib; g.members[c.id] = (g.members[c.id] || 0) + d.contrib; g.points = (g.points || 0) + d.contrib;
    const up = guildExp(db, c, d.exp);
    if (up) { ctx.addChat('phai', { from: 'Môn Phái', text: `🎉 Môn phái lên cấp ${up.lv}! Mọi đệ tử nhận thêm phúc lợi.` }, g.id); sys(`Môn phái «${g.name}» đạt cấp ${up.lv}!`); }
    return { ok: true, msg: `Quyên góp ${fmt(d.bac)} bạc: +${d.exp} kinh nghiệm môn phái, +${d.contrib} cống hiến.` };
  });
  on('guild:gift', true, (c) => {
    const g = c.guild && db.guilds[c.guild];
    if (!g) return { ok: false, msg: 'Chưa vào môn phái.' };
    if (c.daily.ggift) return { ok: false, msg: 'Hôm nay đã nhận quà môn phái.' };
    c.daily.ggift = true;
    return { ok: true, msg: `Quà môn phái (cấp ${guildLv(g)}): ${grant(c, Z.GUILD.gift(guildLv(g)), G).join(' · ')}` };
  });

  on('wev:info', true, () => ({ ok: true, noState: true, ev: worldEvent(), all: Z.WORLD_EVENTS }));

  // ---------- hook cho server.js ----------
  return {
    talk(c, n, opts) {
      if (n.boss && beaten(c, n.boss) && c.lvl >= Z.NIGHTMARE.minLvl) opts.push({ id: 'nightmare', label: `👁️ Ác Mộng (Cấp ${Z.nightmareLvl(D.BOSSES[n.boss])} · còn ${Math.max(0, Z.NIGHTMARE.perDay - (c.daily.nm || 0))} lượt)` });
      if (n.id === 'laoquan' && !c.asc) opts.push({ id: 'trial', label: `⚡ Độ Tam Cửu Thiên Kiếp (cấp ${Z.ASCEND.lvl})` });
      return null;
    },
    act(c, n, opt) {
      if (opt === 'nightmare' && n.boss) return nightmareStart(c, n.boss);
      if (opt === 'trial' && n.id === 'laoquan') return trialStart(c);
      return null;
    },
  };
}

function skillDesc(s) {
  const p = [];
  p.push(s.type === 'heal' ? (s.target === 'allAlly' ? 'Hồi máu cả đội' : 'Hồi máu một đồng đội') : s.type === 'buff' ? 'Tự cường hoá' : s.type === 'control' ? (s.target === 'allEnemy' ? 'Khống chế toàn địch' : 'Khống chế một địch') : s.target === 'allEnemy' ? 'Đánh toàn bộ địch' : 'Đánh một địch');
  if (s.power) p.push(`uy lực ${Math.round(s.power * 100)}%`);
  if (s.burn) p.push(`Bỏng ${s.burn} lượt`); if (s.poison) p.push(`Độc ${s.poison} lượt`);
  if (s.stun) p.push(`${Math.round(s.stun * 100)}% Định Thân`); if (s.drain) p.push(`hút ${Math.round(s.drain * 100)}% máu`);
  if (s.mpDrain) p.push(`hút ${Math.round(s.mpDrain * 100)}% nội lực`); if (s.shield) p.push(`khiên ${Math.round(s.shield * 100)}% máu`);
  if (s.status === 'chaos') p.push(`${Math.round(s.chance * 100)}% Loạn Hồn`); if (s.status === 'stun' && s.chance) p.push(`${Math.round(s.chance * 100)}% Định Thân`);
  return p.join(' · ');
}
function thanSource(id) {
  const out = [];
  if (D.BOSSES[id]) out.push(`Boss ${D.BOSSES[id].name} (tái chiến, Ác Mộng)`);
  const dg = Z.DUNGEONS.find((d) => d.frag === id); if (dg) out.push(`Phó bản ${dg.name}`);
  if (id === 'tieubachlong') out.push('Quà tân thủ ngày 7');
  out.push('Vạn Hồn Phách (Tu Hành Lệnh, thành tựu, Đồ giám)');
  return out;
}

function titleOf(c) { const t = c.title && Z.TITLES[c.title]; return t ? { name: t.name, color: t.color } : null; }

function closeStall(c, io) {
  const s = c.stall; if (!s) return;
  for (const x of s.items) {
    if (x.kind === 'item') { if (!L.addItem(c, x.data.id, x.qty)) mailFull(c, x.data.id, x.qty); }
    else if (x.kind === 'eq') { if (!L.addEquip(c, x.data)) c.bag.push(x.data); }
    else c.pets.push(x.data);
  }
  c.stall = null; stalls.delete(c.id);
  if (io) io.to('map:' + c.map).emit('map:stall', { id: c.id, stall: null });
}

// ---------- gọi từ server.js ----------
// mỗi lệnh từ client: cộng thời gian online, ghi lần cuối thấy
function touch(c) {
  ensure(c);
  const now = Date.now(), last = lastTouch.get(c.id);
  if (last && now - last < 150e3) c.daily.onl = (c.daily.onl || 0) + Math.round((now - last) / 1000);
  lastTouch.set(c.id, now);
  c.lastSeen = now;
}
function onEnter(c) {
  ensure(c);
  const now = Date.now();
  if (c.lastSeen && !c.offline) {
    const min = Math.min(Z.OFFLINE.maxMin, Math.floor((now - c.lastSeen) / MIN));
    if (min >= Z.OFFLINE.minMin) c.offline = { min, exp: Math.round(L.expNeed(c.lvl) * Z.OFFLINE.expPerMin * min), bac: Math.round((10 + c.lvl) * Z.OFFLINE.bacPerMin * min / 10) * 10 };
  }
  lastTouch.set(c.id, now); c.lastSeen = now;
  if (c.stall) closeStall(c, null); // sạp không giữ khi rời mạng
  return c.offline && c.offline.min >= Z.OFFLINE.minMin ? { offline: c.offline } : null;
}
function onLeave(c, io) { if (c.stall) closeStall(c, io); lastTouch.delete(c.id); c.lastSeen = Date.now(); }
function onMove(c, io) { if (c.stall) { closeStall(c, io); return 'Đã dọn sạp hàng.'; } return null; }
function questGate(c, q) { if (q && q.needAsc && !c.asc) return { ok: false, msg: `Cần Phi Thăng trước (cấp ${Z.ASCEND.lvl}, hoàn thành 81 nạn, chọn «Độ Tam Cửu Thiên Kiếp»).` }; return null; }
function mapGate(c, M) { if (M && M.asc && !c.asc) return 'Cõi này chỉ dành cho người đã Phi Thăng.'; return null; }

// trước khi cộng tu vi: nhân tu vi / bạc theo bang hội, Dị Tượng
function battleMul(c, b, res) {
  ensure(c);
  let m = 1, mb = 1;
  const g = c.guild && DBREF && DBREF.guilds[c.guild];
  if (g) m += Z.GUILD.perk(guildLv(g)).exp / 100;
  if (wevIs('songbao') && ['wild', 'boss', 'nightmare', 'dungeon'].includes(b.kind)) { m += 1; mb += 1; }
  if (wevIs('phuctinh')) mb += 0.5;
  if (b.kind === 'nightmare') { m += 0.2; mb += 0.5; }
  res.exp = Math.round(res.exp * m); res.bac = Math.round(res.bac * mb);
  if (m > 1.001) res.expMul = Math.round(m * 100) / 100;
}

// sau trận: đếm thành tựu, rơi Hồn Phách, phần thưởng Ác Mộng / Phó bản / Phi Thăng
function afterBattle(c, b, res, ctx) {
  ensure(c);
  const win = res.outcome === 'win';
  const enemies = b.units.filter((u) => u.side === 1);
  const add = (id, n = 1) => { if (n > 0 && L.addItem(c, id, n)) for (let i = 0; i < n; i++) res.items.push(id); };
  const luck = wevIs('phuctinh') ? 1.5 : 1;
  if (b.kind === 'arena') { track(c, 'arena', 1); if (win) track(c, 'arenaWin', 1); }
  for (const v of res.captured || []) { codexAdd(c, v.sid); track(c, 'catch', 1); const p = c.pets.find((x) => x.uid === v.uid); if (p && !p.tc) p.tc = rollTrait(); }
  if (!win) {
    if (b.kind === 'dungeon' || b.kind === 'trial') { res.run = { failed: true, stage: b.opts.stage }; c.run = null; }
    return;
  }
  if (b.kind === 'boss' && b.opts.bossId) {
    const mid = Object.keys(X.MOUNTS).find((k) => X.MOUNTS[k].boss === b.opts.bossId);
    if (mid && !(c.mounts || []).includes(mid)) { c.mounts = [...(c.mounts || []), mid]; res.mountGot = X.MOUNTS[mid].name; if (ctx && ctx.sys) ctx.sys(`${c.name} thuần phục được thú cưỡi thần ${X.MOUNTS[mid].name}!`); }
  }
  const kills = enemies.filter((e) => e.dead && !e.caught).length;
  if (['wild', 'boss', 'nightmare', 'dungeon', 'tower', 'peach'].includes(b.kind)) track(c, 'kill', kills);
  if (enemies.some((e) => e.boss) && b.kind !== 'world' && b.kind !== 'arena') track(c, 'boss', 1);
  if (b.kind === 'tower') track(c, 'tower', 1);
  // Tinh Anh
  for (const e of enemies) if (e.elite) { if (L.chance(0.18 * luck)) add('chan_linh'); if (L.chance(0.25 * luck)) add('van_hon'); }
  // Hồn Phách từ boss cốt truyện
  if (b.kind === 'boss' && own(Z.THAN, b.opts.bossId)) {
    const n = b.opts.quest ? 3 : L.chance(0.35 * luck) ? 1 : 0;
    add('hon_' + b.opts.bossId, n);
  }
  if (b.kind === 'boss' && D.BOSSES[b.opts.bossId] && D.BOSSES[b.opts.bossId].post && L.chance(0.3)) add('chan_linh');
  // Ác Mộng
  if (b.kind === 'nightmare') {
    const bid = b.opts.bossId, B = D.BOSSES[bid], lvl = Z.nightmareLvl(B);
    track(c, 'nm', 1);
    if (own(Z.THAN, bid)) add('hon_' + bid, L.rand(2, 4) + (luck > 1 ? 1 : 0));
    else if (L.chance(0.3 * luck)) add('van_hon', 1);
    if (L.chance(0.4 * luck)) add('chan_linh', 1);
    if (L.chance(0.5)) add(L.pick(['kim_khoang', 'tuyet_lien', 'linh_dan', 'tay_tam']), 1);
    const q = L.weighted([0, 0, 30, 45, 20, 5]);
    const eq = L.makeEquip(L.pick(D.SLOT_KEYS), lvl, q);
    if (L.addEquip(c, eq)) res.equips.push(eq);
    if (q >= 4) ctx.sys(`👁️ ${c.name} hạ Ác Mộng ${B.name}, nhận [${D.QUALITIES[q].name}] ${eq.name}!`);
  }
  // Phó bản / Phi Thăng nhiều chặng
  if ((b.kind === 'dungeon' || b.kind === 'trial') && c.run) {
    const r = c.run;
    r.stage++; r.at = Date.now();
    if (r.stage < r.total) {
      const label = b.kind === 'trial' ? `${Z.TRIAL[r.stage].name}: ${Z.TRIAL[r.stage].bossName}` : r.stage >= Z.DUNGEON.waves ? 'Boss phó bản' : `Đợt ${r.stage + 1}/${Z.DUNGEON.waves}`;
      res.run = { kind: r.kind, stage: r.stage, total: r.total, next: label };
    } else {
      c.run = null;
      if (b.kind === 'dungeon') {
        const dg = Z.DUNGEONS.find((d) => d.id === r.id), lvl = dungeonLvl(dg, c);
        track(c, 'dungeon', 1);
        for (const [k, n] of Object.entries(dg.drop)) { if (k === 'sach') { for (let i = 0; i < n; i++) add(L.pick(X.BOOKS)); } else add(k, n); }
        add('hon_' + dg.frag, L.rand(1, 3));
        for (let i = 0; i < 2; i++) { const q = L.weighted([0, 10, 45, 35, 10]); const eq = L.makeEquip(L.pick(D.SLOT_KEYS), lvl, q); if (L.addEquip(c, eq)) res.equips.push(eq); }
        const bonus = Math.round(L.expNeed(lvl) * 0.35);
        res.exp += bonus; res.ups = [...(res.ups || []), ...L.addExp(c, bonus)];
        res.run = { kind: 'dungeon', done: true, name: dg.name };
        ctx.sys(`🏯 ${c.name} chinh phục phó bản «${dg.name}»!`);
      } else {
        c.asc = 1; c.points += Z.ASCEND.points;
        const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp;
        res.run = { kind: 'trial', done: true, asc: true };
        add('chan_linh', 3);
        ctx.sys(`🌈 ${c.name} vượt Tam Cửu Thiên Kiếp – PHI THĂNG thành tiên! Giới hạn cấp mở tới ${D.CONFIG.maxLevel}.`);
        ctx.io.to('map:' + c.map).emit('map:gear', { id: c.id, gear: L.gearBrief(c) });
      }
    }
  }
}

module.exports = {
  ensure, statBonus, petBonus, rollTrait, pub, register, touch, onEnter, onLeave, onMove, questGate, mapGate, battleMul, afterBattle,
  encMul, decorateEnemies, worldEvent, titleOf, guildExp, guildLv, codexAdd, track, energy, closeStall,
  __makeNightmare: makeNightmare, __dungeonWave: dungeonWave, __dungeonBoss: dungeonBoss, __trialEnemies: trialEnemies,
};
