"use client";
import { useEffect, useRef, useState } from "react";

type Photo = { src: string; alt: string };
export default function GallerySlider({ photos }: { photos: Photo[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (selected !== null && el && !el.open) el.showModal();
    if (selected === null && el?.open) el.close();
  }, [selected]);
  const count = 5;
  const active = Math.round(progress * (count - 1));
  function update() {
    const el = track.current;
    if (el) setProgress(el.scrollWidth > el.clientWidth ? el.scrollLeft / (el.scrollWidth - el.clientWidth) : 0);
  }
  function navigate(index: number) {
    const el = track.current;
    if (el) el.scrollTo({ left: (el.scrollWidth - el.clientWidth) * index / (count - 1), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className="gallery-slider">
    <div className="gallery-scroll-note" aria-hidden="true"><span></span><span>SWIPE TO EXPLORE →</span></div>
    <div ref={track} onScroll={update} className="gallery-track" role="region" tabIndex={0} aria-label="Hotel photo gallery, scroll horizontally">
      {photos.map((photo, index) => <figure className="gallery-card" key={photo.src}><button type="button" className="gallery-photo-button" onClick={() => setSelected(index)} aria-label={`View larger: ${photo.alt}`}><img src={photo.src} alt={photo.alt} loading="lazy" /></button></figure>)}
    </div>
    <div className="gallery-dots" aria-label="Gallery navigation">{Array.from({length: count}, (_, index) => <button type="button" key={index} className={index === active ? "active" : ""} aria-label={`Go to gallery position ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => navigate(index)} />)}</div>
    <dialog ref={dialog} className="gallery-dialog" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => { if (selected === null) return; if (event.key === "ArrowLeft") setSelected((selected + photos.length - 1) % photos.length); if (event.key === "ArrowRight") setSelected((selected + 1) % photos.length); }}>
      {selected !== null && <div className="gallery-viewer"><button className="gallery-close" type="button" onClick={() => setSelected(null)} aria-label="Close image viewer">×</button><img src={photos[selected].src} alt={photos[selected].alt} /><div className="gallery-viewer-controls"><button type="button" onClick={() => setSelected((selected + photos.length - 1) % photos.length)} aria-label="Previous image">←</button><p>{photos[selected].alt}</p><button type="button" onClick={() => setSelected((selected + 1) % photos.length)} aria-label="Next image">→</button></div></div>}
    </dialog>
  </div>;
}
