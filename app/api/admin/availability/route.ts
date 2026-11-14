import { admin,failure } from '../../../../lib/server';
import { dailyAvailability } from '../../../../lib/availability';
export async function GET(request:Request){try{
 await admin();const date=new URL(request.url).searchParams.get('date')||'';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Choose a valid date');
 const end=new Date(Date.parse(date)+86400000).toISOString().slice(0,10);
 return Response.json((await Promise.all(['ac','non_ac'].map(room=>dailyAvailability(room,date,end)))).flat());
 }catch(e){return failure(e);}}
