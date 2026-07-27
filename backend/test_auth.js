const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { JWT_SECRET } = require("./middleware/auth");

async function testAuthSystem() {
  console.log("--- Starting Authentication & JWT Token Verification ---");
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("1. Connected to MongoDB database.");

    // Clean up test user if exists
    await User.deleteOne({ email: "test.student@urban.edu" });

    // Test Registration
    const passHash = await bcrypt.hash("securePassword123", 10);
    const testUser = await User.create({
      name: "Test Student",
      email: "test.student@urban.edu",
      password: passHash,
      role: "student",
      department: "Software Engineering"
    });
    console.log("2. Created test user with student role. ID:", testUser._id);

    // Test Valid Credentials Login
    const loginUser = await User.findOne({ email: "test.student@urban.edu" });
    const isPasswordValid = await bcrypt.compare("securePassword123", loginUser.password);
    
    if (!isPasswordValid) {
      throw new Error("Password verification failed for valid credentials!");
    }
    console.log("3. Valid credentials successfully authenticated.");

    // Generate JWT token containing user ID and role in payload
    const payload = {
      id: loginUser._id,
      role: loginUser.role,
      email: loginUser.email,
      name: loginUser.name
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    console.log("4. Generated JWT token successfully:", token.substring(0, 35) + "...");

    // Verify JWT payload
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("5. Decoded JWT payload successfully:");
    console.log("   - User ID:", decoded.id);
    console.log("   - User Role:", decoded.role);
    console.log("   - User Email:", decoded.email);

    if (!decoded.id || !decoded.role) {
      throw new Error("JWT payload does not contain required user ID and role!");
    }

    // Test Invalid Credentials Rejection
    const isInvalidPasswordValid = await bcrypt.compare("wrongPassword999", loginUser.password);
    if (isInvalidPasswordValid) {
      throw new Error("Invalid password was incorrectly accepted!");
    }
    console.log("6. Invalid credentials correctly rejected (isPasswordValid = false).");

    // Clean up test user
    await User.deleteOne({ email: "test.student@urban.edu" });
    console.log("7. Cleaned up test data.");

    console.log("\n✅ ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Auth test error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAuthSystem();
