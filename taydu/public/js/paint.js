// =====================================================================
//  BẢN ĐỒ KIỂU TRANH VẼ: dựng nền như tranh vẽ tay từ ô bản đồ —
//  cỏ nét cọ, đường đất/đá lát bờ mềm, ao hồ có bọt bờ, vách núi, mây,
//  nhà mái cong / chòi tranh, cây tán (liễu, thông, đào, nấm), đá, cổng.
//  Vật cao (nhà, cây, đá, cổng…) là lớp riêng để nhân vật đi trước/sau.
// =====================================================================
const PaintMap = (() => {
  const COLS = 12, ROWS = 20;
  const hi = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const sm = (t) => t * t * (3 - 2 * t);
  const s01 = (t) => sm(Math.max(0, Math.min(1, t)));
  function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = hi(xi, yi), b = hi(xi + 1, yi), c = hi(xi, yi + 1), d = hi(xi + 1, yi + 1); const u = sm(xf), v = sm(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  const fbm = (x, y) => vn(x, y) * 0.55 + vn(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + vn(x * 4.3 + 1, y * 4.3 + 9) * 0.15;
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  const sh = (c, k) => (typeof Chibi !== 'undefined' ? Chibi.sh(c, k) : c);

  // ---------- bảng màu tranh theo vùng ----------
  const PAL = {
    city: { g: [96, 42, 52], g2: [100, 38, 38], path: 'paved', pathC: ['#e2d6bc', '#c4b494', '#8a7a62'], grassZ: [104, 48, 40], water: ['#6ab8e0', '#2a6a9a'], shore: '#d8c8a0', cliff: ['#a8a090', '#6a6458'], border: 'wall', tree: 'willow', roof: ['#5e7290', '#3d4a5c'], wall: '#f2e6cc', col: '#b8342a', flowers: true },
    forest: { g: [98, 44, 46], g2: [104, 42, 32], path: 'dirt', pathC: ['#dcbc80', '#c19a5c', '#8a6a3a'], grassZ: [112, 46, 34], water: ['#5ab0d0', '#1e5a7a'], shore: '#c8b07a', cliff: ['#9a9886', '#5e5c50'], border: 'woods', tree: 'mix', roof: ['#e8c070', '#a8782a'], thatch: true, wall: '#b08a5a', col: '#6a4422', flowers: true },
    river: { g: [92, 44, 54], g2: [98, 40, 40], path: 'sand', pathC: ['#ecd8a4', '#d4b980', '#9a8058'], grassZ: [100, 46, 40], water: ['#62c0d8', '#1a5a78'], shore: '#e4d4a4', cliff: ['#a0a89c', '#5e6a62'], border: 'woods', tree: 'willow', roof: ['#9a7650', '#5a4430'], wall: '#e0caa0', col: '#7a4424', flowers: true },
    heaven: { g: [270, 50, 95], g2: [280, 40, 90], path: 'jade', pathC: ['#fdfbff', '#e6dcf4', '#c8b4e2'], grassZ: [270, 40, 86], water: ['#7a8ae8', '#202a78'], shore: '#ffffff', cliff: ['#ffffff', '#d8d0ee'], border: 'cloud', tree: 'blossom', roof: ['#ffd870', '#c89a30'], wall: '#c8302a', col: '#8a1f1a', gold: true },
    cave: { g: [262, 16, 30], g2: [262, 18, 24], path: 'dirt', pathC: ['#7a6e8c', '#5e526e', '#3a3048'], grassZ: [170, 34, 30], water: ['#3a5aa8', '#101a40'], shore: '#8a7aa8', cliff: ['#5a4e6e', '#2e2640'], border: 'rock', tree: 'shroom', roof: ['#7a6a8a', '#4a3a5a'], wall: '#6a5a6a', col: '#3a2a3a', glow: true },
    snow: { g: [210, 40, 94], g2: [210, 30, 88], path: 'snow', pathC: ['#dfe8f2', '#c4d2e2', '#8aa0b8'], grassZ: [200, 24, 80], water: ['#cfeaf8', '#7ab0d8'], shore: '#ffffff', cliff: ['#d8e2ee', '#8a9aac'], border: 'rock', tree: 'pine', roof: ['#ffffff', '#c8d6e6'], wall: '#8a5a3a', col: '#5a3020', snowy: true },
    desert: { g: [36, 58, 66], g2: [32, 52, 56], path: 'crack', pathC: ['#e8c48c', '#c89a62', '#8a5a34'], grassZ: [44, 46, 50], water: ['#ffb040', '#a8200a'], shore: '#6a2a14', cliff: ['#c0704a', '#7a3a1e'], border: 'rock', tree: 'dead', roof: ['#d8885a', '#9a5434'], wall: '#e4b888', col: '#8a4a2a', lava: true },
    // Đông Hải Long Cung: đáy biển ngọc bích, san hô, cung điện mái lưu ly
    sea: { g: [176, 46, 58], g2: [196, 52, 40], path: 'jade', jade: [182, 34, 66], pathC: ['#bfeae4', '#8ad0c8', '#4a9a98'], grassZ: [160, 50, 44], water: ['#2a8ad8', '#0a2a6a'], shore: '#f2e8c8', cliff: ['#5ab0b0', '#1e5a6a'], border: 'rock', tree: 'coral', roof: ['#5ad8e8', '#1a7a9a'], wall: '#f0f8f4', col: '#1a6a8a', gold: true, sea: true },
    // U Minh Địa Phủ: đất đen, hoa Bỉ Ngạn đỏ, sông Huyết Hà
    hell: { g: [350, 22, 18], g2: [330, 26, 12], path: 'crack', pathC: ['#5a4a52', '#3e3038', '#1e1418'], grassZ: [355, 60, 26], water: ['#c81a2a', '#3a0408'], shore: '#2a1418', cliff: ['#4a3a44', '#1a1018'], border: 'rock', tree: 'crimson', roof: ['#3a2a34', '#1a1018'], wall: '#5a4a50', col: '#8a1a1a', glow: true, hell: true },
    // Hỗn Độn Hư Không: nền tím thẫm, đá trôi, pha lê phát sáng
    void: { g: [262, 30, 16], g2: [280, 34, 10], path: 'jade', jade: [270, 30, 30], pathC: ['#4a3a6e', '#2e2448', '#140e24'], grassZ: [286, 50, 24], water: ['#6a2ae8', '#0a0420'], shore: '#c8b0ff', cliff: ['#3a2e5a', '#120a24'], border: 'rock', tree: 'crystal', roof: ['#5a3a8a', '#2a1a4a'], wall: '#3a2e5a', col: '#8a4ae8', glow: true, voidy: true },
  };

  function cvs(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

  // mặt nạ vùng (bờ mềm, méo tự nhiên)
  function mask(M, test, T, R, thr = 0.5, soft = 0.12, wob = 0.28) {
    const rs = 12, w = COLS * rs, h = ROWS * rs, c = cvs(w, h), g = c.getContext('2d'), img = g.createImageData(w, h);
    const cls = (x, y) => { x = Math.max(0, Math.min(COLS - 1, x)); y = Math.max(0, Math.min(ROWS - 1, y)); return test(M.tiles[y][x], x, y) ? 1 : 0; };
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const wx = (px + 0.5) / rs, wy = (py + 0.5) / rs;
      const fx = wx - 0.5 + (fbm(wx * 1.3, wy * 1.3) - 0.5) * wob, fy = wy - 0.5 + (fbm(wx * 1.3 + 9, wy * 1.3 + 4) - 0.5) * wob;
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = s01(fx - x0), ty = s01(fy - y0);
      const v = cls(x0, y0) * (1 - tx) * (1 - ty) + cls(x0 + 1, y0) * tx * (1 - ty) + cls(x0, y0 + 1) * (1 - tx) * ty + cls(x0 + 1, y0 + 1) * tx * ty;
      const a = s01((v - thr) / soft + 0.5);
      const o = (py * w + px) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = a * 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  // tô một lớp qua mặt nạ
  function through(G, m, W, H, paintFn) {
    const L = cvs(W, H), g = L.getContext('2d'); paintFn(g);
    g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true; g.drawImage(m, 0, 0, W, H);
    G.drawImage(L, 0, 0);
  }

  // ---------- nét cọ ----------
  function grassStrokes(g, W, H, n, base, r) {
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * H, a = -1.25 + r() * 0.6, len = (3 + r() * 6) * base;
      g.strokeStyle = hsl(base.h + r() * 26 - 10, base.s + r() * 18 - 6, base.l + r() * 28 - 14, 0.2 + r() * 0.22);
      g.lineWidth = (0.6 + r() * 1.3) * base.k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 2 * base.k, y - 3 * base.k, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
  }
  function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  // ---------- vật thể ----------
  function shadowEll(g, x, y, rx, ry, a = 0.32) { const rg = g.createRadialGradient(x, y, 0, x, y, rx); rg.addColorStop(0, `rgba(10,30,10,${a})`); rg.addColorStop(1, 'rgba(10,30,10,0)'); g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill(); g.restore(); }
  function blobs(g, list, hue, sat, lit, r, outline = 0.8) {
    for (const [X, Y, R] of list) { const rg = g.createRadialGradient(X - R * 0.35, Y - R * 0.45, R * 0.1, X, Y, R); rg.addColorStop(0, hsl(hue - 8, sat + 10, lit + 22)); rg.addColorStop(0.6, hsl(hue, sat, lit)); rg.addColorStop(1, hsl(hue + 8, sat, lit - 16)); g.fillStyle = rg; g.strokeStyle = hsl(hue + 10, sat, lit - 26, outline); g.lineWidth = Math.max(1, R * 0.05); g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); g.stroke(); }
  }
  function leafSpecks(g, cx, cy, rad, n, hue, r, extra) {
    for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * rad; g.fillStyle = extra && r() < extra[1] ? extra[0] : hsl(hue - 18 + r() * 20, 60, 56 + r() * 22, 0.55); g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, rad * 0.06, rad * 0.032, r() * 3, 0, 7); g.fill(); }
  }
  // cây: vẽ quanh gốc (0,0), đơn vị u = 1 ô
  function tree(g, u, kind, P, r) {
    const trunk = (h, w = 0.12) => { const lg = g.createLinearGradient(-w * u, 0, w * u, 0); lg.addColorStop(0, '#9a6a42'); lg.addColorStop(1, '#4a2c18'); g.fillStyle = lg; g.strokeStyle = '#2e1c10'; g.lineWidth = u * 0.03; g.beginPath(); g.moveTo(-w * u, 0); g.quadraticCurveTo(-w * 0.6 * u, -h * u * 0.6, -w * 0.5 * u, -h * u); g.lineTo(w * 0.5 * u, -h * u); g.quadraticCurveTo(w * 0.6 * u, -h * u * 0.6, w * u, 0); g.closePath(); g.fill(); g.stroke(); };
    shadowEll(g, u * 0.15, 0, u * 0.75, u * 0.22, 0.38);
    if (kind === 'pine') {
      trunk(0.6, 0.1);
      for (let i = 0; i < 4; i++) {
        const y0 = -u * (0.45 + i * 0.42), w = u * (0.78 - i * 0.15), top = y0 - u * 0.75;
        const lg = g.createLinearGradient(-w, 0, w, 0); lg.addColorStop(0, '#3e7a5a'); lg.addColorStop(0.5, '#2a5a44'); lg.addColorStop(1, '#173a2c');
        g.fillStyle = lg; g.strokeStyle = '#0e2418'; g.lineWidth = u * 0.025; g.beginPath(); g.moveTo(-w, y0); g.quadraticCurveTo(-w * 0.3, y0 - u * 0.2, 0, top); g.quadraticCurveTo(w * 0.3, y0 - u * 0.2, w, y0); g.quadraticCurveTo(0, y0 + u * 0.12, -w, y0); g.fill(); g.stroke();
        if (P.snowy) { g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(-w * 0.6, y0 - u * 0.24); g.quadraticCurveTo(0, top + u * 0.1, w * 0.6, y0 - u * 0.24); g.quadraticCurveTo(0, y0 - u * 0.12, -w * 0.6, y0 - u * 0.24); g.fill(); }
      }
      return 2.4;
    }
    if (kind === 'willow') {
      trunk(1.1, 0.14);
      blobs(g, [[0, -u * 1.45, u * 0.62], [-u * 0.45, -u * 1.25, u * 0.42], [u * 0.45, -u * 1.28, u * 0.44], [0, -u * 1.85, u * 0.42]], 92, 46, 42, r);
      g.lineCap = 'round';
      for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * u * 1.5, y0 = -u * (1.2 + r() * 0.5), len = u * (0.5 + r() * 0.7); g.strokeStyle = hsl(86 + r() * 16, 50, 40 + r() * 20, 0.9); g.lineWidth = u * 0.05; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + u * 0.06, y0 + len * 0.5, x - u * 0.02, y0 + len); g.stroke(); }
      leafSpecks(g, 0, -u * 1.5, u * 0.7, 60, 90, r);
      return 2.5;
    }
    if (kind === 'shroom') {
      const lg = g.createLinearGradient(-u * 0.15, 0, u * 0.15, 0); lg.addColorStop(0, '#fff6e6'); lg.addColorStop(1, '#c8b49a'); g.fillStyle = lg; g.strokeStyle = '#3a2a2a'; g.lineWidth = u * 0.03; g.beginPath(); g.roundRect(-u * 0.16, -u * 1.1, u * 0.32, u * 1.1, u * 0.1); g.fill(); g.stroke();
      const rg = g.createRadialGradient(-u * 0.2, -u * 1.45, u * 0.1, 0, -u * 1.2, u * 0.8); rg.addColorStop(0, '#d8a0ff'); rg.addColorStop(0.6, '#8a4ac8'); rg.addColorStop(1, '#4a1a7a');
      g.fillStyle = rg; g.beginPath(); g.ellipse(0, -u * 1.15, u * 0.78, u * 0.5, 0, Math.PI, 0); g.quadraticCurveTo(0, -u * 0.95, -u * 0.78, -u * 1.15); g.fill(); g.stroke();
      for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(200,255,250,.95)'; g.shadowColor = '#7affe8'; g.shadowBlur = u * 0.15; g.beginPath(); g.arc((r() - 0.5) * u, -u * (1.3 + r() * 0.25), u * 0.06, 0, 7); g.fill(); }
      g.shadowBlur = 0; return 1.8;
    }
    if (kind === 'coral') { // san hô nhiều nhánh + rong biển
      const hue = [350, 20, 330, 12][Math.floor(r() * 4)];
      g.lineCap = 'round';
      const br = (x0, y0, a, len, w, d) => { const x1 = x0 + Math.sin(a) * len, y1 = y0 - Math.cos(a) * len; g.strokeStyle = hsl(hue, 70, 58 - d * 4); g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + len * 0.12, (y0 + y1) / 2, x1, y1); g.stroke(); if (d < 3) { br(x1, y1, a - 0.45 - r() * 0.2, len * 0.72, w * 0.7, d + 1); br(x1, y1, a + 0.4 + r() * 0.2, len * 0.7, w * 0.7, d + 1); } else { g.fillStyle = hsl(hue - 10, 80, 80); g.beginPath(); g.arc(x1, y1, w * 0.9, 0, 7); g.fill(); } };
      for (let k = 0; k < 3; k++) { const kx = (k - 1) * u * 0.35; g.strokeStyle = hsl(140, 45, 30 + k * 6, 0.85); g.lineWidth = u * 0.07; g.beginPath(); g.moveTo(kx, 0); for (let j = 1; j <= 6; j++) g.lineTo(kx + Math.sin(j * 1.3 + k) * u * 0.12, -j * u * 0.28); g.stroke(); }
      br(0, 0, 0, u * 0.6, u * 0.16, 0);
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(220,255,255,.7)'; g.beginPath(); g.arc((r() - 0.5) * u, -u * (0.6 + r() * 1.4), u * (0.03 + r() * 0.04), 0, 7); g.fill(); }
      return 2.2;
    }
    if (kind === 'crimson') { // cây khô U Minh + hoa Bỉ Ngạn
      g.strokeStyle = '#1a0e14'; g.lineCap = 'round';
      const br = (x0, y0, x1, y1, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 - u * 0.12, (y0 + y1) / 2, x1, y1); g.stroke(); };
      br(0, 0, -u * 0.05, -u * 1.4, u * 0.18); br(-u * 0.05, -u * 0.9, u * 0.62, -u * 1.55, u * 0.08); br(0, -u * 0.7, -u * 0.6, -u * 1.25, u * 0.08); br(-u * 0.05, -u * 1.4, u * 0.1, -u * 1.95, u * 0.06); br(u * 0.4, -u * 1.35, u * 0.75, -u * 1.25, u * 0.04);
      for (const [x, y] of [[u * 0.62, -u * 1.55], [-u * 0.6, -u * 1.25], [u * 0.1, -u * 1.95], [u * 0.75, -u * 1.25]]) { const rg = g.createRadialGradient(x, y, 0, x, y, u * 0.22); rg.addColorStop(0, 'rgba(255,90,60,.95)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, u * 0.22, 0, 7); g.fill(); }
      for (let i = 0; i < 7; i++) { const x = (r() - 0.5) * u * 1.2, y = -u * 0.05 * r(); g.strokeStyle = '#2a6a2a'; g.lineWidth = u * 0.02; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - u * 0.25); g.stroke(); g.strokeStyle = '#ff2a3a'; g.lineWidth = u * 0.018; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.5; g.beginPath(); g.moveTo(x, y - u * 0.25); g.quadraticCurveTo(x + Math.cos(a) * u * 0.1, y - u * 0.25 + Math.sin(a) * u * 0.12, x + Math.cos(a) * u * 0.14, y - u * 0.28 + Math.sin(a) * u * 0.05); g.stroke(); } }
      return 2.2;
    }
    if (kind === 'crystal') { // pha lê Hỗn Độn
      const cols = [['#e8d0ff', '#8a4ae8', '#3a1a7a'], ['#d0f8ff', '#4ab8e8', '#1a4a7a'], ['#ffd0f4', '#e84ab8', '#6a1a4a']][Math.floor(r() * 3)];
      g.shadowColor = cols[1]; g.shadowBlur = u * 0.35;
      for (let i = 0; i < 4; i++) { const x = (i - 1.5) * u * 0.26 + (r() - 0.5) * u * 0.1, h = u * (0.7 + r() * 1.1) * (i === 1 || i === 2 ? 1.3 : 0.8), w = u * (0.14 + r() * 0.08), tilt = (r() - 0.5) * 0.3;
        g.save(); g.translate(x, 0); g.rotate(tilt);
        const lg = g.createLinearGradient(-w, 0, w, 0); lg.addColorStop(0, cols[0]); lg.addColorStop(0.5, cols[1]); lg.addColorStop(1, cols[2]);
        g.fillStyle = lg; g.strokeStyle = 'rgba(20,0,40,.7)'; g.lineWidth = u * 0.025; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, -h * 0.8); g.lineTo(0, -h); g.lineTo(w, -h * 0.8); g.lineTo(w, 0); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.moveTo(-w * 0.3, -h * 0.1); g.lineTo(-w * 0.3, -h * 0.78); g.stroke(); g.restore(); }
      g.shadowBlur = 0; return 2.2;
    }
    if (kind === 'dead') {
      g.strokeStyle = '#5a3418'; g.lineCap = 'round';
      const br = (x0, y0, x1, y1, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + u * 0.1, (y0 + y1) / 2, x1, y1); g.stroke(); };
      br(0, 0, u * 0.05, -u * 1.2, u * 0.16); br(u * 0.05, -u * 0.8, u * 0.6, -u * 1.4, u * 0.07); br(0, -u * 0.6, -u * 0.55, -u * 1.15, u * 0.07); br(u * 0.05, -u * 1.2, -u * 0.1, -u * 1.7, u * 0.05);
      blobs(g, [[u * 0.6, -u * 1.45, u * 0.2], [-u * 0.55, -u * 1.2, u * 0.18], [-u * 0.1, -u * 1.75, u * 0.16]], 62, 40, 40, r);
      return 2;
    }
    // tán tròn / đào hoa
    trunk(0.9, 0.15);
    const bl = kind === 'blossom';
    blobs(g, [[0, -u * 1.35, u * 0.6], [-u * 0.5, -u * 1.05, u * 0.45], [u * 0.5, -u * 1.08, u * 0.46], [-u * 0.2, -u * 1.8, u * 0.42], [u * 0.28, -u * 1.75, u * 0.4]], bl ? 340 : 100, bl ? 70 : 46, bl ? 76 : 40, r);
    leafSpecks(g, 0, -u * 1.4, u * 0.75, 90, bl ? 345 : 96, r, bl ? ['#ffffff', 0.4] : P.flowers ? ['#ffb84a', 0.06] : null);
    return 2.4;
  }
  function rock(g, u, s, P, r) {
    shadowEll(g, u * 0.1, 0, u * 0.6 * s, u * 0.2 * s, 0.35);
    const pts = []; const n = 7; for (let i = 0; i < n; i++) { const a = Math.PI + (i / (n - 1)) * Math.PI; const rr = u * s * (0.45 + r() * 0.2); pts.push([Math.cos(a) * rr * 1.1, Math.sin(a) * rr * (0.9 + r() * 0.3)]); }
    const lg = g.createLinearGradient(-u * s * 0.5, -u * s, u * s * 0.5, 0); lg.addColorStop(0, sh(P.cliff[0], 0.25)); lg.addColorStop(0.55, P.cliff[0]); lg.addColorStop(1, P.cliff[1]);
    g.fillStyle = lg; g.strokeStyle = sh(P.cliff[1], -0.45); g.lineWidth = u * 0.035; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = u * 0.03; g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); g.stroke();
    if (P.snowy) { g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); g.lineTo(pts[4][0], pts[4][1]); g.quadraticCurveTo(0, pts[3][1] + u * s * 0.2, pts[1][0], pts[1][1]); g.fill(); }
    else if (!P.lava && !P.glow) { g.fillStyle = 'rgba(100,150,60,.6)'; g.beginPath(); g.ellipse(-u * s * 0.15, -u * 0.04, u * s * 0.35, u * 0.08, 0, 0, 7); g.fill(); }
    if (P.glow) { g.fillStyle = P.hell ? '#ff6a4a' : P.voidy ? '#d8a0ff' : '#7ae8f8'; g.strokeStyle = P.hell ? '#5a0a08' : P.voidy ? '#3a1a6a' : '#1a4a6a'; g.lineWidth = u * 0.02; for (let i = 0; i < 3; i++) { const x = (r() - 0.5) * u * s * 0.6; g.beginPath(); g.moveTo(x - u * 0.06, -u * s * 0.3); g.lineTo(x, -u * s * (0.75 + r() * 0.3)); g.lineTo(x + u * 0.06, -u * s * 0.3); g.closePath(); g.fill(); g.stroke(); } }
    return s;
  }
  // nhà nhìn 3/4: tường trước + mái cong / mái tranh
  function house(g, u, tw, th, P, r) {
    const W = tw * u, D = th * u, wallH = u * (th > 1 ? 1.05 : 0.85);
    const x0 = -W / 2 + u * 0.14, x1 = W / 2 - u * 0.14;
    shadowEll(g, u * 0.2, -u * 0.05, W * 0.62, u * 0.3, 0.4);
    // nền đá
    g.fillStyle = '#a89a86'; g.strokeStyle = '#4a3e30'; g.lineWidth = u * 0.03; g.beginPath(); g.roundRect(x0 - u * 0.08, -u * 0.18, x1 - x0 + u * 0.16, u * 0.18, u * 0.04); g.fill(); g.stroke();
    // tường
    const lg = g.createLinearGradient(0, -wallH, 0, 0); lg.addColorStop(0, sh(P.wall, 0.15)); lg.addColorStop(1, sh(P.wall, -0.12));
    g.fillStyle = lg; g.fillRect(x0, -u * 0.18 - wallH, x1 - x0, wallH); g.strokeRect(x0, -u * 0.18 - wallH, x1 - x0, wallH);
    // cột son
    const nc = Math.max(2, Math.round((x1 - x0) / (u * 0.45)) + 1);
    for (let i = 0; i < nc; i++) { const x = x0 + ((x1 - x0) * i) / (nc - 1); const cg = g.createLinearGradient(x - u * 0.05, 0, x + u * 0.05, 0); cg.addColorStop(0, sh(P.col, 0.25)); cg.addColorStop(1, sh(P.col, -0.3)); g.fillStyle = cg; g.fillRect(x - u * 0.05, -u * 0.18 - wallH, u * 0.1, wallH); }
    // cửa + song cửa
    const cx = 0, dh = wallH * 0.7, dw = u * 0.36;
    g.fillStyle = '#5a2e16'; g.fillRect(cx - dw / 2, -u * 0.18 - dh, dw, dh); g.strokeRect(cx - dw / 2, -u * 0.18 - dh, dw, dh);
    g.strokeStyle = '#2e160a'; g.beginPath(); g.moveTo(cx, -u * 0.18 - dh); g.lineTo(cx, -u * 0.18); g.stroke();
    g.fillStyle = '#e8c048'; g.beginPath(); g.arc(cx - u * 0.04, -u * 0.18 - dh * 0.5, u * 0.025, 0, 7); g.arc(cx + u * 0.04, -u * 0.18 - dh * 0.5, u * 0.025, 0, 7); g.fill();
    if (x1 - x0 > u * 1.1) for (const s of [-1, 1]) { const wx = s * (x1 - x0) * 0.3, wy = -u * 0.18 - wallH * 0.62, ww = u * 0.34, wh = wallH * 0.36; g.fillStyle = '#3a2214'; g.fillRect(wx - ww / 2, wy - wh / 2, ww, wh); g.strokeStyle = sh(P.wall, -0.1); g.lineWidth = u * 0.025; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(wx - ww / 2 + (ww * k) / 4, wy - wh / 2); g.lineTo(wx - ww / 2 + (ww * k) / 4, wy + wh / 2); g.stroke(); } g.beginPath(); g.moveTo(wx - ww / 2, wy); g.lineTo(wx + ww / 2, wy); g.stroke(); g.strokeStyle = P.col; g.lineWidth = u * 0.04; g.strokeRect(wx - ww / 2, wy - wh / 2, ww, wh); }
    // mái
    const ey = -u * 0.18 - wallH + u * 0.08, ov = u * 0.3, rTop = ey - D * 0.62 - u * 0.25;
    const L0 = x0 - ov, R0 = x1 + ov;
    const rg = g.createLinearGradient(0, rTop, 0, ey); rg.addColorStop(0, sh(P.roof[0], 0.2)); rg.addColorStop(0.55, P.roof[0]); rg.addColorStop(1, P.roof[1]);
    g.fillStyle = rg; g.strokeStyle = sh(P.roof[1], -0.55); g.lineWidth = u * 0.04;
    g.beginPath();
    if (P.thatch) { g.moveTo(L0, ey); g.quadraticCurveTo(L0 + u * 0.1, rTop + u * 0.2, L0 + W * 0.25, rTop); g.lineTo(R0 - W * 0.25, rTop); g.quadraticCurveTo(R0 - u * 0.1, rTop + u * 0.2, R0, ey); g.quadraticCurveTo(0, ey + u * 0.12, L0, ey); }
    else { g.moveTo(L0 - u * 0.12, ey - u * 0.18); g.quadraticCurveTo(L0 + u * 0.18, ey - u * 0.02, L0 + W * 0.16, rTop + u * 0.08); g.lineTo(R0 - W * 0.16, rTop + u * 0.08); g.quadraticCurveTo(R0 - u * 0.18, ey - u * 0.02, R0 + u * 0.12, ey - u * 0.18); g.quadraticCurveTo(0, ey + u * 0.1, L0 - u * 0.12, ey - u * 0.18); }
    g.closePath(); g.fill(); g.stroke();
    g.save(); g.clip();
    if (P.thatch) { for (let i = 0; i < 90 * tw; i++) { const x = L0 + r() * (R0 - L0); g.strokeStyle = hsl(40, 55, 38 + r() * 34, 0.5); g.lineWidth = u * 0.02; g.beginPath(); g.moveTo(x, rTop + r() * u * 0.2); g.lineTo(x + (x / W) * u * 0.3, ey + u * 0.05); g.stroke(); } }
    else { const n = Math.round(tw * 9); for (let i = 0; i <= n; i++) { const t = i / n, xt = L0 + W * 0.16 + (R0 - L0 - W * 0.32) * t, xb = L0 - u * 0.12 + (R0 - L0 + u * 0.24) * t; g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = u * 0.035; g.beginPath(); g.moveTo(xt, rTop); g.quadraticCurveTo(xt + (xb - xt) * 0.3, (rTop + ey) / 2, xb, ey + u * 0.02); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = u * 0.02; g.beginPath(); g.moveTo(xt + u * 0.04, rTop); g.quadraticCurveTo(xt + (xb - xt) * 0.3 + u * 0.04, (rTop + ey) / 2, xb + u * 0.04, ey); g.stroke(); } }
    if (P.snowy) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(L0 - u, rTop - u, R0 - L0 + 2 * u, (ey - rTop) * 0.45 + u); }
    g.restore();
    // nóc + đầu đao
    g.fillStyle = sh(P.roof[1], -0.35); g.beginPath(); g.roundRect(L0 + W * 0.14, rTop - u * 0.1, R0 - L0 - W * 0.28, u * 0.14, u * 0.06); g.fill(); g.stroke();
    if (!P.thatch) for (const s of [-1, 1]) { const x = s > 0 ? R0 - W * 0.14 : L0 + W * 0.14; g.beginPath(); g.moveTo(x, rTop - u * 0.04); g.quadraticCurveTo(x + s * u * 0.12, rTop - u * 0.08, x + s * u * 0.14, rTop - u * 0.26); g.lineWidth = u * 0.06; g.strokeStyle = sh(P.roof[1], -0.35); g.stroke(); }
    // đèn lồng
    if (!P.thatch && !P.glow) for (const s of [-1, 1]) { const lx = s * (x1 - x0) * 0.47, ly = ey + u * 0.22; g.strokeStyle = '#3a1e14'; g.lineWidth = u * 0.015; g.beginPath(); g.moveTo(lx, ey); g.lineTo(lx, ly - u * 0.08); g.stroke(); const lgr = g.createRadialGradient(lx - u * 0.02, ly - u * 0.03, 0, lx, ly, u * 0.1); lgr.addColorStop(0, '#ffd27a'); lgr.addColorStop(1, '#d8301a'); g.fillStyle = lgr; g.beginPath(); g.ellipse(lx, ly, u * 0.08, u * 0.1, 0, 0, 7); g.fill(); g.strokeStyle = '#5a1008'; g.stroke(); }
    return (ey - rTop) / u + wallH / u + 0.3;
  }
  function gate(g, u, P) {
    const col = P.gold ? '#c8302a' : P.thatch || P.glow || P.lava ? '#8a7a68' : P.col;
    shadowEll(g, u * 0.1, 0, u * 0.9, u * 0.2, 0.3);
    for (const s of [-1, 1]) { const x = s * u * 0.52; const cg = g.createLinearGradient(x - u * 0.07, 0, x + u * 0.07, 0); cg.addColorStop(0, sh(col, 0.3)); cg.addColorStop(1, sh(col, -0.35)); g.fillStyle = cg; g.strokeStyle = '#2a1408'; g.lineWidth = u * 0.025; g.fillRect(x - u * 0.07, -u * 1.75, u * 0.14, u * 1.75); g.strokeRect(x - u * 0.07, -u * 1.75, u * 0.14, u * 1.75); g.fillStyle = '#8a8070'; g.fillRect(x - u * 0.11, -u * 0.16, u * 0.22, u * 0.16); }
    g.fillStyle = sh(col, -0.2); g.fillRect(-u * 0.7, -u * 1.45, u * 1.4, u * 0.1);
    const rg = g.createLinearGradient(0, -u * 2.1, 0, -u * 1.65); rg.addColorStop(0, sh(P.roof[0], 0.2)); rg.addColorStop(1, P.roof[1]);
    g.fillStyle = rg; g.strokeStyle = '#2a1408'; g.beginPath(); g.moveTo(-u * 0.98, -u * 1.62); g.quadraticCurveTo(-u * 0.7, -u * 1.75, -u * 0.6, -u * 2.02); g.lineTo(u * 0.6, -u * 2.02); g.quadraticCurveTo(u * 0.7, -u * 1.75, u * 0.98, -u * 1.62); g.quadraticCurveTo(0, -u * 1.7, -u * 0.98, -u * 1.62); g.fill(); g.stroke();
    g.fillStyle = '#ffd860'; g.strokeStyle = '#6a4010'; g.fillRect(-u * 0.22, -u * 1.42, u * 0.44, u * 0.22); g.strokeRect(-u * 0.22, -u * 1.42, u * 0.44, u * 0.22);
    return 2.2;
  }
  function pillar(g, u, P) {
    shadowEll(g, u * 0.15, 0, u * 0.42, u * 0.14, 0.35);
    const cg = g.createLinearGradient(-u * 0.2, 0, u * 0.2, 0); cg.addColorStop(0, '#e8584a'); cg.addColorStop(0.5, '#c8302a'); cg.addColorStop(1, '#7a1410');
    g.fillStyle = cg; g.strokeStyle = '#3a0a06'; g.lineWidth = u * 0.03; g.fillRect(-u * 0.2, -u * 2.0, u * 0.4, u * 2.0); g.strokeRect(-u * 0.2, -u * 2.0, u * 0.4, u * 2.0);
    const gd = g.createLinearGradient(0, -u * 0.1, 0, u * 0.1); gd.addColorStop(0, '#fff2b0'); gd.addColorStop(1, '#b8801a'); g.fillStyle = gd;
    for (const y of [-0.12, -0.9, -1.7]) g.fillRect(-u * 0.24, u * y - u * 0.06, u * 0.48, u * 0.12);
    g.beginPath(); g.ellipse(0, -u * 2.08, u * 0.3, u * 0.12, 0, 0, 7); g.fill(); g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(0, -u * 2.2, u * 0.12, 0, 7); g.fill();
    // mây quấn chân
    g.fillStyle = 'rgba(255,255,255,.9)'; for (const [x, y, rr] of [[-0.3, -0.05, 0.2], [0, 0, 0.24], [0.3, -0.04, 0.18]]) { g.beginPath(); g.arc(x * u, y * u, rr * u, 0, 7); g.fill(); }
    return 2.4;
  }
  function wallSeg(g, u, P, faces) {
    const h = u * 1.05, stone = '#b4aa96';
    const lg = g.createLinearGradient(0, -h - u * 0.25, 0, 0); lg.addColorStop(0, '#d0c8b4'); lg.addColorStop(1, '#8a8270');
    g.fillStyle = lg; g.strokeStyle = '#3e382c'; g.lineWidth = u * 0.025; g.fillRect(-u * 0.5, -h, u, h); g.strokeRect(-u * 0.5, -h, u, h);
    g.strokeStyle = 'rgba(60,50,40,.45)'; g.lineWidth = u * 0.015; for (let r = 1; r < 5; r++) { const y = -h + (h * r) / 5; g.beginPath(); g.moveTo(-u * 0.5, y); g.lineTo(u * 0.5, y); g.stroke(); for (let k = 0; k < 3; k++) { const x = -u * 0.5 + ((k + (r % 2) * 0.5) * u) / 3; g.beginPath(); g.moveTo(x, y - h / 5); g.lineTo(x, y); g.stroke(); } }
    g.fillStyle = '#5a6272'; g.fillRect(-u * 0.52, -h - u * 0.08, u * 1.04, u * 0.1);
    for (const x of [-0.36, 0.08]) { g.fillStyle = stone; g.fillRect(x * u, -h - u * 0.26, u * 0.28, u * 0.2); g.strokeStyle = '#3e382c'; g.strokeRect(x * u, -h - u * 0.26, u * 0.28, u * 0.2); }
    return 1.4;
  }

  // =====================================================================
  function build(M, T, R) {
    const P = PAL[M.theme] || PAL.city;
    const W = COLS * T * R, H = ROWS * T * R, u = T * R;
    const ground = cvs(W, H), G = ground.getContext('2d');
    const r = rng(M.name.length * 131 + M.theme.length);
    const t = M.tiles;
    const at = (x, y) => (y >= 0 && y < ROWS && x >= 0 && x < COLS ? t[y][x] : '#');
    // viền rắn (nối ra mép)
    const solid = Array.from({ length: ROWS }, () => new Array(COLS).fill(false)); const q = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ((x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) && t[y][x] === '#') { solid[y][x] = true; q.push([x, y]); }
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && !solid[ny][nx] && t[ny][nx] === '#') { solid[ny][nx] = true; q.push([nx, ny]); } } }
    const isSolid = (x, y) => x < 0 || y < 0 || x >= COLS || y >= ROWS || solid[y][x];

    // 1) nền cỏ
    const [gh, gs, gl] = P.g, [g2h, g2s, g2l] = P.g2;
    let lg = G.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, hsl(gh, gs, gl)); lg.addColorStop(1, hsl(g2h, g2s, g2l)); G.fillStyle = lg; G.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, rad = u * (0.8 + r() * 2.2); const rg = G.createRadialGradient(x, y, 0, x, y, rad); const light = r() > 0.5; rg.addColorStop(0, light ? hsl(gh - 6, gs + 10, gl + 14, 0.32) : hsl(g2h + 6, g2s, g2l - 12, 0.28)); rg.addColorStop(1, 'rgba(0,0,0,0)'); G.fillStyle = rg; G.fillRect(0, 0, W, H); }
    grassStrokes(G, W, H, Math.round(COLS * ROWS * 42), { h: gh, s: gs - 6, l: gl - 4, k: u / 52 }, r);
    // 2) cỏ rậm vùng có quái
    const gz = mask(M, (c) => c === ',', T, R, 0.45, 0.16);
    through(G, gz, W, H, (g) => { const [zh, zs, zl] = P.grassZ; g.fillStyle = hsl(zh, zs, zl); g.fillRect(0, 0, W, H); grassStrokes(g, W, H, COLS * ROWS * 70, { h: zh, s: zs, l: zl + 6, k: u / 40 }, r); for (let i = 0; i < COLS * ROWS * 3; i++) { g.fillStyle = P.lava ? '#a87a3a' : P.snowy ? '#ffffff' : P.hell ? ['#ff2a3a', '#ff6a4a', '#c8102a'][i % 3] : P.voidy ? ['#c88aff', '#7ae8ff', '#ff8ae8'][i % 3] : P.sea ? ['#ff8a9a', '#ffd0a0', '#ffffff', '#7af0e0'][i % 4] : P.glow ? 'rgba(120,255,230,.8)' : ['#ffd84a', '#ffffff', '#ff9ac0', '#b48aff'][i % 4]; g.beginPath(); g.arc(r() * W, r() * H, u * 0.035, 0, 7); g.fill(); } });
    // 3) đường đi
    const pm = mask(M, (c) => c === '.' || c === 'P' || c === 'H', T, R, 0.5, 0.1, 0.22);
    const pmEdge = mask(M, (c) => c === '.' || c === 'P' || c === 'H', T, R, 0.4, 0.14, 0.22);
    through(G, pmEdge, W, H, (g) => { g.fillStyle = 'rgba(40,40,20,.28)'; g.fillRect(0, 0, W, H); });
    through(G, pm, W, H, (g) => {
      const [c0, c1, c2] = P.pathC;
      let pg = g.createLinearGradient(0, 0, W, H); pg.addColorStop(0, c0); pg.addColorStop(1, c1); g.fillStyle = pg; g.fillRect(0, 0, W, H);
      if (P.path === 'paved' || P.path === 'jade') { // đá lát
        const s = u / 2;
        for (let y = 0; y < H; y += s) for (let x = -((y / s) % 2) * s / 2; x < W; x += s) { const v = r(); g.fillStyle = P.path === 'jade' ? (P.jade ? hsl(P.jade[0], P.jade[1], (P.jade[2] || 88) + v * 8) : hsl(270, 40, 94 + v * 5)) : hsl(38, 22, 76 + v * 12); g.strokeStyle = P.path === 'jade' ? (P.voidy ? 'rgba(200,140,255,.55)' : 'rgba(200,170,90,.55)') : 'rgba(80,66,48,.4)'; g.lineWidth = u * 0.02; g.beginPath(); g.roundRect(x + u * 0.02, y + u * 0.02, s - u * 0.04, s - u * 0.04, u * 0.05); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + u * 0.05, y + u * 0.05, s * 0.5, u * 0.03); }
      } else {
        for (let i = 0; i < COLS * ROWS * 30; i++) { g.fillStyle = r() > 0.5 ? sh(c0, 0.15) + '88' : c2 + '55'; g.beginPath(); g.ellipse(r() * W, r() * H, u * (0.02 + r() * 0.05), u * (0.015 + r() * 0.03), r() * 3, 0, 7); g.fill(); }
        if (P.path === 'crack') { g.strokeStyle = 'rgba(90,50,20,.45)'; g.lineWidth = u * 0.02; for (let i = 0; i < COLS * ROWS * 0.8; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * u * 0.5; y += (r() - 0.5) * u * 0.5; g.lineTo(x, y); } g.stroke(); } }
        // đá bậc rải
        for (let i = 0; i < COLS * ROWS * 0.25; i++) { const x = r() * W, y = r() * H, w = u * (0.12 + r() * 0.16); const sg = g.createLinearGradient(0, y - w, 0, y + w); sg.addColorStop(0, '#e8ecee'); sg.addColorStop(1, '#8a96a0'); g.fillStyle = sg; g.strokeStyle = 'rgba(40,50,60,.6)'; g.lineWidth = u * 0.015; g.beginPath(); g.ellipse(x, y, w, w * 0.45, r() - 0.5, 0, 7); g.fill(); g.stroke(); }
      }
    });
    // 4) nước
    const isW = (c) => c === '~' || c === 'W';
    const wShore = mask(M, isW, T, R, 0.4, 0.12, 0.3), wMain = mask(M, isW, T, R, 0.52, 0.1, 0.3), wDeep = mask(M, isW, T, R, 0.82, 0.25, 0.3);
    through(G, wShore, W, H, (g) => { g.fillStyle = P.shore; g.fillRect(0, 0, W, H); for (let i = 0; i < COLS * ROWS * 6; i++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.arc(r() * W, r() * H, u * 0.03, 0, 7); g.fill(); } });
    through(G, wMain, W, H, (g) => { const [c0] = P.water; g.fillStyle = c0; g.fillRect(0, 0, W, H); for (let i = 0; i < COLS * ROWS * 3; i++) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = u * 0.02; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + u * 0.12, y - u * 0.05, x + u * 0.24, y); g.stroke(); } });
    through(G, wDeep, W, H, (g) => { g.fillStyle = P.water[1]; g.globalAlpha = 0.55; g.fillRect(0, 0, W, H); });
    if (P.lava) through(G, wMain, W, H, (g) => { for (let i = 0; i < COLS * ROWS * 2; i++) { g.fillStyle = 'rgba(60,10,4,.55)'; g.beginPath(); g.ellipse(r() * W, r() * H, u * 0.2, u * 0.08, r() * 3, 0, 7); g.fill(); } });
    // 5) viền (vách đá, rừng, mây, tường)
    const sm = mask(M, (c, x, y) => solid[y][x], T, R, 0.5, 0.1, 0.3);
    if (P.border === 'cloud') through(G, sm, W, H, (g) => { g.fillStyle = '#efe8fb'; g.fillRect(0, 0, W, H); for (let i = 0; i < COLS * ROWS * 1.4; i++) { const x = r() * W, y = r() * H, rr = u * (0.3 + r() * 0.5); const rg = g.createRadialGradient(x - rr * 0.3, y - rr * 0.3, 0, x, y, rr); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, 'rgba(220,210,245,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } });
    else through(G, sm, W, H, (g) => { const [c0, c1] = P.border === 'woods' ? ['#4e7a3a', '#2c4a24'] : P.cliff; let cg = g.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, c0); cg.addColorStop(1, c1); g.fillStyle = cg; g.fillRect(0, 0, W, H); for (let i = 0; i < COLS * ROWS * 8; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(r() * W, r() * H, u * 0.2, u * 0.1, r() * 3, 0, 7); g.fill(); } });
    // bóng đổ mép trong của viền
    G.save(); G.globalCompositeOperation = 'multiply'; G.globalAlpha = 0.35; G.drawImage(mask(M, (c, x, y) => solid[y][x], T, R, 0.3, 0.3, 0.3), 0, u * 0.12, W, H); G.restore();

    // ---------- vật thể ----------
    const objs = [], lights = [];
    const add = (mx, my, wU, hU, fn, zOff = 0) => { // mx,my: điểm gốc (đơn vị ô), wU,hU: khung
      const c = cvs(wU * u, hU * u), g = c.getContext('2d'); g.translate(wU * u / 2, hU * u - u * 0.35); fn(g);
      objs.push({ c, x: (mx - wU / 2) * T, y: (my - hU + 0.35) * T, w: wU * T, h: hU * T, z: my + zOff });
    };
    const used = new Set();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = t[y][x], seed = x * 31 + y * 17;
      const rr = rng(seed + 3);
      if (ch === 'T') { const kind = P.tree === 'mix' ? (hi(x, y) < 0.45 ? 'pine' : 'broad') : P.tree; add(x + 0.5 + (hi(x, y) - 0.5) * 0.2, y + 0.85, 2.2, 3.0, (g) => tree(g, u * (1 + hi(y, x) * 0.15), kind, P, rr)); }
      else if (ch === '#' && !solid[y][x]) {
        if (P.border === 'cloud') add(x + 0.5, y + 0.85, 1.4, 3.0, (g) => pillar(g, u, P));
        else add(x + 0.5, y + 0.85, 1.6, 1.6, (g) => { rock(g, u, 0.9 + hi(x, y) * 0.3, P, rr); g.translate(u * 0.35, u * 0.08); rock(g, u, 0.45, P, rr); });
      } else if (ch === 'H' && !used.has(x + ',' + y)) {
        let tw = 1, th2 = 1;
        if (t[y][x + 1] === 'H' && !used.has(x + 1 + ',' + y)) tw = 2;
        if (t[y + 1] && t[y + 1][x] === 'H' && (tw === 1 || t[y + 1][x + 1] === 'H')) th2 = 2;
        for (let dy = 0; dy < th2; dy++) for (let dx = 0; dx < tw; dx++) used.add(x + dx + ',' + (y + dy));
        add(x + tw / 2, y + th2 - 0.05, tw + 0.9, th2 + 2.2, (g) => house(g, u, tw, th2, P, rr));
        lights.push([(x + tw / 2) * T, (y + th2) * T - T * 0.4, T * (1.3 + tw * 0.4)]);
      } else if (ch === 'P') { add(x + 0.5, y + 0.8, 2.2, 2.6, (g) => gate(g, u, P)); lights.push([(x + 0.5) * T, (y + 0.6) * T, T * 1.4, '255,220,140']); }
      else if (solid[y][x]) { // viền: cây / đá / tường / cột
        const inner = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => !isSolid(x + dx, y + dy));
        if (!inner) continue;
        if (P.border === 'wall') { if (y === ROWS - 1) continue; add(x + 0.5, y + 0.95, 1.1, 1.8, (g) => wallSeg(g, u, P)); }
        else if (P.border === 'cloud') { if ((x + y) % 2 === 0 && y < ROWS - 1) add(x + 0.5, y + 0.8, 1.4, 3.0, (g) => pillar(g, u, P)); }
        else if (P.border === 'woods') { if (y === ROWS - 1) add(x + 0.5, y + 0.7, 1.4, 1.2, (g) => rock(g, u, 0.5, P, rr)); else add(x + 0.5 + (hi(x, y) - 0.5) * 0.3, y + 0.8, 2.2, 3.0, (g) => tree(g, u * (0.95 + hi(y, x) * 0.25), P.tree === 'mix' ? (hi(x, y) < 0.5 ? 'pine' : 'broad') : P.tree === 'willow' ? 'broad' : P.tree, P, rr)); }
        else { if (hi(x, y) < 0.55 || y === ROWS - 1) add(x + 0.5, y + 0.8, 1.6, 1.6, (g) => rock(g, u, y === ROWS - 1 ? 0.5 : 0.8 + hi(x, y) * 0.4, P, rr)); else add(x + 0.5, y + 0.8, 2.2, 3.0, (g) => tree(g, u * 0.95, P.tree, P, rr)); }
      }
    }
    // ánh nắng chéo (nướng sẵn)
    lg = G.createLinearGradient(0, 0, W, H * 0.5); lg.addColorStop(0, 'rgba(255,244,200,.18)'); lg.addColorStop(1, 'rgba(255,244,200,0)'); G.fillStyle = lg; G.fillRect(0, 0, W, H);
    const water = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (isW(t[y][x])) water.push([x, y]);
    return { ground, objs, lights, water, pal: P };
  }

  // nước động phủ lên (gợn, lấp lánh) – vẽ mỗi khung hình
  function water(ctx, list, T, now, P) {
    ctx.save();
    for (const [x, y] of list) {
      const X = x * T, Y = y * T, h = hi(x, y);
      if (P.lava) { const p = 0.5 + 0.5 * Math.sin(now / 500 + x + y * 0.7); ctx.fillStyle = `rgba(255,${200 + p * 50},90,${0.12 + p * 0.18})`; ctx.beginPath(); ctx.arc(X + T * (0.3 + h * 0.4), Y + T * 0.5, T * 0.35, 0, 7); ctx.fill(); continue; }
      if (P.snowy) continue;
      const o = ((now / 1600 + h) % 1);
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * Math.sin(o * Math.PI)})`; ctx.lineWidth = Math.max(1, T * 0.03);
      ctx.beginPath(); ctx.moveTo(X + T * 0.15, Y + T * (0.3 + o * 0.4)); ctx.quadraticCurveTo(X + T * 0.4, Y + T * (0.24 + o * 0.4), X + T * 0.65, Y + T * (0.3 + o * 0.4)); ctx.stroke();
      const tw = 0.5 + 0.5 * Math.sin(now / 300 + h * 40); ctx.fillStyle = `rgba(255,255,255,${tw * 0.8})`; ctx.beginPath(); ctx.arc(X + T * hi(y, x), Y + T * h, T * 0.025, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // =====================================================================
  //  PHÔNG CHIẾN ĐẤU KIỂU TRANH: trời mây, núi xa nhiều lớp, cảnh vùng,
  //  bãi đất, đài đá khảm Bát Quái ở giữa (nơi hai phe đứng)
  // =====================================================================
  const SKY = {
    city: ['#5aa0e6', '#d6eaf6', '#ffffff'], forest: ['#4c9ad6', '#d8eee6', '#ffffff'], river: ['#4aa2e8', '#dcf0f6', '#ffffff'],
    heaven: ['#a890f0', '#fff0f6', '#fff8fc'], cave: ['#1a1430', '#4a3a6e', '#8a7ab8'], snow: ['#86b6e8', '#f2f8ff', '#ffffff'], desert: ['#e2864a', '#ffe0b0', '#fff0dc'],
    sea: ['#0a3a6a', '#3aa8c8', '#bff0ff'], hell: ['#1a0408', '#5a0a14', '#a8303a'], void: ['#0a0418', '#3a1a6a', '#c8a0ff'],
  };
  function ridge(g, W, y0, amp, freq, col, seed) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, y0 + amp);
    for (let x = 0; x <= W; x += W / 60) { const n = fbm(x / W * freq + seed, seed * 0.37); const pk = Math.pow(n, 1.6); g.lineTo(x, y0 + amp - pk * amp * 2.2); }
    g.lineTo(W, y0 + amp * 4); g.lineTo(0, y0 + amp * 4); g.closePath(); g.fill();
  }
  function battleBG(theme, W, H, R = 2) {
    const th = theme === 'arena' ? 'city' : theme === 'world' ? 'river' : PAL[theme] ? theme : 'city';
    const P = PAL[th], S = SKY[th];
    const c = cvs(W * R, H * R), g = c.getContext('2d'); g.scale(R, R);
    const r = rng(th.length * 77 + 5);
    const hz = H * 0.37;
    // trời
    let lg = g.createLinearGradient(0, 0, 0, hz); lg.addColorStop(0, S[0]); lg.addColorStop(1, S[1]); g.fillStyle = lg; g.fillRect(0, 0, W, hz + 2);
    const sun = g.createRadialGradient(W * 0.2, H * 0.08, 0, W * 0.2, H * 0.08, W * 0.7); sun.addColorStop(0, th === 'cave' || th === 'void' ? 'rgba(150,120,255,.35)' : th === 'hell' ? 'rgba(255,60,60,.35)' : th === 'sea' ? 'rgba(200,255,255,.55)' : 'rgba(255,248,220,.75)'); sun.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, hz);
    for (let i = 0; i < 16; i++) { const x = r() * W, y = H * (0.04 + r() * 0.22), w = W * (0.12 + r() * 0.2); g.fillStyle = S[2]; g.globalAlpha = th === 'cave' || th === 'hell' || th === 'void' ? 0.12 : 0.5; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + (k - 2.5) * w * 0.22, y + Math.sin(k * 1.7) * w * 0.05, w * 0.22, w * 0.11, 0, 0, 7); g.fill(); } }
    g.globalAlpha = 1;
    // núi xa 3 lớp (càng xa càng nhạt)
    const mix = (a, b, t) => Chibi.sh ? (() => { const A = a.match(/\w\w/g).map((h) => parseInt(h, 16)), B = b.match(/\w\w/g).map((h) => parseInt(h, 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); })() : a;
    const mc = th === 'snow' ? '#7a9ab8' : th === 'desert' ? '#a85a3a' : th === 'cave' ? '#2a2240' : th === 'heaven' ? '#c8b8ee' : th === 'sea' ? '#1a5a7a' : th === 'hell' ? '#2a0a12' : th === 'void' ? '#1a0a34' : '#5a7a6a';
    ridge(g, W, hz - H * 0.12, H * 0.05, 2.2, mix(mc, S[1].slice(1).length ? S[1] : '#ffffff', 0.72), 3.1);
    ridge(g, W, hz - H * 0.07, H * 0.04, 3.4, mix(mc, S[1], 0.5), 7.7);
    if (th === 'snow') { g.fillStyle = 'rgba(255,255,255,.55)'; ridge(g, W, hz - H * 0.07, H * 0.012, 3.4, 'rgba(255,255,255,.4)', 7.7); }
    ridge(g, W, hz - H * 0.025, H * 0.025, 5.1, mix(mc, S[1], 0.25), 11.3);
    // mặt đất
    lg = g.createLinearGradient(0, hz, 0, H); lg.addColorStop(0, hsl(P.g[0], P.g[1] - 6, P.g[2] + 8)); lg.addColorStop(1, hsl(P.g2[0], P.g2[1], P.g2[2] - 8)); g.fillStyle = lg; g.fillRect(0, hz, W, H - hz);
    if (th === 'heaven') { for (let i = 0; i < 40; i++) { const x = r() * W, y = hz + r() * H * 0.2, rr = W * (0.06 + r() * 0.1); const rg = g.createRadialGradient(x, y, 0, x, y, rr); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
    for (let i = 0; i < 2600; i++) { const t = r(), y = hz + Math.pow(t, 0.8) * (H - hz), k = 0.3 + (y - hz) / (H - hz) * 1.4, x = r() * W; g.strokeStyle = hsl(P.g[0] + r() * 24 - 12, P.g[1], P.g[2] + r() * 26 - 13, 0.25); g.lineWidth = k; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3 * k, y - (3 + r() * 5) * k); g.stroke(); }
    // cảnh giữa ở chân trời
    const u = W / 7.5;
    const put = (x, y, s, fn) => { g.save(); g.translate(x, y); g.scale(s, s); fn(g, u); g.restore(); };
    const rr = rng(91);
    if (th === 'city') { put(W * 0.5, hz + H * 0.02, 1.1, (gg, uu) => house(gg, uu, 2, 2, P, rr)); for (const x of [0.12, 0.88]) put(W * x, hz + H * 0.03, 0.85, (gg, uu) => house(gg, uu, 1, 1, P, rr)); for (const x of [0.28, 0.72, 0.02, 0.98]) put(W * x, hz + H * 0.035, 0.75, (gg, uu) => tree(gg, uu, 'willow', P, rr)); }
    else if (th === 'heaven') { put(W * 0.5, hz + H * 0.04, 1.6, (gg, uu) => gate(gg, uu, P)); for (const x of [0.14, 0.86]) put(W * x, hz + H * 0.06, 1.0, (gg, uu) => pillar(gg, uu, P)); for (const x of [0.3, 0.7]) put(W * x, hz + H * 0.03, 0.7, (gg, uu) => tree(gg, uu, 'blossom', P, rr)); }
    else if (th === 'desert') { for (const [x, s] of [[0.15, 0.9], [0.5, 0.8], [0.85, 1]]) put(W * x, hz + H * 0.03, s, (gg, uu) => rock(gg, uu, 1.6, P, rr)); for (const x of [0.32, 0.68]) put(W * x, hz + H * 0.04, 0.8, (gg, uu) => tree(gg, uu, 'dead', P, rr)); }
    else if (th === 'sea' || th === 'hell' || th === 'void') {
      const kind = th === 'sea' ? 'coral' : th === 'hell' ? 'crimson' : 'crystal';
      if (th === 'sea') put(W * 0.5, hz + H * 0.03, 1.15, (gg, uu) => house(gg, uu, 2, 1, P, rr));
      if (th === 'hell') put(W * 0.5, hz + H * 0.04, 1.4, (gg, uu) => gate(gg, uu, P));
      if (th === 'void') { for (let i = 0; i < 7; i++) { const x = W * (0.08 + i * 0.14), y = H * (0.12 + (i % 3) * 0.06), w = W * (0.05 + (i % 2) * 0.04); g.fillStyle = '#2a1a4a'; g.strokeStyle = '#8a5ae8'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x + w * 0.4, y + w * 0.9); g.lineTo(x - w * 0.3, y + w * 0.7); g.closePath(); g.fill(); g.stroke(); } }
      for (let i = 0; i < 8; i++) { const x = W * (i / 7) + (rr() - 0.5) * 20; if (Math.abs(x - W * 0.5) < W * 0.16) continue; put(x, hz + H * (0.02 + rr() * 0.02), 0.55 + rr() * 0.35, (gg, uu) => tree(gg, uu, kind, P, rr)); }
    }
    else { const kind = th === 'cave' ? 'shroom' : th === 'snow' ? 'pine' : th === 'river' ? 'willow' : 'broad'; for (let i = 0; i < 9; i++) { const x = W * (i / 8) + (rr() - 0.5) * 20; put(x, hz + H * (0.02 + rr() * 0.02), 0.6 + rr() * 0.35, (gg, uu) => tree(gg, uu, kind === 'broad' && i % 3 === 0 ? 'pine' : kind, P, rr)); } if (th === 'river') { g.fillStyle = 'rgba(90,180,220,.85)'; g.beginPath(); g.ellipse(W * 0.5, hz + H * 0.06, W * 0.75, H * 0.02, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * 0.1, hz + H * 0.06); g.quadraticCurveTo(W * 0.5, hz + H * 0.055, W * 0.9, hz + H * 0.062); g.stroke(); } }
    // đài Bát Quái
    const cx = W * 0.5, cy = H * 0.66, rx = W * 0.62, ry = H * 0.17;
    shadowEll(g, cx, cy + ry * 0.35, rx * 1.05, ry * 1.1, 0.35);
    const stone = th === 'heaven' ? ['#ffffff', '#e2d8f2', '#d8b048'] : th === 'cave' ? ['#8a7ea0', '#5e5276', '#7ad8c8'] : th === 'sea' ? ['#e8fbf6', '#9ad8d0', '#2a8ab0'] : th === 'hell' ? ['#5a4a52', '#2e2228', '#c8202a'] : th === 'void' ? ['#4a3a6e', '#241a3a', '#b07aff'] : th === 'desert' ? ['#efcc98', '#c8945a', '#a0582e'] : th === 'snow' ? ['#f4f8fc', '#c8d4e2', '#6a88b0'] : ['#e6dcc4', '#bcaa88', '#9a3a2a'];
    // thành đài
    g.fillStyle = Chibi.sh(stone[1], -0.25); g.beginPath(); g.ellipse(cx, cy + ry * 0.14, rx, ry, 0, 0, Math.PI); g.lineTo(cx - rx, cy); g.fill();
    g.fillStyle = stone[2]; g.beginPath(); g.ellipse(cx, cy + ry * 0.07, rx, ry, 0, 0, Math.PI); g.ellipse(cx, cy + ry * 0.04, rx, ry, 0, Math.PI, 0, true); g.fill();
    // mặt đài
    const tg = g.createRadialGradient(cx - rx * 0.2, cy - ry * 0.4, 0, cx, cy, rx); tg.addColorStop(0, Chibi.sh(stone[0], 0.3)); tg.addColorStop(0.7, stone[0]); tg.addColorStop(1, stone[1]);
    g.fillStyle = tg; g.strokeStyle = Chibi.sh(stone[1], -0.4); g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill(); g.stroke();
    g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1.4;
    for (const k of [0.36, 0.64]) { g.beginPath(); g.arc(0, 0, rx * k, 0, 7); g.stroke(); }
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283; g.beginPath(); g.moveTo(Math.cos(a) * rx * 0.36, Math.sin(a) * rx * 0.36); g.lineTo(Math.cos(a) * rx * 0.95, Math.sin(a) * rx * 0.95); g.stroke(); }
    g.strokeStyle = stone[2]; g.globalAlpha = 0.8; g.lineWidth = 4;
    for (const k of [0.16, 0.42, 0.93]) { g.beginPath(); g.arc(0, 0, rx * k, 0, 7); g.stroke(); }
    g.fillStyle = stone[2];
    const TRI = [[1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1], [1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 8; i++) { g.save(); g.rotate((i / 8) * 6.283 + Math.PI / 2); g.translate(0, -rx * 0.78); TRI[i].forEach((sd, k) => { const y = -rx * 0.05 + k * rx * 0.038, w = rx * 0.17, h = rx * 0.022; if (sd) g.fillRect(-w / 2, y, w, h); else { g.fillRect(-w / 2, y, w * 0.42, h); g.fillRect(w * 0.08, y, w * 0.42, h); } }); g.restore(); }
    const tr = rx * 0.13; g.fillStyle = stone[0]; g.beginPath(); g.arc(0, 0, tr, 0, 7); g.fill(); g.fillStyle = stone[2]; g.beginPath(); g.arc(0, 0, tr, -Math.PI / 2, Math.PI / 2); g.arc(0, tr / 2, tr / 2, Math.PI / 2, -Math.PI / 2, true); g.arc(0, -tr / 2, tr / 2, Math.PI / 2, -Math.PI / 2, false); g.fill();
    g.restore(); g.globalAlpha = 1;
    // cây bụi tiền cảnh
    for (const [x, y, s] of [[-0.02, 0.97, 1.3], [1.02, 0.95, 1.2], [0.08, 0.42, 0.7], [0.94, 0.43, 0.75]]) put(W * x, H * y, s, (gg, uu) => { if (th === 'desert' || th === 'cave' || th === 'snow') rock(gg, uu, 1.1, P, rr); else tree(gg, uu, th === 'heaven' ? 'blossom' : th === 'sea' ? 'coral' : th === 'hell' ? 'crimson' : th === 'void' ? 'crystal' : 'broad', P, rr); });
    // nắng ấm
    lg = g.createLinearGradient(0, 0, W, H); lg.addColorStop(0, th === 'cave' ? 'rgba(120,90,200,.12)' : 'rgba(255,240,200,.16)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
    return c;
  }
  const bgCache = {};
  function battleURL(theme, W, H) { const k = theme + '|' + Math.round(W) + 'x' + Math.round(H); if (!bgCache[k]) bgCache[k] = battleBG(theme, W, H, Math.min(2, window.devicePixelRatio || 1)).toDataURL('image/jpeg', 0.9); return bgCache[k]; }

  const cache = new Map();
  function get(M, T, R) { const k = M.name + '|' + M.theme + '|' + Math.round(T * R); if (!cache.has(k)) { cache.clear(); cache.set(k, build(M, T, R)); } return cache.get(k); }
  return { get, water, PAL, battleBG, battleURL };
})();
