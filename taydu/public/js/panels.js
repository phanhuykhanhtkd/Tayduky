// Các bảng chức năng: Nhân vật, Tiên sủng, Hành trang, Nhiệm vụ, Hoạt động, Giao lưu, Cửa hàng
const Panels = (() => {
  const RN = { the: 'Thể', luc: 'Lực', phap: 'Pháp', nhanh: 'Nhanh' };
  const RD = { the: 'Khí huyết & phòng thủ', luc: 'Sát thương vật lý', phap: 'Nội lực & uy lực phép', nhanh: 'Tốc độ, ra đòn trước & né tránh' };
  const pending = { the: 0, luc: 0, phap: 0, nhanh: 0 };
  let selBag = null, selPet = null, selSlot = null, chatCh = 'all', chatTo = 'khu', bet = 100;

  const M = () => G.meta;
  const qColor = (q) => M().QUALITIES[q].color;
  // màu đọc được trên nền giấy
  const PAPER_Q = ['#2b2018', '#2f7d2f', '#2b62a8', '#7b3fb5', '#b35f00', '#b8241c'];
  const PAPER_G = ['#5e4a38', '#2f7d2f', '#2b62a8', '#7b3fb5', '#b35f00'];
  const icon = (id) => Sprites.itemIcon(id, M().ITEMS);
  const statLine = (o) => Object.entries(o).map(([k, v]) => `${M().STAT_NAMES[k] || k} +${v}`).join(' · ');

  // ================= NHÂN VẬT =================
  function char(tab) {
    UI.openSheet('char', 'Nhân vật', [['info', 'Thuộc tính'], ['equip', 'Trang bị'], ['rel', 'Quan hệ']], renderChar, tab);
  }
  function renderChar(body, tab) {
    const c = G.me, d = c.derived, R = M().RACES[c.race];
    if (tab === 'info') {
      const left = c.points - Object.values(pending).reduce((a, b) => a + b, 0);
      body.innerHTML = `
        <div class="char-top"><img src="${Sprites.heroURL(c.race, c.gender, 0, c.gear)}" alt="">
          <div><h4 style="margin:0;font-size:20px">${esc(c.name)}</h4>
          <div class="muted">${R.name} · Cấp ${c.lvl} · Lực chiến ${fmt(c.power)}</div>
          <div class="muted">Tu vi ${fmt(c.exp)} / ${fmt(c.need)}</div><div class="pbar"><i style="width:${100 * c.exp / c.need}%"></i></div>
          <div class="muted" style="margin-top:4px">Kiếp nạn đã vượt: <b>${c.nan}/81</b></div></div></div>
        <div class="sec">Chỉ số</div>
        <div class="st-card ornate-gold">
          <div class="st-bars">
            <div><span>Khí huyết</span><div class="bar hp"><i style="width:${100 * c.hp / d.maxHp}%"></i><em>${fmt(c.hp)} / ${fmt(d.maxHp)}</em></div></div>
            <div><span>Pháp lực</span><div class="bar mp"><i style="width:${100 * c.mp / d.maxMp}%"></i><em>${fmt(c.mp)} / ${fmt(d.maxMp)}</em></div></div>
          </div>
          <table class="st-tbl"><tbody>
            <tr><th>⚔ Công</th><td>${d.atk}</td><th>✴ Pháp công</th><td>${d.matk}</td></tr>
            <tr><th>🛡 Thủ</th><td>${d.def}</td><th>☯ Kháng phép</th><td>${d.mdef}</td></tr>
            <tr><th>💨 Tốc</th><td>${d.spd}</td><th>🍃 Né tránh</th><td>${d.dodge}%</td></tr>
            <tr><th>💥 Bạo kích</th><td>${d.crit}%</td><th>🎒 Sức chứa</th><td>${c.pets.length}/${M().CONFIG?.petBag || '—'}</td></tr>
            ${c.spouse ? '<tr><th>💞 Phu thê</th><td>+5%</td><th></th><td></td></tr>' : ''}
          </tbody></table>
        </div>
        <div class="sec">Điểm tiềm năng <span class="pts ${left ? 'has' : ''}">${left}</span></div>
        <div class="st-card ornate-gold st-alloc">
          <div class="st-who"><img src="${Sprites.faceURL(c.race, c.gender, c)}" alt=""><div><b>${esc(c.name)}</b><small>${M().RACES[c.race].name} · Cấp ${c.lvl}</small><small>Tổng tiềm năng: ${Object.values(c.stats).reduce((x, y) => x + y, 0) + left}</small></div></div>
          ${radar(c, pending)}
          <div class="alloc">
          ${Object.keys(RN).map((k) => `<b>${RN[k]}</b><span class="v">${c.stats[k]}<i class="add">${pending[k] ? '+' + pending[k] : ''}</i></span>
            <button class="pm minus" data-k="${k}" data-v="-1" aria-label="Bớt ${RN[k]}" ${pending[k] ? '' : 'disabled'}>−</button><button class="pm plus" data-k="${k}" data-v="1" aria-label="Thêm ${RN[k]}" ${left ? '' : 'disabled'}>+</button>
            <span class="hint">${RD[k]}</span>`).join('')}
          </div>
          <div class="btns"><button class="btn-seal" id="al-ok" ${Object.values(pending).some(Boolean) ? '' : 'disabled'}>Xác nhận cộng điểm</button>
            <button class="btn-seal ghost sm" id="al-reset">Tẩy điểm (20 vàng)</button></div>
        </div>
        <div class="sec">Kỹ năng</div>
        <div class="list">${c.skills.map((k) => { const s = M().SKILLS[k]; const ok = (s.lv || 1) <= c.lvl; return `<div class="li" style="${ok ? '' : 'opacity:.5'}"><span class="ico">${{ heal: '💚', buff: '✨', phys: '🗡️', magic: '🔮' }[s.type]}</span><div class="grow"><div class="t">${s.name}${s.secret ? ' <span class="tag">Bí tịch</span>' : ''}</div><div class="s">${s.desc} · ${s.mp} nội lực${ok ? '' : ` · mở ở cấp ${s.lv}`}</div></div></div>`; }).join('')}</div>
        <div class="sec">Tuỳ chọn</div>
        <button class="li" id="t-peace"><span class="ico">🕊️</span><div class="grow"><div class="t">Tránh quái: ${c.peace ? 'đang bật' : 'đang tắt'}</div><div class="s">Bật để đi lại không gặp quái ngẫu nhiên.</div></div></button>
        <button class="li" id="t-logout" style="margin-top:6px"><span class="ico">🚪</span><div class="grow"><div class="t">Đăng xuất</div></div></button>`;
      body.querySelectorAll('.pm').forEach((b) => (b.onclick = () => {
        const k = b.dataset.k, v = +b.dataset.v;
        const used = Object.values(pending).reduce((a, x) => a + x, 0);
        if (v > 0 && used >= c.points) return;
        pending[k] = Math.max(0, pending[k] + v);
        UI.refreshSheet();
      }));
      $('#al-ok').onclick = async () => { const r = await G.call('stat:alloc', { ...pending }); if (r.ok) Object.keys(pending).forEach((k) => (pending[k] = 0)); UI.refreshSheet(); };
      $('#al-reset').onclick = async () => { if (await UI.confirm('<p>Tẩy toàn bộ điểm tiềm năng về ban đầu với giá <b>20 vàng</b>?</p>')) { await G.call('stat:reset'); UI.refreshSheet(); } };
      $('#t-peace').onclick = async () => { await G.call('char:peace'); UI.refreshSheet(); };
      $('#t-logout').onclick = async () => { if (await UI.confirm('<p>Đăng xuất khỏi thiết bị này?</p>', 'Đăng xuất')) { localStorage.removeItem('tdk_token'); location.reload(); } };
    } else if (tab === 'equip') {
      const S = M().SLOTS;
      body.innerHTML = `<div class="eq-grid">${Object.keys(S).map((k) => { const it = c.equip[k]; return `<button class="slot ${it ? '' : 'empty'}" data-s="${k}" style="--q:${it ? qColor(it.q) : '#6d5a43'}">
          <span class="e">${S[k].icon}</span>${it && it.plus ? `<span class="p">+${it.plus}</span>` : ''}<span class="lbl">${S[k].name}</span></button>`; }).join('')}</div>
        <div id="eq-detail" style="margin-top:12px"></div>`;
      body.querySelectorAll('.slot').forEach((b) => (b.onclick = () => { selSlot = b.dataset.s; showEquipDetail(c.equip[selSlot], 'equipped'); }));
      if (selSlot && c.equip[selSlot]) showEquipDetail(c.equip[selSlot], 'equipped');
      else $('#eq-detail').innerHTML = '<p class="muted">Chạm vào ô để xem trang bị. Trang bị mới nằm trong Hành trang.</p>';
    } else {
      body.innerHTML = `
        <div class="sec">Phu thê</div>
        ${c.spouse ? `<div class="li"><span class="ico">💞</span><div class="grow"><div class="t">${esc(c.spouse.name)}</div><div class="s">+5% khí huyết & công, +5% tu vi khi đánh quái.</div></div><button class="btn-seal ghost sm" id="divorce">Ly hôn</button></div>`
          : '<p class="muted">Chưa kết hôn. Vào Giao lưu → Bằng hữu để cầu hôn (cả hai từ cấp 10, sính lễ 520 bạc).</p>'}
        <div class="sec">Sư phụ</div>
        ${c.master ? `<div class="li"><span class="ico">📿</span><div class="grow"><div class="t">${esc(c.master.name)}</div><div class="s">Đạt cấp 35 để xuất sư nhận thưởng.</div></div><button class="btn-seal sm" id="grad">${c.lvl >= 35 ? 'Xuất sư' : 'Rời sư môn'}</button></div>`
          : '<p class="muted">Chưa bái sư. Sư phụ cần cấp 20 và hơn bạn 10 cấp.</p>'}
        <div class="sec">Đệ tử</div>
        ${(c.disciples || []).length ? c.disciples.map((d2) => `<div class="li"><span class="ico">🧒</span><div class="t">${esc(d2.name)}</div></div>`).join('') : '<p class="muted">Chưa có đệ tử. Mỗi lần đệ tử lên cấp, sư phụ nhận bạc.</p>'}`;
      $('#divorce') && ($('#divorce').onclick = async () => { if (await UI.confirm('<p>Đơn phương ly hôn?</p>', 'Ly hôn')) { await G.call('social:divorce'); UI.refreshSheet(); } });
      $('#grad') && ($('#grad').onclick = async () => { await G.call('social:graduate'); UI.refreshSheet(); });
    }
  }

  function equipDetailHTML(it, where) {
    const Q = M().QUALITIES[it.q];
    const sockets = Q.sockets;
    return `<div class="detail"><h4 style="color:${PAPER_Q[it.q]}">${M().SLOTS[it.slot].icon} ${esc(it.name)}${it.plus ? ' +' + it.plus : ''}</h4>
      <div class="muted">${Q.name} · ${M().SLOTS[it.slot].name} · Cần cấp ${it.lvl}${it.unique ? ' · Độc Bản' : ''}</div>
      <div class="stats">${statLine(it.total)}</div>
      ${sockets ? `<div class="muted">Lỗ khảm (${it.gems.length}/${sockets})</div><div class="gems">${Array.from({ length: sockets }, (_, i) => `<i>${it.gems[i] ? M().ITEMS[it.gems[i]].icon : ''}</i>`).join('')}</div>` : ''}
      <div class="btns">
        ${where === 'bag' ? `<button class="btn-seal sm" data-a="equip">Trang bị</button>` : `<button class="btn-seal ghost sm" data-a="unequip">Tháo ra</button>`}
        <button class="btn-seal jade sm" data-a="enhance">Cường hóa +${it.plus + 1}</button>
        ${sockets && it.gems.length < sockets ? `<button class="btn-seal jade sm" data-a="socket">Khảm ngọc</button>` : ''}
        ${where === 'bag' && !it.unique ? `<button class="btn-seal ghost sm" data-a="sell">Bán ${fmt(it.price)} bạc</button>` : ''}
      </div></div>`;
  }
  function bindEquip(box, it, where) {
    box.querySelectorAll('[data-a]').forEach((b) => (b.onclick = async () => {
      const a = b.dataset.a;
      if (a === 'equip') { await G.call('item:equip', { uid: it.uid }); selBag = null; }
      if (a === 'unequip') { await G.call('item:unequip', { slot: it.slot }); }
      if (a === 'sell') { if (await UI.confirm(`<p>Bán <b>${esc(it.name)}</b> lấy ${fmt(it.price)} bạc?</p>`, 'Bán')) { await G.call('item:sell', { uid: it.uid }); selBag = null; } }
      if (a === 'enhance') {
        const rate = Math.round(M().ENHANCE_RATE[it.plus] * 100);
        const cost = (it.plus + 1) * (it.lvl * 8 + 30);
        if (it.plus >= 10) return UI.toast('Đã tối đa +10.');
        const ok = await UI.confirm(`<p>Cường hóa <b>${esc(it.name)}</b> lên +${it.plus + 1}</p><p class="muted">Tỷ lệ thành công ${rate}% · Tốn 1 Đá Cường Hóa (còn ${G.count('da_ch')}) và ${fmt(cost)} bạc.${it.plus >= 5 ? ' Thất bại sẽ tụt 1 cấp.' : ''}</p>`, 'Cường hóa');
        if (ok) { const r = await G.call('item:enhance', { uid: it.uid }, true); if (r.ok) UI.toast(r.msg, r.success ? 'gold' : 'err'); }
      }
      if (a === 'socket') {
        const gems = G.me.bag.filter((x) => x.t === 'item' && M().ITEMS[x.id].type === 'gem');
        if (!gems.length) return UI.toast('Không có ngọc. Mua ở cửa hàng (vàng) hoặc Đoạt Bảo.');
        const pick = await UI.modal(`<h3 style="font-size:20px">Chọn ngọc để khảm</h3><p class="muted" style="text-align:center">Ngọc đã khảm không tháo ra được.</p>`,
          [...gems.map((g) => ({ id: g.id, label: `${M().ITEMS[g.id].name} ×${g.qty}`, cls: 'jade' })), { id: 'no', label: 'Thôi', cls: 'ghost' }]);
        if (pick !== 'no') await G.call('item:socket', { uid: it.uid, gem: pick });
      }
      UI.refreshSheet();
    }));
  }
  function showEquipDetail(it, where) {
    const box = $('#eq-detail');
    if (!it) { box.innerHTML = '<p class="muted">Ô trống.</p>'; return; }
    box.innerHTML = equipDetailHTML(it, where);
    bindEquip(box, it, where);
  }

  // la bàn chỉ số (kiểu game gốc)
  function radar(c, add) {
    const k = ['the', 'luc', 'phap', 'nhanh'], v = k.map((x) => c.stats[x] + (add[x] || 0)), mx = Math.max(...v, 1), mn = Math.min(...v);
    const ang = [-90, 0, 90, 180].map((a) => (a * Math.PI) / 180), R = 50, O = 66, OX = 92;
    const pt = (i, r) => [OX + Math.cos(ang[i]) * r, O + Math.sin(ang[i]) * r];
    const lo = mn * 0.55, f = (x) => 0.3 + 0.7 * ((x - lo) / Math.max(1, mx - lo));
    const poly = v.map((x, i) => pt(i, R * f(x)).join(',')).join(' ');
    const ring = (q) => [0, 1, 2, 3].map((i) => pt(i, R * q).join(',')).join(' ');
    const lab = ['Thể', 'Lực', 'Pháp', 'Nhanh'];
    const kind = ['Khí huyết hình', 'Lực sĩ hình', 'Pháp sư hình', 'Mẫn tiệp hình'][v.indexOf(mx)];
    return `<div class="radar"><svg viewBox="0 0 184 132" width="176" height="126">
      <defs><radialGradient id="rd-g"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset="1" stop-color="#e0902a" stop-opacity=".65"/></radialGradient></defs>
      <polygon points="${ring(1.1)}" fill="none" stroke="#c8962e" stroke-width="1"/><polygon points="${ring(1)}" fill="#1a0e08" stroke="#ffd76a" stroke-width="2"/>
      <polygon points="${ring(0.66)}" fill="none" stroke="#5a4028"/><polygon points="${ring(0.33)}" fill="none" stroke="#5a4028"/>
      <line x1="${OX}" y1="${O - R}" x2="${OX}" y2="${O + R}" stroke="#5a4028"/><line x1="${OX - R}" y1="${O}" x2="${OX + R}" y2="${O}" stroke="#5a4028"/>
      <polygon points="${poly}" fill="url(#rd-g)" stroke="#fff2b0" stroke-width="1.6"/>
      ${v.map((x, i) => { const [px, py] = pt(i, R * f(x)); return `<circle cx="${px}" cy="${py}" r="2.6" fill="#fff6d0" stroke="#a8601a"/>`; }).join('')}
      ${lab.map((l, i) => { const [x, y] = pt(i, R + (i % 2 ? 5 : 9)); return `<text x="${x}" y="${y + 4}" text-anchor="${i === 1 ? 'start' : i === 3 ? 'end' : 'middle'}" font-size="11" font-weight="700" fill="#ffb08a">${l}</text>`; }).join('')}
      </svg><div class="rd-side"><span class="rd-kind">${kind}</span><p>Thể ${v[0]} · Lực ${v[1]}<br>Pháp ${v[2]} · Nhanh ${v[3]}</p></div></div>`;
  }

  // ================= TIÊN SỦNG =================
  function pet() { UI.openSheet('pet', 'Tiên sủng', null, renderPet); }
  function renderPet(body) {
    const c = G.me, E = M().ELEMENTS, Gr = M().GRADES;
    if (!c.pets.length) {
      body.innerHTML = `<p class="muted">Chưa có Tiên sủng nào. Khi gặp quái ngoài dã ngoại, đánh cho thật yếu rồi bấm <b>Bắt</b> và chọn Bầu Bạc hoặc Bầu Vàng.</p>
        <p class="muted">Tam Giới có ${M().SPECIES_COUNT} loài: ${M().FORMS.length} hình thái × 5 ngũ hành × 5 phẩm (Phàm → Thánh), thêm biến thể Biến Dị hiếm.</p>`;
      return;
    }
    if (!c.pets.find((p) => p.uid === selPet)) selPet = c.activePet || c.pets[0].uid;
    const p = c.pets.find((x) => x.uid === selPet);
    const st = p.stats;
    body.innerHTML = `<div class="list">${c.pets.map((x) => `<button class="li ${x.uid === selPet ? 'on' : ''}" data-u="${x.uid}">
        <span class="ico pet-ico ${x.mut ? 'mut' : ''}">${Sprites.petImg(x)}</span>
        <div class="grow"><div class="t">${esc(x.name)} ${x.uid === c.activePet ? '<span class="tag">Xuất chiến</span>' : ''}</div>
        <div class="s"><b style="color:${PAPER_G[x.grade]}">${Gr[x.grade].name}</b> · ${E[x.element].name} · Cấp ${x.lvl}</div></div></button>`).join('')}</div>
      <div class="pet-show">${Sprites.petImg(p, 'big')}</div><div class="sec">${esc(p.name)}</div>
      <div class="muted">Loài: ${esc(p.species)}${p.mut ? ' (Biến Dị, +25% chỉ số)' : ''} · Ngũ hành ${E[p.element].name} khắc ${E[E[p.element].beats].name}</div>
      <div class="muted">Kinh nghiệm ${fmt(p.exp)}/${fmt(p.need)} · tối đa cấp ${c.lvl + 5}</div><div class="pbar"><i style="width:${100 * p.exp / p.need}%"></i></div>
      <div class="stat-grid" style="margin-top:8px">
        <div><span>Khí huyết</span><b>${fmt(st.maxHp)}</b></div><div><span>Tốc độ</span><b>${st.spd}</b></div>
        <div><span>Công vật lý</span><b>${st.atk}</b></div><div><span>Công phép</span><b>${st.matk}</b></div>
        <div><span>Phòng thủ</span><b>${st.def}</b></div><div><span>Kháng phép</span><b>${st.mdef}</b></div></div>
      <div class="muted" style="margin-top:6px">Kỹ năng: ${p.skills.map((k) => M().SKILLS[k].name).join(', ')}</div>
      <div class="btns">
        ${p.uid === c.activePet ? '<button class="btn-seal ghost sm" data-a="rest">Cho nghỉ</button>' : '<button class="btn-seal sm" data-a="active">Xuất chiến</button>'}
        <button class="btn-seal jade sm" data-a="rename">Đổi tên</button>
        <button class="btn-seal ghost sm" data-a="release">Phóng sinh</button></div>
      <div class="btns"><button class="btn-seal" data-a="lab">🔮 Bồi dưỡng: học chiêu · tiến hoá · hợp thể</button></div>`;
    body.querySelectorAll('[data-u]').forEach((b) => (b.onclick = () => { selPet = b.dataset.u; UI.refreshSheet(); }));
    body.querySelectorAll('[data-a]').forEach((b) => (b.onclick = async () => {
      const a = b.dataset.a;
      if (a === 'lab') return Panels2.petLab(p.uid, 'learn');
      if (a === 'active') await G.call('pet:active', { uid: p.uid });
      if (a === 'rest') await G.call('pet:active', { uid: null });
      if (a === 'rename') { const n = await UI.prompt('Đặt tên Tiên sủng', p.name); if (n) await G.call('pet:rename', { uid: p.uid, name: n }); }
      if (a === 'release' && await UI.confirm(`<p>Phóng sinh <b>${esc(p.name)}</b>? Không thể lấy lại.</p>`, 'Phóng sinh')) await G.call('pet:release', { uid: p.uid });
      UI.refreshSheet();
    }));
  }

  // ================= HÀNH TRANG =================
  function bag() { UI.openSheet('bag', 'Hành trang', [['all', 'Tất cả'], ['eq', 'Trang bị'], ['item', 'Vật phẩm']], renderBag); }
  function renderBag(body, tab) {
    const c = G.me, I = M().ITEMS;
    const list = c.bag.filter((b) => tab === 'all' || b.t === tab);
    const sel = c.bag.find((b) => (b.t === 'eq' ? b.uid : b.id) === selBag);
    body.innerHTML = `<div class="row between muted" style="margin-bottom:8px"><span>${c.bag.length}/${M().CONFIG.bagSize} ô</span><span>Bạc ${fmt(c.bac)} · Vàng ${fmt(c.vang)}</span></div>
      <div id="eq-detail" style="margin-bottom:10px"></div>
      <div class="bag-grid">${list.map((b) => b.t === 'eq'
        ? `<button class="slot" data-k="${b.uid}" style="--q:${qColor(b.q)}"><span class="e">${M().SLOTS[b.slot].icon}</span>${b.plus ? `<span class="p">+${b.plus}</span>` : ''}<span class="n">${b.lvl}</span></button>`
        : `<button class="slot" data-k="${b.id}"><span class="e">${icon(b.id)}</span><span class="n">${b.qty}</span></button>`).join('')}</div>
      ${list.length ? '' : '<p class="muted">Trống.</p>'}`;
    body.querySelectorAll('.slot').forEach((s) => (s.onclick = () => { selBag = s.dataset.k; UI.refreshSheet(); }));
    const box = $('#eq-detail');
    if (!sel) { box.innerHTML = '<p class="muted">Chạm vào vật phẩm để xem chi tiết.</p>'; return; }
    if (sel.t === 'eq') {
      const cur = c.equip[sel.slot];
      box.innerHTML = equipDetailHTML(sel, 'bag') + (cur ? `<p class="muted" style="margin:6px 2px">Đang mặc: ${esc(cur.name)}${cur.plus ? ' +' + cur.plus : ''} – ${statLine(cur.total)}</p>` : '');
      bindEquip(box, sel, 'bag');
      return;
    }
    const it = I[sel.id];
    const usable = ['hp', 'mp', 'peach', 'egg'].includes(it.type);
    const sell = it.sell || Math.floor((it.price || 40) / 2);
    box.innerHTML = `<div class="detail"><h4>${it.name} ×${sel.qty}</h4><div class="muted">${it.desc}</div><div class="btns">
      ${usable ? '<button class="btn-seal sm" data-a="use">Dùng</button>' : ''}
      ${it.type === 'gem' ? '<span class="muted">Khảm vào trang bị ở mục Trang bị.</span>' : ''}
      <button class="btn-seal ghost sm" data-a="sell">Bán 1 (${fmt(sell)} bạc)</button></div></div>`;
    box.querySelectorAll('[data-a]').forEach((b) => (b.onclick = async () => {
      if (b.dataset.a === 'use') { const r = await G.call('item:use', { id: sel.id }); if (r.pet) UI.modal(`<h3 class="win">Trứng nở!</h3><p style="text-align:center;font-size:40px;margin:0">${r.pet.icon}</p><p style="text-align:center"><b>${esc(r.pet.name)}</b></p>`); }
      else await G.call('item:sell', { id: sel.id, qty: 1 });
      if (!G.me.bag.find((x) => x.id === sel.id)) selBag = null;
      UI.refreshSheet();
    }));
  }

  // ================= NHIỆM VỤ =================
  function quest() { UI.openSheet('quest', 'Nhiệm vụ', [['main', 'Cốt truyện'], ['secret', 'Nhiệm vụ ẩn'], ['journey', 'Hành trình']], renderQuest); }
  function renderQuest(body, tab) {
    const c = G.me, q = c.quest, QS = M().QUESTS;
    if (tab === 'main') {
      if (q.done) { body.innerHTML = `<p style="text-align:center;font-size:40px;margin:10px 0">🙏</p><p style="text-align:center">Đã vượt đủ 81 kiếp nạn. Chân kinh đã thỉnh về!</p><p class="muted" style="text-align:center">Bạn vẫn có thể tái chiến các boss, săn Tiên sủng, Tam Giới Đấu và Boss thế giới.</p>`; return; }
      const mapName = M().MAPS[q.map].name;
      body.innerHTML = `<div class="detail"><div class="muted">Chương ${M().MAPS[q.map].chapter} · ${mapName} · ${esc(M().MAPS[q.map].sub || '')}</div><h4>${q.no ? `<span style="color:var(--cinnabar)">Nạn thứ ${q.no}:</span> ` : ''}${esc(q.title)}</h4><p style="margin:4px 0">${esc(q.text)}</p>
        ${q.type === 'kill' ? `<div class="muted">Tiến độ ${q.prog}/${q.count}</div><div class="pbar"><i style="width:${100 * q.prog / q.count}%"></i></div>` : ''}
        <div class="muted" style="margin-top:6px">${q.nan ? `Hoàn thành để vượt nạn thứ ${q.no}/81.` : 'Tiền truyện – chưa tính kiếp nạn.'}</div>
        <div class="btns"><button class="btn-seal" id="q-go">${c.map === q.map ? (q.type === 'kill' ? 'Đi săn quái' : 'Tự tìm đường') : 'Truyền tống tới ' + mapName}</button></div></div>
        <div class="sec">Kiếp nạn ${c.nan}/81</div><div class="pbar" style="height:12px"><i style="width:${100 * c.nan / 81}%"></i></div>`;
      $('#q-go').onclick = () => { UI.closeSheet(); G.goQuest(); };
    } else if (tab === 'secret') {
      const S = M().SECRETS;
      body.innerHTML = `<p class="muted">Nhiệm vụ ẩn tự kích hoạt khi bạn đáp ứng điều kiện bí mật: đứng đúng toạ độ vào đúng giờ, mang theo Tiên sủng đặc biệt, hoặc trò chuyện kiên nhẫn với NPC. Hãy nghe ngóng lời đồn từ dân chúng.</p>
        <div class="list">${Object.entries(S).map(([k, s]) => { const done = c.secrets[k]; const hint = c.secretHints[k]; return `<div class="li ${done ? 'on' : ''}"><span class="ico">${done ? '🏆' : hint ? '🔍' : '❔'}</span>
          <div class="grow"><div class="t">${hint || done ? esc(s.name) : '???'}</div><div class="s">${done ? 'Đã hoàn thành · Thưởng: ' + esc(s.reward) : hint ? esc(hint) : 'Chưa nghe được lời đồn nào.'}</div></div></div>`; }).join('')}</div>`;
    } else {
      body.innerHTML = M().MAP_ORDER.map((mid) => {
        const steps = QS.map((x, i) => ({ ...x, i })).filter((x) => x.map === mid);
        return `<div class="sec">Chương ${M().MAPS[mid].chapter}: ${M().MAPS[mid].name}</div><div class="muted" style="margin:-4px 0 6px">${esc(M().MAPS[mid].sub || '')}</div><div class="list">${steps.map((s) => {
          const st = q.done || s.i < q.idx ? 'done' : s.i === q.idx ? 'cur' : 'lock';
          return `<div class="li ${st === 'cur' ? 'on' : ''}" style="${st === 'lock' ? 'opacity:.5' : ''}"><span class="ico">${st === 'done' ? '✅' : st === 'cur' ? '📜' : '🔒'}</span><div class="grow"><div class="t">${s.no ? `${s.no}. ` : ''}${esc(s.title)}</div><div class="s">${st === 'lock' ? 'Chưa mở' : esc(s.text)}</div></div></div>`;
        }).join('')}</div>`;
      }).join('');
    }
  }

  // ================= HOẠT ĐỘNG =================
  function act(tab) { UI.openSheet('act', 'Hoạt động', [['list', 'Hoạt động'], ['travel', 'Truyền tống'], ['rank', 'Xếp hạng']], renderAct, tab); }
  let rankType = 'lvl';
  async function renderAct(body, tab) {
    const c = G.me, CF = M().CONFIG;
    if (tab === 'list') {
      const b = G.boss;
      const alive = b && b.hp > 0;
      body.innerHTML = `
        <div class="detail" style="margin-bottom:10px"><div class="row"><span style="font:34px/1 var(--emoji)">${b ? b.icon : '🐲'}</span><div class="grow"><b>Boss thế giới: ${b ? esc(b.name) : ''}</b>
          <div class="muted">${alive ? `Máu chung ${fmt(b.hp)}/${fmt(b.maxHp)} – mọi người chơi cùng đánh.` : `Hồi sinh lúc ${b ? new Date(b.respawnAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'}`}</div>
          ${b ? `<div class="pbar"><i style="width:${100 * b.hp / b.maxHp}%"></i></div>` : ''}</div></div>
          ${b && b.top.length ? `<div class="muted" style="margin-top:6px">Sát thương cao nhất: ${b.top.map((t, i) => `${i + 1}. ${esc(t.name)} (${fmt(t.dmg)})`).join(' · ')}</div>` : ''}
          <div class="btns"><button class="btn-seal" id="a-boss" ${alive ? '' : 'disabled'}>Thảo phạt (cần cấp 10)</button></div></div>
        <div class="cards2">
          <button class="act-card hot ${c.dailyBadge ? 'dot' : ''}" data-a="daily"><span class="ico">📅</span><b>Điểm danh & Nhiệm vụ ngày</b><small>Quà mỗi ngày, 5 việc nhỏ đổi tu vi, bạc, vàng.</small></button>
          <button class="act-card hot" data-a="tower"><span class="ico">🗼</span><b>Trấn Yêu Tháp</b><small>Leo tầng, boss mỗi 5 tầng. Cao nhất: tầng ${c.towerBest}.</small></button>
          <button class="act-card" data-a="party"><span class="ico">👥</span><b>Tổ đội</b><small>${Panels2.party ? `${Panels2.party.members.length}/3 người` : 'Rủ bạn bè cùng xuất trận.'}</small></button>
          <button class="act-card" data-a="market"><span class="ico">🏪</span><b>Chợ giao dịch</b><small>Mua bán đồ, Tiên sủng với người chơi khác.</small></button>
          <button class="act-card" data-a="craft"><span class="ico">⚗️</span><b>Lò Bát Quái & Lò Rèn</b><small>Luyện đan, linh đan, sách kỹ năng, rèn trang bị.</small></button>
          <button class="act-card" data-a="mounts"><span class="ico">🐎</span><b>Thú cưỡi</b><small>${c.gear && c.gear.mount ? 'Đang cưỡi ' + esc(M().MOUNTS[c.gear.mount].name) : 'Đi nhanh hơn, cộng chỉ số.'}</small></button>
          <button class="act-card ${G.event ? 'hot' : ''}" data-a="event"><span class="ico">${G.event ? G.event.icon : '🎉'}</span><b>${G.event ? esc(G.event.name) : 'Sự kiện'}</b><small>${G.event ? 'Đang diễn ra – nhận quà mỗi ngày!' : 'Tết, Trung Thu… sắp tới.'}</small></button>
          <button class="act-card" data-a="arena"><span class="ico">⚔️</span><b>Tam Giới Đấu</b><small>Đấu bóng người chơi khác. Còn ${CF.dailyArena - c.daily.arena}/${CF.dailyArena} lượt. Điểm: ${c.arena}</small></button>
          <button class="act-card" data-a="peach"><span class="ico">🍑</span><b>Trộm Đào</b><small>Vườn Bàn Đào ở Thiên Cung. Còn ${CF.dailyPeach - c.daily.peach}/${CF.dailyPeach} lượt.</small></button>
          <button class="act-card" data-a="treasure"><span class="ico">🎁</span><b>Đoạt Bảo</b><small>200 bạc mở một rương. Còn ${CF.dailyTreasure - c.daily.treasure}/${CF.dailyTreasure} lượt.</small></button>
          <button class="act-card" data-a="dice"><span class="ico">🎲</span><b>Tài Xỉu</b><small>Cược bạc trong game, ba con xúc xắc.</small></button>
          <button class="act-card" data-a="rps"><span class="ico">✊</span><b>Oẳn Tù Tì</b><small>Thắng nhân đôi tiền cược.</small></button>
          <button class="act-card" data-a="shop"><span class="ico">🛒</span><b>Cửa hàng</b><small>Đan dược, bầu bạc, ngọc, trang bị.</small></button>
        </div>`;
      $('#a-boss').onclick = async () => { const r = await G.call('boss:join', {}); if (r.battle) { UI.closeSheet(); G.startBattle(r.battle); } };
      body.querySelectorAll('[data-a]').forEach((b2) => (b2.onclick = () => ({ daily, tower, arena, peach, treasure, dice, rps, shop, party: Panels2.partyPanel, market: () => Panels2.market(), craft: () => Panels2.craft(), mounts: Panels2.mounts, event: Panels2.event })[b2.dataset.a]()));
    } else if (tab === 'travel') {
      Panels2.renderWorld(body);
    } else if (tab === 'travel-old') {
      body.innerHTML = `<p class="muted">Truyền tống tới các chương đã mở khoá.</p><div class="list">${M().MAP_ORDER.map((id) => { const m = M().MAPS[id]; const ok = m.chapter <= c.unlocked; return `<button class="li ${id === c.map ? 'on' : ''}" data-m="${id}" ${ok ? '' : 'disabled style="opacity:.5"'}>
        <span class="ico">${{ heaven: '☁️', city: '🏯', forest: '⛰️', desert: '🏜️', river: '🌊', cave: '🕳️', snow: '❄️' }[m.theme] || '🗺️'}</span><div class="grow"><div class="t">Chương ${m.chapter}: ${m.name}</div><div class="s">${ok ? `Quái cấp ${m.lv[0]}–${m.lv[1]}` : 'Chưa mở khoá'}${id === c.map ? ' · Bạn đang ở đây' : ''}</div></div></button>`; }).join('')}</div>`;
      body.querySelectorAll('[data-m]').forEach((b2) => (b2.onclick = async () => { if (b2.dataset.m === c.map) return; const r = await G.call('map:travel', { map: b2.dataset.m }); if (r.ok) { UI.closeSheet(); G.onTravel(r); } }));
    } else {
      body.innerHTML = `<div class="seg" style="margin-bottom:8px">${[['lvl', 'Cấp'], ['power', 'Lực chiến'], ['arena', 'Đấu'], ['tower', 'Tháp'], ['nan', 'Nạn']].map(([k, l]) => `<button class="seg-b ${k === rankType ? 'on' : ''}" data-r="${k}">${l}</button>`).join('')}</div><div id="rk" class="muted">Đang tải…</div>`;
      body.querySelectorAll('[data-r]').forEach((b2) => (b2.onclick = () => { rankType = b2.dataset.r; UI.refreshSheet(); }));
      const r = await Net.emit('rank:list', { type: rankType });
      const box = $('#rk'); if (!box || !r.ok) return;
      box.className = 'list';
      box.innerHTML = r.list.map((x, i) => `<div class="li ${x.id === c.id ? 'on' : ''}"><span class="ico" style="font-size:18px;font-weight:700;font-family:var(--font)">${i + 1}</span><img src="${Sprites.faceURL(x.race, 'm')}" style="width:28px" alt=""><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">Cấp ${x.lvl} · Lực chiến ${fmt(x.power)} · ${rankType === 'tower' ? `Tháp tầng ${x.tower}` : `Đấu ${x.arena} · Nạn ${x.nan}/81`}</div></div></div>`).join('');
    }
  }

  function sub(name, title, render) { UI.openSheet(name, title, null, render); }

  // ---------- điểm danh & nhiệm vụ ngày ----------
  function rewardToast(res, extra) {
    if (!res) return;
    const p = [];
    if (res.exp) p.push(`+${fmt(res.exp)} tu vi`);
    if (res.bac) p.push(`+${fmt(res.bac)} bạc`);
    if (res.vang) p.push(`+${res.vang} vàng`);
    for (const [id, n] of Object.entries(res.items || {})) p.push(`+${n} ${M().ITEMS[id].name}`);
    for (const g of res.got || []) p.push(g);
    UI.toast(`🎁 ${extra ? extra + ' · ' : ''}${p.join(' · ')}`, 'gold');
    Sound.sfx('chest');
  }
  function daily(auto) {
    sub('daily', 'Điểm danh & Nhiệm vụ ngày', async (body) => {
      const r = await Net.emit('daily:info'); if (!r.ok) return;
      const d = r.daily, ck = d.checkin;
      const done = ck.n % 7; // số ngày đã nhận trong vòng hiện tại
      body.innerHTML = `
        <div class="sec">Điểm danh 7 ngày <small class="muted">· đã điểm danh ${ck.n} ngày</small></div>
        <div class="ck-grid">${ck.list.map((x) => { const got = x.day <= (ck.doneToday && done === 0 && ck.n > 0 ? 7 : done); const today = ck.canClaim && x.day === ck.nextDay; return `<div class="ck ${got ? 'got' : ''} ${today ? 'today' : ''} ${x.big ? 'big' : ''}"><b>Ngày ${x.day}</b><span>${{ 1: '💰', 2: '🏺', 3: '🪙', 4: '🪨', 5: '🏆', 6: '💎', 7: '🥚' }[x.day]}</span><small>${esc(x.label)}</small>${got ? '<i>✓</i>' : ''}</div>`; }).join('')}</div>
        <div class="btns"><button class="btn-seal" id="d-ck" ${ck.canClaim ? '' : 'disabled'}>${ck.canClaim ? `Điểm danh ngày ${ck.nextDay}` : 'Hôm nay đã điểm danh – mai quay lại nhé'}</button></div>
        <div class="sec" style="margin-top:14px">Nhiệm vụ hôm nay <small class="muted">· làm mới lúc 0 giờ</small></div>
        <div class="list">${d.tasks.map((t) => `<div class="li"><span class="ico">${t.icon}</span><div class="grow"><div class="t">${esc(t.name)} <small class="muted">${t.prog}/${t.need}</small></div><div class="s">${esc(t.desc)} · Thưởng: ${esc(t.reward)}</div><div class="pbar"><i style="width:${100 * t.prog / t.need}%"></i></div></div>
          <button class="btn-seal sm ${t.done && !t.claimed ? '' : 'ghost'}" data-claim="${t.id}" ${t.done && !t.claimed ? '' : 'disabled'}>${t.claimed ? 'Đã nhận' : t.done ? 'Nhận' : 'Chưa xong'}</button></div>`).join('')}</div>
        <div class="detail chest ${d.chest.ready && !d.chest.claimed ? 'ready' : ''}" style="margin-top:10px"><div class="row"><span style="font:34px/1 var(--emoji)">${d.chest.claimed ? '📭' : '🎁'}</span><div class="grow"><b>Rương Năng Động</b><div class="muted">Nhận đủ thưởng 5 nhiệm vụ để mở: ${esc(d.chest.label)}</div></div>
          <button class="btn-seal sm" id="d-chest" ${d.chest.ready && !d.chest.claimed ? '' : 'disabled'}>${d.chest.claimed ? 'Đã mở' : 'Mở rương'}</button></div></div>`;
      $('#d-ck').onclick = async () => { const x = await G.call('daily:checkin', {}, true); if (x.ok) { rewardToast(x.res, `Điểm danh ngày ${x.day}`); UI.refreshSheet(); } else UI.toast(x.msg, 'err'); };
      body.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = async () => { const x = await G.call('daily:claim', { id: b.dataset.claim }, true); if (x.ok) { rewardToast(x.res); UI.refreshSheet(); } else UI.toast(x.msg, 'err'); }));
      $('#d-chest').onclick = async () => { const x = await G.call('daily:chest', {}, true); if (x.ok) { rewardToast(x.res, 'Rương Năng Động'); UI.refreshSheet(); } else UI.toast(x.msg, 'err'); };
      if (auto && ck.canClaim) $('#d-ck').classList.add('pulse');
    });
  }

  // ---------- Trấn Yêu Tháp ----------
  function tower() {
    sub('tower', 'Trấn Yêu Tháp', async (body) => {
      const r = await Net.emit('tower:info'); if (!r.ok) return;
      const t = r.tower, fi = t.info;
      const lvlWarn = fi.lvl > G.me.lvl + 3;
      body.innerHTML = `
        <div class="tower-hero"><div class="tw-art">${[...t.next].reverse().map((x) => `<div class="tw-fl ${x.boss ? 'boss' : ''}"><span>${x.floor}</span>${x.boss ? `<em>${x.bossIcon || '👹'}</em>` : ''}</div>`).join('')}<div class="tw-fl cur ${fi.boss ? 'boss' : ''}"><span>${fi.floor}</span>${fi.boss ? `<em>${fi.bossIcon || '👹'}</em>` : '<em>⚔️</em>'}</div></div>
          <div class="tw-info"><small>Tầng hiện tại</small><b>Tầng ${fi.floor}</b><div>${fi.boss ? `Boss: <b>${esc(fi.bossName)}</b>` : `${fi.count} yêu quái`} · cấp ${fi.lvl}</div>
          <div class="muted" style="margin-top:4px">Thưởng lần đầu: ${esc(fi.rewardLabel)}</div>
          ${lvlWarn ? '<div class="warn">Quái cao hơn bạn khá nhiều cấp – hãy luyện thêm!</div>' : ''}
          <div class="muted">Cao nhất: tầng ${t.best} · Lượt thua còn lại hôm nay: ${t.failsLeft}/5</div></div></div>
        <div class="btns"><button class="btn-seal" id="tw-go" ${t.failsLeft > 0 ? '' : 'disabled'}>Khiêu chiến tầng ${fi.floor}</button></div>
        <p class="muted">Vào tháp được hồi đầy khí huyết. Thắng thì đi tiếp không giới hạn, thua mất 1 lượt. Cứ 5 tầng có một boss trong truyện, 10 tầng thưởng trang bị.</p>
        <div class="sec">Bảng vàng Trấn Yêu Tháp</div>
        <div class="list">${t.top.length ? t.top.map((x, i) => `<div class="li ${x.id === G.me.id ? 'on' : ''}"><span class="ico" style="font-size:18px;font-weight:700;font-family:var(--font)">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><img src="${Sprites.faceURL(x.race, 'm')}" style="width:28px" alt=""><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">Cấp ${x.lvl}</div></div><b>Tầng ${x.best}</b></div>`).join('') : '<p class="muted">Chưa ai leo tháp – hãy là người đầu tiên!</p>'}</div>`;
      $('#tw-go').onclick = async () => { const x = await G.call('tower:fight', {}); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } };
    });
  }

  function arena() {
    sub('arena', 'Tam Giới Đấu', async (body) => {
      body.innerHTML = '<p class="muted">Đang tìm đối thủ…</p>';
      const r = await Net.emit('arena:list');
      if (!r.ok) return;
      body.innerHTML = `<p class="muted">Đấu với bóng (AI) của người chơi khác hoặc tâm ma. Thắng +điểm đấu, +2 vàng. Lượt hôm nay: ${r.left}. Khí huyết được hồi đầy khi vào trận.</p>
        <div class="list">${r.list.map((o) => `<div class="li"><img src="${Sprites.faceURL(o.race, o.gender)}" style="width:36px" alt=""><div class="grow"><div class="t">${esc(o.name)} ${o.bot ? '<span class="tag">Tâm ma</span>' : ''}</div><div class="s">Cấp ${o.lvl} · Lực chiến ${fmt(o.power)} · Điểm ${o.arena}</div></div><button class="btn-seal sm" data-id="${esc(o.id)}" ${r.left > 0 ? '' : 'disabled'}>Khiêu chiến</button></div>`).join('')}</div>`;
      body.querySelectorAll('[data-id]').forEach((b) => (b.onclick = async () => { const x = await G.call('arena:fight', { id: b.dataset.id }); if (x.battle) { UI.closeSheet(); G.startBattle(x.battle); } }));
    });
  }

  function peach() {
    const c = G.me;
    if (c.map !== 'ch1') { UI.toast('Vườn Bàn Đào ở Thiên Cung – hãy truyền tống tới đó.'); return; }
    const picked = new Set();
    sub('peach', 'Trộm Đào', (body) => {
      const left = M().CONFIG.dailyPeach - G.me.daily.peach;
      body.innerHTML = `<p class="muted">Chọn một cây đào. Có thể hái được Bàn Đào ngàn năm… hoặc bị Thiên binh tóm! Còn ${left} lượt hôm nay.</p>
        <div class="peach-grid">${Array.from({ length: 9 }, (_, i) => `<button data-t="${i}" class="${picked.has(i) ? 'done' : ''}" aria-label="Cây đào ${i + 1}">🍑</button>`).join('')}</div><p id="pc-msg" style="text-align:center;min-height:2.6em;margin-top:12px"></p>`;
      body.querySelectorAll('[data-t]').forEach((b) => (b.onclick = async () => {
        if (picked.has(+b.dataset.t)) return;
        const r = await G.call('act:peach', { tree: +b.dataset.t }, true);
        if (!r.ok) return UI.toast(r.msg, 'err');
        picked.add(+b.dataset.t);
        if (r.battle) { UI.closeSheet(); UI.toast(r.msg, 'err'); return G.startBattle(r.battle); }
        Sound.sfx(r.outcome === 'bandao' ? 'gold' : r.outcome === 'dao' ? 'heal' : 'escape');
        UI.refreshSheet(); $('#pc-msg').textContent = r.msg;
      }));
    });
  }

  function treasure() {
    sub('treasure', 'Đoạt Bảo', (body) => {
      body.innerHTML = `<p class="muted">Mỗi lần mở tốn 200 bạc. Có thể ra ngọc, đá cường hóa, bầu vàng, vàng hoặc trang bị quý. Còn ${M().CONFIG.dailyTreasure - G.me.daily.treasure} lượt.</p>
        <div class="chests">${[0, 1, 2].map((i) => `<button data-b="${i}" aria-label="Rương ${i + 1}">🧰</button>`).join('')}</div><p id="tr-msg" style="text-align:center;min-height:2.6em;margin-top:12px;font-weight:600"></p>`;
      body.querySelectorAll('[data-b]').forEach((b) => (b.onclick = async () => {
        const r = await G.call('act:treasure', { box: +b.dataset.b }, true);
        if (!r.ok) return UI.toast(r.msg, 'err');
        Sound.sfx('chest');
        $('#tr-msg').textContent = r.msg; b.textContent = '✨'; setTimeout(() => (b.textContent = '🧰'), 900);
      }));
    });
  }

  const betRow = () => `<div class="bet">${[10, 50, 100, 500, 1000].map((v) => `<button data-bet="${v}" class="${v === bet ? 'on' : ''}">${fmt(v)}</button>`).join('')}</div>`;
  const bindBet = (body) => body.querySelectorAll('[data-bet]').forEach((b) => (b.onclick = () => { bet = +b.dataset.bet; body.querySelectorAll('[data-bet]').forEach((x) => x.classList.toggle('on', +x.dataset.bet === bet)); }));

  function dice() {
    sub('dice', 'Tài Xỉu', (body) => {
      body.innerHTML = `<p class="muted">Tổng 11–17 là Tài, 4–10 là Xỉu. Ba mặt giống nhau thì nhà cái ăn. Chỉ dùng bạc trong game. Bạc: ${fmt(G.me.bac)}</p>
        ${betRow()}<div class="dice" id="dc"><span>?</span><span>?</span><span>?</span></div><p id="dc-msg" style="text-align:center;font-weight:700;min-height:1.5em"></p>
        <div class="btns" style="justify-content:center"><button class="btn-seal" data-p="tai">Tài</button><button class="btn-seal jade" data-p="xiu">Xỉu</button></div>`;
      bindBet(body);
      body.querySelectorAll('[data-p]').forEach((b) => (b.onclick = async () => {
        const dc = $('#dc'); dc.classList.add('roll'); Sound.sfx('dice');
        const r = await G.call('act:dice', { pick: b.dataset.p, bet }, true);
        await sleep(600); dc.classList.remove('roll');
        if (!r.ok) return UI.toast(r.msg, 'err');
        dc.innerHTML = r.dice.map((d) => `<span>${d}</span>`).join('');
        $('#dc-msg').textContent = `${r.sum} – ${r.res === 'bao' ? 'Bão!' : r.res === 'tai' ? 'Tài' : 'Xỉu'} · ${r.won ? 'Thắng +' : 'Thua −'}${fmt(r.bet)} bạc`;
        body.querySelector('.muted').textContent = `Tổng 11–17 là Tài, 4–10 là Xỉu. Ba mặt giống nhau thì nhà cái ăn. Chỉ dùng bạc trong game. Bạc: ${fmt(G.me.bac)}`;
      }));
    });
  }

  function rps() {
    const IC = { keo: '✌️', bua: '✊', bao: '✋' }, NM = { keo: 'Kéo', bua: 'Búa', bao: 'Bao' };
    sub('rps', 'Oẳn Tù Tì', (body) => {
      body.innerHTML = `<p class="muted">Đấu với Hầu Vương. Thắng được gấp đôi tiền cược. Bạc: ${fmt(G.me.bac)}</p>${betRow()}
        <p id="rp-msg" style="text-align:center;font-size:17px;min-height:3em"></p>
        <div class="rps">${Object.keys(IC).map((k) => `<button data-c="${k}" aria-label="${NM[k]}">${IC[k]}</button>`).join('')}</div>`;
      bindBet(body);
      body.querySelectorAll('[data-c]').forEach((b) => (b.onclick = async () => {
        const r = await G.call('act:rps', { choice: b.dataset.c, bet }, true);
        if (!r.ok) return UI.toast(r.msg, 'err');
        Sound.sfx(r.outcome === 'win' ? 'coin' : r.outcome === 'lose' ? 'escape' : 'click');
        $('#rp-msg').innerHTML = `Bạn ${IC[b.dataset.c]} – Hầu Vương ${IC[r.npc]}<br><b>${r.outcome === 'win' ? `Thắng +${fmt(r.bet)} bạc` : r.outcome === 'lose' ? `Thua −${fmt(r.bet)} bạc` : 'Hoà'}</b>`;
      }));
    });
  }

  function shop() {
    sub('shop', 'Cửa hàng', async (body) => {
      const r = await Net.emit('shop:list');
      if (!r.ok) return;
      const I = M().ITEMS;
      body.innerHTML = `<p class="muted">Bạc ${fmt(G.me.bac)} · Vàng ${fmt(G.me.vang)}</p><div class="list">${r.shop.map((s, i) => s.kind === 'item'
        ? `<div class="li"><span class="ico">${icon(s.id)}</span><div class="grow"><div class="t">${I[s.id].name}</div><div class="s">${I[s.id].desc}</div></div><button class="btn-seal sm ${s.cur === 'vang' ? 'jade' : ''}" data-i="${i}">${fmt(s.price)} ${s.cur === 'vang' ? 'vàng' : 'bạc'}</button></div>`
        : `<div class="li"><span class="ico">${M().SLOTS[s.slot].icon}</span><div class="grow"><div class="t" style="color:#2f8a2f">${M().SLOTS[s.slot].name} cấp ${s.lvl}</div><div class="s">Phẩm Lương (1 lỗ khảm), chỉ số ngẫu nhiên.</div></div><button class="btn-seal sm" data-i="${i}">${fmt(s.price)} bạc</button></div>`).join('')}</div>`;
      body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = async () => {
        const s = r.shop[+b.dataset.i];
        let qty = 1;
        if (s.kind === 'item' && !['bau_vang'].includes(s.id) && I[s.id].type !== 'gem') {
          const q = await UI.modal(`<h3 style="font-size:20px">${I[s.id].name}</h3><p class="muted" style="text-align:center">Mua bao nhiêu?</p>`,
            [1, 5, 10].map((n) => ({ id: String(n), label: `×${n} – ${fmt(s.price * n)}`, cls: 'jade' })).concat([{ id: '0', label: 'Thôi', cls: 'ghost' }]));
          qty = +q; if (!qty) return;
        }
        await G.call('shop:buy', { kind: s.kind, id: s.id, slot: s.slot, qty });
        body.querySelector('p.muted').textContent = `Bạc ${fmt(G.me.bac)} · Vàng ${fmt(G.me.vang)}`;
      }));
    });
  }

  // ================= GIAO LƯU =================
  function social(tab) { UI.openSheet('social', 'Giao lưu', [['chat', 'Trò chuyện'], ['guild', 'Môn phái'], ['friend', 'Bằng hữu']], renderSocial, tab); }
  const CHN = { khu: 'Khu', doi: 'Đội', phai: 'Phái', shop: 'Shop', he: 'Hệ thống' };
  // biểu tượng cảm xúc: mã [e0]…[e11] → hình pixel
  const emoHTML = (s) => s.replace(/\[e(\d{1,2})\]/g, (all, n) => (Art.EMOTES[+n] ? `<img class="emo-i" src="${Art.emote(+n).url}" alt="${Art.EMO_UNI[+n]}">` : all));
  const RCOL = { than: '#ffd76a', ma: '#ff8a7a', yeu: '#d0a8ff' };
  function chatLine(m) {
    const t = new Date(m.t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const who = m.fromId ? `<span class="who" style="color:${RCOL[m.race] || '#e8c08a'}">${esc(m.from)}${m.lvl ? `<small>${m.lvl}</small>` : ''}:</span> ` : '';
    const join = m.recruit && G.me && m.recruit !== G.me.id ? ` <button class="chat-join" data-join="${esc(m.recruit)}">Xin vào</button>` : '';
    return `<div class="m ${m.recruit ? 'recruit' : ''}"><span class="time">${t}</span><span class="chn ${m.ch}">[${CHN[m.ch]}]</span>${who}${emoHTML(esc(m.text))}${join}</div>`;
  }
  async function renderSocial(body, tab) {
    const c = G.me;
    if (tab === 'chat') {
      const TABS = { all: 'Tất cả', ...CHN }, all = chatCh === 'all';
      body.innerHTML = `<div class="seg chat-tabs" style="margin-bottom:8px">${Object.entries(TABS).map(([k, l]) => `<button class="seg-b ${k === chatCh ? 'on' : ''}" data-ch="${k}">${l}</button>`).join('')}</div>
        <div class="chat-log" id="chat-log">${G.chat.filter((m) => all || m.ch === chatCh).map(chatLine).join('') || '<div class="m empty" style="opacity:.6">Chưa có tin nhắn.</div>'}</div>
        ${chatCh === 'he' ? '<p class="muted">Kênh hệ thống chỉ để đọc.</p>' : `<form class="chat-in" id="chat-f">${all ? `<select id="chat-to" aria-label="Gửi vào kênh">${['khu', 'doi', 'phai', 'shop'].map((k) => `<option value="${k}" ${k === chatTo ? 'selected' : ''}>${CHN[k]}</option>`).join('')}</select>` : ''}<button type="button" class="chat-emo-b" id="chat-emo-b" aria-label="Biểu tượng cảm xúc">☺</button><input id="chat-t" maxlength="120" placeholder="Nhắn kênh ${all ? 'đã chọn' : CHN[chatCh]}…" autocomplete="off" enterkeyhint="send"><button class="btn-seal">Gửi</button></form>
        <div class="chat-emo" id="chat-emo" hidden>${Art.EMOTES.map((e, i) => `<button type="button" data-emo="${i}"><img src="${Art.emote(i).url}" alt="${Art.EMO_UNI[i]}"></button>`).join('')}</div>
        <div class="chat-tools"><button class="btn-seal sm jade" id="chat-recruit">📣 Tuyển đội phụ bản</button></div>`}`;
      body.querySelectorAll('[data-ch]').forEach((b) => (b.onclick = () => { chatCh = b.dataset.ch; UI.refreshSheet(); }));
      const log = $('#chat-log'); log.scrollTop = log.scrollHeight;
      const f = $('#chat-f');
      body.querySelectorAll('[data-join]').forEach((b) => (b.onclick = () => G.call('party:apply', { id: b.dataset.join })));
      log.addEventListener('click', (e) => { const b = e.target.closest('[data-join]'); if (b && !b.onclick) G.call('party:apply', { id: b.dataset.join }); });
      if ($('#chat-emo-b')) {
        $('#chat-emo-b').onclick = () => ($('#chat-emo').hidden = !$('#chat-emo').hidden);
        body.querySelectorAll('[data-emo]').forEach((b) => (b.onclick = () => { const t = $('#chat-t'); if (t.value.length < 115) t.value += `[e${b.dataset.emo}]`; $('#chat-emo').hidden = true; t.focus(); }));
        $('#chat-recruit').onclick = () => G.call('party:recruit');
      }
      if (f) f.onsubmit = async (e) => { e.preventDefault(); const t = $('#chat-t'); if (!t.value.trim()) return; const to = $('#chat-to'); if (to) chatTo = to.value; const r = await Net.emit('chat:send', { ch: to ? to.value : chatCh, text: t.value }); if (!r.ok) UI.toast(r.msg, 'err'); else t.value = ''; };
    } else if (tab === 'guild') {
      body.innerHTML = '<p class="muted">Đang tải…</p>';
      if (c.guild) {
        const r = await Net.emit('guild:info'); if (!r.ok) return;
        const g = r.guild;
        const lr = await Net.emit('guild:list');
        body.innerHTML = `<div class="detail"><h4>${esc(g.name)}</h4><div class="muted">Chưởng môn ${esc(g.leader)} · ${g.count} đệ tử · Chiến công ${fmt(g.points)} · Lực chiến ${fmt(g.power)}</div><p style="margin:6px 0;font-style:italic">“${esc(g.notice)}”</p>
          <div class="btns">${g.isLeader ? '<button class="btn-seal jade sm" id="g-notice">Sửa thông báo</button>' : ''}<button class="btn-seal ghost sm" id="g-leave">Rời phái</button></div></div>
          <div class="sec">Giáo Phái Chiến</div><p class="muted">Chưởng môn tuyên chiến một phái khác mỗi ngày; kết quả dựa trên tổng lực chiến (có yếu tố may rủi). Chiến công cũng tăng khi thành viên đánh boss, Tam Giới Đấu và Boss thế giới.</p>
          <div class="list">${lr.list.map((x, i) => `<div class="li ${x.id === g.id ? 'on' : ''}"><span class="ico" style="font-family:var(--font);font-size:18px;font-weight:700">${i + 1}</span><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${x.count} người · Chiến công ${fmt(x.points)} · Lực chiến ${fmt(x.power)}</div></div>${g.isLeader && x.id !== g.id ? `<button class="btn-seal sm" data-war="${x.id}">Tuyên chiến</button>` : ''}</div>`).join('')}</div>
          <div class="sec">Thành viên</div><div class="list">${g.members.map((m) => `<div class="li"><span class="ico">${m.online ? '🟢' : '⚪'}</span><div class="grow"><div class="t">${esc(m.name)} ${m.leader ? '<span class="tag">Chưởng môn</span>' : ''}</div><div class="s">${M().RACES[m.race].name} · Cấp ${m.lvl} · Cống hiến ${m.contrib}</div></div></div>`).join('')}</div>`;
        $('#g-leave').onclick = async () => { if (await UI.confirm('<p>Rời khỏi môn phái?</p>', 'Rời phái')) { await G.call('guild:leave'); UI.refreshSheet(); } };
        $('#g-notice') && ($('#g-notice').onclick = async () => { const t = await UI.prompt('Thông báo phái', g.notice); if (t != null) { await G.call('guild:notice', { text: t }); UI.refreshSheet(); } });
        body.querySelectorAll('[data-war]').forEach((b) => (b.onclick = async () => { const x = await G.call('guild:war', { id: b.dataset.war }, true); if (x.ok) UI.toast(x.msg, x.win ? 'gold' : 'err'); else UI.toast(x.msg, 'err'); UI.refreshSheet(); }));
      } else {
        const r = await Net.emit('guild:list'); if (!r.ok) return;
        body.innerHTML = `<div class="detail"><b>Khai sơn lập phái</b><div class="muted">Cần cấp 5 và 1.000 bạc.</div><div class="btns"><button class="btn-seal" id="g-create">Lập môn phái</button></div></div>
          <div class="sec">Các môn phái</div><div class="list">${r.list.map((x) => `<div class="li"><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">Chưởng môn ${esc(x.leader)} · ${x.count}/30 · Chiến công ${fmt(x.points)}</div></div><button class="btn-seal sm" data-j="${x.id}">Gia nhập</button></div>`).join('') || '<p class="muted">Chưa có môn phái nào – hãy là người đầu tiên.</p>'}</div>`;
        $('#g-create').onclick = async () => { const n = await UI.prompt('Tên môn phái', '', '2–12 ký tự'); if (n) { await G.call('guild:create', { name: n }); UI.refreshSheet(); } };
        body.querySelectorAll('[data-j]').forEach((b) => (b.onclick = async () => { await G.call('guild:join', { id: b.dataset.j }); UI.refreshSheet(); }));
      }
    } else {
      body.innerHTML = '<p class="muted">Đang tải…</p>';
      const r = await Net.emit('players:online'); if (!r.ok) return;
      const reqs = G.pending;
      body.innerHTML = `${reqs.length ? `<div class="sec">Lời mời đang chờ</div><div class="list">${reqs.map((q, i) => `<div class="li on"><span class="ico">${q.type === 'marry' ? '💍' : q.type === 'party' ? '👥' : '📿'}</span><div class="grow"><div class="t">${esc(q.fromName)}</div><div class="s">${q.type === 'marry' ? 'muốn kết làm phu thê' : q.type === 'party' ? 'mời bạn vào tổ đội' : 'muốn bái bạn làm sư phụ'}</div></div><button class="btn-seal sm" data-ok="${i}">Đồng ý</button><button class="btn-seal ghost sm" data-no="${i}">Từ chối</button></div>`).join('')}</div>` : ''}
        <div class="sec">Đang trực tuyến (${r.list.length})</div>
        <div class="list">${r.list.map((p) => `<div class="li"><img src="${Sprites.faceURL(p.race, p.gender)}" style="width:34px" alt=""><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">Cấp ${p.lvl} · ${esc(p.map)}${p.guild ? ' · ' + esc(p.guild) : ''}</div></div>
          <button class="btn-seal sm" data-marry="${esc(p.name)}" title="Cầu hôn">💍</button><button class="btn-seal jade sm" data-master="${esc(p.name)}" title="Bái sư">📿</button></div>`).join('') || '<p class="muted">Chưa có ai khác đang chơi. Rủ bạn bè cùng mạng Wi-Fi vào nhé!</p>'}</div>`;
      body.querySelectorAll('[data-marry]').forEach((b) => (b.onclick = async () => { if (await UI.confirm(`<p>Cầu hôn <b>${esc(b.dataset.marry)}</b>? Sính lễ 520 bạc (trừ khi đối phương đồng ý).</p>`, 'Cầu hôn')) await G.call('social:marry', { name: b.dataset.marry }); }));
      body.querySelectorAll('[data-master]').forEach((b) => (b.onclick = async () => { if (await UI.confirm(`<p>Bái <b>${esc(b.dataset.master)}</b> làm sư phụ?</p>`, 'Bái sư')) await G.call('social:apprentice', { name: b.dataset.master }); }));
      const respond = async (i, accept) => { const q = reqs[i]; await G.call('social:respond', { type: q.type, fromId: q.fromId, accept }); G.pending.splice(i, 1); G.updateBadges(); UI.refreshSheet(); };
      body.querySelectorAll('[data-ok]').forEach((b) => (b.onclick = () => respond(+b.dataset.ok, true)));
      body.querySelectorAll('[data-no]').forEach((b) => (b.onclick = () => respond(+b.dataset.no, false)));
    }
  }

  return { radar, char, pet, bag, quest, act, social, shop, peach, dice, rps, daily, tower, chatLine, PAPER_Q, PAPER_G };
})();
