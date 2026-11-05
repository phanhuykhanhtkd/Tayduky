// Bot chơi hết cốt truyện (cần server đang chạy và một nhân vật đã được "buff" sẵn)
// node tools/story-test.js <user> <pass>
const URL = process.env.WS || 'ws://localhost:3000/ws';
let lastSend = 0;
const pace = (fn) => { const now = Date.now(), at = Math.max(now, lastSend + 45); lastSend = at; setTimeout(fn, at - now); }; // ~22 lệnh/giây như người thật
function client() {
  const ws = new WebSocket(URL); let n = 0; const wait = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.a != null) { wait.get(d.a)?.(d.d); wait.delete(d.a); } };
  const emit = (e, d) => new Promise((r, j) => { const i = ++n; wait.set(i, r); pace(() => ws.send(JSON.stringify({ e, d, i }))); setTimeout(() => j(new Error('timeout ' + e)), 8000); });
  return new Promise((r) => (ws.onopen = () => r({ ws, emit })));
}
(async () => {
  const [user, pass] = process.argv.slice(2);
  const { emit } = await client();
  const meta = (await emit('meta')).meta;
  let r = await emit('auth:login', { user, pass }); if (!r.ok) throw new Error(r.msg);
  let st = (await emit('enter')).state;
  const bfs = (mapId, from, goal) => {
    const M = meta.MAPS[mapId], npc = new Set(M.npcs.map((n) => n.x + ',' + n.y));
    const ok = (x, y) => M.tiles[y] && '.,P'.includes(M.tiles[y][x]) && !npc.has(x + ',' + y);
    const prev = new Map([[from + '', null]]), q = [from];
    while (q.length) { const [x, y] = q.shift(); if (goal(x, y) && !(x === from[0] && y === from[1])) { const out = []; let k = x + ',' + y; while (k && k !== from + '') { out.unshift(k.split(',').map(Number)); k = prev.get(k); } return out; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (!prev.has(key) && ok(nx, ny) && M.tiles[ny][nx] !== 'P') { prev.set(key, x + ',' + y); q.push([nx, ny]); } } }
    return null;
  };
  async function fight(b) { for (let i = 0; i < 80 && b; i++) { const foe = b.units.find((u) => u.side === 1 && !u.dead); const a = await emit('battle:act', { type: 'attack', target: foe?.id }); if (a.result) { st = a.state; return a.result; } b = a.snapshot; } }
  async function walk(route) { for (const [x, y] of route) { const m = await emit('move', { x, y }); if (!m.ok) return { fail: m.msg }; st.x = x; st.y = y; if (m.battle) { const res = await fight(m.battle); return { battle: res }; } } return {}; }
  const t0 = Date.now(); let steps = 0, lastQ = -1, stuck = 0;
  while (!st.quest.done && steps < 4000) {
    steps++;
    const q = st.quest;
    if (q.idx === lastQ) { if (++stuck > 400) throw new Error('kẹt ở bước ' + q.idx + ' ' + q.title); } else { stuck = 0; lastQ = q.idx; console.log(`[${q.idx}] Chương ${meta.MAPS[q.map].chapter} · ${q.no ? 'Nạn ' + q.no + ': ' : ''}${q.title}`); }
    if (st.map !== q.map) { r = await emit('map:travel', { map: q.map }); if (!r.ok) throw new Error('travel ' + r.msg); st = r.state; continue; }
    if (st.hp < st.derived.maxHp * 0.5) { const h = await emit('npc:talk', { id: '__' }); }
    if (q.type === 'kill') {
      const route = bfs(st.map, [st.x, st.y], (x, y) => meta.MAPS[st.map].tiles[y][x] === ',');
      await walk(route.slice(0, 1).concat(route.length > 1 ? [] : []));
      st = (await emit('enter')).state; continue;
    }
    const id = q.type === 'talk' ? q.npc : q.boss;
    const n = meta.MAPS[st.map].npcs.find((x) => x.id === id);
    if (Math.abs(n.x - st.x) + Math.abs(n.y - st.y) > 1) {
      const route = bfs(st.map, [st.x, st.y], (x, y) => Math.abs(x - n.x) + Math.abs(y - n.y) === 1);
      if (!route) throw new Error('không tới được ' + id);
      await walk(route); st = (await emit('enter')).state; continue;
    }
    r = await emit('npc:act', { id, opt: q.type === 'talk' ? 'quest' : 'fight' });
    if (!r.ok) throw new Error('act ' + id + ': ' + r.msg);
    if (r.battle) { const res = await fight(r.battle); if (res.outcome !== 'win') console.log('   boss thua, thử lại'); }
    st = (await emit('enter')).state;
    // hồi máu ở thầy thuốc gần nhất của bản đồ
    if (st.hp < st.derived.maxHp * 0.6) { const hn = meta.MAPS[st.map].npcs.find((x) => x.role === 'heal'); if (hn) { const route = bfs(st.map, [st.x, st.y], (x, y) => Math.abs(x - hn.x) + Math.abs(y - hn.y) === 1); if (route) await walk(route); await emit('npc:act', { id: hn.id, opt: 'heal' }); st = (await emit('enter')).state; } }
  }
  console.log(`XONG: ${st.quest.done ? 'đã thỉnh kinh' : 'chưa xong'} · nạn ${st.nan}/81 · cấp ${st.lvl} · mở chương ${st.unlocked} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  process.exit(st.quest.done && st.nan === 81 ? 0 : 1);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
