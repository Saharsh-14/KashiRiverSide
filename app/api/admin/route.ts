import { cookies } from "next/headers";
import { admin, failure, sameOrigin, supabase } from "../../../lib/server";

export async function GET() {
  try { await admin(); return Response.json(await supabase("/rest/v1/bookings?select=id,guest_name,phone,check_in,check_out,room_type,total,advance_due,status,payments(screenshot_path,transaction_reference,claimed_amount,status)&order=created_at.desc&limit=100")); }
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
    } else {
      const user = await admin();
      if(!["approve","reject"].includes(data.action)) throw new Error("Invalid action");
      await supabase("/rest/v1/rpc/review_booking",{method:"POST",body:JSON.stringify({p_id:data.id,p_admin:user,p_approve:data.action === "approve"})});
    }
    return Response.json({ok:true});
  } catch(error) { return failure(error); }
}
