import { cookies } from "next/headers";
import { admin, failure, sameOrigin, supabase } from "../../../lib/server";
import { deliverBookingEmails } from "../../../lib/booking-email";

export async function GET() {
  try { await admin(); const [bookings,roomTypes,availability,emailJobs]=await Promise.all([supabase("/rest/v1/bookings?select=id,guest_name,phone,check_in,check_out,room_type,total,advance_due,status,payments(screenshot_path,transaction_reference,claimed_amount,status)&order=created_at.desc&limit=100"),supabase("/rest/v1/room_types?select=code,inventory&order=code"),supabase("/rest/v1/room_availability?select=room_type,stay_date,available_rooms&order=stay_date&limit=500"),process.env.EMAIL_NOTIFICATIONS_ENABLED === "true" ? supabase("/rest/v1/booking_email_outbox?select=status&status=neq.sent&limit=1000").catch(() => null) : Promise.resolve(null)]); return Response.json({bookings,roomTypes,availability,emailJobs}); }
  catch(error) { return failure(error,401); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = await request.json();
    if(data.action === "login") {
      const session = await supabase("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:data.email,password:data.password})});
      const allowed = await supabase(`/rest/v1/hotel_admins?user_id=eq.${encodeURIComponent(session.user.id)}&select=user_id`);
      if(!allowed.length) throw new Error("Admin access required");
      (await cookies()).set("hotel_admin",session.access_token,{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"strict",path:"/",maxAge:session.expires_in});
    } else if(data.action === "logout") {
      (await cookies()).delete("hotel_admin");
    } else if(data.action === "retry_emails") {
      await admin();
      if(process.env.EMAIL_NOTIFICATIONS_ENABLED !== "true" || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("Email notifications are not enabled");
      await deliverBookingEmails(null);
    } else if(data.action === "availability") {
      const user=await admin(); const count=Number(data.availableRooms);
      if(!["ac","non_ac"].includes(data.roomType)||!/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)||!Number.isInteger(count)||count<0||count>(data.roomType==="ac"?7:1)) throw new Error("Invalid availability");
      const start=new Date(`${data.startDate}T00:00:00Z`),end=new Date(`${data.endDate}T00:00:00Z`); if(end<start||(end.getTime()-start.getTime())/86400000>365) throw new Error("Invalid availability range");
      const rows=[]; for(let d=start;d<=end;d=new Date(d.getTime()+86400000)) rows.push({room_type:data.roomType,stay_date:d.toISOString().slice(0,10),available_rooms:count,updated_by:user,updated_at:new Date().toISOString()});
      await supabase("/rest/v1/room_availability?on_conflict=room_type,stay_date",{method:"POST",headers:{Prefer:"resolution=merge-duplicates"},body:JSON.stringify(rows)});
    } else {
      const user = await admin();
      if(!["approve","reject"].includes(data.action)) throw new Error("Invalid action");
      await supabase("/rest/v1/rpc/review_booking",{method:"POST",body:JSON.stringify({p_id:data.id,p_admin:user,p_approve:data.action === "approve"})});
      await deliverBookingEmails(data.id).catch(() => {});
    }
    return Response.json({ok:true});
  } catch(error) { return failure(error); }
}
