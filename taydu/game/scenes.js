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
  // ---- đợt 2: Hồi 22 – 46 ----
  laomau: ['Lê Sơn Lão Mẫu', 'laomau'], giathi: ['Bà Góa Họ Giả', 'laomau'], thanhphong: ['Thanh Phong', 'daodong', 'thanhphong'], minhnguyet: ['Minh Nguyệt', 'daodong', 'minhnguyet'],
  tranguyen: ['Trấn Nguyên Đại Tiên', 'tranguyen'], laohau: ['Lão Hầu Thông Bối', 'laohau'], tieuphu: ['Tiều Phu', 'tieuphu'],
  bachcot: ['Bạch Cốt Tinh', 'bachcot'], thonnu: ['Cô Thôn Nữ', 'bachcot', 'bachcot_a'], balao: ['Bà Lão', 'bachcot', 'bachcot_b'], onglao: ['Ông Lão', 'bachcot', 'bachcot_c'],
  congchua: ['Công Chúa Bách Hoa Tu', 'congchua'], hoangbao: ['Hoàng Bào Quái', 'hoangbao'], bachlongma: ['Bạch Long Mã', 'tieubachlong'],
  ngangiac: ['Ngân Giác Đại Vương', 'ngangiac'], kimgiac: ['Kim Giác Đại Vương', 'kimgiac'], laoquan: ['Thái Thượng Lão Quân', 'laoquan'], tieuyeu: ['Tiểu Yêu Tinh Tế Quỷ', 'tieuyeu'],
  vuaoke: ['Hồn Vua Ô Kê', 'vuaoke'], vuaoke_song: ['Vua Ô Kê', 'vuaoke', 'vuaoke_song'], vanthu: ['Văn Thù Bồ Tát', 'vanthu'], giavuong: ['Giả Quốc Vương', 'giavuong'], thaitu: ['Thái Tử Ô Kê', 'vua'],
  sonthan: ['Sơn Thần Hiệu Sơn', 'thodia'], honghai: ['Hồng Hài Nhi', 'honghai'], honghai_be: ['Đứa Bé Treo Trên Cây', 'honghai', 'honghai_be'], hoayeu: ['Hỏa Yêu Binh', 'hoayeu'],
  ngudan: ['Ngư Phủ Hắc Hà', 'tieuphu'], dalong: ['Đà Long', 'dalong'], mangang: ['Thái Tử Ma Ngang', 'tieubachlong', 'mangang'],
  // ---- đợt 3: Hồi 47 – 71 ----
  tranlao: ['Trần Lão Gia', 'laoong', 'tranlao'], linhcam: ['Linh Cảm Đại Vương', 'linhcam'], lao_ngoan: ['Lão Ngoan Bạch Nguyên', 'huyenquy'],
  docgiac: ['Độc Giác Hủy Đại Vương', 'docgiac'], thodia: ['Thổ Địa', 'thodia'],
  baba: ['Bà Lão Bên Sông', 'laomau', 'baba'], nuquan: ['Nữ Quan Tây Lương', 'nuquan'], nuvuong: ['Nữ Vương Tây Lương', 'nuvuong'],
  bocap: ['Bò Cạp Tinh', 'bocap'], maonhat: ['Mão Nhật Tinh Quan', 'thaibach', 'maonhat'], lucnhi: ['Lục Nhĩ Mỹ Hầu', 'lucnhi'],
  laonhan: ['Lão Nhân Hỏa Diệm Sơn', 'laonhan'], thietphien: ['Thiết Phiến Công Chúa', 'thietphien'], nguuma: ['Ngưu Ma Vương', 'nguuma'], bachnguu: ['Đại Bạch Ngưu', 'nguuma', 'nguuma_2'],
  cuudau: ['Cửu Đầu Phò Mã', 'cuudau'], tangkq: ['Tăng Chùa Kim Quang', 'tangnhan'], hanhtien: ['Hạnh Tiên', 'hanhtien'],
  hoangmi: ['Hoàng Mi Đại Vương', 'hoangmi'], manxa: ['Hồng Lân Đại Mãng', 'manxa'], dilac: ['Di Lặc Phật', 'nhulai', 'dilac'], danla: ['Dân Làng Đà La', 'tieuphu'],
  vuachutu: ['Vua Chu Tử', 'vua', 'vuachutu'], kimmao: ['Trại Thái Tuế', 'kimmao'],
  tangnhan: ['Tăng Nhân Khổ Sai', 'tangnhan'], vuaxatri: ['Vua Xa Trì', 'vua'], holuc: ['Hổ Lực Đại Tiên', 'holuc'], duongluc: ['Lộc Lực · Dương Lực', 'duongluc'], daodong: ['Đạo Đồng', 'daodong'],
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

  // ============================ ĐỢT 2 · HỒI 22 – 46 ============================
  'Lưu Sa khó qua': {
    open: [
      ['nar', 'Một dòng sông mênh mông chắn ngang đường. Tấm bia đá bên bờ khắc ba chữ "Lưu Sa Hà": rộng tám trăm dặm, sâu ba nghìn trượng, lông ngỗng thả xuống cũng chìm.'],
      ['laodo', 'Ở đây không có thuyền đâu khách ơi. Nước sông này nuốt cả lá lau, ai bước xuống là chìm mất xác.'],
      ['batgioi', 'Sư phụ xem kìa, dưới nước có bóng đen lớn lắm đang bơi quanh!'],
      ['ngokhong', 'Yêu khí nặng thật. Thủy quái dưới sông kéo lên cả bầy rồi. Hộ pháp, dẹp bọn nhãi nhép trước đã!'],
    ],
    win: [
      ['laodo', 'Bầy thủy quái tan rồi… nhưng con quỷ lớn nhất vẫn ở dưới đáy. Nó đeo chuỗi chín cái đầu lâu, nghe nói đều là người đi thỉnh kinh.'],
    ],
  },
  'Thu được Sa Tăng': {
    boss: [
      ['nar', 'Sóng cát dựng đứng. Một yêu quái mặt xanh, tóc đỏ rối bù, cổ đeo chuỗi chín đầu lâu, tay cầm bảo trượng nhảy vọt lên bờ.'],
      ['satang', 'Kẻ nào dám tới bờ Lưu Sa của ta? Đúng lúc ta đang đói!'],
      ['batgioi', 'Đói thì ăn đinh ba của lão Trư đây này!'],
      ['ngokhong', 'Con quỷ này lặn giỏi lắm. Đánh nó lên bờ, đừng để nó chui xuống nước!'],
    ],
    win: [
      ['nar', 'Mộc Tra Huệ Ngạn, đệ tử Quan Âm, giáng xuống bờ sông.'],
      ['satang', 'Bồ Tát dặn ta chờ người đi thỉnh kinh… Thì ra là các vị! Ta vốn là Quyển Liêm Đại Tướng, vì đánh vỡ chén lưu ly ở hội Bàn Đào mà bị đày xuống đây, bảy ngày lại bị phi kiếm đâm sườn một lần.'],
      ['duongtang', 'A di đà Phật. Từ nay con theo thầy, pháp danh là Sa Ngộ Tĩnh.'],
      ['nar', 'Sa Tăng tháo chuỗi đầu lâu, kết với hồ lô của Bồ Tát thành chiếc bè, đưa thầy trò vượt tám trăm dặm Lưu Sa.'],
      ['satang', 'Hộ pháp, nhờ có người mà đệ được gột rửa tội lỗi. Đường còn dài, đệ sẽ gánh hành lý cho cả đoàn.'],
    ],
    next: 'Qua sông, trời đã tối. Phía trước có một trang viện đèn đuốc sáng trưng giữa nơi đồng không mông quạnh…',
  },
  'Bốn Thánh hiển hóa': {
    open: [
      ['giathi', 'Các vị sư từ Đông Thổ tới ư? Nhà ta giàu có, ruộng nghìn khoảnh, chỉ tiếc chồng mất sớm, còn ba đứa con gái Chân Chân, Ái Ái, Liên Liên chưa gả.'],
      ['giathi', 'Bốn thầy trò ở lại làm rể nhà ta, khỏi phải lặn lội sang Tây Thiên làm gì cho khổ.'],
      ['duongtang', 'Bần tăng một lòng hướng Phật, xin bà thứ lỗi.'],
      ['batgioi', 'Sư phụ không ở thì… lão Trư ở cũng được mà! Hì hì.'],
      ['nar', 'Đêm ấy Bát Giới lén ra sau nhà. Bà góa bảo hắn mặc thử chiếc áo lưới của các con gái…'],
      ['nar', 'Sáng ra, trang viện biến mất. Chỉ còn cánh rừng thông, và Bát Giới bị trói treo lơ lửng trên cành cây.'],
      ['laomau', 'Ta là Lê Sơn Lão Mẫu. Ba cô con gái là Quan Âm, Văn Thù, Phổ Hiền. Bốn Thánh hóa phép để thử lòng thiền của thầy trò đấy. Bát Giới, nhớ chưa? Ha ha!'],
      ['batgioi', 'Nhớ rồi, nhớ rồi! Lão Trư không dám nữa đâu… Hộ pháp ơi, cởi trói giúp với!'],
    ],
    next: 'Đi tiếp về phía tây, thầy trò tới núi Vạn Thọ, nơi có đạo quán Ngũ Trang của Trấn Nguyên Đại Tiên.',
  },
  'Ngũ Trang Quán': {
    open: [
      ['thanhphong', 'Sư phụ chúng con là Trấn Nguyên Đại Tiên, đi nghe giảng ở cung Di La. Trước khi đi người dặn: lấy hai quả Nhân Sâm mời Đường Tam Tạng.'],
      ['minhnguyet', 'Cây Nhân Sâm ba nghìn năm ra hoa, ba nghìn năm kết quả, ba nghìn năm mới chín. Ngửi một lần sống ba trăm sáu mươi tuổi, ăn một quả sống bốn vạn bảy nghìn năm.'],
      ['duongtang', 'Quả… quả này giống hệt đứa trẻ mới sinh! Bần tăng không dám ăn!'],
      ['batgioi', 'Thầy không ăn thì phí! Sư huynh, lấy kim kích tử khều trộm mấy quả đi…'],
      ['nar', 'Ngộ Không lẻn vào vườn, hái ba quả. Thanh Phong, Minh Nguyệt đếm thiếu, mắng chửi thầy trò không tiếc lời.'],
      ['ngokhong', 'Mắng Lão Tôn à? Được! Không ai ăn được nữa!'],
      ['nar', 'Ngộ Không vung gậy quật đổ cả cây Nhân Sâm. Trời vừa sáng, Trấn Nguyên Đại Tiên trở về.'],
    ],
    boss: [
      ['tranguyen', 'Khỉ đá! Ngươi phá cây tiên mà trời đất sinh ra từ thuở hỗn mang. Hôm nay không trồng lại được cây thì đừng hòng đi!'],
      ['ngokhong', 'Sư phụ, ống tay áo lão rộng như trời đất, Tụ Lý Càn Khôn đấy! Đừng để lão phẩy trúng!'],
      ['me', 'Để ta chặn ống tay áo, Đại Thánh đánh chính diện!'],
    ],
    win: [
      ['tranguyen', 'Bản lĩnh không tồi… Nhưng đánh thắng ta thì cây Nhân Sâm cũng không sống lại được.'],
      ['ngokhong', 'Lão Tôn sẽ đi khắp Bồng Lai, Phương Trượng, Doanh Châu tìm phương thuốc. Cứu được cây, lão phải thả sư phụ!'],
      ['nar', 'Phúc Lộc Thọ ở Bồng Lai, Đông Hoa Đế Quân ở Phương Trượng, Cửu Lão ở Doanh Châu… ai cũng lắc đầu. Ngộ Không đành bay về Nam Hải.'],
    ],
  },
  'Cứu cây Nhân Sâm': {
    open: [
      ['quanam', 'Con khỉ này lại gây chuyện. Thôi được, nước cam lộ trong tịnh bình của ta đã từng cứu sống cây dương liễu bị Lão Quân đốt khô.'],
      ['nar', 'Bồ Tát rảy cành dương liễu. Cây Nhân Sâm từ từ đứng thẳng, cành lá xanh tươi, ba mươi quả lại treo lủng lẳng.'],
      ['tranguyen', 'Bồ Tát đại từ! Hôm nay ta mở hội Nhân Sâm mời cả Bồ Tát lẫn thầy trò.'],
      ['tranguyen', 'Tôn Ngộ Không, ngươi phá cây ta, nhưng cũng vì cây ta mà lặn lội ba đảo tiên. Ta với ngươi kết làm huynh đệ!'],
      ['ngokhong', 'Ha ha, Lão Tôn có thêm một ông anh ở núi Vạn Thọ rồi!'],
    ],
    next: 'Rời Ngũ Trang Quán, đường lên Bạch Hổ Lĩnh vắng ngắt, đá trắng như xương phơi giữa nắng.',
  },
  'Đuổi Tâm Viên': {
    open: [
      ['duongtang', 'Đi cả ngày, bụng đói quá. Ngộ Không, con đi xin ít cơm chay về đây.'],
      ['nar', 'Ngộ Không vừa đi, một cô thôn nữ xinh xắn xách giỏ cơm bước tới.'],
      ['thonnu', 'Chồng ta làm ruộng trên núi, ta mang cơm cho chàng… Các sư cứ ăn trước, đừng ngại.'],
      ['batgioi', 'Sư phụ, người ta có lòng mà!'],
    ],
    boss: [
      ['ngokhong', 'Sư phụ, nó là yêu tinh! Hỏa Nhãn Kim Tinh của Lão Tôn không nhìn nhầm đâu!'],
      ['nar', 'Ngộ Không giáng gậy. Bạch Cốt Tinh hóa làn khói bỏ chạy, để lại cái xác giả. Rồi nó quay lại thành một bà lão tìm con gái, lần thứ ba thành một ông lão tìm vợ…'],
      ['me', 'Đây đều là một con yêu. Ta che chắn cho Đường Tăng, Đại Thánh cứ đánh!'],
      ['duongtang', 'Ngộ Không! Con giết liền ba mạng người!'],
    ],
    win: [
      ['nar', 'Gậy cuối cùng đập tan Bạch Cốt Tinh. Trên đất chỉ còn đống xương trắng, sống lưng có dòng chữ "Bạch Cốt Phu Nhân".'],
      ['batgioi', 'Sư phụ đừng tin. Sư huynh sợ bị niệm chú nên hóa phép ra đống xương đấy…'],
      ['duongtang', 'Con hung ác như vậy, ta không cần đồ đệ như con nữa. Đây là biếm thư, con đi đi!'],
      ['ngokhong', 'Sư phụ… Lão Tôn đi rồi, nhỡ yêu quái tới thì ai bảo vệ người?'],
      ['nar', 'Ngộ Không nhổ lông hóa ra ba thân nữa, cả bốn cùng quỳ bốn phía lạy thầy, rồi cưỡi mây bay về Hoa Quả Sơn.'],
      ['ngokhong', 'Hộ pháp, nhờ người trông sư phụ giúp Lão Tôn…'],
    ],
  },
  'Lạc nhau rừng Hắc Tùng': {
    open: [
      ['nar', 'Không có Ngộ Không dẫn đường, thầy trò lạc vào rừng Hắc Tùng. Thông đen đặc kín, giữa trưa mà tối như chạng vạng.'],
      ['tieuphu', 'Rừng này nhiều yêu lắm. Bát Giới đi xin cơm, Sa Tăng đi tìm Bát Giới, cả hai chưa thấy về…'],
      ['satang', 'Hộ pháp, đệ ở lại giữ sư phụ. Người mở đường giúp đệ, quét sạch đám yêu đang vây quanh!'],
    ],
    win: [
      ['nar', 'Tiếng chuông xa vọng lại. Đường Tăng lần theo tiếng chuông, tới trước một ngọn tháp vàng… đó là động Ba Nguyệt của Hoàng Bào Quái.'],
    ],
  },
  'Đưa thư nước Bảo Tượng': {
    open: [
      ['congchua', 'Thánh tăng đừng sợ. Ta là Bách Hoa Tu, con gái vua Bảo Tượng. Mười ba năm trước, đêm rằm ngắm trăng, ta bị Hoàng Bào Quái cuốn về động này.'],
      ['congchua', 'Ta đã sinh cho hắn hai đứa con, nhưng ngày nào cũng nhớ phụ vương. Xin Thánh tăng mang bức thư này về nước Bảo Tượng.'],
      ['duongtang', 'Bần tăng nhất định chuyển tới.'],
      ['congchua', 'Hộ pháp, ta sẽ nói với hắn là thả các người vì ta làm phúc. Đi mau, kẻo hắn đổi ý!'],
    ],
    win: [
      ['nar', 'Vua Bảo Tượng đọc thư, khóc ròng, xin thầy trò cứu công chúa. Bát Giới và Sa Tăng ra trận, Sa Tăng bị bắt.'],
      ['nar', 'Hoàng Bào Quái hóa thành một chàng trai tuấn tú, vào triều tự xưng phò mã…'],
    ],
  },
  'Hóa hổ trên điện Kim Loan': {
    open: [
      ['hoangbao', 'Bệ hạ! Hòa thượng kia là hổ tinh, chính nó đã bắt công chúa! Để thần cho bệ hạ xem nguyên hình.'],
      ['nar', 'Hắn ngậm nước phun một ngụm, Đường Tăng hóa thành con hổ vằn, bị nhốt vào cũi sắt.'],
      ['bachlongma', 'Sư phụ! Ta hóa thành cung nữ múa kiếm hành thích hắn, nhưng đánh không lại… Bát Giới, chỉ còn một cách: lên Hoa Quả Sơn mời Đại sư huynh về!'],
      ['batgioi', 'Lão Trư bị đuổi khéo đây… Thôi được, đi thì đi. Ta sẽ nói con yêu bảo nó không sợ Tôn Ngộ Không!'],
      ['ngokhong', 'Hừ! Con yêu nào dám coi thường Lão Tôn? Sư phụ có nạn, Lão Tôn đi ngay!'],
    ],
    boss: [
      ['hoangbao', 'Tôn Ngộ Không? Ngươi bị đuổi rồi còn quay lại à?'],
      ['ngokhong', 'Thầy đuổi thì là việc của thầy trò ta. Ngươi bắt thầy ta thì là việc của cây gậy này!'],
    ],
    win: [
      ['nar', 'Hoàng Bào Quái biến mất giữa trời. Ngộ Không lên Thiên Cung tra sổ: sao Khuê Mộc Lang trong Nhị Thập Bát Tú vắng mặt đã mười ba ngày, tức mười ba năm dưới trần.'],
      ['ngokhong', 'Thì ra là Khuê Mộc Lang trốn xuống trần làm yêu! Ngọc Đế phạt hắn đi đốt lò cho Lão Quân rồi.'],
      ['nar', 'Ngộ Không phun nước giải phép. Đường Tăng trở lại hình người, nắm tay Ngộ Không không nói nên lời.'],
      ['duongtang', 'Ngộ Không… là thầy sai rồi.'],
    ],
    next: 'Thầy trò lại lên đường. Mùa thu tới, phía trước là núi Bình Đỉnh cao chót vót.',
  },
  'Núi Bình Đỉnh gặp ma': {
    open: [
      ['tieuphu', 'Các sư dừng bước! Núi này có động Liên Hoa, hai yêu vương Kim Giác, Ngân Giác có năm món bảo bối, chuyên chờ bắt Đường Tăng để ăn thịt.'],
      ['ngokhong', 'Lão tiều này… là Nhật Trị Công Tào hóa thân báo tin. Đa tạ!'],
      ['nar', 'Giữa đường có một đạo sĩ ngã gãy chân, kêu cứu thảm thiết. Đường Tăng bảo Ngộ Không cõng ông ta.'],
    ],
    boss: [
      ['ngangiac', 'Tu Di Sơn, Nga Mi Sơn, Thái Sơn! Đè!'],
      ['nar', 'Ba ngọn núi từ trên trời rơi xuống, đè chặt Ngộ Không. Đạo sĩ hiện nguyên hình Ngân Giác Đại Vương, cuốn Đường Tăng đi.'],
      ['me', 'Thả Thánh tăng ra! Để ta đánh tới khi Đại Thánh thoát ra được!'],
    ],
    win: [
      ['nar', 'Sơn thần, Thổ địa vội dời ba ngọn núi. Ngộ Không vọt ra, mắt bốc lửa.'],
      ['ngokhong', 'Hai tiểu yêu Tinh Tế Quỷ và Linh Lợi Trùng đang ôm hồ lô Tử Kim đi bắt Lão Tôn đấy. Để Lão Tôn lừa chúng một vố!'],
    ],
  },
  'Treo ở động Liên Hoa': {
    open: [
      ['ngokhong', 'Hồ lô của các ngươi chỉ hút được người. Hồ lô của Lão Tôn hút được cả trời! Có đổi không?'],
      ['tieuyeu', 'Thật à? Đổi! Đổi ngay!'],
      ['nar', 'Ngộ Không xin Ngọc Đế mượn trời tối nửa canh giờ. Hai tiểu yêu tưởng thật, đổi luôn hồ lô Tử Kim lẫn tịnh bình Dương Chi.'],
    ],
    boss: [
      ['kimgiac', 'Tôn Hành Giả! Ta gọi tên, ngươi có dám thưa không?'],
      ['ngokhong', 'Gọi "Giả Hành Giả" thì Lão Tôn thưa, xem cái hồ lô của ngươi làm gì được!'],
      ['me', 'Cẩn thận! Hồ lô ấy gọi tên ai mà người đó thưa là bị hút vào!'],
    ],
    win: [
      ['nar', 'Ngân Giác bị chính hồ lô hút vào hóa nước. Kim Giác thua chạy, Ngộ Không cứu Đường Tăng đang bị treo trong động.'],
      ['laoquan', 'Đại Thánh dừng tay! Hai đứa này là đồng tử giữ lò vàng lò bạc của ta. Quan Âm mượn chúng để thử lòng thầy trò đó.'],
      ['ngokhong', 'Lại là thử! Lão quan già, mang bảo bối với đồng tử về đi!'],
      ['laoquan', 'Hồ lô đựng tiên đan, tịnh bình đựng nước, kiếm luyện ma, quạt quạt lửa, dây buộc áo… Đủ cả rồi. Ha ha.'],
    ],
    next: 'Thầy trò đến chùa Bảo Lâm ở nước Ô Kê, xin nghỉ qua đêm. Đêm ấy, một bóng người ướt sũng hiện ra bên giường Đường Tăng…',
  },
  'Cứu vua nước Ô Kê': {
    open: [
      ['vuaoke', 'Thánh tăng đừng sợ. Trẫm là vua Ô Kê. Năm năm trước nước hạn, một đạo sĩ Toàn Chân cầu được mưa, trẫm kết làm anh em.'],
      ['vuaoke', 'Ba năm trước, hắn đẩy trẫm xuống giếng bát giác trong ngự uyển, rồi hóa thành trẫm ngồi lên ngai vàng. Đến hoàng hậu, thái tử cũng không ai hay.'],
      ['vuaoke', 'Đây là ngọc khuê làm tin. Mai thái tử đi săn ngoài thành, xin Thánh tăng đưa cho nó.'],
      ['nar', 'Sáng hôm sau, Ngộ Không hóa con thỏ trắng dụ thái tử vào chùa.'],
      ['thaitu', 'Ngọc khuê của phụ vương… Mẫu hậu từng nói, ba năm nay phụ vương lạnh như băng, chưa từng gần ai…'],
      ['batgioi', 'Lão Trư lặn xuống giếng vớt xác vua lên. Long Vương giếng giữ xác bằng định nhan châu, ba năm vẫn như người ngủ!'],
      ['ngokhong', 'Lão Tôn lên cung Đâu Suất xin Lão Quân một viên Cửu Chuyển Hoàn Hồn Đan.'],
    ],
    win: [
      ['vuaoke_song', 'Trẫm… trẫm sống lại rồi! Đa tạ Thánh tăng, đa tạ các vị!'],
    ],
  },
  'Bị ma hóa thân': {
    boss: [
      ['nar', 'Trên điện vàng, hai vị vua giống hệt nhau đứng đối mặt. Văn võ bá quan không biết ai thật ai giả.'],
      ['giavuong', 'Lũ hòa thượng yêu thuật! Ngự lâm quân, bắt chúng lại!'],
      ['ngokhong', 'Đừng chạy! Hộ pháp, chặn hắn lại!'],
    ],
    win: [
      ['vanthu', 'Ngộ Không dừng tay. Đây là con sư tử lông xanh ta cưỡi.'],
      ['vanthu', 'Xưa vua Ô Kê thích làm việc thiện, Phật Tổ sai ta hóa thành sư đến độ. Vua không nhận ra, trói ta ngâm dưới sông ba ngày. Nay sư tử ngâm vua ba năm, đó là quả báo.'],
      ['ngokhong', 'Quả báo thì quả báo, nhưng sư tử của Bồ Tát hại người thì Bồ Tát dắt về mà dạy!'],
      ['vuaoke_song', 'Trẫm xin nhường ngôi cho Thánh tăng… Không nhận ư? Vậy trẫm xin tiễn thầy trò ra tận biên giới.'],
    ],
    next: 'Qua nước Ô Kê, trước mặt là núi Hiệu. Một đám mây đỏ vần vũ trên đỉnh núi.',
  },
  'Núi Hiệu gặp yêu': {
    open: [
      ['ngokhong', 'Đám mây đỏ kia là yêu khí. Sư phụ cứ đi chậm thôi.'],
      ['hoayeu', 'Đại vương có lệnh: lục soát cả núi, thấy hòa thượng từ phương Đông thì bắt về động Hỏa Vân!'],
      ['batgioi', 'Bọn tiểu yêu này mặc áo lửa, đinh ba của lão Trư nóng cả tay!'],
    ],
    win: [
      ['nar', 'Bên đường, một đứa bé bị trói treo trên cây, khóc thảm thiết: "Cứu cháu với! Cướp giết cả nhà cháu rồi!"'],
      ['honghai_be', 'Ông sư ơi, cõng cháu về nhà với…'],
      ['ngokhong', 'Hừ, đứa bé này nặng như ngàn cân. Lão Tôn ném nó vào vách đá…'],
      ['nar', 'Một trận gió xoáy cuốn tung cát bụi. Khi gió tan, Đường Tăng đã biến mất.'],
    ],
  },
  'Gió cuốn Thánh tăng': {
    open: [
      ['nar', 'Ngộ Không gõ gậy xuống đất. Một đám sơn thần, thổ địa áo quần rách rưới chui lên, quỳ lạy.'],
      ['sonthan', 'Đại Thánh tha tội! Đứa bé ấy là Thánh Anh Đại Vương Hồng Hài Nhi, con của Ngưu Ma Vương và La Sát Nữ.'],
      ['sonthan', 'Nó tu luyện ba trăm năm ở núi Hỏa Diệm, luyện được Tam Muội Chân Hỏa. Bọn tiểu thần bị nó bắt trực đêm, thu tiền lễ, khổ không kể xiết.'],
      ['ngokhong', 'Ngưu Ma Vương à? Năm xưa Lão Tôn kết nghĩa với lão. Vậy thằng bé phải gọi ta bằng chú!'],
      ['me', 'Lửa ấy không phải lửa thường, Đại Thánh đừng chủ quan.'],
    ],
    next: 'Động Hỏa Vân ở khe Khô Tùng. Cửa động bốc lửa ngùn ngụt.',
  },
  'Tâm Viên bị hại': {
    boss: [
      ['honghai', 'Ngưu Ma Vương là cha ta thì sao? Ta chưa từng nghe có ông chú lông lá nào cả!'],
      ['nar', 'Hồng Hài Nhi đấm vào mũi mình, năm chiếc xe lửa bốc cháy. Tam Muội Chân Hỏa phun ra cuồn cuộn.'],
      ['ngokhong', 'Lão Tôn mời Đông Hải Long Vương làm mưa rồi! Ơ… nước mưa lại làm lửa bùng to hơn!'],
      ['me', 'Đừng dùng thủy pháp! Lửa này gặp nước càng mạnh. Đánh thẳng vào nó!'],
    ],
    win: [
      ['nar', 'Ngộ Không bị khói lửa xông vào mắt, nhảy xuống suối lạnh, lửa nóng gặp nước lạnh làm tim ngừng đập.'],
      ['batgioi', 'Sư huynh! Sư huynh tỉnh lại đi!'],
      ['nar', 'Bát Giới xoa bóp mãi, Ngộ Không mới thở ra một hơi. Bát Giới đi mời Quan Âm, giữa đường bị Hồng Hài Nhi giả làm Bồ Tát lừa vào bao da.'],
      ['ngokhong', 'Lão Tôn đi Nam Hải. Lần này phải mời đúng Bồ Tát thật!'],
    ],
  },
  'Mời thánh hàng yêu': {
    open: [
      ['quanam', 'Con yêu dám giả dạng ta? Ngộ Không, ta đi cùng ngươi.'],
      ['nar', 'Bồ Tát mượn ba mươi sáu thanh thiên cương đao của Thác Tháp Thiên Vương, hóa thành tòa sen nghìn cánh.'],
      ['honghai', 'Ha, tòa sen đẹp thế! Để ta ngồi thử!'],
      ['nar', 'Hồng Hài Nhi vừa ngồi lên, cánh sen hóa lại thành mũi đao xuyên chân. Bồ Tát ném năm chiếc vòng vàng, một vòng vào cổ, bốn vòng vào tay chân.'],
      ['quanam', 'Đứa trẻ này có căn cơ. Từ nay nó là Thiện Tài Đồng Tử, theo hầu ta ở Lạc Già Sơn.'],
      ['honghai', 'Á! Vòng siết đau quá! Con… con xin quy y!'],
    ],
    next: 'Một tháng sau, thầy trò tới bờ sông Hắc Hà. Nước sông đen như mực, sóng cuộn ầm ầm.',
  },
  'Chìm sông Hắc Hà': {
    open: [
      ['ngudan', 'Sông này nước đen, chẳng ai dám lái đò. Có một người chèo chiếc thuyền con đến đón khách, nhưng chở rồi ít khi thấy về…'],
      ['nar', 'Một chiếc thuyền nhỏ ghé bờ. Người lái đò nói thuyền chỉ chở được hai người. Đường Tăng và Bát Giới bước lên trước.'],
      ['nar', 'Ra tới giữa dòng, sóng đen dựng đứng, thuyền lật úp. Cả người lẫn thuyền chìm nghỉm.'],
      ['satang', 'Nước là chỗ của đệ. Hộ pháp, cùng đệ xuống đáy sông!'],
    ],
    boss: [
      ['dalong', 'Ta là cháu Tây Hải Long Vương. Đang định mời cậu ăn thịt Đường Tăng mừng thọ, các ngươi đến phá đám à?'],
      ['satang', 'Yêu long! Trả sư phụ ta đây!'],
    ],
    win: [
      ['mangang', 'Ta là Ma Ngang, thái tử Tây Hải. Phụ vương sai ta tới bắt tên em họ hư hỏng này. Đại Thánh, đừng giận Tây Hải.'],
      ['dalong', 'Anh họ tha cho em…'],
      ['nar', 'Ma Ngang trói Đà Long đem về Tây Hải chịu tội. Hà Thần rẽ nước đen, mở một lối đi cho thầy trò qua sông.'],
    ],
    next: 'Bên kia sông là nước Xa Trì. Vừa vào thành, đã nghe tiếng hò kéo xe và tiếng roi quất đen đét.',
  },
  'Khuân vác ở Xa Trì': {
    open: [
      ['tangnhan', 'Các sư mau trốn đi! Hai mươi năm trước nước hạn, ba vị quốc sư Hổ Lực, Lộc Lực, Dương Lực cầu được mưa. Từ đó nhà vua tin đạo, bắt hết tăng nhân làm nô lệ.'],
      ['tangnhan', 'Năm trăm sư huynh đệ phải kéo xe gạch đá lên dốc dựng đạo quán. Chết đã quá nửa, ai trốn cũng bị bắt về.'],
      ['daodong', 'Lũ trọc kia! Kéo nhanh lên, chậm là ăn roi!'],
      ['ngokhong', 'Hộ pháp, dẹp hết bọn đạo đồng cầm roi kia. Lão Tôn phá mấy cái xe!'],
    ],
    win: [
      ['nar', 'Ngộ Không nhổ năm trăm sợi lông, phát cho mỗi tăng nhân một sợi: hễ bị bắt thì gọi "Tề Thiên Đại Thánh", lập tức có một Ngộ Không hiện ra che chở.'],
      ['tangnhan', 'Đại Thánh! Tối qua chúng con nằm mơ thấy Thái Bạch Kim Tinh báo có người cứu. Thì ra là thật!'],
    ],
  },
  'Đánh cuộc thắng thua': {
    open: [
      ['vuaxatri', 'Các ngươi là hòa thượng mà dám đánh đạo đồng? Quốc sư, hãy cho chúng thấy pháp lực của Đạo môn!'],
      ['holuc', 'Bệ hạ, thần xin đấu phép với chúng: cầu mưa, ngồi thiền trên đài cao, đoán vật trong tủ. Thua thì chém đầu!'],
      ['nar', 'Hổ Lực đánh lệnh bài gọi gió mưa. Ngộ Không bay lên trời giữ chân Phong Bà, Lôi Công, Long Vương. Gậy chỉ đâu, mưa đổ đó.'],
      ['nar', 'Đường Tăng ngồi thiền trên đài năm mươi chiếc bàn, Ngộ Không hóa con rệp cắn lại kẻ cắn trộm. Trong tủ, bộ áo gấm hóa thành áo rách, quả đào chỉ còn cái hạt, đạo đồng hóa thành chú tiểu.'],
    ],
    boss: [
      ['holuc', 'Thua cuộc thì chơi tới cùng! Chém đầu mà vẫn mọc lại mới là đại pháp!'],
      ['ngokhong', 'Chém đầu ư? Lão Tôn chơi!'],
      ['me', 'Đầu hắn lăn xuống… có con chó vàng ngoạm chạy mất! Giờ là lúc ra tay!'],
    ],
    win: [
      ['nar', 'Không mọc được đầu, Hổ Lực Đại Tiên ngã xuống, hiện nguyên hình con hổ vằn không đầu.'],
      ['vuaxatri', 'Quốc sư… là hổ tinh ư?'],
    ],
  },
  'Diệt đạo hưng tăng': {
    boss: [
      ['duongluc', 'Đại ca chết oan! Ta mổ bụng, ta xuống chảo dầu sôi, xem con khỉ kia có dám không!'],
      ['ngokhong', 'Mổ bụng thì Lão Tôn rửa ruột cho sạch. Xuống dầu thì Lão Tôn tắm cho ấm!'],
      ['me', 'Hai con yêu này dùng tà thuật. Đánh lộ nguyên hình chúng!'],
    ],
    win: [
      ['nar', 'Lộc Lực mổ bụng, chim ưng quắp mất ruột, hiện hình con hươu trắng. Dương Lực ngồi chảo dầu, mất con rồng lạnh hộ thân, hiện hình con linh dương.'],
      ['vuaxatri', 'Hai mươi năm trẫm mê muội… Từ nay Phật đạo cùng tôn, trả tự do cho tất cả tăng nhân!'],
      ['ngokhong', 'Nhớ đấy: đạo cũng tôn, tăng cũng kính, nhân tài cũng phải trọng. Như thế mới vững giang sơn!'],
      ['tangnhan', 'Nam mô A di đà Phật! Chúng con được sống rồi!'],
    ],
    next: 'Rời Xa Trì, trời đã sang đông. Phía trước là sông Thông Thiên mênh mông, gió lạnh thổi buốt da.',
  },

  // ============================ ĐỢT 3 · HỒI 47 – 71 ============================
  'Gặp nước lớn': {
    open: [
      ['nar', 'Sông Thông Thiên rộng tám trăm dặm, sóng bạc mênh mang. Bên bờ có Trần Gia Trang, đèn đuốc sáng trưng, tiếng tụng kinh cầu siêu vọng ra.'],
      ['tranlao', 'Thánh tăng không biết đấy thôi. Bên sông có miếu Linh Cảm Đại Vương. Mỗi năm làng phải nộp một đồng nam, một đồng nữ cho ngài ăn thì mới được mưa thuận gió hòa.'],
      ['tranlao', 'Năm nay đến lượt cháu trai Trần Quan Bảo và cháu gái Nhất Xứng Kim nhà lão… Lão làm lễ cầu siêu sẵn cho chúng rồi.'],
      ['ngokhong', 'Lão đừng khóc. Lão Tôn hóa thành thằng bé, Bát Giới hóa thành con bé, để bọn ta vào miếu ngồi thay!'],
      ['batgioi', 'Hóa con gái à… Thôi được, lão Trư làm một lần cho dân làng vậy.'],
      ['me', 'Ta nấp sau bàn thờ. Con yêu vừa thò tay là ta ra tay.'],
    ],
    win: [
      ['nar', 'Nửa đêm, gió tanh nổi lên. Con yêu vừa vươn tay bắt "đồng nữ", Bát Giới hiện hình cào một đinh ba, nó bỏ chạy, rơi lại hai cái vảy to bằng cái đĩa.'],
    ],
  },
  'Rơi xuống sông Thiên Hà': {
    open: [
      ['nar', 'Sáng hôm sau trời rét buốt, mặt sông Thông Thiên đóng băng dày như đá. Đoàn lái buôn dắt ngựa đi trên băng sang bờ tây.'],
      ['duongtang', 'Trời giúp ta rồi! Đi theo đoàn buôn mà qua sông thôi.'],
      ['ngokhong', 'Sư phụ khoan! Mùa này sao lại đóng băng giữa chừng được…'],
      ['nar', 'Vừa ra tới giữa sông, mặt băng nứt toác. Đường Tăng rơi tõm xuống nước, bị kéo thẳng về phủ Thủy Nguyên dưới đáy sông.'],
    ],
    boss: [
      ['linhcam', 'Ăn được thịt Đường Tăng là trường sinh bất lão! Lũ hòa thượng các ngươi dưới nước thì làm gì được ta?'],
      ['satang', 'Dưới nước là chỗ của đệ. Hộ pháp, cùng đệ dụ nó lên mặt sông cho Đại sư huynh đánh!'],
    ],
    win: [
      ['linhcam', 'Đau quá! Ta đóng cửa phủ lại, xem các ngươi làm gì được!'],
      ['ngokhong', 'Con yêu này rúc vào phủ không chịu ra. Lão Tôn đi Nam Hải hỏi gốc tích nó.'],
    ],
  },
  'Quan Âm giỏ cá hiện thân': {
    open: [
      ['nar', 'Bồ Tát chưa kịp trang điểm, tóc chưa búi, ngồi giữa rừng trúc tím đan một chiếc giỏ tre.'],
      ['quanam', 'Ta biết rồi. Con cá vàng trong ao sen của ta ngày ngày ngoi lên nghe kinh, luyện thành tinh. Hôm nước triều dâng, nó trốn xuống sông Thông Thiên.'],
      ['nar', 'Bồ Tát thả giỏ xuống sông, niệm: "Chết thì đi, sống thì ở". Kéo giỏ lên, một con cá vàng quẫy đuôi trong đó.'],
      ['quanam', 'Chiếc chùy đồng nó dùng là nụ sen trong ao ta, nó luyện thành binh khí. Ta mang nó về.'],
      ['lao_ngoan', 'Thánh tăng! Phủ Thủy Nguyên vốn là nhà của lão, bị con cá ấy chiếm mất. Để lão cõng thầy trò qua sông, chỉ xin nhờ Thánh tăng hỏi Phật Tổ giúp: bao giờ lão mới tu thành người?'],
      ['duongtang', 'Bần tăng xin ghi nhớ.'],
    ],
    next: 'Qua sông, trời vào đông. Trên núi Kim Đâu tuyết phủ trắng, Ngộ Không đi xin cơm, lấy gậy vạch một vòng tròn quanh thầy trò…',
  },
  'Núi Kim Đâu gặp yêu': {
    open: [
      ['ngokhong', 'Vòng tròn này còn chắc hơn tường đồng vách sắt. Sư phụ đừng bước ra ngoài nửa bước!'],
      ['batgioi', 'Ngồi trong cái vòng giữa gió lạnh làm gì… Đằng kia có cái nhà lớn, vào tránh rét đi sư phụ.'],
      ['nar', 'Trong nhà không một bóng người, chỉ có ba chiếc áo gấm treo trên vách. Bát Giới mặc thử, áo lập tức hóa dây trói chặt cả người.'],
      ['me', 'Bẫy rồi! Yêu quái kéo tới đông quá, ta chặn chúng lại!'],
    ],
    win: [
      ['nar', 'Ngộ Không trở về thì vòng tròn trống trơn. Thầy trò đã bị bắt về động Kim Đâu.'],
    ],
  },
  'Thiên thần khó phục': {
    boss: [
      ['docgiac', 'Tôn Ngộ Không à? Ta có một vòng Kim Cương, thứ gì ném tới cũng bị thu hết!'],
      ['nar', 'Chiếc vòng trắng vụt lên, thu mất gậy Như Ý. Na Tra mang sáu món binh khí tới, cũng bị thu. Hỏa Đức Tinh Quân phóng lửa, Thủy Đức Tinh Quân dâng nước, mười tám La Hán rải cát vàng… tất cả đều bị thu sạch.'],
      ['nata', 'Cái vòng này không phải vật thường! Hộ pháp, đừng ném bảo bối vào nó, đánh bằng tay không!'],
    ],
    win: [
      ['docgiac', 'Ha! Đánh thắng ta thì đã sao? Vòng Kim Cương vẫn trong tay ta.'],
      ['ngokhong', 'Con trâu yêu này lai lịch không nhỏ. Lão Tôn lên Linh Sơn hỏi Như Lai.'],
    ],
  },
  'Hỏi Phật căn nguyên': {
    open: [
      ['nar', 'Như Lai chỉ nói: "Ta biết con yêu đó, nhưng không tiện nói. Ngươi lên cung Đâu Suất hỏi Lão Quân."'],
      ['laoquan', 'Trâu xanh của ta đâu rồi? Ồ… đồng tử ăn trộm đan bảy ngày, ngủ quên mất, để nó cắn đứt dây trốn xuống trần, lấy cả vòng Kim Cương của ta.'],
      ['laoquan', 'Vòng ấy là năm xưa ta ném trúng đầu ngươi ở Thiên Cung đấy, Ngộ Không còn nhớ không?'],
      ['nar', 'Lão Quân phẩy quạt Ba Tiêu. Con yêu ngoan ngoãn hiện nguyên hình con trâu xanh, vòng Kim Cương thành chiếc vòng xỏ mũi.'],
      ['ngokhong', 'Đồ đạc của thiên binh, của Na Tra, của La Hán đều về chủ cũ cả rồi. Sư phụ, đi thôi!'],
    ],
    next: 'Đầu xuân, thầy trò tới một con sông nước trong vắt. Đường Tăng khát nước, Bát Giới vốc một bát uống cùng…',
  },
  'Uống nước bị độc': {
    open: [
      ['duongtang', 'Ối… bụng ta đau quặn, lại phình to lên thế này?'],
      ['batgioi', 'Bụng lão Trư cũng có cái gì cựa quậy!'],
      ['baba', 'Ha ha! Các ông uống nước sông Tử Mẫu rồi! Nước Tây Lương không có đàn ông, đàn bà tới hai mươi tuổi uống nước sông này là có thai.'],
      ['baba', 'Muốn giải thì lấy nước suối Lạc Thai ở động Giải Dương. Nhưng Như Ý Chân Tiên canh suối, hắn là em Ngưu Ma Vương, còn đang giận vụ Hồng Hài Nhi đấy.'],
      ['ngokhong', 'Lại là nhà Ngưu Ma! Sa Tăng, đệ múc nước, Lão Tôn cầm chân hắn.'],
      ['nar', 'Nửa ngày sau, Sa Tăng mang về một bình nước suối. Uống xong, bụng thầy trò xẹp hẳn.'],
    ],
  },
  'Tây Lương giữ cưới': {
    open: [
      ['nuquan', 'Nữ Vương có lời mời Ngự đệ vào cung. Đàn ông từ Đông Thổ tới, cả trăm năm nay nước ta mới thấy.'],
      ['nuvuong', 'Trẫm nguyện dâng cả giang sơn, chỉ mong Ngự đệ ở lại làm phu quân, ba đồ đệ đi Tây Thiên lấy kinh thay.'],
      ['duongtang', 'Ngộ Không… làm sao bây giờ?'],
      ['ngokhong', 'Sư phụ cứ nhận lời giả. Nữ Vương đóng ấn văn điệp xong, tiễn chúng con ra khỏi thành, lúc ấy thầy lên ngựa đi luôn.'],
      ['nuvuong', 'Ngự đệ… nhất định phải đi sao? Thôi được, trẫm đóng ấn văn điệp. Chỉ mong ngày sau Ngự đệ còn nhớ tới Tây Lương.'],
      ['nar', 'Ra tới cổng thành, một ả yêu nữ từ bên đường vọt ra, cuốn một trận gió đen bắt Đường Tăng đi mất.'],
    ],
  },
  'Chịu khổ động Tỳ Bà': {
    boss: [
      ['bocap', 'Ngự đệ đẹp trai thế này, ở với ta trong động Tỳ Bà không phải tốt hơn sao?'],
      ['nar', 'Cái đuôi móc độc vung lên. Ngộ Không bị chích vào đầu, Bát Giới bị chích vào môi, đau rát không chịu nổi.'],
      ['ngokhong', 'Đảo Mã Độc Thung! Năm xưa nó chích cả ngón tay Như Lai… Hộ pháp, tránh cái đuôi!'],
    ],
    win: [
      ['nar', 'Quan Âm hiện ra mách: "Phải mời Mão Nhật Tinh Quan ở cung Quang Minh."'],
      ['maonhat', 'Bản thể ta là con gà trống hai mào. Bò cạp sợ nhất tiếng gà!'],
      ['nar', 'Tinh Quan hiện nguyên hình gà trống, gáy một tiếng, Bò Cạp Tinh hiện hình. Gáy tiếng thứ hai, nó chết ngay trước cửa động.'],
    ],
    next: 'Lại lên đường. Giữa núi, một bọn cường đạo xông ra cướp. Ngộ Không vung gậy, đánh chết mấy tên…',
  },
  'Lại đuổi Tâm Viên': {
    open: [
      ['duongtang', 'Lần trước con giết yêu, thầy còn hiểu lầm. Lần này là người thật, con cũng giết! Đi đi, thầy không có đồ đệ như con!'],
      ['nar', 'Ngộ Không về Nam Hải khóc với Bồ Tát. Không ngờ một Ngộ Không khác quay lại, đánh Đường Tăng ngất đi, cướp luôn hành lý.'],
      ['duongtang', 'Hộ pháp… sao Ngộ Không lại đánh thầy? Còn cướp cả văn điệp?'],
      ['satang', 'Đệ lên Hoa Quả Sơn hỏi cho ra lẽ!'],
      ['nar', 'Trên Hoa Quả Sơn, một "Tôn Ngộ Không" đang đọc văn điệp, bên cạnh có "Đường Tăng", "Bát Giới", "Sa Tăng" giả, đòi tự mình đi thỉnh kinh.'],
      ['satang', 'Ta mới là Sa Tăng! Đồ giả mạo!'],
    ],
  },
  'Khó phân biệt Mỹ Hầu': {
    boss: [
      ['nar', 'Hai Ngộ Không giống hệt nhau từ lông mày đến giọng nói, đánh nhau từ Nam Hải lên Thiên Cung, xuống tận Âm Phủ.'],
      ['lucnhi', 'Ta mới là Tề Thiên Đại Thánh!'],
      ['ngokhong', 'Nói bậy! Ta mới là Tề Thiên Đại Thánh!'],
      ['nar', 'Quan Âm niệm chú Khẩn Cô, cả hai cùng ôm đầu lăn lộn. Gương chiếu yêu của Thác Tháp Thiên Vương cũng không phân biệt nổi. Chỉ có Như Lai nhận ra: đó là Lục Nhĩ Mỹ Hầu, nghe rộng biết nhiều, ngàn dặm bên ngoài cũng nghe thấy.'],
      ['me', 'Như Lai đã chỉ rồi! Đánh con có sáu tai!'],
    ],
    win: [
      ['nar', 'Như Lai úp bát vàng chụp lấy. Lục Nhĩ Mỹ Hầu hiện nguyên hình, bị Ngộ Không giáng một gậy chết tại chỗ.'],
      ['quanam', 'Ngộ Không đã một lòng hộ thầy. Đường Tăng, hãy nhận lại đồ đệ.'],
      ['duongtang', 'Ngộ Không, thầy sai rồi… Từ nay thầy trò đừng xa nhau nữa.'],
    ],
    next: 'Càng đi về tây, trời càng nóng như lò lửa, dù đang là mùa thu.',
  },
  'Hỏa Diệm Sơn cản đường': {
    open: [
      ['laonhan', 'Phía trước là núi Hỏa Diệm, lửa cháy tám trăm dặm, cỏ không mọc nổi một ngọn. Người đồng cũng chảy ra nước.'],
      ['thodia', 'Đại Thánh còn nhớ không? Năm xưa Đại Thánh đạp đổ lò Bát Quái của Lão Quân, mấy viên gạch lò rơi xuống đây hóa thành núi lửa. Tiểu thần vốn là đạo nhân giữ lò, bị phạt xuống làm thổ địa ở đây.'],
      ['ngokhong', 'Hóa ra là Lão Tôn gây ra! Thế dập lửa thế nào?'],
      ['laonhan', 'Phải mượn quạt Ba Tiêu của Thiết Phiến Công Chúa ở động Ba Tiêu, núi Thúy Vân. Nhưng nàng là vợ Ngưu Ma Vương, mẹ Hồng Hài Nhi, đang giận Đại Thánh lắm.'],
    ],
    next: 'Động Ba Tiêu ở núi Thúy Vân. Ngộ Không gọi cửa, xưng là chú Hồng Hài Nhi…',
  },
  'Xin quạt Ba Tiêu': {
    boss: [
      ['thietphien', 'Ngươi hại con ta làm đồng tử cho Quan Âm, ta không được gặp nó nữa, còn dám tới mượn quạt?'],
      ['nar', 'Nàng phẩy quạt một cái, Ngộ Không bị thổi bay năm vạn dặm tới núi Tiểu Tu Di. Linh Cát Bồ Tát tặng một viên Định Phong Đan, Ngộ Không ngậm vào rồi quay lại.'],
      ['ngokhong', 'Lần này Lão Tôn hóa con sâu, chui vào chén trà của nàng!'],
      ['me', 'Đại Thánh trong bụng nàng rồi. Ta đánh bên ngoài!'],
    ],
    win: [
      ['thietphien', 'Đau quá! Chú ơi tha cho ta… Quạt đây, quạt đây!'],
      ['nar', 'Quạt được mang ra, nhưng phẩy một cái, lửa lại bùng cao thêm. Đó là quạt giả.'],
      ['ngokhong', 'Lại bị lừa! Phải tìm Ngưu Ma Vương. Lão đang ở động Ma Vân núi Tích Lôi với Ngọc Diện Công Chúa.'],
      ['nar', 'Ngộ Không hóa thành Ngưu Ma Vương về động Ba Tiêu, lấy được quạt thật. Ngưu Ma Vương lại hóa thành Bát Giới đòi lại quạt…'],
    ],
  },
  'Trói Ma Vương': {
    boss: [
      ['nguuma', 'Tôn Ngộ Không! Ngươi hại con ta, lừa vợ ta, nay còn đòi quạt. Năm xưa kết nghĩa coi như bỏ!'],
      ['bachnguu', 'Xem ta hiện chân thân! Sừng ta như tháp sắt, ta húc đổ cả núi Hỏa Diệm!'],
      ['ngokhong', 'Lão Tôn cũng hóa thân to bằng trời! Hộ pháp, giữ chân con trâu trắng!'],
      ['nar', 'Thiên binh, Phật tướng, Thác Tháp Thiên Vương và Na Tra từ bốn phương kéo tới, vây kín Ngưu Ma.'],
    ],
    win: [
      ['nar', 'Na Tra chém đầu nào, đầu mới lại mọc ra. Kiếm lửa thiêu đỏ cả thân trâu, chiếc gương chiếu yêu soi chặt không cho biến hóa. Ngưu Ma Vương quỳ xuống xin hàng.'],
      ['thietphien', 'Xin tha cho chồng ta. Quạt thật đây.'],
      ['nar', 'Ngộ Không phẩy liền bốn mươi chín cái. Mưa rơi tầm tã, lửa Hỏa Diệm Sơn tắt mãi mãi.'],
      ['laonhan', 'Lửa tắt rồi! Từ nay có thể trồng lúa rồi! Đa tạ Đại Thánh!'],
    ],
    next: 'Qua Hỏa Diệm Sơn là nước Tế Tái. Ngoài cổng thành, một đoàn hòa thượng đeo gông xích đang đi xin ăn.',
  },
  'Quét tháp thành Tế Tái': {
    open: [
      ['tangkq', 'Chùa Kim Quang chúng con có ngọn tháp báu, trên đỉnh có xá lợi phát hào quang, các nước bốn phương đều tới triều cống.'],
      ['tangkq', 'Ba năm trước, một trận mưa máu trút xuống, xá lợi biến mất. Nhà vua đổ tội cho tăng chúng trộm, đánh chết mấy chục người, còn lại phải đeo gông.'],
      ['duongtang', 'Bần tăng có lời nguyện: gặp chùa thì thắp hương, gặp tháp thì quét tháp. Đêm nay thầy trò ta lên quét tháp.'],
      ['ngokhong', 'Tháp mười ba tầng, càng lên cao càng nghe tiếng rượu chè. Có yêu ở trên đỉnh!'],
    ],
    win: [
      ['nar', 'Trên đỉnh tháp, Ngộ Không bắt được hai con cá yêu, Bôn Ba Nhi Bá và Bá Ba Nhi Bôn.'],
      ['ngokhong', 'Khai mau! Ai sai các ngươi tới đây?'],
      ['nar', 'Chúng khai: Vạn Thánh Long Vương ở đầm Bích Ba và con rể Cửu Đầu Phò Mã đã trộm xá lợi, còn lấy cả cỏ linh chi chín lá trong vườn Vương Mẫu.'],
    ],
  },
  'Lấy bảo cứu tăng': {
    boss: [
      ['cuudau', 'Xá lợi và linh chi đều ở dưới đáy đầm của ta. Có giỏi thì xuống mà lấy!'],
      ['nar', 'Cửu Đầu Phò Mã hiện nguyên hình con chim chín đầu, mười tám cánh. Đầu nào cũng có mắt, bốn phía đều trông thấy.'],
      ['nhilang', 'Đại Thánh, Nhị Lang cùng Mai Sơn lục huynh đi săn qua đây. Để huynh đệ ta giúp một tay!'],
      ['me', 'Chín cái đầu, chín cái miệng. Đánh từng cái một!'],
    ],
    win: [
      ['nar', 'Hao Thiên Khuyển của Nhị Lang nhảy lên cắn đứt một cái đầu. Cửu Đầu Trùng máu me đầm đìa, bay về Bắc Hải. Bát Giới giết Vạn Thánh Long Vương.'],
      ['tangkq', 'Xá lợi về rồi! Tháp lại sáng rồi! Tăng chúng được tháo gông rồi!'],
      ['nar', 'Vua Tế Tái đổi tên chùa Kim Quang thành chùa Phục Long, khắc bia ghi công thầy trò.'],
    ],
    next: 'Ra khỏi Tế Tái, gai góc mọc kín tám trăm dặm. Đó là núi Kinh Cức.',
  },
  'Ngâm thơ rừng Kinh Cức': {
    open: [
      ['batgioi', 'Gai thế này, để lão Trư hóa to ra, lấy đinh ba cào một đường cho sư phụ đi!'],
      ['nar', 'Đi được nửa đường, một ông lão hiện ra, cuốn Đường Tăng tới Mộc Tiên Am giữa rừng. Bốn ông già đang ngồi làm thơ dưới trăng.'],
      ['nar', 'Bốn ông tự xưng Thập Bát Công, Cô Trực Công, Lăng Không Tử, Phất Vân Tẩu. Họ ngâm thơ, bàn đạo với Đường Tăng suốt đêm.'],
      ['hanhtien', 'Ta là Hạnh Tiên. Thánh tăng thơ hay quá… Thánh tăng ở lại cùng ta xướng họa trọn đời, có được không?'],
      ['duongtang', 'Bần tăng… bần tăng phải đi thỉnh kinh!'],
      ['nar', 'Trời sáng, Ngộ Không tìm tới. Mấy ông già hóa ra là cây thông, cây bách, cây cối, cây trúc, còn Hạnh Tiên là cây mơ. Bát Giới cào đổ hết.'],
      ['duongtang', 'Bát Giới! Họ có hại ai đâu…'],
      ['ngokhong', 'Để lâu thành yêu thì hại người, sư phụ ạ.'],
    ],
    next: 'Xa xa hiện ra một ngôi chùa vàng rực, trên biển đề ba chữ "Lôi Âm Tự". Đường Tăng mừng rỡ quỳ xuống lạy.',
  },
  'Gặp nạn Tiểu Lôi Âm': {
    open: [
      ['duongtang', 'Linh Sơn tới rồi! Ngộ Không, sao con còn không quỳ?'],
      ['ngokhong', 'Sư phụ nhìn kỹ đi, trên biển có thêm chữ "Tiểu". Đây là Tiểu Lôi Âm, yêu khí đầy trời!'],
    ],
    boss: [
      ['hoangmi', 'Tôn Ngộ Không thấy Phật mà không lạy sao? Bắt lấy!'],
      ['nar', 'Một đôi não bạt vàng từ trên không chụp xuống, nhốt chặt Ngộ Không. Kim Đầu Yết Đế, Cang Kim Long tới cứu. Cang Kim Long đâm sừng xuyên qua khe não bạt, Ngộ Không biến nhỏ, khoan lỗ trên sừng chui ra.'],
      ['me', 'Đại Thánh ra rồi! Đập vỡ não bạt, đánh con yêu giả Phật!'],
    ],
    win: [
      ['hoangmi', 'Đừng tưởng thắng! Ta còn có túi vải "Nhân Chủng Hậu Thiên"!'],
      ['nar', 'Chiếc túi tung lên, thu sạch Đường Tăng, Bát Giới, Sa Tăng, cả Nhị Thập Bát Tú và thiên binh tới cứu.'],
    ],
  },
  'Chư thần bị khốn': {
    open: [
      ['ngokhong', 'Túi của con yêu thu hết mọi người rồi. Hộ pháp, đánh tan đám tiểu yêu canh chùa, Lão Tôn lẻn vào cởi trói.'],
    ],
    win: [
      ['nar', 'Một ông Phật bụng to, cười híp mắt, tay cầm quạt hiện ra giữa đường.'],
      ['dilac', 'Đó là đồng tử mày vàng đánh khánh của ta, trộm túi vải và chiếc chày gõ khánh trốn xuống trần.'],
      ['dilac', 'Ngộ Không, ngươi hóa thành quả dưa chín. Ta giả làm ông lão trồng dưa, mời nó ăn.'],
      ['nar', 'Hoàng Mi Đại Vương ăn quả dưa, Ngộ Không ở trong bụng đấm đá loạn xạ. Hắn lăn lộn quỳ xuống trước Di Lặc. Di Lặc thu túi vải, dắt đồng tử về.'],
    ],
    next: 'Qua Thất Tuyệt Sơn tới làng Đà La. Cả làng bịt mũi, vì có một con ngõ toàn hồng thối dài tám trăm dặm…',
  },
  'Ngõ Hy Thị bẩn cản': {
    open: [
      ['danla', 'Núi Thất Tuyệt có bảy cái tuyệt: cây hồng sống lâu, rợp bóng, không tổ chim, không sâu bọ… Hồng rụng thối cả con ngõ Hy Thị, hôi không chịu nổi.'],
      ['danla', 'Gần đây lại có một con yêu mãng lớn, đêm nào cũng xuống làng bắt trâu bò, bắt cả người.'],
      ['ngokhong', 'Để Lão Tôn trừ con mãng xà trước!'],
    ],
    boss: [
      ['manxa', 'Xì… xì…'],
      ['nar', 'Một con mãng xà vảy đỏ dài cả trăm trượng, mắt như hai ngọn đèn lồng, há cái miệng đỏ lòm.'],
      ['ngokhong', 'Để Lão Tôn chui vào bụng nó, chống gậy lên làm cầu!'],
      ['me', 'Ta đánh phía đuôi, Bát Giới đánh phía đầu!'],
    ],
    win: [
      ['nar', 'Con mãng xà chết cứng. Bát Giới hiện thân thành con heo khổng lồ, ủi một mạch thông cả ngõ Hy Thị tám trăm dặm.'],
      ['batgioi', 'Hôi quá… nhưng lão Trư cũng có ích chứ nhỉ?'],
      ['danla', 'Đội ơn Thánh tăng! Cả làng xin làm cơm chay tiễn các vị!'],
    ],
    next: 'Tới nước Chu Tử, nghe nói nhà vua ốm đã ba năm, ngự y trong nước đều bó tay.',
  },
  'Chữa bệnh nước Chu Tử': {
    open: [
      ['nar', 'Ngộ Không bóc bảng chiêu hiền, vào cung, buộc ba sợi chỉ vàng vào cổ tay nhà vua để bắt mạch từ xa.'],
      ['ngokhong', 'Bệnh này gọi là "song điểu thất quần": vợ chồng chim bị lạc nhau, lo nghĩ mà thành bệnh.'],
      ['nar', 'Ngộ Không làm thuốc bằng đại hoàng, ba đậu, nhọ nồi và nước tiểu của Bạch Long Mã, vo thành viên Ô Kim Đan.'],
      ['vuachutu', 'Trẫm khỏi rồi! Thánh tăng thật là thần y. Ba năm trước, Trại Thái Tuế ở núi Kỳ Lân bắt hoàng hậu Kim Thánh của trẫm đi. Từ đó trẫm ăn không ngon, ngủ không yên.'],
    ],
  },
  'Cứu người bệnh': {
    open: [
      ['vuachutu', 'Trong cung còn bao người bị con yêu dọa cho phát bệnh. Thuốc men trên núi Kỳ Lân lại bị yêu quái giữ cả.'],
      ['ngokhong', 'Hộ pháp, lên núi lấy thuốc, tiện thể dò đường tới động Giải Trĩ.'],
    ],
    win: [
      ['nar', 'Ngộ Không hóa thành một tiểu yêu, lẻn vào động gặp hoàng hậu Kim Thánh. Hoàng hậu kể: con yêu có ba chiếc chuông vàng, chuông thứ nhất phun lửa, chuông thứ hai phun khói, chuông thứ ba phun cát độc.'],
      ['nar', 'Ngộ Không bày kế để hoàng hậu xin con yêu cất giữ chuông, rồi đánh tráo bằng chuông giả.'],
    ],
  },
  'Hàng yêu cứu Hoàng hậu': {
    boss: [
      ['kimmao', 'Dám lấy trộm chuông của ta? Hừm, chuông trong tay ta mới là chuông thật! Lửa, khói, cát, ra hết đây!'],
      ['ngokhong', 'Chuông của ngươi là giả rồi. Chuông thật đang trong tay Lão Tôn này!'],
      ['me', 'Lửa khói đổ ngược về phía hắn rồi. Đánh!'],
    ],
    win: [
      ['quanam', 'Ngộ Không dừng tay. Đây là con Kim Mao Hống ta cưỡi. Mục đồng ngủ say, nó cắn đứt xích trốn đi.'],
      ['quanam', 'Xưa vua Chu Tử khi còn là thái tử, đi săn bắn bị thương hai con khổng tước con của Phật Mẫu Khổng Tước. Phật Mẫu phạt vua phải xa vợ ba năm. Nay đã hết hạn rồi.'],
      ['nar', 'Áo gai ngũ sắc của Tử Dương Chân Nhân che thân cho hoàng hậu ba năm, nhờ thế con yêu không chạm được vào nàng. Vua và hoàng hậu đoàn tụ.'],
      ['vuachutu', 'Đội ơn Thánh tăng! Trẫm xin tiễn thầy trò một đoạn đường.'],
    ],
    next: 'Đi tiếp về tây, giữa núi có một trang viện, bên suối có bảy cô gái đang tắm…',
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
