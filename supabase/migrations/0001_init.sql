-- ============================================================
-- OPT-IN 契約書作成ツール / 初期スキーマ
-- ============================================================
-- 設計参照: docs/KICKOFF.md §5
--   companies   : 会社マスタ
--   plans       : サービス／プラン（＝契約書テンプレ）マスタ
--   contracts   : 発行履歴
--
-- ロール:
--   sales : セールス担当（入力 → PDF発行のみ）
--   admin : 管理者（マスタ／テンプレ／原本／金額／口座を管理）
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- companies ----------
create table if not exists public.companies (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  name        text not null,
  seller_info jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------- plans (= 契約書テンプレ) ----------
create table if not exists public.plans (
  id                   uuid primary key default uuid_generate_v4(),
  company_id           uuid not null references public.companies(id) on delete cascade,
  name                 text not null,
  version              text not null,
  is_active            boolean not null default true,
  template_html        text not null,
  constants            jsonb not null default '{}'::jsonb,
  variable_fields      jsonb not null default '[]'::jsonb,
  original_docx_path   text,
  original_checksum    jsonb,
  created_at           timestamptz not null default now(),
  unique (company_id, name, version)
);

create index if not exists plans_company_active_idx
  on public.plans (company_id, is_active);

-- ---------- contracts (発行履歴) ----------
create table if not exists public.contracts (
  id            uuid primary key default uuid_generate_v4(),
  plan_id       uuid not null references public.plans(id) on delete restrict,
  created_by    uuid references auth.users(id),
  input_values  jsonb not null default '{}'::jsonb,
  pdf_path      text,
  created_at    timestamptz not null default now()
);

create index if not exists contracts_plan_idx     on public.contracts (plan_id);
create index if not exists contracts_created_idx  on public.contracts (created_at desc);

-- ---------- profiles (ロール保持) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'sales' check (role in ('sales', 'admin')),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.companies enable row level security;
alter table public.plans     enable row level security;
alter table public.contracts enable row level security;
alter table public.profiles  enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- companies: 全員読める／書き込みはadminのみ
drop policy if exists companies_read on public.companies;
create policy companies_read on public.companies
  for select using (auth.role() = 'authenticated');

drop policy if exists companies_write on public.companies;
create policy companies_write on public.companies
  for all using (public.is_admin()) with check (public.is_admin());

-- plans: 全員読める／書き込みはadminのみ
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans
  for select using (auth.role() = 'authenticated');

drop policy if exists plans_write on public.plans;
create policy plans_write on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- contracts: 自分の発行履歴は自分が読める／adminは全部読める／書き込みは認証ユーザー全員
drop policy if exists contracts_read on public.contracts;
create policy contracts_read on public.contracts
  for select using (created_by = auth.uid() or public.is_admin());

drop policy if exists contracts_insert on public.contracts;
create policy contracts_insert on public.contracts
  for insert with check (auth.role() = 'authenticated');

-- profiles: 自分のものは読める／adminは全員見られる／role変更はadminのみ
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
