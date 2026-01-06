import React from "react";
import "../css/About.css";

const About = () => {
  return (
    <main className="about">
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
        <h2>TECHNOLOGIES & STACK</h2>
        <h3>Frontend</h3>
        <ul>
          <li>React (Vite)</li>
          <li>JavaScript</li>
          <li>D3.js for data visualization</li>
          <li>CSS for styling</li>
          <li>React Router for navigation</li>
        </ul>
        <h3>Backend</h3>
        <ul>
          <li>Node.js</li>
          <li>Express</li>
          <li>REST API</li>
          <li>PostgreSQL for structured data</li>
        </ul>
        <h3>Data Processing</h3>
        <ul>
          <li>Python</li>
          <li>PySpark for large-scale data processing</li>
          <li>Parquet for efficient data storage</li>
          <li>S3-compatible object storage (MinIO in development)</li>
        </ul>
        <h3>Infrastructure</h3>
        <ul>
          <li>Docker & Docker Compose</li>
          <li>Environment-based configuration</li>
          <li>Local-first development, cloud-ready architecture</li>
        </ul>
        <p>This stack is intentionally designed to mirror real-world production systems while remaining fully runnable in a local development environment.</p>
      </section>

      <section className="card">
        <h2>ABOUT THE AUTHOR</h2>
        <p>
          I am a Master’s student in Software Engineering at Alexandru Ioan Cuza University of Iași.
          I previously completed a Bachelor’s degree in Mathematics and Computer Science at the Faculty of Mathematics.
        </p>
        <p>
          This project is a practical extension of my academic background and self-directed learning, including certifications from freeCodeCamp in:
        </p>
        <ul>
          <li>Responsive Web Design</li>
          <li>JavaScript Algorithms and Data Structures</li>
          <li>Front End Development Libraries (React, Redux)</li>
          <li>Data Visualization (D3.js)</li>
        </ul>
        <p>
          The goal is to continuously improve my skills in full-stack development, data visualization, and scalable system design.
        </p>
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
      <section className="card">
        <h2>Contact</h2>
        <ul>
          <li>Email: dani.frunza@yahoo.com</li>
          <li>GitHub: <a href="https://github.com/DanFrunza" target="_blank" rel="noopener noreferrer">https://github.com/DanFrunza</a></li>
          <li>Project Repository: <a href="https://github.com/DanFrunza/Public-Data-Explorer" target="_blank" rel="noopener noreferrer">https://github.com/DanFrunza/Public-Data-Explorer</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/dan-frunza-135695284/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/dan-frunza-135695284/</a></li>
        </ul>
      </section>
    </main>
  );
}

export default About;