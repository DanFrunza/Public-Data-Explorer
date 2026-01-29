import React from "react";
import "../css/About.css";

const About = () => (
  <main className="about-modern">
    {/* Hero Section */}
    <section className="about-hero-section">
      <div className="about-hero-content">
        <div className="about-hero-badge">ℹ️ About</div>
        <h1 className="about-hero-title">
          <span className="text-gradient">Public Data</span> <span className="about-title-white">Explorer</span>
        </h1>
        <p className="about-hero-desc">
          Interactive visualizations for real-world public data.<br/>
          Built as an educational platform and a playground for modern web/data technologies.
        </p>
      </div>
    </section>
    {/* About Section */}
    <section className="about-section">
      <div className="about-grid">
        <div className="about-card about-card--project">
          <div className="about-card-title">About the project</div>
          <div className="about-card-desc">
            Public data is often hard to access and interpret. This project transforms complex datasets into clear, interactive visualizations that are easy to explore.<br/>
            The platform is both an educational resource and a portfolio, and a base for experiments with web and data engineering.
          </div>
        </div>
        <div className="about-card about-card--explore">
          <div className="about-card-title">What can you explore?</div>
          <ul>
            <li>Interactive dashboards built with D3.js</li>
            <li>Public data from economy, population, education, and more</li>
            <li>Modern, responsive interface</li>
            <li>Data processing pipeline (Python, future: GitHub Actions)</li>
            <li>Structured backend API for data access</li>
          </ul>
          <div className="about-card-desc">Features are constantly expanding, the project is evolving.</div>
        </div>
        <div className="about-card about-card--tech">
          <div className="about-card-title">Technologies & Hosting</div>
          <ul>
            <li><b>Frontend:</b> React (Vite), hosted on GitHub Pages</li>
            <li><b>Backend:</b> Node.js (Express), hosted on Render</li>
            <li><b>Database:</b> Supabase (PostgreSQL)</li>
            <li><b>Pipeline:</b> Python, future: GitHub Actions</li>
          </ul>
          <div className="about-card-desc">The architecture is local-first, but cloud-ready. Configuration is based on environment variables.</div>
        </div>
        <div className="about-card about-card--author">
          <div className="about-card-title">About the author</div>
          <div className="about-card-desc">
            I am a master's student in Software Engineering at UAIC Iași, graduate of Mathematics and Computer Science. This project is a practical extension of my studies and passion for web/data.
          </div>
          <div className="about-card-desc">
            I am certified by freeCodeCamp in:
          </div>
          <ul>
            <li>Responsive Web Design</li>
            <li>JavaScript Algorithms and Data Structures</li>
            <li>Front End Development Libraries (React, Redux)</li>
            <li>Data Visualization (D3.js)</li>
          </ul>
        </div>
        <div className="about-card about-card--status">
          <div className="about-card-title">Status & Contact</div>
          <div className="about-card-desc">
            The project is constantly evolving. New datasets, visualizations, and features are coming soon.<br/>
            My goal is to continuously improve my skills in full-stack development, data visualization, and scalable architectures.
          </div>
          <ul>
            <li>Email: <a className="about-link" href="mailto:dani.frunza@yahoo.com">dani.frunza@yahoo.com</a></li>
            <li>GitHub: <a className="about-link" href="https://github.com/danfrunza">danfrunza</a></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
);

export default About;
