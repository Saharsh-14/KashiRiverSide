import { admin, failure, supabase } from "../../../../lib/server";
export async function GET(request:Request){
 try {
  await admin();
  const id=new URL(request.url).searchParams.get("booking");
  if(!id||!/^[a-f0-9-]{36}$/i.test(id))throw new Error("Invalid booking reference");
  const rows=await supabase(`/rest/v1/payments?booking_id=eq.${id}&select=screenshot_path&order=submitted_at.desc&limit=1`);
  const path=rows[0]?.screenshot_path;
  if(!path)return failure(new Error("No screenshot provided"),404);
  const result=await supabase(`/storage/v1/object/sign/payment-evidence/${path}`,{method:"POST",body:JSON.stringify({expiresIn:60})});
  return Response.redirect(`${process.env.SUPABASE_URL}/storage/v1${result.signedURL}`,303);
 }catch(e){return failure(e,401);}
}
