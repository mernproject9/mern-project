import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import AdminCourses from "./pages/AdminCourses";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Redirect logic */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Course Management routes */}
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/manage-courses" element={<AdminCourses />} />

          {/* Course Details route */}
          <Route path="/courses/:id" element={<CourseDetail />} />
          
          {/* Dashboard route (Role-based logic inside) */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
