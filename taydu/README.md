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
| Tộc | Thần Tộc (phép + hồi máu), Ma Tộc (cận chiến), Yêu Tộc (nhanh, độc, ảo ảnh) – mỗi tộc 4 kỹ năng mở theo cấp |
| Điểm tiềm năng | 5 điểm/cấp chia vào Thể · Lực · Pháp · Nhanh; tẩy điểm 20 vàng |
| Cốt truyện | Bám sát *Tây Du Ký* của Ngô Thừa Ân: Tiền truyện Đại Náo Thiên Cung + **đủ 81 nạn đúng thứ tự** (theo danh sách ở hồi 99), 15 chương từ Thiên Cung, Trường An, Ngũ Trang Quán, Bạch Hổ Lĩnh, Thông Thiên Hà, Nữ Nhi Quốc, Hỏa Diệm Sơn, Sư Đà Lĩnh… đến Linh Sơn; hơn 40 boss có thật trong truyện |
| Chiến đấu | Theo lượt trên bàn cờ chéo, thứ tự theo tốc độ: Đánh, Pháp (kỹ năng), Thủ, Đồ, Bắt, Chạy, nút Tự động. Ngũ hành tương khắc (+25% sát thương) |
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
| Bản đồ thế giới | Cuộn tranh hành trình 15 chương để truyền tống · bản đồ nhỏ góc màn hình (chạm để phóng to) · tranh truyện mở đầu mỗi chương |
| Hoạt động | Boss thế giới (máu chung mọi người chơi), Tam Giới Đấu, Trộm Đào, Đoạt Bảo, Tài Xỉu, Oẳn Tù Tì (chỉ dùng bạc trong game) |
| Xã hội | Chat 4 kênh (Khu, Phái, Shop, Hệ thống), Môn Phái + Giáo Phái Chiến, Kết Hôn, Sư Đồ, thấy người chơi khác đi lại trên bản đồ |

Người chơi khác trong cùng Wi-Fi chỉ cần mở cùng địa chỉ là vào chung một thế giới.

## Hình ảnh & âm thanh

- **Âm thanh**: nhạc nền ngũ cung (đàn tranh, sáo trúc, trống, cồng) riêng cho từng chương, trận thường và trận boss, cùng hiệu ứng cho mọi chiêu thức và thao tác. Tất cả được tổng hợp trực tiếp trong trình duyệt – không cần file nhạc. Trên iPhone, âm thanh bật sau khi chạm nút **VÀO** (hoặc Đăng ký / Đăng nhập / Khôi phục) ở màn chào (vẫn nghe được cả khi gạt nút im lặng). Nếu không nghe: tăng âm lượng bằng nút bên hông khi đang ở trong game, rồi vào Cài đặt → **Phát thử**.
- **Cài đặt** (nút bánh răng góc trên phải): âm lượng nhạc / hiệu ứng, *Hiệu ứng nhẹ* cho máy yếu, *Tránh quái*.
- **Đồ hoạ HD-2D** (`public/js/hd2d.js`, bộ dựng WebGL tự viết): bản đồ dựng 3D có phối cảnh, nhân vật/nhà/cây đứng như tấm bìa có bóng đổ theo mặt trời, sương xa, đèn lồng chiếu sáng thật về đêm, mờ hai đầu kiểu ống kính tilt-shift. Tắt/bật trong Cài đặt (máy không hỗ trợ WebGL tự dùng bản 2D). Trang bị (vũ khí, viền giáp theo phẩm, mũ, áo choàng, hào quang khi cường hoá +7) và thú cưỡi hiện trên người nhân vật.
- **Bản đồ pixel art** (`public/js/tiles.js`): nền vẽ từng điểm ảnh theo từng vùng – gạch ngọc Thiên Cung, đá cuội Trường An, đường đất, cỏ có ngọn và hoa dại, cát gợn, đất nứt Hỏa Diệm Sơn, rêu hang động, tuyết; mép cỏ và bờ nước tự nhiên, nước / sông sao / dung nham chuyển động. Nhà mái cong lợp ngói, tường thành có lỗ châu mai, cột son, cây theo vùng (liễu, thông tuyết, nấm hang, cây khô), đá nhiều dạng. Đổi ngày – hoàng hôn – đêm theo giờ thật, có đèn lồng, đom đóm, lá rơi, tàn lửa tuỳ chương.
- **Trận đấu**: phông cảnh pixel art riêng từng chương (trời chuyển màu kiểu dither, núi nhiều lớp, chùa, hồ, núi lửa, hang pha lê…), bàn cờ lát đá pixel theo vùng, pháp trận dưới chân, thanh thứ tự ra đòn, hiệu ứng hạt cho sét, lửa, băng, độc, hồi máu…
- **Hiệu ứng chiến đấu**: cắt cảnh khi tung chiêu (nhân vật lướt vào cùng tên chiêu, boss thì dải đỏ), màn nền tối lại lúc niệm chú, pháp trận lục giác xoay dưới chân, cột sáng. Mỗi hệ có hiệu ứng riêng: sét đánh nhiều nhánh, cầu lửa nổ kèm khói và vết cháy trên đất, gai băng mọc từ mặt đất, mây độc, đá rơi làm nứt đất, lốc xoáy, xoáy bóng tối, cột sáng hồi máu. Có rung màn hình, khựng hình khi bạo kích kèm vệt chém chữ X, lướt tới có bóng mờ, trúng đòn bị bật lùi, quái tan thành hạt sáng và linh hồn bay lên, boss nổ liên hoàn khi chết, pháo hoa khi thắng. Mỗi bối cảnh có hạt riêng: hoa rơi, tàn lửa, lá, tuyết, mưa giông. Bật *Hiệu ứng nhẹ* trong Cài đặt nếu máy yếu.
- **Âm thanh môi trường**: gió trời mây và chuông gió (Thiên Cung), chuông chùa và chim (Trường An), chim hót ban ngày, dế và cú đêm (rừng), nước chảy (sông), lửa lách tách (Hỏa Diệm Sơn), giọt nước rơi trong hang, gió rít (núi tuyết). Tiếng bước chân đổi theo mặt đất: cỏ, đá, gạch ngọc, cát, tuyết. Nhạc riêng cho sông nước, hang động, núi tuyết.
- **Âm thanh chiến đấu**: tiếng đòn đánh có lực dội trầm, chém gió, sấm rền, lửa nổ lách tách, băng vỡ leng keng, đá rơi rung đất, tiếng tụ khí khi niệm chú, trống và cồng khi cắt cảnh, tiếng gầm khi boss xuất hiện, tiếng nổ liên hoàn khi boss chết, pháo hoa lúc thắng.

- **Nhân vật dáng cao (≈7 đầu, khung 72×140 điểm ảnh)**: 6 nhân vật người chơi, ~90 NPC/boss, lính và các Tiên sủng dạng người: áo giao lĩnh có nếp vải, tay áo rộng, đai lưng có ngọc bội và tua, giáp vảy cá có hộ tâm kính, thiên y bay, mắt có tròng màu và đốm sáng, viền sáng ánh trăng. Có **biểu cảm**: bình thường, vui (thắng trận, được hồi máu), giận (khi ra đòn, boss), đau (trúng đòn, máu thấp), nhắm mắt vận công (tung chiêu); **chớp mắt** và **thở** khi đứng yên. Tiên sủng dạng thú giữ kiểu cũ, màu đổi theo ngũ hành.
- **Màn chào**: nền lửa thần thoại động (pixel), trăng máu, núi Hoa Quả, mây cát tường; logo thư pháp *Tây Du Ký* tự thiết kế; Tôn Ngộ Không cưỡi Cân Đẩu Vân ở góc trên; vòng Bát Quái xoay với nút **VÀO** và ba nút tròn **Đăng ký · Đăng nhập · Khôi phục**.
- **Tạo nhân vật**: thẻ chân dung khung vàng cho từng chủng tộc, hiển thị *Chủng tộc* + *Môn phái* (Thiên Đình / Ma Giới / Yêu Giới), la bàn chỉ số kèm kiểu hình (Pháp sư hình, Lực sĩ hình, Mẫn tiệp hình…), nút tên ngẫu nhiên 🎲.
- **Bảng nhân vật**: thanh Khí huyết / Pháp lực, bảng Công · Pháp công · Thủ · Kháng · Tốc · Né · Bạo · Sức chứa, nút [+]/[−] nổi khối, la bàn có nhãn kiểu hình.
- **Chiến đấu**: lệnh xếp thành **vòng hình thoi bao quanh nhân vật** (Tấn công, Kỹ năng, Phòng thủ, Đạo cụ, Bắt pet, Chạy), tự thu lại khi chờ lượt.
- **Thanh dưới**: Túi đồ · Nhân vật · Tiên sủng · Nhiệm vụ · Cưỡi · Hoạt động; nút *Giao lưu* nằm cạnh thanh chat. Kênh chat có thẻ **Tất cả** (gộp mọi kênh, chọn kênh để gửi). Mã nguồn hình nằm trong `public/js/pixel.js` – có thể chỉnh màu áo, vũ khí, kiểu tóc… ở các bảng `HEROES`, `NPCS`, `FORMS`.

### Thay bằng tranh vẽ của riêng bạn

Muốn thay hình pixel bằng tranh vẽ riêng, đặt file **PNG nền trong suốt** vào:

| Thư mục | Tên file | Ví dụ |
|---|---|---|
| `public/assets/monsters/` | mã hình thái Tiên sủng | `hautinh.png`, `holy.png`, `thanhlong.png` |
| `public/assets/bosses/` | mã boss | `culinh.png`, `nguuma.png`, `lucnhi.png` |
| `public/assets/npcs/` | mã NPC | `thaibach.png`, `duongtang.png`, `quanam.png` |

Mã đầy đủ xem trong `game/data.js` (mục `FORMS`, `BOSSES`, `npcs`). Tải lại trang là game tự nhận tranh mới.

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

81 ca kiểm thử: HTTP, tài khoản, mã khôi phục, dò mật khẩu, dữ liệu bẩn/gian lận, spam, hằng ngày, tháp, thú cưỡi, chế tạo, Tiên sủng, chợ (2 người, mua tranh nhau), tổ đội, sự kiện, 12 người chơi cùng lúc. **`TDK_TEST=1` chỉ dùng khi thử – không đặt biến này trên Render.**

## Quản lý dữ liệu

- Mọi thứ lưu ở `data/db.json` (tài khoản, nhân vật, túi đồ, Tiên sủng, môn phái).
- Muốn chỉnh tay (ví dụ cộng vàng, đổi cấp): **tắt server trước** (Ctrl+C), sửa file, rồi chạy lại.
- Xoá `data/db.json` để làm lại từ đầu.
- Sao lưu: chỉ cần copy file này.

## Tuỳ biến nội dung

| Muốn đổi | Sửa ở |
|---|---|
| Cốt truyện, lời thoại, NPC, boss, bản đồ từng chương | `game/story.js` |
| Tộc, kỹ năng, Tiên sủng, giá vật phẩm | `game/data.js` |
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
