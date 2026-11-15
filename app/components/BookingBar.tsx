"use client";
import { useState } from "react";

export default function BookingBar() {
  const [arrival, setArrival] = useState("");
  return <form className="booking-bar" action="/booking" method="get" aria-label="Plan your stay">
    <div className="booking-bar-title"><span>YOUR STAY IN KASHI</span><strong>Make yourself at home.</strong></div>
    <label>Check-in<input required type="date" name="arrival" value={arrival} onChange={event => setArrival(event.target.value)} /></label>
    <label>Check-out<input required type="date" name="departure" min={arrival || undefined} /></label>
    <label>Room type<select name="room"><option value="ac">AC room</option><option value="non_ac">Non-AC room</option></select></label>
    <button className="button button-dark" type="submit">Plan your stay</button>
  </form>;
}
