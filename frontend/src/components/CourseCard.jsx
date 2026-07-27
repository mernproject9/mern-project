import { useNavigate } from "react-router-dom";

export default function CourseCard({ course, onSelectCourse, onOpenCertificate }) {
  const navigate = useNavigate();

  const isCompleted = course.progressPercentage >= 100 || course.status === "completed";
  const isNotStarted = course.progressPercentage === 0 || course.status === "not-started";
  const isInProgress = !isCompleted && !isNotStarted;

  const handleOpenDetail = (e) => {
    e.stopPropagation();
    // Save scroll position for back navigation preservation
    sessionStorage.setItem("catalog_scroll_pos", window.scrollY.toString());
    const targetId = course.id || course._id || course.code;
    navigate(`/course/${targetId}`);
  };

  return (
    <div className="course-card" onClick={handleOpenDetail} style={{ cursor: "pointer" }}>
      <div
        className="course-banner"
        style={{ background: course.thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
      >
        <span className="course-badge">{course.category}</span>
        
        {isCompleted && (
          <span className="course-status-pill status-completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Completed
          </span>
        )}

        {isInProgress && (
          <span className="course-status-pill status-active">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            In Progress
          </span>
        )}

        {isNotStarted && (
          <span className="course-status-pill" style={{ background: "rgba(245, 158, 11, 0.9)", color: "white" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Not Started
          </span>
        )}
      </div>

      <div className="course-body">
        <div className="course-code">{course.code}</div>
        <h3 className="course-title" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
        <div className="course-instructor">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {course.instructor}
        </div>

        <div className="progress-container">
          <div className="progress-header">
            <span style={{ color: "var(--text-secondary)" }}>
              {course.completedLessons} of {course.totalLessons} Lessons
            </span>
            <span style={{
              color: isCompleted ? "var(--accent-success)" : isNotStarted ? "var(--text-muted)" : "var(--accent-primary)",
              fontWeight: 700
            }}>
              {course.progressPercentage}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${isCompleted ? 'completed' : ''}`}
              style={{
                width: `${course.progressPercentage}%`,
                background: isNotStarted ? "var(--text-muted)" : isCompleted ? "linear-gradient(90deg, #10b981 0%, #059669 100%)" : "var(--gradient-brand)"
              }}
            />
          </div>
        </div>

        {isInProgress && course.nextLesson && (
          <div className="next-lesson-box">
            <div className="next-label">Next Up ({course.nextLesson.duration})</div>
            <div className="next-title">{course.nextLesson.lessonTitle}</div>
          </div>
        )}

        {isNotStarted && (
          <div className="next-lesson-box" style={{ borderLeftColor: "var(--accent-warning)", background: "rgba(245, 158, 11, 0.1)" }}>
            <div className="next-label" style={{ color: "var(--accent-warning)" }}>Ready to Begin</div>
            <div className="next-title">Start Module 1 Lesson 1</div>
          </div>
        )}

        {isCompleted && (
          <div className="next-lesson-box" style={{ borderLeftColor: "var(--accent-success)", background: "rgba(16, 185, 129, 0.1)" }}>
            <div className="next-label" style={{ color: "var(--accent-success)" }}>Course Finished</div>
            <div className="next-title">All {course.totalLessons} lessons completed!</div>
          </div>
        )}

        <div className="course-card-footer" style={{ gap: "0.5rem" }}>
          <button
            className="btn-card-action primary"
            onClick={handleOpenDetail}
          >
            📖 Full Course Details
          </button>

          <button
            className="btn-card-action"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCourse(course);
            }}
            title="Lessons & Syllabus Checklist"
            style={{ width: "auto", padding: "0.55rem 0.75rem" }}
          >
            📋
          </button>

          {isCompleted && (
            <button
              className="btn-card-action"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCertificate(course);
              }}
              title="View Certificate"
              style={{ width: "auto", padding: "0.55rem 0.75rem" }}
            >
              🎓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
