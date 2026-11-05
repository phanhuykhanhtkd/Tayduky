// =====================================================================
//  Lớp thời gian thực siêu nhẹ (WebSocket RFC 6455) – không cần thư viện ngoài.
//  API kiểu Socket.io: io.on('connection'), socket.on(evt,(data,ack)=>{}),
//  socket.emit(evt,data), socket.join(room), io.to(room).emit(evt,data)
// =====================================================================
const crypto = require('crypto');
const { EventEmitter } = require('events');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function encodeFrame(str, opcode = 1) {
  const payload = Buffer.from(str);
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[1] = len; }
  else if (len < 65536) { header = Buffer.alloc(4); header[1] = 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[1] = 127; header.writeBigUInt64BE(BigInt(len), 2); }
  header[0] = 0x80 | opcode;
  return Buffer.concat([header, payload]);
}

class Socket extends EventEmitter {
  constructor(io, raw, req) {
    super();
    this.io = io;
    this.raw = raw;
    this.id = crypto.randomBytes(6).toString('hex');
    this.rooms = new Set();
    this.data = {};
    this.address = req.socket.remoteAddress;
    this.buf = Buffer.alloc(0);
    this.frag = [];
    this.alive = true;
    this.closed = false;
    raw.on('data', (chunk) => this.onData(chunk));
    raw.on('close', () => this.close());
    raw.on('error', () => this.close());
  }

  onData(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1];
      const fin = (b0 & 0x80) !== 0, op = b0 & 0x0f, masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (len > 1024 * 1024) return this.close(); // chặn gói tin quá lớn
      const maskLen = masked ? 4 : 0;
      if (this.buf.length < off + maskLen + len) return;
      const mask = masked ? this.buf.slice(off, off + 4) : null;
      const payload = Buffer.from(this.buf.slice(off + maskLen, off + maskLen + len));
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      this.buf = this.buf.slice(off + maskLen + len);

      if (op === 0x8) return this.close();
      if (op === 0x9) { this.write(encodeFrame(payload.toString(), 0xa)); continue; }
      if (op === 0xa) { this.alive = true; continue; }
      if (op === 0x1 || op === 0x0) {
        this.frag.push(payload);
        if (fin) { const msg = Buffer.concat(this.frag).toString('utf8'); this.frag = []; this.onMessage(msg); }
      }
    }
  }

  onMessage(msg) {
    this.alive = true;
    let m;
    try { m = JSON.parse(msg); } catch { return; }
    if (m.e === '__ping') return this.send({ e: '__pong' });
    const ack = m.i != null ? (d) => this.send({ a: m.i, d }) : () => {};
    const handlers = this.listeners(m.e);
    if (!handlers.length) return ack({ ok: false, msg: 'Lệnh không hợp lệ: ' + m.e });
    for (const h of handlers) {
      Promise.resolve()
        .then(() => h(m.d || {}, ack))
        .catch((err) => { console.error('[socket]', m.e, err); ack({ ok: false, msg: 'Lỗi máy chủ: ' + err.message }); });
    }
  }

  write(buf) { if (!this.closed) { try { this.raw.write(buf); } catch { this.close(); } } }
  send(obj) { this.write(encodeFrame(JSON.stringify(obj))); }
  emit(e, d) { if (e === 'disconnect') return super.emit(e, d); this.send({ e, d }); return true; }
  join(room) { this.rooms.add(room); this.io.roomAdd(room, this); }
  leave(room) { this.rooms.delete(room); this.io.roomDel(room, this); }

  close() {
    if (this.closed) return;
    this.closed = true;
    try { this.raw.end(encodeFrame('', 0x8)); } catch {}
    try { this.raw.destroy(); } catch {}
    for (const r of this.rooms) this.io.roomDel(r, this);
    this.io.sockets.delete(this.id);
    super.emit('disconnect');
  }
}

class Server extends EventEmitter {
  constructor(httpServer, { path = '/ws' } = {}) {
    super();
    this.sockets = new Map();
    this.rooms = new Map();
    httpServer.on('upgrade', (req, raw) => {
      if (!req.url.startsWith(path) || (req.headers.upgrade || '').toLowerCase() !== 'websocket') return raw.destroy();
      const key = req.headers['sec-websocket-key'];
      const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
      raw.write(
        'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
      );
      raw.setNoDelay(true);
      const s = new Socket(this, raw, req);
      this.sockets.set(s.id, s);
      this.emit('connection', s);
    });
    // nhịp tim: đóng kết nối "chết" (iPhone khoá màn hình…)
    setInterval(() => {
      for (const s of this.sockets.values()) {
        if (!s.alive) { s.close(); continue; }
        s.alive = false;
        s.write(encodeFrame('hb', 0x9));
      }
    }, 30000).unref();
  }

  roomAdd(r, s) { if (!this.rooms.has(r)) this.rooms.set(r, new Set()); this.rooms.get(r).add(s); }
  roomDel(r, s) { const set = this.rooms.get(r); if (set) { set.delete(s); if (!set.size) this.rooms.delete(r); } }

  to(room) {
    return {
      emit: (e, d, except) => {
        const set = this.rooms.get(room);
        if (!set) return;
        const frame = encodeFrame(JSON.stringify({ e, d }));
        for (const s of set) if (s !== except) s.write(frame);
      },
    };
  }

  broadcast(e, d) {
    const frame = encodeFrame(JSON.stringify({ e, d }));
    for (const s of this.sockets.values()) s.write(frame);
  }
}

module.exports = { Server };
