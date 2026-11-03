import { Link } from "react-router";
import "./Home.css";


import moonlitVigil from "../../assets/moonlit-vigil.jpg";
import portraitImg from "../../assets/portrait.jpg";
import fullBodyImg from "../../assets/full-body.jpg";
import sceneImg from "../../assets/scene.jpg";
import artistImg from "../../assets/artist.jpg";

const services = [
  {
    title: "Portrait",
    text: "A painted bust or headshot with soft lighting, expressive detail, and a simple atmospheric background.",
    price: "from $120",
    img: portraitImg,
  },
  {
    title: "Full Body",
    text: "Your character head to toe, with costume detail, pose of your choosing, and a mood-matched backdrop.",
    price: "from $240",
    img: fullBodyImg,
  },
  {
    title: "Illustrated Scene",
    text: "A complete narrative piece with environment, lighting, and up to two characters telling a story.",
    price: "from $420",
    img: sceneImg,
  },
];

const contacts = [
  { label: "Email", value: "hello@luminium.art", href: "mailto:hello@luminium.art" },
  { label: "Instagram", value: "@lumini.um", href: "https://instagram.com" },
  { label: "X / Twitter", value: "@lumini.um", href: "https://x.com" },
  { label: "ArtStation", value: "lumini.um", href: "https://artstation.com" },
];

export default function Home() {
  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <span className="badge">
            <span className="badge-dot" />
            Commissions open · 3 slots left
          </span>

          <h1 className="hero-title">
            Paintings of <em>longing</em>
            <br />&amp; velvet light
          </h1>

          <p className="hero-sub">
            I&apos;m Lumi, a digital painter crafting romantic, smoke-soft
            portraits steeped in rose, wine and violet.
          </p>

          <div className="hero-actions">
            <Link to="/gallery" className="btn btn-dark">
              View Gallery
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link to="/commission-request" className="btn btn-pink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.9 4.5 11 8l3.5 1.1L11 10.2 9.9 13.7 8.8 10.2 5.3 9.1 8.8 8z" />
                <path d="M17 13l.7 2.3L20 16l-2.3.7L17 19l-.7-2.3L14 16l2.3-.7z" />
              </svg>
              Request a Commission
            </Link>
          </div>
          </div> 

        <figure className="hero-featured">
          <img src={moonlitVigil} alt="Moonlit Vigil" />
          <figcaption>
            <span className="feat-label">Featured work</span>
            <span className="feat-title">Moonlit Vigil</span>
          </figcaption>
        </figure>
      </section>

            {/* AVAILABILITY */}
      <section className="availability">
        <div className="availability-text">
          <span className="eyebrow">Live availability</span>
          <h2>3 commission slots open this month</h2>
          <p>
            Currently accepting portraits and full-body pieces. Scene
            illustrations reopen in December.
          </p>
        </div>

        <div className="availability-side">
          <div className="slot-dots">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={i >= 2 ? "dot dot-on" : "dot"} />
            ))}
          </div>
          <span className="availability-date">Updated November 2026</span>
          <Link to="/commission-request" className="availability-link">
            Claim a slot
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      
      <section className="offer">
        <div className="section-head">
          <span className="eyebrow">What I offer</span>
          <h2>
            Commission <em>types</em>
          </h2>
          <p>
            Every piece is painted by hand in my signature style, with sketches
            shared along the way so it feels truly yours.
          </p>
        </div>

        <div className="services">
          {services.map((s) => (
            <Link to="/commissions" className="card" key={s.title}>
              <div className="card-img">
                <img src={s.img} alt={s.title} />
              </div>
              <div className="card-body">
                <div className="card-head">
                  <h3>{s.title}</h3>
                  <span className="card-price">{s.price}</span>
                </div>
                <p>{s.text}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/commissions" className="offer-link">
          Full pricing, terms &amp; process <span>↗</span>
        </Link>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-avatar">
          <img src={artistImg} alt="Seraphine, the artist" />
        </div>

        <div className="about-text">
          <span className="eyebrow">About me</span>
          <h2>
            Hello, I&apos;m <em>Luminium</em>
          </h2>
          <p>
            I&apos;m a digital painter who has spent the last seven years
            illustrating for authors, game studios, and fellow dreamers. My
            work lives somewhere between gothic romance and gentle fantasy —
            moody palettes, glowing skin, and petals that never quite stop
            falling.
          </p>
          <p>
            When I&apos;m not painting, you&apos;ll find me collecting old
            poetry books, tending an unruly rose garden, and sketching
            strangers in candlelit cafés.
          </p>

          <div className="contact-grid">
            {contacts.map((c) => (
              <a key={c.label} href={c.href} className="contact" target="_blank" rel="noreferrer">
                <div>
                  <span className="contact-label">{c.label}</span>
                  <span className="contact-value">{c.value}</span>
                </div>
                <span className="contact-arrow">↗</span>
              </a>
            ))}
          </div>

          <Link to="/commissions" className="btn btn-pink">
            Commission information <span>↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
