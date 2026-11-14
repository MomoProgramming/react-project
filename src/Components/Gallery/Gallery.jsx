import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Gallery.css";
import "./GalleryFilm.css";

import bgTexture from "../../assets/bg-dark.jpg";
import bgSmoke from "../../assets/bg-smoke.jpg"; // the red/black smoke picture
import { galleryItems, categories, itemsOf } from "./Gallerydata";

const FILM_COLUMNS = 9;   // number of vertical strips
const FRAMES_PER_STRIP = 8; // frames per strip (repeated twice for a seamless loop)

/* A wall of 35mm strips: even columns scroll up, odd columns scroll down. */
function FilmBackground() {
  return (
    <>
      <div className="film-bg" aria-hidden="true">
        {Array.from({ length: FILM_COLUMNS }).map((_, c) => {
          const frames = Array.from({ length: FRAMES_PER_STRIP }).map(
            (_, r) => galleryItems[(c * 2 + r) % galleryItems.length]
          );
          const loop = [...frames, ...frames];
          const duration = 50 + (c % 3) * 15; // seconds, varied per column
          return (
            <div className="film-strip" key={c}>
              <div
                className={`film-track ${c % 2 === 0 ? "is-up" : "is-down"}`}
                style={{ animationDuration: `${duration}s` }}
              >
                {loop.map((item, i) => (
                  <div className="film-frame" key={i}>
                    <img src={item.image} alt="" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="film-vignette" aria-hidden="true" />
    </>
  );
}

export default function Gallery() {
  // "welcome" = home, "artworks" = artworks of a category
  const [view, setView] = useState("welcome");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const categoryItems = activeCategory ? itemsOf(activeCategory) : [];
  const bgItem = view === "artworks" ? selectedItem : null;

  // Left navbar -> straight to the artworks of that category
  const openArtworks = (catName) => {
    setActiveCategory(catName);
    setSelectedItem(itemsOf(catName)[0] || null);
    setView("artworks");
  };

  const goHome = () => {
    setView("welcome");
    setActiveCategory(null);
    setSelectedItem(null);
  };

  // Clicking "Gallery" in the top navbar resets to the welcome screen.
  const location = useLocation();
  // If we arrive from Services with a category ("View in gallery"),
  // open that category's artworks straight away.
  useEffect(() => {
    const wanted = location.state?.category;
    if (wanted && itemsOf(wanted).length) {
      openArtworks(wanted);
    } else {
      goHome();
    }
  }, [location.key]);

  return (
    <div className={`gallery-container ${view === "artworks" ? "is-artworks" : ""}`}>
      <div
        className="bg-base-texture"
        style={{ backgroundImage: `url(${bgTexture})` }}
      />
      <div
        className="bg-overlay-texture"
        style={{ backgroundImage: `url(${bgSmoke})` }}
      />

      {/* Film strips only on the welcome screen */}
      {view === "welcome" && <FilmBackground />}

      {/* Cross-fading blur layers, one per artwork (artworks view) */}
      {galleryItems.map((item) => (
        <div
          key={item.id}
          className={`bg-blur-layer ${bgItem?.id === item.id ? "is-visible" : ""}`}
          style={{ backgroundImage: `url(${item.image})` }}
          aria-hidden="true"
        />
      ))}

      <div className="grid-overlay-lines">
        <div className="line-v line-v-1" />
        <div className="line-v line-v-2" />
        <div className="line-v line-v-3" />
        <div className="line-h-top" />
        <div className={`line-h-detail ${view !== "welcome" ? "is-visible" : ""}`} />
      </div>

      <main className="gallery-content">
        {/* Left navbar */}
        <nav className="category-sidebar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`category-btn ${activeCategory === cat.name ? "is-active" : ""}`}
              onClick={() => openArtworks(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        <section className="display-area">
          {/* ---------- Welcome ---------- */}
          {view === "welcome" && (
            <div className="welcome-panel view-fade-in" key="welcome">
              <span className="welcome-kicker">Luminium</span>
              <h1 className="welcome-title">Welcome to the gallery</h1>
              <p className="welcome-text">
                Choose a category on the left to start exploring.
              </p>
            </div>
          )}

          {/* ---------- Artworks of the category ---------- */}
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
        </section>
      </main>

      <footer className="gallery-footer-tag">Luminium artist gallery</footer>
    </div>
  );
}