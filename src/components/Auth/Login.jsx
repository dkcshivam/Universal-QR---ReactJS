import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://shivam-mac.local:8000/api/v1.0/login/",
        {
          username: email,
          password,
        }
      );

      if (res.data.status === 200) {
        const { tokens, user } = res.data.data;
        localStorage.setItem("user", user.username);
        localStorage.setItem("is_admin", user.is_admin);
        localStorage.setItem("access_token", tokens?.access);
        localStorage.setItem("refresh_token", tokens?.refresh);
        navigate("/");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br font-sans">
      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="text-center mb-8">
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
              Enter User Name
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
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-md text-base transition-all transform hover:-translate-y-1 hover:shadow-lg   cursor-pointer"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-md text-base transition-all transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
