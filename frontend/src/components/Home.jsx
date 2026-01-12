import React from "react";
import "../css/Home.css";

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
            <a href="#/dashboard">Dashboard</a> – interactive charts with real data
          </li>
          <li>
            <a href="#/register">Create an account</a> or <a href="#/login">log in</a> to save preferences and export charts
          </li>
          <li>
            <a href="#/about">About</a> – technical details and motivation
          </li>
          <li>
            <a href="#/faq">FAQ</a> – quick answers
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Support the project</h2>
        <p>
          You can support the creator by donating! <a href="#/plans">See details here</a>.
        </p>
        <p>
          The platform is built as a portfolio and educational resource. Anyone can explore real data and learn.
        </p>
      </section>
    </main>
  );
}

export default Home;