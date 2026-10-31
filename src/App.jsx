import { Link, Route, Routes, useParams } from "react-router";
import Nav from "./Components/NavBar/Nav.jsx";
import Home from "./Components/Homepage/Home.jsx";
import Gallery from "./Components/Gallery/Gallery.jsx";
import Commissions from "./Components/Commissions/Commissions.jsx";
import Request from "./Components/Request/Request.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
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
          <Route path="/artwork/:slug" element={<ArtworkDetails />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/commission-request" element={<Request />} />
          <Route
            path="/about"
            element={
              <PlaceholderPage title="About Lumi">
                Learn about Lumi and her artwork.
              </PlaceholderPage>
            }
          />
          <Route path="/artist" element={<Dashboard />} />
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