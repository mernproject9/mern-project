import React from "react";
import "./FeaturedCourses.css";

function FeaturedCourses() {
  return (
    <div className="featured">
      <h2>🔥 Featured Courses</h2>

      <div className="featured-grid">
        <div className="featured-card">
          <h3>💻 MERN Stack</h3>
          <p>Learn Full Stack Development</p>
        </div>

        <div className="featured-card">
          <h3>☕ Java</h3>
          <p>Object Oriented Programming</p>
        </div>

        <div className="featured-card">
          <h3>📊 Data Structures</h3>
          <p>Master Algorithms & DSA</p>
        </div>
      </div>
    </div>
  );
}

export default FeaturedCourses;
