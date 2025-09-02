// import mongoose from "mongoose";

// export const connectDB = async () => {
//   await mongoose
//     .connect(
//       process.env.mongodb+srv://mongo:<db_password>@cluster0.wt1p2.mongodb.net/
//     )
//     .then(() =>console.log("DB Connected"));
// };


// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(
//       "mongodb+srv://akshargangani2006_db_user:Akshar@123@cluster0.oxjutny.mongodb.net/",
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }
//     );
//     console.log("✅ DB Connected Successfully");
//   } catch (error) {
//     console.error("❌ Error connecting to DB:", error.message);
//     process.exit(1);
//   }
// };


import mongoose from "mongoose";

export const connectDB = async () => {
  // 👉 Replace with your real details:
  const MONGO_URI =
    "mongodb+srv://akshargangani2006_db_user:Akshar@123@cluster0.oxjutny.mongodb.net/";

  try {
    await mongoose.connect(MONGO_URI, {
      // options optional in Mongoose 8+, but safe:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ DB Connected Successfully");
  } catch (error) {
    console.error("❌ Error connecting to DB:", error.message);
    process.exit(1);
  }
};
