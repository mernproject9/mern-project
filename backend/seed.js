const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/Course");

dotenv.config();

const courses = [
  {
    title: "Full-Stack Web Development Boot Camp",
    description: "Master React, Node.js, Express, and MongoDB. Build production-ready web apps from scratch with modern architecture and UI/UX design.",
    category: "Web Development",
    duration: "8 weeks",
    instructor: "Sarah Jenkins",
    modules: [
      "HTML5 & CSS3 Layouts",
      "Modern JavaScript (ES6+)",
      "React Components & Hooks",
      "State Management (Redux/Context)",
      "Node.js & Express APIs",
      "MongoDB Database Design",
      "JWT Security & Auth Flow",
      "Deployment & Hosting"
    ],
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60"
  },
  {
    title: "Data Science & Machine Learning with Python",
    description: "Learn Python, Pandas, NumPy, Scikit-Learn, and build predictive machine learning models using clean data analysis methodologies.",
    category: "Data Science",
    duration: "6 weeks",
    instructor: "Dr. Alan Turing",
    modules: [
      "Python for Data Science Basics",
      "Data Manipulation with Pandas",
      "Visualizations using Matplotlib",
      "Exploratory Data Analysis",
      "Linear & Logistic Regression",
      "Classification Algorithms",
      "Model Evaluation Metrics"
    ],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60"
  },
  {
    title: "UI/UX Design Masterclass",
    description: "Create premium user interfaces and experiences. Design beautiful wireframes, interactive high-fidelity prototypes, and master Figma.",
    category: "Design",
    duration: "5 weeks",
    instructor: "Emily Golding",
    modules: [
      "Introduction to UX Research",
      "Information Architecture",
      "Wireframing in Figma",
      "Visual Design Systems",
      "Prototyping & Micro-animations",
      "Usability Testing Methods"
    ],
    imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500&auto=format&fit=crop&q=60"
  },
  {
    title: "Digital Marketing Strategy & SEO",
    description: "Boost website organic search traffic. Build high-converting social media marketing strategies, track KPIs, and manage ad budgets.",
    category: "Marketing",
    duration: "4 weeks",
    instructor: "Alex Rivera",
    modules: [
      "SEO Core Principles",
      "Keyword Research & Strategy",
      "On-Page & Technical SEO",
      "Google Analytics & Search Console",
      "Paid Search (Google Ads)",
      "Social Media Campaign Management"
    ],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing courses
    await Course.deleteMany({});
    console.log("Cleared existing courses.");

    // Insert seeded courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`Seeded ${createdCourses.length} courses successfully!`);

    mongoose.connection.close();
    console.log("Seeding complete. Connection closed.");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
