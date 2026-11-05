// =====================================================================
//  MÀN CHIẾN ĐẤU: phông cảnh theo chương, bàn cờ chéo, pháp trận,
//  thanh thứ tự ra đòn, hiệu ứng hạt, âm thanh, màn mở đầu & tổng kết
// =====================================================================
const BattleUI = (() => {
  const root = $('#battle'), stage = $('#b-stage'), box = $('#b-units');
  let snap = null, busy = false, mode = null, auto = false, onEnd = null, theme = 'city';
  const els = {};
  const SLOT = { 1: [[36, 55], [18, 71], [58, 40], [16, 42]], 0: [[72, 88], [42, 91], [90, 74], [20, 82], [55, 77]] };
  FX.attach($('#b-fx'), $('#b-fx-under'), [stage, $('#b-bg')]);
  const ECOL = { thunder: '#9fd8ff', fire: '#ff8a2a', ice: '#bff0ff', poison: '#c88aff', heal: '#7cf09a', gold: '#ffd65a', wind: '#9ff0d8', rock: '#e0b07a', shadow: '#b07af0', rage: '#ff5a2a', slash: '#fff0c8', hit: '#fff0c8' };

  const FX_SOUND = { thunder: 'thunder', fire: 'fire', ice: 'ice', poison: 'poison', heal: 'heal', gold: 'gold', wind: 'wind', rock: 'rock', shadow: 'shadow', rage: 'rage', slash: 'slash', hit: 'hit' };
  const RANGED = new Set(['fire', 'ice', 'poison', 'shadow', 'gold', 'wind']);

  // ---------- bắt đầu ----------
  async function start(s, opts = {}) {
    snap = s; onEnd = opts.onEnd; busy = true; mode = null;
    theme = s.kind === 'arena' || s.kind === 'tower' ? 'arena' : s.kind === 'world' ? 'world' : (G.meta.MAPS[G.me.map]?.theme || 'city');
    root.className = theme;
    $('#b-bg').style.backgroundImage = `url("${Sprites.battleBG(theme)}")`;
    const bd = $('.b-board', root); if (bd && typeof Tiles !== 'undefined') bd.style.setProperty('--tex', `url("${Tiles.boardTex(theme)}")`);
    root.hidden = false;
    closePick();
    $('#b-log').textContent = s.kind === 'boss' ? 'Trận chiến với boss – không thể bỏ chạy!' : s.kind === 'arena' ? 'Tam Giới Đấu bắt đầu!' : s.kind === 'world' ? `Đánh ${s.maxRounds} hiệp, sát thương cộng dồn vào boss chung.` : s.kind === 'tower' ? 'Trấn Yêu Tháp – vượt tầng này để đi tiếp!' : 'Yêu quái xuất hiện!';
    render();
    FX.resize(); FX.clear(); FX.ambient(theme);
    root.classList.remove('dim', 'defeat');
    $('#b-cmds').classList.add('wait');
    const boss = s.units.find((u) => u.boss);
    Sound.ambient(null);
    Sound.play(boss || s.kind === 'arena' || s.kind === 'tower' ? 'boss' : 'battle');
    Sound.sfx('gong');
    if (boss) { setTimeout(() => { Sound.sfx('roar'); FX.shake(14, 700); FX.flash('#8a0a0a', 22, 0.35); const p = rectOf(boss.id); if (p) { FX.shock(p.x, p.y + 50, '#ff5a3a', 160, 36); FX.impact('rage', p); } }, 380); }
    await intro(boss ? boss.name : s.kind === 'arena' ? 'Tam Giới Đấu' : s.kind === 'tower' ? 'Trấn Yêu Tháp' : 'Khai Chiến', !!boss);
    Tut.event('battle');
    ready();
    if (auto) setTimeout(autoAct, 400);
  }

  function intro(text, isBoss) {
    const el = $('#b-intro');
    el.innerHTML = `<div class="brush ${isBoss ? 'boss' : ''}"><span>${esc(text)}</span></div>`;
    el.hidden = false;
    $$('.unit', box).forEach((u, i) => { u.classList.add('enter'); u.style.animationDelay = i * 70 + 'ms'; });
    return sleep(1150).then(() => { el.hidden = true; $$('.unit', box).forEach((u) => u.classList.remove('enter')); });
  }

  function creatureHTML(u) { return Sprites.unitImg(u, '', baseExpr(u)); }
  // ---------- cảm xúc nhân vật: thở, chớp mắt, vui/giận/đau/vận công ----------
  const exprT = {};
  function baseExpr(u) { if (!u) return 'calm'; if (u.dead) return 'hurt'; if (u.boss) return 'angry'; return u.hp / (u.maxHp || 1) < 0.25 ? 'hurt' : 'calm'; }
  function setExpr(id, expr, ms) {
    const el = els[id], u = unit(id); if (!el || !u) return;
    const img = el.querySelector('.spr img.px.hum'); if (!img) return;
    const a = Art.unit(u, 0, expr); if (a && img.getAttribute('src') !== a.url) img.src = a.url;
    clearTimeout(exprT[id]);
    if (ms) exprT[id] = setTimeout(() => setExpr(id, baseExpr(unit(id))), ms);
  }
  let blinkT = null;
  function blinkLoop() {
    clearTimeout(blinkT);
    blinkT = setTimeout(() => {
      if (root.hidden || !snap) return;
      const alive = snap.units.filter((u) => !u.dead && els[u.id] && !exprT[u.id + 'b'] && baseExpr(u) === 'calm');
      const u = alive[Math.floor(Math.random() * alive.length)];
      if (u && !els[u.id].classList.contains('cast')) setExpr(u.id, 'blink', 150);
      blinkLoop();
    }, 900 + Math.random() * 1600);
  }

  function render() {
    box.innerHTML = '';
    for (const k in els) delete els[k];
    const idx = { 0: 0, 1: 0 };
    const order = [...snap.units].sort((a, b) => (a.id === 'p' ? -1 : b.id === 'p' ? 1 : 0));
    for (const u of order) {
      const pos = SLOT[u.side][idx[u.side]++ % SLOT[u.side].length];
      const el = document.createElement('div');
      el.className = `unit side${u.side}` + (u.boss ? ' boss' : '') + (u.mut ? ' mut' : '') + (u.dead ? ' dead' : '') + (u.hero ? ' is-hero' : '');
      el.style.left = pos[0] + '%'; el.style.top = `calc(${pos[1]}% - ${u.boss ? 176 : 146}px)`;
      el.style.zIndex = Math.round(pos[1]);
      const ring = u.side === 0 ? '#7fd6b7' : u.boss ? '#ff5a3a' : (G.meta.ELEMENTS[u.element]?.color || '#ffd65a');
      const gcol = u.grade != null && u.side === 1 && !u.boss ? G.meta.GRADES[u.grade].color : null;
      el.innerHTML = `<div class="circle" style="background-image:url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(Sprites.circle(ring))}')"></div>
        <div class="spr">${creatureHTML(u)}</div><span class="st"></span>
        <div class="plate">${gcol ? `<i class="gdot" style="background:${gcol}"></i>` : ''}<b>${esc(u.name)}</b><em>${u.lvl}</em></div>
        <div class="ub"><div class="bar hp"><i></i></div>${u.side === 0 ? '<div class="bar mp"><i></i></div>' : ''}</div>`;
      el.onclick = () => tapUnit(u.id);
      box.appendChild(el);
      els[u.id] = el;
    }
    sync(snap);
    blinkLoop();
  }

  function sync(s) {
    snap = s;
    for (const u of s.units) {
      const el = els[u.id]; if (!el) continue;
      setBars(u.id, u.hp, u.maxHp, u.mp, u.maxMp);
      el.classList.toggle('dead', u.dead && !el.classList.contains('caught'));
      el.querySelector('.st').textContent = (u.stun ? '💫' : '') + (u.poison ? '☠️' : '') + (u.buffs.length ? '✨' : '');
    }
    $('#b-round').innerHTML = `<small>Hiệp</small>${s.round + 1}${s.maxRounds ? `<small>/${s.maxRounds}</small>` : ''}`;
    const boss = s.units.find((u) => u.boss);
    $('#b-boss').hidden = !boss;
    if (boss) {
      $('#b-boss-name').textContent = boss.name;
      $('#b-boss-hp').style.width = (100 * boss.hp / boss.maxHp) + '%';
      $('#b-boss-t').textContent = `${fmt(boss.hp)} / ${fmt(boss.maxHp)}`;
    }
    $('[data-c="flee"]').disabled = !s.canFlee;
    $('[data-c="catch"]').disabled = !s.canCatch;
    turnBar();
  }

  function turnBar(active) {
    const list = snap.units.filter((u) => !u.dead).sort((a, b) => (b.spd || 0) - (a.spd || 0));
    $('#b-turns').innerHTML = list.map((u) => `<span class="tb s${u.side} ${u.id === active ? 'on' : ''}">${Sprites.unitImg(u)}</span>`).join('');
  }

  function setBars(id, hp, maxHp, mp, maxMp) {
    const el = els[id]; if (!el) return;
    const u = snap.units.find((x) => x.id === id); if (u) { u.hp = hp; if (mp != null) u.mp = mp; }
    el.querySelector('.bar.hp i').style.width = Math.max(0, 100 * hp / maxHp) + '%';
    const m = el.querySelector('.bar.mp i'); if (m && maxMp) m.style.width = Math.max(0, 100 * mp / maxMp) + '%';
    if (id === 'p') G.patchHud({ hp, mp });
    if (u && u.boss) { $('#b-boss-hp').style.width = Math.max(0, 100 * hp / maxHp) + '%'; $('#b-boss-t').textContent = `${fmt(hp)} / ${fmt(maxHp)}`; }
  }

  const unit = (id) => snap.units.find((u) => u.id === id);
  let timer = null, left = 0;
  const TURN = 30;
  // vòng lệnh hình thoi bao quanh nhân vật của người chơi
  const RING = { attack: 180, skill: 228, defend: 276, catch: 324, item: 132, flee: 30 };
  function placeCmds() {
    const cm = $('#b-cmds'), me = els.p && els.p.querySelector('.spr'); if (!cm || !me) return;
    const R = root.getBoundingClientRect(), r = me.getBoundingClientRect(), st = stage.getBoundingClientRect();
    const rad = Math.min(104, R.width * 0.27), half = 36;
    let cx = r.left - R.left + r.width / 2, cy = r.top - R.top + r.height * 0.5;
    // giữ cả vòng nằm trong màn hình
    cx = Math.max(rad + half + 4, Math.min(R.width - rad * Math.cos(30 * Math.PI / 180) - half - 4, cx));
    cy = Math.max(st.top - R.top + rad + half, Math.min(R.height - rad * Math.sin(132 * Math.PI / 180) - half - 8 - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0), cy));
    cm.style.setProperty('--cx', cx + 'px'); cm.style.setProperty('--cy', cy + 'px');
    $$('.seal', cm).forEach((b, i) => { const a = (RING[b.dataset.c] ?? 90) * Math.PI / 180; b.style.setProperty('--x', Math.cos(a) * rad + 'px'); b.style.setProperty('--y', Math.sin(a) * rad + 'px'); b.style.setProperty('--d', i * 40 + 'ms'); });
  }
  addEventListener('resize', () => { if (!root.hidden) placeCmds(); });
  function ready() {
    busy = false;
    placeCmds();
    $('#b-cmds').classList.remove('wait');
    hint(mode ? '' : 'Chọn lệnh');
    clearInterval(timer); left = TURN; tick();
    timer = setInterval(() => { left--; tick(); if (left <= 0) { clearInterval(timer); if (!busy && !root.hidden) { cancel(); const f = snap.units.find((u) => u.side === 1 && !u.dead); send({ type: 'attack', target: f && f.id }); } } }, 1000);
  }
  function tick() { const el = $('#b-timer'); el.textContent = busy ? '' : `Chờ lượt: ${left}s`; el.classList.toggle('low', left <= 5); }
  const hint = (t) => ($('#b-hint').textContent = t);

  // ---------- lệnh ----------
  $('#b-cmds').addEventListener('click', (e) => {
    const b = e.target.closest('.seal'); if (!b || busy) return;
    const c = b.dataset.c;
    if (mode && mode.cmd === c) return cancel();
    cancel();
    if (c === 'attack') return target({ cmd: c, side: 1 }, (t) => send({ type: 'attack', target: t }));
    if (c === 'defend') return send({ type: 'defend' });
    if (c === 'flee') return send({ type: 'flee' });
    if (c === 'skill') return pickSkill();
    if (c === 'item') return pickItem();
    if (c === 'catch') return pickCatch();
  });
  $('#b-auto').onclick = () => {
    auto = !auto; Tut.event('auto');
    $('#b-auto').classList.toggle('on', auto);
    if (auto && !busy && snap && !snap.over) { cancel(); autoAct(); }
  };

  function cancel() {
    mode = null; closePick();
    $$('.seal').forEach((s) => s.classList.remove('sel'));
    $$('.unit.target').forEach((u) => u.classList.remove('target'));
    if (!busy) hint('Chọn lệnh');
  }
  function selSeal(cmd) { $$('.seal').forEach((s) => s.classList.toggle('sel', s.dataset.c === cmd)); }

  function target(m, cb) {
    const pool = snap.units.filter((u) => !u.dead && (m.side === 1 ? u.side === 1 : u.side === 0) && (!m.filter || m.filter(u)));
    if (!pool.length) { UI.toast(m.empty || 'Không có mục tiêu.'); return cancel(); }
    if (pool.length === 1) { cancel(); return cb(pool[0].id); }
    mode = { ...m, cb };
    selSeal(m.cmd);
    pool.forEach((u) => els[u.id].classList.add('target'));
    hint(m.side === 1 ? 'Chạm vào mục tiêu' : 'Chọn người nhận');
  }
  function tapUnit(id) {
    if (!mode || !els[id].classList.contains('target')) return;
    const cb = mode.cb; cancel(); cb(id);
  }

  function pick(items, onPick, cmd) {
    closePick();
    selSeal(cmd); mode = { cmd };
    Sound.sfx('open');
    const p = document.createElement('div');
    p.className = 'pick'; p.id = 'b-pick';
    p.innerHTML = items.map((it, i) => `<button data-i="${i}" ${it.disabled ? 'disabled' : ''}><span class="ico">${it.icon}</span><span class="grow"><b>${esc(it.title)}</b><br><small class="muted">${esc(it.sub || '')}</small></span></button>`).join('')
      || '<p class="muted" style="margin:6px">Không có gì để dùng.</p>';
    p.querySelectorAll('button').forEach((b) => (b.onclick = () => { const it = items[+b.dataset.i]; closePick(); onPick(it); }));
    root.appendChild(p);
  }
  function closePick() { $('#b-pick')?.remove(); }

  const SK_ICON = { heal: '💚', buff: '✨', phys: '🗡️', magic: '🔮' };
  function pickSkill() {
    const me = unit('p');
    const list = snap.skills.map((k) => {
      const s = G.meta.SKILLS[k];
      return { k, s, icon: SK_ICON[s.type], title: `${s.name} · ${s.mp} nội lực`, sub: s.desc, disabled: me.mp < s.mp };
    });
    pick(list, ({ k, s }) => {
      if (s.target === 'allEnemy' || s.target === 'self') return send({ type: 'skill', skill: k });
      if (s.target === 'ally') return target({ cmd: 'skill', side: 0 }, (t) => send({ type: 'skill', skill: k, target: t }));
      target({ cmd: 'skill', side: 1 }, (t) => send({ type: 'skill', skill: k, target: t }));
    }, 'skill');
  }
  function pickItem() {
    const list = G.me.bag.filter((b) => b.t === 'item' && ['hp', 'mp'].includes(G.meta.ITEMS[b.id].type))
      .map((b) => ({ id: b.id, icon: Sprites.itemIcon(b.id, G.meta.ITEMS), title: `${G.meta.ITEMS[b.id].name} ×${b.qty}`, sub: G.meta.ITEMS[b.id].desc }));
    pick(list, ({ id }) => target({ cmd: 'item', side: 0 }, (t) => send({ type: 'item', item: id, target: t })), 'item');
  }
  function pickCatch() {
    const list = ['bau_bac', 'bau_vang'].map((id) => {
      const n = (G.me.bag.find((b) => b.t === 'item' && b.id === id) || {}).qty || 0;
      return { id, icon: Sprites.itemIcon(id, G.meta.ITEMS), title: `${G.meta.ITEMS[id].name} ×${n}`, sub: 'Đánh quái thật yếu rồi hãy bắt – càng ít máu càng dễ.', disabled: !n };
    });
    pick(list, ({ id }) => target({ cmd: 'catch', side: 1, filter: (u) => u.catchable, empty: 'Không có quái nào bắt được.' },
      (t) => send({ type: 'catch', item: id, target: t })), 'catch');
  }

  function autoAct() {
    if (!auto || busy || !snap || snap.over || root.hidden) return;
    const me = unit('p');
    const foes = snap.units.filter((u) => u.side === 1 && !u.dead).sort((a, b) => a.hp - b.hp);
    if (!foes.length) return;
    const aoe = snap.skills.map((k) => [k, G.meta.SKILLS[k]]).find(([, s]) => s.target === 'allEnemy' && me.mp >= s.mp + me.maxMp * 0.3);
    if (aoe && foes.length >= 2) return send({ type: 'skill', skill: aoe[0] });
    send({ type: 'attack', target: foes[0].id });
  }

  // ---------- gửi & diễn hoạt ----------
  async function send(action) {
    if (busy) return;
    busy = true; cancel(); clearInterval(timer); $('#b-timer').textContent = '';
    $('#b-cmds').classList.add('wait'); hint(''); Tut.event('act');
    const r = await Net.emit('battle:act', action);
    if (!r.ok) { UI.toast(r.msg, 'err'); busy = false; ready(); return; }
    await play(r.events);
    sync(r.snapshot);
    if (r.state) G.setState(r.state, true);
    if (r.result) { await sleep(450); return finish(r.result); }
    ready();
    if (auto) setTimeout(autoAct, 350);
  }

  function rectOf(id) { const e = els[id]; if (!e) return null; const sp = e.querySelector('.spr').getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: sp.left - s.left + sp.width / 2, y: sp.top - s.top + sp.height * 0.55 }; }
  function num(id, text, cls = '') {
    const e = els[id]; if (!e) return;
    const n = document.createElement('div'); n.className = 'num ' + cls; n.textContent = text;
    n.style.setProperty('--dx', (Math.random() * 36 - 18).toFixed(0) + 'px');
    if (cls.includes('crit')) n.dataset.tag = 'BẠO KÍCH';
    e.appendChild(n); setTimeout(() => n.remove(), 1300);
  }
  function banner(text, side) { $('#b-banner').innerHTML = `<span class="${side === 1 ? 'foe' : ''}">${esc(text)}</span>`; }
  const nameOf = (id) => unit(id)?.name || '';
  const skillOf = (name) => Object.values(G.meta.SKILLS).find((s) => s.name === name);

  function applyHit(h, ev) {
    const u = unit(h.t); if (!u) return;
    const p = rectOf(h.t);
    if (h.miss) { num(h.t, 'Né!', 'miss'); Sound.sfx('miss'); return; }
    if (h.h != null) { const nh = Math.min(u.maxHp, u.hp + h.h); setBars(h.t, nh, u.maxHp, u.mp, u.maxMp); num(h.t, '+' + fmt(h.h), 'heal'); setExpr(h.t, 'smile', 800); if (p) FX.impact('heal', p); Sound.sfx('heal'); return; }
    const kind = ev.fx && ev.fx !== 'hit' ? ev.fx : (ev.k === 'atk' ? 'slash' : 'hit');
    if (p) FX.impact(ev.k === 'atk' ? (h.crit ? 'slash' : 'hit') : kind, p, h.crit);
    num(h.t, '-' + fmt(h.d), h.crit ? 'crit' : (h.adv > 0 ? 'adv' : ''));
    els[h.t].classList.remove('hurt'); void els[h.t].offsetWidth; els[h.t].classList.add('hurt');
    u.hp = Math.max(0, u.hp - h.d); setExpr(h.t, 'hurt', h.dead ? 0 : 560); u.hp += h.d;
    setBars(h.t, Math.max(0, u.hp - h.d), u.maxHp, u.mp, u.maxMp);
    if (h.dead) { u.dead = true; setTimeout(() => { els[h.t]?.classList.add('dead'); turnBar(); if (p) FX.death(p, u.side === 1 ? '#ffc8a0' : '#c8e8ff', !!u.boss); Sound.sfx(u.boss ? 'bossdeath' : 'death'); }, 330); }
    if (h.stun) setTimeout(() => num(h.t, 'Choáng', 'info'), 250);
    if (h.poison) setTimeout(() => num(h.t, 'Trúng độc', 'poison'), 300);
    if (h.adv > 0) setTimeout(() => num(h.t, 'Khắc chế!', 'info'), 200);
    const kb = els[h.t]; kb.style.setProperty('--kb', (u.side === 1 ? -1 : 1) * (h.crit ? 16 : 9) + 'px');
    if (h.drain) { const a = unit(ev.a); if (a) { setBars(ev.a, Math.min(a.maxHp, a.hp + h.drain), a.maxHp, a.mp, a.maxMp); setTimeout(() => num(ev.a, '+' + h.drain, 'heal'), 200); } }
  }

  async function play(events) {
    for (const ev of events) {
      const a = ev.a && els[ev.a];
      if (ev.a) turnBar(ev.a);
      if (ev.k === 'atk' || (ev.k === 'skill' && !(ev.hits[0] && ev.hits[0].h != null))) {
        const sk = ev.s && skillOf(ev.s);
        const me = rectOf(ev.a), t0 = rectOf(ev.hits[0].t);
        if (ev.s) {
          const au = unit(ev.a), col = ECOL[ev.fx] || (au?.side === 0 ? '#9ff0d8' : '#ff8a6a');
          $('#b-log').textContent = `${nameOf(ev.a)} thi triển ${ev.s}`;
          root.classList.add('dim');
          if (au && (au.id === 'p' || au.boss)) await cutin(au, ev.s);
          else banner(ev.s, au?.side);
          if (me) FX.cast(me, col);
          a?.classList.add('cast'); setExpr(ev.a, 'cast', 900);
          Sound.sfx('charge');
          await sleep(420);
          a?.classList.remove('cast');
          if (sk?.mp) { const u = unit(ev.a); if (u) setBars(ev.a, u.hp, u.maxHp, Math.max(0, u.mp - sk.mp), u.maxMp); }
        }
        const ranged = ev.k === 'skill' && RANGED.has(ev.fx) && sk?.type === 'magic';
        if (ranged && me) {
          a?.classList.add('cast');
          Sound.sfx('throw');
          await Promise.all(ev.hits.map((h) => { const p = rectOf(h.t); return p ? FX.projectile(ev.fx, me, p) : null; }));
          a?.classList.remove('cast');
        } else if (a && t0 && me && !ev.aoe) {
          const dx = t0.x - me.x, dy = t0.y - me.y; setExpr(ev.a, 'angry', 900);
          a.style.transition = 'transform .12s ease-out'; a.style.transform = `translate(${-dx * 0.06}px, ${-dy * 0.06 + 4}px) scale(.96)`; await sleep(120);
          Sound.sfx('swing');
          a.style.transition = 'transform .15s cubic-bezier(.5,0,.9,.4)'; ghosts(a, dx * 0.66, dy * 0.66);
          a.style.transform = `translate(${dx * 0.66}px, ${dy * 0.66}px) scale(1.06)`; await sleep(150);
        } else if (a) { a.style.transform = 'scale(1.14) translateY(-8px)'; await sleep(160); }
        Sound.sfx(ev.hits.some((h) => h.crit) ? 'crit' : ev.k === 'atk' ? 'hit' : (FX_SOUND[ev.fx] || 'hit'));
        if (ev.aoe) for (let i = 0; i < ev.hits.length; i++) { applyHit(ev.hits[i], ev); await sleep(90); }
        else ev.hits.forEach((h) => applyHit(h, ev));
        await sleep(ev.hits.some((h) => h.crit) ? 360 : 240);
        if (a) { a.style.transition = 'transform .28s ease'; a.style.transform = ''; }
        root.classList.remove('dim');
        await sleep(ev.aoe ? 420 : 300);
        if (a) a.style.transition = '';
      } else if (ev.k === 'skill') { // hồi máu
        banner(ev.s, unit(ev.a)?.side);
        const me = rectOf(ev.a); if (me) FX.cast(me, '#7cf09a');
        Sound.sfx('charge');
        await sleep(380);
        const u = unit(ev.a); const sk = skillOf(ev.s);
        if (u && sk?.mp) setBars(ev.a, u.hp, u.maxHp, Math.max(0, u.mp - sk.mp), u.maxMp);
        ev.hits.forEach((h) => applyHit(h, ev));
        await sleep(600);
      } else if (ev.k === 'buff') {
        banner(ev.s, unit(ev.a)?.side);
        const me = rectOf(ev.a); if (me) { FX.cast(me, ev.fx === 'rage' ? '#ff4a2a' : '#c9a8ff'); FX.impact(ev.fx === 'rage' ? 'rage' : 'gold', me); }
        Sound.sfx(ev.fx === 'rage' ? 'rage' : 'buff');
        num(ev.a, ev.s, 'info');
        const u = unit(ev.a); const sk = skillOf(ev.s);
        if (u && sk?.mp) setBars(ev.a, u.hp, u.maxHp, Math.max(0, u.mp - sk.mp), u.maxMp);
        await sleep(750);
      } else if (ev.k === 'item') {
        const u = unit(ev.t), p = rectOf(ev.t);
        if (ev.h != null && u) { setBars(ev.t, Math.min(u.maxHp, u.hp + ev.h), u.maxHp, u.mp, u.maxMp); num(ev.t, '+' + fmt(ev.h), 'heal'); }
        if (ev.mpGain != null && u) { setBars(ev.t, u.hp, u.maxHp, Math.min(u.maxMp, u.mp + ev.mpGain), u.maxMp); num(ev.t, '+' + fmt(ev.mpGain) + ' NL', 'mp'); }
        if (p) FX.impact(ev.mpGain != null ? 'ice' : 'heal', p);
        Sound.sfx('heal');
        $('#b-log').textContent = `Dùng ${ev.item}`;
        await sleep(650);
      } else if (ev.k === 'catch') {
        await throwGourd(ev);
      } else if (ev.k === 'defend') {
        num(ev.a, '🛡️ Phòng thủ', 'info'); const p = rectOf(ev.a); if (p) { FX.shock(p.x, p.y + 42, '#9fd8ff', 64, 26); FX.ring(p.x, p.y, '#cfeaff', 46, 30, 3); els[ev.a]?.classList.add('guard'); setTimeout(() => els[ev.a]?.classList.remove('guard'), 900); }
        Sound.sfx('shield'); await sleep(380);
      } else if (ev.k === 'flee') {
        num(ev.a, ev.ok ? 'Thoát thân!' : 'Chạy thất bại', 'info');
        Sound.sfx(ev.ok ? 'wind' : 'error');
        if (ev.ok && a) a.style.transform = 'translateX(160px)';
        await sleep(650);
      } else if (ev.k === 'poison') {
        const u = unit(ev.t), p = rectOf(ev.t); if (u) setBars(ev.t, Math.max(0, u.hp - ev.d), u.maxHp, u.mp, u.maxMp);
        if (p) FX.impact('poison', p); Sound.sfx('poison');
        num(ev.t, '-' + fmt(ev.d), 'poison');
        if (ev.dead && u) { u.dead = true; setTimeout(() => els[ev.t]?.classList.add('dead'), 300); }
        await sleep(480);
      } else if (ev.k === 'stun') {
        num(ev.a, '💫 Choáng', 'info'); await sleep(450);
      } else if (ev.k === 'text') {
        $('#b-log').textContent = ev.msg; await sleep(500);
      }
    }
    turnBar();
  }

  // ---------- cắt cảnh khi tung chiêu (người chơi / boss) ----------
  async function cutin(u, name) {
    const el = $('#b-cutin');
    el.className = 'b-cutin ' + (u.side === 1 ? 'foe' : 'ally');
    el.innerHTML = `<div class="ci-band"><i class="ci-lines"></i><div class="ci-art">${Sprites.unitImg(u)}</div><div class="ci-txt"><small>${esc(u.name)}</small><b>${esc(name)}</b></div></div>`;
    el.hidden = false;
    Sound.sfx('cutin');
    await sleep(720);
    el.hidden = true;
  }
  // bóng mờ khi lướt tới
  function ghosts(a, dx, dy) {
    if (FX.low) return;
    const spr = a.querySelector('.spr'); if (!spr) return;
    for (let i = 1; i <= 3; i++) {
      const gh = spr.cloneNode(true); gh.className = 'spr ghost';
      gh.style.cssText = `position:absolute;left:0;right:0;top:0;opacity:${0.45 - i * 0.1};transform:translate(${-dx * i * 0.08}px,${-dy * i * 0.08}px);`;
      a.appendChild(gh); setTimeout(() => gh.remove(), 200 + i * 40);
    }
  }

  async function throwGourd(ev) {
    const from = rectOf(ev.a), to = rectOf(ev.t);
    if (!from || !to) return;
    const g = document.createElement('div');
    g.className = 'gourd-fly';
    g.innerHTML = Sprites.gourd(ev.item === 'bau_vang' ? 'gold' : 'silver');
    g.style.left = from.x - 18 + 'px'; g.style.top = from.y - 40 + 'px';
    stage.appendChild(g);
    Sound.sfx('throw');
    await sleep(30);
    g.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y - 30}px) rotate(-20deg)`;
    await sleep(480);
    FX.ring(to.x, to.y, '#ffd65a', 60, 24, 3);
    g.classList.add('wobble');
    $('#b-log').textContent = `Tỷ lệ thu phục: ${ev.rate}%`;
    await sleep(800);
    if (ev.ok) {
      FX.impact('gold', to);
      els[ev.t]?.classList.add('caught');
      Sound.sfx('caught');
      num(ev.a, 'Thu phục thành công!', 'info');
    } else { Sound.sfx('escape'); FX.impact('hit', to); num(ev.t, 'Thoát khỏi hồ lô!', 'info'); }
    await sleep(650);
    g.remove();
  }

  async function finish(res) {
    busy = true; clearInterval(timer); $('#b-timer').textContent = '';
    const win = res.outcome === 'win' || (res.outcome === 'timeout' && res.kind === 'world');
    const titles = { win: 'Đại Thắng', lose: 'Thất Bại', flee: 'Thoát Thân', timeout: 'Kết Thúc' };
    Sound.sfx(win ? 'victory' : res.outcome === 'lose' ? 'defeat' : 'wind');
    clearTimeout(blinkT);
    if (win) { FX.victory(); setTimeout(() => Sound.sfx('fireworks'), 300); snap?.units.forEach((u) => { if (u.side === 0 && !u.dead) setExpr(u.id, 'smile'); }); }
    else if (res.outcome === 'lose') { root.classList.add('defeat'); FX.flash('#3a0000', 40, 0.5); }
    const I = G.meta.ITEMS;
    const slots = [];
    if (res.exp) slots.push(['✨', `+${fmt(res.exp)}`, 'Tu vi']);
    if (res.bac) slots.push(['<b class="coin silver"></b>', `+${fmt(res.bac)}`, 'Bạc']);
    if (res.vang) slots.push(['<b class="coin gold"></b>', `+${res.vang}`, 'Vàng']);
    if (res.arena) slots.push(['⚔️', `${res.arena > 0 ? '+' : ''}${res.arena}`, 'Điểm đấu']);
    if (res.lostBac) slots.push(['💸', `-${fmt(res.lostBac)}`, 'Bạc']);
    const loot = [
      ...res.items.map((id) => `<span class="loot"><i>${Sprites.itemIcon(id, I)}</i><small>${esc(I[id].name)}</small></span>`),
      ...res.equips.map((e) => `<span class="loot" style="--q:${G.meta.QUALITIES[e.q].color}"><i>${G.meta.SLOTS[e.slot].icon}</i><small style="color:${Panels.PAPER_Q[e.q]}">${esc(e.name)}</small></span>`),
      ...res.captured.map((p) => `<span class="loot" style="--q:${G.meta.GRADES[p.grade].color}"><i>${Sprites.petImg(p)}</i><small style="color:${Panels.PAPER_G[p.grade]}">${esc(p.name)}</small></span>`),
    ];
    let html = `<div class="victory ${win ? 'win' : 'lose'}"><div class="v-title">${titles[res.outcome] || 'Kết Thúc'}</div></div>`;
    if (res.kind === 'world' && res.outcome !== 'lose') html += `<p class="muted center">Phần thưởng theo sát thương bạn gây ra cho boss.</p>`;
    if (slots.length) html += `<div class="v-stats">${slots.map(([i, v, l]) => `<div><span>${i}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>`;
    if (loot.length) html += `<div class="sec">Chiến lợi phẩm</div><div class="v-loot">${loot.join('')}</div>`;
    if (res.ups.length) html += `<p class="v-note gold">Thăng lên cấp ${res.ups[res.ups.length - 1]}! Nhớ cộng điểm tiềm năng.</p>`;
    if (res.petUps) html += `<p class="v-note">Tiên sủng tăng ${res.petUps} cấp.</p>`;
    if (res.towerFloor) html += `<p class="v-note gold">🗼 Vượt tầng ${res.towerFloor} Trấn Yêu Tháp!${res.towerGot && res.towerGot.length ? ' Nhận: ' + res.towerGot.map(esc).join(', ') : ''}</p>`;
    if (res.quest) html += `<p class="v-note">📜 Hoàn thành «${esc(res.quest.title)}» · vượt ${res.quest.nan} kiếp nạn</p>`;
    if (res.outcome === 'lose' && res.respawn) html += `<p class="muted center">Bạn được đưa về điểm hồi sinh.</p>`;
    await UI.modal(html, [{ id: 'ok', label: 'Tiếp tục' }]);
    root.hidden = true;
    closePick(); FX.clear(); root.classList.remove('dim', 'defeat');
    snap = null;
    Sound.play(G.meta.MAPS[G.me.map]?.theme || 'city');
    Sound.ambient(G.meta.MAPS[G.me.map]?.theme);
    Tut.event('battleEnd');
    onEnd && onEnd(res);
  }

  return { start, get active() { return !root.hidden; } };
})();
