import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const Search = ({ isExpanded, onToggle, isCollapsed, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearchClick = () => {
    if (!isExpanded) {
      onToggle(true);
    }
  };

  const handleContainerClick = () => {
    if (!isExpanded) {
      onToggle(true);
    } else {
      // If already expanded, allow click to collapse
      onToggle(false);
    }
  };

  const handleSearchIconClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      onToggle(true);
    }
  };

  const handleClose = () => {
    onToggle(false);
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality here
      console.log('Searching for:', searchQuery);
      // You can implement your search logic here
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const baseClasses = isMobile 
    ? "transition-all duration-300 ease-in-out"
    : "transition-all duration-300 ease-in-out";

  const containerClasses = isMobile
    ? `${baseClasses} ${
        isCollapsed 
          ? 'w-12 h-12' 
          : isExpanded 
            ? 'w-72' 
            : 'w-40'
      }`
    : `${baseClasses} ${
        isCollapsed 
          ? 'w-12 h-12' 
          : 'w-full'
      }`;

  return (
    <div className={containerClasses}>
      {(isCollapsed && !isExpanded) ? (
        /* Collapsed Icon State */
        <button
          onClick={handleContainerClick}
          className="w-full h-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer"
        >
          <FaSearch className="h-4 w-4" />
        </button>
      ) : (
        /* Normal/Expanded State */
        <div className="relative h-12">
          <div 
            className={`relative flex items-center h-full bg-white rounded-lg border transition-all duration-300 ${
              isFocused || isExpanded 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => {
              if(!isExpanded) handleContainerClick() ; 
            }}
          >
            <div className="pl-3 pr-2">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            {!isExpanded && (
              <span className="flex-1 text-gray-700 text-base font-semibold pr-3 truncate">
                Search products by name or number
              </span>
            )}
            {isExpanded && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Search products..."
                  className="flex-1 h-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm px-2"
                />
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {/* Search Results Dropdown */}
          {isExpanded && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              <div className="p-3">
                <p className="text-sm text-gray-500 mb-2">Search results for "{searchQuery}"</p>
                <div className="space-y-2">
                  <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <p className="text-sm text-gray-700">Example result 1</p>
                  </div>
                  <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <p className="text-sm text-gray-700">Example result 2</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
