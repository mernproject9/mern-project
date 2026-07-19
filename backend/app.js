var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes
const authRouter = require("./routes/auth");
const coursesRouter = require("./routes/courses");
const enrollmentsRouter = require("./routes/enrollments");
const studentsRouter = require("./routes/students"); // Kept for legacy support

dotenv.config();

connectDB();

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middlewares
app.use(cors({
  origin: "*", // Allow all origins for testing/development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Route Mounts
app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/students", studentsRouter); // Kept for legacy support

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;