// =====================================================================
//  BẢN ĐỒ: nền tô mượt theo nhiễu, vật thể có chiều sâu, nước động,
//  ngày/đêm theo giờ thật, hạt môi trường. Chạm để đi, chạm NPC để nói.
// =====================================================================
const GameMap = (() => {
  const cv = $('#map');
  const ctx = cv.getContext('2d');
  // HD-2D (WebGL) – tự tắt nếu máy không hỗ trợ
  const cv3 = $('#map3d');
  const hdOK = typeof Hd2d !== 'undefined' && Hd2d.init(cv3);
  let hdPref = true; try { hdPref = localStorage.getItem('tdk_hd') !== '0'; } catch {}
  const PAINT = typeof PaintMap !== 'undefined';
  const hdOn = () => !PAINT && hdOK && hdPref && Hd2d.ok;
  function setHD(v) { hdPref = !!v; try { localStorage.setItem('tdk_hd', v ? '1' : '0'); } catch {} cv.parentElement.classList.toggle('hd', hdOn()); resize(); }
  const COLS = 12, ROWS = 20;
  let W = 0, H = 0, dpr = 1, T = 32, offY = 0, camY = 0, camX = 0, viewX = 0, viewY = 0;
  let M = null, mapId = null, ground = null, groundFrames = null, objs = [], waterTiles = [], lights = [];
  let questNpc = null, marker = null, onTapTile = null;
  const me = { x: 0, y: 0, px: 0, py: 0, from: null, to: null, t0: 0, dur: 0, race: 'tien', gender: 'm', name: '', face: 1 };
  const others = new Map();
  let amb = [];
  let overlay = [];
  const EMOJI = 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';

  // ---------- bảng màu theo chương ----------
  const TH = {
    heaven: { ground: [238, 231, 247], grass: [222, 208, 244], water: [30, 40, 100], shore: [255, 255, 255], seam: 'rgba(212,165,60,.35)', tree: ['#2f6b3a', '#4f9a52', '#7cc06a'], blossom: '#ffb3c8', fruit: '#ff8fa3', roof: ['#ffe08a', '#d4a53c', '#8a6421'], wall: '#b8402f', col: '#8a1f1a', rock: ['#b8402f', '#8a1f1a'], amb: 'sparkle' },
    city: { ground: [201, 181, 142], grass: [118, 150, 82], water: [58, 110, 140], shore: [220, 235, 240], seam: 'rgba(80,60,30,.28)', tree: ['#2f5a2a', '#4f7f3a', '#86ad5a'], willow: true, roof: ['#6a7a8e', '#3d4a5c', '#232a36'], wall: '#a8322a', col: '#5a1a12', rock: ['#8a8378', '#5e574c'], amb: 'leaf' },
    forest: { ground: [184, 152, 102], grass: [74, 124, 58], water: [44, 104, 146], shore: [230, 250, 255], seam: null, tree: ['#1e4a24', '#2f6b2c', '#5a9a3e'], fruit: '#ffb02a', roof: ['#e0b46a', '#b8863a', '#6a4a1a'], wall: '#7d5a33', col: '#4a3218', rock: ['#8c8c84', '#5a5a54'], amb: 'firefly' },
    river: { ground: [196, 206, 160], grass: [96, 150, 88], water: [40, 120, 150], shore: [235, 250, 245], seam: null, tree: ['#234a2a', '#3a7a3a', '#6aaa52'], willow: true, roof: ['#8a6a4a', '#5a4430', '#2a1e14'], wall: '#7d5a33', col: '#4a3218', rock: ['#8a9a8a', '#5a6a5e'], amb: 'leaf' },
    cave: { ground: [92, 80, 96], grass: [70, 92, 84], water: [30, 40, 70], shore: [140, 160, 220], seam: null, tree: ['#2a3a3a', '#3a5a52', '#6a9a8a'], roof: ['#7a6a8a', '#4a3a5a', '#2a1e34'], wall: '#5a4a5a', col: '#2a1e2a', rock: ['#7a6a86', '#3e3248'], amb: 'firefly', dark: true },
    snow: { ground: [232, 238, 246], grass: [206, 222, 236], water: [150, 196, 228], shore: [255, 255, 255], seam: null, tree: ['#2a4a4a', '#3e6a64', '#e8f4f8'], roof: ['#ffffff', '#c8d8e8', '#6a7a8a'], wall: '#8a5a3a', col: '#4a3020', rock: ['#d8e4f0', '#8a9aac'], amb: 'snow', ice: true },
    desert: { ground: [229, 192, 132], grass: [205, 150, 86], water: [214, 70, 26], shore: [255, 210, 90], seam: null, tree: ['#5a6a2a', '#7a8a3a', '#a0aa4a'], roof: ['#e8b080', '#c8885a', '#8a5a34'], wall: '#c8885a', col: '#8a5a34', rock: ['#b05a32', '#7a3a1e'], lava: true, amb: 'ember' },
    sea: { ground: [190, 230, 222], grass: [60, 150, 140], water: [30, 120, 200], shore: [240, 232, 200], seam: null, tree: ['#1a5a5a', '#2a8a7a', '#ff8a9a'], roof: ['#5ad8e8', '#1a7a9a', '#0a3a4a'], wall: '#1a6a8a', col: '#0a3a4a', rock: ['#5ab0b0', '#1e5a6a'], amb: 'bubble' },
    hell: { ground: [70, 56, 62], grass: [110, 30, 40], water: [180, 20, 30], shore: [40, 20, 24], seam: null, tree: ['#1a0e14', '#3a1a24', '#ff3a3a'], roof: ['#3a2a34', '#1a1018', '#0a0408'], wall: '#5a4a50', col: '#8a1a1a', rock: ['#4a3a44', '#1a1018'], amb: 'ember', dark: true },
    void: { ground: [60, 46, 100], grass: [90, 40, 120], water: [100, 40, 230], shore: [200, 176, 255], seam: null, tree: ['#2a1a4a', '#5a3a8a', '#c88aff'], roof: ['#5a3a8a', '#2a1a4a', '#140a24'], wall: '#3a2e5a', col: '#8a4ae8', rock: ['#3a2e5a', '#120a24'], amb: 'sparkle', dark: true },
  };

  // ---------- nhiễu ----------
  const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const sm = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.15;

  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(3, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.parentElement.classList.toggle('hd', hdOn());
    if (hdOn()) Hd2d.resize(W, H, dpr);
    const nt = PAINT ? W / 7.2 : W / COLS;
    if (M && (nt !== T || !ground)) { T = nt; build(); }
    T = nt;
    initAmb();
  }

  function setMap(id, meta) { mapId = id; M = meta; others.clear(); ground = null; trail.length = 0; resize(); }
  // ===== đoàn thỉnh kinh đi theo sau người chơi =====
  const trail = [];
  function trackTrail() {
    const L0 = trail[trail.length - 1];
    if (!L0) { trail.push([me.px, me.py]); return; }
    const d = Math.hypot(me.px - L0[0], me.py - L0[1]);
    if (d > 2.5) { trail.length = 0; trail.push([me.px, me.py]); return; }
    if (d > 0.06) { trail.push([me.px, me.py]); if (trail.length > 260) trail.splice(0, trail.length - 260); }
  }
  function followers() {
    const list = (G.me && G.me.companions) || [];
    if (!list.length || !M) return [];
    const onMap = new Set(M.npcs.map((n) => n.look || n.id));
    const out = []; let k = 0;
    for (const f of list) {
      if (onMap.has(f.look)) continue;
      k++;
      const want = 0.95 * k; let acc = 0, px = me.px, py = me.py, face = me.face || 1;
      for (let i = trail.length - 1; i > 0; i--) {
        const [ax, ay] = trail[i], [bx, by] = trail[i - 1], seg = Math.hypot(ax - bx, ay - by);
        if (acc + seg >= want) { const t = (want - acc) / seg; px = ax + (bx - ax) * t; py = ay + (by - ay) * t; face = ax > bx ? 1 : ax < bx ? -1 : face; break; }
        acc += seg; px = bx; py = by;
      }
      if (trail.length < 2) { px = me.px - 0.55 * k * (me.face || 1); py = me.py + 0.12 * k; }
      out.push({ f, px, py, face, moving: !!me.to });
    }
    return out;
  }
  function drawFollower(o, now) {
    const { f, px, py, face, moving } = o;
    const cx = (px + 0.5) * T, by = (py + 1) * T;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, by - T * 0.1, T * 0.28, T * 0.08, 0, 0, 7); ctx.fill();
    const bob = moving ? Math.abs(Math.sin(now / 130)) * T * 0.06 : Math.sin(now / 900 + px) * T * 0.015;
    const art = f.art && Art.npc(f.art, 0, 4, undefined, f.art);
    const useArt = art && art.art;
    ctx.save(); ctx.translate(cx, 0); if (face < 0) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (useArt) { const h = T * 2.3, w = h * art.cv.width / art.cv.height; ctx.drawImage(art.cv, -w / 2, by - h + T * 0.06 - bob, w, h); }
    else {
      let lift = 0;
      if (f.horse && Art.mount) { const mc = Art.mount('bachma'); if (mc) { const h = T * 1.25, w = h * mc.cv.width / mc.cv.height; ctx.drawImage(mc.cv, -w / 2, by - h + T * 0.08 - bob * 0.5, w, h); lift = T * 0.55; } }
      const pix = Art.npc(f.look, moving ? 1 + (Math.floor(now / 140) % 2) : 0);
      if (pix) { const hum = pix.cv.width / pix.cv.height < 0.9, h = T * (hum ? 1.85 : 1.25), w = h * pix.cv.width / pix.cv.height; ctx.drawImage(pix.cv, -w / 2, by - h + T * 0.06 - bob - lift, w, h); }
    }
    ctx.restore();
  }
  function setMe(c) {
    me.race = c.race; me.gender = c.gender; me.name = c.name;
    if ((me.x !== c.x || me.y !== c.y) && !me.to) { me.x = c.x; me.y = c.y; me.px = c.x; me.py = c.y; }
  }
  function snap(pos) { me.x = pos[0]; me.y = pos[1]; me.px = me.x; me.py = me.y; me.to = null; }

  // =====================================================================
  //  DỰNG NỀN
  // =====================================================================
  const cls = (ch) => (ch === ',' ? 1 : ch === '~' || ch === 'W' ? 2 : 0);
  function tileCls(x, y) { x = Math.max(0, Math.min(COLS - 1, x)); y = Math.max(0, Math.min(ROWS - 1, y)); return cls(M.tiles[y][x]); }

  function build() {
    const th = TH[M.theme];
    if (typeof Tiles !== 'undefined') { // nền pixel art
      const P = Tiles.build(M), k = T / Tiles.AP;
      groundFrames = P.ground; ground = groundFrames[0]; waterTiles = [];
      objs = P.objs.map((o) => ({ c: o.cv, x: o.x * k, y: o.y * k, w: o.w * k, h: o.h * k, z: o.z }));
      lights = P.lights.map(([x, y, r, c]) => [x * T, y * T, r * T, c]);
      return;
    }
    groundFrames = null;
    const sc = Math.min(2, dpr);
    const PW = Math.round(COLS * T * sc), PH = Math.round(ROWS * T * sc);
    ground = document.createElement('canvas'); ground.width = PW; ground.height = PH;
    const g = ground.getContext('2d');
    const img = g.createImageData(PW, PH), d = img.data;
    const cols = [th.ground, th.grass, th.water];
    const ts = T * sc;
    for (let py = 0; py < PH; py++) {
      for (let px = 0; px < PW; px++) {
        const wx = px / ts, wy = py / ts;
        const n1 = fbm(wx * 1.3, wy * 1.3);
        const fx = wx - 0.5 + (n1 - 0.5) * 0.55, fy = wy - 0.5 + (fbm(wx * 1.3 + 9, wy * 1.3 + 4) - 0.5) * 0.55;
        const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(Math.min(1, Math.max(0, fx - x0))), ty = sm(Math.min(1, Math.max(0, fy - y0)));
        const w = [0, 0, 0];
        w[tileCls(x0, y0)] += (1 - tx) * (1 - ty); w[tileCls(x0 + 1, y0)] += tx * (1 - ty);
        w[tileCls(x0, y0 + 1)] += (1 - tx) * ty; w[tileCls(x0 + 1, y0 + 1)] += tx * ty;
        // làm sắc mép nước
        const ww = Math.min(1, Math.max(0, (w[2] - 0.5) * 3 + 0.5));
        const land = w[0] + w[1] || 1;
        const detail = fbm(wx * 6, wy * 6);
        let r = 0, gg = 0, b = 0;
        for (let k = 0; k < 2; k++) { const f = w[k] / land; r += cols[k][0] * f; gg += cols[k][1] * f; b += cols[k][2] * f; }
        const shade = 0.86 + n1 * 0.22 + (detail - 0.5) * (w[1] > 0.5 ? 0.22 : 0.1);
        r *= shade; gg *= shade; b *= shade;
        // nước: sâu ở giữa, bọt ở bờ
        const depth = Math.min(1, ww * 1.4);
        const wc = th.water, wr = wc[0] * (1.15 - depth * 0.35), wg = wc[1] * (1.15 - depth * 0.35), wb = wc[2] * (1.12 - depth * 0.25);
        r = r * (1 - ww) + wr * ww; gg = gg * (1 - ww) + wg * ww; b = b * (1 - ww) + wb * ww;
        const foam = Math.exp(-Math.pow((w[2] - 0.5) / 0.08, 2)) * (0.55 + detail * 0.45);
        r += (th.shore[0] - r) * foam * 0.75; gg += (th.shore[1] - gg) * foam * 0.75; b += (th.shore[2] - b) * foam * 0.75;
        const i = (py * PW + px) * 4;
        d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    g.scale(sc, sc);
    paintDetails(g, th);
    buildObjects(th);
  }

  function paintDetails(g, th) {
    waterTiles = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = M.tiles[y][x], X = x * T, Y = y * T, r = hash(x, y);
      if (ch === '~' || ch === 'W') { waterTiles.push([x, y]); continue; }
      if (ch === '.' && th.seam) {
        g.strokeStyle = th.seam; g.lineWidth = 1;
        if (M.theme === 'heaven') { g.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(X + 2, Y + 2, T * 0.45, T * 0.2); }
        else { g.beginPath(); const o = (y % 2) * T * 0.5; for (let k = 0; k < 2; k++) { g.moveTo(X + ((o + k * T * 0.5) % T), Y); g.lineTo(X + ((o + k * T * 0.5) % T), Y + T * 0.5); g.moveTo(X + ((o + T * 0.25 + k * T * 0.5) % T), Y + T * 0.5); g.lineTo(X + ((o + T * 0.25 + k * T * 0.5) % T), Y + T); } g.moveTo(X, Y + T * 0.5); g.lineTo(X + T, Y + T * 0.5); g.stroke(); }
      }
      if (ch === '.' && !th.seam && r > 0.55) { // sỏi
        g.fillStyle = 'rgba(80,60,30,.25)'; g.beginPath(); g.ellipse(X + T * hash(y, x), Y + T * hash(x + 3, y), T * 0.06, T * 0.04, 0, 0, 7); g.fill();
        if (M.theme === 'desert') { g.strokeStyle = 'rgba(150,100,40,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y + T * r); g.quadraticCurveTo(X + T / 2, Y + T * r - 4, X + T, Y + T * r); g.stroke(); }
      }
      if (ch === ',' && (M.theme === 'snow' || M.theme === 'cave')) {
        for (let k = 0; k < 4; k++) { const bx = X + T * (0.15 + hash(x + k, y) * 0.7), by = Y + T * (0.3 + hash(y + k, x) * 0.6);
          if (M.theme === 'snow') { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(bx, by, T * 0.16, T * 0.07, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(120,150,190,.35)'; g.fillRect(bx - T * 0.1, by + T * 0.04, T * 0.2, 1); }
          else { g.fillStyle = ['#7ad8c8', '#b88ae8', '#5ab0e8', '#e8a0d0'][k]; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(bx, by - T * 0.2); g.lineTo(bx + T * 0.06, by); g.lineTo(bx - T * 0.06, by); g.fill(); g.globalAlpha = 1; } }
        continue;
      }
      if (ch === ',') {
        if (M.theme === 'heaven') {
          for (let k = 0; k < 3; k++) {
            const cx = X + T * (0.2 + hash(x + k, y) * 0.6), cy = Y + T * (0.3 + hash(y + k, x) * 0.5), rr = T * (0.22 + hash(x, y + k) * 0.12);
            const gr = g.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 1, cx, cy, rr);
            gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, ['#fff3fa', '#fff8e0', '#eef3ff'][k]); gr.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill();
          }
        } else {
          const dark = M.theme === 'desert' ? 'rgba(120,70,20,.55)' : 'rgba(20,60,15,.55)', lite = M.theme === 'desert' ? 'rgba(250,210,140,.6)' : 'rgba(170,220,120,.55)';
          g.lineCap = 'round';
          for (let k = 0; k < 5; k++) {
            const bx = X + T * (0.1 + hash(x + k, y + 2 * k) * 0.8), by = Y + T * (0.35 + hash(y + k, x) * 0.6), hgt = T * (0.18 + hash(k, x + y) * 0.14);
            g.strokeStyle = k % 2 ? dark : lite; g.lineWidth = Math.max(1, T * 0.045);
            g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - T * 0.05, by - hgt * 0.6, bx - T * 0.09, by - hgt);
            g.moveTo(bx, by); g.quadraticCurveTo(bx + T * 0.02, by - hgt * 0.7, bx + T * 0.07, by - hgt * 1.05); g.stroke();
          }
          if (M.theme !== 'desert' && r > 0.7) { g.fillStyle = ['#ffd65a', '#ff9ec0', '#ffffff'][Math.floor(r * 10) % 3]; g.beginPath(); g.arc(X + T * hash(y, x + 9), Y + T * hash(x, y + 9), T * 0.05, 0, 7); g.fill(); }
        }
      }
    }
    // viền tối nhẹ quanh rìa bản đồ
    const vg = g.createLinearGradient(0, 0, COLS * T, 0);
    vg.addColorStop(0, 'rgba(0,0,0,.18)'); vg.addColorStop(0.08, 'rgba(0,0,0,0)'); vg.addColorStop(0.92, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.18)');
    g.fillStyle = vg; g.fillRect(0, 0, COLS * T, ROWS * T);
  }

  // =====================================================================
  //  VẬT THỂ (cây, cột, nhà, cổng) – vẽ sẵn thành sprite, sắp theo chiều sâu
  // =====================================================================
  function sprite(w, h, fn) {
    const sc = Math.min(2, dpr);
    const c = document.createElement('canvas'); c.width = Math.ceil(w * sc); c.height = Math.ceil(h * sc);
    const g = c.getContext('2d'); g.scale(sc, sc); fn(g, w, h); return c;
  }
  function shadow(g, cx, cy, rx, ry, a = 0.3) { g.fillStyle = `rgba(0,0,0,${a})`; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill(); }

  function treeSprite(th, seed) {
    const w = T * 1.5, h = T * 2;
    return sprite(w, h, (g) => {
      const cx = w / 2, by = h - T * 0.12;
      shadow(g, cx, by, T * 0.55, T * 0.16);
      g.fillStyle = '#5a3a1e'; g.beginPath(); g.moveTo(cx - T * 0.09, by); g.lineTo(cx - T * 0.05, by - T * 0.7); g.lineTo(cx + T * 0.05, by - T * 0.7); g.lineTo(cx + T * 0.1, by); g.fill();
      if (th.willow) {
        const [d, m, l] = th.tree;
        g.fillStyle = m; g.beginPath(); g.ellipse(cx, by - T * 1.2, T * 0.55, T * 0.42, 0, 0, 7); g.fill();
        g.lineCap = 'round';
        for (let i = 0; i < 16; i++) { const x = cx - T * 0.55 + (i / 15) * T * 1.1, len = T * (0.5 + hash(i, seed) * 0.5); g.strokeStyle = i % 3 ? m : l; g.lineWidth = T * 0.06; g.beginPath(); g.moveTo(x, by - T * 1.3); g.quadraticCurveTo(x + T * 0.08, by - T * 1.0, x, by - T * 1.3 + len + T * 0.3); g.stroke(); }
        g.fillStyle = d; g.globalAlpha = 0.35; g.beginPath(); g.ellipse(cx + T * 0.15, by - T * 1.05, T * 0.4, T * 0.2, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        return;
      }
      const blobs = [[0, -1.25, 0.5], [-0.32, -1.0, 0.36], [0.33, -1.02, 0.36], [-0.16, -1.5, 0.32], [0.2, -1.48, 0.3]];
      const [d, m, l] = th.tree;
      for (const [bx, byy, r] of blobs) { g.fillStyle = d; g.beginPath(); g.arc(cx + bx * T, by + byy * T + T * 0.05, r * T, 0, 7); g.fill(); }
      for (const [bx, byy, r] of blobs) {
        const x = cx + bx * T, y = by + byy * T, rr = r * T;
        const gr = g.createRadialGradient(x - rr * 0.4, y - rr * 0.5, rr * 0.1, x, y, rr);
        gr.addColorStop(0, l); gr.addColorStop(0.6, m); gr.addColorStop(1, d);
        g.fillStyle = gr; g.beginPath(); g.arc(x, y - T * 0.04, rr * 0.92, 0, 7); g.fill();
      }
      const dots = th.blossom || th.fruit;
      if (dots) for (let i = 0; i < (th.blossom ? 14 : 5); i++) { g.fillStyle = th.blossom && i % 3 ? th.blossom : (th.fruit || th.blossom); g.beginPath(); g.arc(cx + (hash(i, seed) - 0.5) * T * 1, by - T * (0.9 + hash(seed, i) * 0.7), T * (th.blossom && i % 3 ? 0.05 : 0.07), 0, 7); g.fill(); }
    });
  }

  function railSprite(th, x, y) {
    const theme = M.theme;
    return sprite(T + 1, T * 0.8, (g, w, h) => {
      if (theme === 'heaven' || theme === 'city') {
        const stone = theme === 'heaven' ? ['#ffffff', '#d8cfe6'] : ['#b8b0a2', '#7a7266'];
        g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, h - T * 0.1, w, T * 0.1);
        const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, stone[0]); gr.addColorStop(1, stone[1]);
        g.fillStyle = gr; g.fillRect(0, h - T * 0.5, w, T * 0.1); g.fillRect(0, h - T * 0.22, w, T * 0.12);
        for (let i = 0; i < 4; i++) g.fillRect(i * w / 4 + w / 8 - T * 0.04, h - T * 0.45, T * 0.08, T * 0.3);
        g.fillStyle = theme === 'heaven' ? '#d4a53c' : '#5e574c'; g.fillRect(0, h - T * 0.56, w, T * 0.06);
      } else {
        const [c1, c2] = th.rock;
        for (let i = 0; i < 2; i++) { const cx = w * (0.3 + i * 0.4), r = T * (0.18 + hash(x + i, y) * 0.08); const gr = g.createRadialGradient(cx - r * 0.3, h - r * 1.2, 1, cx, h - r, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, h - r * 0.9, r * 1.2, r, 0, 0, 7); g.fill(); }
      }
    });
  }

  function pillarSprite(th, x, y) {
    const theme = M.theme;
    if (y === ROWS - 1) return { c: railSprite(th, x, y), h: 0.8 };
    if (theme === 'heaven') {
      return { c: sprite(T, T * 2, (g, w, h) => {
        shadow(g, w / 2, h - T * 0.1, T * 0.42, T * 0.12);
        const gr = g.createLinearGradient(w * 0.25, 0, w * 0.75, 0); gr.addColorStop(0, '#7a1612'); gr.addColorStop(0.35, '#d9503a'); gr.addColorStop(1, '#6a120e');
        g.fillStyle = gr; g.fillRect(w * 0.27, h - T * 1.75, w * 0.46, T * 1.6);
        g.strokeStyle = 'rgba(255,214,90,.75)'; g.lineWidth = 1.5; g.beginPath();
        for (let k = 0; k < 4; k++) { const yy = h - T * 1.6 + k * T * 0.38; g.moveTo(w * 0.27, yy); g.quadraticCurveTo(w * 0.5, yy + T * 0.18, w * 0.73, yy + T * 0.05); } g.stroke();
        const cap = g.createLinearGradient(0, 0, 0, T * 0.2); cap.addColorStop(0, '#fff0b0'); cap.addColorStop(1, '#a8781e');
        g.fillStyle = cap; g.fillRect(w * 0.16, h - T * 1.88, w * 0.68, T * 0.18); g.fillRect(w * 0.18, h - T * 0.22, w * 0.64, T * 0.16);
      }), h: 2 };
    }
    if (theme === 'city') {
      const L = M.tiles[y][x - 1] === '#', R = M.tiles[y][x + 1] === '#';
      return { c: sprite(T + 1, T * 1.55, (g, w, h) => {
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - T * 0.12, w, T * 0.12);
        const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9a9286'); gr.addColorStop(1, '#5e574c');
        g.fillStyle = gr; g.fillRect(0, h - T * 1.25, w, T * 1.15);
        g.strokeStyle = 'rgba(40,30,20,.35)'; g.lineWidth = 1;
        for (let r = 0; r < 4; r++) { const yy = h - T * 1.25 + r * T * 0.29; g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); for (let k = 0; k < 3; k++) { const xx = ((k * 0.4 + (r % 2) * 0.2) * w); g.moveTo(xx, yy); g.lineTo(xx, yy + T * 0.29); } g.stroke(); }
        g.fillStyle = '#2f3540'; g.beginPath(); g.moveTo(L ? 0 : -2, h - T * 1.25); g.lineTo(L ? 0 : T * 0.08, h - T * 1.45); g.lineTo(R ? w : w - T * 0.08, h - T * 1.45); g.lineTo(R ? w : w + 2, h - T * 1.25); g.fill();
        g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(0, h - T * 1.45, w, T * 0.05);
      }), h: 1.55 };
    }
    const [c1, c2] = th.rock;
    return { c: sprite(T * 1.1, T * 1.3, (g, w, h) => {
      shadow(g, w / 2, h - T * 0.12, T * 0.5, T * 0.14);
      const r = hash(x, y);
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; g.beginPath();
      g.moveTo(w * 0.06, h - T * 0.14); g.lineTo(w * (0.12 + r * 0.1), h - T * 0.8); g.lineTo(w * 0.45, h - T * (1.12 + r * 0.1)); g.lineTo(w * 0.82, h - T * 0.78); g.lineTo(w * 0.95, h - T * 0.14); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(w * (0.12 + r * 0.1), h - T * 0.8); g.lineTo(w * 0.45, h - T * (1.12 + r * 0.1)); g.lineTo(w * 0.42, h - T * 0.5); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.45, h - T * 0.9); g.lineTo(w * 0.55, h - T * 0.4); g.stroke();
    }), h: 1.3 };
  }

  function houseSprite(th, tw, thh) {
    const w = tw * T, h = thh * T + T * 0.85;
    return sprite(w + T * 0.3, h, (g, ww, hh) => {
      const x0 = T * 0.15, bw = w, by = hh - T * 0.1;
      shadow(g, x0 + bw / 2, by, bw * 0.55, T * 0.18, 0.32);
      if (M.theme === 'desert') {
        g.fillStyle = '#c8885a'; g.fillRect(x0 + bw * 0.08, by - thh * T * 0.95, bw * 0.84, thh * T * 0.95);
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0 + bw * 0.08, by - thh * T * 0.95, bw * 0.84, T * 0.12);
        const dg = g.createRadialGradient(x0 + bw * 0.45, by - thh * T * 1.05, 2, x0 + bw / 2, by - thh * T * 0.95, bw * 0.3);
        dg.addColorStop(0, '#f4d0a0'); dg.addColorStop(1, '#a8683a'); g.fillStyle = dg;
        g.beginPath(); g.arc(x0 + bw / 2, by - thh * T * 0.95, bw * 0.28, Math.PI, 0); g.fill();
        g.fillStyle = '#3a2010'; g.beginPath(); g.arc(x0 + bw / 2, by - T * 0.35, T * 0.2, Math.PI, 0); g.fillRect(x0 + bw / 2 - T * 0.2, by - T * 0.35, T * 0.4, T * 0.35); g.fill();
        return;
      }
      const wallTop = by - thh * T * 0.62;
      g.fillStyle = '#a49a8a'; g.fillRect(x0 + bw * 0.04, by - T * 0.16, bw * 0.92, T * 0.16);
      g.fillStyle = M.theme === 'forest' ? '#c7a26a' : '#efe4cc'; g.fillRect(x0 + bw * 0.1, wallTop, bw * 0.8, by - T * 0.16 - wallTop);
      g.fillStyle = th.col;
      const ncol = Math.max(2, tw * 2);
      for (let i = 0; i <= ncol; i++) g.fillRect(x0 + bw * 0.1 + (i / ncol) * bw * 0.8 - T * 0.05, wallTop, T * 0.1, by - T * 0.16 - wallTop);
      g.fillStyle = '#3a1e14'; g.fillRect(x0 + bw / 2 - T * 0.18, by - T * 0.16 - (by - wallTop) * 0.62, T * 0.36, (by - wallTop) * 0.62 - T * 0.16 + T * 0.16);
      g.strokeStyle = 'rgba(60,30,10,.6)'; g.lineWidth = 1;
      for (const sx of [0.25, 0.75]) { const wx = x0 + bw * sx - T * 0.15, wy = wallTop + T * 0.12; g.strokeRect(wx, wy, T * 0.3, T * 0.26); g.beginPath(); g.moveTo(wx + T * 0.15, wy); g.lineTo(wx + T * 0.15, wy + T * 0.26); g.moveTo(wx, wy + T * 0.13); g.lineTo(wx + T * 0.3, wy + T * 0.13); g.stroke(); }
      // mái cong
      const [r1, r2, r3] = th.roof;
      const rt = wallTop - T * (0.45 + thh * 0.15), eave = wallTop + T * 0.08;
      const gr = g.createLinearGradient(0, rt, 0, eave); gr.addColorStop(0, r1); gr.addColorStop(0.5, r2); gr.addColorStop(1, r3);
      g.fillStyle = gr; g.strokeStyle = 'rgba(30,15,5,.6)'; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0 - T * 0.08, eave - T * 0.14);
      g.quadraticCurveTo(x0 + bw * 0.12, eave, x0 + bw * 0.2, rt + T * 0.08);
      g.lineTo(x0 + bw * 0.8, rt + T * 0.08);
      g.quadraticCurveTo(x0 + bw * 0.88, eave, x0 + bw + T * 0.08, eave - T * 0.14);
      g.quadraticCurveTo(x0 + bw / 2, eave + T * 0.04, x0 - T * 0.08, eave - T * 0.14);
      g.fill(); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.18)';
      for (let i = 1; i < tw * 5; i++) { const xx = x0 + bw * 0.2 + (i / (tw * 5)) * bw * 0.6; g.beginPath(); g.moveTo(xx, rt + T * 0.1); g.lineTo(x0 + (xx - x0 - bw / 2) * 1.35 + bw / 2, eave - T * 0.04); g.stroke(); }
      g.fillStyle = r3; g.fillRect(x0 + bw * 0.18, rt, bw * 0.64, T * 0.1);
      g.fillStyle = r1; g.beginPath(); g.arc(x0 + bw * 0.18, rt + T * 0.02, T * 0.08, 0, 7); g.arc(x0 + bw * 0.82, rt + T * 0.02, T * 0.08, 0, 7); g.fill();
      if (M.theme !== 'forest') { // đèn lồng
        for (const sx of [0.12, 0.88]) { const lx = x0 + bw * sx, ly = eave + T * 0.12; g.strokeStyle = '#3a1e14'; g.beginPath(); g.moveTo(lx, eave - T * 0.05); g.lineTo(lx, ly - T * 0.1); g.stroke(); g.fillStyle = '#e0402a'; g.beginPath(); g.ellipse(lx, ly, T * 0.08, T * 0.11, 0, 0, 7); g.fill(); g.fillStyle = '#ffd65a'; g.fillRect(lx - T * 0.05, ly - T * 0.12, T * 0.1, T * 0.03); }
      }
    });
  }

  function buildObjects(th) {
    objs = []; lights = [];
    const used = new Set();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = M.tiles[y][x];
      if (ch === 'T') { const c = treeSprite(th, x * 7 + y); objs.push({ c, x: x * T + T / 2 - c.width / Math.min(2, dpr) / 2, y: (y + 1) * T - c.height / Math.min(2, dpr) + T * 0.1, z: y + 0.9 }); }
      if (ch === '#') { const { c } = pillarSprite(th, x, y); const s = Math.min(2, dpr); objs.push({ c, x: x * T + T / 2 - c.width / s / 2, y: (y + 1) * T - c.height / s, z: y + 0.95 }); }
      if (ch === 'H' && !used.has(x + ',' + y)) {
        let tw = 1, thh = 1;
        if (M.tiles[y][x + 1] === 'H' && !used.has(x + 1 + ',' + y)) tw = 2;
        if (M.tiles[y + 1] && M.tiles[y + 1][x] === 'H' && (tw === 1 || M.tiles[y + 1][x + 1] === 'H')) thh = 2;
        for (let dy = 0; dy < thh; dy++) for (let dx = 0; dx < tw; dx++) used.add(x + dx + ',' + (y + dy));
        const c = houseSprite(th, tw, thh); const s = Math.min(2, dpr);
        objs.push({ c, x: x * T - T * 0.15, y: (y + thh) * T - c.height / s, z: y + thh - 0.05 });
        lights.push([(x + tw / 2) * T, (y + thh) * T - T * 0.4, T * (1.3 + tw * 0.4)]);
      }
    }
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) lights.push([(x + 0.5) * T, (y + 0.6) * T, T * 1.4, '255,220,140']); });
  }

  // =====================================================================
  //  HẠT MÔI TRƯỜNG
  // =====================================================================
  function initAmb() {
    if (!M) return;
    const kind = TH[M.theme].amb, n = FX.low ? 8 : 26;
    amb = Array.from({ length: n }, () => newAmb(kind, true));
  }
  function newAmb(kind, anywhere) {
    const p = { kind, x: Math.random() * W, y: anywhere ? Math.random() * H : (kind === 'ember' || kind === 'firefly' ? H + 5 : -5), t: Math.random() * 100, s: 0.6 + Math.random() };
    if (kind === 'leaf') { p.vx = 0.2 + Math.random() * 0.4; p.vy = 0.35 + Math.random() * 0.4; p.c = ['#e8a040', '#d0602a', '#f0c060'][Math.floor(Math.random() * 3)]; }
    if (kind === 'ember') { p.vx = (Math.random() - 0.5) * 0.3; p.vy = -(0.3 + Math.random() * 0.6); }
    if (kind === 'firefly') { p.vx = 0; p.vy = -0.15 - Math.random() * 0.2; }
    if (kind === 'sparkle') { p.vx = 0.1; p.vy = 0.05; }
    if (kind === 'snow') { p.vx = -0.2 + Math.random() * 0.3; p.vy = 0.4 + Math.random() * 0.5; if (!anywhere) p.y = -5; }
    if (kind === 'bubble') { p.vx = 0; p.vy = -(0.25 + Math.random() * 0.5); if (!anywhere) p.y = H + 5; }
    return p;
  }
  function drawAmb(now, night) {
    ctx.save();
    for (let i = 0; i < amb.length; i++) {
      const p = amb[i]; p.t++;
      p.x += p.vx + Math.sin((p.t + i * 20) / 40) * 0.3; p.y += p.vy;
      if (p.y < -10 || p.y > H + 10 || p.x > W + 10 || p.x < -10) { amb[i] = newAmb(p.kind, false); continue; }
      if (p.kind === 'snow') { ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * p.s, 0, 7); ctx.fill(); continue; }
      if (p.kind === 'bubble') { ctx.globalAlpha = 0.55; ctx.strokeStyle = '#e8ffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * p.s, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(p.x - 0.7 * p.s, p.y - 0.7 * p.s, 0.6 * p.s, 0, 7); ctx.fill(); continue; }
      if (p.kind === 'leaf') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.t / 18) * 1.2); ctx.fillStyle = p.c; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.ellipse(0, 0, 3.5 * p.s, 1.6 * p.s, 0, 0, 7); ctx.fill(); ctx.restore();
      } else {
        const tw = 0.5 + 0.5 * Math.sin(p.t / (p.kind === 'sparkle' ? 9 : 14) + i);
        const col = p.kind === 'ember' ? '255,140,40' : p.kind === 'firefly' ? '210,255,120' : '255,236,160';
        if (p.kind === 'firefly' && !night) { ctx.globalAlpha = 0.25 * tw; } else ctx.globalAlpha = 0.9 * tw;
        ctx.globalCompositeOperation = 'lighter';
        const r = (p.kind === 'sparkle' ? 2 : 2.4) * p.s;
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, 7); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();
  }

  // =====================================================================
  //  VÒNG VẼ
  // =====================================================================
  function frame(now) {
    requestAnimationFrame(frame);
    if (!M || !ground || document.hidden || $('#scr-game').hidden || !W) return;
    if (typeof BattleUI !== 'undefined' && BattleUI.active) return; // đang đánh: nhường GPU cho sân đấu 3D
    if (me.to) {
      const k = Math.min(1, (now - me.t0) / me.dur);
      me.px = me.from[0] + (me.to[0] - me.from[0]) * k;
      me.py = me.from[1] + (me.to[1] - me.from[1]) * k;
      if (k >= 1) { me.to = null; me.done && me.done(); }
    }
    for (const o of others.values()) {
      const dx = o.x - o.px; if (Math.abs(dx) > 0.02) o.face = dx > 0 ? 1 : -1;
      o.moving = Math.abs(o.x - o.px) + Math.abs(o.y - o.py) > 0.02;
      o.px += (o.x - o.px) * 0.2; o.py += (o.y - o.py) * 0.2;
    }
    if (PAINT) return framePaint(now);
    const mapH = ROWS * T;
    offY = mapH < H ? (H - mapH) / 2 : 0;
    const target = mapH > H ? Math.max(0, Math.min(mapH - H, (me.py + 0.5) * T - H / 2)) : 0;
    camY += (target - camY) * 0.2; if (Math.abs(target - camY) < 0.3) camY = target;
    viewX = 0; viewY = camY - offY;

    if (hdOn()) return frameHD(now);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0d0907'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, Math.round((offY - camY) * dpr) / dpr);
    ctx.imageSmoothingEnabled = !groundFrames;
    ctx.drawImage(groundFrames ? groundFrames[Math.floor(now / 420) % groundFrames.length] : ground, 0, 0, COLS * T, ROWS * T);
    if (!groundFrames) drawWater(now);
    // đích đến
    if (marker && now - marker.t < 800) {
      const k = (now - marker.t) / 800;
      for (let i = 0; i < 2; i++) { const kk = Math.min(1, k + i * 0.25); ctx.strokeStyle = `rgba(243,210,122,${1 - kk})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse((marker.x + 0.5) * T, (marker.y + 0.78) * T, T * (0.15 + kk * 0.3), T * (0.06 + kk * 0.12), 0, 0, 7); ctx.stroke(); }
    }
    const ents = objs.map((o) => ({ z: o.z, draw: () => { ctx.imageSmoothingEnabled = !o.w; ctx.drawImage(o.c, o.x, o.y, o.w || o.c.width / Math.min(2, dpr), o.h || o.c.height / Math.min(2, dpr)); ctx.imageSmoothingEnabled = true; } }));
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) ents.push({ z: y + 0.5, draw: () => drawPortal(x, y, now) }); });
    for (const n of M.npcs) ents.push({ z: n.y + 0.6, draw: () => drawNpc(n, now) });
    for (const n of M.nodes || []) ents.push({ z: n.y + 0.5, draw: () => drawNode(n, now) });
    for (const o of others.values()) ents.push({ z: o.py + 0.6, draw: () => drawHero(o.race, o.gender, o.px, o.py, o.name, false, now, o.moving, o.face || 1, o.gear, o) });
    trackTrail(); for (const fo of followers()) ents.push({ z: fo.py + 0.6, draw: () => drawFollower(fo, now) });
    ents.push({ z: me.py + 0.61, draw: () => drawHero(me.race, me.gender, me.px, me.py, me.name, true, now, !!me.to, me.face, G.me && G.me.gear, G.me) });
    overlay = [];
    ents.sort((a, b) => a.z - b.z).forEach((e) => e.draw());
    overlay.forEach((f) => f());
    ctx.restore();
    lighting(now);
  }

  // =====================================================================
  //  KHUNG HÌNH KIỂU TRANH VẼ: nền tranh + vật thể xếp theo chiều sâu
  // =====================================================================
  const artCache = {};
  let livingNow = false;
  function artImg(src) { if (!src) return null; let im = artCache[src]; if (!im) { im = artCache[src] = new Image(); im.src = src; } return im.complete && im.naturalWidth ? im : null; }
  function framePaint(now) {
    const R = Math.min(2, dpr), PM = PaintMap.get(M, T, R);
    const tx = Math.max(0, Math.min(COLS * T - W, (me.px + 0.5) * T - W / 2)), ty = Math.max(0, Math.min(ROWS * T - H, (me.py + 0.6) * T - H * 0.56));
    camX += (tx - camX) * 0.18; camY += (ty - camY) * 0.18;
    if (Math.abs(tx - camX) < 0.3) camX = tx; if (Math.abs(ty - camY) < 0.3) camY = ty;
    viewX = Math.round(camX * dpr) / dpr; viewY = Math.round(camY * dpr) / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1a140e'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(-viewX, -viewY);
    ctx.imageSmoothingEnabled = true;
    const custom = artImg(Sprites.mapArt(mapId)), front = artImg(Sprites.mapFront(mapId));
    if (custom) ctx.drawImage(custom, 0, 0, COLS * T, ROWS * T);
    livingNow = !!(custom && typeof Living !== 'undefined' && Living.has(mapId));
    const view = { x: viewX, y: viewY, w: W, h: H };
    if (livingNow) Living.ground(ctx, custom, mapId, T, COLS, ROWS, now, view);
    if (livingNow) Living.haunt(ctx, M.tiles, T, now, view);
    else { ctx.drawImage(PM.ground, 0, 0, COLS * T, ROWS * T); PaintMap.water(ctx, PM.water, T, now, PM.pal); }
    if (marker && now - marker.t < 800) {
      const k = (now - marker.t) / 800;
      for (let i = 0; i < 2; i++) { const kk = Math.min(1, k + i * 0.25); ctx.strokeStyle = `rgba(255,240,180,${1 - kk})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse((marker.x + 0.5) * T, (marker.y + 0.8) * T, T * (0.15 + kk * 0.32), T * (0.06 + kk * 0.13), 0, 0, 7); ctx.stroke(); }
    }
    const meBox = { x: (me.px + 0.5) * T - T * 0.5, y: (me.py + 1) * T - T * 1.9, w: T, h: T * 1.9 }, meZ = me.py + 0.9;
    const ents = (custom ? [] : PM.objs).filter((o) => o.x < viewX + W + T && o.x + o.w > viewX - T && o.y < viewY + H + T && o.y + o.h > viewY - T).map((o) => ({ z: o.z, draw: () => {
      const cover = o.z > meZ && o.x < meBox.x + meBox.w && o.x + o.w > meBox.x && o.y < meBox.y + meBox.h && o.y + o.h * 0.85 > meBox.y;
      if (cover) ctx.globalAlpha = 0.5; ctx.drawImage(o.c, o.x, o.y, o.w, o.h); ctx.globalAlpha = 1; } }));
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) ents.push({ z: y + 0.82, draw: () => drawPortal(x, y + 0.1, now) }); });
    for (const n of M.npcs) ents.push({ z: n.y + 0.9, draw: () => drawNpc(n, now) });
    for (const n of M.nodes || []) ents.push({ z: n.y + 0.7, draw: () => drawNode(n, now) });
    for (const o of others.values()) ents.push({ z: o.py + 0.9, draw: () => drawHero(o.race, o.gender, o.px, o.py, o.name, false, now, o.moving, o.face || 1, o.gear, o) });
    trackTrail(); for (const fo of followers()) ents.push({ z: fo.py + 0.9, draw: () => drawFollower(fo, now) });
    ents.push({ z: meZ + 0.001, draw: () => drawHero(me.race, me.gender, me.px, me.py, me.name, true, now, !!me.to, me.face, G.me && G.me.gear, G.me) });
    overlay = [];
    ents.sort((a, b) => a.z - b.z).forEach((e) => e.draw());
    if (front) ctx.drawImage(front, 0, 0, COLS * T, ROWS * T);
    if (livingNow) Living.over(ctx, mapId, T, COLS, ROWS, now, view);
    overlay.forEach((f) => f());
    ctx.restore();
    lights = (livingNow && Living.lights(mapId, T)) || PM.lights;
    lighting(now);
    if (now - miniT > 200) { miniT = now; drawMini(now); }
    joyStep(now);
  }

  // ---------- bản đồ nhỏ tròn ----------
  let miniT = 0;
  const mini = $('#mm-cv'), mg = mini && mini.getContext('2d');
  function drawMini(now) {
    if (!mg) return;
    const S = mini.width, k = S / 22, ox = S / 2 - (COLS / 2) * k, oy = S / 2 - (me.py + 0.5) * k * 0.55 - (ROWS * k * 0.45) / 2 + 0;
    const cy0 = Math.max(S - ROWS * k - 6, Math.min(6, S / 2 - (me.py + 0.5) * k));
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, S, S);
    mg.save(); mg.beginPath(); mg.arc(S / 2, S / 2, S / 2, 0, 7); mg.clip();
    const bg = mg.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); bg.addColorStop(0, '#2a5a7a'); bg.addColorStop(1, '#0c2034'); mg.fillStyle = bg; mg.fillRect(0, 0, S, S);
    mg.translate(ox, cy0);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = M.tiles[y][x];
      mg.fillStyle = ch === '~' || ch === 'W' ? 'rgba(90,180,240,.85)' : ch === ',' ? 'rgba(110,190,110,.7)' : ch === '.' || ch === 'P' ? 'rgba(230,214,170,.55)' : ch === 'H' ? 'rgba(200,120,90,.75)' : ch === 'T' ? 'rgba(60,130,70,.8)' : 'rgba(10,20,30,.35)';
      mg.fillRect(x * k, y * k, k + 0.5, k + 0.5);
    }
    const dot = (x, y, c, r) => { mg.fillStyle = c; mg.shadowColor = c; mg.shadowBlur = 6; mg.beginPath(); mg.arc((x + 0.5) * k, (y + 0.5) * k, r, 0, 7); mg.fill(); mg.shadowBlur = 0; };
    for (const n of M.npcs) dot(n.x, n.y, n.id === questNpc ? '#ff3a2a' : n.boss ? '#ff5a3a' : '#ff9a2a', n.id === questNpc ? 6 : 4.5);
    for (const n of M.nodes || []) if (!(nodeCd[n.id] > Date.now())) dot(n.x, n.y, '#9af07a', 3);
    for (const o of others.values()) dot(o.px, o.py, '#4a9aff', 4.5);
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) dot(x, y, '#ffe07a', 5); });
    dot(me.px, me.py, '#6affd8', 6 + Math.sin(now / 200));
    mg.restore();
  }

  // ---------- cần điều khiển ----------
  const joy = $('#joy'); let joyDir = null, joyNext = 0;
  if (joy) {
    const knob = joy.querySelector('i');
    const set = (e) => { const r = joy.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), m = Math.min(d, r.width * 0.32);
      knob.style.transform = d ? `translate(${(dx / d) * m}px, ${(dy / d) * m}px)` : '';
      joyDir = d < 12 ? null : Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]; };
    joy.addEventListener('pointerdown', (e) => { e.preventDefault(); joy.setPointerCapture(e.pointerId); joy.classList.add('on'); set(e); });
    joy.addEventListener('pointermove', (e) => { if (joy.classList.contains('on')) set(e); });
    const end = () => { joy.classList.remove('on'); joyDir = null; knob.style.transform = ''; };
    joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);
  }
  function joyStep(now) {
    if (!joyDir || me.to || now < joyNext || !onTapTile) return;
    const nx = me.x + joyDir[0], ny = me.y + joyDir[1];
    if (joyDir[0]) me.face = joyDir[0];
    joyNext = now + 90;
    if (walkable(nx, ny)) onTapTile(nx, ny);
  }

  // =====================================================================
  //  KHUNG HÌNH HD-2D: dựng cảnh 3D bằng WebGL, chữ/nhãn vẽ trên lớp 2D
  // =====================================================================
  const imgCache = {};
  const worldCache = new Map();
  // màu tên NPC theo vai trò: nhiệm vụ vàng · cửa hàng xanh · thầy thuốc lục · boss đỏ
  function nameCol(n) { return n.boss ? '#ff9a85' : n.role === 'shop' ? '#8ad8ff' : n.role === 'heal' ? '#9af0a0' : n.role ? '#ffb0e0' : '#f3d27a'; }
  // dấu chấm than nhiệm vụ: vàng (nói chuyện) / đỏ (boss), nảy lên xuống
  function bang(x, y, h, boss) {
    const w = h * 0.42, col = boss ? '#ff4a3a' : '#ffd23a', dk = boss ? '#5a0a08' : '#6a3a08';
    ctx.save(); ctx.shadowColor = boss ? 'rgba(255,80,40,.9)' : 'rgba(255,214,90,.95)'; ctx.shadowBlur = 12;
    ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, y - h - 2); ctx.lineTo(x + w / 2 + 2, y - h - 2); ctx.lineTo(x + w * 0.28 + 1.5, y - h * 0.28 + 1.5); ctx.lineTo(x - w * 0.28 - 1.5, y - h * 0.28 + 1.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - h * 0.08, w * 0.36 + 2, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; const g = ctx.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#fff8c0'); g.addColorStop(0.5, col); g.addColorStop(1, boss ? '#b8201a' : '#d88a10');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y - h); ctx.lineTo(x + w * 0.28, y - h * 0.28); ctx.lineTo(x - w * 0.28, y - h * 0.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - h * 0.08, w * 0.36, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x - w * 0.32, y - h + 2, w * 0.16, h * 0.4);
    ctx.restore();
  }
  function frameHD(now) {
    const k = 1 / T, th = TH[M.theme];
    const h = Prefs.hour();
    const night = h >= 19 || h < 5, dusk = (h >= 17 && h < 19) || (h >= 5 && h < 6.5);
    const sprites = [], glows = [];
    // thế giới 3D thật (địa hình, nhà, cây, núi, nước) — dựng 1 lần mỗi bản đồ
    let w3 = false;
    if (typeof World3D !== 'undefined') {
      const key = M.name + '|' + M.theme;
      if (!Hd2d.hasWorld(key)) { try { if (!worldCache.has(key)) worldCache.set(key, World3D.build(M)); Hd2d.setWorld(worldCache.get(key)); } catch (e) { console.warn('[3D]', e); worldCache.set(key, null); Hd2d.setWorld(null); } }
      w3 = Hd2d.hasWorld(key);
    }
    if (!w3) for (const o of objs) sprites.push({ c: o.c, x: (o.x + o.w / 2) * k, z: (o.y + o.h) * k - 0.14, w: o.w * k, h: o.h * k, tilt: 0.42 });
    const npcPos = [];
    for (const n of M.npcs) {
      const bob = Math.sin(now / 700 + n.x * 2) * 0.03;
      const src = (n.art && Sprites.npcSrc(n.art)) || Sprites.npcSrc(n.id) || Sprites.art('bosses', n.id);
      let c = null, hgt = 1.3, wid = 1;
      if (src) { const im = imgCache[src] || (imgCache[src] = Object.assign(new Image(), { src })); if (im.complete && im.naturalWidth) { c = im; hgt = 1.3 * (n.boss ? 1.1 : 0.92) * 1.3; wid = hgt * im.naturalWidth / im.naturalHeight; } }
      else { const pix = Art.npc(n.look || n.id, 0, 4, undefined, n.art); if (pix) { c = pix.cv; const hum = pix.cv.width / pix.cv.height < 0.9; hgt = hum ? (n.boss ? 2.35 : 2.0) : 1.3; wid = hgt * pix.cv.width / pix.cv.height; } }
      if (c) sprites.push({ c, x: n.x + 0.5, y: Math.max(0, bob), z: n.y + 0.9, w: wid, h: hgt });
      const pulse = 0.6 + 0.4 * Math.sin(now / 500 + n.x);
      glows.push({ x: n.x + 0.5, y: 0.08, z: n.y + 0.95, w: 0.55, h: 0.16, col: n.boss ? [1, 0.3, 0.2, 0.35 * pulse] : n.role ? [1, 0.82, 0.45, 0.3 * pulse] : [1, 1, 1, 0.12 * pulse] });
      npcPos.push([n, hgt]);
    }
    const heroes = [];
    const addHero = (race, gender, px, py, name, self, moving, face, mount, gear) => {
      const fr = moving ? 1 + (Math.floor(now / 140) % 2) : 0;
      const blink = !moving && Math.floor((now + px * 977) / 130) % 32 === 0;
      const im = Sprites.heroImg(race, gender, fr, gear, blink ? 'blink' : undefined);
      const hh = 2.0;
      const lift = mount ? 0.32 : 0;
      if (mount && Art.mount) { const mc = Art.mount(mount); if (mc) sprites.push({ c: mc.cv, x: px + 0.5, y: Math.sin(now / 260) * 0.04, z: py + 0.93, w: 1.3 * mc.cv.width / mc.cv.height, h: 1.3 * 0.62, flip: face < 0 }); }
      sprites.push({ c: im, x: px + 0.5, y: lift + (mount ? Math.sin(now / 260) * 0.04 : 0), z: py + 0.92, w: hh * im.width / im.height, h: hh, flip: face < 0 });
      if (self) glows.push({ x: px + 0.5, y: 0.06, z: py + 0.96, w: 0.5, h: 0.14, col: [1, 0.85, 0.5, 0.4] });
      heroes.push([name, px, py, self, hh + lift]);
    };
    for (const o of others.values()) addHero(o.race, o.gender, o.px, o.py, o.name, false, o.moving, o.face || 1, o.gear && o.gear.mount, o.gear);
    addHero(me.race, me.gender, me.px, me.py, me.name, true, !!me.to, me.face, G.me && G.me.gear && G.me.gear.mount, G.me && G.me.gear);
    trackTrail();
    for (const fo of followers()) {
      const f = fo.f, art = f.art && Art.npc(f.art, 0, 4, undefined, f.art), bob = fo.moving ? Math.abs(Math.sin(now / 130)) * 0.06 : 0;
      if (art && art.art) { sprites.push({ c: art.cv, x: fo.px + 0.5, y: bob, z: fo.py + 0.9, w: 2.3 * art.cv.width / art.cv.height, h: 2.3, flip: fo.face < 0 }); continue; }
      let lift = 0;
      if (f.horse && Art.mount) { const mc = Art.mount('bachma'); if (mc) { sprites.push({ c: mc.cv, x: fo.px + 0.5, y: bob * 0.5, z: fo.py + 0.91, w: 1.25 * mc.cv.width / mc.cv.height, h: 1.25 }); lift = 0.55; } }
      const pix = Art.npc(f.look, fo.moving ? 1 + (Math.floor(now / 140) % 2) : 0);
      if (pix) { const hum = pix.cv.width / pix.cv.height < 0.9, h = hum ? 1.85 : 1.25; sprites.push({ c: pix.cv, x: fo.px + 0.5, y: lift + bob, z: fo.py + 0.9, w: h * pix.cv.width / pix.cv.height, h, flip: fo.face < 0 }); }
    }
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) { const p = 0.75 + 0.25 * Math.sin(now / 300); glows.push({ x: x + 0.5, y: 0.7, z: y + 0.6, w: 0.55 * p, h: 0.85 * p, col: [1, 0.85, 0.45, 0.9] }); glows.push({ x: x + 0.5, y: 0.7, z: y + 0.62, w: 0.25, h: 0.45, col: [1, 1, 0.9, 0.9] }); } });
    const lit = night || dusk || th.dark;
    if (lit) for (const [x, y, r] of lights) glows.push({ x: x * k, y: 0.75, z: y * k - 0.1, w: 0.28, h: 0.32, col: [1, 0.6, 0.25, night || th.dark ? 0.9 : 0.4] });
    const fi = Math.floor(now / 420) % groundFrames.length;
    Hd2d.render({
      theme: M.theme, ground: groundFrames[fi], mapW: COLS, mapH: ROWS, focusX: me.px + 0.5, focusZ: me.py + 0.5, sprites, glows,
      night, dusk, dark: !!th.dark, lights: lights.map(([x, y, r]) => [x * k, y * k, r * k * 1.3, 1]), blur: FX.low ? 0 : 1.8,
      time: now / 1000, low: FX.low, fade: [me.px + 0.5, me.py + 0.92],
    });
    // lớp 2D: nhãn tên, dấu nhiệm vụ, điểm đến, hạt môi trường
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (marker && now - marker.t < 800) {
      const p = Hd2d.project(marker.x + 0.5, 0, marker.y + 0.7);
      if (p) { const kk = (now - marker.t) / 800; ctx.strokeStyle = `rgba(243,210,122,${1 - kk})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + kk * 14, 3 + kk * 6, 0, 0, 7); ctx.stroke(); }
    }
    for (const [n, hgt] of npcPos) {
      const p = Hd2d.project(n.x + 0.5, 0, n.y + 1.05); if (!p) continue;
      label(n.name, p.x, p.y, nameCol(n), 'rgba(15,9,6,.75)', true);
      if (questNpc === n.id) {
        const tt = 0.6, hh2 = hgt + 0.3 + Math.sin(now / 220) * 0.06; const q = Hd2d.project(n.x + 0.5, hh2 * Math.cos(tt), n.y + 0.9 - hh2 * Math.sin(tt)); if (!q) continue;
        bang(q.x, q.y, T * 0.5, n.boss);
      }
    }
    for (const [name, px, py, self, hh] of heroes) {
      const p = Hd2d.project(px + 0.5, (hh + 0.06) * Math.cos(0.6), py + 0.92 - (hh + 0.06) * Math.sin(0.6)); if (!p) continue;
      label(name, p.x, p.y, self ? '#ffffff' : '#bfe6d6', self ? 'rgba(168,50,42,.88)' : 'rgba(15,9,6,.72)');
    }
    drawAmb(now, night);
  }

  function drawWater(now) {
    const th = TH[M.theme];
    ctx.save();
    for (const [x, y] of waterTiles) {
      const X = x * T, Y = y * T;
      if (th.lava) {
        const p = 0.5 + 0.5 * Math.sin(now / 600 + x * 0.7 + y);
        ctx.fillStyle = `rgba(255,${180 + p * 60},80,${0.18 + p * 0.22})`; ctx.fillRect(X, Y, T, T);
        if (hash(x, y) > 0.5) { ctx.fillStyle = 'rgba(255,240,160,.7)'; ctx.beginPath(); ctx.arc(X + T * hash(y, x), Y + T * (0.5 + 0.3 * Math.sin(now / 900 + x)), T * 0.05 * (1 + p), 0, 7); ctx.fill(); }
      } else if (th.ice) {
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X + T * hash(x, y) * 0.6, Y + T * 0.3); ctx.lineTo(X + T * (0.3 + hash(y, x) * 0.6), Y + T * 0.7); ctx.stroke();
      } else if (M.theme === 'heaven') {
        for (let k = 0; k < 2; k++) { const tw = 0.5 + 0.5 * Math.sin(now / 400 + hash(x + k, y) * 30); ctx.fillStyle = `rgba(255,255,255,${tw})`; ctx.fillRect(X + T * hash(x + k, y * 3), Y + T * hash(y + k, x), 1.6, 1.6); }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.2;
        const o = ((now / 1400 + hash(x, y)) % 1) * T;
        ctx.beginPath(); ctx.moveTo(X + T * 0.1, Y + o); ctx.quadraticCurveTo(X + T * 0.35, Y + o - T * 0.08, X + T * 0.6, Y + o); ctx.stroke();
        if (th === TH.forest && y <= 4) { ctx.strokeStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 2; k++) { const yy = Y + ((now / 300 + k * 0.5 + hash(x, k)) % 1) * T; ctx.beginPath(); ctx.moveTo(X + T * (0.25 + k * 0.4), yy); ctx.lineTo(X + T * (0.25 + k * 0.4), yy + T * 0.3); ctx.stroke(); } }
      }
    }
    ctx.restore();
  }

  function lighting(now) {
    const h = Prefs.hour();
    const night = h >= 19 || h < 5 || !!TH[M.theme].dark, dusk = (h >= 17 && h < 19) || (h >= 5 && h < 6.5);
    if (night || dusk) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = TH[M.theme].dark && !(h >= 19 || h < 5) ? 'rgb(150,150,200)' : night ? 'rgb(95,110,170)' : 'rgb(255,222,198)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(-viewX, -viewY);
      for (const [x, y, r, col] of lights) {
        const fl = 0.85 + Math.sin(now / 180 + x) * 0.05;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r * fl);
        gr.addColorStop(0, `rgba(${col || '255,170,80'},${night ? 0.4 : 0.15})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * fl, 0, 7); ctx.fill();
      }
      if (night) { const px = (me.px + 0.5) * T, py = (me.py + 0.5) * T; const gr = ctx.createRadialGradient(px, py, 0, px, py, T * 1.6); gr.addColorStop(0, 'rgba(255,230,190,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, T * 1.6, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    if (M.theme === 'sea') { // ánh sáng đáy biển lung linh
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(20,90,160,.55)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) { const x = ((i * 97 + now / 40) % (W + 200)) - 100, w = 30 + (i % 3) * 18; const gr = ctx.createLinearGradient(x, 0, x + w, H); gr.addColorStop(0, 'rgba(180,240,255,.16)'); gr.addColorStop(1, 'rgba(180,240,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w * 2.4, H); ctx.lineTo(x + w * 1.2, H); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    if (M.theme === 'hell') { ctx.save(); const gr = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, H); gr.addColorStop(0, 'rgba(255,40,30,.14)'); gr.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (livingNow) Living.screen(ctx, mapId, W, H, now, night); else drawAmb(now, night);
    drawWeather(now);
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, PAINT ? 'rgba(10,20,10,.22)' : 'rgba(0,0,0,.45)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  // ---------- thời tiết: mưa theo khung giờ (mọi người cùng thấy) ----------
  let rain = [];
  function weatherNow() {
    if (!M || !['forest', 'river', 'city', 'sea'].includes(M.theme)) return null;
    const blk = Math.floor(Date.now() / (25 * 60e3)); let h = 7; for (const ch of mapId + blk) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return (h % 100) < 28 ? (M.theme === 'sea' ? 'current' : 'rain') : null;
  }
  function drawWeather(now) {
    const w = weatherNow();
    if (!w) { rain = []; return; }
    const n = FX.low ? 40 : 110;
    while (rain.length < n) rain.push({ x: Math.random() * (W + 80), y: Math.random() * H, v: 7 + Math.random() * 6, l: 8 + Math.random() * 10 });
    ctx.save();
    if (w === 'rain') { ctx.fillStyle = 'rgba(40,60,90,.16)'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(210,225,255,.55)'; ctx.lineWidth = 1; }
    else { ctx.strokeStyle = 'rgba(220,255,255,.18)'; ctx.lineWidth = 2; }
    ctx.beginPath();
    for (const d of rain) {
      if (w === 'rain') { d.x -= d.v * 0.25; d.y += d.v; ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.25, d.y - d.l); }
      else { d.x += d.v * 0.35; d.y += Math.sin(now / 600 + d.l) * 0.4; ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x - d.l, d.y - 3, d.x - d.l * 2.4, d.y); }
      if (d.y > H + 20 || d.x < -40 || d.x > W + 60) { d.y = w === 'rain' ? -10 : Math.random() * H; d.x = w === 'rain' ? Math.random() * (W + 80) : -30; }
    }
    ctx.stroke(); ctx.restore();
  }

  // ---------- điểm khai thác ----------
  const nodeCd = {};
  function drawNode(n, now) {
    const cx = (n.x + 0.5) * T, by = (n.y + 0.92) * T, ready = !(nodeCd[n.id] > Date.now());
    const k = T / 40;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, by, T * 0.38, T * 0.12, 0, 0, 7); ctx.fill();
    if (ready) { const pu = 0.5 + 0.5 * Math.sin(now / 400 + n.x); const gr = ctx.createRadialGradient(cx, by - T * 0.3, 0, cx, by - T * 0.3, T * 0.7); gr.addColorStop(0, `rgba(255,240,170,${0.25 + pu * 0.25})`); gr.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, by - T * 0.3, T * 0.7, 0, 7); ctx.fill(); }
    ctx.globalAlpha = ready ? 1 : 0.45;
    { // tranh vẽ tay (objects/khoang, thao, tuyen) nếu có
      const src = Sprites.art('objects', ['khoang', 'thao'].includes(n.type) ? n.type : 'tuyen');
      const im = src && (imgCache[src] || (imgCache[src] = Object.assign(new Image(), { src })));
      if (im && im.complete && im.naturalWidth) { const w = T * 1.35, h = (w * im.naturalHeight) / im.naturalWidth; ctx.drawImage(im, cx - w / 2, by - h * 0.88, w, h); ctx.restore(); return; }
    }
    ctx.translate(cx, by); ctx.scale(k, k); ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = '#2a1e14';
    if (n.type === 'khoang') { // tảng đá có vân quặng
      ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-13, -14); ctx.lineTo(-3, -22); ctx.lineTo(9, -19); ctx.lineTo(16, -6); ctx.lineTo(13, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b8b0a2'; ctx.beginPath(); ctx.moveTo(-12, -13); ctx.lineTo(-3, -20); ctx.lineTo(6, -17); ctx.lineTo(-4, -11); ctx.closePath(); ctx.fill();
      for (const [x, y] of [[-6, -9], [4, -12], [9, -5], [-10, -4]]) { ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 2.5, y); ctx.lineTo(x, y + 3); ctx.lineTo(x - 2.5, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a5a10'; ctx.lineWidth = 0.8; ctx.stroke(); }
      ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(20, -20); ctx.stroke(); ctx.fillStyle = '#a8b0b8'; ctx.beginPath(); ctx.moveTo(14, -24); ctx.quadraticCurveTo(22, -24, 27, -17); ctx.lineTo(23, -18); ctx.quadraticCurveTo(20, -21, 15, -20); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2a1e14'; ctx.lineWidth = 1; ctx.stroke();
    } else if (n.type === 'thao') { // khóm linh thảo phát sáng
      for (let i = -2; i <= 2; i++) { ctx.strokeStyle = '#2a6a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.quadraticCurveTo(i * 6, -10, i * 8, -18 + Math.abs(i) * 3); ctx.stroke(); ctx.fillStyle = '#5ac85a'; ctx.beginPath(); ctx.ellipse(i * 8, -18 + Math.abs(i) * 3, 3.5, 6, i * 0.4, 0, 7); ctx.fill(); }
      const tw = 0.6 + 0.4 * Math.sin(now / 300 + n.y); ctx.fillStyle = `rgba(255,250,200,${tw})`; ctx.shadowColor = '#fff7a0'; ctx.shadowBlur = 8; for (const [x, y] of [[0, -24], [-9, -17], [9, -18]]) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); }
    } else { // linh tuyền: vũng nước + đá
      ctx.fillStyle = '#7a8a8a'; ctx.beginPath(); ctx.ellipse(0, -3, 18, 8, 0, 0, 7); ctx.fill(); ctx.stroke();
      const lg = ctx.createRadialGradient(-4, -5, 1, 0, -3, 15); lg.addColorStop(0, '#d8fbff'); lg.addColorStop(1, '#2a9ad8'); ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(0, -4, 14, 5.5, 0, 0, 7); ctx.fill();
      const o = (now / 900 + n.x) % 1; ctx.strokeStyle = `rgba(255,255,255,${1 - o})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -4, 4 + o * 9, 1.5 + o * 3.5, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(200,255,255,.8)'; for (let i = 0; i < 3; i++) { const yy = -8 - ((now / 500 + i * 0.33) % 1) * 18; ctx.beginPath(); ctx.arc(-4 + i * 4, yy, 1.4, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  function nodeAt(x, y) { return M && (M.nodes || []).find((n) => n.x === x && n.y === y); }
  function setNodeCd(cd) { const now = Date.now(); for (const [k, v] of Object.entries(cd || {})) nodeCd[k] = v > 0 ? now + v : 0; }

  function drawPortal(x, y, now) {
    const cx = (x + 0.5) * T, cy = (y + 0.55) * T;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(243,210,122,${0.8 - i * 0.22})`; ctx.lineWidth = 2.4 - i * 0.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, T * (0.24 + i * 0.07), T * (0.4 + i * 0.05), 0, now / 500 + i, now / 500 + i + 4.6); ctx.stroke();
    }
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.4);
    gr.addColorStop(0, 'rgba(255,250,220,.95)'); gr.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, cy, T * 0.3, T * 0.45, 0, 0, 7); ctx.fill();
    ctx.restore();
  }

  function label(text, cx, y, color, bg = 'rgba(15,9,6,.72)', below = false) {
    ctx.font = `600 ${Math.max(9, Math.min(13, T * 0.22))}px "Lora VN", Georgia, serif`;
    const max = T * 2.7;
    let t = text;
    while (ctx.measureText(t).width > max && t.length > 3) t = t.slice(0, -2);
    if (t !== text) t = t.trimEnd() + '…';
    const w = ctx.measureText(t).width + 9, h = Math.max(12, Math.min(18, T * 0.3));
    const top = below ? y : y - h;
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - w / 2, top, w, h, h / 2) : ctx.rect(cx - w / 2, top, w, h); ctx.fill();
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t, cx, top + h / 2 + 0.5);
  }

  const npcImgs = {};
  function drawNpc(n, now) {
    const cx = (n.x + 0.5) * T, by = (n.y + 1) * T;
    // vầng sáng dưới chân
    const col = n.boss ? '255,80,60' : n.role ? '243,210,122' : '255,255,255';
    const pulse = 0.6 + 0.4 * Math.sin(now / 500 + n.x);
    const gr = ctx.createRadialGradient(cx, by - T * 0.15, 0, cx, by - T * 0.15, T * 0.6);
    gr.addColorStop(0, `rgba(${col},${0.35 * pulse})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, by - T * 0.15, T * 0.6, T * 0.25, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(cx, by - T * 0.1, T * 0.3, T * 0.09, 0, 0, 7); ctx.fill();
    const sz = T * (n.boss ? 1.1 : 0.92);
    const bob = Math.sin(now / 700 + n.x * 2) * T * 0.03;
    const src = PAINT ? null : Sprites.npcSrc(n.id);
    const pix = !src && Art.npc(n.look || n.id, 0, 4, undefined, n.art);
    if (pix) {
      const hum = pix.cv.width / pix.cv.height < 0.9;
      const hgt = T * (hum ? (n.boss ? 2.35 : 2.0) : 1.3), wid = hgt * pix.cv.width / pix.cv.height;
      ctx.imageSmoothingEnabled = PAINT; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(pix.cv, cx - wid / 2, by - hgt + T * 0.06 + bob, wid, hgt);
      ctx.imageSmoothingEnabled = true;
    } else if (src) {
      if (!npcImgs[n.id]) { npcImgs[n.id] = new Image(); npcImgs[n.id].src = src; }
      const im = npcImgs[n.id];
      if (im.complete && im.naturalWidth) { const hgt = sz * 1.3, wid = hgt * im.naturalWidth / im.naturalHeight; ctx.drawImage(im, cx - wid / 2, by - hgt - T * 0.08 + bob, wid, hgt); }
    } else {
      ctx.font = `${sz}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#000';
      ctx.fillText(n.icon, cx, by - T * 0.14 + bob);
    }
    overlay.push(() => label(n.name, cx, by - T * 0.04, nameCol(n), 'rgba(15,9,6,.75)', true));
    if (questNpc === n.id) overlay.push(() => bang(cx, by - sz - T * 0.3 + Math.sin(now / 220) * T * 0.08, T * 0.5, n.boss));
  }

  function drawHero(race, gender, px, py, name, self, now, moving, face, gear, info) {
    const cx = (px + 0.5) * T, by = (py + 1) * T;
    const fr = moving ? 1 + (Math.floor(now / 140) % 2) : 0;
    const blink = !moving && Math.floor((now + px * 977) / 130) % 32 === 0;
    const im = Sprites.heroImg(race, gender, fr, gear, blink ? 'blink' : undefined);
    const h = T * (PAINT ? 1.85 : 2.0), w = h * (im.width / im.height || 0.51);
    if (self) { // vòng sáng dưới chân
      ctx.strokeStyle = 'rgba(243,210,122,.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(cx, by - T * 0.1, T * 0.36, T * 0.12, 0, 0, 7); ctx.stroke();
    }
    if (im.width) {
      ctx.save(); ctx.imageSmoothingEnabled = PAINT; ctx.imageSmoothingQuality = 'high'; ctx.translate(cx, 0); ctx.scale(face < 0 ? -1 : 1, 1);
      ctx.drawImage(im, -w / 2, by - h + T * 0.06, w, h); ctx.restore();
    }
    const ttl = info && info.title, stall = info && (self ? info.stall && info.stall.title : info.stall);
    overlay.push(() => {
      label(name, cx, by - h + T * 0.12, self ? '#ffffff' : '#bfe6d6', self ? 'rgba(168,50,42,.88)' : 'rgba(15,9,6,.72)');
      if (ttl) label('〈' + ttl.name + '〉', cx, by - h - T * 0.26, ttl.color || '#ffd65a', 'rgba(20,10,30,.72)');
      if (stall) stallBanner(stall, cx, by - h - T * (ttl ? 0.7 : 0.32), now);
    });
  }
  function stallBanner(text, cx, y, now) {
    ctx.save();
    ctx.font = `700 ${Math.max(9, T * 0.27)}px "Lora VN", Georgia, serif`;
    const t = text.length > 14 ? text.slice(0, 13) + '…' : text, w = ctx.measureText(t).width + T * 0.7, h = T * 0.42, sw = Math.sin(now / 700) * 1.2;
    ctx.translate(cx, y); ctx.rotate(sw * 0.01);
    ctx.fillStyle = '#c8302a'; ctx.strokeStyle = '#ffd65a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-w / 2, -h, w, h, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd65a'; ctx.beginPath(); ctx.arc(-w / 2 + T * 0.18, -h / 2, T * 0.08, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff6d8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, T * 0.08, -h / 2 + 0.5);
    ctx.restore();
  }

  // ---------- chạm ----------
  cv.addEventListener('pointerdown', (e) => {
    if (!M) return;
    const r = cv.getBoundingClientRect();
    let x = Math.floor((e.clientX - r.left + viewX) / T);
    let y = Math.floor((e.clientY - r.top + viewY) / T);
    if (hdOn()) { const p = Hd2d.pick(e.clientX - r.left, e.clientY - r.top); if (!p) return; x = Math.floor(p.x); y = Math.floor(p.z); }
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    marker = { x, y, t: performance.now() };
    onTapTile && onTapTile(x, y);
  });

  // ---------- tìm đường ----------
  // toạ độ màn hình (px) của tâm ô – dùng cho hướng dẫn tân thủ
  function screenOf(x, y) { const r = cv.getBoundingClientRect(); if (hdOn()) { const p = Hd2d.project(x + 0.5, 0.9, y + 0.9); if (p) return { x: r.left + p.x, y: r.top + p.y }; } return { x: r.left + (x + 0.5) * T - viewX, y: r.top + (y + 0.25) * T - viewY }; }
  function walkable(x, y) {
    const ch = M.tiles[y] && M.tiles[y][x];
    if (!ch) return false;
    const h = new Date().getHours();
    if (ch === 'W') { if (!(h >= 17 && h < 19)) return false; }
    else if (!'.,P'.includes(ch)) return false;
    return !M.npcs.some((n) => n.x === x && n.y === y);
  }
  function path(from, goal) {
    const key = (x, y) => x + ',' + y;
    const prev = new Map([[key(...from), null]]);
    const q = [from];
    while (q.length) {
      const [x, y] = q.shift();
      if (goal(x, y) && !(x === from[0] && y === from[1])) {
        const out = []; let k = key(x, y);
        while (k && k !== key(...from)) { out.unshift(k.split(',').map(Number)); k = prev.get(k); }
        return out;
      }
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (!prev.has(k) && walkable(nx, ny)) { prev.set(k, key(x, y)); q.push([nx, ny]); }
      }
    }
    return null;
  }

  function animateTo(x, y, ms) {
    return new Promise((res) => {
      if (x !== me.x) me.face = x > me.x ? 1 : -1;
      me.from = [me.px, me.py]; me.to = [x, y]; me.t0 = performance.now(); me.dur = ms; me.done = res;
      me.x = x; me.y = y;
    });
  }

  function setPlayers(list) { others.clear(); list.forEach(addPlayer); }
  function addPlayer(p) { others.set(p.id, { ...p, px: p.x, py: p.y, face: 1 }); }
  function movePlayer({ id, x, y }) { const o = others.get(id); if (o) { o.x = x; o.y = y; } }
  function removePlayer(id) { others.delete(id); }
  function setPlayerGear(id, gear) { const o = others.get(id); if (o) o.gear = gear; }
  function setPlayerInfo(id, k, v) { const o = others.get(id); if (o) o[k] = v; }
  function playerAt(x, y) { for (const o of others.values()) if (o.x === x && o.y === y) return o; return null; }

  window.addEventListener('resize', () => setTimeout(resize, 60));
  requestAnimationFrame(frame);

  return {
    setMap, setMe, snap, resize, path, walkable, animateTo, setPlayers, addPlayer, movePlayer, removePlayer, initAmb, screenOf, setHD, setPlayerGear, setPlayerInfo, playerAt, nodeAt, setNodeCd, weatherNow, get hd() { return hdOn(); }, get hdSupported() { return hdOK; },
    me, set onTap(fn) { onTapTile = fn; }, set questNpc(id) { questNpc = id; }, get questNpc() { return questNpc; }, get id() { return mapId; }, get meta() { return M; },
  };
})();
