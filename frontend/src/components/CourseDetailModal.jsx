import { useState } from "react";

export default function CourseDetailModal({ course, onClose, onToggleLesson, onOpenCertificate }) {
  const [expandedModule, setExpandedModule] = useState(course?.modules?.[0]?.id || null);

  if (!course) return null;

  const isCompleted = course.progressPercentage >= 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
              {course.code} • {course.category}
            </span>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "0.2rem" }}>
              {course.title}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Progress summary header */}
          <div style={{
            background: "var(--bg-card)",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Instructor</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{course.instructor}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Completion</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: isCompleted ? "var(--accent-success)" : "var(--accent-primary)" }}>
                {course.completedLessons} / {course.totalLessons} ({course.progressPercentage}%)
              </div>
            </div>

            {isCompleted ? (
              <button
                className="btn-primary"
                onClick={() => onOpenCertificate(course)}
                style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              >
                🎓 View Certificate
              </button>
            ) : (
              <div style={{ width: "120px" }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${course.progressPercentage}%` }} />
                </div>
              </div>
            )}
          </div>

          <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.85rem" }}>
            Course Curriculum & Lessons
          </h4>

          {/* Modules Accordion */}
          {course.modules?.map((mod) => {
            const isExpanded = expandedModule === mod.id;
            const completedCountInMod = mod.lessons.filter(l => l.completed).length;

            return (
              <div key={mod.id} className="module-item">
                <div
                  className="module-header"
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span>{isExpanded ? "▼" : "▶"}</span>
                    <span>{mod.title}</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {completedCountInMod}/{mod.lessons.length} done
                  </span>
                </div>

                {isExpanded && (
                  <ul className="lesson-list">
                    {mod.lessons.map((les) => (
                      <li key={les.id} className="lesson-item">
                        <label
                          className={`lesson-checkbox-label ${les.completed ? 'completed' : ''}`}
                          onClick={() => onToggleLesson(course.id, les.id)}
                        >
                          <div className={`custom-checkbox ${les.completed ? 'checked' : ''}`}>
                            {les.completed && "✓"}
                          </div>
                          <span>{les.title}</span>
                        </label>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          {les.duration}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
