// =====================================================================
//  CHIÊU ĐẶC TRƯNG CỦA BOSS CHÍNH TRUYỆN (theo nguyên tác) + ĐỘ KHÓ THEO ẢI
//  Trường mới của kỹ năng (game/battle.js xử lý):
//   hits/rand   đánh nhiều nhát (rand: mỗi nhát chọn mục tiêu ngẫu nhiên)
//   pick        chọn mục tiêu: 'low' (ít máu nhất) · 'strong' (công cao nhất) · 'pet' (ưu tiên Tiên sủng) · 'player'
//   count       số mục tiêu của chiêu khống chế (chọn ngẫu nhiên)
//   dispel      xoá buff, khiên của mục tiêu
//   debuff      { key, label, turns, atkUp(âm), dodgeUp }
//   status      'stun' | 'seal' | 'chaos' | 'blind' (đánh hay trượt) | 'slow' (chậm) | 'mark' (bị gọi tên: nổ sau N lượt)
//   label       tên hiển thị của trạng thái (vd. "Bị nuốt")
//   dot         % máu tối đa mất mỗi lượt khi trúng khống chế
//   blind/slow  tỉ lệ gây mù/chậm khi trúng đòn
//   heal        hồi % máu cho bản thân (chiêu buff)
//   summon      [[mã lính, chênh cấp], …]
//   copy        sao chép chiêu mạnh nhất của người chơi
//   phaseMin    chỉ dùng từ giai đoạn này
// =====================================================================
const SKILLS = {
  sig_tuyenhoa: { name: 'Tuyên Hoa Phủ', type: 'phys', target: 'allEnemy', power: 0.85, mp: 0, fx: 'rock', stun: 0.3, sig: 1 },
  sig_tamdau: { name: 'Tam Đầu Lục Tý', type: 'phys', target: 'enemy', power: 0.3, hits: 6, rand: true, mp: 0, fx: 'slash', sig: 1, phaseMin: 2 },
  sig_phonghoa: { name: 'Phong Hỏa Luân', type: 'magic', target: 'enemy', power: 1.0, mp: 0, fx: 'fire', burn: 2, sig: 1 },
  sig_thiennhan: { name: 'Thiên Nhãn', type: 'magic', target: 'allEnemy', power: 0.55, mp: 0, fx: 'light', dispel: true, sig: 1 },
  sig_haothien: { name: 'Hao Thiên Khuyển', type: 'phys', target: 'enemy', pick: 'low', power: 1.45, mp: 0, fx: 'bite', sig: 1 },
  sig_doathuyen: { name: 'Đoạt Thuyền', type: 'phys', target: 'enemy', power: 1.1, mp: 0, fx: 'slash', poison: 3, poisonLabel: 'Chảy máu', sig: 1 },
  sig_hotrao: { name: 'Hổ Trảo', type: 'phys', target: 'enemy', pick: 'player', power: 1.25, critUp: 30, mp: 0, fx: 'claw', sig: 1 },
  sig_nuotngua: { name: 'Nuốt Ngựa', type: 'control', target: 'enemy', pick: 'pet', status: 'stun', label: 'Bị nuốt', chance: 0.7, turns: 2, dot: 0.05, mp: 0, fx: 'water' },
  sig_longngam: { name: 'Long Ngâm', type: 'magic', target: 'allEnemy', power: 0.9, mp: 0, fx: 'ice', stun: 0.1, sig: 1 },
  sig_hacphong: { name: 'Hắc Phong', type: 'control', target: 'allEnemy', status: 'blind', label: 'Mù', chance: 0.6, turns: 2, mp: 0, fx: 'shadow' },
  sig_cuuxi: { name: 'Cửu Xỉ Đinh Ba', type: 'phys', target: 'enemy', power: 0.5, hits: 3, mp: 0, fx: 'slash', sig: 1 },
  sig_anno: { name: 'Ăn No', type: 'buff', target: 'self', heal: 0.15, mp: 0, fx: 'heal', buff: { turns: 1 } },
  sig_thanphong: { name: 'Tam Muội Thần Phong', type: 'magic', target: 'allEnemy', power: 0.85, blind: 0.5, mp: 0, fx: 'wind', sig: 1 },
  sig_luusa: { name: 'Lưu Sa', type: 'magic', target: 'allEnemy', power: 0.8, slow: 0.6, mp: 0, fx: 'sand', sig: 1 },
  sig_tuly: { name: 'Tụ Lý Càn Khôn', type: 'control', target: 'allEnemy', count: 2, status: 'stun', label: 'Trong tay áo', chance: 0.6, turns: 2, mp: 0, fx: 'wind' },
  sig_amphong: { name: 'Bạch Cốt Âm Phong', type: 'magic', target: 'allEnemy', power: 0.8, poison: 2, mp: 0, fx: 'shadow', sig: 1 },
  sig_hoaho: { name: 'Hoá Hổ', type: 'control', target: 'enemy', pick: 'player', status: 'seal', label: 'Hoá hổ', chance: 0.7, turns: 2, mp: 0, fx: 'shadow' },
  sig_goiten: { name: 'Gọi Tên', type: 'control', target: 'enemy', pick: 'player', status: 'mark', label: 'Bị gọi tên', chance: 0.9, turns: 2, mp: 0, fx: 'gourd' },
  sig_holo: { name: 'Tử Kim Hồng Hồ Lô', type: 'magic', target: 'enemy', power: 1.25, drain: 0.6, mp: 0, fx: 'gourd', sig: 1 },
  sig_suhong: { name: 'Sư Hống', type: 'control', target: 'allEnemy', count: 2, status: 'stun', label: 'Choáng', chance: 0.4, turns: 1, mp: 0, fx: 'roar' },
  sig_chanhoa: { name: 'Tam Muội Chân Hỏa', type: 'magic', target: 'allEnemy', power: 0.95, burn: 3, mp: 0, fx: 'fire', sig: 1 },
  sig_keosong: { name: 'Kéo Xuống Sông', type: 'control', target: 'enemy', status: 'stun', label: 'Bị dìm', chance: 0.6, turns: 2, dot: 0.06, mp: 0, fx: 'water' },
  sig_caulo: { name: 'Cầu Phong Gọi Lôi', type: 'magic', target: 'enemy', power: 0.45, hits: 4, rand: true, mp: 0, fx: 'thunder', sig: 1 },
  sig_vacdau: { name: 'Vạc Dầu Sôi', type: 'magic', target: 'enemy', power: 1.15, drain: 0.5, mp: 0, fx: 'fire', sig: 1 },
  sig_nuoclanh: { name: 'Tắm Nước Lạnh', type: 'buff', target: 'self', shield: 0.1, mp: 0, fx: 'shield', buff: { turns: 2 } },
  sig_dongbang: { name: 'Đóng Băng Sông', type: 'control', target: 'allEnemy', count: 2, status: 'stun', label: 'Đóng băng', chance: 0.45, turns: 1, mp: 0, fx: 'ice' },
  sig_kimcuong: { name: 'Kim Cương Trác', type: 'control', target: 'allEnemy', dispel: true, debuff: { key: 'disarm', label: 'Mất binh khí', turns: 3, atkUp: -0.25 }, mp: 0, fx: 'light' },
  sig_docthung: { name: 'Đảo Mã Độc Thung', type: 'phys', target: 'enemy', power: 1.05, poison: 4, poisonMul: 0.55, mp: 0, fx: 'poison', sig: 1 },
  sig_giamao: { name: 'Giả Mạo', type: 'magic', target: 'enemy', copy: true, power: 1.1, mp: 0, fx: 'shadow', sig: 1 },
  sig_batieu: { name: 'Ba Tiêu Phiến', type: 'magic', target: 'enemy', power: 0.9, stun: 0.8, stunLabel: 'Bị quạt bay', mp: 0, fx: 'wind', sig: 1 },
  sig_honthiet: { name: 'Hỗn Thiết Côn', type: 'phys', target: 'enemy', power: 1.35, mp: 0, fx: 'rock', sig: 1 },
  sig_bachnguu: { name: 'Đại Bạch Ngưu Húc', type: 'phys', target: 'allEnemy', power: 1.05, stun: 0.2, mp: 0, fx: 'rock', sig: 1, phaseMin: 2 },
  sig_cuudau: { name: 'Cửu Đầu Loạn Kích', type: 'phys', target: 'enemy', power: 0.24, hits: 9, rand: true, mp: 0, fx: 'bite', sig: 1 },
  sig_kimnao: { name: 'Kim Nạo', type: 'control', target: 'enemy', status: 'stun', label: 'Bị úp chũm chọe', chance: 0.7, turns: 2, mp: 0, fx: 'gold' },
  sig_tuivai: { name: 'Nhân Chủng Đại', type: 'control', target: 'enemy', pick: 'pet', status: 'stun', label: 'Trong túi vải', chance: 0.7, turns: 2, mp: 0, fx: 'gold' },
  sig_nuotchung: { name: 'Nuốt Chửng', type: 'control', target: 'enemy', status: 'stun', label: 'Bị nuốt', chance: 0.65, turns: 2, dot: 0.07, mp: 0, fx: 'bite' },
  sig_chuonghoa: { name: 'Tử Kim Linh · Lửa', type: 'magic', target: 'allEnemy', power: 0.8, burn: 2, mp: 0, fx: 'fire', sig: 1 },
  sig_chuongkhoi: { name: 'Tử Kim Linh · Khói', type: 'magic', target: 'allEnemy', power: 0.7, blind: 0.5, mp: 0, fx: 'shadow', sig: 1 },
  sig_chuongcat: { name: 'Tử Kim Linh · Cát', type: 'magic', target: 'allEnemy', power: 0.7, slow: 0.6, mp: 0, fx: 'sand', sig: 1 },
  sig_tola: { name: 'Thiên La Tơ', type: 'control', target: 'allEnemy', count: 3, status: 'stun', label: 'Bị tơ trói', chance: 0.5, turns: 1, mp: 0, fx: 'web' },
  sig_vannhan: { name: 'Kim Quang Vạn Nhãn', type: 'magic', target: 'allEnemy', power: 0.7, blind: 0.6, mp: 0, fx: 'light', sig: 1 },
  sig_nuotbinh: { name: 'Nuốt Thiên Binh', type: 'phys', target: 'enemy', power: 1.35, drain: 0.5, mp: 0, fx: 'bite', sig: 1 },
  sig_voicuon: { name: 'Vòi Cuốn', type: 'control', target: 'enemy', status: 'stun', label: 'Bị vòi cuốn', chance: 0.75, turns: 2, mp: 0, fx: 'rock' },
  sig_canhvang: { name: 'Cánh Vàng', type: 'phys', target: 'enemy', power: 0.8, hits: 2, rand: true, mp: 0, fx: 'wind', sig: 1 },
  sig_amduong: { name: 'Âm Dương Nhị Khí Bình', type: 'control', target: 'enemy', status: 'stun', label: 'Trong bình', chance: 0.6, turns: 2, dot: 0.06, mp: 0, fx: 'gourd' },
  sig_banlong: { name: 'Bàn Long Trượng', type: 'magic', target: 'allEnemy', power: 0.75, drain: 0.3, mp: 0, fx: 'shadow', sig: 1 },
  sig_donhtho: { name: 'Độn Thổ', type: 'buff', target: 'self', mp: 0, fx: 'rock', buff: { turns: 1, dodgeUp: 60 } },
  sig_songkiem: { name: 'Song Kiếm', type: 'phys', target: 'enemy', power: 0.75, hits: 2, mp: 0, fx: 'slash', sig: 1 },
  sig_maihoa: { name: 'Phân Cánh Mai Hoa', type: 'summon', target: 'self', summon: [['tieuyeu', -3], ['tieuyeu', -3]], mp: 0, fx: 'shadow' },
  sig_doatbinh: { name: 'Đoạt Binh Khí', type: 'control', target: 'enemy', pick: 'strong', debuff: { key: 'disarm', label: 'Mất binh khí', turns: 3, atkUp: -0.35 }, mp: 0, fx: 'slash' },
  sig_cuulinh: { name: 'Cửu Đầu Tha Người', type: 'control', target: 'allEnemy', count: 2, status: 'stun', label: 'Bị ngậm đi', chance: 0.5, turns: 2, mp: 0, fx: 'bite' },
  sig_hutdau: { name: 'Hút Dầu Đèn', type: 'magic', target: 'allEnemy', power: 0.7, mpDrain: 0.25, mp: 0, fx: 'shadow', sig: 1 },
  sig_daoduoc: { name: 'Đảo Dược Xử', type: 'phys', target: 'enemy', power: 1.1, stun: 0.4, mp: 0, fx: 'rock', sig: 1 },
  sig_hatsong: { name: 'Hất Xuống Sông', type: 'magic', target: 'allEnemy', power: 0.9, slow: 0.5, mp: 0, fx: 'water', sig: 1 },
  sig_cuudoc: { name: 'Cửu Đầu Phun Độc', type: 'magic', target: 'allEnemy', power: 0.7, poison: 3, mp: 0, fx: 'poison', sig: 1 },
};

// boss → chiêu đặc trưng (thêm vào trước chiêu thường), số giai đoạn, nội tại
const BOSS = {
  culinh: { sig: ['sig_tuyenhoa'] },
  nata: { sig: ['sig_phonghoa', 'sig_tamdau'], phases: 2, phaseMsg: { 2: 'Na Tra hiện Tam Đầu Lục Tý – ba đầu sáu tay!' } },
  nhilang: { sig: ['sig_thiennhan', 'sig_haothien'] },
  luuhong: { sig: ['sig_doathuyen'] },
  dantuong: { sig: ['sig_hotrao'] },
  tieubachlong: { sig: ['sig_nuotngua', 'sig_longngam'] },
  hachhung: { sig: ['sig_hacphong'] },
  batgioi: { sig: ['sig_cuuxi', 'sig_anno'] },
  hoangphong: { sig: ['sig_thanphong'] },
  satang: { sig: ['sig_luusa'] },
  tranguyen: { sig: ['sig_tuly'] },
  bachcot: { sig: ['sig_amphong'], phases: 4, phaseMsg: { 2: 'Thôn nữ ngã xuống… rồi hoá thành bà lão chống gậy tìm con!', 3: 'Bà lão vừa gục, một ông lão lần tràng hạt đã hiện ra!', 4: 'Bạch Cốt Tinh lộ nguyên hình – một bộ xương trắng!' } },
  hoangbao: { sig: ['sig_hoaho'] },
  ngangiac: { sig: ['sig_goiten'] },
  kimgiac: { sig: ['sig_holo'] },
  giavuong: { sig: ['sig_suhong'], phases: 2, phaseMsg: { 2: 'Giả Quốc Vương lộ nguyên hình sư tử lông xanh!' } },
  honghai: { sig: ['sig_chanhoa'], feed: 'thuy' },
  dalong: { sig: ['sig_keosong'] },
  holuc: { sig: ['sig_caulo'] },
  duongluc: { sig: ['sig_vacdau', 'sig_nuoclanh'] },
  linhcam: { sig: ['sig_dongbang'] },
  docgiac: { sig: ['sig_kimcuong'] },
  bocap: { sig: ['sig_docthung'] },
  lucnhi: { sig: ['sig_giamao'] },
  thietphien: { sig: ['sig_batieu'] },
  nguuma: { sig: ['sig_honthiet', 'sig_bachnguu'], phases: 2, phaseMsg: { 2: 'Ngưu Ma Vương hiện nguyên hình Đại Bạch Ngưu cao nghìn trượng!' } },
  cuudau: { sig: ['sig_cuudau'], phases: 2, phaseMsg: { 2: 'Cửu Đầu Phò Mã hiện hình chim chín đầu!' } },
  hoangmi: { sig: ['sig_kimnao', 'sig_tuivai'] },
  manxa: { sig: ['sig_nuotchung'] },
  kimmao: { sig: ['sig_chuonghoa', 'sig_chuongkhoi', 'sig_chuongcat'] },
  nhentinh: { sig: ['sig_tola'] },
  bachnhan: { sig: ['sig_vannhan'] },
  thanhsu: { sig: ['sig_nuotbinh'] },
  bachtuong: { sig: ['sig_voicuon'] },
  daibang: { sig: ['sig_canhvang', 'sig_amduong'] },
  quoctruong: { sig: ['sig_banlong'], phases: 2, phaseMsg: { 2: 'Quốc Trượng hiện nguyên hình con hươu trắng!' } },
  chuottinh: { sig: ['sig_donhtho', 'sig_songkiem'], phases: 2, phaseMsg: { 2: 'Địa Dũng Phu Nhân hiện nguyên hình chuột trắng mũi vàng!' } },
  baotinh: { sig: ['sig_maihoa'] },
  hoangsu: { sig: ['sig_doatbinh'] },
  cuulinh: { sig: ['sig_cuulinh'] },
  teguu: { sig: ['sig_hutdau'] },
  ngoctho: { sig: ['sig_daoduoc'], phases: 2, phaseMsg: { 2: 'Công chúa giả lộ đôi tai dài – là Thỏ Ngọc cung Quảng Hàn!' } },
  laongoan: { sig: ['sig_hatsong'] },
  world: { sig: ['sig_cuudoc'] },
};

// Mẹo khắc chế – Ngộ Không nhắc sau khi thua boss
const TIPS = {
  sig_hacphong: 'Gió đen làm mù mắt, đòn đánh hay trượt. Dùng phép (không bị né) hoặc chờ hết mù rồi hãy dồn sát thương.',
  sig_thanphong: 'Gió Tam Muội làm mù. Pháp thuật vẫn trúng – dùng chiêu phép nhiều hơn.',
  sig_goiten: 'Bị gọi tên thì đúng lượt hồ lô hút hãy bấm Phòng thủ: sát thương giảm một nửa.',
  sig_kimcuong: 'Kim Cương Trác thu cả buff lẫn binh khí. Đừng buff trước, hãy để dành sau khi hắn dùng chiêu.',
  sig_docthung: 'Nọc bò cạp rất độc. Mang nhiều thuốc hồi máu và hạ nó thật nhanh.',
  sig_chanhoa: 'Lửa Tam Muội càng gặp nước càng mạnh – đừng dùng chiêu hệ Thủy với Hồng Hài Nhi.',
  sig_giamao: 'Lục Nhĩ sao chép chiêu mạnh nhất của ngươi. Mạnh thì hắn cũng mạnh – hãy dựa vào Tiên sủng.',
  sig_nuotngua: 'Rồng thích nuốt Tiên sủng. Gọi thêm Tiên sủng dự bị vào thay.',
  sig_tuly: 'Tay áo Càn Khôn thu người hai lượt. Kháng Choáng cao sẽ giúp thoát ra.',
  sig_doatbinh: 'Bị đoạt binh khí thì công giảm. Dùng phép thay đòn đánh thường.',
  sig_maihoa: 'Phân thân chỉ là đồ giả – đánh thẳng vào Nam Sơn Đại Vương.',
};
const FEED_TIP = 'Lửa Tam Muội càng gặp nước càng mạnh – đừng dùng chiêu hệ Thủy với Hồng Hài Nhi.';

// Độ khó theo ải (vị trí bản đồ): khống chế mạnh dần, giai đoạn nhiều dần
const TIERS = [
  { name: 'Khởi đầu', upTo: 5, ctl: 0.8, hp: 1.0, atk: 1.0 },
  { name: 'Trung đoạn', upTo: 13, ctl: 0.9, hp: 1.0, atk: 1.0 },
  { name: 'Gian nan', upTo: 21, ctl: 1.0, hp: 1.0, atk: 1.0 },
  { name: 'Cuối đường', upTo: 29, ctl: 1.1, hp: 1.0, atk: 1.0 },
  { name: 'Hậu truyện', upTo: 99, ctl: 1.15, hp: 1.0, atk: 1.0 },
];

// Hệ số khó từng boss (máu × f, công × √f) – đo bằng mô phỏng người chơi chuẩn theo tiến trình (có đồ đệ trợ chiến)
// để tỉ lệ thắng lần đầu ≈ 90% · 80% · 70% · 60% · 50% theo 5 ải. Đo lại: tools/balance-test.js
const DIFF = {
  culinh: 2.25, nata: 1.71, nhilang: 2.59, luuhong: 3.01, dantuong: 2.7, tieubachlong: 2.59, hachhung: 5.15,
  batgioi: 2.27, hoangphong: 3.11, satang: 6.12, tranguyen: 4.21, bachcot: 3.69, hoangbao: 4.43,
  ngangiac: 4.75, kimgiac: 3.88, giavuong: 3.76, honghai: 3.96, dalong: 3.69, holuc: 3.96, duongluc: 2.78,
  linhcam: 5.05, docgiac: 4.34, bocap: 4.38, lucnhi: 3.73, thietphien: 4.12, nguuma: 4, cuudau: 3.51,
  hoangmi: 3.8, manxa: 3.76, kimmao: 3.17, nhentinh: 5, bachnhan: 4.21, thanhsu: 4.56, bachtuong: 3.76,
  daibang: 3.01, quoctruong: 3.62, chuottinh: 3.76, baotinh: 3.8, hoangsu: 4.56, cuulinh: 4.12, teguu: 3.88,
  ngoctho: 3.58, laongoan: 3.2, daxoa: 2.92, quyma: 2.81, giaoma: 2.49, nguudau: 3.54, madien: 2.98,
  huyetha: 2.64, banglang: 2.62, tuyetma: 3.37, khaiminh: 2.49, thanlau: 3.11, kimngao: 2.18, aodieu: 2.44,
  loibo: 2.07, cuudieu: 1.63, honthe: 2.05, tamma: 2.11, hondonthu: 1.59, mato: 1.02,
};

function apply(D) {
  Object.assign(D.SKILLS, SKILLS);
  for (const [id, cfg] of Object.entries(BOSS)) {
    const B = D.BOSSES[id]; if (!B) continue;
    B.skills = [...cfg.sig, ...B.skills.filter((k) => !cfg.sig.includes(k))];
    if (cfg.phases) B.phases = Math.max(B.phases || 1, cfg.phases);
    if (cfg.feed) B.feed = cfg.feed;
  }
  for (const [id, B] of Object.entries(D.BOSSES)) {
    const idx = D.MAP_ORDER.indexOf(B.map);
    const t = idx < 0 ? 1 : TIERS.findIndex((x) => idx < x.upTo);
    B.tier = t;
    const T = TIERS[t];
    B.ctl = T.ctl;
    const f = DIFF[id] || 1;
    B.hpMul = +(B.hpMul * T.hp * f).toFixed(2); B.atkMul = +(B.atkMul * T.atk * Math.sqrt(f)).toFixed(3);
    // ải sau: boss cuối mỗi đoạn có thêm giai đoạn
    if (t >= 3 && !B.post && (B.phases || 1) === 2) B.phases = 3;
  }
}

module.exports = { SKILLS, BOSS, TIPS, FEED_TIP, TIERS, DIFF, apply };
