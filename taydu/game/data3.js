// =====================================================================
//  DỮ LIỆU ĐỢT 2–6
//   2 · Thần sủng (nhân vật cốt truyện) + Chân Hoá
//   3 · Boss nhiều giai đoạn, Ác Mộng, Phi Thăng (Tam Cửu Thiên Kiếp)
//   4 · Mệnh, tính cách Tiên sủng, khai thác, sạp hàng, thú cưỡi mới
//   5 · Quà tân thủ, quà online, bế quan, thành tựu & danh hiệu, Tu Hành Lệnh
//   6 · Phó bản tổ đội, Đồ giám, cấp Bang hội, Thiên Địa Dị Tượng
//  Gộp vào data.js / data2.js khi khởi động.
// =====================================================================
const D = require('./data');
const X = require('./data2');

// ---------------------------------------------------------------------
//  ĐỢT 2 · THẦN SỦNG
// ---------------------------------------------------------------------
// Phẩm mới trên Thánh: "Chân" – chỉ Thần sủng đã Chân Hoá mới đạt
D.GRADES[5] = { key: 'chan', name: 'Chân', mult: 2.0, catch: 0, color: '#ff4d6d' };

// look = mã hình boss/NPC dùng để vẽ · f = hệ số chỉ số · sig/sig2 = tuyệt kỹ thường / Chân
const THAN = {
  tieubachlong: { name: 'Tiểu Bạch Long', icon: '🐉', element: 'thuy', look: 'tieubachlong', f: { hp: 1.2, atk: 1.1, matk: 1.35, def: 1.1, spd: 1.15 }, sig: 'ts_tieubachlong', sig2: 'ts_tieubachlong2', role: 'Pháp công diện rộng', lore: 'Tam thái tử Tây Hải, hoá ngựa trắng chở Đường Tăng.' },
  nata: { name: 'Na Tra', icon: '🧒', element: 'hoa', look: 'nata', f: { hp: 1.0, atk: 1.4, matk: 1.0, def: 1.0, spd: 1.35 }, sig: 'ts_nata', sig2: 'ts_nata2', role: 'Vật công tốc độ, gây Bỏng', lore: 'Tam thái tử Thác Tháp Thiên Vương, cưỡi Phong Hỏa Luân.' },
  honghai: { name: 'Hồng Hài Nhi', icon: '👶', element: 'hoa', look: 'honghai', f: { hp: 1.0, atk: 0.9, matk: 1.45, def: 0.95, spd: 1.2 }, sig: 'ts_honghai', sig2: 'ts_honghai2', role: 'Hoả thuật toàn trận', lore: 'Thánh Anh Đại Vương, luyện Tam Muội Chân Hỏa.' },
  hachhung: { name: 'Hắc Hùng Tinh', icon: '🐻', element: 'tho', look: 'hachhung', f: { hp: 1.5, atk: 1.25, matk: 0.7, def: 1.4, spd: 0.85 }, sig: 'ts_hachhung', sig2: 'ts_hachhung2', role: 'Đỡ đòn, khiên', lore: 'Gấu đen núi Hắc Phong, sau làm Thần giữ núi Lạc Già.' },
  bachcot: { name: 'Bạch Cốt Phu Nhân', icon: '💀', element: 'moc', look: 'bachcot', f: { hp: 0.9, atk: 0.9, matk: 1.35, def: 0.9, spd: 1.3 }, sig: 'ts_bachcot', sig2: 'ts_bachcot2', role: 'Khống chế Loạn Hồn, độc', lore: 'Ba lần biến hoá lừa Đường Tăng.' },
  ngoctho: { name: 'Ngọc Thố', icon: '🐇', element: 'kim', look: 'ngoctho', f: { hp: 1.05, atk: 0.75, matk: 1.25, def: 1.0, spd: 1.4 }, sig: 'ts_ngoctho', sig2: 'ts_ngoctho2', role: 'Hồi máu đồng đội', lore: 'Thỏ ngọc giã thuốc ở Quảng Hàn Cung.' },
  thietphien: { name: 'Thiết Phiến Công Chúa', icon: '🪭', element: 'moc', look: 'thietphien', f: { hp: 1.0, atk: 0.85, matk: 1.4, def: 1.0, spd: 1.2 }, sig: 'ts_thietphien', sig2: 'ts_thietphien2', role: 'Cuồng phong, Định Thân', lore: 'La Sát Nữ cầm quạt Ba Tiêu dập lửa Hỏa Diệm Sơn.' },
  kimgiac: { name: 'Kim Giác Đại Vương', icon: '😈', element: 'kim', look: 'kimgiac', f: { hp: 1.1, atk: 1.0, matk: 1.4, def: 1.05, spd: 1.05 }, sig: 'ts_kimgiac', sig2: 'ts_kimgiac2', role: 'Hút nội lực', lore: 'Đồng tử giữ lò của Lão Quân, mang hồ lô Tử Kim.' },
  linhcam: { name: 'Linh Cảm Đại Vương', icon: '🐟', element: 'thuy', look: 'linhcam', f: { hp: 1.3, atk: 1.35, matk: 0.95, def: 1.15, spd: 0.95 }, sig: 'ts_linhcam', sig2: 'ts_linhcam2', role: 'Vật công toàn trận', lore: 'Cá vàng ao sen của Quan Âm, xuống Thông Thiên Hà làm yêu.' },
  nguuma: { name: 'Ngưu Ma Vương', icon: '🐃', element: 'tho', look: 'nguuma', f: { hp: 1.45, atk: 1.45, matk: 0.7, def: 1.25, spd: 0.85 }, sig: 'ts_nguuma', sig2: 'ts_nguuma2', role: 'Vật công hút máu', lore: 'Đại Lực Vương, kết nghĩa với Tôn Ngộ Không.' },
  nhilang: { name: 'Nhị Lang Thần', icon: '🤺', element: 'kim', look: 'nhilang', f: { hp: 1.15, atk: 1.4, matk: 1.15, def: 1.15, spd: 1.15 }, sig: 'ts_nhilang', sig2: 'ts_nhilang2', role: 'Thiên nhãn, Định Thân', lore: 'Dương Tiễn, chiến thần ba mắt cùng Hao Thiên Khuyển.' },
  lucnhi: { name: 'Lục Nhĩ Mỹ Hầu', icon: '🐒', element: 'kim', look: 'lucnhi', f: { hp: 1.1, atk: 1.45, matk: 0.9, def: 1.0, spd: 1.4 }, sig: 'ts_lucnhi', sig2: 'ts_lucnhi2', role: 'Liên kích toàn trận', lore: 'Khỉ sáu tai nghe thấu vạn vật, giả làm Ngộ Không.' },
};
const THAN_IDS = Object.keys(THAN);
const THAN_COST = { summon: 30, summonBac: 20000, chan: 60, chanLinh: 5, chanBac: 150000, chanLvl: 80 };

// tuyệt kỹ Thần sủng (mp 0 – pet dùng theo AI)
Object.assign(D.SKILLS, {
  ts_tieubachlong: { name: 'Long Ngâm Hải Khiếu', type: 'magic', target: 'allEnemy', power: 1.05, mp: 0, fx: 'ice', stun: 0.15, sig: true },
  ts_tieubachlong2: { name: 'Bạch Long Phiên Hải', type: 'magic', target: 'allEnemy', power: 1.35, mp: 0, fx: 'ice', stun: 0.22, sig: true },
  ts_nata: { name: 'Hỏa Tiêm Thương', type: 'phys', target: 'enemy', power: 2.1, mp: 0, fx: 'fire', burn: 2, sig: true },
  ts_nata2: { name: 'Tam Đầu Lục Tý', type: 'phys', target: 'allEnemy', power: 1.3, mp: 0, fx: 'fire', burn: 2, sig: true },
  ts_honghai: { name: 'Tam Muội Chân Hỏa', type: 'magic', target: 'allEnemy', power: 1.0, mp: 0, fx: 'fire', burn: 3, sig: true },
  ts_honghai2: { name: 'Hỏa Vân Phần Thiên', type: 'magic', target: 'allEnemy', power: 1.4, mp: 0, fx: 'fire', burn: 3, sig: true },
  ts_hachhung: { name: 'Hắc Phong Hộ Thể', type: 'buff', target: 'self', mp: 0, fx: 'shield', shield: 0.35, buff: { turns: 3, atkUp: 0.2 }, sig: true },
  ts_hachhung2: { name: 'Lạc Già Thần Hùng', type: 'phys', target: 'allEnemy', power: 1.25, mp: 0, fx: 'rock', stun: 0.2, sig: true },
  ts_bachcot: { name: 'Tam Biến Mê Hồn', type: 'control', target: 'allEnemy', mp: 0, fx: 'shadow', status: 'chaos', chance: 0.45, turns: 1, sig: true },
  ts_bachcot2: { name: 'Bạch Cốt Âm Phong', type: 'magic', target: 'allEnemy', power: 1.25, mp: 0, fx: 'poison', poison: 3, sig: true },
  ts_ngoctho: { name: 'Nguyệt Quang Dược Chử', type: 'heal', target: 'ally', power: 2.6, mp: 0, fx: 'heal', sig: true },
  ts_ngoctho2: { name: 'Quảng Hàn Hồi Xuân', type: 'heal', target: 'allAlly', power: 1.5, mp: 0, fx: 'heal', sig: true },
  ts_thietphien: { name: 'Ba Tiêu Phiến', type: 'magic', target: 'allEnemy', power: 1.1, mp: 0, fx: 'wind', stun: 0.2, sig: true },
  ts_thietphien2: { name: 'Cửu Tiêu Cuồng Phong', type: 'magic', target: 'allEnemy', power: 1.45, mp: 0, fx: 'wind', stun: 0.25, sig: true },
  ts_kimgiac: { name: 'Tử Kim Hồ Lô', type: 'magic', target: 'enemy', power: 2.2, mp: 0, fx: 'gold', mpDrain: 0.3, sig: true },
  ts_kimgiac2: { name: 'Thu Hồn Hồ Lô', type: 'magic', target: 'enemy', power: 2.9, mp: 0, fx: 'gold', mpDrain: 0.4, stun: 0.25, sig: true },
  ts_linhcam: { name: 'Cửu Biện Đồng Chùy', type: 'phys', target: 'enemy', power: 2.3, mp: 0, fx: 'rock', sig: true },
  ts_linhcam2: { name: 'Thông Thiên Cuồng Lãng', type: 'phys', target: 'allEnemy', power: 1.3, mp: 0, fx: 'ice', sig: true },
  ts_nguuma: { name: 'Hỗn Thiết Côn', type: 'phys', target: 'enemy', power: 2.4, mp: 0, fx: 'slash', drain: 0.25, sig: true },
  ts_nguuma2: { name: 'Đại Lực Ngưu Ma', type: 'phys', target: 'allEnemy', power: 1.35, mp: 0, fx: 'rock', drain: 0.15, sig: true },
  ts_nhilang: { name: 'Thiên Nhãn Thần Quang', type: 'magic', target: 'enemy', power: 2.3, mp: 0, fx: 'gold', stun: 0.3, sig: true },
  ts_nhilang2: { name: 'Hao Thiên Khuyển', type: 'phys', target: 'allEnemy', power: 1.35, mp: 0, fx: 'slash', stun: 0.15, sig: true },
  ts_lucnhi: { name: 'Thiết Bổng Loạn Vũ', type: 'phys', target: 'allEnemy', power: 1.1, mp: 0, fx: 'gold', sig: true },
  ts_lucnhi2: { name: 'Lục Nhĩ Thông Thiên', type: 'phys', target: 'allEnemy', power: 1.5, mp: 0, fx: 'gold', stun: 0.12, sig: true },
  // tuyệt chiêu boss hậu truyện
  bs_shell: { name: 'Huyền Giáp', type: 'buff', target: 'self', mp: 0, fx: 'shield', shield: 0.08, buff: { turns: 2 } },
  bs_tide: { name: 'Hải Khiếu', type: 'magic', target: 'allEnemy', power: 1.1, mp: 0, fx: 'ice', stun: 0.15 },
  bs_chain: { name: 'Câu Hồn Tỏa', type: 'control', target: 'enemy', mp: 0, fx: 'shadow', status: 'stun', chance: 0.6, turns: 1 },
  bs_blood: { name: 'Huyết Hải Phệ', type: 'magic', target: 'enemy', power: 1.7, mp: 0, fx: 'poison', drain: 0.5 },
  bs_frost: { name: 'Vạn Lý Băng Phong', type: 'control', target: 'allEnemy', mp: 0, fx: 'ice', status: 'stun', chance: 0.35, turns: 1 },
  bs_roar: { name: 'Chấn Thiên Hống', type: 'phys', target: 'allEnemy', power: 1.0, mp: 0, fx: 'rock', stun: 0.18 },
  bs_mirage: { name: 'Thận Lâu Ảo Cảnh', type: 'control', target: 'allEnemy', mp: 0, fx: 'shadow', status: 'chaos', chance: 0.35, turns: 1 },
  bs_star: { name: 'Cửu Diệu Trụy Tinh', type: 'magic', target: 'allEnemy', power: 1.25, mp: 0, fx: 'fire', burn: 2 },
  bs_void: { name: 'Hỗn Độn Quy Nguyên', type: 'magic', target: 'allEnemy', power: 1.35, mp: 0, fx: 'shadow', mpDrain: 0.15 },
  kiep_loi: { name: 'Cửu Thiên Lôi Kiếp', type: 'magic', target: 'allEnemy', power: 1.3, mp: 0, fx: 'thunder', stun: 0.2 },
  kiep_hoa: { name: 'Nghiệp Hỏa Thiêu Thân', type: 'magic', target: 'allEnemy', power: 1.2, mp: 0, fx: 'fire', burn: 3 },
});

// Thần sủng dạng loài ảo: "than.<mã>.<0|1>"  (1 = Chân)
const baseGetSpecies = D.getSpecies;
D.getSpecies = function getSpecies(sid) {
  const s = String(sid);
  if (s.startsWith('than.')) {
    const [, id, st] = s.split('.');
    const T = Object.prototype.hasOwnProperty.call(THAN, id) ? THAN[id] : null;
    if (!T) return null;
    const chan = st === '1';
    const skills = [chan ? T.sig2 : T.sig, D.ELEMENTS[T.element] ? ({ kim: 'pet_kim', moc: 'pet_moc', thuy: 'pet_thuy', hoa: 'pet_hoa', tho: 'pet_tho' })[T.element] : 'pet_aoe', 'pet_aoe'];
    if (chan) skills.push(T.sig);
    return { sid: s, form: 'than', than: id, chan, element: T.element, grade: chan ? 5 : 3, name: (chan ? 'Chân ' : '') + T.name, icon: T.icon, f: T.f, skills, rare: true, look: T.look };
  }
  return baseGetSpecies(sid);
};

// ---------------------------------------------------------------------
//  VẬT PHẨM MỚI
// ---------------------------------------------------------------------
const NEW_ITEMS = {
  van_hon: { name: 'Vạn Hồn Phách', icon: '🔮', type: 'fragAny', price: 0, sell: 300, desc: 'Hồn phách vô chủ – đổi thành Hồn Phách của bất kỳ Thần sủng nào (1:1).' },
  chan_linh: { name: 'Chân Linh Thạch', icon: '💎', type: 'mat', price: 0, sell: 500, desc: 'Đá chứa chân linh – nguyên liệu Chân Hoá Thần sủng, rèn đồ thượng phẩm.' },
  tay_tam: { name: 'Tẩy Tâm Đan', icon: '🟢', type: 'petreroll', price: 0, sell: 120, desc: 'Gột rửa tâm tính – đổi ngẫu nhiên tính cách của một Tiên sủng.' },
  thu_luong: { name: 'Thú Lương', icon: '🌾', type: 'mountfood', price: 0, sell: 60, desc: 'Cỏ linh nuôi thú cưỡi – dùng để nâng cấp thú cưỡi.' },
  aodieu_vu: { name: 'Lông Ảo Điểu', icon: '🪶', type: 'mat', price: 0, sell: 200, desc: 'Lông vũ ngũ sắc của Ảo Điểu – đủ 30 chiếc rèn thành thú cưỡi Ảo Điểu.' },
  kim_khoang: { name: 'Kim Khoáng', icon: '🟨', type: 'mat', price: 0, sell: 150, desc: 'Quặng vàng hiếm từ mạch khoáng linh – rèn đồ, luyện Chân Linh Thạch.' },
  tuyet_lien: { name: 'Tuyết Liên', icon: '🪷', type: 'mat', price: 0, sell: 150, desc: 'Sen tuyết trăm năm – luyện Tẩy Tâm Đan, Chân Linh Thạch.' },
  linh_tuyen: { name: 'Linh Tuyền Thủy', icon: '💧', type: 'mat', price: 0, sell: 40, desc: 'Nước suối linh – luyện Thú Lương, đan dược.' },
  menh_phu: { name: 'Mệnh Phù', icon: '🧧', type: 'menh', price: 0, sell: 0, desc: 'Bùa đổi Mệnh (ngũ hành bản mệnh) – dùng trong mục Nhân vật › Mệnh.' },
  tinh_luc_dan: { name: 'Tinh Lực Đan', icon: '🟠', type: 'energy', value: 40, price: 0, sell: 50, desc: 'Hồi 40 Tinh Lực (dùng để khai thác).' },
};
for (const id of THAN_IDS) NEW_ITEMS['hon_' + id] = { name: 'Hồn Phách · ' + THAN[id].name, icon: '✨', type: 'frag', than: id, price: 0, sell: 100, desc: `Hồn phách của ${THAN[id].name}. Đủ ${THAN_COST.summon} để triệu hồi, thêm ${THAN_COST.chan} để Chân Hoá.` };
Object.assign(D.ITEMS, NEW_ITEMS);

// công thức mới (Lò Bát Quái / Lò Rèn)
Object.assign(X.RECIPES, {
  thu_luong: { kind: 'dan', name: 'Thú Lương ×2', need: { thao_duoc: 2, linh_tuyen: 1 }, bac: 300, give: { thu_luong: 2 } },
  tay_tam: { kind: 'dan', name: 'Tẩy Tâm Đan', need: { tuyet_lien: 2, yeu_dan: 3 }, bac: 2000, give: { tay_tam: 1 } },
  tinh_luc_dan: { kind: 'dan', name: 'Tinh Lực Đan', need: { linh_tuyen: 3, thao_duoc: 2 }, bac: 800, give: { tinh_luc_dan: 1 } },
  chan_linh: { kind: 'ren', name: 'Chân Linh Thạch', need: { kim_khoang: 3, tuyet_lien: 2, linh_tuyen: 3 }, bac: 20000, give: { chan_linh: 1 }, lvl: 60 },
  aodieu: { kind: 'ren', name: 'Thú cưỡi Ảo Điểu', need: { aodieu_vu: 30, chan_linh: 3 }, bac: 80000, give: 'mount:aodieu', lvl: 110 },
});

// ---------------------------------------------------------------------
//  ĐỢT 4 · THÚ CƯỠI MỚI, CẤP THÚ CƯỠI
// ---------------------------------------------------------------------
Object.assign(X.MOUNTS, {
  longquy: { name: 'Long Quy', icon: '🐢', lvl: 75, price: { bac: 150000 }, speed: 1.35, bonus: { def: 12, mdef: 10, maxHp: 8 }, desc: 'Rùa đầu rồng của Long Cung – chậm mà vững như núi.' },
  tuyetlang: { name: 'Tuyết Lang', icon: '🐺', lvl: 95, price: { vang: 600 }, speed: 1.75, bonus: { atk: 9, spd: 9, crit: 2 }, desc: 'Sói tuyết Côn Lôn – thuần phục từ bầy của Băng Lang Vương.' },
  aodieu: { name: 'Ảo Điểu', icon: '🦚', lvl: 110, price: null, craft: true, speed: 2.0, bonus: { matk: 10, spd: 12, maxHp: 5 }, desc: 'Chim ngũ sắc Bồng Lai, đuôi kéo cầu vồng. Chỉ rèn được từ 30 Lông Ảo Điểu.' },
});
const MOUNT_MAX_LV = 10;
const mountUpCost = (lv) => ({ food: lv * 2, bac: lv * 3000 });

// ---------------------------------------------------------------------
//  ĐỢT 4 · MỆNH (ngũ hành bản mệnh) & TÍNH CÁCH TIÊN SỦNG
// ---------------------------------------------------------------------
const MENH = {
  kim: { name: 'Kim Mệnh', bonus: { atk: 5, crit: 2 }, desc: '+5% Công vật lý, +2 Bạo kích' },
  moc: { name: 'Mộc Mệnh', bonus: { maxHp: 6, regen: 1 }, desc: '+6% Khí huyết, hồi phục khi đi nhanh hơn' },
  thuy: { name: 'Thủy Mệnh', bonus: { mdef: 6, maxMp: 8 }, desc: '+6% Kháng phép, +8% Nội lực' },
  hoa: { name: 'Hỏa Mệnh', bonus: { matk: 5, spd: 2 }, desc: '+5% Công phép, +2% Tốc độ' },
  tho: { name: 'Thổ Mệnh', bonus: { def: 7, maxHp: 2 }, desc: '+7% Phòng thủ, +2% Khí huyết' },
};
const MENH_LVL = 10, MENH_CHANGE_VANG = 50;

const TRAITS = {
  dungmanh: { name: 'Dũng Mãnh', w: 20, mod: { atk: 10, def: -5 }, desc: '+10% công, −5% thủ' },
  tramon: { name: 'Trầm Ổn', w: 18, mod: { def: 10, mdef: 5, spd: -5 }, desc: '+10% thủ, +5% kháng phép, −5% tốc' },
  linhloi: { name: 'Linh Lợi', w: 18, mod: { spd: 10, maxHp: -5 }, desc: '+10% tốc, −5% khí huyết' },
  thongtue: { name: 'Thông Tuệ', w: 18, mod: { matk: 10, atk: -5 }, desc: '+10% công phép, −5% công' },
  kiencuong: { name: 'Kiên Cường', w: 18, mod: { maxHp: 12, matk: -5 }, desc: '+12% khí huyết, −5% công phép' },
  trungthanh: { name: 'Trung Thành', w: 5, mod: { maxHp: 5, atk: 5, matk: 5, def: 5, spd: 5 }, rare: true, desc: '+5% mọi chỉ số (hiếm)' },
  cuongbao: { name: 'Cuồng Bạo', w: 3, mod: { atk: 15, matk: 15, def: -10, mdef: -10 }, rare: true, desc: '+15% công & công phép, −10% thủ (hiếm)' },
};
const TRAIT_IDS = Object.keys(TRAITS);

// ---------------------------------------------------------------------
//  ĐỢT 4 · KHAI THÁC (mỏ khoáng · linh thảo · linh tuyền)
// ---------------------------------------------------------------------
const GATHER = {
  maxEnergy: 100, regenMin: 2, cost: 8, cooldownMin: 8,
  types: {
    khoang: { name: 'Mạch Khoáng', icon: '⛏️', verb: 'Đào', common: 'tinh_thach', rare: 'kim_khoang' },
    thao: { name: 'Linh Thảo', icon: '🌿', verb: 'Hái', common: 'thao_duoc', rare: 'tuyet_lien' },
    tuyen: { name: 'Linh Tuyền', icon: '💧', verb: 'Múc', common: 'linh_tuyen', rare: 'mp_m' },
  },
  needLv: (lv) => 20 + lv * lv * 6,
};
// mỗi bản đồ: 4 điểm khai thác cố định trên ô đất trống, xa NPC/cổng/điểm hồi sinh
{
  const prefer = { cave: 'khoang', desert: 'khoang', snow: 'khoang', hell: 'khoang', void: 'khoang', forest: 'thao', river: 'tuyen', sea: 'tuyen', heaven: 'thao', city: 'thao' };
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (const [mid, M] of Object.entries(D.MAPS)) {
    seed = [...mid].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7) & 0x7fffffff;
    const ok = (x, y) => M.tiles[y] && M.tiles[y][x] === '.' && !M.npcs.some((n) => Math.abs(n.x - x) + Math.abs(n.y - y) <= 1)
      && !(Math.abs(M.spawn[0] - x) + Math.abs(M.spawn[1] - y) <= 2) && y > 1 && y < 18;
    const cand = [];
    for (let y = 0; y < 20; y++) for (let x = 0; x < 12; x++) if (ok(x, y)) cand.push([x, y]);
    const order = ['khoang', 'thao', 'tuyen', prefer[M.theme] || 'thao'];
    const nodes = [];
    for (const t of order) {
      for (let tries = 0; tries < 40 && cand.length; tries++) {
        const i = Math.floor(rnd() * cand.length), [x, y] = cand[i];
        if (nodes.some((n) => Math.abs(n.x - x) + Math.abs(n.y - y) < 4)) continue;
        nodes.push({ id: mid + ':' + nodes.length, type: t, x, y }); cand.splice(i, 1); break;
      }
    }
    M.nodes = nodes;
  }
}

// ---------------------------------------------------------------------
//  ĐỢT 3 · ÁC MỘNG & PHI THĂNG
// ---------------------------------------------------------------------
const NIGHTMARE = { minLvl: 60, perDay: 10 };
const nightmareLvl = (B) => Math.min(160, B.post ? B.lv + 18 : Math.max(62, Math.round(58 + B.lv * 1.05)));
const ASCEND = { lvl: 120, perDay: 3, points: 20, statPct: 8, capBefore: 120 };
const TRIAL = [
  { id: 'loi', name: 'Lôi Kiếp', boss: 'kiep_loi', bossName: 'Cửu Thiên Lôi Thần', element: 'kim', lv: 124, hpMul: 9, skills: ['kiep_loi', 'pet_loi', 'pet_kim'], desc: 'Chín đạo thiên lôi giáng xuống – sét có thể Định Thân.' },
  { id: 'hoa', name: 'Hỏa Kiếp', boss: 'kiep_hoa', bossName: 'Nghiệp Hỏa Tinh Quân', element: 'hoa', lv: 127, hpMul: 10, skills: ['kiep_hoa', 'pet_hoa', 'pet_aoe'], desc: 'Nghiệp hoả thiêu sạch tạp niệm – gây Bỏng nặng.' },
  { id: 'tam', name: 'Tâm Ma Kiếp', boss: 'mirror', bossName: 'Tâm Ma', desc: 'Đối mặt chính mình: Tâm Ma mang toàn bộ chỉ số và Tiên sủng của ngươi.' },
];

// ---------------------------------------------------------------------
//  ĐỢT 5 · PHÚC LỢI
// ---------------------------------------------------------------------
const NEWBIE = [
  { day: 1, label: '2.000 bạc · 5 Đại Hoàn Đan · 5 Bầu Bạc', r: { bac: 2000, items: { hp_m: 5, bau_bac: 5 } } },
  { day: 2, label: '2 Bầu Vàng · 3 Đá Cường Hóa', r: { items: { bau_vang: 2, da_ch: 3 } } },
  { day: 3, label: 'Thú cưỡi Bạch Long Mã · 5 Thú Lương', r: { mount: 'bachma', items: { thu_luong: 5 } } },
  { day: 4, label: '20 vàng · 2 Hợp Thể Đan · 2 Linh Đan', r: { vang: 20, items: { hop_the_dan: 2, linh_dan: 2 } } },
  { day: 5, label: '2 Tẩy Tâm Đan · 1 Sách kỹ năng', r: { items: { tay_tam: 2 }, book: 1 } },
  { day: 6, label: '2 Ngọc ngẫu nhiên · Trứng Biến Dị', r: { gems: 2, items: { trung_bd: 1 } } },
  { day: 7, label: '30 Hồn Phách Tiểu Bạch Long (triệu hồi ngay!) · Danh hiệu «Tân Thủ Tam Giới»', r: { items: { hon_tieubachlong: 30 }, title: 'tanthu' }, big: true },
];
const ONLINE_GIFTS = [5, 15, 30, 60, 120]; // phút
const onlineGift = (i, lvl) => [
  { bac: 300 + lvl * 20, items: { hp_m: 2 } },
  { bac: 600 + lvl * 30, items: { bau_bac: 2, tinh_luc_dan: 1 } },
  { vang: 3, items: { da_ch: 2 } },
  { vang: 5, items: { linh_tuyen: 3, thu_luong: 2 } },
  { vang: 10, items: { van_hon: 2, chan_linh: lvl >= 60 ? 1 : 0 } },
][i];
const OFFLINE = { minMin: 10, maxMin: 12 * 60, expPerMin: 0.0016, bacPerMin: 0.6, vangPerHour: 2 };

// ---------------------------------------------------------------------
//  ĐỢT 5 · DANH HIỆU & THÀNH TỰU
// ---------------------------------------------------------------------
const TITLES = {
  tanthu: { name: 'Tân Thủ Tam Giới', color: '#9fe0a8', bonus: { maxHp: 2 } },
  dietyeu: { name: 'Diệt Yêu Sứ', color: '#ff9a6a', bonus: { atk: 3 } },
  nguthu: { name: 'Ngự Thú Sư', color: '#7fd6b7', bonus: { spd: 3 } },
  thinhkinh: { name: 'Thỉnh Kinh Nhân', color: '#ffd65a', bonus: { maxHp: 4, mdef: 2 } },
  hokinh: { name: 'Hộ Kinh Sứ', color: '#ffb84a', bonus: { atk: 4, matk: 4, maxHp: 3 } },
  phithang: { name: 'Phi Thăng Tiên', color: '#bfe6ff', bonus: { maxHp: 3, atk: 3, matk: 3, def: 3, spd: 3 } },
  acmong: { name: 'Ác Mộng Chi Chủ', color: '#c77dff', bonus: { matk: 5, atk: 2 } },
  thapchu: { name: 'Trấn Tháp Chân Nhân', color: '#e8c45a', bonus: { def: 4, mdef: 3 } },
  dauvuong: { name: 'Tam Giới Đấu Vương', color: '#ff5a5a', bonus: { atk: 4, crit: 2 } },
  bacvat: { name: 'Bác Vật Gia', color: '#8ad0ff', bonus: { mdef: 4, maxMp: 4 } },
  linhmach: { name: 'Linh Mạch Đại Sư', color: '#a8e070', bonus: { maxMp: 5, def: 2 } },
  thansung: { name: 'Thần Sủng Chi Chủ', color: '#ff7ab8', bonus: { spd: 4, maxHp: 2 } },
  phaphu: { name: 'Phá Phủ Anh Hùng', color: '#ffa64a', bonus: { maxHp: 4, atk: 2 } },
  tuhanh: { name: 'Tu Hành Giả', color: '#e0d0ff', bonus: { maxHp: 2, atk: 2, matk: 2, def: 2 } },
};
// k: nguồn số đếm (xem features3.achValue)
const ACH = [
  ['lv10', 'Bước vào Tam Giới', 'Đạt cấp 10', 'lvl', 10, { bac: 1000, items: { hp_m: 5 } }],
  ['lv30', 'Tiểu hữu danh tiếng', 'Đạt cấp 30', 'lvl', 30, { vang: 10, items: { bau_vang: 2 } }],
  ['lv60', 'Cao thủ một phương', 'Đạt cấp 60', 'lvl', 60, { vang: 20, items: { linh_dan: 3 } }],
  ['lv90', 'Tông sư', 'Đạt cấp 90', 'lvl', 90, { vang: 30, items: { chan_linh: 2 } }],
  ['lv120', 'Bán tiên', 'Đạt cấp 120', 'lvl', 120, { vang: 50, items: { chan_linh: 3, van_hon: 5 } }],
  ['lv160', 'Đỉnh phong Tam Giới', 'Đạt cấp 160', 'lvl', 160, { vang: 200, items: { van_hon: 30 } }],
  ['nan9', 'Chín kiếp nạn', 'Vượt 9 kiếp nạn', 'nan', 9, { bac: 2000 }],
  ['nan27', 'Hai mươi bảy kiếp nạn', 'Vượt 27 kiếp nạn', 'nan', 27, { vang: 10 }],
  ['nan54', 'Năm mươi tư kiếp nạn', 'Vượt 54 kiếp nạn', 'nan', 54, { vang: 20, items: { bau_vang: 3 } }],
  ['nan81', 'Thỉnh được chân kinh', 'Vượt đủ 81 kiếp nạn', 'nan', 81, { vang: 50, items: { van_hon: 10 } }, 'thinhkinh'],
  ['post', 'Kiếp nạn thứ 82', 'Hoàn thành Hậu truyện, đánh bại Hỗn Độn Ma Tổ', 'post', 1, { vang: 200, items: { van_hon: 30, chan_linh: 5 } }, 'hokinh'],
  ['asc', 'Thoát thai phàm cốt', 'Phi Thăng thành công', 'asc', 1, { vang: 50, items: { chan_linh: 3 } }, 'phithang'],
  ['kill100', 'Trừ yêu', 'Đánh bại 100 yêu quái', 'kills', 100, { bac: 1500 }],
  ['kill1000', 'Diệt yêu', 'Đánh bại 1.000 yêu quái', 'kills', 1000, { vang: 15 }, 'dietyeu'],
  ['kill5000', 'Vạn yêu kinh hồn', 'Đánh bại 5.000 yêu quái', 'kills', 5000, { vang: 50, items: { van_hon: 5 } }],
  ['catch10', 'Thuần thú', 'Thu phục 10 Tiên sủng', 'catch', 10, { items: { bau_vang: 2 } }],
  ['catch50', 'Ngự thú', 'Thu phục 50 Tiên sủng', 'catch', 50, { vang: 20, items: { tay_tam: 2 } }, 'nguthu'],
  ['boss20', 'Hàng ma', 'Đánh bại 20 boss', 'boss', 20, { vang: 10, items: { da_ch: 5 } }],
  ['boss100', 'Phục ma', 'Đánh bại 100 boss', 'boss', 100, { vang: 30, items: { van_hon: 5 } }],
  ['nm10', 'Ác mộng sơ khai', 'Thắng 10 trận Ác Mộng', 'nm', 10, { vang: 20, items: { chan_linh: 1 } }],
  ['nm100', 'Chủ nhân ác mộng', 'Thắng 100 trận Ác Mộng', 'nm', 100, { vang: 80, items: { van_hon: 20 } }, 'acmong'],
  ['tower20', 'Leo tháp', 'Vượt tầng 20 Trấn Yêu Tháp', 'tower', 20, { vang: 10 }],
  ['tower50', 'Trấn tháp', 'Vượt tầng 50 Trấn Yêu Tháp', 'tower', 50, { vang: 30, items: { chan_linh: 1 } }, 'thapchu'],
  ['arena10', 'Luận võ', 'Thắng 10 trận Tam Giới Đấu', 'arena', 10, { vang: 10 }],
  ['arena50', 'Đấu vương', 'Thắng 50 trận Tam Giới Đấu', 'arena', 50, { vang: 30 }, 'dauvuong'],
  ['codex10', 'Sưu tầm', 'Đồ giám có 10 hình thái', 'codex', 10, { vang: 10, items: { bau_vang: 2 } }],
  ['codex28', 'Bác vật Tam Giới', 'Đồ giám đủ 28 hình thái', 'codex', 28, { vang: 50, items: { van_hon: 10 } }, 'bacvat'],
  ['gather50', 'Thợ khai thác', 'Khai thác 50 lần', 'gather', 50, { items: { tinh_luc_dan: 3 } }],
  ['gather300', 'Linh mạch đại sư', 'Khai thác 300 lần', 'gather', 300, { vang: 20, items: { kim_khoang: 5 } }, 'linhmach'],
  ['than1', 'Thần sủng đầu tiên', 'Sở hữu 1 Thần sủng', 'than', 1, { vang: 10, items: { van_hon: 3 } }],
  ['than3', 'Thần sủng chi chủ', 'Sở hữu 3 Thần sủng', 'than', 3, { vang: 30, items: { chan_linh: 2 } }, 'thansung'],
  ['chan1', 'Chân thân hiển hiện', 'Chân Hoá 1 Thần sủng', 'chan', 1, { vang: 50 }],
  ['dg5', 'Thám hiểm phó bản', 'Vượt 5 phó bản', 'dungeon', 5, { vang: 10, items: { linh_dan: 2 } }],
  ['dg30', 'Phá phủ anh hùng', 'Vượt 30 phó bản', 'dungeon', 30, { vang: 30, items: { chan_linh: 2 } }, 'phaphu'],
  ['pass30', 'Tu hành viên mãn', 'Đạt cấp 30 Tu Hành Lệnh', 'pass', 30, { vang: 30 }, 'tuhanh'],
].map(([id, name, desc, k, need, r, title]) => ({ id, name, desc, k, need, r, title }));

// ---------------------------------------------------------------------
//  ĐỢT 5 · TU HÀNH LỆNH (mùa = tháng, giờ Việt Nam)
// ---------------------------------------------------------------------
const PASS = {
  levels: 30, xpPerLv: 100, premiumVang: 288, dailyCap: 360,
  daily: [
    { id: 'kill', name: 'Diệt 30 yêu quái', k: 'kill', need: 30, xp: 40 },
    { id: 'boss', name: 'Thắng 1 trận boss', k: 'boss', need: 1, xp: 30 },
    { id: 'gather', name: 'Khai thác 5 lần', k: 'gather', need: 5, xp: 40 },
    { id: 'nm', name: 'Thắng 1 trận Ác Mộng', k: 'nm', need: 1, xp: 50 },
    { id: 'dungeon', name: 'Vượt 1 phó bản', k: 'dungeon', need: 1, xp: 50 },
    { id: 'tower', name: 'Vượt 1 tầng Trấn Yêu Tháp', k: 'tower', need: 1, xp: 30 },
    { id: 'arena', name: 'Đánh 1 trận Tam Giới Đấu', k: 'arena', need: 1, xp: 30 },
    { id: 'online', name: 'Online 30 phút', k: 'online', need: 30, xp: 40 },
  ],
  weekly: [
    { id: 'wkill', name: 'Diệt 400 yêu quái', k: 'kill', need: 400, xp: 160 },
    { id: 'wnm', name: 'Thắng 10 trận Ác Mộng', k: 'nm', need: 10, xp: 160 },
    { id: 'wdungeon', name: 'Vượt 7 phó bản', k: 'dungeon', need: 7, xp: 160 },
    { id: 'wgather', name: 'Khai thác 40 lần', k: 'gather', need: 40, xp: 120 },
    { id: 'wcatch', name: 'Thu phục 8 Tiên sủng', k: 'catch', need: 8, xp: 100 },
  ],
};
PASS.rewards = Array.from({ length: PASS.levels }, (_, i) => {
  const lv = i + 1;
  const free = lv % 10 === 0 ? { items: { chan_linh: 1, van_hon: 3 } } : lv % 5 === 0 ? { vang: 5, items: { van_hon: 1 } }
    : [{ bac: 1500 }, { items: { hp_l: 3 } }, { items: { bau_bac: 3 } }, { items: { da_ch: 3 } }][lv % 4];
  const prem = lv === 30 ? { vang: 60, items: { van_hon: 20, chan_linh: 3 } } : lv % 10 === 0 ? { vang: 20, items: { van_hon: 5, chan_linh: 2 } }
    : lv % 5 === 0 ? { vang: 10, items: { tay_tam: 1, van_hon: 2 } }
    : [{ items: { bau_vang: 2 } }, { items: { linh_dan: 2 } }, { items: { thu_luong: 4, tinh_luc_dan: 1 } }, { vang: 5, items: { hop_the_dan: 1 } }][lv % 4];
  return { lv, free, prem };
});

// ---------------------------------------------------------------------
//  ĐỢT 6 · PHÓ BẢN (3 đợt quái + boss, tổ đội cùng vào)
// ---------------------------------------------------------------------
const DUNGEONS = [
  { id: 'bandao', name: 'Bàn Đào Yến Loạn', icon: '🍑', lvl: 30, theme: 'heaven', forms: ['thongoc', 'khongtuoc', 'tienhac', 'kylan'], humans: ['thienbinh'], boss: 'nhilang', bossName: 'Nhị Lang (Say Rượu)', desc: 'Yến Bàn Đào bị phá, thiên binh say rượu đánh loạn. Dẹp yên và lấy lại đào tiên.', drop: { ban_dao: 2, linh_dan: 1 }, frag: 'nhilang' },
  { id: 'thuylien', name: 'Thủy Liêm Bí Cảnh', icon: '🌊', lvl: 50, theme: 'forest', forms: ['hautinh', 'hoyeu', 'langyeu', 'xatinh'], humans: ['tieuyeu'], boss: 'lucnhi', bossName: 'Lục Nhĩ Ảnh', desc: 'Sau thác Thủy Liêm có một động bí mật – bầy hầu tinh và bóng của Lục Nhĩ ẩn ở đó.', drop: { sach: 1, hop_the_dan: 1 }, frag: 'lucnhi' },
  { id: 'longcung', name: 'Long Cung Bảo Khố', icon: '🐉', lvl: 80, theme: 'sea', forms: ['thuyquai', 'huyenquy', 'thanhlong', 'xatinh'], humans: ['hatuong'], boss: 'giaoma', bossName: 'Giao Ma Thủ Khố', desc: 'Kho báu Long Cung – Giao ma canh giữ ngọc trai và binh khí thần.', drop: { chan_linh: 1, kim_khoang: 2 }, frag: 'tieubachlong' },
  { id: 'diangue', name: 'Thập Bát Địa Ngục', icon: '🔥', lvl: 100, theme: 'hell', forms: ['bachcot', 'quyhoa', 'nhentinh', 'hatinh'], humans: ['quysai'], boss: 'huyetha', bossName: 'Huyết Hà Phân Thân', desc: 'Mười tám tầng địa ngục, mỗi tầng một hình phạt. Oán hồn kéo chân người sống.', drop: { chan_linh: 1, van_hon: 1 }, frag: 'bachcot' },
  { id: 'langtieu', name: 'Lăng Tiêu Thí Luyện', icon: '⚡', lvl: 130, theme: 'heaven', forms: ['kimbang', 'phuong', 'kylan', 'longma'], humans: ['thienbinh', 'mabinh'], boss: 'loibo', bossName: 'Lôi Bộ Thí Luyện Tướng', desc: 'Thí luyện của Lăng Tiêu Điện – chỉ tiên nhân đã Phi Thăng mới chịu nổi.', drop: { chan_linh: 2, van_hon: 2 }, frag: 'nata', asc: true },
];
const DUNGEON = { perDay: 2, waves: 3 };

// ---------------------------------------------------------------------
//  ĐỢT 6 · ĐỒ GIÁM (mốc sưu tầm)
// ---------------------------------------------------------------------
const CODEX_MILESTONES = [
  { n: 5, r: { bac: 3000, items: { bau_bac: 5 } } },
  { n: 10, r: { vang: 10, items: { bau_vang: 2 } } },
  { n: 15, r: { vang: 15, items: { linh_dan: 3 } } },
  { n: 20, r: { vang: 20, items: { tay_tam: 2, van_hon: 3 } } },
  { n: 25, r: { vang: 30, items: { chan_linh: 2 } } },
  { n: 28, r: { vang: 50, items: { van_hon: 10 } } },
];
const CODEX_PCT_PER_FORM = 0.25; // % mọi chỉ số / hình thái (tối đa 7%)

// ---------------------------------------------------------------------
//  ĐỢT 6 · CẤP BANG HỘI
// ---------------------------------------------------------------------
const GUILD = {
  maxLv: 10, need: (lv) => 300 * lv * lv,
  donate: { bac: 10000, exp: 25, contrib: 10, perDay: 5 },
  perk: (lv) => ({ exp: lv, stat: lv * 0.5 }), // % tu vi, % khí huyết/công/công phép
  gift: (lv) => ({ bac: 800 * lv, items: lv >= 5 ? { linh_dan: 1 } : lv >= 3 ? { hp_l: 2 } : { hp_m: 3 } }),
};

// ---------------------------------------------------------------------
//  ĐỢT 6 · THIÊN ĐỊA DỊ TƯỢNG (luân phiên mỗi 2 giờ, kéo dài 40 phút)
// ---------------------------------------------------------------------
const WORLD_EVENTS = [
  { id: 'songbao', name: 'Song Bội Tu Vi', icon: '🌟', desc: 'Tu vi và bạc nhận được ×2 khi đánh quái.' },
  { id: 'yeuvuong', name: 'Yêu Vương Xâm Nhập', icon: '👹', desc: 'Yêu quái xuất hiện dày hơn, có Tinh Anh rơi Chân Linh Thạch & Vạn Hồn Phách.' },
  { id: 'linhmach', name: 'Linh Mạch Bộc Phát', icon: '⛏️', desc: 'Khai thác nhận ×2 sản lượng, tốn nửa Tinh Lực.' },
  { id: 'phuctinh', name: 'Phúc Tinh Cao Chiếu', icon: '🍀', desc: 'Tỷ lệ rơi đồ, Hồn Phách và thu phục tăng mạnh.' },
];
const WEV = { period: 2 * 3600e3, dur: 40 * 60e3 };

module.exports = {
  THAN, THAN_IDS, THAN_COST, NEW_ITEMS, MOUNT_MAX_LV, mountUpCost, MENH, MENH_LVL, MENH_CHANGE_VANG, TRAITS, TRAIT_IDS, GATHER,
  NIGHTMARE, nightmareLvl, ASCEND, TRIAL, NEWBIE, ONLINE_GIFTS, onlineGift, OFFLINE, TITLES, ACH, PASS, DUNGEONS, DUNGEON,
  CODEX_MILESTONES, CODEX_PCT_PER_FORM, GUILD, WORLD_EVENTS, WEV,
};
