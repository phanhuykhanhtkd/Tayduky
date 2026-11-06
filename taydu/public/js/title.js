// =====================================================================
//  MÀN CHÀO: nền lửa thần thoại (pixel), logo thư pháp tự vẽ,
//  Tôn Ngộ Không cưỡi Cân Đẩu Vân, vòng Bát Quái với nút VÀO.
//  Toàn bộ hình ảnh tự vẽ bằng mã – không dùng tài nguyên của game gốc.
// =====================================================================
const Title = (() => {
  const $ = (s) => document.querySelector(s);
  let raf = 0, cv, g, W = 0, H = 0, fire, FW = 0, FH = 0, img, sky, embers = [], clouds = [], t0 = 0;

  // ---------- bảng màu lửa: đen → đỏ thẫm → cam → vàng → trắng ----------
  const PAL = [];
  (() => {
    const stops = [[0, [12, 4, 10]], [0.18, [70, 8, 14]], [0.36, [150, 22, 12]], [0.55, [216, 70, 14]], [0.72, [244, 140, 30]], [0.86, [255, 206, 80]], [1, [255, 248, 210]]];
    for (let i = 0; i < 37; i++) {
      const t = i / 36; let k = 0; while (k < stops.length - 2 && stops[k + 1][0] < t) k++;
      const [a, ca] = stops[k], [b, cb] = stops[k + 1], u = (t - a) / (b - a);
      PAL.push([0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * u)));
    }
  })();

  // ---------- trời, núi Hoa Quả, mây cát tường (vẽ một lần) ----------
  function paintSky() {
    sky = document.createElement('canvas'); sky.width = FW; sky.height = FH;
    const s = sky.getContext('2d');
    const gr = s.createLinearGradient(0, 0, 0, FH);
    gr.addColorStop(0, '#0c0310'); gr.addColorStop(0.35, '#2a0812'); gr.addColorStop(0.62, '#6a1410'); gr.addColorStop(1, '#a8300e');
    s.fillStyle = gr; s.fillRect(0, 0, FW, FH);
    // dither Bayer cho dải màu trời
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const id = s.getImageData(0, 0, FW, FH), d = id.data;
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const i = (y * FW + x) * 4, v = (B[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 10; d[i] += v; d[i + 1] += v * 0.5; d[i + 2] += v * 0.6; }
    s.putImageData(id, 0, 0);
    // trăng máu
    s.fillStyle = 'rgba(255,120,60,.16)'; s.beginPath(); s.arc(FW * 0.22, FH * 0.2, FW * 0.17, 0, 7); s.fill();
    s.fillStyle = '#f2a050'; s.beginPath(); s.arc(FW * 0.22, FH * 0.2, FW * 0.1, 0, 7); s.fill();
    s.fillStyle = '#ffd08a'; s.beginPath(); s.arc(FW * 0.205, FH * 0.19, FW * 0.075, 0, 7); s.fill();
    // ba lớp núi đá lởm chởm (núi xa nhạt, núi gần đậm)
    const ridge = (base, amp, col, seed) => {
      s.fillStyle = col; s.beginPath(); s.moveTo(0, FH);
      for (let x = 0; x <= FW; x++) {
        const n = Math.sin(x * 0.07 + seed) * 0.5 + Math.sin(x * 0.19 + seed * 2.3) * 0.28 + Math.abs(Math.sin(x * 0.031 + seed * 0.7)) * 0.9;
        s.lineTo(x, Math.round(base - n * amp));
      }
      s.lineTo(FW, FH); s.fill();
    };
    ridge(FH * 0.5, FH * 0.07, '#3a0c14', 1.3);
    ridge(FH * 0.58, FH * 0.09, '#260810', 4.1);
    ridge(FH * 0.66, FH * 0.08, '#160510', 7.7);
    // thác nước Thuỷ Liêm Động
    s.fillStyle = 'rgba(255,190,150,.28)'; s.fillRect(Math.round(FW * 0.7), Math.round(FH * 0.5), 2, Math.round(FH * 0.14));
  }

  // mây cát tường dạng pixel – xoáy cuộn đặc trưng
  function cloudSprite(w, col, edge) {
    const c = document.createElement('canvas'); c.width = w; c.height = Math.ceil(w * 0.42);
    const s = c.getContext('2d'), h = c.height;
    s.fillStyle = edge;
    const blob = (x, y, r) => { s.beginPath(); s.arc(x, y, r, 0, 7); s.fill(); };
    const shape = (k) => { blob(w * 0.25, h * 0.62, h * 0.32 + k); blob(w * 0.45, h * 0.42, h * 0.4 + k); blob(w * 0.66, h * 0.55, h * 0.34 + k); blob(w * 0.82, h * 0.7, h * 0.22 + k); s.fillRect(w * 0.14, h * 0.62, w * 0.74, h * 0.3 + k); };
    shape(1); s.fillStyle = col; shape(0);
    // xoáy cuộn
    s.strokeStyle = edge; s.lineWidth = 1;
    for (const [x, y, r] of [[w * 0.45, h * 0.46, h * 0.2], [w * 0.25, h * 0.66, h * 0.14], [w * 0.68, h * 0.6, h * 0.15]]) { s.beginPath(); s.arc(x, y, r, 0.3, 5.2); s.stroke(); s.beginPath(); s.arc(x + r * 0.2, y, r * 0.5, 2.4, 6.4); s.stroke(); }
    return c;
  }

  function resize() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    FW = Math.max(90, Math.round(W / 3)); FH = Math.max(160, Math.round(H / 3));
    cv.width = FW; cv.height = FH;
    fire = new Uint8Array(FW * FH);
    for (let x = 0; x < FW; x++) fire[(FH - 1) * FW + x] = 36;
    img = g.createImageData(FW, FH);
    paintSky();
    clouds = [];
    for (let i = 0; i < 6; i++) clouds.push({ c: cloudSprite(Math.round(FW * (0.28 + Math.random() * 0.22)), i % 2 ? '#d86a3a' : '#f0a050', i % 2 ? '#7a1e18' : '#a8361c'), x: Math.random() * FW, y: FH * (0.3 + Math.random() * 0.36), v: 0.04 + Math.random() * 0.06, a: 0.55 + Math.random() * 0.35 });
  }

  // lửa kiểu "doom fire": mỗi điểm lấy nhiệt từ điểm bên dưới, nguội dần, gió lệch ngang
  function stepFire(tm) {
    const wind = Math.sin(tm / 1700) * 1.2;
    for (let x = 0; x < FW; x++) fire[(FH - 1) * FW + x] = Math.min(36, 28 + ((Math.sin(x * 0.21 + tm / 300) + Math.sin(x * 0.07 - tm / 520)) * 2.6 + 4 | 0));
    for (let y = 1; y < FH; y++) for (let x = 0; x < FW; x++) {
      const src = y * FW + x, v = fire[src];
      if (!v) { fire[src - FW] = 0; continue; }
      const r = (Math.random() * 3.4) | 0;
      let dst = src - FW - r + 1 + Math.round(wind * Math.random());
      if (dst < 0) dst = 0;
      fire[dst] = Math.max(0, v - (Math.random() < (y < FH * 0.45 ? 0.75 : 0.36) ? 1 : 0));
    }
  }

  function frame(tm) {
    raf = requestAnimationFrame(frame);
    if (tm - t0 < 33) return; // ~30 khung hình/giây là đủ, tiết kiệm pin
    t0 = tm;
    stepFire(tm);
    g.drawImage(sky, 0, 0);
    for (const c of clouds) { c.x -= c.v; if (c.x < -c.c.width) c.x = FW + Math.random() * 20; g.globalAlpha = c.a; g.drawImage(c.c, Math.round(c.x), Math.round(c.y + Math.sin(tm / 2400 + c.v * 90) * 1.5)); }
    g.globalAlpha = 1;
    // pha lửa lên trên trời bằng cộng sáng
    const fd = img.data;
    for (let i = 0; i < fire.length; i++) {
      const v = fire[i], o = i * 4;
      if (v < 2) { fd[o + 3] = 0; continue; }
      const p = PAL[v]; fd[o] = p[0]; fd[o + 1] = p[1]; fd[o + 2] = p[2]; fd[o + 3] = Math.min(255, v * 11);
    }
    const tmp = frame.tmp || (frame.tmp = document.createElement('canvas'));
    if (tmp.width !== FW || tmp.height !== FH) { tmp.width = FW; tmp.height = FH; }
    tmp.getContext('2d').putImageData(img, 0, 0);
    g.globalCompositeOperation = 'lighter'; g.drawImage(tmp, 0, 0); g.globalCompositeOperation = 'source-over';
    // tàn lửa bay lên
    if (embers.length < 46 && Math.random() < 0.6) embers.push({ x: Math.random() * FW, y: FH - 2, vx: (Math.random() - 0.5) * 0.3, vy: -(0.35 + Math.random() * 0.7), life: 90 + Math.random() * 90, a: 0 });
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i]; e.x += e.vx + Math.sin((tm + i * 300) / 400) * 0.15; e.y += e.vy; e.a++;
      if (e.a > e.life || e.y < 0) { embers.splice(i, 1); continue; }
      const k = 1 - e.a / e.life;
      g.fillStyle = `rgba(255,${(180 + 70 * k) | 0},${(90 * k) | 0},${k})`; g.fillRect(e.x | 0, e.y | 0, 1, 1);
    }
  }

  // ---------- logo thư pháp (SVG tự thiết kế) ----------
  function logoSVG() {
    return `<svg viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".38" stop-color="#ffd76a"/><stop offset=".55" stop-color="#e09a2a"/><stop offset=".75" stop-color="#ffe08a"/><stop offset="1" stop-color="#a8601a"/></linearGradient>
  <linearGradient id="lg-ink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a0a10" stop-opacity="0"/><stop offset=".18" stop-color="#8a1018"/><stop offset=".8" stop-color="#b01a1e"/><stop offset="1" stop-color="#5a0a10" stop-opacity="0"/></linearGradient>
  <filter id="lg-fire" x="-25%" y="-60%" width="150%" height="190%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="3" result="n"><animate attributeName="baseFrequency" dur="1.6s" values="0.035 0.09;0.04 0.12;0.035 0.09" repeatCount="indefinite"/></feTurbulence>
    <feOffset in="n" dy="0" result="n2"><animate attributeName="dy" dur="1.1s" values="0;-24" repeatCount="indefinite"/></feOffset>
    <feDisplacementMap in="SourceGraphic" in2="n2" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="1.2"/>
  </filter>
  <linearGradient id="lg-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3a0a"/><stop offset=".5" stop-color="#ff8a1a"/><stop offset="1" stop-color="#ffe060"/></linearGradient>
  <filter id="lg-glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feFlood flood-color="#ff7a2a" flood-opacity=".75"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<path d="M14 104 C60 82 120 92 170 86 C230 78 290 70 348 88 C320 100 300 98 280 108 C220 122 150 116 96 124 C60 128 30 122 14 104Z" fill="url(#lg-ink)"/>
<path d="M30 112 C80 104 130 112 180 106 M200 100 C250 94 300 92 336 96" stroke="#d8402a" stroke-width="1.5" fill="none" opacity=".55"/>
<g filter="url(#lg-fire)" font-family="'Lora VN', Lora, Georgia, serif" font-weight="700" font-style="italic" text-anchor="middle" fill="none" stroke="url(#lg-flame)" stroke-linejoin="round" opacity=".95">
  <text x="138" y="60" font-size="50" letter-spacing="1" stroke-width="12">Tây Du</text>
  <text x="252" y="112" font-size="88" stroke-width="14">Ký</text>
</g>
<g filter="url(#lg-glow)" font-family="'Lora VN', Lora, Georgia, serif" font-weight="700" font-style="italic" text-anchor="middle" paint-order="stroke" stroke="#3a0608" stroke-linejoin="round">
  <text x="138" y="64" font-size="50" letter-spacing="1" fill="url(#lg-gold)" stroke-width="7">Tây Du</text>
  <text x="252" y="118" font-size="88" fill="url(#lg-gold)" stroke-width="9">Ký</text>
</g>
<g transform="translate(36 120)"><rect width="30" height="44" rx="3" fill="#c41e1e" stroke="#ffd0a0" stroke-width="1"/><rect x="3" y="3" width="24" height="38" rx="2" fill="none" stroke="#ffe8c8" stroke-width=".8" opacity=".8"/>
  <text x="15" y="18" font-size="12" text-anchor="middle" fill="#fff4e0" font-family="'PingFang SC','Hiragino Sans GB','Noto Sans CJK SC',serif">西遊</text><text x="15" y="34" font-size="12" text-anchor="middle" fill="#fff4e0" font-family="'PingFang SC','Hiragino Sans GB','Noto Sans CJK SC',serif">記</text></g>
<text x="190" y="156" font-size="13" letter-spacing="7" text-anchor="middle" fill="#ffd9a0" font-family="'Lora VN', Lora, Georgia, serif" font-weight="700" opacity=".92">— MOBILE —</text>
</svg>`;
  }

  // vòng Bát Quái quay chậm quanh nút VÀO
  function ringSVG() {
    const tri = ['111', '011', '101', '001', '110', '010', '100', '000']; // ☰☱☲☳☴☵☶☷
    let s = `<defs><radialGradient id="rg-core"><stop offset=".55" stop-color="#ffcf6a" stop-opacity="0"/><stop offset=".8" stop-color="#ff8a2a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient></defs>
<circle cx="150" cy="150" r="146" fill="url(#rg-core)"/>
<g class="rot"><circle cx="150" cy="150" r="128" fill="none" stroke="#e8c45a" stroke-width="2"/><circle cx="150" cy="150" r="121" fill="none" stroke="#e8c45a" stroke-width=".8" stroke-dasharray="2 4"/>`;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 360;
      s += `<g transform="rotate(${a} 150 150) translate(150 18)">`;
      tri[i].split('').forEach((b, k) => { const y = k * 5; s += b === '1' ? `<rect x="-11" y="${y}" width="22" height="3" fill="#ffd76a"/>` : `<rect x="-11" y="${y}" width="9" height="3" fill="#ffd76a"/><rect x="2" y="${y}" width="9" height="3" fill="#ffd76a"/>`; });
      s += '</g>';
    }
    for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.283; s += `<line x1="${150 + Math.cos(a) * 92}" y1="${150 + Math.sin(a) * 92}" x2="${150 + Math.cos(a) * (i % 6 ? 96 : 101)}" y2="${150 + Math.sin(a) * (i % 6 ? 96 : 101)}" stroke="#e8c45a" stroke-width="${i % 6 ? 1 : 2}"/>`; }
    s += `</g><circle cx="150" cy="150" r="88" fill="none" stroke="#7a1a10" stroke-width="5"/><circle cx="150" cy="150" r="88" fill="none" stroke="#ffd76a" stroke-width="1.2"/>`;
    return s;
  }

  const ICON = {
    register: '<svg viewBox="0 0 24 24"><path d="M4 20l1.2-4.4L15.6 5.2a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L8.4 18.8z" fill="currentColor"/><path d="M14 7l3 3" stroke="#3a0a08" stroke-width="1.4"/><path d="M3 22h18" stroke="currentColor" stroke-width="1.6"/></svg>',
    login: '<svg viewBox="0 0 24 24"><path d="M2 6h20l-2 3H4z M4 10h16v2H4z" fill="currentColor"/><path d="M6 12v10M18 12v10" stroke="currentColor" stroke-width="2.4"/><path d="M5 4c4-2 10-2 14 0" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    recover: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11.5 11.5L21 21M17 17l2.5-2.5M14.5 14.5l2-2" stroke="currentColor" stroke-width="2.4"/></svg>',
  };

  function init() {
    cv = $('#fire-bg'); if (!cv) return;
    g = cv.getContext('2d');
    $('#sp-logo').innerHTML = logoSVG();
    $('#sp-ring .sp-ring-art').innerHTML = ringSVG();
    document.querySelectorAll('.sp-orb').forEach((b) => (b.querySelector('i').innerHTML = ICON[b.dataset.go] || ''));
    try {
      const wk = Art.npc('ngokhong', 0, 3, 'angry'); if (wk) $('#sp-wukong').src = wk.url;
      const cl = Art.mount && Art.mount('candau'); if (cl) $('#sp-cloud').src = cl.url;
    } catch (e) { /* bỏ qua nếu thiếu hình */ }
    resize();
    addEventListener('resize', () => { if (!$('#scr-splash').hidden) resize(); });
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function resume() { if (!raf && cv) { resize(); raf = requestAnimationFrame(frame); } }
  return { init, stop, resume };
})();
