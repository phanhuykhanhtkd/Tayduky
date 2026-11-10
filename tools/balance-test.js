// Đo tỉ lệ thắng boss của "người chơi chuẩn" theo 5 ải (không cần server)
// node tools/balance-test.js [số trận mỗi boss=40] [lệch cấp=-2]   ·   V=1 để in từng boss
// Mô phỏng người chơi trung bình đánh từng boss, đo tỉ lệ thắng theo ải
// node balance.js [số trận mỗi boss] [lệch cấp] [chất lượng đồ]
const ROOT = require('path').join(__dirname, '..');
const D = require(ROOT + '/game/data.js'); require(ROOT + '/game/data3.js'); const L = require(ROOT + '/game/logic.js'); const { Battle } = require(ROOT + '/game/battle.js');
const N = +process.argv[2] || 40, dLv = +(process.argv[3] || -2), Q = +(process.argv[4] || 2);
const RACES = ['phat', 'tien', 'yeu'];
// hồ sơ người chơi chuẩn theo tiến trình: [số Tiên sủng, phẩm Tiên sủng, chất lượng đồ, số ô đồ]
const PROF = (m) => m <= 5 ? [1, 0, 0, 4] : m <= 13 ? [2, 0, 1, 6] : m <= 21 ? [2, 1, 1, 8] : m <= 29 ? [3, 1, 2, 8] : [3, 1, 2, 8];
function mkChar(lv, race, mapIdx) {
  const [NP, PG, QQ, NS] = PROF(mapIdx || 1);
  const c = L.createChar('x' + Math.random(), 'x', 'Bot', race, 'f', 3); L.migrateChar(c);
  c.lvl = Math.min(lv, L.levelCap ? L.levelCap(c) : lv);
  const pts = (c.lvl - 1) * 5;
  if (race === 'tien') { c.stats.phap += Math.round(pts * 0.6); c.stats.the += Math.round(pts * 0.4); } else { c.stats.luc += Math.round(pts * 0.6); c.stats.the += Math.round(pts * 0.4); }
  D.SLOT_KEYS.forEach((s, i) => { c.equip[s] = i < NS ? L.makeEquip(s, c.lvl, QQ) : null; });
  const forms = D.MAPS[D.MAP_ORDER[0]].encounter.forms; const els = D.ELEMENT_KEYS;
  c.pets = []; c.activePets = [];
  const pool = ['hoyeu', 'holy', 'langyeu', 'kylan', 'tienhac', 'hachung', 'suvuong', 'phuong'];
  const PL = 3;
  for (let i = 0; i < NP; i++) { const p = L.makePet(D.speciesId(pool[(Math.random() * pool.length) | 0], els[(Math.random() * 5) | 0], PG + (Math.random() < 0.4 ? 1 : 0)), Math.max(1, c.lvl - PL)); c.pets.push(p); c.activePets.push(p.uid); }
  c.bag = []; L.addItem(c, c.lvl < 20 ? 'hp_m' : 'hp_l', 8); L.addItem(c, 'mp_m', 5);
  const s = L.calcStats(c); c.hp = s.maxHp; c.mp = s.maxMp;
  return c;
}
function playerAct(b, c) {
  const me = b.get('p'), foes = b.alive(1);
  const hpItem = c.lvl < 20 ? 'hp_m' : 'hp_l';
  if (me.hp / me.maxHp < 0.35 && L.countItem(c, hpItem) > 0) return { type: 'item', item: hpItem, target: 'p' };
  if (me.mark > 0 && me.mark === 1) return { type: 'defend' };
  const sk = me.seal > 0 ? [] : me.skills.map((k) => [k, D.SKILLS[k]]).filter(([, s]) => s && (s.mp || 0) <= me.mp);
  const heal = sk.find(([, s]) => s.type === 'heal');
  const low = b.alive(0).filter((u) => u.hp / u.maxHp < 0.4)[0];
  if (heal && low && Math.random() < 0.6) return { type: 'skill', skill: heal[0], target: low.id };
  const off = sk.filter(([, s]) => s.type === 'magic' || s.type === 'phys').sort((x, y) => (y[1].power || 1) * (y[1].target === 'allEnemy' && foes.length > 1 ? foes.length * 0.8 : 1) - (x[1].power || 1) * (x[1].target === 'allEnemy' && foes.length > 1 ? foes.length * 0.8 : 1));
  const boss = foes.find((u) => u.boss) || foes[0];
  if (off.length && Math.random() < 0.75) return { type: 'skill', skill: off[0][0], target: boss.id };
  if (me.mp < me.maxMp * 0.2 && L.countItem(c, 'mp_m') > 0) return { type: 'item', item: 'mp_m', target: 'p' };
  return { type: 'attack', target: boss.id };
}
const res = {};
for (const [bid, B] of Object.entries(D.BOSSES)) {
  if (!B.map) continue;
  let w = 0, rounds = 0;
  for (let k = 0; k < N; k++) {
    const c = mkChar(B.lv + dLv, RACES[k % 3], D.MAP_ORDER.indexOf(B.map) + 1);
    c.quest = Math.max(0, D.QUESTS.findIndex((q) => q.boss === bid));
    const b = new Battle(c, L.makeBoss(bid), { kind: 'boss', bossId: bid, assist: B.post ? [] : require(ROOT + '/game/companions').assistFor(c) });
    for (let i = 0; i < 40 && !b.over; i++) b.doRound(playerAct(b, c));
    if (b.result && b.result.outcome === 'win') w++; rounds += b.round;
  }
  res[bid] = { w: w / N, r: rounds / N, tier: B.tier, map: D.MAP_ORDER.indexOf(B.map) + 1, lv: B.lv };
}
const byTier = {};
for (const [bid, r] of Object.entries(res)) { (byTier[r.tier] = byTier[r.tier] || []).push(r.w); }
for (const [t, a] of Object.entries(byTier)) console.log('tier', t, 'avg win', (a.reduce((x, y) => x + y, 0) / a.length * 100).toFixed(0) + '%', 'n', a.length);
if (process.env.V) for (const [bid, r] of Object.entries(res)) console.log(bid.padEnd(13), 'map', String(r.map).padStart(2), 'lv', r.lv, 'win', (r.w * 100).toFixed(0).padStart(3) + '%', 'rounds', r.r.toFixed(1));
if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, JSON.stringify(res));
