// =====================================================================
//  ĐOÀN THỈNH KINH: ai đang đi cùng người chơi (theo tiến độ nhiệm vụ)
//  và đồ đệ vào trợ chiến trong trận boss chính truyện.
// =====================================================================
const D = require('./data');

const idx = (title) => { const i = D.QUESTS.findIndex((q) => q.title === title); if (i < 0) throw new Error('companions: thiếu nhiệm vụ ' + title); return i; };
// nhập đoàn sau khi HOÀN THÀNH nhiệm vụ này; vắng mặt trong khoảng [từ, đến] (chỉ số nhiệm vụ hiện tại)
const RULES = [
  { id: 'duongtang', name: 'Đường Tam Tạng', look: 'duongtang', join: idx('Ra thành gặp hổ') },
  { id: 'ngokhong', name: 'Tôn Ngộ Không', look: 'ngokhong', join: idx('Núi Lưỡng Giới'), away: [[idx('Đuổi Tâm Viên') + 1, idx('Đưa thư nước Bảo Tượng')]] },
  { id: 'batgioi', name: 'Trư Bát Giới', look: 'batgioi', join: idx('Thu phục Bát Giới') },
  { id: 'satang', name: 'Sa Ngộ Tĩnh', look: 'satang', join: idx('Thu được Sa Tăng') },
];
const HORSE = idx('Suối Ưng Sầu đổi ngựa');

function list(c) {
  const q = c.quest || 0;
  if (q >= D.STORY_END) return []; // thỉnh kinh xong: thầy trò thành Phật, không đi theo nữa
  const out = [];
  for (const r of RULES) {
    if (q <= r.join) continue;
    if ((r.away || []).some(([a, b]) => q >= a && q <= b)) continue;
    const f = { id: r.id, name: r.name, look: r.look };
    if (r.id === 'duongtang' && q > HORSE) { f.art = 'duongtang_ngua'; f.horse = 1; }
    out.push(f);
  }
  return out;
}

// đồ đệ trợ chiến: mỗi 3 hiệp một người ra tay
const ASSIST = {
  ngokhong: { name: 'Tôn Ngộ Không', s: 'Như Ý Kim Cô Bổng', fx: 'gold', pow: 2.2, hits: 1, line: 'Yêu quái to gan! Ăn một gậy của Lão Tôn!' },
  batgioi: { name: 'Trư Bát Giới', s: 'Cửu Xỉ Đinh Ba', fx: 'slash', pow: 0.9, hits: 3, line: 'Để lão Trư cào cho mấy phát!' },
  satang: { name: 'Sa Ngộ Tĩnh', s: 'Hàng Yêu Bảo Trượng', fx: 'heal', heal: 0.12, line: 'Sư huynh cứ đánh, đệ giữ hậu phương!' },
};
function assistFor(c) { return list(c).map((f) => f.id).filter((id) => ASSIST[id]); }

module.exports = { list, assistFor, ASSIST, RULES };
