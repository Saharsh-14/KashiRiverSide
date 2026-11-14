create table public.room_availability (
  room_type text not null references public.room_types(code) on delete cascade,
  stay_date date not null,
  available_rooms integer not null check (available_rooms >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (room_type, stay_date)
);
alter table public.room_availability enable row level security;
revoke all on public.room_availability from public, anon, authenticated;
grant all on public.room_availability to service_role;

create or replace function public.review_booking(p_id uuid, p_admin uuid, p_approve boolean)
returns void language plpgsql security invoker set search_path = public as $$
declare b public.bookings; default_capacity integer;
begin
  if not exists(select 1 from hotel_admins where user_id=p_admin) then raise exception 'Unauthorized'; end if;
  select * into b from bookings where id=p_id for update;
  if not found then raise exception 'Booking not found'; end if;
  if b.status <> 'payment_submitted_pending_verification' then raise exception 'Booking is not awaiting verification'; end if;
  select inventory into default_capacity from room_types where code=b.room_type for update;
  perform 1 from room_availability where room_type=b.room_type and stay_date >= b.check_in and stay_date < b.check_out for update;
  if p_approve then
    if not exists(select 1 from payments where booking_id=p_id and status='submitted' and claimed_amount=b.advance_due) then raise exception 'Payment submission missing'; end if;
    if exists(select 1 from generate_series(b.check_in,b.check_out-1,interval '1 day') d where
      (select count(*) from bookings x where x.room_type=b.room_type and x.status='confirmed' and x.check_in<=d::date and x.check_out>d::date)
      >= coalesce((select available_rooms from room_availability a where a.room_type=b.room_type and a.stay_date=d::date),default_capacity)
    ) then raise exception 'No room available'; end if;
    update payments set status='verified',verified_amount=claimed_amount where booking_id=p_id and status='submitted';
    update bookings set status='confirmed' where id=p_id;
  else update bookings set status='rejected' where id=p_id;
  end if;
  insert into booking_events(booking_id,actor,event) values(p_id,p_admin,case when p_approve then 'payment_verified_and_booking_confirmed' else 'booking_rejected_refund_review_required' end);
end $$;
revoke all on function public.review_booking(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.review_booking(uuid,uuid,boolean) to service_role;
