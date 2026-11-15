"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  room_type: string;
  check_in: string;
  check_out: string;
  total: number;
  advance_due: number;
  status: string;
  can_pay: boolean;
};

export default function Status() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/bookings");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setBooking(data);
    setError("");
  }

  useEffect(() => {
    setRecoveryCode(sessionStorage.getItem("hotel_booking_recovery") || "");
    void refresh().catch(error => setError(error.message));
  }, []);

  return <main className="section-shell booking-page">
    <a href="/">← Hotel website</a>
    <h1>Your booking</h1>
    {error && <p role="alert">{error}</p>}
    {!booking && <section>
      <h2>Recover booking access</h2>
      <p>Enter the booking reference and private recovery code you saved when booking.</p>
      <form onSubmit={async event => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "recover", id: form.get("id"), code: form.get("code") }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setBooking(data);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Recovery failed");
        } finally {
          setBusy(false);
        }
      }}>
        <label>Booking reference<input required name="id" autoComplete="off" /></label>
        <label>Recovery code<input required name="code" autoComplete="off" pattern="[A-Fa-f0-9-]{20,24}" /></label>
        <button className="button button-dark" disabled={busy}>Recover booking</button>
      </form>
    </section>}
    {booking && <>
      <p>Reference: {booking.id}</p>
      {recoveryCode && <section role="status">
        <h2>Save your recovery details</h2>
        <p>Recovery code: <strong>{recoveryCode}</strong></p>
        <p>Keep this code private. Save it with your booking reference to access this booking on another device. Recovering access signs out the previously connected browser.</p>
      </section>}
      <h2>{booking.status.replaceAll("_", " ")}</h2>
      <p>{booking.room_type === "ac" ? "AC" : "Non-AC"} room · {booking.check_in} → {booking.check_out}</p>
      <p>Total ₹{booking.total / 100} · Required advance ₹{booking.advance_due / 100}</p>
      {booking.status === "confirmed"
        ? <p>Your booking is confirmed. Balance payable at hotel: ₹{(booking.total - booking.advance_due) / 100}.</p>
        : <p>This booking is not yet confirmed. Final confirmation requires hotel approval.</p>}
      {booking.status === "payment_pending" && <section>
        {booking.can_pay ? <>
          <h2>Pay your 30% advance</h2>
          <img src="/assets/payment-qr.png" width={280} height={388} alt="UPI payment QR for Vivek Jaiswal" />
          <p>Recipient: Vivek Jaiswal</p>
          <p>UPI: vivekjaiswal452@okaxis</p>
        </> : <p>These dates are currently unavailable. Please contact the hotel before paying. If you already paid, submit your reference below.</p>}
        <form onSubmit={async event => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const data = new FormData(event.currentTarget);
          try {
            const response = await fetch("/api/payments", { method: "POST", body: data });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            await refresh();
          } catch (error) {
            setError(error instanceof Error ? error.message : "Submission failed");
          } finally {
            setBusy(false);
          }
        }}>
          <label>UPI transaction reference<input required name="reference" pattern="[A-Za-z0-9]{8,40}" maxLength={40} /></label>
          <label>Payment screenshot (optional, PNG/JPEG up to 3 MB)<input name="screenshot" type="file" accept="image/png,image/jpeg" /></label>
          <button className="button button-dark" disabled={busy}>Submit payment reference</button>
        </form>
      </section>}
      <button disabled={busy} onClick={() => void refresh().catch(error => setError(error.message))}>Refresh status</button>
      <p>Keep your booking reference and recovery code private.</p>
      <a href="https://wa.me/919919022918">Contact hotel on WhatsApp ↗</a>
    </>}
  </main>;
}
