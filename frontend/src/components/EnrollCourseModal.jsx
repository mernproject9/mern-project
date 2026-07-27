import { useState } from "react";

export default function EnrollCourseModal({ onClose, onEnrollCourse }) {
  const [catalog] = useState([
    {
      id: "cat_1",
      title: "Cybersecurity & Network Defense",
      code: "SEC-301",
      category: "Security",
      instructor: "Cmdr. Robert Sterling",
      estimatedHours: 30,
      totalLessons: 12,
      thumbnailGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
      modules: [
        {
          id: "sec_m1",
          title: "Module 1: Network Architecture & Protocols",
          lessons: [
            { id: "sec_l101", title: "TCP/IP Stack & Packet Inspection", duration: "45m", completed: false },
            { id: "sec_l102", title: "Wireshark Packet Analysis", duration: "50m", completed: false }
          ]
        }
      ]
    },
    {
      id: "cat_2",
      title: "Mobile App Engineering with React Native",
      code: "MOB-210",
      category: "Mobile Dev",
      instructor: "Jessica Lin",
      estimatedHours: 38,
      totalLessons: 16,
      thumbnailGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e40af 100%)",
      modules: [
        {
          id: "mob_m1",
          title: "Module 1: Native Components & Navigation",
          lessons: [
            { id: "mob_l101", title: "React Native Setup & Expo CLI", duration: "40m", completed: false },
            { id: "mob_l102", title: "React Navigation v6 Stacks", duration: "55m", completed: false }
          ]
        }
      ]
    },
    {
      id: "cat_3",
      title: "Cloud Infrastructure & Terraform",
      code: "CLOUD-405",
      category: "DevOps & Cloud",
      instructor: "Marcus Vance",
      estimatedHours: 25,
      totalLessons: 10,
      thumbnailGradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
      modules: [
        {
          id: "tf_m1",
          title: "Module 1: Infrastructure as Code Basics",
          lessons: [
            { id: "tf_l101", title: "Terraform Providers & State Files", duration: "50m", completed: false }
          ]
        }
      ]
    }
  ]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>Explore Course Catalog</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Enroll in new courses to expand your skill set</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {catalog.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                    {item.code} • {item.category}
                  </span>
                  <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: "0.2rem 0" }}>{item.title}</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Instructor: {item.instructor} • ~{item.estimatedHours} hrs
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => onEnrollCourse(item)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
