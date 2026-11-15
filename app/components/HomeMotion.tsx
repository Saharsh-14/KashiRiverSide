"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomeMotion() {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      hero.set(".intro-curtain", { visibility: "visible" })
        .from(".intro-curtain-half span", { opacity: 0, duration: .4 }, 0)
        .to(".intro-curtain-top", { yPercent: -100, duration: 1.25, ease: "power3.inOut" }, .55)
        .to(".intro-curtain-bottom", { yPercent: 100, duration: 1.25, ease: "power3.inOut" }, .55)
        .set(".intro-curtain", { display: "none" }, 1.8)
        .from(".hero-photo", { scale: 1.08, duration: 1.8, ease: "power2.out" }, .5)
        .from(".site-header", { opacity: 0, y: -12, duration: .65 }, 1.1)
        .from(".hero-content h1", { opacity: 0, yPercent: 18, duration: 1 }, 1.15)
        .from(".hero-booking", { opacity: 0, y: 18, duration: .7 }, 1.45);
      document.querySelectorAll<HTMLElement>(".about-editorial-inner, .rooms-intro, .service-accordion-heading, .gallery-heading, .policy-editorial-intro").forEach(element => {
        gsap.from(element, { opacity: 0, y: 32, duration: .9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
      });
      document.querySelectorAll<HTMLElement>(".accommodation-card").forEach((card, index) => {
        const image = card.querySelector(".accommodation-image"), content = card.querySelectorAll(".accommodation-intro, .accommodation-details, .accommodation-action");
        const direction = index % 2 ? 1 : -1;
        const reveal = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 82%", once: true }, defaults: { ease: "power3.out" } });
        if (image) reveal.from(image, { opacity: 0, x: direction * 42, duration: 1 });
        reveal.from(content, { opacity: 0, x: direction * -22, duration: .75, stagger: .06 }, .16);
      });
      document.querySelectorAll<HTMLElement>(".service-accordion, .gallery-layout, .policy-editorial-grid, .hotel-footer-panel").forEach(element => {
        gsap.from(element, { opacity: 0, y: 24, duration: .85, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
      });
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 801px) and (hover: hover) and (pointer: fine)", () => {
        const lenis = new Lenis({ lerp: .1, smoothWheel: true, anchors: true, prevent: node => node.closest(".gallery-track, dialog") !== null });
        const tick = (time: number) => lenis.raf(time * 1000);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        return () => { gsap.ticker.remove(tick); lenis.destroy(); };
      });
      let alive = true;
      document.fonts?.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => { alive = false; desktop.revert(); };
    });
    return () => media.revert();
  });
  return null;
}
