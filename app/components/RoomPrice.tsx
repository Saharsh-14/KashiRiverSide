"use client";
import { useEffect, useState } from "react";
export default function RoomPrice({ room }: { room: string }) {
 const [price, setPrice] = useState<number | null>(null);
 useEffect(() => { const controller = new AbortController(); fetch("/api/rooms", { cache: "no-store", signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => { const found = d.rooms.find((item: { code: string }) => item.code === room); if (found) setPrice(found.nightly_rate); }).catch(() => {}); return () => controller.abort(); }, [room]);
 return <strong>{price === null ? "Contact us for rates" : `₹${(price / 100).toLocaleString("en-IN")}`}<small>{price === null ? "" : " / night"}</small></strong>;
}
