// =====================================================================
//  HIỆU ỨNG CHIẾN ĐẤU – 2 lớp canvas:
//   • lớp dưới (sau nhân vật): pháp trận, vết cháy trên đất, sóng chấn động mặt đất
//   • lớp trên: hạt sáng, tia sét, vệt chém, cầu phép, cột sáng, mưa tuyết…
//  Rung màn hình có tắt dần, khựng hình (hit-stop) khi bạo kích,
//  sprite ánh sáng dựng sẵn để chạy mượt trên iPhone.
// =====================================================================
const FX = (() => {
  let cv = null, g = null, cu = null, gu = null, W = 0, H = 0, dpr = 1, running = false;
  let parts = [], fxs = [], amb = null, ambParts = [];
  let low = false;
  try { low = localStorage.getItem('tdk_lowfx') === '1'; } catch {}
  let shakeAmp = 0, shakeT = 0, freezeUntil = 0, shakeEls = [];

  const COL = {
    thunder: ['#ffffff', '#fff27a', '#7fc8ff'], fire: ['#fff6c0', '#ff9a2a', '#e8301a'], ice: ['#ffffff', '#b8f0ff', '#4aa8e8'],
    poison: ['#f4d8ff', '#b45ae8', '#4ae86a'], heal: ['#f4fff4', '#8cf8a8', '#2ac06a'], gold: ['#fffbe8', '#ffd65a', '#e8a030'],
    wind: ['#ffffff', '#cdf8ea', '#7fd6b7'], rock: ['#f5e1c0', '#b8864a', '#6a4a24'], shadow: ['#f0e0ff', '#9a5ae8', '#3a1068'],
    rage: ['#ffe0c8', '#ff5a2a', '#a80a0a'], slash: ['#ffffff', '#fff0c8', '#ffb070'], hit: ['#ffffff', '#ffe8c0', '#ffa050'],
  };

  // ---------- khởi tạo ----------
  function attach(canvas, under, shake) {
    cv = canvas; g = cv.getContext('2d');
    if (under) { cu = under; gu = cu.getContext('2d'); }
    shakeEls = shake || [];
    resize();
  }
  function resize() {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    for (const c of [cv, cu]) if (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  }
  window.addEventListener('resize', () => setTimeout(resize, 80));
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const n = (k) => Math.max(1, Math.round(low ? k / 3 : k));
  const ease = (k) => 1 - Math.pow(1 - k, 3);

  // ---------- sprite ánh sáng dựng sẵn (rẻ hơn tạo gradient mỗi hạt) ----------
  const glowCache = new Map();
  function glow(color, soft = 0) {
    const key = color + soft;
    let c = glowCache.get(key);
    if (!c) {
      c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, soft ? color : '#ffffff'); gr.addColorStop(soft ? 0.25 : 0.12, color); gr.addColorStop(0.45, color + (soft ? '66' : '88')); gr.addColorStop(1, color + '00');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64); glowCache.set(key, c);
    }
    return c;
  }
  function hex(c) { if (c[0] !== '#') return c; return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(0, 7); }

  // ---------- hạt ----------
  const MAXP = () => (low ? 260 : 900);
  function spark(x, y, o = {}) {
    if (parts.length > MAXP()) return;
    parts.push({ x, y, vx: o.vx ?? rnd(-3, 3), vy: o.vy ?? rnd(-4, 1), g: o.g ?? 0.12, life: o.life ?? rnd(25, 45), t: 0, size: o.size ?? rnd(1.5, 4),
      color: hex(o.color || '#ffffff'), shape: o.shape || 'glow', drag: o.drag ?? 0.97, rot: o.rot ?? rnd(0, 6.28), vr: o.vr ?? rnd(-0.2, 0.2), grow: o.grow ?? 0,
      ramp: o.ramp, layer: o.layer, delay: o.delay || 0, wob: o.wob || 0 });
    start();
  }
  const FIRE_RAMP = ['#ffffff', '#fff2a0', '#ffb030', '#ff5a1a', '#b81a0a', '#3a1a14'];
  function rampColor(r, k) { const i = Math.min(r.length - 1, Math.floor(k * r.length)); return r[i]; }

  // ---------- hiệu ứng có hình ----------
  const add = (f) => { fxs.push({ t: 0, ...f }); start(); return f; };
  function ring(x, y, color, r1 = 60, life = 26, w = 4, layer) { add({ type: 'ring', x, y, color: hex(color), r1, life, w, layer }); }
  function shock(x, y, color, r1 = 90, life = 22) { add({ type: 'shock', x, y, color: hex(color), r1, life, layer: 'under' }); add({ type: 'ring', x, y, color: hex(color), r1: r1 * 1.1, life, w: 6 }); }
  function flashScreen(color, life = 10, alpha = 0.5) { add({ type: 'flash', color, life, alpha }); }
  function decal(x, y, color, r = 46, life = 160) { add({ type: 'decal', x, y, color, r, life, layer: 'under' }); }
  function bolt(x, y, color = '#9fd8ff', fromX) {
    const sx = fromX ?? x + rnd(-50, 50);
    const mk = (x0, y0, x1, y1, depth) => {
      const pts = [[x0, y0]]; let cx = x0, cy = y0; const steps = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 22));
      for (let i = 1; i <= steps; i++) { const k = i / steps; cx = x0 + (x1 - x0) * k + (i < steps ? rnd(-18, 18) : 0); cy = y0 + (y1 - y0) * k + (i < steps ? rnd(-6, 6) : 0); pts.push([cx, cy]); }
      const out = [{ pts, w: depth ? 1.4 : 3.2 }];
      if (depth < 2) for (let i = 2; i < pts.length - 1; i++) if (Math.random() < 0.28) { const [bx, by] = pts[i]; out.push(...mk(bx, by, bx + rnd(-60, 60), by + rnd(20, 70), depth + 1)); }
      return out;
    };
    add({ type: 'bolt', segs: mk(sx, -20, x, y, 0), life: 16, color });
  }
  function slashArc(x, y, color, dir = 1, r = 46, tilt = 0) { add({ type: 'slash', x, y, color: hex(color), dir, r, tilt, life: 13 }); }
  function cross(x, y, color) { add({ type: 'cross', x, y, color: hex(color), life: 22 }); }
  function pillar(x, y, color, w = 46, life = 42) { add({ type: 'pillar', x, y, color: hex(color), w, life }); }
  function rays(x, y, color, life = 46, r = 160) { add({ type: 'rays', x, y, color: hex(color), life, r, rot: rnd(0, 6) }); }
  function circle(x, y, color, r = 58, life = 52) { return add({ type: 'circle', x, y, color: hex(color), r, life, layer: 'under' }); }
  function vortex(x, y, color, life = 40, r = 70) { add({ type: 'vortex', x, y, color: hex(color), life, r }); }
  function spikes(x, y, color, count = 7) { const arr = []; for (let i = 0; i < count; i++) arr.push({ dx: rnd(-46, 46), h: rnd(26, 62), w: rnd(6, 12), d: rnd(0, 6) }); arr.sort((a, b) => a.h - b.h); add({ type: 'spikes', x, y, color: hex(color), arr, life: 46 }); }
  function cracks(x, y, color = '#3a2414') { const arr = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28 + rnd(-0.3, 0.3), L = rnd(30, 70), pts = [[0, 0]]; let px = 0, py = 0; for (let k = 1; k <= 4; k++) { px += Math.cos(a + rnd(-0.4, 0.4)) * L / 4; py += Math.sin(a + rnd(-0.4, 0.4)) * L / 8; pts.push([px, py]); } arr.push(pts); } add({ type: 'cracks', x, y, color, arr, life: 120, layer: 'under' }); }

  // ---------- rung màn hình & khựng hình ----------
  function shake(amp = 8, ms = 320) { if (low) amp *= 0.5; shakeAmp = Math.max(shakeAmp, amp); shakeT = Math.max(shakeT, ms); start(); }
  function hitstop(ms = 90) { freezeUntil = performance.now() + ms; start(); }

  // ---------- phóng chiêu ----------
  function projectile(kind, from, to) {
    return new Promise((res) => {
      const c = COL[kind] || COL.hit;
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      add({ type: 'proj', kind, x: from.x, y: from.y, fx: from.x, fy: from.y, tx: to.x, ty: to.y, life: Math.round(16 + dist / 22), c, done: res, ang: Math.atan2(to.y - from.y, to.x - from.x) });
    });
  }

  // ---------- trận đồ khi niệm chú ----------
  function cast(p, color) {
    circle(p.x, p.y + 44, color, 56, 46);
    for (let i = 0; i < n(18); i++) { const a = rnd(0, 6.28), r = rnd(30, 56); spark(p.x + Math.cos(a) * r, p.y + 44 + Math.sin(a) * r * 0.4, { color, vx: -Math.cos(a) * 0.6, vy: rnd(-2.6, -1.2), g: 0, size: rnd(1.5, 3.2), life: rnd(26, 42), drag: 0.98 }); }
    pillar(p.x, p.y + 44, color, 40, 34);
  }

  // ---------- nổ tại mục tiêu ----------
  function impact(kind, p, crit) {
    const c = COL[kind] || COL.hit;
    const { x, y } = p, gy = y + 42; // gy: mặt đất dưới chân
    switch (kind) {
      case 'thunder':
        bolt(x, y); setTimeout(() => bolt(x + rnd(-10, 10), y), 70); if (!low) setTimeout(() => bolt(x, y, '#c8e8ff'), 150);
        flashScreen('#e8f4ff', 9, 0.55); shake(9, 300);
        for (let i = 0; i < n(30); i++) spark(x, y, { color: c[i % 3], vx: rnd(-6, 6), vy: rnd(-7, 2), shape: 'streak', size: rnd(1.5, 3), life: rnd(12, 24) });
        for (let i = 0; i < n(10); i++) spark(x + rnd(-30, 30), y + rnd(-30, 20), { color: '#bfe6ff', shape: 'arc', vx: 0, vy: 0, g: 0, size: rnd(10, 20), life: rnd(8, 16), delay: Math.floor(rnd(0, 14)) });
        shock(x, gy, '#9fd8ff', 80); decal(x, gy, 'rgba(20,30,60,', 40);
        break;
      case 'fire':
        add({ type: 'boom', x, y, color: '#ff8a2a', r: 46, life: 20 });
        for (let i = 0; i < n(46); i++) { const a = rnd(0, 6.28), s = rnd(1, 5); spark(x + rnd(-8, 8), y + rnd(-6, 8), { ramp: FIRE_RAMP, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: -0.06, size: rnd(5, 11), life: rnd(22, 40), grow: -0.16, drag: 0.93 }); }
        for (let i = 0; i < n(14); i++) spark(x + rnd(-20, 20), y + rnd(-10, 10), { shape: 'smoke', color: '#3a2a24', vx: rnd(-0.8, 0.8), vy: rnd(-1.6, -0.6), g: -0.01, size: rnd(8, 14), grow: 0.25, life: rnd(40, 60), delay: 6 });
        for (let i = 0; i < n(18); i++) spark(x, y, { color: '#ffd05a', vx: rnd(-6, 6), vy: rnd(-8, -2), g: 0.22, size: rnd(1, 2), shape: 'streak', life: rnd(20, 40) });
        shock(x, gy, '#ff7a2a', 84); flashScreen('#ff8a3a', 8, 0.25); decal(x, gy, 'rgba(30,12,6,', 48); shake(7, 260);
        break;
      case 'ice':
        spikes(x, gy, '#bff0ff', low ? 4 : 8);
        for (let i = 0; i < n(26); i++) { const a = (i / 26) * 6.28; spark(x, y, { color: c[i % 3], vx: Math.cos(a) * rnd(2, 6), vy: Math.sin(a) * rnd(2, 6) - 1, g: 0.12, shape: 'shard', size: rnd(4, 9), life: rnd(22, 38) }); }
        for (let i = 0; i < n(16); i++) spark(x + rnd(-40, 40), y + rnd(-50, 10), { color: '#ffffff', shape: 'flake', vx: rnd(-0.6, 0.6), vy: rnd(0.3, 1), g: 0, size: rnd(2, 4), life: rnd(40, 70), vr: rnd(-0.08, 0.08) });
        shock(x, gy, '#bff0ff', 70); flashScreen('#e8fbff', 7, 0.3); decal(x, gy, 'rgba(200,240,255,', 44); shake(5, 220);
        break;
      case 'poison':
        for (let i = 0; i < n(12); i++) spark(x + rnd(-26, 26), y + rnd(-10, 20), { shape: 'cloud', color: i % 2 ? '#7ae84a' : '#9a4ae8', vx: rnd(-0.6, 0.6), vy: rnd(-0.8, -0.2), g: 0, size: rnd(10, 18), grow: 0.3, life: rnd(40, 60) });
        for (let i = 0; i < n(26); i++) spark(x + rnd(-26, 26), y + rnd(-6, 20), { color: c[i % 3], vx: rnd(-0.6, 0.6), vy: rnd(-2.5, -0.6), g: -0.01, shape: 'bubble', size: rnd(3, 7), life: rnd(30, 55) });
        for (let i = 0; i < n(8); i++) spark(x + rnd(-20, 20), y - 10, { color: '#8af05a', shape: 'drop', vx: 0, vy: rnd(1, 2), g: 0.15, size: rnd(2, 3.5), life: rnd(18, 26), delay: Math.floor(rnd(4, 20)) });
        decal(x, gy, 'rgba(60,140,40,', 40, 120);
        break;
      case 'heal':
        pillar(x, gy, '#9fffb8', 52, 46);
        for (let i = 0; i < n(28); i++) spark(x + rnd(-32, 32), y + rnd(0, 40), { color: c[i % 3], vx: rnd(-0.4, 0.4), vy: rnd(-2.6, -1), g: -0.01, shape: i % 3 ? 'glow' : 'plus', size: rnd(2, 5), life: rnd(36, 60) });
        for (let i = 0; i < n(8); i++) spark(x + rnd(-30, 30), y + rnd(10, 40), { color: '#c8ffb0', shape: 'leaf', vx: rnd(-0.6, 0.6), vy: rnd(-1.6, -0.8), g: 0, size: rnd(3, 5), life: rnd(50, 70), vr: rnd(-0.1, 0.1) });
        circle(x, gy, '#7cf09a', 50, 50);
        break;
      case 'gold':
        rays(x, y, '#ffe08a', 40, 140);
        for (let i = 0; i < n(40); i++) { const a = rnd(0, 6.28); spark(x, y, { color: c[i % 3], vx: Math.cos(a) * rnd(1, 7), vy: Math.sin(a) * rnd(1, 7), g: 0.04, shape: i % 3 ? 'glow' : 'star', size: rnd(2, 6), life: rnd(26, 46) }); }
        shock(x, gy, '#ffd65a', 96); ring(x, y, '#fff6c8', 50, 20, 2); flashScreen('#fff2b0', 10, 0.3); shake(5, 220);
        break;
      case 'wind':
        vortex(x, y + 10, '#d8fff0', 38, 64);
        for (let i = 0; i < n(30); i++) { const a = rnd(0, 6.28), rr = rnd(10, 46); spark(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.5, { color: c[i % 3], vx: -Math.sin(a) * 5, vy: Math.cos(a) * 2.5 - 1.2, g: 0, shape: 'streak', size: 1.6, life: rnd(18, 30), drag: 0.93 }); }
        for (let i = 0; i < n(8); i++) spark(x + rnd(-30, 30), y + rnd(0, 30), { color: '#8ac858', shape: 'leaf', vx: rnd(-3, 3), vy: rnd(-4, -1), g: 0.05, size: rnd(3, 4.5), life: rnd(30, 50), vr: rnd(-0.3, 0.3) });
        break;
      case 'rock':
        for (let i = 0; i < n(7); i++) spark(x + rnd(-40, 40), y - rnd(120, 220), { color: c[i % 3], vx: rnd(-0.5, 0.5), vy: rnd(8, 12), g: 0.5, shape: 'rock', size: rnd(6, 12), life: rnd(16, 22), delay: Math.floor(i * 2.5) });
        setTimeout(() => {
          shake(12, 380); cracks(x, gy); shock(x, gy, '#d8b07a', 90);
          for (let i = 0; i < n(26); i++) spark(x + rnd(-20, 20), gy, { color: i % 2 ? '#c8a070' : '#8a6a44', shape: 'rock', vx: rnd(-5, 5), vy: rnd(-6, -1), g: 0.3, size: rnd(2, 5), life: rnd(24, 36) });
          for (let i = 0; i < n(10); i++) spark(x + rnd(-40, 40), gy, { shape: 'smoke', color: '#8a7058', vx: rnd(-1.2, 1.2), vy: rnd(-1, -0.3), g: 0, size: rnd(10, 16), grow: 0.3, life: rnd(40, 60) });
        }, 260);
        break;
      case 'shadow':
        vortex(x, y, '#9a5ae8', 44, 74);
        for (let i = 0; i < n(30); i++) spark(x + rnd(-24, 24), y + rnd(-10, 24), { shape: 'smoke', color: i % 2 ? '#2a0a4a' : '#4a1a7a', vx: rnd(-1.4, 1.4), vy: rnd(-2.2, -0.4), g: -0.02, size: rnd(6, 12), life: rnd(28, 48), grow: 0.1 });
        for (let i = 0; i < n(16); i++) { const a = rnd(0, 6.28); spark(x + Math.cos(a) * 70, y + Math.sin(a) * 40, { color: '#c89aff', vx: -Math.cos(a) * 4, vy: -Math.sin(a) * 2.4, g: 0, shape: 'streak', size: 1.6, life: 16, drag: 1 }); }
        shock(x, gy, '#7a4ac0', 70); flashScreen('#1a0a2a', 10, 0.35);
        break;
      case 'rage':
        pillar(x, y + 42, '#ff4a2a', 54, 40);
        for (let i = 0; i < n(36); i++) spark(x + rnd(-22, 22), y + rnd(0, 40), { ramp: FIRE_RAMP, vx: rnd(-0.8, 0.8), vy: rnd(-4.5, -1.5), g: -0.03, size: rnd(4, 8), life: rnd(25, 40), grow: -0.12 });
        shock(x, y + 42, '#ff4a2a', 60); shake(4, 200);
        break;
      case 'slash':
        slashArc(x, y, '#ffffff', 1, 52, -0.3); slashArc(x, y + 6, '#ffcf8a', -1, 44, 0.4);
        for (let i = 0; i < n(18); i++) spark(x, y, { color: c[i % 3], vx: rnd(-7, 7), vy: rnd(-5, 2), shape: 'streak', size: rnd(1.2, 2.4), life: rnd(10, 20) });
        shake(4, 160);
        break;
      default:
        add({ type: 'star', x, y, color: '#fff2c8', r: 30, life: 9 });
        for (let i = 0; i < n(16); i++) spark(x, y, { color: c[i % 3], vx: rnd(-5, 5), vy: rnd(-5, 1), life: rnd(10, 20), shape: 'streak', size: rnd(1.2, 2.4) });
        ring(x, y, '#ffffff', 38, 12, 3); shake(3, 140);
    }
    if (crit) {
      cross(x, y, '#ffffff'); rays(x, y, '#fff2c8', 22, 120);
      ring(x, y, '#ffd65a', 100, 22, 7); flashScreen('#ffffff', 6, 0.5); shake(13, 380); hitstop(110);
    }
  }

  function aura(p, color) {
    color = hex(color);
    for (let i = 0; i < n(20); i++) spark(p.x + rnd(-28, 28), p.y + rnd(10, 44), { color, vx: rnd(-0.3, 0.3), vy: rnd(-2.8, -1), g: 0, size: rnd(2, 4), life: rnd(30, 50) });
    ring(p.x, p.y + 42, color, 52, 26, 3, 'under');
  }

  // ---------- chết: tan biến thành hạt ----------
  function death(p, color = '#ffd8b0', big) {
    const k = big ? 2.2 : 1;
    for (let i = 0; i < n(36 * k); i++) spark(p.x + rnd(-24, 24) * k, p.y + rnd(-30, 36) * k, { color: i % 3 ? hex(color) : '#ffffff', vx: rnd(-0.8, 0.8), vy: rnd(-2.6, -0.6), g: -0.02, size: rnd(1.5, 3.5), life: rnd(40, 70), shape: i % 4 ? 'glow' : 'square' });
    spark(p.x, p.y, { color: '#e8f4ff', shape: 'soul', vx: 0, vy: -1.3, g: -0.01, size: 9 * k, life: 60, drag: 0.99 });
    if (big) {
      for (let i = 0; i < 5; i++) setTimeout(() => { const q = { x: p.x + rnd(-40, 40), y: p.y + rnd(-50, 30) }; add({ type: 'boom', ...q, color: '#ff8a2a', r: 40, life: 18 }); shake(10, 260); }, i * 140);
      setTimeout(() => { flashScreen('#ffffff', 16, 0.7); shock(p.x, p.y + 60, '#ffd65a', 180, 34); rays(p.x, p.y, '#fff2c8', 70, 260); shake(18, 600); }, 760);
    }
  }

  // ---------- chiến thắng: pháo hoa vàng ----------
  function victory() {
    rays(W / 2, H * 0.38, '#ffe08a', 90, Math.max(W, H));
    for (let i = 0; i < 6; i++) setTimeout(() => {
      const x = W * rnd(0.15, 0.85), y = H * rnd(0.12, 0.45), col = ['#ffd65a', '#ff8a6a', '#9ff0d8', '#ffffff'][i % 4];
      for (let k = 0; k < n(40); k++) { const a = (k / 40) * 6.28; spark(x, y, { color: col, vx: Math.cos(a) * rnd(2.5, 4.5), vy: Math.sin(a) * rnd(2.5, 4.5), g: 0.06, drag: 0.95, shape: 'streak', size: 1.8, life: rnd(36, 52) }); }
      ring(x, y, col, 50, 18, 2);
    }, 150 + i * 220);
  }

  // ---------- hạt môi trường theo bối cảnh ----------
  const AMB = {
    heaven: { c: ['#ffffff', '#ffe8f0', '#fff2b0'], shape: 'petal', n: 14, vy: [0.3, 0.8], vx: [-0.5, 0.2] },
    city: { c: ['#ffb060', '#ff8040'], shape: 'glow', n: 10, vy: [-0.6, -0.2], vx: [-0.2, 0.2], size: [1, 2.2], up: true },
    forest: { c: ['#e8a040', '#c8d060', '#8ac858'], shape: 'leaf', n: 12, vy: [0.4, 0.9], vx: [0.1, 0.6] },
    river: { c: ['#ffffff', '#c8f0ff'], shape: 'glow', n: 12, vy: [-0.4, -0.1], vx: [-0.2, 0.2], size: [1, 2], up: true },
    desert: { c: ['#ffd05a', '#ff8a2a', '#ff5a1a'], shape: 'glow', n: 22, vy: [-1.2, -0.4], vx: [-0.3, 0.3], size: [1, 2.6], up: true },
    cave: { c: ['#9ff0d8', '#c8a8ff', '#7ad8ff'], shape: 'glow', n: 14, vy: [-0.3, 0.1], vx: [-0.3, 0.3], size: [1.5, 3] },
    snow: { c: ['#ffffff'], shape: 'flake', n: 34, vy: [0.6, 1.4], vx: [-0.6, 0.1], size: [1.5, 3.2] },
    arena: { c: ['#ffd05a', '#ff8a2a'], shape: 'glow', n: 14, vy: [-1, -0.3], vx: [-0.2, 0.2], size: [1, 2.2], up: true },
    world: { c: ['#c8e8ff', '#9fb8d8'], shape: 'rain', n: 46, vy: [9, 13], vx: [-2.2, -1.6], size: [1, 1.4] },
  };
  function ambient(theme) { amb = AMB[theme] || null; ambParts = []; if (amb) { for (let i = 0; i < n(amb.n); i++) ambParts.push(newAmb(true)); start(); } }
  function newAmb(anywhere) {
    const a = amb, up = a.up;
    return { x: rnd(0, W), y: anywhere ? rnd(0, H) : up ? H + 8 : -8, vx: rnd(...a.vx), vy: rnd(...a.vy), size: rnd(...(a.size || [2.5, 4.5])), color: hex(a.c[Math.floor(Math.random() * a.c.length)]), rot: rnd(0, 6), vr: rnd(-0.05, 0.05), t: rnd(0, 100) };
  }

  // =====================================================================
  //  VẼ
  // =====================================================================
  function drawPart(ctx, p, a) {
    const s = Math.max(0.3, p.size);
    ctx.globalAlpha = a;
    switch (p.shape) {
      case 'streak': { ctx.strokeStyle = p.color; ctx.lineWidth = s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3.2, p.y - p.vy * 3.2); ctx.stroke(); break; }
      case 'shard': ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.beginPath(); ctx.moveTo(s * 1.8, 0); ctx.lineTo(0, s * 0.45); ctx.lineTo(-s * 1.2, 0); ctx.lineTo(0, -s * 0.45); ctx.closePath(); ctx.fill(); ctx.restore(); break;
      case 'bubble': ctx.strokeStyle = p.color; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 6.28); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - s * 0.4, p.y - s * 0.5, 1.5, 1.5); break;
      case 'plus': ctx.fillStyle = p.color; ctx.fillRect(p.x - s, p.y - s * 0.3, s * 2, s * 0.6); ctx.fillRect(p.x - s * 0.3, p.y - s, s * 0.6, s * 2); break;
      case 'square': ctx.fillStyle = p.color; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); break;
      case 'star': ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.35 : s * 1.4, an = (i / 8) * 6.28; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); ctx.restore(); break;
      case 'flake': ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); for (let i = 0; i < 3; i++) { const an = (i / 3) * 3.14; ctx.moveTo(Math.cos(an) * s, Math.sin(an) * s); ctx.lineTo(-Math.cos(an) * s, -Math.sin(an) * s); } ctx.stroke(); ctx.restore(); break;
      case 'leaf': case 'petal': ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.45 + 0.35 * Math.sin(p.t / 7)); ctx.beginPath(); ctx.ellipse(0, 0, s, s * (p.shape === 'leaf' ? 0.5 : 0.7), 0, 0, 6.28); ctx.fill(); ctx.restore(); break;
      case 'rock': ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); ctx.moveTo(-s, -s * 0.6); ctx.lineTo(s * 0.7, -s); ctx.lineTo(s, s * 0.5); ctx.lineTo(-s * 0.5, s); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(s, s * 0.5); ctx.lineTo(-s * 0.5, s); ctx.lineTo(0, 0); ctx.fill(); ctx.restore(); break;
      case 'smoke': case 'cloud': { const im = glow(p.color, 1); ctx.globalAlpha = a * (p.shape === 'cloud' ? 0.5 : 0.65); ctx.drawImage(im, p.x - s * 1.6, p.y - s * 1.6, s * 3.2, s * 3.2); break; }
      case 'drop': ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(p.x, p.y, s * 0.7, s * 1.2, 0, 0, 6.28); ctx.fill(); break;
      case 'arc': { ctx.strokeStyle = p.color; ctx.lineWidth = 1.5; ctx.beginPath(); let x = p.x, y = p.y; ctx.moveTo(x, y); for (let i = 0; i < 4; i++) { x += rnd(-s, s) * 0.6; y += rnd(-s, s) * 0.6; ctx.lineTo(x, y); } ctx.stroke(); break; }
      case 'soul': { const im = glow('#c8e0ff', 1); const w = s * (1 + 0.15 * Math.sin(p.t / 4)); ctx.drawImage(im, p.x - w * 1.5, p.y - w * 2, w * 3, w * 3.6); ctx.drawImage(glow('#ffffff'), p.x - w * 0.6, p.y - w * 0.8, w * 1.2, w * 1.2); break; }
      case 'rain': ctx.strokeStyle = p.color; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 1.6, p.y + p.vy * 1.6); ctx.stroke(); break;
      default: { const im = glow(p.color); ctx.drawImage(im, p.x - s * 2.4, p.y - s * 2.4, s * 4.8, s * 4.8); }
    }
  }
  const SOLID = new Set(['rock', 'smoke', 'drop', 'leaf', 'petal']);

  function drawFx(ctx, f, k) {
    switch (f.type) {
      case 'ring': {
        const e = ease(k);
        ctx.globalAlpha = Math.max(0, 1 - k); ctx.strokeStyle = f.color; ctx.lineWidth = f.w * (1 - k) + 0.6;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r1 * e, f.r1 * e * 0.42, 0, 0, 6.28); ctx.stroke(); break;
      }
      case 'shock': {
        const e = ease(k), r = f.r1 * e, gr = ctx.createRadialGradient(f.x, f.y, r * 0.55, f.x, f.y, r);
        gr.addColorStop(0, f.color + '00'); gr.addColorStop(0.8, f.color + 'aa'); gr.addColorStop(1, f.color + '00');
        ctx.globalAlpha = 1 - k; ctx.fillStyle = gr; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, 0.42); ctx.translate(-f.x, -f.y); ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.28); ctx.fill(); ctx.restore(); break;
      }
      case 'flash': ctx.globalAlpha = f.alpha * (1 - k) * (1 - k); ctx.fillStyle = f.color; ctx.fillRect(0, 0, W, H); break;
      case 'decal': {
        const a = k < 0.1 ? k / 0.1 : 1 - (k - 0.1) / 0.9;
        const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        gr.addColorStop(0, f.color + '0.55)'); gr.addColorStop(0.7, f.color + '0.25)'); gr.addColorStop(1, f.color + '0)');
        ctx.globalAlpha = a; ctx.fillStyle = gr; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, 0.38); ctx.beginPath(); ctx.arc(0, 0, f.r, 0, 6.28); ctx.restore(); ctx.fill(); break;
      }
      case 'bolt': {
        const on = f.t % 4 < 2 || f.t < 3 ? 1 : 0.35;
        for (const s of f.segs) for (const [w, c, o] of [[s.w * 5, f.color, 0.28], [s.w * 2, f.color, 0.7], [s.w * 0.9, '#ffffff', 1]]) {
          ctx.globalAlpha = on * o * (1 - k * 0.8); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath();
          s.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
        }
        break;
      }
      case 'slash': {
        const grow = Math.min(1, k * 2.4), fade = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6;
        const a0 = f.dir > 0 ? -2.5 : -0.65, a1 = a0 + f.dir * grow * 2.3;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.tilt); ctx.scale(1, 0.62);
        ctx.globalAlpha = fade; ctx.fillStyle = f.color;
        ctx.beginPath(); ctx.arc(0, 0, f.r, Math.min(a0, a1), Math.max(a0, a1)); ctx.arc(f.dir > 0 ? -4 : 4, 6, f.r * 0.86, Math.max(a0, a1), Math.min(a0, a1), true); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = fade * 0.5; ctx.drawImage(glow(f.color), -f.r * 1.2, -f.r * 1.2, f.r * 2.4, f.r * 2.4);
        ctx.restore(); break;
      }
      case 'cross': {
        const grow = Math.min(1, k * 3), fade = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5, L = 70 * grow;
        ctx.globalAlpha = fade; ctx.strokeStyle = f.color; ctx.lineCap = 'round';
        for (const [w, o] of [[12, 0.3], [5, 0.8], [2, 1]]) { ctx.globalAlpha = fade * o; ctx.lineWidth = w * (1 - k * 0.5); ctx.beginPath(); ctx.moveTo(f.x - L, f.y - L * 0.7); ctx.lineTo(f.x + L, f.y + L * 0.7); ctx.moveTo(f.x + L, f.y - L * 0.7); ctx.lineTo(f.x - L, f.y + L * 0.7); ctx.stroke(); }
        break;
      }
      case 'star': { const r = f.r * (1 - k * 0.4); ctx.globalAlpha = 1 - k; ctx.fillStyle = f.color; ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.22 : r, an = (i / 8) * 6.28 + 0.3; ctx.lineTo(f.x + Math.cos(an) * rr, f.y + Math.sin(an) * rr); } ctx.fill(); ctx.drawImage(glow(f.color), f.x - r, f.y - r, r * 2, r * 2); break; }
      case 'boom': {
        const e = ease(Math.min(1, k * 1.6)), r = f.r * (0.4 + e * 0.8);
        ctx.globalAlpha = 1 - k * k; ctx.drawImage(glow('#fff2c0'), f.x - r * 0.7, f.y - r * 0.7, r * 1.4, r * 1.4);
        ctx.globalAlpha = (1 - k) * 0.9; ctx.drawImage(glow(f.color), f.x - r * 1.5, f.y - r * 1.5, r * 3, r * 3); break;
      }
      case 'pillar': {
        const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8, w = f.w * (0.6 + 0.4 * Math.sin(k * 3.14));
        const gr = ctx.createLinearGradient(f.x - w / 2, 0, f.x + w / 2, 0);
        gr.addColorStop(0, f.color + '00'); gr.addColorStop(0.35, f.color + '88'); gr.addColorStop(0.5, '#ffffffcc'); gr.addColorStop(0.65, f.color + '88'); gr.addColorStop(1, f.color + '00');
        ctx.globalAlpha = a; ctx.fillStyle = gr; ctx.fillRect(f.x - w / 2, 0, w, f.y);
        ctx.drawImage(glow(f.color), f.x - w * 1.2, f.y - w * 0.5, w * 2.4, w); break;
      }
      case 'rays': {
        const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot + k * 0.4); ctx.globalAlpha = a * 0.55; ctx.fillStyle = f.color;
        for (let i = 0; i < 12; i++) { const an = (i / 12) * 6.28; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an - 0.07) * f.r, Math.sin(an - 0.07) * f.r); ctx.lineTo(Math.cos(an + 0.07) * f.r, Math.sin(an + 0.07) * f.r); ctx.closePath(); ctx.fill(); }
        ctx.restore(); ctx.globalAlpha = a; ctx.drawImage(glow(f.color), f.x - 40, f.y - 40, 80, 80); break;
      }
      case 'circle': { // pháp trận xoay dưới chân
        const a = k < 0.15 ? k / 0.15 : k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1, r = f.r * (0.8 + 0.2 * ease(Math.min(1, k * 3))), rot = f.t * 0.05;
        ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, 0.4); ctx.globalAlpha = a; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 6.28); ctx.stroke();
        ctx.rotate(rot); ctx.beginPath(); for (let i = 0; i <= 6; i++) { const an = (i * 2 / 6) * 6.28; ctx.lineTo(Math.cos(an) * r * 0.82, Math.sin(an) * r * 0.82); } ctx.stroke();
        ctx.beginPath(); for (let i = 0; i <= 6; i++) { const an = ((i * 2 + 1) / 6) * 6.28; ctx.lineTo(Math.cos(an) * r * 0.82, Math.sin(an) * r * 0.82); } ctx.stroke();
        ctx.rotate(-rot * 2); for (let i = 0; i < 16; i++) { const an = (i / 16) * 6.28; ctx.fillStyle = f.color; ctx.fillRect(Math.cos(an) * r * 0.91 - 2, Math.sin(an) * r * 0.91 - 2, 4, i % 4 ? 2 : 4); }
        ctx.globalAlpha = a * 0.5; ctx.drawImage(glow(f.color), -r, -r, r * 2, r * 2);
        ctx.restore(); break;
      }
      case 'vortex': {
        const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
        ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, 0.5); ctx.strokeStyle = f.color; ctx.lineWidth = 2.2;
        for (let j = 0; j < 4; j++) { ctx.globalAlpha = a * (0.9 - j * 0.18); ctx.beginPath(); for (let i = 0; i < 40; i++) { const t = i / 40, an = t * 9 + f.t * 0.35 + j * 1.57, rr = f.r * t; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.stroke(); }
        ctx.restore(); break;
      }
      case 'spikes': {
        const a = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
        for (const s of f.arr) {
          const gk = Math.min(1, Math.max(0, (f.t - s.d) / 7)), h = s.h * ease(gk), x = f.x + s.dx, y = f.y + Math.abs(s.dx) * 0.08;
          if (h <= 0) continue;
          ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#5ab0e8'; ctx.beginPath(); ctx.moveTo(x - s.w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x + s.w / 2, y); ctx.fill();
          ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.moveTo(x - s.w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x - s.w * 0.05, y); ctx.fill();
        }
        break;
      }
      case 'cracks': {
        const a = k < 0.05 ? 1 : 1 - (k - 0.05) / 0.95, grow = Math.min(1, k * 12);
        ctx.save(); ctx.translate(f.x, f.y); ctx.globalAlpha = a; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
        for (const pts of f.arr) { ctx.beginPath(); pts.forEach(([x, y], i) => { if (i / (pts.length - 1) <= grow) (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); }); ctx.stroke(); }
        ctx.restore(); break;
      }
      case 'proj': {
        const e = k * k * (3 - 2 * k), lift = f.kind === 'ice' || f.kind === 'wind' ? 0 : Math.sin(e * Math.PI) * -36;
        const px = f.x, py = f.y;
        f.x = f.fx + (f.tx - f.fx) * e; f.y = f.fy + (f.ty - f.fy) * e + lift;
        const ang = Math.atan2(f.y - py, f.x - px) || f.ang;
        const c = f.c;
        // vệt đuôi
        for (let i = 0; i < (low ? 1 : 3); i++) {
          if (f.kind === 'fire') spark(f.x + rnd(-4, 4), f.y + rnd(-4, 4), { ramp: FIRE_RAMP, vx: rnd(-0.8, 0.8), vy: rnd(-1.2, 0), g: -0.03, size: rnd(4, 8), life: rnd(14, 22), grow: -0.25 });
          else if (f.kind === 'shadow') spark(f.x, f.y, { shape: 'smoke', color: '#3a1068', vx: rnd(-0.5, 0.5), vy: rnd(-0.5, 0.5), g: 0, size: rnd(5, 9), life: rnd(16, 26), grow: -0.1 });
          else spark(f.x, f.y, { color: c[i % 3], vx: rnd(-0.8, 0.8), vy: rnd(-0.8, 0.8), g: 0, size: rnd(2, 4.5), life: rnd(10, 18), grow: -0.18 });
        }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(ang); ctx.globalAlpha = 1;
        if (f.kind === 'ice') { ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-6, 6); ctx.lineTo(-14, 0); ctx.lineTo(-6, -6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7ad0f8'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-6, 6); ctx.lineTo(-14, 0); ctx.fill(); }
        else if (f.kind === 'wind') { ctx.strokeStyle = '#e8fff6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-6, 0, 16, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-14, 0, 12, -1, 1); ctx.stroke(); }
        else if (f.kind === 'gold') { ctx.rotate(f.t * 0.4); ctx.fillStyle = '#ffe08a'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 12, an = (i / 8) * 6.28; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); }
        ctx.restore();
        const R = f.kind === 'fire' ? 22 : 18;
        ctx.drawImage(glow(c[1]), f.x - R, f.y - R, R * 2, R * 2); ctx.drawImage(glow('#ffffff'), f.x - R * 0.4, f.y - R * 0.4, R * 0.8, R * 0.8);
        if (f.t >= f.life && f.done) { const d = f.done; f.done = null; d(); }
        break;
      }
    }
  }

  function loop(now) {
    if (!g) { running = false; return; }
    const frozen = now < freezeUntil;
    // rung màn hình
    if (shakeT > 0 && !frozen) {
      shakeT -= 16.7; const a = shakeAmp * Math.max(0, shakeT / 400);
      const sx = rnd(-a, a), sy = rnd(-a, a) * 0.7;
      shakeEls.forEach((el, i) => { el.style.transform = `translate(${(sx * (i ? 0.4 : 1)).toFixed(1)}px, ${(sy * (i ? 0.4 : 1)).toFixed(1)}px)`; });
      if (shakeT <= 0) { shakeAmp = 0; shakeEls.forEach((el) => (el.style.transform = '')); }
    }
    for (const [c, x] of [[cv, g], [cu, gu]]) if (x) { x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H); }
    // môi trường (lớp trên, nhẹ)
    if (amb) {
      g.globalCompositeOperation = SOLID.has(amb.shape) || amb.shape === 'flake' || amb.shape === 'rain' ? 'source-over' : 'lighter';
      for (let i = 0; i < ambParts.length; i++) {
        const p = ambParts[i];
        if (!frozen) { p.t++; p.x += p.vx + Math.sin(p.t / 30 + i) * 0.3; p.y += p.vy; p.rot += p.vr; }
        if (p.y > H + 12 || p.y < -12 || p.x < -12 || p.x > W + 12) { ambParts[i] = newAmb(false); continue; }
        drawPart(g, { ...p, shape: amb.shape }, amb.shape === 'glow' ? 0.5 + 0.4 * Math.sin(p.t / 12 + i) : 0.85);
      }
    }
    // hạt
    parts = parts.filter((p) => {
      if (p.delay > 0) { if (!frozen) p.delay--; return true; }
      if (!frozen) { p.t++; p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.size += p.grow; }
      const k = p.t / p.life, a = Math.max(0, 1 - k);
      if (p.ramp) p.color = rampColor(p.ramp, k);
      const ctx = p.layer === 'under' && gu ? gu : g;
      ctx.globalCompositeOperation = SOLID.has(p.shape) || (p.ramp && k > 0.8) ? 'source-over' : 'lighter';
      drawPart(ctx, p, p.shape === 'soul' ? a * Math.min(1, p.t / 8) : a);
      return p.t < p.life && p.size > 0.2;
    });
    fxs = fxs.filter((f) => {
      if (!frozen) f.t++;
      const k = Math.min(1, f.t / f.life);
      const ctx = f.layer === 'under' && gu ? gu : g;
      ctx.globalCompositeOperation = f.type === 'flash' || f.type === 'decal' || f.type === 'cracks' || f.type === 'spikes' ? 'source-over' : 'lighter';
      if (f.type === 'flash' && f.color.startsWith('#1')) ctx.globalCompositeOperation = 'multiply';
      drawFx(ctx, f, k);
      return f.t < f.life;
    });
    for (const x of [g, gu]) if (x) { x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
    if (parts.length || fxs.length || amb || shakeT > 0 || frozen) requestAnimationFrame(loop);
    else running = false;
  }

  function setLow(v) { low = v; try { localStorage.setItem('tdk_lowfx', v ? '1' : '0'); } catch {} }
  function clear() { parts = []; fxs = []; amb = null; ambParts = []; shakeT = 0; shakeEls.forEach((el) => (el.style.transform = '')); }

  return { attach, resize, impact, projectile, aura, ring, spark, flash: flashScreen, shake, hitstop, cast, pillar, rays, shock, death, victory, ambient, clear, bolt, setLow, get low() { return low; } };
})();
