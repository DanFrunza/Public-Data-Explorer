
import React from "react";
import "../css/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="home">
      <section className="TitleCard">
        <h1>Public Data Explorer</h1>
        <h2>Explore public data, simply</h2>
        <p>
          Quickly visualize public data from economy, population, education and more. The platform is free, interactive, and easy to use.
        </p>
      </section>

      <section className="card">
        <h2>What can you do here?</h2>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link> – interactive charts with real data
          </li>
          <li>
            <Link to="/register">Create an account</Link> or <Link to="/login">log in</Link> to save preferences and export charts
          </li>
          <li>
            <Link to="/about">About</Link> – technical details and motivation
          </li>
          <li>
            <Link to="/faq">FAQ</Link> – quick answers
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Support the project</h2>
        <p>
          You can support the creator by donating! <Link to="/plans">See details here</Link>.
        </p>
        <p>
          The platform is built as a portfolio and educational resource. Anyone can explore real data and learn.
        </p>
      </section>

      <section className="card">
        <h2>Suggestions welcome!</h2>
        <p>
          I welcome any suggestions to improve the platform. You can send your ideas directly from the <Link to="/faq">FAQ page</Link>!
        </p>
        <ul>
          <li>New data sources to add</li>
          <li>Types of charts or visualizations you want to see</li>
          <li>Interesting statistics or indicators to include</li>
          <li>UI/UX improvements or accessibility ideas</li>
          <li>Bug reports or technical issues</li>
          <li>Feature requests, export formats, or anything else</li>
        </ul>
        <p>
          Any help, feedback, or suggestion is greatly appreciated!
        </p>
      </section>
    </main>
  );
}

export default Home;