// =====================================================================
//  BẢN ĐỒ SỐNG ĐỘNG – làm tranh bản đồ vẽ tay chuyển động tự nhiên
//  nước gợn, thác đổ, cây cỏ đung đưa theo gió, khói, lửa, đèn lồng,
//  lá/hoa rơi, sương trôi, bóng mây, chim bay.
//  Toạ độ trong bảng LIVE tính theo ô (lưới 12 × 20 của bản đồ).
// =====================================================================
const Living = (() => {
  // ---------- mô tả từng bản đồ ----------
  // water: [x, y, w, h, am] – mặt nước gợn sóng + ánh lấp lánh (am: độ gợn, mặc định 1)
  // fall:  [x, y, w, h]   – thác nước
  // sway:  [x, y, w, h, k] – tán cây / bụi cỏ đung đưa (k = độ mạnh, 1 = cây, .6 = cỏ)
  // bob:   [x, y, w, h]   – vật nổi bồng bềnh (thuyền)
  // smoke: [x, y, kind]   – incense | fire | dark | steam
  // fire:  [x, y, s]      – lửa chậu than / đuốc
  // glow:  [x, y, r, rgb] – đèn lồng, bùa phát sáng
  // mist:  [x, y, w, h]   – dải sương trôi
  // fallK: loại lá rơi; birds: loại chim; shade: bóng mây; rays: tia nắng
  const LIVE = {
    ch1: {
      water: [[1.6, 7.05, 10.4, 0.95], [8.3, 7.9, 3.7, 0.55], [4.6, 9.05, 2.8, 0.7]],
      sway: [[0, 4, 2.3, 2.6, 1], [0, 7.6, 3, 2.4, 1], [7.3, 9.3, 4.7, 2.6, 1], [8.6, 5.6, 3.4, 1.9, 1], [1.8, 11.8, 3.8, 2.6, 1]],
      smoke: [[2.15, 15.2, 'incense'], [5.5, 4.2, 'incense']],
      glow: [[3.67, 5.9, 0.7, '255,214,120'], [9.9, 8.6, 0.7, '255,214,120'], [2.6, 8.25, 0.7, '255,214,120'], [0.7, 16.8, 0.8, '255,200,110'], [0.75, 13.6, 0.6, '255,120,70'], [2.0, 13.2, 0.6, '255,120,70'], [9.8, 15.2, 0.6, '255,120,70'], [11.2, 15.2, 0.6, '255,120,70'], [9.2, 12.4, 0.7, '255,214,120'], [3.6, 11.4, 0.7, '255,214,120']],
      mist: [[0, 0, 12, 2], [0, 17.5, 12, 2.5], [0, 9.5, 3, 2], [9, 3, 3, 2]],
      fallK: 'petal', birds: 'crane', shade: 0.06, rays: true, sparkle: true,
    },
    truongan: {
      water: [[0, 18.0, 10.5, 2.0], [7.7, 17.05, 1.5, 0.95], [2.6, 16.9, 0.6, 1.1]],
      bob: [[0.15, 16.15, 2.5, 1.45]],
      sway: [[0, 1.7, 3.3, 1.6, 1], [8.8, 1.6, 2.4, 1.4, 1], [0, 13.0, 1.3, 2.0, 1.2], [10.4, 16.6, 1.6, 2.6, 1.2], [0, 4, 1.6, 1.8, 1], [2, 8.6, 2.2, 1.6, 0.9], [0.4, 12.0, 2.4, 1.8, 0.9], [0, 18.6, 3.0, 1.4, 0.6]],
      smoke: [[4.4, 6.15, 'incense']],
      glow: [[1.3, 8.15, 0.6, '255,110,60'], [10.55, 8.1, 0.6, '255,110,60'], [8.9, 11.0, 0.6, '255,110,60'], [9.4, 13.3, 0.6, '255,110,60'], [5.2, 10.1, 0.55, '255,110,60'], [2.7, 11.3, 0.55, '255,110,60'], [10.6, 15.8, 0.6, '255,190,100'], [9.5, 16.3, 0.6, '255,190,100'], [3.0, 5.4, 0.6, '255,190,100'], [8.2, 2.5, 0.6, '255,190,100']],
      mist: [[0, 18.2, 12, 1.8]],
      fallK: 'petal', birds: 'sparrow', shade: 0.07,
    },
    ngusonhanh: {
      water: [[0.9, 2.9, 4.1, 1.1], [7.9, 2.9, 3.1, 1.0], [5.0, 1.9, 3.2, 0.6]],
      fall: [[2.3, 1.7, 0.75, 1.15], [9.5, 2.1, 0.7, 1.2]],
      sway: [[0, 8.5, 4, 3.5, 1], [6.8, 9.6, 5.2, 2.6, 1], [1, 11.4, 3, 1.4, 0.6], [7.8, 12.8, 4, 1.4, 0.6], [4.6, 10.6, 1.6, 0.9, 0.6], [0, 0, 2.6, 1.3, 0.8], [3.6, 3.6, 1.4, 1.6, 0.7]],
      fire: [[5.3, 16.25, 1], [8.15, 17.35, 1]],
      smoke: [[5.3, 16.1, 'fire'], [8.15, 17.2, 'fire']],
      glow: [[6.45, 3.7, 0.9, '255,220,120'], [1.4, 14.6, 0.55, '255,170,80'], [1.45, 15.6, 0.5, '255,170,80'], [3.05, 17.4, 0.5, '255,170,80'], [3.8, 17.4, 0.5, '255,170,80']],
      pulse: [[6.45, 3.7, 0.55, '255,226,140']],
      mist: [[0, 4, 12, 2.6], [0, 6.4, 12, 1.4], [0, 0.6, 12, 1.2]],
      fallK: 'leaf', birds: 'crow', shade: 0.09,
    },
    quanamvien: {
      sway: [[0, 4.5, 4, 5, 1], [7, 7.8, 5, 3, 1], [8.5, 3.8, 3.5, 2, 1], [5.5, 12.4, 1.6, 1.4, 1], [0, 13.0, 1.4, 2.0, 1], [10.3, 15.6, 1.7, 2, 1], [9.6, 5.8, 2, 1, 0.6], [3.6, 4.6, 1.8, 1, 0.6]],
      smoke: [[4.9, 14.75, 'incense'], [9.5, 11.3, 'dark'], [10.4, 10.0, 'dark'], [1.8, 1.9, 'wind'], [3.0, 2.2, 'wind']],
      embers: [[9.5, 11.6, 1.8, 0.9]],
      glow: [[5.3, 8.3, 0.55, '255,190,100'], [4.0, 9.8, 0.55, '255,190,100'], [6.15, 9.9, 0.55, '255,190,100'], [5.55, 11.7, 0.55, '255,190,100'], [6.1, 13.6, 0.55, '255,190,100'], [1.9, 14.2, 0.55, '255,190,100'], [2.95, 15.5, 0.55, '255,190,100'], [8.85, 14.8, 0.55, '255,190,100'], [4.25, 18.2, 0.6, '255,190,100'], [9.6, 18.3, 0.6, '255,190,100'], [3.0, 13.3, 0.9, '255,200,120'], [2.8, 16.2, 0.5, '255,110,60'], [4.5, 16.2, 0.5, '255,110,60']],
      mist: [[0, 0, 12, 3], [0, 5.5, 12, 1.5]],
      fallK: 'petal', birds: 'crow', shade: 0.1,
    },
    caolao: {
      water: [[0, 16.7, 1.9, 1.1], [0.6, 18.1, 3.4, 1.5]],
      sway: [[0, 4.6, 2.8, 3.4, 1], [8.1, 2.3, 3.3, 1.6, 1], [9.7, 6.3, 2.3, 1.7, 1], [5.6, 6.3, 1.8, 1.2, 0.9], [4.5, 10.2, 2.4, 1.6, 1], [10, 8.8, 2, 1.4, 1], [0, 8.0, 1, 2, 1],
        [0.9, 8.2, 3, 0.9, 0.55], [0, 10.6, 2.6, 1.4, 0.55], [7.2, 6.3, 3, 1.6, 0.5], [0, 17.6, 4, 2.4, 0.5], [8.6, 16.6, 3.4, 3, 0.4], [1.4, 4.2, 2.4, 1, 0.5]],
      smoke: [[5.2, 13.85, 'steam'], [2.4, 2.1, 'sand'], [0.6, 2.0, 'sand'], [10.8, 1.4, 'sand']],
      glow: [[5.65, 13.3, 0.55, '255,110,60'], [7.0, 13.6, 0.55, '255,110,60'], [8.35, 13.6, 0.55, '255,110,60'], [2.9, 15.6, 0.55, '255,110,60'], [4.5, 15.6, 0.55, '255,110,60'], [10.1, 11.0, 0.5, '255,200,120'], [9.0, 11.0, 0.5, '255,200,120']],
      mist: [[0, 0.5, 12, 2.2]],
      fallK: 'autumn', birds: 'sparrow', shade: 0.08,
    },
    // ---------------- đợt 2 ----------------
    luusa: {
      water: [[0, 3.95, 12, 8.3, 0.55]],
      bob: [[3.9, 5.9, 4.2, 2.2]],
      sway: [[0, 1.6, 4, 2.4, 0.6], [9, 2.4, 3, 1.8, 0.6], [7.5, 11, 4.5, 3, 0.6], [0, 15.9, 2.6, 1.6, 0.6], [0, 11.8, 1.2, 1.2, 0.6], [9.2, 1, 2.5, 1.2, 0.9], [7.4, 0.2, 1.4, 1, 0.9]],
      smoke: [[0.2, 5.5, 'sand'], [0.2, 8.6, 'sand'], [0.2, 10.8, 'sand'], [6, 4.4, 'sand']],
      glow: [[3.65, 13.6, 0.55, '255,170,80'], [2.05, 14.2, 0.55, '255,170,80']],
      fallK: 'leaf', birds: 'sparrow', shade: 0.06,
    },
    ngutrang: {
      water: [[2.3, 15.6, 2.6, 1.0]],
      sway: [[0, 0, 5, 3, 0.9], [0, 6, 3.5, 3, 1], [7.5, 8.5, 4, 2.5, 1], [1, 10, 4, 2, 1], [8.8, 5, 3.2, 1.6, 1], [8, 11.8, 3, 1.6, 1], [0, 11.8, 2.5, 2, 1], [3.5, 13.6, 2.5, 1.6, 1], [8.5, 13, 3.5, 4, 1], [0, 16.6, 2, 3, 1]],
      smoke: [[7.0, 4.0, 'incense']],
      glow: [[4.8, 5.2, 0.55, '255,190,100'], [9.2, 5.2, 0.55, '255,190,100'], [4.9, 6.4, 0.5, '255,190,100'], [4.3, 8.1, 0.5, '255,190,100'], [7.3, 8.3, 0.5, '255,190,100'], [3.5, 9.6, 0.5, '255,190,100'], [4.5, 12.5, 0.5, '255,190,100'], [8.3, 11.3, 0.5, '255,190,100'], [3.9, 18.0, 0.55, '255,190,100'], [8.2, 18.1, 0.55, '255,190,100'], [5.9, 3.3, 0.5, '255,120,70'], [8.3, 3.3, 0.5, '255,120,70']],
      pulse: [[1.0, 1.1, 0.35, '255,230,120'], [3.4, 1.2, 0.35, '255,230,120'], [4.4, 1.6, 0.3, '255,230,120'], [2.2, 0.5, 0.3, '255,230,120']],
      mist: [[9, 6, 3, 2.5], [0, 5, 2, 1.5], [10, 11, 2, 2]],
      fallK: 'petal', birds: 'crane', shade: 0.06, sparkle: true,
    },
    bachho: {
      sway: [[0, 3, 2, 2, 0.5], [7.8, 1.7, 3.5, 2.6, 0.5], [10.4, 6.6, 1.6, 1.4, 0.5], [0, 7.8, 1, 1.6, 0.5], [0, 12.5, 3, 4, 1], [8.3, 14.5, 3.7, 3.5, 1], [10.5, 12, 1.5, 1.6, 1],
        [3, 13.7, 1.5, 1, 0.6], [6, 14.8, 2, 1, 0.6], [0, 15.3, 2, 2, 0.6], [2.8, 16.3, 2, 1.5, 0.6], [6.6, 17, 1.4, 1.4, 0.6]],
      smoke: [[2.6, 7.4, 'wind'], [10.6, 9.3, 'wind'], [1.6, 11.1, 'wind']],
      pulse: [[2.7, 7.3, 0.45, '120,180,255']],
      mist: [[0, 0, 12, 2.2], [0, 4, 4, 2], [8, 4.5, 4, 2]],
      fallK: 'autumn', birds: 'crow', shade: 0.1,
    },
    baotuong: {
      water: [[4.7, 6.3, 6, 1.1], [0, 4.9, 2.6, 1.1], [0, 13.4, 1, 0.7], [0, 15.8, 1, 1.4]],
      fall: [[1.2, 11, 1, 1.6], [1.3, 16.5, 0.5, 1.3]],
      fire: [[4.35, 16.9, 1], [7.85, 16.9, 1]],
      smoke: [[4.35, 16.7, 'fire'], [7.85, 16.7, 'fire']],
      glow: [[3.5, 10.3, 0.55, '255,200,110'], [3.45, 12.5, 0.55, '255,200,110'], [7.75, 7.8, 0.55, '255,200,110']],
      pulse: [[10, 15.2, 0.6, '140,200,255']],
      sway: [[0, 13.6, 3.2, 3.4, 1.2], [1.2, 1.8, 2, 0.9, 1], [8, 1.9, 3, 0.8, 1], [7, 8.8, 2.8, 1.4, 1], [10.4, 8.1, 1.6, 1.8, 1], [0, 9.6, 1.4, 1.4, 1], [3, 4.5, 2, 1, 1], [7.8, 4.6, 2, 1.2, 1],
        [0, 7.6, 3, 1.2, 0.5], [0, 8.6, 3.6, 1, 0.4], [9.9, 7.5, 2.1, 1, 0.5]],
      fallK: 'petal', birds: 'sparrow', shade: 0.07,
    },
    binhdinh: {
      fall: [[0.6, 5.8, 0.6, 1.8], [11.5, 3.8, 0.5, 2], [11.6, 11.5, 0.4, 1.5]],
      fire: [[2.1, 9.2, 1], [6.6, 9.1, 1.1], [10.1, 9.6, 1]],
      smoke: [[2.1, 9.0, 'fire'], [6.6, 8.9, 'fire'], [10.1, 9.4, 'fire']],
      glow: [[10.9, 2.2, 0.5, '255,200,110'], [8.5, 4.6, 0.5, '255,200,110'], [5.6, 5.8, 0.5, '255,200,110'], [6.3, 11.4, 0.5, '255,200,110'], [8.6, 10.6, 0.5, '255,200,110']],
      sway: [[1.2, 11, 4.6, 4, 1], [8.6, 12.5, 3.4, 3, 1], [6.4, 15.8, 5.6, 3.2, 1], [0, 16.6, 3, 3, 1], [10, 0, 2, 1, 1], [2, 6, 1.4, 1.2, 1], [0, 0, 4, 1, 0.5], [0, 4.8, 3.6, 1, 0.5], [6.6, 3, 1.4, 0.8, 0.5]],
      mist: [[0, 5, 1.5, 2], [0, 10.5, 1.6, 2], [10, 0, 2, 2], [10.5, 8.5, 1.5, 2]],
      fallK: 'leaf', birds: 'crow', shade: 0.08,
    },
    oke: {
      water: [[8, 3.95, 4, 1], [9.2, 3.3, 2.8, 0.6]],
      fall: [[10.8, 2, 0.6, 1.1]],
      sway: [[3.5, 1.6, 2.4, 1.4, 1], [7.2, 1.9, 2.4, 1.6, 1], [0.8, 6, 4, 2, 1], [7.6, 5.8, 4.4, 2, 1], [1, 7.8, 4.6, 2.4, 1], [6.6, 8.4, 4, 2, 1], [0, 9.8, 5, 3, 1], [6.8, 10.7, 5, 3, 1], [8, 12.5, 4, 2, 1], [0, 12.5, 3, 3, 1], [0, 15, 2, 2, 1], [9.4, 15.6, 2.6, 3, 1]],
      smoke: [[5.3, 17.3, 'incense']],
      glow: [[4.15, 6.0, 0.5, '255,200,110'], [7.8, 6.0, 0.5, '255,200,110'], [4.6, 6.9, 0.5, '255,200,110'], [7.35, 7.0, 0.5, '255,200,110'], [5.85, 8.2, 0.5, '255,200,110'], [4.45, 10.2, 0.5, '255,200,110'], [7.45, 10.4, 0.5, '255,200,110'], [4.25, 12.3, 0.5, '255,200,110'], [8.0, 13.8, 0.5, '255,200,110'], [3.45, 15.7, 0.5, '255,150,80'], [5.7, 15.7, 0.5, '255,150,80'], [2.55, 16.9, 0.55, '255,200,110'], [8.3, 16.9, 0.55, '255,200,110'], [3.6, 18.2, 0.55, '255,200,110'], [8.5, 18.3, 0.55, '255,200,110']],
      fallK: 'petal', birds: 'sparrow', shade: 0.07,
    },
    hieuson: {
      water: [[0, 1.05, 5.2, 0.95, 0.8], [0, 2, 6.3, 2.9, 0.8], [8.9, 1.05, 3.1, 1.9, 0.8]],
      bob: [[7.9, 4.6, 1.9, 0.6]],
      fire: [[2.7, 10.7, 1.2], [4.3, 10.7, 1.2], [5.9, 10.8, 1.2], [7.7, 10.7, 1.2], [9.2, 10.7, 1.2]],
      smoke: [[2.7, 10.5, 'fire'], [5.9, 10.6, 'fire'], [9.2, 10.5, 'fire']],
      embers: [[1, 8, 2, 2], [9, 8, 2, 2], [4, 9, 4, 1]],
      pulse: [[6, 9.3, 1.1, '255,120,40'], [2.8, 2.6, 0.9, '90,230,200']],
      glow: [[5.05, 0.25, 0.5, '255,200,110'], [6.8, 0.25, 0.5, '255,200,110'], [5.1, 4.9, 0.5, '255,200,110'], [4.35, 6.3, 0.5, '255,200,110'], [8.6, 7.2, 0.5, '255,200,110'], [1.5, 11.2, 0.5, '255,200,110'], [3.5, 12.2, 0.5, '255,200,110'], [7.4, 13.2, 0.5, '255,200,110'], [9.3, 3.9, 0.5, '255,170,80'], [10.6, 3.9, 0.5, '255,170,80']],
      sway: [[7.6, 12.8, 4.4, 2.5, 1], [0, 3.4, 1, 1.4, 0.5], [0, 13, 2, 2, 0.5], [3, 14.6, 2, 1.4, 0.4]],
      mist: [[0, 5, 2, 2], [10, 5.5, 2, 2], [0, 13, 3, 2], [9, 13.5, 3, 1.5]],
      birds: 'crow', shade: 0.08,
    },
    xatri: {
      water: [[8.3, 8.25, 2.2, 0.35, 0.5]],
      sway: [[8.6, 4.5, 3.4, 1.2, 1.6], [2.8, 2.3, 1.6, 1.2, 1], [8.3, 2.5, 1.4, 1.2, 1], [0, 3.8, 1, 1.2, 1], [1, 11.5, 4, 2.5, 1.2], [0, 14.4, 1.8, 2, 1.2], [10.4, 13.4, 1.6, 2, 1.2]],
      smoke: [[3.6, 7.6, 'incense'], [9.4, 8.4, 'steam'], [0.2, 15, 'sand'], [0.2, 17, 'sand'], [6, 18.5, 'sand']],
      glow: [[4.4, 3.1, 0.5, '255,200,110'], [7.55, 3.1, 0.5, '255,200,110'], [5.6, 4.4, 0.5, '255,200,110'], [7.3, 4.4, 0.5, '255,200,110'], [2.45, 6.3, 0.5, '255,150,80'], [4.1, 6.3, 0.5, '255,150,80'], [6.7, 7.6, 0.5, '255,200,110'], [0.9, 8.6, 0.5, '255,200,110'], [2.6, 9.9, 0.5, '255,200,110'], [6.3, 9.6, 0.5, '255,200,110'], [7.4, 10.8, 0.5, '255,200,110'], [4.1, 13.1, 0.5, '255,200,110'], [3.6, 18.2, 0.55, '255,200,110']],
      birds: 'sparrow', shade: 0.05,
    },
  };

  const low = () => typeof FX !== 'undefined' && FX.low;
  let curId = null, parts = [], birds = [], nextBird = 0, last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // gió: dao động chậm + cơn gió giật, dùng chung cho cây, khói, lá → mọi thứ chuyển động cùng nhịp
  function wind(now) { const g = Math.max(0, Math.sin(now / 7300) - 0.55) * 2.2; return 0.55 + 0.3 * Math.sin(now / 4100) + 0.15 * Math.sin(now / 1700 + 1.3) + g; }

  function has(id) { return !!LIVE[id]; }
  // đèn cho chế độ đêm (map.js nhân vào ánh sáng)
  function lights(id, T) { const L = LIVE[id]; return L ? (L.glow || []).map(([x, y, r, c]) => [x * T, y * T, r * T * 2.2, c]) : null; }

  function reset(id) { curId = id; parts = []; birds = []; nextBird = performance.now() + rnd(3000, 9000); }

  // ---------- lớp nền: nước, thác, cây cỏ (vẽ lại từng dải ảnh lệch nhẹ) ----------
  function ground(ctx, img, id, T, COLS, ROWS, now, view) {
    const L = LIVE[id]; if (!L || !img) return;
    if (id !== curId) reset(id);
    const sx = img.naturalWidth / (COLS * T), sy = img.naturalHeight / (ROWS * T);
    const vis = (x, y, w, h) => x < view.x + view.w && x + w > view.x && y < view.y + view.h && y + h > view.y;
    const slice = (x, y, w, h, dx, dy) => ctx.drawImage(img, x * sx, y * sy, w * sx, h * sy, x + dx, y + dy, w, h);
    const wd = wind(now), lo = low();
    // mặt nước: từng dải ngang dịch qua lại như sóng lăn tăn
    for (const [x0, y0, w0, h0, am = 1] of L.water || []) {
      const x = x0 * T, y = y0 * T, w = w0 * T, h = h0 * T; if (!vis(x, y, w, h)) continue;
      if (!lo) { const st = 3; for (let yy = 0; yy < h; yy += st) { const dx = (Math.sin(now / 650 + (y + yy) * 0.21) * 1.3 + Math.sin(now / 1500 + (y + yy) * 0.07) * 0.8) * am; slice(x, y + yy, w, Math.min(st, h - yy), dx, 0); } }
      // ánh nắng lấp lánh trên mặt nước
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
      const n = Math.ceil((w * h) / (T * T) * 1.6);
      for (let i = 0; i < n; i++) {
        const ph = (now / 2600 + i * 0.618) % 1, a = Math.sin(ph * Math.PI);
        const px = x + ((i * 97.3 + now / 90 * (0.4 + (i % 3) * 0.2)) % w), py = y + ((i * 53.7) % h);
        ctx.globalAlpha = 0.35 * a; ctx.fillStyle = '#fffbe8';
        ctx.beginPath(); ctx.ellipse(px, py, 3.2 + (i % 3), 0.8, 0, 0, 7); ctx.fill();
      }
      // vệt sóng trôi
      ctx.globalAlpha = 0.12; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
      for (let i = 0; i < Math.ceil(h / 14); i++) { const yy = y + 6 + i * 14 + Math.sin(now / 900 + i) * 2, off = (now / 40 + i * 60) % (w + 80) - 40; ctx.beginPath(); ctx.moveTo(x + off, yy); ctx.quadraticCurveTo(x + off + 12, yy - 2, x + off + 26, yy); ctx.stroke(); }
      ctx.restore();
    }
    // vật nổi: thuyền nhấp nhô
    for (const [x0, y0, w0, h0] of L.bob || []) { const x = x0 * T, y = y0 * T, w = w0 * T, h = h0 * T; if (!vis(x, y, w, h) || lo) continue; slice(x, y, w, h, Math.sin(now / 1700) * 0.8, Math.sin(now / 1100) * 1.4); }
    // cây cỏ: dải trên lệch nhiều, gốc đứng yên → đung đưa theo gió
    if (!lo) for (const [x0, y0, w0, h0, k = 1] of L.sway || []) {
      const x = x0 * T, y = y0 * T, w = w0 * T, h = h0 * T; if (!vis(x, y, w, h)) continue;
      const st = 4, amp = 2.1 * k * wd;
      for (let yy = 0; yy < h; yy += st) {
        const f = Math.pow(1 - yy / h, 1.6), dx = (Math.sin(now / (k < 0.8 ? 520 : 900) + x0 * 1.7 + yy * 0.02) * 0.65 + 0.35) * amp * f;
        if (Math.abs(dx) < 0.15) continue; slice(x, y + yy, w, Math.min(st, h - yy), dx, 0);
      }
    }
    // thác nước: vệt trắng đổ xuống + bọt dưới chân
    for (const [x0, y0, w0, h0] of L.fall || []) {
      const x = x0 * T, y = y0 * T, w = w0 * T, h = h0 * T; if (!vis(x, y, w, h)) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) { const sxp = x + (i + 0.5) * (w / 9) + Math.sin(i * 3.1) * 2, len = h * 0.35, off = ((now / 6 + i * 37) % (h + len)) - len; const gr = ctx.createLinearGradient(0, y + off, 0, y + off + len); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(235,250,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sxp, y + off); ctx.lineTo(sxp, y + off + len); ctx.stroke(); }
      ctx.restore();
      if (Math.random() < 0.5) parts.push({ k: 'spray', x: x + rnd(0, w), y: y + h - rnd(0, 4), vx: rnd(-0.3, 0.3), vy: rnd(-0.5, -0.1), r: rnd(4, 9), life: 0, max: rnd(40, 70) });
    }
  }

  // ---------- lớp trên: khói, lửa, đèn, sương, lá rơi, bóng mây, chim ----------
  function over(ctx, id, T, COLS, ROWS, now, view) {
    const L = LIVE[id]; if (!L) return;
    const dt = Math.min(3, (now - (last || now)) / 16.7); last = now;
    const wd = wind(now), lo = low(), cap = lo ? 60 : 220;
    const vis = (x, y, m = T) => x > view.x - m && x < view.x + view.w + m && y > view.y - m && y < view.y + view.h + m;
    // sinh hạt
    if (parts.length < cap) {
      for (const [x0, y0, kind] of L.smoke || []) {
        const x = x0 * T, y = y0 * T; if (!vis(x, y, T * 3)) continue;
        const rate = { incense: 0.12, fire: 0.18, dark: 0.22, steam: 0.08, wind: 0.1, sand: 0.12 }[kind] * dt;
        if (Math.random() < rate) parts.push({ k: kind, x: x + rnd(-2, 2), y, vx: kind === 'sand' || kind === 'wind' ? rnd(0.3, 0.9) : rnd(-0.08, 0.08), vy: kind === 'sand' || kind === 'wind' ? rnd(-0.15, 0.15) : -rnd(0.25, 0.5) * (kind === 'dark' ? 1.3 : 1), r: kind === 'dark' ? rnd(5, 9) : kind === 'sand' || kind === 'wind' ? rnd(8, 16) : rnd(2.5, 4.5), life: 0, max: kind === 'dark' ? rnd(150, 220) : rnd(90, 150), sd: Math.random() * 6 });
      }
      for (const [x0, y0, s = 1] of L.fire || []) { const x = x0 * T, y = y0 * T; if (vis(x, y) && Math.random() < 0.25 * dt) parts.push({ k: 'ember', x: x + rnd(-4, 4) * s, y: y - 4, vx: rnd(-0.2, 0.2), vy: -rnd(0.5, 1.1), r: rnd(0.8, 1.6), life: 0, max: rnd(40, 80) }); }
      for (const [x0, y0, w0, h0] of L.embers || []) { const x = x0 * T, y = y0 * T; if (vis(x, y, T * 2) && Math.random() < 0.3 * dt) parts.push({ k: 'ember', x: x + rnd(0, w0 * T), y: y + rnd(0, h0 * T), vx: rnd(-0.2, 0.3), vy: -rnd(0.3, 0.8), r: rnd(0.8, 1.5), life: 0, max: rnd(60, 110) }); }
      // lá, hoa rơi từ tán cây trong tầm nhìn
      const trees = (L.sway || []).filter((s) => (s[4] || 1) >= 0.8);
      if (L.fallK && trees.length && Math.random() < (lo ? 0.05 : 0.14) * dt * (0.6 + wd * 0.5)) {
        const [x0, y0, w0, h0] = trees[Math.floor(Math.random() * trees.length)];
        const x = (x0 + Math.random() * w0) * T, y = (y0 + Math.random() * h0 * 0.6) * T;
        if (vis(x, y, T * 2)) {
          const pal = { petal: ['#ffc4d6', '#ffb0c8', '#ffe0ea'], leaf: ['#9ac25a', '#c8d060', '#e0b048'], autumn: ['#f0b030', '#e86a2a', '#d0402a', '#f8d050'] }[L.fallK];
          parts.push({ k: 'leaf', x, y, vx: rnd(0.2, 0.6), vy: rnd(0.3, 0.6), r: rnd(2.2, 3.6), life: 0, max: rnd(260, 420), c: pal[Math.floor(Math.random() * pal.length)], sd: Math.random() * 6, rot: Math.random() * 6 });
        }
      }
      if (L.sparkle && Math.random() < 0.2 * dt) parts.push({ k: 'spark', x: view.x + Math.random() * view.w, y: view.y + Math.random() * view.h, vx: 0.05, vy: -0.08, r: rnd(1.2, 2.2), life: 0, max: rnd(60, 120) });
    }
    // sương trôi (dưới cùng của lớp trên)
    if (!lo) for (const [x0, y0, w0, h0] of L.mist || []) {
      const x = x0 * T, y = y0 * T, w = w0 * T, h = h0 * T; if (!(x < view.x + view.w && x + w > view.x && y < view.y + view.h && y + h > view.y)) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x - T, y, w + 2 * T, h); ctx.clip();
      for (let i = 0; i < 3; i++) {
        const px = x + ((now / (90 + i * 40) + i * w * 0.37) % (w + T * 4)) - T * 2, py = y + h * (0.3 + i * 0.22), rw = T * (2.2 + i * 0.6), rh = h * 0.42;
        const gr = ctx.createRadialGradient(px, py, 0, px, py, rw); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gr; ctx.save(); ctx.translate(px, py); ctx.scale(1, rh / rw); ctx.beginPath(); ctx.arc(0, 0, rw, 0, 7); ctx.restore(); ctx.fill();
      }
      ctx.restore();
    }
    // cập nhật + vẽ hạt
    ctx.save();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt; const k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }
      if (p.k === 'leaf') {
        p.x += (p.vx * wd + Math.sin(p.life / 22 + p.sd) * 0.45) * dt; p.y += p.vy * dt; p.rot += 0.06 * dt;
        ctx.globalAlpha = Math.min(1, (1 - k) * 3) * 0.9; ctx.fillStyle = p.c;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.sin(p.life / 9 + p.sd)) * 0.7 + 0.3); ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, 7); ctx.fill(); ctx.restore();
        continue;
      }
      if (p.k === 'ember' || p.k === 'spark') {
        p.x += (p.vx + Math.sin(p.life / 10) * 0.2 + (p.k === 'ember' ? wd * 0.2 : 0)) * dt; p.y += p.vy * dt;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(k * Math.PI) * (p.k === 'spark' ? 0.8 : 0.9);
        const col = p.k === 'spark' ? '255,240,180' : '255,150,50';
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3); gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        continue;
      }
      // khói / hơi nước / bụi gió / bọt thác
      const drift = p.k === 'sand' || p.k === 'wind' ? 0 : wd * 0.28;
      p.x += (p.vx + drift * k + Math.sin(p.life / 25 + (p.sd || 0)) * 0.15) * dt; p.y += p.vy * dt * (1 - k * 0.4);
      const r = p.r * (1 + k * (p.k === 'spray' ? 1.2 : 2.6));
      const col = { incense: '235,235,240', fire: '120,110,105', dark: '40,34,40', steam: '250,250,250', wind: '90,80,110', sand: '230,190,100', spray: '255,255,255' }[p.k];
      const a = { incense: 0.32, fire: 0.3, dark: 0.42, steam: 0.3, wind: 0.22, sand: 0.28, spray: 0.35 }[p.k] * Math.sin(k * Math.PI);
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
    }
    ctx.restore();
    // lửa chậu than: lưỡi lửa liếm + quầng sáng
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x0, y0, s = 1] of L.fire || []) {
      const x = x0 * T, y = y0 * T; if (!vis(x, y)) continue;
      const fl = 0.8 + 0.2 * Math.sin(now / 90 + x) + 0.1 * Math.sin(now / 37);
      let gr = ctx.createRadialGradient(x, y, 0, x, y, T * 0.9 * fl); gr.addColorStop(0, 'rgba(255,170,60,.35)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, T * 0.9 * fl, 0, 7); ctx.fill();
      for (let i = 0; i < 3; i++) { const h = T * (0.22 + 0.08 * Math.sin(now / (70 + i * 23) + i)) * s, ox = (i - 1) * T * 0.07 * s + Math.sin(now / 120 + i) * 1.2; gr = ctx.createLinearGradient(0, y, 0, y - h); gr.addColorStop(0, 'rgba(255,210,90,.85)'); gr.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x + ox - T * 0.06 * s, y); ctx.quadraticCurveTo(x + ox - T * 0.03, y - h * 0.6, x + ox + Math.sin(now / 80 + i) * 2, y - h); ctx.quadraticCurveTo(x + ox + T * 0.03, y - h * 0.6, x + ox + T * 0.06 * s, y); ctx.fill(); }
    }
    // đèn lồng lập loè (ban ngày nhẹ, ban đêm lighting() của map.js làm sáng thêm)
    for (const [x0, y0, r0, c] of L.glow || []) { const x = x0 * T, y = y0 * T, r = r0 * T; if (!vis(x, y)) continue; const fl = 0.75 + 0.25 * Math.sin(now / 260 + x0 * 3) * Math.sin(now / 97 + y0); const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},${0.28 * fl})`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    // bùa / vật thiêng toả sáng theo nhịp thở
    for (const [x0, y0, r0, c] of L.pulse || []) { const x = x0 * T, y = y0 * T, r = r0 * T * (1 + 0.25 * Math.sin(now / 700)); if (!vis(x, y, T * 2)) continue; const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 2); gr.addColorStop(0, `rgba(${c},.3)`); gr.addColorStop(0.4, `rgba(${c},.12)`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2, 0, 7); ctx.fill(); }
    ctx.restore();
    // bóng mây lững lờ trôi qua mặt đất
    if (L.shade && !lo) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      const MW = COLS * T, MH = ROWS * T;
      for (let i = 0; i < 3; i++) {
        const px = ((now / (55 + i * 18) + i * MW * 0.55) % (MW + 8 * T)) - 4 * T, py = ((now / (140 + i * 30) + i * MH * 0.37) % (MH + 8 * T)) - 4 * T, rw = T * (3.4 + i);
        if (!(px + rw > view.x && px - rw < view.x + view.w && py + rw > view.y && py - rw < view.y + view.h)) continue;
        const gr = ctx.createRadialGradient(px, py, 0, px, py, rw); gr.addColorStop(0, `rgba(70,80,100,${L.shade})`); gr.addColorStop(1, 'rgba(70,80,100,0)');
        ctx.fillStyle = gr; ctx.save(); ctx.translate(px, py); ctx.scale(1.6, 0.8); ctx.beginPath(); ctx.arc(0, 0, rw, 0, 7); ctx.restore(); ctx.fill();
      }
      ctx.restore();
    }
  }

  // ---------- lớp màn hình: tia nắng, chim bay ----------
  function screen(ctx, id, W, H, now, night) {
    const L = LIVE[id]; if (!L) return;
    if (L.rays && !night && !low()) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) { const a = 0.05 + 0.04 * Math.sin(now / 2300 + i * 1.7), x = W * (0.15 + i * 0.24) + Math.sin(now / 5000 + i) * 20, w = 40 + i * 14; const gr = ctx.createLinearGradient(x, 0, x + w * 2, H * 0.8); gr.addColorStop(0, `rgba(255,236,170,${a})`); gr.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + w, -10); ctx.lineTo(x + w * 3.2, H * 0.85); ctx.lineTo(x + w * 1.6, H * 0.85); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    if (L.birds && !night) {
      if (now > nextBird && !birds.length) {
        const n = L.birds === 'crane' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 4), dir = Math.random() < 0.5 ? 1 : -1, y = rnd(H * 0.08, H * 0.45);
        for (let i = 0; i < n; i++) birds.push({ x: dir > 0 ? -30 - i * 22 : W + 30 + i * 22, y: y + (i % 2 ? 1 : -1) * i * 9, v: dir * rnd(1.2, 1.6) * (L.birds === 'crane' ? 0.7 : 1), ph: Math.random() * 6, s: L.birds === 'crane' ? rnd(1.5, 1.9) : rnd(0.8, 1.1) });
        nextBird = now + rnd(14000, 26000);
      }
      ctx.save();
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i]; b.x += b.v; b.y += Math.sin(now / 600 + b.ph) * 0.15;
        if (b.x < -60 || b.x > W + 60) { birds.splice(i, 1); continue; }
        const fl = Math.sin(now / (L.birds === 'crane' ? 260 : 110) + b.ph), s = b.s * 5;
        ctx.strokeStyle = L.birds === 'crane' ? 'rgba(255,255,255,.95)' : L.birds === 'crow' ? 'rgba(30,24,30,.8)' : 'rgba(70,50,40,.75)'; ctx.lineWidth = L.birds === 'crane' ? 2.2 : 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(b.x - s, b.y - fl * s * 0.7); ctx.quadraticCurveTo(b.x - s * 0.4, b.y - s * 0.2, b.x, b.y); ctx.quadraticCurveTo(b.x + s * 0.4, b.y - s * 0.2, b.x + s, b.y - fl * s * 0.7); ctx.stroke();
        if (L.birds === 'crane') { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.sign(b.v) * s * 0.9, b.y + 1); ctx.stroke(); }
      }
      ctx.restore();
    }
  }

  // ---------- vùng có quái (ô cỏ ',') trên tranh vẽ: yêu khí tím lững lờ để người chơi biết chỗ gặp quái ----------
  function haunt(ctx, tiles, T, now, view) {
    if (!tiles) return;
    const x0 = Math.max(0, Math.floor(view.x / T) - 1), x1 = Math.min(tiles[0].length - 1, Math.ceil((view.x + view.w) / T) + 1);
    const y0 = Math.max(0, Math.floor(view.y / T) - 1), y1 = Math.min(tiles.length - 1, Math.ceil((view.y + view.h) / T) + 1);
    ctx.save();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (tiles[y][x] !== ',') continue;
      const h = ((x * 73856093) ^ (y * 19349663)) >>> 0, ph = (h % 1000) / 159;
      const cx = (x + 0.5) * T + Math.sin(now / 1900 + ph) * T * 0.12, cy = (y + 0.72) * T, a = 0.13 + 0.08 * Math.sin(now / 1300 + ph);
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.62);
      gr.addColorStop(0, `rgba(120,60,170,${a})`); gr.addColorStop(0.6, `rgba(90,40,140,${a * 0.5})`); gr.addColorStop(1, 'rgba(90,40,140,0)');
      ctx.fillStyle = gr; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.45); ctx.beginPath(); ctx.arc(0, 0, T * 0.62, 0, 7); ctx.restore(); ctx.fill();
      // sợi khói tím bốc lên
      if (h % 3 === 0) { const k = ((now / 2400 + ph) % 1), wy = cy - k * T * 0.9, wx = cx + Math.sin(now / 500 + ph) * 3; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.35; ctx.fillStyle = '#b48ae0'; ctx.beginPath(); ctx.arc(wx, wy, 2.2 + k * 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    }
    ctx.restore();
  }

  // ---------- phông trận sống động: hạt bay theo cảnh + phông thở nhẹ ----------
  const BATTLE = {
    mountain: { k: 'leaf', c: ['#e8c060', '#c8803a', '#a8c070'], mist: 1 }, temple: { k: 'petal', c: ['#ffc4d6', '#ffe0ea'], smoke: 1 },
    village: { k: 'petal', c: ['#ffc4d6', '#ffb0c8', '#fff0f4'] }, heaven: { k: 'spark', mist: 1 }, sandriver: { k: 'sand' }, desert: { k: 'sand' },
    palace: { k: 'petal', c: ['#ffd4e0', '#ffe8a8'] }, city: { k: 'leaf', c: ['#e8c060', '#f0a050'] }, cave: { k: 'ember' }, firemountain: { k: 'ember', heat: 1 },
    frozenriver: { k: 'snow' }, forest: { k: 'leaf', c: ['#9ac25a', '#c8d060'] }, water: { k: 'bubble' }, snow: { k: 'snow' },
  };
  let bcv = null, bctx = null, braf = 0, bp = [], bcfg = null, blast = 0;
  function battleStart(cv, key) {
    battleStop(); if (!cv) return;
    bcfg = key && (BATTLE[key] || BATTLE[{ ch1: 'heaven' }[key]] || null);
    cv.hidden = !bcfg; if (!bcfg) return;
    bcv = cv; bctx = cv.getContext('2d'); bp = []; blast = performance.now();
    const loop = (now) => { braf = requestAnimationFrame(loop); battleFrame(now); };
    braf = requestAnimationFrame(loop);
  }
  function battleStop() { if (braf) cancelAnimationFrame(braf); braf = 0; bp = []; if (bctx && bcv) bctx.clearRect(0, 0, bcv.width, bcv.height); }
  function battleFrame(now) {
    const dpr = Math.min(2, devicePixelRatio || 1), W = bcv.clientWidth, H = bcv.clientHeight; if (!W) return;
    if (bcv.width !== Math.round(W * dpr)) { bcv.width = Math.round(W * dpr); bcv.height = Math.round(H * dpr); }
    const c = bctx, dt = Math.min(3, (now - blast) / 16.7), wd = wind(now), cap = low() ? 30 : 90; blast = now;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const k = bcfg.k;
    if (bp.length < cap && Math.random() < (k === 'sand' ? 0.5 : k === 'snow' ? 0.45 : 0.28) * dt) {
      const p = { life: 0, max: rnd(220, 420), sd: Math.random() * 6, rot: Math.random() * 6 };
      if (k === 'ember') Object.assign(p, { x: rnd(0, W), y: H + 6, vx: rnd(-0.2, 0.3), vy: -rnd(0.4, 1.0), r: rnd(1, 2.2), max: rnd(160, 300) });
      else if (k === 'spark') Object.assign(p, { x: rnd(0, W), y: rnd(0, H), vx: 0.05, vy: -0.1, r: rnd(1.2, 2.6), max: rnd(90, 160) });
      else if (k === 'sand') Object.assign(p, { x: -10, y: rnd(H * 0.3, H), vx: rnd(1.2, 2.6), vy: rnd(-0.15, 0.15), r: rnd(0.8, 1.8) });
      else if (k === 'bubble') Object.assign(p, { x: rnd(0, W), y: H + 6, vx: 0, vy: -rnd(0.3, 0.7), r: rnd(1.5, 4) });
      else Object.assign(p, { x: rnd(-W * 0.2, W), y: -8, vx: rnd(0.2, 0.6), vy: rnd(0.35, 0.8) * (k === 'snow' ? 0.8 : 1), r: rnd(2.2, 4) * (k === 'snow' ? 0.7 : 1), col: (bcfg.c || ['#fff'])[Math.floor(Math.random() * (bcfg.c || [1]).length)] });
      bp.push(p);
    }
    for (let i = bp.length - 1; i >= 0; i--) {
      const p = bp[i]; p.life += dt; const q = p.life / p.max;
      if (q >= 1 || p.y > H + 20 || p.x > W + 20) { bp.splice(i, 1); continue; }
      p.x += (p.vx * (k === 'leaf' || k === 'petal' || k === 'snow' ? wd : 1) + Math.sin(p.life / 24 + p.sd) * 0.35) * dt; p.y += p.vy * dt; p.rot += 0.05 * dt;
      const a = Math.min(1, Math.sin(q * Math.PI) * 2);
      if (k === 'ember' || k === 'spark') {
        c.globalCompositeOperation = 'lighter'; const col = k === 'spark' ? '255,240,180' : '255,150,50';
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 3, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over';
      } else if (k === 'sand') { c.globalAlpha = a * 0.5; c.fillStyle = '#f0d8a0'; c.fillRect(p.x, p.y, p.r * 5, p.r * 0.6); c.globalAlpha = 1; }
      else if (k === 'snow' || k === 'bubble') { c.globalAlpha = a * 0.85; c.strokeStyle = c.fillStyle = '#ffffff'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); k === 'bubble' ? c.stroke() : c.fill(); c.globalAlpha = 1; }
      else { c.globalAlpha = a * 0.9; c.fillStyle = p.col; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.sin(p.life / 9 + p.sd)) * 0.7 + 0.3); c.beginPath(); c.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, 7); c.fill(); c.restore(); c.globalAlpha = 1; }
    }
    // sương mỏng trôi ngang, hơi nóng bốc lên
    if (bcfg.mist && !low()) for (let i = 0; i < 2; i++) { const px = ((now / (70 + i * 30) + i * W * 0.6) % (W * 1.6)) - W * 0.3, py = H * (0.32 + i * 0.12), r = W * 0.42; const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.save(); c.translate(px, py); c.scale(1, 0.3); c.beginPath(); c.arc(0, 0, r, 0, 7); c.restore(); c.fill(); }
    if (bcfg.heat && !low()) { const g = c.createLinearGradient(0, H, 0, H * 0.6); g.addColorStop(0, `rgba(255,120,40,${0.12 + 0.05 * Math.sin(now / 400)})`); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(0, H * 0.6, W, H * 0.4); }
  }

  return { has, lights, ground, over, screen, haunt, battleStart, battleStop, LIVE };
})();
