import { failure, supabase } from "../../../lib/server";
export async function GET() {
  try {
    const rooms = await supabase("/rest/v1/room_types?select=code,nightly_rate&order=code");
    return Response.json({ rooms }, { headers: { "Cache-Control": "no-store" } });
  } catch { return failure(new Error("Room rates are temporarily unavailable. Please contact the hotel."), 503); }
}
