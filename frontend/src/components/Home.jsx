import React from "react";
import "../css/Home.css";

const Home = () => {
  return (
    <main className="home">
      <section className="TitleCard">
        <h1>Public Data Explorer</h1>
        <h2>Discover public data, simply and interactively</h2>
        <p>
          A free site for visualizing and exploring public datasets (e.g. economy, population, education) through clear, interactive charts.
        </p>
      </section>

      <section className="card">
        <h2>What can you do here?</h2>
        <ul>
          <li>
            <a href="#/dashboard">Dashboard</a> – view charts and explore real data
          </li>
          <li>
            <a href="#/register">Create an account</a> or <a href="#/login">log in</a> to save preferences and export charts
          </li>
          <li>
            <a href="#/about">About</a> – technical details and project motivation
          </li>
          <li>
            <a href="#/faq">FAQ</a> – quick answers
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Good to know</h2>
        <p>
          This site is <b>free</b> and has no subscriptions – I originally planned premium plans, but decided to keep it open for everyone. If you want to support the project, donation options may be added in the future.
        </p>
        <p>
          Built by a passionate student as a portfolio and learning project. Anyone can use the platform to learn or explore real-world data.
        </p>
      </section>
    </main>
  );
}

export default Home;