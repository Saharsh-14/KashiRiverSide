"use client";
import { useEffect, useRef, useState } from "react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function close(event: PointerEvent) { if (!ref.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); ref.current?.querySelector("button")?.focus(); } }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="mobile-navigation" ref={ref}>
    <button className="mobile-toggle" aria-expanded={open} aria-controls="mobile-links" onClick={() => setOpen(!open)}>{open ? "Close ×" : "Menu ☰"}</button>
    {open && <nav id="mobile-links" aria-label="Mobile navigation" onClick={() => setOpen(false)}>
      <a href="#rooms">Rooms</a><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a><a href="/booking">Book a Room</a>
    </nav>}
  </div>;
}
