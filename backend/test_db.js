const dns = require("dns");
// Set Google DNS and Cloudflare DNS to bypass local DNS timeout/refusal issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const testConnection = async () => {
  const uris = [
    "mongodb+srv://yashwardhankumar12:Yash2030@zrd7jyj.mongodb.net/studentbigDB?retryWrites=true&w=majority",
    "mongodb+srv://yashwardhankumar12:Yash2030@cluster0.zrd7jyj.mongodb.net/studentbigDB?retryWrites=true&w=majority",
    "mongodb+srv://yashwardhankumar12:Yash2030@atlas-r0cw5j.zrd7jyj.mongodb.net/studentbigDB?retryWrites=true&w=majority",
    "mongodb://yashwardhankumar12:Yash2030@ac-1pbdmoq-shard-00-00.zrd7jyj.mongodb.net:27017,ac-1pbdmoq-shard-00-01.zrd7jyj.mongodb.net:27017,ac-1pbdmoq-shard-00-02.zrd7jyj.mongodb.net:27017/studentbigDB?replicaSet=atlas-r0cw5j-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority"
  ];

  for (const uri of uris) {
    console.log("Testing Connection with:", uri);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log("SUCCESS!");
      await mongoose.disconnect();
    } catch (err) {
      console.error("FAILED:", err.message);
    }
  }
};

testConnection();
