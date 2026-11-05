// =====================================================================
//  ÂM THANH – tổng hợp hoàn toàn bằng Web Audio (không cần file mp3)
//  Nhạc nền ngũ cung: đàn tranh, sáo trúc, trống, cồng, chuông
// =====================================================================
const Sound = (() => {
  let ctx = null, master, musicBus, sfxBus, reverb, revSend;
  const st = { music: 0.55, sfx: 0.8 };
  try { Object.assign(st, JSON.parse(localStorage.getItem('tdk_audio') || '{}')); } catch {}
  let track = null, nextTrack = null, timer = null, step = 0, nextTime = 0, wantTrack = null;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- khởi tạo (iOS bắt buộc chạm màn hình trước) ----------
  // iPhone: Web Audio mặc định bị nút gạt im lặng chặn. Phát kèm một thẻ <audio> im lặng
  // (lặp vô hạn) sẽ chuyển phiên âm thanh sang chế độ "phát nhạc" → luôn nghe được.
  let silentEl = null;
  function silentWav() {
    const n = 4410, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }
  function keepAlive() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
    try {
      if (!silentEl) { silentEl = document.createElement('audio'); silentEl.src = silentWav(); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.setAttribute('x-webkit-airplay', 'deny'); silentEl.preload = 'auto'; }
      if (silentEl.paused) { const p = silentEl.play(); if (p && p.catch) p.catch(() => {}); }
    } catch {}
  }

  function unlock() {
    keepAlive();
    if (ctx) {
      if (ctx.state !== 'running') { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = st.music * 0.55; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = st.sfx; sfxBus.connect(master);
    reverb = ctx.createConvolver(); reverb.buffer = impulse(2.8, 2.6);
    revSend = ctx.createGain(); revSend.gain.value = 0.32;
    revSend.connect(reverb).connect(master);
    const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
    if (ctx.state !== 'running') { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
    ctx.onstatechange = () => { if (ctx.state === 'running' && wantTrack && !track) play(wantTrack); };
    if (wantTrack) play(wantTrack);
  }
  // mọi lần chạm đều kiểm tra lại (iOS tạm dừng âm thanh khi thoát app / có cuộc gọi)
  ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach((e) => document.addEventListener(e, unlock, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend().catch?.(() => {}); silentEl && silentEl.pause(); }
    else { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
  });
  window.addEventListener('pageshow', () => { if (ctx && ctx.state !== 'running') ctx.resume().catch?.(() => {}); });

  // nút "Thử âm thanh" trong Cài đặt
  function test() { unlock(); setTimeout(() => sfx('levelup'), 60); return ctx ? ctx.state : 'không hỗ trợ'; }

  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return buf;
  }
  let noiseBuf = null;
  function noise() {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; return s;
  }
  function out(node, bus, wet = 0.3) {
    node.connect(bus);
    if (wet) { const g = ctx.createGain(); g.gain.value = wet; node.connect(g).connect(revSend); }
  }
  function env(g, t, a, peak, d, end = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + d);
  }

  // ---------- nhạc cụ ----------
  function guzheng(t, f, vel = 0.3, bus = musicBus, len = 2.2) {
    const g = ctx.createGain(); env(g, t, 0.004, vel, len);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 7, t); lp.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.6); lp.Q.value = 1.5;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator(), g2 = ctx.createGain(), g3 = ctx.createGain();
    o1.type = 'triangle'; o2.type = 'sawtooth'; o3.type = 'sine';
    [o1, o2].forEach((o) => { o.frequency.setValueAtTime(f * 1.012, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06); });
    o3.frequency.value = f * 2.003;
    g2.gain.value = 0.35; g3.gain.value = 0.25;
    o1.connect(lp); o2.connect(g2).connect(lp); o3.connect(g3).connect(lp); lp.connect(g);
    out(g, bus, 0.35);
    [o1, o2, o3].forEach((o) => { o.start(t); o.stop(t + len + 0.1); });
  }
  function dizi(t, f, dur, vel = 0.16) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.07);
    g.gain.setValueAtTime(vel, t + Math.max(0.08, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; og.gain.value = 0.3;
    o.frequency.setValueAtTime(f * 0.985, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    o2.frequency.value = f;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.4; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.4, dur));
    lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    o.connect(g); o2.connect(og).connect(g);
    const n = noise(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 4; ng.gain.value = vel * 0.25;
    n.connect(bp).connect(ng).connect(g);
    out(g, musicBus, 0.45);
    [o, o2, lfo].forEach((x) => { x.start(t); x.stop(t + dur + 0.2); }); n.start(t); n.stop(t + dur + 0.2);
  }
  function pad(t, f, dur, vel = 0.05) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    [-7, 6].forEach((c) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c; o.connect(lp); o.start(t); o.stop(t + dur + 0.1); });
    lp.connect(g); out(g, musicBus, 0.6);
  }
  function bass(t, f, vel = 0.22) {
    const g = ctx.createGain(); env(g, t, 0.01, vel, 0.9);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    o.connect(g); out(g, musicBus, 0.1); o.start(t); o.stop(t + 1);
  }
  function taiko(t, vel = 0.7, bus = musicBus) {
    const g = ctx.createGain(); env(g, t, 0.003, vel, 0.55);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    o.connect(g);
    const n = noise(), lp = ctx.createBiquadFilter(), ng = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 700; env(ng, t, 0.002, vel * 0.5, 0.08);
    n.connect(lp).connect(ng).connect(g);
    out(g, bus, 0.2); o.start(t); o.stop(t + 0.6); n.start(t); n.stop(t + 0.1);
  }
  function rim(t, vel = 0.25, bus = musicBus) {
    const g = ctx.createGain(); env(g, t, 0.001, vel, 0.07);
    const n = noise(), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 2;
    n.connect(bp).connect(g); out(g, bus, 0.15); n.start(t); n.stop(t + 0.1);
  }
  function woodblock(t, f = 880, vel = 0.25, bus = musicBus) {
    const g = ctx.createGain(); env(g, t, 0.001, vel, 0.09);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.02);
    o.connect(g); out(g, bus, 0.2); o.start(t); o.stop(t + 0.12);
  }
  function gong(t, vel = 0.5, bus = musicBus, base = 92) {
    const g = ctx.createGain(); env(g, t, 0.02, vel, 4.5);
    [1, 1.47, 1.93, 2.41, 3.38, 4.1].forEach((m, i) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(base * m * 1.03, t); o.frequency.exponentialRampToValueAtTime(base * m, t + 0.6);
      og.gain.value = 0.5 / (i + 1); o.connect(og).connect(g); o.start(t); o.stop(t + 5);
    });
    const n = noise(), lp = ctx.createBiquadFilter(), ng = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 1400; env(ng, t, 0.01, vel * 0.25, 1.4);
    n.connect(lp).connect(ng).connect(g); n.start(t); n.stop(t + 1.6);
    out(g, bus, 0.5);
  }
  function bell(t, f, vel = 0.15, bus = musicBus, len = 2.5) {
    const g = ctx.createGain(); env(g, t, 0.002, vel, len);
    [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.08]].forEach(([m, a]) => {
      if (f * m > ctx.sampleRate * 0.42) return;
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * m; og.gain.value = a;
      o.connect(og).connect(g); o.start(t); o.stop(t + len + 0.1);
    });
    out(g, bus, 0.5);
  }

  // ---------- bản nhạc (ngũ cung) ----------
  // deg: bậc trong thang ngũ cung, 5 = quãng tám; null = lặng
  const PENTA = { gong: [0, 2, 4, 7, 9], yu: [0, 3, 5, 7, 10], shang: [0, 2, 5, 7, 10] };
  const TRACKS = {
    login: { bpm: 60, root: 62, scale: 'yu', lead: 'dizi',
      mel: [[7, 3], [6, 1], [5, 2], [4, 2], [5, 4], [null, 4], [4, 2], [5, 1], [7, 1], [8, 3], [7, 1], [6, 4], [null, 4],
        [5, 2], [7, 2], [6, 1], [5, 1], [4, 2], [2, 3], [3, 1], [4, 4], [null, 4]],
      chords: [0, 0, 3, 4, 0, 3, 2, 0], arp: [0, 2, 4, 7, 4, 2], arpEvery: 2, drums: null },
    heaven: { bpm: 74, root: 62, scale: 'gong', lead: 'dizi',
      mel: [[5, 1], [7, 1], [8, 2], [7, 1], [5, 1], [4, 2], [5, 3], [null, 1], [7, 1], [8, 1], [10, 2], [9, 1], [8, 1], [7, 2], [8, 4],
        [10, 1], [9, 1], [8, 1], [7, 1], [5, 2], [7, 2], [4, 1], [5, 1], [2, 2], [4, 3], [null, 1], [5, 4], [null, 4]],
      chords: [0, 3, 4, 0, 3, 4, 2, 0], arp: [0, 4, 7, 9, 7, 4, 2, 4], arpEvery: 0.5, drums: 'soft', bells: true },
    city: { bpm: 84, root: 60, scale: 'gong', lead: 'zheng',
      mel: [[4, 1], [5, 0.5], [4, 0.5], [2, 1], [4, 1], [5, 2], [7, 2], [8, 1], [7, 0.5], [5, 0.5], [4, 1], [5, 1], [4, 4],
        [7, 1], [8, 1], [7, 1], [5, 1], [4, 1.5], [2, 0.5], [4, 2], [2, 1], [1, 1], [0, 2], [2, 2], [4, 4], [null, 4]],
      chords: [0, 0, 3, 3, 4, 2, 0, 0], arp: [0, 2, 4, 2], arpEvery: 1, drums: 'town' },
    forest: { bpm: 70, root: 64, scale: 'shang', lead: 'dizi',
      mel: [[2, 2], [4, 1], [5, 1], [7, 3], [5, 1], [4, 2], [2, 2], [4, 4], [5, 2], [7, 1], [8, 1], [9, 2], [8, 1], [7, 1], [5, 4],
        [4, 2], [5, 1], [4, 1], [2, 2], [1, 2], [2, 4], [null, 4]],
      chords: [0, 3, 0, 4, 2, 3, 0, 0], arp: [0, 4, 7, 4], arpEvery: 1, drums: 'soft' },
    desert: { bpm: 78, root: 57, scale: 'yu', lead: 'dizi',
      mel: [[0, 2], [2, 1], [3, 1], [4, 2], [3, 1], [2, 1], [0, 4], [3, 2], [4, 1], [5, 1], [7, 3], [5, 1], [4, 4],
        [5, 1], [4, 1], [3, 2], [2, 2], [0, 2], [-1, 2], [0, 4], [null, 4]],
      chords: [0, 0, 2, 3, 0, 4, 3, 0], arp: [0, 3, 4, 3], arpEvery: 1, drums: 'desert' },
    battle: { bpm: 132, root: 62, scale: 'yu', lead: 'zheng',
      mel: [[5, 0.5], [5, 0.5], [7, 0.5], [5, 0.5], [4, 1], [3, 1], [4, 0.5], [5, 0.5], [7, 1], [8, 2], [7, 0.5], [8, 0.5], [10, 1], [8, 1], [7, 1], [5, 1], [4, 2],
        [3, 0.5], [4, 0.5], [5, 1], [3, 1], [2, 1], [0, 1], [2, 1], [3, 1], [4, 4]],
      chords: [0, 0, 3, 4, 0, 0, 2, 4], arp: [0, 3, 4, 7], arpEvery: 0.5, drums: 'battle' },
    boss: { bpm: 140, root: 59, scale: 'yu', lead: 'zheng',
      mel: [[0, 1], [0, 0.5], [3, 0.5], [4, 1], [3, 0.5], [2, 0.5], [0, 2], [5, 1], [4, 0.5], [3, 0.5], [4, 1], [7, 1], [5, 4],
        [7, 1], [8, 1], [7, 0.5], [5, 0.5], [4, 1], [3, 1], [4, 1], [0, 2], [-1, 1], [0, 4]],
      chords: [0, 0, 4, 3, 0, 0, 2, 4], arp: [0, 0, 3, 0, 4, 0, 3, 2], arpEvery: 0.5, drums: 'boss', gong: 16 },
  };

  function noteFreq(tr, deg, oct = 0) {
    const sc = PENTA[tr.scale];
    const o = Math.floor(deg / 5), i = ((deg % 5) + 5) % 5;
    return mtof(tr.root + sc[i] + 12 * (o + oct));
  }

  // trình phát: bước = 1/4 phách
  const ALIAS = { river: 'forest', cave: 'desert', snow: 'heaven' };
  function play(name) {
    name = ALIAS[name] || name;
    wantTrack = name;
    if (!ctx || st.music <= 0) return;
    if (track && track.name === name) return;
    const tr = TRACKS[name]; if (!tr) return;
    // nhỏ dần rồi đổi bài
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(musicBus.gain.value, now);
    musicBus.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    nextTrack = { ...tr, name, melPos: 0, melT: 0, mlen: tr.mel.reduce((s, [, d]) => s + d, 0) };
    clearTimeout(play._sw);
    play._sw = setTimeout(() => {
      track = nextTrack; step = 0; nextTime = ctx.currentTime + 0.1;
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(st.music * 0.55, ctx.currentTime + 1.2);
      if (!timer) timer = setInterval(tick, 30);
    }, 650);
  }
  function stopMusic() { track = null; wantTrack = null; }

  function tick() {
    if (!ctx || !track || ctx.state !== 'running') return;
    const spb = 60 / track.bpm, q = spb / 4;
    if (nextTime < ctx.currentTime - 0.3) nextTime = ctx.currentTime + 0.05; // sau khi bị iOS tạm dừng
    while (nextTime < ctx.currentTime + 0.15) {
      schedule(track, step, nextTime, q);
      step++; nextTime += q * (step % 2 ? 1.04 : 0.96); // chút lơi nhịp cho mềm
    }
  }

  function schedule(tr, s, t, q) {
    const beat = s / 4, bar = Math.floor(beat / 4), inBar = s % 16;
    const chord = tr.chords[bar % tr.chords.length];
    // giai điệu
    if (s % 2 === 0) {
      const pos = (beat % tr.mlen);
      let acc = 0;
      for (const [deg, dur] of tr.mel) {
        if (Math.abs(acc - pos) < 0.01 && deg != null) {
          const f = noteFreq(tr, deg, 1);
          if (tr.lead === 'dizi') dizi(t, f, dur * q * 4 * 0.95, 0.13);
          else guzheng(t, f, 0.22, musicBus, Math.max(0.6, dur * q * 4 * 1.5));
          if (tr.lead === 'dizi' && Math.random() < 0.15) guzheng(t, f / 2, 0.08);
        }
        acc += dur;
      }
    }
    // nền: rải đàn tranh
    const ae = Math.round(tr.arpEvery * 4);
    if (s % ae === 0) {
      const i = (s / ae) % tr.arp.length;
      guzheng(t, noteFreq(tr, chord + tr.arp[i], 0), tr.lead === 'zheng' ? 0.1 : 0.14, musicBus, 1.6);
    }
    if (inBar === 0) { bass(t, noteFreq(tr, chord, -2)); pad(t, noteFreq(tr, chord, -1), q * 16 * 1.05, tr.drums === 'boss' ? 0.04 : 0.035); }
    if (tr.bells && inBar === 8 && bar % 2 === 1) bell(t, noteFreq(tr, chord + 7, 1), 0.06);
    if (tr.gong && s % (tr.gong * 4) === 0) gong(t, 0.35);
    // trống
    const d = tr.drums;
    if (d === 'soft') { if (inBar === 0) woodblock(t, 660, 0.08); if (inBar === 8) woodblock(t, 990, 0.05); }
    if (d === 'town') { if (inBar % 4 === 0) woodblock(t, inBar === 0 ? 660 : 990, 0.09); if (inBar === 0 && bar % 2 === 0) taiko(t, 0.25); }
    if (d === 'desert') { if (inBar === 0 || inBar === 6 || inBar === 10) taiko(t, inBar === 0 ? 0.4 : 0.22); if (inBar % 2 === 1) rim(t, 0.05); }
    if (d === 'battle') {
      if ([0, 3, 6, 8, 11, 14].includes(inBar)) taiko(t, inBar === 0 || inBar === 8 ? 0.55 : 0.32);
      if (inBar % 2 === 0) rim(t, inBar % 4 === 2 ? 0.16 : 0.07);
      if (inBar === 0 && bar % 4 === 0) gong(t, 0.18, musicBus, 120);
    }
    if (d === 'boss') {
      if (inBar % 2 === 0) taiko(t, inBar % 8 === 0 ? 0.7 : 0.35);
      if ([3, 7, 11, 15].includes(inBar)) rim(t, 0.18);
    }
  }

  // ---------- hiệu ứng âm thanh ----------
  function noiseHit(t, freq, q, vel, dur, type = 'bandpass', sweep) {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); f.Q.value = q;
    env(g, t, 0.004, vel, dur); n.connect(f).connect(g); out(g, sfxBus, 0.25); n.start(t); n.stop(t + dur + 0.05);
  }
  function tone(t, f, dur, vel = 0.2, type = 'sine', to) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    env(g, t, 0.004, vel, dur); o.connect(g); out(g, sfxBus, 0.25); o.start(t); o.stop(t + dur + 0.05);
  }
  // tiếng đập trầm (sub) + méo nhẹ cho đòn nặng
  let shaper = null;
  function dist() { if (!shaper) { shaper = ctx.createWaveShaper(); const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 3.2); } shaper.curve = c; shaper.connect(sfxBus); } return shaper; }
  function thump(t, vel = 0.6, f0 = 120, f1 = 38, dur = 0.35) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    env(g, t, 0.002, vel, dur); o.connect(g).connect(dist()); o.start(t); o.stop(t + dur + 0.05);
  }
  function sweep(t, f0, f1, dur, vel, q = 1.2) { noiseHit(t, f0, q, vel, dur, 'bandpass', f1); }
  function rumble(t, dur, vel) {
    const n = noise(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 160; lfo.frequency.value = 7; lg.gain.value = 90; lfo.connect(lg).connect(lp.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(lp).connect(g); out(g, sfxBus, 0.4); n.start(t); n.stop(t + dur + 0.1); lfo.start(t); lfo.stop(t + dur + 0.1);
  }
  const SFX = {
    click: (t) => woodblock(t, 1250, 0.12, sfxBus),
    open: (t) => { noiseHit(t, 600, 0.8, 0.12, 0.28, 'bandpass', 3000); bell(t + 0.05, 1320, 0.05, sfxBus, 0.8); },
    close: (t) => noiseHit(t, 2500, 0.8, 0.08, 0.2, 'bandpass', 600),
    step: (t) => noiseHit(t, 300, 1, 0.025, 0.05, 'lowpass'),
    hit: (t) => { noiseHit(t, 2400, 0.7, 0.32, 0.09, 'lowpass', 400); thump(t, 0.55, 150, 45, 0.22); noiseHit(t + 0.005, 4200, 1.2, 0.1, 0.05, 'highpass'); },
    crit: (t) => { noiseHit(t, 3600, 0.6, 0.45, 0.16, 'highpass'); thump(t, 0.9, 180, 32, 0.5); tone(t, 2400, 0.6, 0.07, 'triangle', 1800); tone(t, 3150, 0.5, 0.04, 'sine'); rumble(t + 0.05, 0.6, 0.25); gong(t + 0.02, 0.18, sfxBus, 150); },
    miss: (t) => noiseHit(t, 800, 1.5, 0.12, 0.25, 'bandpass', 3500),
    slash: (t) => { sweep(t, 900, 7000, 0.16, 0.3, 1.6); thump(t + 0.04, 0.4, 160, 60, 0.18); tone(t + 0.05, 3200, 0.35, 0.05, 'triangle', 2600); },
    fire: (t) => { thump(t, 0.75, 110, 30, 0.6); noiseHit(t, 2400, 0.5, 0.45, 0.8, 'lowpass', 180); rumble(t, 1.1, 0.3); for (let i = 0; i < 10; i++) noiseHit(t + 0.1 + Math.random() * 0.8, 2500 + Math.random() * 3000, 3, 0.07, 0.025); },
    thunder: (t) => { noiseHit(t, 6000, 0.4, 0.6, 0.1, 'highpass'); for (let i = 0; i < 4; i++) noiseHit(t + 0.03 + i * 0.045, 3000 + i * 700, 0.6, 0.3, 0.05, 'highpass'); thump(t + 0.02, 0.8, 90, 28, 0.7); rumble(t + 0.08, 1.8, 0.45); },
    ice: (t) => { noiseHit(t, 7000, 0.8, 0.3, 0.25, 'highpass'); thump(t, 0.4, 220, 80, 0.2); [2093, 2637, 3136, 3951, 4699].forEach((f, i) => bell(t + 0.03 + i * 0.04 + Math.random() * 0.02, f * (1 + Math.random() * 0.01), 0.055, sfxBus, 0.9)); for (let i = 0; i < 6; i++) noiseHit(t + 0.05 + Math.random() * 0.3, 8000, 4, 0.06, 0.02, 'highpass'); },
    heal: (t) => [0, 4, 7, 12, 16].forEach((d, i) => bell(t + i * 0.08, 523 * Math.pow(2, d / 12), 0.07, sfxBus, 1.2)),
    poison: (t) => { for (let i = 0; i < 5; i++) tone(t + i * 0.07, 300 + Math.random() * 300, 0.08, 0.07, 'sine', 800 + Math.random() * 400); },
    wind: (t) => { sweep(t, 300, 2600, 0.5, 0.28, 3); sweep(t + 0.25, 2600, 500, 0.6, 0.22, 3); },
    rock: (t) => { sweep(t, 300, 1200, 0.25, 0.12); thump(t + 0.26, 1, 90, 25, 0.8); noiseHit(t + 0.26, 900, 0.7, 0.45, 0.5, 'lowpass', 80); rumble(t + 0.28, 1.2, 0.4); },
    shadow: (t) => { tone(t, 140, 0.9, 0.16, 'sawtooth', 45); tone(t, 147, 0.9, 0.12, 'sawtooth', 47); sweep(t, 2000, 150, 0.8, 0.2, 3); thump(t + 0.1, 0.5, 80, 30, 0.5); },
    gold: (t) => { thump(t, 0.4, 200, 70, 0.3); gong(t, 0.12, sfxBus, 220); [1319, 1568, 1976, 2637].forEach((f, i) => bell(t + i * 0.04, f, 0.06, sfxBus, 1.2)); noiseHit(t, 7000, 1, 0.08, 0.6, 'highpass'); },
    rage: (t) => { tone(t, 70, 0.8, 0.28, 'sawtooth', 180); thump(t, 0.7, 100, 40, 0.4); noiseHit(t, 600, 0.8, 0.3, 0.7, 'lowpass', 2400); },
    buff: (t) => [0, 7, 12].forEach((d, i) => bell(t + i * 0.07, 784 * Math.pow(2, d / 12), 0.06, sfxBus, 1)),
    throw: (t) => noiseHit(t, 600, 2, 0.15, 0.35, 'bandpass', 2000),
    whoosh: (t) => { sweep(t, 400, 3500, 0.32, 0.25, 2); tone(t, 600, 0.3, 0.04, 'sine', 1400); },
    swing: (t) => { sweep(t, 600, 4800, 0.14, 0.3, 2.2); },
    charge: (t) => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = o2.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(560, t + 0.45); o2.frequency.setValueAtTime(142, t); o2.frequency.exponentialRampToValueAtTime(566, t + 0.45); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(5000, t + 0.45); lp.Q.value = 6; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55); o.connect(lp); o2.connect(lp); lp.connect(g); out(g, sfxBus, 0.5); [o, o2].forEach((x) => { x.start(t); x.stop(t + 0.6); }); [0, 4, 7, 12].forEach((d, i) => bell(t + 0.1 + i * 0.07, 880 * Math.pow(2, d / 12), 0.035, sfxBus, 0.8)); },
    cutin: (t) => { sweep(t, 300, 6000, 0.22, 0.28, 1.5); taiko(t + 0.12, 0.8, sfxBus); thump(t + 0.12, 0.6, 120, 40, 0.4); bell(t + 0.15, 1568, 0.05, sfxBus, 1.2); },
    shield: (t) => { bell(t, 660, 0.12, sfxBus, 1.4); bell(t + 0.01, 990, 0.06, sfxBus, 1); thump(t, 0.35, 200, 90, 0.2); },
    death: (t) => { sweep(t, 1800, 200, 0.6, 0.18, 2); tone(t + 0.05, 520, 0.7, 0.06, 'triangle', 130); [12, 7, 3, 0].forEach((d, i) => bell(t + 0.2 + i * 0.09, 523 * Math.pow(2, d / 12), 0.03, sfxBus, 1)); },
    bossdeath: (t) => { for (let i = 0; i < 5; i++) { thump(t + i * 0.14, 0.7, 130, 30, 0.4); noiseHit(t + i * 0.14, 1800, 0.6, 0.25, 0.3, 'lowpass', 120); } gong(t + 0.76, 0.8, sfxBus, 70); thump(t + 0.76, 1, 80, 20, 1.2); rumble(t + 0.76, 2.4, 0.5); },
    roar: (t) => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(130, t + 0.3); o.frequency.exponentialRampToValueAtTime(55, t + 1.2); o2.frequency.setValueAtTime(93, t); o2.frequency.exponentialRampToValueAtTime(52, t + 1.2); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 3; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3); o.connect(lp); o2.connect(lp); lp.connect(g).connect(dist()); [o, o2].forEach((x) => { x.start(t); x.stop(t + 1.4); }); noiseHit(t, 700, 0.8, 0.25, 1.1, 'bandpass', 250); rumble(t, 1.5, 0.35); },
    fireworks: (t) => { for (let i = 0; i < 6; i++) { const tt = t + i * 0.22; thump(tt, 0.3, 220, 70, 0.2); for (let k = 0; k < 6; k++) noiseHit(tt + 0.05 + Math.random() * 0.4, 5000 + Math.random() * 3000, 4, 0.05, 0.02, 'highpass'); } },
    caught: (t) => [0, 2, 4, 7, 9, 12].forEach((d, i) => guzheng(t + i * 0.09, 587 * Math.pow(2, d / 12), 0.2, sfxBus, 1.2)),
    escape: (t) => { tone(t, 600, 0.15, 0.1, 'triangle', 300); tone(t + 0.15, 450, 0.25, 0.1, 'triangle', 200); },
    coin: (t) => { tone(t, 1976, 0.12, 0.08, 'square'); tone(t + 0.07, 2637, 0.25, 0.08, 'square'); },
    levelup: (t) => { gong(t, 0.3, sfxBus, 110); [0, 4, 7, 12, 16, 19, 24].forEach((d, i) => guzheng(t + i * 0.07, 392 * Math.pow(2, d / 12), 0.22, sfxBus, 1.5)); },
    quest: (t) => [0, 7, 12].forEach((d, i) => bell(t + i * 0.12, 659 * Math.pow(2, d / 12), 0.1, sfxBus, 1.6)),
    gong: (t) => { gong(t, 0.7, sfxBus); taiko(t, 0.7, sfxBus); },
    victory: (t) => { gong(t, 0.35, sfxBus, 120); [[0, 0], [4, .16], [7, .32], [12, .48], [9, .72], [12, .88], [16, 1.04]].forEach(([d, dt]) => guzheng(t + dt, 523 * Math.pow(2, d / 12), 0.25, sfxBus, 1.8)); },
    defeat: (t) => [[0, 0], [-2, .3], [-5, .6], [-9, 1]].forEach(([d, dt]) => dizi(t + dt, 392 * Math.pow(2, d / 12), 0.35, 0.12)),
    error: (t) => { tone(t, 180, 0.15, 0.12, 'square'); tone(t + 0.12, 140, 0.2, 0.12, 'square'); },
    chat: (t) => bell(t, 1760, 0.05, sfxBus, 0.6),
    dice: (t) => { for (let i = 0; i < 9; i++) woodblock(t + i * 0.05 + Math.random() * 0.03, 1500 + Math.random() * 1500, 0.1, sfxBus); },
    chest: (t) => { noiseHit(t, 300, 1, 0.2, 0.3, 'lowpass'); SFX.gold(t + 0.25); },
    portal: (t) => { noiseHit(t, 300, 2, 0.15, 1.2, 'bandpass', 3000); [0, 5, 7, 12].forEach((d, i) => bell(t + i * 0.1, 880 * Math.pow(2, d / 12), 0.05, sfxBus, 1.5)); },
    secret: (t) => { gong(t, 0.3, sfxBus, 140); [0, 3, 7, 10, 14, 17].forEach((d, i) => bell(t + 0.2 + i * 0.1, 659 * Math.pow(2, d / 12), 0.07, sfxBus, 2)); },
  };
  let lastSfx = {};
  function sfx(name, delay = 0) {
    if (!ctx || st.sfx <= 0 || !SFX[name] || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (lastSfx[name] && now - lastSfx[name] < 0.04) return;
    lastSfx[name] = now;
    try { SFX[name](now + delay); } catch (e) { console.warn(e); }
  }

  function set(k, v) {
    st[k] = v;
    localStorage.setItem('tdk_audio', JSON.stringify(st));
    if (!ctx) return;
    if (k === 'music') { musicBus.gain.setTargetAtTime(v * 0.55, ctx.currentTime, 0.1); if (v > 0 && wantTrack && !track) play(wantTrack); }
    if (k === 'sfx') sfxBus.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  return { unlock, play, stopMusic, sfx, set, test, get settings() { return { ...st }; }, get ready() { return !!ctx; }, get state() { return ctx ? ctx.state : 'chưa bật'; } };
})();
