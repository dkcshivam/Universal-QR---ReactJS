import React from 'react'
import { FaSearch } from 'react-icons/fa'

const Search = ({ isExpanded, isCollapsed }) => {
  return (
    <div className="relative w-full mx-auto">
      {!isCollapsed ? (
        // Full search bar
        <>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={isExpanded ? "Search product by name, number, category..." : "Search product by name or number..."}
            className={`block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 text-gray-800 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 shadow-sm focus:shadow-md ${
              isExpanded ? 'text-base' : 'text-sm'
            }`}
          />
        </>
      ) : (
        // Collapsed search - just icon
        <button className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer">
          <FaSearch className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </div>
  )
}

export default Search
