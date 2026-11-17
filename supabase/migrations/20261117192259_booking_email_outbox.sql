create table public.booking_email_outbox (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id),
  event text not null check (event in ('payment_pending', 'payment_submitted_pending_verification', 'confirmed', 'rejected')),
  recipient text not null check (recipient in ('hotel', 'guest')),
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (booking_id, event, recipient)
);
alter table public.booking_email_outbox enable row level security;
revoke all on public.booking_email_outbox from public, anon, authenticated;
grant all on public.booking_email_outbox to service_role;
grant usage, select on sequence public.booking_email_outbox_id_seq to service_role;

create function public.queue_booking_emails() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and NEW.status is not distinct from OLD.status then return NEW; end if;
  if NEW.status not in ('payment_pending', 'payment_submitted_pending_verification', 'confirmed', 'rejected') then return NEW; end if;
  insert into public.booking_email_outbox (booking_id, event, recipient) values (NEW.id, NEW.status, 'hotel') on conflict do nothing;
  if NEW.email is not null and NEW.email <> '' then
    insert into public.booking_email_outbox (booking_id, event, recipient) values (NEW.id, NEW.status, 'guest') on conflict do nothing;
  end if;
  return NEW;
end $$;
revoke all on function public.queue_booking_emails() from public, anon, authenticated;
create trigger booking_email_queue after insert or update of status on public.bookings for each row execute function public.queue_booking_emails();

create function public.claim_booking_emails(p_booking_id uuid default null)
returns setof public.booking_email_outbox language sql security invoker set search_path = public as $$
  update public.booking_email_outbox set status='sending', attempts=attempts+1
  where id in (select id from public.booking_email_outbox where status in ('pending','failed') and (p_booking_id is null or booking_id=p_booking_id) order by id for update skip locked limit 10)
  returning *;
$$;
revoke all on function public.claim_booking_emails(uuid) from public, anon, authenticated;
grant execute on function public.claim_booking_emails(uuid) to service_role;
