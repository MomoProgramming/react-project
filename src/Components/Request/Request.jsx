import { useEffect, useRef, useState } from "react";
import "./Request.css";
import bgVideo from "../../assets/request-bg.mp4";

const MAX_IMAGES = 6;

// Falling light streaks: left = position, h = length (vh), d = seconds per fall,
// delay = start offset (negative = already falling when the page opens), c = colour
const LIGHTS = [
  { left: "8%",  h: 55, d: 19, delay: -6,  c: "#ff8a3d" }, // orange
  { left: "15%", h: 40, d: 24, delay: -15, c: "#ffd75e" }, // yellow
  { left: "27%", h: 62, d: 21, delay: -2,  c: "#ff4a4a" }, // red
  { left: "44%", h: 36, d: 26, delay: -11, c: "#6fe39a" }, // green
  { left: "58%", h: 50, d: 22, delay: -18, c: "#ff8a3d" },
  { left: "72%", h: 42, d: 25, delay: -8,  c: "#ffd75e" },
  { left: "88%", h: 66, d: 20, delay: -13, c: "#ff4a4a" },
  { left: "94%", h: 48, d: 23, delay: -4,  c: "#6fe39a" },
];

export default function Request() {
  const [images, setImages] = useState([]); // [{ id, file, url }]
  const [sent, setSent] = useState(false);
  const fileInput = useRef(null);

  // free the preview URLs when leaving the page
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addImages = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => {
      const next = [...prev];
      for (const file of picked) {
        if (next.length >= MAX_IMAGES) break;
        next.push({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
          file,
          url: URL.createObjectURL(file),
        });
      }
      return next;
    });
    e.target.value = ""; // lets the same file be picked again
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    images.forEach((img) => data.append("inspiration", img.file));

    // TODO: send `data` to your backend / form service here, e.g.
    // await fetch("/api/commission", { method: "POST", body: data });
    console.log(Object.fromEntries(data.entries()));

    setSent(true);
  };

  const reset = () => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
    setSent(false);
  };

  return (
    <section className="req-page">
      <video
        className="req-video"
        src={bgVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="req-video-shade" aria-hidden="true" />

      {/* same white lines as the Services page */}
      <div className="req-lines" aria-hidden="true">
        <div className="req-line-v req-line-v-1" />
        <div className="req-line-v req-line-v-2" />
        <div className="req-line-v req-line-v-3" />
        <div className="req-line-h-top" />
        <div className="req-line-neon" />
        <div className="req-line-neon-glow" />
      </div>

      {/* dim falling streaks of light */}
      <div className="req-lights" aria-hidden="true">
        {LIGHTS.map((l, i) => (
          <span
            key={i}
            className="req-light"
            style={{
              left: l.left,
              "--h": `${l.h}vh`,
              "--c": l.c,
              animationDuration: `${l.d}s`,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="req-frame">
        <header className="req-head">
          <span className="req-kicker">Luminium</span>
          <h1 className="req-title">Request a Commission</h1>
          <p className="req-intro">
            Tell me about your idea and I will get back to you by email.
          </p>
        </header>

        <div className="req-card">
          {!sent ? (
            <form className="req-form" onSubmit={handleSubmit} id="commission-form">
              <div className="req-row">
                <label className="req-field">
                  <span className="req-label">Name</span>
                  <input name="name" type="text" placeholder="Your name" required />
                </label>
                <label className="req-field">
                  <span className="req-label">Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label className="req-field">
                <span className="req-label">Project title</span>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Logo for my Discord server"
                  required
                />
              </label>

              <label className="req-field">
                <span className="req-label">Project details</span>
                <textarea
                  name="details"
                  rows="5"
                  placeholder="Describe your idea: style, colours, size, deadline..."
                  required
                />
              </label>

              <div className="req-field">
                <span className="req-label">
                  Inspiration pictures <em>(optional)</em>
                </span>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={addImages}
                />

                <div className="req-thumbs">
                  {images.map((img) => (
                    <div className="req-thumb" key={img.id}>
                      <img src={img.url} alt="" />
                      <button
                        type="button"
                        className="req-thumb-remove"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remove picture"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      className="req-add"
                      onClick={() => fileInput.current?.click()}
                    >
                      <span>+</span>
                      Add pictures
                    </button>
                  )}
                </div>
                <small className="req-hint">
                  Up to {MAX_IMAGES} images · {images.length}/{MAX_IMAGES} added
                </small>
              </div>
            </form>
          ) : (
            <div className="req-done">
              <h2>Request received</h2>
              <p>Thank you! I will reply to your email soon.</p>
              <button type="button" className="req-again" onClick={reset}>
                Send another request
              </button>
            </div>
          )}

          {/* The circle on the lower edge of the card = the send button */}
          {!sent && (
            <button type="submit" form="commission-form" className="req-send">
              <span>Send</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}