import { useState } from "react";
import { Link } from "react-router";
import "./Home.css";


import heroBg from "../../assets/hero-bg2.jpg";
import logoImg from "../../assets/lumi-logo2.png";
import heroVideo from "../../assets/hero-video2.mp4";
import artistImg from "../../assets/artist.jpg";
import { categories, itemsOf } from "../Gallery/Gallerydata";

const categoryInfo = {
  "EMBLEMS & LOGOS": {
    label: "Emblems & Logos",
    price: "from $80",
    blurb: "Crests, monograms and brand marks with a hand-painted, jewel-like finish.",
  },
  ILLUSTRATIONS: {
    label: "Illustrations",
    price: "from $120",
    blurb: "Moody, cinematic scenes and characters painted with velvet light.",
  },
  GRAPHICS: {
    label: "Graphics",
    price: "from $60",
    blurb: "Bold collage-style posters, covers and layouts with a vintage edge.",
  },
  "EXPERIMENTAL WORK": {
    label: "Experimental Work",
    price: "from $100",
    blurb: "Abstract, geometric and mixed-media pieces that break the rules.",
  },
};

const slides = categories.map((c) => ({
  name: c.name,
  image: itemsOf(c.name)[0]?.image,
  ...(categoryInfo[c.name] || { label: c.name, price: "", blurb: c.description }),
}));

const contacts = [
  { label: "Email", value: "hello@luminium.art", href: "mailto:hello@luminium.art" },
  { label: "Instagram", value: "@lumini.um", href: "https://instagram.com" },
  { label: "X / Twitter", value: "@lumini.um", href: "https://x.com" },
  { label: "ArtStation", value: "lumini.um", href: "https://artstation.com" },
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const go = (step) => setIndex((i) => (i + step + n) % n);

  // position of a slide relative to the one in focus: 0 = centre, -1 = left, 1 = right
  const offsetOf = (i) => {
    let d = (i - index + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };
  const current = slides[index];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <img className="hero-bg" src={heroBg} alt="" />
        <video
          className="hero-video"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />

        <div className="hero-content">
          <h1 className="hero-title">Art Portfolio</h1>
          <Link to="/gallery" className="cta-btn">
            View Gallery
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* LOGO */}
      <section className="logo-band">
        <img className="logo-mark" src={logoImg} alt="Luminium" />
      </section>

      {/* CATEGORIES */}
      <section className="cats" aria-label="Categories">
        <span className="eyebrow cats-eyebrow">Explore categories</span>

        <div className="cat-stage">
          <div className="cat-cards">
            {slides.map((sl, i) => {
              const off = offsetOf(i);
              const pos =
                off === 0 ? "is-center" : off === -1 ? "is-left" : off === 1 ? "is-right" : "is-hidden";
              return (
                <div
                  key={sl.name}
                  className={`cat-card ${pos}`}
                  onClick={off === 0 ? undefined : () => go(off)}
                  aria-hidden={off !== 0}
                >
                  <img src={sl.image} alt={off === 0 ? sl.label : ""} draggable="false" />
                </div>
              );
            })}
          </div>

          <div className="cat-info" key={index}>
            <div className="cat-info-text">
              <div className="cat-info-head">
                <h3>{current.label}</h3>
                <span className="cat-price">{current.price}</span>
              </div>
              <p>{current.blurb}</p>
              <Link to="/gallery" state={{ category: current.name }} className="cat-link">
                View in gallery <span>↗</span>
              </Link>
            </div>

            <div className="cat-arrows">
              <button type="button" className="cat-arrow" onClick={() => go(-1)} aria-label="Previous category">
                ←
              </button>
              <button type="button" className="cat-arrow" onClick={() => go(1)} aria-label="Next category">
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-avatar">
          <img src={artistImg} alt="Luminium, the artist" />
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

          <Link to="/commissions" className="cta-btn">
            Commission information <span>↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}