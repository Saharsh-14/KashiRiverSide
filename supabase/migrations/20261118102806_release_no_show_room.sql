create function public.room_block_ranges(p_date date)
returns table(room_type text, room_number integer, start_date date, end_date date)
language sql stable security invoker set search_path=public as $$
  with numbered as (
    select b.room_type, b.room_number, b.stay_date,
      b.stay_date - (row_number() over(partition by b.room_type,b.room_number order by b.stay_date))::integer as grp
    from room_blocks b
  )
  select n.room_type,n.room_number,min(n.stay_date),max(n.stay_date)+1
  from numbered n group by n.room_type,n.room_number,n.grp
  having p_date between min(n.stay_date) and max(n.stay_date);
$$;
revoke all on function public.room_block_ranges(date) from public,anon,authenticated;
grant execute on function public.room_block_ranges(date) to service_role;

create function public.release_confirmed_room(p_admin uuid,p_booking_id uuid)
returns void language plpgsql security invoker set search_path=public as $$
declare b public.bookings;
begin
  if not exists(select 1 from hotel_admins where user_id=p_admin) then raise exception 'Unauthorized'; end if;
  select * into b from bookings where id=p_booking_id for update;
  if not found or b.status <> 'confirmed' then raise exception 'This booking is no longer confirmed'; end if;
  perform 1 from room_types where code=b.room_type for update;
  update bookings set status='cancelled' where id=b.id;
  insert into booking_events(booking_id,actor,event) values(b.id,p_admin,'admin_released_room_no_show');
end $$;
revoke all on function public.release_confirmed_room(uuid,uuid) from public,anon,authenticated;
grant execute on function public.release_confirmed_room(uuid,uuid) to service_role;
