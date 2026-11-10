// =====================================================================
//  CẢNH THOẠI CỐT TRUYỆN (theo Tây Du Ký – Ngô Thừa Ân)
//  Mỗi nhiệm vụ (khoá = tên nhiệm vụ, giữ nguyên 137 nhiệm vụ cũ):
//    open – mở đầu: hiện khi nói chuyện với NPC (nhiệm vụ trò chuyện)
//           hoặc ngay khi nhiệm vụ bắt đầu (đánh quái, đánh boss)
//    boss – ngay trước trận boss
//    win  – sau khi hoàn thành
//    next – câu dẫn sang cảnh/bản đồ tiếp theo
//  Mỗi câu: [người nói, lời]. Người nói: mã trong SPEAKERS, 'me' = người chơi,
//  'nar' = lời dẫn truyện (không chân dung).
//  Vai người chơi xuyên suốt: hộ pháp ẩn danh do Như Lai cử theo hộ tống thầy trò.
// =====================================================================

const SPEAKERS = {
  thaibach: ['Thái Bạch Kim Tinh', 'thaibach'], tho_dao: ['Thổ Địa Vườn Đào', 'tho_dao'], culinh: ['Cự Linh Thần', 'culinh'],
  nata: ['Na Tra', 'nata'], nhilang: ['Nhị Lang Thần', 'nhilang'], nhulai: ['Như Lai Phật Tổ', 'nhulai'], ngokhong: ['Tôn Ngộ Không', 'ngokhong'],
  quanam: ['Quan Âm Bồ Tát', 'quanam'], duongtang: ['Đường Tam Tạng', 'duongtang'], luuhong: ['Thủy Tặc Lưu Hồng', 'luuhong'],
  dantuong: ['Dần Tướng Quân', 'dantuong'], tieubachlong: ['Tiểu Bạch Long', 'tieubachlong'], kimtri: ['Lão Tăng Kim Trì', 'kimtri'],
  hachhung: ['Hắc Hùng Tinh', 'hachhung'], batgioi: ['Trư Bát Giới', 'batgioi'], caothai: ['Cao Thái Công', 'laoong', 'caothai'],
  hoangphong: ['Hoàng Phong Quái', 'hoangphong'], linhcat: ['Linh Cát Bồ Tát', 'linhcat'], thienbinh: ['Thiên Binh', 'thienbinh'],
  tieutang: ['Tiểu Sa Di', 'duocsu1', 'tieutang'], satang: ['Sa Ngộ Tĩnh', 'satang'], laodo: ['Lão Lái Đò', 'laoong', 'laodo'], phudan: ['Bà Mẹ', 'laomau'],
};

const S = {
  // ============================ TIỀN TRUYỆN · THIÊN CUNG ============================
  'Chiếu Chỉ Chiêu An': {
    open: [
      ['nar', 'Thiên Cung. Mây ngũ sắc cuồn cuộn, tiếng chiêng trống báo động vang khắp các cửa trời.'],
      ['thaibach', 'Ngươi là hộ pháp mới được điều lên Thiên Cung phải không? Đến thật đúng lúc!'],
      ['thaibach', 'Con khỉ đá ở Hoa Quả Sơn được Ngọc Đế phong làm Bật Mã Ôn. Biết chức nhỏ, nó đạp đổ chuồng ngựa, về núi dựng cờ "Tề Thiên Đại Thánh".'],
      ['me', 'Lão muốn ta làm gì?'],
      ['thaibach', 'Thiên binh bị nó trêu cho rối loạn, đang chém nhau loạn xạ trên mây. Ngươi dẹp yên giúp lão. Có gì cứ ghé Thổ Địa Vườn Đào lấy sức.'],
    ],
    next: 'Thiên binh đang làm loạn trên mây ngũ sắc. Hãy dẹp yên chúng.',
  },
  'Loạn Trên Mây Ngũ Sắc': {
    open: [
      ['thienbinh', 'Đứng lại! Kẻ lạ mặt nào dám bén mảng tới đây? Lại một tên đồng bọn của con khỉ!'],
      ['me', 'Ta là hộ pháp của Thái Bạch Kim Tinh…'],
      ['thienbinh', 'Ai tin! Anh em, bắt lấy nó!'],
    ],
    win: [
      ['tho_dao', 'Hộ pháp vất vả rồi. Ăn quả đào này cho lại sức. Vườn Bàn Đào ba nghìn năm mới chín…'],
      ['tho_dao', 'Mà… lão nói nhỏ thôi: Đại Thánh vừa ăn sạch đào chín, uống trộm cả rượu tiên của Vương Mẫu rồi!'],
    ],
    next: 'Cầu Thiên Hà ở giữa Thiên Cung. Nghe nói Cự Linh Thần đang lùng bắt kẻ trộm đào.',
  },
  'Cự Linh Thần Xuất Trận': {
    boss: [
      ['culinh', 'Đứng lại! Trên tay ngươi là Bàn Đào ba nghìn năm. Vườn đào vừa bị trộm sạch, ngươi còn chối được sao?'],
      ['me', 'Quả này do Thổ Địa Vườn Đào tặng ta.'],
      ['culinh', 'Thổ Địa đang trốn dưới gốc đào, lấy ai làm chứng? Ăn một búa Tuyên Hoa của ta rồi hãy nói!'],
    ],
    win: [
      ['culinh', 'Sức ngươi… không giống yêu tà. Nhưng lệnh trên là lệnh trên.'],
      ['culinh', 'Ta giải ngươi tới trước cung điện, để Tam Thái Tử phân xử.'],
      ['thaibach', 'Đừng sợ. Na Tra nóng tính nhưng không hồ đồ. Cứ để cậu ấy thử sức, sự thật sẽ sáng tỏ.'],
    ],
  },
  'Phong Hỏa Luân': {
    boss: [
      ['nata', 'Kẻ đánh lui được Cự Linh Thần? Hay lắm! Con khỉ kia còn chạy thoát khỏi ta, ngươi thì đừng hòng!'],
      ['me', 'Thái tử, ta không phải người của Hoa Quả Sơn.'],
      ['nata', 'Đỡ được sáu tay của ta thì hẵng nói!'],
    ],
    win: [
      ['nata', 'Hừ… Ngươi đánh mà không hề muốn hại ai. Đúng là không giống bọn khỉ.'],
      ['nata', 'Phụ vương ta cũng đã thua con khỉ ấy. Bây giờ chỉ còn Nhị Lang Hiển Thánh ở Quán Giang Khẩu bắt được nó thôi.'],
    ],
    next: 'Nhị Lang Thần đã tới Nam Thiên Môn.',
  },
  'Hao Thiên Khuyển': {
    boss: [
      ['nhilang', 'Na Tra nói ngươi không phải đồng bọn của con khỉ. Mắt thứ ba của ta sẽ phân xử.'],
      ['nhilang', 'Nếu ngươi gian dối, Hao Thiên Khuyển sẽ không tha.'],
    ],
    win: [
      ['nhilang', 'Thiên Nhãn không nhìn thấy chút yêu khí nào trên người ngươi. Ta xin lỗi vì đã nghi oan.'],
      ['nhilang', 'Con khỉ biết bảy mươi hai phép biến hoá, Thiên Đình không giữ nổi nó. Lò Bát Quái luyện bốn mươi chín ngày mà nó vẫn nhảy ra được.'],
      ['thaibach', 'Ngọc Đế đã sai người sang Tây Thiên thỉnh Như Lai. Hộ pháp, ngươi đi cùng lão một chuyến.'],
    ],
  },
  'Ngũ Hành Sơn': {
    open: [
      ['nar', 'Trên Thông Minh Điện, Như Lai đánh cược với Hầu Vương: nhảy ra khỏi bàn tay Ngài thì được làm chủ Thiên Cung.'],
      ['ngokhong', 'Lão Tôn một cân đẩu đi mười vạn tám nghìn dặm! Đến tận cột trời rồi, để lại mấy chữ làm bằng!'],
      ['nhulai', 'Nhìn kỹ đi. Năm cột trời ấy chính là năm ngón tay của ta.'],
      ['nar', 'Như Lai lật tay hoá năm ngón thành núi Ngũ Hành, đè Hầu Vương xuống. Trên đỉnh dán một lá bùa sáu chữ.'],
      ['nhulai', 'Hầu Vương có tài mà không có đức. Năm trăm năm nữa, sẽ có người đi thỉnh kinh cứu hắn ra.'],
      ['nhulai', 'Còn ngươi, hộ pháp: ta cử ngươi xuống Đông Thổ. Hãy âm thầm che chở người thỉnh kinh, đi đủ tám mươi mốt kiếp nạn.'],
    ],
    next: 'Năm trăm năm trôi qua. Thành Trường An, năm Trinh Quán thứ mười ba.',
  },

  // ============================ TRƯỜNG AN ============================
  'Kim Thiền bị đày': {
    open: [
      ['nar', 'Thành Trường An. Đường Thái Tông mở đại hội thuỷ lục, mời cao tăng khắp nơi về chùa Hoá Sinh giảng kinh.'],
      ['quanam', 'Ngươi đến rồi. Ta hoá làm sư ghẻ bán áo cà sa, để tìm người có duyên.'],
      ['quanam', 'Pháp sư Huyền Trang đang giảng kinh kia, vốn là Kim Thiền Tử, đệ tử thứ hai của Như Lai. Vì lơ là nghe giảng mà bị đày xuống trần.'],
      ['quanam', 'Người phải chịu đủ tám mươi mốt kiếp nạn mới thành chính quả. Ngay từ khi chưa sinh ra, nạn thứ nhất đã đến.'],
      ['me', 'Đệ tử sẽ theo bảo vệ người.'],
    ],
  },
  'Mới sinh suýt bị giết': {
    open: [
      ['duongtang', 'A Di Đà Phật. Thí chủ muốn nghe chuyện của bần tăng sao?'],
      ['duongtang', 'Cha bần tăng là Trần Quang Nhị, đỗ trạng nguyên. Trên đường nhậm chức ở Giang Châu, tên lái đò Lưu Hồng đánh chết cha, cướp mẹ ta.'],
      ['duongtang', 'Hắn giả làm quan thay cha. Khi ta vừa chào đời, hắn từng muốn giết luôn đứa bé…'],
      ['me', 'Rồi sau đó thế nào?'],
      ['duongtang', 'Mẹ ta thả con trên tấm ván trôi sông. Đến nay bến Giang Châu vẫn còn bọn thủy tặc quấy nhiễu.'],
    ],
  },
  'Đầy tháng bị thả sông': {
    open: [['nar', 'Bến sông Giang Châu. Mười tám năm trước, một tấm ván mang đứa bé trôi qua nơi này. Thủy tặc của Lưu Hồng vẫn còn lảng vảng.']],
    win: [['duongtang', 'Đa tạ thí chủ. Năm ấy ván trôi đến chùa Kim Sơn, sư phụ vớt ta lên, đặt tên Giang Lưu. Mười tám năm sau ta mới biết thân thế mình.']],
  },
  'Tìm mẹ báo oán': {
    boss: [
      ['luuhong', 'Thằng trọc! Mười tám năm trước ta tha mạng cho ngươi, nay ngươi dám tìm về đây?'],
      ['duongtang', 'Bần tăng không cầu báo thù, chỉ cầu mẹ được tự do.'],
      ['me', 'Còn ta thì không phải người tu. Lưu Hồng, đền tội đi!'],
    ],
    win: [
      ['duongtang', 'Mẹ đã được cứu. Ông ngoại ta, thừa tướng Ân Khai Sơn, đem quân bắt Lưu Hồng về chịu tội trước mộ cha.'],
      ['duongtang', 'Thái Tông vừa ban chỉ: bần tăng sẽ sang Tây Thiên thỉnh Đại Thừa chân kinh. Bệ hạ nhận ta làm ngự đệ, đặt hiệu Tam Tạng.'],
    ],
    next: 'Ngoài cổng thành phía tây, hổ yêu lang yêu đang chờ người qua đường.',
  },
  'Ra thành gặp hổ': {
    open: [
      ['duongtang', 'Thái Tông bốc nắm đất bỏ vào chén rượu tiễn ta: "Thà nhớ một nắm đất quê nhà, còn hơn yêu vạn lạng vàng xứ lạ".'],
      ['duongtang', 'Thí chủ đi cùng bần tăng một đoạn nhé. Nghe nói ngoài thành nhiều thú dữ.'],
    ],
    win: [['duongtang', 'Thí chủ đã cứu bần tăng. Từ nay xin cùng đi một đường.']],
    next: 'Đường Tăng đã lên đường. Hãy đi theo người về phía tây.',
  },

  // ============================ SONG XOA LĨNH · NGŨ HÀNH SƠN ============================
  'Rơi hố mất tùy tùng': {
    open: [
      ['nar', 'Ra khỏi biên giới, trời chưa sáng, thầy trò sa xuống một hố sâu. Yêu quái lôi hai người tuỳ tùng đi mất.'],
      ['duongtang', 'Hai người theo ta từ Trường An… đều đã bị yêu quái ăn thịt. A Di Đà Phật…'],
      ['duongtang', 'May có một ông lão chống gậy dắt ta ra khỏi hố, rồi hoá thành con hạc trắng bay đi.'],
      ['thaibach', 'Là lão đấy. Hố này do yêu hổ Dần Tướng Quân đào sẵn. Hộ pháp, hãy dẹp nó trước khi thầy ngươi gặp nạn lần nữa.'],
    ],
  },
  'Núi Song Xoa': {
    boss: [
      ['dantuong', 'Thịt hoà thượng mười đời tu hành, ăn một miếng sống thêm nghìn năm. Ngươi là ai mà dám cản?'],
      ['me', 'Người bảo vệ vị hoà thượng ấy.'],
    ],
    win: [['duongtang', 'Thí chủ… không, hộ pháp. Phía trước là núi Lưỡng Giới, nghe nói dưới chân núi có một con khỉ đá bị đè đã lâu.']],
    next: 'Núi Lưỡng Giới – xưa gọi là Ngũ Hành Sơn.',
  },
  'Núi Lưỡng Giới': {
    open: [
      ['ngokhong', 'Sư phụ! Sư phụ! Sao đến muộn thế!'],
      ['duongtang', 'Ngươi… là con khỉ bị đè dưới núi này?'],
      ['ngokhong', 'Lão Tôn chính là Tề Thiên Đại Thánh năm xưa đại náo Thiên Cung, bị Phật Tổ đè ở đây đã năm trăm năm. Quan Âm dặn: đợi người thỉnh kinh đến cứu.'],
      ['ngokhong', 'Ơ, mặt người này quen lắm… Ngươi chính là kẻ đứng sau lưng Như Lai hôm ấy!'],
      ['me', 'Năm trăm năm rồi, Đại Thánh vẫn nhớ dai thế.'],
      ['ngokhong', 'Ha ha! Thôi được, chuyện cũ bỏ qua. Xin sư phụ gỡ tấm bùa trên đỉnh núi, Lão Tôn nguyện theo thầy sang Tây Thiên!'],
      ['nar', 'Đường Tăng gỡ bùa. Núi rung chuyển, đá lở, Ngộ Không nhảy ra, quỳ xuống lạy bốn lạy.'],
    ],
    next: 'Ngộ Không đã nhập đoàn. Phía trước là khe Ưng Sầu.',
  },
  'Suối Ưng Sầu đổi ngựa': {
    open: [['nar', 'Khe Ưng Sầu ở núi Xà Bàn. Nước xanh thẳm, vách đá dựng đứng. Một con rồng trắng bỗng trồi lên, nuốt chửng con ngựa của Đường Tăng.']],
    boss: [
      ['tieubachlong', 'Ta là con của Long Vương Tây Hải, bị đày ở khe này chờ chết. Con ngựa ấy là bữa ăn đầu tiên sau nhiều năm!'],
      ['ngokhong', 'Trả ngựa cho sư phụ ta! Không thì Lão Tôn rút gân ngươi làm dây lưng!'],
    ],
    win: [
      ['quanam', 'Tiểu Bạch Long đốt hạt minh châu của cha nên bị đày. Ta đã dặn nó ở đây chờ người thỉnh kinh.'],
      ['quanam', 'Nay ta hoá nó thành ngựa trắng, cõng Thánh tăng đi Tây Thiên để chuộc tội.'],
      ['ngokhong', 'Sư phụ, ngựa này còn tốt hơn con cũ! Lão Tôn dắt ngựa cho thầy.'],
    ],
    next: 'Bạch Long Mã đã nhập đoàn. Phía tây là thiền viện Quan Âm.',
  },

  // ============================ QUAN ÂM VIỆN · HẮC PHONG SƠN ============================
  'Đêm bị đốt': {
    open: [
      ['kimtri', 'Áo cà sa gấm của Thánh tăng đẹp quá… Lão sưu tầm bảy tám trăm tấm mà chưa thấy tấm nào sánh bằng.'],
      ['kimtri', 'Cho lão giữ xem thêm một đêm thôi, chỉ một đêm thôi…'],
      ['ngokhong', 'Sư phụ, lão này tham lắm. Đệ tử canh chừng cho.'],
      ['nar', 'Nửa đêm, Kim Trì sai đệ tử chất củi quanh tăng phòng rồi phóng hoả. Lửa cháy rực, yêu quái trong núi kéo đến hôi của.'],
      ['tieutang', 'Cháy! Cháy rồi! Có yêu quái lẫn trong đám cháy!'],
    ],
    win: [
      ['ngokhong', 'Lão Tôn mượn Tị Hoả Tráo, lửa không chạm được sư phụ. Nhưng… áo cà sa đâu mất rồi?'],
      ['tieutang', 'Có một con gấu đen từ núi Hắc Phong chạy tới cứu hoả… rồi ôm áo cà sa đi mất!'],
      ['nar', 'Kim Trì xấu hổ, đập đầu vào tường mà chết.'],
    ],
    next: 'Động Hắc Phong trên núi phía sau thiền viện.',
  },
  'Mất áo cà sa': {
    boss: [
      ['hachhung', 'Áo cà sa này ta định mở hội "Phật Y" mừng sinh nhật. Ai muốn đòi thì bước qua xác ta!'],
      ['ngokhong', 'Gấu đen to gan! Đó là áo Phật Tổ ban cho sư phụ ta!'],
    ],
    win: [
      ['quanam', 'Gấu đen này có căn tu. Ta thu nó về làm Thần giữ núi Lạc Già.'],
      ['ngokhong', 'Áo cà sa đây rồi! Sư phụ, ta đi thôi.'],
    ],
    next: 'Đi tiếp về phía tây là Cao Lão Trang.',
  },

  // ============================ CAO LÃO TRANG · HOÀNG PHONG LĨNH ============================
  'Thu phục Bát Giới': {
    open: [
      ['caothai', 'Thánh tăng ơi, cứu lão với! Ba năm trước lão kén được một chàng rể khoẻ mạnh, làm việc bằng mười người.'],
      ['caothai', 'Ai ngờ hắn ăn khoẻ như heo, mặt mũi ngày càng giống heo. Hắn nhốt con gái lão ở hậu viện, không cho gặp ai.'],
      ['ngokhong', 'Để Lão Tôn biến thành con gái ông, nằm chờ hắn về.'],
    ],
    boss: [
      ['batgioi', 'Nương tử, sao hôm nay nàng… có lông thế này?'],
      ['ngokhong', 'Nhìn kỹ đi, ông nội ngươi đây!'],
      ['batgioi', 'Bật Mã Ôn! Lão Trư vốn là Thiên Bồng Nguyên Soái, ngươi tưởng ta sợ chắc?'],
    ],
    win: [
      ['batgioi', 'Khoan! Các người… là đi thỉnh kinh? Sao không nói sớm! Quan Âm dặn lão Trư ở đây chờ người thỉnh kinh mà!'],
      ['duongtang', 'Thiện tai. Ta đặt cho con pháp danh Bát Giới, giữ tám điều giới.'],
      ['batgioi', 'Sư phụ, cho lão Trư ăn bữa cơm chia tay nhạc phụ đã…'],
    ],
    next: 'Bát Giới đã nhập đoàn. Phía trước là Hoàng Phong Lĩnh, gió cát mịt mù.',
  },
  'Hoàng Phong Quái cản đường': {
    open: [['nar', 'Hoàng Phong Lĩnh. Gió vàng nổi lên, cát bay đá chạy. Một tên yêu quái bắt Đường Tăng mang vào động.']],
    boss: [
      ['hoangphong', 'Ta có ngọn gió Tam Muội, thổi một hơi trời đất tối tăm, quỷ thần cũng khóc!'],
      ['ngokhong', 'Gió với chả máy… Á! Mắt Lão Tôn!'],
      ['batgioi', 'Sư huynh lui lại, để lão Trư với hộ pháp đánh!'],
    ],
    win: [
      ['ngokhong', 'Mắt Lão Tôn vẫn cay xè… Gió ấy không phải gió thường. Phải tìm người khắc chế.'],
      ['nar', 'Một ông lão hiện ra, chỉ đường lên núi Tiểu Tu Di tìm Linh Cát Bồ Tát.'],
    ],
  },
  'Cầu Linh Cát Bồ Tát': {
    open: [
      ['linhcat', 'Hoàng Phong Quái vốn là con chồn vàng ăn vụng dầu đèn lưu ly dưới chân núi Linh Sơn, sợ tội mà trốn xuống trần.'],
      ['linhcat', 'Như Lai giao cho ta Định Phong Đan và Phi Long Bảo Trượng để giữ nó. Nay để ta thu nó về.'],
      ['nar', 'Bảo trượng hoá thành con rồng vàng tám móng, quắp con chồn vàng lên trời.'],
      ['ngokhong', 'Đa tạ Bồ Tát! Sư phụ, đi tiếp thôi. Phía trước là sông Lưu Sa.'],
    ],
  },
};

// chuyển câu thoại thành dữ liệu gửi client (tên, hình chân dung, lời)
function view(lines, c) {
  if (!lines || !lines.length) return undefined;
  return lines.map(([who, t]) => {
    if (who === 'me') return { me: 1, n: c ? c.name : 'Ta', t };
    if (who === 'nar') return { nar: 1, t };
    const sp = SPEAKERS[who] || [who, who];
    return { n: sp[0], look: sp[1], art: sp[2], t };
  });
}
const open = (q, c) => view((S[q.title] || {}).open, c);
const boss = (q, c) => view((S[q.title] || {}).boss, c);
// sau khi xong một nhiệm vụ: lời kết + câu dẫn + mở đầu nhiệm vụ kế (nếu là đánh quái/đánh boss)
function after(q, nq, c) {
  const sc = S[q.title] || {};
  const lines = [...(sc.win || [])];
  if (sc.next) lines.push(['nar', sc.next]);
  if (nq && nq.type !== 'talk' && S[nq.title] && S[nq.title].open) lines.push(...S[nq.title].open);
  return view(lines, c);
}

module.exports = { SPEAKERS, SCENES: S, view, open, boss, after };
