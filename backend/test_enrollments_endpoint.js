const express = require("express");
const http = require("http");
const usersRoutes = require("./routes/users");

async function testEnrollmentsEndpoint() {
  console.log("--- Starting GET /users/:id/enrollments Endpoint Verification ---");

  const app = express();
  app.use(express.json());
  app.use("/users", usersRoutes);
  app.use("/api/users", usersRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Test 1: GET /users/demo_1/enrollments
    const testId = "demo_1";
    console.log(`1. Requesting GET /users/${testId}/enrollments...`);

    const res1 = await fetch(`${baseUrl}/users/${testId}/enrollments`);
    if (!res1.ok) {
      throw new Error(`GET /users/${testId}/enrollments returned HTTP ${res1.status}`);
    }

    const data1 = await res1.json();
    console.log("   - Status Code:", res1.status);
    console.log("   - Is Array:", Array.isArray(data1));
    console.log("   - Returned Courses Count:", data1.length);

    if (!Array.isArray(data1) || data1.length === 0) {
      throw new Error("Response is not a valid array of enrolled courses!");
    }

    // Verify first enrolled course properties
    const course1 = data1[0];
    console.log("   - Course Title:", course1.title);
    console.log("   - Course Code:", course1.code);
    console.log("   - Instructor:", course1.instructor);
    console.log("   - Progress:", course1.progressPercentage + "%");

    if (!course1.title || !course1.code || course1.progressPercentage === undefined) {
      throw new Error("Enrolled course object is missing essential fields!");
    }

    // Test 2: GET /api/users/demo_1/enrollments
    console.log(`\n2. Requesting GET /api/users/${testId}/enrollments...`);
    const res2 = await fetch(`${baseUrl}/api/users/${testId}/enrollments`);
    if (!res2.ok) {
      throw new Error(`GET /api/users/${testId}/enrollments returned HTTP ${res2.status}`);
    }

    const data2 = await res2.json();
    console.log("   - Status Code:", res2.status);
    console.log("   - Returned Courses Count:", data2.length);

    console.log("\n✅ GET /users/:id/enrollments ENDPOINT VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Test error:", err.message);
    process.exit(1);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
}

testEnrollmentsEndpoint();
