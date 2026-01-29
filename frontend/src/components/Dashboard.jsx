

import React from "react";
import DashboardCard from "./ui-basic/DashboardCard.jsx";
import GdpCard from "./charts/GdpCard.jsx";
import "../css/Dashboard.css";

const Dashboard = () => (
  <main className="dashboard-modern">
    {/* Hero Section (light color) */}
    <section className="dashboard-hero-section">
      <div className="dashboard-hero-content">
        <div className="dashboard-hero-badge">Data Insights</div>
        <h1 className="dashboard-hero-title">
          <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="dashboard-hero-desc">
          Discover interactive charts and real-world statistics.<br/>
          Analyze economic, social and other public data, fast and intuitively.
        </p>
      </div>
    </section>

    {/* Charts Section (single dark color) */}
    <section className="dashboard-charts-section">
      <div className="dashboard-container">
        <div className="dashboard-grid">
          <DashboardCard>
            <div className="dashboard-card-title">
              <span className="dashboard-dot" /> GDP Data (World Bank)
            </div>
            <div className="dashboard-card-content">
              <GdpCard />
            </div>
          </DashboardCard>
        </div>
      </div>
    </section>
  </main>
);

export default Dashboard;