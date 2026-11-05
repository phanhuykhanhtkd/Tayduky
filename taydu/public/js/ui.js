// Tiện ích giao diện: toast, modal, bảng cuộn giấy, hội thoại NPC
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const UI = (() => {
  function toast(msg, type = '') {
    if (!msg) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    if (type === 'err') Sound.sfx('error');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 2900);
  }

  // modal trả về Promise với id nút được bấm
  function modal(html, buttons = [{ id: 'ok', label: 'Đóng' }]) {
    return new Promise((resolve) => {
      const m = $('#modal'), card = $('#modal-card');
      card.innerHTML = html + `<div class="btns" style="justify-content:center">${buttons
        .map((b) => `<button class="btn-seal ${b.cls || ''}" data-id="${b.id}">${esc(b.label)}</button>`).join('')}</div>`;
      m.hidden = false;
      card.querySelectorAll('[data-id]').forEach((b) => (b.onclick = () => { m.hidden = true; resolve(b.dataset.id); }));
    });
  }
  const confirm = (html, yes = 'Đồng ý') => modal(html, [{ id: 'no', label: 'Thôi', cls: 'ghost' }, { id: 'yes', label: yes }]).then((r) => r === 'yes');
  function prompt(title, value = '', ph = '') {
    return new Promise((resolve) => {
      modal(`<h3 style="font-size:20px">${esc(title)}</h3><label><input id="pr-in" value="${esc(value)}" placeholder="${esc(ph)}" maxlength="40"></label>`,
        [{ id: 'no', label: 'Thôi', cls: 'ghost' }, { id: 'yes', label: 'Xác nhận' }]).then((r) => resolve(r === 'yes' ? $('#pr-in')?.value ?? '' : null));
      setTimeout(() => $('#pr-in')?.focus(), 50);
      const v = $('#pr-in'); if (v) v.onkeydown = (e) => { if (e.key === 'Enter') $('#modal-card [data-id="yes"]').click(); };
    });
  }

  // ---------- bảng ----------
  const sheet = { open: false, name: null, tab: null, render: null };
  function openSheet(name, title, tabs, render, tab) {
    if (!sheet.open) Sound.sfx('open');
    sheet.open = true; sheet.name = name; sheet.render = render; sheet.tabs = tabs;
    sheet.tab = tab || (tabs && tabs[0] && tabs[0][0]) || null;
    $('#sheet-title').textContent = title;
    $('#sheet').hidden = false;
    drawTabs();
    refreshSheet();
  }
  function drawTabs() {
    const box = $('#sheet-tabs');
    box.innerHTML = (sheet.tabs || []).map(([k, l]) => `<button data-t="${k}" class="${k === sheet.tab ? 'on' : ''}">${esc(l)}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => (b.onclick = () => { sheet.tab = b.dataset.t; drawTabs(); refreshSheet(true); }));
  }
  function refreshSheet(resetScroll) {
    if (!sheet.open || !sheet.render) return;
    const body = $('#sheet-body');
    const y = body.scrollTop;
    sheet.render(body, sheet.tab);
    body.scrollTop = resetScroll ? 0 : y;
  }
  function closeSheet() { if (sheet.open) Sound.sfx('close'); sheet.open = false; sheet.name = null; $('#sheet').hidden = true; $('#sheet-body').innerHTML = ''; }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });

  // ---------- hội thoại ----------
  let typeTimer = null;
  function dialog(d, onPick) {
    const box = $('#dialog');
    if (box.hidden) Sound.sfx('open');
    box.hidden = false;
    const src = d.npc && (Sprites.npcSrc(d.npc) || Art.npc(d.look || d.npc)?.url);
    if (src) $('#dlg-ico').innerHTML = `<img src="${src}" alt="">`; else $('#dlg-ico').textContent = d.icon || '🧙';
    $('#dlg-name').textContent = d.name;
    const p = $('#dlg-text');
    clearInterval(typeTimer);
    p.textContent = '';
    let i = 0;
    const text = d.text || '';
    typeTimer = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typeTimer); }, 16);
    p.onclick = () => { clearInterval(typeTimer); p.textContent = text; };
    const opts = [...(d.options || []), { id: '__bye', label: 'Tạm biệt' }];
    $('#dlg-opts').innerHTML = opts.map((o) => `<button data-o="${esc(o.id)}">${esc(o.label)}</button>`).join('');
    $$('#dlg-opts button').forEach((b) => (b.onclick = () => { const id = b.dataset.o; if (id === '__bye') return closeDialog(); onPick && onPick(id); }));
  }
  function closeDialog() { clearInterval(typeTimer); $('#dialog').hidden = true; }
  $('#dialog').addEventListener('click', (e) => { if (e.target.id === 'dialog') closeDialog(); });

  return { toast, modal, confirm, prompt, openSheet, refreshSheet, closeSheet, sheet, dialog, closeDialog };
})();
