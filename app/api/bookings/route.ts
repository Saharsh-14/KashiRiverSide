import { cookies } from "next/headers";
import { failure, hash, keyedHash, sameOrigin, supabase } from "../../../lib/server";
import { hasRoomForStay } from '../../../lib/availability';
import { deliverBookingEmails } from '../../../lib/booking-email';

async function currentBooking() {
 const token=(await cookies()).get("hotel_booking")?.value;
 if(!token) throw new Error("Booking access unavailable in this browser");
 const rows=await supabase(`/rest/v1/bookings?access_hash=eq.${hash(token)}&select=id,room_type,check_in,check_out,total,advance_due,status`);
 if(!rows.length) throw new Error("Booking not found");
 const booking=rows[0];
 const available=booking.status==='payment_pending' ? await hasRoomForStay(booking.room_type,booking.check_in,booking.check_out) : false;
 return {...booking,can_pay:available};
}
export async function GET(){try{return Response.json(await currentBooking());}catch(e){return failure(e,404);}}
export async function POST(request:Request) {
 try {
  sameOrigin(request);
  const data=await request.json();
  if(data.action === "recover") {
   if(typeof data.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id))throw new Error("Enter a valid booking reference");
   if(typeof data.code!=="string")throw new Error("Enter your recovery code");
   const recoveryCode=data.code.replaceAll("-","").toUpperCase();
   if(!/^[A-F0-9]{20}$/.test(recoveryCode))throw new Error("Enter a valid recovery code");
   const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
   const client=forwarded||request.headers.get("x-real-ip")||"unidentified-client";
   const allowed=await supabase("/rest/v1/rpc/consume_booking_attempt",{method:"POST",body:JSON.stringify({p_client_hash:keyedHash("booking-recovery-rate",client),p_window_seconds:600,p_max_requests:5})});
   if(!allowed)return Response.json({error:"Too many recovery attempts. Please wait 10 minutes and try again."},{status:429,headers:{"Retry-After":"600"}});
   const rows=await supabase(`/rest/v1/bookings?id=eq.${data.id}&recovery_hash=eq.${keyedHash("booking-recovery",recoveryCode)}&select=id`);
   if(!rows.length)throw new Error("Booking reference or recovery code is incorrect");
   const recoveredToken=keyedHash("booking-recovered-access",`${data.id}:${recoveryCode}`);
   await supabase(`/rest/v1/bookings?id=eq.${data.id}`,{method:"PATCH",body:JSON.stringify({access_hash:hash(recoveredToken)})});
   (await cookies()).set("hotel_booking",recoveredToken,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*24*90});
   return Response.json(await currentBooking());
  }
  if(process.env.BOOKINGS_ENABLED !== "true") throw new Error("Online reservations are not open yet. Please contact the hotel.");
  if(data.action === "payment") {
   const b=await currentBooking();
   if(typeof data.reference !== "string" || !/^[A-Za-z0-9]{8,40}$/.test(data.reference)) throw new Error("Enter a valid transaction reference");
   await supabase("/rest/v1/rpc/submit_payment",{method:"POST",body:JSON.stringify({p_id:b.id,p_reference:data.reference.toUpperCase()})});
   await deliverBookingEmails(b.id).catch(() => {});
   return Response.json(await currentBooking());
  }
  const idempotencyKey=request.headers.get("idempotency-key");
  if(!idempotencyKey||!/^[A-Za-z0-9-]{16,128}$/.test(idempotencyKey)) throw new Error("Booking request key is missing or invalid");
  const idempotencyHash=keyedHash("booking-idempotency",idempotencyKey);
  const token=keyedHash("booking-access",idempotencyKey);
  const rawRecoveryCode=keyedHash("booking-recovery-code",idempotencyKey).slice(0,20).toUpperCase();
  const recoveryCode=rawRecoveryCode.match(/.{1,4}/g)!.join("-");
  const existing=await supabase(`/rest/v1/bookings?idempotency_hash=eq.${idempotencyHash}&select=id`);
  if(existing.length){
   (await cookies()).set("hotel_booking",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*24*90});
   return Response.json({...await currentBooking(),recovery_code:recoveryCode});
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
  if (data.quotedNightlyRate !== undefined && data.quotedNightlyRate !== room.nightly_rate) throw new Error("Room rates have changed. Please refresh the page and review the updated price.");
  if(!await hasRoomForStay(data.room,data.arrival,data.departure)) throw new Error("Room unavailable for these dates. Please choose different dates or contact the hotel.");
  const total=nights*(room.nightly_rate+(data.extra?50000:0));
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client=forwarded||request.headers.get("x-real-ip")||"unidentified-client";
  const allowed=await supabase("/rest/v1/rpc/consume_booking_attempt",{method:"POST",body:JSON.stringify({p_client_hash:keyedHash("booking-rate",client),p_window_seconds:600,p_max_requests:5})});
  if(!allowed)return Response.json({error:"Too many booking attempts. Please wait 10 minutes and try again."},{status:429,headers:{"Retry-After":"600"}});
  await supabase("/rest/v1/bookings",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates"},body:JSON.stringify({room_type:data.room,check_in:data.arrival,check_out:data.departure,adults:data.adults,children:data.children,extra_mattress:data.extra,guest_name:data.name.trim(),phone:data.phone,email:data.email||null,special_request:data.requests||null,policy_version:"2026-11-14",nightly_rate:room.nightly_rate,total,advance_due:Math.round(total*.3),access_hash:hash(token),idempotency_hash:idempotencyHash,recovery_hash:keyedHash("booking-recovery",rawRecoveryCode)})});
  (await cookies()).set("hotel_booking",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*24*90});
  const created=await currentBooking();
  await deliverBookingEmails(created.id).catch(() => {});
  return Response.json({...created,recovery_code:recoveryCode},{status:201});
 } catch(e){return failure(e);}
}
