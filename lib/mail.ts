import nodemailer from "nodemailer";

/** Create a transporter lazily so missing email configuration never prevents bookings. */
export function mailTransport() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) throw new Error("Booking email is not configured");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
}
