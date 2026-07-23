import React from "react";

function CourseCatalog() {
  const courses = [
    {
      id: 1,
      title: "MERN Stack Development",
      provider: "Intern Nexus",
      description: "Learn MongoDB, Express, React, and Node.js."
    },
    {
      id: 2,
      title: "Java Programming",
      provider: "Intern Nexus",
      description: "Learn Java from basic to advanced."
    },
    {
      id: 3,
      title: "Data Structures",
      provider: "Intern Nexus",
      description: "Master arrays, linked lists, stacks, queues and trees."
    }
  ];

  return (
    <div>
      <h2>Course Catalog</h2>

      {courses.map((course) => (
        <div
          key={course.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px"
          }}
        >
          <h3>{course.title}</h3>
          <p><strong>Provider:</strong> {course.provider}</p>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
}

export default CourseCatalog;
