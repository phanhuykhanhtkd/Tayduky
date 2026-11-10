// =====================================================================
//  CỐT TRUYỆN: Tiền truyện Đại Náo Thiên Cung + đủ 81 nạn theo
//  "Tây Du Ký" của Ngô Thừa Ân (danh sách nạn ở hồi thứ 99).
//  Mỗi chương = 1 bản đồ. Sửa file này để đổi lời thoại / thêm nhiệm vụ.
// =====================================================================

// ---------- 4 bố cục gốc (12×20), dùng thẳng hoặc lật gương ----------
// .  đất   ,  vùng có quái   T cây   ~ nước   # đá/cột   H nhà   P cổng   W thác (bí mật)
const LAYOUTS = {
  A: {
    spawn: [5, 18],
    slots: [[4, 17], [3, 12], [7, 17], [10, 18], [10, 3], [5, 6], [6, 3], [7, 1], [8, 10], [1, 4], [1, 9], [9, 6]],
    tiles: ['#####P######', '#HH#....#HH#', '#HH#.,,.#HH#', '#...,,,,...#', '#.,,,##,,,.#', '#.,,,##,,,.#', '#..........#', '#~~~~..~~~~#', '#~~~~..~~~~#', '#..........#',
      '#TT.,,,,.TT#', '#TT.,,,,.TT#', '#TT......TT#', '##.......###', '#,,,.##.,,,#', '#,,,.##.,,,#', '#,,,....,,,#', '#..H....H..#', '#..........#', '############'],
  },
  B: {
    spawn: [5, 17],
    slots: [[1, 8], [10, 8], [1, 10], [8, 17], [2, 17], [6, 13], [3, 4], [8, 1], [6, 6], [10, 14], [5, 2], [5, 9]],
    tiles: ['#####P######', '#,,,,..,,,,#', '#,,TT..TT,,#', '#,,TT..TT,,#', '#,,,,..,,,,#', '###.####.###', '#HH......HH#', '#HH..HH..HH#', '#....HH....#', '#~~~....~~~#',
      '#.........H#', '#HH.~~~~...#', '#HH.~~~~.HH#', '#........HH#', '#.,,,.,,,..#', '#.,,,.,,,.T#', '#.,,,.,,,.T#', '#..........#', '#H...HH...H#', '############'],
  },
  C: {
    spawn: [5, 18],
    slots: [[3, 17], [6, 18], [8, 18], [3, 12], [8, 7], [6, 1], [5, 5], [1, 9], [10, 10], [7, 13], [4, 8], [6, 15]],
    tiles: ['#####P######', '#TT,,..,,TT#', '#T,,,..,,,T#', '#~~W~..~~~~#', '#~~~~..~~~~#', '#,,,,..,,,,#', '#,TT,..,TT,#', '#,TT......,#', '#,,,..TT,,,#', '#....,TT,..#',
      '#.TT.,,,,..#', '#.TT.,,,,TT#', '#....,,,,TT#', '#,,,,....,,#', '#,TT,,.,,,,#', '#,TT,,.,TT,#', '#,,,,,.,TT,#', '#.H.......H#', '#..........#', '############'],
  },
  D: {
    spawn: [5, 18],
    slots: [[4, 16], [1, 16], [7, 18], [10, 16], [5, 13], [6, 9], [5, 6], [6, 2], [1, 3], [10, 3], [3, 8], [7, 12]],
    tiles: ['#####P######', '#HHH....HHH#', '#HHH.,,.HHH#', '#...,,,,...#', '#,,,,##,,,,#', '#,##,,,,##,#', '#,##,..,##,#', '#,,,,..,,,,#', '###.####.###', '#,,,,..,,,,#',
      '#,##,,,,##,#', '#,,,,..,,,,#', '#~~~....~~~#', '#,,,,..,,,,#', '#,##,,,,##,#', '#,,,,..,,,,#', '#..........#', '#.H..HH..H.#', '#..........#', '############'],
  },
};
function layout(key, mirror) {
  const L = LAYOUTS[key];
  if (!mirror) return { tiles: L.tiles.slice(), spawn: L.spawn.slice(), slots: L.slots.map((s) => s.slice()) };
  return {
    tiles: L.tiles.map((r) => [...r.replace(/W/g, '~')].reverse().join('')),
    spawn: [11 - L.spawn[0], L.spawn[1]],
    slots: L.slots.map(([x, y]) => [11 - x, y]),
  };
}

// ---------- Boss (cấp & máu tự tính theo chương) ----------
// [tên, biểu tượng dự phòng, ngũ hành, kỹ năng, lính đi kèm [mã, chênh cấp]]
const BOSS = {
  culinh: ['Cự Linh Thần', '🧌', 'tho', ['pet_tho'], []],
  nata: ['Na Tra', '🧒', 'hoa', ['pet_hoa', 'pet_aoe'], [['thienbinh', -2]]],
  nhilang: ['Nhị Lang Thần', '🤺', 'kim', ['pet_kim', 'pet_aoe'], [['thienbinh', -2], ['thienbinh', -2]]],
  luuhong: ['Thủy Tặc Lưu Hồng', '🗡️', 'thuy', ['pet_thuy'], [['thuytac', -2]]],
  dantuong: ['Dần Tướng Quân', '🐯', 'kim', ['pet_kim'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  tieubachlong: ['Tiểu Bạch Long', '🐉', 'thuy', ['pet_thuy', 'pet_aoe'], []],
  hachhung: ['Hắc Hùng Tinh', '🐻', 'tho', ['pet_tho'], [['tieuyeu', -2]]],
  batgioi: ['Trư Bát Giới', '🐷', 'thuy', ['pet_thuy'], []],
  hoangphong: ['Hoàng Phong Quái', '🌪️', 'moc', ['pet_aoe', 'pet_moc'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  satang: ['Sa Ngộ Tĩnh', '🧔', 'thuy', ['pet_thuy', 'pet_aoe'], []],
  tranguyen: ['Trấn Nguyên Đại Tiên', '🧙', 'moc', ['pet_moc', 'pet_aoe'], [['daodong', -2]]],
  bachcot: ['Bạch Cốt Tinh', '💀', 'moc', ['pet_aoe', 'pet_moc'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  hoangbao: ['Hoàng Bào Quái', '👹', 'tho', ['pet_tho', 'pet_aoe'], [['tieuyeu', -2]]],
  ngangiac: ['Ngân Giác Đại Vương', '😈', 'kim', ['pet_kim'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  kimgiac: ['Kim Giác Đại Vương', '😈', 'kim', ['pet_kim', 'pet_aoe'], [['tieuyeu', -2]]],
  giavuong: ['Giả Quốc Vương', '🦁', 'moc', ['pet_moc', 'pet_aoe'], []],
  honghai: ['Hồng Hài Nhi', '👶', 'hoa', ['pet_hoa', 'pet_aoe'], [['hoayeu', -2], ['hoayeu', -2]]],
  dalong: ['Đà Long', '🐊', 'thuy', ['pet_thuy'], [['thuytac', -2], ['thuytac', -2]]],
  holuc: ['Hổ Lực Đại Tiên', '🐯', 'kim', ['pet_kim', 'pet_aoe'], [['daodong', -2]]],
  duongluc: ['Lộc Lực · Dương Lực', '🐐', 'tho', ['pet_tho', 'pet_aoe'], [['daodong', -2], ['daodong', -2]]],
  linhcam: ['Linh Cảm Đại Vương', '🐟', 'thuy', ['pet_thuy', 'pet_aoe'], [['thuytac', -2], ['thuytac', -2]]],
  docgiac: ['Độc Giác Hủy Đại Vương', '🐃', 'tho', ['pet_tho', 'pet_aoe'], [['tieuyeu', -2]]],
  bocap: ['Bò Cạp Tinh', '🦂', 'moc', ['pet_moc', 'pet_aoe'], []],
  lucnhi: ['Lục Nhĩ Mỹ Hầu', '🐒', 'kim', ['pet_kim', 'pet_aoe'], []],
  thietphien: ['Thiết Phiến Công Chúa', '🪭', 'moc', ['pet_aoe', 'pet_moc'], [['hoayeu', -2]]],
  nguuma: ['Ngưu Ma Vương', '🐃', 'tho', ['pet_tho', 'pet_aoe'], [['hoayeu', -2], ['hoayeu', -2]]],
  cuudau: ['Cửu Đầu Phò Mã', '🐦', 'thuy', ['pet_thuy', 'pet_aoe'], [['thuytac', -2]]],
  hoangmi: ['Hoàng Mi Đại Vương', '🧘', 'kim', ['pet_kim', 'pet_aoe'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  manxa: ['Hồng Lân Đại Mãng', '🐍', 'moc', ['pet_moc', 'pet_aoe'], []],
  kimmao: ['Trại Thái Tuế', '🦁', 'hoa', ['pet_hoa', 'pet_aoe'], [['tieuyeu', -2]]],
  nhentinh: ['Thất Nhện Tinh', '🕷️', 'moc', ['pet_moc', 'pet_aoe'], []],
  bachnhan: ['Bách Nhãn Ma Quân', '🐛', 'moc', ['pet_moc', 'pet_aoe'], [['daodong', -2]]],
  thanhsu: ['Thanh Sư Vương', '🦁', 'kim', ['pet_kim', 'pet_aoe'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  bachtuong: ['Bạch Tượng Vương', '🐘', 'tho', ['pet_tho', 'pet_aoe'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  daibang: ['Đại Bàng Kim Sí', '🦅', 'kim', ['pet_kim', 'pet_aoe'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  quoctruong: ['Quốc Trượng Bạch Lộc', '🦌', 'moc', ['pet_moc', 'pet_aoe'], [['daodong', -2]]],
  chuottinh: ['Địa Dũng Phu Nhân', '🐀', 'tho', ['pet_tho', 'pet_aoe'], [['tieuyeu', -2]]],
  baotinh: ['Nam Sơn Đại Vương', '🐆', 'kim', ['pet_kim'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  hoangsu: ['Hoàng Sư Tinh', '🦁', 'tho', ['pet_tho', 'pet_aoe'], [['tieuyeu', -2]]],
  cuulinh: ['Cửu Linh Nguyên Thánh', '🦁', 'hoa', ['pet_hoa', 'pet_aoe'], []],
  teguu: ['Tích Hàn Đại Vương', '🦏', 'thuy', ['pet_thuy', 'pet_aoe'], [['tieuyeu', -2], ['tieuyeu', -2]]],
  ngoctho: ['Ngọc Thố Tinh', '🐇', 'kim', ['pet_kim', 'pet_aoe'], []],
  laongoan: ['Lão Ngoan', '🐢', 'thuy', ['pet_thuy', 'pet_aoe'], []],
};

// ---------- Các chương ----------
// npcs: [mã, tên, biểu tượng, { role, look, talk, rumor, secretTalk }]  – xếp theo thứ tự chỗ đứng của bố cục
// boss: đặt boss: true (thông tin lấy ở BOSS)
const B = (id) => [id, BOSS[id][0], BOSS[id][1], { boss: true }];
const HEAL = (id, look, name = 'Thầy Thuốc') => [id, name, '👨‍⚕️', { role: 'heal', look }];
const SHOP = (id, look, name = 'Thương Nhân') => [id, name, '🧑‍💼', { role: 'shop', look }];

const OLD_CHAPTERS = [
  // =================================================================
  {
    id: 'ch1', name: 'Thiên Cung', sub: 'Tiền truyện · Đại Náo Thiên Cung', theme: 'heaven', layout: ['A', false], lv: [1, 9],
    enc: { forms: ['thongoc', 'tienhac', 'khongtuoc', 'kylan', 'longma', 'kimbang'], humans: ['thienbinh'] },
    secret: { id: 'hangnga', x: 1, y: 3 },
    npcs: [
      ['thaibach', 'Thái Bạch Kim Tinh', '🧙‍♂️', { talk: 'Hầu Vương đại náo, Ngọc Đế nổi giận. Ngươi muốn đi theo con đường nào?' }],
      ['tho_dao', 'Thổ Địa Vườn Đào', '👴', { role: 'peach', talk: 'Vườn Bàn Đào ba ngàn năm mới chín... Thiên binh canh gác cẩn mật lắm đấy.' }],
      ['duocsu1', 'Tiên Đồng Luyện Đan', '🧒', { role: 'heal', talk: 'Lò Bát Quái còn ấm, để ta trị thương cho.' }],
      ['shop1', 'Tiên Thương', '🧑‍💼', { role: 'shop', talk: 'Bầu bạc, đan dược, trang bị – mua gì cũng có!' }],
      ['hangnga', 'Hằng Nga', '👸', { talk: 'Đêm trăng tròn, ta hay ngắm Quảng Hàn từ góc Tây Bắc… Thỏ Ngọc của ta cũng thích đi lạc ở đó.', rumor: 'hangnga' }],
      B('culinh'), B('nata'), B('nhilang'),
      ['nhulai', 'Như Lai Phật Tổ', '🧘', { talk: 'Thiện tai. Hầu Vương có tài, nhưng không có đức.' }],
    ],
    steps: [
      { t: 'talk', npc: 'thaibach', title: 'Chiếu Chỉ Chiêu An', text: 'Gặp Thái Bạch Kim Tinh ở chân Thiên Cung.', dialog: 'Ngọc Đế phong Hầu Vương làm Bật Mã Ôn, ai ngờ y biết chức nhỏ thì nổi loạn, tự xưng Tề Thiên Đại Thánh! Ngươi hãy giúp ta dẹp yên đám thiên binh làm loạn trên mây.' },
      { t: 'kill', n: 6, title: 'Loạn Trên Mây Ngũ Sắc', text: 'Đánh bại 6 quái ở Thiên Cung.' },
      { t: 'boss', boss: 'culinh', title: 'Cự Linh Thần Xuất Trận', text: 'Đánh bại Cự Linh Thần giữa cầu Thiên Hà.' },
      { t: 'boss', boss: 'nata', title: 'Phong Hỏa Luân', text: 'Đánh bại Na Tra Tam Thái Tử trước cung điện.' },
      { t: 'boss', boss: 'nhilang', title: 'Hao Thiên Khuyển', text: 'Đánh bại Nhị Lang Thần tại Nam Thiên Môn.' },
      { t: 'talk', npc: 'nhulai', title: 'Ngũ Hành Sơn', text: 'Thỉnh Như Lai Phật Tổ hàng phục Hầu Vương.', dialog: 'Hầu Vương nhảy không ra khỏi lòng bàn tay ta. Ta đã lật tay hóa núi Ngũ Hành đè hắn xuống. Năm trăm năm sau sẽ có người đi thỉnh kinh cứu hắn. Ngươi hãy xuống Đông Thổ, chờ ngày Thánh tăng lên đường.' },
    ],
  },
  // =================================================================
  {
    id: 'ch2', name: 'Trường An · Song Xoa Lĩnh', sub: 'Hồi 8 – 15', theme: 'city', layout: ['B', false], lv: [6, 14],
    enc: { forms: ['hoyeu', 'langyeu', 'holy', 'thutinh', 'doiyeu', 'hachung'], humans: ['sontac', 'thuytac'] },
    npcs: [
      ['duongtang', 'Đường Tam Tạng', '🧘', { talk: 'A Di Đà Phật. Bần tăng phụng chỉ Đường Thái Tông, sang Tây Thiên thỉnh kinh.' }],
      ['quanam', 'Quan Âm Bồ Tát', '🙏', { talk: 'Đường đi vạn dặm, kiếp nạn trùng trùng. Thiện tai.' }],
      ['laoong', 'Lão Ông Bán Hạc', '👨‍🦳', { talk: 'Hồi trẻ ta từng cứu một con hạc trắng... Nếu gặp lại hạc tiên, ta muốn tạ ơn nó.', rumor: 'tienhac' }],
      ['duocsu2', 'Đại Phu Hồi Xuân', '👨‍⚕️', { role: 'heal' }],
      ['shop2', 'Chưởng Quầy Trường An', '🧑‍💼', { role: 'shop' }],
      ['casino', 'Sòng Bạc Phú Quý', '🎲', { role: 'casino', talk: 'Tài xỉu, oẳn tù tì – chơi cho vui thôi nhé!' }],
      B('dantuong'), B('tieubachlong'), B('luuhong'),
      ['nguhanh', 'Tôn Ngộ Không (Ngũ Hành Sơn)', '🐵', { look: 'ngokhong', talk: 'Ai đó? Có phải người đi thỉnh kinh không? Lão Tôn đợi năm trăm năm rồi!' }],
    ],
    steps: [
      { t: 'talk', npc: 'quanam', title: 'Kim Thiền bị đày', text: 'Nghe Quan Âm kể tiền kiếp của Đường Tăng.', dialog: 'Đường Tam Tạng vốn là Kim Thiền Tử, đệ tử thứ hai của Như Lai. Vì lơ là nghe giảng mà bị đày xuống trần, phải chịu đủ tám mươi mốt kiếp nạn mới thành chính quả. Đây là nạn thứ nhất.' },
      { t: 'talk', npc: 'duongtang', title: 'Mới sinh suýt bị giết', text: 'Nghe Đường Tăng kể thân thế.', dialog: 'Cha bần tăng là Trần Quang Nhị, đỗ trạng nguyên, trên đường nhậm chức bị tên lái đò Lưu Hồng đánh chết, cướp cả mẹ ta. Hắn từng muốn giết luôn đứa bé vừa chào đời…' },
      { t: 'kill', n: 6, title: 'Đầy tháng bị thả sông', text: 'Mẹ đặt con trên tấm ván thả trôi sông để tránh Lưu Hồng. Diệt 6 quái quanh bến sông.' },
      { t: 'boss', boss: 'luuhong', title: 'Tìm mẹ báo oán', text: 'Mười tám năm sau, Huyền Trang tìm được mẹ. Bắt tên thủy tặc Lưu Hồng.' },
      { t: 'kill', n: 7, title: 'Ra thành gặp hổ', text: 'Rời Trường An, đánh lui 7 hổ yêu lang yêu ngoài thành.' },
      { t: 'talk', npc: 'duongtang', title: 'Rơi hố mất tùy tùng', text: 'Hỏi thăm Đường Tăng sau khi sa xuống hố.', dialog: 'Vừa rời thành, thầy trò ta sa xuống hố sâu, hai tên tùy tùng bị yêu quái ăn thịt. May có Thái Bạch Kim Tinh cứu… Phía trước là Song Xoa Lĩnh, yêu hổ Dần Tướng Quân đang chiếm núi.' },
      { t: 'boss', boss: 'dantuong', title: 'Núi Song Xoa', text: 'Đánh bại Dần Tướng Quân ở Song Xoa Lĩnh.' },
      { t: 'talk', npc: 'nguhanh', title: 'Núi Lưỡng Giới', text: 'Gỡ bùa, giải thoát Tôn Ngộ Không khỏi Ngũ Hành Sơn.', dialog: 'Sư phụ! Lão Tôn bị Như Lai đè dưới núi này đã năm trăm năm. Xin gỡ tấm bùa trên đỉnh núi, đệ tử nguyện theo thầy sang Tây Thiên, một đường bảo vệ!' },
      { t: 'boss', boss: 'tieubachlong', title: 'Suối Ưng Sầu đổi ngựa', text: 'Thu phục Tiểu Bạch Long đã nuốt mất ngựa của Đường Tăng.' },
    ],
  },
  // =================================================================
  {
    id: 'quanamvien', name: 'Quan Âm Viện · Hoàng Phong Lĩnh', sub: 'Hồi 16 – 21', theme: 'forest', layout: ['C', true], lv: [12, 19],
    enc: { forms: ['hachung', 'hoyeu', 'truyeu', 'holy', 'thutinh', 'xatinh'], humans: ['sontac', 'tieuyeu'] },
    npcs: [
      ['kimtri', 'Lão Tăng Kim Trì', '👴', { look: 'kimtri', talk: 'Áo cà sa gấm của Thánh tăng đẹp quá… Cho lão xem thêm một đêm thôi, chỉ một đêm thôi…' }],
      HEAL('heal_qav', 'duocsu2'), SHOP('shop_qav', 'shop1'),
      B('hachhung'),
      ['caothai', 'Cao Thái Công', '👨‍🦳', { look: 'laoong', talk: 'Con rể lão ăn khỏe như heo, mặt mũi càng ngày càng giống heo… Hắn nhốt con gái lão trong hậu viện!' }],
      B('hoangphong'),
      ['linhcat', 'Linh Cát Bồ Tát', '🙏', { look: 'linhcat', talk: 'Định Phong Đan có thể chống gió Tam Muội.' }],
      B('batgioi'),
    ],
    steps: [
      { t: 'kill', n: 7, title: 'Đêm bị đốt', text: 'Lão tăng Kim Trì tham áo cà sa, nửa đêm phóng hỏa thiền viện. Diệt 7 yêu quái thừa lửa hôi của.' },
      { t: 'boss', boss: 'hachhung', title: 'Mất áo cà sa', text: 'Hắc Hùng Tinh núi Hắc Phong lấy mất áo cà sa trong đám cháy. Đoạt lại áo.' },
      { t: 'boss', boss: 'batgioi', title: 'Thu phục Bát Giới', text: 'Ở Cao Lão Trang, đánh bại "con rể heo" – Thiên Bồng Nguyên Soái bị đày – thu làm đồ đệ.' },
      { t: 'boss', boss: 'hoangphong', title: 'Hoàng Phong Quái cản đường', text: 'Hoàng Phong Quái thổi gió Tam Muội làm Ngộ Không đau mắt. Đánh lui hắn.' },
      { t: 'talk', npc: 'linhcat', title: 'Cầu Linh Cát Bồ Tát', text: 'Mời Linh Cát Bồ Tát thu phục Hoàng Phong Quái.', dialog: 'Hoàng Phong Quái vốn là con chồn vàng ăn vụng dầu đèn lưu ly ở Linh Sơn. Ta có Định Phong Đan và Phi Long Bảo Trượng, nay sẽ thu nó về.' },
    ],
  },
  // =================================================================
  {
    id: 'luusa', name: 'Lưu Sa Hà · Ngũ Trang Quán', sub: 'Hồi 22 – 26', theme: 'river', layout: ['A', true], lv: [16, 23],
    enc: { forms: ['thuyquai', 'xatinh', 'thiemthu', 'huyenquy', 'hautinh'], humans: ['thuytac'] },
    npcs: [
      HEAL('heal_ls', 'duocsu1'), B('satang'), SHOP('shop_ls', 'shop2'),
      ['thanhphong', 'Thanh Phong Đồng Tử', '🧒', { look: 'duocsu1', talk: 'Quả Nhân Sâm ba nghìn năm mới nở hoa, ba nghìn năm mới kết quả. Ăn một quả sống bốn vạn bảy nghìn năm đấy!' }],
      ['quanam_ls', 'Quan Âm Bồ Tát', '🙏', { look: 'quanam', talk: 'Cành dương liễu trong bình ngọc của ta có thể cứu sống vạn vật.' }],
      ['lesonlaomau', 'Lê Sơn Lão Mẫu', '👵', { look: 'laomau', talk: 'Thử thiền tâm thôi mà, ha ha!' }],
      B('tranguyen'),
    ],
    steps: [
      { t: 'kill', n: 7, title: 'Lưu Sa khó qua', text: 'Sông Lưu Sa rộng tám trăm dặm, lông ngỗng thả xuống cũng chìm. Diệt 7 thủy quái.' },
      { t: 'boss', boss: 'satang', title: 'Thu được Sa Tăng', text: 'Quyển Liêm Đại Tướng bị đày xuống sông Lưu Sa ăn thịt người. Đánh bại và thu làm đồ đệ.' },
      { t: 'talk', npc: 'lesonlaomau', title: 'Bốn Thánh hiển hóa', text: 'Gặp "bà mẹ góa" ở thôn vắng.', dialog: 'Ta cùng Quan Âm, Văn Thù, Phổ Hiền hóa thành mẹ con nhà giàu để thử lòng thiền. Bát Giới ham sắc nên bị treo cả đêm trên cây đấy, ha ha!' },
      { t: 'boss', boss: 'tranguyen', title: 'Ngũ Trang Quán', text: 'Ngộ Không quật đổ cây Nhân Sâm. Đại chiến Trấn Nguyên Đại Tiên.' },
      { t: 'talk', npc: 'quanam_ls', title: 'Cứu cây Nhân Sâm', text: 'Thỉnh Quan Âm hồi sinh cây Nhân Sâm.', dialog: 'Nước cam lộ trong bình ngọc của ta có thể làm cây Nhân Sâm sống lại. Từ nay Trấn Nguyên Tử và Ngộ Không kết làm huynh đệ, đừng oán hận nhau nữa.' },
    ],
  },
  // =================================================================
  {
    id: 'ch3', name: 'Bạch Hổ Lĩnh · Bảo Tượng Quốc', sub: 'Hồi 27 – 31', theme: 'forest', layout: ['C', false], lv: [20, 27],
    enc: { forms: ['bachcot', 'hautinh', 'xatinh', 'holy', 'truyeu', 'quyhoa', 'langyeu'], humans: ['tieuyeu'] },
    secret: { id: 'thuylien', x: 3, y: 3 },
    npcs: [
      ['laohau', 'Lão Hầu Thông Bối', '🐵', { talk: 'Đại Thánh bị sư phụ đuổi về Hoa Quả Sơn… Người ngồi trên thác Thủy Liêm buồn lắm. Lúc hoàng hôn hay ra sau thác ngồi một mình.', rumor: 'thuylien' }],
      ['duocsu3', 'Hầu Y Sư', '🙈', { role: 'heal' }],
      ['shop3', 'Hầu Thương', '🙉', { role: 'shop' }],
      B('bachcot'), B('hoangbao'), ['ngokhong3', 'Tôn Ngộ Không', '🐵', { look: 'ngokhong', talk: 'Hừ! Sư phụ không tin Lão Tôn… Nhưng nếu thầy gặp nạn, Lão Tôn sao bỏ mặc được.' }],
      ['dummy3', 'Tiều Phu', '🪓', { look: 'tieuphu', talk: 'Rừng Hắc Tùng âm u lắm, nhiều người vào rồi không ra được…' }],
      ['bachhoa', 'Công Chúa Bách Hoa Tu', '👸', { look: 'congchua', talk: 'Xin cứu ta…' }],
    ],
    steps: [
      { t: 'boss', boss: 'bachcot', title: 'Đuổi Tâm Viên', text: 'Ba lần đánh Bạch Cốt Tinh – nhưng Đường Tăng trách Ngộ Không giết người, đuổi về Hoa Quả Sơn.' },
      { t: 'kill', n: 8, title: 'Lạc nhau rừng Hắc Tùng', text: 'Thầy trò lạc nhau trong rừng Hắc Tùng. Diệt 8 yêu quái để tìm đường.' },
      { t: 'talk', npc: 'bachhoa', title: 'Đưa thư nước Bảo Tượng', text: 'Nhận thư của công chúa Bách Hoa Tu.', dialog: 'Ta là công chúa Bách Hoa Tu nước Bảo Tượng, bị Hoàng Bào Quái bắt về động mười ba năm. Xin Thánh tăng mang bức thư này về cho phụ vương!' },
      { t: 'boss', boss: 'hoangbao', title: 'Hóa hổ trên điện Kim Loan', text: 'Hoàng Bào Quái biến Đường Tăng thành hổ. Bát Giới lên Hoa Quả Sơn mời Ngộ Không về – cùng nhau đánh bại hắn.' },
    ],
  },
  // =================================================================
  {
    id: 'binhdinh', name: 'Bình Đỉnh Sơn · Ô Kê Quốc', sub: 'Hồi 32 – 39', theme: 'cave', layout: ['D', true], lv: [24, 31],
    enc: { forms: ['hoyeu', 'langyeu', 'suvuong', 'holy', 'hautinh', 'quyhoa'], humans: ['tieuyeu'] },
    npcs: [
      HEAL('heal_bd', 'duocsu4'), SHOP('shop_bd', 'shop4'),
      ['tieuphu', 'Tiều Phu Núi Bình Đỉnh', '🪓', { look: 'tieuphu', talk: 'Động Liên Hoa có hai ông vua Kim Giác, Ngân Giác. Nghe nói có hồ lô Tử Kim, gọi tên ai mà người đó dạ là bị hút vào!' }],
      ['vanthu', 'Văn Thù Bồ Tát', '🙏', { look: 'linhcat', talk: 'Con sư tử xanh của ta…' }],
      B('ngangiac'), B('kimgiac'), ['vuaoke', 'Hồn Vua Ô Kê', '👻', { look: 'vuaoke', talk: 'Lạnh quá… dưới giếng lạnh quá…' }],
      B('giavuong'),
    ],
    steps: [
      { t: 'boss', boss: 'ngangiac', title: 'Núi Bình Đỉnh gặp ma', text: 'Ngân Giác Đại Vương dùng núi đè Ngộ Không, bắt Đường Tăng. Đánh bại hắn.' },
      { t: 'boss', boss: 'kimgiac', title: 'Treo ở động Liên Hoa', text: 'Đường Tăng bị treo trong động Liên Hoa. Đánh bại Kim Giác, đoạt hồ lô Tử Kim.' },
      { t: 'talk', npc: 'vuaoke', title: 'Cứu vua nước Ô Kê', text: 'Nghe hồn vua Ô Kê báo mộng.', dialog: 'Trẫm là vua Ô Kê, bị một đạo sĩ đẩy xuống giếng ba năm trước. Hắn hóa thành trẫm ngồi trên ngai vàng! Xin Thánh tăng vớt xác trẫm lên và cứu lấy giang sơn.' },
      { t: 'boss', boss: 'giavuong', title: 'Bị ma hóa thân', text: 'Vạch mặt Giả Quốc Vương – thực ra là con sư tử lông xanh của Văn Thù Bồ Tát.' },
    ],
  },
  // =================================================================
  {
    id: 'hieuson', name: 'Hiệu Sơn · Hắc Hà', sub: 'Hồi 40 – 43', theme: 'cave', layout: ['B', true], lv: [28, 35],
    enc: { forms: ['viemthu', 'hoyeu', 'truyeu', 'thuyquai', 'doiyeu'], humans: ['hoayeu'] },
    npcs: [
      ['sonthan', 'Sơn Thần Hiệu Sơn', '🧙', { look: 'thodia', talk: 'Bọn tiểu thần bị Hồng Hài Nhi bắt đi trực đêm, khổ không kể xiết…' }],
      ['dan_hh', 'Ngư Phủ Hắc Hà', '🎣', { look: 'tieuphu', talk: 'Sông Hắc Hà nước đen như mực, có yêu long đội lốt người lái đò…' }],
      ['bachlong_hh', 'Thái Tử Ma Ngang', '🐲', { look: 'nhilang', talk: 'Đà Long là em họ ta. Ta sẽ bắt nó về chịu tội.' }],
      HEAL('heal_hs', 'duocsu2'), SHOP('shop_hs', 'shop2'),
      B('honghai'), ['quanam_hs', 'Quan Âm Bồ Tát', '🙏', { look: 'quanam', talk: 'Thiện tai.' }],
      ['dummy_hs', 'Đứa Bé Treo Trên Cây', '🧒', { look: 'honghai', talk: 'Cứu… cứu cháu với…' }],
      B('dalong'),
    ],
    steps: [
      { t: 'kill', n: 8, title: 'Núi Hiệu gặp yêu', text: 'Yêu khí ngút trời trên núi Hiệu. Diệt 8 yêu quái.' },
      { t: 'talk', npc: 'sonthan', title: 'Gió cuốn Thánh tăng', text: 'Hỏi Sơn thần về yêu quái núi Hiệu.', dialog: 'Thánh Anh Đại Vương Hồng Hài Nhi là con Ngưu Ma Vương, luyện được Tam Muội Chân Hỏa. Hắn hóa thành đứa bé treo trên cây lừa Đường Tăng rồi cuốn đi mất!' },
      { t: 'boss', boss: 'honghai', title: 'Tâm Viên bị hại', text: 'Tam Muội Chân Hỏa thiêu Ngộ Không suýt chết. Đánh bại Hồng Hài Nhi.' },
      { t: 'talk', npc: 'quanam_hs', title: 'Mời thánh hàng yêu', text: 'Thỉnh Quan Âm thu phục Hồng Hài Nhi.', dialog: 'Đứa trẻ này có căn cơ. Ta dùng đài sen thiên cương trói lại, nhận nó làm Thiện Tài Đồng Tử theo hầu ta.' },
      { t: 'boss', boss: 'dalong', title: 'Chìm sông Hắc Hà', text: 'Yêu long Đà Long – cháu Tây Hải Long Vương – dìm thuyền bắt Đường Tăng.' },
    ],
  },
  // =================================================================
  {
    id: 'xatri', name: 'Xa Trì Quốc', sub: 'Hồi 44 – 47', theme: 'desert', layout: ['D', true], lv: [32, 39],
    enc: { forms: ['hoyeu', 'longma', 'kimbang', 'hatinh', 'nhentinh'], humans: ['daodong'] },
    npcs: [
      HEAL('heal_xt', 'duocsu4'), SHOP('shop_xt', 'shop4'),
      ['tangnhan', 'Tăng Nhân Khổ Sai', '🧑‍🦲', { look: 'tangnhan', talk: 'Năm trăm tăng nhân chúng tôi bị bắt kéo xe gạch cho đạo quán… Chết đi sống lại không biết bao lần.' }],
      ['vuaxatri', 'Vua Xa Trì', '🤴', { look: 'vua', talk: 'Ba vị Quốc sư cầu được mưa, trẫm tin đạo bỏ Phật đã hai mươi năm…' }],
      B('holuc'), ['dummy_xt', 'Đạo Đồng', '🧑', { look: 'daodong', talk: 'Quốc sư đang lập đàn, không phận sự miễn vào!' }],
      B('duongluc'),
    ],
    steps: [
      { t: 'kill', n: 8, title: 'Khuân vác ở Xa Trì', text: 'Tăng nhân Xa Trì bị bắt làm khổ sai. Đánh bại 8 tên đạo đồng canh giữ.' },
      { t: 'boss', boss: 'holuc', title: 'Đánh cuộc thắng thua', text: 'Thi cầu mưa, ngồi thiền, đoán vật… Hổ Lực Đại Tiên thua cuộc liền hiện nguyên hình.' },
      { t: 'boss', boss: 'duongluc', title: 'Diệt đạo hưng tăng', text: 'Đánh bại Lộc Lực và Dương Lực Đại Tiên, giải oan cho tăng nhân.' },
    ],
  },
  // =================================================================
  {
    id: 'thongthien', name: 'Thông Thiên Hà · Kim Đâu Sơn', sub: 'Hồi 47 – 52', theme: 'snow', layout: ['A', false], lv: [36, 43],
    enc: { forms: ['thuyquai', 'huyenquy', 'thiemthu', 'nguuma', 'kylan', 'xatinh'], humans: ['thuytac'] },
    npcs: [
      ['tranlao', 'Trần Lão Gia', '👴', { look: 'laoong', talk: 'Năm nay đến lượt cháu nhà lão phải nộp cho Đại Vương…' }],
      ['dan_tt', 'Dân Làng Trần Gia', '🧑', { look: 'tieuphu', talk: 'Mặt sông đóng băng rồi! Thương nhân đi qua được rồi!' }],
      HEAL('heal_tt', 'duocsu1'), SHOP('shop_tt', 'shop1'),
      ['laoquan', 'Thái Thượng Lão Quân', '🧙‍♂️', { look: 'laoquan', talk: 'Trâu xanh của lão phu đâu rồi?' }],
      ['quanam_tt', 'Quan Âm Giỏ Cá', '🙏', { look: 'quanam', talk: 'Ta chưa kịp chải đầu đã vội đến đây.' }],
      B('docgiac'),
      ['dummy_tt', 'Thổ Địa Kim Đâu', '🧙', { look: 'thodia', talk: 'Vòng Kim Cương ấy thu được cả binh khí của Na Tra, Lý Thiên Vương…' }],
      B('linhcam'),
    ],
    steps: [
      { t: 'talk', npc: 'tranlao', title: 'Gặp nước lớn', text: 'Nghe Trần Lão Gia kể về sông Thông Thiên.', dialog: 'Sông Thông Thiên rộng tám trăm dặm. Mỗi năm Linh Cảm Đại Vương đòi làng ta nộp một đồng nam, một đồng nữ. Năm nay đến lượt cháu nhà lão… Ngộ Không và Bát Giới bèn hóa thành hai đứa trẻ.' },
      { t: 'boss', boss: 'linhcam', title: 'Rơi xuống sông Thiên Hà', text: 'Linh Cảm Đại Vương đóng băng mặt sông, lừa thầy trò đi qua rồi kéo Đường Tăng xuống đáy.' },
      { t: 'talk', npc: 'quanam_tt', title: 'Quan Âm giỏ cá hiện thân', text: 'Thỉnh Quan Âm thu phục Linh Cảm Đại Vương.', dialog: 'Con cá vàng trong ao sen của ta nghe kinh lâu ngày thành tinh, lén xuống trần làm yêu. Ta đan giỏ trúc thu nó về rồi.' },
      { t: 'kill', n: 8, title: 'Núi Kim Đâu gặp yêu', text: 'Ngộ Không vẽ vòng tròn bảo vệ, nhưng thầy trò lại bước ra ngoài. Diệt 8 yêu quái núi Kim Đâu.' },
      { t: 'boss', boss: 'docgiac', title: 'Thiên thần khó phục', text: 'Độc Giác Hủy Đại Vương có vòng Kim Cương thu hết binh khí thiên binh thiên tướng.' },
      { t: 'talk', npc: 'laoquan', title: 'Hỏi Phật căn nguyên', text: 'Như Lai chỉ đường: tìm Thái Thượng Lão Quân.', dialog: 'Thì ra là con trâu xanh của lão phu! Đồng tử ngủ quên để nó trốn mất, còn trộm cả vòng Kim Cương. Để ta dắt nó về Đâu Suất Cung.' },
    ],
  },
  // =================================================================
  {
    id: 'nunhi', name: 'Tây Lương Nữ Quốc', sub: 'Hồi 53 – 58', theme: 'city', layout: ['B', true], lv: [40, 47],
    enc: { forms: ['hatinh', 'nhentinh', 'holy', 'khongtuoc', 'thongoc', 'hautinh'], humans: ['tieuyeu'] },
    npcs: [
      ['nuquan', 'Nữ Quan Tây Lương', '👩', { look: 'nuquan', talk: 'Nước ta từ xưa không có nam nhân. Thấy đàn ông là mừng lắm!' }],
      ['dummy_nn', 'Thương Nhân Nữ Quốc', '👩‍💼', { look: 'nuquan', talk: 'Son phấn, lụa là, mua đi khách quan!' }],
      ['baba', 'Bà Lão Bên Sông', '👵', { look: 'laomau', talk: 'Ai bảo các người uống nước sông Tử Mẫu!' }],
      HEAL('heal_nn', 'duocsu2'), SHOP('shop_nn', 'shop2'),
      ['nuvuong', 'Nữ Vương Tây Lương', '👸', { look: 'nuvuong', talk: 'Ngự đệ…' }],
      B('lucnhi'), ['duongtang_nn', 'Đường Tam Tạng', '🧘', { look: 'duongtang', talk: 'A Di Đà Phật…' }],
      B('bocap'),
    ],
    steps: [
      { t: 'talk', npc: 'baba', title: 'Uống nước bị độc', text: 'Hỏi bà lão vì sao Đường Tăng và Bát Giới đau bụng.', dialog: 'Uống nước sông Tử Mẫu là có thai đấy! Muốn giải phải lấy nước suối Lạc Thai ở động Giải Dương, mà Như Ý Chân Tiên canh giữ… May Ngộ Không đã lấy được rồi.' },
      { t: 'talk', npc: 'nuvuong', title: 'Tây Lương giữ cưới', text: 'Diện kiến Nữ Vương Tây Lương.', dialog: 'Nước Tây Lương toàn nữ nhân. Trẫm nguyện dâng cả ngai vàng, chỉ mong ngự đệ ở lại làm phu quân… Thôi được, trẫm đóng ấn văn điệp cho ngự đệ đi.' },
      { t: 'boss', boss: 'bocap', title: 'Chịu khổ động Tỳ Bà', text: 'Bò Cạp Tinh có ngòi độc Đảo Mã, chích cả Như Lai. Phải mời Mão Nhật Tinh Quan hóa gà trống.' },
      { t: 'talk', npc: 'duongtang_nn', title: 'Lại đuổi Tâm Viên', text: 'Nghe Đường Tăng kể chuyện.', dialog: 'Ngộ Không lại đánh chết bọn cường đạo… Bần tăng đã đuổi nó đi. Nhưng sao lúc nãy nó quay lại đánh bần tăng ngất đi, còn cướp cả hành lý?' },
      { t: 'boss', boss: 'lucnhi', title: 'Khó phân biệt Mỹ Hầu', text: 'Có hai Ngộ Không giống hệt nhau! Đến Như Lai mới nhận ra Lục Nhĩ Mỹ Hầu. Đánh bại kẻ giả mạo.' },
    ],
  },
  // =================================================================
  {
    id: 'ch4', name: 'Hỏa Diệm Sơn · Tế Tái Quốc', sub: 'Hồi 59 – 64', theme: 'desert', layout: ['D', false], lv: [44, 51],
    enc: { forms: ['viemthu', 'nguuma', 'hatinh', 'suvuong', 'phuong', 'kimbang'], humans: ['hoayeu'] },
    npcs: [
      ['laonhan', 'Lão Nhân Hỏa Diệm Sơn', '🧓', { talk: 'Hỏa Diệm Sơn tám trăm dặm lửa cháy, không quạt Ba Tiêu thì chẳng ai qua nổi.' }],
      ['thodia', 'Thổ Địa', '🧙', { talk: 'Ta là Thổ Địa vùng này...', secretTalk: true }],
      ['duocsu4', 'Tăng Y Tây Vực', '👳', { role: 'heal' }],
      ['shop4', 'Thương Đội Hồ', '🐫', { role: 'shop' }],
      B('thietphien'), B('nguuma'), B('cuudau'), ['hanhtien', 'Hạnh Tiên', '🌸', { look: 'hanhtien', talk: 'Thánh tăng xướng một bài thơ đi mà…' }],
      ['tangtap', 'Tăng Chùa Kim Quang', '🧑‍🦲', { look: 'tangnhan', talk: 'Xá lợi trên tháp bị trộm, vua nước Tế Tái đổ tội cho chúng tôi…' }],
    ],
    steps: [
      { t: 'talk', npc: 'laonhan', title: 'Hỏa Diệm Sơn cản đường', text: 'Hỏi đường Lão Nhân Hỏa Diệm Sơn.', dialog: 'Muốn qua núi lửa phải mượn quạt Ba Tiêu của Thiết Phiến Công Chúa ở động Ba Tiêu, núi Thúy Vân. Nhưng nàng còn giận chuyện con trai Hồng Hài Nhi bị Quan Âm thu mất!' },
      { t: 'boss', boss: 'thietphien', title: 'Xin quạt Ba Tiêu', text: 'Ba lần mượn quạt. Ngộ Không hóa sâu chui vào bụng Thiết Phiến Công Chúa.' },
      { t: 'boss', boss: 'nguuma', title: 'Trói Ma Vương', text: 'Đại chiến Ngưu Ma Vương, thiên binh Phật tướng vây bắt, trói hắn lại.' },
      { t: 'kill', n: 8, title: 'Quét tháp thành Tế Tái', text: 'Xá lợi tháp chùa Kim Quang bị trộm. Diệt 8 yêu quái quanh tháp.' },
      { t: 'boss', boss: 'cuudau', title: 'Lấy bảo cứu tăng', text: 'Cửu Đầu Phò Mã – con chim chín đầu – giấu xá lợi ở đáy hồ Bích Ba.' },
      { t: 'talk', npc: 'hanhtien', title: 'Ngâm thơ rừng Kinh Cức', text: 'Lạc vào Mộc Tiên Am giữa rừng gai tám trăm dặm.', dialog: 'Chúng ta là mộc tinh thích làm thơ – Thập Bát Công, Cô Trực Công… còn ta là Hạnh Tiên. Thánh tăng ở lại xướng họa với ta có được không? …Đáng tiếc, Bát Giới đã cào đổ hết rồi.' },
    ],
  },
  // =================================================================
  {
    id: 'tieuloiam', name: 'Tiểu Lôi Âm · Chu Tử Quốc', sub: 'Hồi 65 – 71', theme: 'heaven', layout: ['C', true], lv: [48, 55],
    enc: { forms: ['xatinh', 'hautinh', 'quyhoa', 'kimbang', 'thanhlong', 'battuong'], humans: ['tieuyeu'] },
    npcs: [
      ['tangtl', 'Tiểu Hòa Thượng', '🧑‍🦲', { look: 'tangnhan', talk: 'Chùa phía trước cũng có tên Lôi Âm… Lạ thật, chưa đến Tây Thiên mà?' }],
      HEAL('heal_tl', 'duocsu1'), SHOP('shop_tl', 'shop1'),
      B('hoangmi'), B('manxa'), B('kimmao'),
      ['vuachutu', 'Vua Chu Tử', '🤴', { look: 'vua', talk: 'Hoàng hậu của trẫm…' }],
      ['dummy_tl', 'Dân Làng Đà La', '🧑', { look: 'tieuphu', talk: 'Ngõ Hy Thị tám trăm dặm toàn hồng thối, hôi không chịu nổi!' }],
    ],
    steps: [
      { t: 'boss', boss: 'hoangmi', title: 'Gặp nạn Tiểu Lôi Âm', text: 'Hoàng Mi Đại Vương giả làm Phật Tổ ở chùa Tiểu Lôi Âm, dùng não bạt vàng nhốt Ngộ Không.' },
      { t: 'kill', n: 8, title: 'Chư thần bị khốn', text: 'Nhị Thập Bát Tú, Thủy thần… đều bị túi vải của Hoàng Mi thu mất. Diệt 8 yêu quái giải cứu.' },
      { t: 'boss', boss: 'manxa', title: 'Ngõ Hy Thị bẩn cản', text: 'Hồng Lân Đại Mãng quấy phá làng Đà La. Bát Giới hóa heo khổng lồ ủi đường.' },
      { t: 'talk', npc: 'vuachutu', title: 'Chữa bệnh nước Chu Tử', text: 'Ngộ Không bắt mạch cho vua Chu Tử.', dialog: 'Hoàng hậu Kim Thánh của trẫm bị Trại Thái Tuế bắt đi ba năm, trẫm thương nhớ sinh bệnh. Viên Ô Kim Đan của trưởng lão quả thần diệu – trẫm đã khỏi rồi!' },
      { t: 'kill', n: 7, title: 'Cứu người bệnh', text: 'Thu thập dược liệu: diệt 7 yêu quái giữ thuốc.' },
      { t: 'boss', boss: 'kimmao', title: 'Hàng yêu cứu Hoàng hậu', text: 'Trại Thái Tuế – con Kim Mao Hống của Quan Âm – có ba chuông vàng phun lửa, khói, cát.' },
    ],
  },
  // =================================================================
  {
    id: 'sudalinh', name: 'Bàn Ti Động · Sư Đà Lĩnh', sub: 'Hồi 72 – 77', theme: 'cave', layout: ['D', true], lv: [52, 60],
    enc: { forms: ['nhentinh', 'suvuong', 'battuong', 'kimbang', 'phuong', 'hatinh'], humans: ['tieuyeu'] },
    npcs: [
      HEAL('heal_sd', 'duocsu4'), SHOP('shop_sd', 'shop4'),
      ['thaibach_sd', 'Thái Bạch Kim Tinh', '🧙‍♂️', { look: 'thaibach', talk: 'Sư Đà Lĩnh có ba ma vương, bốn vạn tiểu yêu. Cẩn thận!' }],
      ['lesonsd', 'Lê Sơn Lão Mẫu', '👵', { look: 'laomau', talk: 'Bách Nhãn Ma Quân sợ kim thêu của Tỳ Lam Bồ Tát.' }],
      B('nhentinh'), B('thanhsu'), B('bachtuong'), B('daibang'),
      ['dummy_sd', 'Tiểu Yêu Tuần Núi', '👹', { look: 'tieuyeu', talk: 'Đại Vương có lệnh: ai thấy hòa thượng thì báo ngay!' }],
      ['dummy_sd2', 'Tiều Phu', '🪓', { look: 'tieuphu', talk: 'Thành Sư Đà toàn là yêu quái, người ăn thịt người…' }],
      ['nhulai_sd', 'Như Lai Phật Tổ', '🧘', { look: 'nhulai', talk: 'Đại Bàng Kim Sí là cậu của ta… Ta sẽ thu phục nó.' }],
      B('bachnhan'),
    ],
    steps: [
      { t: 'boss', boss: 'nhentinh', title: 'Bảy tình mê hoặc', text: 'Bảy Nhện Tinh động Bàn Ti nhả tơ trói Đường Tăng.' },
      { t: 'boss', boss: 'bachnhan', title: 'Bị thương bởi Đa Mục', text: 'Bách Nhãn Ma Quân (rết tinh) có nghìn mắt phát kim quang. Nhờ kim thêu của Tỳ Lam Bồ Tát phá được.' },
      { t: 'kill', n: 9, title: 'Sư Đà cản đường', text: 'Bốn vạn tiểu yêu chặn đường Sư Đà Lĩnh. Diệt 9 tên.' },
      { t: 'boss', boss: 'thanhsu', title: 'Yêu chia ba màu', text: 'Thanh Sư Vương há miệng nuốt cả mười vạn thiên binh.' },
      { t: 'boss', boss: 'bachtuong', title: 'Gặp nạn trong thành', text: 'Bạch Tượng Vương dùng vòi cuốn Ngộ Không.' },
      { t: 'boss', boss: 'daibang', title: 'Mời Phật thu ma', text: 'Đại Bàng Kim Sí một cánh bay chín vạn dặm. Như Lai đích thân thu phục.' },
    ],
  },
  // =================================================================
  {
    id: 'vodedong', name: 'Tỳ Khâu Quốc · Vô Để Động', sub: 'Hồi 78 – 86', theme: 'cave', layout: ['B', false], lv: [58, 65],
    enc: { forms: ['thutinh', 'langyeu', 'hoyeu', 'quyhoa', 'kylan', 'doiyeu'], humans: ['daodong'] },
    npcs: [
      ['dichtram', 'Quan Dịch Trạm', '🧑‍💼', { look: 'shop1', talk: 'Thành này giờ gọi là Tiểu Nhi Thành… dân chúng ai cũng giấu con.' }],
      ['thotinh', 'Nam Cực Thọ Tinh', '👴', { look: 'thaibach', talk: 'Con hươu trắng của lão phu…' }],
      ['dan_vd', 'Dân Tỳ Khâu', '👨', { look: 'tieuphu', talk: 'Trả con cho chúng tôi!' }],
      HEAL('heal_vd', 'duocsu2'), SHOP('shop_vd', 'shop2'),
      B('quoctruong'), B('chuottinh'),
      ['dummy_vd', 'Tiểu Hòa Thượng Trấn Hải', '🧑‍🦲', { look: 'tangnhan', talk: 'Mỗi đêm chùa lại mất một sư huynh…' }],
      ['duongtang_vd', 'Đường Tam Tạng', '🧘', { look: 'duongtang', talk: 'Khụ khụ…' }],
      ['dancu', 'Cư Dân Diệt Pháp', '🧑', { look: 'tieuphu', talk: 'Vua thề giết đủ một vạn hòa thượng, còn thiếu bốn người…' }],
      B('baotinh'),
      ['thieunu', 'Thiếu Nữ Trong Rừng', '👧', { look: 'thieunu', talk: 'Cứu tiểu nữ với…' }],
    ],
    steps: [
      { t: 'talk', npc: 'dan_vd', title: 'Cứu trẻ nước Tỳ Khâu', text: 'Nghe dân Tỳ Khâu kể nỗi oan.', dialog: 'Quốc trượng bảo nhà vua phải lấy tim một nghìn một trăm mười một đứa trẻ làm thuốc dẫn. Trẻ con cả thành bị nhốt trong lồng ngỗng trước cửa nhà! Ngộ Không đã nhờ thần núi giấu lồng đi rồi.' },
      { t: 'boss', boss: 'quoctruong', title: 'Phân biệt chân tà', text: 'Quốc trượng đòi tim Đường Tăng. Vạch mặt hắn – con hươu trắng của Nam Cực Thọ Tinh.' },
      { t: 'talk', npc: 'thieunu', title: 'Cứu yêu rừng thông', text: 'Gặp thiếu nữ bị trói trong rừng thông.', dialog: 'Thánh tăng ơi, tiểu nữ bị cường đạo trói ở đây đã mấy ngày… (Ngộ Không: "Sư phụ, đó là yêu tinh!" – nhưng Đường Tăng vẫn cởi trói cho nàng.)' },
      { t: 'talk', npc: 'duongtang_vd', title: 'Nằm bệnh trong tăng phòng', text: 'Thăm Đường Tăng ốm ở chùa Trấn Hải.', dialog: 'Bần tăng nhiễm phong hàn ba ngày… Trong chùa này mỗi đêm lại mất một hòa thượng. Ngộ Không bảo cô gái hôm nọ chính là yêu tinh.' },
      { t: 'boss', boss: 'chuottinh', title: 'Bị khốn động Vô Để', text: 'Địa Dũng Phu Nhân (chuột mũi vàng lông trắng) bắt Đường Tăng xuống động không đáy đòi thành thân.' },
      { t: 'kill', n: 9, title: 'Nước Diệt Pháp khó đi', text: 'Vua Diệt Pháp thề giết một vạn hòa thượng. Thầy trò cải trang qua thành – dẹp 9 kẻ truy sát.' },
      { t: 'boss', boss: 'baotinh', title: 'Núi Ẩn Vụ gặp ma', text: 'Nam Sơn Đại Vương (báo tinh) dùng kế "hoa mai rụng" bắt Đường Tăng.' },
    ],
  },
  // =================================================================
  {
    id: 'thientruc', name: 'Thiên Trúc · Linh Sơn', sub: 'Hồi 87 – 100', theme: 'heaven', layout: ['A', true], lv: [62, 70],
    enc: { forms: ['suvuong', 'thongoc', 'kylan', 'thanhlong', 'phuong', 'battuong'], humans: ['thienbinh'] },
    npcs: [
      HEAL('heal_tc', 'duocsu1'), ['thaithu', 'Thái Thú Phượng Tiên', '🧑‍⚖️', { look: 'quan', talk: 'Ba năm không mưa…' }], SHOP('shop_tc', 'shop1'),
      ['dummy_tc', 'Tăng Nhân Linh Sơn', '🧑‍🦲', { look: 'tangnhan', talk: 'Linh Sơn đã ở ngay trước mắt!' }],
      ['nhulai_tc', 'Như Lai Phật Tổ', '🧘', { look: 'nhulai', talk: 'Thiện tai.' }],
      B('teguu'), ['tiepdan', 'Tiếp Dẫn Phật Tổ', '🙏', { look: 'tiepdan', talk: 'Thuyền không đáy, mời Thánh tăng lên.' }],
      B('laongoan'), B('hoangsu'),
      ['khau', 'Khấu Viên Ngoại', '👴', { look: 'khau', talk: 'Lão nguyện trai tăng một vạn vị…' }],
      B('cuulinh'), B('ngoctho'),
    ],
    steps: [
      { t: 'talk', npc: 'thaithu', title: 'Cầu mưa quận Phượng Tiên', text: 'Gặp Thái thú quận Phượng Tiên.', dialog: 'Hạ quan lỡ hất đổ mâm cỗ cúng trời cho chó ăn, Ngọc Đế phạt quận này ba năm không mưa… Nhờ Thánh tăng khuyên dân hướng thiện, trời đã đổ mưa rồi!' },
      { t: 'kill', n: 9, title: 'Mất binh khí', text: 'Gậy, đinh ba, bảo trượng của ba đồ đệ bị trộm ở nước Ngọc Hoa. Đuổi theo 9 yêu quái.' },
      { t: 'boss', boss: 'hoangsu', title: 'Hội Đinh Ba', text: 'Hoàng Sư Tinh trộm binh khí, mở "Hội Đinh Ba" ăn mừng. Đánh bại hắn.' },
      { t: 'boss', boss: 'cuulinh', title: 'Gặp nạn núi Trúc Tiết', text: 'Cửu Linh Nguyên Thánh – sư tử chín đầu của Thái Ất Thiên Tôn – ngậm bắt cả thầy trò.' },
      { t: 'kill', n: 9, title: 'Chịu khổ động Huyền Anh', text: 'Ba tê ngưu tinh giả làm Phật ăn dầu đèn. Diệt 9 yêu quái động Huyền Anh.' },
      { t: 'boss', boss: 'teguu', title: 'Đuổi bắt tê ngưu', text: 'Đuổi theo Tích Hàn Đại Vương ra tận Tây Dương Đại Hải.' },
      { t: 'boss', boss: 'ngoctho', title: 'Thiên Trúc kén rể', text: 'Ngọc Thố Tinh giả công chúa Thiên Trúc tung tú cầu kén Đường Tăng làm phò mã.' },
      { t: 'talk', npc: 'khau', title: 'Bị giam phủ Đồng Đài', text: 'Gặp lại Khấu Viên Ngoại.', dialog: 'Lão trai tăng đủ một vạn vị… Ai ngờ cường đạo giết lão, vợ lão lại vu cho Thánh tăng, khiến thầy trò bị giam phủ Đồng Đài. Nay Ngộ Không đã xuống âm phủ đòi hồn cho lão sống lại!' },
      { t: 'talk', npc: 'tiepdan', title: 'Thoát xác bến Lăng Vân', text: 'Lên thuyền không đáy của Tiếp Dẫn Phật Tổ.', dialog: 'Thuyền không đáy của ta đưa người qua bến Lăng Vân. Kìa, xác phàm của Thánh tăng đang trôi trên sông – từ nay thầy trò đã thoát thai hoán cốt.' },
      { t: 'boss', boss: 'laongoan', title: 'Thông Thiên Hà ướt kinh', text: 'Mang kinh về, lão Ngoan giận Đường Tăng quên lời nhờ hỏi Phật, lật mình cho kinh rơi xuống sông. Nạn thứ tám mươi mốt!' },
    ],
    finale: true,
  },
];

// =====================================================================
//  TÁCH BẢN ĐỒ (bản 3): 15 chương cũ → 29 bản đồ, mỗi địa danh một chỗ.
//  Giữ nguyên tên và thứ tự 137 nhiệm vụ; chỉ chia lại nhiệm vụ theo bản đồ.
//  part: [mã, tên, phụ đề, theme, phông trận, [bố cục, lật], [bước từ, đến), npcs]
//  npcs: chuỗi = lấy NPC cùng mã của chương cũ (hoặc chương bất kỳ); mảng = NPC mới.
//  NPC có thể mang `art` (tranh riêng) khác `look` (hình vẽ code dự phòng).
// =====================================================================
const N = (id, name, icon, o) => [id, name, icon, o || {}];
const SPLIT = {
  ch1: [['ch1', 'Thiên Cung', 'Tiền truyện · Đại Náo Thiên Cung', 'heaven', 'heaven', ['A', false], [0, 6], null]],
  ch2: [
    ['truongan', 'Trường An', 'Hồi 8 – 12', 'city', 'village', ['B', false], [0, 5], ['duongtang', 'quanam', 'laoong', 'duocsu2', 'shop2', 'casino', 'luuhong']],
    ['ngusonhanh', 'Song Xoa Lĩnh · Ngũ Hành Sơn', 'Hồi 13 – 15', 'forest', 'mountain', ['C', false], [5, 9], ['duongtang', HEAL('heal_ns', 'duocsu4'), SHOP('shop_ns', 'shop4'), 'dantuong', 'nguhanh', 'tieubachlong',
      N('thaibach_ns', 'Thái Bạch Kim Tinh', '🧙‍♂️', { look: 'thaibach', talk: 'Hố sâu này do yêu hổ đào sẵn. Ta hoá thành ông lão dắt thầy trò ra đây. Đi tiếp về phía tây sẽ gặp người cần gặp.' })]],
  ],
  quanamvien: [
    ['quanamvien', 'Quan Âm Viện · Hắc Phong Sơn', 'Hồi 16 – 17', 'forest', 'temple', ['C', true], [0, 2], ['kimtri', 'heal_qav', 'shop_qav', 'hachhung',
      N('tieutang', 'Tiểu Sa Di', '🧑', { look: 'duocsu1', art: 'tieutang', talk: 'Sư cụ Kim Trì sưu tầm bảy tám trăm tấm cà sa rồi mà vẫn chưa thấy đủ…' })]],
    ['caolao', 'Cao Lão Trang · Hoàng Phong Lĩnh', 'Hồi 18 – 21', 'forest', 'village', ['D', false], [2, 5], [N('caothai', 'Cao Thái Công', '👨‍🦳', { look: 'laoong', art: 'caothai', talk: 'Con rể lão ăn khoẻ như heo, mặt mũi càng ngày càng giống heo… Hắn nhốt con gái lão trong hậu viện!' }),
      HEAL('heal_cl', 'duocsu4'), SHOP('shop_cl', 'shop4'), 'batgioi', 'hoangphong', 'linhcat']],
  ],
  luusa: [
    ['luusa', 'Lưu Sa Hà', 'Hồi 22', 'river', 'sandriver', ['A', true], [0, 2], ['heal_ls', 'satang', 'shop_ls',
      N('laodo', 'Lão Lái Đò', '🚣', { look: 'laoong', art: 'laodo', talk: 'Sông Lưu Sa rộng tám trăm dặm, lông ngỗng thả xuống cũng chìm. Già này chở khách cả đời, chưa thuyền nào sang được bờ tây.' })]],
    ['ngutrang', 'Tứ Thánh Trang · Ngũ Trang Quán', 'Hồi 23 – 26', 'forest', 'temple', ['B', true], [2, 5], ['lesonlaomau',
      N('thanhphong', 'Thanh Phong', '🧒', { look: 'duocsu1', art: 'thanhphong', talk: 'Quả Nhân Sâm ba nghìn năm mới nở hoa, ba nghìn năm mới kết quả. Ăn một quả sống bốn vạn bảy nghìn năm đấy!' }),
      N('minhnguyet', 'Minh Nguyệt', '🧒', { look: 'duocsu1', art: 'minhnguyet', talk: 'Sư phụ dặn tiếp đãi Đường Tăng tử tế… nhưng hai con khỉ, heo kia thì phải canh chừng.' }),
      'tranguyen', 'quanam_ls', HEAL('heal_ngt', 'duocsu1'), SHOP('shop_ngt', 'shop1')]],
  ],
  ch3: [
    ['bachho', 'Bạch Hổ Lĩnh', 'Hồi 27 – 28', 'forest', 'mountain', ['C', false], [0, 2], ['laohau', 'duocsu3', 'shop3', 'bachcot', 'dummy3'], { secret: true }],
    ['baotuong', 'Động Ba Nguyệt · Bảo Tượng Quốc', 'Hồi 28 – 31', 'city', 'palace', ['B', false], [2, 4], ['bachhoa', 'hoangbao', 'ngokhong3', HEAL('heal_bt', 'duocsu2'), SHOP('shop_bt', 'shop2')]],
  ],
  binhdinh: [
    ['binhdinh', 'Bình Đỉnh Sơn · Liên Hoa Động', 'Hồi 32 – 35', 'cave', 'cave', ['D', true], [0, 2], ['heal_bd', 'shop_bd', 'tieuphu', 'ngangiac', 'kimgiac',
      N('laoquan_bd', 'Thái Thượng Lão Quân', '🧓', { look: 'laoquan', talk: 'Hai đồng tử giữ lò vàng lò bạc của ta trộm bảo bối xuống trần. Hồ lô, tịnh bình, quạt Ba Tiêu… đều là đồ của lão cả.' })]],
    ['oke', 'Bảo Lâm Tự · Ô Kê Quốc', 'Hồi 36 – 39', 'city', 'palace', ['A', false], [2, 4], ['vuaoke', 'vanthu', 'giavuong', HEAL('heal_ok', 'duocsu2'), SHOP('shop_ok', 'shop2')]],
  ],
  hieuson: [['hieuson', 'Hiệu Sơn · Hắc Thủy Hà', 'Hồi 40 – 43', 'cave', 'cave', ['B', true], [0, 5], null]],
  xatri: [['xatri', 'Xa Trì Quốc', 'Hồi 44 – 46', 'desert', 'desert', ['D', true], [0, 3], null]],
  thongthien: [
    ['thongthien', 'Trần Gia Trang · Thông Thiên Hà', 'Hồi 47 – 49', 'snow', 'frozenriver', ['A', false], [0, 3], ['tranlao', 'dan_tt', 'heal_tt', 'shop_tt', 'quanam_tt', 'linhcam']],
    ['kimdau', 'Kim Đâu Sơn', 'Hồi 50 – 52', 'snow', 'frozenriver', ['C', true], [3, 6], ['docgiac', 'laoquan', 'dummy_tt', HEAL('heal_kd', 'duocsu1'), SHOP('shop_kd', 'shop1')]],
  ],
  nunhi: [
    ['nunhi', 'Tây Lương Nữ Quốc', 'Hồi 53 – 54', 'city', 'palace', ['B', true], [0, 2], ['nuquan', 'dummy_nn', 'baba', 'heal_nn', 'shop_nn', 'nuvuong']],
    ['docdich', 'Độc Địch Sơn · Thủy Liêm Động', 'Hồi 55 – 58', 'cave', 'cave', ['D', false], [2, 5], ['bocap', 'duongtang_nn', 'lucnhi', HEAL('heal_dd', 'duocsu3'), SHOP('shop_dd', 'shop3'),
      N('maonhat', 'Mão Nhật Tinh Quan', '🐓', { look: 'thaibach', art: 'maonhat', talk: 'Ta vốn là gà trống trên trời. Bò cạp sợ nhất tiếng gáy của ta.' })]],
  ],
  ch4: [
    ['hoadiem', 'Hỏa Diệm Sơn', 'Hồi 59 – 61', 'desert', 'firemountain', ['D', false], [0, 3], ['laonhan', 'thodia', 'duocsu4', 'shop4', 'thietphien', 'nguuma']],
    ['tetai', 'Tế Tái Quốc · Kinh Cức Lĩnh', 'Hồi 62 – 64', 'city', 'palace', ['A', true], [3, 6], ['cuudau', 'hanhtien', 'tangtap', HEAL('heal_te', 'duocsu2'), SHOP('shop_te', 'shop2')]],
  ],
  tieuloiam: [
    ['tieuloiam', 'Tiểu Lôi Âm · Thất Tuyệt Sơn', 'Hồi 65 – 67', 'heaven', 'temple', ['C', true], [0, 3], ['tangtl', 'heal_tl', 'shop_tl', 'hoangmi', 'manxa',
      N('dilac', 'Di Lặc Phật', '😄', { look: 'nhulai', art: 'dilac', talk: 'Đồng tử đánh khánh của ta trộm chũm chọe và túi Nhân Chủng xuống trần. Để ta bày ruộng dưa dụ nó.' })]],
    ['chutu', 'Chu Tử Quốc · Kỳ Lân Sơn', 'Hồi 68 – 71', 'city', 'palace', ['B', false], [3, 6], ['vuachutu', 'dummy_tl', 'kimmao', HEAL('heal_ct', 'duocsu2'), SHOP('shop_ct', 'shop2')]],
  ],
  sudalinh: [
    ['banti', 'Bàn Ti Động · Hoàng Hoa Quán', 'Hồi 72 – 73', 'cave', 'cave', ['C', false], [0, 2], ['nhentinh', 'bachnhan', 'lesonsd', 'heal_sd', 'shop_sd',
      N('tilam', 'Tì Lam Bồ Tát', '👵', { look: 'laomau', art: 'tilam', talk: 'Kim quang của Bách Nhãn Ma Quân chỉ cây kim thêu của lão mới phá nổi.' })]],
    ['suda', 'Sư Đà Lĩnh · Sư Đà Thành', 'Hồi 74 – 77', 'cave', 'cave', ['D', true], [2, 6], ['thanhsu', 'bachtuong', 'daibang', 'thaibach_sd', 'dummy_sd', 'dummy_sd2', 'nhulai_sd', HEAL('heal_su', 'duocsu4'), SHOP('shop_su', 'shop4')]],
  ],
  vodedong: [
    ['tykhau', 'Tỳ Khâu Quốc · Liễu Lâm Pha', 'Hồi 78 – 79', 'city', 'palace', ['B', false], [0, 2], ['dan_vd', 'quoctruong', 'dichtram', 'thotinh', 'heal_vd', 'shop_vd']],
    ['vodedong', 'Hắc Tùng Lâm · Vô Để Động', 'Hồi 80 – 86', 'cave', 'cave', ['C', true], [2, 7], ['thieunu', 'duongtang_vd', 'chuottinh', 'baotinh', 'dummy_vd', 'dancu', HEAL('heal_vd2', 'duocsu2'), SHOP('shop_vd2', 'shop2'),
      N('lythienvuong', 'Lý Thiên Vương', '🗼', { look: 'thaibach', art: 'lythienvuong', talk: 'Con chuột trắng ấy từng ăn trộm hương hoa ở Linh Sơn, được ta tha chết nhận làm con nuôi… Ta sẽ đích thân bắt nó về.' })]],
  ],
  thientruc: [
    ['ngochoa', 'Phượng Tiên Quận · Ngọc Hoa Châu', 'Hồi 87 – 90', 'city', 'palace', ['A', true], [0, 4], ['thaithu', 'hoangsu', 'cuulinh', 'heal_tc', 'shop_tc',
      N('thaiat', 'Thái Ất Thiên Tôn', '🧙', { look: 'laoquan', art: 'thaiat', talk: 'Sư tử chín đầu là thú cưỡi của ta, nhân lúc người hầu say rượu mà trốn xuống trần.' })]],
    ['kimbinh', 'Kim Bình Phủ · Thanh Long Sơn', 'Hồi 91 – 92', 'snow', 'cave', ['D', false], [4, 6], ['teguu', 'dummy_tc', HEAL('heal_kb', 'duocsu1'), SHOP('shop_kb', 'shop1')]],
    ['thientruc', 'Thiên Trúc Quốc', 'Hồi 93 – 97', 'city', 'palace', ['B', true], [6, 8], ['ngoctho', 'khau', HEAL('heal_ttr', 'duocsu2'), SHOP('shop_ttr', 'shop2'),
      N('hangnga_tc', 'Hằng Nga', '👸', { look: 'hangnga', talk: 'Thỏ Ngọc giã thuốc của Quảng Hàn Cung trốn xuống trần đã một năm. Xin Đại Thánh nương tay.' })]],
    ['linhson', 'Linh Sơn', 'Hồi 98 – 100', 'heaven', 'linhson', ['A', false], [8, 10], ['tiepdan', 'laongoan', 'nhulai_tc', HEAL('heal_lsn', 'duocsu1'), SHOP('shop_lsn', 'shop1')], { finale: true }],
  ],
};
// ---------- bản đồ vẽ tay: lưới đi lại dò theo tranh (public/assets/maps/<mã>) ----------
// Tranh được cắt đúng tỉ lệ 12 × 20 ô. tiles/spawn/slots thay bố cục mẫu; slots theo thứ tự npcs.
const PAINTED = {
  ch1: {
    tiles: ['############', 'HHH######HHH', 'HHH##.P.##HH', 'HHH#....#HHH', 'TT,..###..,.', 'TT,..###.,,,', 'TT.,....,.TT',
      '~~~~~..~~~~~', 'TTT~~..~~~~~', 'TTT~....TTTT', 'TTT.....TTTT', 'HHH#....,TTT', 'HHHT....,#.,', 'HHHT...,,HHH',
      'HHH.,..,.HHH', '#,,...,..HHH', '#.#.....,HHH', '#.#........#', '##........##', '############'],
    spawn: [6, 17],
    slots: [[5, 16], [4, 11], [3, 16], [8, 15], [2, 6], [6, 8], [3, 5], [7, 3], [9, 4]],
    secret: { id: 'hangnga', x: 2, y: 4 },
  },
  truongan: {
    tiles: ['############', '############', '####..P...TT', 'TTT#####...T', 'TT######....', '###.........', '###.#......H', 'TTT......HHH',
      '#####..#HHHH', 'HHHT#...##HH', 'HHH##...#HHH', 'HHH##...#HHH', 'HHH#.....HHH', 'TT##......HH', 'TT##.#..##HH', '######...#HH',
      '~~~#......#H', '~~~.....~TTT', '~~~~~~~~~~TT', '~~~~~~~~~~~T'],
    spawn: [6, 15],
    slots: [[6, 6], [10, 4], [4, 12], [5, 10], [8, 12], [7, 9], [5, 17], [9, 13], [3, 17]],
  },
  ngusonhanh: {
    tiles: ['#####.P#####', '#####...####', '######..####', '######...###', '########.###', '########.###', '########.###', '###...#..###',
      '##........##', 'TT,#.....,TT', 'TTTT,...,TTT', 'TTTT,..TTTTT', 'TTT,...TTTTT', 'TT,..###,,TT', 'HH,....,,,,T', 'HHHH....####',
      'HHHHH#..####', 'HHHHH...#TTT', 'HHHHH..#####', 'HHHHH..#####'],
    spawn: [6, 18],
    slots: [[7, 17], [9, 14], [4, 15], [9, 13], [6, 8], [7, 2], [3, 8], [9, 8], [4, 9]],
  },
  quanamvien: {
    tiles: ['#######P####', '#######..###', '#######..###', '###..##..###', '####.....###', '####......##', '####,..#..##', '####.,#..###',
      '######..####', '#####..#####', '#####..#####', '#####..#####', '#####..#####', 'HHHHH..#####', '##......,###', '##,......###',
      'HHHHH...HHHH', 'HHHHH...HHHH', 'HHHH#...#HHH', '###.......##'],
    spawn: [6, 19],
    slots: [[3, 14], [8, 15], [2, 15], [3, 3], [7, 14], [6, 5], [8, 5]],
  },
  caolao: {
    tiles: ['######P#####', '######..####', '#####.,..###', '##......,###', '##,....,####', '###.##..####', '###.....####', '###....#####',
      '####...#####', '####..######', '###...######', '###..#######', '###.,HHHHHHH', 'HHH..HHHHHHH', 'HH,.##..,#HH', '###.......##',
      '###.########', '##...,.,####', '~~....######', '~~~...######'],
    spawn: [4, 19],
    slots: [[6, 14], [9, 15], [2, 17], [7, 14], [2, 3], [5, 4], [4, 8], [3, 10]],
  },
};

const NPC_ALL = {};
OLD_CHAPTERS.forEach((ch) => ch.npcs.forEach((n) => { if (!NPC_ALL[n[0]]) NPC_ALL[n[0]] = n; }));
// tranh riêng cho các NPC trước đây mượn hình
const ART_FIX = { bachlong_hh: 'mangang', dummy_hs: 'honghai_be', tranlao: 'tranlao', baba: 'baba', vuachutu: 'vuachutu', thotinh: 'thotinh', thaithu: 'quan', bachhoa: 'congchua', vanthu: 'vanthu' };
const CHAPTERS = [];
OLD_CHAPTERS.forEach((old, oi) => {
  const parts = SPLIT[old.id];
  if (!parts) throw new Error('Thiếu cách tách cho chương ' + old.id);
  const total = old.steps.length;
  const bossIdx = []; old.steps.forEach((s, i) => { if (s.t === 'boss') bossIdx.push(i); });
  let lvFrom = old.lv[0];
  parts.forEach(([id, name, sub, theme, bg, lay, [a, b], npcList, extra], pi) => {
    if (b > total) throw new Error('Sai bước khi tách ' + id);
    const lvTo = pi === parts.length - 1 ? old.lv[1] : Math.round(old.lv[0] + ((old.lv[1] - old.lv[0]) * b) / total);
    const steps = old.steps.slice(a, b).map((s, k) => {
      const si = a + k, bi = bossIdx.indexOf(si);
      return { ...s, _eq: oi + pi / parts.length, _bi: bi < 0 ? 0 : bi, _phase2: bi >= 0 && bi === bossIdx.length - 1, _last: si === total - 1, _oldMap: old.id };
    });
    const npcs = (npcList || old.npcs.map((n) => n[0])).map((n) => {
      const def = typeof n === 'string' ? (old.npcs.find((x) => x[0] === n) || NPC_ALL[n]) : n;
      if (!def) throw new Error('Không tìm thấy NPC ' + n + ' cho bản đồ ' + id);
      const o = { ...(def[3] || {}) };
      if (ART_FIX[def[0]] && !o.art) o.art = ART_FIX[def[0]];
      return [def[0], def[1], def[2], o];
    });
    steps.forEach((s) => { if (s.t === 'talk' && !npcs.some((n) => n[0] === s.npc)) throw new Error('Nhiệm vụ "' + s.title + '" cần NPC ' + s.npc + ' trên bản đồ ' + id); });
    const ch = { id, name, sub, theme, bg, layout: lay, lv: [lvFrom, Math.max(lvFrom + 2, lvTo)], enc: old.enc, npcs, steps, oldId: old.id, eq: oi + pi / parts.length };
    if (extra && extra.secret) ch.secret = old.secret;
    if (!npcList && old.secret) ch.secret = old.secret;
    if (extra && extra.finale) ch.finale = true;
    if (PAINTED[id]) { const P = PAINTED[id]; ch.tiles = P.tiles; ch.spawn = P.spawn; ch.slots = P.slots; if (P.secret) ch.secret = P.secret; ch.painted = true; }
    CHAPTERS.push(ch);
    lvFrom = Math.max(lvFrom, lvTo - 1);
  });
});
// mã bản đồ cũ không còn → bản đồ mới đầu tiên của chương đó
const MAP_ALIAS = { ch2: 'truongan', ch3: 'bachho', ch4: 'hoadiem', sudalinh: 'banti' };

module.exports = { CHAPTERS, OLD_CHAPTERS, BOSS, layout, MAP_ALIAS };
