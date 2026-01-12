import React from "react";
import "../css/About.css";

const About = () => {
  return (
    <main className="about">
      <section className="TitleCard">
        <h1>Public Data Explorer</h1>
        <h2>Interactive visualizations for real-world data</h2>
        <p>Public Data Explorer is an educational platform for exploring and visualizing public datasets, built with modern technologies.</p>
      </section>

      <section className="card">
        <h2>About the project</h2>
        <p>
          Public data is often hard to access and interpret. The goal of this project is to transform these datasets into clear, interactive visualizations that are easy to explore.
        </p>
        <p>
          The platform is designed as both an educational resource and a portfolio, and as a base for experiments with web and data engineering technologies.
        </p>
      </section>

      <section className="card">
        <h2>What can you explore?</h2>
        <ul>
          <li>Interactive dashboards built with D3.js</li>
          <li>Public data from economy, population, education, etc.</li>
          <li>Modern, responsive interface</li>
          <li>Data processing pipeline (Python, future: GitHub Actions)</li>
          <li>Structured backend API for data access</li>
        </ul>
        <p>Features are constantly expanding, the project is evolving.</p>
      </section>

      <section className="card">
        <h2>Technologies & Hosting</h2>
        <ul>
          <li><b>Frontend:</b> React (Vite), hosted on GitHub Pages</li>
          <li><b>Backend:</b> Node.js (Express), hosted on Render</li>
          <li><b>Database:</b> Supabase (PostgreSQL)</li>
          <li><b>Pipeline:</b> Python, future: GitHub Actions</li>
        </ul>
        <p>The architecture is local-first, but cloud-ready. Configuration is based on environment variables.</p>
      </section>

      <section className="card">
        <h2>About the author</h2>
        <p>
          I am a master's student in Software Engineering at UAIC Iași, graduate of Mathematics and Computer Science. This project is a practical extension of my studies and passion for web/data.
        </p>
        <p>
          I am certified by freeCodeCamp in:
        </p>
        <ul>
          <li>Responsive Web Design</li>
          <li>JavaScript Algorithms and Data Structures</li>
          <li>Front End Development Libraries (React, Redux)</li>
          <li>Data Visualization (D3.js)</li>
        </ul>
        <p>
          My goal is to continuously improve my skills in full-stack development, data visualization, and scalable architectures.
        </p>
      </section>

      <section className="card">
        <h2>Status & Contact</h2>
        <p>The project is constantly evolving. New datasets, visualizations, and features are coming soon.</p>
        <ul>
          <li>Email: dani.frunza@yahoo.com</li>
          <li>GitHub: <a href="https://github.com/DanFrunza" target="_blank" rel="noopener noreferrer">DanFrunza</a></li>
          <li>Repo: <a href="https://github.com/DanFrunza/Public-Data-Explorer" target="_blank" rel="noopener noreferrer">Public-Data-Explorer</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/dan-frunza-135695284/" target="_blank" rel="noopener noreferrer">dan-frunza-135695284</a></li>
        </ul>
      </section>
    </main>
  );
}

export default About;