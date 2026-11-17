import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { failure, hash, sameOrigin, supabase } from "../../../lib/server";
import { deliverBookingEmails } from "../../../lib/booking-email";

export async function POST(request: Request) {
  let path: string | null = null;
  let submissionStarted = false;
  try {
    sameOrigin(request);
    if(process.env.BOOKINGS_ENABLED !== "true") throw new Error("Online payments are not open yet");
    const token=(await cookies()).get("hotel_booking")?.value;
    if(!token) return failure(new Error("Booking access required"),401);
    const [b]=await supabase(`/rest/v1/bookings?access_hash=eq.${hash(token)}&select=id,status`);
    if(!b || b.status!=="payment_pending") throw new Error("Booking is not awaiting payment");
    // Bound the streamed body even when Content-Length is absent.
    const reader=request.body?.getReader(); if(!reader) throw new Error("Missing payment details");
    const chunks: Uint8Array[]=[]; let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>3*1024*1024+65536){await reader.cancel();throw new Error("Screenshot must be smaller than 3 MB");}chunks.push(value);}
    const form=await new Response(Buffer.concat(chunks),{headers:{"Content-Type":request.headers.get("content-type")||""}}).formData();
    const reference=form.get("reference");
    if(typeof reference!=="string" || !/^[A-Za-z0-9]{8,40}$/.test(reference)) throw new Error("Enter a valid transaction reference");
    const file=form.get("screenshot");
    if(file instanceof File && file.size>0){
      if(file.size>3*1024*1024)throw new Error("Screenshot must be smaller than 3 MB");
      const bytes=Buffer.from(await file.arrayBuffer());
      const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
      if(!(png&&file.type==="image/png")&&!(jpeg&&file.type==="image/jpeg"))throw new Error("Upload a PNG or JPEG screenshot");
      path=`${b.id}/${randomUUID()}.${png?"png":"jpg"}`;
      await supabase(`/storage/v1/object/payment-evidence/${path}`,{method:"POST",headers:{"Content-Type":png?"image/png":"image/jpeg"},body:bytes});
    }
    submissionStarted = true;
    await supabase("/rest/v1/rpc/submit_payment_evidence",{method:"POST",body:JSON.stringify({p_id:b.id,p_reference:reference.toUpperCase(),p_screenshot:path})});
    await deliverBookingEmails(b.id).catch(() => {});
    return Response.json({ok:true});
  }catch(e){
    // Uploaded files are unreferenced on failed submissions; remove only this request's file.
    if(path && !submissionStarted)await supabase("/storage/v1/object/payment-evidence",{method:"DELETE",body:JSON.stringify({prefixes:[path]})}).catch(()=>{});
    return failure(e);
  }
}
