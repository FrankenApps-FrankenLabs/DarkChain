-- Run this in Supabase SQL Editor

create table dapps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  category text not null,
  contract_address text,
  live_url text not null,
  logo_url text,
  tags text[] default '{}',
  wallet_address text not null,
  tx_hash text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Public can read approved dApps only
create policy "Public read approved"
  on dapps for select
  using (status = 'approved');

-- Anyone can insert (we validate payment client-side via tx_hash)
create policy "Anyone can submit"
  on dapps for insert
  with check (true);

-- Enable RLS
alter table dapps enable row level security;

-- Allow full access for service role (admin panel uses anon key so we need this too)
-- For admin updates, we'll use a separate approach - just disable RLS for update/delete
-- by using the Supabase dashboard directly, or run:
create policy "Admin full access"
  on dapps for all
  using (true)
  with check (true);
