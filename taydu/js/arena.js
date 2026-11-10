// =====================================================================
//  SÂN ĐẤU 3D: nền chiến đấu dựng bằng WebGL (đài Bát Quái, cảnh vùng,
//  trời mây, núi xa) + ánh sáng chiêu thức: mỗi chiêu rọi màu riêng
//  xuống mặt đài, pháp trận xoay dưới chân, chớp sáng khi bạo kích/sấm.
// =====================================================================
const Arena = (() => {
  let R = null, cv = null, on = false, theme = 'city', Wd = null, raf = 0, failed = false;
  const lights = [], decals = [], cache = {};
  let flashes = [], dimK = 1, t0 = performance.now();
  const hexf = (h) => { if (Array.isArray(h)) return h; const n = parseInt(String(h).replace('#', '').slice(0, 6), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

  function ensure() {
    if (R) return R.ok && !failed;
    cv = $('#b-3d');
    if (!cv || typeof World3D === 'undefined' || typeof Hd2d === 'undefined' || !Hd2d.create) return false;
    let pref = true; try { pref = localStorage.getItem('tdk_hd') !== '0'; } catch {}
    if (!pref) return false;
    R = Hd2d.create({ shadow: 1024 });
    return R.init(cv);
  }
  function show(th) {
    if (!ensure()) return false;
    theme = World3D.AR[th] ? th : th === 'world' ? 'river' : 'city';
    try {
      if (!cache[theme]) cache[theme] = World3D.arena(theme);
      Wd = cache[theme];
      if (!R.hasWorld(Wd.key)) R.setWorld(Wd);
    } catch (e) { console.warn('[Arena]', e); failed = true; return false; }
    lights.length = 0; decals.length = 0; flashes = []; dimK = 1;
    on = true; resize();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    return true;
  }
  function hide() { on = false; cancelAnimationFrame(raf); lights.length = 0; decals.length = 0; }
  let lastW = 0, lastH = 0;
  function resize() {
    if (!R || !cv) return;
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    lastW = r.width; lastH = r.height;
    R.resize(r.width, r.height, Math.min(FX.low ? 1.25 : 2, window.devicePixelRatio || 1));
  }
  addEventListener('resize', () => { if (on) resize(); });

  // toạ độ màn hình (so với #battle) → điểm trên mặt đài
  function ground(p) { if (!R || !on || !p) return null; const g = R.pick(p.x, p.y); if (!g || !isFinite(g.x)) return null; return { x: Math.max(-9, Math.min(9, g.x)), z: Math.max(-8, Math.min(8, g.z)) }; }

  // chiêu thức: rọi đèn màu + pháp trận dưới chân
  function burst(p, col, o = {}) {
    const g = ground(p); if (!g) return;
    const now = performance.now(), c = hexf(col);
    lights.push({ x: g.x, z: g.z, r: o.r || 3, i: o.i ?? 1.6, col: c, t: now, dur: o.dur || 700, up: o.up || 90 });
    if (lights.length > 9) lights.shift();
    if (o.sigil !== 0) decals.push({ x: g.x, z: g.z, r: o.sigil || 1.25, col: c, t: now, dur: o.dur || 700, spin: o.spin ?? 1.6, a: o.a ?? 0.9 });
    if (decals.length > 8) decals.shift();
  }
  // chớp toàn cảnh (sấm, bạo kích, chiến thắng)
  function flash(col, k = 0.4, dur = 260) { flashes.push({ c: hexf(col), k, t: performance.now(), dur }); }

  function frame(now) {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    const root = $('#battle'); if (!root || root.hidden || document.hidden) return;
    if (cv.clientWidth !== lastW || cv.clientHeight !== lastH) resize();
    if (!lastW) return;
    const t = (now - t0) / 1000;
    dimK += ((root.classList.contains('dim') ? 0.52 : 1) - dimK) * 0.12;
    // ánh sáng: lư hương lập loè + chiêu thức
    const L = [], glows = [];
    const dark = theme === 'cave';
    for (const [x, y, z] of Wd.lamps) {
      const fl = 0.85 + 0.15 * Math.sin(t * 13 + x * 3) * Math.sin(t * 7.3 + z);
      L.push([x, z, dark ? 4.2 : 2.6, (dark ? 1.3 : 0.7) * fl, [1.0, 0.62, 0.28]]);
      glows.push({ x, y: y + 0.05, z, w: 0.42 * fl, h: 0.55 * fl, col: [1, 0.62, 0.25, dark ? 0.9 : 0.6] });
    }
    const dec = [];
    for (let i = lights.length - 1; i >= 0; i--) {
      const l = lights[i], k = (now - l.t) / l.dur; if (k >= 1) { lights.splice(i, 1); continue; }
      const a = Math.min(1, (now - l.t) / l.up) * (1 - k) * (1 - k);
      L.push([l.x, l.z, l.r * (0.8 + 0.3 * k), l.i * a * 1.05, l.col]);
      glows.push({ x: l.x, y: 0.5, z: l.z + 0.05, w: 1.0 * (1 + k), h: 0.7 * (1 + k), col: [...l.col, 0.4 * a] });
    }
    for (let i = decals.length - 1; i >= 0; i--) {
      const d = decals[i], k = (now - d.t) / d.dur; if (k >= 1) { decals.splice(i, 1); continue; }
      const a = Math.min(1, (now - d.t) / 120) * (1 - k * k) * d.a;
      dec.push({ x: d.x, z: d.z, r: d.r * (0.75 + 0.35 * Math.min(1, k * 3)), rot: t * d.spin, col: [...d.col, a], tex: World3D.sigil(), y: 0.025 });
      dec.push({ x: d.x, z: d.z, r: d.r * 1.25, rot: -t * d.spin * 0.6, col: [...d.col, a * 0.35], tex: World3D.sigil(), y: 0.02 });
    }
    // chớp sáng toàn cảnh
    let fl = [0, 0, 0];
    flashes = flashes.filter((f) => { const k = (now - f.t) / f.dur; if (k >= 1) return false; const a = f.k * (1 - k) * (1 - k); fl = fl.map((v, i) => v + f.c[i] * a); return true; });
    const amb = [dimK + fl[0], dimK + fl[1], dimK + fl[2]];
    const sky = Wd.sky, sk = (c) => c.map((v, i) => Math.min(1.4, v * (0.55 + 0.45 * dimK) + fl[i] * 0.5));
    // camera: lắc nhẹ cho cảnh có chiều sâu (thị sai)
    const cam = { target: [0, 0.3, 0.4], dist: 19, pitch: 13, fov: 44, shift: -0.2, yaw: Math.sin(t * 0.13) * 1.6 };
    R.render({
      theme, cam, ground: Wd.mosaic, groundRect: Wd.groundRect, mapW: 12, mapH: 20, focusX: 0, focusZ: 0,
      sprites: [], glows, decals: dec, lights: L, lightK: 1, expo: amb,
      night: false, dusk: theme === 'desert', dark,
      time: t, blur: 0, low: FX.low,
      sky: { top: sk(sky.top), bot: sk(sky.bot), cloud: sk(sky.cloud), clouds: dark ? 0.35 : 1, sunP: [-0.55, 0.92], sunG: sky.sunG.map((v) => v * 0.6 * dimK) },
      fog: sk(sky.bot.map((v, i) => v * 0.7 + sky.top[i] * 0.3)), fogR: [30, 150],
    });
  }

  return { show, hide, burst, flash, resize, get on() { return on; } };
})();
