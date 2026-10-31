import { Link, Route, Routes, useParams } from "react-router";
import Nav from "./Components/NavBar/Nav.jsx";
import Home from "./Components/Homepage/Home.jsx";
import Gallery from "./Components/Gallery/Gallery.jsx";
import "./App.css";

function PlaceholderPage({ title, children }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  );
}

function ArtworkDetails() {
  const { slug } = useParams();

  return (
    <section className="page">
      <h1>Artwork Details</h1>
      <p>Selected artwork: {slug}</p>
      <p>The artwork image and description will appear here.</p>
      <Link to="/gallery">Back to Gallery</Link>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Nav />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/gallery" element={<Gallery />} />

          <Route
            path="/artwork/:slug"
            element={<ArtworkDetails />}
          />

          <Route
            path="/commissions"
            element={
              <PlaceholderPage title="Commissions">
                Explore Lumi's commission services and process.
              </PlaceholderPage>
            }
          />

          <Route
            path="/commission-request"
            element={
              <PlaceholderPage title="Request a Commission">
                The commission request form will appear here.
              </PlaceholderPage>
            }
          />

          <Route
            path="/about"
            element={
              <PlaceholderPage title="About Lumi">
                Learn about Lumi and her artwork.
              </PlaceholderPage>
            }
          />

          <Route
            path="/artist"
            element={
              <PlaceholderPage title="Artist Dashboard">
                Dashboard preview. Artist sign-in will be added later.
              </PlaceholderPage>
            }
          />

          <Route
            path="*"
            element={
              <PlaceholderPage title="Page not found">
                This page does not exist. <Link to="/">Go home</Link>.
              </PlaceholderPage>
            }
          />
        </Routes>
      </main>
    </>
  );
}