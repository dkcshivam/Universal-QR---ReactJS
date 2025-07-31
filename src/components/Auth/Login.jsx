import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import {toast} from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [hide, sethide] = useState(false)
  const [showPassword, setShowPassword] = useState(false) ; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    sethide(true) ;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login/`, {
        username: email,
        password,
      });

      if (res.data.status === 200) {
        const { tokens, user } = res.data.data;
        localStorage.setItem("user", user.username);
        localStorage.setItem("is_admin", user.is_admin);
        localStorage.setItem("access_token", tokens?.access);
        localStorage.setItem("refresh_token", tokens?.refresh);

        toast.success("Login successful! Welcome to Universal QR") ; 

        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
        sethide(false) ;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
      sethide(false) ;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br font-sans">
      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">

        {/* Header */}

        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/qr-192.png"
            alt="Universal QR Icon"
            className="w-16 h-16 mb-2 mx-auto"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Universal QR
          </h1>
          <p className="text-sm text-gray-600">Please login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-m font-bold text-gray-800 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter User Name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-m font-bold text-gray-800 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {
                showPassword ? <FaEyeSlash/> : <FaEye/>
              }
            </span>
            </div>
          </div>

          <div className="flex flex-row gap-6 justify-center mt-10">
            <button
            disabled={hide}
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-base shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FaSignInAlt className="text-lg" />
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-md text-base shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <IoHome className="text-lg" />
              Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
