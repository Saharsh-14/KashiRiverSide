import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { failure, hash, sameOrigin, supabase } from "../../../lib/server";
import { dailyAvailability } from '../../../lib/availability';

async function currentBooking() {
 const token=(await cookies()).get("hotel_booking")?.value;
 if(!token) throw new Error("Booking access unavailable in this browser");
 const rows=await supabase(`/rest/v1/bookings?access_hash=eq.${hash(token)}&select=id,room_type,check_in,check_out,total,advance_due,status`);
 if(!rows.length) throw new Error("Booking not found");
 const booking=rows[0];
 const days=booking.status==='payment_pending'?await dailyAvailability(booking.room_type,booking.check_in,booking.check_out):[];
 return {...booking,can_pay:booking.status==='payment_pending'&&days.length>0&&days.every(d=>d.vacant>0)};
}
export async function GET(){try{return Response.json(await currentBooking());}catch(e){return failure(e,404);}}
export async function POST(request:Request) {
 try {
  sameOrigin(request);
  if(process.env.BOOKINGS_ENABLED !== "true") throw new Error("Online reservations are not open yet. Please contact the hotel.");
  const data=await request.json();
  if(data.action === "payment") {
   const b=await currentBooking();
   if(typeof data.reference !== "string" || !/^[A-Za-z0-9]{8,40}$/.test(data.reference)) throw new Error("Enter a valid transaction reference");
   await supabase("/rest/v1/rpc/submit_payment",{method:"POST",body:JSON.stringify({p_id:b.id,p_reference:data.reference.toUpperCase()})});
   return Response.json(await currentBooking());
  }
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date());
  const dateValid=(v:unknown):v is string=> typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
  if(!dateValid(data.arrival)||!dateValid(data.departure)||data.arrival<today||data.departure<=data.arrival) throw new Error("Choose valid stay dates");
  const nights=(Date.parse(data.departure)-Date.parse(data.arrival))/86400000;
  if(nights>90) throw new Error("Please contact the hotel for extended stays");
  if(!["ac","non_ac"].includes(data.room)||!Number.isInteger(data.adults)||data.adults<1||data.adults>3||!Number.isInteger(data.children)||data.children<0||data.children>2||typeof data.extra!=="boolean"||(data.adults===3&&!data.extra)) throw new Error("Check guest numbers and extra bedding");
  if(typeof data.name!=="string"||!data.name.trim()||data.name.length>120||typeof data.phone!=="string"||!/^\+?[0-9 ()-]{10,20}$/.test(data.phone)||data.accepted!==true) throw new Error("Enter your name, phone and accept the policies");
  if(typeof data.email!=="string"||data.email.length>254||(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))||typeof data.requests!=="string"||data.requests.length>1000) throw new Error("Check email and special requests");
  const [room]=await supabase(`/rest/v1/room_types?code=eq.${data.room}&select=nightly_rate,inventory`);
  const overlaps=await supabase(`/rest/v1/bookings?room_type=eq.${data.room}&status=eq.confirmed&check_in=lt.${data.departure}&check_out=gt.${data.arrival}&select=check_in,check_out`);
  const overrides=await supabase(`/rest/v1/room_availability?room_type=eq.${data.room}&stay_date=gte.${data.arrival}&stay_date=lt.${data.departure}&select=stay_date,available_rooms`);
  for(let day=Date.parse(data.arrival);day<Date.parse(data.departure);day+=86400000){
   const date=new Date(day).toISOString().slice(0,10);
   const capacity=overrides.find((a:{stay_date:string})=>a.stay_date===date)?.available_rooms ?? room.inventory;
   if(overlaps.filter((b:{check_in:string;check_out:string})=>Date.parse(b.check_in)<=day&&Date.parse(b.check_out)>day).length>=capacity)throw new Error("Room unavailable for these dates. Please choose different dates or contact the hotel.");
  }
  const total=nights*(room.nightly_rate+(data.extra?50000:0));
  const token=randomBytes(32).toString("hex");
  await supabase("/rest/v1/bookings",{method:"POST",body:JSON.stringify({room_type:data.room,check_in:data.arrival,check_out:data.departure,adults:data.adults,children:data.children,extra_mattress:data.extra,guest_name:data.name.trim(),phone:data.phone,email:data.email||null,special_request:data.requests||null,policy_version:"2026-11-14",nightly_rate:room.nightly_rate,total,advance_due:Math.round(total*.3),access_hash:hash(token)})});
  (await cookies()).set("hotel_booking",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*24*90});
  return Response.json(await currentBooking(),{status:201});
 } catch(e){return failure(e);}
}
