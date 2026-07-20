import { useState } from "react";
import StudentForm from "./StudentForm";

export default function StudentSwitcherModal({ currentStudent, onSelectStudent, onClose }) {
  const [demoStudents] = useState([
    {
      id: "demo_1",
      name: "Alex Morgan",
      email: "alex.morgan@university.edu",
      department: "Computer Science & AI",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "demo_2",
      name: "Sophia Chen",
      email: "sophia.chen@tech.edu",
      department: "Data Engineering",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "demo_3",
      name: "Marcus Vance",
      email: "marcus.vance@design.edu",
      department: "Human Computer Interaction",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ]);

  const [activeTab, setActiveTab] = useState("select");

  const handleCreateStudent = (formData) => {
    const newStudent = {
      id: "std_" + Date.now(),
      name: formData.name,
      email: formData.email,
      department: formData.course || "General Software Engineering",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };
    onSelectStudent(newStudent);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>Student Profile Manager</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Switch active student profile or register a new student</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="tab-group" style={{ marginBottom: "1.25rem" }}>
            <button
              className={`tab-btn ${activeTab === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTab('select')}
              style={{ flex: 1 }}
            >
              Select Profile
            </button>
            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
              style={{ flex: 1 }}
            >
              Register New Student
            </button>
          </div>

          {activeTab === "select" ? (
            <div className="student-switcher-grid">
              {demoStudents.map((st) => (
                <div
                  key={st.id}
                  className={`student-card-option ${currentStudent?.email === st.email ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectStudent(st);
                    onClose();
                  }}
                >
                  <img src={st.avatar} alt={st.name} style={{ width: "50px", height: "50px", borderRadius: "50%", marginBottom: "0.5rem" }} />
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{st.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{st.department}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
              <StudentForm setStudent={handleCreateStudent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
