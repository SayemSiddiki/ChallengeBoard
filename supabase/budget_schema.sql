-- Budget tracker schema for ChallengeBoard
-- Run this in Supabase SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists public.budget_months (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  start_date date not null,
  end_date date not null,
  currency text default 'USD',
  start_balance decimal(10, 2) default 0,
  created_at timestamp default now()
);

create table if not exists public.incomes (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  source text not null,
  budgeted decimal(10, 2) default 0,
  actual decimal(10, 2) default 0,
  date date
);

create table if not exists public.bills (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  name text not null,
  due_date integer,
  budgeted decimal(10, 2) default 0,
  actual decimal(10, 2) default 0,
  paid boolean default false
);

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  name text not null,
  budgeted decimal(10, 2) default 0,
  actual decimal(10, 2) default 0
);

create table if not exists public.debts (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  creditor text not null,
  due_date integer,
  budgeted decimal(10, 2) default 0,
  actual decimal(10, 2) default 0
);

create table if not exists public.savings (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  name text not null,
  budgeted decimal(10, 2) default 0,
  actual decimal(10, 2) default 0
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  date date not null,
  amount decimal(10, 2) not null,
  category text not null,
  subcategory text,
  details text,
  type text check (type in ('income', 'expense')),
  created_at timestamp default now()
);

alter table public.budget_months enable row level security;
alter table public.incomes enable row level security;
alter table public.bills enable row level security;
alter table public.expenses enable row level security;
alter table public.debts enable row level security;
alter table public.savings enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "budget_months_owner_all" on public.budget_months;
create policy "budget_months_owner_all" on public.budget_months
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "incomes_owner_all" on public.incomes;
create policy "incomes_owner_all" on public.incomes
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = incomes.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = incomes.budget_month_id and m.user_id = auth.uid()
  )
);

drop policy if exists "bills_owner_all" on public.bills;
create policy "bills_owner_all" on public.bills
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = bills.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = bills.budget_month_id and m.user_id = auth.uid()
  )
);

drop policy if exists "expenses_owner_all" on public.expenses;
create policy "expenses_owner_all" on public.expenses
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = expenses.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = expenses.budget_month_id and m.user_id = auth.uid()
  )
);

drop policy if exists "debts_owner_all" on public.debts;
create policy "debts_owner_all" on public.debts
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = debts.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = debts.budget_month_id and m.user_id = auth.uid()
  )
);

drop policy if exists "savings_owner_all" on public.savings;
create policy "savings_owner_all" on public.savings
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = savings.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = savings.budget_month_id and m.user_id = auth.uid()
  )
);

drop policy if exists "transactions_owner_all" on public.transactions;
create policy "transactions_owner_all" on public.transactions
for all using (
  exists (
    select 1 from public.budget_months m
    where m.id = transactions.budget_month_id and m.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.budget_months m
    where m.id = transactions.budget_month_id and m.user_id = auth.uid()
  )
);
