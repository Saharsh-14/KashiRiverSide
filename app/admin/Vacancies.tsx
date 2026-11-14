"use client";
import {useState} from 'react';
type Day={date:string;room:string;total:number;limit:number;confirmed:number;vacant:number};
export default function Vacancies(){
 const [days,setDays]=useState<Day[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <section className="admin-booking"><h2>Vacancies by date</h2><form onSubmit={async e=>{e.preventDefault();const date=new FormData(e.currentTarget).get('date');setBusy(true);setError('');try{const r=await fetch('/api/admin/availability?date='+date);const d=await r.json();if(!r.ok)throw new Error(d.error);setDays(d);}catch(e){setError(e instanceof Error?e.message:'Unable to load');}finally{setBusy(false);}}}><label>Stay date<input required name="date" type="date"/></label><button disabled={busy}>Check vacancies</button></form><p>The online limit includes confirmed bookings. Vacant rooms = online limit minus confirmed bookings. Other rooms may be held for offline guests.</p>{days.map(d=><article key={d.room}><h3>{d.room==='ac'?'AC':'Non-AC'} — {d.date}</h3><p>Total rooms: {d.total} · Online limit: {d.limit} · Confirmed: {d.confirmed} · Vacant: {d.vacant}</p>{d.confirmed>d.limit&&<p>Existing confirmations exceed the new limit. No further confirmations are available.</p>}</article>)}{error&&<p role="alert">{error}</p>}</section>;
}
