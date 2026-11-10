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
  ['#login-bg', '#create-bg'].forEach((s) => $(s) && ($(s).style.backgroundImage = bg));
  // tranh vẽ tay cho màn đăng nhập (nếu có)
  paintBG('#login-bg', 'assets/ui/login.webp');
})();
function paintBG(sel, url) {
  const el = $(sel); if (!el || el.dataset.art === url) return;
  const im = new Image();
  im.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add('artbg'); el.dataset.art = url; };
  im.src = url;
}

// ---------------- màn hình ----------------
function show(id) { ['#scr-splash', '#scr-login', '#scr-create', '#scr-game'].forEach((s) => ($(s).hidden = s !== id)); if (id === '#scr-splash') Title.resume(); else Title.stop(); }

async function loadMeta() {
  if (G.meta) return;
  const r = await Net.emit('meta');
  if (r.ok) { G.meta = r.meta; Sprites.setAssets(r.meta.ASSETS); }
}

// ---------------- màn chào ----------------
let started = false, connectedOnce = false, startMode = null;
Title.init();
function begin(mode) {
  Sound.unlock();
  Sound.sfx('gong');
  started = true; startMode = mode;
  $$('#sp-ring button').forEach((b) => (b.disabled = true));
  if (connectedOnce) boot();
}
$('#tap-start').onclick = () => begin(null);
$$('.sp-orb').forEach((b) => (b.onclick = () => begin(b.dataset.go)));
$('#b-back').onclick = () => { started = false; $$('#sp-ring button').forEach((b) => (b.disabled = false)); show('#scr-splash'); };
function setSplashNote(t) { $('#splash-note').textContent = t; }

async function boot() {
  if (G.kicked) return;
  const tok = !startMode && localStorage.getItem('tdk_token');
  if (tok) {
    const r = await Net.emit('auth:token', { token: tok });
    if (r.ok) return r.hasChar ? enter() : showCreate();
    localStorage.removeItem('tdk_token');
  }
  Sound.play('login');
  setLoginMode(startMode || 'login');
  show('#scr-login');
}

// ---------------- đăng nhập ----------------
let loginMode = 'login';
function setLoginMode(m) {
  loginMode = m;
  $$('#f-login .seg-b').forEach((x) => x.classList.toggle('on', x.dataset.mode === m));
  $('#b-login').textContent = { login: 'Vào game', register: 'Tạo tài khoản', recover: 'Đặt lại mật khẩu' }[m];
  $('#pass-lbl').textContent = m === 'recover' ? 'Mật khẩu mới' : 'Mật khẩu';
  $('#f-login .rc-only').hidden = m !== 'recover';
  $('#f-login [name=code]').required = m === 'recover';
  $('#f-login [name=pass]').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  $('#login-err').textContent = '';
}
$$('#f-login .seg-b').forEach((b) => (b.onclick = () => setLoginMode(b.dataset.mode)));
// mã khôi phục: hiện một lần, người chơi tự chép lại
async function showRecovery(code, first) {
  await UI.modal(`<h3 style="font-size:20px">🗝 Mã khôi phục</h3>
    <p>${first ? 'Tài khoản đã được tạo.' : 'Mã mới đã được tạo, mã cũ hết hiệu lực.'} Hãy <b>chép lại hoặc chụp màn hình</b> mã dưới đây – dùng để đặt lại mật khẩu khi quên.</p>
    <div class="rc-code" id="rc-code">${code}</div>
    <p class="muted">Mã chỉ hiện một lần. Không đưa mã cho người khác.</p>`, [{ id: 'ok', label: 'Tôi đã lưu mã' }]);
}
$('#f-login').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  $('#login-err').textContent = '';
  const ev = { login: 'auth:login', register: 'auth:register', recover: 'auth:recover' }[loginMode];
  const r = await Net.emit(ev, { user: f.user.value, pass: f.pass.value, code: f.code.value });
  if (!r.ok) { $('#login-err').textContent = r.msg; Sound.sfx('error'); return; }
  localStorage.setItem('tdk_token', r.token);
  if (r.recovery) await showRecovery(r.recovery, loginMode === 'register');
  r.hasChar ? enter() : showCreate();
};
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone) $('#install-hint').hidden = false;

// ---------------- tạo nhân vật ----------------
// ---------------- chọn nhân vật (bố cục như bản gốc: 3 cột phái, mỗi cột 6 gương mặt) ----------------
let cRace = 'phat', cFace = 0, csMode = 'create';
const FACTION = {
  phat: { hall: 'Lôi Âm Tự · Linh Sơn', role: 'Kim Cang · Cận chiến, chịu đòn', aura: 'rgba(255,214,90,.8)', pros: ['Khí huyết và sức mạnh cao', 'Xả Thân, Chân Hỏa, Phật Quang', 'Kháng Định Thân tốt'] },
  yeu: { hall: 'Bàn Ti Động · U Minh Giới', role: 'Yêu Ma · Nhanh nhẹn, khống chế', aura: 'rgba(200,120,255,.8)', pros: ['Tốc độ ra đòn nhanh nhất', 'Phong Ấn, Mê Hồn, Vạn Độc', 'Kháng Phong Ấn tốt'] },
  tien: { hall: 'Lăng Tiêu Bảo Điện · Thiên Đình', role: 'Thần · Pháp thuật, hồi phục', aura: 'rgba(110,190,255,.8)', pros: ['Pháp lực dồi dào', 'Định Thân, Loạn Hồn, Hồi Sinh', 'Kháng Loạn Hồn tốt'] },
};
const COL_ORDER = ['phat', 'yeu', 'tien'];
const NAME_A = ['Thanh', 'Huyền', 'Lăng', 'Vân', 'Phong', 'Hạo', 'Tử', 'Bạch', 'Kim', 'Ngọc', 'Thiên', 'Dạ', 'Linh', 'Tuyết', 'Hàn', 'Mộ'];
const NAME_B = ['Phong', 'Vân', 'Nguyệt', 'Long', 'Hà', 'Thiên', 'Sương', 'Minh', 'Diệp', 'Kiếm', 'Hồ', 'Tâm', 'Dương', 'Lam', 'Tinh', 'Vũ'];
function showCreate(mode = 'create') {
  csMode = mode;
  show('#scr-create');
  Sound.play('login');
  const R = G.meta.RACES;
  if (mode === 'face') { cRace = G.me.race; cFace = G.me.face || 0; UI.closeSheet(); UI.closeDialog(); }
  $('#cs-title').textContent = mode === 'face' ? 'Đổi Gương Mặt (miễn phí 1 lần)' : 'Chọn Nhân Vật';
  $('#cs-foot').hidden = mode === 'face';
  $('#b-create').textContent = mode === 'face' ? 'Xác nhận' : 'Chọn';
  $('#b-random').textContent = mode === 'face' ? 'Để sau' : 'Ngẫu nhiên';
  const draw = () => {
    const F = FACTION[cRace], r = R[cRace], av = r.avatars[cFace], look = { look: cFace };
    $('#create-hero').src = Sprites.heroURL(cRace, av.gender, 0, look);
    $('#create-hero').classList.remove('pop'); void $('#create-hero').offsetWidth; $('#create-hero').classList.add('pop');
    $('#cs-face').src = Sprites.faceURL(cRace, av.gender, look);
    $('#cr-aura').style.setProperty('--aura', F.aura);
    paintBG('#create-bg', `assets/ui/phai_${cRace}.webp`);
    $('#cs-phai').textContent = `${r.name} (${r.title})`; $('#cs-gioi').textContent = av.gender === 'f' ? 'Nữ' : 'Nam';
    $('#cs-name').textContent = av.name; $('#cs-lore').textContent = av.lore;
    $('#race-list').innerHTML = COL_ORDER.map((k) => `<div class="cs-col c-${k} ${k === cRace ? 'on' : ''} ${mode === 'face' && k !== cRace ? 'lock' : ''}">
      <span class="cs-emb">${R[k].name}</span>
      <div class="cs-grid">${R[k].avatars.map((a, i) => `<button class="cs-f ${k === cRace && i === cFace ? 'sel' : ''}" data-r="${k}" data-f="${i}" aria-label="${a.name}"><img src="${Sprites.faceURL(k, a.gender, { look: i })}" alt=""></button>`).join('')}</div></div>`).join('');
    const kind = ['the', 'luc', 'phap', 'nhanh'].reduce((a, b) => (r.base[b] > r.base[a] ? b : a), 'the');
    $('#cr-info').innerHTML = `<div class="cr-body">${Panels.radar({ stats: r.base }, {})}
      <div class="cr-desc"><p><b style="color:${r.color}">${r.name} · ${r.title}</b> – ${esc(r.desc)}</p><ul>${F.pros.map((p) => `<li>${p}</li>`).join('')}</ul><p class="muted">${F.hall} · ${F.role}</p></div></div>`;
    $$('#race-list .cs-f').forEach((b) => (b.onclick = () => {
      if (mode === 'face' && b.dataset.r !== cRace) { UI.toast('Chỉ đổi gương mặt trong phái của bạn.'); return; }
      cRace = b.dataset.r; cFace = +b.dataset.f; Sound.sfx('buff'); draw();
    }));
  };
  draw();
  $('#c-dice').onclick = () => { const p = (l) => l[Math.floor(Math.random() * l.length)]; $('#c-name').value = p(NAME_A) + ' ' + p(NAME_B); Sound.sfx('coin'); };
  $('#b-random').onclick = () => {
    if (csMode === 'face') { show('#scr-game'); return; }
    cRace = COL_ORDER[Math.floor(Math.random() * 3)]; cFace = Math.floor(Math.random() * 6); $('#c-dice').onclick(); draw();
  };
}
$('#b-create').onclick = async () => {
  if (csMode === 'face') {
    const r = await G.call('char:face', { face: cFace });
    show('#scr-game'); if (r && r.ok) { GameMap.setPlayerGear && GameMap.setPlayerGear(G.me.gear); }
    return;
  }
  $('#create-err').textContent = '';
  if (!$('#c-name').value.trim()) $('#c-dice').onclick();
  const r = await Net.emit('char:create', { name: $('#c-name').value, race: cRace, face: cFace });
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
  G.event = r.event;
  Panels2.initMini();
  Net.emit('party:info').then((x) => x.ok && Panels2.setParty(x.party));
  if (r.mail) setTimeout(() => UI.toast(`📬 Bạn có ${r.mail} thư mới ở Chợ (mục Thư).`, 'gold'), 2500);
  if (!first && r.welfare) Panels3.offline(r.welfare);
  Panels3.refreshNodes(); Panels3.wevChip();
  renderTicker(); updateBadges();
  requestAnimationFrame(() => GameMap.resize());
  if (r.battle) return startBattle(r.battle);
  Sound.play(G.meta.MAPS[r.state.map].theme);
  Sound.ambient(G.meta.MAPS[r.state.map].theme);
  mapTitle();
  if (!first && r.state.tut >= 99 && !r.state.facePick) setTimeout(async () => { const d = await Net.emit('daily:info'); if (d.ok && d.daily.checkin.canClaim && !UI.sheet.open && !BattleUI.active) Panels.daily(true); }, 1400);
  if (r.state.facePick && !first) setTimeout(async () => {
    const R = G.meta.RACES[r.state.race];
    const ok = await UI.confirm(`<h3 style="font-size:20px">Tam Giới chia lại môn phái</h3><p>Phái của bạn nay là <b>${R.name} (${R.title})</b>. Bạn được <b>đổi gương mặt miễn phí 1 lần</b> trong 6 gương mặt của phái.</p>`, 'Chọn gương mặt');
    if (ok) showCreate('face');
  }, 900);
  if (first || r.state.tut < 99) Tut.start();
  if (first) {
    setTimeout(() => UI.dialog({ name: 'Thái Bạch Kim Tinh', icon: '🧙‍♂️', npc: 'thaibach', text: `Chào ${r.state.name}! Đây là Thiên Cung. Chạm vào bản đồ để đi, chạm vào NPC để trò chuyện. Ta đang đứng gần ngươi – lại đây nhận nhiệm vụ đầu tiên nhé. Nhớ ghé Tiên Đồng trị thương và Tiên Thương mua Bầu Bạc để thu phục Tiên sủng.`, options: [] }), 1600);
  }
}

function mapTitle() {
  const m = G.meta.MAPS[G.me.map];
  const el = $('#map-title');
  el.innerHTML = `<small>${m.post ? 'Hậu truyện ' + (m.chapter - (G.meta.NMAIN || 15)) : 'Chương ' + m.chapter} · ${esc(m.sub || '')}</small><b>${esc(m.name)}</b>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}

// ---------------- HUD ----------------
function updateHud() {
  const c = G.me; if (!c) return;
  const d = c.derived;
  const src = Sprites.faceURL(c.race, c.gender, c.gear);
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
  { const bs = G.meta.CONFIG.bagSize, n = c.bag.length, el = $('#hud-bag'); el.textContent = `${n}/${bs}`; el.parentNode.classList.toggle('full', n >= bs * 0.9); }
  $('#map-name').textContent = G.meta.MAPS[c.map].name;
  const q = c.quest;
  $('#quest-track').innerHTML = q.done ? '<em>Hộ Kinh Sứ</em><span>Kiếp nạn thứ 82 đã vượt</span>'
    : q.needAsc && !c.asc ? `<em>Cần Phi Thăng</em><span>→ cấp 120 · Tam Cửu Thiên Kiếp</span>`
    : `<em>Tự động tìm đường</em><span>→ ${esc(q.type === 'kill' ? `${q.title} (${q.prog}/${q.count})` : q.title)}</span>`;
  GameMap.questNpc = !q.done && q.map === c.map ? (q.type === 'talk' ? q.npc : q.type === 'boss' ? q.boss : null) : null;
  const pb = $('#pt-badge');
  pb.hidden = !c.points;
  pb.textContent = `+${c.points} điểm tiềm năng`;
  updateBadges();
}
function updateBadges() {
  if (!G.me) return;
  $('[data-p="char"]').classList.toggle('dot', G.me.points > 0);
  $('#soc-btn').classList.toggle('dot', G.pending.length > 0);
  $('[data-p="act"]').classList.toggle('dot', !!G.me.dailyBadge);
  $('#evt-act').classList.toggle('dot', !!G.me.dailyBadge);
  const b3 = Panels3.badges();
  $('#btn-menu').classList.toggle('dot', G.me.points > 0 || !!G.me.dailyBadge || !!b3 || (!G.me.menh && G.me.lvl >= 10));
}

let chatTab = 'khu';
function renderTicker() {
  const list = G.chat.filter((m) => m.ch === chatTab || m.ch === 'he' || chatTab === 'all');
  const last = list.slice(-3);
  const ava = (m) => m.fromId ? `<img src="${Sprites.faceURL(m.race || 'tien', m.gender || 'm', Number.isInteger(m.face) ? { look: m.face } : null)}" alt="">` : '<i class="sys">☯</i>';
  $('#ticker').innerHTML = last.map((m) => `<div class="cm ${m.fromId ? '' : 'he'}"><span class="cav">${ava(m)}${m.lvl ? `<em>${m.lvl}</em>` : ''}</span><span class="ct"><small>${m.fromId ? esc(m.from) : 'Hệ thống'}</small><span class="cb">${esc(m.text).replace(/\[e(\d{1,2})\]/g, (a, n) => Art.EMO_UNI[+n] || a)}</span></span></div>`).join('') || '<div class="cm he"><span class="ct"><span class="cb">Kênh chat – chạm để mở</span></span></div>';
}
$$('.ctabs [data-ch]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); chatTab = b.dataset.ch; $$('.ctabs [data-ch]').forEach((x) => x.classList.toggle('on', x === b)); renderTicker(); }));

$('#hud-ava').onclick = () => { Tut.event('open_char'); Panels.char(); };
$('#hud-gear').onclick = () => settings();
$('#pt-badge').onclick = () => Panels.char('info');
$('#map-chip').onclick = () => Panels.act('travel');
$('#quest-track').onclick = () => { Tut.event('quest'); goQuest(); };
$('#ticker').onclick = () => Panels.social('chat');
$$('.nav button').forEach((b) => (b.onclick = () => { $('.nav').classList.remove('open'); Tut.event('open_' + b.dataset.p); (Panels3[b.dataset.p] || Panels[b.dataset.p] || Panels2[b.dataset.p])(); }));
$('#btn-menu').onclick = (e) => { e.stopPropagation(); $('.nav').classList.toggle('open'); };
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.nav, #btn-menu')) $('.nav')?.classList.remove('open'); });
$('#btn-quick').onclick = () => Panels.bag();
$('#mm').onclick = () => Panels.act('travel');
$('#evt-daily').onclick = () => Panels.daily();
$('#evt-act').onclick = () => { Tut.event('open_act'); Panels.act(); };
$('#evt-welfare').onclick = () => Panels3.welfare();
$('#evt-pass').onclick = () => Panels3.pass();
$('#evt-dg').onclick = () => Panels3.dg();
$('#evt-than').onclick = () => Panels3.than();
$('#wev').onclick = () => Panels3.wevInfo();
$('#soc-btn').onclick = () => { Tut.event('open_social'); Panels.social('friend'); };
document.addEventListener('click', (e) => { if (e.target.closest('button:not(.seal):not([data-close]):not(.tap-start)')) Sound.sfx('click'); });

// ---------------- cài đặt ----------------
function settings() {
  UI.openSheet('settings', 'Cài đặt', null, (body) => {
    const st = Sound.settings;
    body.innerHTML = `
      <div class="set-row"><span class="ic">${Sprites.ICONS.sound}</span><label style="margin:0">Nhạc nền<input type="range" id="s-music" min="0" max="100" value="${Math.round(st.music * 100)}"></label><output id="o-music">${Math.round(st.music * 100)}</output></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.skill}</span><label style="margin:0">Hiệu ứng âm thanh<input type="range" id="s-sfx" min="0" max="100" value="${Math.round(st.sfx * 100)}"></label><output id="o-sfx">${Math.round(st.sfx * 100)}</output></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.act}</span><div><b>Nhân vật kiểu tranh (chibi)</b><div class="muted">Tắt để dùng lại hình pixel cổ điển.</div></div><button class="toggle ${(() => { try { return localStorage.getItem('tdk_pixel') !== '1'; } catch { return true; } })() ? 'on' : ''}" id="s-vec" aria-label="Chibi"></button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.gear}</span><div><b>Hiệu ứng nhẹ</b><div class="muted">Bật trên iPhone đời cũ để mượt hơn.</div></div><button class="toggle ${FX.low ? 'on' : ''}" id="s-low" aria-label="Hiệu ứng nhẹ"></button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.gear}</span><div><b>Mã khôi phục</b><div class="muted">Tạo mã mới để lấy lại tài khoản khi quên mật khẩu.</div></div><button class="btn-seal sm ghost" id="s-rc">Tạo mã</button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.flee}</span><div><b>Tránh quái</b><div class="muted">Đi lại không gặp quái ngẫu nhiên.</div></div><button class="toggle ${G.me.peace ? 'on' : ''}" id="s-peace" aria-label="Tránh quái"></button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.sound}</span><div><b>Thử âm thanh</b><div class="muted" id="s-state">Trạng thái: ${Sound.state === 'running' ? 'đang phát' : Sound.state}</div></div><button class="btn-seal sm jade" id="s-test">Phát thử</button></div>
      <p class="muted" style="margin-top:10px">Không nghe thấy? Tăng âm lượng bằng nút bên hông iPhone khi đang ở trong game (âm lượng phương tiện), tắt chế độ Tập trung/Không làm phiền nếu có, rồi bấm Phát thử.</p>
      <p class="muted" style="margin-top:14px">Bản đồ đổi sáng tối theo giờ thật trên máy. Một số nhiệm vụ ẩn chỉ xuất hiện vào giờ nhất định.</p>
      <div class="sec" style="margin-top:14px">Tài khoản</div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.char}</span><div><b>Đổi mật khẩu</b><div class="muted">Các thiết bị khác sẽ phải đăng nhập lại.</div></div><button class="btn-seal sm" id="s-pass">Đổi</button></div>
      <div class="set-row"><span class="ic">${Sprites.ICONS.flee}</span><div><b>Đăng xuất mọi thiết bị khác</b><div class="muted">Khi lỡ đăng nhập trên máy lạ.</div></div><button class="btn-seal sm ghost" id="s-all">Đăng xuất</button></div>
      <div class="btns"><button class="btn-seal ghost" id="s-logout">Đăng xuất máy này</button></div>`;
    const bind = (id, k) => { const i = $('#s-' + id); i.oninput = () => { $('#o-' + id).textContent = i.value; Sound.set(k, i.value / 100); }; i.onchange = () => Sound.sfx('click'); };
    bind('music', 'music'); bind('sfx', 'sfx');
    $('#s-test').onclick = () => { Sound.test(); setTimeout(() => { const el = $('#s-state'); if (el) el.textContent = 'Trạng thái: ' + (Sound.state === 'running' ? 'đang phát' : Sound.state); }, 300); };
    $('#s-vec').onclick = () => { try { localStorage.setItem('tdk_pixel', localStorage.getItem('tdk_pixel') === '1' ? '0' : '1'); } catch {} location.reload(); };
    $('#s-low').onclick = () => { FX.setLow(!FX.low); GameMap.initAmb(); UI.refreshSheet(); };
    $('#s-peace').onclick = async () => { await G.call('char:peace'); UI.refreshSheet(); };
    $('#s-logout').onclick = async () => { if (await UI.confirm('<p>Đăng xuất khỏi thiết bị này?</p>', 'Đăng xuất')) { localStorage.removeItem('tdk_token'); location.reload(); } };
    $('#s-pass').onclick = async () => {
      const ok = await UI.modal(`<h3 style="font-size:20px">Đổi mật khẩu</h3><label>Mật khẩu hiện tại<input id="pw-old" type="password" autocomplete="current-password"></label><label>Mật khẩu mới<input id="pw-new" type="password" autocomplete="new-password"></label><label>Nhập lại mật khẩu mới<input id="pw-new2" type="password" autocomplete="new-password"></label>`,
        [{ id: 'no', label: 'Thôi', cls: 'ghost' }, { id: 'yes', label: 'Đổi mật khẩu' }]);
      if (ok !== 'yes') return;
      const o = $('#pw-old').value, n1 = $('#pw-new').value, n2 = $('#pw-new2').value;
      if (n1 !== n2) return UI.toast('Hai lần nhập mật khẩu mới không giống nhau.', 'err');
      const r = await Net.emit('auth:changePass', { old: o, pass: n1 });
      if (r.ok) { localStorage.setItem('tdk_token', r.token); Sound.sfx('quest'); }
      UI.toast(r.msg, r.ok ? 'gold' : 'err');
    };
    $('#s-rc').onclick = async () => {
      const ok = await UI.modal(`<h3 style="font-size:20px">Tạo mã khôi phục</h3><p class="muted">Mã cũ (nếu có) sẽ hết hiệu lực.</p><label>Mật khẩu hiện tại<input id="rc-pw" type="password" autocomplete="current-password"></label>`,
        [{ id: 'no', label: 'Thôi', cls: 'ghost' }, { id: 'yes', label: 'Tạo mã' }]);
      if (ok !== 'yes') return;
      const r = await Net.emit('auth:recoveryNew', { pass: $('#rc-pw').value });
      if (!r.ok) return UI.toast(r.msg, 'err');
      showRecovery(r.recovery, false);
    };
    $('#s-all').onclick = async () => {
      if (!(await UI.confirm('<p>Đăng xuất tài khoản này khỏi mọi điện thoại / máy tính khác? Máy này vẫn giữ đăng nhập.</p>', 'Đăng xuất'))) return;
      const r = await Net.emit('auth:logoutAll');
      if (r.ok) localStorage.setItem('tdk_token', r.token);
      UI.toast(r.msg, r.ok ? 'gold' : 'err');
    };
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
    const mt = G.me.gear && G.me.gear.mount && G.meta.MOUNTS[G.me.gear.mount];
    const anim = GameMap.animateTo(x, y, Math.round(160 / (mt ? mt.speed : 1)));
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
    Sound.step(surfaceAt(x, y));
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

// mặt đất dưới chân → tiếng bước
function surfaceAt(x, y) {
  const M = GameMap.meta, th = M.theme, grass = M.tiles[y] && M.tiles[y][x] === ',';
  return ({ heaven: grass ? 'cloud' : 'jade', city: grass ? 'grass' : 'stone', forest: grass ? 'grass' : 'dirt', river: grass ? 'grass' : 'dirt',
    desert: grass ? 'dirt' : 'sand', cave: grass ? 'moss' : 'stone', snow: 'snow' })[th] || 'dirt';
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
  const pl = GameMap.playerAt(x, y);
  if (pl) { const near = Math.abs(pl.x - G.me.x) + Math.abs(pl.y - G.me.y) <= 1; if (near) return Panels3.playerTap(pl); return walk((a, b) => Math.abs(a - pl.x) + Math.abs(b - pl.y) === 1, () => Panels3.playerTap(pl)); }
  const nd = GameMap.nodeAt(x, y);
  if (nd) { const near = (a, b) => Math.abs(a - nd.x) + Math.abs(b - nd.y) <= 1; if (near(G.me.x, G.me.y)) return Panels3.gather(nd); return walk(near, () => Panels3.gather(nd)); }
  if (x === G.me.x && y === G.me.y) return;
  walk((a, b) => a === x && b === y);
}
GameMap.onTap = onMapTap;

function onTravel(r) {
  walkTok++;
  setTimeout(() => Panels3.refreshNodes(), 200);
  GameMap.setMap(G.me.map, G.meta.MAPS[G.me.map]);
  GameMap.snap([G.me.x, G.me.y]);
  GameMap.setPlayers(r.players || []);
  updateHud();
  Sound.sfx('portal');
  Sound.play(G.meta.MAPS[G.me.map].theme);
  Sound.ambient(G.meta.MAPS[G.me.map].theme);
  mapTitle();
  Panels2.maybeComic(G.me.map);
  Panels2.renderPartyBar();
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
  Tut.event('talk');
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
    if (a.battle) { UI.closeDialog(); if (a.scene) await UI.scene(a.scene); return startBattle(a.battle); }
    if (a.secret) { UI.closeDialog(); return showSecret(a.secret); }
    if (a.quest) {
      if (a.scene || a.quest.scene) { UI.closeDialog(); await UI.scene(a.scene); await UI.scene(a.quest.scene); questToast(a.quest); return; }
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
      if (res.quest) { questToast(res.quest); if (res.quest.scene) setTimeout(() => UI.scene(res.quest.scene), 350); }
      Panels3.afterBattle(res);
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
  if (log && UI.sheet.name === 'social' && UI.sheet.tab === 'chat' && ($(`.seg-b.on[data-ch="${m.ch}"]`) || $('.seg-b.on[data-ch="all"]'))) {
    const atBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 30;
    log.querySelector('.empty')?.remove();
    log.insertAdjacentHTML('beforeend', Panels.chatLine(m));
    if (atBottom) log.scrollTop = log.scrollHeight;
  }
});
Net.on('map:join', (p) => { if (G.me && p.id !== G.me.id) GameMap.addPlayer(p); });
Net.on('map:move', (p) => GameMap.movePlayer(p));
Net.on('map:leave', (p) => GameMap.removePlayer(p.id));
Net.on('map:gear', (p) => GameMap.setPlayerGear(p.id, p.gear));
Net.on('map:stall', (p) => { if (G.me && p.id === G.me.id) return; GameMap.setPlayerInfo(p.id, 'stall', p.stall); });
Net.on('map:title', (p) => GameMap.setPlayerInfo(p.id, 'title', p.title));
Net.on('party', (p) => Panels2.setParty(p));
Net.on('fx:firework', (d) => Panels2.firework(d.by));
Net.on('boss:update', (b) => { G.boss = b; if (UI.sheet.name === 'act' && UI.sheet.tab === 'list') UI.refreshSheet(); });
Net.on('social:req', async (r) => {
  if (r.type === 'partyApply') { Sound.sfx('quest'); const ok = await UI.confirm(`<p><b>${esc(r.fromName)}</b> (cấp ${r.fromLvl}) xin vào tổ đội của bạn. Nhận vào?</p>`, 'Nhận vào'); await G.call('social:respond', { type: 'partyApply', fromId: r.fromId, accept: ok }); return; }
  if (r.type === 'party') { Sound.sfx('quest'); const ok = await UI.confirm(`<p><b>${esc(r.fromName)}</b> (cấp ${r.fromLvl}) mời bạn vào tổ đội. Đồng ý?</p>`, 'Vào đội'); await G.call('social:respond', { type: 'party', fromId: r.fromId, accept: ok }); return; }
  G.pending.push(r); updateBadges(); Sound.sfx('quest'); UI.toast(`${r.fromName} ${r.type === 'marry' ? 'gửi lời cầu hôn 💍' : 'muốn bái bạn làm sư phụ 📿'} – xem ở Giao lưu`, 'gold'); });
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
