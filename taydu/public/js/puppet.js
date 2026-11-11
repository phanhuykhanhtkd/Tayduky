// =====================================================================
//  PUPPET – "Live2D rút gọn" cho tranh vẽ tay
//  Mỗi tranh được cắt thành các dải ngang rồi uốn mềm:
//   · thở (ngực phồng nhẹ), tóc + vạt áo lay theo gió
//   · quán tính: đi thì nghiêng người, tóc áo kéo về sau, dừng lại còn đung đưa
//   · co giãn (squash & stretch) khi bước, lấy đà, lao tới, trúng đòn
//   · quay người mềm (bóp ngang rồi lật) thay vì lật hình tức thì
//   · mỗi loại có dáng riêng: người, thú, loài bay, hồn ma, rắn, boss khổng lồ
//  Dùng chung cho bản đồ (vẽ thẳng lên canvas) và trận đấu (canvas phủ lên ảnh).
// =====================================================================
const Puppet = (() => {
  const low = () => typeof FX !== 'undefined' && FX.low;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function spring(s, target, dt, k, d) { const a = -k * (s.x - target) - d * s.v; s.v += a * dt; s.x += s.v * dt; return s.x; }

  // ---------- loại dáng ----------
  const FLY = new Set(['tienhac', 'khongtuoc', 'phuong', 'kimbang', 'doiyeu', 'hac', 'aodieu', 'aodieu_m', 'cuudau_2']);
  const FLOAT = new Set(['quyhoa', 'thanhlong', 'thuyquai', 'bachcot', 'bachcot_pet', 'linhcam']);
  const SNAKE = new Set(['xatinh', 'manxa', 'hongman']);
  const BEAST = new Set(['thongoc', 'kylan', 'longma', 'hoyeu', 'langyeu', 'holy', 'thutinh', 'hachung', 'truyeu', 'thiemthu', 'huyenquy', 'hautinh', 'suvuong', 'viemthu', 'hatinh', 'nhentinh', 'nhentinh_pet', 'nguuma_pet', 'battuong',
    'bachma', 'hoho', 'kylan_m', 'longquy', 'tuyetlang', 'thanhmaosu', 'thanhnguu', 'kimmaohong', 'bachtuong_m', 'bachloc', 'cuulinh_m', 'nguuma_2', 'giavuong_2', 'thanhngu', 'chuottinh_2', 'ngoctho_2']);
  const GIANT = new Set(['culinh', 'nguuma', 'nguuma_2', 'bachtuong', 'cuulinh', 'hondonthu', 'laongoan', 'world', 'manxa', 'khaiminh', 'mato', 'giaoma', 'banglang', 'nata_2']);
  function kindOf(id) { if (!id) return 'hum'; const b = String(id).replace(/_(kim|moc|thuy|hoa|tho)$/, ''); return FLY.has(b) ? 'fly' : FLOAT.has(b) ? 'float' : SNAKE.has(b) ? 'snake' : BEAST.has(b) ? 'beast' : 'hum'; }
  const TUNE = {
    hum: { br: 0.018, sw: 1, hem: 1, amb: 1, lean: 1, step: 1, bob: 0 },
    beast: { br: 0.022, sw: 0.5, hem: 0.3, amb: 0.4, lean: 0.6, step: 1.5, bob: 0 },
    fly: { br: 0.012, sw: 0.6, hem: 0.2, amb: 0.5, lean: 0.8, step: 0, bob: 1, flap: 1 },
    float: { br: 0.014, sw: 0.8, hem: 1.2, amb: 1.6, lean: 0.7, step: 0, bob: 0.7 },
    snake: { br: 0.01, sw: 0.4, hem: 0, amb: 0, lean: 0.5, step: 0, bob: 0, wave: 1 },
  };

  // ---------- trạng thái từng nhân vật ----------
  const S = new Map();
  function st(key) {
    let s = S.get(key);
    if (!s) { s = { sw: { x: 0, v: 0 }, hem: { x: 0, v: 0 }, lean: { x: 0, v: 0 }, sq: { x: 1, v: 0 }, oy: { x: 0, v: 0 }, px: null, py: null, t: 0, dist: 0, face: 1, turn: 0, pose: null, poseT: 0, poseDur: 0, poseDir: 1, ph: Math.random() * 6, fid: 0, nextFid: 0 }; S.set(key, s); }
    s.seen = performance.now();
    return s;
  }
  // dọn trạng thái lâu không dùng
  setInterval(() => { const now = performance.now(); for (const [k, s] of S) if (now - s.seen > 20000) S.delete(k); }, 10000);

  let freezeUntil = 0;
  // ngừng hình khoảnh khắc chạm đòn (cả trận)
  function freeze(ms = 80) { freezeUntil = Math.max(freezeUntil, performance.now() + ms); }
  // đặt tư thế tạm thời: wind (lấy đà), dash (lao), strike (chạm), hurt (trúng đòn), cast (niệm chú), pounce (vồ)
  function pose(key, name, dir = 1, dur) {
    const s = st(key);
    s.pose = name; s.poseT = 0; s.poseDir = dir; s.poseDur = dur || { wind: 0.22, dash: 0.18, strike: 0.26, hurt: 0.42, cast: 0.6, pounce: 0.24, land: 0.3 }[name] || 0.3;
  }

  // tính các thông số uốn cho khung hình này
  function solve(s, x, y, now, unit, kind, opts) {
    const fr = now < freezeUntil;
    let dt = s.t ? Math.min(0.05, (now - s.t) / 1000) : 0.016; s.t = now;
    if (fr) dt = 0;
    const K = TUNE[kind] || TUNE.hum, giant = opts.giant ? 1 : 0;
    let vx = 0;
    if (s.px != null && dt > 0) { vx = (x - s.px) / dt / unit; s.dist += Math.hypot(x - s.px, y - s.py) / unit; }
    if (dt > 0) { s.px = x; s.py = y; }
    if (opts.vx != null) vx = opts.vx;
    const moving = opts.moving != null ? opts.moving : Math.abs(vx) > 0.4;
    // quay người: đổi hướng thì bóp ngang 0,16 giây rồi lật
    const face = opts.face || 1;
    if (face !== s.face) { s.face = face; s.turn = 1; }
    if (s.turn > 0) s.turn = Math.max(0, s.turn - dt / 0.16);
    // tư thế tạm
    if (s.pose) { s.poseT += dt; if (s.poseT >= s.poseDur) s.pose = null; }
    const pk = s.pose ? s.poseT / s.poseDur : 0, pd = s.poseDir;
    const t = now / 1000 + s.ph, slow = giant ? 0.7 : 1;
    let leanT = clamp(vx * 0.018, -0.1, 0.1) * K.lean, sqT = 1, oyT = 0;
    // bước đi: nhún theo nhịp chân
    const stepPh = s.dist / (kind === 'beast' ? 0.42 : 0.55) * Math.PI;
    let bob = 0;
    if (moving && K.step) { bob = Math.abs(Math.sin(stepPh)) * 0.05 * K.step; sqT = 1 - 0.035 * Math.cos(stepPh * 2) * K.step; }
    if (K.bob) bob += (0.04 + 0.03 * Math.sin(t * 1.7 * slow)) * K.bob;
    // nghỉ ngơi: thỉnh thoảng chuyển trọng tâm cho đỡ đứng im
    if (!moving && !s.pose && opts.idle !== false && now > s.nextFid) { s.nextFid = now + 5000 + Math.random() * 7000; s.sw.v += (Math.random() - 0.5) * 0.9; s.lean.v += (Math.random() - 0.5) * 0.35; }
    switch (s.pose) {
      case 'wind': sqT = 1 - 0.08 * Math.sin(Math.min(1, pk * 1.4) * Math.PI / 2); leanT = -0.09 * pd; break;
      case 'dash': sqT = 0.9; leanT = 0.15 * pd; break;
      case 'pounce': sqT = 0.88; leanT = 0.12 * pd; oyT = Math.sin(pk * Math.PI) * 0.35; break;
      case 'strike': sqT = 1 + 0.07 * Math.sin(pk * Math.PI); leanT = 0.07 * pd; break;
      case 'hurt': sqT = 1 - 0.1 * Math.sin(Math.min(1, pk * 2) * Math.PI); leanT = -0.13 * pd * (1 - pk); break;
      case 'cast': sqT = 1 + 0.05 * Math.sin(pk * Math.PI); leanT = -0.04 * pd * Math.sin(pk * Math.PI); break;
      case 'land': sqT = 1 - 0.1 * Math.sin(pk * Math.PI); break;
    }
    const swT = clamp(-vx * 0.02, -0.09, 0.09) * K.sw - leanT * 0.45, hemT = clamp(-vx * 0.028, -0.09, 0.09) * K.hem;
    const P = {
      br: (K.br * (giant ? 1.3 : 1)) * Math.sin(t * 2.2 * slow),
      sw: spring(s.sw, swT, dt, 70, 7), hem: spring(s.hem, hemT, dt, 45, 5),
      lean: spring(s.lean, leanT, dt, giant ? 160 : 260, giant ? 16 : 20),
      sq: spring(s.sq, sqT, dt, giant ? 260 : 380, 18), oy: spring(s.oy, oyT, dt, 300, 22),
      amb: (low() ? 0.4 : 1) * K.amb, t, bob, flap: K.flap ? Math.sin(t * 9) : 0, wave: K.wave ? 1 : 0,
      turn: s.turn, kind,
    };
    return P;
  }

  // vẽ tranh đã uốn: (cx, by) = giữa chân; w, h = kích thước vẽ; flip = -1 quay trái
  function render(ctx, img, cx, by, w, h, flip, P) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; if (!iw || !ih) return;
    const N = low() ? 10 : 22, sq = P.sq, sx0 = 1 / Math.sqrt(sq);
    // lật hướng mềm: bóp ngang khi đang quay
    const tf = P.turn > 0 ? Math.max(0.08, Math.abs(1 - 2 * (1 - P.turn))) * (P.turn > 0.5 ? -1 : 1) : 1;
    ctx.save();
    ctx.translate(cx, by - (P.bob + P.oy) * h);
    ctx.scale(flip * tf, 1);
    const Y = (v) => { const hh = 1 - v, wb = Math.exp(-Math.pow((v - 0.52) / 0.2, 2)); return -(hh * h * sq) - wb * P.br * 0.6 * hh * h; };
    for (let i = 0; i < N; i++) {
      const v0 = i / N, v1 = (i + 1) / N, v = (v0 + v1) / 2, hh = 1 - v;
      const wb = Math.exp(-Math.pow((v - 0.52) / 0.2, 2)), wt = sstep(0.6, 0, v), wc = sstep(0.55, 0.85, v) * (1 - sstep(0.93, 1, v));
      let dx = P.lean * hh * hh + P.sw * wt * wt + P.amb * 0.006 * Math.sin(P.t * 2.1 + v * 5) * wt + P.hem * wc + P.amb * 0.009 * Math.sin(P.t * 3.3 - v * 9) * wc;
      if (P.wave) dx += 0.025 * Math.sin(P.t * 3 - v * 7) * hh;
      let xs = sx0 * (1 + wb * P.br);
      if (P.flap) xs *= 1 + 0.07 * P.flap * Math.exp(-Math.pow((v - 0.42) / 0.16, 2));
      const ya = Y(v0), yb = Y(v1), ww = w * xs;
      ctx.drawImage(img, 0, v0 * ih, iw, (v1 - v0) * ih, -ww / 2 + dx * w, ya, ww, yb - ya + 0.6);
    }
    ctx.restore();
  }

  // ---------- bản đồ: vẽ thẳng lên canvas bản đồ ----------
  // key: định danh (vd 'me', 'npc:caothai'); unit: kích thước 1 ô (để đổi px → ô)
  function draw2d(ctx, img, cx, by, w, h, key, o = {}) {
    if (!img || !(img.width || img.naturalWidth)) return;
    const kind = o.kind || kindOf(o.id);
    const P = solve(st(key), cx, by, performance.now(), o.unit || h / 2.3, kind, o);
    render(ctx, img, cx, by, w, h, o.flip || 1, P);
  }

  // ---------- trận đấu: canvas phủ lên <img class="art"> ----------
  const B = new Map(); let raf = 0;
  function attach(el, u) {
    const img = el.querySelector('.spr img.art'); if (!img) return;
    const old = B.get(el); if (old && old.img === img) return;
    if (old) old.cv.remove();
    const cv = document.createElement('canvas'); cv.className = 'pup';
    img.after(cv); img.classList.add('pup-on');
    const id = u.bossId ? (u.art || u.bossId) : u.form || u.hid || '';
    B.set(el, { img, cv, ctx: cv.getContext('2d'), key: 'b:' + (u.id || Math.random()), kind: kindOf(id), giant: GIANT.has(u.bossId) || GIANT.has(u.art), side: u.side });
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function clear() { for (const r of B.values()) r.cv.remove(); B.clear(); }
  function recFor(el) { return el && B.get(el.closest ? el.closest('.unit') || el : el); }
  function bPose(el, name, dir) { const r = recFor(el); if (r) pose(r.key, name, dir); }
  function loop(now) {
    raf = B.size ? requestAnimationFrame(loop) : 0;
    const dpr = Math.min(2, devicePixelRatio || 1);
    for (const [el, r] of B) {
      if (!el.isConnected) { B.delete(el); continue; }
      const cur = el.querySelector('.spr img.art');
      if (cur !== r.img) { r.cv.remove(); if (!cur) { B.delete(el); continue; } r.img = cur; r.cv = document.createElement('canvas'); r.cv.className = 'pup'; cur.after(r.cv); cur.classList.add('pup-on'); r.ctx = r.cv.getContext('2d'); r.cw = 0; }
      const img = r.img; if (!img.complete || !img.naturalWidth) continue;
      const w = img.offsetWidth, h = img.offsetHeight; if (!w || !h) continue;
      const padX = w * 0.18, padY = h * 0.14, CW = w + padX * 2, CH = h + padY;
      if (r.cw !== CW || r.ch !== CH) {
        r.cw = CW; r.ch = CH; r.cv.width = Math.round(CW * dpr); r.cv.height = Math.round(CH * dpr);
        r.cv.style.cssText = `position:absolute;left:${img.offsetLeft - padX}px;top:${img.offsetTop - padY}px;width:${CW}px;height:${CH}px;pointer-events:none;z-index:1`;
      } else if (r.l !== img.offsetLeft || r.tp !== img.offsetTop) { r.cv.style.left = img.offsetLeft - padX + 'px'; r.cv.style.top = img.offsetTop - padY + 'px'; }
      r.l = img.offsetLeft; r.tp = img.offsetTop;
      // vận tốc lấy từ vị trí thật trên màn hình (gồm cả lúc lao tới bằng CSS)
      const R = el.getBoundingClientRect(), mir = r.side === 0 ? -1 : 1;
      const s = st(r.key);
      const P = solve(s, (R.left + R.width / 2) * mir, R.top, now, h / 2.3, r.kind, { giant: r.giant, moving: false });
      const c = r.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, CW, CH);
      render(c, img, CW / 2, CH, w, h, 1, P);
    }
  }
  return { draw2d, attach, clear, pose, bPose, freeze, kindOf, GIANT, st };
})();
