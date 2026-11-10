// Kết nối thời gian thực tới máy chủ (WebSocket), tự kết nối lại khi iPhone khoá màn hình
const Net = (() => {
  let ws = null, seq = 0, connected = false, retry = 0, pingTimer = null;
  const wait = new Map();
  const handlers = {};

  const url = () => (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
  const fire = (e, d) => (handlers[e] || []).forEach((fn) => { try { fn(d); } catch (err) { console.error(err); } });

  function connect() {
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    ws = new WebSocket(url());
    ws.onopen = () => {
      connected = true; retry = 0;
      clearInterval(pingTimer);
      pingTimer = setInterval(() => send({ e: '__ping' }), 20000);
      fire('open');
    };
    ws.onclose = () => {
      const was = connected;
      connected = false;
      clearInterval(pingTimer);
      for (const [, r] of wait) r({ ok: false, msg: 'Mất kết nối máy chủ.' });
      wait.clear();
      if (was) fire('close');
      setTimeout(connect, Math.min(4000, 400 * ++retry));
    };
    ws.onerror = () => {};
    ws.onmessage = (m) => {
      let d; try { d = JSON.parse(m.data); } catch { return; }
      if (d.a != null) { const r = wait.get(d.a); if (r) { wait.delete(d.a); r(d.d); } return; }
      fire(d.e, d.d);
    };
  }
  function send(obj) { if (connected) ws.send(JSON.stringify(obj)); }

  function emit(e, d) {
    return new Promise((resolve) => {
      if (!connected) return resolve({ ok: false, msg: 'Chưa kết nối được máy chủ.' });
      const i = ++seq;
      const t = setTimeout(() => { wait.delete(i); resolve({ ok: false, msg: 'Máy chủ không phản hồi.' }); }, 12000);
      wait.set(i, (x) => { clearTimeout(t); resolve(x || { ok: false }); });
      send({ e, d, i });
    });
  }
  function on(e, fn) { (handlers[e] = handlers[e] || []).push(fn); }

  document.addEventListener('visibilitychange', () => { if (!document.hidden && !connected) { retry = 0; connect(); } });

  return { connect, emit, on, get connected() { return connected; } };
})();
