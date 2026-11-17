import { bookingEmailContent, type BookingEmailData, type BookingEmailEvent, type BookingEmailRecipient } from "./booking-email-content";
import { mailTransport } from "./mail";
import { supabase } from "./server";

type EmailJob = { id: number; booking_id: string; event: BookingEmailEvent; recipient: BookingEmailRecipient };

/** Failed delivery stays in the outbox for an authenticated admin to retry. */
export async function deliverBookingEmails(bookingId: string | null): Promise<void> {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED !== "true" || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const jobs: EmailJob[] = await supabase("/rest/v1/rpc/claim_booking_emails", { method: "POST", body: JSON.stringify({ p_booking_id: bookingId }) });
  for (const job of jobs) {
    let acceptedByMailServer = false;
    try {
      const [booking]: BookingEmailData[] = await supabase(`/rest/v1/bookings?id=eq.${encodeURIComponent(job.booking_id)}&select=id,guest_name,email,phone,room_type,check_in,check_out,total,advance_due`);
      if (!booking) throw new Error("Booking unavailable");
      const to = job.recipient === "hotel" ? process.env.GMAIL_USER : booking.email;
      if (!to) throw new Error("Email recipient unavailable");
      const content = bookingEmailContent(job.recipient, job.event, booking);
      await mailTransport().sendMail({ from: `Kashi Riverside Stay <${process.env.GMAIL_USER}>`, to, ...content });
      acceptedByMailServer = true;
      await supabase(`/rest/v1/booking_email_outbox?id=eq.${job.id}`, { method: "PATCH", body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }) });
    } catch {
      if (!acceptedByMailServer) await supabase(`/rest/v1/booking_email_outbox?id=eq.${job.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed" }) }).catch(() => {});
    }
  }
}
