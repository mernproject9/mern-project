# Backend Student Management API

This project is a lightweight, backend RESTful API built with Express.js and MongoDB (using Mongoose) for managing student records.

## Project Metadata & Environment

- **Server Port:** `5000` (default, customizable via `PORT` environment variable)
- **Database:** MongoDB Atlas (URI configured in [.env](file:///C:/Users/Narayan/Desktop/backend-26/.env))
- **Entry Point:** [app.js](file:///C:/Users/Narayan/Desktop/backend-26/app.js)
- **Startup Script:** [bin/www](file:///C:/Users/Narayan/Desktop/backend-26/bin/www)

---

## Technical Stack

- **Framework:** Express.js (~4.16.1)
- **Database ORM:** Mongoose (^9.7.4)
- **Environment Management:** Dotenv (^17.4.2)
- **Logger:** Morgan (~1.9.1)
- **Parser:** Cookie-parser (~1.4.4)
- **Template Engine:** Jade (~1.11.0) (configured for rendering views)

---

## Directory Structure

```text
backend-26/
├── bin/
│   └── www             # HTTP Server startup configuration
├── config/
│   └── db.js           # Database connection configuration (MongoDB)
├── models/
│   └── Student.js      # Student Mongoose schema & model
├── routes/
│   └── students.js     # RESTful CRUD routes for Students
├── views/              # Jade views (for error rendering)
├── public/             # Static files directory
├── app.js              # Express app setup and middleware configuration
├── package.json        # Dependencies and scripts
└── .env                # Environment variables configuration
```

---

## Database Configuration

The database connection is initialized in [config/db.js](file:///C:/Users/Narayan/Desktop/backend-26/config/db.js) using the `MONGO_URI` environment variable:

```javascript
// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
```

---

## Data Model: Student

Defined in [models/Student.js](file:///C:/Users/Narayan/Desktop/backend-26/models/Student.js), the [Student](file:///C:/Users/Narayan/Desktop/backend-26/models/Student.js) model has the following schema:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | Name of the student |
| `email` | `String` | Yes | Contact email address |
| `age` | `Number` | Yes | Age of the student |

---

## REST API Endpoints

All routes for managing students are prefixed with `/students` and configured in [routes/students.js](file:///C:/Users/Narayan/Desktop/backend-26/routes/students.js).

| Method | Endpoint | Description | Request Body Example | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/students` | Create a new student | `{ "name": "John Doe", "email": "john@example.com", "age": 21 }` | `201 Created` with student JSON object |
| **GET** | `/students` | Retrieve list of all students | *None* | `200 OK` with JSON array of students |
| **GET** | `/students/:id` | Retrieve details of a specific student by ID | *None* | `200 OK` with student JSON object |
| **PUT** | `/students/:id` | Update details of a student by ID | `{ "age": 22 }` | `200 OK` with updated student JSON object |
| **DELETE** | `/students/:id` | Delete a student by ID | *None* | `200 OK` with `{ "message": "Student Deleted Successfully" }` |

---

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The server will start listening on port `5000` (or the port defined by `process.env.PORT`).
