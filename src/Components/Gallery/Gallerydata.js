// Shared data for the Gallery and Commissions pages.
// Put this file next to Gallery.jsx (src/pages/Gallery/galleryData.js).

import img1 from "../../assets/rose-emblem.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import img4 from "../../assets/img4.jpg";
import img5 from "../../assets/white.jpg";
import img6 from "../../assets/blue.jpg";
import centerBrush from "../../assets/image.png";

export { centerBrush };

/*
  Every artwork belongs to a category. To add more artworks to a category,
  just add more items with the same `category` string.
  The FIRST item of each category is used as its square on the grid.
*/
export const galleryItems = [
  { id: "01", title: "Emblem of Crimson", category: "EMBLEMS & LOGOS", image: img1 },
  { id: "02", title: "Neon Alleyways", category: "ILLUSTRATIONS", image: img2 },
  { id: "03", title: "Collage Saudade", category: "GRAPHICS", image: img3 },
  { id: "04", title: "Constructivist Geometry", category: "EXPERIMENTAL WORK", image: img4 },
  { id: "05", title: "Your new title", category: "ILLUSTRATIONS", image: img5 },
  { id: "06", title: "Your other title", category: "ILLUSTRATIONS", image: img6 },
];

export const categories = [
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

export const itemsOf = (cat) => galleryItems.filter((i) => i.category === cat);