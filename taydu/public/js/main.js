// Điều phối: màn chào, đăng nhập, tạo nhân vật, HUD, di chuyển, NPC, chiến đấu, âm thanh, sự kiện máy chủ
const G = {
  meta: null, me: null, chat: [], pending: [], boss: null, kicked: false,

  async call(e, d, quiet) {
    const r = await Net.emit(e, d);
    if (r.state) G.setState(r.state);
    if (!quiet && r.msg) UI.toast(r.msg, r.ok ? '' : 'err');
    if (r.ok && /^(shop:buy|item:sell|pet:release)$/.test(e)) Sound.sfx('coin');
    return r;
  },
  count(id) { return (G.me.bag.find((b) => b.t === 'item' && b.id === id) || {}).qty || 0; },

  setState(s, fromBattle) {
    G.me = s;
    if (s.map !== GameMap.id) { GameMap.setMap(s.map, G.meta.MAPS[s.map]); GameMap.snap([s.x, s.y]); }
    GameMap.setMe(s);
    updateHud();
    if (!fromBattle && UI.sheet.open && ['char', 'pet', 'bag', 'quest'].includes(UI.sheet.name)) UI.refreshSheet();
  },
  patchHud(p) { if (G.me) { Object.assign(G.me, p); updateHud(); } },
  startBattle(b) { startBattle(b); },
  onTravel(r) { onTravel(r); },
  goQuest() { goQuest(); },
  updateBadges() { updateBadges(); },
};

// ---------------- trang trí giao diện ----------------
(function decorate() {
  const c = Sprites.corners(), root = document.documentElement.style;
  root.setProperty('--c-tl', c.tl); root.setProperty('--c-tr', c.tr); root.setProperty('--c-bl', c.bl); root.setProperty('--c-br', c.br);
  root.setProperty('--paper-tex', `url("${Sprites.paperTexture()}")`);
  $$('[data-i]').forEach((el) => (el.innerHTML = Sprites.ICONS[el.dataset.i] || ''));
  $('#hud-gear').innerHTML = Sprites.ICONS.gear;
  const bg = `url("${Sprites.battleBG('login')}")`;
  ['#splash-bg', '#login-bg', '#create-bg'].forEach((s) => ($(s).style.backgroundImage = bg));
})();

// ---------------- màn hình ----------------
function show(id) { ['#scr-splash', '#scr-login', '#scr-create', '#scr-game'].forEach((s) => ($(s).hidden = s !== id)); }

async function loadMeta() {
  if (G.meta) return;
  const r = await Net.emit('meta');
  if (r.ok) { G.meta = r.meta; Sprites.setAssets(r.meta.ASSETS); }
}

// ---------------- màn chào ----------------
let started = false, connectedOnce = false;
$('#tap-start').onclick = () => {
  Sound.unlock();
  Sound.sfx('gong');
  started = true;
  $('#tap-start').disabled = true;
  if (connectedOnce) boot();
};
function setSplashNote(t) { $('#splash-note').textContent = t; }

async function boot() {
  if (G.kicked) return;
  const tok = localStorage.getItem('tdk_token');
  if (tok) {
    const r = await Net.emit('auth:token', { token: tok });
    if (r.ok) return r.hasChar ? enter() : showCreate();
    localStorage.removeItem('tdk_token');
  }
  Sound.play('login');
  show('#scr-login');
}

// ---------------- đăng nhập ----------------
let loginMode = 'login';
$$('#f-login .seg-b').forEach((b) => (b.onclick = () => {
  loginMode = b.dataset.mode;
  $$('#f-login .seg-b').forEach((x) => x.classList.toggle('on', x === b));
  $('#b-login').textContent = loginMode === 'login' ? 'Vào game' : 'Tạo tài khoản';
  $('#f-login [name=pass]').autocomplete = loginMode === 'login' ? 'current-password' : 'new-password';
}));
$('#f-login').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  $('#login-err').textContent = '';
  const r = await Net.emit(loginMode === 'login' ? 'auth:login' : 'auth:register', { user: f.user.value, pass: f.pass.value });
  if (!r.ok) { $('#login-err').textContent = r.msg; Sound.sfx('error'); return; }
  localStorage.setItem('tdk_token', r.token);
  r.hasChar ? enter() : showCreate();
};
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone) $('#install-hint').hidden = false;

// ---------------- tạo nhân vật ----------------
let cRace = 'than', cGender = 'm';
function showCreate() {
  show('#scr-create');
  Sound.play('login');
  const R = G.meta.RACES;
  const draw = () => {
    $('#create-hero').src = Sprites.heroURL(cRace, cGender);
    $('#race-list').innerHTML = Object.entries(R).map(([k, r]) => `<button class="race ${k === cRace ? 'on' : ''}" data-r="${k}">
      <img src="${Sprites.heroURL(k, cGender)}" alt=""><h4>${r.name}</h4>
      <div class="rstats">Thể ${r.base.the} · Lực ${r.base.luc}<br>Pháp ${r.base.phap} · Nhanh ${r.base.nhanh}</div></button>`).join('');
    let desc = $('#race-desc');
    if (!desc) { desc = document.createElement('p'); desc.id = 'race-desc'; desc.className = 'race-desc'; $('#race-list').after(desc); }
    desc.textContent = R[cRace].desc;
    $$('#race-list .race').forEach((b) => (b.onclick = () => { cRace = b.dataset.r; Sound.sfx('buff'); draw(); }));
  };
  draw();
  $$('#scr-create .gender .seg-b').forEach((b) => (b.onclick = () => { cGender = b.dataset.g; $$('#scr-create .gender .seg-b').forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
}
$('#b-create').onclick = async () => {
  $('#create-err').textContent = '';
  const r = await Net.emit('char:create', { name: $('#c-name').value, race: cRace, gender: cGender });
  if (!r.ok) { $('#create-err').textContent = r.msg; Sound.sfx('error'); return; }
  Sound.sfx('levelup');
  enter(true);
};

// ---------------- vào game ----------------
async function enter(first) {
  const r = await Net.emit('enter');
  if (!r.ok) { UI.toast(r.msg, 'err'); show('#scr-login'); return; }
  show('#scr-game');
  G.me = null;
  GameMap.setMap(r.state.map, G.meta.MAPS[r.state.map]);
  GameMap.snap([r.state.x, r.state.y]);
  G.setState(r.state);
  GameMap.setPlayers(r.players);
  G.chat = r.chat || [];
  G.pending = r.pending || [];
  G.boss = r.boss;
  renderTicker(); updateBadges();
  requestAnimationFrame(() => GameMap.resize());
  if (r.battle) return startBattle(r.battle);
  Sound.play(G.meta.MAPS[r.state.map].theme);
  mapTitle();
  if (first) {
    setTimeout(() => UI.dialog({ name: 'Thái Bạch Kim Tinh', icon: '🧙‍♂️', npc: 'thaibach', text: `Chào ${r.state.name}! Đây là Thiên Cung. Chạm vào bản đồ để đi, chạm vào NPC để trò chuyện. Ta đang đứng gần ngươi – lại đây nhận nhiệm vụ đầu tiên nhé. Nhớ ghé Tiên Đồng trị thương và Tiên Thương mua Bầu Bạc để thu phục Tiên sủng.`, options: [] }), 1600);
  }
}

function mapTitle() {
  const m = G.meta.MAPS[G.me.map];
  const el = $('#map-title');
  el.innerHTML = `<small>Chương ${m.chapter} · ${esc(m.sub || '')}</small><b>${esc(m.name)}</b>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}

// ---------------- HUD ----------------
function updateHud() {
  const c = G.me; if (!c) return;
  const d = c.derived;
  const src = Sprites.heroURL(c.race, c.gender);
  if ($('#hud-img').getAttribute('src') !== src) $('#hud-img').src = src;
  $('#hud-name').textContent = c.name;
  $('#hud-lv').textContent = c.lvl;
  $('#hud-pow').textContent = 'Lực chiến ' + fmt(c.power);
  $('#hud-hp').style.width = Math.min(100, 100 * c.hp / d.maxHp) + '%';
  $('#hud-mp').style.width = Math.min(100, 100 * c.mp / d.maxMp) + '%';
  $('#hud-xp').style.width = Math.min(100, 100 * c.exp / c.need) + '%';
  $('#hud-hpt').textContent = `${fmt(c.hp)}/${fmt(d.maxHp)}`;
  $('#hud-mpt').textContent = `${fmt(c.mp)}/${fmt(d.maxMp)}`;
  $('#hud-bac').textContent = fmt(c.bac);
  $('#hud-vang').textContent = fmt(c.vang);
  $('#map-name').textContent = G.meta.MAPS[c.map].name;
  const q = c.quest;
  $('#quest-track').innerHTML = q.done ? '<b>Đã thỉnh kinh thành công</b> · 81/81 kiếp nạn'
    : `${q.no ? `<b>Nạn ${q.no}:</b> ` : ''}<b>${esc(q.title)}</b> · ${esc(q.type === 'kill' ? `Diệt quái ${q.prog}/${q.count}` : q.text)}`;
  GameMap.questNpc = !q.done && q.map === c.map ? (q.type === 'talk' ? q.npc : q.type === 'boss' ? q.boss : null) : null;
  const pb = $('#pt-badge');
  pb.hidden = !c.points;
  pb.textContent = `+${c.points} điểm tiềm năng`;
  updateBadges();
}
function updateBadges() {
  if (!G.me) return;
  $('[data-p="char"]').classList.toggle('dot', G.me.points > 0);
  $('[data-p="social"]').classList.toggle('dot', G.pending.length > 0);
}

function renderTicker() {
  const last = G.chat.slice(-2);
  $('#ticker').innerHTML = last.map((m) => `<div><span class="chn ${m.ch}">[${{ khu: 'Khu', phai: 'Phái', shop: 'Shop', he: 'HT' }[m.ch]}]</span>${m.fromId ? `<b>${esc(m.from)}</b>: ` : ''}${esc(m.text)}</div>`).join('') || '<div style="opacity:.6">Kênh chat – chạm để mở</div>';
}

$('#hud-ava').onclick = () => Panels.char();
$('#hud-gear').onclick = () => settings();
$('#pt-badge').onclick = () => Panels.char('info');
$('#map-chip').onclick = () => Panels.act('travel');
$('#quest-track').onclick = () => Panels.quest();
$('#ticker').onclick = () => Panels.social('chat');
$$('.nav button').forEach((b) => (b.onclick = () => Panels[b.dataset.p]()));
document.addEventListener('click', (e) => { if (e.target.closest('button:not(.seal):not([data-close]):not(.tap-start)')) Sound.sfx('click'); });

// ---------------- cài đặt ----------------
function settings() {
  UI.openSheet('settings', 'Cài đặt', null, (body) => {
    const st = Sound.settings;
    body.innerHTML = `
      <div class="set-row"><span class="ic">${Sprites.ICONS.sound}</span><label style="margin:0">Nhạc nền<input type="range" id="s-music" min="0" max="100" value="${Math.round(st.music * 100)}"></label><output id="o-music">${Math.round(st.music * 100)}</output></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.skill}</span><label style="margin:0">Hiệu ứng âm thanh<input type="range" id="s-sfx" min="0" max="100" value="${Math.round(st.sfx * 100)}"></label><output id="o-sfx">${Math.round(st.sfx * 100)}</output></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.gear}</span><div><b>Hiệu ứng nhẹ</b><div class="muted">Bật trên iPhone đời cũ để mượt hơn.</div></div><button class="toggle ${FX.low ? 'on' : ''}" id="s-low" aria-label="Hiệu ứng nhẹ"></button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.flee}</span><div><b>Tránh quái</b><div class="muted">Đi lại không gặp quái ngẫu nhiên.</div></div><button class="toggle ${G.me.peace ? 'on' : ''}" id="s-peace" aria-label="Tránh quái"></button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.sound}</span><div><b>Thử âm thanh</b><div class="muted" id="s-state">Trạng thái: ${Sound.state === 'running' ? 'đang phát' : Sound.state}</div></div><button class="btn-seal sm jade" id="s-test">Phát thử</button></div>
      <p class="muted" style="margin-top:10px">Không nghe thấy? Tăng âm lượng bằng nút bên hông iPhone khi đang ở trong game (âm lượng phương tiện), tắt chế độ Tập trung/Không làm phiền nếu có, rồi bấm Phát thử.</p>
      <p class="muted" style="margin-top:14px">Bản đồ đổi sáng tối theo giờ thật trên máy. Một số nhiệm vụ ẩn chỉ xuất hiện vào giờ nhất định.</p>
      <div class="btns"><button class="btn-seal ghost" id="s-logout">Đăng xuất</button></div>`;
    const bind = (id, k) => { const i = $('#s-' + id); i.oninput = () => { $('#o-' + id).textContent = i.value; Sound.set(k, i.value / 100); }; i.onchange = () => Sound.sfx('click'); };
    bind('music', 'music'); bind('sfx', 'sfx');
    $('#s-test').onclick = () => { Sound.test(); setTimeout(() => { const el = $('#s-state'); if (el) el.textContent = 'Trạng thái: ' + (Sound.state === 'running' ? 'đang phát' : Sound.state); }, 300); };
    $('#s-low').onclick = () => { FX.setLow(!FX.low); GameMap.initAmb(); UI.refreshSheet(); };
    $('#s-peace').onclick = async () => { await G.call('char:peace'); UI.refreshSheet(); };
    $('#s-logout').onclick = async () => { if (await UI.confirm('<p>Đăng xuất khỏi thiết bị này?</p>', 'Đăng xuất')) { localStorage.removeItem('tdk_token'); location.reload(); } };
  });
}

// ---------------- di chuyển ----------------
let walkTok = 0, inflight = null;
// target: mảng các ô, hoặc hàm đích (x, y) => bool – đường đi được tính SAU khi bước đang đi xong,
// tránh lệch vị trí với máy chủ ("Bước không hợp lệ") khi chạm liên tục / mạng chậm.
async function walk(target, then) {
  const tok = ++walkTok;
  while (inflight) { try { await inflight; } catch {} }
  if (tok !== walkTok) return;
  let route = typeof target === 'function' ? GameMap.path([G.me.x, G.me.y], target) : target;
  if (!route) { if (typeof target === 'function' && target(G.me.x, G.me.y) && then) then(); return; }
  const goal = route[route.length - 1];
  let retried = false;
  for (let i = 0; i < route.length; i++) {
    const [x, y] = route[i];
    if (tok !== walkTok || BattleUI.active) return;
    const anim = GameMap.animateTo(x, y, 160);
    inflight = Net.emit('move', { x, y });
    let r;
    try { r = await inflight; } finally { inflight = null; }
    await anim;
    if (!r.ok) {
      if (r.pos) { G.me.x = r.pos[0]; G.me.y = r.pos[1]; }
      GameMap.snap([G.me.x, G.me.y]);
      if (!r.msg || r.msg === 'Bước không hợp lệ') { // lệch vị trí: tự tính lại đường, không báo lỗi
        if (G.me.x === goal[0] && G.me.y === goal[1]) break;
        const nr = !retried && GameMap.path([G.me.x, G.me.y], (a, b) => a === goal[0] && b === goal[1]);
        if (nr) { retried = true; route = nr; i = -1; continue; }
        return;
      }
      UI.toast(r.msg); return;
    }
    Sound.sfx('step');
    G.me.x = x; G.me.y = y;
    if (r.regen) G.patchHud({ hp: r.regen[0], mp: r.regen[1] });
    if (r.state) G.setState(r.state);
    if (r.msg) UI.toast(r.msg);
    if (r.secret) { await showSecret(r.secret); }
    if (r.travel) { onTravel(r); return; }
    if (r.battle) { startBattle(r.battle); return; }
  }
  if (tok === walkTok && then) then();
}

function npcAt(x, y) { return GameMap.meta.npcs.find((n) => n.x === x && n.y === y); }
const adjacent = (n) => (x, y) => Math.abs(x - n.x) + Math.abs(y - n.y) === 1;

function goToNpc(n) {
  const me = [G.me.x, G.me.y];
  if (adjacent(n)(...me)) return talk(n.id);
  if (!GameMap.path(me, adjacent(n))) return UI.toast('Không tìm được đường tới ' + n.name);
  walk(adjacent(n), () => talk(n.id));
}

function onMapTap(x, y) {
  if (BattleUI.active) return;
  const n = npcAt(x, y);
  if (n) return goToNpc(n);
  if (x === G.me.x && y === G.me.y) return;
  walk((a, b) => a === x && b === y);
}
GameMap.onTap = onMapTap;

function onTravel(r) {
  walkTok++;
  GameMap.setMap(G.me.map, G.meta.MAPS[G.me.map]);
  GameMap.snap([G.me.x, G.me.y]);
  GameMap.setPlayers(r.players || []);
  updateHud();
  Sound.sfx('portal');
  Sound.play(G.meta.MAPS[G.me.map].theme);
  mapTitle();
}

async function goQuest() {
  const q = G.me.quest;
  if (q.done) return;
  if (q.map !== G.me.map) {
    const r = await G.call('map:travel', { map: q.map });
    if (!r.ok) return;
    onTravel(r);
    await sleep(250);
  }
  if (q.type === 'kill') {
    const route = GameMap.path([G.me.x, G.me.y], (x, y) => GameMap.meta.tiles[y][x] === ',');
    if (route) walk(route.concat(route.length > 1 ? [route[route.length - 2]] : []));
    return;
  }
  const npc = GameMap.meta.npcs.find((n) => n.id === (q.type === 'talk' ? q.npc : q.boss));
  if (npc) goToNpc(npc);
}

// ---------------- NPC ----------------
async function talk(id) {
  const r = await Net.emit('npc:talk', { id });
  if (!r.ok) return UI.toast(r.msg, 'err');
  const d = r.dialog;
  UI.dialog(d, async (opt) => {
    if (opt === 'shop') { UI.closeDialog(); return Panels.shop(); }
    if (opt === 'peach') { UI.closeDialog(); return Panels.peach(); }
    if (opt === 'dice') { UI.closeDialog(); return Panels.dice(); }
    if (opt === 'rps') { UI.closeDialog(); return Panels.rps(); }
    const a = await G.call('npc:act', { id, opt });
    if (!a.ok) return;
    if (opt === 'heal') Sound.sfx('heal');
    if (a.battle) { UI.closeDialog(); return startBattle(a.battle); }
    if (a.secret) { UI.closeDialog(); return showSecret(a.secret); }
    if (a.quest) {
      UI.dialog({ name: d.name, icon: d.icon, npc: d.npc, text: a.dialogText || 'Tốt lắm!', options: [] });
      questToast(a.quest);
      return;
    }
    UI.closeDialog();
  });
}

function questToast(q) {
  Sound.sfx('quest');
  UI.toast(`📜 ${q.no ? `Vượt nạn thứ ${q.no}: ` : 'Hoàn thành '}«${q.title}» · +${fmt(q.exp)} tu vi · +${fmt(q.bac)} bạc${q.vang ? ` · +${q.vang} vàng` : ''}`, 'gold');
  if (q.unlocked) setTimeout(() => UI.toast(`🗺️ Mở chương mới: ${q.unlockedName}`, 'gold'), 600);
  if (G.me.quest && !G.me.quest.done && G.me.quest.map !== G.me.map && G.me.unlocked >= G.meta.MAPS[G.me.quest.map].chapter) {
    UI.toast('Chương mới đã mở! Đi qua cổng phía bắc hoặc dùng Truyền tống.', 'gold');
  }
}

function showSecret(s) {
  Sound.sfx('secret');
  return UI.modal(`<div class="victory win"><div class="v-title" style="font-size:30px">Nhiệm Vụ Ẩn</div></div><p style="text-align:center;font-size:18px;font-weight:700;margin:4px 0">«${esc(s.name)}»</p><p style="text-align:center">Phần thưởng: <b>${esc(s.reward)}</b></p>`, [{ id: 'ok', label: 'Tuyệt vời' }]);
}

// ---------------- chiến đấu ----------------
function startBattle(b) {
  walkTok++;
  UI.closeDialog(); UI.closeSheet();
  BattleUI.start(b, {
    onEnd: (res) => {
      if (res.players) GameMap.setPlayers(res.players);
      GameMap.snap([G.me.x, G.me.y]);
      if (res.quest) questToast(res.quest);
      if (G.me.hp < G.me.derived.maxHp * 0.3) UI.toast('Khí huyết thấp – dùng Kim Sang Dược hoặc gặp NPC trị thương.', 'err');
    },
  });
}

// ---------------- sự kiện máy chủ ----------------
Net.on('state', (s) => G.setState(s));
Net.on('toast', (t) => { UI.toast(t.msg, t.type); if (/Thăng cấp/.test(t.msg)) Sound.sfx('levelup'); });
Net.on('chat', (m) => {
  G.chat.push(m); if (G.chat.length > 300) G.chat.shift();
  renderTicker();
  if (G.me && m.fromId && m.fromId !== G.me.id) Sound.sfx('chat');
  const log = $('#chat-log');
  if (log && UI.sheet.name === 'social' && UI.sheet.tab === 'chat' && $(`.seg-b.on[data-ch="${m.ch}"]`)) {
    const atBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 30;
    log.querySelector('.empty')?.remove();
    log.insertAdjacentHTML('beforeend', Panels.chatLine(m));
    if (atBottom) log.scrollTop = log.scrollHeight;
  }
});
Net.on('map:join', (p) => { if (G.me && p.id !== G.me.id) GameMap.addPlayer(p); });
Net.on('map:move', (p) => GameMap.movePlayer(p));
Net.on('map:leave', (p) => GameMap.removePlayer(p.id));
Net.on('boss:update', (b) => { G.boss = b; if (UI.sheet.name === 'act' && UI.sheet.tab === 'list') UI.refreshSheet(); });
Net.on('social:req', (r) => { G.pending.push(r); updateBadges(); Sound.sfx('quest'); UI.toast(`${r.fromName} ${r.type === 'marry' ? 'gửi lời cầu hôn 💍' : 'muốn bái bạn làm sư phụ 📿'} – xem ở Giao lưu`, 'gold'); });
Net.on('kicked', async (k) => {
  G.kicked = true;
  await UI.modal(`<h3>Đã đăng xuất</h3><p style="text-align:center">${esc(k.msg)}</p>`, [{ id: 'ok', label: 'Vào lại trên máy này' }]);
  G.kicked = false; location.reload();
});

Net.on('open', async () => {
  $('#netbar').hidden = true;
  await loadMeta();
  connectedOnce = true;
  setSplashNote('');
  if (G.kicked) return;
  if (started) boot();
});
Net.on('close', () => { if (G.me && !G.kicked) $('#netbar').hidden = false; if (!connectedOnce) setSplashNote('Không kết nối được máy chủ – kiểm tra máy tính đang chạy CHAY-GAME.bat'); });

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('visibilitychange', () => { if (!document.hidden && G.me && !BattleUI.active) Sound.play(G.meta.MAPS[G.me.map].theme); });
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
show('#scr-splash');
Net.connect();
setTimeout(() => { if (!connectedOnce) setSplashNote('Không kết nối được máy chủ – kiểm tra máy tính đang chạy CHAY-GAME.bat'); }, 5000);
