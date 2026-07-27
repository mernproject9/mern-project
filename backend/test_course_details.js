const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Course = require("./models/Course");
const coursesRouter = require("./routes/courses");
const express = require("express");
const http = require("http");

async function testCourseDetails() {
  console.log("--- Starting Course Detail Route & Data Verification ---");

  // Create Express app test instance
  const app = express();
  app.use(express.json());
  app.use("/api/courses", coursesRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/courses`;

  try {
    // Connect DB if possible
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI).catch(() => {});
    }

    // Test 1: Fetch list of courses
    const listRes = await fetch(baseUrl);
    const catalog = await listRes.json();
    console.log("1. Catalog list returned count:", catalog.length);
    if (!catalog || catalog.length === 0) {
      throw new Error("Catalog list is empty!");
    }

    // Test 2: Fetch single course details by ID parameter (e.g. c_mern or CS-401)
    const testId = catalog[0]._id || catalog[0].code || "c_mern";
    console.log(`2. Requesting detail page for course ID: ${testId}`);

    const detailRes = await fetch(`${baseUrl}/${testId}`);
    if (!detailRes.ok) {
      throw new Error(`Failed to fetch course detail, status: ${detailRes.status}`);
    }

    const courseDetail = await detailRes.json();
    console.log("3. Received course detail object successfully:");
    console.log("   - Title:", courseDetail.title);
    console.log("   - Code:", courseDetail.code);
    console.log("   - Instructor:", courseDetail.instructor);
    console.log("   - Instructor Role:", courseDetail.instructorRole);
    console.log("   - Description:", courseDetail.description ? courseDetail.description.substring(0, 60) + "..." : "Missing");
    console.log("   - Modules Count:", courseDetail.modules ? courseDetail.modules.length : 0);

    // Verify Acceptance Criteria required fields
    if (!courseDetail.description) {
      throw new Error("Acceptance Criteria failed: Course description is missing!");
    }
    if (!courseDetail.instructor) {
      throw new Error("Acceptance Criteria failed: Instructor info is missing!");
    }
    if (!courseDetail.modules || courseDetail.modules.length === 0) {
      throw new Error("Acceptance Criteria failed: Course syllabus/modules are missing!");
    }

    console.log("\n✅ ALL COURSE DETAIL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Course detail test error:", err.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect().catch(() => {});
    }
    server.close(() => {
      process.exit(0);
    });
  }
}

testCourseDetails();
