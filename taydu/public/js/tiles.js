// =====================================================================
//  BỐI CẢNH PIXEL ART: nền bản đồ (16 điểm ảnh / ô), vật thể, phông trận đấu
//  Cùng phong cách với nhân vật (pixel.js): bóng khối + viền màu.
// =====================================================================
const Tiles = (() => {
  const { Buf, render, mix, lit, drk } = Pix;
  const AP = 16, COLS = 12, ROWS = 20;

  // ---------- nhiễu ----------
  const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const sm = (t) => t * t * (3 - 2 * t);
  function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); const u = sm(xf), v = sm(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  const fbm = (x, y) => vn(x, y) * 0.55 + vn(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + vn(x * 4.3 + 1, y * 4.3 + 9) * 0.15;
  // Worley (đá cuội)
  function worley(x, y, cell) {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    let f1 = 1e9, f2 = 1e9, id = 0, ox = 0, oy = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const gx = cx + i, gy = cy + j, px = (gx + 0.15 + hash(gx, gy) * 0.7) * cell, py = (gy + 0.15 + hash(gy + 31, gx) * 0.7) * cell;
      const d = Math.hypot(x - px, y - py);
      if (d < f1) { f2 = f1; f1 = d; id = hash(gx * 7, gy * 13); ox = x - px; oy = y - py; } else if (d < f2) f2 = d;
    }
    return { f1, f2, id, ox, oy };
  }
  const C = Pix.C;

  // ---------- bảng màu theo bối cảnh (sáng → tối) ----------
  const PAL = {
    heaven: { ground: ['#fbf8ff', '#ece6f6', '#d9cfec', '#b9aed6'], grass: ['#ffffff', '#f2ecfb', '#ddd2f0', '#c2b4e2'], water: ['#3a4aa0', '#222c78', '#161c58', '#0c1040'], inlay: '#e8c45a', bank: ['#b9aed6', '#8a7eb8'] },
    city: { ground: ['#c8beac', '#a89c88', '#8a7e6c', '#5e5446'], grass: ['#9ac860', '#78a84a', '#5a8a3a', '#3a6a2a'], water: ['#7ab8d8', '#4a8ab8', '#2a6a98', '#1a4a78'], bank: ['#6a5a44', '#4a3e30'] },
    forest: { ground: ['#d8b880', '#c09a60', '#a07c48', '#7a5a34'], grass: ['#8ac858', '#62a840', '#468a30', '#2e6a24'], water: ['#6ab8e8', '#3a8ac8', '#2a6aa8', '#1a4a88'], bank: ['#6a4a2a', '#4a3020'] },
    river: { ground: ['#d8d0a0', '#bcb084', '#9a9068', '#746a4a'], grass: ['#9ad070', '#72b050', '#50903a', '#36702a'], water: ['#7ad0d8', '#3aa8b8', '#2a8098', '#1a5a78'], bank: ['#6a5a3a', '#4a3e28'] },
    desert: { ground: ['#f8dca0', '#e8c080', '#d0a060', '#a87a40'], grass: ['#e09a54', '#c87a3a', '#a85a28', '#6a3414'], water: ['#fff0a0', '#ffa030', '#e05010', '#901a08'], bank: ['#8a3a1a', '#5a2010'] },
    cave: { ground: ['#7a6a82', '#5e5068', '#4a3e54', '#2e2638'], grass: ['#6ac0a8', '#3e9080', '#2a6a60', '#1a4a44'], water: ['#3a5aa0', '#243e7a', '#18285a', '#0c1638'], bank: ['#2e2638', '#1a1424'] },
    snow: { ground: ['#ffffff', '#eef4fa', '#d6e2f0', '#b0c4dc'], grass: ['#ffffff', '#e4eef6', '#c4d6e6', '#5a8a7a'], water: ['#e8f8ff', '#b8e0f4', '#88c0e0', '#5a98c8'], bank: ['#8aa0b8', '#5a7090'] },
  };
  const FLOWERS = ['#ff8fb4', '#ffe066', '#ffffff', '#b48aff'];

  // ---------- lớp nền ----------
  function clsAt(M, tx, ty) {
    tx = Math.max(0, Math.min(COLS - 1, tx)); ty = Math.max(0, Math.min(ROWS - 1, ty));
    const ch = M.tiles[ty][tx];
    return ch === ',' ? 1 : ch === '~' || ch === 'W' ? 2 : 0;
  }

  function groundColor(theme, P, x, y, tone) {
    const g = P.ground;
    switch (theme) {
      case 'heaven': {
        const tx = x % AP, ty = y % AP;
        if (tx === 0 || ty === 0) return g[0];
        if (tx === AP - 1 || ty === AP - 1) return g[2];
        const cx = Math.abs(tx - 7.5), cy = Math.abs(ty - 7.5);
        if (((x >> 4) + (y >> 4)) % 2 === 0 && cx + cy < 2.6) return cx + cy < 1.4 ? lit(C(P.inlay), 0.3) : P.inlay;
        return hash(x, y) > 0.94 ? g[2] : g[1];
      }
      case 'city': {
        const w = worley(x, y, 5.2);
        if (w.f2 - w.f1 < 0.9) return g[3];
        const base = w.id > 0.66 ? g[0] : w.id > 0.33 ? g[1] : g[2];
        if (w.oy < -1.4 || w.ox < -1.6) return lit(C(base), 0.18);
        if (w.oy > 1.4) return drk(C(base), 0.14);
        return base;
      }
      case 'desert': {
        const v = Math.sin(x * 0.35 + y * 0.9 + fbm(x / 14, y / 14) * 7);
        if (v > 0.86) return g[0];
        if (v < -0.9) return g[2];
        return hash(x, y) > 0.97 ? g[3] : g[1];
      }
      case 'cave': {
        const n = fbm(x / 11, y / 11);
        if (Math.abs(n - 0.5) < 0.012) return g[3];
        if (hash(x, y) > 0.95) return g[0];
        return n > 0.58 ? g[0] : n < 0.4 ? g[2] : g[1];
      }
      case 'snow': {
        const n = fbm(x / 9, y / 9);
        if (n < 0.36 && (x + y) % 2 === 0) return g[2];
        if (hash(x, y) > 0.985) return g[3];
        return n > 0.6 ? g[0] : g[1];
      }
      default: { // đất (forest, river)
        const n = fbm(x / 8, y / 8);
        const h = hash(x >> 1, y >> 1);
        if (h > 0.965) return g[0];
        if (hash(x, y + 1) > 0.97 && h > 0.9) return g[3];
        return n > 0.62 ? g[0] : n < 0.38 ? g[2] : g[1];
      }
    }
  }

  function grassColor(theme, P, x, y) {
    const g = P.grass;
    if (theme === 'heaven') { // mây
      const c = fbm(x / 6, y / 6);
      return c > 0.62 ? g[0] : c > 0.48 ? g[1] : c > 0.36 ? g[2] : g[3];
    }
    if (theme === 'snow') { const c = fbm(x / 5, y / 5); if (c < 0.32 && hash(x, y) > 0.5) return g[3]; return c > 0.55 ? g[0] : c > 0.42 ? g[1] : g[2]; }
    if (theme === 'cave') { if (hash(x, y) > 0.985) return ['#bff8ff', '#e8b8ff', '#9ff0d8'][(x + y) % 3]; const c = fbm(x / 6, y / 6); return c > 0.6 ? g[0] : c > 0.45 ? g[1] : c > 0.33 ? g[2] : g[3]; }
    if (theme === 'desert') { const w = worley(x, y, 6); if (w.f2 - w.f1 < 0.8) return '#6a3414'; return w.id > 0.5 ? '#c87a3a' : '#b86a30'; }
    // cỏ có ngọn
    const col = x, k = (y + Math.floor(hash(col, 7) * 4)) % 5;
    const blade = hash(col, Math.floor((y + hash(col, 3) * 5) / 5));
    if (blade > 0.72 && k < 2) return g[0];
    if (blade < 0.16 && k < 3) return g[3];
    if (theme !== 'desert' && hash(x, y) > 0.992) return FLOWERS[Math.floor(hash(y, x) * 4)];
    const n = fbm(x / 7, y / 7);
    return n > 0.6 ? g[1] : n < 0.38 ? g[2] : mix(C(g[1]), C(g[2]), 0.5);
  }

  function waterColor(theme, P, x, y, f) {
    const w = P.water;
    if (theme === 'heaven') { // Thiên Hà đầy sao
      const st = hash(x, y);
      if (st > 0.985) return (f + Math.floor(st * 300)) % 4 === 0 ? '#ffffff' : '#a8b8ff';
      const n = fbm(x / 10, y / 10);
      return n > 0.62 ? w[0] : n > 0.45 ? w[1] : w[2];
    }
    if (theme === 'snow') { // băng
      const n = fbm(x / 8, y / 8);
      if (Math.abs(n - 0.5) < 0.012) return '#ffffff';
      if ((x - y + 400) % 11 === 0 && hash(x >> 2, y >> 2) > 0.6) return w[0];
      return n > 0.55 ? w[1] : w[2];
    }
    if (theme === 'desert') { // dung nham
      const a = (f * Math.PI) / 2, n = fbm(x / 7 + Math.cos(a) * 0.5, y / 7 + Math.sin(a) * 0.5);
      return n > 0.66 ? w[0] : n > 0.52 ? w[1] : n > 0.4 ? w[2] : w[3];
    }
    const a = (f * Math.PI) / 2, wave = Math.sin(x * 0.55 + y * 1.25 - a) + Math.sin(x * 0.21 - y * 0.6 + a) * 0.8;
    if (wave > 1.55) return w[0];
    const n = fbm(x / 12, y / 12);
    return wave < -1.3 ? w[3] : n > 0.55 ? w[1] : w[2];
  }

  function buildGround(M, frames = 4) {
    const theme = M.theme, P = PAL[theme] || PAL.forest;
    const W = COLS * AP, Hh = ROWS * AP;
    const cls = new Uint8Array(W * Hh);
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const u = x / AP, v = y / AP;
      const n1 = fbm(u * 1.7, v * 1.7), n2 = fbm(u * 1.7 + 11, v * 1.7 + 5), j = (hash(x, y) - 0.5) * 0.06;
      const at2 = (s) => clsAt(M, Math.floor(u + (n1 - 0.5) * s + j), Math.floor(v + (n2 - 0.5) * s + j));
      cls[y * W + x] = at2(0.4) === 2 ? 2 : at2(0.62) === 1 ? 1 : 0;
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= Hh ? -1 : cls[y * W + x]);
    const base = new Array(W * Hh);
    const water = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const c = cls[y * W + x], i = y * W + x;
      if (c === 2) {
        const up = at(x, y - 1), up2 = at(x, y - 2), up3 = at(x, y - 3);
        if (theme !== 'heaven' && up !== 2 && up !== -1) { base[i] = P.bank[0]; continue; }
        if (theme !== 'heaven' && up2 !== 2 && up2 !== -1) { base[i] = P.bank[1]; continue; }
        if (up3 !== 2 && up3 !== -1 || at(x - 1, y) !== 2 || at(x + 1, y) !== 2 || at(x, y + 1) !== 2) { base[i] = theme === 'desert' ? '#ffe680' : theme === 'heaven' ? '#c8d0ff' : '#e8f8ff'; continue; }
        water.push(i); continue;
      }
      if (c === 1) {
        let col = grassColor(theme, P, x, y);
        if (at(x, y + 1) !== 1) col = P.grass[3];
        else if (at(x, y + 2) !== 1 && theme !== 'heaven') col = P.grass[2];
        else if (at(x, y - 1) !== 1) col = P.grass[0];
        base[i] = col; continue;
      }
      let col = groundColor(theme, P, x, y);
      if (at(x, y - 1) === 1 || at(x, y - 2) === 1 && (x + y) % 2) col = drk(C(typeof col === 'string' ? col : col), 0.22);
      base[i] = col;
    }
    const out = [];
    for (let f = 0; f < frames; f++) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      const g = cv.getContext('2d'), img = g.createImageData(W, Hh), d = img.data;
      const put = (i, col) => { const c = typeof col === 'string' ? C(col) : col; d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255; };
      for (let i = 0; i < base.length; i++) if (base[i]) put(i, base[i]);
      for (const i of water) put(i, waterColor(theme, P, i % W, Math.floor(i / W), f));
      g.putImageData(img, 0, 0);
      out.push(cv);
    }
    return out;
  }

  // =====================================================================
  //  VẬT THỂ
  // =====================================================================
  function tree(theme, seed) {
    const b = new Buf(26, 34);
    const cx = 13, by = 33;
    const r = (k) => hash(seed, k);
    if (theme === 'snow') { // thông phủ tuyết
      b.rect(cx - 1.5, by - 8, 3, 7, '#5a3a20', 0.6);
      for (let i = 0; i < 4; i++) { const y = by - 9 - i * 6, w = 11 - i * 2.2; b.poly([[cx - w, y], [cx, y - 9], [cx + w, y]], '#2e5a4a', 1); b.poly([[cx - w + 1, y - 1], [cx, y - 8], [cx + w - 1, y - 1], [cx + w * 0.4, y - 4], [cx - w * 0.5, y - 3]], '#ffffff', 0.4); }
      return b;
    }
    if (theme === 'desert') { // cây khô
      b.curve([[cx, by], [cx - 1, by - 10], [cx + 2, by - 18]], '#7a4a24', (k) => 3.5 - k * 1.8, 0.8);
      b.curve([[cx + 1, by - 13], [cx + 7, by - 16], [cx + 10, by - 23]], '#7a4a24', 1.6, 0.6);
      b.curve([[cx, by - 11], [cx - 6, by - 14], [cx - 9, by - 20]], '#7a4a24', 1.6, 0.6);
      for (const [x, y] of [[cx + 10, by - 24], [cx - 9, by - 21], [cx + 2, by - 19]]) b.ell(x, y, 4, 2.6, '#8a8a3a', 1);
      return b;
    }
    if (theme === 'cave') { // nấm khổng lồ
      b.rect(cx - 2.5, by - 14, 5, 13, '#e8dcc8', 0.8);
      b.ell(cx, by - 17, 11, 6.5, '#8a4ac8', 1);
      for (let i = 0; i < 6; i++) b.ell(cx - 8 + i * 3.2, by - 19 + (i % 2) * 2, 1.2, 1.2, '#e8c8ff', 0);
      b.ell(cx - 7, by - 3, 4, 3, '#3a9a8a', 1); b.ell(cx + 7, by - 2, 3.4, 2.6, '#3a9a8a', 1);
      return b;
    }
    const willow = theme === 'city' || theme === 'river';
    b.poly([[cx - 2.5, by], [cx - 1.5, by - 12], [cx + 1.5, by - 12], [cx + 2.5, by]], '#6a4424', 0.8);
    b.line(cx - 4, by, cx - 2, by - 2, '#6a4424'); b.line(cx + 4, by, cx + 2, by - 2, '#6a4424');
    const leaf = theme === 'heaven' ? ['#4a9a5a', '#6ab86a'] : willow ? ['#4a8a3a', '#6aaa4a'] : ['#2e6a2e', '#4a8a3a'];
    if (willow) {
      b.ell(cx, by - 20, 11, 8, leaf[0], 1);
      for (let i = 0; i < 11; i++) { const x = cx - 10 + i * 2; b.line(x, by - 19, x + (r(i) - 0.5) * 2, by - 19 + 7 + r(i + 9) * 8, i % 2 ? leaf[1] : leaf[0], 1.3); }
      b.ell(cx - 2, by - 23, 7, 4.5, leaf[1], 1);
      return b;
    }
    const blobs = [[0, -21, 9.5], [-6, -16, 6.5], [6, -16, 6.5], [-4, -26, 6], [4, -26, 5.6], [0, -29, 4.5]];
    for (const [x, y, rr] of blobs) b.ell(cx + x, by + y, rr, rr * 0.92, leaf[0], 1);
    for (const [x, y, rr] of blobs.slice(3)) b.ell(cx + x - 1, by + y - 1, rr * 0.6, rr * 0.5, leaf[1], 0.6);
    const dot = theme === 'heaven' ? '#ffb4c8' : '#ffb02a';
    for (let i = 0; i < (theme === 'heaven' ? 16 : 6); i++) b.px(cx - 8 + r(i) * 16, by - 30 + r(i + 20) * 18, i % 3 && theme === 'heaven' ? '#ffffff' : dot);
    return b;
  }

  function pillar(theme, x, y, M) {
    const bottom = y === ROWS - 1;
    const wl = (dx) => M.tiles[y] && M.tiles[y][x + dx] === '#';
    const above = y > 0 && M.tiles[y - 1][x] === '#';
    if (bottom) { // lan can / đá thấp
      const b = new Buf(17, 12);
      if (theme === 'heaven' || theme === 'city') {
        const stone = theme === 'heaven' ? '#f4f0fa' : '#a49a88';
        b.rect(0, 3, 17, 2, stone, 0.6); b.rect(0, 9, 17, 2, stone, 0.6);
        for (const px of [2, 8, 14]) b.rect(px - 1, 2, 2.5, 9, stone, 0.6);
        b.rect(0, 2, 17, 1, theme === 'heaven' ? '#e8c45a' : '#6a6256', 0);
      } else { const P = PAL[theme]; b.ell(5, 7, 5, 4, P.ground[2], 1); b.ell(12, 8, 4.5, 3.4, P.ground[3], 1); if (theme === 'snow') { b.ell(5, 4.5, 4, 1.6, '#ffffff', 0.3); b.ell(12, 6, 3.4, 1.3, '#ffffff', 0.3); } }
      return { b, h: 12 };
    }
    if (theme === 'heaven') {
      const b = new Buf(16, 34);
      b.ell(8, 31, 7.5, 2.6, '#ffffff', 0.5);
      b.rect(3.5, 5, 9, 25, '#c8302a', 1);
      for (const yy of [10, 18, 24]) b.rect(3.5, yy, 9, 1.3, '#e8c45a', 0.4);
      b.curve([[4, 26], [12, 22], [5, 13]], '#ffd65a', 1, 0); // rồng cuốn
      b.rect(2, 2, 12, 3.5, '#e8c45a', 0.8); b.rect(1.5, 29, 13, 3, '#e8c45a', 0.8);
      return { b, h: 34 };
    }
    if (theme === 'city') {
      const b = new Buf(17, 27);
      const top = '#b8b0a0', face = '#8a8274';
      b.rect(0, above ? 0 : 6, 17, above ? 21 : 15, face, 0);
      for (let r2 = 0; r2 < 5; r2++) { const yy = (above ? 1 : 8) + r2 * 4; b.line(0, yy, 16, yy, '#6a6256'); for (let k = 0; k < 3; k++) { const xx = ((k * 6 + (r2 % 2) * 3) % 17); b.line(xx, yy, xx, yy + 3, '#6a6256'); } }
      b.rect(0, 21, 17, 6, drk(C(face), 0.2), 0);
      if (!above) { b.rect(0, 3, 17, 4, top, 0.5); for (const mx of wl(-1) && wl(1) ? [1, 7, 13] : [2, 9]) b.rect(mx, 0, 4, 4, top, 0.6); }
      return { b, h: 27 };
    }
    const P = PAL[theme] || PAL.forest;
    const rockC = { forest: ['#9a9a8a', '#6a6a5e'], river: ['#8a9a8a', '#5e6a5e'], desert: ['#c06a3a', '#8a3a1e'], cave: ['#7a6a8a', '#4a3e58'], snow: ['#c8d4e2', '#8a9aac'] }[theme] || ['#8a8a8a', '#5a5a5a'];
    const b = new Buf(18, 24);
    const rr = hash(x, y);
    if (rr < 0.3) { // cụm đá tròn
      b.ell(9, 22, 8.5, 2.4, drk(C(P.ground[2]), 0.3), 0);
      b.ell(6, 15, 5.5, 6.5, rockC[0], 1); b.ell(12.5, 17, 4.6, 5, rockC[0], 1); b.ell(9, 20, 4, 2.6, rockC[1], 1);
      if (theme === 'snow') { b.ell(6, 10.5, 4, 2, '#ffffff', 0.3); b.ell(12.5, 13, 3.4, 1.6, '#ffffff', 0.3); }
      if (theme === 'forest' || theme === 'river') b.ell(10, 21, 3, 1.4, '#4a8a3a', 0.6);
      if (hash(y * 3, x * 5) > 0.5) b.mirrorX();
      return { b, h: 24 };
    }
    b.ell(9, 22, 8.5, 2.4, drk(C(P.ground[2]), 0.3), 0);
    b.poly([[1, 22], [2 + rr * 2, 10], [7, 3 + rr * 3], [12, 5], [16 - rr, 11], [17, 22]], rockC[0], 1);
    b.poly([[7, 3 + rr * 3], [12, 5], [10, 13], [6, 12]], lit(C(rockC[0]), 0.25), 0.3);
    b.line(8, 14, 11, 20, rockC[1]); b.line(4, 16, 6, 21, rockC[1]);
    if (theme === 'forest' || theme === 'river') { b.ell(4, 20, 3, 1.6, '#4a8a3a', 0.6); b.ell(14, 21, 2.6, 1.4, '#4a8a3a', 0.6); }
    if (theme === 'snow') { b.poly([[2 + rr * 2, 10], [7, 3 + rr * 3], [12, 5], [16 - rr, 11], [12, 9], [7, 8]], '#ffffff', 0.3); }
    if (theme === 'cave' && rr > 0.4) { b.poly([[12, 8], [14, 1], [15, 9]], '#7ad8e8', 0.4); b.poly([[4, 12], [3, 6], [6, 11]], '#c89aff', 0.4); }
    if (hash(y * 3, x * 5) > 0.5) b.mirrorX();
    return { b, h: 24 };
  }

  function house(theme, tw, thh) {
    const w = tw * AP, hgt = thh * AP;
    const b = new Buf(w + 8, hgt + 20);
    const x0 = 4, by = hgt + 18;
    if (theme === 'desert') {
      b.ell(x0 + w / 2, by - 1, w / 2 + 2, 2.6, '#a87a40', 0);
      b.rect(x0 + 1, by - hgt + 4, w - 2, hgt - 4, '#d8a070', 1);
      b.ell(x0 + w / 2, by - hgt + 4, w * 0.32, w * 0.28, '#e8b880', 1);
      b.rect(x0 + w / 2 - 1, by - hgt - w * 0.28, 2, 3, '#e8c45a', 0);
      b.poly([[x0 + w / 2 - 3, by], [x0 + w / 2 - 3, by - 7], [x0 + w / 2, by - 10], [x0 + w / 2 + 3, by - 7], [x0 + w / 2 + 3, by]], '#5a2a14', 0.3);
      for (const sx of [0.22, 0.78]) if (tw > 1) b.rect(x0 + w * sx - 1.5, by - hgt + 9, 3, 4, '#5a2a14', 0);
      return b;
    }
    const roofs = { heaven: ['#ffe08a', '#d4a53c', '#8a6421'], city: ['#6a7a8e', '#3d4a5c', '#232a36'], forest: ['#e0b46a', '#b8863a', '#6a4a1a'], river: ['#7a8a6a', '#4a5a3e', '#2a3424'], cave: ['#7a6a8a', '#4a3a5a', '#2a1e34'], snow: ['#9aa8b8', '#5a6a7a', '#3a4450'] }[theme] || ['#6a7a8e', '#3d4a5c', '#232a36'];
    const wall = theme === 'forest' || theme === 'cave' ? '#c8a06a' : '#f0e6d0';
    const col = theme === 'heaven' ? '#c8302a' : theme === 'city' ? '#a8322a' : '#7a4a24';
    const wallTop = by - hgt * 0.62 - 2;
    // nền đá
    b.rect(x0 - 1, by - 3, w + 2, 3, '#a49a8a', 0.5);
    // tường + cột
    b.rect(x0 + 1, wallTop, w - 2, by - 3 - wallTop, wall, 0.6);
    const n = tw * 2;
    for (let i = 0; i <= n; i++) b.rect(x0 + 1 + (i * (w - 3)) / n, wallTop, 1.6, by - 3 - wallTop, col, 0.4);
    // cửa + song cửa
    b.rect(x0 + w / 2 - 2.5, by - 3 - (by - wallTop) * 0.62, 5, (by - wallTop) * 0.62, '#4a2414', 0.4);
    b.px(x0 + w / 2 + 1, by - 6, '#e8c45a');
    for (const sx of tw > 1 ? [0.2, 0.8] : []) { const wx = x0 + w * sx - 2.5, wy = wallTop + 3; b.rect(wx, wy, 5, 4, '#6a3a1a', 0); b.line(wx + 2.5, wy, wx + 2.5, wy + 3, '#e8d8b0'); b.line(wx, wy + 2, wx + 4.5, wy + 2, '#e8d8b0'); }
    // mái cong nhiều lớp ngói
    const rt = wallTop - 8 - thh * 2, eave = wallTop + 2;
    b.poly([[x0 - 4, eave - 1], [x0 + 2, eave - 2], [x0 + 5, rt + 1], [x0 + w - 5, rt + 1], [x0 + w - 2, eave - 2], [x0 + w + 4, eave - 1], [x0 + w + 3, eave + 1], [x0 - 3, eave + 1]], roofs[1], 1);
    for (let yy = rt + 3; yy < eave; yy += 2) b.line(x0 + 3 - (yy - rt) * 0.5, yy, x0 + w - 3 + (yy - rt) * 0.5, yy, (yy - rt) % 4 ? roofs[2] : roofs[0]);
    for (let k = 1; k < tw * 4; k++) { const xx = x0 + (k * w) / (tw * 4); b.line(xx, rt + 2, x0 + w / 2 + (xx - x0 - w / 2) * 1.25, eave, drk(C(roofs[1]), 0.25)); }
    b.rect(x0 + 3, rt - 1, w - 6, 2.5, roofs[2], 0.4);
    b.ell(x0 + 3, rt, 1.8, 1.8, roofs[0], 0.6); b.ell(x0 + w - 3, rt, 1.8, 1.8, roofs[0], 0.6);
    b.line(x0 - 4, eave - 1, x0 - 6, eave - 4, roofs[0]); b.line(x0 + w + 4, eave - 1, x0 + w + 6, eave - 4, roofs[0]);
    if (theme === 'snow') { b.poly([[x0 + 4, rt + 1], [x0 + w - 4, rt + 1], [x0 + w - 1, rt + 5], [x0 + 1, rt + 5]], '#ffffff', 0.3); b.rect(x0 - 3, eave - 1, w + 6, 1.4, '#ffffff', 0); }
    if (theme !== 'forest' && theme !== 'cave') for (const sx of [0, 1]) { const lx = x0 + 1 + sx * (w - 2); b.line(lx, eave + 1, lx, eave + 3, '#3a1e14'); b.ell(lx, eave + 5, 1.8, 2.4, '#e0402a', 0.6); }
    return b;
  }

  function buildObjects(M) {
    const objs = [], lights = [];
    const used = new Set();
    const k = (cv) => ({ cv, w: cv.width, h: cv.height });
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = M.tiles[y][x];
      if (ch === 'T') { const cv = render(tree(M.theme, x * 7 + y * 13), 1); objs.push({ ...k(cv), x: x * AP + AP / 2 - cv.width / 2, y: (y + 1) * AP - cv.height + 3, z: y + 0.9 }); }
      if (ch === '#') { const { b } = pillar(M.theme, x, y, M); const cv = render(b, 1); objs.push({ ...k(cv), x: x * AP + AP / 2 - cv.width / 2, y: (y + 1) * AP - cv.height + 1, z: y + 0.95 }); }
      if (ch === 'H' && !used.has(x + ',' + y)) {
        let tw = 1, thh = 1;
        if (M.tiles[y][x + 1] === 'H' && !used.has(x + 1 + ',' + y)) tw = 2;
        if (M.tiles[y + 1] && M.tiles[y + 1][x] === 'H' && (tw === 1 || M.tiles[y + 1][x + 1] === 'H')) thh = 2;
        for (let dy = 0; dy < thh; dy++) for (let dx = 0; dx < tw; dx++) used.add(x + dx + ',' + (y + dy));
        const cv = render(house(M.theme, tw, thh), 1);
        objs.push({ ...k(cv), x: x * AP - 5, y: (y + thh) * AP - cv.height + 1, z: y + thh - 0.05 });
        lights.push([(x + tw / 2), (y + thh) - 0.4, 1.3 + tw * 0.4]);
      }
    }
    M.tiles.forEach((row, y) => { const x = row.indexOf('P'); if (x >= 0) lights.push([x + 0.5, y + 0.6, 1.4, '255,220,140']); });
    return { objs, lights };
  }

  const cache = new Map();
  function build(M) {
    const key = M.name + '|' + M.theme;
    if (!cache.has(key)) cache.set(key, { ground: buildGround(M), ...buildObjects(M) });
    return cache.get(key);
  }

  // =====================================================================
  //  PHÔNG TRẬN ĐẤU (pixel, trời dither)
  // =====================================================================
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function skyFill(b, stops, y0, y1) {
    const cs = stops.map(C);
    for (let y = y0; y < y1; y++) {
      const t = ((y - y0) / Math.max(1, y1 - y0)) * (cs.length - 1);
      const i = Math.min(cs.length - 2, Math.floor(t)), f = t - i;
      for (let x = 0; x < b.w; x++) b.d[y * b.w + x] = f * 16 > BAYER[y % 4][x % 4] + 0.5 ? cs[i + 1] : cs[i];
    }
  }
  function ditherBand(b, y0, y1, c1, c2) { const a = C(c1), z = C(c2); for (let y = y0; y < y1; y++) { const f = (y - y0) / (y1 - y0); for (let x = 0; x < b.w; x++) b.d[y * b.w + x] = f * 16 > BAYER[y % 4][x % 4] + 0.5 ? z : a; } }
  // dãy núi: nhiễu gờ (ridged) → đỉnh tự nhiên; sườn trái sáng, sườn phải tối; tuỳ chọn mũ tuyết
  function range(b, base, amp, rough, col, seed, peaks = 3, cap) {
    const c = C(col), hi = lit(c, 0.22), lo = drk(c, 0.22), snow = C('#ffffff'), snowLo = C('#c8d8ec');
    const hts = [];
    for (let x = 0; x < b.w; x++) {
      const t = (x / b.w) * peaks * 1.4 + seed * 3.1;
      let r = 0, a = 1, f = 1;
      for (let k = 0; k < 3; k++) { r += a * (1 - Math.abs(2 * vn(t * f, seed * 5 + k * 17) - 1)); a *= 0.45; f *= 2.3; }
      r /= 1.65;
      hts.push(Math.round(base - amp * r * r * 1.35 - (vn(x / 3 + seed * 9, seed) - 0.5) * rough * 0.4));
    }
    for (let x = 0; x < b.w; x++) {
      const top = hts[x], slope = (hts[Math.min(b.w - 1, x + 1)] - hts[Math.max(0, x - 1)]) / 2;
      for (let y = Math.max(0, top); y < b.h; y++) {
        const dep = y - top;
        let v = slope < -0.4 && dep < 5 + -slope * 4 ? hi : slope > 0.4 && dep < 4 + slope * 4 ? lo : c;
        if (dep < 22 && vn(x / 1.6 + seed, y / 4) > 0.74) v = lo;
        if (cap && y < base - amp * 0.55 && dep < 3 + (hash(x, 3) * 3 | 0)) v = slope > 0.4 ? snowLo : snow;
        b.d[y * b.w + x] = v;
      }
    }
  }
  function cloudBank(b, y, n, col, seed) { for (let i = 0; i < n; i++) { const x = hash(i, seed) * b.w, w = 8 + hash(seed, i) * 14; b.ell(x, y + (hash(i + 3, seed) - 0.5) * 8, w, w * 0.32, col, 0.6); b.ell(x - w * 0.3, y - 3, w * 0.45, w * 0.28, col, 0.6); } }
  function pagoda(b, x, base, lv, col, wall) { for (let i = 0; i < lv; i++) { const w = 12 - i * 2, y = base - i * 8; b.rect(x - w * 0.4, y - 5, w * 0.8, 5, wall, 0.5); b.poly([[x - w, y - 4], [x - w * 0.6, y - 8], [x + w * 0.6, y - 8], [x + w, y - 4]], col, 0.8); } b.line(x, base - lv * 8 - 6, x, base - lv * 8, col); }

  const bgCache = {};
  const groundPal = (theme) => (PAL[theme] ? PAL[theme].ground : theme === 'arena' ? ['#b8603a', '#8a3a2a', '#6a2a1e', '#3a140e'] : theme === 'world' ? ['#4a7a9a', '#3a6080', '#2a4a68', '#1a3050'] : PAL.forest.ground);
  function battleBG(theme) {
    if (bgCache[theme]) return bgCache[theme];
    let b = new Buf(128, 240);
    const G = 138; // đường chân trời → mặt đất
    const SK = {
      heaven: ['#6a5aa8', '#a890d8', '#f0d0e8', '#fff0c8'], city: ['#3a1e3a', '#a8485a', '#f0905a', '#ffd08a'], forest: ['#2a5a5a', '#5a9a8a', '#b8e0c0', '#f0f8d8'],
      river: ['#3a6a9a', '#7ab0d0', '#c8e8f0', '#f8f8e8'], desert: ['#3a0a0a', '#8a2a14', '#e0602a', '#ffc070'], cave: ['#0a0612', '#1a1024', '#2a1e3a', '#3a2a4a'],
      snow: ['#5a7aa8', '#9ab8d8', '#d8e8f4', '#ffffff'], arena: ['#1a0606', '#3a0e0e', '#6a1a14', '#8a2a1a'], world: ['#060a14', '#10203a', '#1e3a5a', '#3a5a7a'], login: ['#0a1428', '#2a1e3a', '#7a3a3a', '#d8804a'],
    }[theme] || ['#2a3a5a', '#6a8ab0', '#c8d8e8', '#ffffff'];
    skyFill(b, SK, 0, theme === 'login' ? 200 : G);
    const sunAt = (x, y, r, c1, c2) => {
      const h = C(c2), R = r + 9;
      for (let yy = Math.floor(y - R); yy <= y + R; yy++) for (let xx = Math.floor(x - R); xx <= x + R; xx++) {
        const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y); if (d < r || d > R || yy < 0 || xx < 0 || xx >= b.w) continue;
        const f = 1 - (d - r) / (R - r), cur = b.d[yy * b.w + xx] || h;
        if (f * 16 > BAYER[yy & 3][xx & 3] + 0.5) b.d[yy * b.w + xx] = mix(cur, h, 0.45);
      }
      b.ell(x, y, r, r, c1, 0.3);
    };
    if (theme === 'heaven') {
      sunAt(92, 62, 12, '#fff8e0', '#ffe8a0');
      cloudBank(b, 70, 6, '#ffffff', 2);
      pagoda(b, 30, 118, 4, '#e8c45a', '#c8302a'); pagoda(b, 98, 112, 3, '#e8c45a', '#c8302a');
      range(b, 132, 6, 6, '#f4eefc', 3, 5); cloudBank(b, 130, 9, '#ffffff', 5);
    } else if (theme === 'city') {
      sunAt(32, 70, 11, '#fff0c0', '#ffc070');
      range(b, 118, 18, 8, '#7a3a4a', 1.2, 2);
      b.rect(0, 120, 128, 18, '#3a1e2a', 0); for (let x = 0; x < 128; x += 6) b.rect(x, 116, 4, 4, '#3a1e2a', 0);
      pagoda(b, 100, 120, 5, '#2a141c', '#2a141c');
      b.poly([[38, 122], [44, 112], [84, 112], [90, 122]], '#24101a', 0); b.rect(46, 112, 36, 10, '#24101a', 0);
      for (let i = 0; i < 9; i++) { const x = 8 + i * 14, y = 104 + Math.sin(i) * 3; b.line(x, y - 4, x, y - 1, '#2a141c'); b.ell(x, y + 1, 1.6, 2.2, '#ff5a2a', 0); b.px(x, y + 1, '#ffd65a'); }
    } else if (theme === 'forest') {
      sunAt(98, 58, 10, '#ffffe8', '#e8f8c8');
      range(b, 110, 44, 12, '#6a9a8a', 0.4, 3);
      b.rect(34, 78, 4, 40, '#e8fbff', 0.4); b.rect(35, 78, 1, 40, '#ffffff', 0); b.ell(36, 118, 9, 3, '#ffffff', 0.3);
      ditherBand(b, 96, 112, '#8ab8a8', '#a8d0c0');
      range(b, 134, 22, 10, '#3a7a5a', 2.1, 4);
      for (let i = 0; i < 12; i++) { const x = hash(i, 9) * 128, h = 14 + hash(9, i) * 16; b.poly([[x - 5, 139], [x, 139 - h], [x + 5, 139]], '#1e4a2e', 0.6); }
    } else if (theme === 'river') {
      sunAt(30, 62, 10, '#ffffff', '#f8f0c8');
      cloudBank(b, 58, 4, '#ffffff', 7);
      range(b, 108, 26, 10, '#7aa098', 0.9, 3);
      ditherBand(b, 112, 138, '#3aa8b8', '#2a8098');
      for (let i = 0; i < 18; i++) { const x = hash(i, 4) * 120, y = 116 + hash(4, i) * 20; b.line(x, y, x + 5, y, '#bff0f4'); }
      b.poly([[76, 128], [98, 128], [94, 132], [80, 132]], '#5a3a20', 0.5); b.poly([[86, 128], [86, 114], [94, 126]], '#f2ead8', 0.5);
      for (let i = 0; i < 10; i++) { const x = hash(i, 11) * 128; b.line(x, 139, x - 1, 128, '#3a6a3a'); b.line(x + 2, 139, x + 3, 130, '#4a8a4a'); }
    } else if (theme === 'desert') {
      sunAt(64, 100, 18, '#ffd880', '#ff8a3a');
      b.poly([[34, 132], [56, 92], [72, 92], [94, 132]], '#4a140e', 0.6); b.poly([[56, 92], [72, 92], [68, 98], [60, 98]], '#ff7a2a', 0.2);
      b.line(62, 98, 54, 132, '#ff6a2a', 2); b.line(66, 98, 76, 132, '#ff6a2a', 2);
      for (let i = 0; i < 5; i++) b.ell(64 + (hash(i, 2) - 0.5) * 8, 84 - i * 10, 6 + i * 3, 3 + i * 1.5, '#2a0c08', 0.4);
      range(b, 130, 8, 6, '#a8502a', 1.7, 3); range(b, 136, 5, 4, '#c87a3a', 2.5, 5);
    } else if (theme === 'cave') {
      range(b, 112, 50, 14, '#2a2038', 0.3, 3);
      for (let i = 0; i < 9; i++) { const x = 6 + i * 14 + hash(i, 5) * 6, h = 18 + hash(5, i) * 30; b.poly([[x - 5, 28], [x, 28 + h], [x + 5, 28]], '#1a1222', 0.6); }
      b.rect(0, 0, 128, 30, '#140e1c', 0);
      range(b, 128, 24, 10, '#3a2e4a', 2.2, 4);
      for (let i = 0; i < 10; i++) { const x = 4 + hash(i, 8) * 120, y = 128 + hash(8, i) * 8, c = ['#7ad8c8', '#b88ae8', '#5ab0e8'][i % 3], h = 6 + hash(i, 2) * 9;
        sunAt(x, y - h / 2, 1, c, mix(C(c), C('#2a1e3a'), 0.5));
        b.poly([[x - 2.5, y], [x - 0.5, y - h], [x + 2.5, y]], c, 0.5); b.poly([[x + 1.5, y], [x + 4, y - h * 0.55], [x + 5, y]], lit(C(c), 0.2), 0.4); }
      range(b, 136, 6, 8, '#241c30', 3.3, 4);
    } else if (theme === 'snow') {
      sunAt(94, 60, 10, '#ffffff', '#eef4ff');
      range(b, 118, 52, 14, '#b8c8dc', 0.7, 2.5, true);
      for (let i = 0; i < 128; i++) for (let y = 0; y < b.h; y++) { const c = b.d[y * b.w + i]; if (c && y > 74 && y < 118 && (i + y) % 5 === 0 && vn(i / 5, y / 5) < 0.4) b.d[y * b.w + i] = C('#a8bcd8'); }
      ditherBand(b, 118, 138, '#c8e0f4', '#a8cce8');
      for (let i = 0; i < 10; i++) b.line(hash(i, 1) * 120, 122 + hash(1, i) * 14, hash(i, 1) * 120 + 10, 122 + hash(1, i) * 14, '#ffffff');
    } else if (theme === 'arena') {
      for (let i = 0; i < 5; i++) { const x = 6 + i * 28; b.rect(x, 48, 8, 90, '#5a1010', 0.8); b.rect(x - 1, 46, 10, 4, '#d4a53c', 0.5); b.poly([[x + 10, 56], [x + 18, 56], [x + 18, 86], [x + 14, 82], [x + 10, 86]], '#a8322a', 0.6); b.ell(x + 4, 40, 3, 4, '#ffb040', 0.3); b.px(x + 4, 39, '#fff6c8'); }
    } else if (theme === 'world') {
      cloudBank(b, 46, 8, '#0e1a28', 3); cloudBank(b, 70, 6, '#22384e', 6);
      b.line(84, 34, 78, 62, '#e8f6ff'); b.line(78, 62, 86, 62, '#e8f6ff'); b.line(86, 62, 76, 96, '#e8f6ff');
      range(b, 126, 10, 8, '#1b3a52', 4.1, 6); ditherBand(b, 126, 138, '#24506e', '#2a6a8a');
    } else if (theme === 'login') {
      sunAt(94, 46, 14, '#fff4d0', '#ffd890');
      for (let i = 0; i < 40; i++) b.px(hash(i, 3) * 128, hash(3, i) * 70, hash(i, i) > 0.5 ? '#ffffff' : '#c8c0e0');
      range(b, 150, 60, 10, '#5a3a4a', 1.1, 2, true); cloudBank(b, 150, 8, '#8a5a5a', 9); range(b, 182, 46, 12, '#2e1a26', 2.6, 3); range(b, 214, 30, 10, '#1a0e16', 4.4, 4);
      cloudBank(b, 178, 10, '#5a4a50', 4);
    }
    // cắt bớt bầu trời → chân trời cao hơn, khớp với bàn cờ
    if (theme !== 'login') {
      const CUT = 28, out = new Buf(b.w, b.h), G2 = G - CUT;
      for (let y = 0; y < G2; y++) for (let x = 0; x < b.w; x++) out.d[y * b.w + x] = b.d[(y + CUT) * b.w + x];
      const P = groundPal(theme);
      for (let y = G2; y < b.h; y++) for (let x = 0; x < b.w; x++) {
        const dz = y - G2 + 4, Z = 520 / dz, X = ((x - 64) * Z) / 70, depth = (y - G2) / (b.h - G2);
        const n = fbm(X * 0.32, Z * 0.32), fine = hash(Math.floor(X * 1.2), Math.floor(Z * 1.2));
        let c = n > 0.62 ? P[0] : n > 0.45 ? P[1] : n > 0.32 ? P[2] : P[3];
        if (fine > 0.93 && depth > 0.25) c = n > 0.5 ? P[2] : P[0];
        if (y - G2 < 2) c = P[3];
        // sương mỏng nơi chân trời
        const hz = Math.max(0, 1 - (y - G2) / 22);
        let v = C(c); v = mix(v, C(SK[3]), hz * 0.55);
        out.d[y * b.w + x] = hz * 16 > BAYER[y & 3][x & 3] + 6 ? mix(v, C(SK[3]), 0.3) : v;
      }
      // đá nhỏ, cỏ – to dần về phía trước (phối cảnh)
      for (let i = 0; i < 46; i++) {
        const k = Math.pow(hash(i, 77), 0.7), y = G2 + 6 + k * (b.h - G2 - 8), x = hash(77, i) * b.w, sz = 0.7 + k * 2.6;
        const r = hash(i, i + 5);
        if (r < 0.45) out.ell(x, y, sz * 1.6, sz, P[r < 0.2 ? 0 : 2], 1);
        else if (theme === 'forest' || theme === 'river' || theme === 'city') { for (let j = -1; j <= 1; j++) out.line(x + j * sz, y, x + j * sz * 1.6, y - sz * 2.2, j ? '#4a8a3a' : '#6aaa4a'); }
        else if (theme === 'snow') out.ell(x, y, sz * 2, sz * 0.8, '#ffffff', 0.4);
        else out.line(x - sz * 2, y, x + sz * 2, y, P[3]);
      }
      b = out;
    }
    const cv = render(b, 1, false);
    return (bgCache[theme] = cv.toDataURL());
  }

  // ---------- mặt bàn cờ (pixel) cho .b-board ----------
  const boardCache = {};
  function boardTex(theme) {
    if (boardCache[theme]) return boardCache[theme];
    const TL = {
      heaven: ['#f6f0ff', '#d6caf0', '#e8c45a'], city: ['#c8b48e', '#a08a64', '#6a5a40'], forest: ['#a8c890', '#82a46c', '#5a7a3a'], river: ['#b8d4ac', '#8cb09a', '#4a7a6a'],
      desert: ['#ecc48a', '#cc9a5c', '#8a5a2a'], cave: ['#6e5e80', '#4c405c', '#2e2638'], snow: ['#ffffff', '#cddff0', '#8aa0c0'], arena: ['#d8b07a', '#8a2a22', '#4a1410'], world: ['#90c6d8', '#4e8aa0', '#24506a'],
    }[theme] || ['#c8b48e', '#a08a64', '#6a5a40'];
    const S = 12, N = 4, b = new Buf(S * N, S * N);
    for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
      const base = C(TL[(tx + ty) % 2]), x0 = tx * S, y0 = ty * S;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const X = x0 + x, Y = y0 + y, n = vn(X / 3 + tx * 7, Y / 3 + ty * 5);
        let v = n > 0.66 ? lit(base, 0.12) : n < 0.3 ? drk(base, 0.1) : base;
        if (x === 0 || y === 0) v = lit(base, 0.28);
        if (x === S - 1 || y === S - 1) v = drk(base, 0.3);
        b.d[Y * b.w + X] = v;
      }
      const r = hash(tx, ty);
      if (r > 0.55) { const cx = x0 + 3 + r * 6, cy = y0 + 3; b.line(cx, cy, cx + 2, cy + 3, drk(base, 0.35)); b.line(cx + 2, cy + 3, cx + 1, cy + 6, drk(base, 0.35)); }
      if (theme === 'heaven' && (tx + ty) % 2 === 0) { b.px(x0 + 5, y0 + 6, TL[2]); b.px(x0 + 6, y0 + 5, TL[2]); b.px(x0 + 6, y0 + 6, lit(C(TL[2]), 0.4)); b.px(x0 + 7, y0 + 6, TL[2]); b.px(x0 + 6, y0 + 7, TL[2]); }
      if ((theme === 'forest' || theme === 'river') && r < 0.35) for (let k = 0; k < 5; k++) b.px(x0 + 1 + hash(k, r * 99) * 3, y0 + S - 2 - hash(r * 99, k) * 4, '#4a7a34');
      if (theme === 'snow' && r < 0.4) b.ell(x0 + 3, y0 + S - 3, 3, 1.5, '#ffffff', 0);
      if (theme === 'desert' && r < 0.3) b.line(x0 + 2, y0 + 8, x0 + 8, y0 + 9, TL[2]);
    }
    return (boardCache[theme] = render(b, 1, false).toDataURL());
  }

  return { build, battleBG, boardTex, AP, PAL };
})();
