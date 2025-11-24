import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  // Use your MongoDB connection as default
  const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://akshargangani2006_db_user:Food%40123@cluster0.vxjsoc7.mongodb.net/food_delivery";
  console.log("🔗 MONGODB SHELL - Attempting to connect...");
  console.log("🔗 MONGODB SHELL - URI:", MONGO_URI);
  
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      dbName: 'food_delivery'
    });
    console.log("✅ DB Connected Successfully");
    console.log("🔗 MONGODB SHELL - Connected to database:", mongoose.connection.name);
    
    // Test the connection by trying to count users
    const userModel = await import("../models/userModel.js").then(m => m.default);
    const userCount = await userModel.countDocuments();
    console.log(`🔊 MONGODB SHELL - Current users in database: ${userCount}`);
    
  } catch (error) {
    console.error("❌ Error connecting to DB:", error.message);
    console.error("❌ MONGODB SHELL - Connection failed. Check:");
    console.error("   1. MongoDB Atlas credentials");
    console.error("   2. Network access (IP whitelist)");
    console.error("   3. Database name exists");
    process.exit(1);
  }
};