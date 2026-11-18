import RoomPrice from "./components/RoomPrice";
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
          <div className="about-editorial-grid"><div className="about-fact about-fact-first"><p>Happy customers welcomed to Kashi Riverside Stay.</p><strong>100+</strong></div><div className="about-fact about-fact-second"><p>Star rating on Google.<span className="about-rating-stars" aria-hidden="true">★★★★★</span></p><strong>5.0</strong></div><div className="about-fact about-fact-third"><p>Reception available to welcome and assist guests.</p><strong>24<small> HRS</small></strong></div><div className="about-contact"><p>For questions about your stay, our team is here to help.</p><a href="#contact">CONTACT US ↗</a><img src="/assets/gallery-21.jpg" alt="Reception at Kashi Riverside Stay" loading="lazy" /></div></div>
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
            { type: "AC Room", key: "ac", image: "/assets/room-3.jpg", alt: "AC room with purple bedding", label: "THE COMFORT STAY", description: "A cool, restful room for a comfortable Varanasi stay.", cooling: "Air conditioning" },
            { type: "Non-AC Room", key: "non_ac", image: "/assets/non-ac-room.jpg", alt: "Non-AC room with blue bedding", label: "THE EASY STAY", description: "A simple, welcoming room for an unhurried stay in Kashi.", cooling: "Fan" },
          ].map(room => <article className="accommodation-card" data-room={room.key} key={room.key}>
            <img className="accommodation-image" src={room.image} alt={room.alt} loading="lazy" />
            <div className="accommodation-intro"><p className="card-label">{room.label}</p><h3>{room.type}</h3><p>{room.description}</p></div>
            <div className="accommodation-details"><RoomPrice room={room.key} /><p>Room details</p><dl><div><dt>Comfort</dt><dd>{room.cooling}</dd></div><div><dt>Connectivity</dt><dd>Wi-Fi</dd></div><div><dt>Water</dt><dd>Hot &amp; cold</dd></div><div><dt>Guests</dt><dd>2 adults + 2 children</dd></div></dl></div>
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
        <div className="policy-editorial-intro"><p className="section-kicker">Kashi Riverside Stay</p><h2 id="policy-heading">Hotel policies<br /><em>&amp; guest information.</em></h2><p>Please review the following booking and stay policies before making your reservation.</p><img src="/assets/policy-reception.png" alt="A warm welcome at the Kashi Riverside Stay reception" loading="lazy" /></div>
        <div className="policy-editorial-grid">
          <div className="policy-stat"><p>Check-in<br />from</p><strong>1 <small>PM</small></strong></div>
          <div className="policy-stat"><p>Check-out<br />by</p><strong>11 <small>AM</small></strong></div>
          <div className="policy-stat"><p>Advance payment required. Reservations are confirmed only after hotel verification.</p><strong>30<small>%</small></strong></div>
          <div className="policy-dark"><p>Please review the complete cancellation, refund, and date-change policies before booking.</p><a href="/policies">Read all policies <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
      <FloatingBooking />

    </main>
  );
}
