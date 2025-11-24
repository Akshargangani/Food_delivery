import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// Check environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env file");
  console.error("Please add JWT_SECRET to your .env file");
  console.error("Example: JWT_SECRET=your_super_secret_key_here");
  // Don't exit, just use a default for development
  process.env.JWT_SECRET = "default_jwt_secret_for_development";
}

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env file");
  console.error("Please add MONGODB_URI to your .env file");
  console.error("Using your MongoDB Atlas connection...");
  // Use your MongoDB Atlas connection
  process.env.MONGODB_URI = "mongodb+srv://akshargangani2006_db_user:Food%40123@cluster0.vxjsoc7.mongodb.net/food_delivery";
}

console.log("✅ Environment variables loaded successfully");

// app config
const app = express();
const port =process.env.PORT || 4000;

//middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// DB connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    env: {
      hasJWT: !!process.env.JWT_SECRET,
      hasMongoURI: !!process.env.MONGODB_URI
    }
  });
});

// Create test user endpoint
app.post("/api/create-test-user", async (req, res) => {
  try {
    const userModel = await import("./models/userModel.js").then(m => m.default);
    const bcrypt = await import("bcrypt").then(m => m.default);
    
    // Check if test user already exists
    const existingUser = await userModel.findOne({ email: "demo@gmail.com" });
    if (existingUser) {
      return res.json({ success: false, message: "Test user already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("demo@123", 10);
    
    // Create test user
    const testUser = new userModel({
      name: "Demo User",
      email: "demo@gmail.com",
      password: hashedPassword,
      role: "user"
    });
    
    await testUser.save();
    res.json({ 
      success: true, 
      message: "Test user created successfully!",
      user: { email: "demo@gmail.com", password: "demo@123" }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.json({ success: false, message: "Error creating test user" });
  }
});

// GET endpoint to create test user (easier to access)
app.get("/api/create-demo-user", async (req, res) => {
  console.log("=== CREATE DEMO USER GET ENDPOINT HIT ===");
  console.log("\n🔍 MONGODB SHELL - Checking existing users...");
  try {
    const userModel = await import("./models/userModel.js").then(m => m.default);
    const bcrypt = await import("bcrypt").then(m => m.default);
    
    // Check if test user already exists
    console.log("🔍 MONGODB SHELL - Running: db.users.findOne({email: 'demo@gmail.com'})");
    const existingUser = await userModel.findOne({ email: "demo@gmail.com" });
    if (existingUser) {
      console.log("✅ MONGODB SHELL - User already exists:");
      console.log(JSON.stringify({
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt
      }, null, 2));
      return res.json({ 
        success: true, 
        message: "Demo user already exists! Ready to login.",
        user: { email: "demo@gmail.com", password: "demo@123" },
        status: "exists"
      });
    }
    console.log("✅ MONGODB SHELL - No existing user found");
    
    // Hash password
    console.log("🔐 MONGODB SHELL - Hashing password: demo@123");
    const hashedPassword = await bcrypt.hash("demo@123", 10);
    console.log("✅ MONGODB SHELL - Password hashed successfully");
    
    // Create test user
    console.log("📝 MONGODB SHELL - Creating user document:");
    const userData = {
      name: "Demo User",
      email: "demo@gmail.com",
      password: hashedPassword,
      role: "user",
      cartData: {}
    };
    console.log(JSON.stringify(userData, null, 2));
    
    const testUser = new userModel(userData);
    
    console.log("💾 MONGODB SHELL - Running: db.users.insertOne(...)");
    await testUser.save();
    console.log("✅ MONGODB SHELL - User saved successfully!");
    console.log("📊 MONGODB SHELL - Document saved with _id:", testUser._id);
    
    // Verify the user was actually saved
    console.log("🔍 MONGODB SHELL - Verifying user was saved...");
    const savedUser = await userModel.findOne({ email: "demo@gmail.com" });
    if (savedUser) {
      console.log("✅ MONGODB SHELL - User verified in database!");
      console.log("📊 MONGODB SHELL - Saved user data:");
      console.log(JSON.stringify({
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        hasPassword: !!savedUser.password
      }, null, 2));
    } else {
      console.log("❌ MONGODB SHELL - ERROR: User not found after save!");
    }
    
    console.log("🔍 MONGODB SHELL - To verify manually, run:");
    console.log("   use food_delivery");
    console.log("   db.users.find({email: 'demo@gmail.com'}).pretty()");
    
    res.json({ 
      success: true, 
      message: "Demo user created successfully!",
      user: { email: "demo@gmail.com", password: "demo@123" }
    });
  } catch (error) {
    console.error("❌ MONGODB SHELL - Error:", error);
    res.json({ success: false, message: "Error creating demo user: " + error.message });
  }
});

// Simple test endpoint
app.get("/api/test-endpoint", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is working!",
    endpoints: [
      "POST /api/create-test-user",
      "POST /api/user/register", 
      "POST /api/user/login",
      "GET /api/food/list"
    ]
  });
});

app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
  console.log(`Test endpoints:`);
  console.log(`GET  http://localhost:${port}/api/test-endpoint`);
  console.log(`POST http://localhost:${port}/api/create-test-user`);
});
