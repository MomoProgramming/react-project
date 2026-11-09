import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Gallery.css";

// Artwork images
import img1 from "../../assets/rose-emblem.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import img4 from "../../assets/img4.jpg";
import img5 from "../../assets/white.jpg";
import img6 from "../../assets/blue.jpg";
import centerBrush from "../../assets/image.png";
import bgTexture from "../../assets/bg-dark.jpg";
import bgSmoke from "../../assets/bg-smoke.jpg"; // the red/black smoke picture

/*
  Every artwork belongs to a category. To add more artworks to a category,
  just add more items with the same `category` string.
  The FIRST item of each category is used as its square on the home grid.
*/
const galleryItems = [
  { id: "01", title: "Emblem of Crimson", category: "EMBLEMS & LOGOS", image: img1 },
  { id: "02", title: "Neon Alleyways", category: "ILLUSTRATIONS", image: img2 },
  { id: "03", title: "Collage Saudade", category: "GRAPHICS", image: img3 },
  { id: "04", title: "Constructivist Geometry", category: "EXPERIMENTAL WORK", image: img4 },
    { id: "05", title: "Your new title", category: "ILLUSTRATIONS", image: img5 },
  { id: "06", title: "Your other title", category: "ILLUSTRATIONS", image: img6 },
];

const categories = [
  {
    name: "EMBLEMS & LOGOS",
    description: "Placeholder: write a short description of your emblems and logos here.",
  },
  {
    name: "ILLUSTRATIONS",
    description: "Placeholder: write a short description of your illustrations here.",
  },
  {
    name: "GRAPHICS",
    description: "Placeholder: write a short description of your graphics here.",
  },
  {
    name: "EXPERIMENTAL WORK",
    description: "Placeholder: write a short description of your experimental work here.",
  },
];

const itemsOf = (cat) => galleryItems.filter((i) => i.category === cat);

export default function Gallery() {
  // "grid" = home, "intro" = category description page, "artworks" = actual artworks
  const [view, setView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const categoryItems = activeCategory ? itemsOf(activeCategory) : [];
  const categoryData = categories.find((c) => c.name === activeCategory);

  // Which item's image drives the blurred background right now
  const bgItem =
    view === "artworks" ? selectedItem : view === "intro" ? categoryItems[0] : null;

  // Left navbar -> straight to the artworks of that category
  const openArtworks = (catName) => {
    setActiveCategory(catName);
    setSelectedItem(itemsOf(catName)[0] || null);
    setView("artworks");
  };

  // Little squares -> category intro page (description + button)
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

  // Clicking "Gallery" in the top navbar (even while already on this page)
  // creates a new router location key -> reset to the home grid.
  const location = useLocation();
  useEffect(() => {
    setView("grid");
    setActiveCategory(null);
    setSelectedItem(null);
  }, [location.key]);

  return (
    <div className="gallery-container">
      <div
        className="bg-base-texture"
        style={{ backgroundImage: `url(${bgTexture})` }}
      />

      {/* Smoke picture laid over the base texture */}
      <div
        className="bg-overlay-texture"
        style={{ backgroundImage: `url(${bgSmoke})` }}
      />

      {/* Cross-fading blur layers, one per artwork */}
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
        <div className={`line-h-detail ${view !== "grid" ? "is-visible" : ""}`} />
      </div>

      <main className="gallery-content">
        {/* Left navbar: goes directly to the artworks */}
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
          {/* ---------- Home grid ---------- */}
          {view === "grid" && (
            <div className="items-grid view-fade-in" key="grid">
              <div className="grid-featured-center">
                <img src={centerBrush} alt="Featured art" />
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
                      <div className="thumb-img-wrapper">
                        <img src={cover.image} alt={cat.name} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------- Category intro page ---------- */}
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
                <h2 className="intro-title">{categoryData?.name}</h2>
                <p className="intro-text">{categoryData?.description}</p>
                <button
                  className="intro-btn"
                  onClick={() => openArtworks(activeCategory)}
                >
                  View artworks
                </button>
              </div>
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