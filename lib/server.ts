import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export async function supabase(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Database connection unavailable");
  const response = await fetch(`${url}${path}`, { ...init, cache: "no-store", headers: { apikey: key, "Content-Type": "application/json", ...init.headers }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Request could not be completed. Check the details or contact the hotel.");
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
export async function admin() {
  const token = (await cookies()).get("hotel_admin")?.value;
  if (!token) throw new Error("Please sign in");
  const user = await supabase("/auth/v1/user", { headers: { Authorization: `Bearer ${token}` } });
  const rows = await supabase(`/rest/v1/hotel_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
  if (!rows.length) throw new Error("Admin access required");
  return user.id as string;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new Error("Invalid request origin");
  const parsed = new URL(origin);
  // Next may normalize its internal request URL to localhost behind a proxy.
  // Compare the browser Origin to the actual HTTP Host instead.
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.host !== request.headers.get("host")) throw new Error("Invalid request origin");
}
export function failure(error: unknown, status=400) {
  return Response.json({ error: error instanceof Error ? error.message : "Request failed" }, {status});
}
