"use client";

import { useEffect, useRef, useState } from "react";
import MobileMenu from "../components/MobileMenu";
import "./booking.css";

export default function Booking() {
  const requestKey = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [roomType, setRoomType] = useState<"ac" | "non_ac">("ac");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [rateError, setRateError] = useState("");
  const [extra, setExtra] = useState(false);
  const [adults, setAdults] = useState("1");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const validDate = (value: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    const start = params.get("arrival"), end = params.get("departure");
    if (validDate(start)) setArrival(start!);
    if (validDate(end)) setDeparture(end!);
    if (params.get("room") === "non_ac") setRoomType("non_ac");
    const controller = new AbortController();
    fetch("/api/rooms", { cache: "no-store", signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => { const next: Record<string, number> = {}; for (const room of d.rooms) next[room.code] = room.nightly_rate; if (!Number.isInteger(next.ac) || !Number.isInteger(next.non_ac)) throw new Error(); setRates(next); }).catch(() => { if (!controller.signal.aborted) setRateError("Room rates are temporarily unavailable. Please contact the hotel."); });
    return () => controller.abort();
  }, []);
  const ratePaise = rates?.[roomType] ?? null;
  const rate = ratePaise === null ? null : ratePaise / 100;
  const nights = arrival && departure ? Math.max(0, Math.round((Date.parse(departure) - Date.parse(arrival)) / 86400000)) : 0;
  const total = nights * ((rate ?? 0) + (extra ? 500 : 0));
  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
  const dateLabel = (value: string) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "Not selected";

  return <>
    <header className="site-header booking-header">
      <a className="brand" href="/" aria-label="Kashi Riverside Stay home"><img src="/assets/krs-logo.png" alt="Kashi Riverside Stay" /></a>
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="/#rooms">Rooms</a><a href="/#services">Services</a><a href="/#gallery">Gallery</a><a href="/#contact">Contact</a></nav>
      <a className="booking-header-link" href="tel:+919919022918">Need help? <span>Call us</span></a><MobileMenu />
    </header>
    <main className="booking-page booking-redesign">
      <div className="booking-topline"><a href="/">← Back to the hotel</a></div>
      <div className="booking-heading"><div><h1>Book <em>your stay.</em></h1><p>Choose your room and share your details.</p></div></div>
      <form className="reservation-form" onSubmit={async event => {
        event.preventDefault(); setBusy(true); setError("");
        const f = new FormData(event.currentTarget);
        try {
          requestKey.current ??= crypto.randomUUID();
          const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey.current }, body: JSON.stringify({ arrival, departure, room: roomType, quotedNightlyRate: ratePaise, extra, adults: Number(f.get("adults")), children: Number(f.get("children")), name: f.get("name"), phone: f.get("phone"), email: f.get("email"), requests: f.get("requests"), accepted: true }) });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          sessionStorage.setItem("hotel_booking_recovery", data.recovery_code);
          window.location.assign("/booking/status");
        } catch (error) { setError(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); }
      }}>
        <div className="booking-main-column">
          <section className="booking-section" aria-labelledby="room-heading"><div className="booking-section-heading"><div><h2 id="room-heading">Choose your room.</h2></div></div>
            <div className="booking-room-showcase"><img src={roomType === "ac" ? "/assets/room-3.jpg" : "/assets/non-ac-room.jpg"} alt={roomType === "ac" ? "AC guest room at Kashi Riverside Stay" : "Non-AC guest room at Kashi Riverside Stay"} /><div className="booking-room-info"><h3>{roomType === "ac" ? "AC Room" : "Non-AC Room"}</h3><div className="booking-room-features"><span>✦ &nbsp;{roomType === "ac" ? "Air conditioning" : "Fan"}</span><span>✦ &nbsp;Wi-Fi</span><span>✦ &nbsp;Hot & cold water</span><span>✦ &nbsp;Housekeeping</span></div><a href="/#rooms">Discover our rooms</a></div></div>
            <div className="booking-room-options" role="radiogroup" aria-label="Room type">{[{value:"ac" as const,name:"AC Room",detail:"A cool, restful stay"},{value:"non_ac" as const,name:"Non-AC Room",detail:"Simple and welcoming"}].map(room => <label className={`booking-room-option ${roomType === room.value ? "selected" : ""}`} key={room.value}><input type="radio" name="room-choice" value={room.value} checked={roomType === room.value} onChange={() => setRoomType(room.value)} /><span><strong>{room.name}</strong><small>{room.detail}</small></span><span className="booking-room-price">{rates ? money(rates[room.value] / 100) : "—"}<small> / night</small></span></label>)}</div>
          </section>
          <section className="booking-section" aria-labelledby="dates-heading"><div className="booking-section-heading"><div><h2 id="dates-heading">Stay details.</h2></div></div><div className="booking-fields"><label>Check-in<input required type="date" value={arrival} onChange={event => setArrival(event.target.value)} /></label><label>Check-out<input required type="date" min={arrival || undefined} value={departure} onChange={event => setDeparture(event.target.value)} /></label><label>Adults<select name="adults" value={adults} onChange={event => setAdults(event.target.value)}><option value="1">1 adult</option><option value="2">2 adults</option><option value="3" disabled={!extra}>3 adults — requires extra mattress</option></select></label><label>Children<select name="children"><option value="0">0 children</option><option value="1">1 child</option><option value="2">2 children</option></select></label></div><label className="checkbox-label booking-extra"><input type="checkbox" checked={extra} onChange={event => { setExtra(event.target.checked); if (!event.target.checked && adults === "3") setAdults("2"); }} /><span><strong>Add an extra mattress</strong><small>₹500 per night</small></span></label>{arrival && departure && nights === 0 && <p role="alert">Check-out must be after check-in.</p>}</section>
          <section className="booking-section" aria-labelledby="guest-heading"><div className="booking-section-heading"><div><h2 id="guest-heading">Guest details.</h2></div></div><div className="booking-fields"><label>Guest name<input required name="name" autoComplete="name" maxLength={120} placeholder="Your full name" /></label><label>Phone number<input required name="phone" type="tel" autoComplete="tel" pattern="[+0-9 ()-]{10,20}" maxLength={20} placeholder="Your contact number" /></label><label className="booking-wide">Email <span>(optional)</span><input name="email" type="email" autoComplete="email" placeholder="Your email address" /></label><label className="booking-wide">Special requests <span>(optional)</span><textarea name="requests" maxLength={1000} rows={3} placeholder="Anything we can help with?" /></label></div></section>
        </div>
        <aside className="booking-summary" aria-live="polite"><h2>Your stay.</h2><div className="booking-summary-lines"><div><span>Check-in</span><strong>{dateLabel(arrival)}</strong></div><div><span>Check-out</span><strong>{dateLabel(departure)}</strong></div><div><span>Room</span><strong>{roomType === "ac" ? "AC Room" : "Non-AC Room"}</strong></div><div><span>Nightly rate</span><strong>{rate === null ? "—" : money(rate)}</strong></div>{extra && <div><span>Extra mattress / night</span><strong>{money(500)}</strong></div>}</div><div className="booking-total"><span>Estimated total <small>{nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select your dates"}</small></span><strong>{rate === null ? "—" : money(total)}</strong></div><div className="booking-advance"><div><span>30% advance</span><strong>{rate === null ? "—" : money(total * .3)}</strong></div><div><span>Remaining balance</span><strong>{rate === null ? "—" : money(total * .7)}</strong></div></div><label className="checkbox-label booking-consent"><input required type="checkbox" /><span>I agree to the <a href="/policies">hotel policies</a>.</span></label><button className="button button-dark booking-submit" disabled={!nights || busy || rate === null} type="submit">{busy ? "Submitting request…" : "Submit booking request"}</button>{(error || rateError) && <p role="alert">{error || rateError}</p>}<p className="booking-summary-note">Payment alone does not confirm a reservation. Hotel verification is required.</p><a className="booking-help" href="tel:+919919022918">Questions? We’re here to help.</a></aside>
      </form>
    </main>
  </>;
}
