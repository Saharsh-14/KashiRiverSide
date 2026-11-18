import { admin,failure,supabase } from '../../../../lib/server';
import { dailyAvailability, roomCalendar } from '../../../../lib/availability';
export async function GET(request:Request){try{
 await admin();const date=new URL(request.url).searchParams.get('date')||'';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Choose a valid date');
 const end=new Date(Date.parse(date)+86400000).toISOString().slice(0,10);
 const ranges=await supabase('/rest/v1/rpc/room_block_ranges',{method:'POST',body:JSON.stringify({p_date:date})});
 const result=await Promise.all(['ac','non_ac'].map(async room=>({room,summary:(await dailyAvailability(room,date,end))[0],rooms:(await roomCalendar(room,date,end)).map(item=>({...item,blockRange:ranges.find((r:{room_type:string;room_number:number})=>r.room_type===room&&r.room_number===item.number)||null}))})));
 return Response.json(result);
 }catch(e){return failure(e);}}
