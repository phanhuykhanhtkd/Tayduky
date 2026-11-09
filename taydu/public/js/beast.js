// =====================================================================
//  THÚ / TIÊN SỦNG / QUÁI VẼ NÉT (SVG) kiểu chibi: đầu to, mắt tròn long lanh.
//  Đọc thông số loài trong pixel.js (quad, bird, serp, toad, spider, scorp,
//  octo, bat, ghost, skull, king). Mặc định quay mặt sang phải.
// =====================================================================
const Beast = (() => {
  const L = '#2e1c14';
  const sh = (c, k) => Chibi.sh(c || '#888888', k);
  const VB = '0 0 240 200';
  function defs(o) {
    const m = o.main || '#c8803a', lt = o.light || sh(m, 0.6);
    return `<defs>
      <radialGradient id="bm" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${sh(m, 0.35)}"/><stop offset=".55" stop-color="${m}"/><stop offset="1" stop-color="${sh(m, -0.32)}"/></radialGradient>
      <radialGradient id="bl" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="${lt}"/><stop offset="1" stop-color="${sh(lt, -0.18)}"/></radialGradient>
      <linearGradient id="ba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(o.acc || m, 0.3)}"/><stop offset="1" stop-color="${sh(o.acc || m, -0.3)}"/></linearGradient>
      <linearGradient id="bw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(o.wing || m, 0.3)}"/><stop offset="1" stop-color="${sh(o.wing || m, -0.3)}"/></linearGradient>
      <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".5" stop-color="#eec04a"/><stop offset="1" stop-color="#a8701a"/></linearGradient>
      <radialGradient id="glo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${o.glow || o.light || '#fff'}" stop-opacity=".9"/><stop offset="1" stop-color="${o.glow || o.light || '#fff'}" stop-opacity="0"/></radialGradient>
    </defs>`;
  }
  // mắt (x,y tâm, s cỡ), quay phải
  function eye(x, y, s, o, expr, far) {
    const ec = o.eye || '#2a1a10';
    if (expr === 'hurt') return `<path d="M${x - 6 * s} ${y - 5 * s} L${x + 5 * s} ${y} L${x - 6 * s} ${y + 5 * s}" fill="none" stroke="${L}" stroke-width="${3 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (expr === 'blink') return `<path d="M${x - 7 * s} ${y + 1} q${7 * s} ${5 * s} ${14 * s} 0" fill="none" stroke="${L}" stroke-width="${3 * s}" stroke-linecap="round"/>`;
    const k = far ? 0.8 : 1, rx = 7.5 * s * k, ry = 9 * s;
    return `<g><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="${1.6 * s}"/>
      <ellipse cx="${x + 1.5 * s}" cy="${y + 1 * s}" rx="${5.4 * s * k}" ry="${7 * s}" fill="${ec}"/><ellipse cx="${x + 1.5 * s}" cy="${y + 1.6 * s}" rx="${2.8 * s * k}" ry="${4 * s}" fill="#08060c"/>
      <circle cx="${x - 1 * s}" cy="${y - 3 * s}" r="${2.4 * s}" fill="#fff"/><circle cx="${x + 3 * s}" cy="${y + 4 * s}" r="${1.1 * s}" fill="#fff"/>
      ${expr === 'angry' ? `<path d="M${x - 9 * s} ${y - 10 * s} L${x + 8 * s} ${y - 5 * s}" stroke="${L}" stroke-width="${3.4 * s}" stroke-linecap="round"/>` : ''}</g>`;
  }
  const ground = (cx, rx, y = 190) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="8" fill="#000" opacity=".18"/>`;

  // ---------------- bốn chân ----------------
  function quad(o, f, expr) {
    const sz = o.size || 1, m = 'url(#bm)', lt = 'url(#bl)';
    const lg = f === 1 ? [-6, 5] : f === 2 ? [5, -6] : [0, 0], bob = f ? -3 : 0;
    const short = (o.legs || 8) < 7;
    const legH = short ? 22 : 34, by = 186 - legH;
    let back = '', s = '';
    // đuôi
    const tc = o.tailc || o.main;
    if (o.tail === 'fox') { const n = o.tails || 1; for (let i = 0; i < n; i++) { const a = -40 + (n > 1 ? (i / (n - 1)) * 60 : 20); back += `<g transform="rotate(${a} 66 ${by - 22})"><path d="M66 ${by - 22} C30 ${by - 30} 14 ${by - 70} 30 ${by - 96} C44 ${by - 66} 60 ${by - 50} 76 ${by - 34}Z" fill="${m}" stroke="${L}" stroke-width="2.2"/><path d="M30 ${by - 96} C26 ${by - 82} 30 ${by - 72} 38 ${by - 66} C36 ${by - 78} 34 ${by - 88} 30 ${by - 96}Z" fill="#fff"/></g>`; } }
    else if (o.tail === 'flame') back += `<path d="M64 ${by - 24} C30 ${by - 40} 34 ${by - 80} 18 ${by - 98} C48 ${by - 86} 52 ${by - 60} 76 ${by - 40}Z" fill="#ff8a1a" stroke="${L}" stroke-width="2"/><path d="M60 ${by - 30} C42 ${by - 44} 40 ${by - 66} 30 ${by - 82} C50 ${by - 70} 54 ${by - 52} 68 ${by - 40}Z" fill="#fff07a"/>`;
    else if (o.tail === 'cotton') back += `<circle cx="58" cy="${by - 28}" r="14" fill="#fff" stroke="${L}" stroke-width="2"/>`;
    else if (o.tail === 'horse') back += `<path d="M62 ${by - 34} C34 ${by - 30} 30 ${by} 40 ${by + 18} C46 ${by - 2} 56 ${by - 14} 70 ${by - 22}Z" fill="${o.mane ? sh(o.mane, 0) : m}" stroke="${L}" stroke-width="2"/>`;
    else if (o.tail === 'snake') back += `<path d="M62 ${by - 18} C40 ${by - 10} 30 ${by - 30} 40 ${by - 40} C44 ${by - 30} 50 ${by - 24} 58 ${by - 26}" fill="none" stroke="${tc}" stroke-width="8" stroke-linecap="round"/>`;
    else if (o.tail) back += `<path d="M64 ${by - 30} C40 ${by - 34} 34 ${by - 60} 40 ${by - 74}" fill="none" stroke="${L}" stroke-width="8" stroke-linecap="round"/><path d="M64 ${by - 30} C40 ${by - 34} 34 ${by - 60} 40 ${by - 74}" fill="none" stroke="${tc}" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="${by - 76}" r="9" fill="${o.mane || sh(tc, -0.2)}" stroke="${L}" stroke-width="2"/>`;
    // chân sau (xa)
    const lw = 11 + (o.legW || 3) * 1.6;
    const leg = (x, d, far) => `<path d="M${x - lw / 2} ${by - 14} C${x - lw / 2 + d * 0.5} ${by + legH * 0.4} ${x - lw / 2 - 2 + d} ${182} ${x - lw / 2 - 3 + d} ${184} Q${x + d} ${191} ${x + lw / 2 + 3 + d} ${184} C${x + lw / 2 + d} ${182} ${x + lw / 2 + d * 0.5} ${by + legH * 0.4} ${x + lw / 2} ${by - 14}Z" fill="${far ? sh(o.main, -0.25) : m}" stroke="${L}" stroke-width="2.2"/>${o.hoof ? `<path d="M${x - lw / 2 - 3 + d} ${184} Q${x + d} ${191} ${x + lw / 2 + 3 + d} ${184} L${x + lw / 2 + 2 + d} ${179} Q${x + d} ${183} ${x - lw / 2 - 2 + d} ${179}Z" fill="${o.hoof}" stroke="${L}" stroke-width="1.6"/>` : `<path d="M${x - 3 + d} ${186} v-5 M${x + 3 + d} ${186} v-5" stroke="${L}" stroke-width="1.4" opacity=".6"/>`}`;
    s += leg(84, lg[1], true) + leg(150, lg[0], true);
    // thân
    s += `<ellipse cx="112" cy="${by - 26}" rx="${60 * Math.min(sz, 1.1)}" ry="36" fill="${m}" stroke="${L}" stroke-width="2.6"/>`;
    if (!o.noBelly) s += `<ellipse cx="118" cy="${by - 12}" rx="38" ry="16" fill="${lt}"/>`;
    if (o.shell) s += `<path d="M58 ${by - 26} C58 ${by - 92} 166 ${by - 92} 166 ${by - 26} Z" fill="${o.shell}" stroke="${L}" stroke-width="2.6"/><path d="M80 ${by - 30} L92 ${by - 66} L132 ${by - 66} L144 ${by - 30} M92 ${by - 66} L112 ${by - 80} L132 ${by - 66}" fill="none" stroke="${sh(o.shell, -0.4)}" stroke-width="3"/>`;
    if (o.scales) s += [0, 1, 2, 3, 4].map((i) => `<path d="M${76 + i * 16} ${by - 50} q8 8 16 0" fill="none" stroke="${sh(o.main, -0.35)}" stroke-width="2"/>`).join('');
    if (o.saddle) s += `<path d="M90 ${by - 56} Q112 ${by - 66} 134 ${by - 56} L130 ${by - 28} Q112 ${by - 22} 94 ${by - 28}Z" fill="${o.saddle}" stroke="${L}" stroke-width="2"/><path d="M90 ${by - 56} Q112 ${by - 66} 134 ${by - 56}" stroke="url(#gd)" stroke-width="5" fill="none"/>`;
    if (o.backFlame) s += [0, 1, 2].map((i) => `<path d="M${86 + i * 18} ${by - 56} C${80 + i * 18} ${by - 80} ${96 + i * 18} ${by - 86} ${92 + i * 18} ${by - 100} C${104 + i * 18} ${by - 84} ${106 + i * 18} ${by - 66} ${100 + i * 18} ${by - 56}Z" fill="#ff8a1a" stroke="${L}" stroke-width="1.6"/>`).join('');
    s += leg(96, lg[0], false) + leg(160, lg[1], false);
    // bờm
    const hx = 170, hy = by - 64, hr = (o.headR ? 30 + o.headR * 2 : 40) * Math.min(1.1, sz);
    if (o.mane) { const ms = o.maneSize || 1; s += `<g>${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; const r1 = hr * (1.28 + 0.12 * ms), r2 = hr * 0.8; return `<path d="M${hx + Math.cos(a - 0.25) * r2} ${hy + Math.sin(a - 0.25) * r2} L${hx + Math.cos(a) * r1} ${hy + Math.sin(a) * r1} L${hx + Math.cos(a + 0.25) * r2} ${hy + Math.sin(a + 0.25) * r2}Z" fill="${o.mane}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`; }).join('')}</g>`; }
    // tai
    const ear = o.ears || 'point';
    if (ear === 'point') s += `<path d="M${hx - 26} ${hy - hr * 0.55} L${hx - 30} ${hy - hr - 22} L${hx - 6} ${hy - hr * 0.8}Z M${hx + 8} ${hy - hr * 0.8} L${hx + 18} ${hy - hr - 22} L${hx + 30} ${hy - hr * 0.5}Z" fill="${m}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><path d="M${hx - 24} ${hy - hr * 0.62} L${hx - 26} ${hy - hr - 10} L${hx - 12} ${hy - hr * 0.8}Z M${hx + 12} ${hy - hr * 0.82} L${hx + 18} ${hy - hr - 10} L${hx + 25} ${hy - hr * 0.56}Z" fill="#f8b8c8"/>`;
    if (ear === 'round') s += `<circle cx="${hx - 26}" cy="${hy - hr * 0.78}" r="13" fill="${m}" stroke="${L}" stroke-width="2.2"/><circle cx="${hx + 24}" cy="${hy - hr * 0.78}" r="13" fill="${m}" stroke="${L}" stroke-width="2.2"/><circle cx="${hx - 26}" cy="${hy - hr * 0.78}" r="7" fill="#f8c0a8"/><circle cx="${hx + 24}" cy="${hy - hr * 0.78}" r="7" fill="#f8c0a8"/>`;
    if (ear === 'long') s += `<path d="M${hx - 18} ${hy - hr * 0.7} C${hx - 30} ${hy - hr - 60} ${hx - 6} ${hy - hr - 64} ${hx - 4} ${hy - hr * 0.8}Z M${hx + 6} ${hy - hr * 0.8} C${hx + 10} ${hy - hr - 64} ${hx + 34} ${hy - hr - 56} ${hx + 20} ${hy - hr * 0.66}Z" fill="${m}" stroke="${L}" stroke-width="2.2"/><path d="M${hx - 15} ${hy - hr * 0.8} C${hx - 22} ${hy - hr - 44} ${hx - 9} ${hy - hr - 46} ${hx - 8} ${hy - hr * 0.84}Z M${hx + 9} ${hy - hr * 0.86} C${hx + 13} ${hy - hr - 46} ${hx + 26} ${hy - hr - 40} ${hx + 17} ${hy - hr * 0.74}Z" fill="#f8b8c8"/>`;
    if (ear === 'big') s += `<path d="M${hx - 20} ${hy - 20} C${hx - 76} ${hy - 40} ${hx - 70} ${hy + 40} ${hx - 22} ${hy + 22}Z" fill="${m}" stroke="${L}" stroke-width="2.4"/><path d="M${hx - 26} ${hy - 10} C${hx - 60} ${hy - 22} ${hx - 56} ${hy + 26} ${hx - 26} ${hy + 14}Z" fill="#f0c0c8" opacity=".7"/>`;
    // đầu
    s += `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${m}" stroke="${L}" stroke-width="2.6"/>`;
    s += `<ellipse cx="${hx + 6}" cy="${hy + hr * 0.35}" rx="${hr * 0.62}" ry="${hr * 0.45}" fill="${lt}"/>`;
    // mõm
    if (o.snout === 'long') s += `<path d="M${hx + hr * 0.5} ${hy + 2} C${hx + hr + 22} ${hy + 4} ${hx + hr + 24} ${hy + 26} ${hx + hr * 0.4} ${hy + 30}Z" fill="${lt}" stroke="${L}" stroke-width="2.2"/><ellipse cx="${hx + hr + 14}" cy="${hy + 10}" rx="6" ry="5" fill="#2a1a1a"/>`;
    else if (o.snout === 'trunk') s += `<path d="M${hx + hr * 0.6} ${hy + 6} C${hx + hr + 24} ${hy + 10} ${hx + hr + 22} ${hy + 54} ${hx + hr + 34} ${hy + 60} C${hx + hr + 16} ${hy + 70} ${hx + hr + 4} ${hy + 40} ${hx + hr * 0.5} ${hy + 28}Z" fill="${m}" stroke="${L}" stroke-width="2.4"/>${o.tusk ? `<path d="M${hx + hr * 0.5} ${hy + 30} q10 16 26 14" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round"/>` : ''}`;
    else s += `<ellipse cx="${hx + hr * 0.72}" cy="${hy + 12}" rx="5" ry="4" fill="#2a1a1a"/>`;
    s += `<path d="M${hx + hr * 0.4} ${hy + 22} q8 6 16 -2" stroke="${L}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    s += eye(hx - hr * 0.22, hy - 4, 1.25, o, expr, true) + eye(hx + hr * 0.36, hy - 2, 1.35, o, expr);
    s += `<ellipse cx="${hx - 20}" cy="${hy + 16}" rx="8" ry="4" fill="#ff8a8a" opacity=".35"/>`;
    if (o.horn === 'single') s += `<path d="M${hx} ${hy - hr * 0.86} L${hx + 6} ${hy - hr - 34} L${hx + 14} ${hy - hr * 0.8}Z" fill="url(#gd)" stroke="${L}" stroke-width="2"/>`;
    if (o.horn === 'antler') s += `<path d="M${hx - 12} ${hy - hr * 0.8} L${hx - 22} ${hy - hr - 30} M${hx - 18} ${hy - hr - 14} L${hx - 34} ${hy - hr - 20} M${hx + 10} ${hy - hr * 0.84} L${hx + 22} ${hy - hr - 30} M${hx + 18} ${hy - hr - 14} L${hx + 34} ${hy - hr - 22}" stroke="${o.hornc || '#c8a060'}" stroke-width="5" stroke-linecap="round"/>`;
    if (o.collar) s += `<path d="M${hx - hr * 0.7} ${hy + hr * 0.75} Q${hx} ${hy + hr * 1.1} ${hx + hr * 0.7} ${hy + hr * 0.75}" stroke="${o.collar}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="${hx}" cy="${hy + hr * 0.98}" r="6" fill="url(#gd)" stroke="${L}" stroke-width="1.6"/>`;
    return `${ground(118, 80)}<g transform="translate(0 ${bob})">${back}${s}</g>`;
  }
  // ---------------- chim ----------------
  function bird(o, f, expr) {
    const bob = f ? -4 : 0, flap = f === 1 ? -14 : f === 2 ? 8 : 0;
    const crane = !!o.legs, ny = crane ? 70 : 92, nx = 150 + (o.neckX || 7) * 2;
    let s = '';
    if (o.fanTail) s += `<g>${Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.95 + (i / 8) * 0.75); const x = 84 + Math.cos(a) * 92, y = 126 + Math.sin(a) * 92; return `<path d="M84 126 L${x - 8} ${y} Q${x} ${y - 10} ${x + 8} ${y}Z" fill="#2a8a6a" stroke="${L}" stroke-width="1.6"/><circle cx="${x}" cy="${y + 4}" r="8" fill="${o.fanTail}" stroke="${L}" stroke-width="1.4"/><circle cx="${x}" cy="${y + 4}" r="3.5" fill="#1a3a8a"/>`; }).join('')}</g>`;
    if (o.longTail) s += `<path d="M80 128 C40 150 20 120 6 150 C30 140 40 166 70 148 Z M80 120 C48 108 28 72 8 84 C36 92 44 116 76 130Z" fill="${o.longTail}" stroke="${L}" stroke-width="2"/><path d="M6 150 q8 -4 14 2 M8 84 q8 2 10 10" stroke="#ffd04a" stroke-width="3" fill="none"/>`;
    else if (!o.fanTail) s += `<path d="M76 130 L36 ${crane ? 140 : 120} L44 ${crane ? 156 : 140} L80 142Z" fill="${o.tail || sh(o.main, -0.3)}" stroke="${L}" stroke-width="2"/>`;
    if (crane) s += `<path d="M104 160 L100 ${186 + (f === 1 ? -6 : 0)} M124 160 L130 ${186 + (f === 2 ? -6 : 0)}" stroke="${o.legc || '#3a3a3a'}" stroke-width="4" stroke-linecap="round"/><path d="M92 188 h16 M122 188 h16" stroke="${o.legc || '#3a3a3a'}" stroke-width="4" stroke-linecap="round"/>`;
    else s += `<path d="M104 ${o.talons ? 164 : 166} l-4 20 M124 166 l4 20" stroke="#e8a040" stroke-width="5" stroke-linecap="round"/>${o.talons ? '<path d="M92 188 l8 -4 l8 4 M120 188 l8 -4 l8 4" stroke="#e8a040" stroke-width="4" fill="none" stroke-linecap="round"/>' : ''}`;
    s += `<ellipse cx="114" cy="${crane ? 128 : 136}" rx="46" ry="36" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/>`;
    s += `<ellipse cx="126" cy="${crane ? 140 : 148}" rx="28" ry="18" fill="url(#bl)"/>`;
    // cánh
    s += `<g transform="rotate(${flap} 110 ${crane ? 118 : 126})"><path d="M120 ${crane ? 110 : 118} C96 ${crane ? 96 : 104} 60 ${crane ? 96 : 104} 50 ${crane ? 120 : 128} C70 ${crane ? 124 : 132} 88 ${crane ? 140 : 148} 114 ${crane ? 140 : 148}Z" fill="url(#bw)" stroke="${L}" stroke-width="2.2"/><path d="M50 ${crane ? 120 : 128} C60 ${crane ? 126 : 134} 70 ${crane ? 128 : 136} 80 ${crane ? 128 : 136}" stroke="${o.wingTip || sh(o.main, -0.4)}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`;
    // cổ + đầu
    if (crane) s += `<path d="M136 112 C150 94 140 ${ny + 20} ${nx - 6} ${ny + 6}" stroke="${L}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M136 112 C150 94 140 ${ny + 20} ${nx - 6} ${ny + 6}" stroke="${o.neckc || o.main}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    const hr = 28 + (o.headR || 3.5) * 2;
    s += `<circle cx="${nx}" cy="${ny}" r="${hr}" fill="${o.headc ? o.headc : 'url(#bm)'}" stroke="${L}" stroke-width="2.6"/>`;
    if (o.crest) s += `<path d="M${nx - 10} ${ny - hr + 4} C${nx - 24} ${ny - hr - 26} ${nx - 8} ${ny - hr - 30} ${nx} ${ny - hr - 10} C${nx + 4} ${ny - hr - 30} ${nx + 18} ${ny - hr - 24} ${nx + 8} ${ny - hr + 6}Z" fill="${o.crest}" stroke="${L}" stroke-width="2"/>`;
    if (o.cap) s += `<ellipse cx="${nx + 2}" cy="${ny - hr + 6}" rx="12" ry="7" fill="${o.cap}"/>`;
    s += `<path d="M${nx + hr * 0.7} ${ny - 4} L${nx + hr + (o.beakLen ? o.beakLen * 4 : 18)} ${ny + 4} ${o.hook ? `Q${nx + hr + 20} ${ny + 16} ${nx + hr + 8} ${ny + 14}` : ''} L${nx + hr * 0.7} ${ny + 10}Z" fill="${o.beak || '#f0b030'}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
    s += eye(nx - hr * 0.2, ny - 4, 1.1, o, expr, true) + eye(nx + hr * 0.32, ny - 3, 1.2, o, expr);
    return `${ground(116, 60)}<g transform="translate(0 ${bob})">${s}</g>`;
  }
  // ---------------- rắn / rồng ----------------
  function serp(o, f, expr) {
    const w = f === 1 ? 6 : f === 2 ? -6 : 0, dragon = o.dragon;
    const p = `M30 170 C60 ${190 + w} 90 ${150 - w} 120 166 C150 ${184 + w} 160 ${130 - w} 150 110 C140 90 160 76 176 84`;
    let s = '';
    if (dragon) s += Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = 40 + t * 120, y = 160 - Math.sin(t * Math.PI * 1.4) * 30 - t * 30; return `<path d="M${x - 6} ${y - 10} L${x} ${y - 26} L${x + 6} ${y - 10}Z" fill="${o.acc || '#e8402a'}" stroke="${L}" stroke-width="1.6"/>`; }).join('');
    s += `<path d="${p}" fill="none" stroke="${L}" stroke-width="34" stroke-linecap="round"/><path d="${p}" fill="none" stroke="url(#bm)" stroke-width="29" stroke-linecap="round"/>`;
    s += `<path d="${p}" fill="none" stroke="${o.light || '#fff'}" stroke-width="10" stroke-linecap="round" opacity=".7" transform="translate(2 8)"/>`;
    if (o.pattern) s += `<path d="${p}" fill="none" stroke="${o.pattern}" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>`;
    if (dragon) s += `<path d="M90 166 l-6 20 l8 -4 M140 140 l10 16 l2 -8" stroke="${L}" stroke-width="3" fill="none"/>`;
    const hx = 182, hy = 78;
    s += `<ellipse cx="${hx}" cy="${hy}" rx="38" ry="30" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/>`;
    if (dragon) s += `<path d="M${hx - 18} ${hy - 22} C${hx - 30} ${hy - 50} ${hx - 14} ${hy - 58} ${hx - 6} ${hy - 30} M${hx + 4} ${hy - 26} C${hx + 4} ${hy - 56} ${hx + 22} ${hy - 58} ${hx + 18} ${hy - 26}" stroke="url(#gd)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${hx + 30} ${hy + 10} C${hx + 54} ${hy + 16} ${hx + 60} ${hy + 40} ${hx + 70} ${hy + 30} M${hx + 30} ${hy} C${hx + 56} ${hy - 4} ${hx + 64} ${hy - 22} ${hx + 74} ${hy - 12}" stroke="${o.light || '#fff'}" stroke-width="3" fill="none"/>`;
    s += `<ellipse cx="${hx + 22}" cy="${hy + 10}" rx="20" ry="14" fill="url(#bl)"/><circle cx="${hx + 34}" cy="${hy + 4}" r="2.6" fill="${L}"/>`;
    s += eye(hx - 10, hy - 6, 1.2, o, expr, true) + eye(hx + 12, hy - 6, 1.3, o, expr);
    if (!dragon) s += `<path d="M${hx + 38} ${hy + 18} l12 2 l-4 6 m4 -6 l6 6" stroke="#e8302a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `${ground(110, 90)}${s}`;
  }
  function toad(o, f, expr) {
    const bob = f ? -4 : 0;
    return `${ground(120, 76)}<g transform="translate(0 ${bob})"><ellipse cx="66" cy="178" rx="24" ry="12" fill="url(#bm)" stroke="${L}" stroke-width="2.2"/><ellipse cx="174" cy="178" rx="24" ry="12" fill="url(#bm)" stroke="${L}" stroke-width="2.2"/>
      <path d="M44 170 C30 110 70 70 120 70 C170 70 210 110 196 170 Q120 190 44 170Z" fill="url(#bm)" stroke="${L}" stroke-width="2.8"/>
      <ellipse cx="120" cy="156" rx="58" ry="22" fill="url(#bl)"/>${[[80, 110], [150, 104], [104, 92], [170, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${o.acc || '#6a4422'}" opacity=".5"/>`).join('')}
      <circle cx="86" cy="76" r="22" fill="url(#bm)" stroke="${L}" stroke-width="2.4"/><circle cx="154" cy="76" r="22" fill="url(#bm)" stroke="${L}" stroke-width="2.4"/>
      ${eye(86, 74, 1.5, o, expr, false)}${eye(154, 74, 1.5, o, expr, false)}
      <path d="M70 128 Q120 152 170 128" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="120" cy="140" r="15" fill="url(#gd)" stroke="${L}" stroke-width="2"/><rect x="114" y="134" width="12" height="12" fill="${o.acc || '#6a4422'}" opacity=".6"/></g>`;
  }
  function spider(o, f, expr) {
    const w = f === 1 ? 6 : f === 2 ? -6 : 0;
    const legs = [-1, 1].map((sd) => [0, 1, 2, 3].map((i) => `<path d="M120 140 Q${120 + sd * (50 + i * 10)} ${96 + i * 14 + (i % 2 ? w : -w)} ${120 + sd * (80 + i * 8)} ${178 - i * 2}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/><path d="M120 140 Q${120 + sd * (50 + i * 10)} ${96 + i * 14 + (i % 2 ? w : -w)} ${120 + sd * (80 + i * 8)} ${178 - i * 2}" fill="none" stroke="${o.main}" stroke-width="5.5" stroke-linecap="round"/>`).join('')).join('');
    return `${ground(120, 90)}${legs}<ellipse cx="96" cy="128" rx="46" ry="40" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/><path d="M76 108 l20 14 l20 -14 M80 140 l16 -8 l16 8" stroke="${o.acc}" stroke-width="5" fill="none"/>
      <circle cx="150" cy="138" r="34" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/>${eye(140, 132, 1.2, o, expr, true)}${eye(162, 132, 1.25, o, expr)}<path d="M146 156 l-3 8 M156 156 l3 8" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
  }
  function scorp(o, f, expr) {
    const w = f ? -5 : 0;
    return `${ground(120, 90)}<path d="M70 150 C30 140 20 90 50 60 C70 40 96 54 86 70" fill="none" stroke="${L}" stroke-width="22" stroke-linecap="round" transform="translate(0 ${w})"/><path d="M70 150 C30 140 20 90 50 60 C70 40 96 54 86 70" fill="none" stroke="url(#bm)" stroke-width="17" stroke-linecap="round" stroke-dasharray="14 3" transform="translate(0 ${w})"/>
      <path d="M86 70 l12 6 l-10 10z" fill="#1a1010" stroke="${L}" stroke-width="2" transform="translate(0 ${w})"/>
      ${[0, 1, 2].map((i) => `<path d="M${100 + i * 20} 166 l-8 18 M${108 + i * 20} 166 l6 18" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`).join('')}
      <ellipse cx="124" cy="150" rx="54" ry="26" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/>
      <path d="M170 140 C190 120 206 110 214 120 C220 130 206 134 200 130 C210 142 196 152 186 144" fill="url(#bm)" stroke="${L}" stroke-width="2.4"/>
      <circle cx="160" cy="136" r="24" fill="url(#bm)" stroke="${L}" stroke-width="2.4"/>${eye(154, 132, 1.05, o, expr, true)}${eye(170, 132, 1.1, o, expr)}`;
  }
  function octo(o, f, expr) {
    const w = f === 1 ? 6 : f === 2 ? -6 : 0;
    const t = [0, 1, 2, 3, 4, 5].map((i) => { const x = 60 + i * 24; return `<path d="M${x + 6} 130 C${x - 8 + (i % 2 ? w : -w)} 160 ${x + 20} 170 ${x + (i % 2 ? -10 : 14)} 186" fill="none" stroke="${L}" stroke-width="16" stroke-linecap="round"/><path d="M${x + 6} 130 C${x - 8 + (i % 2 ? w : -w)} 160 ${x + 20} 170 ${x + (i % 2 ? -10 : 14)} 186" fill="none" stroke="url(#bm)" stroke-width="11" stroke-linecap="round"/>`; }).join('');
    return `${ground(124, 80)}${t}<path d="M50 140 C40 60 90 30 124 30 C160 30 206 60 196 140 Q124 160 50 140Z" fill="url(#bm)" stroke="${L}" stroke-width="2.8"/><ellipse cx="96" cy="64" rx="18" ry="10" fill="#fff" opacity=".3"/>${eye(104, 104, 1.5, o, expr, true)}${eye(146, 104, 1.6, o, expr)}<path d="M116 128 q10 8 20 0" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  function bat(o, f, expr) {
    const up = f === 1 ? -18 : f === 2 ? 10 : 0;
    return `${ground(120, 50, 192)}<g transform="translate(0 -20)"><path d="M100 110 C70 ${80 + up} 30 ${70 + up} 4 ${96 + up} C24 ${104 + up} 30 ${118 + up} 26 ${132 + up} C44 ${120 + up} 52 ${132 + up} 60 ${146 + up} C70 ${132 + up} 86 ${132 + up} 104 ${140}Z M140 110 C170 ${80 + up} 210 ${70 + up} 236 ${96 + up} C216 ${104 + up} 210 ${118 + up} 214 ${132 + up} C196 ${120 + up} 188 ${132 + up} 180 ${146 + up} C170 ${132 + up} 154 ${132 + up} 136 ${140}Z" fill="url(#bw)" stroke="${L}" stroke-width="2.4"/>
      <path d="M98 86 L92 54 L112 76Z M142 86 L148 54 L128 76Z" fill="url(#bm)" stroke="${L}" stroke-width="2"/><circle cx="120" cy="112" r="34" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/>${eye(108, 108, 1.2, o, expr, true)}${eye(132, 108, 1.25, o, expr)}<path d="M114 128 l3 7 l3 -7 M122 128 l3 7 l3 -7" fill="#fff" stroke="${L}" stroke-width="1.4"/></g>`;
  }
  function ghost(o, f, expr) {
    const y = f === 1 ? -6 : f === 2 ? 4 : 0;
    return `<ellipse cx="120" cy="104" rx="96" ry="90" fill="url(#glo)" opacity=".6"/><g transform="translate(0 ${y})"><path d="M120 24 C170 24 190 70 186 120 C184 150 170 170 150 160 C140 180 120 186 104 170 C90 184 64 176 62 150 C44 140 50 90 66 64 C78 40 98 24 120 24Z" fill="url(#bl)" stroke="${sh(o.main, -0.3)}" stroke-width="2.6"/>
      ${eye(100, 92, 1.5, o, expr, true)}${eye(140, 92, 1.6, o, expr)}<ellipse cx="120" cy="122" rx="8" ry="${expr === 'angry' ? 4 : 10}" fill="#2a2040"/>
      ${[[50, 130], [196, 86], [178, 160]].map(([a, b]) => `<path d="M${a} ${b} c-8 -10 0 -24 6 -30 c4 10 12 14 6 30z" fill="${o.main}" opacity=".85"/>`).join('')}</g>`;
  }
  function skullS(o, f, expr) {
    const y = f ? -5 : 0;
    return `<ellipse cx="120" cy="100" rx="90" ry="80" fill="url(#glo)" opacity=".5"/><g transform="translate(0 ${y})"><path d="M120 36 C172 36 190 76 182 112 C178 132 166 138 160 150 L150 172 L90 172 L80 150 C74 138 62 132 58 112 C50 76 68 36 120 36Z" fill="#f4eee0" stroke="${L}" stroke-width="2.8"/>
      <ellipse cx="96" cy="104" rx="18" ry="20" fill="#2a1a24"/><ellipse cx="144" cy="104" rx="18" ry="20" fill="#2a1a24"/><circle cx="96" cy="106" r="7" fill="${o.glow || '#7affd8'}"/><circle cx="144" cy="106" r="7" fill="${o.glow || '#7affd8'}"/>
      <path d="M114 132 l6 -12 l6 12z" fill="#2a1a24"/><path d="M96 158 h48 M104 150 v20 M114 150 v20 M124 150 v20 M134 150 v20" stroke="${L}" stroke-width="2.4"/></g>`;
  }
  function king(o, f, expr) {
    const w = f === 1 ? -10 : f === 2 ? 6 : 0;
    const head = (x, y, s) => `<path d="M120 120 C${(120 + x) / 2} ${(120 + y) / 2 + 10} ${x} ${y + 30} ${x} ${y}" stroke="${L}" stroke-width="${18 * s}" fill="none" stroke-linecap="round"/><path d="M120 120 C${(120 + x) / 2} ${(120 + y) / 2 + 10} ${x} ${y + 30} ${x} ${y}" stroke="url(#bm)" stroke-width="${13 * s}" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${22 * s}" fill="url(#bm)" stroke="${L}" stroke-width="2.4"/><path d="M${x + 16 * s} ${y - 2} l${18 * s} 6 l-${18 * s} 8z" fill="url(#gd)" stroke="${L}" stroke-width="1.8"/>${eye(x + 4 * s, y - 4, 0.9 * s, o, expr)}`;
    return `${ground(120, 90)}<path d="M120 120 C60 ${60 + w} 10 ${80 + w} 0 ${130 + w} C40 ${120 + w} 70 140 110 150Z M120 120 C180 ${60 + w} 230 ${80 + w} 240 ${130 + w} C200 ${120 + w} 170 140 130 150Z" fill="url(#bw)" stroke="${L}" stroke-width="2.4"/>
      <ellipse cx="120" cy="140" rx="48" ry="40" fill="url(#bm)" stroke="${L}" stroke-width="2.6"/><ellipse cx="124" cy="152" rx="28" ry="20" fill="url(#bl)"/><path d="M104 178 l-4 14 M136 178 l4 14" stroke="url(#gd)" stroke-width="6" stroke-linecap="round"/>
      ${head(70, 50, 0.85)}${head(170, 50, 0.85)}${head(124, 34, 1)}`;
  }
  const KIND = { quad, bird, serp, toad, spider, scorp, octo, bat, ghost, skull: skullS, king };
  function svg(kind, o, frame = 0, expr = 'calm') {
    const fn = KIND[kind]; if (!fn) return null;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}">${defs(o)}${fn(o, frame, expr)}</svg>`;
  }
  // mây cân đẩu (thú cưỡi)
  function cloud() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110"><defs><radialGradient id="cl" cx=".4" cy=".3" r=".8"><stop offset=".3" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d4ee"/></radialGradient></defs>
      <path d="M34 76 C8 76 8 44 36 44 C38 22 70 16 82 34 C94 12 136 12 146 34 C162 18 196 22 196 44 C226 40 236 66 214 80 C202 94 46 96 34 76Z" fill="url(#cl)" stroke="#8a9ac0" stroke-width="2.6"/><path d="M66 68 q22 10 44 0 M134 68 q18 8 38 -2" stroke="#9aaad0" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M214 80 q20 0 22 18" stroke="#f0c050" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  }
  const cache = new Map();
  function make(key, kind, o, frame = 0, expr = 'calm') {
    const k = key + '|' + frame + '|' + expr;
    let r = cache.get(k); if (r) return r;
    const s = kind === 'cloud' ? cloud() : svg(kind, o, frame, expr); if (!s) return null;
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    const vb = kind === 'cloud' ? [240, 110] : [240, 200];
    const cv = document.createElement('canvas'); cv.width = vb[0] * 2; cv.height = vb[1] * 2;
    const img = new Image(); img.onload = () => { cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); cv._ready = true; }; img.src = url;
    r = { cv, url, vec: true }; cache.set(k, r); return r;
  }
  return { make, svg, has: (k) => !!KIND[k] || k === 'cloud' };
})();
