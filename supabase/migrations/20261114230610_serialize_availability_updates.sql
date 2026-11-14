create function public.lock_availability_room() returns trigger
language plpgsql security invoker set search_path=public as $$
begin
 perform 1 from room_types where code=new.room_type for update;
 if new.available_rooms > (select inventory from room_types where code=new.room_type) then
 raise exception 'Room count exceeds physical inventory';
 end if;
 return new;
end $$;
revoke all on function public.lock_availability_room() from public,anon,authenticated;
create trigger lock_availability_room before insert or update on public.room_availability
for each row execute function public.lock_availability_room();
