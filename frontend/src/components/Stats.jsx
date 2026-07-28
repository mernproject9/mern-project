import React from "react";
import "./Stats.css";

function Stats() {
  return (
    <div className="stats">
      <div className="stat-card">
        <h2>5000+</h2>
        <p>👨‍🎓 Students</p>
      </div>

      <div className="stat-card">
        <h2>120+</h2>
        <p>📚 Courses</p>
      </div>

      <div className="stat-card">
        <h2>4.9⭐</h2>
        <p>Average Rating</p>
      </div>
    </div>
  );
}

export default Stats;

