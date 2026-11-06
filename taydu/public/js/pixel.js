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
  const { Buf, render, H, mix, lit, drk, C } = Pix;
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
    if (o._face) { o._face(b, cx, cy); return; }
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
    if (t === 'phoenix') { // mũ phượng sí tử kim quan: vành vàng + hai lông trĩ dài
      for (const s2 of [-1, 1]) { b.curve([[cx + s2 * 3, cy - 9], [cx + s2 * 10, cy - 19], [cx + s2 * 20, cy - 19]], '#d8302a', (q) => 1.8 - q * 0.9, 0.4); b.curve([[cx + s2 * 20, cy - 19], [cx + s2 * 25, cy - 18], [cx + s2 * 27, cy - 13]], '#ff6a3a', 1, 0.3); }
      b.rect(cx - 9, cy - 9, 18, 3, G, 0.7); b.poly([[cx - 4, cy - 9], [cx, cy - 14], [cx + 4, cy - 9]], G, 1); b.ell(cx, cy - 10.5, 1.4, 1.4, R, 0); }
    if (t === 'smallhorns') { for (const s2 of [-1, 1]) b.curve([[cx + s2 * 5, cy - 7], [cx + s2 * 8, cy - 10], [cx + s2 * 7, cy - 14]], o.horn || '#2a2224', (q) => 2.4 - q * 1.8, 1); }
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
    if (w === 'khakkhara') { b.line(x, y - 28, x, y + 12, '#c89a2a', 2); b.ell(x, y - 31, 4.5, 4.5, G, 1); b.ell(x, y - 31, 2.6, 2.6, null); for (const d of [-4, 4]) b.ell(x + d, y - 27, 1.4, 1.4, '#fff0a0', 0.5); b.px(x, y - 36, G); }
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
  // =====================================================================
  //  DÁNG CAO THANH THOÁT (≈7 đầu) – khung 72×140 điểm ảnh
  // =====================================================================
  // bộ đệm "phóng to" để dùng lại hàm vẽ vũ khí cũ ở tỉ lệ người cao
  function scaled(b, ox, oy, k) {
    const X = (x) => ox + (x - ox) * k, Y = (y) => oy + (y - oy) * k;
    const sb = {
      line: (x0, y0, x1, y1, c, w = 1) => (b.line(X(x0), Y(y0), X(x1), Y(y1), c, Math.max(1, Math.round(w * k * 0.75))), sb),
      rect: (x0, y0, w, h, c, sh) => (b.rect(X(x0), Y(y0), w * k, h * k, c, sh), sb),
      ell: (cx, cy, rx, ry, c, sh) => (b.ell(X(cx), Y(cy), rx * k, ry * k, c, sh), sb),
      poly: (pts, c, sh) => (b.poly(pts.map(([x, y]) => [X(x), Y(y)]), c, sh), sb),
      curve: (pts, c, w, sh) => (b.curve(pts.map(([x, y]) => [X(x), Y(y)]), c, typeof w === 'function' ? (t) => w(t) * k : (w || 2) * k, sh), sb),
      px: (x, y, c) => (b.rect(X(x), Y(y), Math.ceil(k), Math.ceil(k), c, 0), sb),
      set: (x, y, c) => (b.rect(X(x), Y(y), Math.ceil(k), Math.ceil(k), c, 0), sb),
      get: (x, y) => b.get(X(x), Y(y)), w: b.w, h: b.h,
    };
    return sb;
  }
  function weaponTall(b, x, y, o, k = 1.85) { weapon(scaled(b, x, y, k), x, y, o); }

  // mặt có cảm xúc: calm · smile · angry · hurt · cast · blink – k: hệ số cỡ đầu
  function faceFn(o, expr, k = 1) {
    return (b, cx, cy) => {
      const eye = o.eye || EYE, iris = o.eyeColor || '#5a3a24', ey = Math.round(cy + 1 * k);
      const brow = o.brows || drk(C(o.hair || '#2a1a10'), 0.1);
      const gap = Math.round(3.6 * k), ew = k > 1.08 ? 3 : 2, eh = k > 1.08 ? 3 : 2.4;
      const L = Math.round(cx - gap - ew + 0.5), R = Math.round(cx + gap - 0.5);
      const fem = o.lashes || o.body === 'dress';
      for (const x of [L, R]) {
        if (expr === 'hurt') { b.line(x, ey - 1, x + ew, ey + 0.5, eye); b.line(x, ey + 2, x + ew, ey + 0.5, eye); }
        else if (expr === 'cast' || expr === 'blink' || o.closedEyes) { b.line(x, ey + 1, x + ew, ey + 1, eye); b.px(x - 1, ey, eye); b.px(x + ew + 1, ey, eye); }
        else if (expr === 'smile') { b.line(x, ey + 1, x + ew / 2, ey - 0.5, eye); b.line(x + ew / 2, ey - 0.5, x + ew, ey + 1, eye); }
        else { // mắt to kiểu hoạt hình: mi trên đậm, tròng màu, hai đốm sáng
          b.line(x - 1, ey - 1.5, x + ew, ey - 1.5, eye);
          b.rect(x, ey - 0.5, ew, eh, iris, 0); b.rect(x + (ew > 2 ? 1 : 0.5), ey + 0.5, ew > 2 ? 1.5 : 1, eh - 1, eye, 0);
          b.px(x, ey - 0.5, '#ffffff'); b.px(x + ew - 1, ey + eh - 1.5, lit(C(iris), 0.45));
          if (fem) { b.px(x - 1.5, ey - 2.2, eye); b.px(x + ew + 0.5, ey - 2.2, eye); }
        }
      }
      const by = ey - Math.round(3.2 * k);
      if (expr === 'angry') { b.line(L - 1, by - 1, L + ew, by + 1, brow, 1); b.line(R, by + 1, R + ew + 1, by - 1, brow, 1); }
      else if (expr === 'hurt') { b.line(L - 1, by + 0.6, L + ew, by - 0.8, brow, 1); b.line(R, by - 0.8, R + ew + 1, by + 0.6, brow, 1); }
      else if (!o.noBrows) { b.line(L - 0.5, by, L + ew, by - 0.6, brow, 1); b.line(R, by - 0.6, R + ew + 0.5, by, brow, 1); }
      b.px(cx - 0.2, cy + 3.8 * k, drk(C(o.skin || SKIN), 0.24));
      if (!o.noBlush) { const bx = Math.round(6 * k), byy = ey + Math.round(3 * k); b.px(cx - bx, byy, '#f2a090'); b.px(cx - bx + 1, byy, '#f6b8a4'); b.px(cx + bx - 1, byy, '#f6b8a4'); b.px(cx + bx, byy, '#f2a090'); }
      const m = o.mouth || '#b0503a', my = Math.round(cy + 6.2 * k);
      if (expr === 'smile' || (o.smile && expr === 'calm')) { b.px(cx - 2, my - 1, m); b.line(cx - 1, my, cx + 1, my, m); b.px(cx + 2, my - 1, m); }
      else if (expr === 'angry') { b.line(cx - 2, my, cx + 2, my, drk(C(m), 0.3)); b.px(cx - 1, my, '#ffffff'); b.px(cx + 1, my, '#ffffff'); }
      else if (expr === 'hurt') b.ell(cx, my, 1.5, 1.2, '#5a1a14', 0);
      else b.line(cx - 1, my, cx + 1, my, m);
      if (o.thirdEye) { b.px(cx, cy - 4 * k, '#d42a2a').px(cx, cy - 3 * k, '#ffd65a'); }
      if (o.mark) { b.px(cx, cy - 4.5 * k, o.mark); b.px(cx, cy - 5.5 * k, o.mark); }
      if (o.manyEyes) for (const [x, y] of [[-7, -3], [6, -3], [-2, -5], [2, -5]]) { b.px(cx + x * k, cy + y * k, '#ffd040'); b.px(cx + x * k, cy + (y + 1) * k, '#2a1a0a'); }
    };
  }

  // viền sáng phía trên-trái (ánh trăng) cho khối rõ nét
  function rimLight(b) {
    const out = b.d.slice();
    for (let y = 1; y < b.h; y++) for (let x = 1; x < b.w; x++) {
      const c = b.d[y * b.w + x]; if (!c || c.noOutline) continue;
      if (!b.d[(y - 1) * b.w + x] || !b.d[y * b.w + x - 1]) { const v = lit(c, 0.22); out[y * b.w + x] = v; }
    }
    b.d = out; return b;
  }

  // =====================================================================
  //  DÁNG NGƯỜI 4–5 ĐẦU – 6 kiểu thân, khung chung 80×124 (chân chạm đáy)
  //  → mọi nhân vật cùng một thước đo: trẻ con thấp, khổng lồ cao to
  // =====================================================================
  const BUILD = {
    kid: { h: 74, k: 1.3, sh: 8, waist: 6, hip: 7, arm: 4.4, leg: 0.4, neck: 2 },
    slim: { h: 100, k: 1.18, sh: 9.5, waist: 5.5, hip: 9.5, arm: 3.8, leg: 0.5, neck: 3.5 },
    male: { h: 104, k: 1.2, sh: 12, waist: 8, hip: 9, arm: 5, leg: 0.48, neck: 3.5 },
    brawny: { h: 108, k: 1.16, sh: 16, waist: 10.5, hip: 11, arm: 7, leg: 0.45, neck: 4 },
    fat: { h: 98, k: 1.24, sh: 13, waist: 14, hip: 13, arm: 6, leg: 0.34, neck: 2, belly: 15 },
    giant: { h: 120, k: 1.3, sh: 20, waist: 14, hip: 15, arm: 9, leg: 0.44, neck: 4 },
  };
  function buildOf(o) {
    if (o.build && BUILD[o.build]) return o.build;
    if (o.body === 'dress') return 'slim';
    if (o.wide) return o.body === 'armor' ? 'brawny' : 'fat';
    return 'male';
  }

  function tallHumanoid(o, frame = 0, expr = 'calm') {
    const W = 80, Hh = 124, b = new Buf(W, Hh), cx = 40, F = 122;
    const bt = buildOf(o), B = BUILD[bt], k = B.k;
    const bob = frame ? -1 : 0, walk = frame === 1 ? 2 : frame === 2 ? -2 : 0, sway = walk * 0.7;
    const top = F - B.h, hy = Math.round(top + 10.5 * k) + bob;
    const t = Math.round(hy + 8.5 * k + B.neck) + bob;                     // đường vai
    const crotch = Math.round(F - (F - t) * B.leg), sy = Math.round(t + (crotch - t) * 0.62); // đáy quần, thắt lưng
    const extra = o.wide && bt !== 'brawny' && bt !== 'fat' && bt !== 'giant' ? 2 : 0;
    const sh = B.sh + extra, waist = B.waist + extra, hip = B.hip + extra;
    const main = o.robe || '#b84a3a', trim = o.trim || '#e8c45a', inner = o.inner || drk(C(main), 0.28);
    const style = o.body || 'robe', fem = bt === 'slim', hemY = F - 4;
    const skin = o.skin || SKIN, hand = o.hand || skin, sleeve = o.sleeve || main;
    const fold = drk(C(main), 0.2), fold2 = lit(C(main), 0.16), sash = o.sash || trim;
    const legW = Math.max(4, B.arm * 0.95);
    b.meta = { cx, hy, k, t, sy };

    // ---------- lớp sau ----------
    if (o.halo) { const r = 15 * k; b.ell(cx, hy - 1, r, r, o.halo, 0); b.ell(cx, hy - 1, r - 1.6, r - 1.6, null); for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; b.px(cx + Math.cos(a) * (r + 1.6), hy - 1 + Math.sin(a) * (r + 1.6), lit(C(o.halo), 0.3)); } }
    if (o.wings) for (const s2 of [-1, 1]) { b.poly([[cx + s2 * 5, t + 4], [cx + s2 * 32, t - 20], [cx + s2 * 37, t + 4], [cx + s2 * 28, t + 28], [cx + s2 * 8, t + 20]], o.wings, 0.8); for (let i = 0; i < 4; i++) b.line(cx + s2 * 8, t + 8 + i * 4, cx + s2 * (32 - i * 2), t - 14 + i * 10, drk(C(o.wings), 0.25)); }
    if (o.cape) { b.poly([[cx - sh + 2, t + 1], [cx + sh - 2, t + 1], [cx + sh + 6 + sway, F - 10], [cx + sh + 1 + sway, F - 6], [cx - sh - 1 + sway, F - 6], [cx - sh - 6 + sway, F - 10]], o.cape, 0.7);
      for (let i = -2; i <= 2; i++) b.line(cx + i * (sh / 4), t + 8, cx + i * (sh / 2.6) + sway, F - 10, drk(C(o.cape), 0.2)); }
    const longHair = o.hairBack || o.hairStyle === 'long' || o.hairStyle === 'twinlong';
    if (longHair && !o.head) { const hb = o.hair || '#24160e', hr = 10 * k, hl = sy + (fem ? 10 : 2);
      b.poly([[cx - hr, hy - 2], [cx + hr, hy - 2], [cx + hr + 1, hy + 14 * k], [cx + hr - 1 + sway, hl - 4], [cx + 3 + sway, hl + 2], [cx - 3 + sway, hl + 2], [cx - hr + 1 + sway, hl - 4], [cx - hr - 1, hy + 14 * k]], hb, 0.7);
      for (let i = -2; i <= 2; i++) b.line(cx + i * 3, hy + 10 * k, cx + i * 3.4 + sway, hl - 2, lit(C(hb), 0.12)); }
    if (o.ribbon) for (const s2 of [-1, 1]) { // thiên y / hỗn thiên lăng bay quanh người
      b.curve([[cx + s2 * (sh - 3), t + 1], [cx + s2 * (sh + 12), t + (sy - t) * 0.5], [cx + s2 * (sh + 7) + sway, sy + 8]], o.ribbon, (q) => 2.8 - q * 0.7, 0.5);
      b.curve([[cx + s2 * (sh + 7) + sway, sy + 8], [cx + s2 * (sh + 3) + sway, sy + 22], [cx + s2 * (sh + 9) + sway * 1.5, Math.min(F - 6, sy + 36)]], o.ribbon, (q) => 2.1 - q, 0.5);
    }
    if (o.tail) {
      const ty = sy + 4, tc = o.tailc || o.fur || '#f4eefe';
      if (o.tail === 'fox') { const n = o.tails || 1; for (let i = 0; i < n; i++) { const a = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2; // xoè hình quạt sau lưng
        b.curve([[cx + 3, ty + 6], [cx + 14 + a * 12, ty - 4 - Math.abs(a) * 4], [cx + a * 26 + (n === 1 ? 20 : 0), ty - 30 + Math.abs(a) * 12]], tc, (q) => 2.6 + Math.sin(q * 3.1) * 3.2, 0.9);
        b.px(cx + a * 26 + (n === 1 ? 20 : 0), ty - 30 + Math.abs(a) * 12, '#ffffff'); } }
      if (o.tail === 'monkey') b.curve([[cx + 6, ty + 4], [cx + 30, ty + 8], [cx + 27, ty - 22]], o.fur, 2.6, 0.8);
      if (o.tail === 'pig') b.curve([[cx + 9, ty], [cx + 16, ty - 2], [cx + 13, ty - 7]], o.fur, 2, 0.5);
      if (o.tail === 'bull' || o.tail === 'tiger' || o.tail === 'wolf' || o.tail === 'rat') b.curve([[cx + 8, ty + 4], [cx + 28, ty + 10], [cx + 28, ty - 10]], o.tail === 'wolf' ? o.fur : tc, o.tail === 'wolf' ? (q) => 2.6 + q * 4 : 2.2, 0.7);
      if (o.tail === 'scorpion') { const seg = [[cx + 10, ty], [cx + 20, ty - 8], [cx + 25, ty - 22], [cx + 25, ty - 34], [cx + 20, ty - 44], [cx + 13, ty - 50]]; seg.forEach(([x, y], i) => b.ell(x, y, 4.5 - i * 0.35, 3.8, o.tailc || '#8a3a2a', 1)); b.poly([[cx + 13, ty - 54], [cx + 5, ty - 57], [cx + 9, ty - 49]], '#2a1010', 0.4); }
    }
    if (o.spiderLegs) for (const s2 of [-1, 1]) for (let i = 0; i < 3; i++) { b.line(cx + s2 * 6, t + 12, cx + s2 * (24 + i * 3), t + i * 9 - 4, o.spiderLegs, 3); b.line(cx + s2 * (24 + i * 3), t + i * 9 - 4, cx + s2 * (31 + i * 2), t + 12 + i * 9, o.spiderLegs, 2); }
    if (o.flameAura) for (let i = 0; i < 9; i++) { const a = (i / 8) * Math.PI; b.ell(cx + Math.cos(a) * (sh + 14), F - 30 - Math.sin(a) * (F - top - 20) * 0.6, 4, 6, i % 2 ? '#ff8a2a' : '#ffd04a', 0.4); }

    // ---------- chân ----------
    const boot = o.boot || '#3a2418', pants = o.pants || drk(C(main), 0.38);
    const legX = [cx - hip * 0.55 - legW / 2, cx + hip * 0.55 - legW / 2];
    if (style === 'short' || style === 'armor') {
      legX.forEach((x, i) => { const d = i ? -walk : walk;
        b.rect(x + d * 0.5, crotch - 6, legW, F - crotch, pants, 0.8);
        if (bt !== 'kid') for (let yy = crotch + (F - crotch) * 0.45; yy < F - 8; yy += 3.5) b.line(x + d * 0.5, yy, x + legW + d * 0.5, yy + 1.6, lit(C(pants), 0.2)); }); // xà cạp
    }
    legX.forEach((x, i) => { const d = i ? -walk : walk, bw = legW + 2;
      b.rect(x + d - 1, F - 7, bw, 6, boot, 0.8); b.rect(x + d - 1.5, F - 2, bw + 1, 2, drk(C(boot), 0.3), 0);
      if (style === 'armor') b.rect(x + d - 1, F - 14, bw, 7, o.metal || '#8a96a8', 0.9); });
    if (o.wheels) for (const x of [cx - 9, cx + 9]) { b.ell(x, F - 1, 7.5, 2.6, '#ff8a2a', 0.5); b.ell(x, F - 1, 3.8, 1.3, '#ffe04a', 0); }

    // ---------- thân ----------
    const nw = Math.max(4, B.neck + 2);
    b.rect(cx - nw / 2, hy + 7 * k, nw, t - hy - 7 * k + 2, skin, 0.6); b.line(cx - nw / 2, t, cx + nw / 2, t, drk(C(skin), 0.2));
    const shoulders = (y0) => [[cx - sh, y0 + 5], [cx - sh + 4, y0 + 0.5], [cx - 4, y0 - 1.5], [cx + 4, y0 - 1.5], [cx + sh - 4, y0 + 0.5], [cx + sh, y0 + 5]];
    if (style === 'robe' || style === 'monk' || style === 'dress') {
      const flare = hip + (F - sy) * (fem ? 0.3 : 0.2);
      b.poly([...shoulders(t), [cx + waist + 1, sy + 2], [cx - waist - 1, sy + 2]], main, 1);
      b.poly([[cx - waist - 1, sy], [cx + waist + 1, sy], [cx + hip + 1 + sway * 0.5, crotch], [cx + flare + sway, hemY], [cx - flare + sway, hemY], [cx - hip - 1 + sway * 0.5, crotch]], main, 1);
      for (let i = -3; i <= 3; i++) if (i) b.line(cx + i * 2, sy + 5, cx + i * (flare / 3.4) + sway, hemY - 2, i % 2 ? fold : fold2); // nếp vải
      b.poly([[cx - 2.5, sy + 2], [cx + 2.5, sy + 2], [cx + 4.5 + sway, hemY], [cx - 4.5 + sway, hemY]], inner, 0.4);
      b.rect(cx - flare + sway, hemY - 3, flare * 2, 3, trim, 0.4); b.line(cx - flare + sway, hemY - 4, cx + flare + sway, hemY - 4, drk(C(trim), 0.3));
      if (fem) { b.rect(cx - flare + 3 + sway, hemY - 12, flare * 2 - 6, 1.4, lit(C(main), 0.32), 0); b.rect(cx - flare + 1 + sway, hemY - 7, flare * 2 - 2, 1, lit(C(main), 0.25), 0); }
      b.poly([[cx - 5, t - 1], [cx - 1, t - 1], [cx + 3.5, t + 10], [cx + 0.5, t + 12]], o.inner || lit(C(main), 0.35), 0.3);   // cổ áo giao lĩnh
      b.line(cx - 5, t - 1, cx + 1.5, t + 12, trim); b.line(cx + 4.5, t - 1, cx + 1.5, t + 12, trim);
      if (style === 'monk') {
        b.poly([[cx - sh + 1, t], [cx - sh + 6, t - 1], [cx + flare - 2 + sway, hemY - 14], [cx + flare - 6 + sway, hemY - 5], [cx - 4, sy + 6]], o.kasaya || '#d4402a', 0.6);
        for (let i = 0; i < 6; i++) b.line(cx - 7 + i * 3.6, t + 3 + i * (hemY - t) / 8, cx - 2 + i * 3.6, t + 3 + i * (hemY - t) / 8, '#ffd65a');
        for (let i = 0; i < 4; i++) b.line(cx - 4 + i * 5.5, t + 4 + i * 6, cx + i * 5.5, t + 22 + i * 6, '#ffd65a');
      }
    } else if (style === 'short') {
      b.poly([...shoulders(t), [cx + hip + 3, crotch + 4], [cx - hip - 3, crotch + 4]], main, 1);
      for (let i = -2; i <= 2; i++) if (i) b.line(cx + i * 3, sy + 4, cx + i * 4.2, crotch + 2, fold);
      b.rect(cx - hip - 3, crotch + 1, (hip + 3) * 2, 3, trim, 0.4);
      b.line(cx - 5, t - 1, cx, t + 9, trim); b.line(cx + 5, t - 1, cx, t + 9, trim);
    } else if (style === 'armor') {
      const m = o.metal || '#8a96a8', pl = o.plate || '#e8c45a';
      b.poly([...shoulders(t), [cx + waist + 2, sy + 2], [cx - waist - 2, sy + 2]], m, 1);
      for (let r = 0; r * 3.4 < sy - t - 4; r++) for (let q = -4; q <= 4; q++) { const yy = t + 4 + r * 3.4, xx = cx + q * 3.4 + (r % 2) * 1.7; if (Math.abs(xx - cx) < sh - 2 - r * 0.6) b.rect(xx - 1.4, yy, 2.8, 2.6, r % 2 ? drk(C(m), 0.12) : lit(C(m), 0.1), 0.5); }
      const mr = 3.5 + sh * 0.1; b.ell(cx, t + 8, mr, mr * 0.9, pl, 1); b.ell(cx - 0.8, t + 7, 1.4, 1.2, lit(C(pl), 0.5), 0);   // hộ tâm kính
      b.poly([[cx - waist - 3, sy + 4], [cx + waist + 3, sy + 4], [cx + hip + 5 + sway, crotch + 8], [cx - hip - 5 + sway, crotch + 8]], main, 1);
      const nT = Math.max(3, Math.round(hip / 2.6)); for (let q = 0; q < nT; q++) { const xx = cx - hip - 2 + q * ((hip * 2 + 4) / nT); b.rect(xx + sway * 0.5, sy + 6, (hip * 2 + 4) / nT - 0.6, (crotch - sy) * 0.8, q % 2 ? drk(C(m), 0.1) : m, 0.6); }
      b.line(cx - hip - 5 + sway, crotch + 8, cx + hip + 5 + sway, crotch + 8, trim);
      for (const s2 of [-1, 1]) { const pr = 4.5 + sh * 0.14; b.ell(cx + s2 * (sh + 1), t + 3, pr, pr * 0.78, m, 1); b.ell(cx + s2 * (sh + 1), t + 5, pr * 0.92, 2.2, pl, 0.4); b.line(cx + s2 * (sh - 4), t + 7, cx + s2 * (sh + pr), t + 7, trim); }
    }
    if (B.belly) { // bụng phệ
      const by0 = sy + 2; b.ell(cx, by0, B.belly, B.belly * 0.82, style === 'armor' ? (o.metal || '#8a96a8') : main, 1);
      b.ell(cx - B.belly * 0.35, by0 - B.belly * 0.4, B.belly * 0.3, B.belly * 0.22, lit(C(style === 'armor' ? (o.metal || '#8a96a8') : main), 0.25), 0);
      if (o.bareBelly) { const bs = o.head ? hand : skin; b.ell(cx, by0 + 1, B.belly * 0.6, B.belly * 0.58, bs, 1); b.px(cx, by0 + 3, drk(C(bs), 0.3)); }
    }
    // đai lưng, nút thắt, ngọc bội + tua
    const syy = B.belly ? sy + 2 + B.belly * 0.62 : sy, bw2 = B.belly ? B.belly * 0.8 : waist + 1.5;
    b.rect(cx - bw2, syy, bw2 * 2, 4, sash, 0.6); b.line(cx - bw2 + 0.5, syy, cx + bw2 - 0.5, syy, lit(C(sash), 0.4));
    b.ell(cx - 2, syy + 2, 2.4, 2, drk(C(sash), 0.15), 0.6);
    b.line(cx - 3, syy + 4, cx - 5 + sway, syy + 18, sash, 2); b.line(cx - 1, syy + 4, cx - 1 + sway, syy + 16, sash, 2);
    if (o.jade !== false && bt !== 'kid') { b.ell(cx + 3, syy + 8, 2.2, 2.6, '#4ac29a', 0.8); b.px(cx + 2.6, syy + 7, '#c8fff0'); b.line(cx + 3, syy + 11, cx + 3 + sway, syy + 18, '#c8302a'); b.line(cx + 4, syy + 11, cx + 4.5 + sway, syy + 17, '#e0402a'); }
    if (o.necklace) for (let i = 0; i < 9; i++) { const a = Math.PI * (0.12 + 0.76 * (i / 8)), nr = 6 + sh * 0.2; b.ell(cx + Math.cos(a) * nr, t + 2 + Math.sin(a) * nr * 0.9, 1.6, 1.6, o.necklace, 0.6); }
    if (o.skulls) for (let i = 0; i < 7; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 6)), nr = 7 + sh * 0.25; const x = cx + Math.cos(a) * nr, y = t + 3 + Math.sin(a) * nr * 0.95; b.ell(x, y, 2.2, 2, '#efe6d0', 1); b.px(x - 0.8, y, '#2a1a14'); b.px(x + 0.8, y, '#2a1a14'); }

    // ---------- tay ----------
    const wideSleeve = style === 'robe' || style === 'monk' || style === 'dress';
    const hx = sh + 2 + B.arm * 0.3, hdy = Math.max(sy + 4, Math.min(crotch, sy + (crotch - sy) * 0.6));
    const handL = [cx - hx, hdy + 1], handR = [cx + hx, hdy - 1];
    for (const s2 of [-1, 1]) {
      const [hX, hY] = s2 < 0 ? handL : handR;
      if (wideSleeve) {
        b.poly([[cx + s2 * (sh - 3), t - 1], [cx + s2 * (sh + 3), t + 3], [cx + s2 * (sh + B.arm + 1), hY - 6], [hX + s2 * (B.arm - 0.5), hY + 3], [hX - s2 * (B.arm + 0.5), hY + 2], [cx + s2 * (sh - 2), t + (hY - t) * 0.6]], sleeve, 1);
        b.line(hX + s2 * (B.arm - 0.5), hY + 3, hX - s2 * (B.arm + 0.5), hY + 2, trim, 2);
        b.line(cx + s2 * (sh + 1), t + 7, cx + s2 * (sh + B.arm - 1), hY - 4, drk(C(sleeve), 0.2));
      } else {
        b.curve([[cx + s2 * (sh - 1), t + 3], [cx + s2 * (sh + B.arm * 0.6), t + (hY - t) * 0.45], [hX, hY - 3]], sleeve, (q) => B.arm + 1.6 - q * 2, 1);
        if (style === 'armor') b.rect(hX - B.arm / 2 - 0.5, hY - 9, B.arm + 1, 6, o.metal || '#8a96a8', 0.8);
        if (bt === 'brawny' || bt === 'giant') b.ell(cx + s2 * (sh + B.arm * 0.45), t + (hY - t) * 0.42, B.arm * 0.5, B.arm * 0.8, skin === hand ? hand : sleeve, 0.9);
      }
      const hr = 2.3 + B.arm * 0.12; b.ell(hX, hY, hr, hr * 0.92, hand, 0.7); b.px(hX - s2, hY + 1, drk(C(hand), 0.2));
    }
    const wk = 1.55 * (B.h / 102);
    if (o.offhand) weaponTall(b, handL[0], handL[1], { weapon: o.offhand, fanc: o.fanc }, wk * 0.85);

    // ---------- đầu ----------
    if (o.head) { beastHead(scaled(b, cx, hy + 2, 1.18 * k), cx, hy + 2, o.head, o); if (expr === 'angry') { b.line(cx - 7 * k, hy - 4, cx - 2, hy - 2, '#1a0a0a'); b.line(cx + 2, hy - 2, cx + 7 * k, hy - 4, '#1a0a0a'); } }
    else { const sk = scaled(b, cx, hy, k); humanHead(sk, cx, hy, { ...o, _face: () => {} }); faceFn(o, expr, k)(b, cx, hy); hair(sk, cx, hy, o); }
    if (o.beard) { const q = k; b.poly([[cx - 6 * q, hy + 6 * q], [cx + 6 * q, hy + 6 * q], [cx + 4 * q, hy + 16 * q], [cx + 1, hy + 24 * q], [cx - 1, hy + 24 * q], [cx - 4 * q, hy + 16 * q]], o.beard, 0.6); for (let i = -2; i <= 2; i++) b.line(cx + i * 1.5, hy + 9 * q, cx + i * 1.1, hy + 21 * q, lit(C(o.beard), 0.15)); if (!o.head) b.line(cx - 1, hy + 6 * q, cx + 1, hy + 6 * q, '#b0503a'); }
    if (o.mustache) { b.curve([[cx, hy + 5 * k], [cx - 6 * k, hy + 5 * k], [cx - 10 * k, hy + 11 * k]], o.mustache, 1.4, 0); b.curve([[cx, hy + 5 * k], [cx + 6 * k, hy + 5 * k], [cx + 10 * k, hy + 11 * k]], o.mustache, 1.4, 0); }
    hat(scaled(b, cx, hy, o.head ? 1.18 * k : k), cx, hy, o);
    if (expr === 'cast') for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283; const v = [...C('#fff6c8')]; v.noOutline = true; b.set(cx + Math.cos(a) * 13 * k, hy + Math.sin(a) * 13 * k, v); }

    // ---------- vũ khí tay phải ----------
    weaponTall(b, handR[0], handR[1], o, /fan|vase|gourd|abacus|lantern|whisk/.test(o.weapon || '') ? wk * 0.72 : wk);
    return rimLight(b);
  }

  const HEROES = {
    // Thần nam – Thiên tướng: giáp bạc viền vàng, mũ có chóp, giáo, áo choàng trắng
    than_m: { build: 'male', body: 'armor', robe: '#2a4a8a', metal: '#c8d2e4', plate: '#ffd65a', trim: '#e0b040', sash: '#e0b040', hair: '#24160e', hairStyle: 'topknot', hat: 'crown', weapon: 'spear', cape: '#c8302a', ribbon: '#ffe08a', boot: '#6a4422', pants: '#3a4a7a', brows: '#1a0e08', eyeColor: '#3a5a8a' },
    // Thần nữ – Tiên nữ: váy hồng trắng, thiên y dài, búi tóc cài trâm, phất trần
    than_f: { build: 'slim', body: 'dress', robe: '#fbf0f2', inner: '#f08aa8', trim: '#e8b84a', sash: '#e05a7a', sleeve: '#fff6f8', hair: '#1e1016', hairStyle: 'bun', hairBack: true, pin: '#e8c45a', hat: 'flower', weapon: 'whisk', ribbon: '#ffb6c8', smile: true, eyeColor: '#7a3a5a' },
    // Ma nam – Ma vương vạm vỡ: giáp đen đỏ, sừng lớn, rìu chiến, áo choàng rách
    ma_m: { build: 'brawny', body: 'armor', robe: '#6a1414', metal: '#34303a', plate: '#c8302a', trim: '#c89030', hair: '#140a0c', hairStyle: 'wild', hat: 'horns', horn: '#e8dcc0', weapon: 'axe', cape: '#3a080c', eye: '#3a0606', eyeColor: '#ff3a2a', brows: '#0a0404', mark: '#e0262a', noBlush: true, boot: '#1d1416', pants: '#241014', skin: '#e8c0a0', hand: '#e8c0a0' },
    // Ma nữ – Hắc y kiếm khách: giáp đen bó, tóc dài đỏ thẫm, sừng nhỏ, đao cong
    ma_f: { build: 'slim', body: 'armor', robe: '#3a0c18', metal: '#2a2630', plate: '#d8304a', trim: '#c89030', hair: '#5a0a1e', hairStyle: 'long', hairBack: true, hat: 'smallhorns', weapon: 'saber', cape: '#6a0c1c', eyeColor: '#ff3a4a', mark: '#e0262a', boot: '#140e10', pants: '#1a1016', lashes: true },
    // Yêu nam – Lãng khách hồ yêu: áo tím mở vạt, tóc bạc dài, tai cáo, một đuôi lớn, quạt
    yeu_m: { build: 'male', body: 'robe', robe: '#5a3aa8', inner: '#1e1440', trim: '#7fe0c0', sash: '#2a8a7a', sleeve: '#6a4ac0', hair: '#e8e2f4', hairStyle: 'long', hairBack: true, hat: 'foxears', tail: 'fox', tails: 1, tailc: '#f0ecfa', weapon: 'fan', fanc: '#9ff0d8', eyeColor: '#a05af0', boot: '#2a1d44' },
    // Yêu nữ – Cửu vĩ hồ ly: váy tím nhạt, chín đuôi xoè, tai cáo, quạt
    yeu_f: { build: 'slim', body: 'dress', robe: '#c8a8f0', inner: '#5a3aa0', trim: '#7fe0c0', sash: '#a05ae0', sleeve: '#d8c0f8', hair: '#fbf6ff', hairStyle: 'long', hairBack: true, hat: 'foxears', tail: 'fox', tails: 9, tailc: '#fff6ff', weapon: 'fan', fanc: '#ffb0e0', eyeColor: '#c040e0', smile: true },
  };


  const NPCS = {
    thaibach: { build: 'male', body: 'robe', robe: '#f2f0ea', inner: '#c8c0b0', trim: '#e0b040', hair: '#f6f6f2', hairStyle: 'topknot', beard: '#f6f6f2', weapon: 'whisk', brows: '#f6f6f2', closedEyes: true },
    tho_dao: { build: 'kid', body: 'robe', robe: '#a8743a', inner: '#6a4422', trim: '#e0b040', hair: '#f2eee6', hairStyle: 'bald', hat: 'scholar', beard: '#f2eee6', weapon: 'staff', closedEyes: true, wide: true },
    duocsu1: { build: 'kid', body: 'short', robe: '#e8f0e0', trim: '#4aae7a', hair: '#24160e', hairStyle: 'twin', weapon: 'gourd', smile: true },
    shop1: { body: 'robe', robe: '#3a5a8a', inner: '#24365a', trim: '#e0b040', hair: '#24160e', hairStyle: 'short', hat: 'cap', capc: '#2a2a3a', weapon: 'abacus', mustache: '#24160e', smile: true },
    hangnga: { build: 'slim', body: 'dress', robe: '#fbf4fa', inner: '#f4b8d0', trim: '#c8b0f0', sash: '#e88ab0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, pin: '#e8c45a', hat: 'flower', ribbon: '#bfe6ff', smile: true },
    culinh: { build: 'brawny', body: 'armor', robe: '#5a6a3a', metal: '#7a6a4a', plate: '#e0b040', trim: '#c8302a', head: 'demon', fur: '#6a9a5a', beard: '#2a2a1a', weapon: 'axe', wide: true, cape: '#3a2a1a' },
    nata: { build: 'kid', body: 'short', robe: '#f2d0a0', trim: '#e0b040', sash: '#e02a2a', ribbon: '#ff3a3a', hair: '#1a1010', hairStyle: 'short', hat: 'buns2', weapon: 'firespear', wheels: true, mark: '#e0262a', pants: '#e02a2a', necklace: '#ffd04a' },
    nhilang: { build: 'male', body: 'armor', robe: '#3a4a8a', metal: '#c8cad8', plate: '#e0b040', trim: '#e0b040', hair: '#1a1010', hat: 'helmet', helm: '#e0b040', plume: '#e02a2a', weapon: 'trident', thirdEye: true, cape: '#c8302a', brows: '#1a0a0a' },
    duongtang: { build: 'male', body: 'monk', robe: '#f0c050', inner: '#c8862a', kasaya: '#c8302a', trim: '#ffe08a', hairStyle: 'bald', hat: 'monk5', weapon: 'khakkhara', closedEyes: true, smile: true },
    quanam: { build: 'slim', body: 'dress', robe: '#ffffff', inner: '#e8eef6', trim: '#8ac8e8', sash: '#a8d8f0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'tiara', halo: '#ffe08a', weapon: 'vase', closedEyes: true, ribbon: '#bfe6ff' },
    laoong: { body: 'robe', robe: '#8a7a6a', inner: '#5a4a3a', trim: '#c8b090', hair: '#e8e4dc', hairStyle: 'topknot', beard: '#e8e4dc', weapon: 'staff', closedEyes: true },
    duocsu2: { body: 'robe', robe: '#4a8a6a', inner: '#2a5a44', trim: '#e0b040', hair: '#3a2a22', hairStyle: 'short', hat: 'scholar', beard: '#3a2a22', weapon: 'gourd' },
    shop2: { build: 'fat', body: 'robe', robe: '#8a3a2a', inner: '#5a2418', trim: '#e0b040', hair: '#24160e', hat: 'cap', capc: '#3a2418', weapon: 'abacus', mustache: '#24160e', wide: true, smile: true },
    casino: { body: 'robe', robe: '#2a2a3a', inner: '#c8302a', trim: '#e0b040', hair: '#1a1010', hat: 'scholar', mustache: '#1a1010', weapon: 'fan', fanc: '#e8c45a', smile: true },
    hachhung: { build: 'giant', body: 'armor', robe: '#2a2a32', metal: '#4a4a56', plate: '#c8302a', trim: '#e0b040', head: 'bear', fur: '#23232a', crescent: true, weapon: 'spear', wide: true, cape: '#5a1a1a', hand: '#23232a' },
    hoangphong: { build: 'male', body: 'armor', robe: '#c89a2a', metal: '#8a6a2a', plate: '#ffe08a', trim: '#6a4422', head: 'rat', fur: '#d8b04a', weapon: 'trident', cape: '#e8c45a', tail: 'rat', tailc: '#d8b04a', hand: '#d8b04a', flameAura: false },
    laohau: { body: 'robe', robe: '#8a6a4a', inner: '#5a4430', trim: '#c8b090', head: 'monkey', fur: '#c8c0b0', face: '#f0c8a8', band: false, beard: '#e8e4dc', weapon: 'staff', tail: 'monkey', hand: '#f0c8a8' },
    duocsu3: { body: 'short', robe: '#e8f0e0', trim: '#4aae7a', head: 'monkey', fur: '#a8743a', band: false, weapon: 'gourd', tail: 'monkey', hand: '#f0c0a0' },
    shop3: { body: 'short', robe: '#3a6a8a', trim: '#e0b040', head: 'monkey', fur: '#8a5a2a', band: false, weapon: 'abacus', tail: 'monkey', hand: '#f0c0a0' },
    batgioi: { build: 'fat', bareBelly: true, body: 'monk', robe: '#2a2a3a', inner: '#1a1a24', kasaya: '#3a5a8a', trim: '#e0b040', head: 'pig', fur: '#f2a8b0', weapon: 'rake', tail: 'pig', hand: '#f2a8b0', wide: true },
    satang: { build: 'brawny', skulls: true, body: 'monk', robe: '#4a5a6a', inner: '#2a3440', kasaya: '#8a3a2a', trim: '#c8b090', skin: '#7aa0c0', hand: '#7aa0c0', hair: '#c83a2a', hairStyle: 'wild', beard: '#c83a2a', necklace: '#f0e8d8', weapon: 'spade', brows: '#c83a2a', eyeColor: '#ffe04a' },
    bachcot: { build: 'slim', body: 'dress', robe: '#f4f0f4', inner: '#c8a0c8', trim: '#8a4a8a', sash: '#6a2a6a', skin: '#f4ecf0', hand: '#f4ecf0', hair: '#f8f4fa', hairStyle: 'long', hairBack: true, hat: 'flower', eyeColor: '#c82a8a', ribbon: '#c8a0f0', weapon: 'sword' },
    laonhan: { body: 'robe', robe: '#c88a4a', inner: '#8a5a2a', trim: '#e8d0a0', hair: '#f0ece4', hairStyle: 'topknot', beard: '#f0ece4', weapon: 'staff', closedEyes: true, hat: 'turban', turban: '#f2ead8' },
    thodia: { build: 'kid', body: 'robe', robe: '#8a6a3a', inner: '#5a4422', trim: '#e0b040', hair: '#f2eee6', hairStyle: 'bald', hat: 'scholar', beard: '#f2eee6', weapon: 'staff', closedEyes: true, wide: true },
    duocsu4: { body: 'monk', robe: '#e0a040', inner: '#b0782a', kasaya: '#c8302a', trim: '#ffe08a', hair: '#1a1010', hat: 'turban', turban: '#f2e0c0', weapon: 'gourd', skin: '#d8a880', hand: '#d8a880' },
    shop4: { body: 'robe', robe: '#3a6a5a', inner: '#24443a', trim: '#e0b040', hat: 'turban', turban: '#e8402a', skin: '#d8a880', hand: '#d8a880', mustache: '#1a1010', weapon: 'lantern', hair: '#1a1010' },
    honghai: { build: 'kid', body: 'short', robe: '#e02a2a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1010', hat: 'buns2', weapon: 'firespear', flameAura: true, pants: '#a81a1a', mark: '#ffd04a', smile: true },
    thietphien: { build: 'slim', body: 'dress', robe: '#e04a3a', inner: '#8a1a1a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1010', hairStyle: 'bun', hairBack: true, pin: '#ffd04a', hat: 'tiara', weapon: 'bigfan', fanc: '#2a8a5a', ribbon: '#ff8a5a' },
    nguuma: { build: 'giant', body: 'armor', robe: '#3a2a2a', metal: '#2a2a32', plate: '#e0b040', trim: '#e0b040', head: 'bull', fur: '#3a2a26', weapon: 'mace', wide: true, cape: '#8a1a1a', hand: '#3a2a26', tail: 'bull' },
    lucnhi: { build: 'male', body: 'armor', robe: '#5a3a2a', metal: '#c8a04a', plate: '#ffe08a', trim: '#c8302a', head: 'monkey', fur: '#7a4a2a', face: '#f0c0a0', eyeGlow: '#ff3a3a', weapon: 'goldstaff', cape: '#c8302a', tail: 'monkey', hand: '#f0c0a0' },
  };
  // boss trùng tên NPC dùng chung preset
  const BOSS_ALIAS = { culinh: 'culinh', nata: 'nata', nhilang: 'nhilang', hachhung: 'hachhung', hoangphong: 'hoangphong', batgioi: 'batgioi', satang: 'satang', bachcot: 'bachcot', honghai: 'honghai', thietphien: 'thietphien', nguuma: 'nguuma', lucnhi: 'lucnhi' };

  const HUMANS = {
    thienbinh: { body: 'armor', robe: '#c8302a', metal: '#c8cad8', plate: '#e0b040', trim: '#e0b040', hair: '#1a1010', hat: 'helmet', helm: '#c8cad8', plume: '#e02a2a', weapon: 'spear', brows: '#1a0a0a' },
    sontac: { build: 'brawny', body: 'short', robe: '#5a4a3a', trim: '#8a3a2a', sash: '#8a3a2a', hair: '#1a1010', hairStyle: 'wild', hat: 'mask', weapon: 'saber', brows: '#1a0a0a', pants: '#3a2a22' },
    hoayeu: { build: 'male', body: 'short', robe: '#3a1a1a', trim: '#ff8a2a', head: 'demon', fur: '#e04a2a', beard: '#3a0a0a', weapon: 'club', hand: '#e04a2a', pants: '#2a1010', flameAura: true },
  };

  Object.assign(NPCS, {
    nhulai: { build: 'giant', body: 'monk', robe: '#e8b040', inner: '#c8862a', kasaya: '#c8302a', trim: '#ffe08a', skin: '#f0c878', hand: '#f0c878', hair: '#2a3a7a', hairStyle: 'bun', halo: '#ffe08a', closedEyes: true, mark: '#d42a2a', wide: true },
    tiepdan: { body: 'monk', robe: '#f0d070', inner: '#c8a040', kasaya: '#e8802a', trim: '#fff0b0', skin: '#f0c878', hand: '#f0c878', hair: '#2a3a7a', hairStyle: 'bun', halo: '#ffe08a', closedEyes: true, weapon: 'staff' },
    ngokhong: { build: 'male', body: 'armor', robe: '#c8302a', metal: '#e8b840', plate: '#fff0a0', trim: '#c8302a', sash: '#c8302a', head: 'monkey', fur: '#c8803a', hat: 'phoenix', weapon: 'goldstaff', tail: 'monkey', hand: '#f0c0a0', pants: '#8a2a1a', cape: '#d83a2a', boot: '#3a1a10' },
    luuhong: { body: 'short', robe: '#2a3a4a', trim: '#8a2a2a', sash: '#8a2a2a', hair: '#1a1010', hairStyle: 'wild', mustache: '#1a1010', brows: '#1a0a0a', weapon: 'saber', pants: '#1a2430', noBlush: true },
    dantuong: { build: 'brawny', body: 'armor', robe: '#8a5a1a', metal: '#c8a04a', plate: '#ffe08a', trim: '#c8302a', head: 'tiger', fur: '#e8902a', weapon: 'spear', hand: '#e8902a', tail: 'tiger', tailc: '#e8902a', cape: '#6a2a1a', wide: true },
    tieubachlong: { kind: 'serp', main: '#f4f8ff', light: '#ffffff', acc: '#8ac8ff', dragon: true },
    kimtri: { body: 'monk', robe: '#8a6a4a', inner: '#5a4430', kasaya: '#a8322a', trim: '#e0b040', hairStyle: 'bald', weapon: 'staff', beard: '#e8e4dc', closedEyes: true },
    linhcat: { body: 'robe', robe: '#f0d070', inner: '#c88a2a', trim: '#ffffff', hair: '#1a1018', hairStyle: 'bun', hat: 'tiara', halo: '#ffe08a', weapon: 'staff', closedEyes: true, ribbon: '#ffe8b0' },
    laomau: { body: 'robe', robe: '#6a4a8a', inner: '#3a2a5a', trim: '#e0b040', hair: '#e8e4ec', hairStyle: 'bun', pin: '#e8c45a', weapon: 'staff', closedEyes: true, smile: true },
    tranguyen: { build: 'fat', body: 'robe', robe: '#e8a040', inner: '#8a4a1a', trim: '#ffffff', hair: '#1a1010', hairStyle: 'topknot', hat: 'crown', beard: '#1a1010', weapon: 'whisk', wide: true },
    congchua: { body: 'dress', robe: '#f8c8d8', inner: '#e86a8a', trim: '#e0b040', sash: '#e86a8a', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'tiara', ribbon: '#ffb0c8' },
    hoangbao: { build: 'brawny', body: 'armor', robe: '#c89a2a', metal: '#6a5a3a', plate: '#ffe08a', trim: '#c8302a', head: 'demon', fur: '#4a6ab8', beard: '#1a1a3a', weapon: 'saber', cape: '#8a2a2a', hand: '#4a6ab8', wide: true },
    tieuphu: { body: 'short', robe: '#8a7a5a', trim: '#5a4a3a', sash: '#5a4a3a', hair: '#2a1e14', hairStyle: 'short', hat: 'cap', capc: '#c8b080', weapon: 'axe', pants: '#5a4a3a' },
    ngangiac: { body: 'robe', robe: '#c8cad8', inner: '#6a6a7a', trim: '#e0e0e8', head: 'demon', fur: '#8aa0c0', beard: '#3a3a4a', weapon: 'sword', hand: '#8aa0c0', offhand: 'gourd' },
    kimgiac: { body: 'robe', robe: '#e8c45a', inner: '#8a5a1a', trim: '#ffffff', head: 'demon', fur: '#d8a040', beard: '#5a3a1a', weapon: 'sword', hand: '#d8a040', offhand: 'gourd', wide: true },
    vuaoke: { body: 'robe', robe: '#c8c0e0', inner: '#8a80a8', trim: '#e0b040', skin: '#d8dcf0', hand: '#d8dcf0', hair: '#2a2a3a', hat: 'crown', closedEyes: true, noBlush: true },
    giavuong: { build: 'brawny', body: 'robe', robe: '#e8b040', inner: '#c8302a', trim: '#ffffff', head: 'lion', fur: '#4a9a8a', mane: '#2a6a5a', hat: 'crown', weapon: 'staff', hand: '#4a9a8a', wide: true },
    dalong: { build: 'brawny', body: 'armor', robe: '#2a4a5a', metal: '#3a6a6a', plate: '#8ad8c8', trim: '#e0b040', head: 'croc', fur: '#4a7a5a', weapon: 'trident', hand: '#4a7a5a', cape: '#1a2a3a', tail: 'tiger', tailc: '#4a7a5a' },
    tangnhan: { body: 'monk', robe: '#8a7a6a', inner: '#5a4a3a', kasaya: '#a87a4a', trim: '#c8b090', hairStyle: 'bald' },
    vua: { build: 'fat', body: 'robe', robe: '#e8c040', inner: '#c8302a', trim: '#ffffff', hair: '#1a1010', hat: 'crown', mustache: '#1a1010', wide: true },
    daodong: { build: 'kid', body: 'robe', robe: '#4a6a8a', inner: '#2a3a5a', trim: '#e8e4dc', hair: '#1a1010', hairStyle: 'bun', weapon: 'sword' },
    holuc: { build: 'brawny', body: 'robe', robe: '#e8c45a', inner: '#8a5a1a', trim: '#2a2a2a', head: 'tiger', fur: '#e8902a', weapon: 'whisk', hand: '#e8902a', wide: true },
    duongluc: { build: 'fat', body: 'robe', robe: '#f2ead8', inner: '#8a8a7a', trim: '#4a6a8a', head: 'ram', fur: '#f0ece0', weapon: 'whisk', hand: '#f0ece0', wide: true },
    laoquan: { build: 'male', body: 'robe', robe: '#f4f0e4', inner: '#c8b890', trim: '#5a7aa8', hair: '#ffffff', hairStyle: 'topknot', beard: '#ffffff', brows: '#ffffff', closedEyes: true, weapon: 'gourd', offhand: 'fan', fanc: '#e8c45a' },
    linhcam: { build: 'fat', body: 'armor', robe: '#e86a2a', metal: '#e8a040', plate: '#ffe08a', trim: '#c8302a', head: 'fish', fur: '#f0a030', fin: '#e8502a', weapon: 'mace', hand: '#f0a030', cape: '#c8302a' },
    docgiac: { build: 'brawny', body: 'armor', robe: '#2a4a5a', metal: '#3a5a6a', plate: '#e0b040', trim: '#e0b040', head: 'bull', fur: '#3a6a7a', singleHorn: true, weapon: 'spear', hand: '#3a6a7a', tail: 'bull', wide: true },
    nuquan: { body: 'dress', robe: '#e88ab0', inner: '#a83a6a', trim: '#e0b040', hair: '#1a1018', hairStyle: 'bun', hairBack: true, pin: '#e8c45a', smile: true },
    nuvuong: { body: 'dress', robe: '#d42a5a', inner: '#8a1a3a', trim: '#ffd04a', sash: '#ffd04a', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'crown', ribbon: '#ff8ab0', smile: true },
    bocap: { body: 'dress', robe: '#6a2a5a', inner: '#2a0a2a', trim: '#e0b040', hair: '#2a0a1a', hairStyle: 'long', hairBack: true, tail: 'scorpion', tailc: '#8a3a2a', eyeColor: '#ff3a2a', weapon: 'trident' },
    hanhtien: { body: 'dress', robe: '#ffd0e0', inner: '#f0a0c0', trim: '#9ad07a', hair: '#3a1a1a', hairStyle: 'bun', hairBack: true, hat: 'flower', ribbon: '#ffe0f0', smile: true },
    cuudau: { kind: 'king', main: '#2a4a8a', light: '#8ab0e8', acc: '#e8c45a' },
    hoangmi: { build: 'fat', bareBelly: true, smile: true, body: 'monk', robe: '#e8c45a', inner: '#a8782a', kasaya: '#8a4a1a', trim: '#ffe08a', hairStyle: 'bald', brows: '#ffd040', eyeColor: '#ffd040', weapon: 'staff', wide: true },
    manxa: { kind: 'serp', main: '#c8302a', light: '#ffd0a0', acc: '#6a1a10', pattern: '#ffd04a' },
    kimmao: { build: 'giant', body: 'armor', robe: '#e8a040', metal: '#c8862a', plate: '#ffe08a', trim: '#c8302a', head: 'lion', fur: '#e8b040', mane: '#c86a1a', weapon: 'mace', hand: '#e8b040', cape: '#c8302a', wide: true },
    nhentinh: { body: 'dress', robe: '#7a3a9a', inner: '#3a1a5a', trim: '#e0b040', hair: '#1a0a1a', hairStyle: 'long', hairBack: true, spiderLegs: '#4a2a4a', eyeColor: '#c82a8a', smile: true },
    bachnhan: { body: 'robe', robe: '#2a5a3a', inner: '#1a3a24', trim: '#e0b040', hair: '#1a1010', hairStyle: 'topknot', manyEyes: true, beard: '#1a1010', weapon: 'sword', skin: '#d8e0a8', hand: '#d8e0a8' },
    thanhsu: { build: 'brawny', body: 'armor', robe: '#2a6a5a', metal: '#3a8a7a', plate: '#e0b040', trim: '#e0b040', head: 'lion', fur: '#5ab0a0', mane: '#2a6a5a', weapon: 'saber', hand: '#5ab0a0', wide: true, cape: '#1a3a34' },
    bachtuong: { build: 'giant', body: 'armor', robe: '#8a8a9a', metal: '#c8c8d8', plate: '#e0b040', trim: '#e0b040', head: 'elephant', fur: '#d8d8e4', weapon: 'spear', hand: '#d8d8e4', wide: true, cape: '#5a5a7a' },
    daibang: { build: 'brawny', body: 'armor', robe: '#c8862a', metal: '#e8c45a', plate: '#fff0a0', trim: '#c8302a', head: 'eagle', fur: '#e8b040', weapon: 'trident', hand: '#e8b040', wings: '#c89a2a', wide: true },
    quoctruong: { body: 'robe', robe: '#f4f0e4', inner: '#8a7a5a', trim: '#e0b040', head: 'deer', fur: '#f0ece0', weapon: 'staff', hand: '#f0ece0' },
    chuottinh: { body: 'dress', robe: '#f4f0f4', inner: '#c8a0b0', trim: '#e0b040', head: 'rat', fur: '#f0ece8', hat: 'flower', weapon: 'sword', hand: '#f0ece8', tail: 'rat', tailc: '#e8a8b0' },
    thieunu: { body: 'dress', robe: '#fff4f8', inner: '#f4c8d8', trim: '#c8a0b0', hair: '#1a1018', hairStyle: 'bun', hairBack: true, hat: 'flower', smile: true },
    baotinh: { body: 'armor', robe: '#5a4a2a', metal: '#8a7a4a', plate: '#e0b040', trim: '#e0b040', head: 'tiger', fur: '#e8c050', spots: true, weapon: 'spear', hand: '#e8c050', tail: 'tiger', tailc: '#e8c050' },
    quan: { body: 'robe', robe: '#c8302a', inner: '#8a1a1a', trim: '#e0b040', hair: '#1a1010', hat: 'scholar', mustache: '#1a1010' },
    hoangsu: { body: 'armor', robe: '#c89a3a', metal: '#a87a2a', plate: '#ffe08a', trim: '#c8302a', head: 'lion', fur: '#e8c050', mane: '#c88a2a', weapon: 'rake', hand: '#e8c050', wide: true },
    cuulinh: { kind: 'quad', main: '#e8a040', light: '#ffe0a0', acc: '#8a3a1a', mane: '#c84a2a', maneSize: 1.25, tail: 'tuft', legs: 10, legW: 4.5, headR: 6.6, ears: 'round', snout: 'short', collar: '#e0b040', size: 1.15 },
    teguu: { build: 'brawny', body: 'armor', robe: '#3a4a6a', metal: '#5a6a8a', plate: '#e0b040', trim: '#e0b040', head: 'rhino', fur: '#7a8a9a', weapon: 'axe', hand: '#7a8a9a', wide: true },
    ngoctho: { body: 'dress', robe: '#ffffff', inner: '#f4d0e0', trim: '#e0b040', sash: '#e86a8a', hair: '#f4f0f8', hairStyle: 'long', hairBack: true, hat: 'rabbitears', eyeColor: '#e02a5a', weapon: 'club', smile: true },
    khau: { body: 'robe', robe: '#8a5a3a', inner: '#5a3a24', trim: '#e0b040', hair: '#e8e4dc', hairStyle: 'topknot', beard: '#e8e4dc', hat: 'cap', capc: '#3a2a20', closedEyes: true },
    laongoan: { kind: 'quad', main: '#e8e4dc', light: '#ffffff', acc: '#8a9aac', shell: '#f4f0e8', legs: 5, legW: 4.5, tail: 'snake', tailc: '#c8c4bc', headR: 4.8, snout: 'short', size: 1.15 },
    tieuyeu: { build: 'kid', body: 'short', robe: '#5a3a2a', trim: '#8a8a3a', sash: '#8a8a3a', head: 'demon', fur: '#6aa04a', beard: '#2a2a1a', weapon: 'club', hand: '#6aa04a', pants: '#3a2a1a' },
  });
  Object.assign(HUMANS, {
    thuytac: { build: 'male', body: 'short', robe: '#2a4a5a', trim: '#c8302a', sash: '#c8302a', hair: '#1a1010', hairStyle: 'wild', hat: 'mask', weapon: 'saber', pants: '#1a2a34' },
    tieuyeu: NPCS.tieuyeu, daodong: NPCS.daodong,
  });

  // 28 hình thái Tiên sủng: [kiểu, tuỳ chọn]  – E = bảng màu theo ngũ hành
  const FORMS = {
    hautinh: (E) => ['hum', { build: 'kid', body: 'short', robe: E.main, trim: E.light, head: 'monkey', fur: '#a8743a', weapon: 'goldstaff', tail: 'monkey', hand: '#f0c0a0', pants: E.acc }],
    truyeu: (E) => ['hum', { build: 'fat', body: 'short', robe: E.main, trim: E.light, head: 'pig', fur: '#e89aa0', weapon: 'club', tail: 'pig', hand: '#e89aa0', wide: true, pants: E.acc }],
    holy: (E) => ['quad', { main: E.main, light: '#fff6ee', acc: E.acc, tail: 'fox', tails: 3, ears: 'point', snout: 'long', size: 0.85, legs: 8, legW: 2.6 }],
    hoyeu: (E) => ['hum', { build: 'brawny', body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'tiger', fur: '#e8902a', weapon: 'saber', tail: 'tiger', tailc: '#e8902a', hand: '#e8902a', cape: E.main }],
    langyeu: (E) => ['hum', { build: 'male', body: 'short', robe: E.main, trim: E.light, head: 'wolf', fur: '#7a7a86', weapon: 'saber', tail: 'wolf', hand: '#7a7a86', pants: E.acc, cape: E.acc }],
    xatinh: (E) => ['serp', { main: E.main, light: E.light, acc: E.acc, pattern: E.acc }],
    thiemthu: (E) => ['toad', { main: E.main, light: E.light, acc: E.acc }],
    tienhac: (E) => ['bird', { main: '#ffffff', light: '#f6f2ea', wing: '#ffffff', wingTip: E.acc, tail: '#1a1a22', headc: '#ffffff', cap: '#e02a2a', beak: '#6a6a5a', beakLen: 6, neckLen: 12, neckX: 9, neckc: '#ffffff', legs: true, headR: 3 }],
    phuong: (E) => ['bird', { main: E.main, light: E.light, wing: E.main, wingTip: '#ffd04a', longTail: E.light, acc: '#ffd04a', crest: '#ffd04a', neckLen: 6, neckX: 7, headR: 3.8 }],
    thanhlong: (E) => ['serp', { main: E.main, light: E.light, acc: E.acc, dragon: true }],
    kylan: (E) => ['quad', { main: E.main, light: E.light, acc: E.acc, mane: '#ff8a2a', maneSize: 0.7, horn: 'single', scales: true, tail: 'tuft', legs: 11, neck: 5, hoof: '#3a2418', snout: 'long', ears: 'point' }],
    huyenquy: (E) => ['quad', { main: '#6a8a5a', light: '#c8d8a8', acc: E.acc, shell: E.main, legs: 5, legW: 4.5, tail: 'snake', tailc: E.acc, headR: 4.6, snout: 'short', size: 1.05 }],
    nguuma: (E) => ['hum', { build: 'brawny', body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'bull', fur: '#5a3a2a', weapon: 'mace', hand: '#5a3a2a', tail: 'bull', wide: true }],
    thongoc: (E) => ['quad', { main: '#ffffff', light: '#fff4f4', acc: E.main, ears: 'long', tail: 'cotton', size: 0.7, legs: 5, legW: 3, headR: 5.6, snout: 'short', collar: E.main, eye: '#e02a5a' }],
    battuong: (E) => ['quad', { main: '#9aa0aa', light: '#c8ccd4', acc: E.main, ears: 'big', snout: 'trunk', tusk: true, size: 1.15, legs: 9, legW: 5, headR: 7.5, tail: 'long', tailc: '#9aa0aa', saddle: E.main, noBelly: true }],
    kimbang: (E) => ['bird', { main: E.main, light: E.light, wing: E.main, wingTip: E.acc, tail: E.acc, crest: E.light, hook: true, talons: true, headc: E.light, neckLen: 5, neckX: 7, headR: 4, beak: '#ffd040' }],
    hachung: (E) => ['hum', { build: 'brawny', body: 'armor', robe: E.acc, metal: E.main, plate: E.light, trim: '#e0b040', head: 'bear', fur: '#3a2a22', weapon: 'spear', hand: '#3a2a22', wide: true }],
    thutinh: (E) => ['hum', { build: 'kid', body: 'short', robe: E.main, trim: E.light, head: 'rat', fur: '#8a8a92', weapon: 'sword', tail: 'rat', tailc: '#e8a8b0', hand: '#e8a8b0', pants: E.acc }],
    nhentinh: (E) => ['spider', { main: drk(H(E.acc), 0.2), acc: E.main }],
    hatinh: (E) => ['scorp', { main: E.main, acc: E.acc }],
    longma: (E) => ['quad', { main: '#f6f2ea', light: '#ffffff', acc: E.main, mane: E.main, tail: 'horse', legs: 12, legW: 3, neck: 7, headR: 5, snout: 'long', ears: 'point', horn: 'antler', hornc: E.main, hoof: '#3a2418', saddle: E.acc }],
    suvuong: (E) => ['quad', { main: '#e8b050', light: '#f8e0b0', acc: E.main, mane: E.main, maneSize: 1.1, tail: 'tuft', legs: 10, legW: 4, headR: 6.4, ears: 'round', snout: 'short', collar: '#e0b040' }],
    viemthu: (E) => ['quad', { main: E.main, light: E.light, acc: E.acc, tail: 'flame', backFlame: true, legs: 6, legW: 3.5, headR: 5.6, snout: 'long', scales: true, size: 1.05, eye: '#ffd040' }],
    bachcot: (E) => ['hum', { build: 'slim', body: 'robe', robe: E.acc, inner: '#1a1a22', trim: E.main, head: 'skull', eyeGlow: E.glow, weapon: 'sword', hand: '#efe8d8', cape: '#2a2230' }],
    thuyquai: (E) => ['octo', { main: E.main, light: E.light, acc: E.acc }],
    doiyeu: (E) => ['bat', { main: drk(H(E.acc), 0.3), wing: drk(H(E.acc), 0.1), light: E.main }],
    khongtuoc: (E) => ['bird', { main: '#2a6ac8', light: '#4ab8c8', wing: '#2a8a6a', wingTip: E.main, fanTail: E.main, crest: '#ffd04a', neckLen: 7, neckX: 7, headR: 3.2, legs: true, legc: '#8a7a6a', headc: '#2a6ac8' }],
    quyhoa: (E) => ['ghost', { main: E.main, light: '#e8f0ff', glow: E.glow }],
  };

  // ---------- hình cho tuyệt chiêu ----------
  // tượng Phật vàng ngồi thiền trên toà sen (tự vẽ)
  function statue() {
    const b = new Buf(52, 60), cx = 26, G = '#e8b840', GL = '#fff0a0';
    b.ell(cx, 13, 13, 13, '#ffe08a', 0); b.ell(cx, 13, 11.4, 11.4, null);                 // vòng hào quang
    for (let i = 0; i < 7; i++) { const x = cx - 18 + i * 6; b.ell(x, 53, 4.6, 4, i % 2 ? '#f2a0b0' : '#f8c8d0', 0.7); b.px(x, 50, '#fff0f4'); } // toà sen
    b.ell(cx, 56, 20, 3.4, '#d8708a', 0.6);
    b.ell(cx, 46, 17, 7, G, 1);                                                                 // chân xếp bằng
    b.poly([[cx - 11, 22], [cx + 11, 22], [cx + 14, 44], [cx - 14, 44]], G, 1);                  // thân
    b.poly([[cx - 11, 22], [cx - 4, 22], [cx + 8, 44], [cx + 2, 44]], '#d8902a', 0.6);           // cà sa vắt chéo
    b.ell(cx, 41, 6, 3.6, '#f4d070', 0.8); b.ell(cx, 40, 2, 1.6, '#fff4c0', 0);                 // tay kết ấn
    b.ell(cx - 9, 17, 2.2, 3, G, 0.7); b.ell(cx + 9, 17, 2.2, 3, G, 0.7);                        // tai dài
    b.ell(cx, 15, 8, 8.5, '#f4c860', 0.9);                                                      // đầu
    b.ell(cx, 7, 5.5, 3.5, '#a86a1a', 0.8); b.ell(cx, 4, 2.6, 2.4, '#a86a1a', 0.8);             // búi tóc
    for (let x = -4; x <= 4; x += 2) b.px(cx + x, 8, '#c8862a');
    b.line(cx - 4, 15, cx - 2, 15, '#8a5a14'); b.line(cx + 2, 15, cx + 4, 15, '#8a5a14');       // mắt khép
    b.px(cx, 11, '#d42a2a'); b.line(cx - 1, 19, cx + 1, 19, '#a8601a');
    for (const [x, y] of [[cx - 6, 26], [cx - 8, 34], [cx + 7, 30]]) b.px(x, y, GL);
    return rimLight(b);
  }
  const SPECIAL = {
    buddha: () => statue(),
    demon: () => tallHumanoid({ build: 'brawny', body: 'short', robe: '#2a0808', trim: '#ff8a2a', sash: '#ff5a1a', head: 'demon', fur: '#e8341a', beard: '#3a0a0a', weapon: 'club', hand: '#e8341a', pants: '#1a0606', flameAura: true, boot: '#1a0606' }, 0, 'angry'),
    fox: () => build('quad', { main: '#c8b8ff', light: '#ffffff', acc: '#8a5ae0', tail: 'fox', tails: 9, ears: 'point', snout: 'long', size: 0.9, legs: 8, legW: 2.6 }, 1),
    monkey: () => tallHumanoid(NPCS.ngokhong, 1, 'angry'),
  };
  function special(id, scale = 3) { const k = 'sp:' + id + '|' + scale; if (!cache.has(k)) { const cv = render(SPECIAL[id](), scale); cache.set(k, { cv, url: cv.toDataURL() }); } return cache.get(k); }

  // ---------- biểu tượng cảm xúc pixel cho kênh chat (tự vẽ) ----------
  const EMOTES = ['cuoi', 'haha', 'khoc', 'gian', 'ngac', 'tim', 'ngau', 'ngu', 'ngai', 'like', 'hoa', 'khi'];
  const EMO_UNI = ['🙂', '😆', '😭', '😠', '😲', '❤️', '😎', '😴', '😳', '👍', '🌸', '🐵'];
  function emoteBuf(i) {
    const b = new Buf(18, 18), Y = '#ffd23a', K = '#4a2a10', W = '#ffffff', R = '#e8402a';
    const id = EMOTES[i];
    if (id === 'tim') { b.ell(6, 7, 4, 4, '#ff4a6a', 1); b.ell(12, 7, 4, 4, '#ff4a6a', 1); b.poly([[2.5, 8], [15.5, 8], [9, 16]], '#ff4a6a', 1); b.px(5, 5, W); return b; }
    if (id === 'like') { b.rect(3, 8, 3, 7, '#3a6ab8', 0.6); b.ell(10, 11, 5, 4.5, '#f6c8a0', 1); b.rect(8, 2, 3.5, 8, '#f6c8a0', 0.8); b.line(8, 10, 14, 10, '#c88a6a'); b.line(8, 12.5, 14, 12.5, '#c88a6a'); return b; }
    if (id === 'hoa') { for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283 - 1.57; b.ell(9 + Math.cos(a) * 4.2, 9 + Math.sin(a) * 4.2, 3, 3, '#ff9ac0', 0.8); } b.ell(9, 9, 2.4, 2.4, '#ffd23a', 0.8); return b; }
    if (id === 'khi') { b.ell(3, 9, 2.4, 3, '#c8803a', 0.8); b.ell(15, 9, 2.4, 3, '#c8803a', 0.8); b.ell(9, 9, 7, 7, '#c8803a', 1); b.ell(9, 10.5, 5, 4.5, '#f6c8a0', 0.6); b.px(7, 9, K).px(11, 9, K); b.line(8, 13, 10, 13, K); b.rect(3, 4, 12, 1.5, '#e8c45a', 0); return b; }
    b.ell(9, 9, 7.6, 7.6, Y, 1);
    const eyes = (l, r) => { l(); r(); };
    if (id === 'cuoi') { b.px(6, 7, K).px(6, 8, K).px(12, 7, K).px(12, 8, K); b.px(5, 11, K); b.line(6, 12, 12, 12, K); b.px(13, 11, K); }
    if (id === 'haha') { b.line(5, 7, 7, 6, K); b.line(7, 6, 8, 7, K); b.line(10, 7, 11, 6, K); b.line(11, 6, 13, 7, K); b.ell(9, 12, 4, 2.6, '#8a1a10', 0); b.rect(6, 10, 6, 1, W, 0); }
    if (id === 'khoc') { b.line(5, 8, 8, 8, K); b.line(10, 8, 13, 8, K); b.rect(5, 9, 1.4, 6, '#5ab8ff', 0); b.rect(12, 9, 1.4, 6, '#5ab8ff', 0); b.ell(9, 13, 2.2, 1.4, '#8a1a10', 0); }
    if (id === 'gian') { b.ell(9, 9, 7.6, 7.6, '#ff7a3a', 1); b.line(4, 5, 8, 7, K); b.line(10, 7, 14, 5, K); b.px(6, 9, K).px(12, 9, K); b.line(6, 13, 12, 13, K); b.px(14, 3, R).px(15, 4, R); }
    if (id === 'ngac') { b.ell(6.5, 7.5, 1.6, 2, W, 0); b.ell(11.5, 7.5, 1.6, 2, W, 0); b.px(6.5, 8, K).px(11.5, 8, K); b.ell(9, 13, 1.8, 2, '#8a1a10', 0); }
    if (id === 'ngau') { b.rect(3.5, 6.5, 11, 3, '#1a1a22', 0.4); b.px(5, 7, '#6a7a9a'); b.line(6, 12.5, 12, 11.5, K); }
    if (id === 'ngu') { b.line(5, 8, 8, 8, K); b.line(10, 8, 13, 8, K); b.ell(9, 12.5, 1.5, 1.2, K, 0); b.px(14, 3, '#5ab8ff'); b.px(16, 1, '#5ab8ff'); }
    if (id === 'ngai') { b.px(6, 8, K).px(12, 8, K); b.ell(5, 11, 2, 1.2, '#ff7a8a', 0); b.ell(13, 11, 2, 1.2, '#ff7a8a', 0); b.line(8, 13, 10, 13, K); }
    b.px(5, 4, '#fff6c0'); b.px(6, 3.5, '#fff6c0');
    return b;
  }
  function emote(i) { const k = 'emo:' + i; if (!cache.has(k)) { const cv = render(emoteBuf(i), 2); cache.set(k, { cv, url: cv.toDataURL() }); } return cache.get(k); }

  // cỡ người/thú theo loài: s nhỏ · m vừa · l lớn
  const FORM_SIZE = { thongoc: 's', holy: 's', thiemthu: 's', doiyeu: 's', quyhoa: 's', thutinh: 's', nhentinh: 's', hatinh: 's', hautinh: 's',
    battuong: 'l', kylan: 'l', thanhlong: 'l', longma: 'l', suvuong: 'l', kimbang: 'l', phuong: 'l', huyenquy: 'l', viemthu: 'l', nguuma: 'l', hachung: 'l', xatinh: 'l' };
  const sizeOf = (form) => FORM_SIZE[form] || 'm';

  // ---------- bộ nhớ đệm ----------
  const cache = new Map();
  function build(kind, opts, frame) {
    switch (kind) {
      case 'hum': return opts.chibi ? humanoid(opts, frame) : tallHumanoid(opts, frame, opts._expr || 'calm');
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
  const TALL = (kind, opts) => kind === 'hum' && !opts.chibi;
  function get(key, kind, opts, frame = 0, scale = 4, expr = 'calm') {
    if (TALL(kind, opts)) scale = Math.min(scale, 3);
    const k = key + '|' + frame + '|' + scale + '|' + expr;
    if (!cache.has(k)) {
      const cv = render(build(kind, expr === 'calm' ? opts : { ...opts, _expr: expr }, frame), scale);
      cache.set(k, { cv, url: cv.toDataURL() });
    }
    return cache.get(k);
  }

  // ---------- trang bị hiện trên người ----------
  const QCOL = ['#e8e2d4', '#6fd06f', '#5ab0ff', '#c77dff', '#ffa630', '#ff4d4d'];
  function applyGear(base, g, race) {
    if (!g) return base;
    const o = { ...base };
    if (g.w) o.weapon = g.w;
    if (g.aq >= 2) o.trim = QCOL[g.aq];
    if (g.aq >= 3 && !o.cape) o.cape = mix(H(QCOL[g.aq]), [30, 14, 24], 0.55);
    if (g.aq >= 4) o.sash = QCOL[g.aq];
    if (g.hq >= 3) o.hat = race === 'ma' ? 'helmet' : race === 'than' ? 'crown' : o.hat;
    if (g.plus >= 7) o.aura = QCOL[Math.max(g.aq || 0, g.wq || 0, 4)];
    return o;
  }
  function withAura(b, col) { // viền hào quang 1 điểm ảnh quanh hình
    const c = C(col), out = b.d.slice();
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      if (b.get(x, y)) continue;
      let near = 0;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [2, 0], [-2, 0], [0, -2]]) if (b.get(x + dx, y + dy)) { near = Math.abs(dx) + Math.abs(dy); break; }
      if (near) { const v = near === 1 ? lit(c, 0.25) : c.slice(); v.noOutline = true; out[y * b.w + x] = v; }
    }
    b.d = out; return b;
  }
  // thú cưỡi
  const MOUNTS = {
    candau: ['cloud', { main: '#fff6d8', light: '#ffffff', acc: '#f0c050' }],
    bachma: ['quad', { main: '#f4f2ec', light: '#ffffff', acc: '#b8b0a0', mane: '#e8ecf4', maneSize: 0.8, tail: 'tuft', legs: 12, legW: 3.4, neck: 5, hoof: '#4a3a2a', snout: 'long', ears: 'point', size: 1.1 }],
    kylan: ['quad', { main: '#e8b040', light: '#fff0b0', acc: '#a8401a', mane: '#ff6a2a', maneSize: 0.9, horn: 'single', scales: true, tail: 'tuft', legs: 11, neck: 5, hoof: '#3a2418', snout: 'long', ears: 'point', size: 1.1 }],
    hac: ['bird', { main: '#ffffff', light: '#f6f2ea', wing: '#ffffff', wingTip: '#1a1a22', tail: '#1a1a22', headc: '#ffffff', cap: '#e02a2a', beak: '#6a6a5a', beakLen: 6, neckLen: 12, neckX: 9, neckc: '#ffffff', legs: true, headR: 3 }],
    hoho: ['quad', { main: '#e8902a', light: '#fff0d8', acc: '#2a1a10', stripes: true, tail: 'tiger', legs: 10, legW: 4, headR: 6, snout: 'short', ears: 'round', size: 1.12 }],
  };
  function cloudMount() {
    const b = new Buf(44, 22);
    for (const [x, y, r] of [[10, 13, 7], [19, 10, 8], [28, 12, 7.5], [35, 14, 5.5], [6, 16, 4.5], [22, 15, 8]]) b.ell(x, y, r, r * 0.72, '#fff6d8', 1);
    for (const [x, y] of [[14, 9], [25, 8], [31, 10]]) b.ell(x, y, 3, 2, '#ffffff', 0.4);
    b.curve([[40, 15], [44, 18], [43, 21]], '#f0c050', 1.6, 0.4);
    return b;
  }
  function mount(id, frame = 0) {
    const m = MOUNTS[id]; if (!m) return null;
    const k = 'mount:' + id + '|' + frame;
    if (!cache.has(k)) { const b = m[0] === 'cloud' ? cloudMount() : build(m[0], m[1], frame); const cv = render(b, 4); cache.set(k, { cv, url: cv.toDataURL() }); }
    return cache.get(k);
  }

  // API
  function heroOpts(race, gender, gear) { const id = race + '_' + (gender === 'f' ? 'f' : 'm'); const base = HEROES[id] || HEROES.than_m; return [id, gear ? applyGear(base, gear, race) : base]; }
  function hero(race, gender, frame = 0, scale = 4, gear, expr = 'calm') {
    const [id, o] = heroOpts(race, gender, gear);
    if (!gear) return get('hero:' + id, 'hum', o, frame, scale, expr);
    scale = Math.min(scale, 3);
    const key = 'hero:' + id + ':' + [gear.w, gear.aq, gear.hq, gear.plus >= 7 ? 1 : 0].join(',') + '|' + frame + '|' + scale + '|' + expr;
    if (!cache.has(key)) { let b = build('hum', expr === 'calm' ? o : { ...o, _expr: expr }, frame); if (o.aura) b = withAura(b, o.aura); const cv = render(b, scale); cache.set(key, { cv, url: cv.toDataURL() }); }
    return cache.get(key);
  }
  // chân dung (đầu + vai) cho ảnh đại diện, danh sách
  function face(race, gender, gear, expr = 'calm') {
    const [id, o] = heroOpts(race, gender, gear);
    const key = 'face:' + id + ':' + (gear ? [gear.w, gear.aq, gear.hq].join(',') : '') + '|' + expr;
    if (!cache.has(key)) {
      const full = build('hum', { ...o, weapon: null, offhand: null, wings: null, _expr: expr }, 0), m = full.meta || { cx: 40, hy: 24, k: 1 };
      const w = Math.round(42 * m.k), h = Math.round(46 * m.k), x0 = Math.round(m.cx - w / 2), y0 = Math.max(0, Math.round(m.hy - 19 * m.k)), b = new Buf(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) b.d[y * w + x] = full.get(x + x0, y + y0);
      const cv = render(b, 3); cache.set(key, { cv, url: cv.toDataURL() });
    }
    return cache.get(key);
  }
  function npc(id, frame = 0, scale = 4, expr) { const o = NPCS[id]; return o ? get('npc:' + id, o.kind || 'hum', o, frame, scale, expr) : null; }
  function form(formId, element = 'tho', frame = 0, scale = 4, expr) {
    const fn = FORMS[formId]; if (!fn) return null;
    const [kind, opts] = fn(ELEM[element] || ELEM.tho);
    return get('form:' + formId + ':' + element, kind, opts, frame, scale, kind === 'hum' ? expr : undefined);
  }
  function human(hid, frame = 0, scale = 4, expr) { const o = HUMANS[hid]; return o ? get('hum:' + hid, o.kind || 'hum', o, frame, scale, expr) : null; }
  function boss(bid, frame = 0, scale = 4, expr) {
    if (bid === 'world') return get('boss:world', 'king', { main: '#3a5a8a', light: '#a8c8e8', acc: '#e8c45a' }, frame, scale);
    return npc(BOSS_ALIAS[bid] || bid, frame, scale, expr);
  }
  // từ một đơn vị trận đấu
  function unit(u, frame = 0, expr) {
    if (u.hero) return hero(u.hero.race, u.hero.gender, frame, 4, u.hero.gear, expr);
    if (u.bossId) return boss(u.bossId, frame, 4, expr);
    if (u.hid) return human(u.hid, frame, 4, expr);
    if (u.form) return form(u.form, u.element, frame, 4, expr);
    return null;
  }
  const kindOf = (formId) => (FORMS[formId] ? FORMS[formId](ELEM.tho)[0] : 'hum');

  return { EMOTES, EMO_UNI, emote, special, sizeOf, get, build, face, hero, npc, form, human, boss, unit, mount, kindOf, HEROES, NPCS, FORMS, ELEM, MOUNTS };
})();
