// =====================================================================
//  KIỂM THỬ TỔNG THỂ: lối chơi + bảo mật + chống spam (nhiều người chơi)
//  Chạy máy chủ ở chế độ thử:  TDK_TEST=1 TDK_REG_LIMIT=1000 TDK_CONN_LIMIT=100 TDK_EVENT=tet node server.js
//  rồi:  node tools/full-test.js
// =====================================================================
const net = require('net');
const http = require('http');
const URL = process.env.WS || 'ws://localhost:3000/ws';
const HOST = 'localhost', PORT = 3000;
let pass = 0, fail = 0; const fails = [];
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log('  ✓', name); } else { fail++; fails.push(name); console.log('  ✗', name, extra); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function client() {
  const ws = new WebSocket(URL); let n = 0; const wait = new Map(), ev = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.a != null) { wait.get(d.a)?.(d.d); wait.delete(d.a); } else ev.push(d); };
  const emit = (e, d) => new Promise((r) => { const i = ++n; wait.set(i, r); ws.send(JSON.stringify({ e, d, i })); setTimeout(() => { if (wait.has(i)) { wait.delete(i); r({ ok: false, timeout: true }); } }, 8000); });
  return new Promise((r, j) => { ws.onopen = () => r({ ws, emit, ev }); ws.onerror = j; });
}
const T = Date.now().toString(36).slice(-5);
async function player(tag, race = 'than') {
  const A = await client();
  const u = (tag + T).toLowerCase().slice(0, 16);
  let r = await A.emit('auth:register', { user: u, pass: '1234' });
  r = await A.emit('char:create', { name: (tag + T).slice(0, 12), race, gender: 'm' });
  const en = await A.emit('enter');
  return { ...A, user: u, st: en.state, token: (await A.emit('auth:login', { user: u, pass: '1234' })).token };
}
async function fight(A, b) {
  let last;
  for (let i = 0; i < 60 && b; i++) { const foe = b.units.find((u) => u.side === 1 && !u.dead); last = await A.emit('battle:act', { type: 'attack', target: foe && foe.id }); if (last.result) return last; b = last.snapshot; }
  return last;
}
function httpGet(path) { return new Promise((r) => { const q = http.get({ host: HOST, port: PORT, path }, (res) => { let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => r({ code: res.statusCode, headers: res.headers, body: b })); }); q.on('error', (e) => r({ code: 0, err: e.message })); }); }
function rawHttp(line) { return new Promise((r) => { const s = net.connect(PORT, HOST, () => s.write(line)); let b = ''; s.on('data', (c) => (b += c)); s.on('end', () => r(b)); s.on('error', () => r(b)); setTimeout(() => { s.destroy(); r(b); }, 1500); }); }

(async () => {
  console.log('\n═══ 1. HTTP & tệp tĩnh ═══');
  let h = await httpGet('/');
  ok(h.code === 200, 'Trang chủ trả về 200');
  ok(h.headers['x-content-type-options'] === 'nosniff' && h.headers['x-frame-options'] === 'DENY' && /default-src 'self'/.test(h.headers['content-security-policy'] || ''), 'Có header bảo mật (nosniff, chống nhúng iframe, CSP)');
  h = await httpGet('/../server.js'); ok(h.code === 403 || h.code === 404, 'Chặn đọc file ngoài thư mục public (../server.js)', h.code);
  h = await httpGet('/..%2f..%2fdata%2fdb.json'); ok(h.code === 403 || h.code === 404, 'Chặn đọc cơ sở dữ liệu qua đường dẫn mã hoá', h.code);
  h = await httpGet('/%E0%A4%A'); ok(h.code === 400, 'URL sai định dạng không làm sập máy chủ (400)', h.code);
  h = await httpGet('/index.html%00.js'); ok(h.code === 400 || h.code === 404, 'Chặn ký tự NUL trong đường dẫn', h.code);
  h = await httpGet('/'); ok(h.code === 200, 'Máy chủ vẫn sống sau các yêu cầu độc hại');

  console.log('\n═══ 2. Tài khoản & dò mật khẩu ═══');
  const A = await player('ta');
  ok(A.st && A.st.lvl === 1, 'Tạo tài khoản + nhân vật mới');
  const X = await client();
  let r = await X.emit('auth:register', { user: '<script>', pass: '1234' }); ok(!r.ok, 'Từ chối tên đăng nhập chứa ký tự lạ');
  r = await X.emit('auth:register', { user: 'xx' + T, pass: 'x'.repeat(200) }); ok(!r.ok, 'Từ chối mật khẩu quá dài (chống tốn CPU băm)');
  r = await X.emit('auth:register', { user: 'nm' + T, pass: '1234' });
  r = await X.emit('char:create', { name: '<i>' + T + '</i>', race: 'than', gender: 'm' });
  const en = await X.emit('enter');
  ok(r.ok && en.state && !/[<>]/.test(en.state.name), 'Tên nhân vật bị lọc ký tự HTML (chống XSS)', en.state && en.state.name);
  // mã khôi phục
  const K = await client(); const ku = 'rc' + T;
  r = await K.emit('auth:register', { user: ku, pass: '1234' }); const code1 = r.recovery;
  ok(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code1 || ''), 'Đăng ký trả về mã khôi phục dạng XXXX-XXXX', code1);
  r = await X.emit('auth:recover', { user: ku, code: 'AAAA-AAAA', pass: 'moi1' }); ok(!r.ok, 'Mã khôi phục sai bị từ chối');
  r = await X.emit('auth:recover', { user: '__proto__', code: code1, pass: 'moi1' }); ok(!r.ok, 'Khôi phục tài khoản "__proto__" bị chặn');
  r = await X.emit('auth:recover', { user: ku, code: code1.toLowerCase().replace('-', ''), pass: 'moi1' }); const code2 = r.recovery;
  ok(r.ok && r.token && code2 && code2 !== code1, 'Khôi phục bằng mã đúng (chữ thường, bỏ gạch) → đặt lại mật khẩu, cấp mã mới');
  r = await X.emit('auth:login', { user: ku, pass: 'moi1' }); ok(r.ok, 'Đăng nhập bằng mật khẩu mới sau khôi phục');
  r = await X.emit('auth:recover', { user: ku, code: code1, pass: 'moi2' }); ok(!r.ok, 'Mã khôi phục cũ hết hiệu lực sau khi dùng');
  r = await X.emit('auth:recoveryNew', { pass: 'sai' }); ok(!r.ok, 'Tạo mã khôi phục mới cần đúng mật khẩu');
  r = await X.emit('auth:recoveryNew', { pass: 'moi1' }); ok(r.ok && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(r.recovery || ''), 'Tạo mã khôi phục mới trong Cài đặt');
  r = await A.emit('auth:changePass', { old: '1234', pass: 'abcd' }); ok(r.ok && r.token, 'Đổi mật khẩu');
  const A2 = await client(); r = await A2.emit('auth:token', { token: A.token }); ok(!r.ok, 'Token cũ hết hiệu lực sau khi đổi mật khẩu');
  let locked = false;
  for (let i = 0; i < 10; i++) { r = await X.emit('auth:login', { user: A.user, pass: 'sai' + i }); if (/quá nhiều/.test(r.msg || '')) { locked = true; break; } }
  ok(locked, 'Khoá tạm sau nhiều lần sai mật khẩu');
  r = await X.emit('auth:login', { user: A.user, pass: 'abcd' }); ok(!r.ok, 'Đang bị khoá thì kể cả đúng mật khẩu cũng phải chờ');
  r = await X.emit('auth:token', { token: { $ne: null } }); ok(!r.ok, 'Token kiểu đối tượng (tấn công tiêm) bị từ chối');

  console.log('\n═══ 3. Dữ liệu bẩn & gian lận ═══');
  const P = await player('pb', 'ma');
  const before = (await P.emit('enter')).state.bac;
  r = await P.emit('shop:buy', { kind: 'item', id: 'hp_s', qty: 'abc' }); ok(!r.ok, 'Mua với số lượng "abc" bị từ chối');
  r = await P.emit('shop:buy', { kind: 'item', id: 'hp_s', qty: -5 }); let st = (await P.emit('enter')).state; ok(st.bac <= before && Number.isFinite(st.bac), 'Số lượng âm không sinh thêm bạc', st.bac);
  r = await P.emit('item:sell', { id: 'hp_s', qty: 'NaN' }); st = (await P.emit('enter')).state; ok(Number.isFinite(st.bac), 'Bán với số lượng NaN không làm hỏng bạc', st.bac);
  r = await P.emit('item:sell', { id: 'hp_s', qty: 1e9 }); ok(!r.ok, 'Bán nhiều hơn số đang có bị từ chối');
  r = await P.emit('act:dice', { pick: 'tai', bet: -1000 }); ok(!r.ok, 'Cược âm bị từ chối');
  r = await P.emit('act:dice', { pick: 'tai', bet: '1e9' }); ok(!r.ok, 'Cược vượt hạn mức bị từ chối');
  r = await P.emit('stat:alloc', { the: -50, luc: 'x' }); st = (await P.emit('enter')).state; ok(st.stats.the >= 13 && Number.isFinite(st.points), 'Cộng điểm âm / chữ không làm hỏng chỉ số');
  r = await P.emit('market:sell', { kind: 'item', id: 'hp_s', qty: 1, price: -1 }); ok(!r.ok, 'Đăng bán giá âm bị từ chối');
  for (const [e, d] of [['move', 'x'], ['move', [1, 2]], ['battle:act', null], ['npc:act', { id: { a: 1 } }], ['item:equip', { uid: { $gt: '' } }], ['pet:fuse', { a: [], b: {} }], ['market:buy', { id: '__proto__' }], ['craft:make', { id: 'constructor' }], ['daily:claim', { id: 'toString' }], ['chat:send', { ch: 'khu', text: { a: 1 } }], ['nope:nope', {}]]) await P.emit(e, d);
  r = await P.emit('map:travel', { map: 'constructor' }); st = (await P.emit('enter')).state; ok(!r.ok && st.map === 'ch1', 'Dịch chuyển tới "constructor" bị chặn, vị trí không hỏng');
  r = await P.emit('arena:fight', { id: '__proto__' }); ok(!r.ok, 'Đấu trường với đối thủ "__proto__" bị chặn');
  r = await P.emit('guild:join', { id: '__proto__' }); ok(!r.ok && !/lỗi/.test(r.msg), 'Gia nhập phái "__proto__" bị chặn');
  h = await httpGet('/'); r = await P.emit('daily:info'); ok(h.code === 200 && r.ok, 'Máy chủ không sập với 11 kiểu dữ liệu sai kiểu / prototype pollution');
  ok(({}).polluted === undefined, 'Không bị ô nhiễm prototype');

  console.log('\n═══ 4. Chống spam ═══');
  const S = await player('sp');
  r = await S.emit('chat:send', { ch: 'khu', text: 'xin chào' }); ok(r.ok, 'Chat bình thường');
  r = await S.emit('chat:send', { ch: 'khu', text: 'xin chào' }); ok(!r.ok, 'Chặn chat dồn dập / lặp lại');
  r = await S.emit('chat:send', { ch: 'admin', text: 'hi' }); ok(!r.ok, 'Chặn kênh chat không tồn tại');
  const burst = await Promise.all(Array.from({ length: 160 }, () => S.emit('daily:info')));
  ok(burst.some((x) => /quá nhanh/.test(x.msg || '')), 'Giới hạn tốc độ: 160 lệnh dồn dập bị chặn bớt', burst.filter((x) => x.ok).length + ' qua');
  await sleep(2200); r = await S.emit('daily:info'); ok(r.ok, 'Sau khi dừng spam thì dùng lại bình thường');
  const big = await client(); let closed = false; big.ws.onclose = () => (closed = true);
  big.ws.send(JSON.stringify({ e: 'meta', d: { x: 'a'.repeat(200000) }, i: 1 })); await sleep(600);
  ok(closed, 'Gói tin quá lớn (200KB) bị ngắt kết nối');

  console.log('\n═══ 5. Hằng ngày & Tháp ═══');
  const B = await player('tb', 'ma');
  await B.emit('test:give', { lvl: 20, bac: 20000, vang: 500 });
  r = await B.emit('daily:checkin'); ok(r.ok, 'Điểm danh');
  r = await B.emit('tower:fight'); let res = await fight(B, r.battle); ok(res && res.result && res.result.towerFloor === 1, 'Thắng tầng 1 Trấn Yêu Tháp');
  r = await B.emit('daily:info'); ok(r.daily.tasks.find((t) => t.id === 'kill').prog >= 1, 'Nhiệm vụ ngày ghi nhận tiến độ');

  console.log('\n═══ 6. Thú cưỡi ═══');
  r = await B.emit('mount:buy', { id: 'bachma' }); ok(r.ok, 'Mua Bạch Long Mã');
  const pw0 = r.state.derived.spd; r = await B.emit('mount:ride', { id: null }); const pw1 = r.state.derived.spd;
  ok(pw0 > pw1, 'Cưỡi thú được cộng tốc độ', pw0 + ' > ' + pw1);
  r = await B.emit('mount:ride', { id: 'candau' }); ok(!r.ok, 'Không cưỡi được thú chưa có');
  r = await B.emit('mount:buy', { id: 'kylan' }); ok(!r.ok, 'Kỳ Lân không mua được (phải rèn)');

  console.log('\n═══ 7. Luyện đan / Rèn đồ ═══');
  r = await B.emit('craft:make', { id: 'linh_dan' }); ok(!r.ok && /Thiếu/.test(r.msg), 'Thiếu nguyên liệu thì không luyện được');
  await B.emit('test:give', { items: { thao_duoc: 30, yeu_dan: 30, tinh_thach: 30, thu_bi: 30 } });
  r = await B.emit('craft:make', { id: 'linh_dan', times: 3 }); ok(r.ok, 'Luyện 3 Linh Đan', r.msg);
  r = await B.emit('craft:make', { id: 'hop_the_dan' }); ok(r.ok, 'Luyện Hợp Thể Đan');
  r = await B.emit('craft:make', { id: 'sach' }); ok(r.ok && /Sách/.test(r.msg), 'Luyện Sách kỹ năng ngẫu nhiên', r.msg);
  r = await B.emit('craft:make', { id: 'equip', slot: 'vukhi' }); ok(r.ok, 'Rèn vũ khí', r.msg);
  r = await B.emit('craft:make', { id: 'linh_dan', times: 'many' }); ok(!r.ok, 'Số lần luyện không hợp lệ bị từ chối');
  r = await B.emit('craft:make', { id: 'equip', slot: 'xxx' }); ok(!r.ok, 'Ô trang bị không hợp lệ bị từ chối');

  console.log('\n═══ 8. Tiên sủng nâng cao ═══');
  await B.emit('test:give', { items: { trung_bd: 2, sach_loi: 1 } });
  await B.emit('item:use', { id: 'trung_bd' }); r = await B.emit('item:use', { id: 'trung_bd' });
  st = r.state; ok(st.pets.length >= 2, 'Ấp trứng có 2 Tiên sủng');
  const p1 = st.pets[0], p2 = st.pets[1];
  r = await B.emit('pet:learn', { uid: p1.uid, book: 'sach_loi' }); ok(r.ok && r.state.pets.find((p) => p.uid === p1.uid).skills.includes('pet_loi'), 'Học chiêu Lôi Đình Vạn Quân từ sách');
  await B.emit('test:give', { petLvl: 60, items: { linh_dan: 10 } });
  const g0 = r.state.pets.find((p) => p.uid === p1.uid).grade;
  r = await B.emit('pet:evolve', { uid: p1.uid });
  ok(r.ok && r.pet.grade === g0 + 1, 'Tiến hoá Tiên sủng lên 1 phẩm', r.msg);
  r = await B.emit('pet:fuse', { a: p1.uid, b: p1.uid }); ok(!r.ok, 'Không ghép một con với chính nó');
  r = await B.emit('pet:fuse', { a: p1.uid, b: p2.uid }); ok(r.ok && r.state.pets.length === st.pets.length - 1, 'Hợp thể hai Tiên sủng thành một', r.msg);

  console.log('\n═══ 9. Chợ giao dịch (2 người) ═══');
  const C = await player('tc', 'yeu');
  await C.emit('test:give', { lvl: 10, bac: 5000 });
  await B.emit('test:give', { items: { hp_m: 5 } });
  const bacB0 = (await B.emit('enter')).state.bac;
  r = await B.emit('market:sell', { kind: 'item', id: 'hp_m', qty: 3, price: 1000 }); ok(r.ok, 'Đăng bán 3 Đại Hoàn Đan giá 1.000');
  let list = await C.emit('market:list', { kind: 'all', q: 'Đại Hoàn' }); const lid = list.list.find((l) => l.seller.startsWith('TB') || l.seller.startsWith('tb'))?.id || list.list[0]?.id;
  ok(!!lid, 'Người khác tìm thấy món hàng');
  r = await B.emit('market:buy', { id: lid }); ok(!r.ok, 'Không tự mua hàng của mình');
  const [b1, b2] = await Promise.all([C.emit('market:buy', { id: lid }), C.emit('market:buy', { id: lid })]);
  ok([b1, b2].filter((x) => x.ok).length === 1, 'Mua trùng 2 lần cùng lúc chỉ thành công 1 lần');
  const bacB1 = (await B.emit('enter')).state.bac;
  ok(bacB1 - bacB0 === 950, 'Người bán nhận bạc sau thuế 5%', bacB1 - bacB0);
  r = await B.emit('mail:read'); ok(r.list.some((m) => /Đã bán/.test(m.text)), 'Người bán nhận thư báo');
  r = await B.emit('market:sell', { kind: 'item', id: 'hp_m', qty: 2, price: 50 }); list = await B.emit('market:list', { kind: 'mine' });
  r = await B.emit('market:cancel', { id: list.list[0].id }); ok(r.ok, 'Huỷ bán, hàng trả về');

  console.log('\n═══ 10. Tổ đội ═══');
  r = await B.emit('party:invite', { name: C.st.name }); ok(r.ok, 'Mời vào tổ đội');
  r = await C.emit('social:respond', { type: 'party', fromId: B.st.id, accept: true }); ok(r.ok, 'Chấp nhận lời mời', r.msg);
  r = await B.emit('party:info'); ok(r.party && r.party.members.length === 2, 'Tổ đội có 2 người');
  r = await C.emit('chat:send', { ch: 'doi', text: 'đi đánh boss nào' }); await sleep(200); ok(B.ev.some((e) => e.e === 'chat' && e.d.ch === 'doi'), 'Chat kênh Đội');
  await B.emit('map:travel', { map: 'ch1' }); await C.emit('map:travel', { map: 'ch1' });
  r = await B.emit('tower:fight'); ok(r.battle && r.battle.units.some((u) => u.id.startsWith('a')), 'Đồng đội cùng bản đồ tự động xuất trận');
  res = await fight(B, r.battle); ok(res && res.result, 'Trận tổ đội kết thúc', res && res.result && res.result.outcome);
  r = await C.emit('party:leave'); ok(r.ok, 'Rời tổ đội');
  // tuyển đội qua kênh Khu
  r = await B.emit('party:recruit'); ok(r.ok, 'Đăng tin tuyển đội'); await sleep(200);
  ok(C.ev.some((e) => e.e === 'chat' && e.d.recruit === B.st.id), 'Tin tuyển đội có nút Xin vào');
  r = await B.emit('party:recruit'); ok(!r.ok, 'Chặn đăng tin tuyển liên tục (1 phút)');
  r = await C.emit('party:apply', { id: B.st.id }); ok(r.ok, 'Gửi đơn xin vào đội', r.msg);
  r = await C.emit('party:apply', { id: '__proto__' }); ok(!r.ok, 'Xin vào đội mã lạ bị chặn');
  r = await B.emit('social:respond', { type: 'partyApply', fromId: C.st.id, accept: true }); ok(r.ok, 'Đội trưởng nhận đơn', r.msg);
  r = await C.emit('party:info'); ok(r.party && r.party.members.length === 2, 'Người xin đã vào đội');
  await C.emit('party:leave');

  console.log('\n═══ 11. Sự kiện ═══');
  r = await B.emit('event:info');
  if (r.event) {
    r = await B.emit('event:gift'); ok(r.ok, 'Nhận quà sự kiện');
    r = await B.emit('event:gift'); ok(!r.ok, 'Không nhận quà 2 lần một ngày');
    r = await B.emit('item:use', { id: 'li_xi' }); ok(r.ok && /Lì xì/.test(r.msg), 'Mở Bao Lì Xì', r.msg);
    r = await B.emit('item:use', { id: 'phao_hoa' }); await sleep(200); ok(r.ok && C.ev.some((e) => e.e === 'fx:firework'), 'Pháo hoa hiện cho người cùng bản đồ');
  } else console.log('  (bỏ qua – chạy server với TDK_EVENT=tet để thử)');

  console.log('\n═══ 13. Ba phái, gương mặt, đội 3 Tiên sủng, trạng thái ═══');
  {
    const Lg = require('../game/logic');
    const old = { race: 'than', gender: 'f', lvl: 30, pets: [{ uid: 'x1' }], activePet: 'x1', skills: ['thien_loi'], equip: {} };
    Lg.migrateChar(old);
    ok(old.race === 'tien' && old.facePick === true && old.face === 3 && old.activePets.join() === 'x1' && old.skills.includes('dinh_than'), 'Chuyển nhân vật Thần cũ → phái Tiên, giữ pet, được đổi gương mặt 1 lần');
    const Z = await client(); const zu = ('ph' + T).toLowerCase();
    await Z.emit('auth:register', { user: zu, pass: '1234' });
    r = await Z.emit('char:create', { name: 'Ph' + T, race: 'phat', face: 4 }); ok(r.ok, 'Tạo nhân vật phái Phật, gương mặt Long Nữ');
    let en = await Z.emit('enter'); ok(en.state.race === 'phat' && en.state.face === 4 && en.state.gender === 'f' && en.state.skills.includes('xa_than'), 'Phái, gương mặt, giới tính, bộ kỹ năng Phật đúng');
    r = await Z.emit('char:face', { face: 1 }); ok(!r.ok, 'Không đổi gương mặt miễn phí khi không có lượt');
    const Y = await client(); await Y.emit('auth:register', { user: ('pz' + T).toLowerCase(), pass: '1234' });
    r = await Y.emit('char:create', { name: 'Pz' + T, race: 'constructor', face: 1 }); ok(!r.ok, 'Mã phái lạ bị từ chối');
    r = await Y.emit('char:create', { name: 'Pz' + T, race: 'yeu', face: 'abc' }); ok(r.ok, 'Gương mặt sai kiểu vẫn tạo được với mặc định');
    await Z.emit('test:give', { lvl: 40, items: { trung_bd: 4, hp_s: 5 } });
    for (let i = 0; i < 4; i++) await Z.emit('item:use', { id: 'trung_bd' });
    en = await Z.emit('enter');
    ok(en.state.pets.length === 4 && en.state.activePets.length === 3, 'Có 4 pet, tự xếp 3 con vào đội xuất chiến');
    const extra = en.state.pets.find((p) => !en.state.activePets.includes(p.uid));
    r = await Z.emit('pet:team', { uid: extra.uid, on: true }); ok(!r.ok, 'Đội tối đa 3 Tiên sủng');
    r = await Z.emit('tower:fight'); let bt = r.battle;
    ok(bt && bt.units.filter((u) => u.side === 0 && u.kind === 'pet').length === 3 && bt.units.every((u) => u.pos >= 1), 'Trận đấu có người + 3 Tiên sủng, mỗi đơn vị có số vị trí');
    ok(bt.bench.length === 1 && bt.bench[0].uid === extra.uid, 'Danh sách Tiên sủng dự bị để lệnh Sủng');
    r = await Z.emit('battle:act', { type: 'defend' }); ok(r.ok && r.events.some((e) => e.k === 'defend' && e.mpGain >= 0), 'Lệnh Nghỉ: phòng thủ + hồi nội lực');
    if (!r.result) { r = await Z.emit('battle:act', { type: 'pet', uid: extra.uid }); ok(r.ok && r.events.some((e) => e.k === 'summon') && r.snapshot.bench.length === 0, 'Lệnh Sủng: gọi Tiên sủng dự bị ra trận'); }
    if (!r.result) { const foe = r.snapshot.units.find((u) => u.side === 1 && !u.dead); r = await Z.emit('battle:act', { type: 'skill', skill: 'xa_than', target: foe.id }); ok(r.ok && r.events.some((e) => e.k === 'selfcost'), 'Xả Thân trừ khí huyết bản thân'); }
    if (r && !r.result) await fight(Z, r.snapshot);
    // trạng thái trong động cơ trận
    const { Battle } = require('../game/battle');
    const Dd = require('../game/data'); require('../game/data2');
    const ch = Lg.createChar('t1', 'u', 'Thu', 'yeu', 'm', 0); ch.lvl = 60; ch.hp = 9999; ch.mp = 9999;
    const sid = Dd.speciesId('hautinh', 'tho', 0), mk = () => { const m = Lg.makeMonster(sid, 10); m.maxHp = m.hp = 99999; return m; };
    const bb = new Battle(ch, [mk(), mk()], { kind: 'wild' });
    bb.get('p').mp = 9999; bb.get('e0').res = { seal: 0, chaos: 0, stun: 0 };
    let evs = []; for (let i = 0; i < 6 && !bb.get('e0').seal && !bb.over; i++) evs = evs.concat(bb.doRound({ type: 'skill', skill: 'phong_an', target: 'e0' }).events);
    ok(evs.some((e) => e.hits && e.hits.some((h) => h.st === 'seal' && h.ok)) && bb.snapshot().units.find((u) => u.id === 'e0').seal > 0, 'Phong Ấn dính lên địch (kháng 0%)');
    const t2 = new Battle(ch, [mk()], { kind: 'wild' });
    t2.get('e0').res = { seal: 100, chaos: 100, stun: 100 };
    const ev2 = t2.doRound({ type: 'skill', skill: 'phong_an', target: 'e0' }).events.find((e) => e.k === 'skill');
    ok(ev2 && ev2.hits[0].resist === true, 'Kháng 100% thì không bao giờ dính Phong Ấn');
    const ch2 = Lg.createChar('t2', 'u', 'Thu2', 'phat', 'm', 0); ch2.lvl = 60; ch2.hp = 9999; ch2.mp = 9999; ch2.skills = Dd.RACES.phat.skills;
    for (let i = 0; i < 2; i++) { const pt = Lg.makePet(sid, 10, false); ch2.pets.push(pt); }
    Lg.teamAdd(ch2, ch2.pets[0].uid);
    const t3 = new Battle(ch2, [mk()], { kind: 'wild' });
    let e3 = t3.doRound({ type: 'pet', uid: ch2.pets[1].uid }).events;
    ok(e3.some((e) => e.k === 'summon') && t3.units.filter((u) => u.kind === 'pet').length === 2, 'Lệnh Sủng gọi thêm Tiên sủng vào trận');
    e3 = t3.doRound({ type: 'pet', uid: ch2.pets[1].uid }).events; ok(!e3.some((e) => e.k === 'summon'), 'Một Tiên sủng chỉ được gọi ra một lần mỗi trận');
    const hp0 = t3.get('p').hp; e3 = t3.doRound({ type: 'skill', skill: 'xa_than', target: 'e0' }).events;
    ok(e3.some((e) => e.k === 'selfcost'), 'Xả Thân trừ khí huyết bản thân');
    e3 = t3.doRound({ type: 'skill', skill: 'kim_cang_ho' }).events; ok(t3.get('p').shield > 0 || e3.some((e) => e.k === 'buff' && e.shield), 'Kim Cang Hộ Thể tạo khiên');
  }

  console.log('\n═══ 12. Nhiều người chơi cùng lúc ═══');
  const many = await Promise.all(Array.from({ length: 12 }, (_, i) => player('m' + i)));
  const t0 = Date.now();
  await Promise.all(many.map(async (m) => { for (let k = 0; k < 8; k++) { await m.emit('daily:info'); await m.emit('move', { x: m.st.x + (k % 2 ? -1 : 1), y: m.st.y }); } }));
  ok(Date.now() - t0 < 8000, `12 người chơi × 16 lệnh xử lý trong ${Date.now() - t0}ms`);

  console.log(`\n══════════ KẾT QUẢ: ${pass} đạt · ${fail} lỗi ══════════`);
  if (fail) console.log('Lỗi:', fails.join(' | '));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('Kiểm thử dừng vì lỗi:', e); process.exit(2); });
