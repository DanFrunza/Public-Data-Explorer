import React from "react";
import "../../css/DashboardCard.css";

const DashboardCard = ({ children, className = "", ...props }) => (
  <div className={`dashboard-card ${className}`} {...props}>
    {children}
  </div>
);

export default DashboardCard;
