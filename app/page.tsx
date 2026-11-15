import MobileMenu from "./components/MobileMenu";
import BookingBar from "./components/BookingBar";
import GallerySlider from "./components/GallerySlider";
import HomeMotion from "./components/HomeMotion";
import RoomFilter from "./components/RoomFilter";
import FloatingBooking from "./components/FloatingBooking";

const amenities = ["Air conditioning", "Wi-Fi", "Television", "Hot & cold water", "Room service", "Housekeeping", "24-hour reception", "Power backup"];
const amenityIcons = [
  <><path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3"/></>,
  <><path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/></>,
  <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  <><path d="M12 3c-2 3-6 7-6 11a6 6 0 0 0 12 0c0-4-4-8-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
  <><path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 7V5M2 20h20"/></>,
  <><path d="m4 20 9-9M12 6l6 6M14 4l6 6-2 2-6-6ZM3 21l3-1-2-2-1 3ZM18 16v4M16 18h4"/></>,
  <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M3 4 1 6M21 4l2 2"/></>,
  <><path d="M13 2 5 13h6l-1 9 9-12h-6l1-8Z"/></>,
];

const services = [
  { number: "01", title: "Boat ride arrangements", copy: "Let us help you discover the river at its most beautiful." },
  { number: "02", title: "Train ticket booking assistance", copy: "A little help arranging train tickets for your journey." },
  { number: "03", title: "Intercity taxi services", copy: "Taxi arrangements for comfortable journeys between cities." },
  { number: "04", title: "Scooty rental assistance", copy: "Explore Varanasi at your own pace, on request." },
  { number: "05", title: "Local shopping assistance", copy: "Find special local pieces, including sarees and more." },
  { number: "06", title: "Parking assistance", copy: "Contact us for help arranging parking during your stay." },
];

const gallery = [
  { src: "/assets/room-1.jpg", alt: "Guest room at Kashi Riverside Stay" },
  { src: "/assets/room-2.jpg", alt: "Reception at Kashi Riverside Stay" },
  { src: "/assets/room-3.jpg", alt: "AC guest room with purple bedding" },
  { src: "/assets/room-4.jpg", alt: "Guest room interior at Kashi Riverside Stay" },
  { src: "/assets/room-5.jpg", alt: "Guest room and furnishings at Kashi Riverside Stay" },
  { src: "/assets/room-6.jpg", alt: "Guest accommodation at Kashi Riverside Stay" },
  { src: "/assets/room-7.jpg", alt: "Hotel room interior in Sonarpura" },
  { src: "/assets/room-8.jpg", alt: "Comfortable guest room in Varanasi" },
  { src: "/assets/room-9.jpg", alt: "Guest bathroom at Kashi Riverside Stay" },
  { src: "/assets/room-10.jpg", alt: "Hotel interior at Kashi Riverside Stay" },
  { src: "/assets/gallery-11.jpg", alt: "Reception desk at Kashi Riverside Stay" },
  { src: "/assets/gallery-12.jpg", alt: "Guest-floor corridor and staircase" },
  { src: "/assets/gallery-13.jpg", alt: "Hotel corridor with Varanasi wall artwork" },
  { src: "/assets/gallery-14.jpg", alt: "Second-floor guest corridor" },
  { src: "/assets/gallery-15.jpg", alt: "Guest room entrance beside the staircase" },
  { src: "/assets/gallery-16.jpg", alt: "Third-floor guest corridor and staircase" },
  { src: "/assets/gallery-17.jpg", alt: "Guest corridor with Assi Ghat artwork" },
  { src: "/assets/gallery-18.jpg", alt: "Granite hotel staircase with safety railing" },
  { src: "/assets/gallery-19.jpg", alt: "Guest corridor with Ganga Aarti artwork" },
  { src: "/assets/gallery-20.jpg", alt: "Hotel corridor with Sanchi Stupa artwork" },
  { src: "/assets/gallery-21.jpg", alt: "Illuminated reception desk" },
  { src: "/assets/gallery-22.jpg", alt: "Interior staircase and hotel entrance" },
  { src: "/assets/gallery-23.jpg", alt: "Reception and adjoining hotel corridor" },
];

export default function Home() {
  return (
    <main>
      <div className="intro-curtain" aria-hidden="true"><div className="intro-curtain-half intro-curtain-top"><span>KASHI</span></div><div className="intro-curtain-half intro-curtain-bottom"><span>RIVERSIDE</span></div></div>
      <HomeMotion />
      <section className="hero" aria-label="Kashi Riverside Stay introduction">
        <img className="hero-photo" src="/assets/gallery-21.jpg" alt="" />
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
          <h1>Culture in<br />Every Stay</h1>
        </div>
        <div className="hero-booking"><BookingBar /></div>
      </section>

      <section className="amenity-marquee" aria-label="Hotel amenities">
        <div className="marquee-track">
          {[...amenities, ...amenities].map((item, index) => <span key={`${item}-${index}`} aria-hidden={index >= amenities.length ? true : undefined}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{amenityIcons[index % amenities.length]}</svg>{item}</span>)}
        </div>
      </section>

      <section className="about-editorial" id="our-story" aria-labelledby="story-heading">
        <div className="about-editorial-inner"><h2 id="story-heading">ABOUT</h2><p className="about-editorial-intro">IN THE HEART OF KASHI, KASHI RIVERSIDE STAY OFFERS A WARM WELCOME AND COMFORTABLE ROOMS FOR YOUR TIME IN VARANASI. WHETHER YOU ARE HERE FOR A PILGRIMAGE, A FAMILY VISIT, OR TO EXPLORE, OUR TEAM IS HERE TO HELP YOU FEEL AT HOME.</p>
          <div className="about-editorial-grid"><div className="about-fact about-fact-first"><p>Air-conditioned rooms for a comfortable stay.</p><strong>7</strong></div><div className="about-fact about-fact-second"><p>Non-AC room for a simple, relaxed stay.</p><strong>1</strong></div><div className="about-fact about-fact-third"><p>Reception available to welcome and assist guests.</p><strong>24<small> HRS</small></strong></div><div className="about-contact"><p>For questions about your stay, our team is here to help.</p><a href="#contact">CONTACT US ↗</a><img src="/assets/gallery-21.jpg" alt="Reception at Kashi Riverside Stay" loading="lazy" /></div></div>
        </div>
      </section>

      <section className="rooms section-shell" id="rooms">
        <div className="intro-grid rooms-intro">
          <h2>Rooted in Kashi.<br /><em>Made for comfort.</em></h2>
          <div className="intro-copy"><p>Choose a comfortable AC or non-AC room for your stay in the heart of Sonarpura, Varanasi.</p><a className="button button-dark rooms-availability" href="/booking">View availability</a></div>
        </div>
        <RoomFilter />
        <div className="room-grid accommodation-list">
          {[
            { type: "AC Room", key: "ac", image: "/assets/room-3.jpg", alt: "AC room with purple bedding", label: "THE COMFORT STAY", description: "A cool, restful room for a comfortable Varanasi stay.", price: "2,000", cooling: "Air conditioning" },
            { type: "Non-AC Room", key: "non_ac", image: "/assets/non-ac-room.jpg", alt: "Non-AC room with blue bedding", label: "THE EASY STAY", description: "A simple, welcoming room for an unhurried stay in Kashi.", price: "1,500", cooling: "Fan" },
          ].map(room => <article className="accommodation-card" data-room={room.key} key={room.key}>
            <img className="accommodation-image" src={room.image} alt={room.alt} loading="lazy" />
            <div className="accommodation-intro"><p className="card-label">{room.label}</p><h3>{room.type}</h3><p>{room.description}</p></div>
            <div className="accommodation-details"><strong>₹{room.price}<small> / night</small></strong><p>Room details</p><dl><div><dt>Comfort</dt><dd>{room.cooling}</dd></div><div><dt>Connectivity</dt><dd>Wi-Fi</dd></div><div><dt>Water</dt><dd>Hot &amp; cold</dd></div><div><dt>Guests</dt><dd>2 adults + 2 children</dd></div></dl></div>
            <div className="accommodation-action"><div><strong>✧ &nbsp;Housekeeping</strong><p>Care and comfort throughout your stay.</p></div><div><strong>♧ &nbsp;Amenities</strong><p>Wi-Fi, television, and room service.</p></div><a className="button button-dark" href={`/booking?room=${room.key}`}>Book this room</a></div>
          </article>)}
        </div>
      </section>

      <section className="services section-shell" id="services">
        <div className="service-accordion-heading"><div className="section-kicker">More than a room</div><h2>Little helps for <em>your Kashi story.</em></h2><p>Services are available on request and may involve additional charges.</p></div>
        <div className="service-accordion">{services.map((service, index) => <article className="service-panel" key={service.number} tabIndex={0}>
          <img src={["/assets/boat-ride.png", "/assets/train-ticket.png", "/assets/intercity-taxi.png", "/assets/scooty-rental.png", "/assets/local-shopping.png", "/assets/parking-assistance.png"][index]} alt="" loading="lazy" />
          <div className="service-panel-shade" />
          <h3 className="service-panel-label">{service.title}</h3>
          <div className="service-panel-content"><p>{service.copy}</p><a href="https://wa.me/919919022918">Enquire on WhatsApp <span aria-hidden="true">↗</span></a></div>
        </article>)}</div>
      </section>

      <section className="section-shell gallery" id="gallery">
        <div className="gallery-heading"><div><h2>A closer look<br /><em>at your stay.</em></h2></div><p>Thoughtful spaces, quiet details, and a warm welcome in the heart of Kashi.</p></div>
        <div className="gallery-layout"><div className="gallery-mosaic" aria-label="A glimpse of the hotel"><img src="/assets/gallery-21.jpg" alt="Reception at Kashi Riverside Stay" loading="lazy"/><img src="/assets/gallery-19.jpg" alt="Hotel corridor with Ganga Aarti artwork" loading="lazy"/><img src="/assets/room-3.jpg" alt="A guest room at Kashi Riverside Stay" loading="lazy"/></div><GallerySlider photos={gallery}/></div>
      </section>
      <section className="policy-editorial section-shell" id="policies" aria-labelledby="policy-heading">
        <div className="policy-editorial-intro"><p className="section-kicker">Kashi Riverside Stay</p><h2 id="policy-heading">Hotel policies<br /><em>&amp; guest information.</em></h2><p>Please review the following booking and stay policies before making your reservation.</p><img src="/assets/gallery-21.jpg" alt="Reception at Kashi Riverside Stay" loading="lazy" /></div>
        <div className="policy-editorial-grid">
          <div className="policy-stat"><p>Check-in<br />from</p><strong>1 <small>PM</small></strong></div>
          <div className="policy-stat"><p>Check-out<br />by</p><strong>11 <small>AM</small></strong></div>
          <div className="policy-stat"><p>Advance payment required. Reservations are confirmed only after hotel verification.</p><strong>30<small>%</small></strong></div>
          <div className="policy-dark"><p>Please review the complete cancellation, refund, and date-change policies before booking.</p><a href="/policies">Read all policies <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
      <FloatingBooking />

      <footer className="hotel-footer" id="contact">
        <div className="hotel-footer-panel">
          <div className="hotel-footer-brand"><p>STAY IN THE HEART OF KASHI</p><h2>Kashi<br /><em>Riverside Stay</em></h2><span>Culture in Every Stay</span><div className="footer-socials" aria-label="Contact options"><a href="tel:+919919022918" aria-label="Call the hotel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 3h3l2 5-2 2c1 3 3 5 6 6l2-2 5 2v3c0 1-1 2-2 2C10 20 4 14 3 5c0-1 1-2 2-2Z"/></svg></a><a href="https://wa.me/919919022918" aria-label="Contact the hotel on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.94 9.94 0 0 0-8.6 14.94L2 22l5.19-1.36A9.96 9.96 0 1 0 12.04 2Zm0 18.08a8.13 8.13 0 0 1-4.15-1.14l-.3-.18-3.08.81.82-3-.2-.31A8.15 8.15 0 1 1 12.04 20.08Zm4.47-6.1c-.24-.12-1.44-.71-1.66-.8-.22-.07-.38-.11-.54.13-.16.24-.62.8-.76.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.44-1.36-1.68-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62 1.52.66 2.11.71 2.87.6.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg></a><a href="mailto:kashiriverside@gmail.com" aria-label="Email the hotel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></a><a href="https://www.instagram.com/kashiriverside/" target="_blank" rel="noreferrer" aria-label="Visit Kashi Riverside Stay on Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg></a></div></div>
          <div className="hotel-footer-nav"><h3>Explore</h3><a href="#rooms">Rooms</a><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="/booking">Book a room</a><a href="/policies">Policies</a></div>
          <div className="hotel-footer-contact"><h3>Visit us</h3><p>Sonarpura, Varanasi</p><a href="tel:+919919022918">+91 99190 22918</a><a href="tel:+918953123960">+91 89531 23960</a><a href="tel:+919559522633">+91 95595 22633</a></div>
          <a className="footer-yatra" href="https://thekashiyatra.in/" target="_blank" rel="noopener noreferrer"><span>EXPLORE VARANASI</span><strong>KashiYatra</strong><p>Discover the culture, places and timeless spirit of Kashi.</p><span className="footer-yatra-button">Explore KashiYatra</span></a>
          <div className="hotel-footer-map"><iframe title="Map showing Kashi Riverside Stay in Varanasi" src="https://maps.google.com/maps?q=Kashi%20Riverside%20Stay%2C%20Harishchandra%20Ghat%20Road%2C%20Varanasi&z=16&output=embed" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><a className="hotel-footer-map-link" href="https://maps.app.goo.gl/F5uyP1XsW1DTfJkBA?g_st=ic" target="_blank" rel="noreferrer">Open exact location in Google Maps ↗</a></div>
        </div>
        <div className="hotel-footer-strip"><span>THE DETAILS OF YOUR STAY</span><div className="footer-marquee" aria-hidden="true"><div className="footer-marquee-track">{[0, 1].map(copy => <div className="footer-marquee-group" key={copy}>{Array.from({length:10}, (_, index) => <img key={index} src={`/assets/footer-kashi-${index + 1}.png`} alt="" loading="lazy" />)}</div>)}</div></div></div>
        <div className="hotel-footer-bottom"><span>© 2026 KASHI RIVERSIDE STAY</span><span>POWERED BY <a className="footer-credit-link" href="https://www.linkedin.com/in/saharsh-jaiswal-vns/" target="_blank" rel="noopener noreferrer">SAHARSH JAISWAL</a></span><span>MADE WITH CARE IN KASHI</span></div>
      </footer>
    </main>
  );
}
