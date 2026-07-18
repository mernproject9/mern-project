import { useState } from "react";

function StudentForm({ setStudent }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    role: "Student",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setStudent(formData);

    setFormData({
      name: "",
      email: "",
      course: "",
      role: "Student",
    });
  };

  return (
    <form onSubmit={handleSubmit}>

      <label>
        Name
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Course
        <input
          type="text"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Role
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
          <option value="Admin">Admin</option>
        </select>
      </label>

      <button type="submit">Sign Up</button>

    </form>
  );
}

export default StudentForm;