// Kiểm tra nhanh máy chủ: node tools/smoke-test.js  (server phải đang chạy)
const URL = process.env.WS || 'ws://localhost:3000/ws';
function client() {
  const ws = new WebSocket(URL); let n = 0; const wait = new Map(); const ev = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.a != null) { wait.get(d.a)?.(d.d); wait.delete(d.a); } else ev.push(d); };
  const emit = (e, d) => new Promise((r, j) => { const i = ++n; wait.set(i, r); ws.send(JSON.stringify({ e, d, i })); setTimeout(() => j(new Error('timeout ' + e)), 5000); });
  return new Promise((r) => (ws.onopen = () => r({ ws, emit, ev })));
}
const must = (r, what) => { if (!r.ok) throw new Error(what + ': ' + r.msg); return r; };
async function fight(emit, battle) {
  let last, rounds = 0;
  while (battle && rounds < 60) {
    const foe = battle.units.find((u) => u.side === 1 && !u.dead);
    const sk = battle.skills.find((k) => k !== 'tien_lo');
    last = must(await emit('battle:act', sk && rounds % 2 ? { type: 'skill', skill: sk, target: foe?.id } : { type: 'attack', target: foe?.id }), 'act');
    rounds++;
    if (last.result) return { res: last.result, rounds, state: last.state };
    battle = last.snapshot;
  }
}
(async () => {
  const { emit, ev, ws } = await client();
  const u = 'test' + Date.now().toString(36).slice(-5);
  must(await emit('meta'), 'meta');
  must(await emit('auth:register', { user: u, pass: '1234' }), 'register');
  must(await emit('char:create', { name: 'Tester' + u.slice(-4), race: 'ma', gender: 'm' }), 'create');
  let r = must(await emit('enter'), 'enter');
  let st = r.state; console.log('enter ok', st.name, 'lv', st.lvl, 'hp', st.hp, 'map', st.map, st.x, st.y, 'quest', st.quest.title);
  r = must(await emit('npc:talk', { id: 'thaibach' }), 'talk'); console.log('dialog opts', r.dialog.options.map(o => o.id));
  r = must(await emit('npc:act', { id: 'thaibach', opt: 'quest' }), 'quest'); console.log('quest done ->', r.state.quest.title, 'nan', r.state.nan);
  const meta = (await emit('meta')).meta;
  function bfs(mapId, from, goalFn) {
    const M = meta.MAPS[mapId], npc = new Set(M.npcs.map(n => n.x + ',' + n.y));
    const ok = (x, y) => M.tiles[y] && '.,'.includes(M.tiles[y][x]) && !npc.has(x + ',' + y);
    const prev = new Map([[from + '', null]]); const q = [from];
    while (q.length) { const [x, y] = q.shift(); if (goalFn(x, y) && (x !== from[0] || y !== from[1])) { const out = []; let k = x + ',' + y; while (k && k !== from + '') { out.unshift(k.split(',').map(Number)); k = prev.get(k); } return out; }
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (!prev.has(key) && ok(nx, ny)) { prev.set(key, x + ',' + y); q.push([nx, ny]); } } }
    return [];
  }
  let wins = 0, battles = 0, caught = 0, steps = 0;
  while (battles < 10 && steps < 600) {
    const grass = (x, y) => meta.MAPS[st.map].tiles[y][x] === ',';
    const route = bfs(st.map, [st.x, st.y], grass);
    for (const [x, y] of route) {
      steps++;
      const m = await emit('move', { x, y });
      if (!m.ok) { console.log('move fail', x, y, m.msg); break; }
      st.x = x; st.y = y;
      if (m.battle) {
        battles++;
        let snap = m.battle, done = null;
        const foe = snap.units.find((u) => u.side === 1 && u.catchable);
        if (foe && battles % 2) {
          for (let t = 0; t < 2 && !done; t++) { const c = must(await emit('battle:act', { type: 'catch', item: 'bau_bac', target: foe.id }), 'catch'); const ce = c.events.find(e => e.k === 'catch'); if (ce) console.log('  catch rate', ce.rate + '%', ce.ok ? 'OK' : 'miss'); if (ce?.ok) caught++; if (c.result) done = { res: c.result, rounds: 1, state: c.state }; else snap = c.snapshot; if (ce?.ok) break; }
        }
        const f = done || await fight(emit, snap);
        if (f.res.outcome === 'win') wins++;
        console.log(' battle', battles, f.res.outcome, 'rounds', f.rounds, 'exp', f.res.exp, 'bac', f.res.bac, 'items', f.res.items.join('/'), 'eq', f.res.equips.length, 'cap', f.res.captured.map(p => p.name).join(','), f.res.quest ? 'QUEST:' + f.res.quest.title : '', 'hp', f.state.hp + '/' + f.state.derived.maxHp);
        st = f.state;
        if (st.hp < st.derived.maxHp * 0.5) { const u2 = await emit('item:use', { id: 'hp_s' }); if (u2.ok) st = u2.state; }
        break;
      }
    }
    if (!route.length) break;
  }
  r = must(await emit('enter'), 'enter'); st = r.state;
  console.log('after: lv', st.lvl, 'exp', st.exp + '/' + st.need, 'pts', st.points, 'hp', st.hp + '/' + st.derived.maxHp, 'bac', st.bac, 'pets', st.pets.length, 'caught', caught, 'quest', st.quest.title, st.quest.prog);
  must(await emit('stat:alloc', { luc: st.points }), 'alloc');
  r = must(await emit('shop:list'), 'shop'); console.log('shop items', r.shop.length);
  must(await emit('shop:buy', { kind: 'item', id: 'da_ch', qty: 2 }), 'buy');
  r = must(await emit('item:enhance', { uid: st.equip.vukhi.uid }), 'enhance'); console.log('enhance:', r.msg);
  r = await emit('act:dice', { pick: 'tai', bet: 10 }); console.log('dice', r.dice, r.res, r.won);
  r = await emit('act:rps', { choice: 'bua', bet: 10 }); console.log('rps', r.npc, r.outcome);
  r = await emit('act:treasure', { box: 1 }); console.log('treasure', r.msg);
  r = await emit('act:peach', { tree: 3 }); console.log('peach', r.ok, r.msg, r.outcome);
  if (r.battle) { const f = await fight(emit, r.battle); console.log(' peach fight', f.res.outcome); }
  r = must(await emit('arena:list'), 'arena'); console.log('arena opponents', r.list.map(o => o.name + ' L' + o.lvl).join(', '));
  r = must(await emit('arena:fight', { id: r.list[r.list.length - 1].id }), 'arena fight');
  let f = await fight(emit, r.battle); console.log(' arena', f.res.outcome, 'rounds', f.rounds, 'arena pts', f.state.arena);
  r = await emit('chat:send', { ch: 'khu', text: 'Xin chào Tam Giới!' }); console.log('chat', r.ok, ev.filter(e => e.e === 'chat').length, 'chat events');
  r = await emit('guild:create', { name: 'Phái ' + u.slice(-3) }); console.log('guild create', r.ok, r.msg || '');
  r = await emit('rank:list', { type: 'power' }); console.log('rank', r.list.slice(0, 3).map(x => x.name + ':' + x.v));
  const cl = meta.MAPS.ch1.npcs.find(n => n.id === 'culinh');
  st = (await emit('enter')).state;
  for (const [x, y] of bfs('ch1', [st.x, st.y], (x, y) => Math.abs(x - cl.x) + Math.abs(y - cl.y) === 1)) { const m = await emit('move', { x, y }); if (m.battle) await fight(emit, m.battle); }
  await emit('char:peace');
  r = must(await emit('npc:talk', { id: 'culinh' }), 'boss talk'); console.log('boss talk', r.dialog.text.slice(0, 40), r.dialog.options);
  for (const id of ['duocsu1']) {}
  r = must(await emit('npc:act', { id: 'culinh', opt: 'fight' }), 'boss fight');
  console.log('boss units', r.battle.units.map(u => u.name + ' ' + u.hp).join(' | '));
  f = await fight(emit, r.battle); console.log(' BOSS', f.res.outcome, 'rounds', f.rounds, 'exp', f.res.exp, 'eq', f.res.equips.map(e => e.name), f.res.quest ? 'QUEST→' + f.state.quest.title + ' nan ' + f.state.nan : '');
  console.log('events received:', [...new Set(ev.map(e => e.e))].join(','));
  console.log('SUMMARY battles', battles, 'wins', wins);
  ws.close(); process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
