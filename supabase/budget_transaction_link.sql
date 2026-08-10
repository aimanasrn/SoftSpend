-- Run this once in the Supabase SQL Editor for an existing project.
-- It links an expense to an optional budget item without changing existing transactions.
alter table public.transactions
  add column if not exists budget_id uuid references public.budgets(id) on delete set null;

create index if not exists transactions_budget_idx
  on public.transactions(budget_id);
