// =====================================================================
//  ĐỒ HOẠ VECTOR: nhân vật chibi (3 khung hình bước đi), phông cảnh chiến đấu,
//  biểu tượng, hoa văn khung, vòng pháp trận, hồ lô
//  Muốn dùng tranh vẽ riêng: đặt file PNG vào public/assets (xem README)
// =====================================================================
const Sprites = (() => {
  const LOOK = {
    than: { r1: '#fbf3df', r2: '#d9c391', trim: '#c9962e', inner: '#b63a2c', sash: '#a8322a', ribbon: '#f07a6a', hair: '#1f1612', hairHi: '#4a3a30', eye: '#7a3f12', boot: '#5b3a1e' },
    ma: { r1: '#9a2525', r2: '#4a0c0c', trim: '#d9a640', inner: '#2a0a0a', sash: '#1a1012', ribbon: '#3d1f4a', hair: '#1a0d10', hairHi: '#6a1d1d', eye: '#c42a2a', boot: '#1d1416' },
    yeu: { r1: '#7a5cc6', r2: '#3a2472', trim: '#7fe0c0', inner: '#2a1a55', sash: '#e0b04a', ribbon: '#9ff0d8', hair: '#ece4fb', hairHi: '#ffffff', eye: '#6a2fc5', boot: '#2a1d44' },
  };

  function hero(race, gender, frame = 0) {
    const L = LOOK[race] || LOOK.than;
    const f = gender === 'f';
    const lf = frame === 1 ? -4 : frame === 2 ? 3 : 0, rf = frame === 1 ? 3 : frame === 2 ? -4 : 0;
    const sw = frame === 1 ? 7 : frame === 2 ? -7 : 0;
    const bob = frame ? -1.2 : 0;
    const O = '#2a1a12';
    const hairBack = f || race === 'yeu'
      ? `<path d="M23 30 Q18 52 22 ${f ? 74 : 62} Q30 ${f ? 80 : 68} 40 ${f ? 76 : 64} Q50 ${f ? 80 : 68} 58 ${f ? 74 : 62} Q62 52 57 30Z" fill="url(#hair)" stroke="${O}" stroke-width="1"/>` : '';
    const tails = race === 'yeu'
      ? [[-18, 0.9], [0, 1], [18, 0.9]].map(([a, s]) => `<g transform="rotate(${a} 50 78) translate(50 78) scale(${s}) translate(-50 -78)"><path d="M50 78 Q76 76 74 52 Q70 40 64 46 Q68 62 52 70Z" fill="#f4eefe" stroke="${O}" stroke-width="1"/><path d="M70 50 Q72 44 66 45" fill="#c9b6f0"/></g>`).join('') : '';
    const ribbon = `<path d="M18 74 C2 46 22 36 40 44 C58 36 78 46 62 74" fill="none" stroke="${L.ribbon}" stroke-width="3.2" stroke-linecap="round" opacity=".92"/>
      <path d="M18 74 Q14 84 9 88" stroke="${L.ribbon}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M62 74 Q68 82 72 85" stroke="${L.ribbon}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const weapon = {
      than: `<g transform="rotate(${sw * 0.4} 64 74)"><line x1="65" y1="34" x2="68" y2="96" stroke="#7a5418" stroke-width="3" stroke-linecap="round"/><line x1="65" y1="34" x2="68" y2="96" stroke="#e8c160" stroke-width="1" stroke-linecap="round"/>
        <circle cx="64.6" cy="30" r="5.4" fill="none" stroke="#e8c160" stroke-width="2.2"/><circle cx="64.6" cy="30" r="2" fill="#cf3f2f"/><circle cx="60" cy="34" r="1.6" fill="#e8c160"/><circle cx="69" cy="34" r="1.6" fill="#e8c160"/></g>`,
      ma: `<g transform="rotate(${sw * 0.4} 64 74)"><rect x="62.5" y="70" width="3.4" height="18" rx="1.5" fill="#2a1410"/><path d="M60 70 L68.5 70 L72 22 Q62 30 60 70Z" fill="url(#steel)" stroke="${O}" stroke-width="1"/><path d="M64 66 L70 26" stroke="#fff" stroke-width=".8" opacity=".7"/><rect x="58.5" y="68" width="11.5" height="3.4" rx="1" fill="#d9a640" stroke="${O}" stroke-width=".7"/><path d="M64 88 q-3 6 -1 10 M64 88 q3 6 1 10" stroke="#c42a2a" stroke-width="1.6" fill="none"/></g>`,
      yeu: `<g transform="rotate(${-12 + sw * 0.5} 64 72)"><path d="M62 72 L50 48 A26 26 0 0 1 80 52 Z" fill="#9ff0d8" stroke="${O}" stroke-width="1"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M62 72 L${52 + i * 6.6} ${48 - Math.sin((i / 4) * Math.PI) * 4}" stroke="#2a5a50" stroke-width=".7"/>`).join('')}<path d="M54 52 q6 -4 12 -2" stroke="#c84a8a" stroke-width="1.4" fill="none"/></g>`,
    }[race];
    const shoulders = race === 'ma' ? `<path d="M22 52 Q26 44 36 48 L34 56 Q26 58 22 52Z" fill="#3a3540" stroke="${O}" stroke-width="1"/><path d="M58 52 Q54 44 44 48 L46 56 Q54 58 58 52Z" fill="#3a3540" stroke="${O}" stroke-width="1"/><path d="M24 51 Q28 46 35 49 M56 51 Q52 46 45 49" stroke="#d9a640" stroke-width="1" fill="none"/>` : '';
    const top = {
      than: f
        ? `<circle cx="27" cy="15" r="6" fill="url(#hair)" stroke="${O}"/><circle cx="53" cy="15" r="6" fill="url(#hair)" stroke="${O}"/><path d="M25 12 l-4 -5 M55 12 l4 -5" stroke="#e8c160" stroke-width="1.6"/><circle cx="21" cy="7" r="2" fill="#f07a6a"/><circle cx="59" cy="7" r="2" fill="#f07a6a"/>`
        : `<circle cx="40" cy="9" r="6.5" fill="url(#hair)" stroke="${O}"/><path d="M31 11 Q40 0 49 11 L46 14 L34 14Z" fill="url(#gold)" stroke="${O}" stroke-width=".9"/><circle cx="40" cy="8" r="1.8" fill="#cf3f2f"/><path d="M28 13 h24" stroke="#e8c160" stroke-width="1.6" stroke-linecap="round"/>`,
      ma: `<path d="M22 30 L16 14 L27 20 L26 7 L35 16 L40 4 L45 16 L54 7 L53 20 L64 14 L58 30Z" fill="url(#hair)" stroke="${O}" stroke-width="1"/>
           <path d="M27 16 Q18 6 21 -1 Q25 8 31 13Z" fill="#e9dfc8" stroke="${O}" stroke-width=".9"/><path d="M53 16 Q62 6 59 -1 Q55 8 49 13Z" fill="#e9dfc8" stroke="${O}" stroke-width=".9"/>`,
      yeu: `<path d="M24 20 L19 1 L33 13Z" fill="#f4eefe" stroke="${O}"/><path d="M24 16 L22 6 L29 12Z" fill="#f2a6c8"/><path d="M56 20 L61 1 L47 13Z" fill="#f4eefe" stroke="${O}"/><path d="M56 16 L58 6 L51 12Z" fill="#f2a6c8"/>
            ${f ? '<circle cx="54" cy="20" r="2.4" fill="#f2a6c8"/><circle cx="57" cy="22" r="1.6" fill="#fff"/>' : ''}`,
    }[race];
    const mark = race === 'ma' ? '<path d="M40 20 l-1.4 3.4 1.4 2 1.4 -2Z" fill="#e0262a"/>' : race === 'than' ? '<circle cx="40" cy="22.5" r="1.2" fill="#e0262a"/>' : '';
    const lash = f ? `<path d="M31 28.5 q3 -2.4 6.4 -.6 M43 27.9 q3.4 -1.8 6.4 .6" stroke="${O}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` : `<path d="M31 27 q3 -1.6 6 -.4 M43 26.6 q3 -1.2 6 .4" stroke="${O}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    const sideLocks = f ? `<path d="M24.5 30 Q22 44 26 52 Q28 42 28.5 32Z M55.5 30 Q58 44 54 52 Q52 42 51.5 32Z" fill="url(#hair)" stroke="${O}" stroke-width=".8"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -6 88 108">
<defs>
<linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L.r1}"/><stop offset="1" stop-color="${L.r2}"/></linearGradient>
<linearGradient id="hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.hairHi}"/><stop offset=".35" stop-color="${L.hair}"/><stop offset="1" stop-color="${L.hair}"/></linearGradient>
<radialGradient id="skin" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff1e2"/><stop offset=".7" stop-color="#f7d7b8"/><stop offset="1" stop-color="#e7b896"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".5" stop-color="#e8c160"/><stop offset="1" stop-color="#9a6a1a"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95a3"/><stop offset=".5" stop-color="#f1f5f9"/><stop offset="1" stop-color="#7d8794"/></linearGradient>
</defs>
<ellipse cx="40" cy="97" rx="21" ry="4.2" fill="#000" opacity=".28"/>
<g transform="translate(0 ${bob})">
${tails}${ribbon}${hairBack}
<ellipse cx="${34 + lf}" cy="92" rx="5.2" ry="3.4" fill="${L.boot}" stroke="${O}" stroke-width=".9"/>
<ellipse cx="${46 + rf}" cy="92" rx="5.2" ry="3.4" fill="${L.boot}" stroke="${O}" stroke-width=".9"/>
<path d="M27 50 Q40 45 53 50 L61 88 Q40 95 19 88Z" fill="url(#robe)" stroke="${O}" stroke-width="1.2"/>
<path d="M40 52 L36 91 L44 91Z" fill="${L.inner}" opacity=".85"/>
<path d="M19 88 Q40 95 61 88 L60 84 Q40 90.5 20 84Z" fill="${L.trim}" stroke="${O}" stroke-width=".7"/>
${shoulders}
<rect x="26" y="63" width="28" height="5.6" rx="1.4" fill="${L.sash}" stroke="${O}" stroke-width=".8"/>
<circle cx="40" cy="74" r="2.6" fill="#4cc29a" stroke="${O}" stroke-width=".7"/><path d="M40 76.6 V84 M38.6 84 h2.8" stroke="#c42a2a" stroke-width="1.2"/>
<path d="M32 48.5 L40 58 L48 48.5" fill="none" stroke="${L.trim}" stroke-width="2.4"/>
<g transform="rotate(${-sw} 28 52)"><path d="M28 51 Q14 55 13 74 Q22 79 31 71Z" fill="url(#robe)" stroke="${O}" stroke-width="1.1"/><path d="M13 74 Q22 79 31 71 L30 68 Q22 75 14.5 70.5Z" fill="${L.trim}"/><circle cx="17" cy="74" r="3.1" fill="url(#skin)" stroke="${O}" stroke-width=".7"/></g>
${weapon}
<g transform="rotate(${sw} 52 52)"><path d="M52 51 Q66 55 67 74 Q58 79 49 71Z" fill="url(#robe)" stroke="${O}" stroke-width="1.1"/><path d="M67 74 Q58 79 49 71 L50 68 Q58 75 65.5 70.5Z" fill="${L.trim}"/><circle cx="63" cy="74" r="3.1" fill="url(#skin)" stroke="${O}" stroke-width=".7"/></g>
<rect x="36.5" y="42" width="7" height="7" fill="#efc9a8"/>
<circle cx="40" cy="30" r="17" fill="url(#skin)" stroke="${O}" stroke-width="1.2"/>
${top}
<path d="M22.6 32 Q21 11 40 11 Q59 11 57.4 32 Q53 22 47 20.5 Q45 26 40 21.5 Q35 26 33 20.5 Q27 22 22.6 32Z" fill="url(#hair)" stroke="${O}" stroke-width="1"/>
${sideLocks}${mark}${lash}
<ellipse cx="34" cy="33.5" rx="3.6" ry="4.3" fill="#fff"/><ellipse cx="46" cy="33.5" rx="3.6" ry="4.3" fill="#fff"/>
<ellipse cx="34.4" cy="34.2" rx="2.7" ry="3.5" fill="${L.eye}"/><ellipse cx="45.6" cy="34.2" rx="2.7" ry="3.5" fill="${L.eye}"/>
<circle cx="34.6" cy="34.8" r="1.4" fill="#120a08"/><circle cx="45.4" cy="34.8" r="1.4" fill="#120a08"/>
<circle cx="35.5" cy="32.6" r="1.1" fill="#fff"/><circle cx="46.5" cy="32.6" r="1.1" fill="#fff"/><circle cx="33.5" cy="36.2" r=".5" fill="#fff"/><circle cx="44.5" cy="36.2" r=".5" fill="#fff"/>
<ellipse cx="29.5" cy="39" rx="2.8" ry="1.4" fill="#f59a86" opacity=".55"/><ellipse cx="50.5" cy="39" rx="2.8" ry="1.4" fill="#f59a86" opacity=".55"/>
<path d="M38 40.5 Q40 42 42 40.5" fill="none" stroke="#9c4a3a" stroke-width="1.1" stroke-linecap="round"/>
</g></svg>`;
  }

  // nhân vật dùng bản pixel art (pixel.js)
  function heroURL(race, gender, frame = 0, gear) { return Art.hero(race, gender, frame, 4, gear).url; }
  function heroImg(race, gender, frame = 0, gear, expr) { return Art.hero(race, gender, frame, 4, gear && gear.gear ? gear.gear : gear, expr).cv; }
  function faceURL(race, gender, gear, expr) { return Art.face(race, gender, gear && gear.gear ? gear.gear : gear, expr).url; }
  // ảnh của một đơn vị bất kỳ (trận đấu / tiên sủng): <img> pixel, tranh tuỳ chỉnh, hoặc emoji dự phòng
  function unitImg(u, cls = '', expr) {
    const custom = creatureSrc(u);
    if (custom) return `<img class="art ${cls}" src="${custom}" alt="">`;
    const a = Art.unit(u, 0, expr);
    if (a) return `<img class="px ${a.cv.width / a.cv.height < 0.9 ? 'hum' : 'beast'} ${u.form ? 'sz-' + Art.sizeOf(u.form) : ''} ${cls}" src="${a.url}" alt="">`;
    return `<span class="emo ${cls}">${u.icon || '❔'}</span>`;
  }
  function petImg(p, cls = '') { return unitImg({ form: p.sid ? p.sid.split(".")[0] : p.form, element: p.element, icon: p.icon, bossId: p.look }, cls + (p.chan ? " chan" : p.than ? " than" : "")); }

  function gourd(kind = 'silver') {
    const [a, b, c] = kind === 'gold' ? ['#fff3c4', '#e8b73c', '#8a6421'] : ['#ffffff', '#c3cad2', '#6d7680'];
    return `<svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g${kind}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient></defs>
      <path d="M18 3 l2 4" stroke="#6b3f14" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="18" cy="14" r="7" fill="url(#g${kind})" stroke="#3a2a12" stroke-width=".8"/><circle cx="18" cy="30" r="11.5" fill="url(#g${kind})" stroke="#3a2a12" stroke-width=".8"/>
      <rect x="13" y="19.5" width="10" height="3" rx="1.5" fill="#a8322a"/><path d="M14 26 q2 -3 5 -2" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/></svg>`;
  }

  // ---------- biểu tượng giao diện (nét vàng) ----------
  const I = (d, extra = '') => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}${extra}</svg>`;
  const ICONS = {
    mount: I('<path d="M7 27c0-6 2.4-10.4 6.4-13.2L10.6 8l5 2.2c3.2-2 7.2-1.6 10 1.2l2 5-3 1.2-2-2c-1 3-3.2 5-6.2 6V27"/><circle cx="21" cy="11" r="1.1" fill="currentColor"/><path d="M5 27h22"/>'),
    char: I('<circle cx="16" cy="12" r="5.5"/><path d="M16 3.6v2.2M12.4 5.2 16 6.6l3.6-1.4"/><path d="M6 28c1-6 5-9 10-9s9 3 10 9"/><path d="M13 19l3 4 3-4"/>'),
    pet: I('<path d="M8 25c-2-5 1-10 8-10s10 5 8 10c-1 3-15 3-16 0z"/><circle cx="9" cy="10" r="2.6"/><circle cx="15" cy="6.5" r="2.6"/><circle cx="21" cy="7" r="2.6"/><circle cx="25.5" cy="11.5" r="2.4"/>'),
    bag: I('<path d="M11 9c-4 3-6 8-6 12 0 5 4 7 11 7s11-2 11-7c0-4-2-9-6-12"/><path d="M10 9h12M12 5.5 16 9l4-3.5"/><path d="M12 18h8"/><circle cx="16" cy="18" r="2" fill="currentColor"/>'),
    quest: I('<path d="M8 6h15a3 3 0 0 1 0 6h-2v14a3 3 0 0 1-3 3H7a3 3 0 0 1 0-6h1z"/><path d="M8 23V6a3 3 0 0 0-3 3v1M12 13h6M12 17h6M12 21h4"/>'),
    act: I('<path d="M16 3v3M11 6h10M10 6c-3 2-4 6-4 10s1 8 4 10h12c3-2 4-6 4-10s-1-8-4-10"/><path d="M12 6c-1.5 3-2 6.5-2 10s.5 7 2 10M20 6c1.5 3 2 6.5 2 10s-.5 7-2 10M16 6v20"/><path d="M13 26v3h6v-3"/>'),
    social: I('<path d="M4 13c0-4.5 4.5-8 10-8s10 3.5 10 8-4.5 8-10 8c-1.4 0-2.7-.2-3.9-.6L5 23l1.6-4.2C5 17.3 4 15.3 4 13z"/><path d="M26 12.5c2 1.6 3 3.6 3 5.8 0 1.9-.8 3.6-2 5l1 3.7-4.1-1.9c-1 .3-2.1.4-3.2.4-2.4 0-4.5-.7-6-1.9"/>'),
    gear: I('<circle cx="16" cy="16" r="4"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>'),
    sound: I('<path d="M5 12h5l7-6v20l-7-6H5z"/><path d="M21 11c1.6 1.4 1.6 8.6 0 10M24.5 8c3.4 3 3.4 13 0 16"/>'),
    // lệnh chiến đấu
    attack: I('<path d="M6 26 22 10l3-6-6 3L3 23"/><path d="M5 21l6 6M3 29l3-3"/>'),
    skill: I('<path d="M16 3c3 5 8 7 8 14a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 5 3 5 0-4-1-7 1-11z"/>'),
    defend: I('<path d="M16 3 5 7v8c0 7 5 11 11 14 6-3 11-7 11-14V7z"/><path d="M16 9v14M10 14h12"/>'),
    item: I('<path d="M12 4h8M13 4v5l-5 7v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8l-5-7V4"/><path d="M9 19h14"/>'),
    catch: I('<circle cx="16" cy="10" r="5"/><circle cx="16" cy="22" r="7.5"/><path d="M13 15h6M16 5V3"/>'),
    flee: I('<path d="M4 20c4 0 4-4 8-4s4 4 8 4 4-4 8-4"/><path d="M4 26c4 0 4-4 8-4s4 4 8 4 4-4 8-4"/><path d="M18 5l5 5-5 5M8 10h15"/>'),
    // Đợt 2–6
    than3: I('<path d="M16 3l2.6 6.2 6.6.5-5 4.4 1.6 6.5L16 17.2 10.2 20.6l1.6-6.5-5-4.4 6.6-.5z"/><path d="M8 25c2.5 2.2 5.2 3.2 8 3.2s5.5-1 8-3.2"/>'),
    ach: I('<circle cx="16" cy="12" r="7"/><path d="M12.5 18.5 10 29l6-3 6 3-2.5-10.5"/><path d="M16 8.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>'),
    codex: I('<path d="M5 6c4-1.5 7.5-1 11 1.4C19.5 5 23 4.5 27 6v20c-4-1.5-7.5-1-11 1.4C12.5 25 9 24.5 5 26z"/><path d="M16 7.4v20"/><circle cx="10.5" cy="13" r="2"/><path d="M20 12h4M20 16h4M8 19h5"/>'),
    nm: I('<path d="M3 16c4-6.5 8.5-9.5 13-9.5S25 9.5 29 16c-4 6.5-8.5 9.5-13 9.5S7 22.5 3 16z"/><circle cx="16" cy="16" r="4.5"/><path d="M16 13.5v5M8 6 6 3M24 6l2-3M16 5V2"/>'),
    dg: I('<path d="M4 12 16 5l12 7"/><path d="M7 11v15h18V11"/><path d="M3 26h26M13 26v-7a3 3 0 0 1 6 0v7"/><path d="M10 15h2M20 15h2"/>'),
    stall: I('<path d="M5 12h22l-2-6H7z"/><path d="M5 12c0 2 1.6 3 3.2 3s3.2-1 3.2-3c0 2 1.6 3 3.2 3s3.2-1 3.2-3c0 2 1.6 3 3.2 3s3.2-1 3.2-3"/><path d="M7 15v11h18V15M12 26v-6h8v6"/>'),
  };

  // ---------- hoa văn mây (tường vân) cho góc khung ----------
  const corner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="#d4a53c"/><stop offset="1" stop-color="#7a5418"/></linearGradient></defs>
    <g fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"><path d="M4 44V12a8 8 0 0 1 8-8h32"/><path d="M10 40V18a8 8 0 0 1 8-8h22"/>
    <path d="M18 26c0-4 3-7 7-7s6 3 6 6-2 5-5 5-4-2-4-4 1-3 3-3"/></g><circle cx="4" cy="4" r="3.4" fill="#cf3f2f" stroke="#7a5418" stroke-width="1.4"/></svg>`;
  const cornerURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(corner);
  function corners() {
    const inner = corner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const rot = (deg) => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g transform="rotate(${deg} 24 24)">${inner}</g></svg>`) + '")';
    return { tl: rot(0), tr: rot(90), br: rot(180), bl: rot(270) };
  }

  // vòng pháp trận dưới chân
  function circle(color) {
    const runes = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<rect x="${50 + Math.cos(a) * 40 - 2}" y="${50 + Math.sin(a) * 40 - 4}" width="4" height="8" rx="1" transform="rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40})"/>`; }).join('');
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="2"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="34" stroke-dasharray="4 3"/><path d="M50 16 L79 66 L21 66Z M50 84 L21 34 L79 34Z" stroke-width="1.4" opacity=".8"/></g><g fill="${color}">${runes}</g></svg>`;
  }

  // ---------- phông cảnh chiến đấu ----------
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  function ridge(r, y0, amp, rough, step = 12, w = 400, h = 760) {
    let d = `M0 ${h} L0 ${y0}`;
    let y = y0;
    for (let x = 0; x <= w + step; x += step) { y = y0 - amp * (0.5 + 0.5 * Math.sin(x / 70 + r() * 0.6)) - (r() - 0.5) * rough; d += ` L${x} ${y.toFixed(1)}`; }
    return d + ` L${w} ${h}Z`;
  }
  function peaks(r, base, n, hmin, hmax, w = 400, wide = 1) {
    let d = `M0 760 L0 ${base}`;
    for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5) / n) * w + (r() - 0.5) * 30, hh = hmin + r() * (hmax - hmin), bw = (26 + r() * 30) * wide;
      d += ` L${cx - bw} ${base} Q${cx - bw * 0.35} ${base - hh * 0.6} ${cx - 4} ${base - hh} Q${cx + 4} ${base - hh - 6} ${cx + 6} ${base - hh + 2} Q${cx + bw * 0.4} ${base - hh * 0.55} ${cx + bw} ${base}`;
    }
    return d + ` L${w} ${base} L${w} 760Z`;
  }
  function clouds(r, y, n, color, op) {
    let s = '';
    for (let i = 0; i < n; i++) { const x = r() * 440 - 20, yy = y + (r() - 0.5) * 30, w = 50 + r() * 70; s += `<g opacity="${op}" fill="${color}"><ellipse cx="${x}" cy="${yy}" rx="${w}" ry="${w * 0.22}"/><ellipse cx="${x - w * 0.3}" cy="${yy - 8}" rx="${w * 0.4}" ry="${w * 0.2}"/><ellipse cx="${x + w * 0.25}" cy="${yy - 10}" rx="${w * 0.35}" ry="${w * 0.22}"/></g>`; }
    return s;
  }
  function roof(x, y, w, col, eave = '#2b2018') {
    return `<path d="M${x - w * 0.62} ${y + 6} Q${x - w * 0.45} ${y + 2} ${x - w * 0.35} ${y - 10} L${x + w * 0.35} ${y - 10} Q${x + w * 0.45} ${y + 2} ${x + w * 0.62} ${y + 6} Q${x} ${y} ${x - w * 0.62} ${y + 6}Z" fill="${col}" stroke="${eave}" stroke-width="1"/>`;
  }
  function pagoda(x, base, levels, w, col, wall) {
    let s = '';
    for (let i = 0; i < levels; i++) { const ww = w * (1 - i * 0.14), y = base - i * 26; s += `<rect x="${x - ww * 0.3}" y="${y - 6}" width="${ww * 0.6}" height="20" fill="${wall}"/>${roof(x, y - 6, ww, col)}`; }
    return s + `<path d="M${x} ${base - levels * 26 - 14} v-16" stroke="${col}" stroke-width="2"/>`;
  }

  const bgCache = {};
  function battleBG(theme) {
    if (typeof Tiles !== 'undefined') return Tiles.battleBG(theme);
    if (bgCache[theme]) return bgCache[theme];
    const r = rng({ heaven: 7, city: 11, forest: 23, desert: 31, arena: 41, world: 53, login: 61, river: 67, cave: 71, snow: 79 }[theme] || 3);
    let s = '';
    const sky = {
      heaven: ['#f9e7b6', '#d9b9e8', '#6f63b0'], city: ['#ffd29a', '#e0805a', '#5a2e3a'], forest: ['#d7f0d0', '#7fb8a0', '#2a4b42'],
      river: ['#e8f4d8', '#8ac8b8', '#3a7a8a'], cave: ['#4a3a5a', '#2a1e34', '#100a18'], snow: ['#ffffff', '#c8dcf0', '#7a9ac0'],
      desert: ['#ffcf7a', '#e0603a', '#5a1a14'], arena: ['#5a1414', '#2a0808', '#100404'], world: ['#3b5a78', '#1b2f45', '#08121c'], login: ['#0c1a2e', '#3b2433', '#b0603a'],
    }[theme];
    s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[2]}"/><stop offset=".55" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[0]}"/></linearGradient>
      <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#ffe7a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".4" stop-color="#ff6a2a"/><stop offset="1" stop-color="#8a1a0a"/></linearGradient></defs>
      <rect width="400" height="760" fill="url(#sky)"/>`;
    if (theme === 'heaven') {
      s += `<circle cx="300" cy="170" r="150" fill="url(#sun)"/>`;
      for (let i = 0; i < 7; i++) s += `<path d="M300 170 L${-40 + i * 70} 760 L${-10 + i * 70} 760Z" fill="#fff6d0" opacity=".08"/>`;
      s += clouds(r, 150, 6, '#fff', 0.5);
      s += `<g opacity=".55">${pagoda(110, 300, 4, 70, '#d4a53c', '#a8322a')}${pagoda(300, 280, 3, 60, '#d4a53c', '#a8322a')}</g>`;
      s += `<path d="${ridge(r, 330, 20, 10)}" fill="#fff" opacity=".65"/>` + clouds(r, 340, 8, '#fff', 0.85);
      s += `<path d="${ridge(r, 420, 26, 14)}" fill="#f4ecff" opacity=".9"/>` + clouds(r, 430, 10, '#fff', 0.9);
      s += `<rect y="430" width="400" height="330" fill="#e9defa" opacity=".5"/>`;
    } else if (theme === 'city') {
      s += `<circle cx="90" cy="240" r="120" fill="url(#sun)"/><circle cx="90" cy="240" r="30" fill="#fff1c0" opacity=".9"/>`;
      s += clouds(r, 160, 5, '#ffe2b8', 0.4);
      s += `<path d="${peaks(r, 330, 4, 60, 110)}" fill="#8a4a4a" opacity=".45"/>`;
      s += `<g fill="#3a1e24" opacity=".85">${pagoda(320, 330, 5, 62, '#3a1e24', '#3a1e24')}<rect x="0" y="330" width="400" height="60"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 20 + 2}" y="322" width="12" height="10"/>`).join('')}</g>`;
      s += `<g>${roof(200, 318, 120, '#2a141a', '#2a141a')}<rect x="150" y="318" width="100" height="40" fill="#2a141a"/></g>`;
      for (let i = 0; i < 9; i++) { const x = 20 + i * 45, y = 300 + Math.sin(i) * 8; s += `<circle cx="${x}" cy="${y}" r="9" fill="#ff8a3a" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="4" ry="5" fill="#ff5a2a"/>`; }
      s += `<path d="M-10 296 Q90 320 200 300 T410 298" stroke="#2a141a" stroke-width="1" fill="none"/>`;
      s += `<rect y="390" width="400" height="370" fill="#6a4030"/><rect y="390" width="400" height="80" fill="url(#fog)" opacity=".5"/>`;
    } else if (theme === 'forest') {
      s += `<circle cx="280" cy="150" r="110" fill="url(#sun)" opacity=".8"/>`;
      s += `<path d="${peaks(r, 330, 6, 120, 220, 400, 1.9)}" fill="#7fae9a" opacity=".55"/><rect y="250" width="400" height="90" fill="url(#fog)"/>`;
      s += `<path d="${peaks(r, 380, 5, 90, 170, 400, 2.1)}" fill="#3f7a5e" opacity=".85"/>`;
      s += `<path d="M262 200 Q258 300 266 400" stroke="#e8fbff" stroke-width="14" opacity=".75"/><path d="M262 200 Q258 300 266 400" stroke="#fff" stroke-width="4" opacity=".9"/><ellipse cx="266" cy="402" rx="40" ry="10" fill="#fff" opacity=".5"/>`;
      s += `<rect y="300" width="400" height="120" fill="url(#fog)"/>`;
      for (let i = 0; i < 12; i++) { const x = r() * 400, h = 60 + r() * 70; s += `<path d="M${x} ${430 - h} L${x - 16} ${430} L${x + 16} ${430}Z M${x} ${430 - h * 0.7} L${x - 20} ${440 - h * 0.2} L${x + 20} ${440 - h * 0.2}Z" fill="#1f3f2c"/>`; }
      s += `<rect y="430" width="400" height="330" fill="#3c5e34"/>`;
    } else if (theme === 'desert') {
      s += `<circle cx="200" cy="330" r="200" fill="#ff8a3a" opacity=".25"/>`;
      s += `<path d="M110 360 L180 230 Q200 220 220 230 L290 360Z" fill="#5a1a14"/><path d="M180 230 Q200 220 220 230 L210 250 Q200 244 190 250Z" fill="url(#lava)"/>`;
      s += `<path d="M195 246 Q190 300 170 360 M205 246 Q215 300 232 360" stroke="#ff6a2a" stroke-width="3" fill="none" opacity=".8"/>`;
      for (let i = 0; i < 5; i++) s += `<ellipse cx="${190 + r() * 20}" cy="${200 - i * 30}" rx="${20 + i * 10}" ry="${10 + i * 5}" fill="#3a1410" opacity="${0.4 - i * 0.06}"/>`;
      s += `<path d="${ridge(r, 380, 30, 8)}" fill="#a8502a"/><path d="${ridge(r, 420, 24, 6)}" fill="#c87a3a"/>`;
      s += `<rect y="430" width="400" height="330" fill="#d9944a"/>`;
    } else if (theme === 'river') {
      s += `<circle cx="110" cy="160" r="110" fill="url(#sun)" opacity=".7"/>` + clouds(r, 140, 5, '#fff', 0.5);
      s += `<path d="${peaks(r, 330, 5, 90, 170, 400, 2)}" fill="#6a9a8a" opacity=".6"/><rect y="260" width="400" height="80" fill="url(#fog)"/>`;
      s += `<rect y="340" width="400" height="90" fill="#3a8aa8"/>`;
      for (let i = 0; i < 14; i++) s += `<path d="M${r() * 400} ${350 + r() * 70} q12 -4 24 0" stroke="#e8fbff" stroke-width="2" fill="none" opacity=".6"/>`;
      s += `<path d="M260 380 l60 0 l-10 10 l-40 0z" fill="#5a3a20"/><path d="M290 380 v-40 l18 30z" fill="#f2ead8"/>`;
      for (let i = 0; i < 10; i++) { const x = r() * 400; s += `<path d="M${x} 430 q-4 -30 2 -50 M${x + 4} 430 q4 -26 -2 -44" stroke="#3a6a3a" stroke-width="2" fill="none"/>`; }
      s += `<rect y="430" width="400" height="330" fill="#6a8a52"/>`;
    } else if (theme === 'cave') {
      for (let i = 0; i < 9; i++) { const x = r() * 400, h = 60 + r() * 120; s += `<path d="M${x - 14} 0 L${x} ${h} L${x + 14} 0Z" fill="#2a2034"/>`; }
      s += `<ellipse cx="200" cy="300" rx="190" ry="120" fill="#3a2a4a" opacity=".6"/>`;
      for (let i = 0; i < 18; i++) { const x = r() * 400, y = 200 + r() * 220; s += `<path d="M${x} ${y} l5 -16 l5 16z" fill="${['#7ad8c8', '#b88ae8', '#5ab0e8'][i % 3]}" opacity=".8"/><circle cx="${x + 5}" cy="${y - 6}" r="10" fill="${['#7ad8c8', '#b88ae8', '#5ab0e8'][i % 3]}" opacity=".15"/>`; }
      s += `<path d="${ridge(r, 420, 20, 14, 10)}" fill="#2a2234"/><rect y="430" width="400" height="330" fill="#3a3044"/>`;
    } else if (theme === 'snow') {
      s += `<circle cx="300" cy="150" r="110" fill="url(#sun)" opacity=".45"/>`;
      s += `<path d="${peaks(r, 340, 5, 130, 230, 400, 2)}" fill="#e8f0fa"/><path d="${peaks(r, 340, 5, 130, 230, 400, 2)}" fill="#8aa0c0" opacity=".35"/>`;
      s += `<rect y="250" width="400" height="100" fill="url(#fog)"/><rect y="350" width="400" height="80" fill="#b8d8f0"/>`;
      for (let i = 0; i < 8; i++) s += `<path d="M${r() * 400} ${360 + r() * 60} l40 4" stroke="#ffffff" stroke-width="1.5" opacity=".8"/>`;
      for (let i = 0; i < 60; i++) s += `<circle cx="${r() * 400}" cy="${r() * 760}" r="${r() * 1.8 + 0.6}" fill="#fff" opacity=".85"/>`;
      s += `<rect y="430" width="400" height="330" fill="#e8f0f8"/>`;
    } else if (theme === 'arena') {
      for (let i = 0; i < 5; i++) { const x = 20 + i * 90; s += `<rect x="${x}" y="120" width="26" height="320" fill="#5a1010"/><rect x="${x - 4}" y="112" width="34" height="14" fill="#d4a53c"/><path d="M${x + 30} 140 h28 v110 l-14 -14 -14 14Z" fill="#a8322a" opacity=".85"/><circle cx="${x + 13}" cy="100" r="16" fill="#ff8a3a" opacity=".35"/><path d="M${x + 13} 88 q6 8 0 16 q-6 -8 0 -16" fill="#ffd27a"/>`; }
      s += `<rect y="430" width="400" height="330" fill="#3a1612"/>`;
    } else if (theme === 'world') {
      s += clouds(r, 120, 8, '#0b1620', 0.8) + clouds(r, 200, 6, '#24384a', 0.7);
      s += `<path class="bolt" d="M260 40 L240 140 L262 140 L230 260" stroke="#e8f6ff" stroke-width="3" fill="none"/>`;
      s += `<path d="${ridge(r, 380, 18, 10, 8)}" fill="#1b3a52"/><path d="${ridge(r, 410, 14, 12, 8)}" fill="#24506e"/>`;
      s += `<rect y="430" width="400" height="330" fill="#173248"/>`;
    } else if (theme === 'login') {
      s += `<circle cx="300" cy="150" r="140" fill="url(#sun)" opacity=".55"/><circle cx="300" cy="150" r="46" fill="#fff4d0"/>`;
      for (let i = 0; i < 40; i++) s += `<circle cx="${r() * 400}" cy="${r() * 300}" r="${r() * 1.2 + 0.3}" fill="#fff" opacity="${r() * 0.8}"/>`;
      s += `<path d="${peaks(r, 520, 6, 150, 280, 400, 1.8)}" fill="#2a1828"/><rect y="420" width="400" height="140" fill="url(#fog)" opacity=".7"/>`;
      s += `<path d="${peaks(r, 600, 4, 120, 200, 400, 2.4)}" fill="#1d1018"/>`;
      s += clouds(r, 560, 10, '#eadbb8', 0.25);
      s += `<rect y="600" width="400" height="160" fill="#140b0a"/>`;
    }
    return (bgCache[theme] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 760" preserveAspectRatio="xMidYMid slice">${s}</svg>`));
  }

  // ---------- kết cấu giấy dó ----------
  function paperTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const g = c.getContext('2d'); const d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = 200 + Math.random() * 55; d.data[i] = v; d.data[i + 1] = v * 0.93; d.data[i + 2] = v * 0.78; d.data[i + 3] = 22; }
    g.putImageData(d, 0, 0);
    g.strokeStyle = 'rgba(120,90,40,.10)';
    for (let i = 0; i < 60; i++) { g.beginPath(); const x = Math.random() * 160, y = Math.random() * 160; g.moveTo(x, y); g.quadraticCurveTo(x + Math.random() * 20 - 10, y + Math.random() * 20, x + Math.random() * 30 - 15, y + Math.random() * 30 - 15); g.stroke(); }
    return c.toDataURL();
  }

  // ---------- tranh tuỳ chỉnh (nếu người dùng thêm PNG vào public/assets) ----------
  let ASSETS = {};
  // đường dẫn tranh thật nếu có (hỗ trợ cả kiểu danh sách cũ)
  function art(k, id) { const a = ASSETS[k]; if (!a || id == null) return null; if (Array.isArray(a)) return a.includes(id) ? `assets/${k}/${id}.png` : null; return a[id] ? `assets/${k}/${a[id]}` : null; }
  function setAssets(a) { if (a) ASSETS = a; if (Art.setOverride) Art.setOverride(art); }
  function creatureSrc(u) { return (u.bossId && ((u.art && art('bosses', u.art)) || art('bosses', u.bossId))) || (u.form && petArt(u.form, u.element)) || (u.hid && art('npcs', u.hid)) || null; }
  // tiên sủng: có tranh riêng cho hệ thì dùng luôn; không thì lấy tranh gốc của loài rồi nhuộm màu + hào quang theo hệ
  const ELS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
  const TINT_COL = { kim: '#f2cf5a', moc: '#5cc85a', thuy: '#4aa8f0', hoa: '#f0583a', tho: '#c8904a' };
  const TINT = {};
  function petArt(form, el) {
    const own = el && art('monsters', form + '_' + el);
    if (own) return own;
    let base = art('monsters', form);
    if (!base) { const alt = ELS.map((e) => art('monsters', form + '_' + e)).find(Boolean); if (!alt) return null; base = alt; }
    if (!el || !TINT_COL[el]) return base;
    return tinted(base, el);
  }
  function tinted(src, el) {
    const k = src + '#' + el;
    if (typeof TINT[k] === 'string') return TINT[k];
    if (!TINT[k]) {
      TINT[k] = 1;
      const im = new Image();
      im.onload = () => {
        try {
          const w = im.naturalWidth, h = im.naturalHeight, pad = Math.round(Math.max(w, h) * 0.06);
          const a = document.createElement('canvas'); a.width = w; a.height = h;
          const x = a.getContext('2d');
          x.drawImage(im, 0, 0);
          x.globalCompositeOperation = 'color'; x.globalAlpha = 0.5; x.fillStyle = TINT_COL[el]; x.fillRect(0, 0, w, h);
          x.globalCompositeOperation = 'destination-in'; x.globalAlpha = 1; x.drawImage(im, 0, 0);
          const b = document.createElement('canvas'); b.width = w + pad * 2; b.height = h + pad * 2;
          const y = b.getContext('2d');
          y.shadowColor = TINT_COL[el]; y.shadowBlur = pad * 0.9; y.drawImage(a, pad, pad); y.shadowBlur = pad * 0.4; y.drawImage(a, pad, pad);
          const url = b.toDataURL('image/webp', 0.85);
          TINT[k] = url;
          document.querySelectorAll('img').forEach((i) => { if (i.getAttribute('src') === k) i.src = url; });
        } catch (e) { TINT[k] = src; }
      };
      im.onerror = () => { TINT[k] = src; };
      im.src = src;
    }
    return k;
  }
  function npcSrc(id) { return art('npcs', id); }
  const mapArt = (id) => art('maps', id), mapFront = (id) => art('maps', id + '_front'), battleArt = (th) => art('battle', th);

  function itemIcon(id, items) {
    const it = items[id];
    if (!it) return '❔';
    if (it.icon === 'gourd-silver') return gourd('silver');
    if (it.icon === 'gourd-gold') return gourd('gold');
    return it.icon;
  }
  function elemFilter(el, elements) {
    if (!el || !elements[el]) return '';
    return `hue-rotate(${elements[el].hue}deg) saturate(1.15)`;
  }

  return { hero, heroURL, heroImg, faceURL, unitImg, petImg, gourd, ICONS, cornerURL, corners, circle, battleBG, paperTexture, itemIcon, elemFilter, setAssets, creatureSrc, npcSrc, mapArt, mapFront, battleArt, art, LOOK };
})();
