import { Link } from 'react-router';
import './Gallery.css';

const galleryItems = [
  { title: 'Sunlit Bloom', slug: 'sunlit-bloom', medium: 'Acrylic on canvas' },
  { title: 'Coastal Echo', slug: 'coastal-echo', medium: 'Mixed media' },
  { title: 'Night Orchard', slug: 'night-orchard', medium: 'Oil painting' },
];

export default function Gallery() {
  return (
    <section className="page">
      <h1>Gallery</h1>
      <p>Browse the featured artworks in the collection.</p>

      <div className="gallery-grid">
        {galleryItems.map((artwork) => (
          <article key={artwork.slug} className="gallery-card">
            <h2>{artwork.title}</h2>
            <p>{artwork.medium}</p>
            <Link to={`/artwork/${artwork.slug}`}>View details</Link>
          </article>
        ))}
      </div>
    </section>
  );
}