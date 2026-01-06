import React from "react";
import "../css/Dashboard.css";
import CryptoChartD3 from "./charts/CryptoChartD3";

const Dashboard = () => {
  return (
    <main className="dashboard">
      <h1>Dashboard</h1>
      <CryptoChartD3 />
    </main>
  );
}

export default Dashboard;