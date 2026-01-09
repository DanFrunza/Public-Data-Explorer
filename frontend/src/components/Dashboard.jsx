import React from "react";
import "../css/Dashboard.css";
import GdpCard from "./charts/GdpCard.jsx";


const Dashboard = () => {
  return (
    <main className="dashboard">
      <h1>Dashboard</h1>
      <section className="card">
        <GdpCard />
      </section>
    </main>
  );
}

export default Dashboard;