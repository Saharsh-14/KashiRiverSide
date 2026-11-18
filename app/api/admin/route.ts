import { cookies } from "next/headers";
import { admin, failure, sameOrigin, supabase } from "../../../lib/server";
import { deliverBookingEmails } from "../../../lib/booking-email";
import { mailTransport } from "../../../lib/mail";

async function allBookings() {
  const bookings = []; let offset = 0;
  while (true) {
    const page = await supabase(`/rest/v1/bookings?select=id,created_at,guest_name,phone,email,adults,children,extra_mattress,special_request,check_in,check_out,room_type,room_number,total,advance_due,status,payments(screenshot_path,transaction_reference,claimed_amount,verified_amount,status)&order=created_at.desc,id.desc&limit=1000&offset=${offset}`);
    bookings.push(...page);
    if (page.length < 1000) return bookings;
    offset += page.length;
  }
}
async function allAvailability() {
  const rows = []; let offset = 0;
  while (true) {
    const page = await supabase(`/rest/v1/room_availability?select=room_type,stay_date,available_rooms&order=stay_date,room_type&limit=1000&offset=${offset}`);
    rows.push(...page);
    if (page.length < 1000) return rows;
    offset += page.length;
  }
}
export async function GET() {
  try { await admin(); const [bookings,roomTypes,availability,emailJobs]=await Promise.all([allBookings(),supabase("/rest/v1/room_types?select=code,inventory,nightly_rate&order=code"),allAvailability(),process.env.EMAIL_NOTIFICATIONS_ENABLED === "true" ? supabase("/rest/v1/booking_email_outbox?select=status&status=neq.sent&limit=1000").catch(() => null) : Promise.resolve(null)]); return Response.json({bookings,roomTypes,availability,emailJobs}); }
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
    } else if(data.action === "test_email") {
      await admin();
      const recipient = process.env.GMAIL_USER?.trim();
      if (!recipient || !process.env.GMAIL_APP_PASSWORD) throw new Error("Email is not configured on this server");
      try {
        await mailTransport().sendMail({ from: `Kashi Riverside Stay <${recipient}>`, to: recipient, subject: "Email test | Kashi Riverside Stay", text: "This is a test from the hotel admin dashboard. No booking or payment was created." });
      } catch { throw new Error("The server could not send the test email. Check the email settings."); }
    } else if(data.action === "retry_emails") {
      await admin();
      if(process.env.EMAIL_NOTIFICATIONS_ENABLED !== "true" || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("Email notifications are not enabled");
      await deliverBookingEmails(null);
    } else if(data.action === "rate") {
      await admin();
      if(!["ac","non_ac"].includes(data.roomType) || !Number.isInteger(data.ratePaise) || data.ratePaise < 100 || data.ratePaise > 100000000) throw new Error("Enter a valid room rate");
      await supabase(`/rest/v1/room_types?code=eq.${data.roomType}`, {method:"PATCH", body:JSON.stringify({nightly_rate:data.ratePaise})});
    } else if(data.action === "room_block") {
      const user=await admin();
      const validDate=(v:unknown):v is string=>typeof v==="string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
      if(!["ac","non_ac"].includes(data.roomType)||!Number.isInteger(data.roomNumber)||!validDate(data.startDate)||!validDate(data.endDate)||typeof data.blocked!=="boolean") throw new Error("Choose valid room and dates");
      await supabase("/rest/v1/rpc/set_room_block",{method:"POST",body:JSON.stringify({p_admin:user,p_room_type:data.roomType,p_room_number:data.roomNumber,p_start:data.startDate,p_end:data.endDate,p_block:data.blocked})});
    } else if(data.action === "release_confirmed_room") {
      const user=await admin();
      if(typeof data.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)) throw new Error("Invalid booking");
      await supabase("/rest/v1/rpc/release_confirmed_room",{method:"POST",body:JSON.stringify({p_admin:user,p_booking_id:data.id})});
    } else {
      const user = await admin();
      if(!["approve","reject"].includes(data.action)) throw new Error("Invalid action");
      await supabase("/rest/v1/rpc/review_booking",{method:"POST",body:JSON.stringify({p_id:data.id,p_admin:user,p_approve:data.action === "approve"})});
      await deliverBookingEmails(data.id).catch(() => {});
    }
    return Response.json({ok:true});
  } catch(error) { return failure(error); }
}
