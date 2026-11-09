// =====================================================================
//  HẬU TRUYỆN · HỖN ĐỘN KIẾP (nội dung cấp 70 → 160, sáng tác riêng)
//  Sau khi thỉnh kinh, oán khí của 81 kiếp nạn tụ thành Hỗn Độn Ma Tổ.
//  Người chơi trở thành Hộ Kinh Sứ, đi qua 6 cõi để giữ chân kinh.
//  Cấu trúc giống game/story.js – data.js dựng bản đồ/boss/nhiệm vụ.
//  · post: true  → không tính "nạn" (81 nạn chỉ thuộc cốt truyện chính)
//  · asc: true   → cần Phi Thăng mới vào được
//  · step.needAsc → bước nhiệm vụ chỉ hoàn thành khi đã Phi Thăng
// =====================================================================
const { layout } = require('./story');

// [tên, biểu tượng dự phòng, ngũ hành, kỹ năng, lính đi kèm [mã, chênh cấp]]
const BOSS = {
  daxoa: ['Dạ Xoa Tuần Hải', '🔱', 'thuy', ['pet_thuy', 'pet_aoe'], [['hatuong', -3], ['hatuong', -3]]],
  quyma: ['Huyền Quy Ma Tướng', '🐢', 'thuy', ['pet_thuy', 'bs_shell'], [['hatuong', -3]]],
  giaoma: ['Giao Ma Vương', '🐉', 'thuy', ['pet_thuy', 'pet_aoe', 'bs_tide'], [['hatuong', -3], ['hatuong', -3]]],
  nguudau: ['Ngưu Đầu (Ma Hoá)', '🐂', 'tho', ['pet_tho', 'bs_chain'], [['quysai', -3]]],
  madien: ['Mã Diện (Ma Hoá)', '🐴', 'hoa', ['pet_hoa', 'bs_chain'], [['quysai', -3]]],
  huyetha: ['Huyết Hà Lão Tổ', '🩸', 'thuy', ['pet_aoe', 'bs_blood', 'pet_thuy'], [['quysai', -3], ['quysai', -3]]],
  banglang: ['Băng Lang Vương', '🐺', 'thuy', ['pet_thuy', 'pet_aoe'], [['thienbinh', -3]]],
  tuyetma: ['Tuyết Ma Nữ', '❄️', 'thuy', ['bs_frost', 'pet_thuy'], [['thienbinh', -3]]],
  khaiminh: ['Khai Minh Thú', '🐯', 'kim', ['pet_kim', 'pet_aoe', 'bs_roar'], [['thienbinh', -3], ['thienbinh', -3]]],
  thanlau: ['Thận Lâu Yêu Mẫu', '🐚', 'thuy', ['bs_mirage', 'pet_thuy'], [['daodong', -3]]],
  kimngao: ['Kim Ngao Ma Tướng', '🐢', 'tho', ['pet_tho', 'bs_shell', 'pet_aoe'], [['daodong', -3], ['daodong', -3]]],
  aodieu: ['Ảo Điểu Vương', '🦚', 'hoa', ['pet_hoa', 'bs_mirage', 'pet_aoe'], []],
  loibo: ['Lôi Bộ Ma Tướng', '⚡', 'kim', ['pet_loi', 'pet_kim', 'bs_roar'], [['mabinh', -3], ['mabinh', -3]]],
  cuudieu: ['Cửu Diệu Ma Tinh', '🌟', 'hoa', ['pet_aoe', 'bs_star', 'pet_hoa'], [['mabinh', -3]]],
  honthe: ['Hỗn Thế Ma Vương', '👹', 'tho', ['pet_tho', 'pet_aoe', 'bs_chain'], [['mabinh', -3], ['mabinh', -3]]],
  tamma: ['Tâm Ma Ảnh', '🐒', 'kim', ['pet_kim', 'bs_mirage', 'pet_aoe'], []],
  hondonthu: ['Hỗn Độn Thú', '🌀', 'tho', ['pet_aoe', 'bs_void', 'pet_tho'], [['mabinh', -3]]],
  mato: ['Hỗn Độn Ma Tổ', '☯️', 'hoa', ['bs_void', 'pet_aoe', 'bs_star', 'pet_hoa'], [['mabinh', -3], ['mabinh', -3]]],
};

const B = (id) => [id, BOSS[id][0], BOSS[id][1], { boss: true }];
const HEAL = (id, look, name = 'Thầy Thuốc') => [id, name, '👨‍⚕️', { role: 'heal', look }];
const SHOP = (id, look, name = 'Thương Nhân') => [id, name, '🧑‍💼', { role: 'shop', look }];

const CHAPTERS = [
  // =================================================================
  {
    id: 'donghai', name: 'Đông Hải Long Cung', sub: 'Hậu truyện I · Định Hải Châu', theme: 'sea', layout: ['B', true], lv: [70, 86], post: true,
    enc: { forms: ['thuyquai', 'xatinh', 'thiemthu', 'huyenquy', 'thanhlong', 'longma'], humans: ['hatuong'] },
    npcs: [
      ['ngokhong_dh', 'Tề Thiên Đại Thánh', '🐵', { look: 'ngokhong', talk: 'Chân kinh về Đông Thổ rồi mà lão Tôn vẫn thấy bất an…' }],
      ['longvuong', 'Đông Hải Long Vương', '🐲', { look: 'longvuong', talk: 'Ngao Quảng ta trấn biển ba vạn năm, chưa từng thấy sóng dữ thế này.' }],
      HEAL('heal_dh', 'longnu', 'Long Nữ Dược Sư'), SHOP('shop_dh', 'quythua', 'Quy Thương Nhân'),
      ['quythua', 'Quy Thừa Tướng', '🐢', { look: 'quythua', talk: 'Khụ… lão thần già rồi, mắt kém, nhưng tai vẫn thính lắm.' }],
      B('daxoa'), B('quyma'), B('giaoma'),
      ['tieulong_dh', 'Tiểu Bạch Long', '🐉', { look: 'tieubachlong', talk: 'Phụ vương ta là Tây Hải Long Vương… nhưng bá phụ Ngao Quảng cũng như cha vậy.' }],
    ],
    steps: [
      { t: 'talk', npc: 'ngokhong_dh', title: 'Kinh văn rung chuyển', text: 'Gặp Tề Thiên Đại Thánh ở bến Đông Hải.', dialog: 'Kinh về đến Trường An, chữ trên lá bối bỗng đen lại từng dòng! Như Lai bảo oán khí của tám mươi mốt kiếp nạn chưa tan – chúng tụ lại thành một thứ gọi là Hỗn Độn. Dấu hiệu đầu tiên: Định Hải Châu dưới Đông Hải đã tắt sáng. Lão Tôn phong ngươi làm Hộ Kinh Sứ, xuống biển xem thử!' },
      { t: 'talk', npc: 'longvuong', title: 'Long Cung cầu viện', text: 'Yết kiến Đông Hải Long Vương Ngao Quảng.', dialog: 'Định Hải Châu là viên ngọc giữ yên tứ hải. Từ khi nó mờ đi, hải tộc phát cuồng, Dạ Xoa tuần biển cũng không nghe lệnh nữa. Hộ Kinh Sứ, xin ra tay!' },
      { t: 'kill', n: 10, title: 'Hải tộc nổi loạn', text: 'Dẹp yên 10 hải yêu đang phá rạn san hô.' },
      { t: 'boss', boss: 'daxoa', title: 'Dạ Xoa tuần hải', text: 'Dạ Xoa bị ma khí nhập, cầm đinh ba chặn đường vào Thủy Tinh Cung.' },
      { t: 'talk', npc: 'quythua', title: 'Mật báo Quy Thừa Tướng', text: 'Nghe Quy Thừa Tướng báo tin.', dialog: 'Kẻ đứng sau là em ruột lão thần – Huyền Quy Ma Tướng. Nó nhận một hạt "Hỗn Độn chủng" từ một bóng đen không mặt, từ đó mai rùa cứng như sắt, lòng dạ đen như mực…' },
      { t: 'boss', boss: 'quyma', title: 'Huyền Quy phản loạn', text: 'Đánh vỡ mai rùa của Huyền Quy Ma Tướng. Hắn có Huyền Giáp – cẩn thận!' },
      { t: 'kill', n: 10, title: 'Rạn san hô máu', text: 'Ma khí nhuộm đỏ san hô. Diệt 10 yêu quái quanh rạn.' },
      { t: 'boss', boss: 'giaoma', title: 'Giao Ma Vương đoạt châu', text: 'Giao Ma Vương ôm Định Hải Châu trong vực sâu. Đánh bại hắn, giành lại ngọc.' },
      { t: 'talk', npc: 'longvuong', title: 'Định Hải Châu hoàn vị', text: 'Trao trả Định Hải Châu cho Long Vương.', dialog: 'Ngọc sáng trở lại rồi! Nhưng trong ngọc còn hiện một hình ảnh: một trang Sinh Tử Bộ bị xé ở Âm Ti… Những yêu quái đã chết trong 81 nạn đang được ai đó gọi hồn sống lại. Hãy xuống Địa Phủ!' },
    ],
  },
  // =================================================================
  {
    id: 'diaphu', name: 'U Minh Địa Phủ', sub: 'Hậu truyện II · Sinh Tử Bộ', theme: 'hell', layout: ['D', false], lv: [84, 100], post: true,
    enc: { forms: ['bachcot', 'quyhoa', 'doiyeu', 'nhentinh', 'hatinh', 'nguuma'], humans: ['quysai'] },
    npcs: [
      ['diemvuong', 'Diêm La Vương', '👑', { look: 'diemvuong', talk: 'Âm Ti có luật của Âm Ti. Kẻ sống không nên ở lâu.' }],
      ['manhba', 'Mạnh Bà', '👵', { role: 'heal', look: 'manhba', talk: 'Uống bát canh này… à không, bát này chỉ để hồi sức thôi.' }],
      ['shop_dp', 'Quỷ Thương', '🧑‍💼', { role: 'shop', look: 'phanquan' }],
      ['phanquan', 'Thôi Phán Quan', '📕', { look: 'phanquan', talk: 'Một nét bút của ta định sinh tử vạn người. Nay sổ mất một trang…' }],
      B('nguudau'), B('madien'),
      ['diatang', 'Địa Tạng Bồ Tát', '🙏', { look: 'diatang', talk: 'Địa ngục chưa trống, thề không thành Phật.' }],
      B('huyetha'),
      ['dethinh', 'Đế Thính', '🐕', { look: 'dethinh', talk: '(Thần thú nằm phủ phục, đôi tai vểnh lên nghe ngóng cả tam giới.)' }],
    ],
    steps: [
      { t: 'talk', npc: 'diemvuong', title: 'Sinh Tử Bộ bị xé', text: 'Yết kiến Diêm La Vương ở Sâm La Điện.', dialog: 'Đêm qua có kẻ lẻn vào Sâm La Điện, xé đúng trang ghi tên các yêu vương bị Tôn Hành Giả đánh chết. Hồn chúng thoát khỏi luân hồi, oan hồn khắp nơi tràn ra Hoàng Tuyền lộ!' },
      { t: 'kill', n: 10, title: 'Oan hồn tràn ra', text: 'Thu phục 10 oan hồn trên đường Hoàng Tuyền.' },
      { t: 'boss', boss: 'nguudau', title: 'Ngưu Đầu mất trí', text: 'Ngưu Đầu bị ma khí khống chế, quăng xích sắt khắp nơi. Đánh cho hắn tỉnh lại.' },
      { t: 'boss', boss: 'madien', title: 'Mã Diện cuồng loạn', text: 'Mã Diện mắt đỏ ngầu, phun lửa U Minh. Khống chế hắn.' },
      { t: 'talk', npc: 'phanquan', title: 'Trang sổ bị đánh cắp', text: 'Hỏi Thôi Phán Quan về trang sổ mất.', dialog: 'Ngưu Đầu Mã Diện tỉnh lại kể rằng kẻ trộm sổ chạy về phía Huyết Hà – dòng sông máu dưới đáy mười tám tầng địa ngục. Ở đó có Huyết Hà Lão Tổ, kẻ đã ngủ say từ thuở khai thiên.' },
      { t: 'kill', n: 12, title: 'Cầu Nại Hà', text: 'Mở đường qua cầu Nại Hà – diệt 12 quỷ quái canh cầu.' },
      { t: 'talk', npc: 'dethinh', title: 'Đế Thính dẫn lối', text: 'Nhờ thần thú Đế Thính nghe ngóng.', dialog: '(Đế Thính áp tai xuống đất rất lâu, rồi gầm khẽ. Địa Tạng Bồ Tát nói: "Nó nghe thấy tiếng Huyết Hà sôi sục – Lão Tổ đã tỉnh, trang sổ đang nằm trong tay hắn.")' },
      { t: 'boss', boss: 'huyetha', title: 'Huyết Hà Lão Tổ', text: 'Huyết Hà Lão Tổ hút máu hồi sức. Phải đánh thật nhanh!' },
      { t: 'talk', npc: 'diemvuong', title: 'Trả lại Sinh Tử Bộ', text: 'Đem trang sổ về Sâm La Điện.', dialog: 'Trang sổ đã về, oan hồn sẽ trở lại luân hồi. Nhưng Huyết Hà Lão Tổ trước khi tan còn cười: "Ma Tổ đã sai tướng lên Côn Lôn lấy Bất Tử Dược…" Nếu Ma Tổ có thân bất tử, tam giới nguy rồi!' },
    ],
  },
  // =================================================================
  {
    id: 'conlon', name: 'Côn Lôn Tiên Sơn', sub: 'Hậu truyện III · Bất Tử Dược', theme: 'snow', layout: ['C', false], lv: [98, 114], post: true,
    enc: { forms: ['hoyeu', 'langyeu', 'kylan', 'tienhac', 'battuong', 'suvuong'], humans: ['thienbinh'] },
    npcs: [
      ['thanhdieu', 'Thanh Điểu Sứ Giả', '🐦', { look: 'thanhdieu', talk: 'Ta mang thư của Tây Vương Mẫu đi khắp tam giới.' }],
      HEAL('heal_cl', 'hacdong', 'Tiên Đồng Dao Trì'),
      SHOP('shop_cl', 'shop4', 'Thương Nhân Côn Lôn'),
      ['hacdong', 'Bạch Hạc Đồng Tử', '🧒', { look: 'hacdong', talk: 'Dao Trì đóng băng rồi, hoa bàn đào cũng héo cả.' }],
      B('banglang'), B('tuyetma'),
      ['vuongmau', 'Tây Vương Mẫu', '👸', { look: 'vuongmau', talk: 'Côn Lôn là gốc của muôn núi. Kẻ nào làm nó lạnh ngắt thế này?' }],
      B('khaiminh'),
      ['laohau_cl', 'Lão Tiều Côn Lôn', '👴', { look: 'tieuphu', talk: 'Đi đường núi nhớ mặc ấm. Gió ở đây cắt da cắt thịt.' }],
    ],
    steps: [
      { t: 'talk', npc: 'thanhdieu', title: 'Thanh Điểu đưa thư', text: 'Nhận thư khẩn của Thanh Điểu.', dialog: 'Tây Vương Mẫu gửi lời: một luồng hàn khí Hỗn Độn đã đóng băng cả Côn Lôn. Bất Tử Dược trong Dao Trì đang bị kẻ lạ dòm ngó. Xin Hộ Kinh Sứ lên núi!' },
      { t: 'kill', n: 12, title: 'Bão tuyết Côn Lôn', text: 'Vượt bão tuyết, diệt 12 yêu thú băng.' },
      { t: 'boss', boss: 'banglang', title: 'Băng Lang Vương', text: 'Sói chúa băng giá chặn đèo. Đánh bại nó – bầy sói có thể sẽ theo ngươi về.' },
      { t: 'talk', npc: 'hacdong', title: 'Dao Trì bị phong', text: 'Hỏi Bạch Hạc Đồng Tử về Dao Trì.', dialog: 'Một nữ yêu tóc trắng như tuyết thổi một hơi là cả hồ Dao Trì đóng băng. Ả tự xưng Tuyết Ma Nữ, nói rằng chủ nhân ả cần "thân không bao giờ chết".' },
      { t: 'boss', boss: 'tuyetma', title: 'Tuyết Ma Nữ', text: 'Tuyết Ma Nữ có thể đóng băng cả đội. Chuẩn bị kháng tính!' },
      { t: 'kill', n: 12, title: 'Vạn trượng băng nhai', text: 'Leo vách băng vạn trượng – dẹp 12 yêu quái bám vách.' },
      { t: 'boss', boss: 'khaiminh', title: 'Khai Minh Thú cửu thủ', text: 'Thần thú chín đầu canh cổng Côn Lôn bị nhập ma. Đánh thức nó!' },
      { t: 'talk', npc: 'vuongmau', title: 'Bất Tử Dược thất lạc', text: 'Bẩm báo Tây Vương Mẫu.', dialog: 'Khai Minh Thú tỉnh rồi, nhưng một bình Bất Tử Dược đã bị đánh tráo… Kẻ trộm cưỡi một con chim lông ngũ sắc bay về hướng đông – về Bồng Lai. Ta ban ngươi Tiên Lệnh Côn Lôn, hãy đuổi theo!' },
    ],
  },
  // =================================================================
  {
    id: 'bonglai', name: 'Bồng Lai Tiên Đảo', sub: 'Hậu truyện IV · Ảo Điểu & Thiên Kiếp', theme: 'river', layout: ['A', true], lv: [112, 126], post: true,
    enc: { forms: ['phuong', 'khongtuoc', 'tienhac', 'thongoc', 'kylan', 'huyenquy'], humans: ['daodong'] },
    npcs: [
      HEAL('heal_bl', 'duocsu1', 'Tiên Đồng Bồng Lai'),
      ['ludongtan', 'Lữ Động Tân', '🗡️', { look: 'ludongtan', talk: 'Bát Tiên quá hải, mỗi người một phép. Còn ngươi?' }],
      SHOP('shop_bl', 'shop1', 'Tiên Thương Bồng Lai'),
      ['ngutieu_bl', 'Ngư Ông', '🎣', { look: 'laoong', talk: 'Đảo này hiện rồi lại ẩn như mây khói. Lão câu cá ở đây năm trăm năm rồi.' }],
      ['laoquan', 'Thái Thượng Lão Quân', '🧙', { look: 'laoquan', talk: 'Phàm thân không qua được Nam Thiên Môn. Muốn đi tiếp, phải độ kiếp.' }],
      B('thanlau'), B('kimngao'),
      B('aodieu'),
      ['hatien', 'Hà Tiên Cô', '🪷', { look: 'hatien', talk: 'Hoa sen trên tay ta nở theo lòng người thiện.' }],
    ],
    steps: [
      { t: 'talk', npc: 'ludongtan', title: 'Tiên đảo chìm trong ảo ảnh', text: 'Gặp Lữ Động Tân trên bãi Bồng Lai.', dialog: 'Cả đảo phủ một lớp ảo ảnh – ai bước vào cũng thấy cảnh mình ao ước nhất rồi lạc mãi không ra. Ta nghi có Thận yêu (con trai khổng lồ thở ra lâu đài ảo) đang tác quái.' },
      { t: 'kill', n: 12, title: 'Ảo cảnh mê tung', text: 'Phá 12 ảo thú trong sương mù.' },
      { t: 'boss', boss: 'thanlau', title: 'Thận Lâu Yêu Mẫu', text: 'Đánh tan Thận Lâu Yêu Mẫu – kẻ thở ra lâu đài ảo trên biển.' },
      { t: 'boss', boss: 'kimngao', title: 'Kim Ngao trở mình', text: 'Con rùa vàng cõng đảo Bồng Lai bị ma khí nhập, đảo nghiêng ngả. Trấn áp nó!' },
      { t: 'kill', n: 12, title: 'Vũ điệu Ảo Điểu', text: 'Bầy chim ngũ sắc lao xuống tấn công. Diệt 12 con.' },
      { t: 'boss', boss: 'aodieu', title: 'Ảo Điểu Vương', text: 'Chim ngũ sắc cõng kẻ trộm Bất Tử Dược. Đánh bại Ảo Điểu Vương – lông vũ của nó có thể thuần thành thú cưỡi.' },
      { t: 'talk', npc: 'laoquan', needAsc: true, title: 'Độ Thiên Kiếp', text: 'Thái Thượng Lão Quân: muốn lên Nam Thiên Môn phải Phi Thăng (cấp 120, vượt Tam Cửu Thiên Kiếp).', dialog: 'Tốt! Ngươi đã thoát thai phàm cốt. Bất Tử Dược kia đã được đưa lên Nam Thiên Môn – Ma Tổ muốn chiếm Thiên Đình để mượn Thiên Đạo trường sinh. Hãy cưỡi mây lên trời!' },
    ],
  },
  // =================================================================
  {
    id: 'namthien', name: 'Nam Thiên Môn', sub: 'Hậu truyện V · Thiên Đình thất thủ', theme: 'heaven', layout: ['D', true], lv: [124, 142], post: true, asc: true,
    enc: { forms: ['kimbang', 'longma', 'thanhlong', 'kylan', 'phuong', 'suvuong'], humans: ['thienbinh', 'mabinh'] },
    npcs: [
      ['thaibach_nt', 'Thái Bạch Kim Tinh', '🧙‍♂️', { look: 'thaibach', talk: 'Lại gặp ngươi! Lần này không phải Hầu Vương làm loạn đâu…' }],
      HEAL('heal_nt', 'duocsu1', 'Tiên Đồng Đâu Suất'),
      SHOP('shop_nt', 'shop1', 'Tiên Thương Thiên Đình'),
      ['ngocde', 'Ngọc Hoàng Thượng Đế', '🤴', { look: 'ngocde', talk: 'Trẫm… trẫm cần người.' }],
      B('loibo'), B('cuudieu'),
      ['ngokhong_nt', 'Tề Thiên Đại Thánh', '🐵', { look: 'ngokhong', talk: 'Ha! Năm xưa lão Tôn đánh vào đây, giờ lại phải giữ cửa cho Ngọc Đế!' }],
      B('honthe'),
      ['nata_nt', 'Na Tra', '🧒', { look: 'nata', talk: 'Phong Hỏa Luân của ta sẵn sàng rồi!' }],
    ],
    steps: [
      { t: 'talk', npc: 'thaibach_nt', title: 'Thiên Đình thất thủ', text: 'Gặp Thái Bạch Kim Tinh trước Nam Thiên Môn.', dialog: 'Ma binh Hỗn Độn tràn lên như thác ngược. Thiên binh bị ma khí nhập, quay giáo đánh nhau. Lôi Bộ cũng phản rồi! Mau lên!' },
      { t: 'kill', n: 14, title: 'Ma binh vây Nam Thiên Môn', text: 'Phá vòng vây: diệt 14 ma binh trước cổng trời.' },
      { t: 'boss', boss: 'loibo', title: 'Lôi Bộ phản thiên', text: 'Lôi Bộ Ma Tướng dùng sét đánh khắp nơi, có thể Định Thân. Đánh bại hắn.' },
      { t: 'talk', npc: 'ngocde', title: 'Lăng Tiêu Bảo Điện', text: 'Yết kiến Ngọc Hoàng.', dialog: 'Hỗn Thế Ma Vương – đại tướng của Ma Tổ – đã chiếm Thiên Hà. Cửu Diệu Tinh Quân cũng bị hắn biến thành ma tinh. Hộ Kinh Sứ, trẫm giao Thiên Đình cho ngươi!' },
      { t: 'boss', boss: 'cuudieu', title: 'Cửu Diệu Ma Tinh', text: 'Chín ngôi sao ma rơi như mưa lửa. Hạ Cửu Diệu Ma Tinh.' },
      { t: 'kill', n: 14, title: 'Thiên Hà dậy sóng', text: 'Thiên Hà nổi sóng đen. Diệt 14 yêu quái dưới sóng.' },
      { t: 'boss', boss: 'honthe', title: 'Hỗn Thế Ma Vương', text: 'Đại tướng Hỗn Độn cầm Bất Tử Dược. Hắn rất trâu – mang đủ đan dược!' },
      { t: 'talk', npc: 'ngocde', title: 'Cánh cửa Hỗn Độn', text: 'Bẩm báo Ngọc Hoàng.', dialog: 'Bình Bất Tử Dược đã về. Nhưng lúc Ma Vương tan biến, một khe nứt đen ngòm mở ra giữa trời – đó là lối vào Hỗn Độn Hư Không, nơi Ma Tổ trú ngụ. Như Lai, Quan Âm và thầy trò Đường Tăng đã đợi ngươi ở đó.' },
    ],
  },
  // =================================================================
  {
    id: 'hondon', name: 'Hỗn Độn Hư Không', sub: 'Hậu truyện VI · Kiếp Thứ Tám Mươi Hai', theme: 'void', layout: ['C', true], lv: [140, 160], post: true, asc: true,
    enc: { forms: ['quyhoa', 'bachcot', 'viemthu', 'thanhlong', 'phuong', 'doiyeu'], humans: ['mabinh'] },
    npcs: [
      ['ngokhong_hd', 'Đấu Chiến Thắng Phật', '🐵', { look: 'ngokhong', talk: 'Nơi này chẳng có trên dưới, chẳng có trước sau. Cẩn thận!' }],
      HEAL('heal_hd', 'tiepdan', 'Tiếp Dẫn Phật'),
      SHOP('shop_hd', 'shop1', 'Thương Nhân Lạc Lối'),
      B('tamma'),
      ['duongtang_hd', 'Chiên Đàn Công Đức Phật', '🧘', { look: 'duongtang', talk: 'A Di Đà Phật. Sắc tức thị không…' }],
      B('hondonthu'),
      ['quanam_hd', 'Quan Âm Bồ Tát', '🙏', { look: 'quanam', talk: 'Cam lộ trong tịnh bình chỉ còn một giọt.' }],
      B('mato'),
      ['nhulai_hd', 'Như Lai Phật Tổ', '🧘', { look: 'nhulai', talk: 'Thiện tai.' }],
    ],
    steps: [
      { t: 'talk', npc: 'ngokhong_hd', title: 'Bước vào Hư Không', text: 'Gặp Đấu Chiến Thắng Phật trong Hư Không.', dialog: 'Đây là nơi trước cả khi Bàn Cổ khai thiên. Oán khí 81 nạn rơi xuống đây, tụ thành Ma Tổ. Nó biến được thành bất cứ ai ngươi sợ nhất… Đi theo lão Tôn!' },
      { t: 'kill', n: 15, title: 'Mảnh vỡ thế giới', text: 'Diệt 15 ma vật trôi nổi giữa các mảnh vỡ thế giới.' },
      { t: 'boss', boss: 'tamma', title: 'Tâm Ma Ảnh', text: 'Một con khỉ đen giống hệt Lục Nhĩ hiện ra – đó là tâm ma của chính Hộ Kinh Sứ.' },
      { t: 'talk', npc: 'duongtang_hd', title: 'Bát Nhã Tâm Kinh', text: 'Nghe Đường Tăng giảng kinh.', dialog: 'Tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố… Con à, Ma Tổ chỉ mạnh khi ta sợ nó. Tâm an thì ma tự tan.' },
      { t: 'boss', boss: 'hondonthu', title: 'Hỗn Độn Thú', text: 'Thú không mặt, sáu chân, bốn cánh – canh giữ tâm Hư Không.' },
      { t: 'kill', n: 15, title: 'Oán khí 81 nạn', text: 'Gột rửa 15 khối oán khí mang hình yêu vương năm xưa.' },
      { t: 'talk', npc: 'quanam_hd', title: 'Giọt cam lộ cuối cùng', text: 'Nhận phúc lành của Quan Âm.', dialog: 'Giọt cam lộ cuối cùng ta rảy lên ngươi. Nó không làm ngươi mạnh hơn, nhưng sẽ nhắc ngươi nhớ vì sao mình lên đường.' },
      { t: 'boss', boss: 'mato', title: 'Hỗn Độn Ma Tổ', text: 'Trận chiến cuối cùng – Kiếp nạn thứ tám mươi hai. Ma Tổ có hai lần biến hình!' },
      { t: 'talk', npc: 'nhulai_hd', title: 'Cửu Cửu Quy Chân', text: 'Trở về trước Như Lai.', dialog: 'Tám mươi mốt nạn là để thành Phật; nạn thứ tám mươi hai là để giữ Phật pháp. Hộ Kinh Sứ, ngươi đã làm được điều mà ngay cả ta cũng không thể làm thay. Thiện tai, thiện tai.' },
    ],
    finale: true,
  },
];

module.exports = { CHAPTERS, BOSS, layout };
