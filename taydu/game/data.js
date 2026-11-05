// =====================================================================
//  TÂY DU KÝ MOBILE – DỮ LIỆU TĨNH (tộc, kỹ năng, tiên sủng, bản đồ, nhiệm vụ)
//  Sửa file này để cân bằng game / thêm nội dung.
// =====================================================================

const RACES = {
  than: {
    name: 'Thần Tộc', color: '#f2c14e',
    desc: 'Hậu duệ Thiên Đình. Pháp lực dồi dào, giỏi lôi pháp và hồi phục.',
    base: { the: 12, luc: 9, phap: 15, nhanh: 10 },
    skills: ['thien_loi', 'tien_lo', 'kim_quang', 'cuu_thien'],
  },
  ma: {
    name: 'Ma Tộc', color: '#d4483b',
    desc: 'Chiến binh Ma Giới. Sức mạnh cận chiến vô song, chém một đòn chí mạng.',
    base: { the: 13, luc: 15, phap: 8, nhanh: 10 },
    skills: ['huyet_sat', 'ma_diem', 'thi_huyet', 'pha_thien'],
  },
  yeu: {
    name: 'Yêu Tộc', color: '#7a5cc9',
    desc: 'Yêu tinh tu luyện ngàn năm. Thân pháp quỷ dị, giỏi độc và ảo thuật.',
    base: { the: 10, luc: 11, phap: 11, nhanh: 14 },
    skills: ['yeu_phong', 'doc_vu', 'ao_anh', 'nhiep_hon'],
  },
};

// type: phys | magic | heal | buff ; target: enemy | allEnemy | ally | self
const SKILLS = {
  // Thần tộc
  thien_loi: { name: 'Thiên Lôi Kích', type: 'magic', target: 'enemy', power: 1.6, mp: 10, lv: 1, fx: 'thunder', desc: 'Gọi sét đánh một mục tiêu.' },
  tien_lo: { name: 'Tiên Lộ Hồi Xuân', type: 'heal', target: 'ally', power: 2.2, mp: 14, lv: 5, fx: 'heal', desc: 'Hồi khí huyết cho một đồng đội.' },
  kim_quang: { name: 'Kim Quang Trận', type: 'magic', target: 'allEnemy', power: 0.9, mp: 24, lv: 12, fx: 'gold', desc: 'Kim quang quét toàn bộ địch.' },
  cuu_thien: { name: 'Cửu Thiên Huyền Lôi', type: 'magic', target: 'allEnemy', power: 1.35, mp: 45, lv: 25, fx: 'thunder', stun: 0.2, desc: 'Lôi kiếp diện rộng, có thể làm choáng.' },
  // Ma tộc
  huyet_sat: { name: 'Huyết Sát Trảm', type: 'phys', target: 'enemy', power: 1.7, mp: 8, lv: 1, fx: 'slash', drain: 0.3, desc: 'Một nhát chém, hút 30% sát thương thành máu.' },
  ma_diem: { name: 'Ma Diễm Phần Thiên', type: 'magic', target: 'allEnemy', power: 0.8, mp: 22, lv: 8, fx: 'fire', desc: 'Lửa ma thiêu toàn bộ địch.' },
  thi_huyet: { name: 'Thị Huyết Cuồng Nộ', type: 'buff', target: 'self', mp: 18, lv: 15, fx: 'rage', buff: { atkUp: 0.4, turns: 3 }, desc: 'Tăng 40% công 3 lượt.' },
  pha_thien: { name: 'Phá Thiên Cuồng Kích', type: 'phys', target: 'enemy', power: 2.8, mp: 32, lv: 22, fx: 'slash', desc: 'Đòn đánh phá trời, sát thương cực lớn.' },
  // Yêu tộc
  yeu_phong: { name: 'Yêu Phong Quyển', type: 'magic', target: 'allEnemy', power: 0.75, mp: 14, lv: 1, fx: 'wind', desc: 'Cuồng phong cuốn toàn bộ địch.' },
  doc_vu: { name: 'Vạn Độc Vụ', type: 'magic', target: 'enemy', power: 1.1, mp: 12, lv: 6, fx: 'poison', poison: 3, desc: 'Gây trúng độc 3 lượt.' },
  ao_anh: { name: 'Ảo Ảnh Phân Thân', type: 'buff', target: 'self', mp: 16, lv: 12, fx: 'shadow', buff: { dodgeUp: 35, turns: 3 }, desc: 'Tăng 35% né tránh 3 lượt.' },
  nhiep_hon: { name: 'Nhiếp Hồn Thuật', type: 'magic', target: 'enemy', power: 1.9, mp: 28, lv: 20, fx: 'shadow', stun: 0.35, desc: 'Đoạt hồn, có thể làm choáng.' },
  // Bí tịch ẩn
  that_thap: { name: 'Thất Thập Nhị Biến', type: 'phys', target: 'allEnemy', power: 1.5, mp: 40, lv: 1, fx: 'gold', secret: true, desc: 'Bí tịch thất truyền: hoá thân 72 phép đánh toàn địch.' },
  // Kỹ năng tiên sủng theo ngũ hành
  pet_kim: { name: 'Kim Cang Trảm', type: 'phys', target: 'enemy', power: 1.5, mp: 0, fx: 'slash' },
  pet_moc: { name: 'Đằng Mạn Triền', type: 'magic', target: 'enemy', power: 1.2, mp: 0, fx: 'poison', stun: 0.25 },
  pet_thuy: { name: 'Băng Phong Tiễn', type: 'magic', target: 'enemy', power: 1.5, mp: 0, fx: 'ice' },
  pet_hoa: { name: 'Liệt Diễm Phún', type: 'magic', target: 'enemy', power: 1.6, mp: 0, fx: 'fire' },
  pet_tho: { name: 'Lạc Thạch Kích', type: 'phys', target: 'enemy', power: 1.5, mp: 0, fx: 'rock' },
  pet_aoe: { name: 'Thiên Địa Cộng Minh', type: 'magic', target: 'allEnemy', power: 0.9, mp: 0, fx: 'gold' },
  pet_heal: { name: 'Linh Tuyền Trị Liệu', type: 'heal', target: 'ally', power: 1.6, mp: 0, fx: 'heal' },
};

// Ngũ hành: KIM khắc MỘC, MỘC khắc THỔ, THỔ khắc THỦY, THỦY khắc HỎA, HỎA khắc KIM
const ELEMENTS = {
  kim: { name: 'Kim', prefix: 'Kim', color: '#e8d27a', beats: 'moc', hue: 30 },
  moc: { name: 'Mộc', prefix: 'Thanh', color: '#5fbf5f', beats: 'tho', hue: 70 },
  thuy: { name: 'Thủy', prefix: 'Băng', color: '#5fb4e8', beats: 'hoa', hue: 170 },
  hoa: { name: 'Hỏa', prefix: 'Xích', color: '#ef6a4a', beats: 'kim', hue: -25 },
  tho: { name: 'Thổ', prefix: 'Hoàng', color: '#c99a5b', beats: 'thuy', hue: 15 },
};
const ELEMENT_KEYS = Object.keys(ELEMENTS);

const GRADES = [
  { key: 'pham', name: 'Phàm', mult: 1.0, catch: 1.0, color: '#d8d0c0' },
  { key: 'linh', name: 'Linh', mult: 1.15, catch: 0.8, color: '#6fd06f' },
  { key: 'tien', name: 'Tiên', mult: 1.32, catch: 0.6, color: '#5ab0ff' },
  { key: 'than', name: 'Thần', mult: 1.52, catch: 0.4, color: '#c77dff' },
  { key: 'thanh', name: 'Thánh', mult: 1.78, catch: 0.25, color: '#ffa630' },
];

// 28 hình thái × 5 ngũ hành × 5 phẩm = 700 loài Tiên sủng
// hp/atk/matk/def/spd: hệ số so với chuẩn
const FORMS = [
  { id: 'hautinh', name: 'Hầu Tinh', icon: '🐒', hp: 1.0, atk: 1.15, matk: 0.8, def: 0.9, spd: 1.3 },
  { id: 'truyeu', name: 'Trư Yêu', icon: '🐗', hp: 1.35, atk: 1.1, matk: 0.6, def: 1.15, spd: 0.75 },
  { id: 'holy', name: 'Hồ Ly', icon: '🦊', hp: 0.85, atk: 0.8, matk: 1.3, def: 0.85, spd: 1.25 },
  { id: 'hoyeu', name: 'Hổ Yêu', icon: '🐯', hp: 1.1, atk: 1.3, matk: 0.6, def: 1.0, spd: 1.1 },
  { id: 'langyeu', name: 'Lang Yêu', icon: '🐺', hp: 0.95, atk: 1.2, matk: 0.6, def: 0.9, spd: 1.25 },
  { id: 'xatinh', name: 'Xà Tinh', icon: '🐍', hp: 0.95, atk: 0.9, matk: 1.2, def: 0.9, spd: 1.1 },
  { id: 'thiemthu', name: 'Thiềm Thừ', icon: '🐸', hp: 1.2, atk: 0.8, matk: 1.15, def: 1.1, spd: 0.8 },
  { id: 'tienhac', name: 'Tiên Hạc', icon: '🦢', hp: 0.9, atk: 0.7, matk: 1.3, def: 0.9, spd: 1.2, heal: true },
  { id: 'phuong', name: 'Phượng Hoàng', icon: '🐦', hp: 1.05, atk: 0.9, matk: 1.45, def: 0.95, spd: 1.2, rare: true },
  { id: 'thanhlong', name: 'Thần Long', icon: '🐉', hp: 1.25, atk: 1.3, matk: 1.3, def: 1.15, spd: 1.05, rare: true },
  { id: 'kylan', name: 'Kỳ Lân', icon: '🦄', hp: 1.15, atk: 1.15, matk: 1.15, def: 1.15, spd: 1.1, rare: true },
  { id: 'huyenquy', name: 'Huyền Quy', icon: '🐢', hp: 1.5, atk: 0.7, matk: 0.9, def: 1.6, spd: 0.55 },
  { id: 'nguuma', name: 'Ngưu Ma', icon: '🐂', hp: 1.4, atk: 1.25, matk: 0.6, def: 1.2, spd: 0.7 },
  { id: 'thongoc', name: 'Thỏ Ngọc', icon: '🐇', hp: 0.8, atk: 0.7, matk: 1.1, def: 0.8, spd: 1.45, heal: true },
  { id: 'battuong', name: 'Bất Tượng', icon: '🐘', hp: 1.55, atk: 1.05, matk: 0.7, def: 1.3, spd: 0.6 },
  { id: 'kimbang', name: 'Đại Bằng', icon: '🦅', hp: 0.95, atk: 1.3, matk: 0.8, def: 0.85, spd: 1.5 },
  { id: 'hachung', name: 'Hùng Tinh', icon: '🐻', hp: 1.35, atk: 1.2, matk: 0.6, def: 1.2, spd: 0.75 },
  { id: 'thutinh', name: 'Thử Tinh', icon: '🐀', hp: 0.75, atk: 0.95, matk: 0.9, def: 0.75, spd: 1.55 },
  { id: 'nhentinh', name: 'Chu Tinh', icon: '🕷️', hp: 0.9, atk: 0.9, matk: 1.2, def: 0.95, spd: 1.0 },
  { id: 'hatinh', name: 'Hạt Tinh', icon: '🦂', hp: 0.95, atk: 1.2, matk: 0.9, def: 1.05, spd: 1.0 },
  { id: 'longma', name: 'Long Mã', icon: '🐎', hp: 1.1, atk: 1.1, matk: 0.9, def: 1.0, spd: 1.35 },
  { id: 'suvuong', name: 'Sư Vương', icon: '🦁', hp: 1.2, atk: 1.3, matk: 0.7, def: 1.05, spd: 1.05 },
  { id: 'viemthu', name: 'Viêm Thú', icon: '🦎', hp: 1.0, atk: 1.0, matk: 1.25, def: 1.0, spd: 1.0 },
  { id: 'bachcot', name: 'Cốt Tinh', icon: '💀', hp: 0.85, atk: 1.0, matk: 1.3, def: 0.8, spd: 1.15 },
  { id: 'thuyquai', name: 'Thủy Quái', icon: '🐙', hp: 1.25, atk: 0.9, matk: 1.1, def: 1.1, spd: 0.85 },
  { id: 'doiyeu', name: 'Biên Bức', icon: '🦇', hp: 0.8, atk: 1.0, matk: 1.0, def: 0.75, spd: 1.5 },
  { id: 'khongtuoc', name: 'Khổng Tước', icon: '🦚', hp: 0.95, atk: 0.85, matk: 1.35, def: 0.9, spd: 1.15 },
  { id: 'quyhoa', name: 'U Linh', icon: '👻', hp: 0.8, atk: 0.8, matk: 1.4, def: 0.7, spd: 1.3 },
];
const FORM_BY_ID = Object.fromEntries(FORMS.map((f) => [f.id, f]));

const PET_SKILL_BY_ELEMENT = { kim: 'pet_kim', moc: 'pet_moc', thuy: 'pet_thuy', hoa: 'pet_hoa', tho: 'pet_tho' };

function speciesId(formId, elem, gradeIdx) { return `${formId}.${elem}.${gradeIdx}`; }
function getSpecies(sid) {
  const [formId, elem, g] = String(sid).split('.');
  const form = FORM_BY_ID[formId];
  const gi = Number(g);
  if (!form || !ELEMENTS[elem] || !GRADES[gi]) return null;
  const skills = [PET_SKILL_BY_ELEMENT[elem]];
  if (form.heal) skills.push('pet_heal');
  if (gi >= 2) skills.push('pet_aoe');
  return {
    sid, form: formId, element: elem, grade: gi,
    name: `${ELEMENTS[elem].prefix} ${form.name}`,
    icon: form.icon, f: form, skills, rare: !!form.rare,
  };
}
const SPECIES_COUNT = FORMS.length * ELEMENT_KEYS.length * GRADES.length; // 700

// ---------------- Vật phẩm (xếp chồng) ----------------
const ITEMS = {
  hp_s: { name: 'Kim Sang Dược', icon: '🧪', type: 'hp', value: 180, price: 30, desc: 'Hồi 180 khí huyết.' },
  hp_m: { name: 'Đại Hoàn Đan', icon: '💊', type: 'hp', value: 600, price: 110, desc: 'Hồi 600 khí huyết.' },
  hp_l: { name: 'Cửu Chuyển Kim Đan', icon: '🔴', type: 'hp', value: 2000, price: 320, desc: 'Hồi 2000 khí huyết.' },
  mp_s: { name: 'Hồi Linh Thủy', icon: '💧', type: 'mp', value: 90, price: 40, desc: 'Hồi 90 nội lực.' },
  mp_m: { name: 'Ngọc Lộ Hoàn', icon: '🔵', type: 'mp', value: 300, price: 140, desc: 'Hồi 300 nội lực.' },
  bau_bac: { name: 'Bầu Bạc', icon: 'gourd-silver', type: 'catch', value: 0.45, price: 80, desc: 'Thu phục Tiên sủng (tỷ lệ thường).' },
  bau_vang: { name: 'Bầu Vàng', icon: 'gourd-gold', type: 'catch', value: 0.9, priceVang: 5, desc: 'Thu phục Tiên sủng (tỷ lệ rất cao).' },
  da_ch: { name: 'Đá Cường Hóa', icon: '🪨', type: 'mat', price: 60, desc: 'Nguyên liệu cường hóa trang bị.' },
  ban_dao: { name: 'Bàn Đào', icon: '🍑', type: 'peach', value: 0, price: 0, sell: 200, desc: 'Đào tiên ngàn năm: hồi đầy và tăng tu vi.' },
  ngoc_the: { name: 'Ngọc Thể Lực', icon: '💚', type: 'gem', gem: { hp: 60 }, priceVang: 3, sell: 80, desc: 'Khảm: +60 Khí huyết.' },
  ngoc_luc: { name: 'Ngọc Sát Thương', icon: '❤️', type: 'gem', gem: { atk: 14 }, priceVang: 3, sell: 80, desc: 'Khảm: +14 Công vật lý.' },
  ngoc_phap: { name: 'Ngọc Pháp Lực', icon: '💜', type: 'gem', gem: { matk: 14 }, priceVang: 3, sell: 80, desc: 'Khảm: +14 Công phép.' },
  ngoc_toc: { name: 'Ngọc Tốc Độ', icon: '💛', type: 'gem', gem: { spd: 8 }, priceVang: 3, sell: 80, desc: 'Khảm: +8 Tốc độ.' },
  ngoc_khang: { name: 'Ngọc Kháng', icon: '💙', type: 'gem', gem: { def: 10, mdef: 10 }, priceVang: 3, sell: 80, desc: 'Khảm: +10 Phòng thủ & Kháng phép.' },
  trung_bd: { name: 'Trứng Biến Dị', icon: '🥚', type: 'egg', price: 0, desc: 'Ấp ra một Tiên sủng biến dị hiếm.' },
};
const GEM_IDS = ['ngoc_the', 'ngoc_luc', 'ngoc_phap', 'ngoc_toc', 'ngoc_khang'];

// ---------------- Trang bị ----------------
const SLOTS = {
  vukhi: { name: 'Vũ khí', icon: '⚔️', nouns: ['Côn', 'Kiếm', 'Đao', 'Thương'], stats: { atk: [6, 2.3], matk: [4, 1.5] } },
  mu: { name: 'Mũ', icon: '👑', nouns: ['Kim Quan', 'Đầu Khôi'], stats: { def: [3, 0.9], hp: [15, 5] } },
  giap: { name: 'Giáp', icon: '🥋', nouns: ['Chiến Bào', 'Khải Giáp'], stats: { def: [5, 1.4], hp: [25, 7] } },
  giay: { name: 'Giày', icon: '👢', nouns: ['Vân Hài', 'Chiến Ủng'], stats: { spd: [2, 0.55], def: [2, 0.5] } },
  phapbao: { name: 'Pháp bảo', icon: '🔮', nouns: ['Bảo Ấn', 'Linh Châu'], stats: { matk: [6, 2.2], mp: [10, 3] } },
  boi: { name: 'Bội', icon: '🧿', nouns: ['Ngọc Bội', 'Yêu Bài'], stats: { hp: [20, 6], mdef: [3, 1] } },
  nhan: { name: 'Nhẫn', icon: '💍', nouns: ['Giới Chỉ'], stats: { atk: [3, 1.2], crit: [1, 0.06] } },
  daychuyen: { name: 'Dây chuyền', icon: '📿', nouns: ['Hạng Liên', 'Phật Châu'], stats: { mp: [15, 3], mdef: [3, 1.1], matk: [2, 0.8] } },
};
const SLOT_KEYS = Object.keys(SLOTS);
const MATERIALS = [
  [1, 'Mộc'], [8, 'Thiết'], [16, 'Thanh Đồng'], [24, 'Huyền Thiết'], [32, 'Tinh Kim'], [40, 'Long Lân'], [48, 'Thiên Tàm'], [56, 'Long Văn'], [64, 'Phật Quang'],
];
const QUALITIES = [
  { key: 'w', name: 'Phàm', mult: 1.0, sockets: 0, color: '#e8e2d4' },
  { key: 'g', name: 'Lương', mult: 1.2, sockets: 1, color: '#6fd06f' },
  { key: 'b', name: 'Tinh', mult: 1.45, sockets: 1, color: '#5ab0ff' },
  { key: 'p', name: 'Cực', mult: 1.75, sockets: 2, color: '#c77dff' },
  { key: 'o', name: 'Truyền Thuyết', mult: 2.1, sockets: 3, color: '#ffa630' },
  { key: 'r', name: 'Độc Bản', mult: 2.6, sockets: 3, color: '#ff4d4d' },
];
const ENHANCE_RATE = [1, 1, 1, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25]; // +1 .. +10

const STAT_NAMES = { hp: 'Khí huyết', mp: 'Nội lực', atk: 'Công vật lý', matk: 'Công phép', def: 'Phòng thủ', mdef: 'Kháng phép', spd: 'Tốc độ', crit: 'Bạo kích %', dodge: 'Né tránh %' };

// ---------------- Quái hình người (không bắt được) ----------------
const HUMANS = {
  thienbinh: { name: 'Thiên Binh', icon: '💂', element: 'kim', f: { hp: 1.1, atk: 1.1, matk: 0.7, def: 1.2, spd: 0.9 } },
  sontac: { name: 'Sơn Tặc', icon: '🥷', element: 'tho', f: { hp: 1.0, atk: 1.2, matk: 0.6, def: 0.9, spd: 1.1 } },
  hoayeu: { name: 'Hỏa Yêu Binh', icon: '👺', element: 'hoa', f: { hp: 1.05, atk: 1.1, matk: 1.1, def: 1.0, spd: 1.0 } },
  thuytac: { name: 'Thủy Tặc', icon: '🏴‍☠️', element: 'thuy', f: { hp: 1.0, atk: 1.15, matk: 0.8, def: 0.95, spd: 1.05 } },
  tieuyeu: { name: 'Tiểu Yêu', icon: '👹', element: 'moc', f: { hp: 1.05, atk: 1.1, matk: 0.9, def: 1.0, spd: 1.0 } },
  daodong: { name: 'Đạo Đồng', icon: '🧑', element: 'kim', f: { hp: 0.95, atk: 0.9, matk: 1.2, def: 0.9, spd: 1.05 } },
};

// ---------------- Bản đồ / Boss / Cốt truyện (dựng từ game/story.js) ----------------
const STORY = require('./story');
const MAPS = {}, BOSSES = {}, QUESTS = [];
const MAP_ORDER = STORY.CHAPTERS.map((c) => c.id);
{
  const need = (L) => Math.floor(35 * Math.pow(L, 1.65) + 25);
  let nanNo = 0;
  STORY.CHAPTERS.forEach((ch, ci) => {
    const L = STORY.layout(ch.layout[0], ch.layout[1]);
    if (ch.slots) L.slots = ch.slots;
    const npcs = ch.npcs.map(([id, name, icon, o = {}], i) => {
      const [x, y] = L.slots[i];
      const n = { id, name, icon, x, y, ...o };
      if (o.boss) { delete n.boss; n.boss = id; }
      return n;
    });
    const k = ci / (STORY.CHAPTERS.length - 1);
    const grades = [72 - 47 * k, 23 + 9 * k, 5 + 20 * k, Math.max(0, 13 * k - 1), Math.max(0, 6 * k - 1)].map((v) => Math.round(v));
    MAPS[ch.id] = {
      name: ch.name, sub: ch.sub, chapter: ci + 1, theme: ch.theme, lv: ch.lv, spawn: L.spawn, tiles: L.tiles, npcs,
      encounter: { forms: ch.enc.forms, humans: ch.enc.humans || [], grades, rate: 0.16, group: ci === 0 ? [1, 2] : [1, 3] },
      secret: ch.secret,
    };
    // boss: cấp tăng dần trong chương
    const bossSteps = ch.steps.filter((s) => s.t === 'boss');
    bossSteps.forEach((s, bi) => {
      const [name, icon, element, skills, minions] = STORY.BOSS[s.boss];
      const lv = Math.round(ch.lv[0] + 1 + ((ch.lv[1] - ch.lv[0] - 1) * (bi + 1)) / bossSteps.length);
      BOSSES[s.boss] = {
        name, icon, element, skills, lv,
        hpMul: Math.min(9, +(3 + ci * 0.38 + bi * 0.3).toFixed(2)),
        atkMul: +(1.12 + ci * 0.018 + bi * 0.02).toFixed(3),
        minions: minions.map(([hid, d]) => [hid, Math.max(1, lv + d)]),
      };
    });
    // nhiệm vụ + phần thưởng tự tính
    ch.steps.forEach((s, si) => {
      const lvT = Math.round(ch.lv[0] + ((ch.lv[1] - ch.lv[0]) * (si + 1)) / ch.steps.length);
      const f = { talk: 0.35, kill: 0.6, boss: 0.9 }[s.t];
      const items = {};
      if (si === 0) items[lvT < 20 ? 'hp_m' : 'hp_l'] = 3;
      if (s.t === 'kill') items.bau_bac = 2;
      if (s.t === 'boss') items.da_ch = 2;
      if (s.t === 'boss' && si % 3 === 2) items.bau_vang = 1;
      const last = si === ch.steps.length - 1;
      const nan = ci === 0 ? 0 : 1;
      if (nan) nanNo++;
      QUESTS.push({
        map: ch.id, title: s.title, type: s.t, npc: s.npc, boss: s.boss, count: s.n, text: s.text, dialog: s.dialog,
        nan, no: nan ? nanNo : 0, chapter: ci + 1,
        reward: { exp: Math.round(need(lvT) * f), bac: Math.round(lvT * { talk: 12, kill: 20, boss: 45 }[s.t]), vang: (s.t === 'boss' ? 2 + Math.floor(ci / 2) : 0) + (last ? 15 : 0), items },
      });
    });
  });
  if (nanNo !== 81) console.warn('[story] Tổng số nạn =', nanNo, '(cần 81)');
}
// Boss thế giới
BOSSES.world = { name: 'Cửu Đầu Trùng', icon: '🐲', lv: 40, element: 'thuy', hpMul: 1, atkMul: 1.1, skills: ['pet_aoe', 'pet_thuy'], minions: [] };

// ---------------- Nhiệm vụ ẩn ----------------
const SECRETS = {
  hangnga: { name: 'Nguyệt Hạ Thố Ngọc', hint: 'Góc Tây Bắc Thiên Cung, khi trăng lên (21h–3h).', reward: 'Thỏ Ngọc Biến Dị' },
  tienhac: { name: 'Hạc Tiên Báo Ân', hint: 'Dẫn một Tiên Hạc đến gặp Lão Ông bán hạc ở Trường An.', reward: 'Trứng Biến Dị' },
  thuylien: { name: 'Thủy Liêm Động', hint: 'Sau thác nước Hoa Quả Sơn có hang động... chỉ hiện lối lúc hoàng hôn (17h–19h).', reward: 'Bí tịch Thất Thập Nhị Biến' },
  thodia: { name: 'Mật Ngữ Thổ Địa', hint: 'Thổ Địa Tây Vực hay lẩm bẩm. Hỏi mãi thì ông sẽ nói thật.', reward: 'Như Ý Kim Cô Bổng (Độc Bản)' },
};

const CONFIG = {
  maxLevel: 99,
  pointsPerLevel: 5,
  petBag: 8,
  bagSize: 60,
  dailyPeach: 5,
  dailyArena: 5,
  dailyTreasure: 10,
  worldBossHp: 250000,
  worldBossRespawnMin: 10,
  worldBossRounds: 6,
};

module.exports = {
  RACES, SKILLS, ELEMENTS, ELEMENT_KEYS, GRADES, FORMS, FORM_BY_ID, getSpecies, speciesId, SPECIES_COUNT,
  ITEMS, GEM_IDS, SLOTS, SLOT_KEYS, MATERIALS, QUALITIES, ENHANCE_RATE, STAT_NAMES,
  MAPS, MAP_ORDER, HUMANS, BOSSES, QUESTS, SECRETS, CONFIG,
};
