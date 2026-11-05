// =====================================================================
//  HƯỚNG DẪN TÂN THỦ: ngón tay chỉ chỗ bấm + lời nhắn, từng bước.
//  Tiến độ lưu trên máy chủ (c.tut) → đổi máy vẫn tiếp tục được.
// =====================================================================
const Tut = (() => {
  const STEPS = [
    { id: 'talk', on: 'talk', map: true, text: 'Chạm vào <b>Thái Bạch Kim Tinh</b> (có dấu ❗ trên đầu) để nhận nhiệm vụ đầu tiên.', target: () => npcTarget() },
    { id: 'quest', on: 'quest', map: true, text: 'Đây là <b>nhiệm vụ đang làm</b>. Chạm vào để xem, bấm <b>Đi ngay</b> là nhân vật tự đi tới mục tiêu.', target: () => $('#quest-track') },
    { id: 'fight', on: 'act', text: 'Gặp yêu quái rồi! Chọn <b>Đánh</b> rồi chạm vào một con quái.', battle: true, target: () => $('[data-c="attack"]'),
      idle: 'Đi vào <b>vùng cỏ</b> trên bản đồ để gặp yêu quái và thử chiến đấu.' },
    { id: 'auto', on: 'auto', text: 'Mẹo: bật <b>Tự động</b> để nhân vật tự đánh – rất tiện khi luyện cấp.', battle: true, target: () => $('#b-auto'), alsoOn: 'battleEnd' },
    { id: 'char', on: 'open_char', map: true, text: 'Lên cấp được <b>điểm tiềm năng</b>. Mở <b>Nhân vật</b> để cộng vào Thể, Lực, Pháp, Nhanh.', target: () => $('[data-p="char"]'), skipIf: () => !G.me || !G.me.points },
    { id: 'act', on: 'open_act', map: true, text: 'Mở <b>Hoạt động</b> để <b>điểm danh nhận quà</b> mỗi ngày, làm nhiệm vụ ngày và leo <b>Trấn Yêu Tháp</b>.', target: () => $('[data-p="act"]') },
  ];
  let step = 99, el = null, timer = null;

  function npcTarget() {
    if (!G.me || typeof GameMap === 'undefined') return null;
    const id = GameMap.questNpc; if (!id) return null;
    const n = GameMap.meta.npcs.find((x) => x.id === id); if (!n) return null;
    const p = GameMap.screenOf(n.x, n.y);
    return { getBoundingClientRect: () => ({ left: p.x - 18, right: p.x + 18, top: p.y - 30, bottom: p.y + 18, width: 36, height: 48 }) };
  }

  function build() {
    if (el) return;
    el = document.createElement('div');
    el.id = 'tut';
    el.innerHTML = '<div class="tut-hand">👆</div><div class="tut-bub"><div class="tut-txt"></div><div class="tut-foot"><span class="tut-n"></span><button class="tut-skip">Bỏ qua hướng dẫn</button></div></div>';
    document.body.appendChild(el);
    el.querySelector('.tut-skip').onclick = () => finish(true);
  }

  function start() {
    const s = G.me ? G.me.tut : 0;
    if (s >= 99) return;
    step = s; build(); clearInterval(timer); timer = setInterval(place, 120); place();
  }

  function cur() { return STEPS[step]; }
  function place() {
    if (!el) return;
    let st = cur();
    while (st && st.skipIf && st.skipIf() && !BattleUI.active) { step++; save(); st = cur(); }
    if (!st) return finish();
    const sheetOpen = UI.sheet.open || !$('#modal').hidden || !$('#dialog').hidden;
    const inBattle = BattleUI.active;
    let target = null, text = st.text;
    if (st.battle && !inBattle) { text = st.idle || ''; }
    else if (st.map && inBattle) text = '';
    else target = st.target();
    if (sheetOpen && !(st.battle && inBattle)) text = '';
    if (!$('#modal').hidden) text = '';
    if (!text) { el.hidden = true; return; }
    el.hidden = false;
    el.querySelector('.tut-txt').innerHTML = text;
    el.querySelector('.tut-n').textContent = `Hướng dẫn ${Math.min(step + 1, STEPS.length)}/${STEPS.length}`;
    const hand = el.querySelector('.tut-hand'), bub = el.querySelector('.tut-bub');
    const W = window.innerWidth, H = window.innerHeight;
    const r = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    if (!r || !r.width) { hand.hidden = true; bub.style.left = '50%'; bub.style.top = '42%'; bub.style.transform = 'translate(-50%,-50%)'; bub.dataset.side = ''; return; }
    hand.hidden = false;
    const cx = (r.left + r.right) / 2, below = r.top < H * 0.5;
    hand.style.left = cx - 16 + 'px';
    hand.style.top = (below ? r.bottom + 2 : r.top - 40) + 'px';
    hand.classList.toggle('up', below); hand.classList.toggle('down', !below);
    const bw = Math.min(300, W - 24);
    bub.style.width = bw + 'px';
    bub.style.left = Math.max(12, Math.min(W - bw - 12, cx - bw / 2)) + 'px';
    bub.style.transform = '';
    if (below) { bub.style.top = r.bottom + 44 + 'px'; bub.dataset.side = 'below'; }
    else { bub.style.top = Math.max(12, r.top - 44 - bub.offsetHeight) + 'px'; bub.dataset.side = 'above'; }
  }

  function save(done) { Net.emit('tut:set', { step, done: !!done }).then((r) => { if (r && r.state) G.setState(r.state); }); if (G.me) G.me.tut = step; }
  function event(name) {
    const st = cur(); if (!st || !el) return;
    if (name === st.on || name === st.alsoOn) {
      step++; save();
      if (step >= STEPS.length) return finish();
      Sound.sfx('quest');
      place();
    }
  }
  function finish(skipped) {
    clearInterval(timer); timer = null;
    step = 99; save(!skipped);
    if (el) { el.remove(); el = null; }
    if (!skipped) UI.toast('🎓 Hoàn thành hướng dẫn tân thủ! Quà: 500 bạc + 2 Bầu Bạc', 'gold');
  }
  return { start, event, get step() { return step; } };
})();
