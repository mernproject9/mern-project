const Course = require("../models/Course");

const sampleCourses = [
  {
    title: "Urban Coding Initiative: Web Development Foundations",
    description: "Master HTML, CSS, and modern JavaScript to build fully responsive websites. Designed specifically for community-driven digital skill building and starting a tech career in urban environments.",
    instructor: "Sarah Jenkins",
    category: "Web Development",
    duration: "6 Weeks",
    modules: [
      "HTML5 & Semantic Structure",
      "Modern CSS & Flexbox/Grid",
      "JavaScript Core Concepts & Control Flow",
      "DOM Manipulation & Event Listeners",
      "Building a Portfolio Project",
      "Deploying to Netlify & GitHub Essentials"
    ]
  },
  {
    title: "Digital Literacy & Professional Success",
    description: "Learn how to leverage modern digital productivity suites, collaborate via cloud workspaces, and safely navigate digital systems to unlock career pathways in today's workforce.",
    instructor: "Marcus Vance",
    category: "Digital Literacy",
    duration: "4 Weeks",
    modules: [
      "Introduction to Workspace Environments",
      "Professional Email & Collaboration Tools",
      "Spreadsheets & Data Entry Basics",
      "Web Safety, Privacy, & Cybersecurity",
      "Digital Portfolios & Online Identity"
    ]
  },
  {
    title: "Data-Driven Urban Analytics & Visualization",
    description: "Learn to analyze public municipal datasets, map urban development trends, and visualize key urban indicators to solve community problems through data science.",
    instructor: "Dr. Elena Rostova",
    category: "Data Science",
    duration: "8 Weeks",
    modules: [
      "Introduction to Municipal Datasets",
      "Data Cleaning & Excel Wrangling",
      "Basic Statistics & Analytical Indicators",
      "Introduction to GIS and Spatial Mapping",
      "Telling Stories with Data and Charts"
    ]
  },
  {
    title: "Mobile App Development for Civic Engagement",
    description: "Build functional mobile apps using React Native. Focus on building community-centric apps for resource sharing, local messaging, and public transit navigation.",
    instructor: "Tariq Mahmood",
    category: "Mobile Development",
    duration: "10 Weeks",
    modules: [
      "Mobile Architecture & React Native Intro",
      "Layouts & User Input Handling",
      "Connecting to REST APIs",
      "Utilizing Maps & Location Services",
      "State Management & Local Cache",
      "Publishing to App Stores"
    ]
  }
];

const seedDB = async () => {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log("No courses found. Seeding database with default courses...");
      await Course.insertMany(sampleCourses);
      console.log("Database Seeded Successfully!");
    } else {
      console.log("Database already contains courses. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};

module.exports = seedDB;
