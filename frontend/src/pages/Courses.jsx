import React from "react";
import Navbar from "../components/Navbar";
import CourseCatalog from "../components/CourseCatalog";
import Footer from "../components/Footer";

function Courses() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      <div className="container" style={{ flex: 1 }}>
        <Navbar />

        <div style={{ marginTop: "10px", marginBottom: "25px" }}>
          <h1 style={{ fontSize: "32px", color: "#f8fafc", margin: 0 }}>📚 Urban Course Catalog</h1>
          <p style={{ color: "#94a3b8", fontSize: "15px", marginTop: "6px" }}>
            Explore industry-crafted curriculums designed to empower urban learners and eliminate EdTech fragmentation.
          </p>
        </div>

        <CourseCatalog />
      </div>

      <Footer />
    </div>
  );
}

export default Courses;
