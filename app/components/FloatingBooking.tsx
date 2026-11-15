"use client";
import { useEffect, useState } from "react";

export default function FloatingBooking() {
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.getElementById("contact");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return <a className={`button button-dark floating-book${footerVisible ? " floating-book-hidden" : ""}`} id="booking" href="/booking" aria-hidden={footerVisible} tabIndex={footerVisible ? -1 : undefined}>Book a Room</a>;
}
