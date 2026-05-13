-- ==============================
-- inkdrop schema
-- ==============================

-- users（Supabase Auth の auth.users と連動）
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  profile_text text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- designs
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  transparent_image_url text,
  click_count integer not null default 0,
  sales_count integer not null default 0,
  max_sales_count integer not null default 100,
  is_sales_stopped boolean not null default false,
  copyright_status text not null default 'pending'
    check (copyright_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  design_id uuid not null references public.designs(id) on delete restrict,
  body_type text not null
    check (body_type in ('tshirt', 'long_sleeve', 'hoodie', 'sweatshirt')),
  color text not null
    check (color in ('white', 'black', 'gray')),
  size text not null
    check (size in ('S', 'M', 'L', 'XL')),
  placement text not null
    check (placement in ('one_point', 'front', 'back', 'one_point_back', 'custom')),
  print_size text not null
    check (print_size in ('small', 'medium', 'large')),
  price integer not null,
  status text not null default 'order_confirmed'
    check (status in ('order_confirmed', 'in_production', 'shipped', 'delivered')),
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- earnings
create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  design_id uuid not null references public.designs(id) on delete restrict,
  body_type text not null,
  placement text not null,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'available', 'payout_requested', 'paid')),
  available_at timestamptz,
  payout_requested_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- creator_balances
create table if not exists public.creator_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  available_balance integer not null default 0,
  pending_balance integer not null default 0,
  payout_requested_balance integer not null default 0,
  paid_total integer not null default 0,
  total_income integer not null default 0,
  total_sales_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- payout_requests
create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  amount integer not null,
  status text not null default 'requested'
    check (status in ('requested', 'processing', 'paid', 'rejected')),
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- design_sales_summary
create table if not exists public.design_sales_summary (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null unique references public.designs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  sales_count integer not null default 0,
  earnings_amount integer not null default 0,
  max_sales_count integer not null default 100,
  remaining_sales_count integer not null default 100,
  is_sales_stopped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- sold_items
create table if not exists public.sold_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  design_id uuid not null references public.designs(id) on delete restrict,
  design_title text not null,
  body_type text not null,
  placement text not null,
  creator_reward integer not null,
  sold_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'purchase'
    check (type in ('purchase')),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, design_id)
);

-- views（閲覧履歴）
create table if not exists public.views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- product_prices（運営が設定）
create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  body_type text not null unique
    check (body_type in ('tshirt', 'long_sleeve', 'hoodie', 'sweatshirt')),
  price integer not null,
  creator_reward integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================
-- デフォルト価格データ
-- ==============================
insert into public.product_prices (body_type, price, creator_reward) values
  ('tshirt', 4500, 1000),
  ('long_sleeve', 5500, 1200),
  ('hoodie', 8500, 1500),
  ('sweatshirt', 7500, 1300)
on conflict (body_type) do nothing;

-- ==============================
-- RLS (Row Level Security)
-- ==============================
alter table public.users enable row level security;
alter table public.designs enable row level security;
alter table public.follows enable row level security;
alter table public.orders enable row level security;
alter table public.earnings enable row level security;
alter table public.creator_balances enable row level security;
alter table public.payout_requests enable row level security;
alter table public.design_sales_summary enable row level security;
alter table public.sold_items enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.views enable row level security;
alter table public.product_prices enable row level security;

-- users: 自分のプロフィールは読み書き可、他人は読みのみ
create policy "users_select_all" on public.users for select using (true);
create policy "users_insert_self" on public.users for insert with check (auth.uid() = id);
create policy "users_update_self" on public.users for update using (auth.uid() = id);
create policy "users_delete_self" on public.users for delete using (auth.uid() = id);

-- designs: 全員閲覧可、投稿者のみ変更可
create policy "designs_select_all" on public.designs for select using (true);
create policy "designs_insert_auth" on public.designs for insert with check (auth.uid() = user_id);
create policy "designs_update_owner" on public.designs for update using (auth.uid() = user_id);
create policy "designs_delete_owner" on public.designs for delete using (auth.uid() = user_id);

-- follows: ログインユーザーは閲覧・操作可
create policy "follows_select_auth" on public.follows for select using (auth.uid() is not null);
create policy "follows_insert_auth" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_auth" on public.follows for delete using (auth.uid() = follower_id);

-- orders: 自分の注文のみ
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_auth" on public.orders for insert with check (auth.uid() = user_id);

-- earnings: 自分のみ
create policy "earnings_select_own" on public.earnings for select using (auth.uid() = user_id);

-- creator_balances: 自分のみ
create policy "creator_balances_select_own" on public.creator_balances for select using (auth.uid() = user_id);
create policy "creator_balances_insert_own" on public.creator_balances for insert with check (auth.uid() = user_id);
create policy "creator_balances_update_own" on public.creator_balances for update using (auth.uid() = user_id);

-- payout_requests: 自分のみ
create policy "payout_requests_select_own" on public.payout_requests for select using (auth.uid() = user_id);
create policy "payout_requests_insert_own" on public.payout_requests for insert with check (auth.uid() = user_id);

-- design_sales_summary: 投稿者本人のみ
create policy "design_sales_summary_select_own" on public.design_sales_summary for select using (auth.uid() = user_id);

-- sold_items: 自分のみ
create policy "sold_items_select_own" on public.sold_items for select using (auth.uid() = user_id);

-- notifications: 自分のみ
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- reviews: 全員閲覧可、自分のみ操作
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_auth" on public.reviews for insert with check (auth.uid() = user_id);

-- views: ログイン時のみ操作可、自分のみ閲覧
create policy "views_select_own" on public.views for select using (auth.uid() = user_id);
create policy "views_insert_auth" on public.views for insert with check (auth.uid() = user_id);

-- product_prices: 全員閲覧可（変更は管理アプリから）
create policy "product_prices_select_all" on public.product_prices for select using (true);

-- ==============================
-- ストレージバケット
-- ==============================
-- designs バケット: アップロードされたデザイン画像
insert into storage.buckets (id, name, public) values ('designs', 'designs', true)
on conflict (id) do nothing;

-- avatars バケット: プロフィール画像
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ストレージポリシー
create policy "designs_storage_public_read" on storage.objects
  for select using (bucket_id = 'designs');

create policy "designs_storage_auth_upload" on storage.objects
  for insert with check (bucket_id = 'designs' and auth.uid() is not null);

create policy "designs_storage_owner_delete" on storage.objects
  for delete using (bucket_id = 'designs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_storage_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_storage_auth_upload" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "avatars_storage_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================
-- 関数・トリガー
-- ==============================

-- updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();
create trigger designs_updated_at before update on public.designs
  for each row execute function public.handle_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();
create trigger earnings_updated_at before update on public.earnings
  for each row execute function public.handle_updated_at();
create trigger creator_balances_updated_at before update on public.creator_balances
  for each row execute function public.handle_updated_at();
create trigger payout_requests_updated_at before update on public.payout_requests
  for each row execute function public.handle_updated_at();
create trigger design_sales_summary_updated_at before update on public.design_sales_summary
  for each row execute function public.handle_updated_at();
create trigger product_prices_updated_at before update on public.product_prices
  for each row execute function public.handle_updated_at();

-- 新規ユーザー登録時に creator_balances を自動作成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.creator_balances (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_user_created after insert on public.users
  for each row execute function public.handle_new_user();

-- 発送完了時に earnings を available に自動更新し creator_balances を更新
create or replace function public.handle_order_shipped()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'shipped' and old.status != 'shipped' then
    update public.earnings
    set status = 'available', available_at = now()
    where order_id = new.id and status = 'pending';

    update public.creator_balances cb
    set
      available_balance = available_balance + e.amount,
      pending_balance = greatest(0, pending_balance - e.amount)
    from public.earnings e
    where e.order_id = new.id and e.user_id = cb.user_id;
  end if;
  return new;
end;
$$;

create trigger on_order_shipped after update on public.orders
  for each row execute function public.handle_order_shipped();

-- 100枚達成時に自動販売停止
create or replace function public.handle_design_sales_limit()
returns trigger language plpgsql as $$
begin
  if new.sales_count >= new.max_sales_count then
    new.is_sales_stopped = true;
  end if;
  return new;
end;
$$;

create trigger on_design_sales_limit before update on public.designs
  for each row execute function public.handle_design_sales_limit();
