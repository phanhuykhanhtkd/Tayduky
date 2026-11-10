// =====================================================================
//  TÍNH NĂNG ĐỢT 3–5
//   • Thú cưỡi · Tiên sủng nâng cao (tiến hoá, ghép, sách kỹ năng)
//   • Luyện đan / rèn đồ · Sự kiện theo mùa
//   • Tổ đội (đồng đội cùng xuất trận) · Chợ giao dịch
// =====================================================================
const D = require('./data');
const X = require('./data2');
const L = require('./logic');

const own = (o, k) => (typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined);
const int = (v, min, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : null; };
const fmt = (n) => Number(n).toLocaleString('vi-VN');

// ---------- thú cưỡi ----------
function mountBonus(c, o) {
  const m = c.mount && X.MOUNTS[c.mount];
  if (!m) return o;
  const lvMul = 1 + 0.12 * (((c.mountLv || {})[c.mount] || 1) - 1); // mỗi cấp thú cưỡi +12% hiệu quả
  for (const [k, v] of Object.entries(m.bonus)) if (o[k] != null) o[k] = k === 'crit' ? o[k] + v * lvMul : o[k] * (1 + (v * lvMul) / 100);
  return o;
}

// ---------- Tiên sủng ----------
const MAX_PET_SKILLS = 4;
function petSkills(p) {
  const sp = D.getSpecies(p.sid);
  const out = [...sp.skills];
  for (const k of p.learned || []) if (!out.includes(k) && out.length < MAX_PET_SKILLS) out.push(k);
  return out;
}
function evolveNeed(p) { const g = D.getSpecies(p.sid).grade; return { lvl: 15 + g * 10, dan: g + 1, bac: 500 * (g + 1) }; }

// ---------- sự kiện ----------
function activeEvent() {
  if (process.env.TDK_EVENT) return X.EVENTS.find((e) => e.id === process.env.TDK_EVENT) || null;
  const d = L.vnNow().toISOString().slice(0, 10);
  return X.EVENTS.find((e) => d >= e.from && d <= e.to) || null;
}

// ---------- tổ đội (lưu trong bộ nhớ) ----------
const parties = new Map(); // id -> { id, leader, members: [charId] }
const partyOf = new Map(); // charId -> partyId
let partySeq = 1;
const recruitAt = new Map(); // charId -> lần đăng tin tuyển đội gần nhất
function partyView(db, pid, online) {
  const p = parties.get(pid); if (!p) return null;
  return { id: p.id, leader: p.leader, members: p.members.map((id) => { const c = db.chars[id]; return c ? { id, name: c.name, race: c.race, gender: c.gender, lvl: c.lvl, map: c.map, online: online.has(id), gear: L.gearBrief(c) } : null; }).filter(Boolean) };
}
function leaveParty(id) {
  const pid = partyOf.get(id); if (!pid) return null;
  const p = parties.get(pid); partyOf.delete(id);
  if (!p) return null;
  p.members = p.members.filter((m) => m !== id);
  if (p.members.length <= 1) { for (const m of p.members) partyOf.delete(m); parties.delete(pid); return { disbanded: true, rest: p.members }; }
  if (p.leader === id) p.leader = p.members[0];
  return { rest: p.members };
}
// đồng đội đang online, cùng bản đồ, không trong trận → cùng xuất trận (máy tự đánh)
function partyAllies(db, c, online, battles) {
  const pid = partyOf.get(c.id); if (!pid) return [];
  const p = parties.get(pid); if (!p) return [];
  const out = [];
  for (const id of p.members) {
    if (id === c.id || out.length >= 2) continue;
    const m = db.chars[id];
    if (!m || !online.has(id) || battles.has(id) || m.map !== c.map || m.hp < 1) continue;
    const s = L.calcStats(m);
    out.push({ kind: 'hero', allyId: id, name: m.name, lvl: m.lvl, hero: { race: m.race, gender: m.gender, face: m.face, gear: L.gearBrief(m) }, ...s, hp: Math.max(1, m.hp), mp: m.mp,
      skills: [...m.skills.filter((k) => (D.SKILLS[k].lv || 1) <= m.lvl), ...(m.secretSkills || [])], catchable: false });
  }
  return out;
}

// ---------- chợ ----------
const MARKET = { maxListings: 8, tax: 0.05, ttl: 72 * 3600e3, minPrice: 1, maxPrice: 50000000 };
function sweepMarket(db, now = Date.now()) {
  const m = db.market || (db.market = { seq: 1, list: {} });
  for (const l of Object.values(m.list)) if (now - l.at > MARKET.ttl) { returnListing(db, l, 'hết hạn'); delete m.list[l.id]; }
  return m;
}
function returnListing(db, l, why) {
  const c = db.chars[l.seller]; if (!c) return;
  if (l.kind === 'item') L.addItem(c, l.data.id, l.qty);
  else if (l.kind === 'eq') { if (!L.addEquip(c, l.data)) mail(c, `Hành trang đầy – ${l.data.name} gửi lại vào kho sau.`, l); }
  else if (l.kind === 'pet') c.pets.push(l.data);
  mail(c, `Món hàng «${l.title}» đã được trả lại (${why}).`);
}
function mail(c, text) { c.mail = (c.mail || []).slice(-19); c.mail.push({ t: Date.now(), text, seen: false }); }
function listingView(l, meId) {
  return { id: l.id, kind: l.kind, title: l.title, itemId: l.kind === 'item' ? l.data.id : null, qty: l.qty, price: l.price, seller: l.sellerName, mine: l.seller === meId, at: l.at,
    icon: l.kind === 'item' ? D.ITEMS[l.data.id].icon : l.kind === 'eq' ? D.SLOTS[l.data.slot].icon : null,
    q: l.kind === 'eq' ? l.data.q : l.kind === 'pet' ? D.getSpecies(l.data.sid).grade : null,
    sub: l.kind === 'eq' ? `${D.SLOTS[l.data.slot].name} · Cấp ${l.data.lvl}${l.data.plus ? ' · +' + l.data.plus : ''}` : l.kind === 'pet' ? `Cấp ${l.data.lvl} · ${D.GRADES[D.getSpecies(l.data.sid).grade].name}${l.data.mut ? ' · Biến dị' : ''}` : D.ITEMS[l.data.id].desc,
    pet: l.kind === 'pet' ? L.petView(l.data) : null };
}

// =====================================================================
function register(on, ctx) {
  const { db, notInBattle, sys, online, battles, io, pushState, toast, socket } = ctx;

  // ---------- thú cưỡi ----------
  on('mount:list', true, (c) => ({ ok: true, list: Object.entries(X.MOUNTS).map(([id, m]) => ({ id, ...m, owned: (c.mounts || []).includes(id), riding: c.mount === id })), noState: true }));
  on('mount:buy', true, (c, { id }) => {
    const m = own(X.MOUNTS, id);
    if (!m || !m.price) return { ok: false, msg: 'Không mua được thú cưỡi này.' };
    c.mounts = c.mounts || [];
    if (c.mounts.includes(id)) return { ok: false, msg: 'Bạn đã có thú cưỡi này.' };
    if (c.lvl < m.lvl) return { ok: false, msg: `Cần đạt cấp ${m.lvl}.` };
    if (m.price.bac && c.bac < m.price.bac) return { ok: false, msg: `Cần ${fmt(m.price.bac)} bạc.` };
    if (m.price.vang && c.vang < m.price.vang) return { ok: false, msg: `Cần ${m.price.vang} vàng.` };
    c.bac -= m.price.bac || 0; c.vang -= m.price.vang || 0;
    c.mounts.push(id); c.mount = id;
    if (id === 'candau') sys(`${c.name} đã thu phục Cân Đẩu Vân!`);
    return { ok: true, msg: `Đã có ${m.name}! Đang cưỡi.` };
  });
  on('mount:ride', true, (c, { id }) => {
    if (id && (!own(X.MOUNTS, id) || !(c.mounts || []).includes(id))) return { ok: false, msg: 'Chưa có thú cưỡi này.' };
    c.mount = id || null;
    io.to('map:' + c.map).emit('map:gear', { id: c.id, gear: L.gearBrief(c) });
    return { ok: true, msg: id ? `Cưỡi ${X.MOUNTS[id].name}.` : 'Đã xuống thú cưỡi.' };
  });

  // ---------- Tiên sủng nâng cao ----------
  const findPet = (c, uid) => c.pets.find((p) => p.uid === uid);
  on('pet:learn', true, (c, { uid, book }) => {
    const p = findPet(c, uid), it = own(D.ITEMS, book);
    if (!p || !it || it.type !== 'book') return { ok: false, msg: 'Không hợp lệ.' };
    if (L.countItem(c, book) < 1) return { ok: false, msg: 'Không có sách này.' };
    const cur = petSkills(p);
    if (cur.includes(it.teach)) return { ok: false, msg: 'Tiên sủng đã biết chiêu này.' };
    p.learned = p.learned || [];
    let replaced = null;
    if (cur.length >= MAX_PET_SKILLS) { if (!p.learned.length) return { ok: false, msg: 'Tiên sủng đã đủ 4 chiêu bẩm sinh.' }; replaced = p.learned.shift(); }
    p.learned.push(it.teach);
    L.removeItem(c, book, 1);
    return { ok: true, msg: `${p.name} học được ${D.SKILLS[it.teach].name}!${replaced ? ` (quên ${D.SKILLS[replaced].name})` : ''}` };
  });
  on('pet:evolve', true, (c, { uid }) => {
    const p = findPet(c, uid); if (!p) return { ok: false, msg: 'Không tìm thấy Tiên sủng.' };
    const sp = D.getSpecies(p.sid);
    if (sp.than) return { ok: false, msg: 'Thần sủng tiến hoá bằng Chân Hoá (mục Thần sủng).' };
    if (sp.grade >= 4) return { ok: false, msg: 'Đã đạt phẩm cao nhất (Thánh).' };
    const n = evolveNeed(p);
    if (p.lvl < n.lvl) return { ok: false, msg: `Cần Tiên sủng đạt cấp ${n.lvl}.` };
    if (L.countItem(c, 'linh_dan') < n.dan) return { ok: false, msg: `Cần ${n.dan} Linh Đan (luyện ở Lò Bát Quái).` };
    if (c.bac < n.bac) return { ok: false, msg: `Cần ${fmt(n.bac)} bạc.` };
    L.removeItem(c, 'linh_dan', n.dan); c.bac -= n.bac;
    const old = (p.mut ? 'Biến Dị ' : '') + sp.name;
    p.sid = D.speciesId(sp.form, sp.element, sp.grade + 1);
    const nsp = D.getSpecies(p.sid);
    if (p.name === old) p.name = (p.mut ? 'Biến Dị ' : '') + nsp.name;
    if (nsp.grade >= 3) sys(`${c.name} tiến hoá Tiên sủng thành [${D.GRADES[nsp.grade].name}] ${nsp.name}!`);
    return { ok: true, msg: `Tiến hoá thành công: ${D.GRADES[nsp.grade].name} ${nsp.name}!`, pet: L.petView(p) };
  });
  on('pet:fuse', true, (c, { a, b }) => {
    const pa = findPet(c, a), pb = findPet(c, b);
    if (!pa || !pb || a === b) return { ok: false, msg: 'Chọn hai Tiên sủng khác nhau.' };
    if (L.countItem(c, 'hop_the_dan') < 1) return { ok: false, msg: 'Cần 1 Hợp Thể Đan (luyện ở Lò Bát Quái).' };
    const sa = D.getSpecies(pa.sid), sb = D.getSpecies(pb.sid);
    if (sa.than || sb.than) return { ok: false, msg: 'Không thể hợp thể Thần sủng.' };
    const cost = 500 * (Math.max(sa.grade, sb.grade) + 1);
    if (c.bac < cost) return { ok: false, msg: `Cần ${fmt(cost)} bạc.` };
    L.removeItem(c, 'hop_the_dan', 1); c.bac -= cost;
    const form = L.chance(0.5) ? sa.form : sb.form, elem = L.chance(0.5) ? sa.element : sb.element;
    const grade = Math.min(4, Math.max(sa.grade, sb.grade) + (L.chance(0.3) ? 1 : 0));
    const mut = (pa.mut || pb.mut) && L.chance(0.6) || L.chance(0.03);
    const np = L.makePet(D.speciesId(form, elem, grade), Math.max(1, Math.floor((pa.lvl + pb.lvl) / 2)), mut);
    const pool = [...new Set([...(pa.learned || []), ...(pb.learned || [])])];
    np.learned = pool.sort(() => Math.random() - 0.5).slice(0, 2);
    c.pets = c.pets.filter((p) => p.uid !== a && p.uid !== b);
    c.pets.push(np);
    { const lead = c.activePet === a || c.activePet === b; L.teamRemove(c, a); L.teamRemove(c, b); L.teamAdd(c, np.uid, lead); }
    if (grade >= 3 || np.mut) sys(`${c.name} hợp thể ra Tiên sủng ${np.mut ? 'BIẾN DỊ ' : ''}[${D.GRADES[grade].name}] ${np.name}!`);
    return { ok: true, msg: `Hợp thể thành công: ${np.name}!`, pet: L.petView(np) };
  });

  // ---------- luyện đan / rèn đồ ----------
  on('craft:list', true, (c) => ({ ok: true, recipes: Object.entries(X.RECIPES).map(([id, r]) => ({ id, ...r, have: Object.fromEntries(Object.keys(r.need).map((k) => [k, L.countItem(c, k)])), cost: r.bac ?? (r.bacPerLvl || 0) * c.lvl })), noState: true }));
  on('craft:make', true, (c, { id, slot, times }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const r = own(X.RECIPES, id); if (!r) return { ok: false, msg: 'Công thức không tồn tại.' };
    const n = r.give === 'equip' || String(r.give).startsWith('mount') ? 1 : int(times ?? 1, 1, 20);
    if (n == null) return { ok: false, msg: 'Số lần không hợp lệ.' };
    if (r.lvl && c.lvl < r.lvl) return { ok: false, msg: `Cần đạt cấp ${r.lvl}.` };
    const cost = (r.bac ?? (r.bacPerLvl || 0) * c.lvl) * n;
    for (const [k, q] of Object.entries(r.need)) if (L.countItem(c, k) < q * n) return { ok: false, msg: `Thiếu ${D.ITEMS[k].name} (cần ${q * n}).` };
    if (c.bac < cost) return { ok: false, msg: `Cần ${fmt(cost)} bạc.` };
    if (r.give === 'equip' && !own(D.SLOTS, slot)) return { ok: false, msg: 'Chọn ô trang bị.' };
    if (String(r.give).startsWith('mount:')) { const mid = r.give.slice(6); if ((c.mounts || []).includes(mid)) return { ok: false, msg: 'Bạn đã có thú cưỡi này.' }; }
    const got = [];
    for (let i = 0; i < n; i++) {
      if (r.give === 'equip') {
        if (L.bagUsed(c) >= D.CONFIG.bagSize) return { ok: false, msg: 'Hành trang đầy.' };
        const q = L.weighted([30, 35, 22, 10, 3]);
        const eq = L.makeEquip(slot, Math.max(1, c.lvl), q); L.addEquip(c, eq); got.push(`${D.QUALITIES[q].name} ${eq.name}`);
        if (q >= 4) sys(`${c.name} rèn ra trang bị [${D.QUALITIES[q].name}] ${eq.name}!`);
      } else if (r.give === 'book') { const b = L.pick(X.BOOKS); L.addItem(c, b, 1); got.push(D.ITEMS[b].name); }
      else if (String(r.give).startsWith('mount:')) { const mid = r.give.slice(6); c.mounts = [...(c.mounts || []), mid]; c.mount = mid; got.push(X.MOUNTS[mid].name); sys(`${c.name} rèn thành công thú cưỡi ${X.MOUNTS[mid].name}!`); }
      else for (const [k, q] of Object.entries(r.give)) { L.addItem(c, k, q); got.push(`${q} ${D.ITEMS[k].name}`); }
    }
    for (const [k, q] of Object.entries(r.need)) L.removeItem(c, k, q * n);
    c.bac -= cost;
    return { ok: true, msg: `Thành công: ${got.join(', ')}`, got };
  });

  // ---------- sự kiện ----------
  on('event:info', true, (c) => {
    const e = activeEvent();
    if (!e) return { ok: true, event: null, next: X.EVENTS.filter((x) => x.from > L.today()).slice(0, 1).map((x) => ({ name: x.name, from: x.from }))[0] || null, noState: true };
    const st = c.event && c.event.id === e.id ? c.event : (c.event = { id: e.id, gift: null });
    return { ok: true, event: { ...e, giftToday: st.gift === L.today(), have: e.collect ? L.countItem(c, e.collect.item) : 0 }, noState: true };
  });
  on('event:gift', true, (c) => {
    const e = activeEvent(); if (!e) return { ok: false, msg: 'Hiện không có sự kiện.' };
    c.event = c.event && c.event.id === e.id ? c.event : { id: e.id, gift: null };
    if (c.event.gift === L.today()) return { ok: false, msg: 'Hôm nay đã nhận quà sự kiện.' };
    c.event.gift = L.today();
    L.addItem(c, e.gift, e.gift === 'li_xi' ? 2 : 3);
    for (const [id, n] of e.shop || []) L.addItem(c, id, n);
    return { ok: true, msg: `Nhận ${e.gift === 'li_xi' ? 2 : 3} ${D.ITEMS[e.gift].name} + Pháo Hoa!` };
  });
  on('event:exchange', true, (c) => {
    const e = activeEvent(); if (!e || !e.collect) return { ok: false, msg: 'Sự kiện này không có đổi quà.' };
    if (L.countItem(c, e.collect.item) < e.collect.n) return { ok: false, msg: `Cần ${e.collect.n} ${D.ITEMS[e.collect.item].name}.` };
    L.removeItem(c, e.collect.item, e.collect.n);
    L.applyReward(c, e.collect.reward);
    return { ok: true, msg: 'Đổi quà thành công!' };
  });

  // ---------- tổ đội ----------
  const pushParty = (pid) => { const v = partyView(db, pid, online); if (!v) return; for (const m of v.members) online.get(m.id)?.emit('party', v); };
  on('party:info', true, (c) => ({ ok: true, party: partyView(db, partyOf.get(c.id), online), noState: true }));
  on('party:invite', true, (c, { name }) => {
    const t = Object.values(db.chars).find((x) => x.name.toLowerCase() === String(name || '').trim().toLowerCase());
    if (!t || t.id === c.id) return { ok: false, msg: 'Không tìm thấy người chơi.' };
    if (!online.has(t.id)) return { ok: false, msg: `${t.name} đang ngoại tuyến.` };
    if (partyOf.has(t.id)) return { ok: false, msg: `${t.name} đã có tổ đội.` };
    const pid = partyOf.get(c.id), p = pid && parties.get(pid);
    if (p && p.leader !== c.id) return { ok: false, msg: 'Chỉ đội trưởng mới mời được.' };
    if (p && p.members.length >= 3) return { ok: false, msg: 'Tổ đội tối đa 3 người.' };
    ctx.request(t, 'party', c);
    return { ok: true, msg: `Đã mời ${t.name} vào tổ đội.`, noState: true };
  });
  ctx.onRespond('party', (c, from) => {
    if (partyOf.has(c.id)) return { ok: false, msg: 'Bạn đã có tổ đội.' };
    let pid = partyOf.get(from.id), p = pid && parties.get(pid);
    if (!p) { pid = partySeq++; p = { id: pid, leader: from.id, members: [from.id] }; parties.set(pid, p); partyOf.set(from.id, pid); }
    if (p.members.length >= 3) return { ok: false, msg: 'Tổ đội đã đủ người.' };
    p.members.push(c.id); partyOf.set(c.id, pid);
    pushParty(pid);
    toast(from, `${c.name} đã vào tổ đội.`, 'gold');
    return { ok: true, msg: `Đã vào tổ đội của ${from.name}.` };
  });
  // tin tuyển đội ở kênh Khu – người khác bấm "Xin vào" để gửi đơn cho đội trưởng
  on('party:recruit', true, (c) => {
    const now = Date.now(); if (now - (recruitAt.get(c.id) || 0) < 60000) return { ok: false, msg: 'Chờ 1 phút rồi hãy đăng tin tuyển tiếp.', noState: true };
    const pid = partyOf.get(c.id), p = pid && parties.get(pid);
    if (p && p.leader !== c.id) return { ok: false, msg: 'Chỉ đội trưởng mới tuyển người.', noState: true };
    if (p && p.members.length >= 3) return { ok: false, msg: 'Tổ đội đã đủ người.', noState: true };
    recruitAt.set(c.id, now);
    const left = 3 - (p ? p.members.length : 1), M = D.MAPS[c.map];
    ctx.addChat('khu', { from: c.name, fromId: c.id, race: c.race, lvl: c.lvl, text: `📣 Tuyển đồng đội đi ${M ? M.name : 'phụ bản'} – còn ${left} chỗ, ai đi không?`, recruit: c.id });
    return { ok: true, msg: 'Đã đăng tin tuyển đội ở kênh Khu.', noState: true };
  });
  on('party:apply', true, (c, { id }) => {
    const L = own(db.chars, id);
    if (!L || L.id === c.id) return { ok: false, msg: 'Không tìm thấy đội trưởng.', noState: true };
    if (!online.has(L.id)) return { ok: false, msg: `${L.name} đang ngoại tuyến.`, noState: true };
    if (partyOf.has(c.id)) return { ok: false, msg: 'Bạn đã có tổ đội.', noState: true };
    const pid = partyOf.get(L.id), p = pid && parties.get(pid);
    if (p && (p.leader !== L.id || p.members.length >= 3)) return { ok: false, msg: 'Tổ đội này đã đủ người.', noState: true };
    if (!ctx.request(L, 'partyApply', c)) return { ok: false, msg: 'Bạn đã gửi đơn rồi, chờ đội trưởng trả lời.', noState: true };
    return { ok: true, msg: `Đã gửi đơn xin vào đội của ${L.name}.`, noState: true };
  });
  ctx.onRespond('partyApply', (c, from) => { // c = đội trưởng đồng ý, from = người xin vào
    if (partyOf.has(from.id)) return { ok: false, msg: `${from.name} đã vào đội khác.` };
    let pid = partyOf.get(c.id), p = pid && parties.get(pid);
    if (p && p.leader !== c.id) return { ok: false, msg: 'Bạn không còn là đội trưởng.' };
    if (!p) { pid = partySeq++; p = { id: pid, leader: c.id, members: [c.id] }; parties.set(pid, p); partyOf.set(c.id, pid); }
    if (p.members.length >= 3) return { ok: false, msg: 'Tổ đội đã đủ người.' };
    p.members.push(from.id); partyOf.set(from.id, pid);
    pushParty(pid);
    toast(from, `${c.name} đã nhận bạn vào tổ đội.`, 'gold');
    return { ok: true, msg: `${from.name} đã vào tổ đội.` };
  });
  on('party:leave', true, (c) => {
    const pid = partyOf.get(c.id);
    const r = leaveParty(c.id); if (!r) return { ok: false, msg: 'Bạn không ở trong tổ đội.' };
    for (const id of r.rest) { online.get(id)?.emit('party', r.disbanded ? null : partyView(db, pid, online)); const m = db.chars[id]; if (m) toast(m, r.disbanded ? 'Tổ đội đã giải tán.' : `${c.name} đã rời tổ đội.`); }
    socket.emit('party', null);
    return { ok: true, msg: 'Đã rời tổ đội.', noState: true };
  });
  on('party:kick', true, (c, { id }) => {
    const pid = partyOf.get(c.id), p = pid && parties.get(pid);
    if (!p || p.leader !== c.id || !p.members.includes(id) || id === c.id) return { ok: false, msg: 'Không thể mời ra.' };
    const r = leaveParty(id);
    online.get(id)?.emit('party', null); const m = db.chars[id]; if (m) toast(m, 'Bạn đã bị mời ra khỏi tổ đội.', 'err');
    if (r && !r.disbanded) pushParty(pid); else socket.emit('party', null);
    return { ok: true, noState: true };
  });

  // ---------- chợ ----------
  on('market:list', true, (c, { kind, q, page }) => {
    const m = sweepMarket(db);
    let list = Object.values(m.list);
    if (['item', 'eq', 'pet'].includes(kind)) list = list.filter((l) => l.kind === kind);
    if (kind === 'mine') list = list.filter((l) => l.seller === c.id);
    const s = String(q || '').trim().toLowerCase().slice(0, 30);
    if (s) list = list.filter((l) => l.title.toLowerCase().includes(s));
    list.sort((a, b) => b.at - a.at);
    const pg = int(page ?? 0, 0, 999) || 0;
    return { ok: true, total: list.length, list: list.slice(pg * 30, pg * 30 + 30).map((l) => listingView(l, c.id)), mine: Object.values(m.list).filter((l) => l.seller === c.id).length, max: MARKET.maxListings, tax: MARKET.tax, noState: true };
  });
  on('market:sell', true, (c, { kind, id, uid, qty, price }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const m = sweepMarket(db);
    const pr = int(price, MARKET.minPrice, MARKET.maxPrice);
    if (pr == null || pr !== Math.floor(Number(price))) return { ok: false, msg: `Giá từ ${MARKET.minPrice} đến ${fmt(MARKET.maxPrice)} bạc.` };
    if (Object.values(m.list).filter((l) => l.seller === c.id).length >= MARKET.maxListings) return { ok: false, msg: `Tối đa ${MARKET.maxListings} món đang bán.` };
    if (c.lvl < 5) return { ok: false, msg: 'Cần đạt cấp 5 để bán ở chợ.' };
    let l = null;
    if (kind === 'item') {
      const it = own(D.ITEMS, id), n = int(qty, 1, 999);
      if (!it || n == null || L.countItem(c, id) < n) return { ok: false, msg: 'Không đủ vật phẩm.' };
      L.removeItem(c, id, n);
      l = { kind, data: { id }, qty: n, title: `${it.name}${n > 1 ? ' ×' + n : ''}` };
    } else if (kind === 'eq') {
      const i = c.bag.findIndex((b) => b.t === 'eq' && b.uid === uid);
      if (i < 0) return { ok: false, msg: 'Chỉ bán được trang bị trong hành trang (tháo ra trước).' };
      if (c.bag[i].unique) return { ok: false, msg: 'Bảo vật độc bản không thể giao dịch.' };
      const [eq] = c.bag.splice(i, 1);
      l = { kind, data: eq, qty: 1, title: `${D.QUALITIES[eq.q].name} ${eq.name}${eq.plus ? ' +' + eq.plus : ''}` };
    } else if (kind === 'pet') {
      const p = c.pets.find((x) => x.uid === uid);
      if (!p) return { ok: false, msg: 'Không tìm thấy Tiên sủng.' };
      if ((c.activePets || [c.activePet]).includes(uid)) return { ok: false, msg: 'Hãy cho Tiên sủng này nghỉ trước khi bán.' };
      if (String(p.sid).startsWith('than.')) return { ok: false, msg: 'Thần sủng đã khế ước, không thể giao dịch.' };
      c.pets = c.pets.filter((x) => x.uid !== uid);
      l = { kind, data: p, qty: 1, title: p.name };
    } else return { ok: false, msg: 'Loại hàng không hợp lệ.' };
    Object.assign(l, { id: 'm' + m.seq++, seller: c.id, sellerName: c.name, price: pr, at: Date.now() });
    m.list[l.id] = l;
    return { ok: true, msg: `Đã đăng bán «${l.title}» giá ${fmt(pr)} bạc.` };
  });
  on('market:cancel', true, (c, { id }) => {
    const m = sweepMarket(db), l = own(m.list, id);
    if (!l || l.seller !== c.id) return { ok: false, msg: 'Không tìm thấy món hàng của bạn.' };
    delete m.list[id];
    returnListing(db, l, 'bạn đã huỷ bán');
    return { ok: true, msg: 'Đã huỷ bán, hàng trả về túi.' };
  });
  on('market:buy', true, (c, { id }) => {
    const nb = notInBattle(c); if (nb) return nb;
    const m = sweepMarket(db), l = own(m.list, id);
    if (!l) return { ok: false, msg: 'Món hàng đã được bán hoặc hết hạn.' };
    if (l.seller === c.id) return { ok: false, msg: 'Không thể mua hàng của chính mình.' };
    if (c.bac < l.price) return { ok: false, msg: 'Không đủ bạc.' };
    if (l.kind === 'eq' && L.bagUsed(c) >= D.CONFIG.bagSize) return { ok: false, msg: 'Hành trang đầy.' };
    if (l.kind === 'pet' && c.pets.length >= D.CONFIG.petBag) return { ok: false, msg: 'Túi Tiên sủng đã đầy.' };
    if (l.kind === 'item' && !L.addItem(c, l.data.id, l.qty)) return { ok: false, msg: 'Hành trang đầy.' };
    delete m.list[id];
    c.bac -= l.price;
    if (l.kind === 'eq') L.addEquip(c, l.data);
    if (l.kind === 'pet') c.pets.push(l.data);
    const seller = db.chars[l.seller];
    const gain = Math.floor(l.price * (1 - MARKET.tax));
    if (seller) { seller.bac += gain; mail(seller, `Đã bán «${l.title}» cho ${c.name}: +${fmt(gain)} bạc (thuế ${MARKET.tax * 100}%).`); toast(seller, `💰 Đã bán «${l.title}» +${fmt(gain)} bạc`, 'gold'); pushState(seller); }
    return { ok: true, msg: `Đã mua «${l.title}».` };
  });
  on('mail:read', true, (c) => { const list = (c.mail || []).slice().reverse(); for (const x of c.mail || []) x.seen = true; return { ok: true, list, noState: true }; });
}

// ---------- hook dùng vật phẩm mới ----------
function useItem(c, it, id, ctx) {
  if (it.type === 'lixi') {
    L.removeItem(c, id, 1);
    const r = L.weighted([55, 30, 12, 3]);
    const rw = [{ bac: L.rand(200, 600) }, { bac: L.rand(800, 2000) }, { vang: L.rand(2, 5) }, { vang: L.rand(10, 20) }][r];
    L.applyReward(c, rw);
    if (r === 3) ctx.sys(`🧧 ${c.name} mở lì xì được ${rw.vang} vàng – đại cát đại lợi!`);
    return { ok: true, msg: `🧧 Lì xì: ${rw.bac ? fmt(rw.bac) + ' bạc' : rw.vang + ' vàng'}!` };
  }
  if (it.type === 'firework') {
    L.removeItem(c, id, 1);
    ctx.io.to('map:' + c.map).emit('fx:firework', { x: c.x, y: c.y, by: c.name });
    L.addExp(c, 20 + c.lvl * 5);
    return { ok: true, msg: '🎆 Bắn pháo hoa! +tu vi' };
  }
  if (['book', 'petevo', 'petfuse'].includes(it.type)) return { ok: false, msg: 'Dùng trong mục Tiên sủng.' };
  return null;
}

// ---------- rơi nguyên liệu & đồ sự kiện, thưởng đồng đội ----------
function battleExtras(c, b, res, ctx) {
  if (res.outcome !== 'win') return;
  const enemies = b.units.filter((u) => u.side === 1 && u.dead);
  if (b.kind === 'wild' || b.kind === 'tower' || b.kind === 'boss') {
    for (const e of enemies) {
      const k = e.boss ? 3 : 1;
      for (let i = 0; i < k; i++) if (L.chance(e.boss ? 0.9 : 0.32)) { const m = L.pick(X.MATS); if (L.addItem(c, m, 1)) res.items.push(m); }
    }
    if (enemies.some((e) => e.boss) && L.chance(0.12)) { const bk = L.pick(X.BOOKS); if (L.addItem(c, bk, 1)) res.items.push(bk); }
    const ev = activeEvent();
    if (ev && ev.drop && L.chance(0.35)) { if (L.addItem(c, ev.drop, 1)) res.items.push(ev.drop); }
  }
  // đồng đội cùng xuất trận nhận thưởng
  const allies = b.units.filter((u) => u.allyId);
  if (allies.length && res.exp) {
    res.partyBonus = allies.length * 10;
    const extra = Math.round(res.exp * 0.1 * allies.length);
    res.exp += extra; res.ups = [...(res.ups || []), ...L.addExp(c, extra)];
    for (const a of allies) {
      const m = ctx.db.chars[a.allyId]; if (!m) continue;
      const ex = Math.round(res.exp * 0.7), bc = Math.round((res.bac || 0) * 0.5);
      const ups = L.addExp(m, ex); m.bac += bc;
      m.hp = Math.max(1, Math.min(L.calcStats(m).maxHp, a.dead ? Math.round(L.calcStats(m).maxHp * 0.3) : a.hp));
      ctx.toast(m, `⚔️ Cùng ${c.name} chiến thắng: +${fmt(ex)} tu vi, +${fmt(bc)} bạc${ups.length ? ` · lên cấp ${ups[ups.length - 1]}!` : ''}`, 'gold');
      ctx.pushState(m);
    }
  }
}

module.exports = { own, register, mountBonus, petSkills, useItem, battleExtras, partyAllies, leaveParty, activeEvent, partyOf, sweepMarket, int };
