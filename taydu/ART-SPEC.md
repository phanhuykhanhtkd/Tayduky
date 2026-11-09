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
| `nhilang` | Thái Tử Ma Ngang | Hiệu Sơn · Hắc Hà |
| `honghai` | Đứa Bé Treo Trên Cây | Hiệu Sơn · Hắc Hà |
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

Mỗi bản đồ là lưới **12 × 20 ô**. Vẽ cả bản đồ thành **một bức tranh 1200 × 2000 px** (100 px mỗi ô), nhìn từ trên xuống chéo như ảnh mẫu. Bám đúng vị trí ô trong `game/data.js` (`.` đường đi, `,` cỏ có quái, `~` nước, `T` cây, `H` nhà, `#` vách/đá, `P` cổng sang bản đồ sau) để nhân vật đi đúng chỗ.
- `<mã>.jpg` – tranh nền (đã gồm nhà, cây, đá).
- `<mã>_front.png` *(tuỳ chọn)* – lớp phía trước, nền trong suốt, chỉ chứa phần mái nhà / tán cây cần che lên nhân vật khi đi phía sau.

| Mã | Tên | Bối cảnh |
|---|---|---|
| `ch1` | Thiên Cung | heaven |
| `ch2` | Trường An · Song Xoa Lĩnh | city |
| `quanamvien` | Quan Âm Viện · Hoàng Phong Lĩnh | forest |
| `luusa` | Lưu Sa Hà · Ngũ Trang Quán | river |
| `ch3` | Bạch Hổ Lĩnh · Bảo Tượng Quốc | forest |
| `binhdinh` | Bình Đỉnh Sơn · Ô Kê Quốc | cave |
| `hieuson` | Hiệu Sơn · Hắc Hà | cave |
| `xatri` | Xa Trì Quốc | desert |
| `thongthien` | Thông Thiên Hà · Kim Đâu Sơn | snow |
| `nunhi` | Tây Lương Nữ Quốc | city |
| `ch4` | Hỏa Diệm Sơn · Tế Tái Quốc | desert |
| `tieuloiam` | Tiểu Lôi Âm · Chu Tử Quốc | heaven |
| `sudalinh` | Bàn Ti Động · Sư Đà Lĩnh | cave |
| `vodedong` | Tỳ Khâu Quốc · Vô Để Động | cave |
| `thientruc` | Thiên Trúc · Linh Sơn | heaven |
| `donghai` | Đông Hải Long Cung | sea |
| `diaphu` | U Minh Địa Phủ | hell |
| `conlon` | Côn Lôn Tiên Sơn | snow |
| `bonglai` | Bồng Lai Tiên Đảo | river |
| `namthien` | Nam Thiên Môn | heaven |
| `hondon` | Hỗn Độn Hư Không | void |

## 7. Phông chiến đấu – `public/assets/battle/`

**1170 × 2532 px** (dọc, tỉ lệ iPhone), JPG. Phần trên ~35% là trời và cảnh xa; giữa–dưới là bãi đấu (phe địch đứng bên trái, phe mình bên phải, khoảng 40%–88% chiều cao). Tránh chi tiết quá rối ở 20% dưới cùng (có nút lệnh đè lên).

| Mã | Dùng cho |
|---|---|
| `city` | Trường An, Nữ Quốc (thành thị) |
| `forest` | Rừng núi |
| `river` | Sông nước |
| `heaven` | Thiên Cung, Linh Sơn |
| `cave` | Hang động |
| `snow` | Núi tuyết |
| `desert` | Hỏa Diệm Sơn, sa mạc |
| `arena` | Trấn Yêu Tháp, Tam Giới Đấu |
| `world` | Boss thế giới |
| `sea` | Đông Hải Long Cung, phó bản Long Cung |
| `hell` | U Minh Địa Phủ, phó bản Địa Ngục |
| `void` | Hỗn Độn Hư Không, Tâm Ma Kiếp |

## Mẹo tạo tranh bằng công cụ AI

Mô tả mẫu (tiếng Anh cho kết quả tốt hơn): *"chibi character, Journey to the West inspired, cute big head, soft cel shading, brown outline, three-quarter view facing right, full body, transparent background, mobile game art"* rồi thêm mô tả riêng từng nhân vật (trang phục, màu, vũ khí). Với bản đồ: *"top-down 3/4 view game map, hand-painted, Chinese village, dirt path, thatched hut, peach blossom tree, pond, lush grass"*. Sau đó cắt nền và đặt đúng kích thước ở trên.