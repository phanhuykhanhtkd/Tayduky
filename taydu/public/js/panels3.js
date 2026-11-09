// =====================================================================
//  GIAO DIỆN ĐỢT 2–6
//  Thần sủng · Mệnh · Danh hiệu & Thành tựu · Phúc lợi · Tu Hành Lệnh ·
//  Ác Mộng · Phi Thăng · Phó bản · Đồ giám · Sạp hàng · Khai thác ·
//  Thú cưỡi (cấp) · Bang hội (cấp) · Thiên Địa Dị Tượng
// =====================================================================
const Panels3 = (() => {
  const M = () => G.meta, X3 = () => G.meta.X3;
  const icon = (id) => Sprites.itemIcon(id, M().ITEMS);
  const sub = (name, title, render, tabs, tab) => UI.openSheet(name, title, tabs || null, render, tab);
  const EL = (e) => M().ELEMENTS[e] || { name: '?', color: '#999' };
  const portrait = (look, cls = '') => Sprites.unitImg({ bossId: look }, cls);
  const bar = (v, n, cls = '') => `<div class="pbar ${cls}"><i style="width:${Math.min(100, (100 * v) / Math.max(1, n))}%"></i></div>`;
  const left = (t) => { const s = Math.max(0, Math.floor((t - Date.now()) / 1000)); const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return d ? `${d} ngày ${h} giờ` : h ? `${h} giờ ${m} phút` : `${m} phút ${s % 60}s`; };
  const call = async (e, d, then) => { const r = await G.call(e, d); if (r.ok) { Sound.sfx('chest'); if (then) then(r); } UI.refreshSheet(); return r; };
  const BTN = (attrs, label, cls = '') => `<button class="btn-seal sm ${cls}" ${attrs}>${label}</button>`;

  // =================================================================
  //  THẦN SỦNG
  // =================================================================
  let thanSel = null;
  function than() { sub('than', 'Thần Sủng', renderThan); }
  async function renderThan(body) {
    const r = await Net.emit('than:list'); if (!r.ok) return;
    const C = r.cost;
    if (!thanSel || !r.list.find((x) => x.id === thanSel)) thanSel = (r.list.find((x) => x.owned) || r.list.find((x) => x.frags >= C.summon) || r.list[0]).id;
    const t = r.list.find((x) => x.id === thanSel), E = EL(t.element);
    const can = !t.owned && t.frags >= C.summon;
    const pf = t.preview;
    body.innerHTML = `
      <div class="ts-hero el-${t.element}" style="--ec:${E.color}">
        <div class="ts-stage">${portrait(t.look, 'ts-big' + (t.owned && t.owned.chan ? ' chan' : ''))}<span class="ts-ring"></span></div>
        <div class="ts-info"><div class="ts-name">${t.owned && t.owned.chan ? 'Chân ' : ''}${esc(t.name)}</div>
          <div class="ts-tags"><span class="tg" style="background:${E.color}">${E.name}</span><span class="tg">${esc(t.role)}</span>${t.owned ? `<span class="tg on">Đã khế ước · Cấp ${t.owned.lvl}</span>` : ''}</div>
          <p class="ts-lore">${esc(t.lore)}</p>
          <div class="ts-sk"><b>✦ ${esc(t.sig.name)}</b><small>${esc(t.sig.desc)}</small></div>
          <div class="ts-sk chan"><b>✦ Chân: ${esc(t.sig2.name)}</b><small>${esc(t.sig2.desc)}</small></div>
        </div>
      </div>
      <div class="ts-frag"><span>${icon('hon_' + t.id)}</span><div class="grow"><b>Hồn Phách ${esc(t.name)}: ${t.frags}/${t.owned ? C.chan : C.summon}</b>${bar(t.frags, t.owned ? C.chan : C.summon, 'gold')}<small>Nguồn: ${t.source.map(esc).join(' · ')}</small></div></div>
      <div class="stat-grid ts-st">
        <div><span>Khí huyết</span><b>${fmt(pf.maxHp)}</b></div><div><span>Tốc độ</span><b>${pf.spd}</b></div>
        <div><span>Công vật lý</span><b>${fmt(pf.atk)}</b></div><div><span>Công phép</span><b>${fmt(pf.matk)}</b></div>
        <div><span>Phòng thủ</span><b>${fmt(pf.def)}</b></div><div><span>Kháng phép</span><b>${fmt(pf.mdef)}</b></div></div>
      <p class="muted" style="margin:4px 0 0;font-size:12px">Chỉ số tham khảo ở cấp ${G.me.lvl} (phẩm Thần). Chân Hoá: phẩm <b style="color:#c8102a">Chân</b> ×2.0, kháng khống chế cao.</p>
      <div class="btns">
        ${t.owned ? (t.owned.chan ? '<span class="muted">Đã Chân Hoá – sức mạnh tối thượng.</span>' : BTN('data-a="chan"', `🌟 Chân Hoá (${C.chan} hồn · ${C.chanLinh} Chân Linh · ${fmt(C.chanBac)} bạc · cấp ${C.chanLvl})`, ''))
          : BTN(`data-a="summon" ${can ? '' : 'disabled'}`, `✨ Triệu hồi (${C.summon} hồn · ${fmt(C.summonBac)} bạc)`, can ? '' : 'ghost')}
        ${r.vanHon ? BTN('data-a="convert"', `🔮 Dùng Vạn Hồn Phách (${r.vanHon})`, 'jade') : ''}
      </div>
      <div class="sec">Mười hai Thần Sủng</div>
      <div class="ts-grid">${r.list.map((x) => `<button class="ts-card ${x.id === thanSel ? 'on' : ''} ${x.owned ? 'own' : ''} ${!x.owned && x.frags >= C.summon ? 'ready' : ''}" data-t="${x.id}" style="--ec:${EL(x.element).color}">
        ${portrait(x.look, 'ts-mini' + (x.owned && x.owned.chan ? ' chan' : ''))}<b>${esc(x.name)}</b>${x.owned ? `<i class="ts-own">${x.owned.chan ? 'Chân' : 'Cấp ' + x.owned.lvl}</i>` : `<i class="ts-f">${Math.min(x.frags, C.summon)}/${C.summon}</i>`}</button>`).join('')}</div>`;
    body.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { thanSel = b.dataset.t; UI.refreshSheet(); }));
    const act = body.querySelector('[data-a="summon"]'); if (act) act.onclick = async () => { const x = await G.call('than:summon', { id: t.id }); if (x.ok) await reveal(t, false); UI.refreshSheet(); };
    const ch = body.querySelector('[data-a="chan"]'); if (ch) ch.onclick = async () => { if (!(await UI.confirm(`<p>Chân Hoá <b>${esc(t.name)}</b>?<br><small>Tốn ${C.chan} Hồn Phách, ${C.chanLinh} Chân Linh Thạch, ${fmt(C.chanBac)} bạc.</small></p>`, 'Chân Hoá'))) return; const x = await G.call('than:chan', { uid: t.owned.uid }); if (x.ok) await reveal(t, true); UI.refreshSheet(); };
    const cv = body.querySelector('[data-a="convert"]'); if (cv) cv.onclick = async () => { const n = await UI.prompt(`Đổi Vạn Hồn Phách → Hồn Phách ${t.name} (có ${r.vanHon})`, String(r.vanHon)); if (n) await call('than:convert', { id: t.id, n: Number(n) }); };
  }
  // màn triệu hồi: vòng pháp trận + ánh sáng + nhân vật hiện ra
  function reveal(t, chan) {
    Sound.sfx('secret');
    const E = EL(t.element);
    return UI.modal(`<div class="summon ${chan ? 'chan' : ''}" style="--ec:${E.color}"><div class="sm-ray"></div><div class="sm-circle">${Sprites.circle ? Sprites.circle(E.color) : ''}</div>
      <div class="sm-char">${portrait(t.look, 'sm-img' + (chan ? ' chan' : ''))}</div></div>
      <div class="sm-title">${chan ? 'CHÂN HOÁ' : 'TRIỆU HỒI'}</div><p class="sm-name">${chan ? 'Chân ' : ''}${esc(t.name)}</p>
      <p class="muted" style="text-align:center;margin:0">Tuyệt kỹ: <b>${esc(chan ? t.sig2.name : t.sig.name)}</b></p>`, [{ id: 'ok', label: 'Xuất chiến!' }]);
  }

  // =================================================================
  //  MỆNH & DANH HIỆU (từ bảng Nhân vật)
  // =================================================================
  function menh() {
    const c = G.me, MN = X3().MENH;
    const cards = Object.entries(MN).map(([k, m]) => { const E = EL(k); return `<button class="mn-card ${c.menh === k ? 'on' : ''}" data-m="${k}" style="--ec:${E.color}"><span class="mn-ic">${{ kim: '金', moc: '木', thuy: '水', hoa: '火', tho: '土' }[k]}</span><b>${m.name}</b><small>${esc(m.desc)}</small><em>Khắc ${EL(E.beats).name}</em></button>`; }).join('');
    UI.modal(`<h3 style="font-size:20px;text-align:center">Định Mệnh Ngũ Hành</h3>
      <p class="muted" style="text-align:center;margin-top:0">Mệnh là ngũ hành của bản thân khi vào trận: khắc hệ địch +25% sát thương, bị khắc −15%. ${c.lvl < X3().MENH_LVL ? `<br><b>Cần cấp ${X3().MENH_LVL}.</b>` : c.menh ? `<br>Đổi Mệnh: 1 Mệnh Phù hoặc ${X3().MENH_CHANGE_VANG} vàng.` : '<br>Lần đầu miễn phí.'}</p>
      <div class="mn-grid">${cards}</div>`, [{ id: 'x', label: 'Đóng', cls: 'ghost' }]);
    $$('#modal-card [data-m]').forEach((b) => (b.onclick = async () => { if (b.dataset.m === c.menh) return; const r = await G.call('menh:set', { el: b.dataset.m }); if (r.ok) { Sound.sfx('levelup'); $('#modal').hidden = true; if (UI.sheet.open) UI.refreshSheet(); } }));
  }
  // khối Mệnh · Danh hiệu · Phi Thăng chèn vào bảng Nhân vật
  function charBlock() {
    const c = G.me, E = c.menh ? EL(c.menh) : null;
    return `<div class="cb3">
      <button class="cb3-i" data-x3="menh"><span class="mn-ic sm" style="--ec:${E ? E.color : '#8a7a6a'}">${c.menh ? { kim: '金', moc: '木', thuy: '水', hoa: '火', tho: '土' }[c.menh] : '?'}</span><b>Mệnh</b><small>${c.menh ? X3().MENH[c.menh].name : c.lvl >= X3().MENH_LVL ? 'Chưa định – chạm!' : 'Cấp ' + X3().MENH_LVL}</small></button>
      <button class="cb3-i" data-x3="title"><span class="cb3-t" style="color:${c.title ? c.title.color : '#bba'}">〈${c.title ? esc(c.title.name) : 'Chưa có'}〉</span><b>Danh hiệu</b><small>${c.titles.length} đã đạt</small></button>
      <button class="cb3-i ${c.asc ? 'asc' : ''}" data-x3="asc"><span class="cb3-a">${c.asc ? '🌈' : '⚡'}</span><b>${c.asc ? 'Đã Phi Thăng' : 'Phi Thăng'}</b><small>Giới hạn cấp ${c.cap}</small></button>
    </div>`;
  }
  function bindCharBlock(body) {
    body.querySelectorAll('[data-x3]').forEach((b) => (b.onclick = () => ({ menh, title: () => ach('title'), asc })[b.dataset.x3]()));
  }

  // =================================================================
  //  THÀNH TỰU & DANH HIỆU
  // =================================================================
  function ach(tab) { sub('ach', 'Thành Tựu', renderAch, [['list', 'Thành tựu'], ['title', 'Danh hiệu']], tab); }
  async function renderAch(body, tab) {
    const r = await Net.emit('ach:list'); if (!r.ok) return;
    if (tab === 'title') {
      const all = Object.entries(r.allTitles), own = new Set(r.titles.map((t) => t.id));
      const how = Object.fromEntries(r.list.filter((a) => a.title).map((a) => [a.title.id, a.desc]));
      how.tanthu = 'Quà tân thủ ngày 7';
      body.innerHTML = `<p class="muted">Đeo một danh hiệu để hiện dưới tên và nhận chỉ số. Chỉ danh hiệu đang đeo có hiệu lực.</p>
        <div class="list">${all.map(([id, t]) => `<div class="li tl ${r.title === id ? 'on' : ''} ${own.has(id) ? '' : 'lock'}"><span class="tl-n" style="color:${t.color}">〈${esc(t.name)}〉</span>
          <div class="grow"><div class="s">${Object.entries(t.bonus).map(([k, v]) => `${M().STAT_NAMES[k === 'maxHp' ? 'hp' : k === 'maxMp' ? 'mp' : k] || k} +${v}${k === 'crit' ? '' : '%'}`).join(' · ')}</div><div class="s">${own.has(id) ? 'Đã đạt' : esc(how[id] || '')}</div></div>
          ${own.has(id) ? (r.title === id ? BTN('data-off="1"', 'Tháo', 'ghost') : BTN(`data-on="${id}"`, 'Đeo', 'jade')) : '<span class="lk">🔒</span>'}</div>`).join('')}</div>`;
      body.querySelectorAll('[data-on]').forEach((b) => (b.onclick = () => call('title:set', { id: b.dataset.on })));
      body.querySelectorAll('[data-off]').forEach((b) => (b.onclick = () => call('title:set', { id: null })));
      return;
    }
    const list = r.list.slice().sort((a, b) => (b.done && !b.claimed) - (a.done && !a.claimed) || a.claimed - b.claimed);
    const done = r.list.filter((a) => a.claimed).length;
    body.innerHTML = `<div class="ach-head"><b>${done}/${r.list.length}</b><span>thành tựu đã hoàn thành</span>${bar(done, r.list.length, 'gold')}</div>
      <div class="list">${list.map((a) => `<div class="li ach ${a.claimed ? 'cl' : a.done ? 'rd' : ''}"><span class="ach-ic">${a.claimed ? '🏅' : a.done ? '🎖️' : '◇'}</span>
        <div class="grow"><div class="t">${esc(a.name)}${a.title ? ` <span class="tag" style="background:${a.title.color};color:#2a1a0a">〈${esc(a.title.name)}〉</span>` : ''}</div><div class="s">${esc(a.desc)}</div>
        ${a.claimed ? '' : `<div class="ach-p">${bar(a.v, a.need)}<small>${fmt(a.v)}/${fmt(a.need)}</small></div>`}</div>
        ${a.claimed ? '<span class="muted">Đã nhận</span>' : a.done ? BTN(`data-c="${a.id}"`, 'Nhận') : ''}</div>`).join('')}</div>`;
    body.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => call('ach:claim', { id: b.dataset.c })));
  }

  // =================================================================
  //  PHÚC LỢI: tân thủ 7 ngày · quà online · bế quan
  // =================================================================
  function welfare(tab) { sub('welfare', 'Phúc Lợi', renderWelfare, [['newbie', 'Tân thủ 7 ngày'], ['online', 'Quà online'], ['offline', 'Bế quan']], tab); }
  async function renderWelfare(body, tab) {
    const r = await Net.emit('welfare:info'); if (!r.ok) return;
    if (tab === 'newbie') {
      const n = r.newbie;
      body.innerHTML = `<div class="wf-banner"><b>Quà Tân Thủ</b><span>Đăng nhập 7 ngày – ngày 7 nhận <b>Thần sủng Tiểu Bạch Long</b>!</span>${portrait('tieubachlong', 'wf-pic')}</div>
        <div class="nb-grid">${n.list.map((d, i) => { const got = i < n.n, now = i === n.n && !n.today; return `<div class="nb-d ${got ? 'got' : ''} ${now ? 'now' : ''} ${d.big ? 'big' : ''}"><em>Ngày ${d.day}</em><small>${esc(d.label)}</small>${got ? '<i>✓</i>' : ''}</div>`; }).join('')}</div>
        <div class="btns" style="justify-content:center">${n.n >= 7 ? '<span class="muted">Đã nhận đủ 7 ngày.</span>' : n.today ? '<span class="muted">Hôm nay đã nhận – mai quay lại nhé!</span>' : BTN('id="nb-c"', `Nhận quà ngày ${n.n + 1}`)}</div>`;
      const b = $('#nb-c'); if (b) b.onclick = () => call('newbie:claim', {});
    } else if (tab === 'online') {
      const o = r.online;
      body.innerHTML = `<div class="wf-banner on"><b>Quà Online</b><span>Hôm nay đã online <b>${o.mins} phút</b>. Quà làm mới mỗi ngày.</span></div>
        <div class="list">${o.list.map((x) => `<div class="li ol ${x.claimed ? 'cl' : x.done ? 'rd' : ''}"><span class="ol-t">${x.m}'</span><div class="grow"><div class="t">Online ${x.m} phút</div><div class="s">${esc(x.label)}</div>${x.done ? '' : bar(o.mins, x.m)}</div>
          ${x.claimed ? '<span class="muted">Đã nhận</span>' : x.done ? BTN(`data-i="${x.i}"`, 'Nhận') : `<span class="muted">${x.m - o.mins}'</span>`}</div>`).join('')}</div>`;
      body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => call('online:claim', { i: Number(b.dataset.i) })));
    } else {
      const f = r.offline;
      body.innerHTML = f ? `<div class="wf-banner off"><b>Bế Quan Tu Luyện</b><span>Trong lúc vắng mặt <b>${Math.floor(f.min / 60)} giờ ${f.min % 60} phút</b>, nhân vật tự tu luyện (tối đa 12 giờ).</span></div>
          <div class="off-r"><div><span>Tu vi</span><b>${fmt(f.exp)}</b></div><div><span>Bạc</span><b>${fmt(f.bac)}</b></div></div>
          <div class="btns" style="justify-content:center">${BTN('id="of-1"', 'Nhận thường')}${BTN('id="of-2"', `Nhân đôi (${f.vang2} vàng)`, 'jade')}</div>`
        : '<div class="wf-banner off"><b>Bế Quan Tu Luyện</b><span>Khi rời game từ 10 phút trở lên, lần sau quay lại sẽ nhận tu vi và bạc bế quan (tối đa 12 giờ).</span></div><p class="muted" style="text-align:center">Hiện chưa có phần thưởng.</p>';
      if (f) { $('#of-1').onclick = () => call('offline:claim', { double: false }); $('#of-2').onclick = () => call('offline:claim', { double: true }); }
    }
  }
  function offline(o) {
    if (!o || !o.offline) return;
    const f = o.offline;
    setTimeout(async () => {
      const k = await UI.modal(`<div class="off-pop"><div class="op-ic">🧘</div><h3>Bế Quan Trở Về</h3><p>Bạn đã bế quan <b>${Math.floor(f.min / 60)} giờ ${f.min % 60} phút</b></p>
        <div class="off-r"><div><span>Tu vi</span><b>${fmt(f.exp)}</b></div><div><span>Bạc</span><b>${fmt(f.bac)}</b></div></div></div>`,
        [{ id: 'later', label: 'Để sau', cls: 'ghost' }, { id: 'one', label: 'Nhận' }, { id: 'two', label: '×2 (vàng)', cls: 'jade' }]);
      if (k === 'one' || k === 'two') { const r = await G.call('offline:claim', { double: k === 'two' }); if (r.ok) Sound.sfx('levelup'); }
    }, 1400);
  }

  // =================================================================
  //  TU HÀNH LỆNH
  // =================================================================
  function pass(tab) { sub('pass', 'Tu Hành Lệnh', renderPass, [['reward', 'Phần thưởng'], ['task', 'Nhiệm vụ']], tab); }
  async function renderPass(body, tab) {
    const r = await Net.emit('pass:info'); if (!r.ok) return;
    const head = `<div class="ps-head ${r.prem ? 'prem' : ''}"><div class="ps-lv"><small>Cấp</small><b>${r.lv}</b></div>
      <div class="grow"><b>Mùa ${esc(r.season.split('-').reverse().join('/'))}</b><small>Kết thúc sau ${left(r.ends)}</small>${bar(r.lv >= r.levels ? 1 : r.xp % r.xpPerLv, r.lv >= r.levels ? 1 : r.xpPerLv, 'gold')}<small>${r.lv >= r.levels ? 'Đã đạt cấp tối đa' : `${r.xp % r.xpPerLv}/${r.xpPerLv} điểm tới cấp ${r.lv + 1}`}</small></div>
      ${r.prem ? '<span class="ps-crown">👑 Chí Tôn</span>' : BTN('id="ps-buy"', `👑 Chí Tôn<br><small>${r.price} vàng</small>`)}</div>`;
    if (tab === 'task') {
      const row = (t, wk) => `<div class="li pt ${t.claimed ? 'cl' : t.v >= t.need ? 'rd' : ''}"><div class="grow"><div class="t">${esc(t.name)}</div>${bar(t.v, t.need)}<small>${t.v}/${t.need}</small></div><span class="pt-xp">+${t.xp}</span>
        ${t.claimed ? '<span class="muted">✓</span>' : t.v >= t.need ? BTN(`data-t="${t.id}" data-w="${wk ? 1 : ''}"`, 'Nhận') : ''}</div>`;
      body.innerHTML = head + `<div class="sec">Hằng ngày <small class="muted">(${r.dailyXp}/${r.dailyCap} điểm)</small></div><div class="list">${r.daily.map((t) => row(t, false)).join('')}</div>
        <div class="sec">Hằng tuần</div><div class="list">${r.weekly.map((t) => row(t, true)).join('')}</div>`;
      body.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => call('pass:task', { id: b.dataset.t, weekly: !!b.dataset.w })));
    } else {
      body.innerHTML = head + `<div class="btns">${BTN('id="ps-all"', 'Nhận tất cả', 'jade')}</div>
        <div class="ps-track"><div class="ps-th"><span>Cấp</span><span>Thường</span><span>👑 Chí Tôn</span></div>
        ${r.rewards.map((x) => { const ok = r.lv >= x.lv, cf = r.cf.includes(x.lv), cp = r.cp.includes(x.lv); return `<div class="ps-row ${ok ? 'ok' : ''} ${x.lv % 10 === 0 ? 'big' : ''}"><b>${x.lv}</b>
          <button class="ps-c ${cf ? 'cl' : ok ? 'rd' : ''}" data-l="${x.lv}" ${ok && !cf ? '' : 'disabled'}>${esc(x.free)}${cf ? '<i>✓</i>' : ''}</button>
          <button class="ps-c p ${cp ? 'cl' : ok && r.prem ? 'rd' : ''} ${r.prem ? '' : 'lock'}" data-l="${x.lv}" data-p="1" ${ok && r.prem && !cp ? '' : 'disabled'}>${esc(x.prem)}${cp ? '<i>✓</i>' : r.prem ? '' : '<i>🔒</i>'}</button></div>`; }).join('')}</div>`;
      body.querySelectorAll('.ps-c[data-l]').forEach((b) => (b.onclick = () => call('pass:claim', { lv: Number(b.dataset.l), prem: !!b.dataset.p })));
      $('#ps-all').onclick = () => call('pass:claimAll', {});
    }
    const buy = $('#ps-buy'); if (buy) buy.onclick = async () => { if (await UI.confirm(`<p>Mở <b>Tu Hành Lệnh Chí Tôn</b> mùa này với ${r.price} vàng?<br><small>Nhận thêm phần thưởng ở cả 30 cấp (kể cả cấp đã qua).</small></p>`, 'Mở')) call('pass:buy', {}); };
  }

  // =================================================================
  //  ÁC MỘNG
  // =================================================================
  function nm() { sub('nm', 'Ác Mộng', renderNm); }
  async function renderNm(body) {
    const r = await Net.emit('nm:list'); if (!r.ok) return;
    const c = G.me, open = c.lvl >= r.minLvl;
    const list = r.list.filter((b) => b.beaten).sort((a, b) => b.lv - a.lv);
    body.innerHTML = `<div class="nm-head"><b>Ác Mộng Luân Hồi</b><span>Boss cốt truyện trở lại mạnh gấp bội: <b>3 giai đoạn</b>, kháng khống chế cao, gọi viện binh khi cuồng nộ. Rơi <b>Hồn Phách Thần sủng</b>, Chân Linh Thạch, trang bị Cực–Độc Bản.</span>
      <em>Còn ${r.left}/${r.perDay} lượt hôm nay</em></div>
      ${open ? '' : `<p class="muted" style="text-align:center">Cần đạt cấp ${r.minLvl}.</p>`}
      ${list.length ? `<div class="list">${list.map((b) => `<div class="li nm-b"><span class="nm-p">${Sprites.unitImg({ bossId: b.id, icon: b.icon }, 'nm-img')}</span>
        <div class="grow"><div class="t">${esc(b.name)} <span class="tag" style="background:${EL(b.element).color};color:#2a1a0a">${EL(b.element).name}</span></div><div class="s">Ác Mộng cấp ${b.lv} · ${esc(M().MAPS[b.map] ? M().MAPS[b.map].name : '')}</div>
        ${b.than ? `<div class="s nm-t">✨ Rơi Hồn Phách ${esc(b.than)}</div>` : ''}</div>
        ${BTN(`data-b="${b.id}" ${open && r.left ? '' : 'disabled'}`, 'Khiêu chiến', b.lv > c.lvl + 10 ? 'danger' : '')}</div>`).join('')}</div>` : '<p class="muted" style="text-align:center">Hãy đánh bại boss trong cốt truyện để mở Ác Mộng của chúng.</p>'}`;
    body.querySelectorAll('[data-b]').forEach((b) => (b.onclick = async () => { const x = await G.call('nm:fight', { boss: b.dataset.b }); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } }));
  }

  // =================================================================
  //  PHI THĂNG
  // =================================================================
  function asc() { sub('asc', 'Phi Thăng', renderAsc); }
  async function renderAsc(body) {
    const r = await Net.emit('asc:info'); if (!r.ok) return;
    const c = G.me, ok = c.lvl >= r.lvl && r.story;
    body.innerHTML = `<div class="asc-hero ${r.asc ? 'done' : ''}"><div class="asc-sky"></div><img class="asc-me" src="${Sprites.heroURL(c.race, c.gender, 0, c.gear)}" alt=""><div class="asc-t">${r.asc ? 'ĐÃ PHI THĂNG' : 'TAM CỬU THIÊN KIẾP'}</div></div>
      ${r.asc ? `<p style="text-align:center">Ngươi đã thoát thai phàm cốt. Giới hạn cấp mở tới <b>${M().CONFIG.maxLevel}</b>, mọi chỉ số +${r.bonus.statPct}%, hào quang tiên nhân, vào được Nam Thiên Môn & Hỗn Độn Hư Không.</p>`
      : `<div class="asc-req"><div class="${c.lvl >= r.lvl ? 'ok' : ''}">Đạt cấp ${r.lvl} (hiện ${c.lvl})</div><div class="${r.story ? 'ok' : ''}">Vượt đủ 81 kiếp nạn</div><div class="${r.left ? 'ok' : ''}">Lượt độ kiếp hôm nay: ${r.left}/${r.perDay}</div></div>
        <div class="asc-steps">${r.trial.map((t, i) => `<div class="asc-s"><em>${i + 1}</em>${t.boss === 'mirror' ? `<img src="${Sprites.heroURL(c.race, c.gender, 0, c.gear)}" class="shadow" alt="">` : portrait(t.boss, 'asc-b')}<b>${esc(t.name)}</b><small>${esc(t.desc)}</small></div>`).join('')}</div>
        <div class="asc-bonus">Phần thưởng: mở cấp ${M().CONFIG.maxLevel} · +${r.bonus.statPct}% mọi chỉ số · +${r.bonus.points} điểm tiềm năng · hào quang · 3 Chân Linh Thạch · danh hiệu «Phi Thăng Tiên»</div>
        <p class="muted" style="text-align:center;margin:4px 0">Ba trận liên tiếp, khí huyết không hồi giữa các trận. Thua là phải đợi lượt sau.</p>
        <div class="btns" style="justify-content:center">${BTN(`id="asc-go" ${ok && r.left ? '' : 'disabled'}`, '⚡ Bắt đầu độ kiếp')}</div>`}`;
    const go = $('#asc-go'); if (go) go.onclick = async () => { const x = await G.call('asc:start', {}); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } };
  }

  // =================================================================
  //  PHÓ BẢN
  // =================================================================
  function dg() { sub('dg', 'Phó Bản', renderDg); }
  async function renderDg(body) {
    const r = await Net.emit('dg:list'); if (!r.ok) return;
    const c = G.me;
    body.innerHTML = `<p class="muted">Mỗi phó bản gồm <b>3 đợt quái + 1 boss</b>. Đồng đội trong tổ đội (cùng bản đồ) tự động vào cùng. Cấp quái co giãn theo cấp của bạn. ${r.perDay} lượt/ngày mỗi phó bản.</p>
      ${r.run ? `<div class="dg-run">Đang ở phó bản – chặng ${r.run.stage + 1}/${r.run.total}. ${BTN('id="dg-cont"', 'Tiếp tục')} ${BTN('id="dg-quit"', 'Rời', 'ghost')}</div>` : ''}
      <div class="dg-list">${r.list.map((d) => { const lock = c.lvl < d.lvl || (d.asc && !c.asc); return `<div class="dg-card th-${d.theme} ${lock ? 'lock' : ''}" style="background-image:linear-gradient(90deg,rgba(20,10,4,.92),rgba(20,10,4,.55) 60%,rgba(20,10,4,.2)),url('${PaintMap.battleURL(d.theme, 240, 120)}')">
        <div class="dg-l"><b>${d.icon} ${esc(d.name)}</b><small>${esc(d.desc)}</small><small class="dg-d">Rơi: ${esc(d.dropText)}${d.fragName ? ` · Hồn Phách ${esc(d.fragName)}` : ''} · trang bị Lương–Truyền Thuyết</small></div>
        <div class="dg-r">${Sprites.unitImg({ bossId: d.boss }, 'dg-boss')}${lock ? '' : `<em>Cấp ${d.elvl}</em>`}${lock ? `<span class="dg-lk">${d.asc && !c.asc ? 'Cần Phi Thăng' : 'Cấp ' + d.lvl}</span>` : BTN(`data-d="${d.id}" ${d.left ? '' : 'disabled'}`, `Vào (${d.left}/${r.perDay})`)}</div></div>`; }).join('')}</div>`;
    body.querySelectorAll('[data-d]').forEach((b) => (b.onclick = async () => { const x = await G.call('dg:enter', { id: b.dataset.d }); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } }));
    const ct = $('#dg-cont'); if (ct) ct.onclick = async () => { const x = await G.call('run:next', {}); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } };
    const qt = $('#dg-quit'); if (qt) qt.onclick = () => call('run:quit', {});
  }
  // sau trận: tiếp chặng / chúc mừng
  async function afterBattle(res) {
    if (!res || !res.run) return;
    const r = res.run;
    if (r.failed) { UI.toast(res.kind === 'trial' ? '⚡ Độ kiếp thất bại – hãy mạnh hơn rồi quay lại.' : 'Phó bản thất bại.', 'err'); return; }
    await sleep(600);
    if (r.done && r.asc) {
      Sound.sfx('secret');
      await UI.modal(`<div class="asc-done"><div class="asc-sky"></div><img class="asc-me" src="${Sprites.heroURL(G.me.race, G.me.gender, 0, G.me.gear)}" alt=""><div class="asc-t">PHI THĂNG</div></div>
        <p style="text-align:center">Thiên kiếp tan, mây lành vạn dặm. Ngươi đã thành tiên!<br><b>Giới hạn cấp ${M().CONFIG.maxLevel} · +${X3().ASCEND.statPct}% chỉ số · hào quang tiên nhân</b></p>`, [{ id: 'ok', label: 'Thiện tai!' }]);
      return;
    }
    if (r.done) { Sound.sfx('chest'); UI.toast(`🏯 Chinh phục phó bản «${r.name}»!`, 'gold'); return; }
    const k = await UI.modal(`<div class="run-next"><b>Thắng chặng ${r.stage}/${r.total}!</b><span>Kế tiếp: ${esc(r.next)}</span><small>Khí huyết hiện tại: ${fmt(G.me.hp)}/${fmt(G.me.derived.maxHp)}</small></div>`,
      [{ id: 'quit', label: 'Rời đi', cls: 'ghost' }, { id: 'go', label: 'Tiếp tục ⚔️' }]);
    if (k === 'go') { const x = await G.call('run:next', {}); if (x.battle) G.startBattle(x.battle); }
    else await G.call('run:quit', {}, true);
  }

  // =================================================================
  //  ĐỒ GIÁM
  // =================================================================
  function codex() { sub('codex', 'Đồ Giám Tiên Sủng', renderCodex); }
  async function renderCodex(body) {
    const r = await Net.emit('codex:info'); if (!r.ok) return;
    const n = Object.keys(r.f).length, Gr = M().GRADES;
    body.innerHTML = `<div class="cx-head"><div><b>${n}/28</b><small>hình thái</small></div><div><b>${r.t.length}/12</b><small>Thần sủng</small></div><div><b>+${(Math.min(28, n) * r.pct).toFixed(2)}%</b><small>mọi chỉ số</small></div></div>
      <div class="cx-ms">${r.milestones.map((m) => { const ok = n >= m.n, cl = r.claimed.includes(m.n); return `<button class="cx-m ${cl ? 'cl' : ok ? 'rd' : ''}" data-n="${m.n}" ${ok && !cl ? '' : 'disabled'} title="${esc(m.label)}"><b>${m.n}</b><small>${cl ? '✓' : ok ? 'Nhận' : '🎁'}</small></button>`; }).join('')}</div>
      <div class="sec">Hình thái <small class="muted">(viền màu = phẩm cao nhất đã có)</small></div>
      <div class="cx-grid">${r.forms.map((f) => { const g = r.f[f.id]; const has = g != null; return `<div class="cx-c ${has ? 'has' : ''} ${f.rare ? 'rare' : ''}" style="--gc:${has ? Gr[g].color : '#5a4a3a'}">${Sprites.unitImg({ form: f.id, element: 'tho', icon: f.icon }, 'cx-img')}<b>${has ? esc(f.name) : '???'}</b>${has ? `<i>${Gr[g].name}</i>` : ''}</div>`; }).join('')}</div>
      <div class="sec">Thần sủng</div>
      <div class="cx-grid">${r.than.map((t) => { const has = r.t.includes(t.id); return `<div class="cx-c than ${has ? 'has' : ''}" style="--gc:${has ? EL(t.element).color : '#5a4a3a'}">${portrait(t.look, 'cx-img')}<b>${has ? esc(t.name) : '???'}</b></div>`; }).join('')}</div>`;
    body.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => call('codex:claim', { n: Number(b.dataset.n) })));
  }

  // =================================================================
  //  THÚ CƯỠI (có cấp)
  // =================================================================
  function mounts() { sub('mounts', 'Thú cưỡi', renderMounts); }
  const BN = { spd: 'Tốc độ', maxHp: 'Khí huyết', atk: 'Công', matk: 'Phép', def: 'Thủ', mdef: 'Kháng phép', crit: 'Bạo kích' };
  async function renderMounts(body) {
    const r = await Net.emit('mount3:list'); if (!r.ok) return;
    body.innerHTML = `<p class="muted">Cưỡi thú để đi nhanh hơn và được cộng chỉ số. Cho ăn <b>Thú Lương</b> (khai thác / Lò Bát Quái) để nâng cấp – mỗi cấp +12% hiệu quả. Đang có ${r.food} Thú Lương.</p>
      <div class="list">${r.list.map((m) => { const mul = 1 + 0.12 * (m.lv - 1); return `<div class="li mount ${m.riding ? 'on' : ''} ${m.owned ? '' : 'nown'}"><img class="px" src="${Art.mount(m.id).url}" alt="" style="width:70px;height:auto">
        <div class="grow"><div class="t">${esc(m.name)} ${m.owned ? `<span class="tag">Cấp ${m.lv}/${m.maxLv}</span>` : ''} ${m.riding ? '<span class="tag on">Đang cưỡi</span>' : ''}</div>
        <div class="s">Tốc ×${m.speed} · ${Object.entries(m.bonus).map(([k, v]) => `${BN[k] || k} +${Math.round(v * (m.owned ? mul : 1) * 10) / 10}${k === 'crit' ? '' : '%'}`).join(' · ')}</div>
        <div class="s">${esc(m.desc)}${m.owned ? '' : ` · Cần cấp ${m.lvl}`}</div>
        ${m.owned && m.lv < m.maxLv ? `<div class="s">Lên cấp: ${m.up.food} Thú Lương · ${fmt(m.up.bac)} bạc</div>` : ''}</div>
        <div class="mt-b">${m.owned ? (m.riding ? BTN('data-off="1"', 'Xuống', 'ghost') : BTN(`data-ride="${m.id}"`, 'Cưỡi', 'jade')) + (m.lv < m.maxLv ? BTN(`data-up="${m.id}"`, 'Nuôi') : '')
          : m.craft ? BTN('data-craft="1"', 'Lò Rèn', 'ghost') : BTN(`data-buy="${m.id}" ${G.me.lvl >= m.lvl ? '' : 'disabled'}`, m.price.bac ? fmt(m.price.bac) + ' bạc' : m.price.vang + ' vàng')}</div></div>`; }).join('')}</div>`;
    body.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = async () => { const m = r.list.find((x) => x.id === b.dataset.buy); if (await UI.confirm(`<p>Mua <b>${esc(m.name)}</b>?</p>`, 'Mua')) { const x = await G.call('mount:buy', { id: m.id }); if (x.ok) Sound.sfx('levelup'); UI.refreshSheet(); } }));
    body.querySelectorAll('[data-ride]').forEach((b) => (b.onclick = async () => { await G.call('mount:ride', { id: b.dataset.ride }); Sound.sfx('portal'); UI.refreshSheet(); }));
    body.querySelectorAll('[data-off]').forEach((b) => (b.onclick = async () => { await G.call('mount:ride', { id: null }); UI.refreshSheet(); }));
    body.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => call('mount:up', { id: b.dataset.up })));
    body.querySelectorAll('[data-craft]').forEach((b) => (b.onclick = () => Panels2.craft('ren')));
  }

  // =================================================================
  //  KHAI THÁC
  // =================================================================
  let gathering = false;
  async function gather(node) {
    if (gathering) return;
    const T = X3().GATHER.types[node.type];
    if ((G.me.energy || 0) < X3().GATHER.cost / (G.me.wev && G.me.wev.active && G.me.wev.id === 'linhmach' ? 2 : 1)) return UI.toast(`Tinh Lực không đủ. Hồi 1 điểm mỗi ${X3().GATHER.regenMin} phút, hoặc dùng Tinh Lực Đan.`, 'err');
    gathering = true;
    const el = document.createElement('div'); el.className = 'gat'; el.innerHTML = `<span>${T.icon}</span><b>Đang ${T.verb.toLowerCase()}…</b><i><u></u></i>`;
    $('#scr-game').appendChild(el);
    Sound.sfx('step');
    await sleep(1100);
    const r = await G.call('gather:do', { node: node.id }, true);
    el.remove(); gathering = false;
    if (r.ok) { Sound.sfx(r.rare ? 'secret' : 'coin'); UI.toast(r.msg, r.rare ? 'gold' : ''); GameMap.setNodeCd({ [node.id]: X3().GATHER.cooldownMin * 60e3 }); }
    else UI.toast(r.msg, 'err');
  }
  async function refreshNodes() { const r = await Net.emit('gather:cd'); if (r.ok) GameMap.setNodeCd(r.cd); }

  // =================================================================
  //  SẠP HÀNG
  // =================================================================
  function stall() {
    const c = G.me;
    if (c.stall) return stallView(c.id);
    const stack = c.bag.filter((b) => b.t === 'item');
    const eqs = c.bag.filter((b) => b.t === 'eq' && !b.unique);
    const pets = c.pets.filter((p) => !p.than && !(c.activePets || []).includes(p.uid));
    sub('stall', 'Bày Sạp Hàng', (body) => {
      body.innerHTML = `<p class="muted">Bày tối đa <b>6 món</b> ngay tại chỗ đứng. Người chơi cùng bản đồ chạm vào bạn để mua. Thuế 3%. Di chuyển hoặc thoát game sẽ tự dọn sạp. Cần cấp 15.</p>
        <label>Tên sạp<input id="st-name" maxlength="16" placeholder="Sạp của ${esc(c.name)}"></label>
        <div class="sec">Chọn hàng <small class="muted" id="st-n">(0/6)</small></div>
        <div class="list st-list">
          ${stack.map((b) => `<label class="li st-i"><input type="checkbox" data-k="item" data-id="${b.id}"><span class="ico">${icon(b.id)}</span><div class="grow"><div class="t">${esc(M().ITEMS[b.id].name)}</div><div class="s">Có ${b.qty}</div></div><input class="st-q" type="number" min="1" max="${b.qty}" value="1" title="Số lượng"><input class="st-p" type="number" min="1" placeholder="Giá"></label>`).join('')}
          ${eqs.map((b) => `<label class="li st-i"><input type="checkbox" data-k="eq" data-uid="${b.uid}"><span class="ico">${M().SLOTS[b.slot].icon}</span><div class="grow"><div class="t" style="color:${M().QUALITIES[b.q].color}">${esc(b.name)}${b.plus ? ' +' + b.plus : ''}</div><div class="s">${M().SLOTS[b.slot].name} · Cấp ${b.lvl}</div></div><input class="st-p" type="number" min="1" placeholder="Giá"></label>`).join('')}
          ${pets.map((p) => `<label class="li st-i"><input type="checkbox" data-k="pet" data-uid="${p.uid}"><span class="ico pet-ico">${Sprites.petImg(p)}</span><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">Cấp ${p.lvl} · ${M().GRADES[p.grade].name}</div></div><input class="st-p" type="number" min="1" placeholder="Giá"></label>`).join('')}
        </div>
        <div class="btns" style="justify-content:center">${BTN('id="st-open"', '🏮 Bày sạp')}</div>`;
      const upd = () => { $('#st-n').textContent = `(${body.querySelectorAll('.st-i input[type=checkbox]:checked').length}/6)`; };
      body.querySelectorAll('.st-i input[type=checkbox]').forEach((x) => (x.onchange = upd));
      $('#st-open').onclick = async () => {
        const items = [...body.querySelectorAll('.st-i')].filter((li) => li.querySelector('input[type=checkbox]').checked).map((li) => {
          const ck = li.querySelector('input[type=checkbox]'), q = li.querySelector('.st-q'), p = li.querySelector('.st-p');
          return { kind: ck.dataset.k, id: ck.dataset.id, uid: ck.dataset.uid, qty: q ? Number(q.value) : 1, price: Number(p.value) };
        });
        if (!items.length) return UI.toast('Chọn ít nhất 1 món.', 'err');
        if (items.some((x) => !(x.price > 0))) return UI.toast('Nhập giá cho mọi món đã chọn.', 'err');
        const r = await G.call('stall:open', { title: $('#st-name').value, items });
        if (r.ok) { Sound.sfx('coin'); UI.closeSheet(); }
      };
    });
  }
  function stallView(id) {
    sub('stallv', 'Sạp Hàng', async (body) => {
      const r = await Net.emit('stall:view', { id }); if (!r.ok) { body.innerHTML = `<p class="muted">${esc(r.msg)}</p>`; return; }
      body.innerHTML = `<div class="st-head"><span>🏮</span><div class="grow"><b>${esc(r.title)}</b><small>Chủ sạp: ${esc(r.owner.name)} · Cấp ${r.owner.lvl}</small></div></div>
        ${r.items.length ? `<div class="list">${r.items.map((x) => `<div class="li"><span class="ico ${x.kind === 'pet' ? 'pet-ico' : ''}">${x.kind === 'item' ? icon(x.itemId) : x.kind === 'pet' ? Sprites.petImg(x.pet) : M().SLOTS[x.eq.slot].icon}</span>
          <div class="grow"><div class="t" ${x.kind === 'eq' ? `style="color:${M().QUALITIES[x.q].color}"` : ''}>${esc(x.title)}</div><div class="s">${esc(x.sub)}</div>${x.eq ? `<div class="s">${Object.entries(x.eq.total).map(([k, v]) => `${M().STAT_NAMES[k] || k} +${v}`).join(' · ')}</div>` : ''}</div>
          ${r.mine ? `<b class="st-pr">${fmt(x.price)}</b>` : BTN(`data-i="${x.i}"`, `${fmt(x.price)} bạc`)}</div>`).join('')}</div>` : '<p class="muted">Sạp trống.</p>'}
        ${r.mine ? `<div class="btns" style="justify-content:center">${BTN('id="st-close"', 'Dọn sạp', 'ghost')}</div>` : ''}`;
      body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = async () => { const x = r.items.find((y) => y.i === Number(b.dataset.i)); if (await UI.confirm(`<p>Mua <b>${esc(x.title)}</b> giá <b>${fmt(x.price)}</b> bạc?</p>`, 'Mua')) { const k = await G.call('stall:buy', { id, i: x.i }); if (k.ok) Sound.sfx('coin'); UI.refreshSheet(); } }));
      const cl = $('#st-close'); if (cl) cl.onclick = async () => { await G.call('stall:close', {}); UI.closeSheet(); };
    });
  }
  // chạm vào người chơi khác trên bản đồ
  async function playerTap(o) {
    if (o.stall) return stallView(o.id);
    const ttl = o.title ? `<div style="color:${o.title.color};font-weight:700">〈${esc(o.title.name)}〉</div>` : '';
    const k = await UI.modal(`<div class="pl-card"><img src="${Sprites.heroURL(o.race, o.gender, 0, o.gear)}" alt=""><div><b>${esc(o.name)}</b>${ttl}<small>Cấp ${o.lvl}${o.guild ? ' · Phái ' + esc(o.guild) : ''}</small></div></div>`,
      [{ id: 'x', label: 'Đóng', cls: 'ghost' }, { id: 'party', label: 'Mời tổ đội' }, { id: 'friend', label: 'Kết bạn', cls: 'jade' }]);
    if (k === 'party') G.call('party:invite', { name: o.name });
    if (k === 'friend') G.call('social:friend', { name: o.name });
  }

  // =================================================================
  //  BANG HỘI: khối cấp phái (chèn vào tab Môn phái)
  // =================================================================
  async function guildBlock(box) {
    if (!box) return;
    const r = await Net.emit('guild3:info'); if (!r.ok) return;
    box.innerHTML = `<div class="gd3"><div class="gd3-lv"><small>Cấp phái</small><b>${r.lv}</b></div><div class="grow">${r.need ? `${bar(r.exp, r.need, 'gold')}<small>${fmt(r.exp)}/${fmt(r.need)} kinh nghiệm phái</small>` : '<small>Cấp tối đa</small>'}
      <small>Phúc lợi: +${r.perk.exp}% tu vi · +${r.perk.stat}% khí huyết/công/phép</small></div></div>
      <div class="btns">${BTN(`id="gd-don" ${r.donated < r.donate.perDay ? '' : 'disabled'}`, `Quyên góp ${fmt(r.donate.bac)} bạc (${r.donated}/${r.donate.perDay})`)}${BTN(`id="gd-gift" ${r.giftDone ? 'disabled' : ''}`, r.giftDone ? 'Đã nhận quà' : '🎁 Quà phái', 'jade')}</div>
      <small class="muted">Quà phái cấp ${r.lv}: ${esc(r.gift)}</small>`;
    $('#gd-don').onclick = async () => { await G.call('guild:donate', {}); guildBlock(box); };
    $('#gd-gift').onclick = async () => { const x = await G.call('guild:gift', {}); if (x.ok) Sound.sfx('chest'); guildBlock(box); };
  }

  // =================================================================
  //  THIÊN ĐỊA DỊ TƯỢNG (chip trên HUD)
  // =================================================================
  function wevChip() {
    const el = $('#wev'); if (!el || !G.me || !G.me.wev) return;
    const w = G.me.wev;
    el.classList.toggle('on', !!w.active);
    el.innerHTML = w.active ? `<span>${w.icon}</span><b>${esc(w.name)}</b><em>${left(w.ends)}</em>` : `<span>⏳</span><b>${esc(w.name)}</b><em>sau ${left(w.starts)}</em>`;
  }
  async function wevInfo() {
    const r = await Net.emit('wev:info'); if (!r.ok) return;
    UI.modal(`<h3 style="font-size:20px;text-align:center">Thiên Địa Dị Tượng</h3><p class="muted" style="text-align:center;margin-top:0">Mỗi 2 giờ trời đất biến đổi một lần, kéo dài 40 phút. Cả Tam Giới cùng hưởng.</p>
      <div class="list">${r.all.map((e) => `<div class="li ${r.ev.active && r.ev.id === e.id ? 'on' : ''}"><span class="ico">${e.icon}</span><div class="grow"><div class="t">${esc(e.name)}${r.ev.active && r.ev.id === e.id ? ' <span class="tag on">Đang diễn ra</span>' : !r.ev.active && r.ev.id === e.id ? ' <span class="tag">Sắp tới</span>' : ''}</div><div class="s">${esc(e.desc)}</div></div></div>`).join('')}</div>`, [{ id: 'ok', label: 'Đóng' }]);
  }

  // dòng tính cách cho bảng Tiên sủng
  function traitLine(p) {
    const T = p.tc && X3().TRAITS[p.tc]; if (!T) return '';
    return `<div class="tr-l ${T.rare ? 'rare' : ''}"><b>Tính cách: ${esc(T.name)}</b><small>${esc(T.desc)}</small><button class="btn-seal sm ghost" data-trait="${p.uid}">Tẩy tâm (${G.count('tay_tam')})</button></div>`;
  }
  async function reroll(uid) { const r = await G.call('pet:trait', { uid }); if (r.ok) Sound.sfx('secret'); UI.refreshSheet(); }

  // huy hiệu
  function badges() {
    const b = (G.me && G.me.badges3) || {};
    const set = (sel, on) => { const el = $(sel); if (el) el.classList.toggle('dot', !!on); };
    set('#evt-welfare', b.welfare); set('#evt-pass', b.pass); set('#evt-than', b.than);
    set('[data-p="ach"]', b.ach); set('[data-p="codex"]', b.codex); set('[data-p="than"]', b.than);
    set('[data-p="char"]', (G.me.points > 0) || (!G.me.menh && G.me.lvl >= X3().MENH_LVL));
    return b.ach || b.codex || b.than;
  }

  setInterval(() => { if (G.me) wevChip(); }, 1000);
  setInterval(() => { if (G.me && !document.hidden) Net.emit('ol:tick'); }, 60e3);

  return { than, menh, charBlock, bindCharBlock, ach, welfare, offline, pass, nm, asc, dg, afterBattle, codex, mounts, gather, refreshNodes, stall, stallView, playerTap, guildBlock, wevChip, wevInfo, traitLine, reroll, badges };
})();
