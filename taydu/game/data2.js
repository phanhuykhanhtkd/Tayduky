// =====================================================================
//  DỮ LIỆU ĐỢT 3–5: nguyên liệu, sách kỹ năng, thú cưỡi, công thức
//  luyện đan / rèn đồ, sự kiện theo mùa. Gộp vào data.js khi khởi động.
// =====================================================================
const D = require('./data');

// ---------- vật phẩm mới ----------
const NEW_ITEMS = {
  thao_duoc: { name: 'Linh Thảo', icon: '🌿', type: 'mat', price: 25, desc: 'Thảo dược luyện đan. Rơi từ yêu quái.' },
  yeu_dan: { name: 'Yêu Đan', icon: '🔴', type: 'mat', price: 40, desc: 'Nội đan của yêu quái – luyện linh dược cho Tiên sủng.' },
  tinh_thach: { name: 'Tinh Thạch', icon: '💠', type: 'mat', price: 40, desc: 'Khoáng thạch rèn binh khí.' },
  thu_bi: { name: 'Thú Bì', icon: '🟫', type: 'mat', price: 30, desc: 'Da thú – rèn giáp, làm yên cương.' },
  linh_dan: { name: 'Linh Đan', icon: '🟡', type: 'petevo', price: 0, desc: 'Giúp Tiên sủng tiến hoá lên phẩm cao hơn.' },
  hop_the_dan: { name: 'Hợp Thể Đan', icon: '🟣', type: 'petfuse', price: 0, desc: 'Dùng để ghép hai Tiên sủng thành một.' },
  sach_kim: { name: 'Sách: Kim Cang Trảm', icon: '📘', type: 'book', teach: 'pet_kim', price: 0, desc: 'Dạy Tiên sủng chiêu Kim Cang Trảm.' },
  sach_moc: { name: 'Sách: Đằng Mạn Triền', icon: '📗', type: 'book', teach: 'pet_moc', price: 0, desc: 'Dạy Tiên sủng chiêu Đằng Mạn Triền (gây choáng).' },
  sach_thuy: { name: 'Sách: Băng Phong Tiễn', icon: '📘', type: 'book', teach: 'pet_thuy', price: 0, desc: 'Dạy Tiên sủng chiêu Băng Phong Tiễn.' },
  sach_hoa: { name: 'Sách: Liệt Diễm Phún', icon: '📕', type: 'book', teach: 'pet_hoa', price: 0, desc: 'Dạy Tiên sủng chiêu Liệt Diễm Phún.' },
  sach_tho: { name: 'Sách: Lạc Thạch Kích', icon: '📙', type: 'book', teach: 'pet_tho', price: 0, desc: 'Dạy Tiên sủng chiêu Lạc Thạch Kích.' },
  sach_aoe: { name: 'Sách: Thiên Địa Cộng Minh', icon: '📒', type: 'book', teach: 'pet_aoe', price: 0, desc: 'Dạy Tiên sủng chiêu đánh toàn bộ địch.' },
  sach_heal: { name: 'Sách: Linh Tuyền Trị Liệu', icon: '📗', type: 'book', teach: 'pet_heal', price: 0, desc: 'Dạy Tiên sủng chiêu hồi máu đồng đội.' },
  sach_loi: { name: 'Sách: Lôi Đình Kích', icon: '📓', type: 'book', teach: 'pet_loi', price: 0, desc: 'Dạy Tiên sủng chiêu sét, có thể gây choáng.' },
  // sự kiện
  li_xi: { name: 'Bao Lì Xì', icon: '🧧', type: 'lixi', price: 0, desc: 'Mở ra bạc hoặc vàng may mắn.' },
  phao_hoa: { name: 'Pháo Hoa', icon: '🎆', type: 'firework', price: 0, desc: 'Bắn pháo hoa trên bản đồ cho mọi người cùng xem.' },
  banh_chung: { name: 'Bánh Chưng', icon: '🟩', type: 'hp', value: 400, price: 0, desc: 'Hồi 400 khí huyết. Đặc sản Tết.' },
  banh_trung_thu: { name: 'Bánh Trung Thu', icon: '🥮', type: 'hp', value: 400, price: 0, desc: 'Hồi 400 khí huyết. Đặc sản Trung Thu.' },
  den_long: { name: 'Đèn Lồng', icon: '🏮', type: 'mat', price: 0, desc: 'Sưu tầm đủ 10 cái đổi quà ở mục Sự kiện.' },
};
Object.assign(D.ITEMS, NEW_ITEMS);
D.SKILLS.pet_loi = { name: 'Lôi Đình Kích', type: 'magic', target: 'enemy', power: 1.7, mp: 0, fx: 'thunder', stun: 0.15 };
const MATS = ['thao_duoc', 'yeu_dan', 'tinh_thach', 'thu_bi'];
const BOOKS = Object.keys(NEW_ITEMS).filter((k) => k.startsWith('sach_'));

// ---------- thú cưỡi ----------
// speed: hệ số tốc độ đi trên bản đồ · bonus: % chỉ số
const MOUNTS = {
  bachma: { name: 'Bạch Long Mã', icon: '🐴', lvl: 8, price: { bac: 3000 }, speed: 1.3, bonus: { spd: 4, maxHp: 3 }, desc: 'Ngựa trắng của Đường Tăng – hiền lành, bền bỉ.' },
  hoho: { name: 'Hổ Vằn', icon: '🐯', lvl: 18, price: { vang: 60 }, speed: 1.4, bonus: { atk: 4, spd: 4 }, desc: 'Mãnh hổ núi Lưỡng Giới.' },
  hac: { name: 'Tiên Hạc', icon: '🕊️', lvl: 28, price: { vang: 150 }, speed: 1.55, bonus: { matk: 5, spd: 6 }, desc: 'Hạc trắng của Nam Cực Tiên Ông.' },
  kylan: { name: 'Kỳ Lân', icon: '🦄', lvl: 35, price: null, craft: true, speed: 1.6, bonus: { maxHp: 6, def: 6, atk: 4 }, desc: 'Thần thú – chỉ rèn được ở Lò Rèn.' },
  candau: { name: 'Cân Đẩu Vân', icon: '☁️', lvl: 45, price: { vang: 400 }, speed: 1.8, bonus: { spd: 10, matk: 5, atk: 5 }, desc: 'Mây bay của Tề Thiên Đại Thánh – một cái lộn mười vạn tám nghìn dặm.' },
};

// ---------- công thức ----------
const RECIPES = {
  // Lò Bát Quái (luyện đan)
  hp_m: { kind: 'dan', name: 'Đại Hoàn Đan ×3', need: { thao_duoc: 3 }, bac: 50, give: { hp_m: 3 } },
  hp_l: { kind: 'dan', name: 'Cửu Chuyển Kim Đan ×2', need: { thao_duoc: 2, yeu_dan: 2 }, bac: 200, give: { hp_l: 2 } },
  mp_m: { kind: 'dan', name: 'Ngọc Lộ Hoàn ×3', need: { thao_duoc: 3, tinh_thach: 1 }, bac: 80, give: { mp_m: 3 } },
  linh_dan: { kind: 'dan', name: 'Linh Đan', need: { yeu_dan: 3, tinh_thach: 2 }, bac: 300, give: { linh_dan: 1 } },
  hop_the_dan: { kind: 'dan', name: 'Hợp Thể Đan', need: { yeu_dan: 5, thao_duoc: 3 }, bac: 500, give: { hop_the_dan: 1 } },
  sach: { kind: 'dan', name: 'Sách kỹ năng ngẫu nhiên', need: { tinh_thach: 4, yeu_dan: 3 }, bac: 800, give: 'book' },
  bau_vang: { kind: 'dan', name: 'Bầu Vàng', need: { tinh_thach: 2, yeu_dan: 2, bau_bac: 1 }, bac: 200, give: { bau_vang: 1 } },
  // Lò Rèn
  da_ch: { kind: 'ren', name: 'Đá Cường Hóa ×2', need: { tinh_thach: 2 }, bac: 30, give: { da_ch: 2 } },
  equip: { kind: 'ren', name: 'Rèn trang bị (chọn ô)', need: { tinh_thach: 4, thu_bi: 2 }, bacPerLvl: 30, give: 'equip' },
  kylan: { kind: 'ren', name: 'Thú cưỡi Kỳ Lân', need: { yeu_dan: 10, tinh_thach: 10, thu_bi: 10 }, bac: 5000, give: 'mount:kylan', lvl: 35 },
};

// ---------- sự kiện theo mùa (ngày giờ Việt Nam) ----------
const EVENTS = [
  { id: 'tet', name: 'Tết Nguyên Đán', icon: '🧧', from: '2027-01-28', to: '2027-02-21', gift: 'li_xi', drop: 'banh_chung', collect: null,
    desc: 'Mỗi ngày nhận Bao Lì Xì, đánh quái rơi Bánh Chưng, bắn Pháo Hoa mừng xuân.', shop: [['phao_hoa', 2]] },
  { id: 'trungthu', name: 'Tết Trung Thu', icon: '🏮', from: '2027-09-08', to: '2027-09-22', gift: 'banh_trung_thu', drop: 'den_long', collect: { item: 'den_long', n: 10, reward: { vang: 15, items: { trung_bd: 1 } } },
    desc: 'Rước đèn: đánh quái nhặt Đèn Lồng, đủ 10 cái đổi Trứng Biến Dị. Mỗi ngày nhận Bánh Trung Thu.', shop: [['phao_hoa', 2]] },
  { id: 'tet2028', name: 'Tết Nguyên Đán', icon: '🧧', from: '2028-01-20', to: '2028-02-12', gift: 'li_xi', drop: 'banh_chung', collect: null,
    desc: 'Mỗi ngày nhận Bao Lì Xì, đánh quái rơi Bánh Chưng, bắn Pháo Hoa mừng xuân.', shop: [['phao_hoa', 2]] },
];

module.exports = { NEW_ITEMS, MATS, BOOKS, MOUNTS, RECIPES, EVENTS };
