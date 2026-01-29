

import React from "react";
import { Link } from "react-router-dom";
import Card from "./ui-basic/Card.jsx";
import "../css/Home.css";

const features = [
  {
    title: "Dashboard",
    description: "Interactive charts with real data from economy, population, and more.",
    link: "/dashboard",
  },
  {
    title: "Create Account",
    description: "Save preferences and export charts with a free account.",
    link: "/register",
  },
  {
    title: "About",
    description: "Technical details and motivation behind the project.",
    link: "/about",
  },
  {
    title: "FAQ",
    description: "Quick answers to common questions.",
    link: "/faq",
  },
];

const suggestions = [
  "New data sources to add",
  "Types of charts or visualizations you want to see",
  "Interesting statistics or indicators to include",
  "UI/UX improvements or accessibility ideas",
  "Bug reports or technical issues",
  "Feature requests, export formats, or anything else",
];

const Home = () => (
  <main className="home-modern">
    {/* Hero Section */}
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">Free & Interactive</div>
        <h1 className="hero-title">
          <span className="text-gradient">Public Data</span> Explorer
        </h1>
        <p className="hero-desc">
          Explore public data, simply. Quickly visualize data from economy, population, education and more. The platform is free, interactive, and easy to use.
        </p>
        <div className="hero-actions">
          <Link to="/dashboard" className="hero-btn primary">Explore Dashboard</Link>
          <Link to="/about" className="hero-btn outline">Learn More</Link>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="features-section">
      <h2 className="section-title">What can you do here?</h2>
      <div className="features-grid">
        {features.map((feature, i) => (
          <Card key={i}>
            <div className="feature-title">{feature.title}</div>
            <div className="feature-desc">{feature.description}</div>
            <Link to={feature.link} className="feature-link">Explore &rarr;</Link>
          </Card>
        ))}
      </div>
    </section>

    {/* Support & Suggestions Section */}
    <section className="support-section">
      <div className="support-grid">
        <Card>
          <div className="support-title">Support the project</div>
          <div className="support-desc">
            You can support the creator by donating! <Link to="/plans">See details here</Link>.<br/>
            The platform is built as a portfolio and educational resource. Anyone can explore real data and learn.
          </div>
        </Card>
        <Card>
          <div className="support-title">Suggestions welcome!</div>
          <div className="support-desc">
            I welcome any suggestions to improve the platform. You can send your ideas from the <Link to="/faq">FAQ page</Link>!
            <ul className="suggestions-list">
              {suggestions.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </section>
  </main>
);

export default Home;