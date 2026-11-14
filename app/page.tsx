import MobileMenu from "./components/MobileMenu";

const amenities = ["Air conditioning", "Wi-Fi", "Television", "Hot & cold water", "Room service", "Housekeeping", "24-hour reception", "Power backup"];

const services = [
  { number: "01", title: "Boat ride arrangements", copy: "Let us help you discover the river at its most beautiful." },
  { number: "02", title: "Ticket booking assistance", copy: "A little help planning the journey beyond your stay." },
  { number: "03", title: "Car rental assistance", copy: "Comfortable local travel, arranged around your plans." },
  { number: "04", title: "Scooty rental assistance", copy: "Explore Varanasi at your own pace, on request." },
  { number: "05", title: "Local shopping assistance", copy: "Find special local pieces, including sarees and more." },
  { number: "06", title: "Parking & extra bedding", copy: "Helpful comforts available whenever you need them." },
];

export default function Home() {
  return (
    <main>
      <section className="hero" aria-label="Kashi Riverside Stay introduction">
        <div className="hero-wash" aria-label="Hero video placeholder" />
        <div className="hero-wash" />
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Kashi Riverside Stay home">
            <img src="/assets/krs-logo.png" alt="Kashi Riverside Stay logo" />
          </a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#rooms">Rooms</a>
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="button button-light header-book" href="/booking">Book a Room</a>
          <MobileMenu />
        </header>
        <div className="hero-content" id="top">
          <p className="eyebrow">Kashi Riverside Stay · Sonarpura, Varanasi</p>
          <h1>Culture in<br />Every Stay</h1>
          <a className="button button-light" href="/booking">Book a Room <span>↗</span></a>
        </div>
        <div className="hero-scroll">Scroll to explore <span>↓</span></div>
      </section>

      <section className="amenity-marquee" aria-label="Hotel amenities">
        <div className="marquee-track">
          {[...amenities, ...amenities].map((item, index) => <span key={`${item}-${index}`}><i>✦</i>{item}</span>)}
        </div>
      </section>

      <section className="intro section-shell">
        <div className="section-kicker">A stay with soul</div>
        <div className="intro-grid">
          <h2>Rooted in Kashi.<br /><em>Made for comfort.</em></h2>
          <div className="intro-copy"><p>Welcome to a warm stay in the heart of Sonarpura, where the spirit of Varanasi meets the ease of thoughtful hospitality.</p><a className="text-link" href="#rooms">Discover our rooms <span>↗</span></a></div>
        </div>
      </section>

      <section className="rooms section-shell" id="rooms">
        <div className="section-heading"><div><div className="section-kicker">Stay your way</div><h2>Rooms for <em>slow mornings</em></h2></div><a className="text-link" href="/booking">View availability <span>↗</span></a></div>
        <div className="room-grid">
          <article className="room-card room-card-dark"><div className="room-number">01 / 02</div><div className="room-art room-art-ac"><img src="/assets/room-3.jpg" alt="AC room with purple bedding" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div><div className="room-info"><div><p className="card-label">The comfort stay</p><h3>AC Room</h3></div><strong>₹2,000 <small>/ night</small></strong></div><p className="room-note">A cool, restful room for a comfortable Varanasi stay.</p><a className="card-link" href="/booking">Book this room <span>↗</span></a></article>
          <article className="room-card room-card-cream"><div className="room-number">02 / 02</div><div className="room-art room-art-nonac"><img src="/assets/non-ac-room.jpg" alt="Non-AC room with blue bedding" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div><div className="room-info"><div><p className="card-label">The easy stay</p><h3>Non-AC Room</h3></div><strong>₹1,500 <small>/ night</small></strong></div><p className="room-note">A simple, welcoming room for an unhurried stay in Kashi.</p><a className="card-link" href="/booking">Book this room <span>↗</span></a></article>
        </div>
      </section>

      <section className="services section-shell" id="services">
        <div className="section-kicker">More than a room</div><h2>Little helps for<br /><em>your Kashi story.</em></h2>
        <div className="service-list">{services.map((service) => <article className="service-card" key={service.number}><span>{service.number}</span><div><h3>{service.title}</h3><p>{service.copy}</p></div><b>↗</b></article>)}</div>
      </section>

      <section className="section-shell" id="gallery"><div className="section-kicker">A closer look</div><h2>Our gallery</h2><p>Hotel and room photographs will be added soon.</p></section>
      <section className="section-shell" id="policies"><h2>Policies</h2><p>Check-in: 1 PM. Check-out: 11 AM. A 30% advance and hotel verification are required for confirmation. The remaining balance is payable at the hotel.</p><p>Cancellation at least 7 days before check-in: full advance refund. Cancellation 3–6 days before check-in: 50% advance refund. Less than 3 days or a no-show: advance is non-refundable. Hotel cancellation of a confirmed booking: full advance refund.</p><p>One date change may be requested, subject to availability. Refund processing may take 5–7 working days. Rates may change seasonally; existing booking prices are preserved. Extra bedding and arranged services are subject to availability and additional charges.</p></section>
      <a className="button button-dark floating-book" id="booking" href="/booking">Book a Room ↗</a>

      <footer className="site-footer" id="contact"><div className="footer-brand"><img src="/assets/krs-logo.png" alt="Kashi Riverside Stay logo" /><p>Culture in Every Stay</p></div><div className="footer-column"><p className="footer-label">Explore</p><a href="#rooms">Rooms</a><a href="#services">Services</a><a href="#gallery">Gallery</a></div><div className="footer-column"><p className="footer-label">Find us</p><p>Sonarpura,<br />Varanasi</p><a href="tel:+919919022918">+91 9919022918</a><a href="https://wa.me/919919022918">WhatsApp first number ↗</a><a href="tel:+918953123960">+91 8953123960</a><a href="https://wa.me/918953123960">WhatsApp second number ↗</a><a href="https://maps.app.goo.gl/F5uyP1XsW1DTfJkBA?g_st=ic">Get directions ↗</a></div><div className="footer-map" aria-label="Map placeholder">Kashi<br /><span>Sonarpura</span></div><div className="footer-bottom"><span>© 2026 Kashi Riverside Stay</span><a href="#policies">Policies</a><span>Made with care in Kashi</span></div></footer>
    </main>
  );
}
