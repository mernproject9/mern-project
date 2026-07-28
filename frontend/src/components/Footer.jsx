import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <h2>🎓 EduLearn</h2>

      <p>Learn. Build. Grow.</p>

      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/login">Login</a>
        <a href="/dashboard">Dashboard</a>
      </div>

      <p>© 2026 EduLearn. All Rights Reserved.</p>
    </footer>
  );
}

export default Footer;
