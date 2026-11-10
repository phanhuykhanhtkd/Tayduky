// =====================================================================
//  KIỂM THỬ ĐỢT 2–6: Thần sủng · Hậu truyện · Ác Mộng · Phi Thăng · Mệnh ·
//  Tính cách · Khai thác · Sạp hàng · Thú cưỡi · Phúc lợi · Thành tựu ·
//  Tu Hành Lệnh · Phó bản · Đồ giám · Bang hội · Dị Tượng
//  Chạy máy chủ thử:  TDK_TEST=1 TDK_REG_LIMIT=1000 TDK_CONN_LIMIT=100 node server.js
//  rồi:               node tools/wave-test.js
// =====================================================================
const URL = process.env.WS || 'ws://localhost:3000/ws';
let pass = 0, fail = 0; const fails = [];
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log('  ✓', name); } else { fail++; fails.push(name); console.log('  ✗', name, extra); } };
function client() {
  const ws = new WebSocket(URL); let n = 0; const wait = new Map(), ev = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.a != null) { wait.get(d.a)?.(d.d); wait.delete(d.a); } else ev.push(d); };
  let lastAt = 0;
  const emit = async (e, d) => { const w = lastAt + 45 - Date.now(); lastAt = Math.max(Date.now(), lastAt + 45); if (w > 0) await new Promise((q) => setTimeout(q, w)); return emit0(e, d); };
  const emit0 = (e, d) => new Promise((r) => { const i = ++n; wait.set(i, r); ws.send(JSON.stringify({ e, d, i })); setTimeout(() => { if (wait.has(i)) { wait.delete(i); r({ ok: false, timeout: true }); } }, 8000); });
  return new Promise((r, j) => { ws.onopen = () => r({ ws, emit, ev }); ws.onerror = j; });
}
const T = Date.now().toString(36).slice(-5);
const nap = (ms) => new Promise((r) => setTimeout(r, ms));
async function player(tag, race = 'tien') {
  const A = await client();
  const u = (tag + T).toLowerCase().slice(0, 16);
  await A.emit('auth:register', { user: u, pass: '1234' });
  await A.emit('char:create', { name: (tag + T).slice(0, 12), race, gender: 'm' });
  const en = await A.emit('enter');
  return { ...A, st: en.state, en };
}

(async () => {
  // ------------------------------------------------------------------
  console.log('\n═══ A. Dữ liệu ═══');
  const D = require('../game/data'); require('../game/data2'); const Z = require('../game/data3');
  const L = require('../game/logic'); const F3 = require('../game/features3'); const { Battle } = require('../game/battle');
  ok(D.MAP_ORDER.length === 35 && D.NMAIN === 29, '35 bản đồ (29 chính + 6 hậu truyện)', D.MAP_ORDER.length);
  ok(D.QUESTS.length === 137 && D.STORY_END === 87, 'Giữ nguyên 137 nhiệm vụ, 87 bước chính truyện', D.QUESTS.length);
  { const bad = []; for (const id of D.MAP_ORDER) { const M = D.MAPS[id], occ = new Set(M.npcs.map((n) => n.x + ',' + n.y)), seen = new Set([M.spawn + '']), q = [M.spawn];
      const walk = (x, y) => M.tiles[y] && '.,P'.includes(M.tiles[y][x]) && !occ.has(x + ',' + y);
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && walk(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
      for (const n of M.npcs) if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((n.x + dx) + ',' + (n.y + dy)))) bad.push(id + ':' + n.id);
      const py = M.tiles.findIndex((r) => r.includes('P')); if (py >= 0 && !seen.has(M.tiles[py].indexOf('P') + ',' + py)) bad.push(id + ':cổng'); }
    ok(!bad.length, 'Mọi NPC và cổng ra trên 35 bản đồ đều đi tới được', bad.join(' ')); }
  ok(D.QUESTS.every((q) => q.type !== 'talk' || D.MAPS[q.map].npcs.some((n) => n.id === q.npc)), 'NPC của mọi nhiệm vụ trò chuyện có trên đúng bản đồ');
  ok(D.MAP_ORDER.every((id) => { const M = D.MAPS[id]; return M.npcs.every((n) => '.,'.includes(M.tiles[n.y][n.x]) || M.tiles[n.y][n.x] === 'P'); }), 'Mọi NPC đứng trên ô đi được');
  ok(D.QUESTS.slice(0, D.STORY_END).reduce((s, q) => s + q.nan, 0) === 81 && D.QUESTS.slice(D.STORY_END).every((q) => !q.nan), 'Đủ 81 nạn ở cốt truyện chính, hậu truyện không tính nạn');
  ok(D.MAPS.hondon.lv[1] === 160 && D.MAPS.namthien.asc && D.MAPS.hondon.asc && !D.MAPS.bonglai.asc, 'Hậu truyện tới cấp 160, 2 cõi cuối cần Phi Thăng');
  ok(Object.values(D.MAPS).every((m) => m.nodes.length >= 3 && m.nodes.every((n) => m.tiles[n.y][n.x] === '.')), 'Mỗi bản đồ có ≥3 điểm khai thác trên ô đất trống');
  ok(['daxoa', 'huyetha', 'aodieu', 'mato'].every((b) => D.BOSSES[b] && D.BOSSES[b].post) && D.BOSSES.mato.phases === 3, 'Boss hậu truyện có nhiều giai đoạn');
  const sp = D.getSpecies('than.nata.1');
  ok(sp && sp.than === 'nata' && sp.grade === 5 && sp.chan && sp.skills.includes('ts_nata2') && sp.look === 'nata', 'Loài Thần sủng ảo than.<mã>.<Chân>');
  ok(!D.getSpecies('than.khong.0') && !D.getSpecies('than.__proto__.0'), 'Mã Thần sủng lạ bị từ chối');
  ok(Object.keys(D.SKILLS).filter((k) => k.startsWith('ts_')).length === 24, '24 tuyệt kỹ Thần sủng');
  { const BS = require('../game/bossskills'); ok(Object.keys(BS.BOSS).every((b) => D.BOSSES[b] && BS.BOSS[b].sig.every((k) => D.SKILLS[k] && D.BOSSES[b].skills.includes(k))), 'Mọi boss chính truyện có chiêu đặc trưng'); ok(Object.values(D.BOSSES).filter((b) => b.map).every((b) => b.tier >= 0 && b.tier <= 4), 'Boss được xếp ải độ khó'); }

  // ------------------------------------------------------------------
  console.log('\n═══ B. Chiến đấu mới (trong tiến trình) ═══');
  {
    const ch = L.createChar('x1', 'u', 'ThuX', 'tien', 'm', 0); ch.lvl = 80; ch.menh = 'hoa';
    const boss = L.makeBoss('giaoma');
    const b = new Battle(ch, boss, { kind: 'boss' });
    ok(b.get('p').element === 'hoa', 'Nhân vật vào trận mang ngũ hành Mệnh');
    const bu = b.units.find((u) => u.boss); bu.hp = Math.round(bu.maxHp * 0.45);
    const evs = []; b.phaseCheck(evs);
    ok(evs.some((e) => e.k === 'phase' && e.n === 2) && bu.buffs.some((x) => x.key === 'enrage'), 'Boss qua 50% máu → Cuồng Nộ (giai đoạn 2)');
    const pet = L.makePet('than.ngoctho.1', 80, false); ch.pets.push(pet); L.teamAdd(ch, pet.uid);
    const b2 = new Battle(ch, [L.makeMonster('holy.kim.0', 70, false)], { kind: 'wild' });
    const pu = b2.units.find((u) => u.kind === 'pet');
    ok(pu.bossId === 'ngoctho' && pu.than === 'ngoctho' && pu.chan, 'Thần sủng ra trận dùng hình nhân vật cốt truyện');
    b2.get('p').hp = 10; pu.mp = 999;
    const ev = []; b2.exec(pu, { type: 'skill', skill: 'ts_ngoctho2', target: 'p' }, ev);
    ok(ev[0] && ev[0].hits.length >= 2 && b2.get('p').hp > 10, 'Quảng Hàn Hồi Xuân hồi máu cả đội');
    ok(pet.tc && Z.TRAITS[pet.tc], 'Tiên sủng mới có tính cách');
    const st0 = L.petStats({ sid: 'holy.kim.2', lvl: 50 }), st1 = L.petStats({ sid: 'holy.kim.2', lvl: 50, tc: 'dungmanh' });
    ok(st1.atk > st0.atk && st1.def < st0.def, 'Tính cách Dũng Mãnh: +công −thủ');
    // nhiều chặng Phi Thăng
    const c2 = L.createChar('x2', 'u', 'ThuY', 'phat', 'm', 0); c2.lvl = 120; c2.run = { kind: 'trial', id: 'asc', stage: 2, total: 3, at: Date.now() };
    const res = { outcome: 'win', items: [], equips: [], captured: [], ups: [], exp: 0 };
    F3.afterBattle(c2, { kind: 'trial', units: [], opts: { stage: 2 } }, res, { sys: () => {}, io: { to: () => ({ emit() {} }) } });
    ok(c2.asc === 1 && res.run.asc && L.levelCap(c2) === 160, 'Vượt chặng cuối Thiên Kiếp → Phi Thăng, mở cấp 160');
    const c3 = L.createChar('x3', 'u', 'ThuZ', 'yeu', 'm', 0); c3.lvl = 120; c3.exp = 0;
    L.addExp(c3, 1e9); ok(c3.lvl === 120, 'Chưa Phi Thăng thì dừng ở cấp 120');
    const s0 = L.calcStats(c3).atk; c3.asc = 1; ok(L.calcStats(c3).atk > s0, 'Phi Thăng tăng chỉ số');
    // bế quan
    const c4 = L.createChar('x4', 'u', 'ThuW', 'tien', 'm', 0); c4.lvl = 40; c4.lastSeen = Date.now() - 3 * 3600e3;
    const c5 = L.createChar('x5', 'u', 'ThuV', 'tien', 'm', 0); c5.quest = D.STORY_END; c5.unlocked = 15; c5.nan = 81;
    F3.ensure(c5); ok(c5.unlocked === D.MAPS.donghai.chapter, 'Nhân vật cũ đã xong 81 nạn được tự mở Hậu truyện (Đông Hải)', c5.unlocked);
    const off = F3.onEnter(c4); ok(off && off.offline.min >= 179 && off.offline.exp > 0, 'Bế quan 3 giờ có phần thưởng', off && off.offline.min);
  }

  // ------------------------------------------------------------------
  console.log('\n═══ C. Thần sủng & Tiên sủng ═══');
  const A = await player('wa');
  ok(A.st.energy === 100 && A.st.wev && A.st.badges3 && A.st.menh === null, 'Trạng thái có Tinh Lực, Dị Tượng, huy hiệu mới');
  let r = await A.emit('than:list');
  ok(r.ok && r.list.length === 12 && r.list[0].sig.name, 'Danh sách 12 Thần sủng kèm tuyệt kỹ');
  r = await A.emit('than:summon', { id: 'nata' }); ok(!r.ok, 'Thiếu Hồn Phách thì không triệu hồi được');
  await A.emit('test:give', { items: { hon_nata: 100, chan_linh: 5, van_hon: 3, tay_tam: 2 }, bac: 500000, lvl: 60 });
  r = await A.emit('than:summon', { id: 'nata' });
  const tp = r.state && r.state.pets.find((p) => p.than === 'nata');
  ok(r.ok && tp && tp.look === 'nata' && tp.grade === 3, 'Triệu hồi Thần sủng Na Tra (phẩm Thần)');
  r = await A.emit('than:summon', { id: 'nata' }); ok(!r.ok, 'Không triệu hồi trùng Thần sủng');
  r = await A.emit('than:chan', { uid: tp.uid }); ok(!r.ok && /cấp/.test(r.msg), 'Chân Hoá cần Thần sủng đủ cấp');
  await A.emit('test:give', { petLvl: 85, lvl: 90 });
  r = await A.emit('than:chan', { uid: tp.uid });
  ok(r.ok && r.pet.chan && r.pet.grade === 5 && r.pet.skills.includes('ts_nata2'), 'Chân Hoá → Chân Na Tra, tuyệt kỹ mới');
  r = await A.emit('pet:evolve', { uid: tp.uid }); ok(!r.ok, 'Thần sủng không dùng tiến hoá thường');
  r = await A.emit('market:sell', { kind: 'pet', uid: tp.uid, price: 10 }); ok(!r.ok, 'Thần sủng không bán được');
  r = await A.emit('than:convert', { id: 'honghai', n: 3 }); ok(r.ok && r.state.bag.find((b) => b.id === 'hon_honghai').qty === 3, 'Vạn Hồn Phách đổi thành Hồn Phách tuỳ chọn');
  const tc0 = r.state.pets[0].tc;
  r = await A.emit('pet:trait', { uid: tp.uid }); ok(r.ok && r.trait && r.trait !== tc0, 'Tẩy Tâm Đan đổi tính cách');

  // ------------------------------------------------------------------
  console.log('\n═══ D. Mệnh · Danh hiệu · Thành tựu ═══');
  const atk0 = r.state.derived.atk;
  r = await A.emit('menh:set', { el: 'kim' }); ok(r.ok && r.state.menh === 'kim' && r.state.derived.atk > atk0, 'Định Kim Mệnh: tăng công');
  const v0 = r.state.vang;
  r = await A.emit('menh:set', { el: 'thuy' }); ok(r.ok ? r.state.vang === v0 - 50 : /vàng/.test(r.msg), 'Đổi Mệnh tốn vàng');
  r = await A.emit('ach:list'); const lv10 = r.list.find((a) => a.id === 'lv10');
  ok(r.ok && lv10.done && !lv10.claimed, 'Thành tựu cấp 10 đã đạt');
  r = await A.emit('ach:claim', { id: 'lv10' }); ok(r.ok, 'Nhận thưởng thành tựu');
  r = await A.emit('ach:claim', { id: 'lv10' }); ok(!r.ok, 'Không nhận trùng thành tựu');
  r = await A.emit('ach:claim', { id: 'than1' }); ok(r.ok, 'Thành tựu Thần sủng đầu tiên');
  r = await A.emit('title:set', { id: 'dietyeu' }); ok(!r.ok, 'Không đeo được danh hiệu chưa có');

  // ------------------------------------------------------------------
  console.log('\n═══ E. Phúc lợi · Tu Hành Lệnh ═══');
  r = await A.emit('welfare:info'); ok(r.ok && r.newbie.list.length === 7 && r.online.list.length === 5, 'Thông tin phúc lợi');
  r = await A.emit('newbie:claim'); ok(r.ok, 'Nhận quà tân thủ ngày 1');
  r = await A.emit('newbie:claim'); ok(!r.ok, 'Mỗi ngày chỉ nhận 1 quà tân thủ');
  r = await A.emit('online:claim', { i: 0 }); ok(!r.ok, 'Chưa đủ phút online');
  await A.emit('test:give', { onl: 31 * 60 });
  r = await A.emit('online:claim', { i: 2 }); ok(r.ok, 'Nhận quà online 30 phút');
  r = await A.emit('pass:info'); ok(r.ok && r.rewards.length === 30 && r.daily.length >= 5, 'Tu Hành Lệnh 30 cấp, nhiệm vụ ngày');
  r = await A.emit('pass:task', { id: 'online' }); ok(r.ok, 'Nhiệm vụ Lệnh: online 30 phút');
  r = await A.emit('pass:task', { id: 'online' }); ok(!r.ok, 'Không nhận trùng nhiệm vụ Lệnh');
  await A.emit('test:give', { vang: 300 });
  r = await A.emit('pass:buy'); ok(r.ok, 'Mở Lệnh Chí Tôn');

  // ------------------------------------------------------------------
  console.log('\n═══ F. Khai thác · Thú cưỡi ═══');
  const node = (await A.emit('meta')).meta.MAPS.ch1.nodes[0];
  await A.emit('test:give', { map: 'ch1', x: node.x, y: node.y + (node.y < 19 ? 0 : 0), energy: 100 });
  r = await A.emit('gather:do', { node: node.id });
  ok(r.ok && r.got.length && r.state.energy === 92, 'Khai thác: nhận nguyên liệu, trừ Tinh Lực', r.msg);
  r = await A.emit('gather:do', { node: node.id }); ok(!r.ok && /hồi/.test(r.msg), 'Điểm khai thác có thời gian hồi');
  await A.emit('test:give', { x: 1, y: 1 });
  r = await A.emit('gather:do', { node: (await A.emit('meta')).meta.MAPS.ch1.nodes[1].id }); ok(!r.ok, 'Phải đứng gần điểm khai thác');
  await A.emit('test:give', { items: { thu_luong: 50 }, bac: 100000 });
  await A.emit('mount:buy', { id: 'bachma' });
  r = await A.emit('mount:up', { id: 'bachma' }); ok(r.ok && r.state.mountLv.bachma === 2, 'Nâng cấp thú cưỡi');
  r = await A.emit('mount3:list'); ok(r.ok && r.list.some((m) => m.id === 'aodieu') && r.list.some((m) => m.id === 'tuyetlang'), 'Có thú cưỡi Ảo Điểu, Tuyết Lang, Long Quy');

  // ------------------------------------------------------------------
  console.log('\n═══ G. Sạp hàng ═══');
  const B = await player('wb');
  await A.emit('test:give', { items: { hp_l: 5 }, map: 'ch1', x: 5, y: 17 });
  await B.emit('test:give', { bac: 5000, map: 'ch1', x: 6, y: 17 });
  r = await A.emit('stall:open', { title: 'Đan dược rẻ', items: [{ kind: 'item', id: 'hp_l', qty: 2, price: 300 }] });
  ok(r.ok && r.state.stall && r.state.stall.n === 1, 'Bày sạp hàng', r.msg);
  r = await B.emit('stall:view', { id: A.st.id }); ok(r.ok && r.items.length === 1 && r.title === 'Đan dược rẻ', 'Người khác xem sạp');
  const bac0 = (await A.emit('welfare:info')) && null;
  r = await B.emit('stall:buy', { id: A.st.id, i: 0 }); ok(r.ok && r.state.bag.some((b) => b.id === 'hp_l'), 'Mua hàng ở sạp');
  r = await B.emit('stall:buy', { id: A.st.id, i: 0 }); ok(!r.ok, 'Món đã bán không mua lại được');
  r = await A.emit('stall:open', { items: [{ kind: 'item', id: 'hp_l', qty: 999, price: 1 }] }); ok(!r.ok, 'Không bày quá số lượng đang có');

  // ------------------------------------------------------------------
  console.log('\n═══ H. Ác Mộng · Phi Thăng · Hậu truyện ═══');
  r = await A.emit('nm:fight', { boss: 'culinh' }); ok(!r.ok, 'Chưa qua boss thì không vào Ác Mộng');
  await A.emit('test:give', { quest: D.STORY_END, lvl: 120 });
  r = await A.emit('nm:list'); ok(r.ok && r.list.find((x) => x.id === 'culinh').beaten && r.left === 10, 'Danh sách Ác Mộng');
  r = await A.emit('nm:fight', { boss: 'culinh' });
  const nb = r.battle && r.battle.units.find((u) => u.boss);
  ok(r.ok && r.battle.kind === 'nightmare' && nb.nm && nb.phases === 3 && nb.lvl >= 62, 'Vào Ác Mộng Cự Linh Thần (3 giai đoạn)');
  for (let i = 0; i < 40 && r.battle && !r.result; i++) { const f = (r.snapshot || r.battle).units.find((u) => u.side === 1 && !u.dead); await nap(60); r = await A.emit('battle:act', { type: 'attack', target: f && f.id }); if (r.result) break; r.battle = r.snapshot; }
  ok(r.result, 'Trận Ác Mộng kết thúc');
  r = await A.emit('map:travel', { map: 'namthien' }); ok(!r.ok && /Phi Thăng/.test(r.msg), 'Chưa Phi Thăng không vào Nam Thiên Môn', r.msg);
  r = await A.emit('asc:info'); ok(r.ok && r.story && r.left === 3, 'Đủ điều kiện độ kiếp');
  r = await A.emit('asc:start'); ok(r.ok && r.battle.kind === 'trial' && r.state.run && r.state.run.kind === 'trial', 'Bắt đầu Tam Cửu Thiên Kiếp');
  for (let i = 0; i < 40 && !r.result; i++) { const s = r.snapshot || r.battle; const f = s.units.find((u) => u.side === 1 && !u.dead); await nap(60); r = await A.emit('battle:act', { type: 'attack', target: f && f.id }); }
  ok(r.result, 'Trận độ kiếp kết thúc', r.result && r.result.outcome);
  await A.emit('run:quit');
  await A.emit('test:give', { asc: 1, quest: D.QUESTS.findIndex((q) => q.map === 'namthien') });
  r = await A.emit('map:travel', { map: 'namthien' }); ok(r.ok, 'Đã Phi Thăng vào được Nam Thiên Môn');
  const gateQ = D.QUESTS.findIndex((q) => q.needAsc);
  ok(gateQ > D.STORY_END, 'Có bước nhiệm vụ chặn bởi Phi Thăng');

  // ------------------------------------------------------------------
  console.log('\n═══ I. Phó bản · Đồ giám · Bang hội · Dị Tượng ═══');
  await A.emit('test:give', { map: 'ch1', x: 5, y: 17 });
  r = await A.emit('dg:list'); ok(r.ok && r.list.length === 5, '5 phó bản');
  r = await A.emit('dg:enter', { id: 'bandao' }); ok(r.ok && r.battle.kind === 'dungeon' && r.state.run.total === 4, 'Vào phó bản Bàn Đào Yến Loạn');
  for (let i = 0; i < 40 && !r.result; i++) { const s = r.snapshot || r.battle; const f = s.units.find((u) => u.side === 1 && !u.dead); await nap(60); r = await A.emit('battle:act', { type: 'attack', target: f && f.id }); }
  ok(r.result && (r.result.outcome !== 'win' || (r.result.run && r.result.run.stage === 1)), 'Thắng đợt 1 → mở đợt 2', JSON.stringify(r.result && r.result.run));
  if (r.result && r.result.outcome === 'win') { r = await A.emit('run:next'); ok(r.ok && r.battle, 'Tiếp tục đợt kế'); for (let i = 0; i < 40 && !r.result; i++) { const s = r.snapshot || r.battle; await nap(60); r = await A.emit('battle:act', { type: 'flee' }); } }
  await A.emit('run:quit');
  r = await A.emit('codex:info'); ok(r.ok && r.forms.length === 28 && r.t.includes('nata'), 'Đồ giám ghi nhận Thần sủng');
  r = await A.emit('codex:claim', { n: 28 }); ok(!r.ok, 'Chưa đủ mốc Đồ giám');
  r = await A.emit('guild:create', { name: 'Ph' + T });
  r = await A.emit('guild3:info'); ok(r.ok && r.lv === 1, 'Thông tin cấp môn phái');
  await A.emit('test:give', { bac: 100000 });
  r = await A.emit('guild:donate'); ok(r.ok, 'Quyên góp môn phái');
  r = await A.emit('guild:gift'); ok(r.ok, 'Nhận quà môn phái');
  r = await A.emit('guild:gift'); ok(!r.ok, 'Quà môn phái 1 lần/ngày');
  r = await A.emit('wev:info'); ok(r.ok && r.ev && r.all.length === 4, 'Thiên Địa Dị Tượng luân phiên');
  r = await A.emit('than:list'); ok(r.ok, 'Còn hoạt động sau mọi thao tác');

  console.log(`\n══════════ KẾT QUẢ ĐỢT 2–6: ${pass} đạt · ${fail} lỗi ══════════`);
  if (fail) console.log('Lỗi:', fails.join(' | '));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('Kiểm thử dừng vì lỗi:', e); process.exit(2); });
