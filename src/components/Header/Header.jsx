import React, { useState } from "react";
import Profile from "./Profile";
import Search from "./Search";
import Record from "./Record";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(null); // 'record', 'search', or null

  // For mobile right panel
  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  // Expand/collapse logic
  const handleExpand = (type) => {
    setExpanded((prev) => (prev === type ? null : type));
  };

  // Collapse both
  const handleCollapse = () => setExpanded(null);

  return (
    <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-8 py-4">
        {/* Left: Voice Record */}
        <div className="flex-shrink-0 w-72" onClick={() => handleExpand('record')}>
          <Record
            isExpanded={expanded === "record"}
            isCollapsed={expanded === "search"}
            isMobile={false}
            onToggle={(expand) => setExpanded(expand ? "record" : null)}
          />
        </div>
        {/* Center: Search */}
        <div className="flex-grow mx-8 max-w-2xl" onClick={() => handleExpand('search')}>
          <Search
            isExpanded={expanded === "search"}
            isCollapsed={expanded === "record"}
            isMobile={false}
            onToggle={(expand) => setExpanded(expand ? "search" : null)}
          />
        </div>
        {/* Right: Profile */}
        <div className="flex-shrink-0">
          <Profile />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-3 py-3 gap-2">
        {/* Left: Voice Record */}
        <div
          className={`transition-all duration-300 flex-1 min-w-0`}
          onClick={() => handleExpand('record')}
        >
          <Record
            isExpanded={expanded === "record"}
            isCollapsed={expanded === "search"}
            isMobile={true}
            onToggle={(expand) => setExpanded(expand ? "record" : null)}
          />
        </div>
        {/* Center: Search */}
        <div
          className={`transition-all duration-300 flex-1 min-w-0`}
          onClick={() => handleExpand('search')}
        >
          <Search
            isExpanded={expanded === "search"}
            isCollapsed={expanded === "record"}
            isMobile={true}
            onToggle={(expand) => setExpanded(expand ? "search" : null)}
          />
        </div>
        {/* Right: Hamburger */}
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6 text-gray-600" />
            ) : (
              <FaBars className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Right Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40" onClick={toggleMobileMenu}>
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center py-8 px-6">
              {/* User Icon */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                {/* You can use a user icon here */}
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="font-semibold text-lg text-gray-900">Username</div>
                <div className="text-gray-500 text-sm">user@email.com</div>
                <div className="text-gray-400 text-xs mt-1">Department</div>
              </div>
              {/* Logout */}
              <button className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
