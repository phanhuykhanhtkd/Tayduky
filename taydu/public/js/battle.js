// =====================================================================
//  MÀN CHIẾN ĐẤU: phông cảnh theo chương, bàn cờ chéo, pháp trận,
//  thanh thứ tự ra đòn, hiệu ứng hạt, âm thanh, màn mở đầu & tổng kết
// =====================================================================
const BattleUI = (() => {
  const root = $('#battle'), stage = $('#b-stage'), box = $('#b-units');
  let snap = null, busy = false, mode = null, auto = false, onEnd = null, theme = 'city';
  const els = {};
  // đội hình nhìn ngang: địch bên trái, phe mình bên phải, xếp chéo hai hàng
  const SLOT = { 1: [[27, 62], [13, 76], [31, 88], [14, 47], [33, 41]], 0: [[74, 64], [61, 80], [87, 80], [64, 48], [88, 46]] };
  // cụm lệnh lục giác ở giữa: hai phe dạt ra hai mép, xếp so le
  const SLOT_HEX = { 1: [[24, 58], [12, 71], [25, 85], [12, 44], [26, 34]], 0: [[76, 60], [88, 73], [75, 87], [88, 46], [74, 34]] };
  FX.attach($('#b-fx'), $('#b-fx-under'), [stage, $('#b-bg'), $('#b-3d')]);
  const ECOL = { thunder: '#9fd8ff', fire: '#ff8a2a', ice: '#bff0ff', poison: '#c88aff', heal: '#7cf09a', gold: '#ffd65a', wind: '#9ff0d8', rock: '#e0b07a', shadow: '#b07af0', rage: '#ff5a2a', slash: '#fff0c8', hit: '#fff0c8' };

  const FX_SOUND = { thunder: 'thunder', fire: 'fire', ice: 'ice', poison: 'poison', heal: 'heal', gold: 'gold', wind: 'wind', rock: 'rock', shadow: 'shadow', rage: 'rage', slash: 'slash', hit: 'hit' };
  const RANGED = new Set(['fire', 'ice', 'poison', 'shadow', 'gold', 'wind']);

  // ---------- bắt đầu ----------
  async function start(s, opts = {}) {
    snap = s; onEnd = opts.onEnd; busy = true; mode = null; combo = 0; comboSide = -1; $('#b-combo')?.remove();
    if (!Object.keys(ULT).length) ultInit();
    theme = s.theme || (s.kind === 'arena' || s.kind === 'tower' ? 'arena' : s.kind === 'world' ? 'world' : (G.meta.MAPS[G.me.map]?.theme || 'city'));
    root.className = theme;
    $('#b-bg').style.backgroundImage = `url("${Sprites.battleBG(theme)}")`;
    const bd = $('.b-board', root); if (bd && typeof Tiles !== 'undefined') bd.style.setProperty('--tex', `url("${Tiles.boardTex(theme)}")`);
    root.hidden = false;
    if (typeof PaintMap !== 'undefined') { root.classList.remove('has3d'); root.classList.add('painted'); const bgKey = s.bg || (s.theme ? null : G.meta.MAPS[G.me.map]?.bg); const artBg = (bgKey && Sprites.battleArt(bgKey)) || Sprites.battleArt(theme) || (theme === 'city' && Sprites.battleArt('village')); root.classList.toggle('artbg', !!artBg); if (typeof Living !== 'undefined') Living.battleStart($('#b-amb'), artBg ? (bgKey || theme) : null); $('#b-bg').style.backgroundImage = `url("${artBg || PaintMap.battleURL(theme, root.clientWidth || innerWidth, root.clientHeight || innerHeight)}")`; }
    else root.classList.toggle('has3d', typeof Arena !== 'undefined' && Arena.show(theme));
    closePick();
    $('#b-log').textContent = s.kind === 'boss' ? 'Trận chiến với boss – không thể bỏ chạy!' : s.kind === 'arena' ? 'Tam Giới Đấu bắt đầu!' : s.kind === 'world' ? `Đánh ${s.maxRounds} hiệp, sát thương cộng dồn vào boss chung.` : s.kind === 'tower' ? 'Trấn Yêu Tháp – vượt tầng này để đi tiếp!' : 'Yêu quái xuất hiện!';
    render();
    bossPlate();
    stageBanner(s);
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

  // màn "Vào trận": nền vẽ tay, chân dung hai phe đối đầu
  function unitURL(u) { return u ? (Sprites.creatureSrc(u) || (Art.unit(u) || {}).url || '') : ''; }
  function versus(text, isBoss) {
    const bg = Sprites.art('ui', 'versus'); if (!bg) return null;
    const foe = snap.units.find((u) => u.boss) || snap.units.find((u) => u.side === 1), me = snap.units.find((u) => u.id === 'p') || snap.units.find((u) => u.side === 0);
    const foeName = foe ? (snap.units.filter((u) => u.side === 1).length > 1 && !foe.boss ? foe.name + ' ×' + snap.units.filter((u) => u.side === 1).length : foe.name) : text;
    const el = document.createElement('div'); el.className = 'vs-wrap'; root.appendChild(el);
    el.innerHTML = `<div class="vs ${isBoss ? 'boss' : ''}" style="background-image:url('${bg}')"><div class="vs-side vs-foe"><div class="vs-por"><img src="${unitURL(foe)}" alt=""></div><b>${esc(foeName)}</b></div><div class="vs-mid"><span>Chiến Đấu</span><small>${esc(isBoss && text !== foeName ? text : snap.kind === 'boss' ? 'Đánh boss' : '')}</small></div><div class="vs-side vs-me"><b>${esc(me ? me.name : '')}</b><div class="vs-por"><img src="${unitURL(me)}" alt=""></div></div></div>`;
    root.classList.add('vsing');
    $$('.unit', box).forEach((u, i) => { u.classList.add('enter'); u.style.animationDelay = 1300 + i * 70 + 'ms'; });
    return sleep(1650).then(() => { el.querySelector('.vs').classList.add('out'); return sleep(280); }).then(() => { el.remove(); root.classList.remove('vsing'); $$('.unit', box).forEach((u) => { u.classList.remove('enter'); u.style.animationDelay = ''; }); });
  }
  function intro(text, isBoss) {
    const vs = versus(text, isBoss); if (vs) return vs;
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
      const SL = $('#b-cmds').classList.contains('hex') ? SLOT_HEX : SLOT;
      const pos = SL[u.side][idx[u.side]++ % SL[u.side].length];
      const el = document.createElement('div');
      el.className = `unit side${u.side}` + (u.boss ? ' boss' : '') + (u.mut ? ' mut' : '') + (u.dead ? ' dead' : '') + (u.hero ? ' is-hero' : '') + (u.form && u.grade >= 2 ? ' aura g' + u.grade : '')
        + (u.than ? ' than' : '') + (u.chan ? ' chan' : '') + (u.shadow ? ' shadow' : '') + (u.nm ? ' nm' : '') + (u.elite ? ' elite' : '') + (u.phase > 1 ? ' enraged' : '') + (u.bossId && GIANT.has(u.bossId) ? ' giant' : '');
      el.style.left = pos[0] + '%'; el.style.top = `calc(${pos[1]}% - ${u.boss ? 176 : 146}px)`;
      el.style.zIndex = Math.round(pos[1]);
      const ring = u.side === 0 ? '#7fd6b7' : u.boss ? '#ff5a3a' : (G.meta.ELEMENTS[u.element]?.color || '#ffd65a');
      const gcol = u.grade != null && u.side === 1 && !u.boss ? G.meta.GRADES[u.grade].color : null;
      el.innerHTML = `<i class="shd"></i><div class="circle" style="background-image:url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(Sprites.circle(ring))}')"></div>
        <div class="spr">${creatureHTML(u)}</div><span class="st"></span>
        <div class="plate">${gcol ? `<i class="gdot" style="background:${gcol}"></i>` : ''}${u.than ? '<i class="tsdot">✦</i>' : ''}<b>${esc(u.name)}</b><em>${u.lvl}</em></div>
        <div class="ub"><div class="bar hp"><i></i></div>${u.side === 0 ? '<div class="bar mp"><i></i></div>' : ''}</div>`;
      el.onclick = () => tapUnit(u.id);
      el.dataset.n = u.name;
      if (u.pos) el.querySelector('.ub').insertAdjacentHTML('beforeend', `<em class="upos">${u.pos}</em>`);
      box.appendChild(el);
      els[u.id] = el;
    }
    sync(snap);
    for (const u of snap.units) if (els[u.id]) Puppet.attach(els[u.id], u);
    blinkLoop();
  }

  // khung tên kẻ địch mạnh nhất (boss) ở trên cùng
  function lead() { const en = snap.units.filter((u) => u.side === 1); return en.find((u) => u.boss) || en.sort((a, b) => b.lvl - a.lvl)[0]; }
  function bossPlate() {
    const el = $('#b-bossplate'), u = lead(); if (!u) { el.hidden = true; return; }
    el.hidden = false; el.classList.toggle('isboss', !!u.boss);
    el.classList.toggle('nm', !!u.nm);
    el.innerHTML = `<span class="bp-ava">${Sprites.unitImg(u)}</span><div class="bp-txt"><b>${esc(u.name)}</b> <em>(Lv ${u.lvl})</em><div class="bar hp"><i></i></div>${u.phases > 1 ? `<div class="bp-ph">${Array.from({ length: u.phases }, (_, i) => `<i class="${i < (u.phase || 1) ? 'on' : ''}"></i>`).join('')}<small>Giai đoạn ${u.phase || 1}/${u.phases}</small></div>` : ''}</div>`;
    el.dataset.id = u.id; el.querySelector('.bar i').style.width = Math.max(0, 100 * u.hp / u.maxHp) + '%';
  }
  function stageBanner(s) {
    const el = $('#b-sbanner'), M = G.meta.MAPS[G.me.map];
    const run = G.me && G.me.run;
    const sub = s.kind === 'tower' ? `Trấn Yêu Tháp · Tầng ${(G.me.towerBest || 0) + 1}` : s.kind === 'boss' ? `Hàng Yêu · ${(lead() || {}).name || ''}` : s.kind === 'arena' ? 'Tam Giới Đấu' : s.kind === 'world' ? 'Boss Thế Giới'
      : s.kind === 'nightmare' ? 'Ác Mộng Luân Hồi' : s.kind === 'trial' ? `Tam Cửu Thiên Kiếp · ${run ? run.stage + 1 : 1}/3` : s.kind === 'dungeon' ? `Phó Bản · Chặng ${run ? run.stage + 1 : 1}/${run ? run.total : 4}` : `${M ? M.name : 'Hoang dã'}`;
    el.querySelector('span').textContent = sub.replace(/ · $/, '');
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  function sync(s) {
    snap = s;
    // có Tiên sủng mới ra trận (lệnh Sủng) → dựng lại đội hình
    if (s.units.some((u) => !els[u.id] || els[u.id].dataset.n !== u.name)) { render(); return; }
    { const bp = $('#b-bossplate'), u = bp && !bp.hidden && s.units.find((x) => x.id === bp.dataset.id); if (u) bp.querySelector('.bar i').style.width = Math.max(0, 100 * u.hp / u.maxHp) + '%'; }
    for (const u of s.units) {
      const el = els[u.id]; if (!el) continue;
      setBars(u.id, u.hp, u.maxHp, u.mp, u.maxMp);
      el.classList.toggle('dead', u.dead && !el.classList.contains('caught'));
      el.querySelector('.st').innerHTML = stTags(u);
    }
    const rd = $('#b-round'), rArt = Sprites.art('ui', 'round'); rd.classList.toggle('banner', !!rArt); if (rArt) rd.style.backgroundImage = `url("${rArt}")`;
    rd.innerHTML = rArt ? `<span>Hiệp ${s.round + 1}${s.maxRounds ? ` / ${s.maxRounds}` : ''}</span>` : `<small>Hiệp</small>${s.round + 1}${s.maxRounds ? `<small>/${s.maxRounds}</small>` : ''}`;
    const boss = s.units.find((u) => u.boss);
    $('#b-boss').hidden = !boss;
    if (boss) {
      $('#b-boss-name').textContent = boss.name;
      $('#b-boss-hp').style.width = (100 * boss.hp / boss.maxHp) + '%';
      $('#b-boss-t').textContent = `${fmt(boss.hp)} / ${fmt(boss.maxHp)}`;
    }
    $('[data-c="flee"]').disabled = !s.canFlee;
    $('[data-c="catch"]').disabled = !s.canCatch;
    $('[data-c="pet"]').disabled = !(s.bench && s.bench.length);
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
  // lệnh hình thoi xếp so le thành cột bên trái nhân vật (kiểu cổ điển)
  const ZIG = ['attack', 'skill', 'catch', 'item', 'pet', 'flee', 'defend'];
  // vòng lệnh (kiểu tay cầm): nút Công lớn ở góc phải, các lệnh khác xếp hai cung quanh
  const WHEEL = { attack: [0, 0], skill: [90, 102], item: [90, 146], pet: [90, 190], catch: [150, 114], defend: [150, 149], flee: [150, 184] };
  // cụm lệnh lục giác (tổ ong hai cột) ở giữa sân
  const HEX = { attack: [0, 0], catch: [0, 1], pet: [0, 2], defend: [0, 3], skill: [1, 0.5], item: [1, 1.5], flee: [1, 2.5] };
  function placeCmds() {
    const cm = $('#b-cmds'); if (!cm) return;
    if (cm.classList.contains('hex')) { $$('.seal', cm).forEach((b, i) => { const [c, r] = HEX[b.dataset.c] || [0, 0]; b.style.setProperty('--x', (c * 54) + 'px'); b.style.setProperty('--y', (r * 63) + 'px'); b.style.setProperty('--d', (i * 35) + 'ms'); }); return; }
    const w = cm.clientWidth || 250, h = cm.clientHeight || 236, cx = w - 62, cy = h - 64;
    cm.style.setProperty('--cx', cx + 'px'); cm.style.setProperty('--cy', cy + 'px');
    $$('.seal', cm).forEach((b, i) => { const [r, deg] = WHEEL[b.dataset.c] || [0, 0], a = deg * Math.PI / 180; b.style.setProperty('--x', (Math.cos(a) * r).toFixed(1) + 'px'); b.style.setProperty('--y', (-Math.sin(a) * r).toFixed(1) + 'px'); b.style.setProperty('--d', i * 40 + 'ms'); });
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
    if (c === 'pet') return pickPet();
  });
  $('#b-auto').onclick = () => {
    auto = !auto; Tut.event('auto');
    $('#b-auto').classList.toggle('on', auto);
    if (auto && !busy && snap && !snap.over) { cancel(); autoAct(); }
  };

  function cancel() {
    mode = null; closePick();
    $$('.seal').forEach((s) => s.classList.remove('sel')); $('#b-cmds').classList.remove('picking');
    $$('.unit.target').forEach((u) => u.classList.remove('target'));
    if (!busy) hint('Chọn lệnh');
  }
  function selSeal(cmd) { $$('.seal').forEach((s) => s.classList.toggle('sel', s.dataset.c === cmd)); $('#b-cmds').classList.toggle('picking', !!cmd); }

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
    if (!mode) return unitInfo(id);
    if (!els[id].classList.contains('target')) return;
    const cb = mode.cb; cancel(); cb(id);
  }

  function pick(items, onPick, cmd) {
    closePick();
    selSeal(cmd); mode = { cmd };
    Sound.sfx('open');
    const p = document.createElement('div');
    p.className = 'pick float'; p.id = 'b-pick';
    p.innerHTML = items.map((it, i) => `<button data-i="${i}" ${it.disabled ? 'disabled' : ''}><span class="ico">${it.icon}</span><span class="grow"><b>${esc(it.title)}</b><br><small class="muted">${esc(it.sub || '')}</small></span></button>`).join('')
      || '<p class="muted" style="margin:6px">Không có gì để dùng.</p>';
    p.querySelectorAll('button').forEach((b) => (b.onclick = () => { const it = items[+b.dataset.i]; closePick(); onPick(it); }));
    p.classList.add('dockpick'); p.dataset.cmd = cmd;
    root.appendChild(p);
    const dk = $('#b-dock'); if (dk) p.style.bottom = (root.getBoundingClientRect().bottom - dk.getBoundingClientRect().top + 8) + 'px';
  }
  function closePick() { $('#b-pick')?.remove(); }

  const SK_ICON = { heal: '💚', buff: '✨', phys: '🗡️', magic: '🔮', control: '🌀', revive: '🕊️' };
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
  // Sủng: gọi Tiên sủng dự bị ra trận (thay con đã ngã hoặc con yếu nhất)
  function pickPet() {
    const list = (snap.bench || []).map((p) => { const full = G.me.pets.find((x) => x.uid === p.uid); return { uid: p.uid, icon: full ? Sprites.petImg(full) : '🐾', title: `${p.name} · Cấp ${p.lvl}`, sub: full ? `${G.meta.ELEMENTS[full.element].name} · ${G.meta.GRADES[full.grade].name}` : '' }; });
    pick(list, ({ uid }) => send({ type: 'pet', uid }), 'pet');
  }
  // chạm vào đơn vị (khi không chọn mục tiêu) → bảng thông tin như bản gốc
  function unitInfo(id) {
    const u = unit(id); if (!u) return;
    $('#b-uinfo')?.remove();
    const el = document.createElement('div'); el.id = 'b-uinfo'; el.className = 'b-uinfo';
    const E = G.meta.ELEMENTS[u.element];
    el.innerHTML = `<b>${esc(u.name)}</b><span>Cấp ${u.lvl}${u.pos ? ' · Vị trí ' + u.pos : ''}</span><span>Hp: ${fmt(u.hp)}/${fmt(u.maxHp)}</span>${u.maxMp ? `<span>Mp: ${fmt(u.mp)}/${fmt(u.maxMp)}</span>` : ''}
      <div class="ui-tags">${E ? `<i style="background:${E.color}">${E.name}</i>` : '<i>Vô</i>'}${stTags(u)}</div>`;
    root.appendChild(el);
    const r = els[id].getBoundingClientRect(), R = root.getBoundingClientRect();
    el.style.left = Math.max(6, Math.min(R.width - 156, r.left - R.left + r.width / 2 - 75)) + 'px';
    el.style.top = Math.max(60, r.top - R.top + 10) + 'px';
    setTimeout(() => el.remove(), 2600);
    el.onclick = () => el.remove();
  }
  // boss khổng lồ: tranh vẽ tay hiện to gấp đôi
  const GIANT = new Set(['culinh', 'nguuma', 'bachtuong', 'cuulinh', 'hondonthu', 'laongoan', 'world', 'manxa', 'khaiminh', 'mato', 'giaoma', 'banglang']);
  // tranh hiệu ứng (public/assets/fx/*.png, vẽ trên nền đen): hiện chồng lên vệt hạt sáng của FX
  const FX_ART = { thunder: 'loi', fire: 'hoa', ice: 'bang', water: 'nuoc', wind: 'xoay', poison: 'doc', rock: 'tho', sand: 'tho', gold: 'kim', slash: 'kim', claw: 'kim', bite: 'kim', light: 'phat_chuong', heal: 'sen', shield: 'chuong_vang', shadow: 'xoay', gourd: 'xoay', web: 'bua', roar: 'tho', rage: 'no', seal: 'bua', chaos: 'xoay', vine: 'moc', pillar: 'hoa_cot' };
  function fxArt(kind, p, big) {
    const key = kind === 'fire' && big ? 'hoa_cot' : FX_ART[kind], src = key && Sprites.art('fx', key); if (!src || !p || !stage) return;
    const im = document.createElement('img'); im.className = 'fxart' + (big ? ' big' : ''); im.src = src; im.alt = '';
    im.style.left = p.x + 'px'; im.style.top = p.y + 'px'; stage.appendChild(im); setTimeout(() => im.remove(), 900);
  }
  const ST = { stun: ['Định', '#6ac8ff'], seal: ['Ấn', '#c87aff'], chaos: ['Loạn', '#ff7ab0'], burn: ['Bỏng', '#ff8a3a'], poison: ['Độc', '#7fd66a'], shield: ['Khiên', '#ffe08a'], blind: ['Mù', '#9a8a7a'], slow: ['Chậm', '#9aa8ff'], mark: ['Tên', '#ffd65a'] };
  function stTags(u) { const bf = (u.buffs || []).filter((b) => b !== 'enrage'); return Object.entries(ST).filter(([k]) => u[k] > 0).map(([k, [l, c]]) => `<i style="background:${c}">${l}</i>`).join('') + (bf.length ? '<i style="background:#ffd65a">Buff</i>' : '') + ((u.buffs || []).includes('enrage') ? '<i style="background:#e8201a;color:#fff">Cuồng nộ</i>' : ''); }
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

  // điểm chân đơn vị (toạ độ trong #battle) – để rọi đèn 3D xuống mặt đài
  function feet(id) { const e = els[id]; if (!e) return null; const c = (e.querySelector('.circle') || e).getBoundingClientRect(), R = root.getBoundingClientRect(); return { x: c.left - R.left + c.width / 2, y: c.top - R.top + c.height * 0.55 }; }
  // ánh sáng chiêu thức: sân 3D thì rọi đèn thật; phông tranh thì vũng sáng + pháp trận xoay dưới chân
  function pool(id, col, o = {}) {
    const p = feet(id); if (!p || FX.low) return;
    const d = document.createElement('div'), dur = o.dur || 700, r = 70 * (o.sigil || 1.2) * (o.r ? o.r / 2.6 : 1);
    d.className = 'gpool'; d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${r * 2}px;height:${r * 2}px;--c:${col};--d:${dur}ms`;
    if (o.sigil !== 0) d.innerHTML = `<i style="background-image:url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(Sprites.circle(col))}')"></i>`;
    root.appendChild(d); setTimeout(() => d.remove(), dur + 60);
  }
  function wash(col, k = 0.35, dur = 260) {
    if (FX.low) return; const d = document.createElement('div'); d.className = 'gwash'; d.style.cssText = `--c:${col};--k:${k};--d:${dur}ms`; root.appendChild(d); setTimeout(() => d.remove(), dur + 40);
  }
  const A3 = { burst: (id, col, o) => { if (typeof Arena !== 'undefined' && Arena.on) Arena.burst(feet(id), col, o); else pool(id, col, o); }, flash: (c, k, d) => { if (typeof Arena !== 'undefined' && Arena.on) Arena.flash(c, k, d); else wash(c, k, d); } };
  // máy quay đẩy vào người ra chiêu
  function pushIn(id, k = 1.07) {
    const e = els[id]; if (!e || FX.low) return;
    const r = e.getBoundingClientRect(), R = root.getBoundingClientRect(), S = stage.getBoundingClientRect(), cvs = $('#b-3d');
    const ox = r.left + r.width / 2, oy = r.top + r.height * 0.6;
    stage.style.transformOrigin = `${ox - S.left}px ${oy - S.top}px`; if (cvs) cvs.style.transformOrigin = `${ox - R.left}px ${oy - R.top}px`;
    for (const el of [stage, cvs]) if (el) { el.style.transition = 'scale .38s cubic-bezier(.2,.8,.3,1)'; el.style.scale = String(k); }
  }
  function pushOut() { for (const el of [stage, $('#b-3d')]) if (el) { el.style.transition = 'scale .45s ease'; el.style.scale = ''; } }
  function rectOf(id) { const e = els[id]; if (!e) return null; const sp = e.querySelector('.spr').getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: sp.left - s.left + sp.width / 2, y: sp.top - s.top + sp.height * 0.55 }; }
  function num(id, text, cls = '') {
    const e = els[id]; if (!e) return;
    const n = document.createElement('div'); n.className = 'num ' + cls; n.textContent = text;
    n.style.setProperty('--dx', (Math.random() * 36 - 18).toFixed(0) + 'px');
    if (cls.includes('crit')) n.dataset.tag = 'BẠO KÍCH';
    e.appendChild(n); setTimeout(() => n.remove(), 1300);
  }
  function banner(text, side) { const b = $('#b-banner'); b.innerHTML = `<span class="${side === 1 ? 'foe' : ''}">${esc(text)}</span>`; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
  const nameOf = (id) => unit(id)?.name || '';
  const skillOf = (name) => Object.values(G.meta.SKILLS).find((s) => s.name === name);

  function applyHit(h, ev) {
    const u = unit(h.t); if (!u) return;
    const p = rectOf(h.t);
    if (h.miss) { num(h.t, h.blindMiss ? 'Trượt (mù)' : 'Né!', 'miss'); Sound.sfx('miss'); return; }
    if (h.st === 'debuff') { if (h.dispel) num(h.t, 'Mất buff!', 'info'); if (h.debuff) setTimeout(() => num(h.t, h.debuff, 'info'), 200); if (p) FX.ring(p.x, p.y, '#ffd65a', 52, 26, 3); Sound.sfx('charge'); return; }
    if (h.st) {
      const [l, c] = ST[h.st] || ['?', '#fff'];
      if (h.ok) { if (p && (h.st === 'seal' || h.st === 'chaos')) fxArt(h.st, p); num(h.t, h.label || { stun: 'Định Thân!', seal: 'Phong Ấn!', chaos: 'Loạn Hồn!', blind: 'Mù!', slow: 'Chậm!', mark: 'Bị gọi tên!' }[h.st] || l, 'info'); if (h.debuff) setTimeout(() => num(h.t, h.debuff, 'info'), 250); if (p) FX.ring(p.x, p.y, c, 52, 26, 3); u[h.st] = h.turns; els[h.t].querySelector('.st').innerHTML = stTags(u); Sound.sfx('charge'); }
      else { num(h.t, 'Kháng!', 'miss'); Sound.sfx('shield'); }
      return;
    }
    if (h.rev) { u.dead = false; els[h.t]?.classList.remove('dead'); setBars(h.t, h.h, u.maxHp, u.mp, u.maxMp); u.hp = h.h; num(h.t, 'Hồi sinh!', 'heal'); if (p) { FX.pillar(p.x, p.y + 40, '#bfffd0', 50, 50); FX.impact('heal', p); } Sound.sfx('heal'); return; }
    if (h.h != null) { A3.burst(h.t, '#8af0a8', { r: 2.6, i: 1.5, dur: 900, sigil: 1.2 }); const nh = Math.min(u.maxHp, u.hp + h.h); setBars(h.t, nh, u.maxHp, u.mp, u.maxMp); num(h.t, '+' + fmt(h.h), 'heal'); setExpr(h.t, 'smile', 800); if (p) FX.impact('heal', p); Sound.sfx('heal'); return; }
    const kind = ev.fx && ev.fx !== 'hit' ? ev.fx : (ev.k === 'atk' ? 'slash' : 'hit');
    if (p) FX.impact(ev.k === 'atk' ? (h.crit ? 'slash' : 'hit') : kind, p, h.crit);
    if (p && ev.k !== 'atk') fxArt(kind, p, ev.aoe);
    A3.burst(h.t, ev.k === 'atk' ? (h.crit ? '#fff2c0' : '#ffe8c8') : (ECOL[kind] || '#fff0c8'), { r: ev.k === 'atk' ? 2 : 2.8, i: h.crit ? 2.2 : ev.k === 'atk' ? 1.1 : 1.8, dur: ev.k === 'atk' ? 420 : 760, sigil: ev.k === 'atk' ? 0 : ev.aoe ? 1.1 : 1.3 });
    if (h.crit) A3.flash('#ffffff', 0.35, 220);
    if (kind === 'thunder') A3.flash('#cfe6ff', 0.55, 320);
    num(h.t, '-' + fmt(h.d), h.crit ? 'crit' : (h.adv > 0 ? 'adv' : ''));
    els[h.t].classList.remove('hurt'); void els[h.t].offsetWidth; els[h.t].classList.add('hurt');
    Puppet.bPose(els[h.t], 'hurt', 1);
    u.hp = Math.max(0, u.hp - h.d); setExpr(h.t, 'hurt', h.dead ? 0 : 560); u.hp += h.d;
    setBars(h.t, Math.max(0, u.hp - h.d), u.maxHp, u.mp, u.maxMp);
    if (h.dead) { u.dead = true; setTimeout(() => { els[h.t]?.classList.add('dead'); turnBar(); if (p) FX.death(p, u.side === 1 ? '#ffc8a0' : '#c8e8ff', !!u.boss); Sound.sfx(u.boss ? 'bossdeath' : 'death'); }, 330); }
    if (h.stun) setTimeout(() => num(h.t, h.label || 'Choáng', 'info'), 250);
    if (h.poison) setTimeout(() => num(h.t, h.label || 'Trúng độc', 'poison'), 300);
    if (h.blind) setTimeout(() => num(h.t, 'Mù', 'info'), 330);
    if (h.slow) setTimeout(() => num(h.t, 'Chậm', 'info'), 360);
    if (h.dispel) setTimeout(() => num(h.t, 'Mất buff!', 'info'), 380);
    if (h.feed) setTimeout(() => num(h.t, 'Lửa bùng mạnh hơn!', 'crit'), 260);
    if (h.burn) setTimeout(() => num(h.t, 'Bỏng', 'crit'), 320);
    if (h.absorb) setTimeout(() => num(h.t, 'Khiên -' + fmt(h.absorb), 'info'), 150);
    if (h.mpDrain) setTimeout(() => num(h.t, '-' + h.mpDrain + ' MP', 'info'), 350);
    if (h.adv > 0) setTimeout(() => num(h.t, 'Khắc chế!', 'info'), 200);
    const kb = els[h.t]; kb.style.setProperty('--kb', (u.side === 1 ? -1 : 1) * (h.crit ? 16 : 9) + 'px');
    if (h.drain) { const a = unit(ev.a); if (a) { setBars(ev.a, Math.min(a.maxHp, a.hp + h.drain), a.maxHp, a.mp, a.maxMp); setTimeout(() => num(ev.a, '+' + h.drain, 'heal'), 200); } }
  }

  async function play(events) {
    for (const ev of events) {
      const a = ev.a && els[ev.a];
      if (ev.a) turnBar(ev.a);
      if (ev.k === 'skill' && ev.summons) { // gọi phân thân / lính
        banner(ev.s, unit(ev.a)?.side); $('#b-log').textContent = `${nameOf(ev.a)} thi triển ${ev.s}`;
        const me = rectOf(ev.a); if (me) { FX.cast(me, '#c9a8ff'); FX.ring(me.x, me.y, '#c9a8ff', 90, 40, 4); }
        Sound.sfx('shadow'); await sleep(700);
      } else if (ev.k === 'assist') { await assist(ev);
      } else if (ev.k === 'mark') {
        const u = unit(ev.t), p = rectOf(ev.t); if (u) setBars(ev.t, Math.max(0, u.hp - ev.d), u.maxHp, u.mp, u.maxMp);
        banner(ev.def ? 'Phòng thủ kịp – hồ lô hút yếu đi!' : 'Hồ lô hút hồn!', 1);
        if (p) { FX.ring(p.x, p.y, '#ffd65a', 90, 40, 5); FX.impact('gold', p, true); }
        Sound.sfx('gong'); num(ev.t, '-' + fmt(ev.d), 'crit'); if (ev.dead && u) { u.dead = true; els[ev.t]?.classList.add('dead'); }
        await sleep(800);
      } else if (ev.k === 'atk' || (ev.k === 'skill' && !(ev.hits[0] && ev.hits[0].h != null))) {
        const sk = ev.s && skillOf(ev.s);
        const me = rectOf(ev.a), t0 = rectOf(ev.hits[0].t);
        if (ev.s) {
          const au = unit(ev.a), col = ECOL[ev.fx] || (au?.side === 0 ? '#9ff0d8' : '#ff8a6a');
          $('#b-log').textContent = `${nameOf(ev.a)} thi triển ${ev.s}`;
          root.classList.add('dim');
          if (au && (au.id === 'p' || au.boss)) await cutin(au, ev.s, ev.fx);
          else banner(ev.s, au?.side);
          if (me) FX.cast(me, col);
          A3.burst(ev.a, col, { r: 3.2, i: 1.3, dur: 1300, sigil: au?.boss ? 2.1 : 1.6, up: 160 });
          if (au && (au.id === 'p' || au.boss || ev.aoe)) pushIn(ev.a, ev.aoe ? 1.05 : 1.08);
          a?.classList.add('cast'); setExpr(ev.a, 'cast', 900);
          Sound.sfx('charge');
          await sleep(420);
          a?.classList.remove('cast');
          if (sk?.mp) { const u = unit(ev.a); if (u) setBars(ev.a, u.hp, u.maxHp, Math.max(0, u.mp - sk.mp), u.maxMp); }
          const ult = ULT[ev.s]; if (ult && !FX.low) await ultimate(ult, ev);
        }
        const ranged = ev.k === 'skill' && RANGED.has(ev.fx) && sk?.type === 'magic';
        if (ranged && me) {
          a?.classList.add('cast'); Puppet.bPose(a, 'cast', 1);
          Sound.sfx('throw');
          await Promise.all(ev.hits.map((h) => { const p = rectOf(h.t); return p ? FX.projectile(ev.fx, me, p) : null; }));
          a?.classList.remove('cast');
        } else if (a && t0 && me && !ev.aoe) {
          const dx = t0.x - me.x, dy = t0.y - me.y; setExpr(ev.a, 'angry', 900);
          const au = unit(ev.a), heavy = au && Puppet.GIANT.has(au.bossId), beast = au && ['beast', 'fly', 'snake'].includes(Puppet.kindOf(au.bossId ? au.art || au.bossId : au.form));
          Puppet.bPose(a, 'wind', 1, heavy ? 0.34 : 0.22);
          a.style.transition = `transform ${heavy ? '.2s' : '.12s'} ease-out`; a.style.transform = `translate(${-dx * 0.06}px, ${-dy * 0.06 + 4}px) scale(.96)`; await sleep(heavy ? 200 : 120);
          Sound.sfx('swing');
          a.style.transition = 'transform .15s cubic-bezier(.5,0,.9,.4)'; ghosts(a, dx * 0.66, dy * 0.66);
          Puppet.bPose(a, beast ? 'pounce' : 'dash', 1);
          a.style.transform = `translate(${dx * 0.66}px, ${dy * 0.66}px) scale(1.06)`; await sleep(150);
          // chạm đòn: khựng hình + rung màn hình cho có lực
          Puppet.bPose(a, 'strike', 1); Puppet.freeze(heavy ? 120 : 75); if (!FX.low) FX.shake(heavy ? 10 : ev.hits.some((h) => h.crit) ? 7 : 4, heavy ? 260 : 160); await sleep(heavy ? 90 : 55);
        } else if (a) { a.style.transform = 'scale(1.14) translateY(-8px)'; await sleep(160); }
        Sound.sfx(ev.hits.some((h) => h.crit) ? 'crit' : ev.k === 'atk' ? 'hit' : (FX_SOUND[ev.fx] || 'hit'));
        if (ev.hits.some((h) => !h.miss)) comboHit(unit(ev.a)?.side); else combo = 0;
        if (ev.aoe) for (let i = 0; i < ev.hits.length; i++) { applyHit(ev.hits[i], ev); await sleep(90); }
        else ev.hits.forEach((h) => applyHit(h, ev));
        await sleep(ev.hits.some((h) => h.crit) ? 360 : 240);
        if (a) { a.style.transition = 'transform .28s ease'; a.style.transform = ''; }
        root.classList.remove('dim'); pushOut();
        await sleep(ev.aoe ? 420 : 300);
        if (a) a.style.transition = '';
      } else if (ev.k === 'skill') { // hồi máu
        banner(ev.s, unit(ev.a)?.side);
        const me = rectOf(ev.a); if (me) FX.cast(me, '#7cf09a'); A3.burst(ev.a, '#7cf09a', { r: 3, i: 1.3, dur: 1200, sigil: 1.6, up: 160 });
        Sound.sfx('charge');
        await sleep(380);
        const u = unit(ev.a); const sk = skillOf(ev.s);
        if (u && sk?.mp) setBars(ev.a, u.hp, u.maxHp, Math.max(0, u.mp - sk.mp), u.maxMp);
        ev.hits.forEach((h) => applyHit(h, ev));
        await sleep(600);
      } else if (ev.k === 'buff') {
        banner(ev.s, unit(ev.a)?.side);
        const me = rectOf(ev.a); if (me) { FX.cast(me, ev.fx === 'rage' ? '#ff4a2a' : '#c9a8ff'); FX.impact(ev.fx === 'rage' ? 'rage' : 'gold', me); }
        A3.burst(ev.a, ev.fx === 'rage' ? '#ff5a2a' : '#d8b8ff', { r: 3, i: 1.5, dur: 1000, sigil: 1.5 });
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
        A3.burst(ev.a, '#9fd8ff', { r: 2.2, i: 1.1, dur: 800, sigil: 1.1 });
        num(ev.a, ev.mpGain != null ? `Nghỉ +${ev.mpGain} MP` : '🛡️ Phòng thủ', 'info'); const p = rectOf(ev.a); if (p) { FX.shock(p.x, p.y + 42, '#9fd8ff', 64, 26); FX.ring(p.x, p.y, '#cfeaff', 46, 30, 3); els[ev.a]?.classList.add('guard'); setTimeout(() => els[ev.a]?.classList.remove('guard'), 900); }
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
      } else if (ev.k === 'burn') {
        const u = unit(ev.t), p = rectOf(ev.t); if (u) setBars(ev.t, Math.max(0, u.hp - ev.d), u.maxHp, u.mp, u.maxMp);
        if (p) FX.impact('fire', p); Sound.sfx('fire'); num(ev.t, '-' + fmt(ev.d), 'crit');
        if (ev.dead && u) { u.dead = true; setTimeout(() => els[ev.t]?.classList.add('dead'), 300); }
        await sleep(450);
      } else if (ev.k === 'summon') {
        const p = rectOf(ev.t); num(ev.a, `Sủng: ${ev.name}`, 'info'); if (p) { FX.ring(p.x, p.y, '#bfefff', 60, 30, 3); FX.pillar(p.x, p.y + 40, '#dff4ff', 40, 40); }
        $('#b-log').textContent = ev.out ? `${ev.out} rút lui, ${ev.name} ra trận!` : `${ev.name} ra trận!`;
        Sound.sfx('charge'); await sleep(600);
      } else if (ev.k === 'chaos') {
        num(ev.a, '😵 Loạn hồn', 'info'); await sleep(350);
      } else if (ev.k === 'selfcost') {
        const u = unit(ev.a); if (u) { setBars(ev.a, Math.max(1, u.hp - ev.d), u.maxHp, u.mp, u.maxMp); u.hp = Math.max(1, u.hp - ev.d); }
        num(ev.a, 'Xả thân -' + fmt(ev.d), 'crit'); Sound.sfx('rage'); await sleep(300);
      } else if (ev.k === 'stun') {
        num(ev.a, '💫 Choáng', 'info'); await sleep(450);
      } else if (ev.k === 'text') {
        $('#b-log').textContent = ev.msg; await sleep(500);
      } else if (ev.k === 'phase') { // boss chuyển giai đoạn – Cuồng Nộ
        const u = unit(ev.a), p = rectOf(ev.a), el = els[ev.a];
        if (u) { u.phase = ev.n; if (ev.h) { u.hp = Math.min(u.maxHp, u.hp + ev.h); setBars(ev.a, u.hp, u.maxHp, u.mp, u.maxMp); } }
        if (u && ev.art && ev.art !== u.art) { u.art = ev.art; const sp = el && el.querySelector('.spr'); if (sp) { sp.classList.add('morph'); setTimeout(() => { sp.innerHTML = creatureHTML(u); sp.classList.remove('morph'); }, 380); } }
        if (el) { el.classList.add('enraged'); el.classList.remove('phase-hit'); void el.offsetWidth; el.classList.add('phase-hit'); }
        root.classList.remove('quake'); void root.offsetWidth; root.classList.add('quake');
        Sound.sfx('gong'); Sound.sfx('rage');
        if (p) { FX.ring(p.x, p.y, '#ff3a2a', 120, 50, 5); FX.pillar(p.x, p.y + 60, '#ff6a3a', 70, 90); }
        A3.burst(ev.a, '#ff4a2a', { r: 4, i: 2.2, dur: 1400, sigil: 2.2, up: 200 });
        banner(ev.msg, 1); $('#b-log').textContent = ev.msg;
        if (ev.h) num(ev.a, '+' + fmt(ev.h), 'heal');
        bossPlate();
        await sleep(1300);
      } else if (ev.k === 'regen') {
        const u = unit(ev.t); if (u) { u.hp = Math.min(u.maxHp, u.hp + ev.h); setBars(ev.t, u.hp, u.maxHp, u.mp, u.maxMp); }
        num(ev.t, '+' + fmt(ev.h), 'heal'); await sleep(250);
      }
    }
    turnBar();
  }

  // ---------- cắt cảnh khi tung chiêu (người chơi / boss) ----------
  async function cutin(u, name, fx) {
    const el = $('#b-cutin');
    el.className = 'b-cutin ' + (u.side === 1 ? 'foe' : 'ally');
    el.style.setProperty('--ec', ECOL[fx] || (u.side === 1 ? '#ff6a4a' : '#ffd65a'));
    el.innerHTML = `<div class="ci-band"><i class="ci-lines"></i><i class="ci-ink"></i><div class="ci-art">${Sprites.unitImg(u)}</div><div class="ci-txt"><small>${esc(u.name)}</small><b style="font-size:${Math.max(24, Math.min(40, Math.floor(Math.min(innerWidth, 480) * 0.74 / (name.length * 0.56))))}px">${esc(name)}</b></div></div>`;
    el.hidden = false;
    Sound.sfx('cutin');
    await sleep(720);
    el.hidden = true;
  }
  // ---------- tuyệt chiêu riêng từng tộc: màn tối + hình hiện quanh mục tiêu ----------
  const ULT = {};
  const ULT_BY_KEY = { phat_quang: 'buddha', cuu_thien: 'buddha', chan_hoa: 'demon', me_hon: 'fox', nhiep_hon: 'fox', that_thap: 'monkey' };
  function ultInit() { for (const [k, v] of Object.entries(ULT_BY_KEY)) { const s = G.meta.SKILLS[k]; if (s) ULT[s.name] = v; } }
  async function ultimate(kind, ev) {
    const pts = ev.hits.map((h) => rectOf(h.t)).filter(Boolean); if (!pts.length) return;
    const S = stage.getBoundingClientRect(), R = root.getBoundingClientRect();
    const gx = pts.reduce((a, p) => a + p.x, 0) / pts.length, gy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const layer = document.createElement('div'); layer.className = 'ult ult-' + kind;
    layer.innerHTML = `<div class="ult-title">${esc(ev.s)}</div>`;
    root.appendChild(layer);
    const img = Art.special(kind).url, put = (x, y, w, cls, delay) => { const e = document.createElement('img'); e.src = img; e.className = 'ult-spr ' + cls; e.style.cssText = `left:${x - w / 2}px;top:${y}px;width:${w}px;animation-delay:${delay}ms`; layer.appendChild(e); return e; };
    const sx = (x) => x - (R.left - S.left) * 0, sy = (y) => y + (S.top - R.top);
    if (kind === 'buddha') { // năm tượng Phật hiện thành vòng cung quanh địch rồi toả kim quang
      const n = 5; for (let i = 0; i < n; i++) { const a = Math.PI * (1.05 + (i / (n - 1)) * 0.9); put(gx + Math.cos(a) * 112, sy(gy) + Math.sin(a) * 70 - 40, 74, 'drop', i * 90); }
      Sound.sfx('gold'); await sleep(620); FX.rays(gx, gy, '#ffe08a', 60, 220); FX.flash('#fff3c0', 14, 0.45); Sound.sfx('cutin'); await sleep(420);
    } else if (kind === 'demon') { // ác quỷ lửa trồi lên dưới chân từng mục tiêu
      pts.forEach((p, i) => { put(p.x - 22, sy(p.y) - 10, 70, 'rise', i * 80); put(p.x + 26, sy(p.y), 56, 'rise', 120 + i * 80); FX.pillar(p.x, p.y + 40, '#ff6a2a', 60, 46); });
      Sound.sfx('fire'); FX.shake(9, 500); await sleep(820);
    } else if (kind === 'fox') { // bóng cửu vĩ hồ lướt ngang qua đội địch
      for (let i = 0; i < 3; i++) put(R.width + 60, sy(gy) - 30 + (i - 1) * 46, 120, 'dash', i * 140);
      Sound.sfx('wind'); await sleep(520); pts.forEach((p) => FX.impact('shadow', p)); await sleep(420);
    } else if (kind === 'monkey') { // phân thân Tề Thiên vây đánh
      pts.forEach((p, i) => { for (let j = 0; j < 3; j++) { const a = (j / 3) * 6.283 + i; put(p.x + Math.cos(a) * 52, sy(p.y) - 20 + Math.sin(a) * 22, 56, 'pop', j * 70 + i * 50); } });
      Sound.sfx('gold'); await sleep(700);
    }
    layer.classList.add('out'); setTimeout(() => layer.remove(), 420);
  }
  // ---------- liên kích ----------
  let combo = 0, comboSide = -1;
  function comboHit(side) {
    if (side !== comboSide) { combo = 0; comboSide = side; }
    combo++;
    if (combo >= 2 && side === 0) {
      let el = $('#b-combo'); if (!el) { el = document.createElement('div'); el.id = 'b-combo'; root.appendChild(el); }
      el.innerHTML = `<small>Liên kích</small><b>×${combo}</b>`; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    }
  }

  // bóng mờ khi lướt tới
  async function assist(ev) {
    const box = document.createElement('div'); box.className = 'assist';
    const pix = Art.npc(ev.who, 0, 4, 'angry');
    box.innerHTML = `${pix ? `<img src="${pix.url}" alt="">` : ''}<div class="as-txt"><small>${esc(ev.name)}</small><b>${esc(ev.s)}</b><i>${esc(ev.line || '')}</i></div>`;
    root.appendChild(box); Sound.sfx(ev.fx === 'heal' ? 'heal' : 'charge');
    await sleep(650);
    for (const h of ev.hits) { applyHit(h, { k: 'skill', fx: ev.fx, a: 'p' }); await sleep(ev.hits.length > 1 ? 140 : 60); }
    $('#b-log').textContent = `${ev.name} trợ chiến: ${ev.s}`;
    await sleep(550); box.classList.add('out'); setTimeout(() => box.remove(), 350); await sleep(200);
  }
  function ghosts(a, dx, dy) {
    if (FX.low) return;
    const spr = a.querySelector('.spr'); if (!spr) return;
    for (let i = 1; i <= 3; i++) {
      const gh = spr.cloneNode(true); gh.className = 'spr ghost'; gh.querySelectorAll('canvas.pup').forEach((c) => c.remove()); gh.querySelectorAll('.pup-on').forEach((m) => m.classList.remove('pup-on'));
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
    $('#b-log').textContent = `Tỷ lệ thu phục: ${ev.rate}%`;
    const beats = ev.ok ? 3 : 1 + Math.floor(Math.random() * 3);   // thất bại có thể bung ra giữa chừng
    for (let i = 0; i < beats; i++) {
      g.classList.remove('wobble'); void g.offsetWidth; g.classList.add('wobble');
      Sound.sfx('click'); FX.ring(to.x, to.y - 20, i === 2 ? '#fff6c8' : '#ffd65a', 30 + i * 12, 18, 2);
      $('#b-log').textContent = `Tỷ lệ thu phục: ${ev.rate}% ${'●'.repeat(i + 1)}${'○'.repeat(2 - i)}`;
      await sleep(i === 2 ? 620 : 520);
    }
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
    if (win && res.ups && res.ups.length) { const p = rectOf('p'); if (p) { FX.pillar(p.x, p.y + 40, '#ffe08a', 70, 70); FX.rays(p.x, p.y, '#fff0a0', 70, 180); } Sound.sfx('gong'); num('p', 'THĂNG CẤP!', 'lvup'); await sleep(900); }
    if (win) { A3.flash('#fff2c0', 0.5, 700); FX.victory(); setTimeout(() => Sound.sfx('fireworks'), 300); snap?.units.forEach((u) => { if (u.side === 0 && !u.dead) setExpr(u.id, 'smile'); }); }
    if (win || res.outcome === 'lose') { // băng THẮNG / BẠI như bản gốc
      const bn = document.createElement('div'); bn.className = 'b-thang ' + (win ? 'win' : 'lose');
      bn.innerHTML = `<b>${win ? 'THẮNG' : 'BẠI'}</b>${win && res.exp ? `<span>${esc(G.me.name)} · Kinh nghiệm +${fmt(res.exp)}</span>` : ''}`;
      root.appendChild(bn); setTimeout(() => bn.remove(), 1700); await sleep(1100);
    }
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
      ...res.equips.map((e) => `<span class="loot ${e.q >= 3 ? 'rare q' + e.q : ''}" style="--q:${G.meta.QUALITIES[e.q].color}"><i>${G.meta.SLOTS[e.slot].icon}</i><small style="color:${Panels.PAPER_Q[e.q]}">${esc(e.name)}</small></span>`),
      ...res.captured.map((p) => `<span class="loot ${p.grade >= 2 ? 'rare q' + (p.grade + 1) : ''}" style="--q:${G.meta.GRADES[p.grade].color}"><i>${Sprites.petImg(p)}</i><small style="color:${Panels.PAPER_G[p.grade]}">${esc(p.name)}</small></span>`),
    ];
    let html = `<div class="victory ${win ? 'win' : 'lose'}"><div class="v-title">${titles[res.outcome] || 'Kết Thúc'}</div></div>`;
    if (res.kind === 'world' && res.outcome !== 'lose') html += `<p class="muted center">Phần thưởng theo sát thương bạn gây ra cho boss.</p>`;
    if (slots.length) html += `<div class="v-stats">${slots.map(([i, v, l]) => `<div><span>${i}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>`;
    if (loot.length) html += `<div class="sec">Chiến lợi phẩm</div><div class="v-loot">${loot.join('')}</div>`;
    if (res.ups.length) html += `${Sprites.art('fx', 'thang_cap') ? `<img class="v-lvup" src="${Sprites.art('fx', 'thang_cap')}" alt="">` : ''}<p class="v-note gold">Thăng lên cấp ${res.ups[res.ups.length - 1]}! Nhớ cộng điểm tiềm năng.</p>`;
    if (res.petUps) html += `<p class="v-note">Tiên sủng tăng ${res.petUps} cấp.</p>`;
    if (res.towerFloor) html += `<p class="v-note gold">🗼 Vượt tầng ${res.towerFloor} Trấn Yêu Tháp!${res.towerGot && res.towerGot.length ? ' Nhận: ' + res.towerGot.map(esc).join(', ') : ''}</p>`;
    if (res.mountGot) html += `<p class="v-note">🐎 Thuần phục được thú cưỡi thần <b>${esc(res.mountGot)}</b>! Vào Thú cưỡi để cưỡi.</p>`;
    if (res.tip) { const wk = Art.npc('ngokhong', 0, 3, 'angry'); html += `<div class="v-tip">${wk ? `<img src="${wk.url}" alt="">` : '🐵'}<p><b>Ngộ Không:</b> ${esc(res.tip)}</p></div>`; }
    if (res.quest) html += `<p class="v-note">📜 Hoàn thành «${esc(res.quest.title)}» · vượt ${res.quest.nan} kiếp nạn</p>`;
    if (res.outcome === 'lose' && res.respawn) html += `<p class="muted center">Bạn được đưa về điểm hồi sinh.</p>`;
    await UI.modal(html, [{ id: 'ok', label: 'Tiếp tục' }]);
    if (typeof Living !== 'undefined') Living.battleStop();
    Puppet.clear();
    root.hidden = true;
    if (typeof Arena !== 'undefined') Arena.hide(); pushOut();
    closePick(); FX.clear(); root.classList.remove('dim', 'defeat');
    snap = null;
    Sound.play(G.meta.MAPS[G.me.map]?.theme || 'city');
    Sound.ambient(G.meta.MAPS[G.me.map]?.theme);
    Tut.event('battleEnd');
    onEnd && onEnd(res);
  }

  return { start, get active() { return !root.hidden; } };
})();
