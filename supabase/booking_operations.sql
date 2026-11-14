alter table public.bookings add column access_hash text unique;
create function public.review_booking(p_id uuid, p_admin uuid, p_approve boolean)
returns void language plpgsql security invoker set search_path = public as $$
declare b public.bookings; capacity integer;
begin
  if not exists(select 1 from hotel_admins where user_id=p_admin) then raise exception 'Unauthorized'; end if;
  select * into b from bookings where id=p_id;
  if not found then raise exception 'Booking not found'; end if;
  select inventory into capacity from room_types where code=b.room_type for update;
  select * into b from bookings where id=p_id for update;
  if b.status <> 'payment_submitted_pending_verification' then raise exception 'Booking is not awaiting verification'; end if;
  if p_approve then
    if not exists(select 1 from payments where booking_id=p_id and status='submitted' and claimed_amount=b.advance_due) then raise exception 'Payment submission missing'; end if;
    if exists(select 1 from generate_series(b.check_in::timestamp,(b.check_out-1)::timestamp,interval '1 day') d where (select count(*) from bookings x where x.room_type=b.room_type and x.status='confirmed' and x.check_in<=d::date and x.check_out>d::date)>=capacity) then raise exception 'No room available'; end if;
    update payments set status='verified',verified_amount=claimed_amount where booking_id=p_id and status='submitted';
    update bookings set status='confirmed' where id=p_id;
  else
    update bookings set status='rejected' where id=p_id;
  end if;
  insert into booking_events(booking_id,actor,event) values(p_id,p_admin,case when p_approve then 'payment_verified_and_booking_confirmed' else 'booking_rejected_refund_review_required' end);
end $$;
create function public.submit_payment(p_id uuid,p_reference text)
returns void language plpgsql security invoker set search_path = public as $$
declare b public.bookings;
begin
 select * into b from bookings where id=p_id for update;
 if b.status <> 'payment_pending' then raise exception 'Payment already submitted'; end if;
 insert into payments(booking_id,transaction_reference,claimed_amount) values(p_id,p_reference,b.advance_due);
 update bookings set status='payment_submitted_pending_verification' where id=p_id;
 insert into booking_events(booking_id,event) values(p_id,'payment_submitted');
end $$;
revoke all on function public.review_booking(uuid,uuid,boolean), public.submit_payment(uuid,text) from public,anon,authenticated;
grant execute on function public.review_booking(uuid,uuid,boolean), public.submit_payment(uuid,text) to service_role;
