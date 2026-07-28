import React from "react";
import Navbar from "../components/Navbar";
import StudentForm from "../components/StudentForm";
import Footer from "../components/Footer";

function Register() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <StudentForm />
      </main>

      <Footer />
    </div>
  );
}

export default Register;
