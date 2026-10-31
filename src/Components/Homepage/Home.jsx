import React from 'react';
import './Home.css';

const Home = props => {
    return (
         <section className="page">
      <h1>Welcome to Lumi's Art Portal</h1>
      <p>Explore original artwork and commission something personal.</p>
      <Link to="/gallery">Explore the Gallery</Link>
    </section>
    );
};



   






export default Home;