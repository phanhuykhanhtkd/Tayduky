// =====================================================================
//  THẾ GIỚI 3D: dựng lưới tam giác thật từ ô bản đồ — địa hình có độ cao
//  (vách núi, bờ sông trũng, núi non bao quanh), nhà mái cong, cây khối,
//  đá, cổng chào, cầu gỗ, cỏ lay theo gió, đèn lồng phát sáng.
//  Đầu ra: mảng Float32 (12 số / đỉnh: vị trí, pháp tuyến, màu, [lay, sáng, phủ nền])
//  để hd2d.js vẽ với ánh nắng, bóng đổ (shadow map) và sương xa.
// =====================================================================
const World3D = (() => {
  const COLS = 12, ROWS = 20, WY = -0.07; // mặt nước
  const hash = (x, y) => { let h = (Math.floor(x * 1000) * 374761393 + Math.floor(y * 1000) * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const hi = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const sm = (t) => t * t * (3 - 2 * t);
  const s01 = (t) => sm(Math.max(0, Math.min(1, t)));
  function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = hi(xi, yi), b = hi(xi + 1, yi), c = hi(xi, yi + 1), d = hi(xi + 1, yi + 1); const u = sm(xf), v = sm(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  const fbm = (x, y) => vn(x, y) * 0.55 + vn(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + vn(x * 4.3 + 1, y * 4.3 + 9) * 0.15;
  const hx = (s) => { const n = parseInt(s.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const mulc = (a, k) => [Math.min(1, a[0] * k), Math.min(1, a[1] * k), Math.min(1, a[2] * k)];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const WHITE = [0.97, 0.98, 1];

  // ---------- phong cách từng vùng ----------
  const TH = {
    city: { style: 'wall', grass: '#6f9a48', grass2: '#8db85c', rock: '#8a8378', peak: '#b0a898', leaf: ['#2a5e28', '#4a8a38', '#8ac060'], tree: 'willow', trunk: '#5a3a20', roof: ['#5e6e84', '#46546a', '#262e3a'], wall: '#f0e4cc', col: '#b0342a', wood: '#5a2418', base: '#a09886', stone: '#b4aa96', lantern: true, tuft: '#5a8f3a', fruit: null, water: ['#1a557a', '#5aaed0', 0], lily: true },
    forest: { style: 'mount', grass: '#3f7a34', grass2: '#5e9a40', rock: '#7a7a6c', peak: '#a0a090', leaf: ['#1a4422', '#2f6b2c', '#62a43e'], tree: 'mix', trunk: '#5a3a1e', roof: ['#d8b06a', '#b48a48', '#6a4a1a'], thatch: true, wall: '#a07a4c', col: '#5a3a1e', wood: '#4a3018', base: '#7a7064', stone: '#8a8478', tuft: '#3f7a30', fruit: '#ffb02a', water: ['#123e5e', '#4a9cb8', 0], lily: true },
    river: { style: 'mount', grass: '#5a9a4e', grass2: '#7ab860', rock: '#7a8a80', peak: '#b4c0b8', leaf: ['#1f4a28', '#3a7a3a', '#74b058'], tree: 'willow', trunk: '#5a3a20', roof: ['#8a6a4a', '#64503a', '#2a1e14'], wall: '#d4bc98', col: '#6a3a20', wood: '#4a2a18', base: '#8a8a80', stone: '#9a9a90', lantern: true, tuft: '#4a8a40', water: ['#124e66', '#5ab8c4', 0], lily: true },
    heaven: { style: 'cloud', grass: '#f4eefc', grass2: '#ffffff', rock: '#e0d6ee', peak: '#ffffff', leaf: ['#d0648c', '#ff9ab8', '#ffe2ec'], tree: 'blossom', trunk: '#7a4a3a', roof: ['#ffe08a', '#e0b448', '#8a6421'], wall: '#c8302a', col: '#8a1f1a', wood: '#6a1a12', base: '#f6f2fc', stone: '#f6f2fc', lantern: true, gold: '#e8c45a', tuft: '#c8b4f0', fruit: '#ffffff', water: ['#26307e', '#7a8ae0', 0] },
    cave: { style: 'mount', grass: '#3e3650', grass2: '#4e4462', rock: '#4a3e58', peak: '#62527a', leaf: ['#5a2298', '#8a4ac8', '#d0a0ff'], tree: 'shroom', trunk: '#e8dcc8', roof: ['#7a6a8a', '#584a6a', '#2a1e34'], wall: '#6a5a6a', col: '#3a2a3a', wood: '#2a1e2a', base: '#5a4e5a', stone: '#6a5e6a', glow: true, water: ['#0a1428', '#2a4a80', 0] },
    snow: { style: 'mount', grass: '#eef4fa', grass2: '#ffffff', rock: '#8a9aac', peak: '#ffffff', leaf: ['#1a3a36', '#2a5648', '#4a7a64'], tree: 'pine', trunk: '#5a3a20', roof: ['#ffffff', '#dce6f2', '#7a8a9a'], wall: '#8a5a3a', col: '#5a3020', wood: '#3a2014', base: '#a8b4c4', stone: '#c8d4e2', lantern: true, snowy: true, water: ['#7ab0d8', '#dff2ff', 2] },
    desert: { style: 'mount', grass: '#d09a60', grass2: '#e0b070', rock: '#a85a32', peak: '#c8784a', leaf: ['#5a5a22', '#7a7a32', '#a0a04a'], tree: 'dead', trunk: '#7a4a24', roof: ['#c87850', '#a65e3e', '#6a3420'], wall: '#e0b080', col: '#8a4a2a', wood: '#5a3018', base: '#b88a5a', stone: '#c89a6a', water: ['#5a0a04', '#ff8a1a', 1] },
  };

  // ---------- bộ dựng lưới ----------
  class GB {
    constructor() { this.d = []; this.sw = null; this.em = 0; this.tw = 0; this.off = [0, 0, 0]; this.sc = 1; }
    v(p, n, c) {
      const s = this.sw ? Math.max(0, Math.min(1, (p[1] - this.sw[0]) / this.sw[1])) * this.sw[2] : 0;
      const k = this.sc; this.d.push(p[0] * k + this.off[0], p[1] * k + this.off[1], p[2] * k + this.off[2], n[0], n[1], n[2], c[0], c[1], c[2], s, this.em, this.tw);
    }
    tri(a, b, c, col, ctr, cols) {
      let n = nrm(cross(sub(b, a), sub(c, a)));
      if (ctr) { const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]; if (dot(n, sub(m, ctr)) < 0) n = [-n[0], -n[1], -n[2]]; }
      else if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
      const cs = cols || [col, col, col];
      this.v(a, n, cs[0]); this.v(b, n, cs[1]); this.v(c, n, cs[2]);
    }
    quad(a, b, c, d, col, ctr, cols) { this.tri(a, b, c, col, ctr, cols && [cols[0], cols[1], cols[2]]); this.tri(a, c, d, col, ctr, cols && [cols[0], cols[2], cols[3]]); }
    box(x0, y0, z0, x1, y1, z1, col, top) {
      const c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], t = top || col;
      this.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], t, c);
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], col, c);
      this.quad([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], mulc(col, 0.9), c);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], col, c);
      this.quad([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], col, c);
    }
    // hình trụ/nón xiên từ a đến b
    limb(a, b, r0, r1, n, col, col2, cap = true) {
      const ax = nrm(sub(b, a)), up = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const u = nrm(cross(ax, up)), w = cross(ax, u);
      const ring = (p, r) => { const o = []; for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; const cs = Math.cos(t), sn = Math.sin(t); o.push([p[0] + (u[0] * cs + w[0] * sn) * r, p[1] + (u[1] * cs + w[1] * sn) * r, p[2] + (u[2] * cs + w[2] * sn) * r]); } return o; };
      const A = ring(a, r0), B = r1 > 0 ? ring(b, r1) : null, c2 = col2 || col;
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        if (B) this.quad(A[i], A[j], B[j], B[i], col, mid, [col, col, c2, c2]);
        else this.tri(A[i], A[j], b, col, mid, [col, col, c2]);
      }
      if (B && cap) for (let i = 1; i < n - 1; i++) this.tri(B[0], B[i], B[i + 1], c2, a);
    }
    // cầu đa diện (icosphere) méo ngẫu nhiên, màu chuyển từ đáy lên đỉnh
    sphere(c, rx, ry, rz, c0, c1, lvl, seed, jit, cut, speck) {
      const tris = ICO[Math.min(2, lvl)];
      const J = (p) => 1 + (hash(Math.round(p[0] * 500) + seed * 13.1, Math.round(p[1] * 500) * 7 + Math.round(p[2] * 500) * 3 + seed) - 0.5) * 2 * jit;
      const P = (p) => { const j = J(p); let y = c[1] + p[1] * ry * j; if (cut != null && y < cut) y = cut; return [c[0] + p[0] * rx * j, y, c[2] + p[2] * rz * j]; };
      const col = (p) => { let k = mixc(c0, c1, s01((p[1] + 0.9) / 1.8)); if (speck && hash(Math.round(p[0] * 300) + seed, Math.round(p[2] * 300) + Math.round(p[1] * 300) * 5) < speck[1]) k = speck[0]; return k; };
      for (const [a, b, d] of tris) this.tri(P(a), P(b), P(d), null, c, [col(a), col(b), col(d)]);
    }
    // mái cong kiểu Á Đông: mái chái (hip) võng, đầu đao cong vút
    roof(x0, z0, x1, z1, ye, yr, lift, rc, T, skirt = true) {
      const W = x1 - x0, D = z1 - z0, hd = Math.min(W, D) / 2;
      const H = (x, z) => {
        const ex = Math.min(x - x0, x1 - x), ez = Math.min(z - z0, z1 - z);
        const t = Math.min(1, Math.min(ex, ez) / hd);
        const cx = 1 - Math.min(1, ex / (W * 0.3)), cz = 1 - Math.min(1, ez / (D * 0.3));
        return ye + (yr - ye) * Math.pow(t, 1.5) + lift * Math.pow(cx * cz, 1.7) + lift * 0.25 * (cx + cz) * (1 - t);
      };
      const nx = Math.max(6, Math.round(W * 9)), nz = Math.max(4, Math.round(D * 9));
      const pt = (i, j) => { const x = x0 + (W * i) / nx, z = z0 + (D * j) / nz; return [x, H(x, z), z]; };
      const ca = hx(rc[0]), cb = hx(rc[1]), cd = hx(rc[2]);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const xm = x0 + (W * (i + 0.5)) / nx, zm = z0 + (D * (j + 0.5)) / nz;
        const front = Math.min(zm - z0, z1 - zm) < Math.min(xm - x0, x1 - xm);
        let col = (front ? i : j) % 2 ? ca : mixc(ca, cb, 0.7);
        if (T && T.thatch) col = mixc(ca, cb, hash(i * 3.1, j * 1.7));
        if (T && T.snowy) col = mixc(WHITE, hx('#dce6f2'), (front ? i : j) % 2 ? 0 : 0.6);
        const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
        this.quad(a, b, c, d, col, null);
      }
      if (skirt) { // viền mái dày
        const ctr = [(x0 + x1) / 2, ye - 0.3, (z0 + z1) / 2];
        const edge = [];
        for (let i = 0; i < nx; i++) edge.push(pt(i, 0));
        for (let j = 0; j < nz; j++) edge.push(pt(nx, j));
        for (let i = nx; i > 0; i--) edge.push(pt(i, nz));
        for (let j = nz; j > 0; j--) edge.push(pt(0, j));
        for (let k = 0; k < edge.length; k++) { const p = edge[k], q = edge[(k + 1) % edge.length]; this.quad(p, q, [q[0], q[1] - 0.07, q[2]], [p[0], p[1] - 0.07, p[2]], cd, ctr); }
      }
      // nóc mái + đầu đao
      const rcol = mulc(cd, 1.1);
      if (W >= D) {
        const za = (z0 + z1) / 2, xa = x0 + hd, xb = x1 - hd;
        if (xb - xa > 0.05) this.box(xa - 0.04, yr - 0.03, za - 0.045, xb + 0.04, yr + 0.07, za + 0.045, rcol);
        if (!(T && T.thatch)) for (const [x, s] of [[xa - 0.02, -1], [xb + 0.02, 1]]) this.limb([x, yr + 0.04, za], [x + s * 0.13, yr + 0.2, za], 0.04, 0.012, 5, rcol);
      } else {
        const xa = (x0 + x1) / 2, za = z0 + hd, zb = z1 - hd;
        if (zb - za > 0.05) this.box(xa - 0.045, yr - 0.03, za - 0.04, xa + 0.045, yr + 0.07, zb + 0.04, rcol);
      }
    }
  }
  // lưới icosphere cấp 0..2
  const ICO = (() => {
    const t = (1 + Math.sqrt(5)) / 2;
    const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(nrm);
    const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    let tris = f.map((q) => q.map((i) => v[i]));
    const L = [tris];
    const md = (a, b) => nrm([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
    for (let s = 0; s < 2; s++) { const nt = []; for (const [a, b, c] of tris) { const ab = md(a, b), bc = md(b, c), ca = md(c, a); nt.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]); } tris = nt; L.push(tris); }
    return L;
  })();

  // =====================================================================
  //  VẬT THỂ
  // =====================================================================
  function tree(g, T, x, y, z, seed, s = 1, lvl = 1) {
    const r = (k) => hash(seed * 7.3 + k, seed * 3.1 - k * 1.7);
    const kind = T.tree === 'mix' ? (r(1) < 0.45 ? 'pine' : 'broad') : T.tree;
    const leaf = T.leaf.map(hx), trunk = hx(T.trunk);
    g.off = [x, y, z];
    if (kind === 'pine') {
      const H = (2.0 + r(2) * 0.7) * s;
      g.limb([0, -0.05, 0], [0, H * 0.32, 0], 0.09 * s, 0.06 * s, 6, mulc(trunk, 0.75), trunk);
      g.sw = [H * 0.25, H, 0.55];
      for (let i = 0; i < 4; i++) {
        const y0 = H * (0.2 + i * 0.18), rr = (0.62 - i * 0.12) * s, top = y0 + H * 0.36;
        g.limb([0, y0, 0], [0, top, 0], rr, 0, 7, mulc(leaf[0], 0.8), i === 3 ? leaf[2] : leaf[1]);
        if (T.snowy) g.limb([0, y0 + (top - y0) * 0.42, 0], [0, top + 0.03, 0], rr * 0.62, 0, 7, mixc(WHITE, [0.8, 0.88, 0.95], 0.4), WHITE);
      }
    } else if (kind === 'willow') {
      const H = (1.15 + r(2) * 0.3) * s;
      g.limb([0, -0.05, 0], [(r(3) - 0.5) * 0.15, H, 0], 0.11 * s, 0.07 * s, 6, mulc(trunk, 0.7), trunk);
      g.sw = [H * 0.7, H, 0.9];
      g.sphere([0, H + 0.22 * s, 0], 0.66 * s, 0.4 * s, 0.62 * s, mulc(leaf[0], 0.9), leaf[2], lvl, seed, 0.14);
      g.sphere([0.12 * s, H + 0.48 * s, -0.05], 0.38 * s, 0.26 * s, 0.36 * s, leaf[1], mixc(leaf[2], [1, 1, 0.8], 0.2), lvl, seed + 3, 0.15);
      g.sw = [H - 0.8 * s, 1.2 * s, 1.4];
      const n = 16;
      for (let i = 0; i < n; i++) { // cành liễu rủ
        const a = (i / n) * Math.PI * 2 + r(i) * 0.3, rr = (0.5 + r(i + 20) * 0.15) * s;
        const cx = Math.cos(a) * rr, cz = Math.sin(a) * rr * 0.95, tx = -Math.sin(a) * 0.05, tz = Math.cos(a) * 0.05;
        const yb = H - (0.45 + r(i + 40) * 0.4) * s, yt = H + 0.18 * s, out = 1.12;
        g.quad([cx - tx, yt, cz - tz], [cx + tx, yt, cz + tz], [cx * out + tx * 0.4, yb, cz * out + tz * 0.4], [cx * out - tx * 0.4, yb, cz * out - tz * 0.4], leaf[1], [0, yt, 0], [leaf[1], leaf[1], leaf[2], leaf[2]]);
      }
    } else if (kind === 'shroom') { // nấm khổng lồ phát sáng
      const H = (0.95 + r(2) * 0.35) * s;
      g.limb([0, -0.05, 0], [(r(3) - 0.5) * 0.2, H, 0], 0.14 * s, 0.09 * s, 7, mulc(trunk, 0.8), trunk);
      g.sw = [H * 0.6, H, 0.3];
      g.sphere([0, H + 0.05, 0], 0.62 * s, 0.32 * s, 0.6 * s, mulc(leaf[0], 0.6), leaf[1], lvl, seed, 0.08, H - 0.05);
      g.em = 1;
      for (let i = 0; i < 7; i++) { const a = r(i) * 6.28, rr = r(i + 9) * 0.4 * s; g.sphere([Math.cos(a) * rr, H + 0.05 + 0.3 * s * Math.sqrt(1 - (rr / (0.62 * s)) ** 2) - 0.02, Math.sin(a) * rr], 0.05 * s, 0.03 * s, 0.05 * s, leaf[2], WHITE, 0, seed + i, 0); }
      g.em = 0;
    } else if (kind === 'dead') { // cây khô sa mạc
      const H = (1.1 + r(2) * 0.4) * s;
      const tr = mulc(trunk, 0.9);
      g.limb([0, -0.05, 0], [0.05, H * 0.6, 0], 0.1 * s, 0.07 * s, 6, mulc(tr, 0.8), tr);
      g.limb([0.05, H * 0.6, 0], [-0.1, H, 0.05], 0.07 * s, 0.04 * s, 5, tr);
      g.limb([0.05, H * 0.5, 0], [0.42 * s, H * 0.85, -0.05], 0.05 * s, 0.025 * s, 5, tr);
      g.limb([0, H * 0.4, 0], [-0.38 * s, H * 0.7, 0.08], 0.045 * s, 0.02 * s, 5, tr);
      g.sw = [H * 0.6, H * 0.5, 0.5];
      for (const [px, py, pz] of [[-0.1, H + 0.05, 0.05], [0.42 * s, H * 0.88, -0.05], [-0.38 * s, H * 0.74, 0.08]]) g.sphere([px, py, pz], 0.2 * s, 0.13 * s, 0.2 * s, leaf[0], leaf[2], 0, seed + px * 9, 0.25);
    } else { // tán tròn / hoa đào
      const H = (1.0 + r(2) * 0.3) * s;
      g.limb([0, -0.05, 0], [(r(3) - 0.5) * 0.12, H, 0], 0.11 * s, 0.065 * s, 6, mulc(trunk, 0.7), trunk);
      g.limb([0, H * 0.7, 0], [0.32 * s, H + 0.1, 0.05], 0.05 * s, 0.03 * s, 5, trunk);
      g.limb([0, H * 0.75, 0], [-0.3 * s, H + 0.05, -0.04], 0.05 * s, 0.03 * s, 5, trunk);
      g.sw = [H * 0.6, H, 0.7];
      const speck = T.fruit ? [hx(T.fruit), T.tree === 'blossom' ? 0.28 : 0.05] : null;
      const blobs = [[0, H + 0.36, 0, 0.6], [-0.34, H + 0.12, 0.1, 0.44], [0.36, H + 0.16, -0.04, 0.44], [0.04, H + 0.66, -0.08, 0.4], [-0.1, H + 0.2, 0.3, 0.36]];
      blobs.forEach((b, i) => g.sphere([b[0] * s, H + (b[1] - H) * s, b[2] * s], b[3] * s, b[3] * s * 0.86, b[3] * s, mulc(leaf[0], 0.85), leaf[2], lvl, seed + i, 0.17, null, speck));
    }
    g.sw = null; g.off = [0, 0, 0];
  }

  function rock(g, T, x, y, z, r, seed, lvl = 0) {
    const c = hx(T.rock), top = T.snowy ? WHITE : mixc(c, [1, 1, 1], 0.28);
    const moss = (T === TH.forest || T === TH.river) ? [hx('#5a8a3a'), 0.2] : null;
    g.sphere([x, y + r * 0.3, z], r, r * 0.78, r * 0.92, mulc(c, 0.62), top, lvl, seed, 0.3, y - 0.02, moss);
  }

  function crystal(g, x, y, z, seed, s = 1) {
    const cols = [[hx('#5ad8f0'), hx('#d8faff')], [hx('#b07aff'), hx('#f0dcff')]];
    g.em = 0.75;
    for (let i = 0; i < 4; i++) {
      const [c0, c1] = cols[(seed + i) % 2];
      const a = hash(seed, i) * 6.28, lean = 0.25 + hash(i, seed) * 0.35, L = (0.35 + hash(seed + i, 3) * 0.4) * s;
      const b = [x + Math.cos(a) * 0.06, y, z + Math.sin(a) * 0.06], t = [b[0] + Math.cos(a) * lean * L, y + L, b[2] + Math.sin(a) * lean * L];
      const m = [b[0] + (t[0] - b[0]) * 0.75, b[1] + (t[1] - b[1]) * 0.75, b[2] + (t[2] - b[2]) * 0.75];
      g.limb(b, m, 0.07 * s, 0.07 * s, 6, c0, c1, false); g.limb(m, t, 0.07 * s, 0, 6, c1, WHITE);
    }
    g.em = 0;
  }

  function cloudPuff(g, x, y, z, s, seed) {
    g.em = 0.25;
    for (let i = 0; i < 5; i++) { const a = hash(seed, i) * 6.28, rr = hash(i, seed) * 0.55 * s; g.sphere([x + Math.cos(a) * rr, y + hash(seed + i, 2) * 0.15 * s, z + Math.sin(a) * rr * 0.6], 0.42 * s, 0.26 * s, 0.36 * s, hx('#d8d0f0'), WHITE, 1, seed + i, 0.12); }
    g.em = 0;
  }

  function house(g, T, tx, ty, tw, th) {
    const x0 = tx + 0.04, x1 = tx + tw - 0.04, z0 = ty + 0.1, z1 = ty + th - 0.02;
    const big = tw >= 2 && th >= 2;
    const stone = hx(T.base), wall = hx(T.wall), col = hx(T.col), wood = hx(T.wood), gold = hx(T.gold || '#d8b048');
    const cx = (x0 + x1) / 2;
    g.box(x0 - 0.04, -0.03, z0 - 0.04, x1 + 0.04, 0.12, z1 + 0.06, mulc(stone, 0.82), stone); // nền đá
    g.box(cx - 0.24, -0.03, z1 + 0.06, cx + 0.24, 0.06, z1 + 0.2, mulc(stone, 0.78), stone); // bậc thềm
    const wx0 = x0 + 0.12, wx1 = x1 - 0.12, wz0 = z0 + 0.12, wz1 = z1 - 0.16;
    const wallH = big ? 1.15 : 1.28;
    const storey = (ax0, ax1, az0, az1, y0, y1, door) => {
      g.box(ax0, y0, az0, ax1, y1, az1, wall);
      const n = Math.max(2, Math.round((ax1 - ax0) / 0.42) + 1);
      for (let i = 0; i < n; i++) { const x = ax0 + ((ax1 - ax0) * i) / (n - 1); g.limb([x, y0, az1 + 0.035], [x, y1, az1 + 0.035], 0.045, 0.045, 6, col, col, false); }
      for (const x of [ax0, ax1]) g.limb([x, y0, az0 - 0.02], [x, y1, az0 - 0.02], 0.045, 0.045, 6, col, col, false);
      g.box(ax0 - 0.05, y1 - 0.11, az0 - 0.06, ax1 + 0.05, y1 + 0.02, az1 + 0.08, wood); // xà
      g.box(ax0, y0, az1, ax1, y0 + 0.1, az1 + 0.02, mulc(wood, 0.9)); // chân tường
      if (door) { // cửa gỗ hai cánh
        const dh = Math.min(0.62, (y1 - y0) * 0.66);
        g.box(cx - 0.2, y0, az1 + 0.005, cx + 0.2, y0 + dh + 0.06, az1 + 0.03, col);
        g.box(cx - 0.16, y0, az1 + 0.02, cx - 0.008, y0 + dh, az1 + 0.045, mulc(wood, 1.35));
        g.box(cx + 0.008, y0, az1 + 0.02, cx + 0.16, y0 + dh, az1 + 0.045, mulc(wood, 1.35));
        for (const s of [-1, 1]) g.box(cx + s * 0.04 - 0.012, y0 + dh * 0.5, az1 + 0.04, cx + s * 0.04 + 0.012, y0 + dh * 0.5 + 0.03, az1 + 0.055, gold);
      }
      if (ax1 - ax0 > 0.85) for (const s of [-1, 1]) { // cửa sổ song
        const wxc = cx + s * (ax1 - ax0) * 0.31, wy = y0 + (y1 - y0) * 0.55, ww = Math.min(0.15, (ax1 - ax0) * 0.1);
        g.box(wxc - ww - 0.025, wy - 0.15, az1 + 0.003, wxc + ww + 0.025, wy + 0.15, az1 + 0.02, col);
        g.box(wxc - ww, wy - 0.12, az1 + 0.01, wxc + ww, wy + 0.12, az1 + 0.025, mulc(wood, 0.45));
        for (let k = -1; k <= 1; k++) { g.box(wxc + k * ww * 0.55 - 0.008, wy - 0.12, az1 + 0.02, wxc + k * ww * 0.55 + 0.008, wy + 0.12, az1 + 0.035, mulc(wall, 0.9)); }
        g.box(wxc - ww, wy - 0.01, az1 + 0.02, wxc + ww, wy + 0.01, az1 + 0.035, mulc(wall, 0.9));
      }
    };
    const rlift = T.thatch ? 0.03 : 0.2;
    if (big) {
      storey(wx0, wx1, wz0, wz1, 0.12, wallH, true);
      g.roof(wx0 - 0.3, wz0 - 0.28, wx1 + 0.3, wz1 + 0.36, wallH + 0.02, wallH + 0.5, rlift * 0.8, T.roof, T);
      const u0 = wx0 + 0.22, u1 = wx1 - 0.22, v0 = wz0 + 0.18, v1 = wz1 - 0.1;
      storey(u0, u1, v0, v1, wallH, wallH + 0.78, false);
      const ry = wallH + 0.8;
      g.roof(u0 - 0.34, v0 - 0.3, u1 + 0.34, v1 + 0.36, ry, ry + 0.38 + (v1 - v0) * 0.24, rlift, T.roof, T);
    } else {
      storey(wx0, wx1, wz0, wz1, 0.12, wallH, true);
      g.roof(x0 - 0.24, z0 - 0.24, x1 + 0.24, z1 + 0.26, wallH + 0.02, wallH + 0.42 + (z1 - z0) * 0.2, rlift, T.roof, T);
    }
    if (T.lantern) for (const x of [wx0 + 0.02, wx1 - 0.02]) { // đèn lồng đỏ
      const ly = wallH - 0.36, lz = wz1 + 0.24;
      g.box(x - 0.006, ly + 0.08, lz - 0.006, x + 0.006, wallH - 0.02, lz + 0.006, mulc(wood, 0.6));
      g.em = 1; g.sphere([x, ly, lz], 0.075, 0.095, 0.075, hx('#e8381e'), hx('#ffa040'), 1, Math.round(x * 31), 0); g.em = 0;
      g.box(x - 0.035, ly + 0.08, lz - 0.035, x + 0.035, ly + 0.105, lz + 0.035, gold);
      g.box(x - 0.03, ly - 0.115, lz - 0.03, x + 0.03, ly - 0.09, lz + 0.03, gold);
    }
  }

  function gate(g, T, x, y) {
    const cx = x + 0.5, z = y + 0.7;
    const stoneGate = T === TH.forest || T === TH.cave || T === TH.desert;
    const col = stoneGate ? hx(T.stone) : hx(T.col), wood = hx(T.wood), gold = hx(T.gold || '#d8b048'), base = hx(T.base);
    for (const s of [-1, 1]) {
      g.box(cx + s * 0.5 - 0.11, -0.05, z - 0.11, cx + s * 0.5 + 0.11, 0.18, z + 0.11, mulc(base, 0.85), base);
      g.limb([cx + s * 0.5, 0.15, z], [cx + s * 0.5, 1.72, z], 0.075, 0.065, 8, col, mulc(col, 1.1));
    }
    g.box(cx - 0.78, 1.38, z - 0.07, cx + 0.78, 1.5, z + 0.07, wood);
    g.box(cx - 0.66, 1.08, z - 0.055, cx + 0.66, 1.16, z + 0.055, col);
    g.em = 0.55; g.box(cx - 0.2, 1.17, z + 0.0, cx + 0.2, 1.37, z + 0.07, gold); g.em = 0;
    g.roof(cx - 0.95, z - 0.26, cx + 0.95, z + 0.26, 1.52, 1.8, 0.16, stoneGate ? ['#7a7a70', '#5a5a52', '#2e2e2a'] : T.roof, T);
  }

  // =====================================================================
  //  ĐỊA HÌNH
  // =====================================================================
  function field(M, T) {
    const t = M.tiles;
    const at = (x, y) => (y >= 0 && y < ROWS && x >= 0 && x < COLS ? t[y][x] : '#');
    // tường viền: '#' nối ra mép bản đồ
    const solid = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
    const q = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ((x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) && t[y][x] === '#') { solid[y][x] = true; q.push([x, y]); }
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && !solid[ny][nx] && t[ny][nx] === '#') { solid[ny][nx] = true; q.push([nx, ny]); } } }
    const isSolid = (x, y) => (y < 0 || y >= ROWS || x < 0 || x >= COLS ? true : solid[y][x]);
    const isWater = (ch) => ch === '~';
    // cầu: ô đi được kẹp giữa nước (≤ 3 ô)
    const deck = new Set(), deckDir = {};
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = t[y][x]; if (ch !== '.' && ch !== ',') continue;
      const scan = (dx, dy) => { for (let k = 1; k <= 3; k++) { const c = at(x + dx * k, y + dy * k); if (isWater(c)) return k; if (c !== '.' && c !== ',') return 0; } return 0; };
      const l = scan(-1, 0), r = scan(1, 0), u = scan(0, -1), d = scan(0, 1);
      if (l && r && l + r <= 4) { deck.add(x + ',' + y); deckDir[x + ',' + y] = 'ns'; }
      else if (u && d && u + d <= 4) { deck.add(x + ',' + y); deckDir[x + ',' + y] = 'ew'; }
    }
    const cls = (x, y) => { x = Math.max(0, Math.min(COLS - 1, x)); y = Math.max(0, Math.min(ROWS - 1, y)); const ch = t[y][x]; if (ch === '~' || deck.has(x + ',' + y)) return 2; if (ch === 'W') return 3; return 0; };
    // ô biên (không rắn, có hàng xóm rắn) để đo khoảng cách
    const edge = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!solid[y][x]) { let nb = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (isSolid(x + dx, y + dy)) nb = true; if (nb) edge.push([x, y]); }
    function dist(x, z) {
      const tx = Math.floor(x), tz = Math.floor(z);
      if (!isSolid(tx, tz)) return 0;
      let best = 1e9;
      for (const [ex, ez] of edge) { const dx = Math.max(ex - x, 0, x - ex - 1), dz = Math.max(ez - z, 0, z - ez - 1); const d = dx * dx + dz * dz; if (d < best) best = d; }
      return Math.sqrt(best);
    }
    function solidH(x, z, d) {
      const n1 = fbm(x * 0.35 + 3, z * 0.35 + 7), n2 = fbm(x * 0.13 + 11, z * 0.13);
      const att = 1 - 0.8 * s01((z - (ROWS - 1.6)) / 0.8);
      if (T.style === 'cloud') return d < 1.0 ? 0 : -6 * s01((d - 1.0) / 1.4);
      if (T.style === 'wall') { if (d < 1.05) return 0; return ((d - 1.05) * 0.4 * (0.4 + n1) + 2.4 * s01((d - 3) / 6) * n2) * att; }
      const dj = Math.max(0, d + (fbm(x * 1.7, z * 1.7) - 0.5) * 0.45 * s01(d / 0.25));
      let h = 1.15 * s01(dj / 0.55) + Math.max(0, dj - 0.55) * (0.42 + 0.75 * n1) + 3.4 * s01((dj - 2.5) / 5) * n2;
      h += (n1 - 0.5) * 0.3 * s01(dj);
      if (T === TH.cave) h *= 1.3;
      return h * att;
    }
    function hgt(x, z) {
      const d = dist(x, z);
      const fx = x - 0.5, fz = z - 0.5, x0 = Math.floor(fx), z0 = Math.floor(fz), tx = sm(fx - x0), tz = sm(fz - z0);
      let ww = 0, ws = 0;
      const add = (xx, zz, k) => { const c = cls(xx, zz); if (c === 2) ww += k; else if (c === 3) ws += k; };
      add(x0, z0, (1 - tx) * (1 - tz)); add(x0 + 1, z0, tx * (1 - tz)); add(x0, z0 + 1, (1 - tx) * tz); add(x0 + 1, z0 + 1, tx * tz);
      const hw = -0.42 * s01((ww - 0.28) / 0.55) - 0.13 * s01((ws - 0.28) / 0.55);
      if (d <= 0) return hw;
      return solidH(x, z, d) + hw * (1 - s01(d / 0.3));
    }
    return { solid, isSolid, deck, deckDir, dist, hgt, at };
  }

  function terrain(F, T) {
    const lines = (a, b, i0, i1) => { const o = []; let v = a; while (v < b - 1e-6) { o.push(Math.round(v * 1000) / 1000); v += v >= i0 - 1e-6 && v < i1 - 1e-6 ? 0.25 : v < i0 - 6 || v > i1 + 6 ? 2 : 1; } o.push(b); return o; };
    const xs = lines(-12, COLS + 12, -1, COLS + 1), zs = lines(-14, ROWS + 4, -1, ROWS + 1);
    const nx = xs.length, nz = zs.length;
    const Hh = new Float32Array(nx * nz);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) Hh[j * nx + i] = F.hgt(xs[i], zs[j]);
    const grass = hx(T.grass), grass2 = hx(T.grass2), rockc = hx(T.rock), peak = hx(T.peak);
    const out = new Float32Array(nx * nz * 12);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const x = xs[i], z = zs[j], h = Hh[j * nx + i];
      const i0 = Math.max(0, i - 1), i1 = Math.min(nx - 1, i + 1), j0 = Math.max(0, j - 1), j1 = Math.min(nz - 1, j + 1);
      const dhx = (Hh[j * nx + i1] - Hh[j * nx + i0]) / (xs[i1] - xs[i0]), dhz = (Hh[j1 * nx + i] - Hh[j0 * nx + i]) / (zs[j1] - zs[j0]);
      const n = nrm([-dhx, 1, -dhz]);
      const slope = 1 - n[1], nz1 = fbm(x * 0.6, z * 0.6);
      let c = mixc(grass, grass2, s01((nz1 - 0.35) * 2.2));
      c = mixc(c, mixc(rockc, mulc(rockc, 0.75), fbm(x * 2, z * 2)), s01((slope - 0.18) / 0.3));
      if (T.snowy) c = mixc(c, peak, s01((n[1] - 0.72) / 0.12));
      else c = mixc(c, peak, s01((h - 3.6) / 1.4) * s01((n[1] - 0.6) / 0.2));
      if (T.style === 'cloud' && h > -0.05) c = mixc(hx('#f6f2fc'), hx('#e6dcf2'), nz1 * 0.6);
      if (T.style === 'wall' && h <= 0.02 && F.dist(x, z) > 0) c = hx('#8a8272');
      const inside = x >= 0 && x <= COLS && z >= 0 && z <= ROWS;
      const d = F.dist(x, z);
      let tw = 0;
      if (inside) {
        if (d <= 0) tw = 1;
        else if (T.style === 'mount') tw = 1 - s01((h - 0.02) / 0.22);
      }
      out.set([x, h, z, n[0], n[1], n[2], c[0], c[1], c[2], 0, 0, tw], (j * nx + i) * 12);
    }
    const idx = new Uint16Array((nx - 1) * (nz - 1) * 6);
    let k = 0;
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    return { v: out, i: idx };
  }

  // =====================================================================
  //  DỰNG TOÀN CẢNH
  // =====================================================================
  function build(M) {
    const T = TH[M.theme] || TH.city;
    const F = field(M, T);
    const g = new GB();
    const t = M.tiles, at = F.at;
    const walk = (ch) => ch === '.' || ch === ',' || ch === 'P';
    const used = new Set();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = t[y][x], seed = x * 31 + y * 17 + 5;
      if (ch === 'T') tree(g, T, x + 0.5 + (hi(x, y) - 0.5) * 0.18, 0, y + 0.6 + (hi(y, x) - 0.5) * 0.14, seed, 1.25 + hi(seed, 2) * 0.2, 1);
      else if (ch === '#' && !F.solid[y][x]) { // chướng ngại bên trong
        if (T.style === 'cloud') { // cột son rồng vàng
          const cx = x + 0.5, cz = y + 0.55, gold = hx(T.gold), red = hx(T.wall);
          g.limb([cx, -0.02, cz], [cx, 0.18, cz], 0.32, 0.24, 10, mulc(gold, 0.85), gold);
          g.limb([cx, 0.16, cz], [cx, 2.2, cz], 0.2, 0.19, 10, red, mulc(red, 1.15));
          for (const yy of [0.5, 1.2, 1.85]) g.limb([cx, yy, cz], [cx, yy + 0.08, cz], 0.215, 0.215, 10, gold);
          g.limb([cx, 2.2, cz], [cx, 2.34, cz], 0.2, 0.3, 10, gold, mulc(gold, 1.15));
          g.em = 0.6; g.sphere([cx, 2.46, cz], 0.13, 0.15, 0.13, gold, hx('#fff2b0'), 1, seed, 0); g.em = 0;
          cloudPuff(g, cx, 0.05, cz + 0.15, 0.7, seed);
        } else {
          rock(g, T, x + 0.45 + (hi(x, y) - 0.5) * 0.2, 0, y + 0.55, 0.5 + hi(seed, 1) * 0.12, seed, 1);
          rock(g, T, x + 0.2 + hi(seed, 3) * 0.6, 0, y + 0.85, 0.24 + hi(seed, 4) * 0.1, seed + 9, 0);
          if (T.glow && hi(seed, 5) > 0.4) crystal(g, x + 0.75, 0.1, y + 0.4, seed);
          if ((T === TH.forest || T === TH.river || T === TH.city) && hi(seed, 6) > 0.6) tree(g, Object.assign({}, T, { tree: 'pine' }), x + 0.3, 0.55, y + 0.4, seed, 0.38, 0);
        }
      } else if (ch === 'H' && !used.has(x + ',' + y)) {
        let tw = 1, thh = 1;
        if (t[y][x + 1] === 'H' && !used.has(x + 1 + ',' + y)) tw = 2;
        if (t[y + 1] && t[y + 1][x] === 'H' && (tw === 1 || t[y + 1][x + 1] === 'H')) thh = 2;
        for (let dy = 0; dy < thh; dy++) for (let dx = 0; dx < tw; dx++) used.add(x + dx + ',' + (y + dy));
        house(g, T, x, y, tw, thh);
      } else if (ch === 'P') gate(g, T, x, y);
      else if (ch === ',' || (ch === '.' && hi(seed, 8) > 0.82)) { // cỏ / nấm phát sáng
        const n = ch === ',' ? 6 : 2;
        for (let i = 0; i < n; i++) {
          const px = x + 0.08 + hi(seed, i) * 0.84, pz = y + 0.08 + hi(i + 3, seed) * 0.84;
          if (F.deck.has(x + ',' + y)) continue;
          if (T.glow) { g.em = 0.9; g.sphere([px, 0.03, pz], 0.035, 0.025, 0.035, hx('#3ad8c0'), hx('#c8fff0'), 0, seed + i, 0); g.em = 0; continue; }
          if (T.snowy || T === TH.desert) continue;
          const tc = hx(T.tuft), hh = 0.1 + hi(seed + i, 7) * 0.12;
          g.sw = [0, hh, 1];
          for (let k = 0; k < 3; k++) { const a = k * 2.1 + hi(i, k) * 1.2, dx = Math.cos(a) * 0.05, dz = Math.sin(a) * 0.05; const tip = (T === TH.heaven || hi(seed + i, k) > 0.85) ? hx(['#ffd6e6', '#fff2a0', '#ffffff'][k]) : mixc(tc, [1, 1, 0.8], 0.25); g.tri([px - dx * 0.5, 0, pz - dz * 0.5], [px + dx * 0.5, 0, pz + dz * 0.5], [px + dx * 1.5, hh, pz + dz * 0.8], null, null, [mulc(tc, 0.6), mulc(tc, 0.6), tip]); }
          g.sw = null;
        }
      } else if (ch === '~' && T.lily && hi(seed, 9) > 0.55) { // lá sen
        const px = x + 0.25 + hi(seed, 1) * 0.5, pz = y + 0.25 + hi(seed, 2) * 0.5, r = 0.13 + hi(seed, 3) * 0.06, lc = hx('#4a9a3a');
        for (let k = 0; k < 7; k++) { const a0 = (k / 8) * 6.28 + 0.4, a1 = ((k + 1) / 8) * 6.28 + 0.4; g.tri([px, WY + 0.012, pz], [px + Math.cos(a0) * r, WY + 0.008, pz + Math.sin(a0) * r], [px + Math.cos(a1) * r, WY + 0.008, pz + Math.sin(a1) * r], null, null, [mulc(lc, 1.15), lc, lc]); }
        if (hi(seed, 4) > 0.5) g.sphere([px + 0.03, WY + 0.05, pz], 0.05, 0.04, 0.05, hx('#ff8ab0'), hx('#fff0f6'), 0, seed, 0.1);
      }
    }
    // cầu gỗ
    const plank = hx('#8a5a32'), rail = hx('#6a3a1e');
    for (const key of F.deck) {
      const [x, y] = key.split(',').map(Number), ns = F.deckDir[key] === 'ns';
      for (let k = 0; k < 6; k++) {
        const c = mixc(plank, mulc(plank, 0.8), hi(x * 7 + k, y));
        if (ns) g.box(x - 0.02, -0.03, y + k / 6 + 0.008, x + 1.02, 0.025, y + (k + 1) / 6 - 0.008, mulc(c, 0.8), c);
        else g.box(x + k / 6 + 0.008, -0.03, y - 0.02, x + (k + 1) / 6 - 0.008, 0.025, y + 1.02, mulc(c, 0.8), c);
      }
      const sides = ns ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
      for (const [dx, dy] of sides) {
        const nb = at(x + dx, y + dy); if (nb !== '~') continue;
        if (ns) { const rx = dx < 0 ? x + 0.02 : x + 0.98; for (const p of [0.1, 0.5, 0.9]) g.box(rx - 0.03, 0, y + p - 0.03, rx + 0.03, 0.32, y + p + 0.03, rail); g.box(rx - 0.025, 0.26, y, rx + 0.025, 0.31, y + 1, mulc(rail, 1.2)); }
        else { const rz = dy < 0 ? y + 0.02 : y + 0.98; for (const p of [0.1, 0.5, 0.9]) g.box(x + p - 0.03, 0, rz - 0.03, x + p + 0.03, 0.32, rz + 0.03, rail); g.box(x, 0.26, rz - 0.025, x + 1, 0.31, rz + 0.025, mulc(rail, 1.2)); }
      }
    }
    // viền bản đồ theo phong cách
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (!F.solid[y][x]) continue;
      const nbW = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => { const c = at(x + dx, y + dy); return !F.isSolid(x + dx, y + dy) && c !== undefined; });
      const bottom = y === ROWS - 1, seed = x * 13 + y * 7;
      if (T.style === 'wall') {
        const stone = hx(T.stone), cap = hx('#4a5262');
        if (bottom) { if (nbW.length) { g.box(x, 0, y + 0.55, x + 1, 0.08, y + 0.75, mulc(stone, 0.8)); for (const p of [0.17, 0.5, 0.83]) g.box(x + p - 0.04, 0.05, y + 0.6, x + p + 0.04, 0.34, y + 0.7, stone); g.box(x, 0.3, y + 0.58, x + 1, 0.36, y + 0.72, mulc(stone, 1.08)); } continue; }
        const h = 1.2;
        g.box(x, -0.02, y, x + 1, 0.18, y + 1, mulc(stone, 0.7));
        g.box(x + 0.02, 0.18, y + 0.02, x + 0.98, h, y + 0.98, mixc(stone, mulc(stone, 0.85), hi(x, y)), mulc(stone, 0.75));
        for (let r = 1; r < 4; r++) { const yy = 0.18 + r * 0.25; g.box(x + 0.015, yy, y + 0.015, x + 0.985, yy + 0.015, y + 0.985, mulc(stone, 0.72)); }
        for (const [dx, dy] of nbW) { // lỗ châu mai phía trong
          for (const p of [0.25, 0.75]) {
            if (dy) { const zz = dy > 0 ? y + 0.86 : y + 0.02; g.box(x + p - 0.14, h, zz, x + p + 0.14, h + 0.2, zz + 0.12, mulc(stone, 0.95), cap); }
            else { const xx = dx > 0 ? x + 0.86 : x + 0.02; g.box(xx, h, y + p - 0.14, xx + 0.12, h + 0.2, y + p + 0.14, mulc(stone, 0.95), cap); }
          }
        }
        if (!nbW.length) continue;
        if (hi(x, y) > 0.7 && y > 0) { g.box(x + 0.44, h, y + 0.44, x + 0.56, h + 0.5, y + 0.56, hx('#5a2a18')); g.em = 0.5; g.box(x + 0.3, h + 0.28, y + 0.47, x + 0.44, h + 0.48, y + 0.53, hx('#d83020')); g.em = 0; }
      } else if (T.style === 'cloud') {
        const gold = hx(T.gold), mar = hx('#f6f2fc');
        if (!nbW.length) continue;
        for (const [dx, dy] of nbW) { // lan can ngọc
          if (dy) { const zz = dy > 0 ? y + 0.9 : y + 0.06; for (const p of [0.12, 0.5, 0.88]) g.box(x + p - 0.04, 0, zz - 0.04, x + p + 0.04, 0.4, zz + 0.04, mar, gold); g.box(x, 0.3, zz - 0.03, x + 1, 0.36, zz + 0.03, mar, gold); g.box(x, 0.1, zz - 0.02, x + 1, 0.14, zz + 0.02, mar); }
          else { const xx = dx > 0 ? x + 0.9 : x + 0.06; for (const p of [0.12, 0.5, 0.88]) g.box(xx - 0.04, 0, y + p - 0.04, xx + 0.04, 0.4, y + p + 0.04, mar, gold); g.box(xx - 0.03, 0.3, y, xx + 0.03, 0.36, y + 1, mar, gold); g.box(xx - 0.02, 0.1, y, xx + 0.02, 0.14, y + 1, mar); }
        }
        if (!bottom && (x + y) % 2 === 0 && nbW.length) { // cột son
          const cx = x + 0.5, cz = y + 0.5, red = hx(T.wall);
          g.limb([cx, 0, cz], [cx, 2.0, cz], 0.16, 0.15, 10, red, mulc(red, 1.15));
          for (const yy of [0.15, 1.0, 1.75]) g.limb([cx, yy, cz], [cx, yy + 0.07, cz], 0.175, 0.175, 10, gold);
          g.em = 0.6; g.sphere([cx, 2.12, cz], 0.14, 0.14, 0.14, gold, hx('#fff2b0'), 1, seed, 0); g.em = 0;
        }
      } else if (bottom && nbW.length) { // đá thấp ở mép dưới
        rock(g, T, x + 0.3 + hi(seed, 1) * 0.4, F.hgt(x + 0.5, y + 0.6), y + 0.65, 0.18 + hi(seed, 2) * 0.1, seed, 0);
      }
    }
    // cây/đá rải trên núi quanh bản đồ
    if (T.style !== 'cloud') {
      const dens = { forest: 0.85, river: 0.6, city: 0.5, snow: 0.6, cave: 0.35, desert: 0.18 }[M.theme] ?? 0.5;
      for (let gz = -9; gz < ROWS - 0.8; gz += 0.75) for (let gx = -7; gx < COLS + 7; gx += 0.75) {
        const x = gx + (hash(gx, gz) - 0.5) * 0.6, z = gz + (hash(gz + 3, gx) - 0.5) * 0.6;
        const d = F.dist(x, z); if (d < (T.style === 'wall' ? 1.4 : 0.62)) continue;
        if (x > 0.5 && x < COLS - 0.5 && z > 0.5 && z < ROWS - 0.5 && T.style === 'wall') continue;
        const h = F.hgt(x, z), hN = F.hgt(x + 0.3, z), hS = F.hgt(x, z + 0.3), sl = Math.hypot(hN - h, hS - h) / 0.3;
        if (sl > 1.2 || h > 5.5) continue;
        const r = hash(x * 3, z * 5), seed = Math.floor(x * 97 + z * 61);
        const far = d > 3.5 ? 0 : 1;
        if (r < dens) {
          if (T.glow) { if (r < dens * 0.4) crystal(g, x, h - 0.05, z, seed, 1.2); else tree(g, T, x, h - 0.05, z, seed, 0.9 + hash(z, x) * 0.6, 0); }
          else tree(g, T, x, h - 0.06, z, seed, 0.85 + hash(z, x) * 0.55, far);
        } else if (r < dens + 0.12) rock(g, T, x, h - 0.05, z, 0.2 + hash(x, z * 2) * 0.3, seed, 0);
      }
    } else {
      for (let i = 0; i < 26; i++) { const a = hi(i, 7) * 6.28; const side = i % 3; const x = side === 0 ? -0.8 - hi(i, 1) * 2.5 : side === 1 ? COLS + 0.8 + hi(i, 1) * 2.5 : hi(i, 2) * COLS; const z = side === 2 ? -0.8 - hi(i, 3) * 2.5 : hi(i, 3) * ROWS; cloudPuff(g, x, -0.6 + Math.sin(a) * 0.4, z, 1.1 + hi(i, 4) * 0.9, i * 11); }
    }
    // mặt nước
    let wx0 = 99, wz0 = 99, wx1 = -1, wz1 = -1;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (t[y][x] === '~' || t[y][x] === 'W' || F.deck.has(x + ',' + y)) { wx0 = Math.min(wx0, x); wz0 = Math.min(wz0, y); wx1 = Math.max(wx1, x + 1); wz1 = Math.max(wz1, y + 1); }
    const water = wx1 > 0 ? { rect: [Math.max(0, wx0 - 0.6), Math.max(0, wz0 - 0.6), Math.min(COLS, wx1 + 0.6), Math.min(ROWS, wz1 + 0.6)], y: WY, deep: hx(T.water[0]), shal: hx(T.water[1]), mode: T.water[2] } : null;
    // bản đồ độ sâu cho shader nước (bọt bờ, màu sâu/nông)
    const HC = document.createElement('canvas'); HC.width = COLS * 8; HC.height = ROWS * 8;
    const hctx = HC.getContext('2d'), img = hctx.createImageData(HC.width, HC.height);
    for (let py = 0; py < HC.height; py++) for (let px = 0; px < HC.width; px++) { const h = F.hgt((px + 0.5) / 8, (py + 0.5) / 8); const v = Math.max(0, Math.min(1, (WY - h) / 0.4)); const o = (py * HC.width + px) * 4; img.data[o] = v * 255; img.data[o + 1] = 0; img.data[o + 2] = 0; img.data[o + 3] = 255; }
    hctx.putImageData(img, 0, 0);
    const clouds = T.style === 'cloud' ? { y: -1.5, deep: hx('#b8aee0'), shal: hx('#ffffff'), mode: 3 } : null;
    return { key: M.name + '|' + M.theme, theme: M.theme, terrain: terrain(F, T), mesh: new Float32Array(g.d), water, clouds, depthTex: HC, cols: COLS, rows: ROWS, cloudShadow: T === TH.cave ? 0 : T.style === 'cloud' ? 0.1 : 0.22 };
  }

  // =====================================================================
  //  SÂN ĐẤU 3D (màn chiến đấu): đài đá tròn khảm Bát Quái, lư hương,
  //  cờ phướn, cảnh nền theo vùng (chùa tháp, rừng, sông, mây, hang, tuyết, núi lửa)
  // =====================================================================
  const AR = {
    city: { top: '#4f94e0', bot: '#d8eaf6', cloud: '#ffffff', stone: ['#ddd2bc', '#b8a888', '#8a6a3a'], rim: '#9a3a2a', flag: '#c8302a', sunG: [1.0, 0.92, 0.7] },
    arena: { top: '#4a88d4', bot: '#ecead8', cloud: '#fff8ec', stone: ['#e2c08a', '#b88a52', '#8a2a22'], rim: '#8a2a22', flag: '#d4a53c', sunG: [1.0, 0.86, 0.6] },
    forest: { top: '#4c9ad6', bot: '#d6ecec', cloud: '#ffffff', stone: ['#c8c8b0', '#9a9a80', '#5a6a3a'], rim: '#5a4a2e', flag: '#3a7a3a', sunG: [1.0, 0.95, 0.75] },
    river: { top: '#479ee4', bot: '#d8eef6', cloud: '#ffffff', stone: ['#d4dcd4', '#a8b4ac', '#3a6a7a'], rim: '#3a5a6a', flag: '#2a7a9a', sunG: [1.0, 0.95, 0.8] },
    heaven: { top: '#a88ff0', bot: '#fff2f6', cloud: '#fff8fc', stone: ['#fdfaff', '#e6dcf4', '#d8b048'], rim: '#c8302a', flag: '#e8c45a', sunG: [1.0, 0.9, 0.8] },
    cave: { top: '#16102a', bot: '#4a3a6e', cloud: '#7a6aa8', stone: ['#7a6e8e', '#5a4e6e', '#7ad8c8'], rim: '#3a2e4e', flag: '#6a3aa8', sunG: [0.3, 0.25, 0.5] },
    snow: { top: '#86b6e8', bot: '#f6faff', cloud: '#ffffff', stone: ['#f2f6fa', '#c8d4e2', '#6a88b0'], rim: '#5a6a8a', flag: '#2a5a9a', sunG: [1.0, 0.97, 0.9] },
    desert: { top: '#e2864a', bot: '#ffe4b8', cloud: '#fff0dc', stone: ['#ecc896', '#c8945a', '#a0582e'], rim: '#7a3a1e', flag: '#c8401e', sunG: [1.0, 0.75, 0.4] },
  };
  const ARENA_R = 6.6;
  function mosaic(A) {
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d'), m = S / 2;
    const [s0, s1, ln] = A.stone;
    let gr = x.createRadialGradient(m, m, 10, m, m, m); gr.addColorStop(0, s0); gr.addColorStop(0.8, s0); gr.addColorStop(1, s1);
    x.fillStyle = gr; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) { const a = hi(i, 3) * 6.283, r = Math.sqrt(hi(i, 5)) * m; x.fillStyle = hi(i, 7) > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'; x.fillRect(m + Math.cos(a) * r, m + Math.sin(a) * r, 2 + hi(i, 9) * 4, 2 + hi(i, 9) * 3); }
    x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 2;
    for (const rr of [0.36, 0.62]) { x.beginPath(); x.arc(m, m, m * rr, 0, 7); x.stroke(); }
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283; x.beginPath(); x.moveTo(m + Math.cos(a) * m * 0.36, m + Math.sin(a) * m * 0.36); x.lineTo(m + Math.cos(a) * m * 0.62, m + Math.sin(a) * m * 0.62); x.stroke(); }
    for (let i = 0; i < 40; i++) { const a = (i / 40) * 6.283; x.beginPath(); x.moveTo(m + Math.cos(a) * m * 0.62, m + Math.sin(a) * m * 0.62); x.lineTo(m + Math.cos(a) * m * 0.97, m + Math.sin(a) * m * 0.97); x.stroke(); }
    x.strokeStyle = ln; x.lineWidth = 7; x.globalAlpha = 0.85;
    for (const rr of [0.16, 0.4, 0.94]) { x.beginPath(); x.arc(m, m, m * rr, 0, 7); x.stroke(); }
    x.lineWidth = 3; for (const rr of [0.43, 0.9]) { x.beginPath(); x.arc(m, m, m * rr, 0, 7); x.stroke(); }
    // bát quái
    const TRI = [[1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1], [1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]];
    x.fillStyle = ln;
    for (let i = 0; i < 8; i++) {
      x.save(); x.translate(m, m); x.rotate((i / 8) * 6.283 + Math.PI / 2); x.translate(0, -m * 0.76);
      TRI[i].forEach((solid, k) => { const y = -18 + k * 14, w = 58; if (solid) x.fillRect(-w / 2, y, w, 8); else { x.fillRect(-w / 2, y, w * 0.42, 8); x.fillRect(w * 0.08, y, w * 0.42, 8); } });
      x.restore();
    }
    // âm dương
    const r = m * 0.14; x.globalAlpha = 0.9;
    x.fillStyle = s0; x.beginPath(); x.arc(m, m, r, 0, 7); x.fill();
    x.fillStyle = ln; x.beginPath(); x.arc(m, m, r, -Math.PI / 2, Math.PI / 2); x.arc(m, m + r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true); x.arc(m, m - r / 2, r / 2, Math.PI / 2, -Math.PI / 2, false); x.fill();
    x.fillStyle = s0; x.beginPath(); x.arc(m, m + r / 2, r * 0.15, 0, 7); x.fill();
    x.fillStyle = ln; x.beginPath(); x.arc(m, m - r / 2, r * 0.15, 0, 7); x.fill();
    return c;
  }
  // pháp trận phát sáng (dùng làm decal dưới chân khi thi triển)
  let sigilC = null;
  function sigil() {
    if (sigilC) return sigilC;
    const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), m = S / 2;
    x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 6;
    x.lineWidth = 5; x.beginPath(); x.arc(m, m, m * 0.94, 0, 7); x.stroke();
    x.lineWidth = 2; x.beginPath(); x.arc(m, m, m * 0.84, 0, 7); x.stroke(); x.beginPath(); x.arc(m, m, m * 0.5, 0, 7); x.stroke();
    for (let i = 0; i < 2; i++) { x.beginPath(); for (let k = 0; k <= 3; k++) { const a = (k / 3) * 6.283 + i * Math.PI / 3 - Math.PI / 2; const px = m + Math.cos(a) * m * 0.82, py = m + Math.sin(a) * m * 0.82; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
    x.font = 'bold 15px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const G = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; x.save(); x.translate(m + Math.cos(a) * m * 0.89, m + Math.sin(a) * m * 0.89); x.rotate(a + Math.PI / 2); x.fillText(G[i % 8], 0, 0); x.restore(); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; x.beginPath(); x.arc(m + Math.cos(a) * m * 0.5, m + Math.sin(a) * m * 0.5, 5, 0, 7); x.fill(); }
    x.lineWidth = 3; x.beginPath(); x.arc(m, m, m * 0.18, 0, 7); x.stroke();
    return (sigilC = c);
  }

  function pagoda(g, T, cx, cz, lv, k) {
    const red = hx(T.col), wall = hx(T.wall), gold = hx(T.gold || '#d8b048'), base = hx(T.base);
    g.box(cx - 2.2 * k, -0.5, cz - 2.2 * k, cx + 2.2 * k, 0.4 * k, cz + 2.2 * k, mulc(base, 0.8), base);
    let y = 0.4 * k;
    for (let i = 0; i < lv; i++) {
      const w = (1.55 - i * 0.22) * k, h = (i ? 0.9 : 1.3) * k;
      g.box(cx - w, y, cz - w, cx + w, y + h, cz + w, wall);
      for (const sx of [-1, -0.33, 0.33, 1]) g.limb([cx + sx * w, y, cz + w + 0.05 * k], [cx + sx * w, y + h, cz + w + 0.05 * k], 0.07 * k, 0.07 * k, 6, red, red, false);
      g.box(cx - w - 0.06 * k, y + h - 0.16 * k, cz - w - 0.06 * k, cx + w + 0.06 * k, y + h, cz + w + 0.06 * k, hx(T.wood));
      g.em = i === 0 ? 0 : 0.35; g.box(cx - 0.25 * k, y + h * 0.3, cz + w, cx + 0.25 * k, y + h * 0.75, cz + w + 0.03 * k, i === 0 ? mulc(hx(T.wood), 1.3) : hx('#ffd27a')); g.em = 0;
      y += h;
      const ov = 0.6 * k;
      g.roof(cx - w - ov, cz - w - ov, cx + w + ov, cz + w + ov, y, y + (0.55 + w * 0.12) * k, 0.32 * k, T.roof, T, true);
      y += 0.3 * k;
    }
    g.limb([cx, y + 0.2 * k, cz], [cx, y + 1.4 * k, cz], 0.07 * k, 0.03 * k, 6, gold);
    for (let i = 0; i < 3; i++) g.sphere([cx, y + (0.45 + i * 0.28) * k, cz], 0.13 * k * (1 - i * 0.2), 0.06 * k, 0.13 * k * (1 - i * 0.2), gold, mulc(gold, 1.2), 0, i, 0);
  }

  function arena(theme) {
    const key = theme;
    const A = AR[theme] || AR.city;
    const T = TH[theme === 'arena' ? 'city' : theme] || TH.city;
    const g = new GB();
    const R = ARENA_R, lamps = [];
    const cloudy = theme === 'heaven';
    // ---- địa hình nền ----
    const water = theme === 'river' ? { z0: -14, z1: -9 } : null;
    const hgt = (x, z) => {
      const dz = Math.max(0, -z - 9), dx = Math.max(0, Math.abs(x) - 12);
      const n1 = fbm(x * 0.09 + 5, z * 0.09 + 2), n2 = fbm(x * 0.035 + 1, z * 0.035 + 9), n3 = fbm(x * 0.3, z * 0.3);
      let h = -0.45 + (n3 - 0.5) * 0.25 * s01((Math.hypot(x, z) - R - 1.5) / 3);
      h += s01((dx - 2) / 12) * (1.5 + 4 * n1) + s01((dz - 8) / 18) * (0.8 + 2.6 * n1);
      const ridge = 0.55 + 0.45 * Math.abs(Math.sin(x * 0.06 + n2 * 4));
      h += s01((-z - 50) / 30) * (9 + 24 * n2) * ridge;
      if (theme === 'cave') h += s01((dx - 0) / 4) * 9 * (0.5 + n1) + s01((dz - 3) / 8) * 7 * (0.5 + n1);
      if (theme === 'desert') { for (const [mx, mz, mr, mh] of [[-14, -26, 5, 5], [13, -30, 6, 7], [-2, -44, 8, 9], [24, -20, 4, 4]]) { const d = Math.hypot(x - mx, (z - mz) * 1.2) + (n3 - 0.5) * 1.5; h = Math.max(h, -0.45 + mh * s01((mr - d) / 0.8)); } }
      if (water) { const w = s01((z - water.z0) / 1.2) * s01((water.z1 - z) / 1.2); h = h * (1 - w) + (-1.1) * w; }
      if (theme === 'desert') { for (const [px, pz] of [[-6, -13], [7, -15]]) { const d = Math.hypot(x - px, (z - pz) * 1.3); h = Math.min(h, -0.45 - 0.6 * s01((2.6 - d) / 1.2)); } }
      if (theme === 'snow') { const d = Math.hypot(x * 0.5, z + 11); h = Math.min(h, -0.45 - 0.35 * s01((5 - d) / 1.5)); }
      return h;
    };
    // lưới địa hình
    const xs = [], zs = []; for (let v = -70; v <= 70; v += v > -20 && v < 20 ? 0.75 : 2.5) xs.push(v); for (let v = -90; v <= 26; v += v > -24 && v < 14 ? 0.75 : 2.5) zs.push(v);
    let terrainOut = null;
    if (!cloudy) {
      const nx = xs.length, nz = zs.length, Hh = new Float32Array(nx * nz);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) Hh[j * nx + i] = hgt(xs[i], zs[j]);
      const grass = hx(T.grass), grass2 = hx(T.grass2), rockc = hx(T.rock), peak = hx(T.peak);
      const v = new Float32Array(nx * nz * 12);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const x = xs[i], z = zs[j], h = Hh[j * nx + i];
        const i0 = Math.max(0, i - 1), i1 = Math.min(nx - 1, i + 1), j0 = Math.max(0, j - 1), j1 = Math.min(nz - 1, j + 1);
        const n = nrm([-(Hh[j * nx + i1] - Hh[j * nx + i0]) / (xs[i1] - xs[i0]), 1, -(Hh[j1 * nx + i] - Hh[j0 * nx + i]) / (zs[j1] - zs[j0])]);
        const slope = 1 - n[1], q = fbm(x * 0.4, z * 0.4);
        let c = mixc(grass, grass2, s01((q - 0.35) * 2.2));
        c = mixc(c, mixc(rockc, mulc(rockc, 0.75), fbm(x, z)), s01((slope - 0.2) / 0.28));
        c = mixc(c, peak, T.snowy ? s01((n[1] - 0.7) / 0.15) : s01((h - 9) / 5) * s01((n[1] - 0.55) / 0.2));
        if (water && h < -0.7) c = mixc(c, hx('#6a6a50'), 0.6);
        v.set([x, h, z, n[0], n[1], n[2], c[0], c[1], c[2], 0, 0, 0], (j * nx + i) * 12);
      }
      const idx = new Uint16Array((nx - 1) * (nz - 1) * 6); let k = 0;
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d; }
      terrainOut = { v, i: idx };
    } else terrainOut = { v: new Float32Array(12 * 3), i: new Uint16Array([0, 1, 2]) };
    // ---- đài đấu ----
    const [s0, s1] = A.stone.map(hx), rim = hx(A.rim), gold = hx(T.gold || '#d8b048');
    const N = 56, ring = (r, y) => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
    const top = ring(R, 0), lip = ring(R, -0.3), st = ring(R + 0.55, -0.3), stB = ring(R + 0.55, -0.62), st2 = ring(R + 1.05, -0.62), st2B = ring(R + 1.05, cloudy ? -2.2 : -0.9);
    g.tw = 1; for (let i = 0; i < N; i++) g.tri([0, 0, 0], top[i], top[(i + 1) % N], s0, null); g.tw = 0;
    const band = (A0, B0, col, ctr) => { for (let i = 0; i < N; i++) { const j = (i + 1) % N; g.quad(A0[i], A0[j], B0[j], B0[i], col, ctr); } };
    band(top, lip, rim, [0, -5, 0]);
    g.tw = 0; for (let i = 0; i < N; i++) { const j = (i + 1) % N; g.quad(lip[i], lip[j], st[j], st[i], mulc(s1, 0.95), null); }
    band(st, stB, mulc(s1, 0.75), [0, -5, 0]);
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; g.quad(stB[i], stB[j], st2[j], st2[i], mulc(s1, 0.85), null); }
    band(st2, st2B, mulc(s1, 0.6), [0, -8, 0]);
    // viền vàng trên mép đài
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; const a = [top[i][0] * 1.002, 0.012, top[i][2] * 1.002], b = [top[j][0] * 1.002, 0.012, top[j][2] * 1.002]; g.quad(a, b, [b[0], -0.06, b[2]], [a[0], -0.06, a[2]], gold, [0, -1, 0]); }
    // lư hương / đèn đá + cờ phướn ở nửa sau
    const posts = [200, 235, 270, 305, 340];
    for (const deg of posts) {
      const a = deg * Math.PI / 180, x = Math.cos(a) * (R + 0.8), z = Math.sin(a) * (R + 0.8);
      if (cloudy) { g.limb([x, -0.62, z], [x, 0.8, z], 0.1, 0.1, 8, hx('#f6f2fc'), gold); g.em = 1; g.sphere([x, 0.95, z], 0.16, 0.18, 0.16, hx('#ffd27a'), hx('#fffbe0'), 1, deg, 0.1); g.em = 0; lamps.push([x, 1.0, z]); continue; }
      g.box(x - 0.2, -0.62, z - 0.2, x + 0.2, -0.45, z + 0.2, mulc(s1, 0.7), s1);
      g.limb([x, -0.45, z], [x, 0.75, z], 0.12, 0.09, 8, mulc(s1, 0.8), s1);
      g.limb([x, 0.72, z], [x, 0.98, z], 0.1, 0.28, 8, mulc(rim, 0.9), rim);
      g.em = 1; g.sphere([x, 1.05, z], 0.18, 0.2, 0.18, hx('#ff7a1a'), hx('#fff0a0'), 1, deg, 0.15); g.em = 0;
      lamps.push([x, 1.15, z]);
    }
    for (const sx of [-1, 1]) { // cột cờ
      const x = sx * (R + 2.4), z = -2.6;
      g.limb([x, -0.6, z], [x, 4.6, z], 0.07, 0.05, 6, hx(T.wood));
      g.sphere([x, 4.7, z], 0.12, 0.12, 0.12, gold, mulc(gold, 1.2), 1, sx + 3, 0);
      const fc = hx(A.flag);
      g.sw = [2.0, 2.5, 1.6];
      for (let k = 0; k < 6; k++) { const y0 = 4.4 - k * 0.42, y1 = y0 - 0.42, w0 = 0.62, xo = -sx * 0.06; g.quad([x + xo, y0, z], [x + xo - sx * w0, y0, z], [x + xo - sx * w0, y1, z], [x + xo, y1, z], k % 2 ? fc : mulc(fc, 0.9), [x, y0, z - 1]); }
      g.sw = null;
      g.box(x - sx * 0.02 - (sx > 0 ? 0.66 : 0), 4.38, z - 0.02, x - sx * 0.02 + (sx < 0 ? 0.66 : 0), 4.46, z + 0.02, gold);
    }
    // ---- cảnh nền ----
    const place = (fn, n, area, seed) => { for (let i = 0; i < n; i++) { const x = area[0] + hash(i, seed) * (area[1] - area[0]), z = area[2] + hash(seed, i) * (area[3] - area[2]); if (Math.hypot(x, z) < R + 2.2 || (z > -10 && Math.abs(x) < R + 4.5)) continue; fn(x, hgt(x, z), z, i); } };
    if (theme === 'city' || theme === 'arena') {
      pagoda(g, T, 0, -24, 5, 1.5);
      g.sc = 2.2; g.off = [-16, hgt(-15, -15) + 0.1, -16]; house(g, T, 0, 0, 2, 2); g.off = [11, hgt(12, -16) + 0.1, -17]; house(g, T, 0, 0, 2, 2); g.off = [0, 0, 0]; g.sc = 1;
      // tường thành xa
      const stone = hx(T.stone);
      for (let x = -40; x < 40; x += 2) { if (Math.abs(x) < 7) continue; const z = -30, h = hgt(x, z); g.box(x, h - 0.5, z, x + 2, h + 1.8, z + 1.2, mulc(stone, 0.9), mulc(stone, 0.7)); for (const p of [0.25, 1.25]) g.box(x + p, h + 1.8, z + 0.9, x + p + 0.5, h + 2.2, z + 1.2, stone); }
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 7 + 3, 1.6 + hash(i, 3) * 0.8, 1), 16, [-20, 20, -16, -6], 11);
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 5 + 1, 1.5 + hash(i, 4) * 0.6, 1), 10, [-18, 18, -5, 6], 12);
    } else if (theme === 'forest') {
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 7 + 3, 1.7 + hash(i, 3) * 1.1, i < 30 ? 1 : 0), 70, [-26, 26, -26, -5], 21);
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 5 + 1, 1.6 + hash(i, 4) * 0.9, 1), 26, [-22, 22, -5, 8], 22);
      place((x, y, z, i) => rock(g, T, x, y, z, 0.4 + hash(i, 2) * 0.6, i, 1), 14, [-16, 16, -12, 6], 23);
      g.sc = 1.6; g.off = [-1.5 * 1.6 + 0.8, hgt(0, -15) + 0.05, -15]; gate(g, T, 0, 0); g.off = [0, 0, 0]; g.sc = 1;
    } else if (theme === 'river') {
      place((x, y, z, i) => tree(g, Object.assign({}, T, { tree: i % 3 ? 'willow' : 'broad' }), x, y - 0.05, z, i * 7 + 3, 1.6 + hash(i, 3) * 0.7, 1), 22, [-24, 24, -8.6, -5], 31);
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 5 + 1, 1.8 + hash(i, 4) * 0.8, 0), 34, [-30, 30, -24, -14.5], 32);
      place((x, y, z, i) => rock(g, T, x, y, z, 0.35 + hash(i, 2) * 0.5, i, 1), 10, [-14, 14, -8, 6], 33);
      g.sc = 1.8; g.off = [12, hgt(13, -18) + 0.1, -19]; house(g, T, 0, 0, 2, 2); g.off = [0, 0, 0]; g.sc = 1;
      pagoda(g, T, -13, -22, 3, 1.1);
    } else if (theme === 'heaven') {
      // cổng trời + cột son + mây
      g.sc = 3.0; g.off = [0, -0.6, -13 - 0.7 * 3]; gate(g, T, -0.5, 0); g.off = [0, 0, 0]; g.sc = 1;
      const red = hx(T.wall);
      for (let i = 0; i < 8; i++) { const a = Math.PI * (1.08 + (i / 7) * 0.84), x = Math.cos(a) * 10.5, z = Math.sin(a) * 8 - 3; g.limb([x, -3, z], [x, 4.4, z], 0.32, 0.3, 10, red, mulc(red, 1.15)); for (const yy of [-0.2, 2.6, 4.0]) g.limb([x, yy, z], [x, yy + 0.16, z], 0.35, 0.35, 10, gold); g.em = 0.6; g.sphere([x, 4.75, z], 0.3, 0.3, 0.3, gold, hx('#fff2b0'), 1, i, 0); g.em = 0; cloudPuff(g, x, -1.2, z + 0.4, 1.6, i * 7); }
      for (let i = 0; i < 30; i++) { const x = (hi(i, 1) - 0.5) * 60, z = -6 - hi(i, 2) * 40, y = -2.5 + hi(i, 3) * 3 + (z < -25 ? 4 : 0); if (Math.abs(x) < 7 && z > -12) continue; cloudPuff(g, x, y, z, 2 + hi(i, 4) * 3, i * 13); }
      for (const [x, z, s] of [[-15, -20, 1.4], [16, -24, 1.7], [-26, -38, 2.2]]) { // đảo bay
        g.sphere([x, 1.2 * s, z], 2.2 * s, 0.6 * s, 2 * s, hx('#c8bce0'), hx('#f4eefc'), 1, x, 0.15); g.limb([x, 0.9 * s, z], [x, -2.5 * s, z], 1.9 * s, 0.1, 8, hx('#a89ac8'), hx('#6a5a8a'));
        tree(g, T, x - 0.5 * s, 1.5 * s, z, Math.round(x * 3), 1.3 * s, 1); g.sc = 0.9 * s; g.off = [x + 0.3 * s, 1.55 * s, z - 0.6 * s]; house(g, T, 0, 0, 1, 1); g.off = [0, 0, 0]; g.sc = 1;
      }
    } else if (theme === 'cave') {
      place((x, y, z, i) => crystal(g, x, y - 0.05, z, i, 2 + hash(i, 3) * 2), 20, [-16, 16, -18, 6], 41);
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 5 + 1, 1.5 + hash(i, 4) * 1.2, 1), 18, [-16, 16, -16, 6], 42);
      place((x, y, z, i) => { const h = 2 + hash(i, 5) * 5; g.limb([x, y - 0.2, z], [x + (hash(i, 6) - 0.5), y + h, z], 0.5 + h * 0.12, 0, 7, hx('#3e3250'), hx('#6a5a7e')); }, 26, [-18, 18, -22, 6], 43);
      for (const sx of [-1, 1]) { g.limb([sx * 6.5, -0.6, -4], [sx * 6.5, 1.6, -4], 0.1, 0.08, 6, hx('#5a3a20')); g.em = 1; g.sphere([sx * 6.5, 1.75, -4], 0.2, 0.26, 0.2, hx('#ff8a1a'), hx('#fff0a0'), 1, sx + 9, 0.2); g.em = 0; lamps.push([sx * 6.5, 1.8, -4]); }
    } else if (theme === 'snow') {
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 7 + 3, 1.8 + hash(i, 3) * 1.2, i < 30 ? 1 : 0), 60, [-26, 26, -28, -6], 51);
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 5 + 1, 1.6 + hash(i, 4) * 0.8, 1), 18, [-22, 22, -6, 8], 52);
      place((x, y, z, i) => rock(g, T, x, y, z, 0.4 + hash(i, 2) * 0.7, i, 1), 12, [-16, 16, -12, 6], 53);
      g.sc = 1.8; g.off = [-15, hgt(-14, -14) + 0.1, -15]; house(g, T, 0, 0, 2, 2); g.off = [0, 0, 0]; g.sc = 1;
    } else if (theme === 'desert') {
      place((x, y, z, i) => tree(g, T, x, y - 0.05, z, i * 7 + 3, 1.4 + hash(i, 3) * 0.8, 1), 16, [-22, 22, -20, 6], 61);
      place((x, y, z, i) => rock(g, T, x, y, z, 0.5 + hash(i, 2) * 0.9, i, 1), 24, [-22, 22, -20, 6], 62);
      pagoda(g, T, 9, -21, 2, 1.2);
    }
    const water2 = water ? { rect: [-60, water.z0 - 2, 60, water.z1 + 2], y: -0.62, deep: hx(T.water[0]), shal: hx(T.water[1]), mode: 0 } :
      theme === 'desert' ? { rect: [-12, -19, 13, -9], y: -0.6, deep: hx(T.water[0]), shal: hx(T.water[1]), mode: 1 } :
      theme === 'snow' ? { rect: [-12, -16, 12, -6], y: -0.55, deep: hx(T.water[0]), shal: hx(T.water[1]), mode: 2 } : null;
    // bản đồ độ sâu nước
    const DR = [-30, -30, 60, 40], HC = document.createElement('canvas'); HC.width = 240; HC.height = 160;
    const hc = HC.getContext('2d'), img = hc.createImageData(240, 160);
    if (water2 && !cloudy) for (let py = 0; py < 160; py++) for (let px = 0; px < 240; px++) { const x = DR[0] + ((px + 0.5) / 240) * DR[2], z = DR[1] + ((py + 0.5) / 160) * DR[3]; const v = Math.max(0, Math.min(1, (water2.y - hgt(x, z)) / 0.5)); const o = (py * 240 + px) * 4; img.data[o] = v * 255; img.data[o + 3] = 255; }
    hc.putImageData(img, 0, 0);
    return {
      key: 'arena|' + key, theme, terrain: terrainOut, mesh: new Float32Array(g.d), water: water2, clouds: cloudy ? { y: -1.6, deep: hx('#b8aee0'), shal: hx('#ffffff'), mode: 3, B: 120 } : null,
      depthTex: HC, depthRect: DR, cloudShadow: theme === 'cave' ? 0 : 0.25, shadowBox: [-12, 12, -1.5, 9, -12, 9],
      mosaic: mosaic(A), groundRect: [-R, -R, 2 * R, 2 * R], lamps, sky: { top: hx(A.top), bot: hx(A.bot), cloud: hx(A.cloud), sunG: A.sunG }, R,
    };
  }

  return { build, arena, sigil, TH, AR };
})();
