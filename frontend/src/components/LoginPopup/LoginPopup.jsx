import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const {url, setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    let newUrl = url;
    if (currentState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }
    
    // Validate input before sending
    if (!data.email || !data.password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    if (currentState === "Sign Up" && !data.name) {
      toast.error("Please enter your name");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("URL:", newUrl);
      console.log("Data:", data);
      console.log("Current State:", currentState);
      
      const response = await axios.post(newUrl, data);
      console.log("=== RESPONSE RECEIVED ===");
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      if (response.data.success) {
        console.log("=== LOGIN SUCCESS ===");
        console.log("User email:", data.email);
        console.log("Token received:", response.data.token);
        
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        
        // Show success message with email
        const successMessage = currentState === "Login" 
          ? `Login Successful! Welcome ${data.email}!`
          : `Account Created Successfully! Welcome ${data.email}!`;
        
        toast.success(successMessage);
        setShowLogin(false);
        
        // Reset form after successful login
        setTimeout(() => {
          setData({ name: "", email: "", password: "" });
        }, 1000);
        
        console.log("=== LOGIN PROCESS COMPLETED ===");
      } else {
        console.log("=== LOGIN FAILED (Backend) ===");
        console.log("Error Message:", response.data.message);
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("=== LOGIN ERROR (Frontend) ===");
      console.error("Full Error:", error);
      
      if (error.response) {
        console.error("=== SERVER RESPONDED WITH ERROR ===");
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);
        toast.error(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("=== NO RESPONSE FROM SERVER ===");
        console.error("Request:", error.request);
        toast.error("Cannot connect to server. Is backend running on port 4000?");
      } else {
        console.error("=== REQUEST SETUP ERROR ===");
        console.error("Message:", error.message);
        toast.error("Request failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        <div className="login-popup-inputs">
          {currentState === "Login" ? (
            <></>
          ) : (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Your password"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : (currentState === "Sign Up" ? "Create Account" : "Login")}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currentState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrentState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
