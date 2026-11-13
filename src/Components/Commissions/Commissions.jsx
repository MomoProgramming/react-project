import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Gallery/Gallery.css"; // grid / detail styles used by "What I offer"
import "./Commissions.css";
import "./CommissionsOffer.css";

import bgTexture from "../../assets/bg-dark.jpg";
import bgSmoke from "../../assets/bg-smoke.jpg";
import {
  galleryItems,
  categories,
  itemsOf,
  centerBrush,
} from "../Gallery/galleryData";

// Where the "Request a commission" button leads (email, Discord invite, form link...)
const REQUEST_URL = "mailto:your@email.com?subject=Commission%20request";

const sections = [
  { key: "offer", label: "WHAT I OFFER" },
  { key: "expect", label: "WHAT TO EXPECT" },
];

const steps = [
  { title: "Brief", text: "Placeholder: you send your idea, references and deadline." },
  { title: "Sketch", text: "Placeholder: you receive a first concept to approve." },
  { title: "Revisions", text: "Placeholder: a set number of changes before the final render." },
  { title: "Delivery", text: "Placeholder: final files delivered in the formats you need." },
];

const facts = [
  { label: "Turnaround", value: "Placeholder: 1–2 weeks" },
  { label: "Revisions", value: "Placeholder: 2 included" },
  { label: "Payment", value: "Placeholder: 50% upfront" },
];

function RequestButton() {
  return (
    <a className="com-btn" href={REQUEST_URL}>
      Request a commission
    </a>
  );
}

export default function Commissions() {
  const [section, setSection] = useState("offer");

  // The old gallery: "grid" = home, "intro" = category page, "artworks" = artworks
  const [view, setView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const categoryItems = activeCategory ? itemsOf(activeCategory) : [];
  const categoryData = categories.find((c) => c.name === activeCategory);
  const navigate = useNavigate();
  const catIndex = categories.findIndex((c) => c.name === activeCategory);
  const nextCategory = categories[(catIndex + 1) % categories.length];

  const bgItem =
    section !== "offer"
      ? null
      : view === "artworks"
      ? selectedItem
      : view === "intro"
      ? categoryItems[0]
      : null;

  const openArtworks = (catName) => {
    setActiveCategory(catName);
    setSelectedItem(itemsOf(catName)[0] || null);
    setView("artworks");
  };

  const openIntro = (catName) => {
    setActiveCategory(catName);
    setSelectedItem(null);
    setView("intro");
  };

  const goHome = () => {
    setView("grid");
    setActiveCategory(null);
    setSelectedItem(null);
  };

  // Clicking "Commissions" in the top navbar resets everything
  const location = useLocation();
  useEffect(() => {
    setSection("offer");
    goHome();
  }, [location.key]);

  return (
    <div className="com-container">
      <div
        className="com-bg-base"
        style={{ backgroundImage: `url(${bgTexture})` }}
      />
      <div
        className="com-bg-overlay"
        style={{ backgroundImage: `url(${bgSmoke})` }}
      />

      {/* Blurred artwork glow (used by the offer section) */}
      {galleryItems.map((item) => (
        <div
          key={item.id}
          className={`bg-blur-layer ${bgItem?.id === item.id ? "is-visible" : ""}`}
          style={{ backgroundImage: `url(${item.image})` }}
          aria-hidden="true"
        />
      ))}

      <div className="com-lines">
        <div className="com-line-v com-line-v-1" />
        <div className="com-line-v com-line-v-2" />
        <div className="com-line-v com-line-v-3" />
        <div className="com-line-h-top" />
      </div>

      <main className="com-content">
        {/* Left navbar */}
        <nav className="com-sidebar">
          {sections.map((s) => (
            <button
              key={s.key}
              className={`com-nav-btn ${section === s.key ? "is-active" : ""}`}
              onClick={() => {
                setSection(s.key);
                if (s.key === "offer") goHome();
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <section
          className="com-display"
          style={section === "offer" ? { padding: 0, overflow: "visible" } : undefined}
        >
          {/* ---------- What I offer = the old gallery ---------- */}
          {section === "offer" && (
            <div className="display-area" key="offer">
              {view === "grid" && (
                <div className="items-grid view-fade-in" key="grid">
                  <div className="grid-featured-center">
                    <div className="featured-wrap">
                      <h2 className="featured-title">Categories</h2>
                      <img src={centerBrush} alt="Featured art" />
                    </div>
                  </div>

                  <div className="grid-thumbnails-col">
                    {categories.map((cat) => {
                      const cover = itemsOf(cat.name)[0];
                      if (!cover) return null;
                      return (
                        <div
                          key={cat.name}
                          className="thumb-card"
                          onClick={() => openIntro(cat.name)}
                        >
                          <span className="thumb-id">#{cover.id}</span>
                          <div className="thumb-square">
                            <div className="thumb-img-wrapper">
                              <img src={cover.image} alt={cat.name} />
                            </div>
                            <div className="thumb-label">
                              <span className="thumb-label-name">{cat.name}</span>
                              <button type="button" className="thumb-label-more">View more</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {view === "intro" && categoryItems[0] && (
                <div className="detail-view view-fade-in" key={`intro-${activeCategory}`}>
                  <div className="detail-main-stage" onClick={goHome}>
                    <img
                      src={categoryItems[0].image}
                      alt={activeCategory}
                      className="detail-image"
                    />
                  </div>

                  <div className="detail-sidebar-info intro-info">
                    <button type="button" className="intro-back" onClick={goHome}>
                      ← Go back
                    </button>
                    <h2 className="intro-title">{categoryData?.name}</h2>
                    <p className="intro-text">{categoryData?.description}</p>
                    <div className="intro-actions">
                      <button
                        className="intro-btn"
                        onClick={() =>
                          navigate("/gallery", { state: { category: activeCategory } })
                        }
                      >
                        View in gallery
                      </button>
                      <button
                        type="button"
                        className="intro-next"
                        onClick={() => openIntro(nextCategory.name)}
                      >
                        View {nextCategory.name.toLowerCase()} →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {view === "artworks" && selectedItem && (
                <div className="detail-view view-fade-in" key={`art-${activeCategory}`}>
                  <div className="detail-main-stage" onClick={goHome}>
                    <img
                      key={selectedItem.id}
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="detail-image view-fade-in"
                    />
                  </div>

                  <div className="detail-sidebar-info">
                    <p className="detail-placeholder-text">Text here for details</p>
                  </div>

                  <div className="detail-bottom-nav">
                    {categoryItems.map((item) => (
                      <button
                        key={item.id}
                        className={`circle-thumb ${
                          selectedItem.id === item.id ? "is-selected" : ""
                        }`}
                        onClick={() => setSelectedItem(item)}
                        style={{ backgroundImage: `url(${item.image})` }}
                        aria-label={`View ${item.title}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------- What to expect (unchanged) ---------- */}
          {section === "expect" && (
            <div className="com-panel com-fade-in" key="expect">
              <span className="com-kicker">COMMISSIONS</span>
              <h2 className="com-title">What to expect</h2>
              <p className="com-lead">
                Placeholder: a short intro about how working together goes.
              </p>

              <ol className="com-steps">
                {steps.map((s, i) => (
                  <li className="com-step" key={s.title}>
                    <span className="com-step-num">0{i + 1}</span>
                    <div>
                      <h3 className="com-step-title">{s.title}</h3>
                      <p className="com-step-text">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="com-facts">
                {facts.map((f) => (
                  <div className="com-fact" key={f.label}>
                    <span className="com-fact-label">{f.label}</span>
                    <span className="com-fact-value">{f.value}</span>
                  </div>
                ))}
              </div>

              <RequestButton />
            </div>
          )}
        </section>
      </main>

      <footer className="com-footer-tag">Luminium artist gallery</footer>
    </div>
  );
}