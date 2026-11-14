-- Run once in the hotel's Supabase project. Amounts are integer paise.
create table public.room_types (
  code text primary key check (code in ('ac','non_ac')),
  nightly_rate integer not null check (nightly_rate > 0),
  inventory integer not null check (inventory > 0)
);
insert into public.room_types values ('ac',200000,7),('non_ac',150000,1);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  room_type text not null references public.room_types(code),
  check_in date not null,
  check_out date not null check (check_out > check_in),
  adults integer not null check (adults between 1 and 3),
  children integer not null default 0 check (children between 0 and 2),
  extra_mattress boolean not null default false,
  guest_name text not null check (length(guest_name) between 1 and 120),
  phone text not null,
  email text,
  special_request text check (length(special_request) <= 1000),
  policy_version text not null,
  nightly_rate integer not null check (nightly_rate > 0),
  mattress_daily_rate integer not null default 50000,
  total integer not null check (total > 0),
  advance_due integer not null check (advance_due > 0 and advance_due <= total),
  status text not null default 'payment_pending' check (status in ('payment_pending','payment_submitted_pending_verification','confirmed','rejected','cancelled','refund_processing','refunded')),
  check (adults < 3 or extra_mattress)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  transaction_reference text not null unique,
  screenshot_path text,
  submitted_at timestamptz not null default now(),
  claimed_amount integer not null check (claimed_amount > 0),
  verified_amount integer check (verified_amount > 0),
  status text not null default 'submitted' check (status in ('submitted','verified','rejected','refund_pending','refunded'))
);
create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id),
  occurred_at timestamptz not null default now(),
  actor uuid,
  event text not null
);
alter table public.room_types enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.booking_events enable row level security;
revoke all on public.bookings, public.payments, public.booking_events from anon, authenticated;
-- No anonymous booking access. Server routes and authorized admin operations
-- must be implemented before enabling submissions. Confirmation must acquire
-- a room-type transaction lock and recheck date-overlap capacity atomically.

create table public.hotel_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.hotel_admins enable row level security;
revoke all on public.hotel_admins, public.room_types from anon, authenticated;
grant all on public.room_types, public.bookings, public.payments, public.booking_events, public.hotel_admins to service_role;
grant usage, select on sequence public.booking_events_id_seq to service_role;

create index bookings_room_dates on public.bookings(room_type, check_in, check_out);
create index payments_booking_id on public.payments(booking_id);
create index booking_events_booking_id on public.booking_events(booking_id);
alter table public.bookings add constraint mattress_rate_nonnegative check (mattress_daily_rate >= 0);
alter table public.bookings add constraint total_matches_stay check (
  total = (check_out - check_in) * (nightly_rate + case when extra_mattress then mattress_daily_rate else 0 end)
);
alter table public.bookings add constraint advance_matches_total check (advance_due = round(total * 0.30));
