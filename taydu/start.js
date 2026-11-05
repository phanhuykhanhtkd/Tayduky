// Điểm khởi động dùng khi chạy trên mạng (Render…):
// tải dữ liệu người chơi từ Supabase về trước, rồi mới bật máy chủ game.
// Chạy trên máy tính ở nhà thì vẫn dùng `node server.js` như cũ.
const DB = require('./game/db');

(async () => {
  if (DB.CLOUD) {
    for (let i = 1; i <= 5; i++) {
      try {
        const had = await DB.pull();
        console.log(had ? '[DB] Đã tải dữ liệu từ Supabase.' : '[DB] Supabase chưa có dữ liệu – bắt đầu thế giới mới.');
        break;
      } catch (e) {
        console.error(`[DB] Tải dữ liệu thất bại (lần ${i}/5):`, e.message);
        if (i === 5) { console.error('[DB] Dừng lại để tránh ghi đè dữ liệu cũ. Kiểm tra SUPABASE_URL / SUPABASE_KEY.'); process.exit(1); }
        await new Promise((r) => setTimeout(r, 3000 * i));
      }
    }
  } else {
    console.log('[DB] Không có SUPABASE_URL/SUPABASE_KEY – dữ liệu chỉ lưu ở data/db.json.');
  }
  require('./server');
})();
