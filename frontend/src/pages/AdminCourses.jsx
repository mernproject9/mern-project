import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  LogOut,
  Clock,
  Search,
  Filter,
  User,
  ShieldCheck,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Grid,
  FileText,
  ShieldAlert
} from "lucide-react";

const AdminCourses = () => {
  const { user, token, logout, API_BASE } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Add course form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "Web Development",
    duration: "4 weeks",
    instructor: "",
    modules: "",
    imageUrl: "",
  });

  // Edit course modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    instructor: "",
    modules: "",
    imageUrl: "",
  });

  // Delete confirmation modal state
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 4000);
  };

  // Route protection check
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch courses from backend
  const fetchCourses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        showAlert("danger", "Failed to load courses from backend");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      showAlert("danger", "Network error fetching courses");
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCourses();
    }
  }, [user, token, fetchCourses]);

  // Access Control: Non-admins cannot access this screen
  if (!user) {
    return (
      <div className="loading-spinner" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner"></div>
        <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading session...</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ color: "var(--color-danger)", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <ShieldAlert size={56} />
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Access Denied</h2>
          <p style={{ margin: "16px 0", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            You do not have permission to access the Admin Course Management screen. This area requires administrator credentials.
          </p>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-fill Edit Form
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "Web Development",
      duration: course.duration || "",
      instructor: course.instructor || "",
      modules: Array.isArray(course.modules) ? course.modules.join(", ") : course.modules || "",
      imageUrl: course.imageUrl || "",
    });
  };

  // Send Create Request to Backend
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      showAlert("success", `Course "${data.title}" created successfully!`);
      setShowAddModal(false);
      setNewCourse({
        title: "",
        description: "",
        category: "Web Development",
        duration: "4 weeks",
        instructor: "",
        modules: "",
        imageUrl: "",
      });
      fetchCourses();
    } catch (error) {
      showAlert("danger", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Update Request to Backend
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      showAlert("success", `Course "${data.title}" updated successfully!`);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      showAlert("danger", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Delete Request to Backend
  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${deletingCourse._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete course");
      }

      showAlert("success", `Course "${deletingCourse.title}" deleted successfully!`);
      setDeletingCourse(null);
      fetchCourses();
    } catch (error) {
      showAlert("danger", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "" || course.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categoriesList = [...new Set(courses.map((c) => c.category).filter(Boolean))];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">UL</div>
          <span className="logo-text">UrbanLearner</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" className="sidebar-link">
              <Grid size={20} /> Dashboard
            </Link>
          </li>
          <li>
            <a className="sidebar-link active">
              <BookOpen size={20} /> Manage Courses
            </a>
          </li>
          <li>
            <Link to="/dashboard" className="sidebar-link">
              <FileText size={20} /> Analytics & Reports
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="sidebar-link">
              <ShieldCheck size={20} /> Verify Certificate
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-block"
            style={{ marginTop: "16px", padding: "8px", fontSize: "0.85rem" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="navbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="nav-title">Admin Course Management</h1>
          </div>

          <div className="nav-actions">
            <button
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle size={16} /> Add New Course
            </button>
            <span className="badge badge-info" style={{ textTransform: "uppercase" }}>
              Admin Controls
            </span>
          </div>
        </header>

        <div className="content-body">
          {alert.message && (
            <div className={`alert alert-${alert.type}`} style={{ marginBottom: "24px" }}>
              {alert.message}
            </div>
          )}

          {/* Search & Filter Header */}
          <div className="courses-header" style={{ marginBottom: "24px" }}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search courses by title, instructor, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "320px" }}
              />
            </div>

            <div className="filters-wrapper">
              <Filter size={16} style={{ color: "var(--text-muted)" }} />
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Table View */}
          <div className="chart-card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="card-title">All Registered Courses ({filteredCourses.length})</h3>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading courses...
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="table-wrapper">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Instructor</th>
                      <th>Duration</th>
                      <th>Modules</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{course.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWdith: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {course.description}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{course.category}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <User size={14} style={{ color: "var(--text-muted)" }} />
                            <span>{course.instructor}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Clock size={14} style={{ color: "var(--text-muted)" }} />
                            <span>{course.duration}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {Array.isArray(course.modules) ? course.modules.length : 0} modules
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                              onClick={() => handleOpenEditModal(course)}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                              onClick={() => setDeletingCourse(course)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
                <BookOpen size={48} style={{ strokeWidth: 1, marginBottom: "16px" }} />
                <p>No courses found matching criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD NEW COURSE */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="card-title">Add New Course</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCourse}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Course Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Node.js & Microservices"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Marketing">Digital Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 6 weeks"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instructor Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Morgan"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={newCourse.imageUrl}
                    onChange={(e) => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Modules (Comma Separated) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Intro, Fundamentals, Advanced Concepts, Final Project"
                    value={newCourse.modules}
                    onChange={(e) => setNewCourse({ ...newCourse, modules: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Provide a comprehensive summary of the course..."
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT COURSE (PRE-FILLED WITH EXISTING DATA) */}
      {/* ========================================================= */}
      {editingCourse && (
        <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="card-title">Edit Course Details</h3>
              <button className="modal-close" onClick={() => setEditingCourse(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Course Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Marketing">Digital Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instructor Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.instructor}
                    onChange={(e) => setEditFormData({ ...editFormData, instructor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Modules (Comma Separated) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.modules}
                    onChange={(e) => setEditFormData({ ...editFormData, modules: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCourse(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE COURSE CONFIRMATION PROMPT */}
      {/* ========================================================= */}
      {deletingCourse && (
        <div className="modal-overlay" onClick={() => setDeletingCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                <AlertTriangle size={20} /> Delete Course Confirmation
              </h3>
              <button className="modal-close" onClick={() => setDeletingCourse(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.5" }}>
                Are you sure you want to delete <strong style={{ color: "#fff" }}>"{deletingCourse.title}"</strong>?
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "8px" }}>
                This action is permanent and will remove the course from the database along with associated enrollments.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingCourse(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteCourse}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
