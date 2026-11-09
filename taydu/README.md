# Tây Du Ký Mobile – Bản Nội Bộ (PWA cho iPhone)

Game nhập vai đánh theo lượt màn hình dọc, lấy cảm hứng từ Tây Du Ký Mobile / Hán Phong Tây Du ngày xưa. Chạy trên máy tính của bạn, chơi trên iPhone qua Safari, toàn màn hình như một app.

Toàn bộ hình ảnh là đồ hoạ pixel art tự vẽ bằng mã (nhân vật, bản đồ, phông trận đấu), không dùng tài nguyên gốc của game cũ.

## Cần gì

- Máy tính cài **Node.js 18 trở lên** (https://nodejs.org). Không cần `npm install` – server không dùng thư viện ngoài.
- iPhone và máy tính dùng **chung một mạng Wi-Fi**.

## Chạy game

**Windows:** giải nén file zip ra một thư mục (đừng chạy trực tiếp trong WinRAR), rồi bấm đúp **`CHAY-GAME.bat`**. Không bấm đúp vào `server.js` – Windows sẽ mở nó bằng Windows Script Host và báo lỗi.

Hoặc dùng dòng lệnh:

```bash
cd taydu
node server.js
```

Màn hình sẽ in ra địa chỉ, ví dụ:

```
• Trên máy tính:  http://localhost:3000
• Trên iPhone:    http://192.168.1.23:3000
```

Trên iPhone:

1. Mở **Safari**, gõ địa chỉ “Trên iPhone” ở trên.
2. Bấm nút **Chia sẻ** → **Thêm vào MH chính**.
3. Mở biểu tượng *Tây Du Ký* trên màn hình chính → game chạy toàn màn hình, không còn thanh Safari.

Nếu iPhone không vào được: kiểm tra tường lửa Windows/macOS có cho phép Node.js nhận kết nối trong mạng riêng không (Windows sẽ hỏi lần đầu chạy – chọn *Allow*). Muốn đổi cổng: `PORT=3001 node server.js` (Windows PowerShell: `$env:PORT=3001; node server.js`).

## Có gì trong game

| Hệ thống | Nội dung |
|---|---|
| Phái | 3 phái như bản gốc: **Phật** (Kim Cang – cận chiến, chịu đòn), **Tiên** (Thần – pháp thuật, khống chế, hồi phục), **Yêu** (Yêu Ma – nhanh, Phong Ấn, độc, mê hoặc). Mỗi phái **6 gương mặt** (3 nam, 3 nữ) có tên và lai lịch riêng, mỗi phái 6 kỹ năng mở theo cấp 1–35. Cấp tối đa **160** |
| Điểm tiềm năng | 5 điểm/cấp chia vào Thể · Lực · Pháp · Nhanh; tẩy điểm 20 vàng |
| Cốt truyện | Bám sát *Tây Du Ký* của Ngô Thừa Ân: Tiền truyện Đại Náo Thiên Cung + **đủ 81 nạn đúng thứ tự** (theo danh sách ở hồi 99), 15 chương từ Thiên Cung, Trường An, Ngũ Trang Quán, Bạch Hổ Lĩnh, Thông Thiên Hà, Nữ Nhi Quốc, Hỏa Diệm Sơn, Sư Đà Lĩnh… đến Linh Sơn; hơn 40 boss có thật trong truyện |
| Chiến đấu | Theo lượt, nhìn ngang như bản gốc: người chơi + **tối đa 3 Tiên sủng** mỗi bên, mỗi đơn vị có số vị trí. **7 lệnh hình thoi**: Công · Kỹ · Bắt · Túi · Sủng (gọi Tiên sủng dự bị ra trận, mỗi con 1 lần/trận) · Chạy · Nghỉ (phòng thủ + hồi 8% nội lực), nút Tự động. Chạm vào đơn vị để xem máu, nội lực, ngũ hành, trạng thái. Băng **THẮNG / BẠI** khi kết thúc. Ngũ hành tương khắc (+25% sát thương) |
| Trạng thái & kháng tính | **Định Thân** (mất lượt) · **Phong Ấn** (không dùng được kỹ năng) · **Loạn Hồn** (đánh bừa cả phe mình) · **Bỏng** · **Độc** · **Khiên**. Mỗi nhân vật có Kháng Phong Ấn / Loạn Hồn / Định Thân (tăng theo cấp và phái), boss kháng cao |
| Tiên sủng | 700 loài = 28 hình thái × 5 ngũ hành × 5 phẩm (Phàm → Thánh), thêm Biến Dị hiếm. Bắt bằng Bầu Bạc/Bầu Vàng – càng ít máu càng dễ |
| Trang bị | 8 ô: Vũ khí, Mũ, Giáp, Giày, Pháp bảo, Bội, Nhẫn, Dây chuyền. 6 phẩm chất, cường hóa +1 → +10, khảm 5 loại ngọc |
| Nhiệm vụ ẩn | 4 nhiệm vụ: theo toạ độ + giờ thật, mang Tiên sủng đặc biệt, hội thoại ngầm với NPC. Nghe lời đồn từ NPC để có gợi ý |
| Hằng ngày | Điểm danh 7 ngày (cộng dồn, ngày 7 nhận Trứng Biến Dị) · 5 nhiệm vụ ngày (giống nhau với mọi người, đổi lúc 0 giờ giờ Việt Nam) · Rương Năng Động khi xong cả 5 |
| Trấn Yêu Tháp | Leo tầng không giới hạn, boss trong truyện mỗi 5 tầng, trang bị mỗi 10 tầng, 5 lượt thua mỗi ngày, bảng vàng tầng cao nhất |
| Tân thủ | Hướng dẫn 6 bước có ngón tay chỉ chỗ bấm (bỏ qua được), xong nhận 500 bạc + 2 Bầu Bạc |
| Tài khoản | Đổi mật khẩu, đăng xuất khỏi mọi thiết bị khác (trong Cài đặt) |
| Thú cưỡi | Bạch Long Mã, Hổ Vằn, Tiên Hạc, Kỳ Lân (rèn), Cân Đẩu Vân – đi nhanh hơn, cộng chỉ số, người khác thấy trên bản đồ |
| Tiên sủng nâng cao | Học chiêu từ sách (tối đa 4 chiêu), tiến hoá lên phẩm cao hơn bằng Linh Đan, hợp thể hai con thành một (30% lên thêm 1 phẩm) |
| Luyện đan / Rèn đồ | Lò Bát Quái (đan dược, Linh Đan, Hợp Thể Đan, sách kỹ năng, Bầu Vàng) · Lò Rèn (trang bị theo cấp, đá cường hoá, Kỳ Lân). Nguyên liệu rơi khi đánh quái |
| Tổ đội | Tối đa 3 người, đồng đội cùng bản đồ tự động cùng xuất trận và cùng nhận thưởng, kênh chat Đội |
| Chợ giao dịch | Mua bán vật phẩm, trang bị, Tiên sủng giữa người chơi; thuế 5%; hàng tự trả lại sau 3 ngày; thư báo khi bán được |
| Sự kiện mùa | Tết Nguyên Đán (lì xì, pháo hoa, bánh chưng) · Trung Thu (bánh trung thu, rước đèn đổi Trứng Biến Dị) – tự bật theo ngày |
| Bản đồ thế giới | Cuộn tranh hành trình 21 chương (15 chính + 6 hậu truyện) để truyền tống · bản đồ nhỏ góc màn hình (chạm để phóng to) · tranh truyện mở đầu mỗi chương |
| Hoạt động | Boss thế giới (máu chung mọi người chơi), Tam Giới Đấu, Trộm Đào, Đoạt Bảo, Tài Xỉu, Oẳn Tù Tì (chỉ dùng bạc trong game) |
| Xã hội | Chat 4 kênh (Khu, Phái, Shop, Hệ thống), Môn Phái + Giáo Phái Chiến, Kết Hôn, Sư Đồ, thấy người chơi khác đi lại trên bản đồ |

### Đợt 2–6 (mới)

| Hệ thống | Nội dung |
|---|---|
| **Thần Sủng** | 12 nhân vật cốt truyện làm Tiên sủng: Tiểu Bạch Long, Na Tra, Hồng Hài Nhi, Hắc Hùng Tinh, Bạch Cốt Phu Nhân, Ngọc Thố, Thiết Phiến Công Chúa, Kim Giác, Linh Cảm, Ngưu Ma Vương, Nhị Lang Thần, Lục Nhĩ Mỹ Hầu. Gom **30 Hồn Phách** để triệu hồi (màn triệu hồi có pháp trận). Mỗi con có **tuyệt kỹ riêng** và hình nhân vật thật khi ra trận. **Chân Hoá** (cấp 80 + 60 hồn + 5 Chân Linh Thạch) lên phẩm **Chân** (×2.0 chỉ số), tuyệt kỹ mạnh hơn, hào quang. Hồn Phách rơi từ boss cùng tên (tái chiến, Ác Mộng), phó bản; Vạn Hồn Phách đổi thành hồn tuỳ chọn. Không giao dịch được |
| **Hậu truyện · Hỗn Độn Kiếp** | 6 cõi mới cấp 70 → 160 (truyện sáng tác riêng sau khi thỉnh kinh): **Đông Hải Long Cung** (đáy biển, tia nắng lung linh), **U Minh Địa Phủ** (hoa Bỉ Ngạn, Huyết Hà), **Côn Lôn Tiên Sơn**, **Bồng Lai Tiên Đảo**, **Nam Thiên Môn**, **Hỗn Độn Hư Không** (pha lê, đá trôi). 51 bước nhiệm vụ, 18 boss mới tới **Hỗn Độn Ma Tổ** – Kiếp nạn thứ 82. Hai cõi cuối cần Phi Thăng |
| **Boss nhiều giai đoạn** | Boss qua mốc máu sẽ **Cuồng Nộ**: tăng công, tốc, giải khống chế, hồi máu, rung màn hình, băng rôn; giai đoạn cuối gọi viện binh. Thanh giai đoạn trên khung boss |
| **Ác Mộng** | Đánh lại mọi boss đã qua ở dạng Ác Mộng (cấp 62 → 160, 3 giai đoạn, kháng khống chế cao). 10 lượt/ngày. Rơi Hồn Phách Thần sủng, Chân Linh Thạch, trang bị Tinh → Độc Bản. Mở ở NPC boss hoặc Menu › Ác Mộng (từ cấp 60) |
| **Phi Thăng** | Chưa Phi Thăng thì dừng ở **cấp 120**. Độ **Tam Cửu Thiên Kiếp**: Lôi Kiếp → Hỏa Kiếp → **Tâm Ma Kiếp** (đánh với bản sao của chính mình và Tiên sủng). Thành công: mở cấp 160, +8% mọi chỉ số, +20 điểm, hào quang tiên nhân, danh hiệu |
| **Mệnh** | Từ cấp 10 chọn ngũ hành bản mệnh: vào trận mang hệ đó (khắc +25%, bị khắc −15%) và nhận chỉ số riêng. Đổi bằng Mệnh Phù hoặc 50 vàng |
| **Tính cách Tiên sủng** | 7 tính cách (Dũng Mãnh, Trầm Ổn, Linh Lợi, Thông Tuệ, Kiên Cường, hiếm: Trung Thành, Cuồng Bạo) cộng/trừ chỉ số. Tẩy Tâm Đan để đổi |
| **Khai thác** | Mỗi bản đồ 4 điểm: Mạch Khoáng, Linh Thảo, Linh Tuyền (vẽ trên bản đồ + bản đồ nhỏ). Chạm để đi tới và khai thác, tốn Tinh Lực (100, hồi 1 điểm/2 phút), mỗi điểm hồi 8 phút. Kỹ năng khai thác lên tới cấp 10, ra nguyên liệu hiếm (Kim Khoáng, Tuyết Liên) |
| **Sạp hàng** | Bày tối đa 6 món ngay chỗ đứng, bảng hiệu đỏ treo trên đầu; người khác chạm vào để xem và mua (thuế 3%). Đi hoặc thoát là dọn sạp |
| **Thú cưỡi mới & cấp** | Long Quy, Tuyết Lang, **Ảo Điểu** (rèn từ 30 Lông Ảo Điểu của boss Bồng Lai). Nuôi bằng Thú Lương lên **cấp 10**, mỗi cấp +12% hiệu quả |
| **Thời tiết** | Mưa ở rừng/sông/thành, dòng hải lưu ở Long Cung, theo khung giờ – mọi người cùng thấy |
| **Phúc Lợi** | Quà tân thủ 7 ngày (ngày 7: Tiểu Bạch Long) · quà online 5/15/30/60/120 phút · **Bế quan**: offline tới 12 giờ vẫn nhận tu vi, bạc (nhân đôi bằng vàng) |
| **Thành tựu & Danh hiệu** | 35 thành tựu, 14 danh hiệu cộng chỉ số, hiện dưới tên trên bản đồ |
| **Tu Hành Lệnh** | Mỗi tháng một mùa, 30 cấp; nhiệm vụ ngày/tuần; Lệnh Chí Tôn (288 vàng) mở thêm phần thưởng |
| **Phó Bản** | 5 phó bản (Bàn Đào Yến Loạn, Thủy Liêm Bí Cảnh, Long Cung Bảo Khố, Thập Bát Địa Ngục, Lăng Tiêu Thí Luyện): 3 đợt quái + boss, tổ đội cùng vào, cấp co giãn theo người chơi, 2 lượt/ngày |
| **Đồ Giám** | Ghi lại 28 hình thái và 12 Thần sủng đã có; mỗi hình thái +0.25% mọi chỉ số; quà ở mốc 5/10/15/20/25/28 |
| **Cấp Bang Hội** | Môn phái lên tới cấp 10 nhờ cống hiến & quyên góp; thành viên nhận +% tu vi, chỉ số, quà phái mỗi ngày |
| **Thiên Địa Dị Tượng** | Mỗi 2 giờ có 40 phút sự kiện chung: Song Bội Tu Vi, Yêu Vương Xâm Nhập (quái Tinh Anh), Linh Mạch Bộc Phát, Phúc Tinh Cao Chiếu – đếm ngược trên HUD |

Người chơi khác trong cùng Wi-Fi chỉ cần mở cùng địa chỉ là vào chung một thế giới.

## Hình ảnh & âm thanh

- **Âm thanh**: nhạc nền ngũ cung (đàn tranh, sáo trúc, trống, cồng) riêng cho từng chương, trận thường và trận boss, cùng hiệu ứng cho mọi chiêu thức và thao tác. Tất cả được tổng hợp trực tiếp trong trình duyệt – không cần file nhạc. Trên iPhone, âm thanh bật sau khi chạm nút **VÀO** (hoặc Đăng ký / Đăng nhập / Khôi phục) ở màn chào (vẫn nghe được cả khi gạt nút im lặng). Nếu không nghe: tăng âm lượng bằng nút bên hông khi đang ở trong game, rồi vào Cài đặt → **Phát thử**.
- **Cài đặt** (nút bánh răng góc trên phải): âm lượng nhạc / hiệu ứng, *Hiệu ứng nhẹ* cho máy yếu, *Tránh quái*.
- **Nhân vật kiểu tranh chibi** (`public/js/chibi.js`, `public/js/beast.js`): toàn bộ 18 gương mặt người chơi, NPC, boss và Tiên sủng/quái được vẽ nét (SVG) – đầu to, mắt anime long lanh, tô bóng mềm, viền nâu – sắc nét ở mọi kích thước; có biểu cảm (bình thường, cười, giận, đau, niệm chú, chớp mắt), bước đi, vũ khí, đầu thú (khỉ, heo, gấu, trâu, hổ, sư tử, voi…), đuôi, cánh, hào quang. Muốn quay về hình pixel cũ: Cài đặt → tắt *Nhân vật kiểu tranh*.
- **Bản đồ kiểu tranh vẽ** (`public/js/paint.js`): nền như tranh vẽ tay dựng từ ô bản đồ – cỏ nét cọ, đường đất/đá lát bờ mềm, ao hồ có bọt bờ và gợn nước động, vách núi/tường thành/mây; nhà mái cong có cột son, đèn lồng, chòi tranh; cây liễu, thông phủ tuyết, đào hoa, nấm phát sáng; nhân vật đi trước/sau nhà và cây (vật che sẽ mờ đi). Camera phóng gần và bám theo nhân vật.
- **Giao diện bản đồ mới**: chân dung tròn viền vàng kèm cấp, thanh khí huyết/pháp lực, bản đồ nhỏ tròn (chạm để chọn bản đồ) và tên vùng, dải **Tự động tìm đường** (chạm là tự đi làm nhiệm vụ), nút *Điểm danh* / *Hoạt động*, nút **Menu** (Túi đồ, Nhân vật, Tiên sủng, Nhiệm vụ, Cưỡi, Hoạt động) và **Túi đồ**, **cần điều khiển** góc phải, khung chat có ảnh đại diện và bong bóng tin nhắn, thẻ kênh Khu/Đội/Phái/Chợ.
- **Thay bằng tranh thật**: xem **ART-SPEC.md** – danh sách mọi mã nhân vật, NPC, boss, Tiên sủng, thú cưỡi, bản đồ, phông chiến đấu, kèm kích thước. Chép file vào `public/assets/...` là game tự dùng, thiếu tranh nào thì dùng bản vẽ bằng code.
- **Bản đồ pixel art** (`public/js/tiles.js`): nền vẽ từng điểm ảnh theo từng vùng – gạch ngọc Thiên Cung, đá cuội Trường An, đường đất, cỏ có ngọn và hoa dại, cát gợn, đất nứt Hỏa Diệm Sơn, rêu hang động, tuyết; mép cỏ và bờ nước tự nhiên, nước / sông sao / dung nham chuyển động. Nhà mái cong lợp ngói, tường thành có lỗ châu mai, cột son, cây theo vùng (liễu, thông tuyết, nấm hang, cây khô), đá nhiều dạng. Đổi ngày – hoàng hôn – đêm theo giờ thật, có đèn lồng, đom đóm, lá rơi, tàn lửa tuỳ chương.
- **Sân đấu kiểu tranh**: đài đá tròn khảm Bát Quái – Âm Dương giữa bãi cỏ, phía sau là trời mây, núi xa nhiều lớp và cảnh riêng từng vùng (nhà mái cong, cổng trời, cột son, rừng thông tuyết, nấm hang, cây khô sa mạc…). Mỗi chiêu tạo **vũng sáng màu riêng** và **pháp trận xoay dưới chân** người ra chiêu và mục tiêu (lửa cam, sét trắng xanh, băng lam, độc tím, hồi máu xanh lá), máy quay đẩy vào người tung chiêu, bạo kích và sét làm chớp sáng cả màn hình.
- **Giao diện chiến đấu mới**: nút **Công** lớn ở góc phải, các lệnh Kỹ · Túi · Sủng · Bắt · Nghỉ · Chạy xếp hai vòng cung quanh như tay cầm (không còn che nhân vật); bảng chọn chiêu/vật phẩm mọc lên phía trên; bảng tên và thanh máu kính mờ, viền xanh ngọc (phe mình) / đỏ (địch); cắt cảnh tung chiêu là dải mực chéo, tên chiêu “đóng dấu” thư pháp và phát sáng theo màu hệ của chiêu.
- **Hiệu ứng chiến đấu**: cắt cảnh khi tung chiêu (nhân vật lướt vào cùng tên chiêu, boss thì dải đỏ), màn nền tối lại lúc niệm chú, pháp trận lục giác xoay dưới chân, cột sáng. Mỗi hệ có hiệu ứng riêng: sét đánh nhiều nhánh, cầu lửa nổ kèm khói và vết cháy trên đất, gai băng mọc từ mặt đất, mây độc, đá rơi làm nứt đất, lốc xoáy, xoáy bóng tối, cột sáng hồi máu. Có rung màn hình, khựng hình khi bạo kích kèm vệt chém chữ X, lướt tới có bóng mờ, trúng đòn bị bật lùi, quái tan thành hạt sáng và linh hồn bay lên, boss nổ liên hoàn khi chết, pháo hoa khi thắng. Mỗi bối cảnh có hạt riêng: hoa rơi, tàn lửa, lá, tuyết, mưa giông. Bật *Hiệu ứng nhẹ* trong Cài đặt nếu máy yếu.
- **Âm thanh môi trường**: gió trời mây và chuông gió (Thiên Cung), chuông chùa và chim (Trường An), chim hót ban ngày, dế và cú đêm (rừng), nước chảy (sông), lửa lách tách (Hỏa Diệm Sơn), giọt nước rơi trong hang, gió rít (núi tuyết). Tiếng bước chân đổi theo mặt đất: cỏ, đá, gạch ngọc, cát, tuyết. Nhạc riêng cho sông nước, hang động, núi tuyết.
- **Âm thanh chiến đấu**: tiếng đòn đánh có lực dội trầm, chém gió, sấm rền, lửa nổ lách tách, băng vỡ leng keng, đá rơi rung đất, tiếng tụ khí khi niệm chú, trống và cồng khi cắt cảnh, tiếng gầm khi boss xuất hiện, tiếng nổ liên hoàn khi boss chết, pháo hoa lúc thắng.

- **6 kiểu thân, tỉ lệ 4–5 đầu** (khung chung 80×124 nên ai cao ai thấp thấy rõ): trẻ con (Na Tra, Hồng Hài Nhi, Thổ Địa), nữ thướt tha (Hằng Nga, Quan Âm), nam cân đối (Đường Tăng, Ngộ Không), vạm vỡ (Sa Tăng, Kim Cang Hộ Pháp), bụng to (Bát Giới, Di Lặc), khổng lồ (Ngưu Ma Vương, Như Lai). 18 gương mặt người chơi khác hẳn nhau, ví dụ Kim Cang Hộ Pháp, Hàng Long La Hán, Long Nữ, Bạch Mi Tiên Ông, Trúc Lâm Hùng Tiên (gấu trúc), U Minh Quỷ Vương, Cửu Vĩ Hồ Ly, Tri Chu Tinh. Ngộ Không có mũ phượng lông trĩ, Đường Tăng cầm tích trượng, Sa Tăng đeo chuỗi đầu lâu.
- **Tiên sủng 3 cỡ** theo loài (thỏ, cáo nhỏ… / hổ, sói vừa / rồng, voi, kỳ lân lớn); phẩm Tiên trở lên có hào quang, phẩm Thánh có sao lấp lánh.
- **Trận đấu nhìn ngang** kiểu cổ điển: địch bên trái, phe mình bên phải; 7 lệnh trong vòng lệnh góc phải; khung tên kẻ địch mạnh nhất kèm cấp và máu; băng rôn tên trận; đồng hồ chuyển đỏ khi còn 5 giây.
- **Tuyệt chiêu từng phái**: Phật Quang / Cửu Thiên Huyền Lôi gọi năm tượng Phật vàng; Chân Hỏa gọi ác quỷ lửa trồi lên; Mê Hồn Hương / Nhiếp Hồn Thuật cho bóng cửu vĩ hồ lướt qua; Thất Thập Nhị Biến hiện phân thân Tề Thiên.
- **Cảm xúc khi chơi**: đếm *Liên kích ×N*, cột sáng + tiếng chiêng khi thăng cấp, đồ quý rơi ra có tia sáng xoay theo màu phẩm, hồ lô bắt pet rung từng nhịp ●○○ (có thể bung ra giữa chừng).
- **Bản đồ**: dấu "!" vàng nảy trên NPC giao nhiệm vụ (đỏ với boss); tên NPC tô màu theo vai trò (cửa hàng xanh, thầy thuốc lục); túi đồ hiện số ô x/200.
- **Chat**: tên tô màu theo phái kèm cấp, 12 biểu tượng cảm xúc pixel, nút **📣 Tuyển đội phụ bản** – người khác bấm **Xin vào** để gửi đơn, đội trưởng đồng ý là vào đội.
- **Màn chào**: nền lửa thần thoại động (pixel), trăng máu, núi Hoa Quả, mây cát tường; logo thư pháp *Tây Du Ký* tự thiết kế; Tôn Ngộ Không cưỡi Cân Đẩu Vân ở góc trên; vòng Bát Quái xoay với nút **VÀO** và ba nút tròn **Đăng ký · Đăng nhập · Khôi phục**.
- **Chọn nhân vật** theo bố cục bản gốc: 3 cột màu (Phật vàng · Yêu tím · Tiên xanh), mỗi cột 6 gương mặt; phía trên là nhân vật đứng trên pháp trận, chân dung lớn, *Phái / Giới* và khung lai lịch; nút **Chọn** / **Ngẫu nhiên**. Nhân vật cũ (Thần → Tiên, Ma → Phật) được **đổi gương mặt miễn phí 1 lần**.
- **Bảng nhân vật**: thanh Khí huyết / Pháp lực, bảng Công · Pháp công · Thủ · Kháng · Tốc · Né · Bạo · Sức chứa, nút [+]/[−] nổi khối, la bàn có nhãn kiểu hình.
- **Thanh dưới**: Túi đồ · Nhân vật · Tiên sủng · Nhiệm vụ · Cưỡi · Hoạt động; nút *Giao lưu* nằm cạnh thanh chat. Kênh chat có thẻ **Tất cả** (gộp mọi kênh, chọn kênh để gửi). Mã nguồn hình nằm trong `public/js/pixel.js` – có thể chỉnh màu áo, vũ khí, kiểu tóc… ở các bảng `HEROES` (18 gương mặt `phat_0`…`yeu_5`), `NPCS`, `FORMS`.

### Thay bằng tranh vẽ của riêng bạn

Xem **ART-SPEC.md**: bảng đầy đủ mã + kích thước cho nhân vật (`public/assets/heroes/`), NPC (`npcs/`), boss (`bosses/`), Tiên sủng/quái (`monsters/`), thú cưỡi (`mounts/`), bản đồ (`maps/`, có thể kèm lớp che `<mã>_front.png`) và phông chiến đấu (`battle/`). Nhận PNG, WEBP, JPG. Tải lại trang là game tự nhận tranh mới.

## Đưa lên mạng – chơi 24/24 không cần bật máy tính (miễn phí)

Máy chủ game chạy trên **Render.com** (gói Free). Dữ liệu người chơi được lưu trên **Supabase** (gói Free), vì ổ đĩa của Render miễn phí bị xoá mỗi lần khởi động lại.

1. **Supabase** (https://supabase.com): đăng nhập bằng GitHub → *New project* (đặt mật khẩu database tuỳ ý, vùng *Singapore*).
   - Vào *SQL Editor* → *New query* → dán nội dung file `supabase.sql` → *Run*.
   - Vào *Project Settings* → lấy **Project URL** (dạng `https://xxxx.supabase.co`) và **Secret key** (`sb_secret_...`; dự án cũ thì dùng khoá `service_role`).
2. **Render** (https://render.com): đăng nhập bằng GitHub → *New* → *Web Service* → chọn kho `Tayduky`.
   - *Root Directory*: `taydu` · *Runtime*: Node · *Build Command*: `echo ok` · *Start Command*: `node start.js` · *Instance Type*: **Free**.
   - *Environment Variables*: thêm `SUPABASE_URL` = Project URL và `SUPABASE_KEY` = Secret key.
   - Bấm *Deploy*. Xong sẽ có địa chỉ dạng `https://tayduky.onrender.com` – mở bằng Safari trên iPhone → *Thêm vào MH chính*.

Lưu ý gói miễn phí:
- Không ai chơi 15 phút thì máy chủ ngủ; lần vào sau chờ khoảng 1 phút để nó thức dậy.
- Supabase tạm dừng dự án nếu cả tuần không ai chơi (dữ liệu vẫn giữ) – vào trang Supabase bấm *Restore* là chạy lại.
- Mỗi lần tải file mới lên GitHub, Render tự cập nhật game sau vài phút.
- Khoá `SUPABASE_KEY` là khoá bí mật: chỉ dán vào Render, không đưa lên GitHub hay gửi cho người khác.

## Bảo mật & chống spam

- Mật khẩu băm scrypt có muối; đổi mật khẩu là các thiết bị cũ bị đăng xuất.
- **Mã khôi phục** (dạng `XXXX-XXXX`) hiện một lần khi đăng ký – dùng ở mục *Khôi phục* để đặt lại mật khẩu khi quên. Máy chủ chỉ lưu bản băm; dùng xong mã cũ hết hiệu lực và có mã mới. Tài khoản cũ (tạo trước bản này) vào **Cài đặt → Mã khôi phục → Tạo mã**. Nhập sai mã cũng bị tính vào giới hạn khoá tạm như sai mật khẩu.
- Sai mật khẩu 8 lần / 10 phút → khoá tài khoản 5 phút; một địa chỉ mạng sai 40 lần → khoá 5 phút. Tối đa 6 tài khoản mới / giờ / địa chỉ mạng, 12 kết nối / địa chỉ.
- Giới hạn 25 lệnh/giây mỗi kết nối, gói tin tối đa 64KB; chat chặn gửi dồn dập và lặp lại.
- Mọi số liệu người chơi gửi lên (số lượng, giá, tiền cược…) đều được kiểm tra; mã vật phẩm/bản đồ/phái chỉ nhận đúng mã có thật (chống "prototype pollution").
- Lỗi trong một lệnh không làm sập máy chủ; URL sai định dạng, đường dẫn `../` bị chặn; có header CSP, chống nhúng iframe, nosniff.
- Tên nhân vật, chat bị lọc ký tự HTML / ký tự điều khiển; giao diện luôn hiển thị chữ dạng thuần (chống XSS).

### Kiểm thử tổng thể

```bash
TDK_TEST=1 TDK_REG_LIMIT=1000 TDK_CONN_LIMIT=100 TDK_EVENT=tet node server.js
node tools/full-test.js
```

Đợt 2–6 có bộ kiểm thử riêng (76 ca: Thần sủng, Chân Hoá, Mệnh, tính cách, thành tựu, phúc lợi, Tu Hành Lệnh, khai thác, thú cưỡi, sạp hàng, Ác Mộng, Phi Thăng, hậu truyện, phó bản, Đồ giám, bang hội, Dị Tượng, boss nhiều giai đoạn):

```bash
node tools/wave-test.js
```

105 ca kiểm thử tổng thể: HTTP, tài khoản, mã khôi phục, tuyển đội, 3 phái và chuyển dữ liệu cũ, đội 3 Tiên sủng, lệnh Sủng/Nghỉ, Phong Ấn và kháng tính, dò mật khẩu, dữ liệu bẩn/gian lận, spam, hằng ngày, tháp, thú cưỡi, chế tạo, Tiên sủng, chợ (2 người, mua tranh nhau), tổ đội, sự kiện, 12 người chơi cùng lúc. **`TDK_TEST=1` chỉ dùng khi thử – không đặt biến này trên Render.**

## Quản lý dữ liệu

- Mọi thứ lưu ở `data/db.json` (tài khoản, nhân vật, túi đồ, Tiên sủng, môn phái).
- Muốn chỉnh tay (ví dụ cộng vàng, đổi cấp): **tắt server trước** (Ctrl+C), sửa file, rồi chạy lại.
- Xoá `data/db.json` để làm lại từ đầu.
- Sao lưu: chỉ cần copy file này.

## Tuỳ biến nội dung

| Muốn đổi | Sửa ở |
|---|---|
| Cốt truyện, lời thoại, NPC, boss, bản đồ từng chương | `game/story.js` (Hậu truyện: `game/story2.js`) |
| Thần sủng, Mệnh, tính cách, thành tựu, Tu Hành Lệnh, phó bản, phúc lợi, khai thác, Dị Tượng | `game/data3.js` |
| Luật các hệ thống Đợt 2–6 | `game/features3.js` · giao diện `public/js/panels3.js` |
| Phái, gương mặt, kỹ năng, Tiên sủng, giá vật phẩm | `game/data.js` |
| Công thức chỉ số, rơi đồ, tỷ lệ | `game/logic.js` |
| Công thức sát thương, bắt Tiên sủng, AI quái | `game/battle.js` |
| Màu sắc, giao diện | `public/css/style.css` |
| Hình nhân vật | `public/js/pixel.js` |
| Thú cưỡi, công thức chế tạo, sách kỹ năng, sự kiện | `game/data2.js` |
| Đồ hoạ 3D HD-2D | `public/js/hd2d.js` |
| Nền bản đồ, nhà, cây, phông trận | `public/js/tiles.js` |

Bản đồ là lưới 12 × 20 ký tự trong `game/data.js`: `.` đường đi, `,` vùng có quái, `T` cây, `~` nước, `#` đá/cột, `H` nhà, `P` cổng sang chương sau.

### Thử nhiệm vụ ẩn theo giờ

Một số nhiệm vụ ẩn chỉ kích hoạt vào giờ nhất định. Để thử mà không phải chờ, chạy server với giờ giả lập:

```bash
TDK_HOUR=22 node server.js
```

## Kiểm tra nhanh server

Khi server đang chạy, mở cửa sổ dòng lệnh khác:

```bash
node tools/smoke-test.js
```

Script tự tạo nhân vật, đánh quái, bắt Tiên sủng, mua đồ, cường hóa, đấu trường, đánh boss đầu tiên.

`node tools/story-test.js <tài khoản> <mật khẩu>` cho một nhân vật tự chơi hết cốt truyện (dùng để kiểm tra sau khi sửa `story.js`).

## Lưu ý về PWA trên iPhone

- Chế độ toàn màn hình (Thêm vào MH chính) hoạt động bình thường qua `http://` trong mạng LAN.
- Service worker (lưu đệm giao diện) chỉ bật khi chạy qua HTTPS hoặc localhost; qua LAN `http://` thì game vẫn chạy đầy đủ, chỉ là không lưu đệm.
- Khi khoá màn hình iPhone, kết nối sẽ tự nối lại khi bạn mở lại; trận đấu đang dở vẫn được giữ trên server.

## Giấy phép phông chữ

Phông Lora (bản rút gọn hỗ trợ tiếng Việt) theo giấy phép SIL Open Font License.
