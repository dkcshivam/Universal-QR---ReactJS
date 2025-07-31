import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../../utils/Loader";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const is_admin = localStorage.getItem("is_admin");
        setIsAdmin(user === "admin" && is_admin === "true");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/create-user/`,
                { username, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUsername("");
            setPassword("");
            toast.success("User created successfully!");
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Failed to create user." ; 
            toast.error(errorMsg);
        }
        setLoading(false);
    };

    if (loading) return <Loader />;

    if (!isAdmin) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 px-2">
                <div className="max-w-md w-full p-4 bg-white rounded-xl shadow text-center flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
                    <p className="text-gray-600">Only admin can create users.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-base shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
            {/* Back Button */}
            <div className="w-full max-w-md mb-4">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center px-4 py-2 border border-blue-300 rounded-md bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-800 transition-colors shadow-sm font-semibold"
                >
                    <FaArrowLeft className="mr-2" />
                    Back
                </button>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Create New User
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username Field */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter username"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-base shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                            disabled={loading}
                        >
                            Create User
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-md text-base shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <FaArrowLeft className="text-lg" />
                            Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default CreateUser; 