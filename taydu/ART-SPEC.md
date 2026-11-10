# Bảng yêu cầu tranh (Art Spec) – Tây Du Ký Mobile

Game tự vẽ toàn bộ nhân vật, Tiên sủng, bản đồ và phông chiến đấu bằng code (phong cách chibi kiểu tranh). Khi có **tranh thật** (do họa sĩ vẽ hoặc tạo bằng công cụ AI vẽ tranh), chỉ cần chép file vào đúng thư mục dưới đây rồi tải lại game – game tự nhận, tranh nào chưa có thì vẫn dùng bản vẽ bằng code.

## Quy tắc chung

- Định dạng: **PNG nền trong suốt** cho nhân vật / Tiên sủng / NPC / boss / thú cưỡi; **JPG hoặc WEBP** cho bản đồ và phông chiến đấu (nhẹ hơn). Cũng nhận .webp cho mọi loại.
- Tên file = **mã** trong bảng (chữ thường, không dấu), ví dụ `public/assets/heroes/phat_2.png`.
- Phong cách nên thống nhất: chibi tỉ lệ đầu : thân ≈ 1 : 1,3, nét viền nâu sẫm, tô bóng mềm, ánh sáng chiếu từ trên-trái – giống ảnh mẫu bạn gửi.
- **Không** dùng hình của game khác (bản quyền). Hãy đặt họa sĩ vẽ riêng, hoặc tự tạo bằng công cụ AI với mô tả của riêng bạn.
- Sau khi chép file: đẩy thư mục `taydu` lên GitHub như mọi lần, Render tự cập nhật.

## 1. Nhân vật người chơi – `public/assets/heroes/`

| Kích thước | Ghi chú |
|---|---|
| **512 × 660 px** (tỉ lệ ~0,78), nhân vật đứng thẳng, nhìn chéo 3/4 về **bên phải**, chân chạm mép dưới ~4% | Game tự lật hình khi đi sang trái. Có thể thêm `<mã>_face.png` (512 × 512, chân dung đầu–vai) cho ảnh đại diện; nếu không có, game dùng hình toàn thân. |

| Mã | Gương mặt | Phái |
|---|---|---|
| `phat_0` | Kim Cang Hộ Pháp | Phật |
| `phat_1` | Hàng Long La Hán | Phật |
| `phat_2` | Thạch Hầu Đấu Chiến | Phật |
| `phat_3` | Thiên Nữ Tán Hoa | Phật |
| `phat_4` | Long Nữ Hiến Châu | Phật |
| `phat_5` | Hộ Pháp Nữ Tăng | Phật |
| `tien_0` | Thiên Bồng Tướng Quân | Tiên |
| `tien_1` | Bạch Mi Tiên Ông | Tiên |
| `tien_2` | Trúc Lâm Hùng Tiên | Tiên |
| `tien_3` | Bàn Đào Tiên Nữ | Tiên |
| `tien_4` | Nguyệt Cung Tiên Tử | Tiên |
| `tien_5` | Thanh Y Kiếm Tiên | Tiên |
| `yeu_0` | U Minh Quỷ Vương | Yêu |
| `yeu_1` | Ngân Hồ Lãng Khách | Yêu |
| `yeu_2` | Hắc Phong Ma Tướng | Yêu |
| `yeu_3` | Cửu Vĩ Hồ Ly | Yêu |
| `yeu_4` | Huyết Y Ma Nữ | Yêu |
| `yeu_5` | Tri Chu Tinh | Yêu |

## 2. NPC – `public/assets/npcs/`

Kích thước như nhân vật (**512 × 660 px**, nền trong suốt).

| Mã | Tên | Bản đồ |
|---|---|---|
| `thaibach` | Thái Bạch Kim Tinh | Thiên Cung |
| `tho_dao` | Thổ Địa Vườn Đào | Thiên Cung |
| `duocsu1` | Tiên Đồng Luyện Đan | Thiên Cung |
| `shop1` | Tiên Thương | Thiên Cung |
| `hangnga` | Hằng Nga | Thiên Cung |
| `nhulai` | Như Lai Phật Tổ | Thiên Cung |
| `duongtang` | Đường Tam Tạng | Trường An · Song Xoa Lĩnh |
| `quanam` | Quan Âm Bồ Tát | Trường An · Song Xoa Lĩnh |
| `laoong` | Lão Ông Bán Hạc | Trường An · Song Xoa Lĩnh |
| `duocsu2` | Đại Phu Hồi Xuân | Trường An · Song Xoa Lĩnh |
| `shop2` | Chưởng Quầy Trường An | Trường An · Song Xoa Lĩnh |
| `casino` | Sòng Bạc Phú Quý | Trường An · Song Xoa Lĩnh |
| `ngokhong` | Tôn Ngộ Không (Ngũ Hành Sơn) | Trường An · Song Xoa Lĩnh |
| `kimtri` | Lão Tăng Kim Trì | Quan Âm Viện · Hoàng Phong Lĩnh |
| `linhcat` | Linh Cát Bồ Tát | Quan Âm Viện · Hoàng Phong Lĩnh |
| `laomau` | Lê Sơn Lão Mẫu | Lưu Sa Hà · Ngũ Trang Quán |
| `laohau` | Lão Hầu Thông Bối | Bạch Hổ Lĩnh · Bảo Tượng Quốc |
| `duocsu3` | Hầu Y Sư | Bạch Hổ Lĩnh · Bảo Tượng Quốc |
| `shop3` | Hầu Thương | Bạch Hổ Lĩnh · Bảo Tượng Quốc |
| `tieuphu` | Tiều Phu | Bạch Hổ Lĩnh · Bảo Tượng Quốc |
| `congchua` | Công Chúa Bách Hoa Tu | Bạch Hổ Lĩnh · Bảo Tượng Quốc |
| `duocsu4` | Thầy Thuốc | Bình Đỉnh Sơn · Ô Kê Quốc |
| `shop4` | Thương Nhân | Bình Đỉnh Sơn · Ô Kê Quốc |
| `vuaoke` | Hồn Vua Ô Kê | Bình Đỉnh Sơn · Ô Kê Quốc |
| `thodia` | Sơn Thần Hiệu Sơn | Hiệu Sơn · Hắc Hà |
| `mangang` | Thái Tử Ma Ngang | Hiệu Sơn · Hắc Thủy Hà |
| `honghai_be` | Đứa Bé Treo Trên Cây (Hồng Hài Nhi giả dạng) | Hiệu Sơn · Hắc Thủy Hà |
| `tangnhan` | Tăng Nhân Khổ Sai | Xa Trì Quốc |
| `vua` | Vua Xa Trì | Xa Trì Quốc |
| `daodong` | Đạo Đồng | Xa Trì Quốc |
| `laoquan` | Thái Thượng Lão Quân | Thông Thiên Hà · Kim Đâu Sơn |
| `nuquan` | Nữ Quan Tây Lương | Tây Lương Nữ Quốc |
| `nuvuong` | Nữ Vương Tây Lương | Tây Lương Nữ Quốc |
| `laonhan` | Lão Nhân Hỏa Diệm Sơn | Hỏa Diệm Sơn · Tế Tái Quốc |
| `hanhtien` | Hạnh Tiên | Hỏa Diệm Sơn · Tế Tái Quốc |
| `tieuyeu` | Tiểu Yêu Tuần Núi | Bàn Ti Động · Sư Đà Lĩnh |
| `thieunu` | Thiếu Nữ Trong Rừng | Tỳ Khâu Quốc · Vô Để Động |
| `quan` | Thái Thú Phượng Tiên | Thiên Trúc · Linh Sơn |
| `tiepdan` | Tiếp Dẫn Phật Tổ | Thiên Trúc · Linh Sơn |
| `khau` | Khấu Viên Ngoại | Thiên Trúc · Linh Sơn |
| `longvuong` | Đông Hải Long Vương | Đông Hải Long Cung |
| `longnu` | Long Nữ Dược Sư | Đông Hải Long Cung |
| `quythua` | Quy Thừa Tướng | Đông Hải Long Cung |
| `diemvuong` | Diêm La Vương | U Minh Địa Phủ |
| `manhba` | Mạnh Bà | U Minh Địa Phủ |
| `phanquan` | Thôi Phán Quan | U Minh Địa Phủ |
| `diatang` | Địa Tạng Bồ Tát | U Minh Địa Phủ |
| `dethinh` | Đế Thính | U Minh Địa Phủ |
| `thanhdieu` | Thanh Điểu Sứ Giả | Côn Lôn Tiên Sơn |
| `hacdong` | Bạch Hạc Đồng Tử | Côn Lôn Tiên Sơn |
| `vuongmau` | Tây Vương Mẫu | Côn Lôn Tiên Sơn |
| `ludongtan` | Lữ Động Tân | Bồng Lai Tiên Đảo |
| `hatien` | Hà Tiên Cô | Bồng Lai Tiên Đảo |
| `laoquan` | Thái Thượng Lão Quân | Bồng Lai Tiên Đảo |
| `ngocde` | Ngọc Hoàng Thượng Đế | Nam Thiên Môn |
| `ludongtan` | Lữ Động Tân (dùng tranh kiếm khách nam) | Bồng Lai Tiên Đảo |
| *Nhân vật mới* | | |
| `caothai` · `tieutang` · `duongtang_ngua` | Cao Thái Công · Tiểu Sa Di · Đường Tăng cưỡi Bạch Long Mã | Cao Lão Trang · Quan Âm Viện · đi theo người chơi |
| `laodo` · `thanhphong` · `minhnguyet` · `vuaoke_song` · `vanthu` | Lão Lái Đò · Thanh Phong · Minh Nguyệt · Vua Ô Kê · Văn Thù Bồ Tát | Lưu Sa · Ngũ Trang Quán · Ô Kê Quốc |
| `tranlao` · `baba` · `maonhat` · `dilac` · `vuachutu` | Trần Lão · Bà Lão Nữ Quốc · Mão Nhật Tinh Quan · Di Lặc · Vua Chu Tử | Thông Thiên Hà → Chu Tử Quốc |
| `thotinh` · `lythienvuong` · `tilam` · `phohien` · `minhvuong` · `thaiat` · `ngutieu` | Thọ Tinh · Lý Thiên Vương · Tì Lam · Phổ Hiền · Khổng Tước Minh Vương · Thái Ất Thiên Tôn · Ngư Ông | Bàn Ti → Bồng Lai |
| `hatuong` | Hà Binh Hải Tộc (lính) | Đông Hải |
| `quysai` | Quỷ Sai U Minh (lính) | Địa Phủ |
| `mabinh` | Ma Binh Hỗn Độn (lính) | Nam Thiên Môn · Hỗn Độn |

## 3. Boss – `public/assets/bosses/`

Boss lớn hơn: **640 × 760 px** (người/thú đứng), nền trong suốt, quay mặt sang **phải**.

| Mã | Tên |
|---|---|
| `culinh` | Cự Linh Thần |
| `nata` | Na Tra |
| `nhilang` | Nhị Lang Thần |
| `luuhong` | Thủy Tặc Lưu Hồng |
| `dantuong` | Dần Tướng Quân |
| `tieubachlong` | Tiểu Bạch Long |
| `hachhung` | Hắc Hùng Tinh |
| `batgioi` | Trư Bát Giới |
| `hoangphong` | Hoàng Phong Quái |
| `satang` | Sa Ngộ Tĩnh |
| `tranguyen` | Trấn Nguyên Đại Tiên |
| `bachcot` | Bạch Cốt Tinh |
| `hoangbao` | Hoàng Bào Quái |
| `ngangiac` | Ngân Giác Đại Vương |
| `kimgiac` | Kim Giác Đại Vương |
| `giavuong` | Giả Quốc Vương |
| `honghai` | Hồng Hài Nhi |
| `dalong` | Đà Long |
| `holuc` | Hổ Lực Đại Tiên |
| `duongluc` | Lộc Lực · Dương Lực |
| `linhcam` | Linh Cảm Đại Vương |
| `docgiac` | Độc Giác Hủy Đại Vương |
| `bocap` | Bò Cạp Tinh |
| `lucnhi` | Lục Nhĩ Mỹ Hầu |
| `thietphien` | Thiết Phiến Công Chúa |
| `nguuma` | Ngưu Ma Vương |
| `cuudau` | Cửu Đầu Phò Mã |
| `hoangmi` | Hoàng Mi Đại Vương |
| `manxa` | Hồng Lân Đại Mãng |
| `kimmao` | Trại Thái Tuế |
| `nhentinh` | Thất Nhện Tinh |
| `bachnhan` | Bách Nhãn Ma Quân |
| `thanhsu` | Thanh Sư Vương |
| `bachtuong` | Bạch Tượng Vương |
| `daibang` | Đại Bàng Kim Sí |
| `quoctruong` | Quốc Trượng Bạch Lộc |
| `chuottinh` | Địa Dũng Phu Nhân |
| `baotinh` | Nam Sơn Đại Vương |
| `hoangsu` | Hoàng Sư Tinh |
| `cuulinh` | Cửu Linh Nguyên Thánh |
| `teguu` | Tích Hàn Đại Vương |
| `ngoctho` | Ngọc Thố Tinh |
| `laongoan` | Lão Ngoan |
| `world` | Cửu Đầu Trùng |
| *Hậu truyện* | |
| `daxoa` · `quyma` · `giaoma` | Dạ Xoa Tuần Hải · Huyền Quy Ma Tướng · Giao Ma Vương (Đông Hải) |
| `nguudau` · `madien` · `huyetha` | Ngưu Đầu · Mã Diện (ma hoá) · Huyết Hà Lão Tổ (Địa Phủ) |
| `banglang` · `tuyetma` · `khaiminh` | Băng Lang Vương · Tuyết Ma Nữ · Khai Minh Thú (Côn Lôn) |
| `thanlau` · `kimngao` · `aodieu` | Thận Lâu Yêu Mẫu · Kim Ngao Ma Tướng · Ảo Điểu Vương (Bồng Lai) |
| `loibo` · `cuudieu` · `honthe` | Lôi Bộ Ma Tướng · Cửu Diệu Ma Tinh · Hỗn Thế Ma Vương (Nam Thiên Môn) |
| `tamma` · `hondonthu` · `mato` | Tâm Ma Ảnh · Hỗn Độn Thú · Hỗn Độn Ma Tổ (Hỗn Độn) |
| `kiep_loi` · `kiep_hoa` | Cửu Thiên Lôi Thần · Nghiệp Hỏa Tinh Quân (Phi Thăng) |

Thần sủng dùng chung tranh boss cùng mã (`tieubachlong`, `nata`, `honghai`, `hachhung`, `bachcot`, `ngoctho`, `thietphien`, `kimgiac`, `linhcam`, `nguuma`, `nhilang`, `lucnhi`).

## 4. Tiên sủng / quái – `public/assets/monsters/`

**600 × 500 px** (thú bốn chân, chim, rắn…) hoặc **512 × 660 px** (dạng người), nền trong suốt, quay mặt sang **phải**. Một hình dùng cho mọi hệ (Kim/Mộc/Thủy/Hỏa/Thổ).

| Mã | Tên loài |
|---|---|
| `hautinh` | Hầu Tinh |
| `truyeu` | Trư Yêu |
| `holy` | Hồ Ly |
| `hoyeu` | Hổ Yêu |
| `langyeu` | Lang Yêu |
| `xatinh` | Xà Tinh |
| `thiemthu` | Thiềm Thừ |
| `tienhac` | Tiên Hạc |
| `phuong` | Phượng Hoàng |
| `thanhlong` | Thần Long |
| `kylan` | Kỳ Lân |
| `huyenquy` | Huyền Quy |
| `nguuma` | Ngưu Ma |
| `thongoc` | Thỏ Ngọc |
| `battuong` | Bất Tượng |
| `kimbang` | Đại Bằng |
| `hachung` | Hùng Tinh |
| `thutinh` | Thử Tinh |
| `nhentinh` | Chu Tinh |
| `hatinh` | Hạt Tinh |
| `longma` | Long Mã |
| `suvuong` | Sư Vương |
| `viemthu` | Viêm Thú |
| `bachcot` | Cốt Tinh |
| `thuyquai` | Thủy Quái |
| `doiyeu` | Biên Bức |
| `khongtuoc` | Khổng Tước |
| `quyhoa` | U Linh |

## 5. Thú cưỡi – `public/assets/mounts/`

**600 × 420 px**, nhìn ngang quay sang **phải**, nền trong suốt (nhân vật được đặt ngồi phía trên).

| Mã | Tên |
|---|---|
| `bachma` | Bạch Long Mã |
| `hoho` | Hổ Vằn |
| `hac` | Tiên Hạc |
| `kylan` | Kỳ Lân |
| `candau` | Cân Đẩu Vân |
| `longquy` | Long Quy |
| `tuyetlang` | Tuyết Lang |
| `aodieu` | Ảo Điểu |

## 6. Bản đồ – `public/assets/maps/`

Mỗi bản đồ là một **bức tranh vẽ tay khung dọc** (AI vẽ 1024 × 1536). Game cắt giữa đúng tỉ lệ lưới **12 × 20 ô** rồi phóng lên **1200 × 2000 px** (WEBP). Lưới đi lại (đường, nhà, nước, cổng, chỗ NPC) **dò lại theo tranh** trong `game/story.js` → `PAINTED`; tranh không cần khớp lưới cũ.
- `<mã>.webp` – tranh nền.
- `<mã>_front.png` *(tuỳ chọn)* – lớp phía trước (mái nhà, tán cây che nhân vật).
- `world.webp`, `world2.webp` – bản đồ tổng 81 kiếp nạn và Hậu truyện.

35 bản đồ (29 chính truyện + 6 Hậu truyện). Cột *Phông* là tên tranh phông trận đấu dùng cho bản đồ đó.

| Mã | Tên | Bối cảnh | Phông |
|---|---|---|---|
| `ch1` | Thiên Cung | heaven | `heaven` |
| `truongan` | Trường An | city | `city` |
| `ngusonhanh` | Song Xoa Lĩnh · Ngũ Hành Sơn | forest | `mountain` |
| `quanamvien` | Quan Âm Viện · Hắc Phong Sơn | forest | `temple` |
| `caolao` | Cao Lão Trang · Hoàng Phong Lĩnh | forest | `forest` |
| `luusa` | Lưu Sa Hà | river | `sandriver` |
| `ngutrang` | Tứ Thánh Trang · Ngũ Trang Quán | forest | `temple` |
| `bachho` | Bạch Hổ Lĩnh | forest | `mountain` |
| `baotuong` | Động Ba Nguyệt · Bảo Tượng Quốc | city | `palace` |
| `binhdinh` | Bình Đỉnh Sơn · Liên Hoa Động | cave | `cave` |
| `oke` | Bảo Lâm Tự · Ô Kê Quốc | city | `palace` |
| `hieuson` | Hiệu Sơn · Hắc Thủy Hà | cave | `cave` |
| `xatri` | Xa Trì Quốc | desert | `desert` |
| `thongthien` | Trần Gia Trang · Thông Thiên Hà | snow | `frozenriver` |
| `kimdau` | Kim Đâu Sơn | snow | `frozenriver` |
| `nunhi` | Tây Lương Nữ Quốc | city | `palace` |
| `docdich` | Độc Địch Sơn · Thủy Liêm Động | cave | `cave` |
| `hoadiem` | Hỏa Diệm Sơn | desert | `firemountain` |
| `tetai` | Tế Tái Quốc · Kinh Cức Lĩnh | city | `palace` |
| `tieuloiam` | Tiểu Lôi Âm · Thất Tuyệt Sơn | heaven | `temple` |
| `chutu` | Chu Tử Quốc · Kỳ Lân Sơn | city | `palace` |
| `banti` | Bàn Ti Động · Hoàng Hoa Quán | cave | `cave` |
| `suda` | Sư Đà Lĩnh · Sư Đà Thành | cave | `cave` |
| `tykhau` | Tỳ Khâu Quốc · Liễu Lâm Pha | city | `palace` |
| `vodedong` | Hắc Tùng Lâm · Vô Để Động | cave | `cave` |
| `ngochoa` | Phượng Tiên Quận · Ngọc Hoa Châu | city | `palace` |
| `kimbinh` | Kim Bình Phủ · Thanh Long Sơn | snow | `cave` |
| `thientruc` | Thiên Trúc Quốc | city | `palace` |
| `linhson` | Linh Sơn | heaven | `linhson` |
| `donghai` | Đông Hải Long Cung | sea | `sea` | Hậu truyện
| `diaphu` | U Minh Địa Phủ | hell | `hell` | Hậu truyện
| `conlon` | Côn Lôn Tiên Sơn | snow | `snow` | Hậu truyện
| `bonglai` | Bồng Lai Tiên Đảo | river | `river` | Hậu truyện
| `namthien` | Nam Thiên Môn | heaven | `heaven` | Hậu truyện
| `hondon` | Hỗn Độn Hư Không | void | `void` | Hậu truyện

Đã có tranh: `ch1` (lưới đã dò), `world`, `world2`.

## 7. Phông chiến đấu – `public/assets/battle/`

**Dọc 9:16**, JPG/WEBP, **nhìn chéo từ trên xuống ~40°** (gần như không thấy trời): 1/4 phía trên là cảnh nhận ra nơi chốn, giữa là bãi trống phẳng (địch bên trái, phe mình bên phải), đồ trang trí chỉ ở mép và góc. Đã có: `village`, `forest`, `heaven`, `river`, `cave`. Game tìm phông theo cột *Phông* của bản đồ, không có thì dùng phông vẽ bằng code theo bối cảnh.

Tên phông: `heaven` · `city` · `forest` · `mountain` · `temple` · `sandriver` · `river` · `palace` · `cave` · `desert` · `frozenriver` · `firemountain` · `linhson` · `sea` · `hell` · `kunlun` · `penglai` · `void` · `arena` (Tam Giới Đấu, Trấn Yêu Tháp) · `world` (boss thế giới).

## 8. Tranh theo hệ, hình biến, hiệu ứng, đồ vật

- **Tiên sủng theo hệ**: `monsters/<loài>_<hệ>.png`, hệ = `kim` · `moc` · `thuy` · `hoa` · `tho` (vd. `suvuong_thuy`). Thiếu hệ nào thì dùng `monsters/<loài>.png`, rồi tới hình vẽ code.
- **Quái dạng người**: `npcs/<mã>.png` (`thienbinh`, `sontac`, `thuytac`, `tieuyeu`, `hoayeu`, `daodong`, `hatuong`, `quysai`, `mabinh`).
- **Hình biến của boss** (đổi tranh khi sang giai đoạn): `nata_2`, `giavuong_2`, `nguuma_2`, `cuudau_2`, `quoctruong_2`, `chuottinh_2`, `ngoctho_2`, `mato_2`, `mato_3`; Bạch Cốt Tinh: `bachcot_a` (thôn nữ) → `bachcot_b` (bà lão) → `bachcot_c` (ông lão) → `bachcot` (nguyên hình). Bảng ở `game/data.js` → `BOSS_ART`.
- **Tư thế ra đòn**: `heroes/<mã>_atk.png` (đợt 6).
- **Hiệu ứng chiêu** `public/assets/fx/` (vẽ trên **nền đen**, game hoà sáng): `loi`, `hoa`, `hoa_cot`, `bang`, `nuoc`, `moc`, `doc`, `tho`, `kim`, `phat_chuong`, `chuong_vang`, `sen`, `bua`, `xoay`, `no`, `thang_cap`.
- **Đồ vật trên bản đồ** `public/assets/objects/`: `khoang`, `thao`, `tuyen`, `cong`, `ruong`, `ruong_mo`, `sap`, `bia`.
- **Giao diện** `public/assets/ui/`: `round` (khung đếm hiệp – đã có), `versus` (nền màn Vào trận – đã có), `login`, `phai_phat`, `phai_tien`, `phai_yeu`, `icon`. **Biểu tượng** `public/assets/icons/`: tấm 3 × 2 (Claude tự cắt).
- **NPC có tranh riêng** dùng trường `art` trong `game/story.js` (vd. Cao Thái Công `art: caothai`), còn `look` là hình vẽ code dự phòng.

Toàn bộ lệnh vẽ (449 ảnh, chia 6 đợt): trang *Bộ Lệnh Vẽ Tây Du Ký · Toàn Tập*.

## Mẹo tạo tranh bằng công cụ AI

Mô tả mẫu (tiếng Anh cho kết quả tốt hơn): *"chibi character, Journey to the West inspired, cute big head, soft cel shading, brown outline, three-quarter view facing right, full body, transparent background, mobile game art"* rồi thêm mô tả riêng từng nhân vật (trang phục, màu, vũ khí). Với bản đồ: *"top-down 3/4 view game map, hand-painted, Chinese village, dirt path, thatched hut, peach blossom tree, pond, lush grass"*. Sau đó cắt nền và đặt đúng kích thước ở trên.