export type BookingEmailEvent = "payment_pending" | "payment_submitted_pending_verification" | "confirmed" | "rejected";
export type BookingEmailRecipient = "hotel" | "guest";
export type BookingEmailData = { id: string; guest_name: string; email: string | null; phone: string; room_type: string; check_in: string; check_out: string; total: number; advance_due: number };

const messages: Record<BookingEmailRecipient, Record<BookingEmailEvent, { subject: string; body: string }>> = {
  hotel: {
    payment_pending: { subject: "New booking request", body: "A guest has submitted a booking request. The booking is not confirmed and the advance payment is still pending." },
    payment_submitted_pending_verification: { subject: "Payment awaiting verification", body: "A guest has submitted payment details. Check the payment in the bank account and review the request in the admin dashboard before confirming." },
    confirmed: { subject: "Booking confirmed", body: "The payment was verified and the booking was confirmed in the admin dashboard." },
    rejected: { subject: "Booking rejected", body: "The booking request was rejected. Review whether any payment was received and whether a refund is required." },
  },
  guest: {
    payment_pending: { subject: "Booking request received", body: "Your request has been received. It is not confirmed yet. Please follow the payment instructions on your booking status page." },
    payment_submitted_pending_verification: { subject: "Payment details submitted", body: "Your payment details were submitted and are awaiting hotel verification. Your booking is not confirmed yet." },
    confirmed: { subject: "Booking confirmed", body: "Your payment has been verified and your booking is confirmed." },
    rejected: { subject: "Booking update", body: "Your booking request was not confirmed. Please contact the hotel if you have questions or need a refund review." },
  },
};

export function bookingEmailContent(recipient: BookingEmailRecipient, event: BookingEmailEvent, booking: BookingEmailData) {
  const message = messages[recipient][event];
  const details = [`Reference: ${booking.id}`, `Guest: ${booking.guest_name}`, ...(recipient === "hotel" ? [`Phone: ${booking.phone}`, ...(booking.email ? [`Email: ${booking.email}`] : [])] : []), `Room: ${booking.room_type === "ac" ? "AC" : "Non-AC"}`, `Check-in: ${booking.check_in}`, `Check-out: ${booking.check_out}`, `Total: ₹${(booking.total / 100).toLocaleString("en-IN")}`, `Advance: ₹${(booking.advance_due / 100).toLocaleString("en-IN")}`].join("\n");
  return { subject: `${message.subject} | Kashi Riverside Stay`, text: `${recipient === "guest" ? `Hello ${booking.guest_name},\n\n` : "Hello hotel team,\n\n"}${message.body}\n\n${details}\n\n${recipient === "guest" ? "Contact: +91 99190 22918\n" : ""}Kashi Riverside Stay` };
}
