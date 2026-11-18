"use client";
import { useCallback, useEffect, useState } from "react";

type Room = { number: number; bookings: { id: string; check_in: string; check_out: string }[]; blocks: { stay_date: string }[]; blockRange: { start_date: string; end_date: string } | null };
type Group = { room: string; summary: { vacant: number; total: number }; rooms: Room[] };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const nextDay = (date: string) => new Date(Date.parse(date) + 86400000).toISOString().slice(0, 10);
const displayDate = (date: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date + "T00:00:00Z"));

export default function Vacancies() {
 const [date, setDate] = useState(today), [end, setEnd] = useState(() => nextDay(today()));
 const [groups, setGroups] = useState<Group[]>([]), [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
 const load = useCallback(async () => {
  const response = await fetch("/api/admin/availability?date=" + date, { cache: "no-store" });
  const body = await response.json(); if (!response.ok) throw new Error(body.error);
  setGroups(body);
 }, [date]);
 useEffect(() => { let active = true; setGroups([]); setError(""); load().catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [load]);
 async function toggle(roomType: string, room: Room) {
  const booking = room.bookings[0];
  if (booking && !window.confirm(`Release this confirmed room? This cancels the entire booking from ${displayDate(booking.check_in)} to ${displayDate(booking.check_out)} and makes the room available again. The payment record is kept. No cancellation email is sent; contact the guest separately.`)) return;
  setBusy(true); setError(""); setNotice("");
  try {
   const blocked = room.blocks.length === 0;
   const payload = booking ? { action: "release_confirmed_room", id: booking.id } : { action: "room_block", roomType, roomNumber: room.number, startDate: date, endDate: end, blocked };
   const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
   const body = await response.json(); if (!response.ok) throw new Error(body.error);
   await load(); setNotice(booking ? "Booking cancelled and room released. The payment record is retained; contact the guest separately." : blocked ? "Room marked unavailable for the selected dates." : "Manual block removed for the selected dates.");
  } catch (e) { setError(e instanceof Error ? e.message : "Unable to update the room"); } finally { setBusy(false); }
 }
 return <section className="admin-panel admin-room-calendar"><div className="admin-panel-heading"><div><h2>Room availability</h2><p>Select a stay date, then click a room to block or unblock it.</p></div></div>
  <div className="admin-calendar-dates"><label>Check-in / stay date<input type="date" value={date} onChange={e => { const value=e.target.value; if(value) {setDate(value); setEnd(nextDay(value));} }} /></label><label>Check-out<input type="date" min={nextDay(date)} value={end} onChange={e => setEnd(e.target.value)} /></label></div>
  <p className="admin-calendar-help">The check-out date is not occupied. Manual changes apply from check-in up to check-out. Click a confirmed room to release its whole booking.</p>
  {groups.map(group => <div key={group.room} className="admin-calendar-group"><div className="admin-calendar-heading"><h3>{group.room === "ac" ? "AC rooms" : "Non-AC room"}</h3><span>{group.summary.vacant} of {group.summary.total} available on {date}</span></div><div className="admin-room-grid">{group.rooms.map(room => {
   const booked = room.bookings.length > 0, blocked = room.blocks.length > 0;
   const status = booked ? "Confirmed booking" : blocked ? "Blocked" : "Available";
   const range = booked ? {start: room.bookings[0].check_in, end: room.bookings[0].check_out} : room.blockRange ? {start: room.blockRange.start_date, end: room.blockRange.end_date} : null;
   const dates = range ? `${displayDate(range.start)} – ${displayDate(range.end)} checkout` : "";
   return <button key={room.number} type="button" className={`admin-room-box ${booked || blocked ? "is-occupied" : "is-available"}`} disabled={busy || (!booked && (!end || end <= date))} aria-label={`${group.room === "ac" ? "AC" : "Non-AC"} room ${room.number}, ${status}${dates ? `, ${dates}` : ""}`} onClick={() => void toggle(group.room,room)}><strong>{group.room === "ac" ? "AC" : "Non-AC"} {room.number}</strong><span>{status}</span>{dates && <small>{dates}</small>}</button>;
  })}</div></div>)}
  <p className="admin-calendar-help">Green = available · Red = blocked or confirmed. Select the first night to see its status; use check-out to update multiple nights.</p>
  {error && <p className="admin-alert" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
 </section>;
}
