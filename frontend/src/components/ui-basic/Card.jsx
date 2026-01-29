import React from "react";
import "../../css/Card.css";

const Card = ({ children, className = "", ...props }) => (
  <div className={`ui-basic-card ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
