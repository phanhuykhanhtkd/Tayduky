// =====================================================================
//  PIXEL ART: bộ vẽ điểm ảnh có đổ bóng khối + viền chọn màu,
//  và toàn bộ nhân vật / NPC / boss / 28 loài Tiên sủng của game.
//  Mọi hình đều tự vẽ (không dùng tài nguyên của game gốc).
// =====================================================================
const Pix = (() => {
  // ---------- màu ----------
  const H = (s) => { s = s.replace('#', ''); if (s.length === 3) s = s.split('').map((c) => c + c).join(''); return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const LIGHT = [255, 248, 225], DARK = [28, 12, 26];
  const lit = (c, t) => mix(c, LIGHT, t), drk = (c, t) => mix(c, DARK, t);
  const C = (c) => (c == null ? null : typeof c === 'string' ? H(c) : c);

  // ---------- bộ đệm điểm ảnh ----------
  class Buf {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
    set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = c; }
    get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.d[y * this.w + x]; }
    // l: độ sáng -1..1 → 4 sắc độ
    tone(c, l) { if (!c) return null; return l > 0.32 ? lit(c, 0.3) : l > 0.02 ? c : l > -0.38 ? drk(c, 0.2) : drk(c, 0.4); }
    // khối cầu
    ell(cx, cy, rx, ry, c, sh = 1) {
      c = C(c);
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, r2 = dx * dx + dy * dy;
        if (r2 > 1) continue;
        if (!c) { this.set(x, y, null); continue; }
        const dz = Math.sqrt(1 - r2);
        const l = sh ? (-0.5 * dx - 0.62 * dy + 0.6 * dz) - 0.45 : 0.1;
        this.set(x, y, this.tone(c, l * sh));
      }
      return this;
    }
    // khối trụ (bóng theo chiều ngang)
    rect(x0, y0, w, h, c, sh = 1) {
      c = C(c);
      for (let y = Math.floor(y0); y < y0 + h; y++) for (let x = Math.floor(x0); x < x0 + w; x++) {
        if (!c) { this.set(x, y, null); continue; }
        const dx = w > 1 ? ((x + 0.5 - x0) / w) * 2 - 1 : 0;
        const l = sh ? (-0.55 * dx + 0.55 * Math.sqrt(Math.max(0, 1 - dx * dx))) - 0.35 : 0.1;
        this.set(x, y, this.tone(c, l * sh));
      }
      return this;
    }
    // đa giác, bóng theo vị trí trong khung bao
    poly(pts, c, sh = 1) {
      c = C(c);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const px = x + 0.5, py = y + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (!inside) continue;
        if (!c) { this.set(x, y, null); continue; }
        const dx = x1 > x0 ? ((px - x0) / (x1 - x0)) * 2 - 1 : 0, dy = y1 > y0 ? ((py - y0) / (y1 - y0)) * 2 - 1 : 0;
        const l = sh ? (-0.45 * dx - 0.5 * dy) * 0.8 + 0.05 : 0.1;
        this.set(x, y, this.tone(c, l * sh));
      }
      return this;
    }
    line(x0, y0, x1, y1, c, w = 1) {
      c = C(c);
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) this.set(x + a - (w - 1) / 2, y + b - (w - 1) / 2, c);
      }
      return this;
    }
    // đường cong bậc hai dày (dùng cho đuôi, râu, sừng)
    curve(pts, c, w = 2, sh = 0.6) {
      c = C(c);
      const n = 40;
      for (let i = 0; i <= n; i++) {
        const t = i / n, [a, b, d] = pts;
        const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * d[0];
        const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * d[1];
        const ww = typeof w === 'function' ? w(t) : w;
        this.ell(x, y, ww / 2 + 0.01, ww / 2 + 0.01, c, sh);
      }
      return this;
    }
    px(x, y, c) { this.set(x, y, C(c)); return this; }
    mirrorX() { const d = this.d.slice(); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.d[y * this.w + x] = d[y * this.w + (this.w - 1 - x)]; return this; }
  }

  // ---------- xuất ra canvas: viền chọn màu + phóng to nearest-neighbor ----------
  function render(b, scale = 4, outline = true) {
    const out = b.d.slice();
    if (outline) {
      for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
        if (b.get(x, y)) continue;
        let n = null;
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const c = b.get(x + dx, y + dy); if (c && !c.noOutline) { n = c; break; } }
        if (n) out[y * b.w + x] = drk(n, 0.72);
      }
    }
    const cv = document.createElement('canvas');
    cv.width = b.w * scale; cv.height = b.h * scale;
    const g = cv.getContext('2d');
    for (let i = 0; i < out.length; i++) {
      const c = out[i]; if (!c) continue;
      g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      g.fillRect((i % b.w) * scale, Math.floor(i / b.w) * scale, scale, scale);
    }
    return cv;
  }

  return { Buf, render, H, mix, lit, drk, C };
})();

// =====================================================================
//  NHÂN VẬT DẠNG NGƯỜI (đầu người hoặc đầu thú) – khung 36×48
// =====================================================================
const Art = (() => {
  const { Buf, render, H, mix, lit, drk } = Pix;
  const SKIN = '#f6d2b0', SKIN_D = '#e0a985', EYE = '#24140e';

  const ELEM = {
    kim: { main: '#e8c45a', light: '#fff2c4', acc: '#a8781e', glow: '#fff3a0' },
    moc: { main: '#5aae4a', light: '#d6f2b4', acc: '#2a6a2c', glow: '#b8ff9a' },
    thuy: { main: '#4a98dc', light: '#d0ecff', acc: '#234e8e', glow: '#a8e6ff' },
    hoa: { main: '#e2522a', light: '#ffd6a0', acc: '#8a1a10', glow: '#ffb070' },
    tho: { main: '#b8844a', light: '#f2daa8', acc: '#6a4422', glow: '#ffe0a0' },
  };

  // ---------------- đầu ----------------
  function humanHead(b, cx, cy, o) {
    const skin = o.skin || SKIN;
    b.ell(cx - 9.5, cy + 1, 1.8, 2.4, skin, 0.7); b.ell(cx + 9.5, cy + 1, 1.8, 2.4, skin, 0.7);
    b.ell(cx, cy, 9.5, 9, skin, 0.8);
    // mắt
    const ey = cy + 1;
    const eye = o.eye || EYE;
    for (const ex of [cx - 4, cx + 3]) {
      if (o.closedEyes) { b.px(ex, ey + 1, eye).px(ex + 1, ey + 1, eye); continue; }
      b.rect(ex, ey - 1, 2, 3, eye, 0); b.px(ex, ey - 1, '#ffffff');
      if (o.eyeColor) b.px(ex + 1, ey + 1, o.eyeColor);
    }
    if (o.brows) { b.line(cx - 5, ey - 3, cx - 2, ey - 3.6, o.brows); b.line(cx + 2, ey - 3.6, cx + 5, ey - 3, o.brows); }
    if (!o.noBlush) { b.px(cx - 6, ey + 3, '#f29a8a'); b.px(cx + 6, ey + 3, '#f29a8a'); }
    b.px(cx, cy + 6, o.mouth || '#b0503a'); if (o.smile) b.px(cx - 1, cy + 5, '#b0503a').px(cx + 1, cy + 5, '#b0503a');
    if (o.manyEyes) for (const [x, y] of [[-7, -3], [6, -3], [-2, -5], [2, -5], [-8, 3], [8, 3]]) { b.px(cx + x, cy + y, '#ffd040'); b.px(cx + x, cy + y + 1, '#2a1a0a'); }
    if (o.thirdEye) { b.px(cx, cy - 4, '#d42a2a').px(cx, cy - 3, '#ffd65a'); }
    if (o.mark) b.px(cx, cy - 4, o.mark);
  }

  function hair(b, cx, cy, o) {
    const hc = o.hair;
    const style = o.hairStyle || 'short';
    if (style === 'bald') { b.px(cx - 2, cy - 7, '#c88a6a').px(cx + 2, cy - 7, '#c88a6a').px(cx, cy - 8, '#c88a6a'); return; }
    // mái tóc trên đầu
    b.poly([[cx - 10, cy + 1], [cx - 9, cy - 6], [cx - 5, cy - 9.5], [cx, cy - 10.5], [cx + 5, cy - 9.5], [cx + 9, cy - 6], [cx + 10, cy + 1], [cx + 7, cy - 3], [cx + 3, cy - 4], [cx + 1, cy - 2.5], [cx - 1, cy - 4], [cx - 4, cy - 3], [cx - 7, cy - 4]], hc, 1);
    if (style === 'long' || style === 'twinlong') { b.rect(cx - 11, cy - 1, 2.5, 12, hc, 0.8); b.rect(cx + 8.5, cy - 1, 2.5, 12, hc, 0.8); }
    if (style === 'bun' || style === 'topknot') { b.ell(cx, cy - 11, 3.5, 3, hc, 1); if (o.pin) b.line(cx - 5, cy - 12, cx + 5, cy - 10, o.pin); }
    if (style === 'twin' || style === 'twinlong') { b.ell(cx - 8, cy - 8, 3.5, 3.5, hc, 1); b.ell(cx + 8, cy - 8, 3.5, 3.5, hc, 1); if (o.pin) { b.px(cx - 8, cy - 12, o.pin); b.px(cx + 8, cy - 12, o.pin); } }
    if (style === 'spiky') for (const [x, h] of [[-8, 5], [-4, 7], [0, 8], [4, 7], [8, 5]]) b.poly([[cx + x - 3, cy - 6], [cx + x, cy - 6 - h], [cx + x + 3, cy - 6]], hc, 1);
    if (style === 'wild') { for (const [x, y] of [[-10, -2], [10, -2], [-8, -9], [8, -9], [0, -12]]) b.ell(cx + x, cy + y, 3.5, 3.5, hc, 1); }
  }

  function hat(b, cx, cy, o) {
    const t = o.hat; if (!t) return;
    const G = '#e8c45a', R = '#c8302a';
    if (t === 'crown') { b.poly([[cx - 6, cy - 7], [cx - 6, cy - 12], [cx - 3, cy - 9], [cx, cy - 14], [cx + 3, cy - 9], [cx + 6, cy - 12], [cx + 6, cy - 7]], G, 1); b.px(cx, cy - 10, R); }
    if (t === 'tiara') { b.rect(cx - 7, cy - 9, 14, 2, G, 0.6); b.ell(cx, cy - 10, 2, 2, R, 1); }
    if (t === 'monk5') { for (let i = -2; i <= 2; i++) b.poly([[cx + i * 4 - 2, cy - 7], [cx + i * 4, cy - 14 + Math.abs(i)], [cx + i * 4 + 2, cy - 7]], i % 2 ? R : G, 1); b.rect(cx - 10, cy - 8, 20, 2, G, 0.6); }
    if (t === 'helmet') { b.ell(cx, cy - 5, 10.5, 7, o.helm || '#8a96a8', 1); b.rect(cx - 11, cy - 2, 22, 2, o.helmTrim || G, 0.6); b.poly([[cx - 1, cy - 11], [cx + 1, cy - 11], [cx + 4, cy - 18], [cx - 2, cy - 15]], o.plume || R, 1); }
    if (t === 'horns') { b.curve([[cx - 6, cy - 6], [cx - 12, cy - 10], [cx - 11, cy - 17]], o.horn || '#efe4cc', (k) => 3.4 - k * 2.6, 1); b.curve([[cx + 6, cy - 6], [cx + 12, cy - 10], [cx + 11, cy - 17]], o.horn || '#efe4cc', (k) => 3.4 - k * 2.6, 1); }
    if (t === 'foxears') { b.poly([[cx - 9, cy - 5], [cx - 9, cy - 15], [cx - 3, cy - 8]], o.hair, 1); b.poly([[cx - 8, cy - 7], [cx - 8, cy - 12], [cx - 5, cy - 8]], '#f4a8c8', 0.3); b.poly([[cx + 9, cy - 5], [cx + 9, cy - 15], [cx + 3, cy - 8]], o.hair, 1); b.poly([[cx + 8, cy - 7], [cx + 8, cy - 12], [cx + 5, cy - 8]], '#f4a8c8', 0.3); }
    if (t === 'turban') { b.ell(cx, cy - 6, 10.5, 6.5, o.turban || '#f2ead8', 1); b.line(cx - 9, cy - 5, cx + 9, cy - 8, drk(H(o.turban || '#f2ead8'), 0.25)); b.ell(cx, cy - 7, 2, 2, '#d42a2a', 1); }
    if (t === 'scholar') { b.rect(cx - 7, cy - 13, 14, 6, '#2a2228', 0.8); b.rect(cx - 13, cy - 10, 26, 1.5, '#2a2228', 0); }
    if (t === 'cap') { b.ell(cx, cy - 7, 9, 4.5, o.capc || '#3a4a6a', 1); b.px(cx, cy - 11, G); }
    if (t === 'flower') { b.ell(cx + 7, cy - 7, 2.5, 2.5, '#ff8fb4', 1); b.px(cx + 7, cy - 7, '#ffe08a'); }
    if (t === 'band') { b.rect(cx - 10, cy - 5, 20, 2, G, 0.6); b.px(cx - 10, cy - 4, '#fff2b0'); }
    if (t === 'halo') { /* vẽ ở lớp sau */ }
    if (t === 'buns2') { b.ell(cx - 7, cy - 9, 3.5, 3.5, o.hair, 1); b.ell(cx + 7, cy - 9, 3.5, 3.5, o.hair, 1); b.rect(cx - 9, cy - 8, 4, 1, R, 0); b.rect(cx + 5, cy - 8, 4, 1, R, 0); }
    if (t === 'rabbitears') { b.ell(cx - 5, cy - 15, 2.6, 7, o.hair || '#ffffff', 1); b.ell(cx + 5, cy - 15, 2.6, 7, o.hair || '#ffffff', 1); b.ell(cx - 5, cy - 15, 1.2, 5, '#f4a8c8', 0); b.ell(cx + 5, cy - 15, 1.2, 5, '#f4a8c8', 0); }
    if (t === 'hood') { b.poly([[cx - 11, cy + 4], [cx - 10, cy - 7], [cx, cy - 12], [cx + 10, cy - 7], [cx + 11, cy + 4], [cx + 8, cy - 2], [cx, cy - 6], [cx - 8, cy - 2]], o.hoodc || '#3a2a40', 1); }
    if (t === 'mask') { b.rect(cx - 9, cy + 2, 18, 4, '#2a2228', 0.6); }
  }

  // đầu thú
  function beastHead(b, cx, cy, type, o) {
    const f = o.fur;
    if (type === 'pig') {
      b.poly([[cx - 10, cy - 2], [cx - 9, cy - 11], [cx - 4, cy - 6]], drk(H(f), 0.1), 1); b.poly([[cx + 10, cy - 2], [cx + 9, cy - 11], [cx + 4, cy - 6]], drk(H(f), 0.1), 1);
      b.ell(cx, cy, 10, 9, f, 1);
      b.ell(cx, cy + 4, 4.5, 3.2, lit(H(f), 0.25), 0.8); b.px(cx - 1.5, cy + 4, '#6a2a2a').px(cx + 1.5, cy + 4, '#6a2a2a');
      b.px(cx - 5, cy - 1, EYE).px(cx + 4, cy - 1, EYE).px(cx - 5, cy - 2, '#fff').px(cx + 4, cy - 2, '#fff');
      b.line(cx - 3, cy + 8, cx + 3, cy + 8, '#8a3a3a');
    } else if (type === 'bull') {
      if (o.singleHorn) b.poly([[cx - 3, cy - 7], [cx + 3, cy - 7], [cx + 1, cy - 18], [cx - 1, cy - 18]], '#f0e6d0', 0.8);
      else { b.curve([[cx - 7, cy - 5], [cx - 15, cy - 6], [cx - 15, cy - 15]], '#f0e6d0', (k) => 3.6 - k * 2.8, 1);
      b.curve([[cx + 7, cy - 5], [cx + 15, cy - 6], [cx + 15, cy - 15]], '#f0e6d0', (k) => 3.6 - k * 2.8, 1); }
      b.ell(cx - 10, cy - 1, 3, 2, f, 0.8); b.ell(cx + 10, cy - 1, 3, 2, f, 0.8);
      b.ell(cx, cy, 8.5, 9, f, 1);
      b.ell(cx, cy + 5, 6, 4, o.muzzle || '#d8b08a', 0.8); b.px(cx - 2, cy + 5, '#2a1410').px(cx + 2, cy + 5, '#2a1410');
      b.ell(cx, cy + 8, 2, 1.4, '#e8c45a', 0.6);
      b.rect(cx - 5, cy - 2, 2, 2, '#ff3a2a', 0).rect(cx + 3, cy - 2, 2, 2, '#ff3a2a', 0);
      b.line(cx - 6, cy - 4, cx - 2, cy - 3, '#1a0a0a'); b.line(cx + 2, cy - 3, cx + 6, cy - 4, '#1a0a0a');
    } else if (type === 'monkey') {
      b.ell(cx - 10, cy + 1, 2.6, 3.2, o.face || '#f0c0a0', 0.8); b.ell(cx + 10, cy + 1, 2.6, 3.2, o.face || '#f0c0a0', 0.8);
      b.ell(cx, cy - 1, 9.5, 9, f, 1);
      const fc = o.face || '#f0c0a0';
      b.ell(cx - 3, cy, 3.6, 3.6, fc, 0.6); b.ell(cx + 3, cy, 3.6, 3.6, fc, 0.6); b.ell(cx, cy + 4, 5, 4, fc, 0.6);
      b.rect(cx - 4, cy - 1, 2, 2, EYE, 0).rect(cx + 2, cy - 1, 2, 2, EYE, 0); b.px(cx - 4, cy - 1, o.eyeGlow || '#fff').px(cx + 2, cy - 1, o.eyeGlow || '#fff');
      b.px(cx - 1, cy + 3, '#8a4a3a').px(cx + 1, cy + 3, '#8a4a3a'); b.line(cx - 2, cy + 6, cx + 2, cy + 6, '#8a3a2a');
      if (o.band !== false) { b.rect(cx - 10, cy - 6, 20, 2, '#e8c45a', 0.6); b.px(cx, cy - 6, '#ff5a3a'); }
    } else if (type === 'bear') {
      b.ell(cx - 8, cy - 7, 3.5, 3.5, f, 1); b.ell(cx + 8, cy - 7, 3.5, 3.5, f, 1);
      b.ell(cx - 8, cy - 7, 1.6, 1.6, '#c8a080', 0);
      b.ell(cx + 8, cy - 7, 1.6, 1.6, '#c8a080', 0);
      b.ell(cx, cy, 10, 9, f, 1);
      b.ell(cx, cy + 4, 5, 3.6, o.muzzle || '#d8b890', 0.8); b.ell(cx, cy + 2.5, 2, 1.4, '#1a0a0a', 0.5);
      b.px(cx - 5, cy - 1, '#ffd65a').px(cx + 4, cy - 1, '#ffd65a');
      if (o.crescent) b.poly([[cx - 6, cy + 10], [cx, cy + 12], [cx + 6, cy + 10], [cx, cy + 11]], '#f2ead8', 0);
    } else if (type === 'tiger') {
      b.poly([[cx - 10, cy - 2], [cx - 9, cy - 11], [cx - 4, cy - 7]], f, 1); b.poly([[cx + 10, cy - 2], [cx + 9, cy - 11], [cx + 4, cy - 7]], f, 1);
      b.ell(cx, cy, 10, 9, f, 1);
      b.ell(cx - 4, cy + 5, 4, 3, '#fff6e6', 0.6); b.ell(cx + 4, cy + 5, 4, 3, '#fff6e6', 0.6);
      b.ell(cx, cy + 3, 1.8, 1.3, '#d0506a', 0);
      if (o.spots) for (const [x, y] of [[-6, -6], [-2, -8], [3, -7], [7, -5], [-8, -1], [8, 0], [0, -5]]) b.ell(cx + x, cy + y, 1.2, 1.2, '#3a2a14', 0);
      else { for (const x of [-6, 0, 6]) b.line(cx + x, cy - 8, cx + x * 0.8, cy - 5, '#2a1a10');
      b.line(cx - 10, cy, cx - 7, cy + 1, '#2a1a10'); b.line(cx + 10, cy, cx + 7, cy + 1, '#2a1a10'); }
      b.rect(cx - 5, cy - 2, 2, 2, '#ffe04a', 0).rect(cx + 3, cy - 2, 2, 2, '#ffe04a', 0); b.px(cx - 4, cy - 1, EYE).px(cx + 4, cy - 1, EYE);
      b.line(cx - 2, cy + 7, cx + 2, cy + 7, '#6a2a2a');
    } else if (type === 'wolf') {
      b.poly([[cx - 9, cy - 1], [cx - 8, cy - 14], [cx - 3, cy - 7]], f, 1); b.poly([[cx + 9, cy - 1], [cx + 8, cy - 14], [cx + 3, cy - 7]], f, 1);
      b.ell(cx, cy, 9.5, 8.5, f, 1);
      b.poly([[cx - 5, cy + 1], [cx + 5, cy + 1], [cx + 3, cy + 9], [cx - 3, cy + 9]], '#e8e4dc', 0.6);
      b.ell(cx, cy + 3, 2, 1.5, '#1a1214', 0.5);
      b.poly([[cx - 7, cy - 3], [cx - 3, cy - 2], [cx - 5, cy]], '#ffd040', 0); b.poly([[cx + 7, cy - 3], [cx + 3, cy - 2], [cx + 5, cy]], '#ffd040', 0);
      b.px(cx - 2, cy + 9, '#fff').px(cx + 2, cy + 9, '#fff');
    } else if (type === 'rat') {
      b.ell(cx - 9, cy - 6, 4.5, 4.5, f, 1); b.ell(cx + 9, cy - 6, 4.5, 4.5, f, 1);
      b.ell(cx - 9, cy - 6, 2.4, 2.4, '#f2a8b8', 0); b.ell(cx + 9, cy - 6, 2.4, 2.4, '#f2a8b8', 0);
      b.ell(cx, cy + 1, 8.5, 8, f, 1); b.ell(cx, cy + 6, 3.5, 3, lit(H(f), 0.3), 0.6); b.ell(cx, cy + 4.5, 1.6, 1.2, '#e05a7a', 0);
      b.px(cx - 4, cy - 1, '#d42a2a').px(cx + 3, cy - 1, '#d42a2a');
      b.line(cx - 3, cy + 5, cx - 10, cy + 3, '#e8e0d0'); b.line(cx + 3, cy + 5, cx + 10, cy + 3, '#e8e0d0');
      b.px(cx - 1, cy + 9, '#fff').px(cx + 1, cy + 9, '#fff');
    } else if (type === 'skull') {
      b.ell(cx, cy - 1, 9, 8.5, '#efe8d8', 1);
      b.rect(cx - 5, cy + 5, 10, 4, '#e2d8c4', 0.6);
      b.ell(cx - 4, cy, 2.6, 2.8, '#2a1a24', 0); b.ell(cx + 4, cy, 2.6, 2.8, '#2a1a24', 0);
      b.px(cx - 4, cy, o.eyeGlow || '#ff4aa0').px(cx + 4, cy, o.eyeGlow || '#ff4aa0');
      b.poly([[cx - 1, cy + 3], [cx + 1, cy + 3], [cx, cy + 5]], '#2a1a24', 0);
      for (let i = -4; i <= 4; i += 2) b.line(cx + i, cy + 6, cx + i, cy + 8, '#8a7a6a');
      b.line(cx + 3, cy - 8, cx + 5, cy - 5, '#a89a86');
    } else if (type === 'lion') {
      const mane = o.mane || drk(H(f), 0.3);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; b.ell(cx + Math.cos(a) * 10, cy + 1 + Math.sin(a) * 9.5, 4, 4, mane, 1); }
      b.ell(cx, cy + 1, 11, 10.5, mane, 1);
      b.ell(cx - 7, cy - 6, 2.4, 2.4, f, 1); b.ell(cx + 7, cy - 6, 2.4, 2.4, f, 1);
      b.ell(cx, cy + 1, 8, 7.5, f, 1);
      b.ell(cx - 3, cy + 5, 3.4, 2.6, lit(H(f), 0.35), 0.5); b.ell(cx + 3, cy + 5, 3.4, 2.6, lit(H(f), 0.35), 0.5);
      b.poly([[cx - 2, cy + 2], [cx + 2, cy + 2], [cx, cy + 4]], '#3a1a14', 0);
      b.rect(cx - 5, cy - 1, 2, 2, '#ffe04a', 0).rect(cx + 3, cy - 1, 2, 2, '#ffe04a', 0); b.px(cx - 4, cy, EYE).px(cx + 4, cy, EYE);
      b.line(cx - 6, cy - 3, cx - 2, cy - 2, drk(H(f), 0.5)); b.line(cx + 2, cy - 2, cx + 6, cy - 3, drk(H(f), 0.5));
      b.line(cx - 2, cy + 8, cx + 2, cy + 8, '#6a2a2a'); b.px(cx - 2, cy + 9, '#fff').px(cx + 2, cy + 9, '#fff');
    } else if (type === 'deer') {
      b.curve([[cx - 4, cy - 7], [cx - 7, cy - 13], [cx - 11, cy - 18]], '#c8a060', 1.6, 0.6); b.line(cx - 7, cy - 13, cx - 3, cy - 17, '#c8a060', 1.5); b.line(cx - 9, cy - 15, cx - 13, cy - 14, '#c8a060');
      b.curve([[cx + 4, cy - 7], [cx + 7, cy - 13], [cx + 11, cy - 18]], '#c8a060', 1.6, 0.6); b.line(cx + 7, cy - 13, cx + 3, cy - 17, '#c8a060', 1.5); b.line(cx + 9, cy - 15, cx + 13, cy - 14, '#c8a060');
      b.ell(cx - 9, cy - 3, 3.6, 2, f, 0.8); b.ell(cx + 9, cy - 3, 3.6, 2, f, 0.8);
      b.ell(cx, cy, 8, 8.5, f, 1); b.ell(cx, cy + 5, 4.4, 3.6, lit(H(f), 0.3), 0.6); b.ell(cx, cy + 3.5, 1.8, 1.3, '#2a1a14', 0);
      b.rect(cx - 5, cy - 2, 2, 3, EYE, 0).rect(cx + 3, cy - 2, 2, 3, EYE, 0); b.px(cx - 5, cy - 2, '#fff').px(cx + 3, cy - 2, '#fff');
      for (const [x, y] of [[-5, -6], [4, -5], [-2, -7]]) b.px(cx + x, cy + y, lit(H(f), 0.45));
    } else if (type === 'ram') {
      for (const s of [-1, 1]) { b.ell(cx + s * 9, cy - 2, 5, 5, o.horn || '#c8b088', 1); b.ell(cx + s * 9, cy - 2, 2.4, 2.4, drk(H(o.horn || '#c8b088'), 0.3), 0); }
      b.ell(cx, cy, 7.5, 9, f, 1); b.ell(cx, cy + 5, 4, 3.6, lit(H(f), 0.1), 0.6); b.ell(cx, cy + 4, 1.6, 1.2, '#4a2a2a', 0);
      b.rect(cx - 4, cy - 2, 2, 2, '#c8a020', 0).rect(cx + 2, cy - 2, 2, 2, '#c8a020', 0); b.px(cx - 3, cy - 1, EYE).px(cx + 3, cy - 1, EYE);
      b.poly([[cx - 2, cy + 8], [cx + 2, cy + 8], [cx, cy + 14]], f, 0.5);
    } else if (type === 'fish') {
      b.poly([[cx - 4, cy - 7], [cx, cy - 15], [cx + 4, cy - 7]], o.fin || drk(H(f), 0.2), 0.6);
      b.ell(cx - 10, cy + 2, 3, 4.5, o.fin || drk(H(f), 0.2), 0.6); b.ell(cx + 10, cy + 2, 3, 4.5, o.fin || drk(H(f), 0.2), 0.6);
      b.ell(cx, cy, 9.5, 9, f, 1);
      for (const [x, y] of [[-5, -5], [0, -6], [5, -5], [-3, -2], [3, -2]]) b.ell(cx + x, cy + y, 1.6, 1.2, lit(H(f), 0.3), 0);
      for (const s of [-1, 1]) { b.ell(cx + s * 5, cy + 1, 3, 3, '#fff8e0', 0.4); b.ell(cx + s * 5, cy + 1.5, 1.4, 1.6, EYE, 0); }
      b.ell(cx, cy + 6, 2.4, 2, '#8a1a1a', 0); b.curve([[cx - 2, cy + 6], [cx - 8, cy + 8], [cx - 10, cy + 13]], o.fin || '#e8c45a', 0.9, 0); b.curve([[cx + 2, cy + 6], [cx + 8, cy + 8], [cx + 10, cy + 13]], o.fin || '#e8c45a', 0.9, 0);
    } else if (type === 'elephant') {
      b.ell(cx - 11, cy, 5.5, 7, drk(H(f), 0.08), 1); b.ell(cx + 11, cy, 5.5, 7, drk(H(f), 0.08), 1);
      b.ell(cx - 11, cy, 3, 4.5, '#e8b8b8', 0); b.ell(cx + 11, cy, 3, 4.5, '#e8b8b8', 0);
      b.ell(cx, cy - 1, 8.5, 8.5, f, 1);
      b.curve([[cx, cy + 3], [cx + 1, cy + 10], [cx - 3, cy + 15]], f, (k) => 4.5 - k * 2.5, 0.8);
      b.curve([[cx - 3, cy + 6], [cx - 6, cy + 9], [cx - 6, cy + 12]], '#fff8e8', 1.6, 0.3); b.curve([[cx + 3, cy + 6], [cx + 6, cy + 9], [cx + 6, cy + 12]], '#fff8e8', 1.6, 0.3);
      b.px(cx - 4, cy - 1, EYE).px(cx + 4, cy - 1, EYE); b.px(cx - 4, cy - 2, '#fff').px(cx + 4, cy - 2, '#fff');
    } else if (type === 'eagle') {
      for (const x of [-4, 0, 4]) b.poly([[cx + x - 2, cy - 7], [cx + x, cy - 15 + Math.abs(x) / 2], [cx + x + 2, cy - 7]], o.crestc || drk(H(f), 0.15), 0.6);
      b.ell(cx, cy, 9, 9, f, 1);
      b.ell(cx, cy + 4, 6, 4.5, lit(H(f), 0.35), 0.5);
      b.poly([[cx - 3, cy + 1], [cx + 3, cy + 1], [cx + 2, cy + 7], [cx, cy + 10], [cx - 2, cy + 7]], '#ffd040', 0.6);
      b.poly([[cx - 7, cy - 3], [cx - 2, cy - 2], [cx - 3, cy]], '#ff3a2a', 0); b.poly([[cx + 7, cy - 3], [cx + 2, cy - 2], [cx + 3, cy]], '#ff3a2a', 0);
      b.line(cx - 8, cy - 5, cx - 2, cy - 3, '#2a1a0a'); b.line(cx + 2, cy - 3, cx + 8, cy - 5, '#2a1a0a');
    } else if (type === 'rhino') {
      b.ell(cx - 8, cy - 6, 2.4, 3.2, f, 1); b.ell(cx + 8, cy - 6, 2.4, 3.2, f, 1);
      b.ell(cx, cy, 9.5, 9, f, 1); b.ell(cx, cy + 5, 6, 4.4, lit(H(f), 0.12), 0.7);
      b.poly([[cx - 2.5, cy + 2], [cx + 2.5, cy + 2], [cx + 1, cy - 9], [cx - 0.5, cy - 11]], '#f0e6d0', 0.8);
      b.px(cx - 2, cy + 6, '#2a1a14').px(cx + 2, cy + 6, '#2a1a14');
      b.rect(cx - 6, cy - 2, 2, 2, '#ffd040', 0).rect(cx + 4, cy - 2, 2, 2, '#ffd040', 0);
      for (const y of [-6, 9]) b.line(cx - 7, cy + y * 0.4, cx - 4, cy + y * 0.4 + 1, drk(H(f), 0.35));
    } else if (type === 'croc') {
      b.ell(cx - 5, cy - 6, 3, 3, f, 1); b.ell(cx + 5, cy - 6, 3, 3, f, 1);
      b.rect(cx - 6, cy - 7, 2, 2, '#ffd040', 0).rect(cx + 4, cy - 7, 2, 2, '#ffd040', 0); b.px(cx - 5, cy - 7, EYE).px(cx + 5, cy - 7, EYE);
      b.ell(cx, cy, 9, 7, f, 1); b.ell(cx, cy + 6, 7, 5, lit(H(f), 0.1), 0.8);
      b.line(cx - 6, cy + 6, cx + 6, cy + 6, '#2a1a14'); for (let x = -5; x <= 5; x += 2) b.px(cx + x, cy + 5, '#ffffff').px(cx + x + 1, cy + 7, '#ffffff');
      for (const [x, y] of [[-4, -2], [0, -3], [4, -2]]) b.ell(cx + x, cy + y, 1.4, 1.2, drk(H(f), 0.25), 0);
      b.px(cx - 2, cy + 3, '#1a1014').px(cx + 2, cy + 3, '#1a1014');
    } else if (type === 'demon') {
      b.curve([[cx - 5, cy - 6], [cx - 9, cy - 11], [cx - 7, cy - 16]], '#2a2224', (k) => 3 - k * 2.4, 1);
      b.curve([[cx + 5, cy - 6], [cx + 9, cy - 11], [cx + 7, cy - 16]], '#2a2224', (k) => 3 - k * 2.4, 1);
      b.ell(cx, cy, 9, 9, f, 1);
      b.rect(cx - 5, cy - 1, 3, 2, '#ffe04a', 0).rect(cx + 2, cy - 1, 3, 2, '#ffe04a', 0);
      b.line(cx - 6, cy - 3, cx - 2, cy - 2, '#2a0a0a'); b.line(cx + 2, cy - 2, cx + 6, cy - 3, '#2a0a0a');
      b.rect(cx - 4, cy + 4, 8, 2, '#3a0a0a', 0); b.px(cx - 3, cy + 4, '#fff').px(cx + 2, cy + 4, '#fff');
      b.poly([[cx - 4, cy + 8], [cx + 4, cy + 8], [cx, cy + 12]], o.beard || '#2a1a1a', 0.5);
    }
  }

  // ---------------- vũ khí ----------------
  function weapon(b, x, y, o) {
    const w = o.weapon; if (!w) return;
    const G = '#e8c45a', R = '#c8302a', S = '#c8d2dc';
    if (w === 'staff') { b.line(x, y - 26, x, y + 12, '#8a5a24', 2); b.ell(x, y - 28, 3, 3, G, 1); b.px(x, y - 28, R); }
    if (w === 'goldstaff') { b.line(x, y - 28, x, y + 12, '#c8302a', 2); b.rect(x - 1.5, y - 30, 3, 4, G, 0.8); b.rect(x - 1.5, y + 10, 3, 4, G, 0.8); }
    if (w === 'sword') { b.rect(x - 0.5, y - 20, 2, 18, S, 0.8); b.poly([[x - 0.5, y - 20], [x + 0.5, y - 23], [x + 1.5, y - 20]], S, 0); b.rect(x - 3, y - 2, 7, 2, G, 0.6); b.rect(x, y, 1.5, 5, '#5a2a14', 0); b.px(x + 0.5, y + 6, R); }
    if (w === 'saber') { b.poly([[x, y - 2], [x + 3, y - 2], [x + 6, y - 22], [x + 1, y - 16]], S, 0.8); b.rect(x - 2, y - 2, 7, 2, G, 0.5); b.rect(x + 0.5, y, 2, 5, '#5a2a14', 0); }
    if (w === 'spear') { b.line(x, y - 26, x, y + 12, '#6a4422', 2); b.poly([[x - 2, y - 26], [x + 2, y - 26], [x, y - 33]], S, 0.8); b.ell(x, y - 25, 2.5, 1.5, R, 0.5); }
    if (w === 'trident') { b.line(x, y - 22, x, y + 12, '#6a4422', 2); b.line(x - 4, y - 24, x + 4, y - 24, S, 2); for (const d of [-4, 0, 4]) b.poly([[x + d - 1, y - 24], [x + d + 1, y - 24], [x + d, y - 30 + Math.abs(d) * 0.5]], S, 0.6); }
    if (w === 'firespear') { b.line(x, y - 24, x, y + 12, '#4a2a14', 2); b.poly([[x - 2, y - 24], [x + 2, y - 24], [x, y - 32]], '#ffd04a', 0.6); b.ell(x - 1, y - 30, 2.5, 4, '#ff7a2a', 0.6); }
    if (w === 'rake') { b.line(x, y - 22, x, y + 12, '#6a4422', 2); b.rect(x - 5, y - 26, 11, 4, '#a8b4c0', 0.8); for (let i = -4; i <= 4; i += 2) b.line(x + i, y - 22, x + i, y - 19, '#c8d2dc'); }
    if (w === 'spade') { b.line(x, y - 22, x, y + 12, '#6a4422', 2); b.poly([[x - 5, y - 28], [x + 5, y - 28], [x + 3, y - 22], [x - 3, y - 22]], S, 0.8); b.poly([[x - 3, y + 12], [x + 3, y + 12], [x, y + 16]], S, 0.6); }
    if (w === 'fan') { b.poly([[x, y], [x - 7, y - 11], [x + 7, y - 11]], o.fanc || '#9ff0d8', 0.6); for (let i = -6; i <= 6; i += 3) b.line(x, y, x + i, y - 10, drk(H(o.fanc || '#9ff0d8'), 0.4)); }
    if (w === 'bigfan') { b.ell(x, y - 12, 9, 10, o.fanc || '#2a8a5a', 0.7); b.line(x, y - 4, x, y + 10, '#6a4422', 2); for (let i = 0; i < 5; i++) b.line(x, y - 4, x - 7 + i * 3.5, y - 20, drk(H(o.fanc || '#2a8a5a'), 0.35)); }
    if (w === 'axe') { b.line(x, y - 22, x, y + 12, '#6a4422', 2); b.poly([[x, y - 24], [x + 9, y - 28], [x + 10, y - 16], [x, y - 18]], S, 0.8); }
    if (w === 'whisk') { b.line(x, y - 6, x, y + 8, '#8a5a24', 1); b.curve([[x, y - 6], [x - 5, y - 10], [x - 6, y - 2]], '#f6f2ea', 2.5, 0.4); }
    if (w === 'vase') { b.ell(x, y - 2, 2.6, 3.6, '#e8f6ff', 1); b.rect(x - 1, y - 7, 2, 2, '#e8f6ff', 0); b.line(x, y - 8, x - 2, y - 12, '#4aae5a'); }
    if (w === 'gourd') { b.ell(x, y - 1, 2.6, 2.6, '#e8b74a', 1); b.ell(x, y + 3, 3.6, 3.6, '#e8b74a', 1); b.px(x, y - 4, '#6a3a14'); }
    if (w === 'abacus') { b.rect(x - 4, y - 4, 9, 6, '#6a3a14', 0.5); for (let i = 0; i < 3; i++) b.line(x - 3, y - 3 + i * 2, x + 3, y - 3 + i * 2, '#e8c45a'); }
    if (w === 'club') { b.line(x, y - 18, x, y + 10, '#6a4422', 3); b.ell(x, y - 20, 3.5, 5, '#5a3a20', 1); }
    if (w === 'mace') { b.line(x, y - 16, x, y + 10, '#5a3a20', 2); b.ell(x, y - 19, 4, 4, '#8a96a8', 1); for (const [dx, dy] of [[-4, -19], [4, -19], [0, -23]]) b.px(x + dx, y + dy, '#c8d2dc'); }
    if (w === 'lantern') { b.line(x, y - 10, x, y, '#5a3a20', 1); b.ell(x, y + 3, 3, 4, '#e0402a', 1); b.rect(x - 2, y - 1, 4, 1, G, 0); }
    if (w === 'wheel') { /* vẽ ở chân */ }
  }

  // ---------------- thân người ----------------
  function humanoid(o, frame = 0) {
    const W = 40, Hh = 52;
    const b = new Buf(W, Hh);
    const cx = 20, hy = 15, feet = 50;
    const walk = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const bob = frame ? -1 : 0;
    const main = o.robe || '#b84a3a', trim = o.trim || '#e8c45a';
    const style = o.body || 'robe';
    const big = o.wide ? 2 : 0;

    // lớp sau
    if (o.halo) b.ell(cx, hy - 1 + bob, 13, 13, o.halo, 0).ell(cx, hy - 1 + bob, 11.6, 11.6, null);
    if (o.cape) b.poly([[cx - 8 - big, 25 + bob], [cx + 8 + big, 25 + bob], [cx + 12 + big, feet - 2], [cx - 12 - big, feet - 2]], o.cape, 0.6);
    if (o.ribbon) { b.curve([[cx - 8, 26], [cx - 18, 30], [cx - 15, 44]], o.ribbon, 1.6, 0.3); b.curve([[cx + 8, 26], [cx + 18, 30], [cx + 15, 44]], o.ribbon, 1.6, 0.3); }
    if (o.tail) {
      if (o.tail === 'fox') for (const a of [-1, 0, 1]) b.curve([[cx + 4, 40], [cx + 15 + a * 2, 38 - a * 4], [cx + 13 + a * 5, 26 - a * 4]], o.tailc || '#f4eefe', (k) => 3 + Math.sin(k * 3.1) * 2.6, 1);
      if (o.tail === 'monkey') b.curve([[cx + 5, 42], [cx + 17, 44], [cx + 14, 30]], o.fur, 2, 0.8);
      if (o.tail === 'pig') b.curve([[cx + 6, 40], [cx + 11, 39], [cx + 9, 36]], o.fur, 1.4, 0.5);
      if (o.tail === 'bull' || o.tail === 'tiger' || o.tail === 'wolf' || o.tail === 'rat') b.curve([[cx + 6, 42], [cx + 16, 44], [cx + 16, 32]], o.tail === 'wolf' ? o.fur : o.tailc || o.fur, o.tail === 'wolf' ? (k) => 2 + k * 3 : 1.6, 0.7);
    }
    if (o.tail === 'scorpion') { const seg = [[cx + 7, 40], [cx + 13, 36], [cx + 16, 29], [cx + 16, 21], [cx + 13, 14], [cx + 9, 10]]; seg.forEach(([x, y], i) => b.ell(x, y, 3 - i * 0.25, 2.6, o.tailc || '#8a3a2a', 1)); b.poly([[cx + 9, 8], [cx + 4, 6], [cx + 7, 11]], '#2a1010', 0.4); }
    if (o.spiderLegs) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { b.line(cx + s * 4, 31, cx + s * (13 + i * 2), 22 + i * 6, o.spiderLegs, 2); b.line(cx + s * (13 + i * 2), 22 + i * 6, cx + s * (17 + i), 30 + i * 6, o.spiderLegs, 2); }
    if (o.wings) { b.poly([[cx - 4, 28], [cx - 19, 16], [cx - 17, 34], [cx - 6, 36]], o.wings, 0.8); b.poly([[cx + 4, 28], [cx + 19, 16], [cx + 17, 34], [cx + 6, 36]], o.wings, 0.8); }
    if (o.hairBack && !o.head) b.ell(cx, hy + 9 + bob, 10.5, 14, o.hair, 0.8);
    if (o.flameAura) for (let i = 0; i < 7; i++) { const a = (i / 6) * Math.PI; b.ell(cx + Math.cos(a) * 14, 34 - Math.sin(a) * 14, 3, 4, i % 2 ? '#ff8a2a' : '#ffd04a', 0.4); }

    // chân
    if (o.wheels) { b.ell(cx - 6, feet - 1, 4, 2, '#ff8a2a', 0.5).ell(cx + 6, feet - 1, 4, 2, '#ff8a2a', 0.5); b.ell(cx - 6, feet - 1, 2, 1, '#ffe04a', 0).ell(cx + 6, feet - 1, 2, 1, '#ffe04a', 0); }
    const boot = o.boot || '#3a2418';
    if (style === 'short' || style === 'armor') {
      b.rect(cx - 6 + walk, 40, 4.5, 8, o.pants || drk(H(main), 0.35), 0.8); b.rect(cx + 1.5 - walk, 40, 4.5, 8, o.pants || drk(H(main), 0.35), 0.8);
    }
    b.rect(cx - 7 + walk, feet - 3, 5.5, 3, boot, 0.8); b.rect(cx + 1.5 - walk, feet - 3, 5.5, 3, boot, 0.8);

    // thân
    const t = 25 + bob;
    if (style === 'robe' || style === 'monk' || style === 'dress') {
      const flare = style === 'dress' ? 12 : 10;
      b.poly([[cx - 7 - big, t], [cx + 7 + big, t], [cx + flare + big, feet - 3], [cx - flare - big, feet - 3]], main, 1);
      b.poly([[cx - 2, t + 2], [cx + 2, t + 2], [cx + 4, feet - 3], [cx - 4, feet - 3]], o.inner || drk(H(main), 0.25), 0.4);
      b.rect(cx - flare - big, feet - 5, (flare + big) * 2, 2, trim, 0.4);
      if (style === 'dress') b.rect(cx - flare + 1, feet - 10, flare * 2 - 2, 1.5, lit(H(main), 0.3), 0.3);
      b.rect(cx - 7 - big, t + 9, 14 + big * 2, 2.5, o.sash || trim, 0.5);
      if (o.jade !== false) b.px(cx, t + 12, '#4ac29a').px(cx, t + 13, '#c8302a').px(cx, t + 14, '#c8302a');
      if (style === 'monk') {
        b.poly([[cx - 7, t], [cx - 4, t], [cx + 10, feet - 6], [cx + 7, feet - 3], [cx - 2, t + 12]], o.kasaya || '#d4402a', 0.6);
        for (let i = 0; i < 4; i++) b.line(cx - 4 + i * 3, t + 3 + i * 4, cx - 1 + i * 3, t + 3 + i * 4, '#ffd65a');
      }
    } else if (style === 'short') {
      b.poly([[cx - 7 - big, t], [cx + 7 + big, t], [cx + 8 + big, 41], [cx - 8 - big, 41]], main, 1);
      b.rect(cx - 8 - big, 39, 16 + big * 2, 2, trim, 0.4);
      b.rect(cx - 7 - big, t + 8, 14 + big * 2, 2, o.sash || trim, 0.5);
    } else if (style === 'armor') {
      const m = o.metal || '#8a96a8';
      b.poly([[cx - 8 - big, t], [cx + 8 + big, t], [cx + 7 + big, t + 11], [cx - 7 - big, t + 11]], m, 1);
      b.ell(cx, t + 5, 4, 3.5, o.plate || '#e8c45a', 1);
      b.poly([[cx - 8 - big, t + 11], [cx + 8 + big, t + 11], [cx + 10 + big, 43], [cx - 10 - big, 43]], main, 1);
      for (let i = -1; i <= 1; i++) b.rect(cx - 9 - big + (i + 1) * (6 + big * 0.66), t + 13, 5, 6, drk(H(main), 0.15), 0.6);
      b.rect(cx - 8 - big, t + 10, 16 + big * 2, 2, trim, 0.5);
      b.ell(cx - 9 - big, t + 1, 4, 3.4, m, 1); b.ell(cx + 9 + big, t + 1, 4, 3.4, m, 1);
    }
    if (o.necklace) for (let i = 0; i < 7; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 6)); b.ell(cx + Math.cos(a) * 6, t + 1 + Math.sin(a) * 4, 1.3, 1.3, o.necklace, 0.6); }
    if (o.collar !== false && style !== 'armor') { b.line(cx - 4, t, cx, t + 4, trim); b.line(cx + 4, t, cx, t + 4, trim); }

    // tay
    const sleeve = o.sleeve || main, hand = o.hand || o.skin || SKIN;
    b.ell(cx - 9 - big, t + 6, 3.4, 6.5, sleeve, 1); b.ell(cx + 9 + big, t + 6, 3.4, 6.5, sleeve, 1);
    b.ell(cx - 10 - big, t + 12, 2.2, 2, hand, 0.6); b.ell(cx + 10 + big, t + 12, 2.2, 2, hand, 0.6);
    if (o.offhand) weapon(b, cx - 10 - big, t + 12, { weapon: o.offhand, fanc: o.fanc });

    // đầu
    if (o.head) beastHead(b, cx, hy + bob, o.head, o);
    else { humanHead(b, cx, hy + bob, o); hair(b, cx, hy + bob, o); }
    if (o.beard) { b.poly([[cx - 6, hy + 6 + bob], [cx + 6, hy + 6 + bob], [cx + 3, hy + 16 + bob], [cx, hy + 19 + bob], [cx - 3, hy + 16 + bob]], o.beard, 0.6); if (!o.head) b.px(cx, hy + 6 + bob, '#b0503a'); }
    if (o.mustache) { b.curve([[cx, hy + 5 + bob], [cx - 6, hy + 5 + bob], [cx - 9, hy + 9 + bob]], o.mustache, 1.2, 0); b.curve([[cx, hy + 5 + bob], [cx + 6, hy + 5 + bob], [cx + 9, hy + 9 + bob]], o.mustache, 1.2, 0); }
    hat(b, cx, hy + bob, o);

    // vũ khí tay phải (trước người)
    weapon(b, cx + 11 + big, t + 12, o);
    return b;
  }

  // =====================================================================
  //  THÚ 4 CHÂN – khung 48×40, nhìn sang phải
  // =====================================================================
  function quad(o, frame = 0) {
    const b = new Buf(48, 40);
    const f = o.main, belly = o.light, acc = o.acc;
    const ground = 38, s = o.size || 1;
    const lift = frame === 1 ? 1 : 0;
    const bx = 22, by = 24, bw = 12 * s, bh = 7.5 * s;
    const legH = o.legs || 9, legW = o.legW || 3.5;
    // đuôi
    const tl = o.tail;
    if (tl === 'long') b.curve([[bx - bw + 2, by - 2], [bx - bw - 8, by - 4], [bx - bw - 6, by - 14]], o.tailc || f, (k) => 2.5 - k, 0.8);
    if (tl === 'tuft') { b.curve([[bx - bw + 2, by - 2], [bx - bw - 7, by + 2], [bx - bw - 8, by - 8]], f, 1.6, 0.6); b.ell(bx - bw - 8, by - 9, 2.6, 3, acc, 1); }
    if (tl === 'fox') for (let i = (o.tails || 1) - 1; i >= 0; i--) { const ex = bx - bw - 6 + i * 4, ey = by - 15 + i * 2; b.curve([[bx - bw + 3, by - 1], [bx - bw - 7 + i * 2, by - 2 - i], [ex, ey]], i ? drk(Pix.C(f), 0.12 * i) : f, (k) => 2.2 + Math.sin(k * 2.6) * 3.4, 1); b.ell(ex, ey - 1, 2.6, 3, belly, 0.5); }
    if (tl === 'flame') for (let i = 0; i < 3; i++) b.ell(bx - bw - 2 - i * 3, by - 4 - i * 2, 3 - i * 0.6, 4 - i, i % 2 ? '#ffd04a' : '#ff7a2a', 0.5);
    if (tl === 'horse') b.curve([[bx - bw + 2, by - 3], [bx - bw - 7, by], [bx - bw - 6, by + 10]], o.mane || acc, (k) => 4 - k * 2, 0.8);
    if (tl === 'cotton') b.ell(bx - bw, by - 2, 3, 3, '#ffffff', 0.8);
    if (tl === 'snake') b.curve([[bx - bw + 2, by], [bx - bw - 6, by + 6], [bx - bw - 10, by - 4]], o.tailc || '#4a7a4a', 2.2, 0.8);
    // chân sau (xa)
    const legs = [[bx - bw * 0.6, 0], [bx - bw * 0.25, 1], [bx + bw * 0.45, 0], [bx + bw * 0.8, 1]];
    for (const [lx, far] of legs) {
      const up = (far ? lift : -lift) * 1.5;
      const col = far ? drk(Pix.C(f), 0.18) : f;
      b.rect(lx - legW / 2, by + bh * 0.4, legW, Math.max(2, ground - (by + bh * 0.4) - 1 + Math.min(0, up)), col, 0.8);
      b.rect(lx - legW / 2 - 0.5, ground - 2 + Math.min(0, up), legW + 1, 2, o.hoof || drk(Pix.C(f), 0.45), 0.4);
    }
    // thân
    b.ell(bx, by, bw, bh, f, 1);
    if (belly && !o.noBelly) b.ell(bx + 1, by + bh * 0.45, bw * 0.75, bh * 0.38, belly, 0.4);
    if (o.stripes) for (let i = 0; i < 5; i++) b.line(bx - bw * 0.7 + i * bw * 0.32, by - bh * 0.9, bx - bw * 0.7 + i * bw * 0.32 + 1, by - bh * 0.2, o.stripes, 1);
    if (o.scales) for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) b.px(bx - bw * 0.6 + i * 3.5 + j * 1.7, by - 3 + j * 3, lit(Pix.C(f), 0.4));
    if (o.shell) {
      b.ell(bx, by - 3, bw + 2, bh + 3, o.shell, 1);
      for (const [x, y] of [[-6, -5], [0, -7], [6, -5], [-3, 0], [3, 0], [-9, 0], [9, 0]]) b.ell(bx + x, by - 3 + y, 2.6, 2, lit(Pix.C(o.shell), 0.2), 0.3);
      b.rect(bx - bw - 2, by + 3, bw * 2 + 4, 1.5, acc, 0.3);
    }
    if (o.saddle) { b.rect(bx - 4, by - bh, 9, 4, o.saddle, 0.6); b.rect(bx - 5, by - bh + 3, 11, 1, '#e8c45a', 0); }
    if (o.backFlame) for (let i = 0; i < 4; i++) b.ell(bx - bw * 0.6 + i * 5, by - bh - 1, 2, 3.4, i % 2 ? '#ffd04a' : '#ff6a2a', 0.4);
    // cổ + đầu
    const hx = bx + bw * 0.85 + (o.headOff || 0), hy = by - bh * 0.9 - (o.neck || 2);
    if (o.mane) b.ell(hx - 2, hy + 1, 8 * (o.maneSize || 1), 8 * (o.maneSize || 1), o.mane, 1);
    if (o.neck) b.poly([[bx + bw * 0.4, by - 2], [hx - 3, hy + 2], [hx + 2, hy + 3], [bx + bw * 0.9, by + 2]], f, 0.8);
    const hr = o.headR || 6.5;
    if (o.earsBack) { b.ell(hx - 5, hy - 2, 4, 6, f, 1); b.ell(hx - 5, hy - 2, 2, 4, '#e8a8a8', 0); }
    b.ell(hx, hy, hr, hr * 0.9, f, 1);
    const snout = o.snout || 'short';
    if (snout === 'short') b.ell(hx + hr * 0.75, hy + 2, 3.4, 2.6, belly || lit(Pix.C(f), 0.3), 0.6);
    if (snout === 'long') b.poly([[hx + 2, hy - 2], [hx + hr + 6, hy + 1], [hx + hr + 5, hy + 4], [hx + 2, hy + 4]], f, 0.8);
    if (snout === 'trunk') b.curve([[hx + hr - 1, hy + 1], [hx + hr + 6, hy + 4], [hx + hr + 4, hy + 13]], f, (k) => 4 - k * 2, 0.8);
    b.px(hx + hr + (snout === 'long' ? 5 : 3), hy + 1, '#1a1014');
    // mắt
    b.rect(hx + 1, hy - 2, 2, 2, o.eye || '#1a1014', 0); b.px(hx + 1, hy - 2, '#ffffff');
    // tai
    if (o.ears === 'point') b.poly([[hx - 3, hy - 4], [hx - 1, hy - 12], [hx + 2, hy - 5]], f, 1);
    if (o.ears === 'round') b.ell(hx - 2, hy - 6, 2.6, 2.6, f, 1);
    if (o.ears === 'long') { b.ell(hx - 2, hy - 11, 2.2, 7, f, 1); b.ell(hx + 1.5, hy - 10, 2.2, 6.5, f, 1); b.ell(hx - 2, hy - 11, 1, 5, '#f4a8b8', 0); }
    if (o.ears === 'big') b.ell(hx - 4, hy + 1, 5, 6.5, drk(Pix.C(f), 0.08), 1);
    if (o.horn === 'single') b.poly([[hx - 1, hy - 5], [hx + 2, hy - 5], [hx + 3, hy - 14]], o.hornc || '#ffe08a', 0.8);
    if (o.horn === 'antler') { b.curve([[hx - 1, hy - 5], [hx - 3, hy - 11], [hx + 1, hy - 15]], o.hornc || '#e8c45a', 1.4, 0.6); b.line(hx - 2, hy - 10, hx - 6, hy - 13, o.hornc || '#e8c45a'); }
    if (o.tusk) b.curve([[hx + hr - 1, hy + 4], [hx + hr + 2, hy + 7], [hx + hr + 5, hy + 5]], '#fff8e8', 1.6, 0.4);
    if (o.whisk) { b.line(hx + hr + 2, hy + 3, hx + hr + 7, hy + 1, '#e8e0d0'); b.line(hx + hr + 2, hy + 4, hx + hr + 7, hy + 5, '#e8e0d0'); }
    if (o.stripes) b.line(hx - 2, hy - 5, hx - 1, hy - 2, o.stripes);
    if (o.collar) { b.rect(hx - 4, hy + 4, 6, 1.5, o.collar, 0); b.px(hx - 1, hy + 6, '#e8c45a'); }
    return b;
  }

  // =====================================================================
  //  CHIM – khung 48×40
  // =====================================================================
  function bird(o, frame = 0) {
    const b = new Buf(48, 44);
    const f = o.main, belly = o.light, acc = o.acc;
    const up = frame === 1;
    const bx = 22, by = 24;
    if (o.fanTail) {
      b.ell(bx - 4, by - 6, 18, 15, o.fanTail, 0.8);
      for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + 0.8 * (i / 8)); const x = bx - 4 - Math.cos(a) * 13, y = by - 6 - Math.sin(a) * 11; b.ell(x, y, 2.4, 2.4, '#e8c45a', 0).ell(x, y, 1.3, 1.3, '#2a4aa8', 0); }
    }
    if (o.longTail) for (let i = 0; i < 3; i++) b.curve([[bx - 8, by + 2], [bx - 20 - i * 2, by + 4 + i * 3], [bx - 21 + i * 4, by + 18]], i === 1 ? acc : o.longTail, (k) => 4 - k * 2.6, 0.6);
    if (o.tail) b.poly([[bx - 9, by - 1], [bx - 21, by + 3], [bx - 19, by + 9], [bx - 8, by + 5]], o.tail, 0.8);
    // cánh xa
    const wy = up ? -10 : 0;
    if (o.legs) { b.line(bx + 1, by + 6, bx - 1, 43, o.legc || '#2a2224', 1.5); b.line(bx + 5, by + 6, bx + 6, 43, o.legc || '#2a2224', 1.5); }
    if (o.talons) { b.rect(bx - 1, by + 6, 2, 4, '#e8c45a', 0); b.rect(bx + 4, by + 6, 2, 4, '#e8c45a', 0); }
    b.poly([[bx - 2, by - 2], [bx + 5, by - 19 + wy], [bx + 13, by - 14 + wy], [bx + 7, by]], drk(Pix.C(o.wing || f), 0.22), 0.6);
    // thân
    const bw = o.bodyW || 11, bh = o.bodyH || 8;
    b.ell(bx, by, bw, bh, f, 1);
    if (belly) b.ell(bx + 2, by + 2.5, bw * 0.62, bh * 0.55, belly, 0.4);
    // cổ + đầu
    const nx = bx + (o.neckX || 6), ny = by - (o.neckLen || 6);
    if (o.neckLen) b.curve([[bx + 5, by - 2], [bx + 7, ny + 4], [nx, ny]], o.neckc || f, 3, 0.6);
    const hr = (o.headR || 3.6) * 1.25;
    if (o.crest) for (let i = 0; i < 3; i++) b.line(nx - 1 + i, ny - hr, nx - 3 + i * 2, ny - hr - 5, o.crest);
    b.ell(nx, ny, hr, hr, o.headc || f, 1);
    if (o.cap) b.ell(nx, ny - hr + 1, hr * 0.6, 1.4, o.cap, 0);
    b.px(nx + 1, ny - 1, '#1a1014'); b.px(nx + 1, ny - 2, '#ffffff');
    const bk = o.beak || '#e8b040';
    if (o.hook) b.poly([[nx + hr - 1, ny - 1], [nx + hr + 4, ny], [nx + hr + 3, ny + 3], [nx + hr - 1, ny + 1.5]], bk, 0.4);
    else b.poly([[nx + hr - 1, ny - 0.5], [nx + hr + (o.beakLen || 4), ny + 0.5], [nx + hr - 1, ny + 1.5]], bk, 0.3);
    // cánh gần
    b.poly([[bx - 8, by - 2], [bx - 4, by - 22 + wy], [bx + 7, by - 18 + wy], [bx + 6, by + 2], [bx - 3, by + 5]], o.wing || f, 0.9);
    if (o.wingTip) b.poly([[bx - 6, by - 17 + wy], [bx - 4, by - 22 + wy], [bx + 7, by - 18 + wy], [bx + 4, by - 13 + wy]], o.wingTip, 0.6);
    for (let i = 0; i < 4; i++) b.line(bx - 5 + i * 2.6, by - 15 + wy * 0.8 + i, bx - 3 + i * 2.6, by - 3, lit(Pix.C(o.wing || f), 0.3));
    return b;
  }

  function bat(o, frame = 0) {
    const b = new Buf(48, 40);
    const f = o.main, up = frame === 1 ? -5 : 0;
    const cx = 24, cy = 20;
    for (const s of [-1, 1]) {
      b.poly([[cx + s * 3, cy - 2], [cx + s * 20, cy - 10 + up], [cx + s * 22, cy + 2 + up], [cx + s * 16, cy + 0], [cx + s * 13, cy + 6], [cx + s * 9, cy + 3], [cx + s * 5, cy + 7]], o.wing || drk(Pix.C(f), 0.2), 0.8);
      for (const k of [10, 14, 18]) b.line(cx + s * 4, cy - 2, cx + s * k, cy - 6 + up + (k - 10) * 0.7, drk(Pix.C(f), 0.45));
    }
    b.ell(cx, cy + 2, 5, 6, f, 1); b.ell(cx, cy - 5, 4.5, 4, f, 1);
    b.poly([[cx - 4, cy - 7], [cx - 3, cy - 13], [cx - 1, cy - 8]], f, 1); b.poly([[cx + 4, cy - 7], [cx + 3, cy - 13], [cx + 1, cy - 8]], f, 1);
    b.px(cx - 2, cy - 5, '#ff3a3a').px(cx + 2, cy - 5, '#ff3a3a'); b.px(cx - 1, cy - 2, '#fff').px(cx + 1, cy - 2, '#fff');
    b.ell(cx, cy + 4, 2.6, 3, o.light, 0.4);
    return b;
  }

  // =====================================================================
  //  RẮN / RỒNG – khung 52×42
  // =====================================================================
  function serpent(o, frame = 0) {
    const b = new Buf(52, 42);
    const f = o.main, belly = o.light, acc = o.acc;
    const ph = frame ? 0.5 : 0;
    const dragon = o.dragon;
    const pts = [];
    const n = dragon ? 26 : 20;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = 5 + t * (dragon ? 33 : 28);
      const y = (dragon ? 28 : 31) - Math.sin(t * Math.PI * (dragon ? 2.2 : 1.7) + ph) * (dragon ? 8 : 6) - t * (dragon ? 10 : 12);
      pts.push([x, y, (dragon ? 2.6 + t * 3.6 : 2.4 + t * 3.2)]);
    }
    if (dragon) for (let i = 2; i < n - 2; i += 3) { const [x, y, r] = pts[i]; b.poly([[x - 1, y - r + 1], [x + 1, y - r - 3], [x + 2, y - r + 1]], acc, 0.4); }
    if (dragon) { const [x1, y1] = pts[Math.floor(n * 0.35)], [x2, y2] = pts[Math.floor(n * 0.75)]; for (const [x, y] of [[x1, y1], [x2, y2]]) { b.line(x, y + 2, x - 2, y + 8, f, 2); b.line(x - 2, y + 8, x - 4, y + 9, '#e8c45a'); b.line(x - 2, y + 8, x, y + 10, '#e8c45a'); } }
    for (const [x, y, r] of pts) b.ell(x, y, r, r, f, 1);
    for (let i = 0; i < pts.length; i += 2) { const [x, y, r] = pts[i]; b.ell(x, y + r * 0.55, r * 0.7, r * 0.35, belly, 0.3); }
    if (o.pattern) for (let i = 1; i < pts.length; i += 3) { const [x, y, r] = pts[i]; b.ell(x, y - r * 0.3, r * 0.45, r * 0.35, o.pattern, 0.3); }
    const [hx, hy] = pts[n];
    const hr = dragon ? 6.5 : 5.2;
    if (dragon) {
      b.ell(hx - 3, hy - 2, 6, 6, acc, 1);
      b.curve([[hx - 1, hy - 4], [hx - 4, hy - 11], [hx + 1, hy - 15]], '#f2e6c8', 1.6, 0.6);
      b.curve([[hx + 2, hy - 4], [hx + 1, hy - 11], [hx + 6, hy - 14]], '#f2e6c8', 1.6, 0.6);
    }
    b.ell(hx + 1, hy, hr + 1, hr, f, 1);
    b.poly([[hx + 2, hy - 2], [hx + hr + 7, hy], [hx + hr + 6, hy + 3], [hx + 2, hy + 3]], f, 0.8);
    b.rect(hx + 2, hy - 3, 2, 2, dragon ? '#ffe04a' : '#ffd040', 0); b.px(hx + 3, hy - 2, '#1a1014');
    if (dragon) { b.curve([[hx + hr + 5, hy + 2], [hx + hr + 10, hy + 4], [hx + hr + 11, hy + 10]], '#f2e6c8', 0.9, 0); b.curve([[hx + hr + 5, hy], [hx + hr + 10, hy - 4], [hx + hr + 12, hy - 1]], '#f2e6c8', 0.9, 0); b.px(hx + hr + 6, hy + 4, '#fff'); }
    else { b.line(hx + hr + 6, hy + 2, hx + hr + 9, hy + 2, '#e02a3a'); b.px(hx + hr + 10, hy + 1, '#e02a3a').px(hx + hr + 10, hy + 3, '#e02a3a'); }
    return b;
  }

  // =====================================================================
  //  CÁC DẠNG KHÁC
  // =====================================================================
  function spider(o, frame = 0) {
    const b = new Buf(48, 40);
    const f = o.main, s = frame ? 1 : 0, dk = drk(Pix.C(f), 0.25);
    const legs = [[[8, 10], [3, 22]], [[6, 16], [2, 30]], [[9, 22], [5, 37]], [[13, 26], [11, 38]]];
    legs.forEach(([k, e], i) => { b.line(22, 22, k[0], k[1] - s, dk, 2); b.line(k[0], k[1] - s, e[0], e[1], dk, 2); });
    legs.forEach(([k, e], i) => { b.line(26, 22, 48 - k[0] - 4, k[1] + s, f, 2); b.line(48 - k[0] - 4, k[1] + s, 48 - e[0] - 2, e[1], f, 2); });
    b.ell(18, 20, 10, 8, f, 1);
    b.poly([[14, 15], [18, 13], [22, 15], [20, 19], [18, 23], [16, 19]], o.acc, 0.3);
    b.ell(30, 23, 6, 5, lit(Pix.C(f), 0.08), 1);
    for (const [x, y] of [[32, 20], [34, 21], [32, 22], [34, 23]]) b.px(x, y, '#ff2a3a');
    b.line(33, 27, 35, 31, '#f0e8d8'); b.line(30, 27, 31, 31, '#f0e8d8');
    return b;
  }
  function scorpion(o, frame = 0) {
    const b = new Buf(48, 40);
    const f = o.main, s = frame ? 1 : 0;
    for (let i = 0; i < 4; i++) { b.line(14 + i * 4, 28, 10 + i * 4, 35, drk(Pix.C(f), 0.25), 1.5); }
    const seg = [[8, 28], [6, 22], [7, 15], [11, 10], [17, 8 + s]];
    seg.forEach(([x, y], i) => b.ell(x, y, 3.5 - i * 0.3, 3, f, 1));
    b.poly([[17, 6 + s], [24, 8 + s], [19, 12 + s]], o.acc, 0.5); b.px(23, 9 + s, '#ff3a3a');
    b.ell(20, 27, 9, 5, f, 1);
    for (let i = 0; i < 4; i++) b.line(14 + i * 4, 23, 14 + i * 4, 31, drk(Pix.C(f), 0.18));
    b.ell(30, 27, 4, 3.6, f, 1); b.px(32, 25, '#ff3a3a').px(30, 25, '#ff3a3a');
    for (const dy of [-1, 1]) { b.line(32, 27 + dy * 2, 37, 27 + dy * 6, f, 2); b.ell(40, 27 + dy * 6, 3.4, 2.4, f, 1); b.ell(42, 27 + dy * 6 - dy, 1.4, 1, null); }
    return b;
  }
  function toad(o, frame = 0) {
    const b = new Buf(48, 40);
    const f = o.main, s = frame ? 1 : 0;
    b.ell(10, 33, 6, 3.5, drk(Pix.C(f), 0.15), 1); b.ell(36, 33, 6, 3.5, drk(Pix.C(f), 0.15), 1);
    b.ell(23, 26 - s, 16, 10 + s, f, 1);
    b.ell(23, 30 - s, 11, 5, o.light, 0.4);
    for (const [x, y] of [[14, 20], [19, 17], [28, 18], [32, 22], [11, 26], [35, 27], [24, 21]]) b.ell(x, y - s, 1.4, 1.4, o.acc, 0.6);
    for (const x of [15, 31]) { b.ell(x, 15 - s, 5, 5, f, 1); b.ell(x, 14 - s, 3.4, 3.4, '#ffe680', 0.5); b.rect(x - 0.5, 12 - s, 1.5, 4, '#1a1014', 0); }
    b.line(13, 26 - s, 33, 26 - s, drk(Pix.C(f), 0.5));
    b.ell(23, 27 - s, 3.4, 3.4, '#e8c45a', 1); b.rect(22, 26 - s, 2, 2, drk(H('#e8c45a'), 0.5), 0);
    b.ell(14, 34, 3, 2, f, 0.8); b.ell(32, 34, 3, 2, f, 0.8);
    return b;
  }
  function octopus(o, frame = 0) {
    const b = new Buf(48, 44);
    const f = o.main, s = frame ? 2 : 0;
    for (let i = 0; i < 6; i++) {
      const x = 12 + i * 4.6;
      b.curve([[x, 22], [x + (i % 2 ? 6 : -6) + s * (i % 2 ? -1 : 1), 32], [x + (i < 3 ? -5 : 5), 41]], i % 2 ? f : drk(Pix.C(f), 0.12), (k) => 3.6 - k * 2.4, 0.8);
      for (let k = 0; k < 3; k++) b.px(x + (i < 3 ? -1 : 1) * k, 28 + k * 4, o.light);
    }
    b.ell(24, 14, 12, 11, f, 1);
    for (const [x, y] of [[18, 8], [28, 6], [31, 12]]) b.ell(x, y, 1.6, 1.6, lit(Pix.C(f), 0.35), 0.3);
    for (const x of [19, 29]) { b.ell(x, 18, 3, 3.4, '#fff8e6', 0.5); b.rect(x - 0.5, 17, 2, 3, '#1a1014', 0); }
    return b;
  }
  function ghost(o, frame = 0) {
    const b = new Buf(44, 46);
    const f = o.light, s = frame ? 1 : 0;
    for (let i = 0; i < 5; i++) b.ell(8 + i * 7, 10 + (i % 2) * 6 - s, 2.6, 3.6, i % 2 ? o.glow : o.main, 0.3);
    b.poly([[10, 22], [22, 4], [34, 22], [34, 32], [30, 36 + s], [26, 32], [22, 38 - s], [18, 33], [14, 37 + s], [10, 32]], f, 0.8);
    b.ell(22, 18, 12, 13, f, 1);
    b.ell(17, 17, 2.6, 3.6, '#1a1024', 0); b.ell(27, 17, 2.6, 3.6, '#1a1024', 0);
    b.px(17, 16, o.glow).px(27, 16, o.glow);
    b.ell(22, 25, 2.4, 3, '#1a1024', 0);
    b.ell(9, 26, 3, 2, f, 0.6); b.ell(35, 26, 3, 2, f, 0.6);
    return b;
  }
  function skullSpirit(o, frame = 0) {
    const b = new Buf(44, 46);
    const s = frame ? 1 : 0;
    for (let i = 0; i < 6; i++) b.ell(10 + i * 5, 12 + Math.abs(2.5 - i) * 2 - s, 3, 5, i % 2 ? '#ffd04a' : o.main, 0.3);
    b.ell(22, 22, 12, 11, '#efe8d8', 1);
    b.rect(15, 30, 14, 6, '#e2d8c4', 0.6);
    b.ell(17, 22, 3.6, 4, '#1a0e1a', 0); b.ell(27, 22, 3.6, 4, '#1a0e1a', 0);
    b.px(17, 22, o.glow).px(27, 22, o.glow).px(17, 23, o.main).px(27, 23, o.main);
    b.poly([[21, 26], [23, 26], [22, 29]], '#1a0e1a', 0);
    for (let x = 16; x <= 28; x += 3) b.line(x, 31, x, 35, '#7a6a5a');
    b.line(28, 12, 30, 17, '#a89a86');
    for (const x of [8, 36]) b.ell(x, 40 - s, 2, 3, o.main, 0.3);
    return b;
  }
  function kingBird(o, frame = 0) { // Cửu Đầu Trùng
    const b = new Buf(60, 52);
    const f = o.main, up = frame ? -5 : 0;
    b.poly([[22, 32], [6, 12 + up], [2, 26 + up], [14, 40]], drk(Pix.C(f), 0.25), 0.7);
    b.poly([[30, 32], [52, 10 + up], [58, 24 + up], [42, 42]], f, 0.9);
    b.poly([[18, 36], [2, 44], [6, 48], [20, 42]], o.acc, 0.6);
    b.ell(28, 36, 13, 9, f, 1); b.ell(30, 39, 8, 5, o.light, 0.4);
    const heads = [[16, 14], [22, 8], [30, 5], [38, 8], [44, 14]];
    for (const [x, y] of heads) { b.curve([[28, 30], [(28 + x) / 2, (30 + y) / 2 + 6], [x, y + 3]], f, 2.6, 0.7); }
    for (const [x, y] of heads) { b.ell(x, y, 3.6, 3.4, f, 1); b.poly([[x + 2, y], [x + 7, y + 1], [x + 2, y + 2.5]], '#e8b040', 0.3); b.px(x + 1, y - 1, '#ff3a3a'); b.poly([[x - 1, y - 3], [x, y - 7], [x + 1, y - 3]], o.acc, 0); }
    b.line(24, 44, 22, 51, '#e8c45a', 2); b.line(32, 44, 34, 51, '#e8c45a', 2);
    return b;
  }

  // =====================================================================
  //  DANH MỤC
  // =====================================================================
  const HEROES = {
    than_m: { body: 'robe', robe: '#f4ecd6', inner: '#e8d6a8', trim: '#e0b040', sash: '#b8302a', hair: '#24160e', hairStyle: 'bun', hat: 'crown', weapon: 'staff', ribbon: '#f07a6a', boot: '#6a4422' },
    than_f: { body: 'dress', robe: '#f8eedc', inner: '#e86a8a', trim: '#e0b040', sash: '#d24a5a', hair: '#24160e', hairStyle: 'twinlong', hairBack: true, hat: 'tiara', weapon: 'staff', ribbon: '#ff9ab0', pin: '#e8c45a', smile: true },
    ma_m: { body: 'armor', robe: '#8a1e1e', metal: '#3e3842', plate: '#c8302a', trim: '#d4a040', hair: '#1a0e10', hairStyle: 'spiky', hat: 'horns', weapon: 'saber', cape: '#4a0c10', eye: '#5a0a0a', eyeColor: '#ff3a2a', brows: '#1a0a0a', mark: '#e0262a', noBlush: true, boot: '#1d1416', pants: '#2a1616' },
    ma_f: { body: 'armor', robe: '#8a1e2e', metal: '#3e3842', plate: '#c8302a', trim: '#d4a040', hair: '#2a0e18', hairStyle: 'long', hairBack: true, hat: 'horns', weapon: 'saber', cape: '#4a0c18', eyeColor: '#ff3a2a', mark: '#e0262a', boot: '#1d1416', pants: '#2a1620' },
    yeu_m: { body: 'robe', robe: '#6a4ac0', inner: '#2a1a5a', trim: '#7fe0c0', sash: '#e0b04a', hair: '#efe6fb', hairStyle: 'short', hat: 'foxears', tail: 'fox', weapon: 'fan', eyeColor: '#8a4ae8', boot: '#2a1d44' },
    yeu_f: { body: 'dress', robe: '#8a5ad0', inner: '#2a1a5a', trim: '#7fe0c0', sash: '#e0b04a', hair: '#f4eefe', hairStyle: 'long', hairBack: true, hat: 'foxears', tail: 'fox', weapon: 'fan', eyeColor: '#8a4ae8', smile: true },
  };

  const NPCS = {
    thaibach: { body: 'robe', robe: '#f2f0ea', inner: '#c8c0b0', trim: '#e0b040', hair: '#f6f6f2', hairStyle: 'topknot', beard: '#f6f6f2', weapon: 'whisk', brows: '#f6f6f2', closedEyes: true },
    tho_dao: { body: 'robe', robe: '#a8743a', inner: '#6a4422', trim: '#e0b040', hair: '#f2eee6', hairStyle: 'bald', hat: 'scholar', beard: '#f2eee6', weapon: 'staff', closedEyes: true, wide: true },
    duocsu1: { body: 'short', robe: '#e8f0e0', trim: '#4aae7a', hair: '#24160e', hairStyle: 'twin', weapon: 'gourd', smile: true },
    shop1: { body: 'robe', robe: '#3a5a8a', inner: '#24365a', trim: '#e0b040', hair: '#24160e', hairStyle: 'short', hat: 'cap', capc: '#2a2a3a', weapon: 'abacus', mustache: '#24160e', smile: true },
    hangnga: { body: 'dress', robe: '#fbf4fa', inner: '#f4b8d0', trim: '#c8b0f0', sash: '#e88ab0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, pin: '#e8c45a', hat: 'flower', ribbon: '#bfe6ff', smile: true },
    culinh: { body: 'armor', robe: '#5a6a3a', metal: '#7a6a4a', plate: '#e0b040', trim: '#c8302a', head: 'demon', fur: '#6a9a5a', beard: '#2a2a1a', weapon: 'axe', wide: true, cape: '#3a2a1a' },
    nata: { body: 'short', robe: '#f2d0a0', trim: '#e0b040', sash: '#e02a2a', ribbon: '#ff3a3a', hair: '#1a1010', hairStyle: 'short', hat: 'buns2', weapon: 'firespear', wheels: true, mark: '#e0262a', pants: '#e02a2a' },
    nhilang: { body: 'armor', robe: '#3a4a8a', metal: '#c8cad8', plate: '#e0b040', trim: '#e0b040', hair: '#1a1010', hat: 'helmet', helm: '#e0b040', plume: '#e02a2a', weapon: 'trident', thirdEye: true, cape: '#c8302a', brows: '#1a0a0a' },
    duongtang: { body: 'monk', robe: '#e8b040', inner: '#c8862a', kasaya: '#c8302a', trim: '#ffe08a', hairStyle: 'bald', hat: 'monk5', weapon: 'staff', closedEyes: true },
    quanam: { body: 'dress', robe: '#ffffff', inner: '#e8eef6', trim: '#8ac8e8', sash: '#a8d8f0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'tiara', halo: '#ffe08a', weapon: 'vase', closedEyes: true, ribbon: '#bfe6ff' },
    laoong: { body: 'robe', robe: '#8a7a6a', inner: '#5a4a3a', trim: '#c8b090', hair: '#e8e4dc', hairStyle: 'topknot', beard: '#e8e4dc', weapon: 'staff', closedEyes: true },
    duocsu2: { body: 'robe', robe: '#4a8a6a', inner: '#2a5a44', trim: '#e0b040', hair: '#3a2a22', hairStyle: 'short', hat: 'scholar', beard: '#3a2a22', weapon: 'gourd' },
    shop2: { body: 'robe', robe: '#8a3a2a', inner: '#5a2418', trim: '#e0b040', hair: '#24160e', hat: 'cap', capc: '#3a2418', weapon: 'abacus', mustache: '#24160e', wide: true, smile: true },
    casino: { body: 'robe', robe: '#2a2a3a', inner: '#c8302a', trim: '#e0b040', hair: '#1a1010', hat: 'scholar', mustache: '#1a1010', weapon: 'fan', fanc: '#e8c45a', smile: true },
    hachhung: { body: 'armor', robe: '#2a2a32', metal: '#4a4a56', plate: '#c8302a', trim: '#e0b040', head: 'bear', fur: '#23232a', crescent: true, weapon: 'spear', wide: true, cape: '#5a1a1a', hand: '#23232a' },
    hoangphong: { body: 'armor', robe: '#c89a2a', metal: '#8a6a2a', plate: '#ffe08a', trim: '#6a4422', head: 'rat', fur: '#d8b04a', weapon: 'trident', cape: '#e8c45a', tail: 'rat', tailc: '#d8b04a', hand: '#d8b04a', flameAura: false },
    laohau: { body: 'robe', robe: '#8a6a4a', inner: '#5a4430', trim: '#c8b090', head: 'monkey', fur: '#c8c0b0', face: '#f0c8a8', band: false, beard: '#e8e4dc', weapon: 'staff', tail: 'monkey', hand: '#f0c8a8' },
    duocsu3: { body: 'short', robe: '#e8f0e0', trim: '#4aae7a', head: 'monkey', fur: '#a8743a', band: false, weapon: 'gourd', tail: 'monkey', hand: '#f0c0a0' },
    shop3: { body: 'short', robe: '#3a6a8a', trim: '#e0b040', head: 'monkey', fur: '#8a5a2a', band: false, weapon: 'abacus', tail: 'monkey', hand: '#f0c0a0' },
    batgioi: { body: 'monk', robe: '#2a2a3a', inner: '#1a1a24', kasaya: '#3a5a8a', trim: '#e0b040', head: 'pig', fur: '#f2a8b0', weapon: 'rake', tail: 'pig', hand: '#f2a8b0', wide: true },
    satang: { body: 'monk', robe: '#4a5a6a', inner: '#2a3440', kasaya: '#8a3a2a', trim: '#c8b090', skin: '#7aa0c0', hand: '#7aa0c0', hair: '#c83a2a', hairStyle: 'wild', beard: '#c83a2a', necklace: '#f0e8d8', weapon: 'spade', brows: '#c83a2a', eyeColor: '#ffe04a' },
    bachcot: { body: 'dress', robe: '#f4f0f4', inner: '#c8a0c8', trim: '#8a4a8a', sash: '#6a2a6a', skin: '#f4ecf0', hand: '#f4ecf0', hair: '#f8f4fa', hairStyle: 'long', hairBack: true, hat: 'flower', eyeColor: '#c82a8a', ribbon: '#c8a0f0', weapon: 'sword' },
    laonhan: { body: 'robe', robe: '#c88a4a', inner: '#8a5a2a', trim: '#e8d0a0', hair: '#f0ece4', hairStyle: 'topknot', beard: '#f0ece4', weapon: 'staff', closedEyes: true, hat: 'turban', turban: '#f2ead8' },
    thodia: { body: 'robe', robe: '#8a6a3a', inner: '#5a4422', trim: '#e0b040', hair: '#f2eee6', hairStyle: 'bald', hat: 'scholar', beard: '#f2eee6', weapon: 'staff', closedEyes: true, wide: true },
    duocsu4: { body: 'monk', robe: '#e0a040', inner: '#b0782a', kasaya: '#c8302a', trim: '#ffe08a', hair: '#1a1010', hat: 'turban', turban: '#f2e0c0', weapon: 'gourd', skin: '#d8a880', hand: '#d8a880' },
    shop4: { body: 'robe', robe: '#3a6a5a', inner: '#24443a', trim: '#e0b040', hat: 'turban', turban: '#e8402a', skin: '#d8a880', hand: '#d8a880', mustache: '#1a1010', weapon: 'lantern', hair: '#1a1010' },
    honghai: { body: 'short', robe: '#e02a2a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1010', hat: 'buns2', weapon: 'firespear', flameAura: true, pants: '#a81a1a', mark: '#ffd04a', smile: true },
    thietphien: { body: 'dress', robe: '#e04a3a', inner: '#8a1a1a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1010', hairStyle: 'bun', hairBack: true, pin: '#ffd04a', hat: 'tiara', weapon: 'bigfan', fanc: '#2a8a5a', ribbon: '#ff8a5a' },
    nguuma: { body: 'armor', robe: '#3a2a2a', metal: '#2a2a32', plate: '#e0b040', trim: '#e0b040', head: 'bull', fur: '#3a2a26', weapon: 'mace', wide: true, cape: '#8a1a1a', hand: '#3a2a26', tail: 'bull' },
    lucnhi: { body: 'armor', robe: '#5a3a2a', metal: '#c8a04a', plate: '#ffe08a', trim: '#c8302a', head: 'monkey', fur: '#7a4a2a', face: '#f0c0a0', eyeGlow: '#ff3a3a', weapon: 'goldstaff', cape: '#c8302a', tail: 'monkey', hand: '#f0c0a0' },
  };
  // boss trùng tên NPC dùng chung preset
  const BOSS_ALIAS = { culinh: 'culinh', nata: 'nata', nhilang: 'nhilang', hachhung: 'hachhung', hoangphong: 'hoangphong', batgioi: 'batgioi', satang: 'satang', bachcot: 'bachcot', honghai: 'honghai', thietphien: 'thietphien', nguuma: 'nguuma', lucnhi: 'lucnhi' };

  const HUMANS = {
    thienbinh: { body: 'armor', robe: '#c8302a', metal: '#c8cad8', plate: '#e0b040', trim: '#e0b040', hair: '#1a1010', hat: 'helmet', helm: '#c8cad8', plume: '#e02a2a', weapon: 'spear', brows: '#1a0a0a' },
    sontac: { body: 'short', robe: '#5a4a3a', trim: '#8a3a2a', sash: '#8a3a2a', hair: '#1a1010', hairStyle: 'wild', hat: 'mask', weapon: 'saber', brows: '#1a0a0a', pants: '#3a2a22' },
    hoayeu: { body: 'short', robe: '#3a1a1a', trim: '#ff8a2a', head: 'demon', fur: '#e04a2a', beard: '#3a0a0a', weapon: 'club', hand: '#e04a2a', pants: '#2a1010', flameAura: true },
  };

  Object.assign(NPCS, {
    nhulai: { body: 'monk', robe: '#e8b040', inner: '#c8862a', kasaya: '#c8302a', trim: '#ffe08a', skin: '#f0c878', hand: '#f0c878', hair: '#2a3a7a', hairStyle: 'bun', halo: '#ffe08a', closedEyes: true, mark: '#d42a2a', wide: true },
    tiepdan: { body: 'monk', robe: '#f0d070', inner: '#c8a040', kasaya: '#e8802a', trim: '#fff0b0', skin: '#f0c878', hand: '#f0c878', hair: '#2a3a7a', hairStyle: 'bun', halo: '#ffe08a', closedEyes: true, weapon: 'staff' },
    ngokhong: { body: 'short', robe: '#e8c45a', trim: '#c8302a', sash: '#c8302a', head: 'monkey', fur: '#b8783a', weapon: 'goldstaff', tail: 'monkey', hand: '#f0c0a0', pants: '#8a3a2a', cape: '#c8302a' },
    luuhong: { body: 'short', robe: '#2a3a4a', trim: '#8a2a2a', sash: '#8a2a2a', hair: '#1a1010', hairStyle: 'wild', mustache: '#1a1010', brows: '#1a0a0a', weapon: 'saber', pants: '#1a2430', noBlush: true },
    dantuong: { body: 'armor', robe: '#8a5a1a', metal: '#c8a04a', plate: '#ffe08a', trim: '#c8302a', head: 'tiger', fur: '#e8902a', weapon: 'spear', hand: '#e8902a', tail: 'tiger', tailc: '#e8902a', cape: '#6a2a1a', wide: true },
    tieubachlong: { kind: 'serp', main: '#f4f8ff', light: '#ffffff', acc: '#8ac8ff', dragon: true },
    kimtri: { body: 'monk', robe: '#8a6a4a', inner: '#5a4430', kasaya: '#a8322a', trim: '#e0b040', hairStyle: 'bald', weapon: 'staff', beard: '#e8e4dc', closedEyes: true },
    linhcat: { body: 'robe', robe: '#f0d070', inner: '#c88a2a', trim: '#ffffff', hair: '#1a1018', hairStyle: 'bun', hat: 'tiara', halo: '#ffe08a', weapon: 'staff', closedEyes: true, ribbon: '#ffe8b0' },
    laomau: { body: 'robe', robe: '#6a4a8a', inner: '#3a2a5a', trim: '#e0b040', hair: '#e8e4ec', hairStyle: 'bun', pin: '#e8c45a', weapon: 'staff', closedEyes: true, smile: true },
    tranguyen: { body: 'robe', robe: '#e8a040', inner: '#8a4a1a', trim: '#ffffff', hair: '#1a1010', hairStyle: 'topknot', hat: 'crown', beard: '#1a1010', weapon: 'whisk', wide: true },
    congchua: { body: 'dress', robe: '#f8c8d8', inner: '#e86a8a', trim: '#e0b040', sash: '#e86a8a', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'tiara', ribbon: '#ffb0c8' },
    hoangbao: { body: 'armor', robe: '#c89a2a', metal: '#6a5a3a', plate: '#ffe08a', trim: '#c8302a', head: 'demon', fur: '#4a6ab8', beard: '#1a1a3a', weapon: 'saber', cape: '#8a2a2a', hand: '#4a6ab8', wide: true },
    tieuphu: { body: 'short', robe: '#8a7a5a', trim: '#5a4a3a', sash: '#5a4a3a', hair: '#2a1e14', hairStyle: 'short', hat: 'cap', capc: '#c8b080', weapon: 'axe', pants: '#5a4a3a' },
    ngangiac: { body: 'robe', robe: '#c8cad8', inner: '#6a6a7a', trim: '#e0e0e8', head: 'demon', fur: '#8aa0c0', beard: '#3a3a4a', weapon: 'sword', hand: '#8aa0c0', offhand: 'gourd' },
    kimgiac: { body: 'robe', robe: '#e8c45a', inner: '#8a5a1a', trim: '#ffffff', head: 'demon', fur: '#d8a040', beard: '#5a3a1a', weapon: 'sword', hand: '#d8a040', offhand: 'gourd', wide: true },
    vuaoke: { body: 'robe', robe: '#c8c0e0', inner: '#8a80a8', trim: '#e0b040', skin: '#d8dcf0', hand: '#d8dcf0', hair: '#2a2a3a', hat: 'crown', closedEyes: true, noBlush: true },
    giavuong: { body: 'robe', robe: '#e8b040', inner: '#c8302a', trim: '#ffffff', head: 'lion', fur: '#4a9a8a', mane: '#2a6a5a', hat: 'crown', weapon: 'staff', hand: '#4a9a8a', wide: true },
    dalong: { body: 'armor', robe: '#2a4a5a', metal: '#3a6a6a', plate: '#8ad8c8', trim: '#e0b040', head: 'croc', fur: '#4a7a5a', weapon: 'trident', hand: '#4a7a5a', cape: '#1a2a3a', tail: 'tiger', tailc: '#4a7a5a' },
    tangnhan: { body: 'monk', robe: '#8a7a6a', inner: '#5a4a3a', kasaya: '#a87a4a', trim: '#c8b090', hairStyle: 'bald' },
    vua: { body: 'robe', robe: '#e8c040', inner: '#c8302a', trim: '#ffffff', hair: '#1a1010', hat: 'crown', mustache: '#1a1010', wide: true },
    daodong: { body: 'robe', robe: '#4a6a8a', inner: '#2a3a5a', trim: '#e8e4dc', hair: '#1a1010', hairStyle: 'bun', weapon: 'sword' },
    holuc: { body: 'robe', robe: '#e8c45a', inner: '#8a5a1a', trim: '#2a2a2a', head: 'tiger', fur: '#e8902a', weapon: 'whisk', hand: '#e8902a', wide: true },
    duongluc: { body: 'robe', robe: '#f2ead8', inner: '#8a8a7a', trim: '#4a6a8a', head: 'ram', fur: '#f0ece0', weapon: 'whisk', hand: '#f0ece0', wide: true },
    laoquan: { body: 'robe', robe: '#f4f0e4', inner: '#c8b890', trim: '#5a7aa8', hair: '#ffffff', hairStyle: 'topknot', beard: '#ffffff', brows: '#ffffff', closedEyes: true, weapon: 'gourd', offhand: 'fan', fanc: '#e8c45a' },
    linhcam: { body: 'armor', robe: '#e86a2a', metal: '#e8a040', plate: '#ffe08a', trim: '#c8302a', head: 'fish', fur: '#f0a030', fin: '#e8502a', weapon: 'mace', hand: '#f0a030', cape: '#c8302a' },
    docgiac: { body: 'armor', robe: '#2a4a5a', metal: '#3a5a6a', plate: '#e0b040', trim: '#e0b040', head: 'bull', fur: '#3a6a7a', singleHorn: true, weapon: 'spear', hand: '#3a6a7a', tail: 'bull', wide: true },
    nuquan: { body: 'dress', robe: '#e88ab0', inner: '#a83a6a', trim: '#e0b040', hair: '#1a1018', hairStyle: 'bun', hairBack: true, pin: '#e8c45a', smile: true },
    nuvuong: { body: 'dress', robe: '#d42a5a', inner: '#8a1a3a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'crown', ribbon: '#ff8ab0', smile: true },
    bocap: { body: 'dress', robe: '#6a2a5a', inner: '#2a0a2a', trim: '#e0b040', hair: '#2a0a1a', hairStyle: 'long', hairBack: true, tail: 'scorpion', tailc: '#8a3a2a', eyeColor: '#ff3a2a', weapon: 'trident' },
    hanhtien: { body: 'dress', robe: '#ffd0e0', inner: '#f0a0c0', trim: '#9ad07a', hair: '#3a1a1a', hairStyle: 'bun', hairBack: true, hat: 'flower', ribbon: '#ffe0f0', smile: true },
    cuudau: { kind: 'king', main: '#2a4a8a', light: '#8ab0e8', acc: '#e8c45a' },
    hoangmi: { body: 'monk', robe: '#e8c45a', inner: '#a8782a', kasaya: '#8a4a1a', trim: '#ffe08a', hairStyle: 'bald', brows: '#ffd040', eyeColor: '#ffd040', weapon: 'staff', wide: true },
    manxa: { kind: 'serp', main: '#c8302a', light: '#ffd0a0', acc: '#6a1a10', pattern: '#ffd04a' },
    kimmao: { body: 'armor', robe: '#e8a040', metal: '#c8862a', plate: '#ffe08a', trim: '#c8302a', head: 'lion', fur: '#e8b040', mane: '#c86a1a', weapon: 'mace', hand: '#e8b040', cape: '#c8302a', wide: true },
    nhentinh: { body: 'dress', robe: '#7a3a9a', inner: '#3a1a5a', trim: '#e0b040', hair: '#1a0a1a', hairStyle: 'long', hairBack: true, spiderLegs: '#4a2a4a', eyeColor: '#c82a8a', smile: true },
    bachnhan: { body: 'robe', robe: '#2a5a3a', inner: '#1a3a24', trim: '#e0b040', hair: '#1a1010', hairStyle: 'topknot', manyEyes: true, beard: '#1a1010', weapon: 'sword', skin: '#d8e0a8', hand: '#d8e0a8' },
    thanhsu: { body: 'armor', robe: '#2a6a5a', metal: '#3a8a7a', plate: '#e0b040', trim: '#e0b040', head: 'lion', fur: '#5ab0a0', mane: '#2a6a5a', weapon: 'saber', hand: '#5ab0a0', wide: true, cape: '#1a3a34' },
    bachtuong: { body: 'armor', robe: '#8a8a9a', metal: '#c8c8d8', plate: '#e0b040', trim: '#e0b040', head: 'elephant', fur: '#d8d8e4', weapon: 'spear', hand: '#d8d8e4', wide: true, cape: '#5a5a7a' },
    daibang: { body: 'armor', robe: '#c8862a', metal: '#e8c45a', plate: '#fff0a0', trim: '#c8302a', head: 'eagle', fur: '#e8b040', weapon: 'trident', hand: '#e8b040', wings: '#c89a2a', wide: true },
    quoctruong: { body: 'robe', robe: '#f4f0e4', inner: '#8a7a5a', trim: '#e0b040', head: 'deer', fur: '#f0ece0', weapon: 'staff', hand: '#f0ece0' },
    chuottinh: { body: 'dress', robe: '#f4f0f4', inner: '#c8a0b0', trim: '#e0b040', head: 'rat', fur: '#f0ece8', hat: 'flower', weapon: 'sword', hand: '#f0ece8', tail: 'rat', tailc: '#e8a8b0' },
    thieunu: { body: 'dress', robe: '#fff4f8', inner: '#f4c8d8', trim: '#c8a0b0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'flower', smile: true },
    baotinh: { body: 'armor', robe: '#5a4a2a', metal: '#8a7a4a', plate: '#e0b040', trim: '#e0b040', head: 'tiger', fur: '#e8c050', spots: true, weapon: 'spear', hand: '#e8c050', tail: 'tiger', tailc: '#e8c050' },
    quan: { body: 'robe', robe: '#c8302a', inner: '#8a1a1a', trim: '#e0b040', hair: '#1a1010', hat: 'scholar', mustache: '#1a1010' },
    hoangsu: { body: 'armor', robe: '#c89a3a', metal: '#a87a2a', plate: '#ffe08a', trim: '#c8302a', head: 'lion', fur: '#e8c050', mane: '#c88a2a', weapon: 'rake', hand: '#e8c050', wide: true },
    cuulinh: { kind: 'quad', main: '#e8a040', light: '#ffe0a0', acc: '#8a3a1a', mane: '#c84a2a', maneSize: 1.25, tail: 'tuft', legs: 10, legW: 4.5, headR: 6.6, ears: 'round', snout: 'short', collar: '#e0b040', size: 1.15 },
    teguu: { body: 'armor', robe: '#3a4a6a', metal: '#5a6a8a', plate: '#e0b040', trim: '#e0b040', head: 'rhino', fur: '#7a8a9a', weapon: 'axe', hand: '#7a8a9a', wide: true },
    ngoctho: { body: 'dress', robe: '#ffffff', inner: '#f4d0e0', trim: '#e0b040', sash: '#e86a8a', hair: '#f4f0f8', hairStyle: 'long', hairBack: true, hat: 'rabbitears', eyeColor: '#e02a5a', weapon: 'club', smile: true },
    khau: { body: 'robe', robe: '#8a5a3a', inner: '#5a3a24', trim: '#e0b040', hair: '#e8e4dc', hairStyle: 'topknot', beard: '#e8e4dc', hat: 'cap', capc: '#3a2a20', closedEyes: true },
    laongoan: { kind: 'quad', main: '#e8e4dc', light: '#ffffff', acc: '#8a9aac', shell: '#f4f0e8', legs: 5, legW: 4.5, tail: 'snake', tailc: '#c8c4bc', headR: 4.8, snout: 'short', size: 1.15 },
    tieuyeu: { body: 'short', robe: '#5a3a2a', trim: '#8a8a3a', sash: '#8a8a3a', head: 'demon', fur: '#6aa04a', beard: '#2a2a1a', weapon: 'club', hand: '#6aa04a', pants: '#3a2a1a' },
  });
  Object.assign(HUMANS, {
    thuytac: { body: 'short', robe: '#2a4a5a', trim: '#c8302a', sash: '#c8302a', hair: '#1a1010', hairStyle: 'wild', hat: 'mask', weapon: 'saber', pants: '#1a2a34' },
    tieuyeu: NPCS.tieuyeu, daodong: NPCS.daodong,
  });

  // 28 hình thái Tiên sủng: [kiểu, tuỳ chọn]  – E = bảng màu theo ngũ hành
  const FORMS = {
    hautinh: (E) => ['hum', { body: 'short', robe: E.main, trim: E.light, head: 'monkey', fur: '#a8743a', weapon: 'goldstaff', tail: 'monkey', hand: '#f0c0a0', pants: E.acc }],
    truyeu: (E) => ['hum', { body: 'short', robe: E.main, trim: E.light, head: 'pig', fur: '#e89aa0', weapon: 'club', tail: 'pig', hand: '#e89aa0', wide: true, pants: E.acc }],
    holy: (E) => ['quad', { main: E.main, light: '#fff6ee', acc: E.acc, tail: 'fox', tails: 3, ears: 'point', snout: 'long', size: 0.85, legs: 8, legW: 2.6 }],
    hoyeu: (E) => ['hum', { body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'tiger', fur: '#e8902a', weapon: 'saber', tail: 'tiger', tailc: '#e8902a', hand: '#e8902a', cape: E.main }],
    langyeu: (E) => ['hum', { body: 'short', robe: E.main, trim: E.light, head: 'wolf', fur: '#7a7a86', weapon: 'saber', tail: 'wolf', hand: '#7a7a86', pants: E.acc, cape: E.acc }],
    xatinh: (E) => ['serp', { main: E.main, light: E.light, acc: E.acc, pattern: E.acc }],
    thiemthu: (E) => ['toad', { main: E.main, light: E.light, acc: E.acc }],
    tienhac: (E) => ['bird', { main: '#ffffff', light: '#f6f2ea', wing: '#ffffff', wingTip: E.acc, tail: '#1a1a22', headc: '#ffffff', cap: '#e02a2a', beak: '#6a6a5a', beakLen: 6, neckLen: 12, neckX: 9, neckc: '#ffffff', legs: true, headR: 3 }],
    phuong: (E) => ['bird', { main: E.main, light: E.light, wing: E.main, wingTip: '#ffd04a', longTail: E.light, acc: '#ffd04a', crest: '#ffd04a', neckLen: 6, neckX: 7, headR: 3.8 }],
    thanhlong: (E) => ['serp', { main: E.main, light: E.light, acc: E.acc, dragon: true }],
    kylan: (E) => ['quad', { main: E.main, light: E.light, acc: E.acc, mane: '#ff8a2a', maneSize: 0.7, horn: 'single', scales: true, tail: 'tuft', legs: 11, neck: 5, hoof: '#3a2418', snout: 'long', ears: 'point' }],
    huyenquy: (E) => ['quad', { main: '#6a8a5a', light: '#c8d8a8', acc: E.acc, shell: E.main, legs: 5, legW: 4.5, tail: 'snake', tailc: E.acc, headR: 4.6, snout: 'short', size: 1.05 }],
    nguuma: (E) => ['hum', { body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'bull', fur: '#5a3a2a', weapon: 'mace', hand: '#5a3a2a', tail: 'bull', wide: true }],
    thongoc: (E) => ['quad', { main: '#ffffff', light: '#fff4f4', acc: E.main, ears: 'long', tail: 'cotton', size: 0.7, legs: 5, legW: 3, headR: 5.6, snout: 'short', collar: E.main, eye: '#e02a5a' }],
    battuong: (E) => ['quad', { main: '#9aa0aa', light: '#c8ccd4', acc: E.main, ears: 'big', snout: 'trunk', tusk: true, size: 1.15, legs: 9, legW: 5, headR: 7.5, tail: 'long', tailc: '#9aa0aa', saddle: E.main, noBelly: true }],
    kimbang: (E) => ['bird', { main: E.main, light: E.light, wing: E.main, wingTip: E.acc, tail: E.acc, crest: E.light, hook: true, talons: true, headc: E.light, neckLen: 5, neckX: 7, headR: 4, beak: '#ffd040' }],
    hachung: (E) => ['hum', { body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'bear', fur: '#3a2a22', weapon: 'spear', hand: '#3a2a22', wide: true }],
    thutinh: (E) => ['hum', { body: 'short', robe: E.main, trim: E.light, head: 'rat', fur: '#8a8a92', weapon: 'sword', tail: 'rat', tailc: '#e8a8b0', hand: '#e8a8b0', pants: E.acc }],
    nhentinh: (E) => ['spider', { main: drk(H(E.acc), 0.2), acc: E.main }],
    hatinh: (E) => ['scorp', { main: E.main, acc: E.acc }],
    longma: (E) => ['quad', { main: '#f6f2ea', light: '#ffffff', acc: E.main, mane: E.main, tail: 'horse', legs: 12, legW: 3, neck: 7, headR: 5, snout: 'long', ears: 'point', horn: 'antler', hornc: E.main, hoof: '#3a2418', saddle: E.acc }],
    suvuong: (E) => ['quad', { main: '#e8b050', light: '#f8e0b0', acc: E.main, mane: E.main, maneSize: 1.1, tail: 'tuft', legs: 10, legW: 4, headR: 6.4, ears: 'round', snout: 'short', collar: '#e0b040' }],
    viemthu: (E) => ['quad', { main: E.main, light: E.light, acc: E.acc, tail: 'flame', backFlame: true, legs: 6, legW: 3.5, headR: 5.6, snout: 'long', scales: true, size: 1.05, eye: '#ffd040' }],
    bachcot: (E) => ['hum', { body: 'robe', robe: E.acc, inner: '#1a1a22', trim: E.main, head: 'skull', eyeGlow: E.glow, weapon: 'sword', hand: '#efe8d8', cape: '#2a2230' }],
    thuyquai: (E) => ['octo', { main: E.main, light: E.light, acc: E.acc }],
    doiyeu: (E) => ['bat', { main: drk(H(E.acc), 0.3), wing: drk(H(E.acc), 0.1), light: E.main }],
    khongtuoc: (E) => ['bird', { main: '#2a6ac8', light: '#4ab8c8', wing: '#2a8a6a', wingTip: E.main, fanTail: E.main, crest: '#ffd04a', neckLen: 7, neckX: 7, headR: 3.2, legs: true, legc: '#8a7a6a', headc: '#2a6ac8' }],
    quyhoa: (E) => ['ghost', { main: E.main, light: '#e8f0ff', glow: E.glow }],
  };

  // ---------- bộ nhớ đệm ----------
  const cache = new Map();
  function build(kind, opts, frame) {
    switch (kind) {
      case 'hum': return humanoid(opts, frame);
      case 'quad': return quad(opts, frame);
      case 'bird': return bird(opts, frame);
      case 'bat': return bat(opts, frame);
      case 'serp': return serpent(opts, frame);
      case 'spider': return spider(opts, frame);
      case 'scorp': return scorpion(opts, frame);
      case 'toad': return toad(opts, frame);
      case 'octo': return octopus(opts, frame);
      case 'ghost': return ghost(opts, frame);
      case 'skull': return skullSpirit(opts, frame);
      case 'king': return kingBird(opts, frame);
    }
  }
  function get(key, kind, opts, frame = 0, scale = 4) {
    const k = key + '|' + frame + '|' + scale;
    if (!cache.has(k)) {
      const cv = render(build(kind, opts, frame), scale);
      cache.set(k, { cv, url: cv.toDataURL() });
    }
    return cache.get(k);
  }

  // API
  function hero(race, gender, frame = 0, scale = 4) { const id = race + '_' + (gender === 'f' ? 'f' : 'm'); return get('hero:' + id, 'hum', HEROES[id] || HEROES.than_m, frame, scale); }
  function npc(id, frame = 0, scale = 4) { const o = NPCS[id]; return o ? get('npc:' + id, o.kind || 'hum', o, frame, scale) : null; }
  function form(formId, element = 'tho', frame = 0, scale = 4) {
    const fn = FORMS[formId]; if (!fn) return null;
    const [kind, opts] = fn(ELEM[element] || ELEM.tho);
    return get('form:' + formId + ':' + element, kind, opts, frame, scale);
  }
  function human(hid, frame = 0, scale = 4) { const o = HUMANS[hid]; return o ? get('hum:' + hid, o.kind || 'hum', o, frame, scale) : null; }
  function boss(bid, frame = 0, scale = 4) {
    if (bid === 'world') return get('boss:world', 'king', { main: '#3a5a8a', light: '#a8c8e8', acc: '#e8c45a' }, frame, scale);
    return npc(BOSS_ALIAS[bid] || bid, frame, scale);
  }
  // từ một đơn vị trận đấu
  function unit(u, frame = 0) {
    if (u.hero) return hero(u.hero.race, u.hero.gender, frame);
    if (u.bossId) return boss(u.bossId, frame);
    if (u.hid) return human(u.hid, frame);
    if (u.form) return form(u.form, u.element, frame);
    return null;
  }
  const kindOf = (formId) => (FORMS[formId] ? FORMS[formId](ELEM.tho)[0] : 'hum');

  return { hero, npc, form, human, boss, unit, kindOf, HEROES, NPCS, FORMS, ELEM };
})();
