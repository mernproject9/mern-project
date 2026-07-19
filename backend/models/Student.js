const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

 password: {
  type: String,
  required: true,
},

role: {
  type: String,
  enum: ["Student", "Instructor", "Admin"],
  default: "Student",
},
});

module.exports = mongoose.model("Student", studentSchema);
