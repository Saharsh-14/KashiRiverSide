import Link from "next/link";

export default function NotFound() {
  return <main className="not-found-page">
    <div className="not-found-frame">
      <img className="not-found-decoration not-found-diya" src="/assets/404-diya.png" alt="" aria-hidden="true" />
      <img className="not-found-decoration not-found-flowers" src="/assets/404-marigolds.png" alt="" aria-hidden="true" />
      <Link className="not-found-brand" href="/" aria-label="Kashi Riverside Stay home"><img src="/assets/krs-logo.png" alt="Kashi Riverside Stay" /></Link>
      <div className="not-found-content">
        <p className="not-found-kicker">A LITTLE DETOUR IN KASHI</p>
        <h1>Looks like you&apos;ve<br /><em>lost your way.</em></h1>
        <div className="not-found-number" aria-label="404 — page not found"><span>4</span><span className="not-found-zero" aria-hidden="true"><img src="/assets/404-jalebi.png" alt="" /></span><span>4</span></div>
        <p className="not-found-copy">This page may have wandered off, but a warm welcome is waiting for you at Kashi Riverside Stay.</p>
        <div className="not-found-actions"><Link href="/" className="not-found-primary">FIND YOUR WAY HOME <span aria-hidden="true">↗</span></Link><Link href="/booking" className="not-found-secondary">COME STAY WITH US <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="not-found-bottom"><span>SONARPURA · VARANASI</span><span>CULTURE IN EVERY STAY</span></div>
    </div>
  </main>;
}
