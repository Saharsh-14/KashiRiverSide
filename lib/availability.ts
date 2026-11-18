import { supabase } from './server';

type Occupied = { room_number: number; check_in: string; check_out: string; id: string };
type Block = { room_number: number; stay_date: string };

export async function roomCalendar(room: string, start: string, end: string) {
 const [types, bookings, blocks] = await Promise.all([
  supabase(`/rest/v1/room_types?code=eq.${room}&select=inventory`),
  supabase(`/rest/v1/bookings?room_type=eq.${room}&status=eq.confirmed&check_in=lt.${end}&check_out=gt.${start}&select=id,room_number,check_in,check_out&limit=10000`),
  supabase(`/rest/v1/room_blocks?room_type=eq.${room}&stay_date=gte.${start}&stay_date=lt.${end}&select=room_number,stay_date&limit=10000`),
 ]);
 if (!types.length) throw new Error('Unknown room type');
 const rooms = Array.from({ length: types[0].inventory }, (_, index) => {
  const number = index + 1;
  return { number, bookings: (bookings as Occupied[]).filter(b => b.room_number === number), blocks: (blocks as Block[]).filter(b => b.room_number === number) };
 });
 return rooms;
}

export async function hasRoomForStay(room: string, start: string, end: string) {
 return (await roomCalendar(room, start, end)).some(r => !r.bookings.length && !r.blocks.length);
}

export async function dailyAvailability(room: string, start: string, end: string) {
 const rooms = await roomCalendar(room, start, end);
 const days = [];
 for (let t = Date.parse(start); t < Date.parse(end); t += 86400000) {
  const date = new Date(t).toISOString().slice(0, 10);
  const confirmed = rooms.filter(r => r.bookings.some(b => b.check_in <= date && b.check_out > date)).length;
  const blocked = rooms.filter(r => r.blocks.some(b => b.stay_date === date)).length;
  days.push({ date, room, total: rooms.length, limit: rooms.length - blocked, confirmed, vacant: Math.max(0, rooms.length - blocked - confirmed) });
 }
 return days;
}
