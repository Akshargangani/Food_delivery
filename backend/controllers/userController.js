import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  console.log("Login attempt for email:", req.body.email);
  console.log("JWT_SECRET available:", !!process.env.JWT_SECRET);
  console.log("MONGODB_URI available:", !!process.env.MONGODB_URI);
  const { email, password } = req.body;
  
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET still missing in userController");
    return res.json({ success: false, message: "Server configuration error - JWT missing" });
  }
  
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.json({ success: false, message: "User Doesn't exist" });
    }
    const isMatch =await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const role=user.role;
    const token = createToken(user._id);
    console.log("Login successful for:", email);
    res.json({ 
      success: true, 
      token,
      role,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "Login successful!"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: "Error" });
  }
};

// Create token

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// register user

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // checking user is already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format and strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter valid email" });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter strong password",
      });
    }

    // hashing user password

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const role=user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { loginUser, registerUser };
