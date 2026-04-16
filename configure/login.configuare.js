const mongoose = require("mongoose");
require("dotenv").config();

async function MongoConnect(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ DB connected successfully"); // 🔥 IMPORTANT
    } catch (error) {
        console.error("❌ DB connection error:", error.message);
    }
}

module.exports = MongoConnect;