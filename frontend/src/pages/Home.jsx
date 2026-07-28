import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import SearchBar from "../components/SearchBar";
import FeaturedCourses from "../components/FeaturedCourses";
import CourseCatalog from "../components/CourseCatalog";
import Footer from "../components/Footer";

function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      <div className="container" style={{ flex: 1 }}>
        <Navbar />
        <Hero />
        <Stats />
        <SearchBar />
        <FeaturedCourses />
        <CourseCatalog />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
