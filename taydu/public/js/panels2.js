// =====================================================================
//  GIAO DIỆN ĐỢT 3–5: thú cưỡi, lò luyện đan/rèn, bồi dưỡng Tiên sủng,
//  chợ giao dịch, sự kiện, tổ đội, bản đồ thế giới, bản đồ nhỏ,
//  tranh truyện mỗi chương, pháo hoa.
// =====================================================================
const Panels2 = (() => {
  const M = () => G.meta;
  const QN = () => M().QUALITIES;
  const icon = (id) => Sprites.itemIcon(id, M().ITEMS);
  const sub = (name, title, render, tabs, tab) => UI.openSheet(name, title, tabs || null, render, tab);
  const gcol = (g) => Panels.PAPER_G[g] || '#333';

  // ================= THÚ CƯỠI =================
  function mounts() {
    sub('mounts', 'Thú cưỡi', async (body) => {
      const r = await Net.emit('mount:list'); if (!r.ok) return;
      body.innerHTML = `<p class="muted">Cưỡi thú để đi nhanh hơn trên bản đồ và được cộng chỉ số. Đồng đội cùng bản đồ cũng thấy thú cưỡi của bạn.</p>
        <div class="list">${r.list.map((m) => `<div class="li mount ${m.riding ? 'on' : ''}"><img class="px" src="${Art.mount(m.id).url}" alt="" style="width:64px;height:auto">
          <div class="grow"><div class="t">${esc(m.name)} ${m.riding ? '<span class="tag">Đang cưỡi</span>' : ''}</div>
          <div class="s">Tốc độ đi ×${m.speed} · ${Object.entries(m.bonus).map(([k, v]) => `${{ spd: 'Tốc độ', maxHp: 'Khí huyết', atk: 'Công', matk: 'Phép', def: 'Thủ' }[k] || k} +${v}%`).join(' · ')}</div>
          <div class="s">${esc(m.desc)} · Cần cấp ${m.lvl}</div></div>
          ${m.owned ? (m.riding ? '<button class="btn-seal sm ghost" data-off="1">Xuống</button>' : `<button class="btn-seal sm jade" data-ride="${m.id}">Cưỡi</button>`)
            : m.craft ? '<button class="btn-seal sm ghost" data-craft="1">Lò Rèn</button>' : `<button class="btn-seal sm" data-buy="${m.id}" ${G.me.lvl >= m.lvl ? '' : 'disabled'}>${m.price.bac ? fmt(m.price.bac) + ' bạc' : m.price.vang + ' vàng'}</button>`}</div>`).join('')}</div>`;
      body.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = async () => { const m = r.list.find((x) => x.id === b.dataset.buy); if (await UI.confirm(`<p>Mua <b>${esc(m.name)}</b>?</p>`, 'Mua')) { const x = await G.call('mount:buy', { id: m.id }); if (x.ok) Sound.sfx('levelup'); UI.refreshSheet(); } }));
      body.querySelectorAll('[data-ride]').forEach((b) => (b.onclick = async () => { await G.call('mount:ride', { id: b.dataset.ride }); Sound.sfx('portal'); UI.refreshSheet(); }));
      body.querySelectorAll('[data-off]').forEach((b) => (b.onclick = async () => { await G.call('mount:ride', { id: null }); UI.refreshSheet(); }));
      body.querySelectorAll('[data-craft]').forEach((b) => (b.onclick = () => craft('ren')));
    });
  }

  // ================= LÒ BÁT QUÁI & LÒ RÈN =================
  let craftSlot = 'vukhi';
  function craft(tab) { UI.openSheet('craft', 'Lò Bát Quái & Lò Rèn', [['dan', 'Luyện đan'], ['ren', 'Rèn đồ'], ['mat', 'Nguyên liệu']], renderCraft, tab); }
  async function renderCraft(body, tab) {
    const I = M().ITEMS;
    if (tab === 'mat') {
      const mats = ['thao_duoc', 'yeu_dan', 'tinh_thach', 'thu_bi', 'da_ch', 'linh_dan', 'hop_the_dan'];
      body.innerHTML = `<p class="muted">Nguyên liệu rơi khi đánh yêu quái ngoài dã ngoại, trong Trấn Yêu Tháp và từ boss (boss rơi nhiều hơn, đôi khi rơi Sách kỹ năng).</p>
        <div class="list">${mats.map((id) => `<div class="li"><span class="ico">${icon(id)}</span><div class="grow"><div class="t">${esc(I[id].name)}</div><div class="s">${esc(I[id].desc)}</div></div><b>×${G.count(id)}</b></div>`).join('')}</div>`;
      return;
    }
    const r = await Net.emit('craft:list'); if (!r.ok) return;
    const list = r.recipes.filter((x) => x.kind === tab);
    body.innerHTML = `<div class="forge ${tab}"><span>${tab === 'dan' ? '⚗️' : '⚒️'}</span><div><b>${tab === 'dan' ? 'Lò Bát Quái' : 'Lò Rèn Thiên Đình'}</b><small>${tab === 'dan' ? 'Luyện đan dược, linh đan cho Tiên sủng, sách kỹ năng.' : 'Rèn trang bị theo cấp của bạn, đá cường hoá, thú cưỡi Kỳ Lân.'}</small></div></div>
      ${tab === 'ren' ? `<div class="seg wrap" style="margin:8px 0">${Object.entries(M().SLOTS).map(([k, s]) => `<button class="seg-b ${k === craftSlot ? 'on' : ''}" data-slot="${k}">${s.icon} ${s.name}</button>`).join('')}</div>` : ''}
      <div class="list">${list.map((x) => { const ok = Object.entries(x.need).every(([k, q]) => (x.have[k] || 0) >= q) && G.me.bac >= x.cost && (!x.lvl || G.me.lvl >= x.lvl);
        return `<div class="li"><span class="ico">${x.give === 'equip' ? M().SLOTS[craftSlot].icon : x.give === 'book' ? '📚' : String(x.give).startsWith('mount') ? '🦄' : icon(Object.keys(x.give)[0])}</span>
        <div class="grow"><div class="t">${esc(x.name)}${x.lvl ? ` <small class="muted">· cần cấp ${x.lvl}</small>` : ''}</div>
        <div class="s">${Object.entries(x.need).map(([k, q]) => `<span style="color:${(x.have[k] || 0) >= q ? '#2a6a3a' : '#a8301e'}">${esc(I[k].name)} ${x.have[k] || 0}/${q}</span>`).join(' · ')} · ${fmt(x.cost)} bạc</div>
        ${x.give === 'equip' ? '<div class="s">Phẩm chất ngẫu nhiên: Phàm 30% · Lương 35% · Tinh 22% · Cực 10% · Truyền Thuyết 3%</div>' : ''}</div>
        <button class="btn-seal sm" data-make="${x.id}" ${ok ? '' : 'disabled'}>${tab === 'dan' ? 'Luyện' : 'Rèn'}</button></div>`; }).join('')}</div>`;
    body.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => { craftSlot = b.dataset.slot; UI.refreshSheet(); }));
    body.querySelectorAll('[data-make]').forEach((b) => (b.onclick = async () => {
      b.disabled = true;
      const fl = document.createElement('div'); fl.className = 'forge-fx ' + tab; body.prepend(fl); Sound.sfx(tab === 'dan' ? 'fire' : 'rock');
      await sleep(650);
      const x = await G.call('craft:make', { id: b.dataset.make, slot: craftSlot }, true);
      fl.remove();
      if (x.ok) { Sound.sfx('chest'); UI.toast('✨ ' + x.msg, 'gold'); } else UI.toast(x.msg, 'err');
      UI.refreshSheet();
    }));
  }

  // ================= BỒI DƯỠNG TIÊN SỦNG =================
  let labPet = null, fuseB = null;
  function petLab(uid, tab) { labPet = uid || labPet; UI.openSheet('petlab', 'Bồi dưỡng Tiên sủng', [['learn', 'Học chiêu'], ['evolve', 'Tiến hoá'], ['fuse', 'Hợp thể']], renderLab, tab); }
  function renderLab(body, tab) {
    const c = G.me, Gr = M().GRADES, SK = M().SKILLS;
    if (!c.pets.length) { body.innerHTML = '<p class="muted">Chưa có Tiên sủng.</p>'; return; }
    if (!c.pets.find((p) => p.uid === labPet)) labPet = c.activePet || c.pets[0].uid;
    const p = c.pets.find((x) => x.uid === labPet);
    const pick = `<div class="pet-row">${c.pets.map((x) => `<button class="pet-chip ${x.uid === labPet ? 'on' : ''}" data-u="${x.uid}">${Sprites.petImg(x)}<small style="color:${gcol(x.grade)}">${esc(x.name)}</small></button>`).join('')}</div>`;
    let html = pick + `<div class="sec">${esc(p.name)} <small class="muted">· ${Gr[p.grade].name} · cấp ${p.lvl}</small></div>`;
    if (tab === 'learn') {
      const books = c.bag.filter((b) => b.t === 'item' && M().ITEMS[b.id].type === 'book');
      html += `<div class="muted">Chiêu hiện có (${p.skills.length}/4): ${p.skills.map((k) => `<b>${esc(SK[k].name)}</b>`).join(', ')}</div>
        <p class="muted">Học sách để thêm chiêu (tối đa 4). Khi đã đủ, chiêu học từ sách lâu nhất sẽ bị thay.</p>
        <div class="list">${books.map((b) => `<div class="li"><span class="ico">${icon(b.id)}</span><div class="grow"><div class="t">${esc(M().ITEMS[b.id].name)} ×${b.qty}</div><div class="s">${esc(M().ITEMS[b.id].desc)}</div></div><button class="btn-seal sm" data-book="${b.id}">Học</button></div>`).join('') || '<p class="muted">Chưa có sách. Luyện ở Lò Bát Quái hoặc đánh boss để nhặt.</p>'}</div>`;
    } else if (tab === 'evolve') {
      const g = p.grade, need = { lvl: 15 + g * 10, dan: g + 1, bac: 500 * (g + 1) };
      const ok = g < 4 && p.lvl >= need.lvl && G.count('linh_dan') >= need.dan && c.bac >= need.bac;
      html += g >= 4 ? '<p>Tiên sủng đã đạt phẩm cao nhất <b>Thánh</b>.</p>' : `
        <div class="evo"><div>${Sprites.petImg(p, 'big')}<b style="color:${gcol(g)}">${Gr[g].name}</b></div><span>➜</span><div class="glow">${Sprites.petImg(p, 'big')}<b style="color:${gcol(g + 1)}">${Gr[g + 1].name}</b></div></div>
        <div class="list"><div class="li"><span class="ico">⭐</span><div class="grow">Cấp Tiên sủng ${p.lvl}/${need.lvl}</div>${p.lvl >= need.lvl ? '✅' : '❌'}</div>
        <div class="li"><span class="ico">${icon('linh_dan')}</span><div class="grow">Linh Đan ${G.count('linh_dan')}/${need.dan}</div>${G.count('linh_dan') >= need.dan ? '✅' : '❌'}</div>
        <div class="li"><span class="ico">💰</span><div class="grow">${fmt(need.bac)} bạc</div>${c.bac >= need.bac ? '✅' : '❌'}</div></div>
        <p class="muted">Tiến hoá giữ nguyên cấp, chiêu đã học; chỉ số tăng theo phẩm mới. Từ phẩm Tinh trở lên có thêm chiêu đánh toàn bộ địch.</p>
        <div class="btns"><button class="btn-seal" id="lab-evo" ${ok ? '' : 'disabled'}>Tiến hoá</button></div>`;
    } else {
      const others = c.pets.filter((x) => x.uid !== p.uid);
      if (!others.find((x) => x.uid === fuseB)) fuseB = others[0] && others[0].uid;
      const b = others.find((x) => x.uid === fuseB);
      const cost = b ? 500 * (Math.max(p.grade, b.grade) + 1) : 0;
      html += !b ? '<p class="muted">Cần ít nhất 2 Tiên sủng.</p>' : `
        <div class="muted">Chọn Tiên sủng thứ hai:</div><div class="pet-row">${others.map((x) => `<button class="pet-chip ${x.uid === fuseB ? 'on' : ''}" data-b="${x.uid}">${Sprites.petImg(x)}<small style="color:${gcol(x.grade)}">${esc(x.name)}</small></button>`).join('')}</div>
        <div class="evo"><div>${Sprites.petImg(p, 'big')}</div><span>＋</span><div>${Sprites.petImg(b, 'big')}</div><span>＝</span><div class="glow"><span style="font:40px/1 var(--emoji)">❓</span></div></div>
        <p class="muted">Hình thái và ngũ hành lấy ngẫu nhiên từ một trong hai. Phẩm bằng phẩm cao hơn, <b>30% cơ hội lên thêm 1 phẩm</b>. Cấp bằng trung bình. Giữ tối đa 2 chiêu đã học. Có Biến Dị thì 60% giữ được. Cả hai Tiên sủng cũ sẽ mất.</p>
        <div class="muted">Cần: 1 Hợp Thể Đan (${G.count('hop_the_dan')}) · ${fmt(cost)} bạc</div>
        <div class="btns"><button class="btn-seal" id="lab-fuse" ${G.count('hop_the_dan') >= 1 && c.bac >= cost ? '' : 'disabled'}>Hợp thể</button></div>`;
    }
    body.innerHTML = html;
    body.querySelectorAll('[data-u]').forEach((x) => (x.onclick = () => { labPet = x.dataset.u; UI.refreshSheet(); }));
    body.querySelectorAll('[data-b]').forEach((x) => (x.onclick = () => { fuseB = x.dataset.b; UI.refreshSheet(); }));
    body.querySelectorAll('[data-book]').forEach((x) => (x.onclick = async () => { const r = await G.call('pet:learn', { uid: p.uid, book: x.dataset.book }); if (r.ok) Sound.sfx('buff'); }));
    const ev = $('#lab-evo'); if (ev) ev.onclick = async () => { const r = await G.call('pet:evolve', { uid: p.uid }, true); if (r.ok) { celebrate(r.pet, 'Tiến Hoá Thành Công'); } else UI.toast(r.msg, 'err'); };
    const fu = $('#lab-fuse'); if (fu) fu.onclick = async () => {
      if (!(await UI.confirm(`<p>Hợp thể <b>${esc(p.name)}</b> và <b>${esc(c.pets.find((x) => x.uid === fuseB).name)}</b>? Hai Tiên sủng cũ sẽ mất.</p>`, 'Hợp thể'))) return;
      const r = await G.call('pet:fuse', { a: p.uid, b: fuseB }, true); if (r.ok) { labPet = r.pet.uid; celebrate(r.pet, 'Hợp Thể Thành Công'); } else UI.toast(r.msg, 'err');
    };
  }
  function celebrate(p, title) {
    Sound.sfx('levelup');
    UI.modal(`<div class="victory win"><div class="v-title" style="font-size:28px">${esc(title)}</div></div><div class="pet-show">${Sprites.petImg(p, 'big')}</div>
      <p style="text-align:center;font-weight:700;font-size:18px;color:${gcol(p.grade)}">${esc(p.name)}</p><p class="muted center">${M().GRADES[p.grade].name} · cấp ${p.lvl} · ${p.skills.map((k) => M().SKILLS[k].name).join(', ')}</p>`, [{ id: 'ok', label: 'Tuyệt vời' }]).then(() => UI.refreshSheet());
  }

  // ================= CHỢ GIAO DỊCH =================
  let mkKind = 'all', mkQ = '', sellKind = 'item';
  function market(tab) { UI.openSheet('market', 'Chợ Trường An', [['buy', 'Mua'], ['sell', 'Bán'], ['mine', 'Hàng của tôi'], ['mail', 'Thư']], renderMarket, tab); }
  async function renderMarket(body, tab) {
    const c = G.me;
    if (tab === 'buy' || tab === 'mine') {
      body.innerHTML = tab === 'buy' ? `<div class="row" style="gap:6px;margin-bottom:6px"><input id="mk-q" placeholder="Tìm tên món hàng…" value="${esc(mkQ)}" maxlength="30" style="flex:1"><button class="btn-seal sm" id="mk-go">Tìm</button></div>
        <div class="seg" style="margin-bottom:8px">${[['all', 'Tất cả'], ['item', 'Vật phẩm'], ['eq', 'Trang bị'], ['pet', 'Tiên sủng']].map(([k, l]) => `<button class="seg-b ${k === mkKind ? 'on' : ''}" data-k="${k}">${l}</button>`).join('')}</div><div id="mk-list" class="muted">Đang tải…</div>` : '<div id="mk-list" class="muted">Đang tải…</div>';
      body.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { mkKind = b.dataset.k; UI.refreshSheet(); }));
      const go = $('#mk-go'); if (go) { go.onclick = () => { mkQ = $('#mk-q').value; UI.refreshSheet(); }; $('#mk-q').onkeydown = (e) => { if (e.key === 'Enter') go.click(); }; }
      const r = await Net.emit('market:list', { kind: tab === 'mine' ? 'mine' : mkKind, q: mkQ });
      const box = $('#mk-list'); if (!box || !r.ok) return;
      box.className = 'list';
      box.innerHTML = (tab === 'mine' ? `<p class="muted">Đang bán ${r.mine}/${r.max} món. Hàng tự trả về sau 3 ngày nếu chưa bán. Thuế chợ ${r.tax * 100}% khi bán được.</p>` : '') +
        (r.list.map((l) => `<div class="li"><span class="ico">${l.kind === 'pet' ? Sprites.petImg(l.pet) : l.kind === 'item' ? icon(l.itemId) : l.icon}</span>
          <div class="grow"><div class="t" style="${l.q != null ? `color:${l.kind === 'pet' ? gcol(l.q) : Panels.PAPER_Q[l.q]}` : ''}">${esc(l.title)}</div><div class="s">${esc(l.sub || '')}</div><div class="s">Người bán: ${esc(l.seller)}</div></div>
          <div style="text-align:right"><b class="price">${fmt(l.price)}</b><small class="muted"> bạc</small><br>${l.mine ? `<button class="btn-seal sm ghost" data-cancel="${l.id}">Huỷ</button>` : `<button class="btn-seal sm" data-buy="${l.id}" ${c.bac >= l.price ? '' : 'disabled'}>Mua</button>`}</div></div>`).join('') || '<p class="muted">Chưa có món hàng nào.</p>');
      box.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = async () => { const l = r.list.find((x) => x.id === b.dataset.buy); if (await UI.confirm(`<p>Mua <b>${esc(l.title)}</b> giá <b>${fmt(l.price)}</b> bạc?</p>`, 'Mua')) { const x = await G.call('market:buy', { id: l.id }); if (x.ok) Sound.sfx('coin'); UI.refreshSheet(); } }));
      box.querySelectorAll('[data-cancel]').forEach((b) => (b.onclick = async () => { await G.call('market:cancel', { id: b.dataset.cancel }); UI.refreshSheet(); }));
    } else if (tab === 'sell') {
      const I = M().ITEMS;
      const items = c.bag.filter((b) => b.t === 'item'), eqs = c.bag.filter((b) => b.t === 'eq' && !b.unique), pets = c.pets.filter((p) => p.uid !== c.activePet);
      body.innerHTML = `<p class="muted">Đăng bán cho người chơi khác (cần cấp 5). Bạc về túi ngay cả khi bạn ngoại tuyến. Thuế 5%.</p>
        <div class="seg" style="margin-bottom:8px">${[['item', 'Vật phẩm'], ['eq', 'Trang bị'], ['pet', 'Tiên sủng']].map(([k, l]) => `<button class="seg-b ${k === sellKind ? 'on' : ''}" data-sk="${k}">${l}</button>`).join('')}</div>
        <div class="list">${sellKind === 'item' ? items.map((b) => `<button class="li" data-sell="${b.id}"><span class="ico">${icon(b.id)}</span><div class="grow"><div class="t">${esc(I[b.id].name)} ×${b.qty}</div></div></button>`).join('')
          : sellKind === 'eq' ? eqs.map((b) => `<button class="li" data-sell="${b.uid}"><span class="ico">${M().SLOTS[b.slot].icon}</span><div class="grow"><div class="t" style="color:${Panels.PAPER_Q[b.q]}">${esc(QN()[b.q].name)} ${esc(b.name)}${b.plus ? ' +' + b.plus : ''}</div><div class="s">Cấp ${b.lvl}</div></div></button>`).join('')
            : pets.map((p) => `<button class="li" data-sell="${p.uid}"><span class="ico">${Sprites.petImg(p)}</span><div class="grow"><div class="t" style="color:${gcol(p.grade)}">${esc(p.name)}</div><div class="s">Cấp ${p.lvl}</div></div></button>`).join('')}</div>`;
      body.querySelectorAll('[data-sk]').forEach((b) => (b.onclick = () => { sellKind = b.dataset.sk; UI.refreshSheet(); }));
      body.querySelectorAll('[data-sell]').forEach((b) => (b.onclick = async () => {
        const v = b.dataset.sell, it = sellKind === 'item' ? items.find((x) => x.id === v) : null;
        const ok = await UI.modal(`<h3 style="font-size:20px">Đăng bán</h3>${it ? `<label>Số lượng (có ${it.qty})<input id="mk-n" type="number" inputmode="numeric" min="1" max="${it.qty}" value="1"></label>` : ''}<label>Giá (bạc)<input id="mk-p" type="number" inputmode="numeric" min="1" value="100"></label>`,
          [{ id: 'no', label: 'Thôi', cls: 'ghost' }, { id: 'yes', label: 'Đăng bán' }]);
        if (ok !== 'yes') return;
        const x = await G.call('market:sell', { kind: sellKind, id: v, uid: v, qty: it ? $('#mk-n').value : 1, price: $('#mk-p').value });
        if (x.ok) Sound.sfx('coin');
        UI.refreshSheet();
      }));
    } else {
      const r = await Net.emit('mail:read'); if (!r.ok) return;
      body.innerHTML = `<div class="list">${r.list.map((m) => `<div class="li"><span class="ico">📬</span><div class="grow"><div class="t">${esc(m.text)}</div><div class="s">${new Date(m.t).toLocaleString('vi-VN')}</div></div></div>`).join('') || '<p class="muted">Không có thư.</p>'}</div>`;
    }
  }

  // ================= SỰ KIỆN =================
  function event() {
    sub('event', 'Sự kiện', async (body) => {
      const r = await Net.emit('event:info'); if (!r.ok) return;
      const e = r.event;
      if (!e) { body.innerHTML = `<div class="detail"><b>Hiện chưa có sự kiện.</b><p class="muted">${r.next ? `Sự kiện sắp tới: <b>${esc(r.next.name)}</b> từ ngày ${r.next.from.split('-').reverse().join('/')}.` : ''}</p><p class="muted">Dịp Tết Nguyên Đán và Trung Thu sẽ có lì xì, pháo hoa, bánh chưng, bánh trung thu, rước đèn đổi Trứng Biến Dị.</p></div>`; return; }
      body.innerHTML = `<div class="ev-hero ${e.id.replace(/\d+/, '')}"><span>${e.icon}</span><div><b>${esc(e.name)}</b><small>${e.from.split('-').reverse().join('/')} – ${e.to.split('-').reverse().join('/')}</small></div></div>
        <p>${esc(e.desc)}</p>
        <div class="btns"><button class="btn-seal" id="ev-gift" ${e.giftToday ? 'disabled' : ''}>${e.giftToday ? 'Hôm nay đã nhận quà' : 'Nhận quà hôm nay'}</button></div>
        ${e.collect ? `<div class="detail"><div class="row"><span style="font:30px/1 var(--emoji)">${M().ITEMS[e.collect.item].icon}</span><div class="grow"><b>Đổi quà</b><div class="muted">${e.have}/${e.collect.n} ${esc(M().ITEMS[e.collect.item].name)} → 15 vàng + Trứng Biến Dị</div><div class="pbar"><i style="width:${Math.min(100, 100 * e.have / e.collect.n)}%"></i></div></div><button class="btn-seal sm" id="ev-ex" ${e.have >= e.collect.n ? '' : 'disabled'}>Đổi</button></div></div>` : ''}
        <p class="muted">Dùng Bao Lì Xì và Pháo Hoa trong Hành trang. Pháo hoa bắn lên trời cho mọi người cùng bản đồ xem.</p>`;
      $('#ev-gift').onclick = async () => { const x = await G.call('event:gift', {}); if (x.ok) Sound.sfx('chest'); UI.refreshSheet(); };
      const ex = $('#ev-ex'); if (ex) ex.onclick = async () => { const x = await G.call('event:exchange', {}); if (x.ok) Sound.sfx('levelup'); UI.refreshSheet(); };
    });
  }

  // ================= TỔ ĐỘI =================
  let party = null;
  function setParty(p) { party = p; renderPartyBar(); if (UI.sheet.name === 'party') UI.refreshSheet(); }
  function renderPartyBar() {
    let el = $('#party-bar');
    if (!el) { el = document.createElement('div'); el.id = 'party-bar'; $('#map').parentElement.appendChild(el); el.onclick = () => partyPanel(); }
    if (!party || !G.me) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = party.members.filter((m) => m.id !== G.me.id).map((m) => `<div class="pm ${m.online ? '' : 'off'} ${m.map === G.me.map ? 'near' : ''}"><img src="${Sprites.faceURL(m.race, m.gender, m.gear)}" alt=""><small>${esc(m.name)}</small></div>`).join('');
  }
  function partyPanel() {
    sub('party', 'Tổ đội', async (body) => {
      if (!party) { const r = await Net.emit('party:info'); party = r.party; }
      const lead = party && party.leader === G.me.id;
      body.innerHTML = `<p class="muted">Tổ đội tối đa 3 người. Khi đánh quái, boss hoặc leo tháp, đồng đội <b>đang online và cùng bản đồ</b> sẽ cùng xuất trận (tự đánh). Cả đội đều nhận thưởng, người dẫn được thêm 10% tu vi cho mỗi đồng đội. Có kênh chat riêng <b>Đội</b>.</p>
        ${party ? `<div class="list">${party.members.map((m) => `<div class="li"><img src="${Sprites.faceURL(m.race, m.gender, m.gear)}" style="width:36px" alt=""><div class="grow"><div class="t">${esc(m.name)} ${m.id === party.leader ? '<span class="tag">Đội trưởng</span>' : ''}</div><div class="s">${m.online ? '🟢 Online' : '⚪ Ngoại tuyến'} · Cấp ${m.lvl} · ${esc(M().MAPS[m.map]?.name || '')}</div></div>${lead && m.id !== G.me.id ? `<button class="btn-seal sm ghost" data-kick="${m.id}">Mời ra</button>` : ''}</div>`).join('')}</div>` : '<p>Bạn chưa có tổ đội.</p>'}
        ${!party || (lead && party.members.length < 3) ? `<div class="row" style="gap:6px;margin-top:8px"><input id="pt-name" placeholder="Tên người chơi đang online" maxlength="12" style="flex:1"><button class="btn-seal sm" id="pt-inv">Mời</button></div>` : ''}
        ${party ? '<div class="btns"><button class="btn-seal ghost" id="pt-leave">Rời tổ đội</button></div>' : ''}`;
      const inv = $('#pt-inv'); if (inv) inv.onclick = async () => { const n = $('#pt-name').value.trim(); if (n) await G.call('party:invite', { name: n }); };
      const lv = $('#pt-leave'); if (lv) lv.onclick = async () => { await G.call('party:leave', {}); party = null; renderPartyBar(); UI.refreshSheet(); };
      body.querySelectorAll('[data-kick]').forEach((b) => (b.onclick = async () => { await G.call('party:kick', { id: b.dataset.kick }); }));
    });
  }

  // ================= BẢN ĐỒ THẾ GIỚI =================
  const TH_ICON = { heaven: '☁️', city: '🏯', forest: '⛰️', desert: '🌋', river: '🌊', cave: '🕳️', snow: '❄️' };
  function renderWorld(body) {
    const c = G.me, order = M().MAP_ORDER;
    const n = order.length, rowH = 86, Hh = n * rowH + 40;
    const pts = order.map((id, i) => [50 + Math.sin(i * 1.15) * 30, Hh - 40 - i * rowH]);
    const path = pts.map(([x, y], i) => (i ? 'L' : 'M') + (x * 3.4).toFixed(0) + ' ' + y).join(' ');
    body.innerHTML = `<p class="muted">Hành trình thỉnh kinh từ Thiên Cung, Đông Thổ Đại Đường tới Linh Sơn. Chạm vào chương đã mở để truyền tống.</p>
      <div class="world" style="height:${Hh}px"><svg viewBox="0 0 340 ${Hh}" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="#8a5a2a" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round" opacity=".7"/></svg>
      ${order.map((id, i) => { const m = M().MAPS[id], ok = m.chapter <= c.unlocked, here = id === c.map; const [x, y] = pts[i];
        return `<button class="wnode ${x > 52 ? 'r' : ''} ${ok ? '' : 'lock'} ${here ? 'here' : ''} th-${m.theme}" data-m="${id}" style="left:${x}%;top:${y}px" ${ok ? '' : 'disabled'}>
          <span class="wi">${ok ? TH_ICON[m.theme] || '🗺️' : '🔒'}</span>${here ? `<img class="wme" src="${Sprites.heroURL(c.race, c.gender, 0, c.gear)}" alt="">` : ''}
          <span class="wl"><b>${i === 0 ? 'Tiền truyện' : 'Chương ' + m.chapter}</b>${esc(m.name)}<small>${ok ? `Quái cấp ${m.lv[0]}–${m.lv[1]}` : 'Chưa mở'}</small></span></button>`; }).join('')}</div>`;
    const w = body.querySelector('.world .here'); if (w) setTimeout(() => w.scrollIntoView({ block: 'center' }), 50);
    body.querySelectorAll('[data-m]').forEach((b2) => (b2.onclick = async () => { if (b2.dataset.m === c.map) return; const r = await G.call('map:travel', { map: b2.dataset.m }); if (r.ok) { UI.closeSheet(); G.onTravel(r); } }));
  }

  // ================= BẢN ĐỒ NHỎ =================
  let mini = null, miniBig = false;
  function initMini() {
    if (mini) return;
    mini = document.createElement('canvas'); mini.id = 'minimap';
    $('#map').parentElement.appendChild(mini);
    mini.onclick = (e) => { e.stopPropagation(); miniBig = !miniBig; mini.classList.toggle('big', miniBig); drawMini(); };
    setInterval(drawMini, 400);
  }
  const TC = { '.': '#d8c8a0', ',': '#6aa050', '~': '#3a7ac8', W: '#5ab0e8', '#': '#5a4a3a', T: '#2e6a2e', H: '#a8503a', P: '#ffd65a' };
  function drawMini() {
    if (!mini || !G.me || !GameMap.meta || $('#scr-game').hidden) return;
    const Mp = GameMap.meta, s = miniBig ? 9 : 5, dpr = Math.min(2, devicePixelRatio || 1);
    const w = 12 * s, h = 20 * s;
    if (mini.width !== w * dpr) { mini.width = w * dpr; mini.height = h * dpr; mini.style.width = w + 'px'; mini.style.height = h + 'px'; }
    const g = mini.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    Mp.tiles.forEach((row, y) => [...row].forEach((ch, x) => { g.fillStyle = TC[ch] || '#888'; g.fillRect(x * s, y * s, s, s); }));
    const t = performance.now();
    for (const n of Mp.npcs) { const q = n.id === GameMap.questNpc; g.fillStyle = n.boss ? '#ff4a3a' : q ? '#ffd65a' : '#ffffff'; const r = q ? s * (0.45 + 0.2 * Math.sin(t / 200)) : s * 0.3; g.beginPath(); g.arc(n.x * s + s / 2, n.y * s + s / 2, r, 0, 7); g.fill(); }
    g.fillStyle = '#e02a2a'; g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.arc(G.me.x * s + s / 2, G.me.y * s + s / 2, s * 0.5, 0, 7); g.fill(); g.stroke();
  }

  // ================= TRANH TRUYỆN MỖI CHƯƠNG =================
  function comic(mapId) {
    const m = M().MAPS[mapId]; if (!m) return Promise.resolve();
    const qs = M().QUESTS.filter((q) => q.map === mapId);
    const bosses = m.npcs.filter((n) => n.boss), friends = (m.npcs.filter((n) => !n.boss && qs.some((q) => q.type === 'talk' && q.npc === n.id)).concat(m.npcs.filter((n) => !n.boss && !n.role))).filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 3);
    const img = (n, cls = '') => { const a = Art.npc(n.look || n.id); return a ? `<img class="px ${cls}" src="${a.url}" alt="">` : `<span class="emo">${n.icon}</span>`; };
    const bg = `url('${Tiles.battleBG(m.theme)}')`;
    const panels = [
      { cls: 'p1', html: `<div class="cp-title"><small>${mapId === 'ch1' ? 'Tiền truyện' : 'Chương ' + m.chapter}</small><b>${esc(m.name)}</b><i>${esc(m.sub || '')}</i></div>` },
      { cls: 'p2', html: `<div class="cp-cast">${friends.map((n) => img(n)).join('')}</div><div class="cp-cap">${esc((qs[0] && qs[0].text) || '')}</div>` },
      bosses.length ? { cls: 'p3', html: `<div class="cp-boss">${img(bosses[bosses.length - 1], 'boss')}</div><div class="cp-cap red">${esc(bosses.map((b) => b.name).join(' · '))} đang chờ phía trước… ${qs.reduce((s, q) => s + (q.nan || 0), 0)} kiếp nạn.</div>` } : null,
    ].filter(Boolean);
    return new Promise((res) => {
      const el = document.createElement('div'); el.id = 'comic';
      el.innerHTML = `<div class="cp-strip">${panels.map((p, i) => `<div class="cp ${p.cls}" style="background-image:${bg};animation-delay:${i * 0.5}s">${p.html}</div>`).join('')}</div><button class="cp-skip">Chạm để tiếp tục ▸</button>`;
      document.body.appendChild(el);
      Sound.sfx('gong');
      const close = () => { el.classList.add('out'); setTimeout(() => { el.remove(); res(); }, 350); };
      setTimeout(() => (el.onclick = close), 900);
    });
  }
  function maybeComic(mapId) {
    let seen = {}; try { seen = JSON.parse(localStorage.getItem('tdk_comics') || '{}'); } catch {}
    if (seen[mapId] || BattleUI.active) return;
    seen[mapId] = 1; try { localStorage.setItem('tdk_comics', JSON.stringify(seen)); } catch {}
    setTimeout(() => comic(mapId), 400);
  }

  // ================= PHÁO HOA =================
  function firework(by) {
    const cv = document.createElement('canvas'); cv.className = 'fw-canvas'; document.body.appendChild(cv);
    const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const parts = [], cols = ['#ffd65a', '#ff6a5a', '#7ad8ff', '#b88aff', '#9fffb0', '#ffffff'];
    for (let k = 0; k < 5; k++) setTimeout(() => { const x = W * (0.2 + Math.random() * 0.6), y = H * (0.15 + Math.random() * 0.3), c = cols[k % cols.length]; Sound.sfx('fireworks'); for (let i = 0; i < 60; i++) { const a = (i / 60) * 6.28, v = 1.5 + Math.random() * 2.5; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 60 + Math.random() * 30, t: 0, c }); } }, k * 380);
    if (by) UI.toast(`🎆 ${by} bắn pháo hoa!`, 'gold');
    const t0 = performance.now();
    (function loop(now) {
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const p of parts) { if (p.t > p.life) continue; p.t++; p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.04; p.x += p.vx; p.y += p.vy; g.globalAlpha = 1 - p.t / p.life; g.fillStyle = p.c; g.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
      if (now - t0 < 4200) requestAnimationFrame(loop); else cv.remove();
    })(t0);
  }

  return { mounts, craft, petLab, market, event, partyPanel, setParty, renderPartyBar, renderWorld, initMini, drawMini, comic, maybeComic, firework, get party() { return party; } };
})();
