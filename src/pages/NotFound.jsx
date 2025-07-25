import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto text-center w-full">
        {/* Error Content */}
        <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          {/* 404 Number */}
          <div>
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 sm:mb-4">
              404
            </h1>
          </div>

          {/* Main Message */}
          <div className="space-y-3 sm:space-y-4 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mx-auto leading-relaxed max-w-sm sm:max-w-lg break-words">
              Sorry, the page you're looking for doesn't exist or has been moved to another location.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 sm:mb-8 flex flex-row gap-3 sm:gap-4 justify-center items-center px-2">
          <button
            onClick={handleGoHome}
            className="group relative inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300"
          >
            <FaHome className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">Go Back</span>
          </button>
        </div>

        {/* Footer Help Text */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8 px-4">
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            Need help? Contact the{" "}
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                AI Team
              </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
