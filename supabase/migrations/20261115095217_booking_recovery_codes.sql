alter table public.bookings add column recovery_hash text;

alter table public.bookings
  add constraint bookings_recovery_hash_format
  check (recovery_hash is null or length(recovery_hash) = 64);
