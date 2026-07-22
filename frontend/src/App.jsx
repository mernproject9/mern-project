import { useState, useEffect } from "react";
import StudentForm from "./components/StudentForm";
import StudentCard from "./components/StudentCard";
import "./App.css";
 
function App() {
  const [student, setStudent] = useState(null);
 
  useEffect(() => {
    if (student) {
      const roleStr = student.role ? ` (${student.role})` : "";
      document.title = `Welcome, ${student.name}${roleStr}`;
    } else {
      document.title = "Student Profile Manager";
    }
  }, [student]);
 
  return (
    <div className="container">
      <h1>User Account & Role Manager</h1>
{student && (
  <nav>
    <h3>Navigation</h3>

    {student.role === "Admin" && (
      <p>🏠 Dashboard | 👥 Users | ⚙️ Settings</p>
    )}

    {student.role === "Instructor" && (
      <p>🏠 Dashboard | 📚 Courses | 📝 Students</p>
    )}

    {student.role === "Student" && (
      <p>🏠 Dashboard | 📖 My Courses | 🎓 Profile</p>
    )}
  </nav>
)} 
      <StudentForm setStudent={setStudent} />
 
      <hr />
 
      {student ? (
        <StudentCard student={student} />
      ) : (
        <h3>No Profile Registered Yet</h3>
      )}
    </div>
  );
}
 
export default App;
