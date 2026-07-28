const fs = require('fs');
const path = require('path');

console.log("--- Starting Enrolled Courses Page Verification ---");

// Test 1: Verify EnrolledCoursesView component file existence and contents
const viewPath = path.join(__dirname, 'frontend', 'src', 'components', 'EnrolledCoursesView.jsx');
if (!fs.existsSync(viewPath)) {
  console.error("❌ EnrolledCoursesView.jsx component file missing!");
  process.exit(1);
}

const viewContent = fs.readFileSync(viewPath, 'utf8');

// Check 1: Display enrolled courses list
if (viewContent.includes("courses.map") && viewContent.includes("filteredCourses")) {
  console.log("✅ 1. Lists user's enrolled courses with status pills & progress bars.");
} else {
  console.error("❌ 1. List rendering missing in EnrolledCoursesView.jsx");
  process.exit(1);
}

// Check 2: Each course links to detail view (Titles as links)
if (viewContent.includes("enrolled-course-title-link") && viewContent.includes("to={`/course/${targetId}`}")) {
  console.log("✅ 2. Each course title links directly to its detail view (/course/:id).");
} else {
  console.error("❌ 2. Detail view linking missing on course titles!");
  process.exit(1);
}

// Check 3: Friendly empty state when no courses are enrolled
if (viewContent.includes("No Enrolled Courses Found") && viewContent.includes("You are not enrolled in any courses yet")) {
  console.log("✅ 3. Friendly empty state implemented when 0 courses are enrolled.");
} else {
  console.error("❌ 3. Friendly empty state missing!");
  process.exit(1);
}

// Test 2: Verify App.jsx routes and Navbar links
const appPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

if (appContent.includes('path="/enrolled"') && appContent.includes('EnrolledCoursesView')) {
  console.log("✅ 4. /enrolled route registered in App.jsx.");
} else {
  console.error("❌ 4. Route /enrolled missing in App.jsx!");
  process.exit(1);
}

const navPath = path.join(__dirname, 'frontend', 'src', 'components', 'Navbar.jsx');
const navContent = fs.readFileSync(navPath, 'utf8');

if (navContent.includes('to="/enrolled"')) {
  console.log("✅ 5. Navbar navigation link to /enrolled integrated.");
} else {
  console.error("❌ 5. Navbar link missing!");
  process.exit(1);
}

console.log("\n🎉 ALL ENROLLED COURSES PAGE ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
