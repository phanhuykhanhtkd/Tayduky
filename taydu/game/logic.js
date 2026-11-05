// =====================================================================
//  LOGIC: chỉ số, cấp độ, hành trang, trang bị, tiên sủng, nhiệm vụ
// =====================================================================
const D = require('./data');

// ---------- tiện ích ngẫu nhiên ----------
const rand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const randf = (a, b) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function weighted(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return i; }
  return weights.length - 1;
}
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

// ---------- cấp độ ----------
const expNeed = (L) => Math.floor(35 * Math.pow(L, 1.65) + 25);

// ---------- trang bị ----------
function materialFor(lvl) {
  let m = D.MATERIALS[0][1];
  for (const [l, n] of D.MATERIALS) if (lvl >= l) m = n;
  return m;
}
function makeEquip(slot, lvl, q) {
  const S = D.SLOTS[slot];
  const Q = D.QUALITIES[q];
  const base = {};
  for (const [k, [a, b]] of Object.entries(S.stats)) {
    base[k] = Math.max(1, Math.round((a + b * lvl) * Q.mult * randf(0.93, 1.07) * 10) / 10);
    if (k !== 'crit') base[k] = Math.round(base[k]);
  }
  return { t: 'eq', uid: uid(), slot, lvl, q, name: `${materialFor(lvl)} ${pick(S.nouns)}`, base, plus: 0, gems: [] };
}
function makeUniqueStaff() {
  return {
    t: 'eq', uid: uid(), slot: 'vukhi', lvl: 30, q: 5, unique: true, name: 'Như Ý Kim Cô Bổng',
    base: { atk: 230, matk: 80, spd: 25, crit: 8 }, plus: 0, gems: [],
  };
}
function equipStats(it) {
  const out = {};
  const mul = 1 + 0.1 * (it.plus || 0);
  for (const [k, v] of Object.entries(it.base)) out[k] = k === 'crit' ? Math.round(v * mul * 10) / 10 : Math.round(v * mul);
  for (const g of it.gems || []) for (const [k, v] of Object.entries(D.ITEMS[g].gem)) out[k] = (out[k] || 0) + v;
  return out;
}
function equipPrice(it) { return Math.round((it.lvl * 12 + 20) * D.QUALITIES[it.q].mult * (1 + 0.15 * it.plus)); }

// ---------- nhân vật ----------
function createChar(id, user, name, race, gender) {
  const R = D.RACES[race];
  const c = {
    id, user, name, race, gender, lvl: 1, exp: 0, points: 0,
    stats: { ...R.base },
    hp: 0, mp: 0, bac: 300, vang: 5,
    map: 'ch1', x: D.MAPS.ch1.spawn[0], y: D.MAPS.ch1.spawn[1],
    equip: Object.fromEntries(D.SLOT_KEYS.map((s) => [s, null])),
    bag: [], pets: [], activePet: null,
    skills: [...R.skills], secretSkills: [],
    quest: 0, qprog: 0, nan: 0, unlocked: 1,
    secrets: {}, secretState: { thodia: 0 },
    daily: { date: today(), peach: 0, arena: 0, treasure: 0 },
    arena: 1000, guild: null, contrib: 0,
    spouse: null, master: null, disciples: [],
    kills: 0, createdAt: Date.now(), storyVer: 2,
  };
  c.equip.vukhi = makeEquip('vukhi', 1, 0);
  c.equip.giap = makeEquip('giap', 1, 0);
  addItem(c, 'hp_s', 5); addItem(c, 'mp_s', 3); addItem(c, 'bau_bac', 3);
  const s = calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp;
  return c;
}

function calcStats(c, spouseBonus = !!c.spouse) {
  const s = c.stats, L = c.lvl;
  const o = {
    maxHp: 80 + s.the * 12 + L * 15,
    maxMp: 40 + s.phap * 7 + L * 6,
    atk: 10 + s.luc * 2.4 + L * 2,
    matk: 10 + s.phap * 2.4 + L * 2,
    def: 5 + s.the * 1.3 + L * 1.2,
    mdef: 5 + s.phap * 0.9 + s.the * 0.4 + L,
    spd: 10 + s.nhanh * 1.6 + L * 0.8,
    dodge: Math.min(30, 2 + s.nhanh * 0.15),
    crit: 5,
  };
  for (const it of Object.values(c.equip)) {
    if (!it) continue;
    const e = equipStats(it);
    for (const [k, v] of Object.entries(e)) {
      const key = k === 'hp' ? 'maxHp' : k === 'mp' ? 'maxMp' : k;
      o[key] = (o[key] || 0) + v;
    }
  }
  if (spouseBonus) { o.maxHp *= 1.05; o.atk *= 1.05; o.matk *= 1.05; }
  for (const k of Object.keys(o)) o[k] = k === 'crit' || k === 'dodge' ? Math.round(o[k] * 10) / 10 : Math.round(o[k]);
  return o;
}

function power(c) {
  const s = calcStats(c);
  return Math.round(s.maxHp * 0.25 + s.maxMp * 0.1 + s.atk + s.matk + s.def + s.mdef + s.spd * 1.5);
}

function addExp(c, n) {
  const ups = [];
  if (c.lvl >= D.CONFIG.maxLevel) return ups;
  c.exp += Math.round(n);
  while (c.lvl < D.CONFIG.maxLevel && c.exp >= expNeed(c.lvl)) {
    c.exp -= expNeed(c.lvl);
    c.lvl++;
    c.points += D.CONFIG.pointsPerLevel;
    ups.push(c.lvl);
  }
  if (ups.length) { const s = calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp; }
  return ups;
}

function clampHpMp(c) {
  const s = calcStats(c);
  c.hp = Math.max(0, Math.min(c.hp, s.maxHp));
  c.mp = Math.max(0, Math.min(c.mp, s.maxMp));
}

function resetDaily(c) {
  const t = today();
  if (!c.daily || c.daily.date !== t) c.daily = { date: t, peach: 0, arena: 0, treasure: 0 };
}

// ---------- hành trang ----------
function countItem(c, id) { const s = c.bag.find((b) => b.t === 'item' && b.id === id); return s ? s.qty : 0; }
function bagUsed(c) { return c.bag.length; }
function addItem(c, id, qty = 1) {
  if (!D.ITEMS[id]) return false;
  const s = c.bag.find((b) => b.t === 'item' && b.id === id);
  if (s) { s.qty += qty; return true; }
  if (bagUsed(c) >= D.CONFIG.bagSize) return false;
  c.bag.push({ t: 'item', id, qty });
  return true;
}
function removeItem(c, id, qty = 1) {
  const i = c.bag.findIndex((b) => b.t === 'item' && b.id === id);
  if (i < 0 || c.bag[i].qty < qty) return false;
  c.bag[i].qty -= qty;
  if (c.bag[i].qty <= 0) c.bag.splice(i, 1);
  return true;
}
function addEquip(c, it) {
  if (bagUsed(c) >= D.CONFIG.bagSize) return false;
  c.bag.push(it); return true;
}

// ---------- tiên sủng / quái ----------
function beastStats(f, gradeMult, lvl, mut) {
  const gm = gradeMult * (mut ? 1.25 : 1);
  return {
    maxHp: Math.round((50 + lvl * 18) * f.hp * gm),
    maxMp: Math.round(40 + lvl * 5),
    atk: Math.round((12 + lvl * 3.8) * f.atk * gm),
    matk: Math.round((12 + lvl * 3.8) * f.matk * gm),
    def: Math.round((4 + lvl * 1.8) * f.def * gm),
    mdef: Math.round((4 + lvl * 1.6) * gm),
    spd: Math.round((8 + lvl * 1.5) * f.spd * Math.sqrt(gm)),
    dodge: Math.round(3 + f.spd * 3),
    crit: 5,
  };
}
function petStats(p) {
  const sp = D.getSpecies(p.sid);
  return beastStats(sp.f, D.GRADES[sp.grade].mult, p.lvl, p.mut);
}
function makePet(sid, lvl, mut) {
  const sp = D.getSpecies(sid);
  return { uid: uid(), sid, name: (mut ? 'Biến Dị ' : '') + sp.name, lvl: Math.max(1, lvl), exp: 0, mut: !!mut };
}
function petView(p) {
  const sp = D.getSpecies(p.sid);
  return {
    ...p, icon: sp.icon, element: sp.element, grade: sp.grade, species: sp.name,
    skills: sp.skills, stats: petStats(p), need: expNeed(p.lvl),
  };
}
function petAddExp(c, p, n) {
  const cap = c.lvl + 5;
  let up = 0;
  if (p.lvl >= cap) return 0;
  p.exp += Math.round(n);
  while (p.lvl < cap && p.exp >= expNeed(p.lvl)) { p.exp -= expNeed(p.lvl); p.lvl++; up++; }
  if (p.lvl >= cap) p.exp = 0;
  return up;
}

function makeMonster(sid, lvl, mut) {
  const sp = D.getSpecies(sid);
  const st = beastStats(sp.f, D.GRADES[sp.grade].mult, lvl, mut);
  return {
    kind: 'beast', sid, name: (mut ? 'Biến Dị ' : '') + sp.name, icon: sp.icon, element: sp.element,
    grade: sp.grade, mut: !!mut, lvl, ...st, skills: sp.skills, catchable: true,
  };
}
function makeHuman(hid, lvl) {
  const H = D.HUMANS[hid];
  const st = beastStats(H.f, 1, lvl, false);
  return { kind: 'human', hid, name: H.name, icon: H.icon, element: H.element, lvl, ...st, skills: [], catchable: false };
}
function makeBoss(bid) {
  const B = D.BOSSES[bid];
  const st = beastStats({ hp: 1, atk: 1, matk: 1, def: 1.15, spd: 1.05 }, 1.2, B.lv, false);
  st.maxHp = Math.round(st.maxHp * B.hpMul);
  st.atk = Math.round(st.atk * B.atkMul / 1.2);
  st.matk = Math.round(st.matk * B.atkMul / 1.2);
  const units = [{ kind: 'boss', bossId: bid, name: B.name, icon: B.icon, element: B.element, lvl: B.lv, ...st, skills: B.skills, catchable: false, boss: true }];
  for (const [hid, lv] of B.minions) units.push(makeHuman(hid, lv));
  return units;
}

function rollEncounter(mapId, charLvl) {
  const M = D.MAPS[mapId];
  const E = M.encounter;
  const n = rand(E.group[0], E.group[1]);
  const out = [];
  for (let i = 0; i < n; i++) {
    const lvl = Math.max(1, Math.min(M.lv[1], rand(Math.max(M.lv[0], charLvl - 3), Math.max(M.lv[0], charLvl + 1))));
    if (E.humans.length && chance(0.2)) { out.push(makeHuman(pick(E.humans), lvl)); continue; }
    let form = pick(E.forms);
    if (D.FORM_BY_ID[form].rare && !chance(0.25)) form = pick(E.forms.filter((f) => !D.FORM_BY_ID[f].rare));
    const g = weighted(E.grades);
    const sid = D.speciesId(form, pick(D.ELEMENT_KEYS), g);
    out.push(makeMonster(sid, lvl, chance(0.02)));
  }
  return out;
}

function rollDrops(enemies, mapLvl) {
  const drops = [];
  for (const e of enemies) {
    const g = (e.grade || 0) + (e.mut ? 1 : 0);
    if (chance(0.12)) drops.push({ id: pick(['hp_s', 'mp_s', 'hp_s']) });
    if (chance(0.06 + g * 0.02)) drops.push({ id: 'da_ch' });
    if (chance(0.025 + g * 0.01)) drops.push({ id: pick(D.GEM_IDS) });
    if (chance(0.03)) drops.push({ id: 'bau_bac' });
    if (chance(0.07 + g * 0.02)) {
      const q = Math.min(4, weighted([56, 28, 11, 4, 1]) + (g >= 3 ? 1 : 0));
      drops.push({ eq: makeEquip(pick(D.SLOT_KEYS), Math.max(1, e.lvl - rand(0, 2)), q) });
    }
    if (e.boss) {
      drops.push({ eq: makeEquip(pick(D.SLOT_KEYS), e.lvl, weighted([0, 0, 55, 35, 10])) });
      drops.push({ id: pick(D.GEM_IDS) }, { id: 'da_ch' }, { id: 'da_ch' });
    }
  }
  return drops;
}

// ---------- nhiệm vụ ----------
function questView(c) {
  const q = D.QUESTS[c.quest];
  if (!q) return { done: true, nan: c.nan };
  return { idx: c.quest, ...q, prog: c.qprog, nanTotal: c.nan };
}
function applyReward(c, r) {
  const res = { exp: r.exp || 0, bac: r.bac || 0, vang: r.vang || 0, items: r.items || {}, ups: [] };
  if (r.exp) res.ups = addExp(c, r.exp);
  c.bac += r.bac || 0; c.vang += r.vang || 0;
  for (const [id, n] of Object.entries(r.items || {})) addItem(c, id, n);
  if (r.unlock) c.unlocked = Math.max(c.unlocked, r.unlock);
  return res;
}
function completeQuestStep(c) {
  const q = D.QUESTS[c.quest];
  c.nan += q.nan;
  c.quest++; c.qprog = 0;
  const res = applyReward(c, q.reward);
  res.title = q.title; res.nan = q.nan; res.no = q.no;
  const nq = D.QUESTS[c.quest];
  if (nq && D.MAPS[nq.map].chapter > c.unlocked) { c.unlocked = D.MAPS[nq.map].chapter; res.unlocked = nq.map; res.unlockedName = D.MAPS[nq.map].name; }
  return res;
}

// ---------- trạng thái gửi client ----------
function publicChar(c, extra = {}) {
  resetDaily(c);
  const s = calcStats(c);
  return {
    id: c.id, name: c.name, race: c.race, gender: c.gender, lvl: c.lvl, exp: c.exp, need: expNeed(c.lvl), points: c.points,
    stats: c.stats, derived: s, hp: c.hp, mp: c.mp, bac: c.bac, vang: c.vang, map: c.map, x: c.x, y: c.y,
    equip: Object.fromEntries(Object.entries(c.equip).map(([k, v]) => [k, v ? { ...v, total: equipStats(v), price: equipPrice(v) } : null])),
    bag: c.bag.map((b) => (b.t === 'eq' ? { ...b, total: equipStats(b), price: equipPrice(b) } : b)),
    pets: c.pets.map(petView), activePet: c.activePet,
    skills: [...c.skills, ...(c.secretSkills || [])],
    quest: questView(c), nan: c.nan, unlocked: c.unlocked,
    secrets: c.secrets, daily: c.daily, arena: c.arena, guild: c.guild, contrib: c.contrib,
    spouse: c.spouse, master: c.master, disciples: c.disciples, power: power(c), kills: c.kills,
    peace: !!c.peace,
    secretHints: Object.fromEntries(Object.keys(D.SECRETS).filter((k) => c.secrets[k] || (c.secretState.rumors || {})[k]).map((k) => [k, D.SECRETS[k].hint])),
    ...extra,
  };
}

module.exports = {
  rand, randf, chance, pick, weighted, uid, today, expNeed,
  makeEquip, makeUniqueStaff, equipStats, equipPrice,
  createChar, calcStats, power, addExp, clampHpMp, resetDaily,
  countItem, addItem, removeItem, addEquip, bagUsed,
  beastStats, petStats, makePet, petView, petAddExp,
  makeMonster, makeHuman, makeBoss, rollEncounter, rollDrops,
  questView, applyReward, completeQuestStep, publicChar,
};
