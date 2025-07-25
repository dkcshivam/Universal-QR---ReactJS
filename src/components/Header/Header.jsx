import React, { useState } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import Profile from "./Profile";
import Search from "./Search";
import Record from "./Record";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaEdit,
  FaKey,
  FaQuestionCircle,
} from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(null); // 'record', 'search', or null

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const handleExpand = (type) => {
    setExpanded(type);
  };

  const handleCollapse = () => {
    setExpanded(null);
  };

  const handleLogout = () => {
    localStorage.clear();

    setTimeout(() => {
      navigate("/login");
      if (isMobileMenuOpen) {
        toggleMobileMenu();
      }
    }, 200);
  };

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Mobile Container */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Voice Record */}
          <div
            className={`flex justify-start transition-all duration-500 ease-in-out ${
              expanded === "search"
                ? "w-16" // Shrink when search is expanded
                : expanded === "record"
                ? "flex-grow" // Expand when record is clicked
                : "w-72 md:flex-grow" // Default state
            }`}
            onClick={() => handleExpand("record")}
          >
            <Record
              isExpanded={expanded === "record"}
              isCollapsed={expanded === "search"}
              onToggle={handleCollapse}
            />
          </div>

          {/* Center: Search */}
          <div
            className={`flex-grow transition-all duration-500 ease-in-out ${
              expanded === "record"
                ? "w-16" // Shrink when record is expanded
                : expanded === "search"
                ? "flex-grow" // Expand when search is clicked
                : "md:flex-grow" // Default state
            }`}
            onClick={() => handleExpand("search")}
          >
            <Search
              isExpanded={expanded === "search"}
              isCollapsed={expanded === "record"}
              onToggle={handleCollapse}
            />
          </div>

          {/* Right: Profile (Desktop) / Hamburger (Mobile) */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {/* Desktop Profile & Actions */}
            <div className="hidden md:flex items-center gap-4">
              {localStorage.getItem("access_token") ? (
                <>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaUser />
                    <span>{localStorage.getItem("user")}</span>
                  </div>
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Open main menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Right Panel */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        >
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 flex justify-end">
              <button
                onClick={toggleMobileMenu}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex flex-col items-center py-6 px-6 flex-grow w-full">
              {localStorage.getItem("access_token") ? (
                <>
                  <FaUserCircle className="w-20 h-20 text-gray-300 mb-3" />
                  <div className="text-center mb-8">
                    <div className="font-bold text-xl text-gray-800">
                      {localStorage.getItem("user")}
                    </div>
                  </div>
                  <button
                    className="w-full mt-auto bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-grow flex flex-col  w-full">
                    <button
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition-colors"
                      onClick={() => {
                        navigate("/login");
                        toggleMobileMenu();
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                      onClick={() => {
                        navigate("/");
                        toggleMobileMenu();
                      }}
                    >
                      Home Page
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
