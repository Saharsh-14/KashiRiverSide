create function public.submit_payment_evidence(p_id uuid,p_reference text,p_screenshot text)
returns void language plpgsql security invoker set search_path = public as $$
declare b public.bookings;
begin
 select * into b from bookings where id=p_id for update;
 if not found then raise exception 'Booking not found'; end if;
 if b.status <> 'payment_pending' then raise exception 'Payment already submitted'; end if;
 if p_screenshot is not null and p_screenshot not like p_id::text || '/%' then raise exception 'Invalid evidence path'; end if;
 insert into payments(booking_id,transaction_reference,claimed_amount,screenshot_path) values(p_id,p_reference,b.advance_due,p_screenshot);
 update bookings set status='payment_submitted_pending_verification' where id=p_id;
 insert into booking_events(booking_id,event) values(p_id,'payment_submitted');
end $$;
revoke all on function public.submit_payment_evidence(uuid,text,text) from public,anon,authenticated;
grant execute on function public.submit_payment_evidence(uuid,text,text) to service_role;
