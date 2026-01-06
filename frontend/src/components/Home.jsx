import React from "react";
import "../css/Home.css";

const Home = () => {
  return (
    <main className="home">
      <section className="TitleCard">
        <h1>Public Data Explorer</h1>
        <h2>Interactive visualizations for understanding real-world data</h2>
        <p>Public Data Explorer is an educational platform focused on exploring and visualizing large public datasets using modern web technologies.</p>
      </section>

      <section className="card">
        <h2>What is Public Data Explorer?</h2>
        <p>
          Public data is often complex, fragmented, and difficult to interpret.
          This project transforms raw datasets into clear, interactive visualizations that make data easier to explore and understand.
        </p>
      </section>

      <section className="card">
        <h2>WHAT YOU CAN EXPLORE</h2>
        <ul>
          <li>Interactive dashboards built with D3.js</li>
          <li>Exploration of public datasets (population, economy, education, etc.)</li>
          <li>Clean and responsive UI</li>
          <li>Scalable data processing pipelines</li>
          <li>A structured backend API for data access</li>
        </ul>
        <p>Some features are still under development, as this is an evolving project.</p>
      </section>

      <section className="card">
        <h2>CLOSING / CALL TO ACTION</h2>
        <h3>Project status</h3>
        <p>Public Data Explorer is an ongoing project and will continue to evolve over time.
          New datasets, visualizations, and features will be added progressively.
        </p>
        <p>
          This platform serves both as a learning environment and a portfolio project demonstrating modern web and data engineering practices.
        </p>
        
      </section>
      
    </main>
  );
}

export default Home;