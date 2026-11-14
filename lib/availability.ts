import { supabase } from './server';
export async function dailyAvailability(room:string,start:string,end:string){
 const [types,overrides]=await Promise.all([supabase(`/rest/v1/room_types?code=eq.${room}&select=inventory`),supabase(`/rest/v1/room_availability?room_type=eq.${room}&stay_date=gte.${start}&stay_date=lt.${end}&select=stay_date,available_rooms`)]);
 if(!types.length)throw new Error('Unknown room type');
 const days=[];
 for(let t=Date.parse(start);t<Date.parse(end);t+=86400000){
  const date=new Date(t).toISOString().slice(0,10);
  // Query occupancy separately from the admin's recent-booking list.
  const counts=await supabase(`/rest/v1/bookings?room_type=eq.${room}&status=eq.confirmed&check_in=lte.${date}&check_out=gt.${date}&select=id&limit=1000`);
  const limit=overrides.find((a:{stay_date:string})=>a.stay_date===date)?.available_rooms??types[0].inventory;
  days.push({date,room,total:types[0].inventory,limit,confirmed:counts.length,vacant:Math.max(0,limit-counts.length)});
 }
 return days;
}
