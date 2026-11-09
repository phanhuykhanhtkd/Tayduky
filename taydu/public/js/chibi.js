// =====================================================================
//  NHÂN VẬT CHIBI VẼ NÉT (SVG): đầu to, mắt anime, tô bóng mềm, viền mảnh.
//  Đọc đúng bộ thông số nhân vật trong pixel.js (HEROES/NPCS/HUMANS):
//  dáng người, kiểu áo, tóc, mũ, vũ khí, đầu thú, đuôi, cánh, hào quang…
//  Kết quả: ảnh SVG (sắc nét ở mọi kích thước) + canvas để vẽ lên bản đồ.
//  Có tranh thật (public/art/...) thì Sprites sẽ ưu tiên tranh thật.
// =====================================================================
const Chibi = (() => {
  const L = '#2e1c14'; // màu viền
  const hex = (h) => { h = String(h || '#888').replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const sh = (h, k) => { const c = hex(h); return toHex(c.map((v) => (k >= 0 ? v + (255 - v) * k : v * (1 + k)))); };
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
  const BUILD = { kid: [0.8, 0.84], slim: [0.88, 1], male: [1, 1], brawny: [1.22, 1.02], fat: [1.32, 0.96], giant: [1.36, 1.08] };

  // ---------------- đầu thú ----------------
  const BEAST = {
    monkey: { ears: 'round', mask: true }, panda: { ears: 'black', patches: true, nose: '#1a1418' }, bear: { ears: 'round', muzzle: 0.5 },
    demon: { ears: 'point', horns: 'small', fangs: true }, bull: { ears: 'side', horns: 'bull', muzzle: 0.45, ring: true }, croc: { snout: 'croc' },
    deer: { ears: 'side', horns: 'antler', muzzle: 0.55 }, eagle: { beak: true, crest: true }, elephant: { ears: 'elephant', trunk: true },
    fish: { fins: true, lips: true }, lion: { ears: 'round', mane: true, muzzle: 0.5 }, pig: { ears: 'flop', snout: 'pig' }, ram: { horns: 'ram', wool: true, muzzle: 0.5 },
    rat: { ears: 'big', muzzle: 0.55, whisk: true, teeth: true }, rhino: { ears: 'side', horns: 'rhino', muzzle: 0.35 }, skull: { skull: true },
    tiger: { ears: 'round', stripes: true, muzzle: 0.7, whisk: true }, wolf: { ears: 'point', muzzle: 0.5, snoutLong: true },
  };

  function eyes(o, expr, cy, sx, sc = 1) {
    const ec = o.eyeColor || '#5a3a1a', glow = o.eyeGlow;
    const closed = (o.closedEyes && !['angry', 'hurt', 'cast'].includes(expr)) || expr === 'blink';
    const one = (x, d) => {
      if (expr === 'hurt') return `<path d="M${x - 9 * sc} ${cy - 7 * sc} L${x + 7 * sc * d} ${cy} L${x - 9 * sc} ${cy + 7 * sc}" transform="${d < 0 ? `translate(${2 * x} 0) scale(-1 1)` : ''}" fill="none" stroke="${L}" stroke-width="${3.6 * sc}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (closed) return expr === 'blink' ? `<path d="M${x - 11 * sc} ${cy + 2} q${11 * sc} ${6 * sc} ${22 * sc} 0" fill="none" stroke="${L}" stroke-width="${3.6 * sc}" stroke-linecap="round"/>`
        : `<path d="M${x - 11 * sc} ${cy + 3} q${11 * sc} ${-11 * sc} ${22 * sc} 0" fill="none" stroke="${L}" stroke-width="${3.8 * sc}" stroke-linecap="round"/>`;
      const ry = 14 * sc, rx = 11.5 * sc, lid = expr === 'angry' ? `<path d="M${x - 13 * sc} ${cy - 8 * sc} L${x + 13 * sc} ${cy - 8 * sc + 9 * sc * d}" stroke="${L}" stroke-width="${4.4 * sc}" stroke-linecap="round"/>` : '';
      return `<g>${glow ? `<ellipse cx="${x}" cy="${cy}" rx="${rx + 5}" ry="${ry + 5}" fill="${glow}" opacity=".35"/>` : ''}
        <ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
        <ellipse cx="${x + d}" cy="${cy + 2 * sc}" rx="${9 * sc}" ry="${12 * sc}" fill="url(#ir)"/>
        <ellipse cx="${x + d}" cy="${cy + 3 * sc}" rx="${4.4 * sc}" ry="${6.2 * sc}" fill="#0a0e1c"/>
        <ellipse cx="${x - 3 * sc}" cy="${cy - 4 * sc}" rx="${3.6 * sc}" ry="${4.4 * sc}" fill="#fff"/><circle cx="${x + 4 * sc}" cy="${cy + 8 * sc}" r="${1.8 * sc}" fill="#fff" opacity=".9"/>
        <path d="M${x - 13 * sc} ${cy - 8 * sc} q${13 * sc} ${-11 * sc} ${26 * sc} -1" fill="none" stroke="${L}" stroke-width="${4.2 * sc}" stroke-linecap="round"/>
        ${o.lashes ? `<path d="M${x + 12 * sc * d} ${cy - 8 * sc} l${5 * sc * d} -4" stroke="${L}" stroke-width="${2.6 * sc}" stroke-linecap="round"/>` : ''}${lid}
        ${expr === 'cast' ? `<path d="M${x + 6 * sc} ${cy - 6 * sc} l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#fff6c0"/>` : ''}</g>`;
    };
    let s = one(100 - sx, 1) + one(100 + sx, -1);
    const bc = o.brows || sh(o.hair || '#24160e', -0.2);
    if (expr === 'angry' || expr === 'cast') s += `<path d="M${100 - sx - 13} ${cy - 24 * sc} L${100 - sx + 11} ${cy - 17 * sc} M${100 + sx + 13} ${cy - 24 * sc} L${100 + sx - 11} ${cy - 17 * sc}" stroke="${bc}" stroke-width="${4.6 * sc}" stroke-linecap="round"/>`;
    else if (o.brows && o.beard) s += `<path d="M${100 - sx - 14} ${cy - 19} q12 -8 24 -2 M${100 + sx + 14} ${cy - 19} q-12 -8 -24 -2" stroke="${bc}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    if (expr === 'hurt') s += `<path d="M146 ${cy - 22} q5 8 0 12 q-5 -4 0 -12z" fill="#9fd8ff" stroke="#3a6a9a" stroke-width="1.4"/>`;
    return s;
  }
  function mouth(o, expr, y, beast) {
    if (expr === 'hurt') return `<path d="M90 ${y + 2} q5 -4 10 0 q5 4 10 0" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (expr === 'angry') return `<path d="M90 ${y + 4} q10 -8 20 0 z" fill="#8a2a2a" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>${o.fangs || beast ? `<path d="M93 ${y + 1} l2 5 l2 -5 M103 ${y + 1} l2 5 l2 -5" fill="#fff" stroke="${L}" stroke-width="1"/>` : ''}`;
    if (expr === 'cast') return `<ellipse cx="100" cy="${y + 2}" rx="5" ry="6" fill="#8a2a2a" stroke="${L}" stroke-width="2"/>`;
    if (expr === 'smile' || o.smile) return `<path d="M91 ${y - 1} q9 10 18 0 q-9 4 -18 0z" fill="#c8483a" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`;
    return `<path d="M94 ${y} q6 3 12 0" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`;
  }

  // ---------------- tóc ----------------
  function hairBack(o, fem) {
    const st = o.hairStyle || 'short';
    if (st === 'bald' || o.head) return '';
    let s = '';
    if (o.hairBack || st === 'long') s += `<path d="M46 92 C38 150 42 196 56 ${fem ? 214 : 196} Q70 206 84 ${fem ? 216 : 200} L116 ${fem ? 216 : 200} Q130 206 144 ${fem ? 214 : 196} C158 196 162 150 154 92 Z" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/>`;
    if (st === 'twin') s += `<path d="M46 96 C26 120 26 168 40 196 C50 176 54 140 58 108Z M154 96 C174 120 174 168 160 196 C150 176 146 140 142 108Z" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/>`;
    if (st === 'bun') s += `<circle cx="100" cy="34" r="20" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/><path d="M84 40 q16 8 32 0" stroke="${o.pin || '#e0b040'}" stroke-width="4" fill="none"/>`;
    return s;
  }
  function hairFront(o, fem) {
    const st = o.hairStyle || 'short';
    if (st === 'bald') return `<path d="M64 52 q20 -14 44 -12" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const shine = `<path d="M70 50 q14 -12 32 -12" stroke="#fff" stroke-opacity=".32" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (st === 'wild') return `<path d="M42 108 C30 76 46 34 100 28 C154 34 170 76 158 108 L150 92 L162 80 L144 78 L150 58 L132 66 L128 44 L112 60 L100 38 L88 60 L72 44 L68 66 L50 58 L56 78 L38 80 L50 92Z" fill="url(#hr)" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>${shine}`;
    if (fem || st === 'long' || st === 'twin' || st === 'bun') return `<path d="M46 110 C38 58 66 32 100 32 C136 32 162 58 154 110 C150 90 140 74 124 66 C118 82 102 86 94 70 C86 82 70 86 62 78 C54 86 50 98 46 110Z" fill="url(#hr)" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M48 100 Q44 130 52 148 Q58 128 58 106Z M152 100 Q156 130 148 148 Q142 128 142 106Z" fill="url(#hr)" stroke="${L}" stroke-width="2"/>${shine}`;
    const knot = st === 'topknot' ? `<circle cx="100" cy="30" r="14" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/><rect x="88" y="38" width="24" height="7" rx="3" fill="${o.trim || '#e0b040'}" stroke="${L}" stroke-width="1.6"/>` : '';
    return `${knot}<path d="M44 104 C38 60 64 34 100 34 C138 34 164 58 156 104 L148 92 L146 76 L134 86 L128 66 L114 80 L104 60 L92 80 L78 64 L72 86 L58 74 L54 94 Z" fill="url(#hr)" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>${shine}`;
  }

  // ---------------- mũ ----------------
  function hat(o) {
    const h = o.hat; if (!h) return '';
    const gold = 'url(#gd)';
    switch (h) {
      case 'band': return `<path d="M50 82 Q100 62 150 82 L150 90 Q100 70 50 90Z" fill="${gold}" stroke="${L}" stroke-width="2"/><circle cx="100" cy="72" r="6" fill="#e8402a" stroke="${L}" stroke-width="1.8"/><circle cx="98" cy="70" r="2" fill="#fff" opacity=".8"/>`;
      case 'phoenix': return hat({ hat: 'band' }) + `<path d="M88 64 C70 30 50 10 22 4 C48 18 64 40 80 66Z M112 64 C130 30 150 10 178 4 C152 18 136 40 120 66Z" fill="#f0c040" stroke="${L}" stroke-width="2"/><path d="M84 60 C68 34 52 18 30 9 M116 60 C132 34 148 18 170 9" stroke="#c8302a" stroke-width="2" fill="none"/>`;
      case 'buns2': return `<circle cx="64" cy="44" r="16" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/><circle cx="136" cy="44" r="16" fill="url(#hr)" stroke="${L}" stroke-width="2.4"/><path d="M52 52 q12 8 24 0 M124 52 q12 8 24 0" stroke="${o.ribbon || '#e8402a'}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'cap': return `<path d="M50 80 C50 34 150 34 150 80 Q100 66 50 80Z" fill="${o.capc || '#3a2a20'}" stroke="${L}" stroke-width="2.4"/><path d="M50 80 Q100 66 150 80 L150 88 Q100 74 50 88Z" fill="${sh(o.capc || '#3a2a20', 0.25)}" stroke="${L}" stroke-width="1.8"/>`;
      case 'crown': return `<path d="M66 56 L72 26 L86 44 L100 18 L114 44 L128 26 L134 56 Q100 46 66 56Z" fill="${gold}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="100" cy="40" r="5" fill="#e8402a" stroke="${L}" stroke-width="1.4"/><circle cx="78" cy="46" r="3" fill="#4ad0ff"/><circle cx="122" cy="46" r="3" fill="#4ad0ff"/>`;
      case 'tiara': return `<path d="M58 70 Q100 46 142 70 L138 76 Q100 56 62 76Z" fill="${gold}" stroke="${L}" stroke-width="1.8"/><path d="M92 58 L100 42 L108 58Z" fill="${gold}" stroke="${L}" stroke-width="1.8"/><circle cx="100" cy="56" r="4" fill="#4ad0ff" stroke="${L}" stroke-width="1.2"/>`;
      case 'flower': return `<g transform="translate(140 60)">${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${Math.cos(i * 1.256) * 8}" cy="${Math.sin(i * 1.256) * 8}" rx="7" ry="5" transform="rotate(${i * 72} ${Math.cos(i * 1.256) * 8} ${Math.sin(i * 1.256) * 8})" fill="#ff9ab8" stroke="${L}" stroke-width="1.2"/>`).join('')}<circle r="4.5" fill="#fff2a0" stroke="${L}" stroke-width="1"/></g><circle cx="124" cy="52" r="5" fill="#ffd0e0" stroke="${L}" stroke-width="1.2"/>`;
      case 'foxears': case 'rabbitears': {
        const c = o.hair || '#f4eefe', r = h === 'rabbitears';
        return r ? `<path d="M74 52 C62 10 70 -4 80 -2 C90 2 90 26 86 50Z M126 52 C138 10 130 -4 120 -2 C110 2 110 26 114 50Z" fill="${c}" stroke="${L}" stroke-width="2.2"/><path d="M78 46 C72 18 76 6 80 6 C84 10 84 28 82 46Z M122 46 C128 18 124 6 120 6 C116 10 116 28 118 46Z" fill="#f8b0c8"/>`
          : `<path d="M56 64 L50 18 L84 46Z M144 64 L150 18 L116 46Z" fill="${c}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><path d="M60 56 L56 30 L76 46Z M140 56 L144 30 L124 46Z" fill="#f8b0c8"/>`;
      }
      case 'helmet': { const m = o.helm || o.metal || '#c8cad8'; return `<path d="M44 92 C40 40 160 40 156 92 L148 96 C146 64 54 64 52 96Z" fill="${m}" stroke="${L}" stroke-width="2.4"/><path d="M48 82 Q100 58 152 82" stroke="${o.plate || '#e0b040'}" stroke-width="6" fill="none"/><path d="M100 34 L100 50" stroke="${L}" stroke-width="2"/><path d="M100 36 C90 10 104 0 112 12 C106 14 104 24 100 36Z" fill="${o.plume || '#e02a2a'}" stroke="${L}" stroke-width="1.8"/><circle cx="100" cy="74" r="5" fill="${o.plate || '#e0b040'}" stroke="${L}" stroke-width="1.4"/>`; }
      case 'horns': return `<path d="M60 64 C46 40 40 20 50 6 C56 26 66 40 74 54Z M140 64 C154 40 160 20 150 6 C144 26 134 40 126 54Z" fill="${o.horn || '#e8dcc0'}" stroke="${L}" stroke-width="2.2"/>`;
      case 'smallhorns': return `<path d="M68 58 L62 36 L80 52Z M132 58 L138 36 L120 52Z" fill="${o.horn || '#2a1a1a'}" stroke="${L}" stroke-width="2"/>`;
      case 'mask': return `<path d="M58 118 Q100 112 142 118 L138 140 Q100 152 62 140Z" fill="#2a2a2e" stroke="${L}" stroke-width="2"/><path d="M60 82 Q100 70 140 82 L140 88 Q100 76 60 88Z" fill="#8a2a2a" stroke="${L}" stroke-width="1.6"/>`;
      case 'monk5': return `<path d="M54 74 Q100 54 146 74 L146 82 Q100 62 54 82Z" fill="${gold}" stroke="${L}" stroke-width="1.8"/>${[-2, -1, 0, 1, 2].map((i) => `<path d="M${100 + i * 19 - 9} ${70 - (2 - Math.abs(i)) * 3} Q${100 + i * 19} ${44 - (2 - Math.abs(i)) * 4} ${100 + i * 19 + 9} ${70 - (2 - Math.abs(i)) * 3}Z" fill="${gold}" stroke="${L}" stroke-width="1.6"/><circle cx="${100 + i * 19}" cy="${60 - (2 - Math.abs(i)) * 4}" r="3" fill="#c8302a"/>`).join('')}`;
      case 'scholar': return `<path d="M60 70 C58 34 142 34 140 70 Q100 62 60 70Z" fill="#1e1a20" stroke="${L}" stroke-width="2.4"/><rect x="70" y="40" width="60" height="10" rx="4" fill="#2e2a30"/><path d="M60 64 L28 58 L30 64 L60 70 M140 64 L172 58 L170 64 L140 70" fill="#1e1a20" stroke="${L}" stroke-width="2"/>`;
      case 'turban': { const t = o.turban || '#f2ead8'; return `<path d="M48 86 C40 40 160 40 152 86 Q100 70 48 86Z" fill="${t}" stroke="${L}" stroke-width="2.4"/><path d="M56 66 Q100 48 146 70 M52 78 Q100 58 150 80" stroke="${sh(t, -0.2)}" stroke-width="3" fill="none"/><circle cx="100" cy="64" r="6" fill="#e8402a" stroke="${L}" stroke-width="1.4"/>`; }
    }
    return '';
  }

  // ---------------- đầu ----------------
  function head(o, expr) {
    const fem = o.body === 'dress' || o.lashes;
    const skin = o.skin || '#ffe0c8';
    if (o.head && BEAST[o.head]) return beastHead(o, expr, BEAST[o.head]);
    let s = '';
    s += `<ellipse cx="46" cy="112" rx="8" ry="11" fill="url(#sk)" stroke="${L}" stroke-width="2.2"/><ellipse cx="154" cy="112" rx="8" ry="11" fill="url(#sk)" stroke="${L}" stroke-width="2.2"/>`;
    s += `<path d="M48 98 C48 58 152 58 152 98 C152 126 140 144 100 148 C60 144 48 126 48 98Z" fill="url(#fc)" stroke="${L}" stroke-width="2.6"/>`;
    if (!o.noBlush) s += `<ellipse cx="70" cy="124" rx="10" ry="5" fill="#ff7a7a" opacity=".3"/><ellipse cx="130" cy="124" rx="10" ry="5" fill="#ff7a7a" opacity=".3"/>`;
    s += eyes(o, expr, 106, 22);
    if (o.manyEyes) s += [[-34, 84], [34, 84], [0, 76]].map(([dx, y]) => `<ellipse cx="${100 + dx}" cy="${y}" rx="5" ry="6" fill="#fff" stroke="${L}" stroke-width="1.4"/><circle cx="${100 + dx}" cy="${y + 1}" r="3" fill="#c82a2a"/>`).join('');
    s += `<path d="M99 118 l2 3" stroke="${L}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
    s += mouth(o, expr, 130);
    if (o.mustache) s += `<path d="M100 124 C90 120 80 124 74 132 C84 128 92 130 100 128 C108 130 116 128 126 132 C120 124 110 120 100 124Z" fill="${o.mustache}" stroke="${L}" stroke-width="1.6"/>`;
    if (o.beard) s += `<path d="M66 128 C70 150 84 176 100 ${o.wide ? 190 : 200} C116 176 130 150 134 128 C124 142 112 146 100 146 C88 146 76 142 66 128Z" fill="${o.beard}" stroke="${L}" stroke-width="2"/><path d="M90 150 q2 20 8 32 M110 150 q-2 20 -8 32" stroke="${sh(o.beard, -0.18)}" stroke-width="2" fill="none"/>`;
    if (o.beard) s += mouth(o, expr, 132).replace(/stroke="#2e1c14"/g, `stroke="${L}"`);
    s += hairFront(o, fem);
    if (o.mark) s += `<path d="M100 76 l-3 7 3 4 3 -4z" fill="${o.mark}" stroke="${L}" stroke-width="1"/>`;
    if (o.thirdEye) s += `<ellipse cx="100" cy="80" rx="4.5" ry="8" fill="#fff" stroke="${L}" stroke-width="1.6"/><ellipse cx="100" cy="81" rx="2.6" ry="5" fill="#c8302a"/>`;
    s += hat(o);
    return s;
  }
  function beastHead(o, expr, B) {
    const f = o.fur || '#c8803a', lt = sh(f, 0.5), dk = sh(f, -0.3);
    const facec = o.face || '#f6d2b4';
    let back = '', s = '', front = '';
    // tai
    if (B.ears === 'round' || B.ears === 'black') { const c = B.ears === 'black' ? '#1e1a20' : f; back += `<circle cx="54" cy="62" r="17" fill="${c}" stroke="${L}" stroke-width="2.4"/><circle cx="146" cy="62" r="17" fill="${c}" stroke="${L}" stroke-width="2.4"/>${B.ears === 'round' ? `<circle cx="56" cy="64" r="9" fill="${B.mask ? facec : lt}"/><circle cx="144" cy="64" r="9" fill="${B.mask ? facec : lt}"/>` : ''}`; }
    if (B.ears === 'point') back += `<path d="M56 74 L44 26 L82 56Z M144 74 L156 26 L118 56Z" fill="${f}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><path d="M58 66 L52 40 L74 56Z M142 66 L148 40 L126 56Z" fill="${lt}"/>`;
    if (B.ears === 'side') back += `<ellipse cx="38" cy="86" rx="16" ry="8" transform="rotate(-20 38 86)" fill="${f}" stroke="${L}" stroke-width="2.2"/><ellipse cx="162" cy="86" rx="16" ry="8" transform="rotate(20 162 86)" fill="${f}" stroke="${L}" stroke-width="2.2"/>`;
    if (B.ears === 'flop') back += `<path d="M58 60 C34 64 30 96 46 104 C52 88 60 78 70 70Z M142 60 C166 64 170 96 154 104 C148 88 140 78 130 70Z" fill="${sh(f, -0.08)}" stroke="${L}" stroke-width="2.2"/>`;
    if (B.ears === 'big') back += `<circle cx="50" cy="58" r="24" fill="${f}" stroke="${L}" stroke-width="2.4"/><circle cx="150" cy="58" r="24" fill="${f}" stroke="${L}" stroke-width="2.4"/><circle cx="52" cy="60" r="14" fill="#f8b8c8"/><circle cx="148" cy="60" r="14" fill="#f8b8c8"/>`;
    if (B.ears === 'elephant') back += `<path d="M58 70 C10 50 8 130 50 128 C58 110 60 90 64 78Z M142 70 C190 50 192 130 150 128 C142 110 140 90 136 78Z" fill="${f}" stroke="${L}" stroke-width="2.4"/><path d="M52 80 C26 72 26 116 48 116Z M148 80 C174 72 174 116 152 116Z" fill="#f0c0c8" opacity=".7"/>`;
    if (B.mane || o.mane) { const m = o.mane || dk; back += `<g>${Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, r1 = 64, r2 = 46; const x = 100 + Math.cos(a) * r1, y = 100 + Math.sin(a) * r1 * 0.92; const a1 = a - 0.2, a2 = a + 0.2; return `<path d="M${100 + Math.cos(a1) * r2} ${100 + Math.sin(a1) * r2} L${x} ${y} L${100 + Math.cos(a2) * r2} ${100 + Math.sin(a2) * r2}Z" fill="${m}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`; }).join('')}</g>`; }
    if (B.horns === 'bull') back += `<path d="M58 70 C28 66 18 40 26 22 C34 44 50 50 68 54Z M142 70 C172 66 182 40 174 22 C166 44 150 50 132 54Z" fill="#f0e6cc" stroke="${L}" stroke-width="2.2"/>`;
    if (B.horns === 'ram') back += `<path d="M60 66 C30 46 16 80 34 98 C46 108 60 96 52 86 C46 80 40 86 44 90" fill="none" stroke="#d8c8a0" stroke-width="12" stroke-linecap="round"/><path d="M140 66 C170 46 184 80 166 98 C154 108 140 96 148 86 C154 80 160 86 156 90" fill="none" stroke="#d8c8a0" stroke-width="12" stroke-linecap="round"/>`;
    if (B.horns === 'antler') back += `<path d="M70 58 L56 20 M60 32 L42 22 M64 42 L48 40 M130 58 L144 20 M140 32 L158 22 M136 42 L152 40" stroke="#a87a4a" stroke-width="6" stroke-linecap="round"/>`;
    if (B.fins) back += `<path d="M48 96 L18 74 L26 112Z M152 96 L182 74 L174 112Z" fill="${o.fin || '#e8502a'}" stroke="${L}" stroke-width="2"/><path d="M80 40 L100 12 L120 40Z" fill="${o.fin || '#e8502a'}" stroke="${L}" stroke-width="2"/>`;
    if (B.crest) back += `<path d="M80 48 L70 12 L92 38 L100 6 L108 38 L130 12 L120 48Z" fill="${sh(f, -0.15)}" stroke="${L}" stroke-width="2"/>`;
    // khối đầu
    const base = B.skull ? '#f4f0e6' : o.head === 'panda' ? '#f6f4ee' : f;
    s += `<path d="M46 98 C46 52 154 52 154 98 C154 132 138 150 100 152 C62 150 46 132 46 98Z" fill="${base === f ? 'url(#fur)' : base}" stroke="${L}" stroke-width="2.6"/>`;
    if (B.wool) s += `${[60, 80, 100, 120, 140].map((x, i) => `<circle cx="${x}" cy="${60 - (i % 2) * 6}" r="14" fill="#fbf8f0" stroke="${L}" stroke-width="1.8"/>`).join('')}`;
    if (B.stripes) s += o.spots ? [[66, 78], [134, 78], [80, 66], [120, 66], [100, 60], [58, 100], [142, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${dk}"/>`).join('')
      : `<path d="M100 56 l-6 14 l6 -2 l6 2z M62 74 l14 6 l-14 4 M138 74 l-14 6 l14 4 M54 98 l12 2 l-10 6 M146 98 l-12 2 l10 6" fill="${sh(f, -0.55)}" stroke="${sh(f, -0.55)}" stroke-width="3" stroke-linejoin="round"/>`;
    if (B.mask) s += `<path d="M58 104 C56 80 76 76 100 88 C124 76 144 80 142 104 C142 132 126 146 100 146 C74 146 58 132 58 104Z" fill="${facec}" stroke="${L}" stroke-width="2"/>`;
    if (B.patches) s += `<ellipse cx="76" cy="106" rx="16" ry="19" transform="rotate(20 76 106)" fill="#1e1a20"/><ellipse cx="124" cy="106" rx="16" ry="19" transform="rotate(-20 124 106)" fill="#1e1a20"/>`;
    if (B.skull) s += `<ellipse cx="78" cy="106" rx="15" ry="16" fill="#2a1a24"/><ellipse cx="122" cy="106" rx="15" ry="16" fill="#2a1a24"/><circle cx="78" cy="108" r="5" fill="${o.eyeColor || '#7affd8'}"/><circle cx="122" cy="108" r="5" fill="${o.eyeColor || '#7affd8'}"/><path d="M96 122 l4 -8 4 8z" fill="#2a1a24"/><path d="M78 138 h44 M84 132 v12 M92 132 v12 M100 132 v12 M108 132 v12 M116 132 v12" stroke="${L}" stroke-width="2"/>`;
    else s += eyes(Object.assign({}, o, { lashes: false }), expr, B.patches ? 106 : 104, 24, 0.86);
    // mõm
    if (B.muzzle) { const mc = B.muzzle > 0.6 ? '#fbf6ee' : sh(f, B.muzzle); s += `<ellipse cx="100" cy="${B.snoutLong ? 132 : 130}" rx="${B.snoutLong ? 22 : 26}" ry="${B.snoutLong ? 20 : 16}" fill="${mc}" stroke="${L}" stroke-width="2"/><path d="M92 122 Q100 116 108 122 Q100 132 92 122Z" fill="#2a1a1a"/>`; s += mouth(o, expr, 138, true); }
    else if (B.snout === 'pig') s += `<ellipse cx="100" cy="128" rx="20" ry="14" fill="${sh(f, -0.12)}" stroke="${L}" stroke-width="2.2"/><ellipse cx="93" cy="128" rx="4" ry="6" fill="${sh(f, -0.5)}"/><ellipse cx="107" cy="128" rx="4" ry="6" fill="${sh(f, -0.5)}"/>${mouth(o, expr, 146, true)}`;
    else if (B.snout === 'croc') s += `<path d="M64 120 Q100 112 136 120 L134 150 Q100 160 66 150Z" fill="${sh(f, 0.1)}" stroke="${L}" stroke-width="2.2"/><path d="M70 140 l5 6 l5 -6 l5 6 l5 -6 l5 6 l5 -6 l5 6 l5 -6 l5 6 l5 -6 l5 6" fill="#fff" stroke="${L}" stroke-width="1.2"/><circle cx="92" cy="124" r="2.4" fill="${L}"/><circle cx="108" cy="124" r="2.4" fill="${L}"/>`;
    else if (B.beak) s += `<path d="M86 118 Q100 112 114 118 Q112 140 100 150 Q96 138 86 118Z" fill="#f0b030" stroke="${L}" stroke-width="2.2"/><path d="M100 150 q-4 -10 -10 -14" stroke="${L}" stroke-width="1.6" fill="none"/>`;
    else if (B.trunk) s += `<path d="M92 118 C90 140 96 158 86 172 C94 176 104 166 106 150 C108 138 108 126 108 118Z" fill="${f}" stroke="${L}" stroke-width="2.4"/><path d="M80 132 Q72 148 76 156 M120 132 Q128 148 124 156" stroke="#fff8e8" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    else if (B.lips) s += `<ellipse cx="100" cy="134" rx="10" ry="7" fill="#e86a4a" stroke="${L}" stroke-width="2"/><path d="M60 110 q6 6 0 12 M140 110 q-6 6 0 12" stroke="${L}" stroke-width="1.8" fill="none"/>`;
    else if (!B.skull && !B.mask) s += `<ellipse cx="100" cy="122" rx="5" ry="3.6" fill="${B.nose || '#2a1a1a'}"/>${mouth(o, expr, 132, true)}`;
    if (B.mask) s += `<ellipse cx="100" cy="122" rx="4" ry="3" fill="#6a3a2a"/>${mouth(o, expr, 132)}`;
    if (B.ring) s += `<circle cx="100" cy="140" r="8" fill="none" stroke="#e8c040" stroke-width="3.4"/>`;
    if (B.whisk) s += `<path d="M70 128 L44 122 M70 134 L46 136 M130 128 L156 122 M130 134 L154 136" stroke="${L}" stroke-width="1.6" opacity=".7"/>`;
    if (B.teeth) s += `<rect x="95" y="138" width="10" height="9" rx="2" fill="#fff" stroke="${L}" stroke-width="1.4"/>`;
    if (B.horns === 'small' || o.singleHorn) s += o.singleHorn ? `<path d="M92 60 L100 18 L108 60Z" fill="#f0e6cc" stroke="${L}" stroke-width="2.2"/>` : `<path d="M70 62 L64 34 L84 54Z M130 62 L136 34 L116 54Z" fill="#f0e6cc" stroke="${L}" stroke-width="2.2"/>`;
    if (B.horns === 'rhino') s += `<path d="M92 120 L100 92 L108 120Z" fill="#e8e0cc" stroke="${L}" stroke-width="2"/>`;
    if (o.crescent) s += `<path d="M86 66 Q100 84 114 66 Q100 76 86 66Z" fill="#ffe04a" stroke="${L}" stroke-width="1.4"/>`;
    if (o.beard && !B.mask) s += `<path d="M72 140 C78 160 90 176 100 186 C110 176 122 160 128 140 C118 150 82 150 72 140Z" fill="${o.beard}" stroke="${L}" stroke-width="2"/>`;
    if (o.beard && B.mask) s += `<path d="M70 138 C78 160 90 176 100 184 C110 176 122 160 130 138 C118 148 82 148 70 138Z" fill="${o.beard}" stroke="${L}" stroke-width="2"/>`;
    s += `<path d="M66 64 q16 -12 34 -12" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    front += hat(o);
    return back + s + front;
  }

  // ---------------- vũ khí (cầm tay phải người xem) ----------------
  function weapon(w, o, hx, hy) {
    if (!w) return '';
    const pole = (c1, c2, top = 40, bot = 252, wd = 8) => `<g transform="rotate(-10 ${hx} ${hy})"><rect x="${hx - wd / 2}" y="${top}" width="${wd}" height="${bot - top}" rx="${wd / 2}" fill="url(#pl)" stroke="${L}" stroke-width="2"/></g>`;
    const rot = (inner) => `<g transform="rotate(-10 ${hx} ${hy})">${inner}</g>`;
    const steel = 'url(#stl)', gold = 'url(#gd)';
    switch (w) {
      case 'staff': return pole() + rot(`<rect x="${hx - 6}" y="40" width="12" height="14" rx="4" fill="${gold}" stroke="${L}" stroke-width="1.8"/><rect x="${hx - 6}" y="238" width="12" height="14" rx="4" fill="${gold}" stroke="${L}" stroke-width="1.8"/>`);
      case 'goldstaff': return rot(`<rect x="${hx - 5}" y="30" width="10" height="226" rx="5" fill="${gold}" stroke="${L}" stroke-width="2"/><rect x="${hx - 7}" y="30" width="14" height="18" rx="4" fill="#c8302a" stroke="${L}" stroke-width="1.8"/><rect x="${hx - 7}" y="238" width="14" height="18" rx="4" fill="#c8302a" stroke="${L}" stroke-width="1.8"/>`);
      case 'spear': case 'firespear': case 'trident': case 'rake': case 'spade': case 'khakkhara': {
        let top = '';
        if (w === 'spear') top = `<path d="M${hx} 6 L${hx + 10} 40 L${hx} 50 L${hx - 10} 40Z" fill="${steel}" stroke="${L}" stroke-width="2"/><path d="M${hx - 4} 52 q-8 14 -2 24 M${hx + 4} 52 q8 14 2 24" stroke="#e02a2a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
        if (w === 'firespear') top = `<path d="M${hx} 0 C${hx + 18} 22 ${hx + 12} 40 ${hx} 50 C${hx - 12} 40 ${hx - 18} 22 ${hx} 0Z" fill="#ff8a1a" stroke="${L}" stroke-width="2"/><path d="M${hx} 14 C${hx + 8} 28 ${hx + 6} 38 ${hx} 44 C${hx - 6} 38 ${hx - 8} 28 ${hx} 14Z" fill="#fff07a"/>`;
        if (w === 'trident') top = `<path d="M${hx - 20} 16 L${hx - 16} 46 L${hx + 16} 46 L${hx + 20} 16 L${hx + 12} 40 L${hx + 4} 40 L${hx} 6 L${hx - 4} 40 L${hx - 12} 40Z" fill="${steel}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
        if (w === 'rake') top = `<rect x="${hx - 24}" y="34" width="48" height="12" rx="3" fill="${steel}" stroke="${L}" stroke-width="2"/>${[-20, -12, -4, 4, 12, 20].map((d) => `<path d="M${hx + d} 46 v12" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`).join('')}`;
        if (w === 'spade') top = `<path d="M${hx - 20} 22 Q${hx} 52 ${hx + 20} 22 Q${hx} 34 ${hx - 20} 22Z" fill="${steel}" stroke="${L}" stroke-width="2"/>`;
        if (w === 'khakkhara') top = `<path d="M${hx} 52 C${hx - 24} 44 ${hx - 22} 8 ${hx} 6 C${hx + 22} 8 ${hx + 24} 44 ${hx} 52Z" fill="none" stroke="${gold}" stroke-width="5"/>${[[-17, 22], [17, 22], [-15, 38], [15, 38]].map(([dx, y]) => `<circle cx="${hx + dx}" cy="${y}" r="5" fill="none" stroke="#e8c040" stroke-width="2.6"/>`).join('')}`;
        return pole('#8a5a2a', '#5a3418', 48) + rot(top);
      }
      case 'sword': case 'saber': return `<g transform="rotate(28 ${hx} ${hy})"><rect x="${hx - 4}" y="${hy - 2}" width="8" height="22" rx="3" fill="#5a2a1a" stroke="${L}" stroke-width="1.6"/><rect x="${hx - 14}" y="${hy - 8}" width="28" height="7" rx="3" fill="${gold}" stroke="${L}" stroke-width="1.6"/>
        ${w === 'sword' ? `<path d="M${hx - 6} ${hy - 8} L${hx - 6} ${hy - 96} L${hx} ${hy - 110} L${hx + 6} ${hy - 96} L${hx + 6} ${hy - 8}Z" fill="${steel}" stroke="${L}" stroke-width="2"/>` : `<path d="M${hx - 6} ${hy - 8} L${hx - 8} ${hy - 80} Q${hx - 4} ${hy - 104} ${hx + 16} ${hy - 110} Q${hx + 10} ${hy - 80} ${hx + 8} ${hy - 8}Z" fill="${steel}" stroke="${L}" stroke-width="2"/>`}
        <path d="M${hx} ${hy - 14} L${hx} ${hy - 90}" stroke="#fff" stroke-width="1.6" opacity=".7"/></g>`;
      case 'axe': return `<g transform="rotate(18 ${hx} ${hy})"><rect x="${hx - 4}" y="${hy - 90}" width="8" height="120" rx="4" fill="url(#pl)" stroke="${L}" stroke-width="2"/><path d="M${hx + 2} ${hy - 90} C${hx + 46} ${hy - 104} ${hx + 50} ${hy - 50} ${hx + 2} ${hy - 58}Z" fill="${steel}" stroke="${L}" stroke-width="2"/></g>`;
      case 'mace': return `<g transform="rotate(18 ${hx} ${hy})"><rect x="${hx - 4}" y="${hy - 70}" width="8" height="96" rx="4" fill="url(#pl)" stroke="${L}" stroke-width="2"/><circle cx="${hx}" cy="${hy - 86}" r="20" fill="${gold}" stroke="${L}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.28; return `<path d="M${hx + Math.cos(a) * 18} ${hy - 86 + Math.sin(a) * 18} l${Math.cos(a) * 9} ${Math.sin(a) * 9}" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`; }).join('')}</g>`;
      case 'club': return `<g transform="rotate(20 ${hx} ${hy})"><path d="M${hx - 5} ${hy + 20} L${hx - 12} ${hy - 90} Q${hx} ${hy - 104} ${hx + 12} ${hy - 90} L${hx + 5} ${hy + 20}Z" fill="#8a5a2a" stroke="${L}" stroke-width="2"/><path d="M${hx - 8} ${hy - 60} h16 M${hx - 9} ${hy - 76} h18" stroke="#5a3418" stroke-width="3"/></g>`;
      case 'fan': return `<g transform="rotate(-20 ${hx} ${hy})"><path d="M${hx} ${hy} L${hx - 34} ${hy - 50} A60 60 0 0 1 ${hx + 34} ${hy - 50}Z" fill="${o.fanc || '#f4e8c8'}" stroke="${L}" stroke-width="2"/>${[-3, -2, -1, 0, 1, 2, 3].map((i) => `<path d="M${hx} ${hy} L${hx + i * 11} ${hy - 58 + Math.abs(i) * 2}" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}</g>`;
      case 'bigfan': return `<g transform="rotate(-14 ${hx} ${hy})"><rect x="${hx - 3}" y="${hy - 30}" width="6" height="48" rx="3" fill="#8a5a2a" stroke="${L}" stroke-width="1.6"/><path d="M${hx} ${hy - 28} C${hx - 60} ${hy - 50} ${hx - 50} ${hy - 140} ${hx} ${hy - 150} C${hx + 50} ${hy - 140} ${hx + 60} ${hy - 50} ${hx} ${hy - 28}Z" fill="${o.fanc || '#2a8a5a'}" stroke="${L}" stroke-width="2.2"/><path d="M${hx} ${hy - 30} V${hy - 146} M${hx} ${hy - 60} l-28 -30 M${hx} ${hy - 60} l28 -30 M${hx} ${hy - 100} l-22 -24 M${hx} ${hy - 100} l22 -24" stroke="${sh(o.fanc || '#2a8a5a', -0.35)}" stroke-width="2"/></g>`;
      case 'whisk': return `<g transform="rotate(-24 ${hx} ${hy})"><rect x="${hx - 3}" y="${hy - 40}" width="6" height="54" rx="3" fill="#8a5a2a" stroke="${L}" stroke-width="1.6"/><path d="M${hx} ${hy - 40} C${hx - 30} ${hy - 50} ${hx - 40} ${hy - 20} ${hx - 36} ${hy + 20} C${hx - 24} ${hy - 10} ${hx - 10} ${hy - 30} ${hx} ${hy - 40}Z" fill="#fbfbf6" stroke="${L}" stroke-width="1.8"/></g>`;
      case 'vase': return `<path d="M${hx - 8} ${hy - 30} q-4 -8 4 -10 h8 q8 2 4 10 q16 10 12 26 q-6 14 -20 14 q-14 0 -20 -14 q-4 -16 12 -26Z" fill="#fbfbff" stroke="${L}" stroke-width="2"/><path d="M${hx - 12} ${hy - 12} h24" stroke="#5ab0e0" stroke-width="2.4"/><path d="M${hx} ${hy - 40} C${hx + 4} ${hy - 64} ${hx + 18} ${hy - 76} ${hx + 26} ${hy - 80}" stroke="#4a9a4a" stroke-width="3" fill="none"/>${[0, 1, 2].map((i) => `<ellipse cx="${hx + 6 + i * 8}" cy="${hy - 56 - i * 9}" rx="6" ry="3" transform="rotate(-40 ${hx + 6 + i * 8} ${hy - 56 - i * 9})" fill="#6ac85a"/>`).join('')}`;
      case 'gourd': return `<circle cx="${hx + 2}" cy="${hy - 22}" r="11" fill="url(#gd)" stroke="${L}" stroke-width="2"/><circle cx="${hx + 2}" cy="${hy}" r="16" fill="url(#gd)" stroke="${L}" stroke-width="2"/><rect x="${hx - 6}" y="${hy - 14}" width="16" height="5" rx="2" fill="#c8302a"/>`;
      case 'lantern': return `<path d="M${hx} ${hy} L${hx + 4} ${hy - 50}" stroke="#5a3418" stroke-width="5" stroke-linecap="round"/><path d="M${hx + 4} ${hy - 50} q20 -4 26 10" stroke="#5a3418" stroke-width="3" fill="none"/><ellipse cx="${hx + 30}" cy="${hy - 22}" rx="18" ry="22" fill="#ff6a3a" stroke="${L}" stroke-width="2"/><ellipse cx="${hx + 30}" cy="${hy - 22}" rx="10" ry="16" fill="#ffe07a" opacity=".85"/><rect x="${hx + 20}" y="${hy - 46}" width="20" height="6" rx="2" fill="url(#gd)"/><rect x="${hx + 20}" y="${hy - 4}" width="20" height="6" rx="2" fill="url(#gd)"/>`;
      case 'abacus': return `<rect x="${hx - 26}" y="${hy - 22}" width="52" height="34" rx="4" fill="#8a5a2a" stroke="${L}" stroke-width="2"/>${[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => `<circle cx="${hx - 18 + c * 9}" cy="${hy - 12 + r * 10}" r="3.4" fill="#e8c040" stroke="${L}" stroke-width=".8"/>`).join('')).join('')}`;
    }
    return '';
  }

  // ---------------- đuôi, cánh ----------------
  function tail(o) {
    const t = o.tail; if (!t) return '';
    const c = o.tailc || o.fur || '#c8803a';
    if (t === 'fox') { const n = Math.min(9, o.tails || 1); let s = ''; for (let i = 0; i < n; i++) { const a = n === 1 ? 20 : -50 + (i / (n - 1)) * 100; s += `<g transform="rotate(${a} 100 210)"><path d="M100 210 C96 170 110 130 100 100 C126 120 132 168 114 206Z" fill="${c}" stroke="${L}" stroke-width="2"/><path d="M100 104 C110 112 114 124 112 134 C106 124 102 114 100 104Z" fill="#fff"/></g>`; } return s; }
    if (t === 'monkey') return `<path d="M126 220 C170 220 178 180 160 166 C150 160 146 172 156 176" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/><path d="M126 220 C170 220 178 180 160 166 C150 160 146 172 156 176" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>`;
    if (t === 'tiger' || t === 'wolf') return `<path d="M128 222 C168 226 176 196 170 176" fill="none" stroke="${L}" stroke-width="13" stroke-linecap="round"/><path d="M128 222 C168 226 176 196 170 176" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>${t === 'tiger' ? '<path d="M150 224 l4 -8 M164 212 l8 -2 M170 194 l8 2" stroke="#2a1a10" stroke-width="3"/>' : ''}`;
    if (t === 'scorpion') return `<path d="M126 220 C176 220 184 150 150 128" fill="none" stroke="${L}" stroke-width="12" stroke-linecap="round"/><path d="M126 220 C176 220 184 150 150 128" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 3"/><path d="M150 128 l-12 -6 l6 14z" fill="#1a1010" stroke="${L}" stroke-width="1.6"/>`;
    return `<path d="M126 222 C156 224 166 210 170 196" fill="none" stroke="${L}" stroke-width="8" stroke-linecap="round"/><path d="M126 222 C156 224 166 210 170 196" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/><circle cx="170" cy="194" r="7" fill="${sh(c, -0.2)}" stroke="${L}" stroke-width="1.6"/>`;
  }

  // ---------------- thân ----------------
  function body(o, frame, bw, bh) {
    const robe = o.robe || '#c8a060', inner = o.inner || sh(robe, -0.35), trim = o.trim || '#e0b040', sash = o.sash || trim;
    const boot = o.boot || '#3a2418', pants = o.pants || sh(robe, -0.3);
    const top = 146, sw = 32 * bw, ww = 28 * bw;
    const kind = o.body || 'robe';
    const hem = kind === 'short' ? 212 * bh + (1 - bh) * 150 : kind === 'armor' ? 222 : 234 - (1 - bh) * 40;
    const hw = (kind === 'dress' ? 46 : kind === 'short' ? 34 : 40) * bw;
    const lf = frame === 1 ? -5 : frame === 2 ? 4 : 0, rf = frame === 1 ? 4 : frame === 2 ? -5 : 0;
    const footY = 244 - (1 - bh) * 40;
    let s = '';
    // chân
    const legs = kind !== 'robe' && kind !== 'dress' && kind !== 'monk';
    if (legs) s += `<path d="M${88 - 6 * bw + lf} ${hem - 6} L${86 - 6 * bw + lf} ${footY - 4} L${98 + lf} ${footY - 4} L${98 + lf} ${hem - 6}Z M${102 + rf} ${hem - 6} L${102 + rf} ${footY - 4} L${114 + 6 * bw + rf} ${footY - 4} L${112 + 6 * bw + rf} ${hem - 6}Z" fill="${pants}" stroke="${L}" stroke-width="2"/>`;
    s += `<ellipse cx="${90 - 4 * bw + lf}" cy="${footY}" rx="${12 * Math.min(bw, 1.2)}" ry="6.5" fill="${boot}" stroke="${L}" stroke-width="2"/><ellipse cx="${110 + 4 * bw + rf}" cy="${footY}" rx="${12 * Math.min(bw, 1.2)}" ry="6.5" fill="${boot}" stroke="${L}" stroke-width="2"/>`;
    if (o.wheels) s += [90 + lf, 110 + rf].map((x) => `<ellipse cx="${x}" cy="${footY + 2}" rx="18" ry="7" fill="none" stroke="#ff6a1a" stroke-width="5"/><ellipse cx="${x}" cy="${footY + 2}" rx="18" ry="7" fill="none" stroke="#ffe07a" stroke-width="2"/>`).join('');
    // áo
    const belly = o.build === 'fat' ? 10 * bw : 0;
    const path = `M${100 - sw} ${top + 8} Q100 ${top - 4} ${100 + sw} ${top + 8} C${100 + ww + belly} ${top + 34} ${100 + hw} ${hem - 26} ${100 + hw} ${hem} Q100 ${hem + 8} ${100 - hw} ${hem} C${100 - hw} ${hem - 26} ${100 - ww - belly} ${top + 34} ${100 - sw} ${top + 8}Z`;
    if (kind === 'armor') {
      s += `<path d="M${100 - hw} ${hem} L${100 - ww} ${top + 40} L${100 + ww} ${top + 40} L${100 + hw} ${hem} Q100 ${hem + 8} ${100 - hw} ${hem}Z" fill="url(#rb)" stroke="${L}" stroke-width="2.4"/>`;
      s += `<path d="M${100 - sw} ${top + 8} Q100 ${top - 4} ${100 + sw} ${top + 8} L${100 + ww + belly * 0.6} ${top + 50} Q100 ${top + 58} ${100 - ww - belly * 0.6} ${top + 50}Z" fill="url(#mt)" stroke="${L}" stroke-width="2.4"/>`;
      s += `<circle cx="100" cy="${top + 26}" r="${10 * Math.min(bw, 1.2)}" fill="${o.plate || '#e0b040'}" stroke="${L}" stroke-width="2"/><circle cx="${97}" cy="${top + 23}" r="3" fill="#fff" opacity=".7"/>`;
      s += `<path d="M${100 - ww - 4} ${top + 50} L${100 - hw + 4} ${hem - 4} L${100 - 8} ${hem - 8} L${100 - 6} ${top + 54}Z M${100 + ww + 4} ${top + 50} L${100 + hw - 4} ${hem - 4} L${100 + 8} ${hem - 8} L${100 + 6} ${top + 54}Z" fill="url(#mt)" stroke="${L}" stroke-width="2" opacity=".95"/>`;
      s += `<rect x="${100 - ww - 2}" y="${top + 46}" width="${2 * ww + 4}" height="9" rx="4" fill="url(#gd)" stroke="${L}" stroke-width="1.8"/>`;
      s += `<path d="M${100 - hw} ${hem} Q100 ${hem + 8} ${100 + hw} ${hem} L${100 + hw - 2} ${hem - 6} Q100 ${hem + 2} ${100 - hw + 2} ${hem - 6}Z" fill="${trim}" stroke="${L}" stroke-width="1.4"/>`;
    } else {
      s += `<path d="${path}" fill="url(#rb)" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += `<path d="M${100 - hw} ${hem} Q100 ${hem + 8} ${100 + hw} ${hem} L${100 + hw - 2} ${hem - 8} Q100 ${hem} ${100 - hw + 2} ${hem - 8}Z" fill="${trim}" stroke="${L}" stroke-width="1.6"/>`;
      s += `<path d="M100 ${top + 4} L${100 - 10} ${top + 2} L100 ${hem - 8} L${110} ${top + 2}Z" fill="${inner}" opacity=".9"/>`;
      s += `<path d="M86 ${top + 2} L100 ${top + 26} L114 ${top + 2}" fill="none" stroke="${trim}" stroke-width="5" stroke-linejoin="round"/>`;
      if (o.bareBelly) s += `<ellipse cx="100" cy="${top + 40}" rx="${22 * bw * 0.8}" ry="20" fill="url(#sk)" stroke="${L}" stroke-width="2"/><circle cx="100" cy="${top + 44}" r="2" fill="${L}" opacity=".5"/>`;
      const sy = kind === 'dress' ? top + 26 : top + 40;
      s += `<rect x="${100 - ww - belly * 0.7}" y="${sy}" width="${2 * (ww + belly * 0.7)}" height="9" rx="4" fill="${sash}" stroke="${L}" stroke-width="1.8"/>`;
      if (kind === 'dress') s += `<path d="M96 ${sy + 8} q-6 26 -12 40 M104 ${sy + 8} q6 26 12 40" stroke="${sash}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      else s += `<circle cx="100" cy="${sy + 4.5}" r="5.5" fill="#4ad08a" stroke="${L}" stroke-width="1.4"/>`;
      if (kind === 'monk') { const k = o.kasaya || '#c8302a'; s += `<path d="M${100 - sw + 4} ${top + 8} L${100 + ww + 6} ${hem - 30} L${100 + ww - 14} ${hem - 14} L${100 - sw - 2} ${top + 26}Z" fill="${k}" stroke="${L}" stroke-width="2"/><path d="M${100 - sw + 14} ${top + 16} L${100 + ww - 6} ${hem - 26}" stroke="${trim}" stroke-width="2" stroke-dasharray="8 6"/><circle cx="${100 - sw + 10}" cy="${top + 16}" r="5" fill="url(#gd)" stroke="${L}" stroke-width="1.4"/>`; }
    }
    if (o.necklace) s += `<path d="M78 ${top + 4} Q100 ${top + 30} 122 ${top + 4}" fill="none" stroke="${o.necklace}" stroke-width="6" stroke-dasharray="1 6" stroke-linecap="round"/>`;
    if (o.skulls) s += [-18, -9, 0, 9, 18].map((d) => `<circle cx="${100 + d}" cy="${top + 14 + (18 - Math.abs(d)) * 0.5}" r="5" fill="#f4eee0" stroke="${L}" stroke-width="1.4"/>`).join('');
    return { s, top, sw, hem };
  }
  function arm(o, side, frame, bw, top, cast) {
    const sleeve = o.sleeve || o.robe || '#c8a060', trim = o.trim || '#e0b040', hand = o.hand || o.skin || '#ffe0c8';
    const sx = 100 + side * 31 * bw, hx = 100 + side * (42 * bw + 2), hy = 198 - (cast && side > 0 ? 34 : 0);
    const swing = frame === 1 ? 6 * side : frame === 2 ? -6 * side : 0;
    const armor = o.body === 'armor';
    let s = `<g transform="rotate(${swing} ${sx} ${top + 12})">`;
    if (armor) s += `<ellipse cx="${sx + side * 2}" cy="${top + 14}" rx="${15 * Math.min(bw, 1.25)}" ry="11" fill="url(#mt)" stroke="${L}" stroke-width="2"/>`;
    s += `<path d="M${sx - side * 8} ${top + 8} C${sx + side * 16} ${top + 14} ${hx + side * 12} ${hy - 22} ${hx + side * 12} ${hy - 4} L${hx - side * 12} ${hy + 2} C${hx - side * 8} ${hy - 18} ${sx - side * 2} ${top + 28} ${sx - side * 8} ${top + 22}Z" fill="${armor ? 'url(#rb)' : 'url(#sv)'}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<path d="M${hx + side * 12} ${hy - 4} L${hx - side * 12} ${hy + 2}" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>`;
    if (armor) s += `<ellipse cx="${sx + side * 2}" cy="${top + 14}" rx="${15 * Math.min(bw, 1.25)}" ry="11" fill="url(#mt)" stroke="${L}" stroke-width="2"/>`;
    s += `<circle cx="${hx}" cy="${hy + 4}" r="8.5" fill="${hand}" stroke="${L}" stroke-width="2"/></g>`;
    return { s, hx, hy: hy + 4 };
  }

  // ---------------- lắp ráp ----------------
  function svg(o0, frame = 0, expr = 'calm', mode = 'full') {
    const o = Object.assign({}, o0);
    if (expr === 'calm' && o._expr) expr = o._expr;
    const [bw, bh] = BUILD[o.build] || BUILD.male;
    const skin = o.skin || '#ffe0c8', hair = o.hair || '#24160e', robe = o.robe || '#c8a060', fur = o.fur || '#c8803a';
    const defs = `<defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(skin, 0.1)}"/><stop offset="1" stop-color="${sh(skin, -0.1)}"/></linearGradient>
      <radialGradient id="fc" cx=".45" cy=".4" r=".72"><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${mix(skin, '#d88a6a', 0.35)}"/></radialGradient>
      <radialGradient id="fur" cx=".42" cy=".36" r=".75"><stop offset=".3" stop-color="${sh(fur, 0.2)}"/><stop offset="1" stop-color="${sh(fur, -0.22)}"/></radialGradient>
      <linearGradient id="hr" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${sh(hair, hair === '#24160e' || hex(hair).reduce((a, b) => a + b) < 200 ? 0.28 : 0.12)}"/><stop offset=".6" stop-color="${hair}"/><stop offset="1" stop-color="${sh(hair, -0.2)}"/></linearGradient>
      <linearGradient id="ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(o.eyeColor || '#5a3a1a', -0.55)}"/><stop offset=".55" stop-color="${o.eyeColor || '#5a3a1a'}"/><stop offset="1" stop-color="${sh(o.eyeColor || '#5a3a1a', 0.6)}"/></linearGradient>
      <linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(robe, 0.18)}"/><stop offset=".55" stop-color="${robe}"/><stop offset="1" stop-color="${sh(robe, -0.28)}"/></linearGradient>
      <linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(o.sleeve || robe, 0.12)}"/><stop offset="1" stop-color="${sh(o.sleeve || robe, -0.22)}"/></linearGradient>
      <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(o.metal || '#c8cad8', 0.45)}"/><stop offset=".5" stop-color="${o.metal || '#c8cad8'}"/><stop offset="1" stop-color="${sh(o.metal || '#c8cad8', -0.35)}"/></linearGradient>
      <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".5" stop-color="#eec04a"/><stop offset="1" stop-color="#a8701a"/></linearGradient>
      <linearGradient id="stl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95a3"/><stop offset=".5" stop-color="#f4f8fc"/><stop offset="1" stop-color="#7d8794"/></linearGradient>
      <linearGradient id="pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8904a"/><stop offset=".5" stop-color="#8a5a2a"/><stop offset="1" stop-color="#4a2a12"/></linearGradient>
      <radialGradient id="hl" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="${o.halo || '#ffe08a'}" stop-opacity=".9"/><stop offset="1" stop-color="${o.halo || '#ffe08a'}" stop-opacity="0"/></radialGradient>
      <radialGradient id="fl" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff07a"/><stop offset=".5" stop-color="#ff8a1a" stop-opacity=".8"/><stop offset="1" stop-color="#ff3a1a" stop-opacity="0"/></radialGradient>
    </defs>`;
    const fem = o.body === 'dress' || o.lashes;
    if (mode === 'bust') {
      const robeShape = `<path d="M38 176 C42 152 68 144 100 144 C132 144 158 152 162 176Z" fill="url(#rb)" stroke="${L}" stroke-width="2.4"/><path d="M84 146 L100 168 L116 146" fill="none" stroke="${o.trim || '#e0b040'}" stroke-width="6"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="26 14 148 162">${defs}${o.halo ? '<circle cx="100" cy="96" r="70" fill="url(#hl)"/>' : ''}${hairBack(o, fem)}${robeShape}${head(o, expr)}</svg>`;
    }
    const bob = frame ? -3 : 0;
    const B = body(o, frame, bw, bh);
    const cast = expr === 'cast';
    const aL = arm(o, -1, frame, bw, B.top, false), aR = arm(o, 1, frame, bw, B.top, cast);
    let back = '';
    if (o.flameAura) back += `<ellipse cx="100" cy="170" rx="90" ry="100" fill="url(#fl)" opacity=".6"/>`;
    if (o.halo) back += `<circle cx="100" cy="92" r="74" fill="url(#hl)"/><circle cx="100" cy="92" r="60" fill="none" stroke="${o.halo}" stroke-width="3" opacity=".9"/>`;
    if (o.wings) back += `<path d="M84 170 C40 120 10 130 6 92 C30 104 40 96 50 110 C40 80 54 70 64 92 C66 70 80 80 84 120Z M116 170 C160 120 190 130 194 92 C170 104 160 96 150 110 C160 80 146 70 136 92 C134 70 120 80 116 120Z" fill="${o.wings}" stroke="${L}" stroke-width="2.2"/>`;
    if (o.spiderLegs) back += [-1, 1].map((sd) => [0, 1, 2].map((i) => `<path d="M${100 + sd * 20} ${180 + i * 10} Q${100 + sd * (60 + i * 8)} ${130 + i * 26} ${100 + sd * (84 + i * 6)} ${200 + i * 16}" fill="none" stroke="${L}" stroke-width="8" stroke-linecap="round"/><path d="M${100 + sd * 20} ${180 + i * 10} Q${100 + sd * (60 + i * 8)} ${130 + i * 26} ${100 + sd * (84 + i * 6)} ${200 + i * 16}" fill="none" stroke="${o.spiderLegs}" stroke-width="5" stroke-linecap="round"/>`).join('')).join('');
    if (o.cape) back += `<path d="M${100 - B.sw - 2} ${B.top + 10} C${70 - B.sw} ${B.top + 80} ${70 - B.sw} ${210} ${60 - B.sw * 0.5} ${244} Q100 ${236} ${140 + B.sw * 0.5} ${244} C${130 + B.sw} 210 ${130 + B.sw} ${B.top + 80} ${100 + B.sw + 2} ${B.top + 10}Z" fill="${o.cape}" stroke="${L}" stroke-width="2.2"/><path d="M${100 - B.sw} ${B.top + 20} C${80 - B.sw} ${B.top + 90} ${78 - B.sw} 210 ${70 - B.sw * 0.5} 240" stroke="${sh(o.cape, 0.25)}" stroke-width="3" fill="none" opacity=".7"/>`;
    back += tail(o);
    if (o.ribbon) back += `<path d="M${aL.hx} ${aL.hy} C20 120 60 70 100 ${B.top - 6} C140 70 180 120 ${aR.hx} ${aR.hy}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round" opacity=".85"/><path d="M${aL.hx} ${aL.hy} C20 120 60 70 100 ${B.top - 6} C140 70 180 120 ${aR.hx} ${aR.hy}" fill="none" stroke="${o.ribbon}" stroke-width="6" stroke-linecap="round"/><path d="M${aL.hx} ${aL.hy} q-14 26 -4 52 M${aR.hx} ${aR.hy} q14 26 4 52" fill="none" stroke="${o.ribbon}" stroke-width="6" stroke-linecap="round"/>`;
    const w = weapon(o.weapon, o, aR.hx, aR.hy);
    const off = o.offhand ? weapon(o.offhand, o, aL.hx, aL.hy) : '';
    const sc = o.build === 'giant' ? 1.0 : 1;
    const inner = `${back}${hairBack(o, fem)}${B.s}${aL.s}${off}${w}${aR.s}<g>${head(o, expr)}</g>`;
    const aura = o.aura ? `<g filter="url(#au)">${inner}</g>` : inner;
    const auraDef = o.aura ? `<filter id="au" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="${o.aura}" flood-opacity=".75"/><feComposite in2="d" operator="in" result="g"/><feGaussianBlur in="g" stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -10 212 272">${defs.replace('</defs>', auraDef + '</defs>')}<ellipse cx="100" cy="${246 - (1 - bh) * 40}" rx="${50 * Math.min(bw, 1.2)}" ry="10" fill="#000" opacity=".18"/><g transform="translate(0 ${bob}) scale(${sc})">${aura}</g></svg>`;
  }

  // ---------------- ảnh + canvas (bộ nhớ đệm) ----------------
  const cache = new Map();
  const CW = 212, CH = 272, RES = 2;
  function make(key, o, frame = 0, expr = 'calm', mode = 'full') {
    const k = key + '|' + frame + '|' + expr + '|' + mode;
    let r = cache.get(k);
    if (r) return r;
    const s = svg(o, frame, expr, mode);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    const cv = document.createElement('canvas');
    if (mode === 'bust') { cv.width = 148 * RES; cv.height = 162 * RES; } else { cv.width = CW * RES; cv.height = CH * RES; }
    const img = new Image();
    img.onload = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height); cv._ready = true; };
    img.src = url;
    r = { cv, url, vec: true };
    cache.set(k, r);
    return r;
  }
  return { svg, make, sh };
})();
