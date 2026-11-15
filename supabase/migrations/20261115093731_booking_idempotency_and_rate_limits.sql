alter table public.bookings
  add column idempotency_hash text;

create unique index bookings_idempotency_hash_unique
  on public.bookings (idempotency_hash)
  where idempotency_hash is not null;

create table public.booking_rate_limits (
  client_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.booking_rate_limits enable row level security;
revoke all on table public.booking_rate_limits from public, anon, authenticated;
grant all on table public.booking_rate_limits to service_role;

create or replace function public.consume_booking_attempt(
  p_client_hash text,
  p_window_seconds integer default 600,
  p_max_requests integer default 5
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  allowed boolean;
begin
  if p_client_hash is null
     or length(p_client_hash) <> 64
     or p_window_seconds < 60
     or p_max_requests < 1 then
    raise exception 'Invalid rate limit parameters';
  end if;

  insert into booking_rate_limits as limits (
    client_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_client_hash, now(), 1, now())
  on conflict (client_hash) do update
  set
    window_started_at = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else limits.request_count + 1
    end,
    updated_at = now()
  returning request_count <= p_max_requests into allowed;

  return allowed;
end
$$;

revoke all on function public.consume_booking_attempt(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_booking_attempt(text, integer, integer)
  to service_role;
