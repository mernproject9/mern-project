import { useState, useMemo } from "react";
import CourseCard from "./CourseCard";

export default function CourseProgressGrid({
  courses = [],
  loading = false,
  onSelectCourse,
  onOpenCertificate,
  onOpenEnrollModal,
  searchQuery = ""
}) {
  const [statusTab, setStatusTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress-desc");

  // Calculate status counts
  const counts = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let notStarted = 0;

    courses.forEach(c => {
      if (c.progressPercentage >= 100 || c.status === "completed") {
        completed++;
      } else if (c.progressPercentage === 0 || c.status === "not-started") {
        notStarted++;
      } else {
        inProgress++;
      }
    });

    return { total: courses.length, inProgress, completed, notStarted };
  }, [courses]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const cats = new Set(courses.map(c => c.category));
    return ["all", ...Array.from(cats)];
  }, [courses]);

  // Filtered & sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter(c => {
        if (statusTab === "in-progress" && (c.progressPercentage === 0 || c.progressPercentage >= 100)) return false;
        if (statusTab === "completed" && c.progressPercentage < 100) return false;
        if (statusTab === "not-started" && c.progressPercentage > 0) return false;

        if (categoryFilter !== "all" && c.category !== categoryFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchCode = c.code.toLowerCase().includes(q);
          const matchInstructor = c.instructor.toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchInstructor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "progress-desc") return b.progressPercentage - a.progressPercentage;
        if (sortBy === "progress-asc") return a.progressPercentage - b.progressPercentage;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [courses, statusTab, categoryFilter, sortBy, searchQuery]);

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Enrolled Course Progress ({filteredCourses.length})
        </h2>

        {/* Status Filter Tabs */}
        <div className="tab-group" role="tablist" aria-label="Course Status Filter Tabs">
          <button
            className={`tab-btn ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
          >
            All ({counts.total})
          </button>
          <button
            className={`tab-btn ${statusTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setStatusTab('in-progress')}
          >
            In-Progress ({counts.inProgress})
          </button>
          <button
            className={`tab-btn ${statusTab === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusTab('completed')}
          >
            Completed ({counts.completed})
          </button>
          <button
            className={`tab-btn ${statusTab === 'not-started' ? 'active' : ''}`}
            onClick={() => setStatusTab('not-started')}
          >
            Not Started ({counts.notStarted})
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Category:</span>
          <select
            className="select-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Sort By:</span>
          <select
            className="select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="progress-desc">Progress: Highest First</option>
            <option value="progress-asc">Progress: Lowest First</option>
            <option value="title">Course Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Course Cards with Integrated Progress Bars */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
          Fetching real-time course progress from API...
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCourse={onSelectCourse}
              onOpenCertificate={onOpenCertificate}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "3rem 1.5rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-color)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No Enrolled Courses Found
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            {searchQuery ? `No matches for "${searchQuery}"` : `No courses in the "${statusTab}" filter.`}
          </p>
          <button className="btn-primary" onClick={onOpenEnrollModal}>
            Explore Catalog & Enroll
          </button>
        </div>
      )}
    </div>
  );
}
