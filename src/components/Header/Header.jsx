import React, { useState } from "react";
import Profile from "./Profile";
import Search from "./Search";
import Record from "./Record";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null); // null, 'record', or 'search'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleRecordClick = () => {
    setActiveComponent(activeComponent === "record" ? null : "record");
  };

  const handleSearchClick = () => {
    setActiveComponent(activeComponent === "search" ? null : "search");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 relative">
      <div className="w-full px-4 sm:px-6 lg:px-15">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Layout */}
          <div className="flex items-center justify-between w-full md:hidden">
            {/* Left: Record - Dynamic Width */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeComponent === "record"
                  ? "flex-1 mr-2"
                  : activeComponent === "search"
                  ? "flex-shrink-0"
                  : "flex-1"
              }`}
              onClick={handleRecordClick}
            >
              <Record
                isExpanded={activeComponent === "record"}
                isCollapsed={activeComponent === "search"}
              />
            </div>

            {/* Center: Search - Dynamic Width */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeComponent === "search"
                  ? "flex-1 ml-2"
                  : activeComponent === "record"
                  ? "flex-shrink-0"
                  : "flex-1 mx-4"
              }`}
              onClick={handleSearchClick}
            >
              <Search
                isExpanded={activeComponent === "search"}
                isCollapsed={activeComponent === "record"}
              />
            </div>

            {/* Right: Hamburger Menu */}
            <div className="flex-shrink-0 ml-2">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-5 h-5 text-gray-600" />
                ) : (
                  <FaBars className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left: Record - Dynamic Width */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeComponent === "record"
                  ? "flex-1 mr-4"
                  : activeComponent === "search"
                  ? "flex-shrink-0"
                  : "flex-shrink-0"
              }`}
              onClick={handleRecordClick}
            >
              <Record
                isExpanded={activeComponent === "record"}
                isCollapsed={activeComponent === "search"}
              />
            </div>

            {/* Center: Search - Dynamic Width */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeComponent === "search"
                  ? "flex-1 ml-4"
                  : activeComponent === "record"
                  ? "flex-shrink-0"
                  : "flex-1 flex justify-center px-8"
              }`}
              onClick={handleSearchClick}
            >
              <div
                className={`${
                  activeComponent === "search" ? "w-full" : "w-full max-w-2xl"
                }`}
              >
                <Search
                  isExpanded={activeComponent === "search"}
                  isCollapsed={activeComponent === "record"}
                />
              </div>
            </div>

            {/* Right: Profile - absolute right */}
            <div className="flex justify-end flex-shrink-0">
              <Profile />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Profile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-4">
            <Profile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
