-- Individual rooms are identified by their number within a room type.
alter table public.bookings add column room_number integer;
create table public.room_blocks (
  room_type text not null references public.room_types(code),
  room_number integer not null check (room_number > 0),
  stay_date date not null,
  updated_by uuid references auth.users(id),
  primary key(room_type, room_number, stay_date)
);
alter table public.room_blocks enable row level security;
revoke all on public.room_blocks from public, anon, authenticated;
grant all on public.room_blocks to service_role;

-- Do not silently reinterpret existing date limits or confirmed reservations.
-- They must first be reconciled with physical rooms by the hotel.
do $$ begin
  if exists(select 1 from public.room_availability) or exists(select 1 from public.bookings where status='confirmed') then
    raise exception 'Existing availability or confirmed bookings require room assignment before migration';
  end if;
end $$;

create function public.set_room_block(p_admin uuid, p_room_type text, p_room_number integer, p_start date, p_end date, p_block boolean)
returns void language plpgsql security invoker set search_path=public as $$
declare capacity integer;
begin
  if not exists(select 1 from hotel_admins where user_id=p_admin) then raise exception 'Unauthorized'; end if;
  select inventory into capacity from room_types where code=p_room_type for update;
  if capacity is null or p_room_number < 1 or p_room_number > capacity or p_start is null or p_end is null or p_end <= p_start or p_end-p_start > 366 then raise exception 'Invalid room or dates'; end if;
  if p_block and exists(select 1 from bookings where room_type=p_room_type and room_number=p_room_number and status='confirmed' and check_in<p_end and check_out>p_start) then
    raise exception 'This room has a confirmed booking during these dates';
  end if;
  if p_block then
    insert into room_blocks(room_type,room_number,stay_date,updated_by)
    select p_room_type,p_room_number,d::date,p_admin from generate_series(p_start,p_end-1,interval '1 day') d
    on conflict(room_type,room_number,stay_date) do nothing;
  else
    delete from room_blocks where room_type=p_room_type and room_number=p_room_number and stay_date>=p_start and stay_date<p_end;
  end if;
end $$;
revoke all on function public.set_room_block(uuid,text,integer,date,date,boolean) from public,anon,authenticated;
grant execute on function public.set_room_block(uuid,text,integer,date,date,boolean) to service_role;

create or replace function public.review_booking(p_id uuid, p_admin uuid, p_approve boolean)
returns void language plpgsql security invoker set search_path=public as $$
declare b public.bookings; capacity integer; assigned integer;
begin
  if not exists(select 1 from hotel_admins where user_id=p_admin) then raise exception 'Unauthorized'; end if;
  select * into b from bookings where id=p_id for update;
  if not found then raise exception 'Booking not found'; end if;
  if b.status <> 'payment_submitted_pending_verification' then raise exception 'Booking is not awaiting verification'; end if;
  select inventory into capacity from room_types where code=b.room_type for update;
  if p_approve then
    if not exists(select 1 from payments where booking_id=p_id and status='submitted' and claimed_amount=b.advance_due) then raise exception 'Payment submission missing'; end if;
    select n into assigned from generate_series(1,capacity) n
    where not exists(select 1 from bookings x where x.room_type=b.room_type and x.room_number=n and x.status='confirmed' and x.check_in<b.check_out and x.check_out>b.check_in)
      and not exists(select 1 from room_blocks x where x.room_type=b.room_type and x.room_number=n and x.stay_date>=b.check_in and x.stay_date<b.check_out)
    order by n limit 1;
    if assigned is null then raise exception 'No room available for the entire stay'; end if;
    update payments set status='verified',verified_amount=claimed_amount where booking_id=p_id and status='submitted';
    update bookings set status='confirmed',room_number=assigned where id=p_id;
  else update bookings set status='rejected' where id=p_id;
  end if;
  insert into booking_events(booking_id,actor,event) values(p_id,p_admin,case when p_approve then 'payment_verified_and_booking_confirmed' else 'booking_rejected_refund_review_required' end);
end $$;
