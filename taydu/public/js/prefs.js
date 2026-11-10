// =====================================================================
//  TUỲ CHỌN HIỂN THỊ (lưu trên máy người chơi)
//  - realtime: sáng/tối theo giờ thật (mặc định TẮT → luôn ban ngày)
//  - compact:  giao diện gọn, thu các nút phụ vào một nút (mặc định BẬT)
//  - scale:    cỡ giao diện 'auto' | 'sm' | 'md' | 'lg'
// =====================================================================
const Prefs = (() => {
  const get = (k, d) => { try { const v = localStorage.getItem('tdk_' + k); return v == null ? d : v; } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem('tdk_' + k, v); } catch {} };
  const P = {
    get realtime() { return get('realtime', '0') === '1'; },
    set realtime(v) { set('realtime', v ? '1' : '0'); },
    get compact() { return get('compact', '1') === '1'; },
    set compact(v) { set('compact', v ? '1' : '0'); P.apply(); },
    get scale() { return get('uiscale', 'auto'); },
    set scale(v) { set('uiscale', v); P.apply(); },
    // giờ dùng cho ánh sáng bản đồ / âm thanh: theo giờ thật hoặc cố định giữa trưa
    hour() { if (!P.realtime) return 10.5; const d = new Date(); return d.getHours() + d.getMinutes() / 60; },
    isNight() { const h = P.hour(); return h >= 19 || h < 5; },
    // tỉ lệ giao diện theo kích thước màn hình (thiết kế gốc: 412 × 860)
    uiScale() {
      const fix = { sm: 0.82, md: 0.92, lg: 1.04 }[P.scale];
      if (fix) return fix;
      const w = window.innerWidth, h = window.innerHeight;
      return Math.max(0.74, Math.min(1.12, Math.min(w / 430, h / 900)));
    },
    apply() {
      const r = document.documentElement;
      r.style.setProperty('--ui', P.uiScale().toFixed(3));
      r.classList.toggle('ui-compact', P.compact);
    },
  };
  P.apply();
  addEventListener('resize', () => P.apply());
  addEventListener('orientationchange', () => setTimeout(() => P.apply(), 200));
  return P;
})();
