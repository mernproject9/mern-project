const mongoose = require("mongoose");
const dns = require("dns");
const seedDB = require("./seed");

const connectDB = async () => {
  try {
    // Set Google DNS and Cloudflare DNS to bypass local DNS timeout/refusal issues
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
    await seedDB();
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;