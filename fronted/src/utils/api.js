const API_URL = "http://localhost:5000";

// Auth helpers
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const clearUser = () => localStorage.removeItem("user");

// Generic fetch wrapper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const api = {
  // Auth
  login: (email, password) => 
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  register: (name, email, password, role) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: () => request("/auth/me"),

  // Courses
  getCourses: () => request("/courses"),
  getCourseById: (id) => request(`/courses/${id}`),
  createCourse: (courseData) =>
    request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    }),
  updateCourse: (id, courseData) =>
    request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    }),

  // Enrollments
  enroll: (courseId) =>
    request("/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
  
  getMyEnrollments: () => request("/enrollments/my"),
  
  updateProgress: (enrollmentId, completedModules) =>
    request(`/enrollments/${enrollmentId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ completedModules }),
    }),

  // Admin Stats & Reports
  getAdminStats: () => request("/enrollments/admin/stats"),
  getAdminReports: () => request("/enrollments/admin/reports"),
};
