// =====================================================================
//  TÍNH NĂNG ĐỢT 1: điểm danh 7 ngày, nhiệm vụ hằng ngày, Trấn Yêu Tháp
// =====================================================================
const D = require('./data');
const L = require('./logic');
const fmtN = (n) => Number(n).toLocaleString('vi-VN');

// ---------- điểm danh 7 ngày (cộng dồn, lỡ ngày không mất chuỗi) ----------
const CHECKIN = [
  { day: 1, label: '300 bạc + 3 Kim Sang Dược', r: { bac: 300, items: { hp_s: 3 } } },
  { day: 2, label: '3 Bầu Bạc', r: { items: { bau_bac: 3 } } },
  { day: 3, label: '5 vàng', r: { vang: 5 } },
  { day: 4, label: '2 Đá Cường Hóa + 3 Hồi Linh Thủy', r: { items: { da_ch: 2, mp_s: 3 } } },
  { day: 5, label: '1 Bầu Vàng', r: { items: { bau_vang: 1 } } },
  { day: 6, label: '800 bạc + 1 Ngọc ngẫu nhiên', r: { bac: 800, gem: 1 } },
  { day: 7, label: '20 vàng + Trứng Biến Dị', r: { vang: 20, items: { trung_bd: 1 } }, big: true },
];

// ---------- nhiệm vụ hằng ngày: mỗi ngày 5 việc, giống nhau với mọi người ----------
const TASKS = [
  { id: 'kill', icon: '⚔️', name: 'Diệt yêu', desc: 'Đánh bại 15 yêu quái', key: 'kills', need: 15 },
  { id: 'catch', icon: '🏺', name: 'Thu phục', desc: 'Thu phục 1 Tiên sủng', key: 'catches', need: 1 },
  { id: 'arena', icon: '🏆', name: 'Luận võ', desc: 'Thắng 1 trận Tam Giới Đấu', key: 'arenaWins', need: 1 },
  { id: 'peach', icon: '🍑', name: 'Trộm đào', desc: 'Trộm Đào 2 lần ở Thiên Cung', key: 'peach', need: 2 },
  { id: 'treasure', icon: '🎁', name: 'Đoạt bảo', desc: 'Mở 1 rương Đoạt Bảo', key: 'treasure', need: 1 },
  { id: 'tower', icon: '🗼', name: 'Trấn Yêu Tháp', desc: 'Vượt 1 tầng tháp', key: 'towerWins', need: 1 },
  { id: 'boss', icon: '👹', name: 'Hàng ma', desc: 'Đánh bại 1 boss (cốt truyện hoặc tầng boss của tháp)', key: 'bossWins', need: 1 },
  { id: 'enhance', icon: '🔨', name: 'Rèn binh', desc: 'Cường hóa trang bị 1 lần', key: 'enhance', need: 1 },
];
const TASK_BY_ID = Object.fromEntries(TASKS.map((t) => [t.id, t]));
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function todaysTasks() {
  const d = L.today(), pool = TASKS.map((t) => t.id).filter((id) => id !== 'kill');
  let h = hashStr(d);
  const out = ['kill']; // luôn có "Diệt yêu"
  while (out.length < 5) { const i = h % pool.length; out.push(pool.splice(i, 1)[0]); h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; }
  return out;
}
const taskReward = (c) => ({ exp: Math.round(L.expNeed(c.lvl) * 0.12), bac: 100 + c.lvl * 20 });
const CHEST = { vang: 10, items: { bau_vang: 1, da_ch: 2 } };

// ---------- Trấn Yêu Tháp ----------
const TOWER = { failsPerDay: 5 };
const towerBossIds = () => Object.keys(D.BOSSES).filter((k) => k !== 'world');
function floorInfo(f) {
  const lvl = Math.min(99, 2 + Math.round(f * 1.3));
  const boss = f % 5 === 0;
  const count = boss ? 1 : f < 5 ? 1 : f < 15 ? 2 : 3;
  const bids = towerBossIds();
  const bid = boss ? bids[(f / 5 - 1) % bids.length] : null;
  const reward = { exp: Math.round(L.expNeed(lvl) * (boss ? 0.6 : 0.22)), bac: 40 + f * 15 };
  if (boss) { reward.vang = 2 + Math.floor(f / 10); reward.items = { da_ch: 1 + Math.floor(f / 20) }; }
  if (f % 10 === 0) reward.equip = Math.min(4, 1 + Math.floor(f / 20)); // phẩm chất trang bị
  return { floor: f, lvl, boss, count, bid, bossName: bid ? D.BOSSES[bid].name : null, bossIcon: bid ? D.BOSSES[bid].icon : null, reward };
}
function towerEnemies(f) {
  const fi = floorInfo(f), mult = 1 + f * 0.012;
  if (fi.boss) {
    const B = D.BOSSES[fi.bid];
    const st = L.beastStats({ hp: 1, atk: 1, matk: 1, def: 1.1, spd: 1.05 }, 1.15, fi.lvl, false);
    st.maxHp = Math.round(st.maxHp * (2.6 + f * 0.03)); st.hp = st.maxHp;
    return [{ kind: 'boss', bossId: fi.bid, name: B.name, icon: B.icon, element: B.element, lvl: fi.lvl, ...st, skills: B.skills, catchable: false, boss: true }];
  }
  const grade = Math.min(4, Math.floor(f / 12));
  const out = [];
  for (let i = 0; i < fi.count; i++) {
    const form = L.pick(D.FORMS.filter((x) => !x.rare));
    const m = L.makeMonster(D.speciesId(form.id, L.pick(D.ELEMENT_KEYS), grade), fi.lvl, false);
    for (const k of ['maxHp', 'atk', 'matk', 'def', 'mdef']) if (m[k]) m[k] = Math.round(m[k] * mult);
    m.hp = m.maxHp; m.catchable = false;
    out.push(m);
  }
  return out;
}

function rewardLabel(r) {
  const p = [];
  if (r.exp) p.push(`${fmtN(r.exp)} tu vi`);
  if (r.bac) p.push(`${fmtN(r.bac)} bạc`);
  if (r.vang) p.push(`${r.vang} vàng`);
  for (const [id, n] of Object.entries(r.items || {})) p.push(`${n} ${D.ITEMS[id].name}`);
  if (r.gem) p.push(`${r.gem} Ngọc`);
  if (r.equip) p.push(`Trang bị ${D.QUALITIES[r.equip].name}`);
  return p.join(' · ');
}

// trao thưởng → trả về tóm tắt để hiện cho người chơi
function grant(c, r) {
  const res = L.applyReward(c, { exp: r.exp, bac: r.bac, vang: r.vang, items: r.items });
  res.got = [];
  if (r.gem) { const g = L.pick(['ngoc_the', 'ngoc_luc', 'ngoc_phap', 'ngoc_toc', 'ngoc_khang']); L.addItem(c, g, r.gem); res.got.push(D.ITEMS[g].name); }
  if (r.equip) { const eq = L.makeEquip(L.pick(D.SLOT_KEYS), Math.max(1, c.lvl), r.equip); if (L.addEquip(c, eq)) res.got.push(eq.name); }
  return res;
}

function ensure(c) {
  if (!c.checkin) c.checkin = { n: 0, last: null };
  if (!c.tower) c.tower = { best: 0 };
  const d = c.daily;
  for (const k of ['kills', 'catches', 'arenaWins', 'bossWins', 'towerWins', 'towerFails', 'enhance']) d[k] = d[k] || 0;
  if (!d.claimed) d.claimed = [];
}

function dailyView(c) {
  ensure(c);
  const ids = todaysTasks(), rw = taskReward(c);
  const tasks = ids.map((id) => { const t = TASK_BY_ID[id]; const prog = Math.min(t.need, c.daily[t.key] || 0); return { ...t, prog, done: prog >= t.need, claimed: c.daily.claimed.includes(id), reward: rewardLabel(rw) }; });
  const canCheckin = c.checkin.last !== L.today();
  const nextDay = (c.checkin.n % 7) + 1;
  return {
    tasks, chest: { ready: tasks.every((t) => t.claimed), claimed: !!c.daily.chest, label: rewardLabel(CHEST) },
    checkin: { n: c.checkin.n, canClaim: canCheckin, nextDay, doneToday: !canCheckin, list: CHECKIN.map((x) => ({ day: x.day, label: x.label, big: !!x.big })) },
  };
}
function badge(c) {
  ensure(c);
  const v = dailyView(c);
  return v.checkin.canClaim || v.tasks.some((t) => t.done && !t.claimed) || (v.chest.ready && !v.chest.claimed);
}

// ---------- ghi nhận tiến độ từ kết quả trận ----------
function onBattleEnd(c, b, res) {
  ensure(c);
  const won = res.outcome === 'win';
  if (!won) { if (b.kind === 'tower') c.daily.towerFails++; return; }
  const enemies = b.units.filter((u) => u.side === 1);
  if (b.kind !== 'arena' && b.kind !== 'world') c.daily.kills += enemies.filter((e) => e.dead).length;
  c.daily.catches += b.captured.length;
  if (b.kind === 'arena') c.daily.arenaWins++;
  if (enemies.some((e) => e.boss) && b.kind !== 'world') c.daily.bossWins++;
  if (b.kind === 'tower') c.daily.towerWins++;
}

function towerView(c, top) {
  ensure(c);
  const f = c.tower.best + 1, fi = floorInfo(f);
  return {
    best: c.tower.best, floor: f, info: { ...fi, rewardLabel: rewardLabel(fi.reward) },
    next: [1, 2, 3, 4].map((k) => { const x = floorInfo(f + k); return { floor: x.floor, lvl: x.lvl, boss: x.boss, bossName: x.bossName, bossIcon: x.bossIcon }; }),
    failsLeft: Math.max(0, TOWER.failsPerDay - c.daily.towerFails), top,
  };
}

// ---------- đăng ký sự kiện ----------
function register(on, ctx) {
  const { notInBattle, startBattle, sys, db } = ctx;

  on('daily:info', true, (c) => ({ ok: true, daily: dailyView(c), noState: true }));
  on('daily:checkin', true, (c) => {
    ensure(c);
    if (c.checkin.last === L.today()) return { ok: false, msg: 'Hôm nay bạn đã điểm danh rồi.' };
    const day = (c.checkin.n % 7) + 1, item = CHECKIN[day - 1];
    c.checkin.n++; c.checkin.last = L.today();
    const res = grant(c, item.r);
    if (item.big) sys(`${c.name} điểm danh đủ 7 ngày, nhận Trứng Biến Dị!`);
    return { ok: true, day, label: item.label, res, daily: dailyView(c) };
  });
  on('daily:claim', true, (c, { id }) => {
    ensure(c);
    const t = Object.prototype.hasOwnProperty.call(TASK_BY_ID, id) ? TASK_BY_ID[id] : null;
    if (!t || !todaysTasks().includes(id)) return { ok: false, msg: 'Nhiệm vụ không tồn tại.' };
    if (c.daily.claimed.includes(id)) return { ok: false, msg: 'Đã nhận thưởng.' };
    if ((c.daily[t.key] || 0) < t.need) return { ok: false, msg: 'Chưa hoàn thành.' };
    c.daily.claimed.push(id);
    const res = grant(c, taskReward(c));
    return { ok: true, res, daily: dailyView(c) };
  });
  on('daily:chest', true, (c) => {
    const v = dailyView(c);
    if (!v.chest.ready) return { ok: false, msg: 'Hãy nhận thưởng đủ 5 nhiệm vụ trước.' };
    if (c.daily.chest) return { ok: false, msg: 'Hôm nay đã mở rương.' };
    c.daily.chest = true;
    return { ok: true, res: grant(c, CHEST), daily: dailyView(c) };
  });

  const towerTop = () => Object.values(db.chars).filter((x) => x.tower && x.tower.best > 0)
    .sort((a, b) => b.tower.best - a.tower.best || (a.tower.at || 0) - (b.tower.at || 0)).slice(0, 10)
    .map((x) => ({ id: x.id, name: x.name, race: x.race, gear: L.gearBrief(x), lvl: x.lvl, best: x.tower.best }));
  on('tower:info', true, (c) => ({ ok: true, tower: towerView(c, towerTop()), noState: true }));
  on('tower:fight', true, (c) => {
    const nb = notInBattle(c); if (nb) return nb;
    ensure(c);
    if (c.daily.towerFails >= TOWER.failsPerDay) return { ok: false, msg: 'Hôm nay đã hết lượt thất bại ở tháp. Mai quay lại nhé!' };
    const f = c.tower.best + 1;
    const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp; // vào tháp được hồi đầy
    return { ok: true, battle: startBattle(c, towerEnemies(f), { kind: 'tower', floor: f, canFlee: true, canCatch: false, maxRounds: 30 }) };
  });
}

// thưởng khi thắng 1 tầng (gọi từ finishBattle)
function towerWin(c, b, res, sys) {
  ensure(c);
  const f = b.opts.floor;
  if (f !== c.tower.best + 1) return;
  c.tower.best = f; c.tower.at = Date.now();
  const fi = floorInfo(f);
  const g = grant(c, fi.reward);
  res.exp = g.exp; res.bac = g.bac; res.vang = g.vang; res.ups = g.ups;
  res.items = Object.entries(fi.reward.items || {}).flatMap(([id, n]) => Array(n).fill(id));
  res.towerFloor = f; res.towerGot = g.got;
  if (f % 10 === 0) sys(`🗼 ${c.name} đã chinh phục tầng ${f} Trấn Yêu Tháp!`);
}

module.exports = { register, onBattleEnd, towerWin, badge, ensure, CHECKIN, TASKS, floorInfo };
