-- Chạy 1 lần trong Supabase → SQL Editor → New query → Run
create table if not exists public.game_state (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
-- Khoá bảng lại: chỉ máy chủ game (dùng khoá bí mật) mới đọc/ghi được
alter table public.game_state enable row level security;
