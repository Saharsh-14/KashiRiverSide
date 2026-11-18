type FinancePayment = { status: string; claimed_amount: number; verified_amount: number | null };
type FinanceBooking = { status: string; total: number; payments: FinancePayment[] };

export function summarizeFinance(bookings: FinanceBooking[]) {
 const confirmed = bookings.filter(booking => booking.status === "confirmed");
 const verified = (booking: FinanceBooking) => booking.payments.reduce((sum, payment) => sum + (payment.status === "verified" ? payment.verified_amount ?? 0 : 0), 0);
 return {
  confirmedValue: confirmed.reduce((sum, booking) => sum + booking.total, 0),
  verifiedAdvances: bookings.reduce((sum, booking) => sum + verified(booking), 0),
  projectedBalance: confirmed.reduce((sum, booking) => sum + Math.max(0, booking.total - verified(booking)), 0),
  awaitingVerification: bookings.reduce((sum, booking) => sum + (booking.status === "payment_submitted_pending_verification" ? booking.payments.reduce((n, payment) => n + (payment.status === "submitted" ? payment.claimed_amount : 0), 0) : 0), 0),
  confirmedCount: confirmed.length,
 };
}
