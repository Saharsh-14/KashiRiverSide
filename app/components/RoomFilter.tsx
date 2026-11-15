"use client";
import { useState } from "react";
export default function RoomFilter() {
 const [selected,setSelected]=useState("all");
 function select(value:string){setSelected(value);document.querySelectorAll<HTMLElement>(".accommodation-card").forEach(card=>{card.hidden=value!=="all"&&card.dataset.room!==value;});}
 return <div className="room-filter" role="group" aria-label="Filter room types">{[["all","All rooms"],["ac","AC rooms"],["non_ac","Non-AC room"]].map(([value,label])=><button key={value} type="button" aria-pressed={selected===value} onClick={()=>select(value)}>{label}</button>)}</div>;
}
